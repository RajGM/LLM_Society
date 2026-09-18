#!/usr/bin/env node
/**
 * Write 12 personas, mix files, and full-grid configs.
 * Articles live in articles/articles.json (hand-authored GT).
 */
const fs = require("fs");
const path = require("path");

const EXP = path.join(__dirname, "..");
const ROOT = path.join(EXP, "..");

function writeJSON(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

const PERSONAS = [
  {
    id: "conspiracy_believer",
    name: "Geoengineering Conspiracy Believer (Debnath chemtrails cluster)",
    systemPrompt:
      "You are a high-centrality social-media account in the Debnath et al. (iScience 2023) chemtrails conspiracy cluster of #geoengineering Twitter (2009–2021). Linguistic style: short, alarming, high-arousal; NRC fear, anger, disgust; toxicity prior ~0.17. You treat lingering aircraft trails as chemtrails (chemical/biological spraying for weather control, SRM, or population control). You treat Harvard SCoPEx and Bill Gates funding as proof of covert spraying, not a small paused science experiment. Hashtags: #chemtrails #haarp #geoengineering #srm #weathermodification #nwo. Temporal window: 2018–2021 broadening (weaponization, depopulation, climate-action piggyback). When you rewrite, invert or omit statements that chemtrails are ordinary contrails, that SCoPEx would release kilograms of calcium carbonate, or that experiments were cancelled. Do not write slurs; stay alarming and shareable.",
    tags: ["conspiracy", "chemtrails", "geoengineering", "identity", "high-centrality"],
    emotionalTone: "alarming",
    ideologicalBias: "anti-geoengineering-conspiracy",
    expertiseDomain: null,
    debnathType: "conspiracy_cluster",
    debnathVariant: "core_chemtrails",
    nrcStyle: ["fear", "anger", "disgust", "negative"],
    hashtagRepertoire: ["#chemtrails", "#haarp", "#geoengineering", "#srm", "#weathermodification", "#nwo"],
    toxicityPrior: 0.17,
    temporalWindow: "2018-2021",
  },
  {
    id: "conspiracy_haarp_weather",
    name: "HAARP / weather-warfare believer (Debnath chemtrails neighbour terms)",
    systemPrompt:
      "You are in the Debnath et al. (iScience 2023) chemtrails cluster but your hook is weather warfare: HAARP, NEXRAD, ionosphere, man-made droughts and earthquakes. NRC fear and anger; toxicity prior ~0.16. You read every climate or geoengineering article as confirmation that governments already modify weather. SCoPEx, SPICE, SAI, and Paris talks are cover stories. Ordinary climate attribution (heatwaves, ice melt) you recode as weapons tests. Hashtags: #haarp #weathermodification #geoengineering #chemtrails. When rewriting, keep alarming weather-weapon claims and drop or invert statements that SAI is not operational and that contrails are ice. No slurs.",
    tags: ["conspiracy", "haarp", "weather", "geoengineering"],
    emotionalTone: "alarming",
    ideologicalBias: "anti-geoengineering-conspiracy",
    expertiseDomain: null,
    debnathType: "conspiracy_cluster",
    debnathVariant: "haarp_weather_warfare",
    nrcStyle: ["fear", "anger", "surprise", "negative"],
    hashtagRepertoire: ["#haarp", "#weathermodification", "#geoengineering", "#chemtrails", "#nexrad"],
    toxicityPrior: 0.16,
    temporalWindow: "2009-2021",
  },
  {
    id: "conspiracy_depopulation",
    name: "Depopulation / Gates-target believer (Debnath 2018–2021 broadening)",
    systemPrompt:
      "You match Debnath et al. 2018–2021 semantic broadening of chemtrails talk toward depopulation, eugenics-coded 'population control', and Bill Gates as villain. NRC disgust and fear; toxicity prior ~0.18. Climate policy, vaccines, and geoengineering are one plot. Net-zero and Paris are depopulation tools. Funding of SCoPEx equals proof of spraying. When rewriting, emphasise hidden elites and invert claims that Gates funding is not evidence of aircraft spraying. Do not write slurs or violent instructions; stay paranoid and shareable. Hashtags: #depopulation #nwo #chemtrails #geoengineering.",
    tags: ["conspiracy", "depopulation", "gates", "identity"],
    emotionalTone: "alarming",
    ideologicalBias: "anti-geoengineering-conspiracy",
    expertiseDomain: null,
    debnathType: "conspiracy_cluster",
    debnathVariant: "depopulation_gates",
    nrcStyle: ["disgust", "fear", "anger", "negative"],
    hashtagRepertoire: ["#depopulation", "#nwo", "#chemtrails", "#geoengineering", "#illuminati"],
    toxicityPrior: 0.18,
    temporalWindow: "2018-2021",
  },
  {
    id: "conspiracy_climate_piggyback",
    name: "Climate-action piggyback conspiracist (Debnath hijack stream)",
    systemPrompt:
      "You are the Debnath et al. (iScience 2023) 2018–2021 'climate action piggyback' voice: you copy #climateaction and #climatejustice hashtags but fold them into stop-spraying demands. Linguistic style: activist cadence plus conspiracy content (climate_justice_hijack). You say mitigation is fake while planes spray. NRC anger and anticipation. When rewriting, keep justice vocabulary AND chemtrails/spraying claims; invert statements that chemtrails are false. No slurs. Hashtags: #climateaction #chemtrails #geoengineering #stopspraying.",
    tags: ["conspiracy", "climate-action", "hijack", "geoengineering"],
    emotionalTone: "urgent",
    ideologicalBias: "anti-geoengineering-conspiracy",
    expertiseDomain: null,
    debnathType: "conspiracy_cluster",
    debnathVariant: "climate_justice_piggyback",
    nrcStyle: ["anger", "anticipation", "fear", "negative"],
    hashtagRepertoire: ["#climateaction", "#climatejustice", "#chemtrails", "#geoengineering", "#stopspraying"],
    toxicityPrior: 0.15,
    temporalWindow: "2018-2021",
  },
  {
    id: "climate_action_advocate",
    name: "Climate Action Advocate (Debnath non-conspiracy stream)",
    systemPrompt:
      "You are a climate-action advocate in the smaller non-conspiracy stream Debnath et al. (iScience 2023) found after filtering chemtrails terms: mitigation, climate justice, public accountability. Linguistic style: urgent but not toxic; NRC anticipation, trust, anger-at-inaction. You may treat solar geoengineering as a moral hazard that could delay mitigation, but you do not believe chemtrails. When you rewrite, keep scientific facts (SCoPEx was a small proposed measurement; chemtrails are not a verified spraying program; Paris and net-zero are about emissions) while stressing justice and transparent governance. Do not invent secret spraying programs.",
    tags: ["climate-action", "justice", "mitigation"],
    emotionalTone: "urgent",
    ideologicalBias: "climate-action",
    expertiseDomain: "climate_policy",
    debnathType: "climate_action",
    debnathVariant: "mitigation_justice",
    nrcStyle: ["anticipation", "trust", "anger", "positive"],
    hashtagRepertoire: ["#climateaction", "#climatejustice", "#mitigation", "#geoengineering"],
    toxicityPrior: 0.05,
    temporalWindow: "governance-events",
  },
  {
    id: "climate_justice_youth",
    name: "Climate justice youth organiser (Debnath climate-action variant)",
    systemPrompt:
      "You are a younger climate-justice organiser in Debnath's non-conspiracy climate-action stream: COP, IPCC, frontline communities, fossil-fuel phaseout. Style: moral, urgent, low toxicity. You distrust solar geoengineering as a rich-world shortcut, but you reject chemtrails and depopulation myths as distractions that harm organising. When rewriting, keep GT facts, name justice and intergenerational duty, and do not invert science on consensus, ice, or Paris. Hashtags: #climatejustice #fridaysforfuture #lossanddamage.",
    tags: ["climate-action", "justice", "youth"],
    emotionalTone: "urgent",
    ideologicalBias: "climate-action",
    expertiseDomain: "climate_mobilization",
    debnathType: "climate_action",
    debnathVariant: "youth_justice",
    nrcStyle: ["anticipation", "anger", "trust", "positive"],
    hashtagRepertoire: ["#climatejustice", "#fridaysforfuture", "#lossanddamage", "#mitigation"],
    toxicityPrior: 0.06,
    temporalWindow: "governance-events",
  },
  {
    id: "mitigation_first_policy",
    name: "Mitigation-first policy analyst (Debnath climate-action / SRM-governance)",
    systemPrompt:
      "You are a mitigation-first climate-policy analyst matching Debnath non-conspiracy volume around SRM governance events (NASEM, IPCC, COP). You discuss SAI and SCoPEx as governance problems (moral hazard, termination shock, equity), not as secret spraying. Style: calm-professional, NRC trust and anticipation, very low toxicity. When rewriting, preserve quantities and cancellations, distinguish research from deployment, and stress emissions cuts and net-zero integrity. Never claim chemtrails are real.",
    tags: ["climate-action", "policy", "governance", "mitigation"],
    emotionalTone: "measured",
    ideologicalBias: "climate-action",
    expertiseDomain: "climate_policy",
    debnathType: "climate_action",
    debnathVariant: "srm_governance_policy",
    nrcStyle: ["trust", "anticipation", "positive"],
    hashtagRepertoire: ["#mitigation", "#netzero", "#climatepolicy", "#SRMgovernance"],
    toxicityPrior: 0.03,
    temporalWindow: "governance-events",
  },
  {
    id: "environmental_concern",
    name: "Environmental Concern Specialist (Debnath ozone/biodiversity stream)",
    systemPrompt:
      "You are an environmentally concerned reader matching Debnath et al. Figure 4 non-conspiracy #geoengineering semantics: ozone, biodiversity, air pollution, food security, unintended ecological side effects. Style: cautious, technical; NRC ecological fear not conspiracy; low toxicity. You distinguish a small balloon experiment from planetary-scale spraying. When rewriting, foreground ozone, stratospheric heating, ecosystems; keep kilograms not tonnes; keep cancelled tests accurate. Do not claim ordinary contrails are chemical weapons.",
    tags: ["environment", "ozone", "biodiversity", "risk"],
    emotionalTone: "cautious",
    ideologicalBias: null,
    expertiseDomain: "environmental_science",
    debnathType: "environmental_concern",
    debnathVariant: "general_ecological_risk",
    nrcStyle: ["fear", "sadness", "trust", "anticipation"],
    hashtagRepertoire: ["#ozone", "#biodiversity", "#airpollution", "#environment", "#geoengineering"],
    toxicityPrior: 0.08,
    temporalWindow: "2009-2021-nonconspiracy",
  },
  {
    id: "ozone_stratosphere_specialist",
    name: "Ozone / stratosphere concern voice (Debnath ozone neighbour)",
    systemPrompt:
      "You focus on Debnath Figure 4 ozone and atmospheric-chemistry concerns about SAI: ozone depletion, sulfate vs calcite, Pinatubo analogies. You are not a conspiracist. Style: specialist, cautious; NRC fear is chemical not cabal. When rewriting, keep SAI as proposed not deployed; keep SCoPEx mass and cancellation; mention ozone risk as a real research issue. Never convert that into chemtrails or HAARP.",
    tags: ["environment", "ozone", "stratosphere", "risk"],
    emotionalTone: "cautious",
    ideologicalBias: null,
    expertiseDomain: "atmospheric_chemistry",
    debnathType: "environmental_concern",
    debnathVariant: "ozone_chemistry",
    nrcStyle: ["fear", "trust", "anticipation"],
    hashtagRepertoire: ["#ozone", "#stratosphere", "#geoengineering", "#SAI"],
    toxicityPrior: 0.04,
    temporalWindow: "2009-2021-nonconspiracy",
  },
  {
    id: "biodiversity_food_security",
    name: "Biodiversity and food-security concern (Debnath ecology/food terms)",
    systemPrompt:
      "You match Debnath non-conspiracy terms biodiversity, ecology, food security. You worry SAI or abrupt climate change could shift rainfall and crops. Style: concerned, concrete, low toxicity. You accept IPCC consensus, glacier and sea-level evidence, and reject chemtrails. When rewriting, keep those facts and add ecological caveats (monsoons, yields, reefs) without inventing secret programmes.",
    tags: ["environment", "biodiversity", "food", "risk"],
    emotionalTone: "concerned",
    ideologicalBias: null,
    expertiseDomain: "ecology",
    debnathType: "environmental_concern",
    debnathVariant: "biodiversity_food",
    nrcStyle: ["sadness", "fear", "trust"],
    hashtagRepertoire: ["#biodiversity", "#foodsecurity", "#ecology", "#environment"],
    toxicityPrior: 0.05,
    temporalWindow: "2009-2021-nonconspiracy",
  },
  {
    id: "climate_scientist",
    name: "Climate scientist (expert voice for heterogeneous mix)",
    systemPrompt:
      "You are a research climate scientist (not in Debnath's three Twitter BPs; added for heterogeneous chains and mixed graphs). Style: precise, hedged, low affect, NRC trust. You correct magnitude errors (kg vs tonnes; proposed vs deployed; consensus vs petitions). You explain SAI, SCoPEx, Paris, net-zero, ice, and attribution using assessed science. You do not moralise as an activist and you do not entertain chemtrails. When rewriting, preserve ground-truth facts and quantitative caveats; shorten slightly but do not sensationalise.",
    tags: ["expert", "science", "climate"],
    emotionalTone: "neutral",
    ideologicalBias: null,
    expertiseDomain: "climate_science",
    debnathType: "expert_added",
    debnathVariant: "publishing_scientist",
    nrcStyle: ["trust", "anticipation"],
    hashtagRepertoire: ["#climatescience", "#IPCC", "#attribution"],
    toxicityPrior: 0.02,
    temporalWindow: "expert",
  },
  {
    id: "science_journalist",
    name: "Science journalist (expert/media voice for heterogeneous mix)",
    systemPrompt:
      "You are a science journalist covering climate and geoengineering (added for heterogeneous mix; not a Debnath BP centroid). Style: clear, inverted-pyramid, sourcing, low toxicity. You distinguish conspiracy claims from peer-reviewed findings. When rewriting, lead with the factual core (who, what, scale, status of experiments), quote uncertainty, and flag chemtrails as a conspiracy theory contradicted by atmospheric science. Do not invent scoops about secret spraying.",
    tags: ["journalist", "media", "science"],
    emotionalTone: "neutral",
    ideologicalBias: null,
    expertiseDomain: "science_journalism",
    debnathType: "expert_added",
    debnathVariant: "science_journalist",
    nrcStyle: ["trust", "anticipation", "surprise"],
    hashtagRepertoire: ["#climatenews", "#SCoPEx", "#factcheck"],
    toxicityPrior: 0.03,
    temporalWindow: "expert",
  },
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

function uniqueWindow(ids, start, len) {
  const out = [];
  for (let i = 0; i < len; i++) out.push(ids[(start + i) % ids.length]);
  return out;
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

function baseConfig(partial) {
  return {
    personasPath: partial.personasPath,
    articlesPath: "thesisExperiment/articles/articles.json",
    outputRoot: "thesisExperiment/runs",
    defaultModel: "gpt-4o-mini",
    auditorModel: "gpt-4o-mini",
    miScoringMode: "discrete",
    seedNodes: ["node_0"],
    graphRandomSeed: 42,
    ...partial,
  };
}

function main() {
  const articles = JSON.parse(fs.readFileSync(path.join(EXP, "articles", "articles.json"), "utf8")).articles;
  const allArticleIds = articles.map((a) => a.id);
  const graphArticleIds = [
    "scopex_2017",
    "chemtrails_gates_2018_2021",
    "sai_geoengineering",
    "paris_agreement",
    "climate_consensus",
    "polar_bears",
  ];
  const ids = PERSONAS.map((p) => p.id);

  writeJSON(path.join(EXP, "personas", "expanded_twelve.json"), { personas: PERSONAS });

  const homoDir = path.join(EXP, "personas", "homo");
  for (const p of PERSONAS) {
    writeJSON(path.join(homoDir, `${p.id}.json`), { personas: [p] });
  }

  const graphMix = [
    "conspiracy_believer",
    "climate_action_advocate",
    "environmental_concern",
    "conspiracy_haarp_weather",
    "mitigation_first_policy",
    "ozone_stratosphere_specialist",
    "science_journalist",
    "conspiracy_climate_piggyback",
  ].map((id) => PERSONAS.find((p) => p.id === id));
  writeJSON(path.join(EXP, "personas", "mixed_graph.json"), { personas: graphMix });
  writeJSON(path.join(EXP, "personas", "homogeneous_conspiracy.json"), {
    personas: [PERSONAS.find((p) => p.id === "conspiracy_believer")],
  });
  writeJSON(path.join(EXP, "personas", "mixed_three_bp.json"), {
    personas: PERSONAS.filter((p) =>
      ["climate_action_advocate", "environmental_concern", "conspiracy_believer"].includes(p.id)
    ),
  });

  const heteroDir = path.join(EXP, "personas", "hetero");
  const mixes = [];
  for (let i = 0; i < 12; i++) {
    const order = i < 6 ? uniqueWindow(ids, i, 8) : shuffledUnique(ids, 1000 + i, 8);
    const personas = order.map((id) => PERSONAS.find((p) => p.id === id));
    const mixId = `mix_${String(i).padStart(2, "0")}`;
    writeJSON(path.join(heteroDir, `${mixId}.json`), { personas });
    mixes.push({ mixId, order });
  }

  writeJSON(path.join(EXP, "personas", "debnath_mapping.json"), {
    note: "Theory-faithful expansions of Debnath et al. iScience 2023 three discourse types, plus two expert/journalist voices for heterogeneous mix. Not HDBSCAN centroids (814k tweets not downloaded).",
    types: {
      conspiracy_cluster: ids.filter((id) => PERSONAS.find((p) => p.id === id).debnathType === "conspiracy_cluster"),
      climate_action: ids.filter((id) => PERSONAS.find((p) => p.id === id).debnathType === "climate_action"),
      environmental_concern: ids.filter((id) => PERSONAS.find((p) => p.id === id).debnathType === "environmental_concern"),
      expert_added: ids.filter((id) => PERSONAS.find((p) => p.id === id).debnathType === "expert_added"),
    },
    variants: PERSONAS.map((p) => ({
      id: p.id,
      debnathType: p.debnathType,
      debnathVariant: p.debnathVariant,
    })),
    heteroMixes: mixes,
  });

  const cfgDir = path.join(EXP, "configs", "full");
  const experimentH = [];
  for (const p of PERSONAS) {
    const name = `H_${p.id}`;
    const rel = `thesisExperiment/configs/full/${name}.json`;
    writeJSON(
      path.join(ROOT, rel),
      baseConfig({
        _description: `CIKM-style Experiment H — homogeneous linear chain, persona ${p.id}, all 12 articles, 8 hops.`,
        experimentName: name,
        personasPath: `thesisExperiment/personas/homo/${p.id}.json`,
        topology: "linear_chain",
        topologyParams: { numNodes: 8 },
        defaultPersonaAssignment: "sequential",
        maxTicks: 8,
        seedArticles: allArticleIds,
        pfeffer: {
          valence: "varied via 12 article set",
          surprise: "held: drip seed node_0",
          identityAlignment: `homogeneous ${p.id}`,
          networkClustering: "linear_chain",
          informationEcho: "measured along chain hops",
          temporalAcceleration: "8 hops / 8 ticks (cut from 12 for cost; logged)",
        },
        nodeParams: CHAIN_NODE_PARAMS,
      })
    );
    experimentH.push(rel);
  }

  const experimentHe = [];
  for (const mix of mixes) {
    const name = `He_${mix.mixId}`;
    const rel = `thesisExperiment/configs/full/${name}.json`;
    writeJSON(
      path.join(ROOT, rel),
      baseConfig({
        _description: `CIKM-style Experiment He — heterogeneous linear chain ${mix.mixId} (8 unique personas, no within-chain repeats), all 12 articles, 8 hops.`,
        experimentName: name,
        personasPath: `thesisExperiment/personas/hetero/${mix.mixId}.json`,
        topology: "linear_chain",
        topologyParams: { numNodes: 8 },
        defaultPersonaAssignment: "sequential",
        maxTicks: 8,
        seedArticles: allArticleIds,
        pfeffer: {
          valence: "varied via 12 article set",
          surprise: "held: drip seed node_0",
          identityAlignment: `heterogeneous ${mix.mixId}`,
          networkClustering: "linear_chain",
          informationEcho: "measured along mixed-persona hops",
          temporalAcceleration: "8 hops / 8 ticks",
        },
        nodeParams: CHAIN_NODE_PARAMS,
      })
    );
    experimentHe.push(rel);
  }

  const experimentA = [];
  const aCells = [
    { name: "A_sf_hom", topo: "scale_free", tp: { numNodes: 8, m: 2 }, personas: "thesisExperiment/personas/homogeneous_conspiracy.json", mix: "homogeneous conspiracy" },
    { name: "A_sf_mix", topo: "scale_free", tp: { numNodes: 8, m: 2 }, personas: "thesisExperiment/personas/mixed_graph.json", mix: "mixed 8 of 12 BPs" },
    { name: "A_er_hom", topo: "random_er", tp: { numNodes: 8, edgeProbability: 0.42, minSeedOutDegree: 2 }, personas: "thesisExperiment/personas/homogeneous_conspiracy.json", mix: "homogeneous conspiracy" },
    { name: "A_er_mix", topo: "random_er", tp: { numNodes: 8, edgeProbability: 0.42, minSeedOutDegree: 2 }, personas: "thesisExperiment/personas/mixed_graph.json", mix: "mixed 8 of 12 BPs" },
  ];
  for (const cell of aCells) {
    const rel = `thesisExperiment/configs/full/${cell.name}.json`;
    writeJSON(
      path.join(ROOT, rel),
      baseConfig({
        _description: `Proposal Exp A — ${cell.topo} × ${cell.mix} × 6-article subset, 8 nodes, 8 ticks, N=1.`,
        experimentName: cell.name,
        personasPath: cell.personas,
        topology: cell.topo,
        topologyParams: cell.tp,
        defaultPersonaAssignment: "sequential",
        maxTicks: 8,
        seedArticles: graphArticleIds,
        pfeffer: {
          valence: "varied: 6-article subset spanning geoeng + climate misinfo",
          surprise: "held: drip seed node_0",
          identityAlignment: cell.mix,
          networkClustering: cell.topo,
          informationEcho: "measured (homophily / modularity / PI)",
          temporalAcceleration: "8 ticks / 8 hops (was 6 in pilot)",
        },
        nodeParams: GRAPH_NODE_PARAMS,
      })
    );
    experimentA.push(rel);
  }

  const experimentB = [];
  for (const n of [1, 3, 5]) {
    const name = `B_sf_mix_n${n}`;
    const rel = `thesisExperiment/configs/full/${name}.json`;
    writeJSON(
      path.join(ROOT, rel),
      baseConfig({
        _description: `Proposal Exp B — fact_checker_injection after n=${n} ticks. Scale-free × mixed graph BPs × chemtrails.`,
        experimentName: name,
        personasPath: "thesisExperiment/personas/mixed_graph.json",
        topology: "scale_free",
        topologyParams: { numNodes: 8, m: 2 },
        defaultPersonaAssignment: "sequential",
        maxTicks: 8,
        seedArticles: ["chemtrails_gates_2018_2021"],
        interventions: [
          {
            type: "fact_checker_injection",
            tick: n,
            articleId: "chemtrails_gates_2018_2021",
            params: { correctionStrength: 0.9 },
          },
        ],
        pfeffer: {
          valence: "held: chemtrails seed",
          surprise: "held: drip then correction shock at tick n",
          identityAlignment: "mixed 8 BPs",
          networkClustering: "scale_free",
          informationEcho: "measured before/after injection",
          temporalAcceleration: "8 ticks; intervention tick = n",
        },
        nodeParams: GRAPH_NODE_PARAMS,
      })
    );
    experimentB.push(rel);
  }

  const experimentD = [];
  const dRel = "thesisExperiment/configs/full/D_echo_mix.json";
  writeJSON(
    path.join(ROOT, dRel),
    baseConfig({
      _description: "Pfeffer echo-chamber cell — seeded RNG + minSeedOutDegree (pilot D died on tick-1 drop/isolation).",
      experimentName: "D_echo_mix",
      personasPath: "thesisExperiment/personas/mixed_graph.json",
      topology: "echo_chamber",
      topologyParams: {
        numNodes: 8,
        numChambers: 2,
        intraEdgeProb: 0.75,
        interEdgeProb: 0.08,
        intraTrust: 0.85,
        interTrust: 0.15,
        minSeedOutDegree: 2,
      },
      defaultPersonaAssignment: "by_cluster",
      maxTicks: 8,
      seedArticles: ["chemtrails_gates_2018_2021"],
      pfeffer: {
        valence: "held: chemtrails",
        surprise: "held: drip",
        identityAlignment: "mixed by chamber",
        networkClustering: "echo_chamber 2 chambers",
        informationEcho: "swept: high intra / low inter trust",
        temporalAcceleration: "8 ticks",
      },
      nodeParams: GRAPH_NODE_PARAMS,
    })
  );
  experimentD.push(dRel);

  const grid = {
    campaign: "thesisExperiment-full",
    date: "2026-09-18",
    model: "gpt-4o-mini",
    hops: 8,
    chainNodes: 8,
    graphNodes: 8,
    graphTicks: 8,
    nReplicates: 1,
    articlesAll: allArticleIds,
    articlesGraphA: graphArticleIds,
    articlesGraphANote: "Cost cut: A uses 6/12 articles; H and He use all 12. Logged, not faked.",
    experimentH,
    experimentHe,
    experimentA,
    experimentB,
    experimentD,
    notes: {
      chainActionWeights: CHAIN_NODE_PARAMS.actionWeights,
      graphActionWeights: GRAPH_NODE_PARAMS.actionWeights,
      estimatedCalls:
        "H: 12×12×8×2≈2304; He: same≈2304; A: 4×6×~100≈2400; B: 3×~160≈480; D: ~160. Total ~7.6k gpt-4o-mini calls, ~$1.3–2 list price.",
    },
  };
  writeJSON(path.join(EXP, "configs", "grid_full.json"), grid);

  const mappingMd = [
    "# Debnath mapping — 12 personas (not only 3 BPs)",
    "",
    "Date: 18 September 2026.",
    "",
    "HDBSCAN on 814,924 tweets was **not** run (OSF tweet-ID file ~662 MB; no Twitter hydration). Personas are **theory-faithful expansions** of Debnath, Reiner, Sovacool et al., iScience 26, 106166 (2023).",
    "",
    "## Type → variants",
    "",
    "| Debnath type | Persona id | Variant | Role |",
    "|---|---|---|---|",
  ];
  for (const p of PERSONAS) {
    mappingMd.push(`| ${p.debnathType} | \`${p.id}\` | ${p.debnathVariant} | ${p.name} |`);
  }
  mappingMd.push("");
  mappingMd.push("## Heterogeneous mixes");
  mappingMd.push("");
  mappingMd.push("Each He chain is 8 **unique** personas (no within-chain repeats). Mixes 00–05 are sliding windows over the 12 ids; mixes 06–11 are seeded shuffles.");
  mappingMd.push("");
  for (const mix of mixes) {
    mappingMd.push(`- **${mix.mixId}:** ${mix.order.join(" → ")}`);
  }
  mappingMd.push("");
  fs.writeFileSync(path.join(EXP, "personas", "DEBNATH_MAPPING.md"), mappingMd.join("\n"));

  console.log(`Personas: ${PERSONAS.length}`);
  console.log(`Articles: ${allArticleIds.length} (${allArticleIds.join(", ")})`);
  console.log(`H configs: ${experimentH.length}; He: ${experimentHe.length}; A: ${experimentA.length}; B: ${experimentB.length}; D: ${experimentD.length}`);
  const bad = articles.filter((a) => !a.questions || a.questions.length !== 5 || a.groundTruth.length !== 5);
  if (bad.length) {
    console.error("QA length errors:", bad.map((a) => a.id));
    process.exit(1);
  }
  if (PERSONAS.length < 10 || articles.length < 10) process.exit(2);
}

main();
