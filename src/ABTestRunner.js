/**
 * Layer 6 — A/B testing harness
 *
 * Runs a baseline and one or more variant configurations, collects MetricsEngine
 * results for each, and computes Cohen's d effect sizes across all comparable metrics.
 *
 * Usage from CLI:
 *   node index.js --ab-test \
 *     --base examples/run_linear_chain.json \
 *     --variant examples/run_polarized.json \
 *     [--variant examples/run_echo_chamber.json] \
 *     [--runs 3]
 *
 * The runner produces ab_tests/comparison_{timestamp}.json with:
 *   { baseline, variants: [{ config, metrics, effectSizes }] }
 */

const path = require("path");
const Simulation = require("./Simulation");
const MetricsEngine = require("./MetricsEngine");
const { readJSON, writeJSON, ensureDir } = require("./fileIO");

class ABTestRunner {
  constructor(baseConfig, variantConfigs, options = {}) {
    this.baseConfig = baseConfig;
    this.variantConfigs = Array.isArray(variantConfigs) ? variantConfigs : [variantConfigs];
    this.runs = options.runs || 1;
    this.outputDir = options.outputDir || path.join(process.cwd(), "ab_tests");
  }

  async run() {
    ensureDir(this.outputDir);
    console.log(`\n[ABTest] Running baseline × ${this.runs} run(s)...`);

    const baseMetrics = await this._runConfig(this.baseConfig, "baseline");

    const variantResults = [];
    for (let vi = 0; vi < this.variantConfigs.length; vi++) {
      console.log(`\n[ABTest] Running variant ${vi + 1}/${this.variantConfigs.length}...`);
      const vMetrics = await this._runConfig(this.variantConfigs[vi], `variant_${vi + 1}`);
      const effectSizes = this._compareMetrics(baseMetrics, vMetrics);
      variantResults.push({
        variantIndex: vi + 1,
        config: this.variantConfigs[vi],
        metrics: vMetrics,
        effectSizes,
      });
    }

    const report = {
      timestamp: new Date().toISOString(),
      runs: this.runs,
      baseline: { config: this.baseConfig, metrics: baseMetrics },
      variants: variantResults,
    };

    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const reportPath = path.join(this.outputDir, `comparison_${ts}.json`);
    writeJSON(reportPath, report);
    console.log(`\n[ABTest] Report written to: ${reportPath}`);

    this._printSummary(report);
    return report;
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  async _runConfig(config, label) {
    const allMetrics = [];

    for (let r = 0; r < this.runs; r++) {
      console.log(`[ABTest]   ${label} run ${r + 1}/${this.runs}`);
      const sim = new Simulation(config);
      const results = await sim.run();

      // Read all node states from disk
      const nodesData = {};
      for (const nodeId of Object.keys(sim.graph.nodes)) {
        nodesData[nodeId] = sim.graph.nodes[nodeId].read();
      }

      // Compute metrics per article
      const runMetrics = {};
      for (const articleId of config.seedArticles || ["crime_0"]) {
        if (typeof articleId !== "string") continue; // skip competitive groups
        runMetrics[articleId] = MetricsEngine.computeAll(
          nodesData,
          sim.graph,
          articleId,
          config.maxTicks || 10
        );
      }
      allMetrics.push(runMetrics);
    }

    return this._aggregateRuns(allMetrics);
  }

  // Average scalar metrics across multiple runs
  _aggregateRuns(allMetrics) {
    if (allMetrics.length === 1) return allMetrics[0];

    const result = {};
    const articleIds = Object.keys(allMetrics[0]);

    for (const articleId of articleIds) {
      result[articleId] = {};
      const scalarKeys = ["giniCoefficient", "structuralVirality"];

      for (const key of scalarKeys) {
        const values = allMetrics
          .map((m) => m[articleId] && m[articleId][key])
          .filter((v) => v !== null && v !== undefined);
        result[articleId][key] = values.length > 0
          ? values.reduce((s, v) => s + v, 0) / values.length
          : null;
      }

      // Carry through non-averaged metrics from last run
      result[articleId].networkMIOverTime = allMetrics[allMetrics.length - 1][articleId].networkMIOverTime;
      result[articleId].informationHalfLife = allMetrics[allMetrics.length - 1][articleId].informationHalfLife;
      result[articleId].criticalMassThreshold = allMetrics[allMetrics.length - 1][articleId].criticalMassThreshold;
    }

    return result;
  }

  // Cohen's d effect size for each scalar metric
  _compareMetrics(baseMetrics, variantMetrics) {
    const effectSizes = {};
    const articleIds = Object.keys(baseMetrics);

    for (const articleId of articleIds) {
      const bm = baseMetrics[articleId];
      const vm = variantMetrics[articleId];
      if (!bm || !vm) continue;

      effectSizes[articleId] = {};
      const scalarKeys = ["giniCoefficient", "structuralVirality"];

      for (const key of scalarKeys) {
        if (bm[key] !== null && vm[key] !== null) {
          const d = this._cohensD([bm[key]], [vm[key]]);
          effectSizes[articleId][key] = {
            baseline: bm[key],
            variant: vm[key],
            delta: vm[key] - bm[key],
            cohensD: d,
            interpretation: ABTestRunner._interpretD(d),
          };
        }
      }

      // Critical mass: compare final fractions
      const bCM = bm.criticalMassThreshold;
      const vCM = vm.criticalMassThreshold;
      if (bCM && bCM.length > 0 && vCM && vCM.length > 0) {
        const bFinal = bCM[bCM.length - 1].fraction;
        const vFinal = vCM[vCM.length - 1].fraction;
        effectSizes[articleId].finalCriticalMass = {
          baseline: bFinal,
          variant: vFinal,
          delta: vFinal - bFinal,
        };
      }
    }

    return effectSizes;
  }

  _cohensD(aVals, bVals) {
    const meanA = aVals.reduce((s, v) => s + v, 0) / aVals.length;
    const meanB = bVals.reduce((s, v) => s + v, 0) / bVals.length;
    const varA = aVals.reduce((s, v) => s + (v - meanA) ** 2, 0) / Math.max(1, aVals.length - 1);
    const varB = bVals.reduce((s, v) => s + (v - meanB) ** 2, 0) / Math.max(1, bVals.length - 1);
    const pooledSD = Math.sqrt((varA + varB) / 2);
    if (pooledSD === 0) return 0;
    return (meanB - meanA) / pooledSD;
  }

  static _interpretD(d) {
    const abs = Math.abs(d);
    if (abs < 0.2) return "negligible";
    if (abs < 0.5) return "small";
    if (abs < 0.8) return "medium";
    return "large";
  }

  _printSummary(report) {
    console.log("\n═══ A/B TEST SUMMARY ═══");
    for (const variant of report.variants) {
      console.log(`\nVariant ${variant.variantIndex}:`);
      for (const [articleId, effects] of Object.entries(variant.effectSizes)) {
        console.log(`  Article: ${articleId}`);
        for (const [metric, data] of Object.entries(effects)) {
          if (data.cohensD !== undefined) {
            const dir = data.delta >= 0 ? "+" : "";
            console.log(
              `    ${metric.padEnd(28)} baseline=${data.baseline.toFixed(3)} ` +
              `variant=${data.variant.toFixed(3)} ` +
              `delta=${dir}${data.delta.toFixed(3)} ` +
              `d=${data.cohensD.toFixed(2)} (${data.interpretation})`
            );
          }
        }
      }
    }
  }
}

module.exports = ABTestRunner;
