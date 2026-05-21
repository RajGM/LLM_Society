/**
 * Sensitivity Runner — tests persona inference strategy sensitivity.
 *
 * Runs the same cascade with multiple persona assignment strategies
 * and reports how much the inference method matters vs topology.
 *
 * Strategies tested:
 *   "inferred"      — bio keyword matching
 *   "follower_only" — follower count bands
 *   "random"        — random assignment (repeated N times, averaged)
 *   "neutral"       — all nodes → neutral persona
 *
 * Output:
 *   sensitivity_{timestamp}/
 *     sensitivity_report.json  — per-strategy scores + DTFS
 */

const path = require("path");
const DigitalTwinRunner    = require("./DigitalTwinRunner");
const ValidationComparison = require("./ValidationComparison");
const { writeJSON, ensureDir } = require("./fileIO");

const ALL_STRATEGIES = ["inferred", "follower_only", "random", "neutral"];

class SensitivityRunner {

  constructor(options = {}) {
    this.modelId         = options.modelId   || "gpt-4o-mini";
    this.auditorModel    = options.auditorModel || "gpt-4o-mini";
    this.maxTicks        = options.maxTicks  || 12;
    this.runsPerStrategy = options.runsPerStrategy || 3;
    this.outDir          = options.outDir || path.join(process.cwd(), "experiments");

    const ts = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
    this.experimentId  = `sensitivity_${ts}`;
    this.experimentDir = path.join(this.outDir, this.experimentId);
  }

  // ── Main entry point ───────────────────────────────────────────────────────

  /**
   * @param {string}   cascadeFile  — single cascade to test on
   * @param {string}   articleText  — article text
   * @param {string[]} strategies   — subset of ALL_STRATEGIES (default: all)
   */
  async run(cascadeFile, articleText, strategies = ALL_STRATEGIES) {
    ensureDir(this.experimentDir);
    console.log(`\n[Sensitivity] Experiment: ${this.experimentId}`);
    console.log(`[Sensitivity] Strategies: ${strategies.join(", ")}`);
    console.log(`[Sensitivity] Runs per strategy: ${this.runsPerStrategy}`);

    const results = [];

    for (const strategy of strategies) {
      console.log(`\n[Sensitivity] ── Strategy: ${strategy} ──`);

      const runReports = [];
      for (let run = 0; run < this.runsPerStrategy; run++) {
        console.log(`  Run ${run + 1}/${this.runsPerStrategy}…`);
        try {
          const runner = new DigitalTwinRunner({
            modelId:          this.modelId,
            auditorModel:     this.auditorModel,
            maxTicks:         this.maxTicks,
            numRuns:          1,
            inference:        strategy,
            enableFrameAnalysis: false,
            outDir:           this.experimentDir,
          });
          const report = await runner.run(cascadeFile, articleText);
          runReports.push(report);
        } catch (err) {
          console.error(`  [Sensitivity] Run failed: ${err.message}`);
        }
      }

      if (runReports.length === 0) {
        results.push({ strategy, error: "All runs failed" });
        continue;
      }

      // Average across runs
      const structSimVals = runReports.map((r) => r.structuralComparison?.structuralSimilarity ?? 0);
      const dtfsVals      = runReports.map((r) => r.dtfs?.dtfs ?? 0);
      const depthRatios   = runReports.map((r) =>
        r.structuralComparison?.scalarComparison?.depth?.ratio ?? 1
      );
      const svRatios = runReports.map((r) =>
        r.structuralComparison?.scalarComparison?.structuralVirality?.ratio ?? 1
      );

      const avgStructSim  = _mean(structSimVals);
      const stdStructSim  = _std(structSimVals);
      const avgDTFS       = _mean(dtfsVals);

      results.push({
        strategy,
        runs:                 runReports.length,
        avgStructuralSimilarity: +avgStructSim.toFixed(4),
        stdStructuralSimilarity: +stdStructSim.toFixed(4),
        avgDTFS:              +avgDTFS.toFixed(4),
        avgDepthRatio:        +_mean(depthRatios).toFixed(4),
        avgSVRatio:           +_mean(svRatios).toFixed(4),
        isValidated:          avgDTFS >= 0.70,
      });

      console.log(
        `  ${strategy}: StructSim=${(avgStructSim * 100).toFixed(1)}% ±${(stdStructSim * 100).toFixed(1)}%` +
        `  DTFS=${avgDTFS.toFixed(3)}`
      );
    }

    // Find best strategy
    const successful  = results.filter((r) => !r.error);
    const bestResult  = successful.reduce(
      (best, r) => (r.avgStructuralSimilarity > (best?.avgStructuralSimilarity ?? -1) ? r : best),
      null
    );

    // Compute sensitivity: how much does DTFS vary across strategies?
    const dtfsVals    = successful.map((r) => r.avgDTFS);
    const dtfsRange   = dtfsVals.length > 0 ? Math.max(...dtfsVals) - Math.min(...dtfsVals) : 0;
    const highSensitivity = dtfsRange > 0.15; // >15% DTFS range = sensitive to inference

    const report = {
      experimentId:         this.experimentId,
      cascadeFile:          path.resolve(cascadeFile),
      strategies,
      runsPerStrategy:      this.runsPerStrategy,
      results,
      bestStrategy:         bestResult?.strategy ?? null,
      bestStructSim:        bestResult?.avgStructuralSimilarity ?? 0,
      dtfsRange:            +dtfsRange.toFixed(4),
      highSensitivity,
      interpretation:       highSensitivity
        ? "Persona inference method significantly affects fidelity — invest in better inference."
        : "Topology dominates persona assignment — digital twin is robust to inference noise.",
    };

    writeJSON(path.join(this.experimentDir, "sensitivity_report.json"), report);
    this._printReport(report);
    return report;
  }

  _printReport(report) {
    const r = report;
    console.log("\n══════════════════════════════════════════════════════");
    console.log("  Sensitivity Analysis Report");
    console.log("══════════════════════════════════════════════════════");
    console.log(`  Experiment: ${r.experimentId}`);
    console.log(`  Runs/strategy: ${r.runsPerStrategy}`);
    console.log("");
    console.log("  Strategy              StructSim  ±Std    DTFS");
    console.log("  ──────────────────────────────────────────────");
    for (const res of r.results) {
      if (res.error) {
        console.log(`  ${res.strategy.padEnd(22)} ERROR`);
        continue;
      }
      const best = res.strategy === r.bestStrategy ? " ← best" : "";
      console.log(
        `  ${res.strategy.padEnd(22)}` +
        `${(res.avgStructuralSimilarity * 100).toFixed(1).padStart(6)}%` +
        `  ±${(res.stdStructuralSimilarity * 100).toFixed(1).padStart(5)}%` +
        `  ${res.avgDTFS.toFixed(3)}${best}`
      );
    }
    console.log("");
    console.log(`  DTFS range: ${(r.dtfsRange * 100).toFixed(1)}%  ` +
                `${r.highSensitivity ? "HIGH sensitivity" : "LOW sensitivity"}`);
    console.log(`  → ${r.interpretation}`);
    console.log("══════════════════════════════════════════════════════\n");
  }
}

function _mean(arr) {
  return arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length;
}

function _std(arr) {
  if (arr.length === 0) return 0;
  const m = _mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

module.exports = SensitivityRunner;
