#!/usr/bin/env node
/**
 * Society Simulation — Entry Point
 *
 * Usage:
 *   node index.js                                                   # defaults
 *   node index.js --config examples/run_linear_chain.json           # run config
 *   node index.js --resume experiments/exp_...                      # resume
 *   node index.js --dry-run --config examples/run_linear_chain.json # no API calls
 *   node index.js --ab-test \
 *       --base examples/run_linear_chain.json \
 *       --variant examples/run_polarized.json \
 *       [--variant examples/run_echo_chamber.json] \
 *       [--runs 3]                                                   # A/B test
 *   node index.js --list-personas
 *   node index.js --list-articles
 *   node index.js --scenario scenarios/climate_debate.yaml          # compile + run
 *   node index.js --compile  scenarios/climate_debate.yaml          # compile only
 *       [--out compiled.json] [--summary]
 *   node index.js --validate scenarios/climate_debate.yaml          # validate only
 *
 * Environment variables:
 *   OPENAI_API_KEY       required for gpt-4o / gpt-4o-mini
 *   ANTHROPIC_API_KEY    required for claude-sonnet-4-6
 */

const fs = require("fs");
const path = require("path");
const Simulation = require("./src/Simulation");
const ABTestRunner = require("./src/ABTestRunner");
const DSLCompiler = require("./src/DSLCompiler");
const BotResilienceRunner = require("./src/BotResilienceRunner");
const MultiCycleRunner       = require("./src/MultiCycleRunner");
const DigitalTwinRunner      = require("./src/DigitalTwinRunner");
const BatchValidationRunner  = require("./src/BatchValidationRunner");
const SensitivityRunner      = require("./src/SensitivityRunner");

async function main() {
  const args = process.argv.slice(2);

  // Must check --test-extensions before --dry-run so we can set DRY_RUN ourselves
  if (args.includes("--test-extensions")) {
    return testExtensions();
  }

  if (args.includes("--dry-run")) {
    process.env.DRY_RUN = "1";
    console.log("[Dry-run] No LLM calls will be made.");
  }

  // ── DSL: validate only ─────────────────────────────────────────────────────
  const validateIdx = args.indexOf("--validate");
  if (validateIdx !== -1) {
    const scenarioPath = args[validateIdx + 1];
    if (!scenarioPath) {
      console.error("--validate requires a path argument");
      process.exit(1);
    }
    try {
      DSLCompiler.compile(resolveArg(scenarioPath), { validateOnly: true });
      console.log("Scenario is valid.");
    } catch (err) {
      console.error(`Validation failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  // ── DSL: compile only ──────────────────────────────────────────────────────
  const compileIdx = args.indexOf("--compile");
  if (compileIdx !== -1) {
    const scenarioPath = args[compileIdx + 1];
    if (!scenarioPath) {
      console.error("--compile requires a path argument");
      process.exit(1);
    }
    const outIdx = args.indexOf("--out");
    const outPath = outIdx !== -1 ? resolveArg(args[outIdx + 1]) : null;
    const printSum = args.includes("--summary");
    try {
      const config = DSLCompiler.compile(resolveArg(scenarioPath));
      const json = JSON.stringify(config, null, 2);
      if (outPath) {
        fs.writeFileSync(outPath, json, "utf8");
        console.log(`Compiled config written to: ${outPath}`);
      } else {
        console.log(json);
      }
      if (printSum) DSLCompiler.printSummary(config, path.basename(scenarioPath));
    } catch (err) {
      console.error(`Compilation failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  // ── DSL: compile + run ─────────────────────────────────────────────────────
  const scenarioIdx = args.indexOf("--scenario");
  if (scenarioIdx !== -1) {
    const scenarioPath = args[scenarioIdx + 1];
    if (!scenarioPath) {
      console.error("--scenario requires a path argument");
      process.exit(1);
    }
    let config;
    try {
      config = DSLCompiler.compile(resolveArg(scenarioPath));
      DSLCompiler.printSummary(config, path.basename(scenarioPath));
    } catch (err) {
      console.error(`Scenario compilation failed: ${err.message}`);
      process.exit(1);
    }
    const sim = new Simulation(config);
    const results = await sim.run();
    printSummary(results);
    return;
  }

  if (args.includes("--list-personas")) {
    const personas = JSON.parse(
      fs.readFileSync(path.join(__dirname, "personas", "personas.json"), "utf8")
    ).personas;
    console.log("\nAvailable personas:");
    personas.forEach((p) => console.log(`  ${p.id.padEnd(28)} ${p.name}`));
    return;
  }

  if (args.includes("--list-articles")) {
    const articles = JSON.parse(
      fs.readFileSync(path.join(__dirname, "articles", "articles.json"), "utf8")
    ).articles;
    console.log("\nAvailable articles:");
    articles.forEach((a) =>
      console.log(`  ${a.id.padEnd(18)} [${a.domain}] ${a.title}`)
    );
    return;
  }

  // ── Resume ─────────────────────────────────────────────────────────────────
  const resumeIdx = args.indexOf("--resume");
  if (resumeIdx !== -1) {
    const resumeDir = args[resumeIdx + 1];
    if (!resumeDir) {
      console.error("--resume requires a path argument");
      process.exit(1);
    }
    const absDir = path.isAbsolute(resumeDir)
      ? resumeDir
      : path.join(process.cwd(), resumeDir);
    if (!fs.existsSync(absDir)) {
      console.error(`Resume directory not found: ${absDir}`);
      process.exit(1);
    }
    const results = await Simulation.resume(absDir);
    printSummary(results);
    return;
  }

  // ── Bot resilience experiment ──────────────────────────────────────────────
  // Usage:
  //   node index.js --bot-resilience --config examples/run_bot_resilience.json
  //       [--bot-densities 0.05,0.10,0.20]
  //       [--bot-types amplifier,distorter]
  //       [--bot-placements random,hubs]
  //       [--bot-removals none,remove_all]
  //       [--article crime_0]
  if (args.includes("--bot-resilience")) {
    const configIdx2 = args.indexOf("--config");
    let baseConfig = {};
    if (configIdx2 !== -1) {
      baseConfig = loadConfig(args[configIdx2 + 1]);
      console.log(`Loaded base config from: ${args[configIdx2 + 1]}`);
    }

    const parseList = (flag) => {
      const idx = args.indexOf(flag);
      return idx !== -1 ? args[idx + 1].split(",").map((s) => s.trim()) : null;
    };

    const densityStrs = parseList("--bot-densities");
    const densities   = densityStrs ? densityStrs.map(Number) : undefined;
    const botTypes    = parseList("--bot-types")    || undefined;
    const placements  = parseList("--bot-placements") || undefined;
    const removals    = parseList("--bot-removals")   || undefined;

    const articleIdx  = args.indexOf("--article");
    const articleId   = articleIdx !== -1 ? args[articleIdx + 1] : undefined;

    const runner = new BotResilienceRunner(baseConfig, {
      densities,
      botTypes,
      placements,
      removals,
      articleId,
    });
    await runner.run();
    return;
  }

  // ── Digital twin validation ────────────────────────────────────────────────
  // Usage:
  //   node index.js --digital-twin --cascade data/fakenewsnet/cascade.json
  //       [--article-text "...text..."]
  //       [--article-file path/to/article.txt]
  //       [--domain crime]
  //       [--runs 5]
  //       [--inference inferred|follower_only|random|neutral]
  //       [--config examples/run_digital_twin.json]
  if (args.includes("--digital-twin")) {
    const dtConfigIdx = args.indexOf("--config");
    let dtConfig = {};
    if (dtConfigIdx !== -1) {
      dtConfig = loadConfig(args[dtConfigIdx + 1]);
      console.log(`Loaded digital twin config from: ${args[dtConfigIdx + 1]}`);
    }

    const cascadeIdx  = args.indexOf("--cascade");
    if (cascadeIdx === -1) {
      console.error("--digital-twin requires --cascade <path>");
      process.exit(1);
    }
    const cascadeFile = resolveArg(args[cascadeIdx + 1]);

    let articleText = "";
    const artTextIdx = args.indexOf("--article-text");
    const artFileIdx = args.indexOf("--article-file");
    if (artTextIdx !== -1) {
      articleText = args[artTextIdx + 1];
    } else if (artFileIdx !== -1) {
      articleText = fs.readFileSync(resolveArg(args[artFileIdx + 1]), "utf8").trim();
    } else {
      // Try to extract from cascade JSON itself
      try {
        const cas = JSON.parse(fs.readFileSync(cascadeFile, "utf8"));
        articleText = cas.article_text || cas.title || "Article text not provided.";
      } catch (_) {
        articleText = "Article text not provided.";
      }
    }

    const domainIdx    = args.indexOf("--domain");
    const domain       = domainIdx !== -1 ? args[domainIdx + 1] : (dtConfig.domain || "imported");
    const runsIdx      = args.indexOf("--runs");
    const numRuns      = runsIdx !== -1 ? parseInt(args[runsIdx + 1], 10) : (dtConfig.numRuns || 1);
    const inferenceIdx = args.indexOf("--inference");
    const inference    = inferenceIdx !== -1 ? args[inferenceIdx + 1] : (dtConfig.inference || "inferred");

    const dtRunner = new DigitalTwinRunner({
      modelId:           dtConfig.defaultModel || "gpt-4o-mini",
      auditorModel:      dtConfig.auditorModel || "gpt-4o-mini",
      maxTicks:          dtConfig.maxTicks || 12,
      enableBeliefs:     dtConfig.enableBeliefs || false,
      enableFrameAnalysis: dtConfig.enableFrameAnalysis !== false,
      enableProvenance:  dtConfig.enableProvenance !== false,
      numRuns,
      inference,
    });

    await dtRunner.run(cascadeFile, articleText, domain);
    return;
  }

  // ── Batch validation ───────────────────────────────────────────────────────
  // Usage:
  //   node index.js --validate-batch \
  //       --cascade-dir data/fakenewsnet/ \
  //       [--article-dir data/fakenewsnet/articles/] \
  //       [--max-cascades 50]
  //       [--inference inferred]
  if (args.includes("--validate-batch")) {
    const bvConfigIdx = args.indexOf("--config");
    let bvConfig = {};
    if (bvConfigIdx !== -1) {
      bvConfig = loadConfig(args[bvConfigIdx + 1]);
    }

    const cascadeDirIdx = args.indexOf("--cascade-dir");
    if (cascadeDirIdx === -1) {
      console.error("--validate-batch requires --cascade-dir <path>");
      process.exit(1);
    }
    const cascadeDir    = resolveArg(args[cascadeDirIdx + 1]);
    const artDirIdx     = args.indexOf("--article-dir");
    const articleDir    = artDirIdx !== -1 ? resolveArg(args[artDirIdx + 1]) : null;
    const maxCasIdx     = args.indexOf("--max-cascades");
    const maxCascades   = maxCasIdx !== -1 ? parseInt(args[maxCasIdx + 1], 10) : (bvConfig.maxCascades || 50);
    const bvInfIdx      = args.indexOf("--inference");
    const bvInference   = bvInfIdx !== -1 ? args[bvInfIdx + 1] : (bvConfig.inference || "inferred");

    const bvRunner = new BatchValidationRunner({
      modelId:      bvConfig.defaultModel || "gpt-4o-mini",
      auditorModel: bvConfig.auditorModel || "gpt-4o-mini",
      maxTicks:     bvConfig.maxTicks || 12,
      maxCascades,
      inference:    bvInference,
    });
    await bvRunner.run(cascadeDir, articleDir);
    return;
  }

  // ── Sensitivity analysis ───────────────────────────────────────────────────
  // Usage:
  //   node index.js --validate-sensitivity \
  //       --cascade data/fakenewsnet/cascade.json \
  //       [--strategies inferred,random,follower_only,neutral]
  //       [--runs-per-strategy 5]
  //       [--article-text "..."]
  if (args.includes("--validate-sensitivity")) {
    const svCascadeIdx = args.indexOf("--cascade");
    if (svCascadeIdx === -1) {
      console.error("--validate-sensitivity requires --cascade <path>");
      process.exit(1);
    }
    const svCascadeFile = resolveArg(args[svCascadeIdx + 1]);

    let svArticleText = "";
    const svArtTextIdx = args.indexOf("--article-text");
    const svArtFileIdx = args.indexOf("--article-file");
    if (svArtTextIdx !== -1) {
      svArticleText = args[svArtTextIdx + 1];
    } else if (svArtFileIdx !== -1) {
      svArticleText = fs.readFileSync(resolveArg(args[svArtFileIdx + 1]), "utf8").trim();
    } else {
      try {
        const cas = JSON.parse(fs.readFileSync(svCascadeFile, "utf8"));
        svArticleText = cas.article_text || cas.title || "Article text not provided.";
      } catch (_) {
        svArticleText = "Article text not provided.";
      }
    }

    const svStratsIdx   = args.indexOf("--strategies");
    const svStrategies  = svStratsIdx !== -1
      ? args[svStratsIdx + 1].split(",").map((s) => s.trim())
      : ["inferred", "random", "follower_only", "neutral"];

    const svRunsIdx     = args.indexOf("--runs-per-strategy");
    const svRuns        = svRunsIdx !== -1 ? parseInt(args[svRunsIdx + 1], 10) : 3;

    const svRunner = new SensitivityRunner({
      modelId:         "gpt-4o-mini",
      auditorModel:    "gpt-4o-mini",
      maxTicks:        12,
      runsPerStrategy: svRuns,
    });
    await svRunner.run(svCascadeFile, svArticleText, svStrategies);
    return;
  }

  // ── Emergent polarization experiment ──────────────────────────────────────
  // Usage:
  //   node index.js --polarization --config examples/run_polarization.json
  //       [--cycles 8]
  //       [--sequence repeat_shuffle|controversy_gradient|alternating]
  //       [--articles politics_0,technology_0,crime_0]
  if (args.includes("--polarization")) {
    const configIdx3 = args.indexOf("--config");
    let polConfig = {};
    if (configIdx3 !== -1) {
      polConfig = loadConfig(args[configIdx3 + 1]);
      console.log(`Loaded polarization config from: ${args[configIdx3 + 1]}`);
    }

    const cyclesIdx   = args.indexOf("--cycles");
    const cycles      = cyclesIdx !== -1 ? parseInt(args[cyclesIdx + 1], 10) : undefined;

    const seqIdx      = args.indexOf("--sequence");
    const seqStrategy = seqIdx !== -1 ? args[seqIdx + 1] : undefined;

    const artIdx      = args.indexOf("--articles");
    const articles    = artIdx !== -1 ? args[artIdx + 1].split(",").map((s) => s.trim()) : undefined;

    const runner = new MultiCycleRunner(polConfig, {
      cycles:          cycles || polConfig.cycles || 5,
      articleSequence: articles || polConfig.articleSequence || polConfig.seedArticles,
      sequenceStrategy: seqStrategy || polConfig.sequenceStrategy || "repeat_shuffle",
    });

    const result = await runner.run();
    MultiCycleRunner.printSummary(result.summary);
    return;
  }

  // ── Polarization phase diagram ─────────────────────────────────────────────
  // Usage:
  //   node index.js --polarization-phase-diagram --config examples/run_polarization.json
  //       [--cycles 5]
  //       [--ideology-range 0.1,0.3,0.5,0.7]
  //       [--expert-range 0.0,0.1,0.2,0.3]
  if (args.includes("--polarization-phase-diagram")) {
    const configIdx4 = args.indexOf("--config");
    let pdConfig = {};
    if (configIdx4 !== -1) {
      pdConfig = loadConfig(args[configIdx4 + 1]);
      console.log(`Loaded phase-diagram config from: ${args[configIdx4 + 1]}`);
    }

    const parseRange = (flag) => {
      const i = args.indexOf(flag);
      return i !== -1 ? args[i + 1].split(",").map(Number) : null;
    };

    const cyclesIdx2    = args.indexOf("--cycles");
    const cycles2       = cyclesIdx2 !== -1 ? parseInt(args[cyclesIdx2 + 1], 10) : (pdConfig.cycles || 4);
    const ideologyRange = parseRange("--ideology-range") || [0.1, 0.3, 0.5, 0.7];
    const expertRange   = parseRange("--expert-range")   || [0.0, 0.1, 0.2, 0.3];

    const runner2 = new MultiCycleRunner(pdConfig, {
      cycles:          cycles2,
      articleSequence: pdConfig.articleSequence || pdConfig.seedArticles,
      sequenceStrategy: pdConfig.sequenceStrategy || "repeat_shuffle",
    });

    const pdResult = await runner2.runPhaseDiagram(ideologyRange, expertRange);
    console.log(`\nPhase diagram written. ${pdResult.results.length} data points collected.`);
    return;
  }

  // ── Polarization intervention timing ──────────────────────────────────────
  // Usage:
  //   node index.js --polarization-intervention --config examples/run_polarization.json
  //       [--cycles 8]
  //       [--intervention-cycles 1,2,3,4,5]
  if (args.includes("--polarization-intervention")) {
    const configIdx5 = args.indexOf("--config");
    let intConfig = {};
    if (configIdx5 !== -1) {
      intConfig = loadConfig(args[configIdx5 + 1]);
      console.log(`Loaded intervention config from: ${args[configIdx5 + 1]}`);
    }

    const cyclesIdx3  = args.indexOf("--cycles");
    const cycles3     = cyclesIdx3 !== -1 ? parseInt(args[cyclesIdx3 + 1], 10) : (intConfig.cycles || 6);

    const intCyclesIdx = args.indexOf("--intervention-cycles");
    const interventionCycles = intCyclesIdx !== -1
      ? args[intCyclesIdx + 1].split(",").map(Number)
      : [1, 2, 3, 4];

    const runner3 = new MultiCycleRunner(intConfig, {
      cycles:          cycles3,
      articleSequence: intConfig.articleSequence || intConfig.seedArticles,
      sequenceStrategy: intConfig.sequenceStrategy || "repeat_shuffle",
    });

    const intResult = await runner3.runInterventionExperiment(interventionCycles);
    console.log(`\nIntervention experiment done. ${intResult.results.length} conditions tested.`);
    return;
  }

  // ── A/B test ───────────────────────────────────────────────────────────────
  if (args.includes("--ab-test")) {
    const baseIdx = args.indexOf("--base");
    if (baseIdx === -1) {
      console.error("--ab-test requires --base <config.json>");
      process.exit(1);
    }

    const baseConfig = loadConfig(args[baseIdx + 1]);

    const variantConfigs = [];
    let idx = 0;
    while ((idx = args.indexOf("--variant", idx)) !== -1) {
      variantConfigs.push(loadConfig(args[idx + 1]));
      idx++;
    }

    if (variantConfigs.length === 0) {
      console.error("--ab-test requires at least one --variant <config.json>");
      process.exit(1);
    }

    const runsIdx = args.indexOf("--runs");
    const runs = runsIdx !== -1 ? parseInt(args[runsIdx + 1], 10) : 1;

    const runner = new ABTestRunner(baseConfig, variantConfigs, { runs });
    await runner.run();
    return;
  }

  // ── Fresh run ──────────────────────────────────────────────────────────────
  let runConfig = {};
  const configIdx = args.indexOf("--config");
  if (configIdx !== -1) {
    runConfig = loadConfig(args[configIdx + 1]);
    console.log(`Loaded run config from: ${args[configIdx + 1]}`);
  }

  const sim = new Simulation(runConfig);
  const results = await sim.run();
  printSummary(results);
}

async function testExtensions() {
  process.env.DRY_RUN = "1";
  console.log("[test-extensions] DRY_RUN=1. Running all extensions on a 3-node chain.\n");

  const testConfig = {
    topology: "linear_chain",
    topologyParams: { numNodes: 3 },
    maxTicks: 3,
    seedArticles: ["crime_0"],
    enableBeliefs:           true,
    enableFrameAnalysis:     true,
    enableProvenance:        true,
    enableStrategicAgents:   true,
    enableNetworkEvolution:  true,
    enableOpinionDynamics:   true,
    enableInstitutionalTrust: true,
  };

  const sim = new Simulation(testConfig);
  await sim.run();

  const expectedFiles = [
    "state.json",
    "graph_topology.json",
    "metadata.json",
    "institutional_trust.json",
    "human_eval_template.csv",
  ];
  const expectedDirs  = ["nodes", "beliefs"];
  const expectedGlobs = [
    ["results_crime_0.json"],
    ["opinion_dynamics_crime_0.json"],
  ];

  let allPass = true;
  console.log("\n[test-extensions] Checking outputs:");

  for (const f of expectedFiles) {
    const ok = fs.existsSync(path.join(sim.experimentDir, f));
    console.log(`  [${ok ? "PASS" : "FAIL"}] ${f}`);
    if (!ok) allPass = false;
  }
  for (const d of expectedDirs) {
    const ok = fs.existsSync(path.join(sim.experimentDir, d));
    console.log(`  [${ok ? "PASS" : "FAIL"}] ${d}/`);
    if (!ok) allPass = false;
  }
  for (const [f] of expectedGlobs) {
    const ok = fs.existsSync(path.join(sim.experimentDir, f));
    console.log(`  [${ok ? "PASS" : "FAIL"}] ${f}`);
    if (!ok) allPass = false;
  }

  // Spot-check provenance fields in node history
  const nodesDir = path.join(sim.experimentDir, "nodes");
  const nodeFiles = fs.readdirSync(nodesDir).filter((f) => f.endsWith(".json"));
  let hasProvenance = false;
  for (const nf of nodeFiles) {
    const state = JSON.parse(fs.readFileSync(path.join(nodesDir, nf), "utf8"));
    if ((state.history || []).some((e) => Array.isArray(e.provenance))) {
      hasProvenance = true;
      break;
    }
  }
  console.log(`  [${hasProvenance ? "PASS" : "SKIP"}] provenance fields in node history`);

  console.log(`\n[test-extensions] ${allPass ? "ALL CHECKS PASSED" : "SOME CHECKS FAILED"}`);
  console.log(`[test-extensions] Experiment dir: ${sim.experimentDir}`);
}

function resolveArg(filePath) {
  if (!filePath) {
    console.error("Expected a path argument");
    process.exit(1);
  }
  return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
}

function loadConfig(filePath) {
  if (!filePath) {
    console.error("Expected a path after config flag");
    process.exit(1);
  }
  const absPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`Config file not found: ${absPath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(absPath, "utf8"));
}

function printSummary(results) {
  if (!results) return;
  console.log("\n═══ SUMMARY ═══");
  for (const [articleId, result] of Object.entries(results)) {
    console.log(`\nArticle: ${articleId}`);
    console.log(
      `${"Node".padEnd(12)} ${"Persona".padEnd(28)} ${"MPR".padEnd(6)} Severity`
    );
    console.log("-".repeat(65));
    for (const [nodeId, summary] of Object.entries(result.nodeSummaries || {})) {
      const mprStr = (summary.mpr || 0).toFixed(2);
      console.log(
        `${nodeId.padEnd(12)} ${summary.personaId.padEnd(28)} ${mprStr.padEnd(6)} ${summary.severity}`
      );
    }

    // Print key metrics if present
    const m = result.metrics;
    if (m) {
      if (m.giniCoefficient !== undefined && m.giniCoefficient !== null) {
        console.log(`  Gini coefficient:   ${m.giniCoefficient.toFixed(3)}`);
      }
      if (m.structuralVirality !== undefined && m.structuralVirality !== null) {
        console.log(`  Structural virality: ${m.structuralVirality.toFixed(3)}`);
      }
      if (m.informationHalfLife && m.informationHalfLife.networkMedian !== null) {
        console.log(`  MI half-life tick:  ${m.informationHalfLife.networkMedian}`);
      }
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
