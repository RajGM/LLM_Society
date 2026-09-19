#!/usr/bin/env node
/**
 * Pfeffer observables on empirical Debnath hashtag STRUCTURE vs existing Dnet sims.
 * No LLM calls. Does not invent tweet MI/MPR. Writes analysis_full/ artefacts only.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const CASCADE = path.join(EXP, "data", "derived", "debnath_hashtag_cascade.json");
const MIXED_CFG = path.join(EXP, "configs", "phase2", "Dnet_c_He_mixed.json");
const HOMO_CFG = path.join(EXP, "configs", "phase2", "Dnet_c_H_conspiracy.json");
const RUNS = path.join(EXP, "runs_phase2");
const OUT_DIR = path.join(EXP, "analysis_full");
const PRIMARY = {
  Dnet_c_H_conspiracy: "Dnet_c_H_conspiracy_2026-09-19_02-49-31",
  Dnet_c_He_mixed: "Dnet_c_He_mixed_2026-09-19_04-05-50",
  Dnet_d_H_conspiracy: "Dnet_d_H_conspiracy_2026-09-19_02-49-31",
  Dnet_d_He_mixed: "Dnet_d_He_mixed_2026-09-19_04-07-40",
};

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function round4(x) {
  return x == null || Number.isNaN(x) ? null : Math.round(x * 10000) / 10000;
}
function mean(arr) {
  const a = arr.filter((x) => typeof x === "number" && !Number.isNaN(x));
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
}
function bpFamily(pid) {
  const s = String(pid || "");
  if (/conspiracy/.test(s)) return "conspiracy_cluster";
  if (/climate_action|climate_justice|mitigation_first/.test(s)) return "climate_action";
  if (/environmental|ozone|biodivers/.test(s)) return "environmental_concern";
  if (/climate_scientist|science_journalist/.test(s)) return "expert_added";
  return "other";
}
function identityFromCluster(cluster) {
  if (cluster === "chemtrails" || cluster === "piggyback") return "conspiracy";
  if (cluster === "climate_action" || cluster === "geo") return "climate_action";
  if (cluster === "environmental") return "environmental_concern";
  return "other";
}

function clusteringCoeffUndirected(nodes, edges) {
  const adj = {};
  for (const n of nodes) adj[n] = new Set();
  for (const e of edges) {
    if (!e.from || !e.to || e.from === e.to) continue;
    adj[e.from] = adj[e.from] || new Set();
    adj[e.to] = adj[e.to] || new Set();
    adj[e.from].add(e.to);
    adj[e.to].add(e.from);
  }
  let closed = 0;
  let wedges = 0;
  let localSum = 0;
  let localN = 0;
  for (const v of Object.keys(adj)) {
    const nbrs = [...adj[v]];
    const k = nbrs.length;
    if (k < 2) continue;
    wedges += (k * (k - 1)) / 2;
    let tri = 0;
    for (let i = 0; i < nbrs.length; i++) {
      for (let j = i + 1; j < nbrs.length; j++) {
        if (adj[nbrs[i]].has(nbrs[j])) tri++;
      }
    }
    closed += tri;
    localSum += (2 * tri) / (k * (k - 1));
    localN++;
  }
  return {
    globalTransitivity: round4(wedges ? closed / wedges : 0),
    meanLocalClustering: round4(localN ? localSum / localN : 0),
    nWedges: wedges,
    nClosedTriads: closed,
  };
}

function degreeStats(nodes, edges) {
  const undirected = {};
  const outDeg = {};
  for (const n of nodes) {
    undirected[n] = 0;
    outDeg[n] = 0;
  }
  for (const e of edges) {
    outDeg[e.from] = (outDeg[e.from] || 0) + 1;
    undirected[e.from] = (undirected[e.from] || 0) + 1;
    undirected[e.to] = (undirected[e.to] || 0) + 1;
  }
  const ud = Object.values(undirected);
  const od = Object.values(outDeg);
  const maxId = Object.keys(undirected).sort((a, b) => undirected[b] - undirected[a])[0];
  return {
    nNodes: nodes.length,
    nDirectedEdges: edges.length,
    nUndirectedPairs: ud.reduce((s, d) => s + d, 0) / 2,
    meanUndirectedDegree: round4(mean(ud)),
    meanOutDegree: round4(mean(od)),
    maxUndirectedDegree: Math.max(...ud),
    maxNode: maxId,
    hubShareOfStubs: round4(undirected[maxId] / ud.reduce((s, d) => s + d, 0)),
  };
}

function modularityConspiracy(nodes, edges, identityOf) {
  const outDegree = {};
  for (const n of nodes) outDegree[n] = 0;
  for (const e of edges) outDegree[e.from] = (outDegree[e.from] || 0) + 1;
  const m = edges.length;
  if (!m) return null;
  let q = 0;
  for (const e of edges) {
    const ki = outDegree[e.from] || 0;
    const kj = outDegree[e.to] || 0;
    const same = identityOf(e.from) === "conspiracy" && identityOf(e.to) === "conspiracy" ? 1
      : identityOf(e.from) !== "conspiracy" && identityOf(e.to) !== "conspiracy" ? 1
      : 0;
    q += same - (ki * kj) / (2 * m);
  }
  return round4(q / (2 * m));
}

function echoStats(edges, labelOf) {
  const n = edges.length;
  if (!n) return { nEdges: 0 };
  let same = 0;
  for (const e of edges) {
    if (labelOf(e.from) && labelOf(e.from) === labelOf(e.to)) same++;
  }
  return { nEdges: n, homophily: round4(same / n) };
}

function collectEvents(runDir, articleId) {
  const nodesDir = path.join(runDir, "nodes");
  const events = [];
  if (!fs.existsSync(nodesDir)) return events;
  for (const f of fs.readdirSync(nodesDir).filter((x) => x.endsWith(".json"))) {
    const state = readJSON(path.join(nodesDir, f));
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

function actionMix(events) {
  const counts = { forward: 0, reinterpret: 0, drop: 0, other: 0 };
  for (const ev of events) {
    const a = String(ev.action || ev.chosenAction || "").toLowerCase();
    if (a in counts) counts[a]++;
    else if (a) counts.other++;
  }
  const n = counts.forward + counts.reinterpret + counts.drop + counts.other;
  return {
    n,
    forwardShare: round4(n ? counts.forward / n : 0),
    reinterpretShare: round4(n ? counts.reinterpret / n : 0),
    dropShare: round4(n ? counts.drop / n : 0),
    ternaryNotBinary: true,
  };
}

function miSummary(events) {
  const scored = events.filter((e) => typeof e.misinfoIndex === "number");
  const ticks = {};
  for (const e of scored) {
    const t = e.tick != null ? e.tick : e.hop;
    if (t == null) continue;
    (ticks[t] = ticks[t] || []).push(e.misinfoIndex);
  }
  const tickMeans = Object.keys(ticks)
    .map(Number)
    .sort((a, b) => a - b)
    .map((t) => ({ tick: t, meanMI: round4(mean(ticks[t])), n: ticks[t].length }));
  let kStar = null;
  for (const row of tickMeans) {
    if (row.meanMI > 3) {
      const later = tickMeans.filter((r) => r.tick >= row.tick);
      if (later.every((r) => r.meanMI > 3)) {
        kStar = row.tick;
        break;
      }
    }
  }
  return {
    nScored: scored.length,
    meanMI: round4(mean(scored.map((e) => e.misinfoIndex))),
    tickMeans,
    kStar,
    note: "auditor IFD, not Twitter MI / MPR",
  };
}

function reach(events) {
  const reached = new Set();
  let maxTick = 0;
  for (const e of events) {
    if (e.action && e.action !== "drop") reached.add(e.nodeId);
    if (typeof e.tick === "number") maxTick = Math.max(maxTick, e.tick);
  }
  return { nReached: reached.size, maxTickObserved: maxTick };
}

// --- empirical ---
const cascade = readJSON(CASCADE);
const mixedCfg = readJSON(MIXED_CFG);
const homoCfg = readJSON(HOMO_CFG);

const mixedById = Object.fromEntries(mixedCfg.nodes.map((n) => [n.nodeId, n.personaId]));
const homoById = Object.fromEntries(homoCfg.nodes.map((n) => [n.nodeId, n.personaId]));

const profiles = cascade.user_profiles || {};
const mapping = Object.keys(profiles)
  .sort()
  .map((id) => {
    const p = profiles[id];
    const nodeId = id.startsWith("user_") ? id : `user_${id}`;
    return {
      empiricalId: id,
      simNodeId: nodeId,
      hashtag: p.hashtag,
      cluster: p.cluster,
      empiricalIdentity: p.identity || identityFromCluster(p.cluster),
      intendedBp: p.intended_debnath_bp,
      mixedPersonaId: mixedById[nodeId] || mixedById[id] || null,
      homoPersonaId: homoById[nodeId] || homoById[id] || null,
      mixedFamily: bpFamily(mixedById[nodeId] || mixedById[id]),
      intendedFamily: bpFamily(p.intended_debnath_bp),
      mappingMatch: (mixedById[nodeId] || mixedById[id]) === p.intended_debnath_bp,
    };
  });

const nodeIds = mapping.map((m) => m.empiricalId);
const edges = (cascade.retweets || []).map((rt) => ({
  from: String(rt.retweeted_from),
  to: String(rt.user_id),
}));
const identityOf = (id) => (profiles[id] && profiles[id].identity) || identityFromCluster(profiles[id] && profiles[id].cluster);
const intendedOf = (id) => profiles[id] && profiles[id].intended_debnath_bp;
const familyOf = (id) => bpFamily(intendedOf(id));

const uniqueUnd = new Set();
const uniqueAdj = {};
for (const e of edges) {
  if (!e.from || !e.to || e.from === e.to) continue;
  const key = e.from < e.to ? `${e.from}|${e.to}` : `${e.to}|${e.from}`;
  uniqueUnd.add(key);
  uniqueAdj[e.from] = uniqueAdj[e.from] || new Set();
  uniqueAdj[e.to] = uniqueAdj[e.to] || new Set();
  uniqueAdj[e.from].add(e.to);
  uniqueAdj[e.to].add(e.from);
}
const uniqueDegs = Object.values(uniqueAdj).map((s) => s.size);
const hubUnique = Object.keys(uniqueAdj).sort((a, b) => uniqueAdj[b].size - uniqueAdj[a].size)[0];

const empDeg = degreeStats(nodeIds, edges);
const empClust = clusteringCoeffUndirected(nodeIds, edges);
const empQ = modularityConspiracy(nodeIds, edges, identityOf);
const empEchoIdentity = echoStats(edges, identityOf);
const empEchoBp = echoStats(edges, intendedOf);
const empEchoFamily = echoStats(edges, familyOf);

const empMix = { conspiracy: 0, climate_action: 0, environmental_concern: 0, other: 0 };
const empPersona = {};
const empCluster = {};
for (const m of mapping) {
  empMix[m.empiricalIdentity] = (empMix[m.empiricalIdentity] || 0) + 1;
  empPersona[m.intendedBp] = (empPersona[m.intendedBp] || 0) + 1;
  empCluster[m.cluster] = (empCluster[m.cluster] || 0) + 1;
}

const mixedMix = { conspiracy_cluster: 0, climate_action: 0, environmental_concern: 0, expert_added: 0, other: 0 };
const mixedPersona = {};
for (const m of mapping) {
  mixedMix[m.mixedFamily] = (mixedMix[m.mixedFamily] || 0) + 1;
  mixedPersona[m.mixedPersonaId] = (mixedPersona[m.mixedPersonaId] || 0) + 1;
}

const mismatches = mapping.filter((m) => !m.mappingMatch);

function topoFromCfg(cfg, personaMap) {
  const nodes = cfg.nodes.map((n) => n.nodeId);
  const edgesCfg = cfg.edges.map((e) => ({ from: e.from, to: e.to }));
  const idOf = (nid) => {
    const pid = personaMap[nid];
    const fam = bpFamily(pid);
    if (fam === "conspiracy_cluster") return "conspiracy";
    if (fam === "climate_action") return "climate_action";
    if (fam === "environmental_concern") return "environmental_concern";
    return "other";
  };
  return {
    deg: degreeStats(nodes, edgesCfg),
    clust: clusteringCoeffUndirected(nodes, edgesCfg),
    Q: modularityConspiracy(nodes, edgesCfg, idOf),
    echoIdentity: echoStats(edgesCfg, idOf),
    echoPersona: echoStats(edgesCfg, (nid) => personaMap[nid]),
    echoFamily: echoStats(edgesCfg, (nid) => bpFamily(personaMap[nid])),
  };
}

const mixedTopo = topoFromCfg(mixedCfg, mixedById);
const homoTopo = topoFromCfg(homoCfg, homoById);

const simCells = [];
for (const [name, dir] of Object.entries(PRIMARY)) {
  const runDir = path.join(RUNS, dir);
  const meta = readJSON(path.join(runDir, "metadata.json"));
  const cfg = meta.config || {};
  const articles = cfg.seedArticles || [];
  const isHomo = /_H_/.test(name);
  const personaMap = isHomo ? homoById : mixedById;
  const topo = isHomo ? homoTopo : mixedTopo;
  for (const articleId of articles) {
    const events = collectEvents(runDir, articleId);
    const mi = miSummary(events);
    const actions = actionMix(events);
    const r = reach(events);
    simCells.push({
      cell: name,
      runDir: dir,
      mix: isHomo ? "homogeneous_conspiracy" : "heterogeneous_debnath_bps",
      miScoringMode: cfg.miScoringMode,
      articleId,
      nNodes: 63,
      nEdges: 228,
      seedNodes: cfg.seedNodes,
      surprise: "held_drip",
      identity: isHomo
        ? { conspiracyShare: 1, note: "all 63 nodes conspiracy_believer" }
        : {
            conspiracyShare: round4(mixedMix.conspiracy_cluster / 63),
            climateActionShare: round4(mixedMix.climate_action / 63),
            environmentalShare: round4(mixedMix.environmental_concern / 63),
            expertShare: round4(mixedMix.expert_added / 63),
            personaCounts: mixedPersona,
          },
      clustering: {
        meanUndirectedDegree: topo.deg.meanUndirectedDegree,
        maxUndirectedDegree: topo.deg.maxUndirectedDegree,
        globalTransitivity: topo.clust.globalTransitivity,
        meanLocalClustering: topo.clust.meanLocalClustering,
        modularityConspiracy: topo.Q,
      },
      echo: {
        identityHomophily: topo.echoIdentity.homophily,
        personaHomophily: topo.echoPersona.homophily,
        familyHomophily: topo.echoFamily.homophily,
      },
      valence: mi,
      temporal: {
        maxTicks: cfg.maxTicks,
        maxHops: cfg.nodeParams && cfg.nodeParams.maxHops,
        maxTickObserved: r.maxTickObserved,
        kStar: mi.kStar,
        nReached: r.nReached,
        note: "simulation ticks, not empirical tweet time",
      },
      binaryChoices: actions,
      nEvents: events.length,
    });
  }
}

const mismatchesByKind = mismatches.map((m) => ({
  node: m.simNodeId,
  hashtag: m.hashtag,
  cluster: m.cluster,
  intendedBp: m.intendedBp,
  mixedPersonaId: m.mixedPersonaId,
  reason:
    m.intendedBp === "biodiversity_food_security" && m.mixedPersonaId === "environmental_concern"
      ? "mixed Dnet collapses biodiversity/food-security tags onto environmental_concern (same Debnath type)"
      : m.intendedBp === "conspiracy_climate_piggyback" && m.mixedPersonaId === "conspiracy_believer"
        ? "mixed Dnet maps piggyback nodes to conspiracy_believer; intended reconstruct BP is conspiracy_climate_piggyback"
        : m.intendedBp === "conspiracy_depopulation" && m.mixedPersonaId === "conspiracy_believer"
          ? "mixed Dnet maps depopulation to conspiracy_believer; intended reconstruct BP is conspiracy_depopulation"
          : m.intendedBp === "mitigation_first_policy" && m.mixedPersonaId === "climate_action_advocate"
            ? "mixed Dnet maps #mitigation to climate_action_advocate; intended reconstruct BP is mitigation_first_policy (cluster still environmental)"
            : m.intendedBp === "climate_action_advocate" && m.mixedPersonaId === "climate_scientist"
              ? "mixed Dnet maps #ipcc to climate_scientist (expert overlay); intended reconstruct BP is climate_action_advocate with ipcc exception already climate_scientist — check"
              : "persona id differs; Debnath type may still match",
}));

const report = {
  generatedAt: new Date().toISOString(),
  newLlmRuns: false,
  graph: {
    file: "thesisExperiment/data/derived/debnath_hashtag_cascade.json",
    kind: "hashtag_cooccurrence",
    notARetweetCascade: true,
    nNodes: 63,
    nDirectedEdges: 228,
    nUniqueUndirectedEdges: uniqueUnd.size,
    temporalAvailable: false,
    empiricalMPR: false,
    vsT2: "Dnet 63-node custom graph is the larger empirical stand-in; T2 topologies are 8-node generators",
  },
  mapping: {
    source: "Dnet configs already assign personaId; reconstruct intended_debnath_bp on user_profiles",
    nMapped: mapping.length,
    nExactPersonaMatch: mapping.filter((m) => m.mappingMatch).length,
    nMismatch: mismatches.length,
    empiricalIdentityMix: empMix,
    empiricalIntendedPersonaCounts: empPersona,
    empiricalClusters: empCluster,
    mixedPersonaCounts: mixedPersona,
    mixedFamilyCounts: mixedMix,
    homo: "every node conspiracy_believer",
    mismatches: mismatchesByKind,
    rows: mapping,
  },
  empiricalPfeffer: {
    uniqueUndirectedEdges: uniqueUnd.size,
    meanUniqueDegree: round4(mean(uniqueDegs)),
    hubUniqueDegree: uniqueAdj[hubUnique] ? uniqueAdj[hubUnique].size : null,
    hubUniqueNode: hubUnique,
    valence: {
      toxicityMeanPaper: cascade.toxicity && cascade.toxicity.mean,
      toxicitySeverePaper: cascade.toxicity && cascade.toxicity.severeMean,
      hashtagToxicityProxy: round4(
        mean(Object.values(profiles).map((p) => p.toxicityPrior).filter((x) => typeof x === "number"))
      ),
      notMPR: true,
    },
    surprise: {
      paperQuoted: "SCoPEx April 2017 ~8000 interactions/day (~+300% vs Feb 2017)",
      reconstructedShockSeries: false,
      status: "paper_quoted_not_reconstructed",
    },
    identity: {
      counts: empMix,
      conspiracyShare: round4(empMix.conspiracy / 63),
      intendedPersonaCounts: empPersona,
    },
    clustering: {
      ...empDeg,
      ...empClust,
      modularityConspiracyCut: empQ,
    },
    echo: {
      identityHomophily: empEchoIdentity.homophily,
      intendedBpHomophily: empEchoBp.homophily,
      familyHomophily: empEchoFamily.homophily,
    },
    temporal: { available: false, reason: "hashtag co-occurrence has no tweet clock; timestamps synthetic" },
    crossMedia: { available: false, held: true },
    binaryChoices: { available: false, note: "no like/retweet actions on a hashtag graph" },
  },
  simulatedPfeffer: {
    cells: simCells,
    structureNote:
      "H and He share the same 63/228 custom topology; clustering coefficients are therefore identical. Homophily and Q differ because persona labels differ.",
  },
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "pfeffer_debnath_vs_sim.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  nMapped: mapping.length,
  nMatch: mapping.filter((m) => m.mappingMatch).length,
  nMismatch: mismatches.length,
  empMix,
  empPersona,
  mixedPersona,
  mixedMix,
  empDeg,
  empClust,
  empQ,
  empEchoIdentity,
  empEchoBp,
  empEchoFamily,
  mixedTopo: { Q: mixedTopo.Q, echoI: mixedTopo.echoIdentity, echoP: mixedTopo.echoPersona, echoF: mixedTopo.echoFamily, clust: mixedTopo.clust, deg: mixedTopo.deg },
  homoTopo: { Q: homoTopo.Q, echoI: homoTopo.echoIdentity, echoP: homoTopo.echoPersona, clust: homoTopo.clust },
  simCells: simCells.map((c) => ({
    cell: c.cell,
    article: c.articleId,
    meanMI: c.valence.meanMI,
    nScored: c.valence.nScored,
    kStar: c.valence.kStar,
    nReached: c.temporal.nReached,
    maxTick: c.temporal.maxTickObserved,
    actions: c.binaryChoices,
    Q: c.clustering.modularityConspiracy,
    echoI: c.echo.identityHomophily,
    echoP: c.echo.personaHomophily,
  })),
  mismatches: mismatchesByKind,
}, null, 2));
