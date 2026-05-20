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
 *
 * Environment variables:
 *   OPENAI_API_KEY       required for gpt-4o / gpt-4o-mini
 *   ANTHROPIC_API_KEY    required for claude-sonnet-4-6
 */

const fs = require("fs");
const path = require("path");
const Simulation = require("./src/Simulation");
const ABTestRunner = require("./src/ABTestRunner");

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--dry-run")) {
    process.env.DRY_RUN = "1";
    console.log("[Dry-run] No LLM calls will be made.");
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
