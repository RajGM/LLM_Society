#!/usr/bin/env node
/**
 * Parse thesisExperiment/runs into results tables (JSON/CSV/MD) + heatmap matrices.
 * Prefers full_campaign_manifest.json, then campaign_manifest.json, else scans runs/.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const RUNS = path.join(ROOT, "runs");
const OUT = path.join(ROOT, "results");
fs.mkdirSync(OUT, { recursive: true });

const DISTORTION_TYPES = [
  {
    id: "spraying_chemtrails",
    re: /\bchemtrails?\b|\bspray(?:ing|ed)?\b|\bpoison(?:s|ous)?\b|lines in the sky|contrails? (?:are|is) (?:chemical|chem)/i,
  },
  { id: "weather_haarp", re: /\bhaarp\b|\bweather\s*modif|\bnexrad\b|\bionospher/i },
  { id: "weaponization", re: /\bweapon(?:iz(?:e|ation)|s)?\b|\bwarfare\b|\bearthquakes?\b|\bweather war/i },
  { id: "depopulation", re: /\bdepopul|\bpopulation control\b|\beugenic/i },
  { id: "antivax_spillover", re: /\bantivax|\bvaccine|\bcovid|\bpandemic\b/i },
];

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function isConspiracyId(id) {
  if (!id) return false;
  return id === "conspiracy_believer" || String(id).startsWith("conspiracy_");
}

function classifyText(text) {
  const hits = [];
  if (!text) return hits;
  for (const t of DISTORTION_TYPES) {
    if (t.re.test(text)) hits.push(t.id);
  }
  const justice = /\bclimate (?:action|justice)\b|\bmitigation\b/i.test(text);
  const conspiracyish =
    hits.includes("spraying_chemtrails") || hits.includes("weather_haarp") || hits.includes("depopulation");
  if (justice && conspiracyish) hits.push("climate_justice_hijack");
  return [...new Set(hits)];
}

function graphEchoMetrics(topo) {
  if (!topo || !Array.isArray(topo.nodes) || !Array.isArray(topo.edges)) {
    return { edgeHomophily: null, conspiracyHomophily: null, modularityConspiracy: null, nEdges: 0 };
  }
  const persona = Object.fromEntries(topo.nodes.map((n) => [n.nodeId, n.personaId]));
  const edges = topo.edges || [];
  const nEdges = edges.length;
  if (nEdges === 0) return { edgeHomophily: 0, conspiracyHomophily: 0, modularityConspiracy: 0, nEdges: 0 };

  let samePersona = 0;
  let sameCluster = 0;
  const degree = {};
  for (const e of edges) {
    degree[e.from] = (degree[e.from] || 0) + 1;
    if (persona[e.from] && persona[e.from] === persona[e.to]) samePersona++;
    if (isConspiracyId(persona[e.from]) === isConspiracyId(persona[e.to])) sameCluster++;
  }
  const m = nEdges;
  let q = 0;
  for (const e of edges) {
    const ki = degree[e.from] || 0;
    const kj = degree[e.to] || 0;
    const delta = isConspiracyId(persona[e.from]) === isConspiracyId(persona[e.to]) ? 1 : 0;
    q += delta - (ki * kj) / (2 * m);
  }
  return {
    edgeHomophily: round4(samePersona / nEdges),
    conspiracyHomophily: round4(sameCluster / nEdges),
    modularityConspiracy: round4(q / (2 * m)),
    nEdges,
  };
}

function polarizationIndex(nodeSummaries) {
  const groups = { conspiracy: [], other: [] };
  for (const s of Object.values(nodeSummaries || {})) {
    const bucket = isConspiracyId(s.personaId) ? "conspiracy" : "other";
    groups[bucket].push(s.mpr || 0);
  }
  const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const c = mean(groups.conspiracy);
  const o = mean(groups.other);
  if (c == null || o == null) return { pi: null, meanConspiracyMPR: c, meanOtherMPR: o };
  return { pi: round4(Math.abs(c - o)), meanConspiracyMPR: round4(c), meanOtherMPR: round4(o) };
}

function distortionCounts(runDir, articleId) {
  const nodesDir = path.join(runDir, "nodes");
  const counts = {};
  let nTexts = 0;
  if (!fs.existsSync(nodesDir)) return { nTexts: 0, counts };
  for (const f of fs.readdirSync(nodesDir).filter((x) => x.endsWith(".json"))) {
    const state = readJSON(path.join(nodesDir, f));
    for (const ev of state.history || []) {
      if (ev.articleId !== articleId) continue;
      if (!ev.contentOut) continue;
      nTexts++;
      for (const t of classifyText(ev.contentOut)) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
  }
  return { nTexts, counts };
}

function hopSeries(runDir, articleId) {
  const nodesDir = path.join(runDir, "nodes");
  const byHop = {};
  if (!fs.existsSync(nodesDir)) return [];
  for (const f of fs.readdirSync(nodesDir).filter((x) => x.endsWith(".json"))) {
    const state = readJSON(path.join(nodesDir, f));
    for (const ev of state.history || []) {
      if (ev.articleId !== articleId || ev.misinfoIndex == null) continue;
      const h = ev.hops != null ? ev.hops : ev.tick;
      if (!byHop[h]) byHop[h] = [];
      byHop[h].push(ev.misinfoIndex);
    }
  }
  return Object.keys(byHop)
    .map(Number)
    .sort((a, b) => a - b)
    .map((h) => ({
      hop: h,
      meanMI: round4(byHop[h].reduce((s, x) => s + x, 0) / byHop[h].length),
      n: byHop[h].length,
    }));
}

function miBeforeAfter(runDir, articleId, splitTick) {
  const nodesDir = path.join(runDir, "nodes");
  const before = [];
  const after = [];
  if (!fs.existsSync(nodesDir)) return { beforeMean: null, afterMean: null, nBefore: 0, nAfter: 0 };
  for (const f of fs.readdirSync(nodesDir).filter((x) => x.endsWith(".json"))) {
    const state = readJSON(path.join(nodesDir, f));
    for (const ev of state.history || []) {
      if (ev.articleId !== articleId || ev.misinfoIndex == null) continue;
      if (ev.tick < splitTick) before.push(ev.misinfoIndex);
      else after.push(ev.misinfoIndex);
    }
  }
  const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  return {
    splitTick,
    beforeMean: mean(before) == null ? null : round4(mean(before)),
    afterMean: mean(after) == null ? null : round4(mean(after)),
    nBefore: before.length,
    nAfter: after.length,
  };
}

function listRunDirs() {
  const names = new Map();
  const addFromManifest = (p) => {
    if (!fs.existsSync(p)) return;
    const man = readJSON(p);
    for (const r of man.runs || []) {
      if (!r.runDir) continue;
      const abs = path.join(RUNS, r.runDir);
      if (fs.existsSync(path.join(abs, "metadata.json"))) names.set(r.runDir, abs);
    }
    return man;
  };
  const full = addFromManifest(path.join(OUT, "full_campaign_manifest.json"));
  const old = addFromManifest(path.join(OUT, "campaign_manifest.json"));
  if (!fs.existsSync(RUNS)) return { dirs: [...names.values()], full, old };
  for (const d of fs.readdirSync(RUNS)) {
    if (d.startsWith("probe_api_")) continue;
    const abs = path.join(RUNS, d);
    if (fs.existsSync(path.join(abs, "metadata.json"))) names.set(d, abs);
  }
  return { dirs: [...names.values()], full, old };
}

function irreversibleKStar(networkMIOverTime, threshold = 3) {
  if (!Array.isArray(networkMIOverTime) || networkMIOverTime.length === 0) {
    return { kStar: null, firstMeanMiOver3: null, recovered: false };
  }
  const series = [...networkMIOverTime].sort((a, b) => a.tick - b.tick);
  let first = null;
  for (const pt of series) {
    if (pt.meanMI != null && pt.meanMI > threshold) {
      first = pt.tick;
      break;
    }
  }
  if (first == null) return { kStar: null, firstMeanMiOver3: null, recovered: false };
  const after = series.filter((p) => p.tick >= first);
  const recovered = after.some((p) => p.meanMI != null && p.meanMI <= threshold);
  return { kStar: recovered ? null : first, firstMeanMiOver3: first, recovered };
}

function firstIrreversibleNodePropaganda(nodesDir, articleId, threshold = 3) {
  if (!fs.existsSync(nodesDir)) return { tick: null, hop: null, nodeId: null };
  const files = fs.readdirSync(nodesDir).filter((f) => f.endsWith(".json"));
  let best = null;
  for (const f of files) {
    const state = readJSON(path.join(nodesDir, f));
    const events = (state.history || [])
      .filter((e) => e.articleId === articleId && e.misinfoIndex != null)
      .sort((a, b) => a.tick - b.tick || (a.hops || 0) - (b.hops || 0));
    let crossed = null;
    for (const ev of events) {
      if (ev.misinfoIndex > threshold) {
        crossed = ev;
        break;
      }
    }
    if (!crossed) continue;
    const later = events.filter(
      (e) => e.tick > crossed.tick || (e.tick === crossed.tick && (e.hops || 0) > (crossed.hops || 0))
    );
    const recovered = later.some((e) => e.misinfoIndex <= threshold);
    if (recovered) continue;
    if (
      !best ||
      crossed.tick < best.tick ||
      (crossed.tick === best.tick && (crossed.hops || 0) < (best.hops || 0))
    ) {
      best = { tick: crossed.tick, hop: crossed.hops ?? null, nodeId: state.nodeId };
    }
  }
  return best || { tick: null, hop: null, nodeId: null };
}

function summarizeArticle(runDir, articleId, nodeSummaries, metrics, cfg) {
  const mprs = Object.values(nodeSummaries || {}).map((s) => s.mpr || 0);
  const maxMpr = mprs.length ? Math.max(...mprs) : 0;
  const meanMpr = mprs.length ? mprs.reduce((a, b) => a + b, 0) / mprs.length : 0;
  const totalEvents = Object.values(nodeSummaries || {}).reduce((s, n) => s + (n.eventCount || 0), 0);
  const personas = [...new Set(Object.values(nodeSummaries || {}).map((n) => n.personaId))];

  const miSeries = (metrics && metrics.networkMIOverTime) || [];
  const maxMeanMI = miSeries.length
    ? Math.max(...miSeries.map((p) => p.meanMI).filter((v) => v != null))
    : 0;
  const eventMaxMI = ((metrics && metrics.cascadeReachVsFidelity) || []).reduce((m, p) => {
    return Math.max(m, p.meanMI || 0);
  }, 0);

  let eventPeakMI = 0;
  const nodesDir = path.join(runDir, "nodes");
  if (fs.existsSync(nodesDir)) {
    for (const f of fs.readdirSync(nodesDir).filter((x) => x.endsWith(".json"))) {
      const state = readJSON(path.join(nodesDir, f));
      for (const ev of state.history || []) {
        if (ev.articleId === articleId && ev.misinfoIndex != null) {
          eventPeakMI = Math.max(eventPeakMI, ev.misinfoIndex);
        }
      }
    }
  }

  const k = irreversibleKStar(miSeries, 3);
  const nodeK = firstIrreversibleNodePropaganda(nodesDir, articleId, 3);
  const topoPath = path.join(runDir, "graph_topology.json");
  const echo = fs.existsSync(topoPath) ? graphEchoMetrics(readJSON(topoPath)) : {};
  const pi = polarizationIndex(nodeSummaries);
  const dist = distortionCounts(runDir, articleId);
  const hops = hopSeries(runDir, articleId);

  let bRecovery = null;
  if ((cfg.experimentName || "").startsWith("B_")) {
    const iv = (cfg.interventions || []).find((x) => x.type === "fact_checker_injection");
    const split = iv && iv.tick != null ? iv.tick : 3;
    bRecovery = miBeforeAfter(runDir, articleId, split);
  }

  return {
    articleId,
    personasUsed: personas,
    seedPersona: personas[0] || null,
    totalEvents,
    maxNodeMPR: round4(maxMpr),
    meanNodeMPR: round4(meanMpr),
    maxNetworkMeanMI: round4(maxMeanMI),
    maxEventMI: round4(Math.max(eventPeakMI, eventMaxMI)),
    propagandaOccurred: maxMpr > 3 || eventPeakMI > 3 || maxMeanMI > 3,
    kStar_network: k.kStar,
    firstMeanMiOver3: k.firstMeanMiOver3,
    networkRecoveredAfterPropaganda: k.recovered,
    kStar_firstIrreversibleNode: nodeK.tick,
    kStar_hop: nodeK.hop,
    kStar_nodeId: nodeK.nodeId,
    giniCoefficient: metrics && metrics.giniCoefficient != null ? round4(metrics.giniCoefficient) : null,
    structuralVirality: metrics && metrics.structuralVirality != null ? round4(metrics.structuralVirality) : null,
    networkMIOverTime: miSeries,
    hopMI: hops,
    echo,
    polarization: pi,
    distortionHeuristic: dist,
    bRecovery,
  };
}

function round4(x) {
  return Math.round(x * 10000) / 10000;
}

function conditionFromConfig(cfg) {
  const name = cfg.experimentName || "";
  const topo =
    cfg.topology === "scale_free"
      ? "scale-free"
      : cfg.topology === "random_er"
        ? "random-ER"
        : cfg.topology === "echo_chamber"
          ? "echo-chamber"
          : cfg.topology;
  let exp = "other";
  if (name.startsWith("H_")) exp = "H";
  else if (name.startsWith("He_")) exp = "He";
  else if (name.startsWith("A_")) exp = "A";
  else if (name.startsWith("B_")) exp = "B";
  else if (name.startsWith("D_")) exp = "D";

  let bpMix = "unknown";
  if (exp === "H") bpMix = "homogeneous:" + name.slice(2);
  else if (exp === "He") bpMix = "heterogeneous:" + name.slice(3);
  else if ((cfg.personasPath || "").includes("homogeneous")) bpMix = "homogeneous-conspiracy";
  else if ((cfg.personasPath || "").includes("mixed_graph")) bpMix = "mixed-8BP";
  else if ((cfg.personasPath || "").includes("mixed_three")) bpMix = "mixed-3BP";
  else bpMix = path.basename(cfg.personasPath || "unknown", ".json");

  return { experiment: exp, topology: topo, bpMix, experimentName: name };
}

function csvEscape(v) {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(file, rows, cols) {
  const lines = [cols.join(",")];
  for (const r of rows) {
    lines.push(cols.map((c) => csvEscape(r[c])).join(","));
  }
  fs.writeFileSync(file, lines.join("\n") + "\n");
}

function heatmapFrom(rows, rowKey, colKey, valueKey) {
  const rowIds = [...new Set(rows.map((r) => r[rowKey]))].sort();
  const colIds = [...new Set(rows.map((r) => r[colKey]))].sort();
  const matrix = rowIds.map((rk) =>
    colIds.map((ck) => {
      const hit = rows.find((r) => r[rowKey] === rk && r[colKey] === ck);
      return hit && hit[valueKey] != null ? hit[valueKey] : null;
    })
  );
  return { rowKey, colKey, valueKey, rows: rowIds, cols: colIds, matrix };
}

function main() {
  fs.mkdirSync(path.join(OUT, "tables"), { recursive: true });
  const { dirs, full, old } = listRunDirs();
  const mode = (full && full.mode) || (old && old.mode) || "scan";
  const rows = [];
  const usage = [];
  const seenExp = new Set();

  const dated = dirs
    .map((runDir) => ({ runDir, t: fs.statSync(runDir).mtimeMs }))
    .sort((a, b) => b.t - a.t);

  for (const { runDir } of dated) {
    const meta = readJSON(path.join(runDir, "metadata.json"));
    const cfg = meta.config || {};
    if (cfg.experimentName === "probe_api") continue;
    if (seenExp.has(cfg.experimentName)) continue;
    if (meta.status === "completed") seenExp.add(cfg.experimentName);
    else if (dated.filter((d) => d.runDir !== runDir).length) {
      /* keep incomplete only if no completed sibling; mark seen so older incomplete ignored */
      seenExp.add(cfg.experimentName);
    }
    const cond = conditionFromConfig(cfg);
    const key = path.basename(runDir);
    if (meta.llmUsage) {
      usage.push({ runDir: key, experimentName: cond.experimentName, ...meta.llmUsage });
    }
    const results = meta.results || {};
    const payloads = [];
    if (Object.keys(results).length === 0) {
      const files = fs.readdirSync(runDir).filter((f) => f.startsWith("results_") && f.endsWith(".json"));
      for (const f of files) {
        payloads.push({
          articleId: f.slice("results_".length, -".json".length),
          payload: readJSON(path.join(runDir, f)),
        });
      }
    } else {
      for (const [articleId, payload] of Object.entries(results)) {
        payloads.push({ articleId, payload });
      }
    }
    for (const { articleId, payload } of payloads) {
      rows.push({
        runDir: key,
        status: meta.status,
        model: cfg.defaultModel || null,
        ...cond,
        ...summarizeArticle(runDir, articleId, payload.nodeSummaries, payload.metrics, cfg),
      });
    }
  }

  const hRows = rows.filter((r) => r.experiment === "H");
  const heRows = rows.filter((r) => r.experiment === "He");
  const aRows = rows.filter((r) => r.experiment === "A");
  const bRows = rows.filter((r) => r.experiment === "B");

  const heatmaps = {
    H_meanMPR: heatmapFrom(hRows, "bpMix", "articleId", "meanNodeMPR"),
    H_maxMI: heatmapFrom(hRows, "bpMix", "articleId", "maxEventMI"),
    H_kStar: heatmapFrom(hRows, "bpMix", "articleId", "kStar_network"),
    He_meanMPR: heatmapFrom(heRows, "bpMix", "articleId", "meanNodeMPR"),
    He_maxMI: heatmapFrom(heRows, "bpMix", "articleId", "maxEventMI"),
    A_meanMPR: heatmapFrom(aRows, "experimentName", "articleId", "meanNodeMPR"),
    A_kStar: heatmapFrom(aRows, "experimentName", "articleId", "kStar_network"),
  };

  const estimatedUsd = usage.reduce((s, u) => s + (u.estimatedUsd || 0), 0);
  const calls = usage.reduce((s, u) => s + (u.calls || 0), 0);

  const summary = {
    generatedAt: new Date().toISOString(),
    mode,
    thesisGrade: hRows.length >= 10 * 10 && heRows.length >= 10 * 10 && aRows.length >= 2 * 2 * 6,
    validity:
      mode === "dry-run"
        ? "INVALID for thesis: dry-run auditor returns all-correct (MI=0)."
        : "Real LLM campaign (gpt-4o-mini). Reduced Debnath BPs; no 814k HDBSCAN.",
    counts: {
      nRows: rows.length,
      H: hRows.length,
      He: heRows.length,
      A: aRows.length,
      B: bRows.length,
      D: rows.filter((r) => r.experiment === "D").length,
    },
    llmUsage: usage,
    llmUsageTotals: { calls, estimatedUsd: round4(estimatedUsd) },
    pfefferVaried: [
      "identityAlignment (hom vs mix vs 12 personas)",
      "networkClustering (chain / scale-free / ER / echo)",
      "valence via article set",
    ],
    pfefferHeld: ["surprise (drip seed node_0)", "temporalAcceleration (8-tick hop compression)"],
    pfefferMeasured: ["informationEcho (homophily, modularity, PI, Gini, hop MI)"],
    heatmaps,
    rows,
  };

  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(OUT, "heatmaps.json"), JSON.stringify(heatmaps, null, 2));
  fs.writeFileSync(path.join(OUT, "summary.md"), renderMarkdown(summary));

  const csvCols = [
    "experiment",
    "experimentName",
    "topology",
    "bpMix",
    "articleId",
    "status",
    "totalEvents",
    "maxEventMI",
    "maxNetworkMeanMI",
    "meanNodeMPR",
    "maxNodeMPR",
    "propagandaOccurred",
    "kStar_network",
    "firstMeanMiOver3",
    "networkRecoveredAfterPropaganda",
    "kStar_hop",
    "giniCoefficient",
    "structuralVirality",
    "runDir",
    "model",
  ];
  writeCsv(path.join(OUT, "tables", "all_rows.csv"), rows, csvCols);
  writeCsv(path.join(OUT, "tables", "H_rows.csv"), hRows, csvCols);
  writeCsv(path.join(OUT, "tables", "He_rows.csv"), heRows, csvCols);
  writeCsv(path.join(OUT, "tables", "A_rows.csv"), aRows, csvCols);
  writeCsv(
    path.join(OUT, "tables", "B_before_after.csv"),
    bRows.map((r) => ({
      experimentName: r.experimentName,
      articleId: r.articleId,
      splitTick: r.bRecovery && r.bRecovery.splitTick,
      beforeMean: r.bRecovery && r.bRecovery.beforeMean,
      afterMean: r.bRecovery && r.bRecovery.afterMean,
      nBefore: r.bRecovery && r.bRecovery.nBefore,
      nAfter: r.bRecovery && r.bRecovery.nAfter,
    })),
    ["experimentName", "articleId", "splitTick", "beforeMean", "afterMean", "nBefore", "nAfter"]
  );
  writeCsv(
    path.join(OUT, "tables", "echo_modularity.csv"),
    rows
      .filter((r) => r.topology !== "linear_chain")
      .map((r) => ({
        experimentName: r.experimentName,
        articleId: r.articleId,
        topology: r.topology,
        bpMix: r.bpMix,
        edgeHomophily: r.echo && r.echo.edgeHomophily,
        conspiracyHomophily: r.echo && r.echo.conspiracyHomophily,
        modularityConspiracy: r.echo && r.echo.modularityConspiracy,
        PI: r.polarization && r.polarization.pi,
      })),
    [
      "experimentName",
      "articleId",
      "topology",
      "bpMix",
      "edgeHomophily",
      "conspiracyHomophily",
      "modularityConspiracy",
      "PI",
    ]
  );

  fs.mkdirSync(path.join(OUT, "tables"), { recursive: true });
  console.log(
    `Wrote summary ${rows.length} rows (H=${hRows.length} He=${heRows.length} A=${aRows.length} B=${bRows.length}) calls=${calls} estUSD=${round4(estimatedUsd)}`
  );
}

function renderMarkdown(summary) {
  const lines = [];
  lines.push("# Thesis experiment results (full campaign)");
  lines.push("");
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push("");
  lines.push(`**Validity:** ${summary.validity}`);
  lines.push("");
  lines.push(
    `**Thesis-grade grid?** ${summary.thesisGrade ? "yes (count bar)" : "not yet — check counts vs 12×12 H/He and 2×2×6 A"}`
  );
  lines.push("");
  lines.push("## Counts");
  lines.push("");
  lines.push(JSON.stringify(summary.counts));
  lines.push("");
  lines.push(`LLM calls: ${summary.llmUsageTotals.calls}; est. USD: ${summary.llmUsageTotals.estimatedUsd}`);
  lines.push("");
  lines.push("## Table: k*, MI, MPR by condition");
  lines.push("");
  lines.push(
    "| Cell | Exp | Topology | Mix | Article | events | max MI | net mean MI | mean MPR | k* | recovered |"
  );
  lines.push("|---|---|---|---|---|---|---|---|---|---|---|");
  for (const r of summary.rows) {
    lines.push(
      `| ${r.experimentName} | ${r.experiment} | ${r.topology} | ${r.bpMix} | ${r.articleId} | ${r.totalEvents ?? "—"} | ${r.maxEventMI} | ${r.maxNetworkMeanMI} | ${r.meanNodeMPR} | ${r.kStar_network ?? "none"} | ${r.networkRecoveredAfterPropaganda} |`
    );
  }
  lines.push("");
  lines.push("## Experiment B");
  lines.push("");
  lines.push("| Cell | split | mean MI before | n before | mean MI after | n after |");
  lines.push("|---|---|---|---|---|---|");
  for (const r of summary.rows.filter((x) => x.bRecovery)) {
    const b = r.bRecovery;
    lines.push(
      `| ${r.experimentName} | ${b.splitTick} | ${b.beforeMean ?? "—"} | ${b.nBefore} | ${b.afterMean ?? "—"} | ${b.nAfter} |`
    );
  }
  lines.push("");
  lines.push("## Echo / modularity");
  lines.push("");
  lines.push("| Cell | Article | homophily | conspiracy homophily | modularity | PI |");
  lines.push("|---|---|---|---|---|---|");
  for (const r of summary.rows.filter((x) => x.topology !== "linear_chain")) {
    const e = r.echo || {};
    const p = r.polarization || {};
    lines.push(
      `| ${r.experimentName} | ${r.articleId} | ${e.edgeHomophily ?? "—"} | ${e.conspiracyHomophily ?? "—"} | ${e.modularityConspiracy ?? "—"} | ${p.pi ?? "—"} |`
    );
  }
  lines.push("");
  lines.push("## Distortion heuristic (Exp C)");
  lines.push("");
  for (const r of summary.rows) {
    const d = r.distortionHeuristic || {};
    if (!d.nTexts) continue;
    lines.push(`- **${r.experimentName} / ${r.articleId}** (nTexts=${d.nTexts}): ${JSON.stringify(d.counts || {})}`);
  }
  lines.push("");
  lines.push("## LLM usage");
  lines.push("");
  for (const u of summary.llmUsage || []) {
    lines.push(
      `- ${u.experimentName}: ${u.calls} calls, ${u.promptTokens}+${u.completionTokens} tokens, est. $${u.estimatedUsd ?? "?"}`
    );
  }
  lines.push("");
  return lines.join("\n");
}

try {
  fs.mkdirSync(path.join(OUT, "tables"), { recursive: true });
} catch {
  /* exists */
}
main();
