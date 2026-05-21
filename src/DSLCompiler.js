/**
 * src/DSLCompiler.js
 *
 * Compiles a YAML (or JSON) society scenario file into a flat JSON run config
 * that Simulation.js can execute directly.
 *
 * Compilation pipeline:
 *   1.  parse         — YAML or JSON text → plain JS object
 *   2.  validate      — schema + persona/article ID checks
 *   3.  expandGroups  — group entries → individual node configs
 *   4.  expandBridges — bridge entries → individual node configs
 *   5.  intraEdges    — probabilistic intra-group edges (lowest priority)
 *   6.  interEdges    — probabilistic inter-group edges (overrides intra)
 *   7.  bridgeEdges   — bridge connection edges (overrides inter)
 *   8.  customLinks   — explicit fine-grained edges (highest priority)
 *   9.  strategies    — per-node strategy overrides → written into node params
 *  10.  buildConfig   — assemble final JSON run config
 *
 * Node reference syntax (custom_links / strategic_overrides / seed entry_points):
 *   scientists[0]    — first member (0-indexed)
 *   scientists[*]    — all members
 *   scientists[0:2]  — members at index 0, 1, 2 (inclusive)
 *   scientists[-1]   — last member
 *   fact_checker     — bridge node (or any bare group name → all members)
 */

"use strict";

const fs   = require("fs");
const path = require("path");

// ── Seeded PRNG (xorshift32) ───────────────────────────────────────────────────
// Produces deterministic sequences from an integer seed.
// Same scenario file + same seed → same graph every compile.

class SeededRandom {
  constructor(seed) {
    // Ensure non-zero initial state
    this.state = (seed | 0) || 0xdeadbeef;
  }

  // Returns float in [0, 1)
  next() {
    let x = this.state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    this.state = x;
    return (x >>> 0) / 4294967296;
  }
}

// ── Minimal YAML parser ────────────────────────────────────────────────────────
// Handles the subset of YAML used by the Society DSL:
//   block mappings, block sequences, flow sequences ([…]), flow mappings ({…}),
//   quoted/unquoted scalars, boolean/number coercion, folded scalars (key: >),
//   and inline comments (# …).
//
// Does NOT handle: anchors/aliases, multi-document, complex keys, block scalars (|).

class YAMLParser {
  constructor(text) {
    this.lines = this._preprocess(text);
    this.pos   = 0;
  }

  // Convert raw text into a flat array of {indent, content} tokens.
  // Blank lines, comment-only lines, and trailing inline comments are stripped.
  // Folded scalars (key: >) are collapsed to a single mapping token.
  _preprocess(text) {
    const out  = [];
    const raw  = text.split("\n");
    let i = 0;

    while (i < raw.length) {
      const line = raw[i];

      // Skip blank or comment-only lines
      if (/^\s*(#.*)?$/.test(line)) { i++; continue; }

      const indent  = line.search(/\S/);
      let   content = line.slice(indent);

      // Folded scalar: "key: >" — collect indented lines and flatten
      const foldedM = content.match(/^([\w][\w_-]*)\s*:\s*>\s*(#.*)?$/);
      if (foldedM) {
        const key = foldedM[1];
        const parts = [];
        i++;
        while (i < raw.length) {
          const nxt = raw[i];
          if (/^\s*(#.*)?$/.test(nxt)) { i++; continue; }
          const nxtIndent = nxt.search(/\S/);
          if (nxtIndent <= indent) break;
          parts.push(nxt.trim());
          i++;
        }
        out.push({ indent, content: `${key}: ${parts.join(" ")}` });
        continue;
      }

      // Strip trailing inline comment (won't fire inside quoted strings
      // for normal DSL values; edge-case trade-off accepted)
      content = content.replace(/\s+#.*$/, "").trim();
      if (content) out.push({ indent, content });
      i++;
    }

    return out;
  }

  peek() {
    return this.pos < this.lines.length ? this.lines[this.pos] : null;
  }

  // ── Entry point ──────────────────────────────────────────────────────────────
  parse() {
    return this._parseMapping(-1);
  }

  // ── Block mapping ────────────────────────────────────────────────────────────
  // Consumes all key: value pairs at indent > parentIndent.
  _parseMapping(parentIndent) {
    const obj = {};

    while (this.peek() && this.peek().indent > parentIndent) {
      const line = this.peek();

      // Stop if next token is a sequence item (caller handles it)
      if (line.content.startsWith("- ") || line.content === "-") break;

      const colonIdx = line.content.indexOf(":");
      if (colonIdx <= 0) break;

      const key    = line.content.slice(0, colonIdx).trim();
      const valStr = line.content.slice(colonIdx + 1).trim();
      this.pos++;

      if (valStr === "") {
        // Value is in the next indented block
        obj[key] = this._parseValue(line.indent);
      } else {
        obj[key] = this._parseScalar(valStr);
      }
    }

    return obj;
  }

  // ── Block sequence ────────────────────────────────────────────────────────────
  // Consumes all "- …" items at indent > parentIndent.
  _parseSequence(parentIndent) {
    const arr = [];

    while (this.peek() && this.peek().indent > parentIndent) {
      const line = this.peek();
      if (!line.content.startsWith("- ") && line.content !== "-") break;

      const seqIndent = line.indent;
      this.pos++;

      const rest = line.content.startsWith("- ") ? line.content.slice(2).trim() : "";

      if (rest === "") {
        // Block item — value is next indented block
        arr.push(this._parseValue(seqIndent) ?? null);
      } else if (this._looksLikeMapping(rest)) {
        // Inline mapping start: "- key: value"
        arr.push(this._parseInlineItem(rest, seqIndent));
      } else {
        arr.push(this._parseScalar(rest));
      }
    }

    return arr;
  }

  // Parse the first "key: val" line of an inline sequence item, then
  // collect any continuation lines at indent > seqIndent.
  _parseInlineItem(firstLine, seqIndent) {
    const obj      = {};
    const colonIdx = firstLine.indexOf(":");
    const key      = firstLine.slice(0, colonIdx).trim();
    const valStr   = firstLine.slice(colonIdx + 1).trim();

    if (valStr === "") {
      obj[key] = this._parseValue(seqIndent);
    } else {
      obj[key] = this._parseScalar(valStr);
    }

    // Additional keys on subsequent lines belonging to this item
    while (this.peek() && this.peek().indent > seqIndent) {
      const line = this.peek();
      if (line.content.startsWith("- ") || line.content === "-") break;

      const ci = line.content.indexOf(":");
      if (ci <= 0) break;

      const k      = line.content.slice(0, ci).trim();
      const vStr   = line.content.slice(ci + 1).trim();
      this.pos++;

      if (vStr === "") {
        obj[k] = this._parseValue(line.indent);
      } else {
        obj[k] = this._parseScalar(vStr);
      }
    }

    return obj;
  }

  // Decide whether the next block (at indent > parentIndent) is a mapping or sequence.
  _parseValue(parentIndent) {
    const next = this.peek();
    if (!next || next.indent <= parentIndent) return null;

    if (next.content.startsWith("- ") || next.content === "-") {
      return this._parseSequence(parentIndent);
    }
    return this._parseMapping(parentIndent);
  }

  // A string "looks like a mapping start" if it has a colon outside quotes and brackets.
  // e.g. "key: value" → true, "group[0:3]" → false (colon is inside a slice expression).
  _looksLikeMapping(s) {
    if (s.startsWith('"') || s.startsWith("'") || s.startsWith("[") || s.startsWith("{")) {
      return false;
    }
    // Strip bracket contents (slice/index expressions) before checking for ':'
    return s.replace(/\[.*?\]/g, "").includes(":");
  }

  // ── Scalar coercion ───────────────────────────────────────────────────────────
  _parseScalar(s) {
    s = (s || "").trim();

    // Flow sequences and mappings
    if (s.startsWith("[")) return this._parseFlowSeq(s);
    if (s.startsWith("{")) return this._parseFlowMap(s);

    // Booleans
    if (s === "true")  return true;
    if (s === "false") return false;

    // Null
    if (s === "null" || s === "~" || s === "") return null;

    // Quoted strings — strip delimiters
    if ((s.startsWith('"') && s.endsWith('"')) ||
        (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1);
    }

    // Numbers
    if (/^-?\d+$/.test(s))          return parseInt(s, 10);
    if (/^-?\d+\.\d+$/.test(s))     return parseFloat(s);

    // Plain string (includes node refs like "scientists[0]")
    return s;
  }

  // [a, b, c] → ["a", "b", "c"]
  _parseFlowSeq(s) {
    const inner = s.slice(1, s.lastIndexOf("]")).trim();
    if (!inner) return [];
    return inner.split(",").map(v => this._parseScalar(v.trim()));
  }

  // {a: 1, b: 2} → {a: 1, b: 2}
  // Simple implementation: does not handle nested flow objects.
  _parseFlowMap(s) {
    const obj   = {};
    const inner = s.slice(1, s.lastIndexOf("}")).trim();
    if (!inner) return obj;
    for (const pair of inner.split(",")) {
      const ci = pair.indexOf(":");
      if (ci <= 0) continue;
      const k = pair.slice(0, ci).trim();
      const v = pair.slice(ci + 1).trim();
      obj[k]  = this._parseScalar(v);
    }
    return obj;
  }
}

function parseYAML(text) {
  return new YAMLParser(text).parse();
}

// ── DSLCompiler ────────────────────────────────────────────────────────────────

class DSLCompiler {

  // ── Public API ───────────────────────────────────────────────────────────────

  /**
   * Compile a scenario file (YAML or JSON) into a JSON run config.
   *
   * @param {string} scenarioPath   — absolute or relative path to scenario file
   * @param {object} [opts]
   * @param {boolean} [opts.validateOnly] — throw ValidationError and stop; don't compile
   * @param {boolean} [opts.printSummary] — print a human-readable compilation report
   * @returns {object}  complete JSON run config
   */
  static compile(scenarioPath, opts = {}) {
    const absPath  = path.isAbsolute(scenarioPath)
      ? scenarioPath
      : path.join(process.cwd(), scenarioPath);

    if (!fs.existsSync(absPath)) {
      throw new Error(`Scenario file not found: ${absPath}`);
    }

    // 1. Parse
    const scenario = DSLCompiler._parse(absPath);

    // 2. Validate
    const knownPersonas  = DSLCompiler._loadKnownPersonas();
    const knownArticles  = DSLCompiler._loadKnownArticles();
    const errors         = DSLCompiler._validate(scenario, knownPersonas, knownArticles);
    if (errors.length > 0) {
      throw new Error(`DSL validation failed:\n  • ${errors.join("\n  • ")}`);
    }
    if (opts.validateOnly) return null;

    // Seeded PRNG — reproducible graphs
    const seed = (scenario.simulation && scenario.simulation.random_seed) || 0;
    const rng  = new SeededRandom(seed);

    // 3 & 4. Expand groups and bridges into node lists
    const { nodes, groupIndex } = DSLCompiler._expandGroups(scenario.groups || [], rng);
    const bridgeNodes           = DSLCompiler._expandBridges(scenario.bridges || []);
    nodes.push(...bridgeNodes);

    // All node IDs for lookup
    const allNodeIds = new Set(nodes.map(n => n.nodeId));

    // 5. Intra-group edges (base layer)
    const edges = DSLCompiler._intraGroupEdges(scenario.groups || [], groupIndex, rng);

    // 6. Inter-group edges (overrides intra)
    DSLCompiler._interGroupEdges(scenario.relations || [], groupIndex, rng, edges);

    // 7. Bridge edges (overrides inter)
    DSLCompiler._bridgeEdges(scenario.bridges || [], groupIndex, bridgeNodes, edges);

    // 8. Custom links (highest priority)
    DSLCompiler._applyCustomLinks(scenario.custom_links || [], edges, groupIndex, bridgeNodes);

    // 9. Per-node strategic overrides → written into node.params.strategy
    DSLCompiler._applyStrategies(scenario.strategic_overrides || [], nodes, groupIndex, bridgeNodes);

    // 10. Build final config
    const config = DSLCompiler._buildConfig(scenario, nodes, edges, groupIndex, bridgeNodes);

    if (opts.printSummary) {
      DSLCompiler.printSummary(config, path.basename(absPath));
    }

    return config;
  }

  // ── Parse ────────────────────────────────────────────────────────────────────

  static _parse(absPath) {
    const text = fs.readFileSync(absPath, "utf8");
    if (absPath.endsWith(".yaml") || absPath.endsWith(".yml")) {
      return parseYAML(text);
    }
    return JSON.parse(text);
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  static _validate(scenario, knownPersonas, knownArticles) {
    const errors     = [];
    const groupNames = new Set((scenario.groups || []).map(g => g.name));
    const bridgeNames = new Set((scenario.bridges || []).map(b => b.name));
    const VALID_STRATEGIES = new Set([
      "maximize_downstream_mi", "maximize_reach",
      "minimize_downstream_mi", "maximize_alignment",
    ]);
    const VALID_DIRECTIONS = new Set(["outgoing", "incoming", "bidirectional"]);

    // Groups
    for (const g of scenario.groups || []) {
      if (!g.name)                errors.push(`Group missing 'name'`);
      if (!g.size || g.size < 1)  errors.push(`Group '${g.name}': size must be >= 1`);
      if (!g.personas || !g.personas.length) {
        errors.push(`Group '${g.name}': must have at least one persona`);
      }
      if (bridgeNames.has(g.name)) {
        errors.push(`'${g.name}' is used as both a group name and a bridge name`);
      }

      // Validate persona IDs
      for (const p of g.personas || []) {
        const pid = typeof p === "object" ? p.id : p;
        if (pid && !knownPersonas.has(pid)) {
          errors.push(`Group '${g.name}': unknown persona '${pid}'`);
        }
      }

      // Validate group-level strategy
      if (g.strategy && !VALID_STRATEGIES.has(g.strategy)) {
        errors.push(`Group '${g.name}': unknown strategy '${g.strategy}'`);
      }

      // Validate index out of bounds in custom links (done below)
    }

    // Bridges
    for (const b of scenario.bridges || []) {
      if (!b.name)    errors.push(`Bridge missing 'name'`);
      if (!b.persona) errors.push(`Bridge '${b.name}': missing 'persona'`);
      if (b.persona && !knownPersonas.has(b.persona)) {
        errors.push(`Bridge '${b.name}': unknown persona '${b.persona}'`);
      }
      for (const conn of b.connects_to || []) {
        if (!groupNames.has(conn.group) && !bridgeNames.has(conn.group)) {
          errors.push(`Bridge '${b.name}': connects_to unknown group '${conn.group}'`);
        }
        if (conn.direction && !VALID_DIRECTIONS.has(conn.direction)) {
          errors.push(`Bridge '${b.name}': invalid direction '${conn.direction}'`);
        }
      }
    }

    // Relations
    for (const r of scenario.relations || []) {
      if (!groupNames.has(r.from)) errors.push(`Relation: unknown group '${r.from}'`);
      if (!groupNames.has(r.to))   errors.push(`Relation: unknown group '${r.to}'`);
      if (r.direction && !VALID_DIRECTIONS.has(r.direction)) {
        errors.push(`Relation ${r.from}→${r.to}: invalid direction '${r.direction}'`);
      }
    }

    // Custom links — validate group/bridge names (index out-of-bounds caught at compile)
    for (const lnk of scenario.custom_links || []) {
      DSLCompiler._validateNodeRef(lnk.from, groupNames, bridgeNames, errors);
      DSLCompiler._validateNodeRef(lnk.to,   groupNames, bridgeNames, errors);
      if (lnk.direction && !VALID_DIRECTIONS.has(lnk.direction)) {
        errors.push(`Custom link: invalid direction '${lnk.direction}'`);
      }
    }

    // Strategic overrides
    for (const so of scenario.strategic_overrides || []) {
      DSLCompiler._validateNodeRef(so.node, groupNames, bridgeNames, errors);
      if (so.strategy && !VALID_STRATEGIES.has(so.strategy)) {
        errors.push(`Strategic override for '${so.node}': unknown strategy '${so.strategy}'`);
      }
    }

    // Bot injection (optional)
    const VALID_BOT_TYPES       = new Set(["amplifier", "distorter", "agenda", "flooder"]);
    const VALID_BOT_PLACEMENTS  = new Set(["random", "hubs", "bridges", "periphery", "targeted_cluster"]);
    const VALID_BOT_REMOVALS    = new Set(["none", "remove_hubs", "remove_random", "remove_bridges", "remove_all"]);

    for (const bspec of scenario.bots || []) {
      if (bspec.type && !VALID_BOT_TYPES.has(bspec.type)) {
        errors.push(`Bot spec: unknown type '${bspec.type}'`);
      }
      if (bspec.placement && !VALID_BOT_PLACEMENTS.has(bspec.placement)) {
        errors.push(`Bot spec: unknown placement '${bspec.placement}'`);
      }
      if (bspec.removal && !VALID_BOT_REMOVALS.has(bspec.removal)) {
        errors.push(`Bot spec: unknown removal strategy '${bspec.removal}'`);
      }
      if (bspec.density !== undefined && (bspec.density < 0 || bspec.density > 1)) {
        errors.push(`Bot spec: density must be between 0 and 1 (got ${bspec.density})`);
      }
    }

    // Seed articles
    for (const a of (scenario.seed && scenario.seed.articles) || []) {
      if (!knownArticles.has(a)) {
        errors.push(`Seed article '${a}' not found in articles.json`);
      }
    }

    // Competitive group articles
    for (const cg of (scenario.seed && scenario.seed.competitive_groups) || []) {
      for (const a of cg.articles || []) {
        if (!knownArticles.has(a)) {
          errors.push(`Competitive group article '${a}' not found in articles.json`);
        }
      }
    }

    return errors;
  }

  static _validateNodeRef(ref, groupNames, bridgeNames, errors) {
    if (!ref) { errors.push("Node reference is missing"); return; }
    // Strip index: "scientists[0]" → "scientists"
    const base = ref.replace(/\[.*\]$/, "").trim();
    if (!groupNames.has(base) && !bridgeNames.has(base) && base !== ref) {
      errors.push(`Unknown group/bridge in reference '${ref}'`);
    } else if (!groupNames.has(base) && !bridgeNames.has(base)) {
      // bare name — might be a bridge referenced directly
      if (!bridgeNames.has(ref)) {
        errors.push(`Unknown node reference '${ref}' (not a group or bridge name)`);
      }
    }
  }

  // ── Expand groups ────────────────────────────────────────────────────────────

  static _expandGroups(groups, rng) {
    const nodes      = [];
    const groupIndex = {};

    for (const group of groups) {
      const personas   = group.personas || ["neutral"];
      const isWeighted = personas.length > 0 && typeof personas[0] === "object";
      groupIndex[group.name] = [];

      for (let i = 0; i < group.size; i++) {
        const nodeId  = `${group.name}_${i}`;
        const persona = isWeighted
          ? DSLCompiler._weightedSample(personas, rng)
          : personas[i % personas.length];

        nodes.push({
          nodeId,
          personaId: persona,
          modelId:   group.model || null,
          params:    DSLCompiler._normalizeParams(group.params || {}),
          // Group-level strategy is the default; per-node overrides replace it
          _strategy: group.strategy || null,
        });

        groupIndex[group.name].push(nodeId);
      }
    }

    return { nodes, groupIndex };
  }

  static _weightedSample(personas, rng) {
    const total = personas.reduce((s, p) => s + (p.weight || 1), 0);
    let   r     = rng.next() * total;
    for (const p of personas) {
      r -= (p.weight || 1);
      if (r <= 0) return p.id || p;
    }
    return (personas[personas.length - 1].id || personas[personas.length - 1]);
  }

  // ── Expand bridges ───────────────────────────────────────────────────────────

  static _expandBridges(bridges) {
    return bridges.map(b => ({
      nodeId:    b.name,
      personaId: b.persona,
      modelId:   b.model || null,
      params:    DSLCompiler._normalizeParams(b.params || {}),
      _strategy: null,
    }));
  }

  // ── Intra-group edges ────────────────────────────────────────────────────────

  static _intraGroupEdges(groups, groupIndex, rng) {
    const edges = [];
    for (const group of groups) {
      const members      = groupIndex[group.name] || [];
      const connectivity = group.internal_connectivity ?? 0.7;
      const trust        = group.internal_trust ?? 0.5;

      for (let i = 0; i < members.length; i++) {
        for (let j = 0; j < members.length; j++) {
          if (i === j) continue;
          if (rng.next() < connectivity) {
            DSLCompiler._upsertEdge(edges, members[i], members[j], trust);
          }
        }
      }
    }
    return edges;
  }

  // ── Inter-group edges ────────────────────────────────────────────────────────

  static _interGroupEdges(relations, groupIndex, rng, edges) {
    for (const rel of relations) {
      const from    = groupIndex[rel.from] || [];
      const to      = groupIndex[rel.to]   || [];
      const p       = rel.connectivity ?? 0.3;
      const trust   = rel.trust        ?? 0.3;
      const dir     = rel.direction    ?? "bidirectional";

      for (const f of from) {
        for (const t of to) {
          if (rng.next() < p) {
            if (dir === "outgoing" || dir === "bidirectional") {
              DSLCompiler._upsertEdge(edges, f, t, trust);
            }
            if (dir === "incoming" || dir === "bidirectional") {
              DSLCompiler._upsertEdge(edges, t, f, trust);
            }
          }
        }
      }
    }
  }

  // ── Bridge edges ─────────────────────────────────────────────────────────────

  static _bridgeEdges(bridges, groupIndex, bridgeNodes, edges) {
    for (const bridge of bridges) {
      for (const conn of bridge.connects_to || []) {
        const members = groupIndex[conn.group] || [];
        const trust   = conn.trust     ?? 0.5;
        const dir     = conn.direction ?? "bidirectional";

        for (const member of members) {
          if (dir === "outgoing" || dir === "bidirectional") {
            DSLCompiler._upsertEdge(edges, bridge.name, member, trust);
          }
          if (dir === "incoming" || dir === "bidirectional") {
            DSLCompiler._upsertEdge(edges, member, bridge.name, trust);
          }
        }
      }
    }
  }

  // ── Custom links ─────────────────────────────────────────────────────────────

  static _applyCustomLinks(customLinks, edges, groupIndex, bridgeNodes) {
    for (const lnk of customLinks) {
      const fromIds = DSLCompiler._resolveRef(lnk.from, groupIndex, bridgeNodes);
      const toIds   = DSLCompiler._resolveRef(lnk.to,   groupIndex, bridgeNodes);
      const dir     = lnk.direction ?? "outgoing";

      for (const f of fromIds) {
        for (const t of toIds) {
          if (f === t) continue;
          if (dir === "outgoing" || dir === "bidirectional") {
            DSLCompiler._upsertEdge(edges, f, t, lnk.trust ?? 0.5);
          }
          if (dir === "incoming" || dir === "bidirectional") {
            DSLCompiler._upsertEdge(edges, t, f, lnk.trust ?? 0.5);
          }
        }
      }
    }
  }

  // ── Strategic overrides ───────────────────────────────────────────────────────

  static _applyStrategies(overrides, nodes, groupIndex, bridgeNodes) {
    for (const ov of overrides) {
      const ids = DSLCompiler._resolveRef(ov.node, groupIndex, bridgeNodes);
      for (const nodeId of ids) {
        const node = nodes.find(n => n.nodeId === nodeId);
        if (node) node._strategy = ov.strategy;
      }
    }

    // Write final strategy into params so SimulationNode can read it
    // via resolvedParams.strategy (checked before persona.strategy)
    for (const node of nodes) {
      if (node._strategy) {
        node.params = { ...node.params, strategy: node._strategy };
      }
      delete node._strategy;
    }
  }

  // ── Build final config ────────────────────────────────────────────────────────

  static _buildConfig(scenario, nodes, edges, groupIndex, bridgeNodes) {
    const sim    = scenario.simulation  || {};
    const ext    = scenario.extensions  || {};
    const extP   = scenario.extension_params || {};
    const seed   = scenario.seed        || {};

    // Resolve seed entry_points (list of node refs) → flat array of node IDs
    const seedNodes = (seed.entry_points || [])
      .flatMap(ref => DSLCompiler._resolveRef(ref, groupIndex, bridgeNodes));

    // Resolve competitive group entry_points
    const competitiveGroups = (seed.competitive_groups || []).map(cg => ({
      articles:  cg.articles || [],
      seedNodes: (cg.entry_points || [])
        .flatMap(ref => DSLCompiler._resolveRef(ref, groupIndex, bridgeNodes)),
    }));

    // Resolve intervention targets
    const interventions = (scenario.interventions || []).map(iv => ({
      type:        iv.type,
      tick:        iv.tick,
      articleId:   iv.article || iv.articleId,
      targetNodes: (iv.targets || iv.targetNodes || [])
        .flatMap(ref => DSLCompiler._resolveRef(ref, groupIndex, bridgeNodes)),
      params:      iv.params || {},
    }));

    // Deduplicate edges (should already be upserted, but guard against duplicates)
    const edgeMap = new Map();
    for (const e of edges) {
      edgeMap.set(`${e.from}→${e.to}`, e);
    }
    const dedupedEdges = [...edgeMap.values()];

    // Node list for the custom topology
    const engineNodes = nodes.map(n => ({
      nodeId:    n.nodeId,
      personaId: n.personaId,
      ...(n.modelId ? { modelId: n.modelId } : {}),
      ...(Object.keys(n.params).length > 0 ? { params: n.params } : {}),
    }));

    return {
      topology: "custom",

      // Simulation parameters
      maxTicks:         sim.max_ticks      ?? 10,
      defaultModel:     sim.default_model  ?? "gpt-4o-mini",
      auditorModel:     sim.auditor_model  ?? "gpt-4o-mini",
      auditorQuestions: sim.auditor_questions ?? 5,

      // Graph
      nodes:    engineNodes,
      edges:    dedupedEdges,

      // Seed
      seedArticles:      seed.articles       || [],
      seedNodes:         seedNodes.length ? seedNodes
        : (groupIndex[Object.keys(groupIndex)[0]] || []).slice(0, 1),
      competitiveGroups,

      // Node defaults (can still be overridden per-node via params)
      nodeParams: {
        trustThreshold:        sim.trust_threshold        ?? 0.2,
        actionWeights:         sim.action_weights         ?? { forward: 0.3, reinterpret: 0.5, drop: 0.2 },
        relationEvolution:     sim.relation_evolution     ?? true,
        trustDelta:            sim.trust_delta            ?? 0.05,
        maxHops:               sim.max_hops               ?? 8,
        activityPattern:       sim.activity_pattern       ?? "always",
        edgeDeletionThreshold: sim.edge_deletion_threshold ?? 0.05,
        maxInboxSize:          sim.max_inbox_size          ?? 20,
        strippedProperties:    sim.stripped_properties     ?? [],
      },

      // Interventions
      interventions,

      // Layer flags
      enableBeliefs:       !!ext.beliefs,
      enableFrameAnalysis: !!ext.frame_analysis,

      // Extension flags
      enableProvenance:          !!ext.provenance,
      provenanceRecencyDiscount: extP.provenance?.recency_discount          ?? 0.9,
      enableStrategicAgents:     !!ext.strategic_agents,
      enableNetworkEvolution:    !!ext.network_evolution,
      networkEvolutionParams:    extP.network_evolution   ?? {},
      enableOpinionDynamics:     !!ext.opinion_dynamics,
      opinionDynamicsParams:     extP.opinion_dynamics    ?? {},
      enableInstitutionalTrust:  !!ext.institutional_trust,
      institutionalTrustParams:  extP.institutional_trust ?? {},

      // Bot injection (from DSL `bots:` key, first entry wins)
      ...(scenario.bots && scenario.bots.length > 0 ? {
        botInjection: {
          enabled:   true,
          density:   scenario.bots[0].density   ?? 0.1,
          botType:   scenario.bots[0].type       ?? "amplifier",
          placement: scenario.bots[0].placement  ?? "random",
          removal:   scenario.bots[0].removal    ?? "none",
        },
      } : {}),

      // Metadata preserved for documentation; not consumed by the engine
      _dsl: {
        title:       scenario.title       || null,
        description: scenario.description || null,
        source:      scenario._source     || null,
        groups: (scenario.groups || []).map(g => ({
          name:    g.name,
          size:    g.size,
          personas: g.personas,
        })),
        bridges:     (scenario.bridges || []).map(b => b.name),
        compiledAt:  new Date().toISOString(),
        randomSeed:  sim.random_seed ?? 0,
      },
    };
  }

  // ── Node reference resolution ─────────────────────────────────────────────────
  // Accepts: "scientists[0]", "skeptics[*]", "media[0:2]", "scientists[-1]",
  //          "fact_checker" (bridge name), "scientists" (all members — bare name).

  static _resolveRef(ref, groupIndex, bridgeNodes) {
    if (!ref) return [];

    // Check if it's a bare bridge name
    const bridgeMatch = bridgeNodes.find(b => b.nodeId === ref);
    if (bridgeMatch) return [bridgeMatch.nodeId];

    // Try to extract index expression: "groupname[expr]"
    const m = ref.match(/^(.+)\[(.+)\]$/);
    if (!m) {
      // Bare group name — return all members
      if (groupIndex[ref]) return [...groupIndex[ref]];
      // Could be a compiled nodeId directly
      return [ref];
    }

    const [, groupName, expr] = m;
    const members = groupIndex[groupName];
    if (!members) {
      throw new Error(`Cannot resolve reference '${ref}': group '${groupName}' not found`);
    }

    if (expr === "*") return [...members];

    if (expr.includes(":")) {
      const [startStr, endStr] = expr.split(":");
      const start = parseInt(startStr, 10);
      const end   = parseInt(endStr, 10);
      return members.slice(start, end + 1);
    }

    const idx = parseInt(expr, 10);
    const resolved = idx < 0 ? members[members.length + idx] : members[idx];
    if (resolved === undefined) {
      throw new Error(
        `Index out of bounds in '${ref}': group '${groupName}' has ${members.length} member(s)`
      );
    }
    return [resolved];
  }

  // ── Edge upsert (last-write-wins) ─────────────────────────────────────────────

  static _upsertEdge(edges, from, to, trust) {
    const existing = edges.find(e => e.from === from && e.to === to);
    if (existing) {
      existing.trust = trust;
    } else {
      edges.push({ from, to, trust });
    }
  }

  // ── Params normalisation (snake_case DSL → camelCase engine) ──────────────────

  static _normalizeParams(params) {
    if (!params || typeof params !== "object") return {};
    const p = {};
    if (params.action_weights        != null) p.actionWeights        = params.action_weights;
    if (params.trust_threshold       != null) p.trustThreshold       = params.trust_threshold;
    if (params.activity_pattern      != null) p.activityPattern      = params.activity_pattern;
    if (params.max_inbox_size        != null) p.maxInboxSize         = params.max_inbox_size;
    if (params.edge_deletion_threshold != null) p.edgeDeletionThreshold = params.edge_deletion_threshold;
    if (params.trust_delta           != null) p.trustDelta           = params.trust_delta;
    if (params.max_hops              != null) p.maxHops              = params.max_hops;
    if (params.stripped_properties   != null) p.strippedProperties   = params.stripped_properties;
    return p;
  }

  // ── Knowledge loaders ─────────────────────────────────────────────────────────

  static _loadKnownPersonas() {
    try {
      const data = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "personas", "personas.json"), "utf8")
      );
      return new Set((data.personas || []).map(p => p.id));
    } catch {
      return new Set();
    }
  }

  static _loadKnownArticles() {
    try {
      const data = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "articles", "articles.json"), "utf8")
      );
      return new Set((data.articles || []).map(a => a.id));
    } catch {
      return new Set();
    }
  }

  // ── Summary printer ───────────────────────────────────────────────────────────

  static printSummary(config, filename) {
    const n       = config.nodes.length;
    const m       = config.edges.length;
    const density = n > 1 ? (m / (n * (n - 1))).toFixed(3) : "N/A";

    const groups = config._dsl.groups || [];
    const groupStr = groups.map(g => `${g.name}:${g.size}`).join(", ");

    const strategic = config.nodes.filter(nd => nd.params && nd.params.strategy);
    const stratStr  = strategic.length > 0
      ? `${strategic.length} node(s) (${strategic.map(nd => nd.nodeId).join(", ")})`
      : "none";

    const extFlags = [
      config.enableBeliefs          && "beliefs",
      config.enableFrameAnalysis    && "frame_analysis",
      config.enableProvenance       && "provenance",
      config.enableStrategicAgents  && "strategic_agents",
      config.enableNetworkEvolution && "network_evolution",
      config.enableOpinionDynamics  && "opinion_dynamics",
      config.enableInstitutionalTrust && "institutional_trust",
    ].filter(Boolean);

    const seedStr = `${config.seedArticles.length} article(s) → ${config.seedNodes.join(", ")}`;

    console.log(`\nCompiled: ${filename || "scenario"}`);
    if (config._dsl.title) console.log(`  Title:      ${config._dsl.title}`);
    console.log(`  Groups:     ${groups.length} (${groupStr})`);
    console.log(`  Bridges:    ${(config._dsl.bridges || []).length} (${(config._dsl.bridges || []).join(", ") || "none"})`);
    console.log(`  Nodes:      ${n}`);
    console.log(`  Edges:      ${m}  (density ${density})`);
    console.log(`  Strategic:  ${stratStr}`);
    console.log(`  Seed:       ${seedStr}`);
    console.log(`  Extensions: ${extFlags.length > 0 ? extFlags.join(", ") : "none"}`);
    console.log(`  Ticks:      ${config.maxTicks}  |  Model: ${config.defaultModel}`);
    if (config._dsl.randomSeed) {
      console.log(`  Seed (RNG): ${config._dsl.randomSeed}`);
    }
    console.log();
  }
}

module.exports = DSLCompiler;
