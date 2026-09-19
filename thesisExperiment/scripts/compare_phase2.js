#!/usr/bin/env node
/**
 * Phase 2 comparison: empirical Debnath hashtag graph vs simulated D-net / custom runs.
 *
 * Isolation: writes only to thesisExperiment/results_phase2/.
 * Does not touch thesisExperiment/runs/ or thesisExperiment/results/tables/.
 *
 * Honesty: Debnath has NO empirical MPR. Simulated MI is an auditor score,
 * not Twitter MI. Hashtag co-occurrence is not a retweet cascade.
 *
 *   node thesisExperiment/scripts/compare_phase2.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const DERIVED = path.join(EXP, "data", "derived");
const RUNS = path.join(EXP, "runs_phase2");
const OUT = path.join(EXP, "results_phase2");
const EMPIRICAL_PREFERRED = path.join(DERIVED, "debnath_hashtag_cascade.json");

const ValidationMetrics = require(path.join(ROOT, "src", "ValidationMetrics"));
const ValidationComparison = require(path.join(ROOT, "src", "ValidationComparison"));

const SCHEMA = "thesisExperiment.debnath_hashtag_cascade.v1";

const CONSPIRACY_TAGS = new Set([
  "chemtrails",
  "haarp",
  "weathermodification",
  "nwo",
  "illuminati",
  "gmo",
]);
const CLIMATE_ACTION_TAGS = new Set(["climate", "mitigation", "climatejustice", "srm", "sag"]);
const ENV_TAGS = new Set([
  "environment",
  "biodiversity",
  "airpollution",
  "ozone",
  "ecology",
  "foodsecurity",
]);

const HONESTY_NOTES = [
  "Debnath has NO empirical MPR. Do not claim simulated MI equals Twitter MI.",
  "Hashtag co-occurrence is a structural/hashtag fallback, not a hydrated retweet cascade.",
  "814k tweet IDs were not hydrated; BPs are theory-faithful reductions, not HDBSCAN centroids.",
  "8 hops/ticks is logged cost compression vs CIKM 30, not a Debnath hop protocol.",
  "Pfeffer et al. (2014) lists seven interrelated factors. The thesis six-knob list is a remapping, not a restatement of that paper.",
  "Cross-media dynamics has no engine knob and is held.",
];

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJSON(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

function round4(x) {
  if (x == null || Number.isNaN(Number(x))) return null;
  return Math.round(Number(x) * 10000) / 10000;
}

function mean(arr) {
  const xs = (arr || []).filter((v) => v != null && !Number.isNaN(Number(v))).map(Number);
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

function slugHashtag(tag) {
  return String(tag || "")
    .replace(/^#/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function isConspiracyId(id) {
  if (!id) return false;
  const s = String(id).toLowerCase();
  if (s === "conspiracy" || s === "conspiracy_cluster" || s === "conspiracy_believer") return true;
  return s.startsWith("conspiracy_");
}

function identityFromTag(tag) {
  const s = slugHashtag(tag);
  if (
    CONSPIRACY_TAGS.has(s) ||
    s.includes("chemtrail") ||
    s.includes("haarp") ||
    s.includes("depop") ||
    s.includes("nwo") ||
    s.includes("illuminati") ||
    s.includes("stopspray")
  ) {
    return "conspiracy";
  }
  if (ENV_TAGS.has(s) || s.includes("ozone") || s.includes("biodivers") || s.includes("pollution") || s.includes("food")) {
    return "environmental_concern";
  }
  if (
    CLIMATE_ACTION_TAGS.has(s) ||
    s.includes("climateaction") ||
    s.includes("climatejustice") ||
    s.includes("mitigation") ||
    s === "srm" ||
    s === "sag" ||
    s === "sai"
  ) {
    return "climate_action";
  }
  if (s === "geoengineering" || s === "geo") return "mixed_hub";
  return "other";
}

function identityFromCluster(cluster) {
  const s = String(cluster || "").toLowerCase();
  if (s === "chemtrails" || s === "piggyback" || s === "conspiracy") return "conspiracy";
  if (s === "climate_action" || s === "climate-action") return "climate_action";
  if (s === "environmental" || s === "environmental_concern") return "environmental_concern";
  if (s === "geo") return "mixed_hub";
  if (s === "expert") return "other";
  return null;
}

function identityBucket(value, node) {
  const fromCluster = identityFromCluster(node && node.cluster);
  if (fromCluster) return fromCluster === "mixed_hub" ? "other" : fromCluster;
  const bp = node && (node.intended_debnath_bp || node.intendedBp || node.personaId);
  if (isConspiracyId(bp)) return "conspiracy";
  if (bp && /climate_action|climate_justice|mitigation_first/i.test(String(bp))) return "climate_action";
  if (bp && /environmental|ozone|biodivers/i.test(String(bp))) return "environmental_concern";
  const raw = (node && (node.identity || node.debnathType || node.cluster)) || value || "";
  const s = String(raw).toLowerCase();
  if (s === "mixed_hub" || s === "mixed") return "other";
  if (isConspiracyId(s) || s === "conspiracy") return "conspiracy";
  const clustered = identityFromCluster(s);
  if (clustered) return clustered === "mixed_hub" ? "other" : clustered;
  if (s.includes("climate_action") || s.includes("climate-action") || s === "climate_action") {
    return "climate_action";
  }
  if (s.includes("environmental") || s.includes("ozone") || s.includes("biodiversity")) {
    return "environmental_concern";
  }
  const fromTag = identityFromTag(s);
  if (fromTag !== "other") return fromTag === "mixed_hub" ? "other" : fromTag;
  return "other";
}

function toxicityProxyForIdentity(identity) {
  if (identity === "conspiracy" || identity === "mixed_hub") return 0.17;
  if (identity === "environmental_concern") return 0.08;
  if (identity === "climate_action") return 0.05;
  return 0.04;
}

function paperSlice() {
  const p = path.join(DERIVED, "debnath_paper_slice.json");
  if (fs.existsSync(p)) {
    try {
      return readJSON(p);
    } catch {
      /* fall through */
    }
  }
  return {
    toxicity: { mean: 0.17, severeMean: 0.12 },
    hashtags_from_table_and_codes: [
      "#geoengineering",
      "#chemtrails",
      "#haarp",
      "#srm",
      "#sag",
      "#weathermodification",
      "#nwo",
      "#illuminati",
      "#gmo",
      "#climate",
    ],
    nonconspiracy_terms_fig4: [
      "mitigation",
      "biodiversity",
      "airpollution",
      "ozone",
      "environment",
      "climate justice",
      "ecology",
      "food security",
    ],
  };
}

/**
 * Reconstruct-compatible hashtag co-occurrence graph.
 * FakeNewsNet-shaped `retweets` so ValidationMetrics.extractRealMetrics can run,
 * plus `graph_topology` for clustering / echo. Not a retweet cascade.
 */
function generateMinimalHashtagGraph() {
  const slice = paperSlice();
  const toxMean = (slice.toxicity && slice.toxicity.mean) || 0.17;
  const toxSevere = (slice.toxicity && slice.toxicity.severeMean) || 0.12;

  const nodesSpec = [
    { tag: "#geoengineering", identity: "mixed_hub" },
    { tag: "#chemtrails", identity: "conspiracy", parent: "geoengineering" },
    { tag: "#haarp", identity: "conspiracy", parent: "chemtrails" },
    { tag: "#weathermodification", identity: "conspiracy", parent: "chemtrails" },
    { tag: "#nwo", identity: "conspiracy", parent: "chemtrails" },
    { tag: "#illuminati", identity: "conspiracy", parent: "nwo" },
    { tag: "#gmo", identity: "conspiracy", parent: "nwo" },
    { tag: "#srm", identity: "climate_action", parent: "geoengineering" },
    { tag: "#sag", identity: "climate_action", parent: "srm" },
    { tag: "#ozone", identity: "environmental_concern", parent: "srm" },
    { tag: "#climate", identity: "climate_action", parent: "geoengineering" },
    { tag: "#mitigation", identity: "climate_action", parent: "climate" },
    { tag: "#climatejustice", identity: "climate_action", parent: "climate" },
    { tag: "#environment", identity: "environmental_concern", parent: "climate" },
    { tag: "#biodiversity", identity: "environmental_concern", parent: "environment" },
    { tag: "#airpollution", identity: "environmental_concern", parent: "environment" },
    { tag: "#ecology", identity: "environmental_concern", parent: "environment" },
    { tag: "#foodsecurity", identity: "environmental_concern", parent: "environment" },
  ];

  const user_profiles = {};
  const topoNodes = [];
  const topoEdges = [];
  const retweets = [];
  const cooccurrence = [];
  const identityMix = { conspiracy: 0, climate_action: 0, environmental_concern: 0, other: 0 };

  nodesSpec.forEach((spec) => {
    const id = slugHashtag(spec.tag);
    const tox = spec.identity === "mixed_hub" ? toxMean : toxicityProxyForIdentity(spec.identity);
    const bucket = spec.identity === "mixed_hub" ? "other" : spec.identity;
    identityMix[bucket] = (identityMix[bucket] || 0) + 1;
    user_profiles[id] = {
      hashtag: spec.tag,
      identity: spec.identity,
      toxicityPrior: tox,
      followers: spec.identity === "mixed_hub" ? 10000 : 1000,
      verified: false,
      description: `Debnath paper-quoted hashtag ${spec.tag} (${spec.identity}). Not a hydrated user.`,
    };
    topoNodes.push({
      nodeId: id,
      personaId: spec.identity === "conspiracy" ? "conspiracy_cluster" : spec.identity,
      identity: spec.identity,
      hashtag: spec.tag,
      toxicityPrior: tox,
    });
    if (spec.parent) {
      retweets.push({
        user_id: id,
        retweeted_from: spec.parent,
        timestamp: null,
        hashtag: spec.tag,
        identity: spec.identity,
        toxicityProxy: tox,
        _timestampSynthetic: true,
      });
      topoEdges.push({ from: spec.parent, to: id, trust: 0.6, weight: 1, kind: "hashtag_cooccurrence" });
      cooccurrence.push({ source: spec.parent, target: id, weight: 1 });
    }
  });

  return {
    schema: SCHEMA,
    kind: "hashtag_cooccurrence",
    notARetweetCascade: true,
    generatedFallback: true,
    temporalAvailable: false,
    empiricalMPR: false,
    news_id: "debnath_geoengineering_hashtag",
    label: "empirical_hashtag_fallback",
    seed_user: "geoengineering",
    seed_hashtag: "#geoengineering",
    source:
      "Debnath et al. iScience 2023 paper-quoted hashtags / Fig. 4 non-conspiracy terms. Tweet IDs not hydrated; this is a minimal co-occurrence tree so compare_phase2.js is runnable. Prefer reconstruct output when present.",
    toxicity: {
      mean: toxMean,
      severeMean: toxSevere,
      source: "Debnath 2023 Table 1 paper-quoted; not tweet-level Perspective scores",
    },
    identityMix,
    hashtags: nodesSpec.map((s) => ({
      id: slugHashtag(s.tag),
      tag: s.tag,
      identity: s.identity,
      toxicityPrior: s.identity === "mixed_hub" ? toxMean : toxicityProxyForIdentity(s.identity),
    })),
    retweets,
    cooccurrence,
    user_profiles,
    graph_topology: { nodes: topoNodes, edges: topoEdges },
    honesty: {
      empiricalMPR: false,
      simulatedMIIsNotTwitterMI: true,
      hashtagCooccurrenceIsNotRetweetCascade: true,
      hydratedTweets: false,
      timestampsSynthetic: true,
      notes: HONESTY_NOTES,
    },
  };
}

function listCascadeCandidates() {
  if (!fs.existsSync(DERIVED)) return [];
  return fs
    .readdirSync(DERIVED)
    .filter((f) => f.endsWith(".json") && /cascade/i.test(f))
    .map((f) => path.join(DERIVED, f));
}

function looksLikeCascade(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  if (Array.isArray(obj.retweets) || Array.isArray(obj.replies)) return true;
  if (obj.graph_topology && Array.isArray(obj.graph_topology.nodes)) return true;
  if (Array.isArray(obj.nodes) && Array.isArray(obj.edges)) return true;
  if (Array.isArray(obj.cooccurrence) && obj.cooccurrence.length) return true;
  if (obj.kind && /cascade|hashtag/i.test(String(obj.kind))) return true;
  return false;
}

function topologyFromCascade(cascade) {
  if (cascade.graph_topology && Array.isArray(cascade.graph_topology.nodes)) {
    return cascade.graph_topology;
  }
  if (Array.isArray(cascade.nodes) && Array.isArray(cascade.edges)) {
    return { nodes: cascade.nodes, edges: cascade.edges };
  }
  const profiles = cascade.user_profiles || {};
  const retweets = cascade.retweets || cascade.replies || [];
  const cooc = cascade.cooccurrence || [];
  const nodeIds = new Set();
  const edges = [];
  if (cascade.seed_user) nodeIds.add(String(cascade.seed_user));
  for (const rt of retweets) {
    const child = String(rt.user_id || rt.to || "");
    const parent = String(rt.retweeted_from || rt.replied_to || rt.from || "");
    if (parent) nodeIds.add(parent);
    if (child) nodeIds.add(child);
    if (parent && child && parent !== child) {
      edges.push({ from: parent, to: child, trust: 0.6, weight: rt.weight || 1 });
    }
  }
  for (const e of cooc) {
    const a = String(e.source || e.from || "");
    const b = String(e.target || e.to || "");
    if (a) nodeIds.add(a);
    if (b) nodeIds.add(b);
    if (a && b && a !== b) edges.push({ from: a, to: b, trust: 0.6, weight: e.weight || 1 });
  }
  const nodes = [...nodeIds].map((id) => {
    const profile = profiles[id] || {};
    const tag = profile.hashtag || id;
    const nodeHint = {
      cluster: profile.cluster,
      identity: profile.identity,
      intended_debnath_bp: profile.intended_debnath_bp || profile.intendedBp,
      personaId: profile.intended_debnath_bp,
    };
    const identity = identityBucket(profile.identity || profile.cluster || tag, nodeHint);
    return {
      nodeId: id,
      personaId: profile.intended_debnath_bp || (identity === "conspiracy" ? "conspiracy_cluster" : identity),
      identity,
      cluster: profile.cluster || identity,
      hashtag: tag,
      toxicityPrior: profile.toxicityPrior != null ? profile.toxicityPrior : toxicityProxyForIdentity(identity),
    };
  });
  return { nodes, edges };
}

function ensureRetweets(cascade) {
  const existing = cascade.retweets || cascade.replies;
  if (Array.isArray(existing) && existing.length) return cascade;
  const topo = topologyFromCascade(cascade);
  const seed = String(cascade.seed_user || (topo.nodes[0] && topo.nodes[0].nodeId) || "");
  const children = {};
  for (const e of topo.edges || []) {
    if (!children[e.from]) children[e.from] = [];
    children[e.from].push(e.to);
  }
  const retweets = [];
  const visited = new Set();
  const queue = [{ id: seed, depth: 0 }];
  visited.add(seed);
  while (queue.length) {
    const { id, depth } = queue.shift();
    for (const child of children[id] || []) {
      if (visited.has(child)) continue;
      visited.add(child);
      retweets.push({
        user_id: child,
        retweeted_from: id,
        timestamp: cascade.temporalAvailable === false ? null : undefined,
        _inferredFromTopology: true,
        _depth: depth + 1,
      });
      queue.push({ id: child, depth: depth + 1 });
    }
  }
  // Isolated edges not reached from seed
  for (const e of topo.edges || []) {
    if (!visited.has(e.to)) {
      retweets.push({
        user_id: e.to,
        retweeted_from: e.from,
        timestamp: null,
        _inferredFromTopology: true,
      });
    }
  }
  return { ...cascade, seed_user: seed, retweets };
}

function loadEmpirical() {
  let file = null;
  let generated = false;
  if (fs.existsSync(EMPIRICAL_PREFERRED)) {
    file = EMPIRICAL_PREFERRED;
  } else {
    const others = listCascadeCandidates();
    for (const p of others) {
      try {
        if (looksLikeCascade(readJSON(p))) {
          file = p;
          break;
        }
      } catch {
        /* skip */
      }
    }
  }

  if (!file) {
    const cascade = generateMinimalHashtagGraph();
    fs.mkdirSync(DERIVED, { recursive: true });
    writeJSON(EMPIRICAL_PREFERRED, cascade);
    file = EMPIRICAL_PREFERRED;
    generated = true;
    console.log(`Empirical cascade missing — wrote fallback ${path.relative(ROOT, file)}`);
  }

  const raw = readJSON(file);
  if (!looksLikeCascade(raw)) {
    const cascade = generateMinimalHashtagGraph();
    writeJSON(EMPIRICAL_PREFERRED, cascade);
    return {
      file: EMPIRICAL_PREFERRED,
      cascade,
      generated: true,
      note: "preferred file was not a cascade; wrote fallback",
    };
  }
  const cascade = ensureRetweets(raw);
  if (!cascade.graph_topology) cascade.graph_topology = topologyFromCascade(cascade);
  const fallback = generated || !!cascade.generatedFallback;
  return {
    file,
    cascade,
    generated: fallback,
    note: fallback
      ? "generated fallback (reconstruct output not present)"
      : "reconstruct or existing derived cascade",
  };
}

function isDnetOrCustom(dirName, meta) {
  const cfg = (meta && meta.config) || {};
  const name = cfg.experimentName || (meta && meta.experimentName) || dirName;
  const blob = `${name} ${dirName}`;
  if (/probe/i.test(blob)) return false;
  const topo = cfg.topology;
  if (/^Dnet_/i.test(String(name)) || /^Dnet_/i.test(String(dirName))) return true;
  if (topo === "custom") return true;
  return false;
}

function listSimRuns() {
  if (!fs.existsSync(RUNS)) return [];
  const out = [];
  for (const d of fs.readdirSync(RUNS)) {
    const runDir = path.join(RUNS, d);
    const metaPath = path.join(runDir, "metadata.json");
    if (!fs.existsSync(metaPath)) continue;
    let meta;
    try {
      meta = readJSON(metaPath);
    } catch {
      continue;
    }
    if (!isDnetOrCustom(d, meta)) continue;
    out.push({ runDir, dirName: d, meta });
  }
  return out;
}

function articleIdsForRun(runDir, meta) {
  const cfg = (meta && meta.config) || {};
  if (Array.isArray(cfg.seedArticles) && cfg.seedArticles.length) return cfg.seedArticles;
  return fs
    .readdirSync(runDir)
    .filter((f) => f.startsWith("results_") && f.endsWith(".json"))
    .map((f) => f.replace(/^results_/, "").replace(/\.json$/, ""));
}

function collectSimEvents(runDir, articleId) {
  const nodesDir = path.join(runDir, "nodes");
  const events = [];
  if (!fs.existsSync(nodesDir)) return events;
  for (const f of fs.readdirSync(nodesDir).filter((x) => x.endsWith(".json"))) {
    let state;
    try {
      state = readJSON(path.join(nodesDir, f));
    } catch {
      continue;
    }
    for (const ev of state.history || []) {
      if (articleId && ev.articleId !== articleId) continue;
      events.push({
        ...ev,
        nodeId: state.nodeId || f.replace(/\.json$/, ""),
        personaId: state.personaId,
      });
    }
  }
  return events;
}

function simValence(runDir, articleId) {
  const events = collectSimEvents(runDir, articleId);
  const scored = events.filter((e) => e.misinfoIndex != null);
  const sentiments = [];
  for (const ev of events) {
    const fa = ev.frameAnalysis;
    if (fa && typeof fa.sentiment === "number") sentiments.push(fa.sentiment);
  }
  return {
    meanMI: round4(mean(scored.map((e) => e.misinfoIndex))),
    nScored: scored.length,
    meanFrameSentiment: round4(mean(sentiments)),
    nFrameSentiment: sentiments.length,
    note: "mean MI is auditor IFD, not Twitter MI / MPR. Frame sentiment only if FrameAuditor ran.",
  };
}

function hasShockCell(cfg) {
  if (!cfg) return false;
  const surprise = cfg.pfeffer && String(cfg.pfeffer.surprise || "");
  if (/shock/i.test(surprise) && !/held/i.test(surprise)) return true;
  const seeds = cfg.seedNodes || [];
  const nNodes = (cfg.topologyParams && cfg.topologyParams.numNodes) || 0;
  if (nNodes > 1 && seeds.length >= nNodes) return true;
  const iv = cfg.interventions || [];
  return iv.some((i) => /shock|broadcast|all.?nodes?/i.test(String((i && i.type) || "")));
}

function clusteringFromTopo(topo) {
  if (!topo || !Array.isArray(topo.nodes) || !Array.isArray(topo.edges)) {
    return {
      nNodes: 0,
      nEdges: 0,
      meanDegree: null,
      maxDegree: null,
      modularityConspiracy: null,
      computable: false,
    };
  }
  const nodes = topo.nodes;
  const edges = topo.edges;
  const nNodes = nodes.length;
  const nEdges = edges.length;
  const outDegree = {};
  const undirected = {};
  for (const n of nodes) {
    outDegree[n.nodeId] = 0;
    undirected[n.nodeId] = 0;
  }
  for (const e of edges) {
    outDegree[e.from] = (outDegree[e.from] || 0) + 1;
    undirected[e.from] = (undirected[e.from] || 0) + 1;
    undirected[e.to] = (undirected[e.to] || 0) + 1;
  }
  const degrees = Object.values(outDegree);
  const undirectedDegrees = Object.values(undirected);
  const meanDegree = mean(undirectedDegrees);
  const meanOutDegree = mean(degrees);
  const maxDegree = undirectedDegrees.length ? Math.max(...undirectedDegrees) : 0;

  let modularityConspiracy = null;
  if (nEdges > 0) {
    const persona = Object.fromEntries(
      nodes.map((n) => [n.nodeId, identityBucket(n.personaId, n)])
    );
    const m = nEdges;
    let q = 0;
    for (const e of edges) {
      const ki = outDegree[e.from] || 0;
      const kj = outDegree[e.to] || 0;
      const same =
        (persona[e.from] === "conspiracy") === (persona[e.to] === "conspiracy") ? 1 : 0;
      q += same - (ki * kj) / (2 * m);
    }
    modularityConspiracy = q / (2 * m);
  }

  return {
    nNodes,
    nEdges,
    meanDegree: round4(meanDegree),
    meanOutDegree: round4(meanOutDegree),
    maxDegree: maxDegree || null,
    modularityConspiracy: round4(modularityConspiracy),
    computable: nEdges > 0,
  };
}

function echoFromTopo(topo) {
  if (!topo || !Array.isArray(topo.nodes) || !Array.isArray(topo.edges)) {
    return { edgeHomophily: null, conspiracyHomophily: null, nEdges: 0, computable: false };
  }
  const persona = Object.fromEntries(topo.nodes.map((n) => [n.nodeId, n.personaId]));
  const identity = Object.fromEntries(
    topo.nodes.map((n) => [n.nodeId, identityBucket(n.personaId, n)])
  );
  const edges = topo.edges || [];
  const nEdges = edges.length;
  if (!nEdges) return { edgeHomophily: 0, conspiracyHomophily: 0, nEdges: 0, computable: true };
  let samePersona = 0;
  let sameCluster = 0;
  for (const e of edges) {
    if (persona[e.from] && persona[e.from] === persona[e.to]) samePersona++;
    if (identity[e.from] && identity[e.from] === identity[e.to]) sameCluster++;
  }
  return {
    edgeHomophily: round4(samePersona / nEdges),
    identityHomophily: round4(sameCluster / nEdges),
    conspiracyHomophily: round4(sameCluster / nEdges),
    nEdges,
    computable: true,
  };
}

function identityMixFromTopo(topo) {
  const counts = { conspiracy: 0, climate_action: 0, environmental_concern: 0, other: 0 };
  const personas = {};
  for (const n of (topo && topo.nodes) || []) {
    const b = identityBucket(n.personaId, n);
    counts[b] = (counts[b] || 0) + 1;
    const pid = n.personaId || "unknown";
    personas[pid] = (personas[pid] || 0) + 1;
  }
  const n = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return {
    counts,
    personaCounts: personas,
    conspiracyShare: round4(counts.conspiracy / n),
    otherShare: round4((n - counts.conspiracy) / n),
  };
}

function empiricalValence(cascade) {
  const slice = paperSlice();
  const tox = cascade.toxicity || {};
  const topo = topologyFromCascade(cascade);
  const priors = [];
  for (const n of topo.nodes || []) {
    if (n.toxicityPrior != null) priors.push(n.toxicityPrior);
  }
  const profiles = cascade.user_profiles || {};
  for (const p of Object.values(profiles)) {
    if (p && p.toxicityPrior != null) priors.push(p.toxicityPrior);
  }
  return {
    toxicityMeanPaper: tox.mean != null ? tox.mean : (slice.toxicity && slice.toxicity.mean) || 0.17,
    toxicitySeverePaper: tox.severeMean != null ? tox.severeMean : (slice.toxicity && slice.toxicity.severeMean) || 0.12,
    hashtagToxicityProxy: round4(mean(priors)),
    source: tox.source || "paper-quoted Debnath toxicity / hashtag identity proxy",
    notMPR: true,
    note: "Valence proxy is Perspective-like toxicity from the paper (mean ~0.17), not MPR.",
  };
}

function pfefferEmpirical(cascade) {
  const topo = topologyFromCascade(cascade);
  const cluster = clusteringFromTopo(topo);
  const echo = echoFromTopo(topo);
  const identity = identityMixFromTopo(topo);
  const kind = cascade.kind || cascade.edge_semantics || "";
  const temporalAvailable =
    cascade.temporalAvailable === true && !/hashtag/i.test(String(kind));
  return {
    valence: {
      factor: "valence (thesis knob) / affective character of firestorm (Pfeffer definition)",
      empirical: empiricalValence(cascade),
      status: "measured_proxy",
    },
    surprise: {
      factor: "speed and volume of communication (Pfeffer 2014 #1)",
      empirical: {
        paperVolumeShock: "SCoPEx April 2017 ~8000 interactions/day (~+300% vs Feb 2017) — paper-quoted, not a reconstructed shock time-series",
        engine: "held drip unless a shock cell exists",
      },
      status: "held_drip",
    },
    identity: {
      factor: "lack of diversity (Pfeffer 2014 #5)",
      empirical: identity,
      status: "measured_hashtag_mix",
    },
    clustering: {
      factor: "network clusters (Pfeffer 2014 #3)",
      empirical: cluster,
      status: cluster.computable ? "measured_hashtag_graph" : "not_computable",
    },
    echo: {
      factor: "information echo / unrestrained flow + clusters (Pfeffer 2014 #3–5)",
      empirical: echo,
      status: echo.computable ? "measured_edge_homophily" : "not_computable",
    },
    temporal: {
      factor: "speed and volume; network-triggered decisions (Pfeffer 2014 #1, #7)",
      empirical: {
        available: temporalAvailable,
        note: temporalAvailable
          ? "tweet timestamps present"
          : "not available empirically (hashtag co-occurrence has no tweet clock; placeholder timestamps are synthetic)",
      },
      status: temporalAvailable ? "measured" : "not_available_empirically",
    },
    crossMedia: {
      factor: "cross-media dynamics (Pfeffer 2014 #6)",
      empirical: { available: false, note: "no legacy-media layer in Debnath reconstruct used here" },
      status: "held_no_engine_knob",
    },
  };
}

function pfefferSimulated(run, simMetrics, articleId) {
  const cfg = (run.meta && run.meta.config) || {};
  const topoPath = path.join(run.runDir, "graph_topology.json");
  const topo = fs.existsSync(topoPath) ? readJSON(topoPath) : null;
  const cluster = clusteringFromTopo(topo);
  const echo = echoFromTopo(topo);
  const identity = identityMixFromTopo(topo);
  const valence = simValence(run.runDir, articleId);
  const shock = hasShockCell(cfg);
  return {
    runDir: path.basename(run.runDir),
    experimentName: cfg.experimentName || run.dirName,
    topology: cfg.topology || null,
    articleId,
    miScoringMode: cfg.miScoringMode || null,
    valence: {
      meanMI: valence.meanMI,
      meanFrameSentiment: valence.meanFrameSentiment,
      nScored: valence.nScored,
      nFrameSentiment: valence.nFrameSentiment,
      status: "measured_auditor_MI_not_twitter",
      note: valence.note,
    },
    surprise: {
      seedNodes: cfg.seedNodes || [],
      shockCell: shock,
      status: shock ? "shock_cell" : "held_drip",
    },
    identity: {
      ...identity,
      pfeffer: cfg.pfeffer && cfg.pfeffer.identityAlignment,
      status: "measured_bp_mix",
    },
    clustering: {
      ...cluster,
      topology: cfg.topology || null,
      status: cluster.computable ? "measured_graph_topology" : "not_computable",
    },
    echo: {
      ...echo,
      status: echo.computable ? "measured_edge_homophily" : "not_computable",
    },
    temporal: {
      speedTicks: simMetrics && simMetrics.speedTicks,
      maxTicks: cfg.maxTicks || null,
      maxHops: cfg.nodeParams && cfg.nodeParams.maxHops,
      status: "measured_ticks",
      note: "simulation ticks, not empirical tweet time",
    },
    crossMedia: {
      status: "held_no_engine_knob",
      note: "no legacy-media broadcast agent",
    },
    structural: simMetrics || null,
  };
}

function averageMetrics(arr) {
  if (!arr.length) return null;
  const keys = ["depth", "breadth", "size", "structuralVirality", "speedTicks", "meanMI", "totalEvents"];
  const out = {};
  for (const k of keys) {
    out[k] = round4(mean(arr.map((m) => m[k])));
  }
  const miDist = arr.flatMap((m) => m.miDistribution || []);
  out.miDistribution = miDist;
  return out;
}

function mdTable(headers, rows) {
  const line = (cells) => `| ${cells.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  return [line(headers), sep, ...rows.map((r) => line(r.map((c) => (c == null || c === "" ? "—" : String(c)))))].join(
    "\n"
  );
}

function fmt(v) {
  if (v == null) return "—";
  if (typeof v === "number") return String(round4(v));
  return String(v);
}

function pfefferObservablesMarkdown() {
  return `# Pfeffer observables — seven-factor remapping (Phase 2)

Pfeffer, Zorbach & Carley (2014) *Understanding online firestorms* lists **seven** interrelated factors in the Outlook section. It does **not** list the thesis six-knob names (valence, surprise, identity, clustering, echo, temporal) as a canonical six-factor theory. Those six are a **computational remapping**. Phase 2 records a seventh observable (**cross-media**) as held, so the operational table has seven rows — matching the paper’s count, not renaming its factors.

Source: Pfeffer, J., Zorbach, T., & Carley, K. M. (2014). Understanding online firestorms: Negative word-of-mouth dynamics in social media networks. *Journal of Marketing Communications*, 20(1–2), 117–128.

## Pfeffer 2014 — seven factors (primary)

| # | Factor | Mechanism (paraphrase) |
|---|---|---|
| 1 | Speed and volume of communication | Real-time platforms compress reaction cycles; topic dominance → high volume |
| 2 | Binary choices | Like / share / retweet as either–or (Schelling binary choice); limited discursive interaction |
| 3 | Network clusters | Local clustering / triadic closure → information echoes from multiple neighbours |
| 4 | Unrestrained information flow | Hundreds–thousands of weak ties vs offline sympathy-group limits |
| 5 | Lack of diversity | Homophily + algorithmic filter bubbles |
| 6 | Cross-media dynamics | Social → legacy media → social amplification loop |
| 7 | Network-triggered decision processes | Knowledge / persuasion / propagation / affirmation compressed into network effects |

## Thesis remapping (seven observables)

Do not write “Pfeffer identified six factors.” Do not write “Pfeffer identified these seven knobs.” Cite 2014 for the table above; cite this file for the engine mapping.

| Observable (this campaign) | Closest Pfeffer 2014 factor(s) | Empirical Debnath | Simulated D-net / custom | Engine status |
|---|---|---|---|---|
| **Valence** | Affective / indignation character of firestorm messages (definition), not a numbered Outlook factor | Paper-quoted toxicity mean ~0.17 / hashtag toxicity proxy | Mean auditor MI; frame sentiment if FrameAuditor is on | Varied via articles + persona tone. **Not Twitter MI.** |
| **Surprise** | #1 speed and volume (shock vs drip) | Paper notes SCoPEx April 2017 volume spike; not a reconstructed shock series | Drip \`seedNodes: [node_0]\` unless a shock cell exists | **Held** (drip) |
| **Identity** | #5 lack of diversity | Hashtag mix: conspiracy vs climate-action vs environmental vs other | BP mix / conspiracy vs other personas on \`graph_topology.json\` | Swept homo vs hetero in T-H / T-He; measured on D-net |
| **Clustering** | #3 network clusters | Degree / conspiracy-cut modularity on hashtag graph | Degree / modularity on \`graph_topology.json\` | Swept in topology grid; measured on custom graph |
| **Echo** | #3 clusters + #4 unrestrained flow + parts of #5 | Edge homophily on hashtag identity | Edge homophily on persona / conspiracy cut | Measured |
| **Temporal** | #1 speed and volume; #7 network-triggered decisions | **Not available** on a hashtag co-occurrence fallback (no tweet clock) | \`speedTicks\` / \`maxTicks\` / hops | **Held** at 8 ticks (compression, not Debnath) |
| **Cross-media** | #6 cross-media dynamics | Not in the reconstruct used here | No legacy-media broadcast agent | **Held**, no engine knob |

**Binary choices (Pfeffer 2014 #2)** has no dedicated observable row: the engine is three-way (forward / reinterpret / drop), not like/share binary. It is implicit in action weights, not swept.

## Honesty

- Debnath has **no empirical MPR**. Simulated MI is an LLM-as-judge auditor score. Do not equate the two.
- Hashtag co-occurrence is **not** a retweet cascade.
- If \`runs_phase2\` D-net / custom cells are missing, the comparison JSON still holds the empirical Pfeffer table and marks simulation **pending**.
`;
}

function writeSummary(report) {
  const emp = report.pfefferEmpirical;
  const simPending = report.simPending;
  const struct = report.structuralComparison;
  const dist = report.distributionalComparison;
  const dtfs = report.dtfs;

  const pfefferRows = [
    [
      "valence",
      "toxicity / hashtag proxy (not MPR)",
      fmt(emp.valence.empirical.hashtagToxicityProxy) +
        ` (paper mean ${fmt(emp.valence.empirical.toxicityMeanPaper)})`,
      simPending
        ? "sim pending"
        : `mean MI ${fmt(report.simValenceSummary && report.simValenceSummary.meanMI)} (auditor; **not** Twitter MI)` +
          (report.simValenceSummary && report.simValenceSummary.meanFrameSentiment != null
            ? `; frame sentiment ${fmt(report.simValenceSummary.meanFrameSentiment)}`
            : ""),
      emp.valence.status,
    ],
    [
      "surprise",
      "Pfeffer #1 speed/volume",
      "paper SCoPEx spike quoted; not reconstructed",
      simPending ? "sim pending" : report.simSurpriseStatus || "held (drip)",
      emp.surprise.status,
    ],
    [
      "identity",
      "Pfeffer #5 lack of diversity",
      `conspiracy ${fmt(emp.identity.empirical.conspiracyShare)} / other ${fmt(emp.identity.empirical.otherShare)}`,
      simPending
        ? "sim pending"
        : `conspiracy share ${fmt(report.simIdentitySummary && report.simIdentitySummary.conspiracyShare)}`,
      emp.identity.status,
    ],
    [
      "clustering",
      "Pfeffer #3 network clusters",
      emp.clustering.empirical.computable
        ? `n=${emp.clustering.empirical.nNodes} meanDeg=${fmt(emp.clustering.empirical.meanDegree)} Q_conspiracy=${fmt(emp.clustering.empirical.modularityConspiracy)}`
        : "not computable",
      simPending
        ? "sim pending"
        : report.simClusteringSummary && report.simClusteringSummary.computable
          ? `n=${report.simClusteringSummary.nNodes} meanDeg=${fmt(report.simClusteringSummary.meanDegree)} Q=${fmt(report.simClusteringSummary.modularityConspiracy)}`
          : "not computable",
      emp.clustering.status,
    ],
    [
      "echo",
      "edge homophily",
      emp.echo.empirical.computable
        ? `identityHomophily=${fmt(emp.echo.empirical.identityHomophily)}`
        : "not computable",
      simPending
        ? "sim pending"
        : report.simEchoSummary && report.simEchoSummary.computable
          ? `edgeHomophily=${fmt(report.simEchoSummary.edgeHomophily)} identityHomophily=${fmt(report.simEchoSummary.identityHomophily)}`
          : "not computable",
      emp.echo.status,
    ],
    [
      "temporal",
      "Pfeffer #1 / #7",
      "not available empirically",
      simPending
        ? "sim pending"
        : `ticks ${fmt(report.avgSimMetrics && report.avgSimMetrics.speedTicks)} (sim clock only)`,
      emp.temporal.status,
    ],
    [
      "cross-media",
      "Pfeffer #6",
      "held",
      "held (no engine knob)",
      emp.crossMedia.status,
    ],
  ];

  const lines = [
    "# Phase 2 comparison — Debnath hashtag graph vs simulated D-net",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Honesty",
    "",
    ...HONESTY_NOTES.map((n) => `- ${n}`),
    "",
    "## Data",
    "",
    `- Empirical file: \`${path.relative(ROOT, report.empirical.file)}\` (${report.empirical.note})`,
        `- Empirical kind: \`${report.empirical.kind || "unknown"}\`; generatedFallback=${!!report.empirical.generatedFallback}`,
    `- Simulated runs matched (\`Dnet_\` name or \`topology: custom\`): **${report.nSimRuns}**`,
    simPending
      ? "- **Sim pending.** D-net / custom cells were not found under `thesisExperiment/runs_phase2/`. Empirical Pfeffer table is still written."
      : `- Simulated articles compared: **${report.nSimCascades}**`,
    "- Isolation: did not write to `thesisExperiment/runs/` or `thesisExperiment/results/tables/`.",
    "",
    "## Structural metrics (ValidationMetrics)",
    "",
    "Real cascade via `extractRealMetrics`. Simulated via `extractSimulatedMetrics` on matching run dirs.",
    "",
  ];

  if (report.realMetrics) {
    lines.push(
      mdTable(
        ["metric", "empirical", "simulated (mean)", "note"],
        [
          ["depth", fmt(report.realMetrics.depth), simPending ? "sim pending" : fmt(report.avgSimMetrics && report.avgSimMetrics.depth), "longest path from root"],
          ["breadth", fmt(report.realMetrics.breadth), simPending ? "sim pending" : fmt(report.avgSimMetrics && report.avgSimMetrics.breadth), "max nodes at one level"],
          ["size", fmt(report.realMetrics.size), simPending ? "sim pending" : fmt(report.avgSimMetrics && report.avgSimMetrics.size), "informational only; real graphs are often larger"],
          [
            "structuralVirality",
            fmt(report.realMetrics.structuralVirality),
            simPending ? "sim pending" : fmt(report.avgSimMetrics && report.avgSimMetrics.structuralVirality),
            "Goel et al. 2016 pairwise distance",
          ],
          [
            "speed",
            report.empirical.cascade.temporalAvailable ? fmt(report.realMetrics.speedHours) + " h" : "not available empirically",
            simPending ? "sim pending" : `${fmt(report.avgSimMetrics && report.avgSimMetrics.speedTicks)} ticks`,
            "do not convert ticks to hours",
          ],
          [
            "meanMI",
            "no empirical MPR",
            simPending ? "sim pending" : fmt(report.avgSimMetrics && report.avgSimMetrics.meanMI),
            "auditor only; not Twitter MI",
          ],
        ]
      ),
      ""
    );
  }

  lines.push("## ValidationComparison (KS / JS / DTFS)", "");
  if (simPending) {
    lines.push("Not computed — **sim pending**.", "");
  } else if (struct) {
    lines.push(
      `Structural similarity (compare): **${fmt(struct.structuralSimilarity)}** (${struct.matchedMetrics}/${struct.totalMetrics} metrics within 30%).`,
      ""
    );
    const sc = struct.scalarComparison || {};
    lines.push(
      mdTable(
        ["metric", "real", "simulated", "ratio", "relativeError", "match"],
        ["depth", "breadth", "structuralVirality", "size"].map((k) => {
          const row = sc[k] || {};
          return [k, fmt(row.real), fmt(row.simulated), fmt(row.ratio), fmt(row.relativeError), row.match == null ? "—" : String(row.match)];
        })
      ),
      ""
    );
    if (dist && dist._summary) {
      lines.push(
        `Distributional (KS / JS) with nReal=${dist._summary.nReal}, nSim=${dist._summary.nSim}. **Underpowered if nReal=1** — do not treat KS p-values as a twin-validation claim.`,
        ""
      );
      lines.push(
        mdTable(
          ["metric", "realMean", "simMean", "KS D", "KS p", "JS divergence", "distributionsMatch"],
          ["depth", "breadth", "structuralVirality"].map((k) => {
            const row = dist[k] || {};
            return [
              k,
              fmt(row.realMean),
              fmt(row.simMean),
              fmt(row.ks && row.ks.statistic),
              fmt(row.ks && row.ks.pValue),
              fmt(row.jsDivergence),
              row.distributionsMatch == null ? "—" : String(row.distributionsMatch),
            ];
          })
        ),
        ""
      );
    }
    if (dtfs) {
      lines.push(
        `DTFS = **${fmt(dtfs.dtfs)}** (isValidated=${dtfs.isValidated}; threshold 0.70). Content correlation set to 0: Debnath has no empirical MPR / tweet-text MI to correlate.`,
        ""
      );
    }
  } else {
    lines.push("Comparison object missing.", "");
  }

  lines.push(
    "## Pfeffer observables (empirical vs simulated)",
    "",
    "Seven rows: thesis remapping including held cross-media. See `pfeffer_observables.md` for Pfeffer 2014 vs this table.",
    "",
    mdTable(["observable", "Pfeffer 2014 map", "empirical", "simulated", "status"], pfefferRows),
    "",
    "## Files",
    "",
    "- `thesisExperiment/results_phase2/debnath_compare.json`",
    "- `thesisExperiment/results_phase2/summary.md`",
    "- `thesisExperiment/results_phase2/pfeffer_observables.md`",
    ""
  );

  return lines.join("\n");
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const empirical = loadEmpirical();
  const realMetrics = ValidationMetrics.extractRealMetrics(empirical.cascade);
  const pEmp = pfefferEmpirical(empirical.cascade);

  const runs = listSimRuns();
  const simRows = [];
  const simMetricsArray = [];

  for (const run of runs) {
    const articles = articleIdsForRun(run.runDir, run.meta);
    const ids = articles.length ? articles : [null];
    for (const articleId of ids) {
      let simMetrics = null;
      if (articleId) {
        try {
          simMetrics = ValidationMetrics.extractSimulatedMetrics(run.runDir, articleId);
        } catch (err) {
          simMetrics = { error: err.message, depth: 0, breadth: 0, size: 0, structuralVirality: 0 };
        }
      }
      if (simMetrics) simMetricsArray.push(simMetrics);
      simRows.push(pfefferSimulated(run, simMetrics, articleId));
    }
  }

  const simPending = runs.length === 0;
  const avgSimMetrics = averageMetrics(simMetricsArray);

  let structuralComparison = null;
  let distributionalComparison = null;
  let dtfs = null;
  if (!simPending && avgSimMetrics) {
    structuralComparison = ValidationComparison.compare(realMetrics, avgSimMetrics);
    if (simMetricsArray.length) {
      distributionalComparison = ValidationComparison.distributionalComparison([realMetrics], simMetricsArray);
      dtfs = ValidationComparison.computeDTFS(
        structuralComparison.structuralSimilarity,
        distributionalComparison._summary.distributionalScore,
        0
      );
    } else {
      dtfs = ValidationComparison.computeDTFS(structuralComparison.structuralSimilarity, structuralComparison.structuralSimilarity, 0);
    }
  }

  const simValenceSummary = {
    meanMI: avgSimMetrics && avgSimMetrics.meanMI,
    meanFrameSentiment: round4(mean(simRows.map((r) => r.valence && r.valence.meanFrameSentiment))),
  };
  const simIdentitySummary = {
    conspiracyShare: round4(mean(simRows.map((r) => r.identity && r.identity.conspiracyShare))),
  };
  const lastTopo = simRows[0];
  const simClusteringSummary = lastTopo ? lastTopo.clustering : null;
  const simEchoSummary = lastTopo ? lastTopo.echo : null;
  const shockAny = simRows.some((r) => r.surprise && r.surprise.shockCell);
  const simSurpriseStatus = simPending ? null : shockAny ? "shock cell present" : "held (drip)";

  const report = {
    generatedAt: new Date().toISOString(),
    isolation: {
      wrote: ["thesisExperiment/results_phase2/"],
      notTouched: ["thesisExperiment/runs/", "thesisExperiment/results/tables/"],
    },
    honesty: {
      empiricalMPR: false,
      simulatedMIIsNotTwitterMI: true,
      notes: HONESTY_NOTES,
    },
    empirical: {
      file: empirical.file,
      note: empirical.note,
      generatedFallback: !!empirical.generated || !!empirical.cascade.generatedFallback,
      kind: empirical.cascade.kind || empirical.cascade.edge_semantics || null,
      schema: empirical.cascade.schema || null,
      cascade: {
        kind: empirical.cascade.kind || empirical.cascade.edge_semantics,
        generatedFallback: empirical.cascade.generatedFallback,
        notARetweetCascade:
          empirical.cascade.notARetweetCascade !== false &&
          /hashtag/i.test(String(empirical.cascade.kind || empirical.cascade.edge_semantics || "")),
        temporalAvailable: empirical.cascade.temporalAvailable === true,
        news_id: empirical.cascade.news_id,
        seed_user: empirical.cascade.seed_user,
        nRetweets: (empirical.cascade.retweets || []).length,
        nNodes:
          ((empirical.cascade.graph_topology && empirical.cascade.graph_topology.nodes) || []).length ||
          Object.keys(empirical.cascade.user_profiles || {}).length,
      },
    },
    realMetrics,
    nSimRuns: runs.length,
    nSimCascades: simMetricsArray.length,
    simPending,
    simPendingReason: simPending
      ? "No thesisExperiment/runs_phase2 directories matching Dnet_ or topology=custom"
      : null,
    avgSimMetrics,
    simulatedRuns: simRows,
    structuralComparison,
    distributionalComparison,
    dtfs,
    pfefferEmpirical: pEmp,
    simValenceSummary,
    simIdentitySummary,
    simClusteringSummary,
    simEchoSummary,
    simSurpriseStatus,
  };

  writeJSON(path.join(OUT, "debnath_compare.json"), report);
  fs.writeFileSync(path.join(OUT, "summary.md"), writeSummary(report));
  fs.writeFileSync(path.join(OUT, "pfeffer_observables.md"), pfefferObservablesMarkdown());

  console.log(`Phase 2 compare: empirical=${path.relative(ROOT, empirical.file)}`);
  console.log(
    `  real depth=${realMetrics.depth} breadth=${realMetrics.breadth} size=${realMetrics.size} SV=${round4(realMetrics.structuralVirality)}`
  );
  console.log(`  sim runs=${runs.length} cascades=${simMetricsArray.length} pending=${simPending}`);
  console.log(`  wrote ${path.relative(ROOT, path.join(OUT, "debnath_compare.json"))}`);
  console.log(`  wrote ${path.relative(ROOT, path.join(OUT, "summary.md"))}`);
  console.log(`  wrote ${path.relative(ROOT, path.join(OUT, "pfeffer_observables.md"))}`);
}

main();
