#!/usr/bin/env node
/**
 * Merge campaign + discovery personas/articles and write isolated Phase 2 configs.
 * Does NOT overwrite thesisExperiment/configs/full or thesisExperiment/runs.
 *
 *   node thesisExperiment/scripts/build_phase2.js
 */
const fs = require("fs");
const path = require("path");

const EXP = path.join(__dirname, "..");
const ROOT = path.join(EXP, "..");

function writeJSON(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function uniqueWindow(ids, start, len) {
  const out = [];
  for (let i = 0; i < len; i++) out.push(ids[(start + i) % ids.length]);
  return out;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledUnique(ids, seed, len) {
  const rng = mulberry32(seed);
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, len);
}

function tagPersona(p, source) {
  return { ...p, source: p.source || source };
}

function tagArticle(a, source) {
  return { ...a, source: a.source || source };
}

const CORE_ARTICLES = [
  "scopex_2017",
  "chemtrails_gates_2018_2021",
  "sai_geoengineering",
  "paris_agreement",
  "climate_consensus",
  "polar_bears",
];

const HOMO_IDS = [
  "conspiracy_believer",
  "conspiracy_haarp_weather",
  "conspiracy_depopulation",
  "conspiracy_climate_piggyback",
  "climate_action_advocate",
  "climate_justice_youth",
  "mitigation_first_policy",
  "environmental_concern",
  "ozone_stratosphere_specialist",
  "biodiversity_food_security",
  "climate_scientist",
  "science_journalist",
];

const CHAIN_NODE_PARAMS = {
  trustThreshold: 0.08,
  actionWeights: { forward: 0.1, reinterpret: 0.85, drop: 0.05 },
  relationEvolution: true,
  trustDelta: 0.05,
  maxHops: 8,
  maxInboxSize: 4,
  activityPattern: "always",
};

const GRAPH_NODE_PARAMS = {
  trustThreshold: 0.15,
  actionWeights: { forward: 0.35, reinterpret: 0.5, drop: 0.15 },
  relationEvolution: true,
  trustDelta: 0.05,
  maxHops: 8,
  maxInboxSize: 4,
  activityPattern: "always",
};

const TOPOLOGIES = [
  { id: "linear_chain", params: { numNodes: 8 }, chain: true },
  { id: "ring", params: { numNodes: 8 }, chain: true },
  { id: "random_er", params: { numNodes: 8, edgeProbability: 0.42, minSeedOutDegree: 2 } },
  { id: "small_world", params: { numNodes: 8, k: 4, beta: 0.1 } },
  { id: "scale_free", params: { numNodes: 8, m: 2 } },
  {
    id: "echo_chamber",
    params: {
      numNodes: 8,
      numChambers: 2,
      intraEdgeProb: 0.75,
      interEdgeProb: 0.08,
      intraTrust: 0.85,
      interTrust: 0.15,
      minSeedOutDegree: 2,
    },
    assignment: "by_cluster",
  },
  {
    id: "polarized",
    params: {
      numNodes: 8,
      intraEdgeProb: 0.75,
      interEdgeProb: 0.05,
      intraTrust: 0.88,
      interTrust: 0.10,
      minSeedOutDegree: 2,
    },
    assignment: "by_cluster",
  },
  {
    id: "hierarchical",
    params: { numNodes: 8, branchingFactor: 3, downTrust: 0.85, upTrust: 0.3 },
    assignment: "by_cluster",
  },
];

function clusterPools(allIds) {
  const conspiracy = allIds.filter((id) => id.startsWith("conspiracy_"));
  const action = allIds.filter((id) =>
    ["climate_action_advocate", "climate_justice_youth", "mitigation_first_policy", "climate_action_sweden_scopex"].includes(id)
  );
  const env = allIds.filter((id) =>
    ["environmental_concern", "ozone_stratosphere_specialist", "biodiversity_food_security", "caregiver_air_quality"].includes(id)
  );
  const expert = allIds.filter((id) =>
    ["climate_scientist", "science_journalist", "platform_moderator_toxicity"].includes(id)
  );
  return {
    conspiracy: conspiracy.length ? conspiracy : ["conspiracy_believer"],
    action: action.length ? action : ["climate_action_advocate"],
    env: env.length ? env : ["environmental_concern"],
    expert: expert.length ? expert : ["climate_scientist"],
  };
}

function withClusters(tp, assignment, pools) {
  if (assignment !== "by_cluster") return { ...tp };
  return {
    ...tp,
    personasByCluster: [
      pools.conspiracy,
      [...pools.action, ...pools.env, ...pools.expert],
    ],
  };
}

function main() {
  const campaignPersonas = readJSON(path.join(EXP, "personas", "expanded_twelve.json")).personas;
  const discPersonas = readJSON(path.join(EXP, "discovery", "06_personas", "personas_candidates.json")).personas;
  const campaignArticles = readJSON(path.join(EXP, "articles", "articles.json")).articles;
  const discArticles = readJSON(path.join(EXP, "discovery", "05_articles", "articles_candidates.json")).articles;

  const byId = new Map();
  for (const p of campaignPersonas) byId.set(p.id, tagPersona(p, "campaign"));
  for (const p of discPersonas) {
    if (!byId.has(p.id)) byId.set(p.id, tagPersona(p, "debnath_reduction"));
  }
  const mergedPersonas = [...byId.values()];

  const artById = new Map();
  for (const a of campaignArticles) artById.set(a.id, tagArticle(a, "campaign"));
  for (const a of discArticles) {
    if (!artById.has(a.id)) {
      const src = String(a.id).startsWith("climatefever") ? "climatefever" : "debnath_reduction";
      artById.set(a.id, tagArticle(a, src));
    }
  }
  const mergedArticles = [...artById.values()];

  writeJSON(path.join(EXP, "personas", "merged.json"), {
    note: "Campaign 12 + extra Debnath discovery candidates. Not HDBSCAN centroids.",
    personas: mergedPersonas,
  });
  writeJSON(path.join(EXP, "articles", "merged.json"), {
    note: "Campaign 12 + extra discovery climate seeds (unique ids only).",
    articles: mergedArticles,
  });

  const homoDir = path.join(EXP, "personas", "phase2", "homo");
  const heteroDir = path.join(EXP, "personas", "phase2", "hetero");
  fs.mkdirSync(homoDir, { recursive: true });
  fs.mkdirSync(heteroDir, { recursive: true });

  const personaMap = Object.fromEntries(mergedPersonas.map((p) => [p.id, p]));
  const missingHomo = HOMO_IDS.filter((id) => !personaMap[id]);
  if (missingHomo.length) {
    console.error("Missing homo personas:", missingHomo);
    process.exit(1);
  }

  for (const id of HOMO_IDS) {
    writeJSON(path.join(homoDir, `${id}.json`), { personas: [personaMap[id]] });
  }

  const extraIds = mergedPersonas.map((p) => p.id).filter((id) => !HOMO_IDS.includes(id));
  const mixPool = [...HOMO_IDS, ...extraIds];
  const mixes = [];
  for (let i = 0; i < 6; i++) {
    const order = i < 3 ? uniqueWindow(mixPool, i * 2, 8) : shuffledUnique(mixPool, 4200 + i, 8);
    const mixId = `mix_${String(i).padStart(2, "0")}`;
    writeJSON(path.join(heteroDir, `${mixId}.json`), {
      personas: order.map((id) => personaMap[id]),
    });
    mixes.push({ mixId, order });
  }

  const graphMixIds = [
    "conspiracy_believer",
    "conspiracy_haarp_weather",
    "climate_action_advocate",
    "environmental_concern",
    "ozone_stratosphere_specialist",
    "climate_scientist",
    "science_journalist",
    extraIds[0] || "mitigation_first_policy",
  ].filter((id, i, arr) => personaMap[id] && arr.indexOf(id) === i);
  writeJSON(path.join(EXP, "personas", "phase2", "mixed_graph.json"), {
    personas: graphMixIds.map((id) => personaMap[id]),
  });
  writeJSON(path.join(EXP, "personas", "phase2", "homogeneous_conspiracy.json"), {
    personas: [personaMap.conspiracy_believer],
  });

  const pools = clusterPools(mixPool);
  const cfgDir = path.join(EXP, "configs", "phase2");
  fs.mkdirSync(cfgDir, { recursive: true });

  const tH = [];
  const tHe = [];
  const modes = ["continuous", "dual"];
  const prefix = { continuous: "T2c", dual: "T2d" };

  for (const mode of modes) {
    for (const topo of TOPOLOGIES) {
      const nodeParams = topo.chain ? CHAIN_NODE_PARAMS : GRAPH_NODE_PARAMS;
      const assignmentDefault = topo.assignment || "sequential";
      const tpBase = withClusters(topo.params, assignmentDefault, pools);

      for (const pid of HOMO_IDS) {
        const name = `${prefix[mode]}_H_${topo.id}_${pid}`;
        const rel = `thesisExperiment/configs/phase2/${name}.json`;
        writeJSON(path.join(ROOT, rel), {
          personasPath: `thesisExperiment/personas/phase2/homo/${pid}.json`,
          articlesPath: "thesisExperiment/articles/merged.json",
          outputRoot: "thesisExperiment/runs_phase2",
          defaultModel: "gpt-4o-mini",
          auditorModel: "gpt-4o-mini",
          miScoringMode: mode,
          seedNodes: ["node_0"],
          graphRandomSeed: 42,
          _description: `Phase2 T-H ${mode} ${topo.id} homogeneous ${pid}`,
          experimentName: name,
          topology: topo.id,
          topologyParams: tpBase,
          defaultPersonaAssignment: "sequential",
          maxTicks: 8,
          seedArticles: CORE_ARTICLES,
          pfeffer: {
            valence: "varied via 6 core articles",
            surprise: "held: drip seed node_0",
            identityAlignment: `homogeneous ${pid}`,
            networkClustering: topo.id,
            informationEcho: "measured",
            temporalAcceleration: "8 hops/ticks (logged cut)",
          },
          nodeParams,
        });
        tH.push(rel);
      }

      for (const mix of mixes) {
        const name = `${prefix[mode]}_He_${topo.id}_${mix.mixId}`;
        const rel = `thesisExperiment/configs/phase2/${name}.json`;
        writeJSON(path.join(ROOT, rel), {
          personasPath: `thesisExperiment/personas/phase2/hetero/${mix.mixId}.json`,
          articlesPath: "thesisExperiment/articles/merged.json",
          outputRoot: "thesisExperiment/runs_phase2",
          defaultModel: "gpt-4o-mini",
          auditorModel: "gpt-4o-mini",
          miScoringMode: mode,
          seedNodes: ["node_0"],
          graphRandomSeed: 42,
          _description: `Phase2 T-He ${mode} ${topo.id} ${mix.mixId}`,
          experimentName: name,
          topology: topo.id,
          topologyParams: tpBase,
          defaultPersonaAssignment: assignmentDefault === "by_cluster" ? "by_cluster" : "sequential",
          maxTicks: 8,
          seedArticles: CORE_ARTICLES,
          pfeffer: {
            valence: "varied via 6 core articles",
            surprise: "held: drip seed node_0",
            identityAlignment: `heterogeneous ${mix.mixId}`,
            networkClustering: topo.id,
            informationEcho: "measured",
            temporalAcceleration: "8 hops/ticks (logged cut)",
          },
          nodeParams,
        });
        tHe.push(rel);
      }
    }
  }

  const mapping = {
    campaign: "thesisExperiment-phase2",
    date: "2026-09-18",
    model: "gpt-4o-mini",
    hops: 8,
    nReplicates: 1,
    isolation: {
      configs: "thesisExperiment/configs/phase2",
      runs: "thesisExperiment/runs_phase2",
      results: "thesisExperiment/results_phase2",
      notTouched: ["thesisExperiment/runs", "thesisExperiment/results/tables", "thesisExperiment/configs/full"],
    },
    coreArticles: CORE_ARTICLES,
    mergedPersonaCount: mergedPersonas.length,
    mergedArticleCount: mergedArticles.length,
    extraPersonaIds: extraIds,
    extraArticleIds: mergedArticles.map((a) => a.id).filter((id) => !campaignArticles.some((c) => c.id === id)),
    homoIds: HOMO_IDS,
    heteroMixes: mixes,
    topologies: TOPOLOGIES.map((t) => t.id),
    modes,
    experimentTH: tH,
    experimentTHe: tHe,
    estimatedCells: tH.length * CORE_ARTICLES.length + tHe.length * CORE_ARTICLES.length,
  };
  writeJSON(path.join(EXP, "configs", "grid_phase2.json"), mapping);

  const md = [
    "# Phase 2 merged libraries",
    "",
    `- Personas: **${mergedPersonas.length}** (campaign kept on id clash; extras tagged \`debnath_reduction\`).`,
    `- Articles: **${mergedArticles.length}** (campaign ids kept; extras from discovery).`,
    `- Homo grid uses **12** personas; He uses **6** mixes of 8 unique ids.`,
    `- Extra persona ids: ${extraIds.join(", ") || "(none)"}.`,
    `- Extra article ids: ${mapping.extraArticleIds.join(", ") || "(none)"}.`,
    `- T-H configs: ${tH.length}; T-He configs: ${tHe.length}; estimated cells: ${mapping.estimatedCells}.`,
    "",
  ];
  fs.writeFileSync(path.join(EXP, "personas", "phase2", "MERGE.md"), md.join("\n"));

  console.log(md.join("\n"));
  const missingCore = CORE_ARTICLES.filter((id) => !artById.has(id));
  if (missingCore.length) {
    console.error("Missing core articles:", missingCore);
    process.exit(1);
  }
}

main();
