/**
 * Batch Validation Runner — run N cascades through the digital twin
 * and compare distributions of cascade metrics (depth, breadth, SV).
 *
 * This implements Level 2 (distributional) and Level 3 (structural) validation
 * across a corpus of cascades.
 *
 * Output:
 *   batch_validation_{timestamp}/
 *     batch_summary.json         — overall distributional comparison + DTFS
 *     results/cascade_N.json     — individual per-cascade reports
 */

const path = require("path");
const fs   = require("fs");
const DigitalTwinRunner    = require("./DigitalTwinRunner");
const RealGraphImporter    = require("./RealGraphImporter");
const ValidationMetrics    = require("./ValidationMetrics");
const ValidationComparison = require("./ValidationComparison");
const { readJSON, writeJSON, ensureDir, fileExists } = require("./fileIO");

class BatchValidationRunner {

  constructor(options = {}) {
    this.modelId      = options.modelId   || "gpt-4o-mini";
    this.auditorModel = options.auditorModel || "gpt-4o-mini";
    this.maxTicks     = options.maxTicks  || 12;
    this.maxCascades  = options.maxCascades || 50;
    this.inference    = options.inference || "inferred";
    this.numRuns      = options.numRuns   || 1;
    this.outDir       = options.outDir || path.join(process.cwd(), "experiments");

    const ts = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
    this.batchId       = `batch_validation_${ts}`;
    this.batchDir      = path.join(this.outDir, this.batchId);
  }

  // ── Main entry point ───────────────────────────────────────────────────────

  /**
   * @param {string} cascadeDir  — directory containing cascade_*.json files
   * @param {string} articleDir  — directory containing article_*.txt files (optional)
   *                               If missing, a placeholder article text is used
   */
  async run(cascadeDir, articleDir = null) {
    ensureDir(path.join(this.batchDir, "results"));
    console.log(`\n[BatchValidation] Batch: ${this.batchId}`);
    console.log(`[BatchValidation] Cascade dir: ${cascadeDir}`);

    const cascadeFiles = this._discoverCascades(cascadeDir);
    if (cascadeFiles.length === 0) {
      throw new Error(`No cascade JSON files found in ${cascadeDir}`);
    }

    const limit        = Math.min(cascadeFiles.length, this.maxCascades);
    console.log(`[BatchValidation] Found ${cascadeFiles.length} cascades, running ${limit}`);

    const realMetricsArray = [];
    const simMetricsArray  = [];
    const perCascadeResults = [];

    for (let i = 0; i < limit; i++) {
      const cascadeFile = cascadeFiles[i];
      const label = path.basename(cascadeFile, ".json");
      console.log(`\n[BatchValidation] ${i + 1}/${limit} — ${label}`);

      try {
        const articleText = this._loadArticleText(articleDir, label, cascadeFile);
        const result = await this._runSingleCascade(cascadeFile, articleText, i);

        realMetricsArray.push(result.realMetrics);
        simMetricsArray.push(result.simulatedMetrics);
        perCascadeResults.push({
          label,
          cascadeFile,
          realMetrics:        result.realMetrics,
          simulatedMetrics:   result.simulatedMetrics,
          structuralSimilarity: result.structuralComparison?.structuralSimilarity ?? 0,
          dtfs:               result.dtfs,
        });

        // Write individual report
        writeJSON(
          path.join(this.batchDir, "results", `cascade_${i + 1}.json`),
          result
        );
      } catch (err) {
        console.error(`  [BatchValidation] FAILED: ${label} — ${err.message}`);
        perCascadeResults.push({ label, cascadeFile, error: err.message });
      }
    }

    // Distributional comparison
    console.log(`\n[BatchValidation] Computing distributional comparison (${realMetricsArray.length} cascades)…`);
    const distComparison = ValidationComparison.distributionalComparison(
      realMetricsArray, simMetricsArray
    );

    // Average structural similarity
    const successfulResults = perCascadeResults.filter((r) => !r.error);
    const avgStructSim = successfulResults.length > 0
      ? successfulResults.reduce((s, r) => s + (r.structuralSimilarity || 0), 0) / successfulResults.length
      : 0;

    const dtfs = ValidationComparison.computeDTFS(
      avgStructSim,
      distComparison._summary?.distributionalScore ?? 0,
      0 // content correlation requires real text; set externally if available
    );

    const summary = {
      batchId:            this.batchId,
      cascadeCount:       limit,
      successfulCascades: successfulResults.length,
      inferenceStrategy:  this.inference,
      avgStructuralSimilarity:    +avgStructSim.toFixed(4),
      distributionalComparison:   distComparison,
      dtfs,
      perCascadeResults,
    };

    writeJSON(path.join(this.batchDir, "batch_summary.json"), summary);
    this._printSummary(summary);
    return summary;
  }

  // ── Single cascade runner ──────────────────────────────────────────────────

  async _runSingleCascade(cascadeFile, articleText, idx) {
    const runner = new DigitalTwinRunner({
      modelId:           this.modelId,
      auditorModel:      this.auditorModel,
      maxTicks:          this.maxTicks,
      numRuns:           this.numRuns,
      inference:         this.inference,
      enableFrameAnalysis: false, // disable for speed in batch mode
      outDir:            path.join(this.batchDir, "sims"),
    });

    return runner.run(cascadeFile, articleText, "imported");
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _discoverCascades(cascadeDir) {
    if (!fs.existsSync(cascadeDir)) {
      throw new Error(`Cascade directory not found: ${cascadeDir}`);
    }
    return fs.readdirSync(cascadeDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(cascadeDir, f))
      .sort();
  }

  _loadArticleText(articleDir, label, cascadeFile) {
    // Try to find a matching article text file
    if (articleDir && fs.existsSync(articleDir)) {
      const candidates = [
        path.join(articleDir, `${label}.txt`),
        path.join(articleDir, `${label}.json`),
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          const raw = fs.readFileSync(c, "utf8");
          // If JSON, extract "text" field
          try {
            const parsed = JSON.parse(raw);
            return parsed.text || parsed.content || raw;
          } catch (_) {
            return raw.trim();
          }
        }
      }
    }

    // Fallback: extract text from cascade JSON itself (some datasets embed article)
    try {
      const cascade = readJSON(cascadeFile);
      if (cascade.article_text) return cascade.article_text;
      if (cascade.title && cascade.text) return `${cascade.title}\n\n${cascade.text}`;
      if (cascade.title) return cascade.title;
    } catch (_) { /* ignore */ }

    return `Article from cascade ${label}. No text source found.`;
  }

  _printSummary(summary) {
    const s = summary;
    console.log("\n══════════════════════════════════════════════════════");
    console.log("  Batch Validation Summary");
    console.log("══════════════════════════════════════════════════════");
    console.log(`  Batch:      ${s.batchId}`);
    console.log(`  Cascades:   ${s.successfulCascades} / ${s.cascadeCount} succeeded`);
    console.log(`  Inference:  ${s.inferenceStrategy}`);
    console.log("");
    console.log("  Distributional comparison:");
    for (const [key, metrics] of Object.entries(s.distributionalComparison)) {
      if (key.startsWith("_")) continue;
      const m = metrics;
      console.log(
        `    ${key.padEnd(22)} ` +
        `corr=${m.correlation?.toFixed(3)}  ` +
        `KS=${m.ks?.statistic?.toFixed(3)} (p=${m.ks?.pValue?.toFixed(3)})  ` +
        `JSD=${m.jsDivergence?.toFixed(3)}  ` +
        `${m.distributionsMatch ? "✓ match" : "✗ differ"}`
      );
    }
    console.log(`  Avg Structural Similarity: ${(s.avgStructuralSimilarity * 100).toFixed(1)}%`);
    console.log(`  Distributional Score:      ${(s.distributionalComparison._summary?.distributionalScore * 100 || 0).toFixed(1)}%`);
    console.log("");
    console.log(`  DTFS: ${s.dtfs.dtfs}  ${s.dtfs.isValidated ? "✓ VALIDATED" : "✗ Not validated"}`);
    console.log(`  Output: ${s.batchId}/batch_summary.json`);
    console.log("══════════════════════════════════════════════════════\n");
  }
}

module.exports = BatchValidationRunner;
