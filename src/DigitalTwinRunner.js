/**
 * Digital Twin Runner — single-cascade digital twin experiment.
 *
 * Workflow:
 *   1. Import real cascade topology (RealGraphImporter)
 *   2. Prepare article with auto-generated QA questions
 *   3. Inject article into simulation temporarily
 *   4. Run simulation on the imported topology
 *   5. Extract metrics from both real and simulated cascades
 *   6. Compare with ValidationComparison + ContentDriftValidation
 *   7. Write validation_report.json + DTFS summary
 */

const path = require("path");
const fs   = require("fs");
const Simulation           = require("./Simulation");
const RealGraphImporter    = require("./RealGraphImporter");
const ValidationMetrics    = require("./ValidationMetrics");
const ValidationComparison = require("./ValidationComparison");
const ContentDriftValidation = require("./ContentDriftValidation");
const { readJSON, writeJSON, ensureDir, fileExists } = require("./fileIO");

const ARTICLES_PATH = path.join(process.cwd(), "articles", "articles.json");
const TEMP_ARTICLE_ID = "_dt_real_article_temp";

class DigitalTwinRunner {

  constructor(options = {}) {
    this.modelId        = options.modelId  || "gpt-4o-mini";
    this.auditorModel   = options.auditorModel || "gpt-4o-mini";
    this.maxTicks       = options.maxTicks || 15;
    this.enableBeliefs  = options.enableBeliefs  || false;
    this.enableFrameAnalysis = options.enableFrameAnalysis !== false;
    this.enableProvenance    = options.enableProvenance !== false;
    this.numRuns        = options.numRuns || 1; // stochastic averaging
    this.inference      = options.inference || "inferred";
    this.outDir         = options.outDir || path.join(process.cwd(), "experiments");

    const ts = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
    this.experimentId  = `digital_twin_${ts}`;
    this.experimentDir = path.join(this.outDir, this.experimentId);
  }

  // ── Main entry point ───────────────────────────────────────────────────────

  async run(cascadeFile, articleText, domain = "imported") {
    ensureDir(this.experimentDir);
    console.log(`\n[DigitalTwin] Experiment: ${this.experimentId}`);
    console.log(`[DigitalTwin] Cascade: ${cascadeFile}`);
    console.log(`[DigitalTwin] Inference strategy: ${this.inference}`);

    // Step 1 — import real cascade
    console.log(`\n[DigitalTwin] Importing real cascade topology…`);
    const topoConfig = RealGraphImporter.importCascade(cascadeFile, this.inference);
    console.log(`  Users: ${topoConfig._realData.totalUsers}  Retweets: ${topoConfig._realData.totalRetweets}`);

    if (topoConfig.nodes.length === 0) {
      throw new Error(`No nodes found in cascade ${cascadeFile}`);
    }

    // Step 2 — extract real cascade metrics
    const realCascade   = readJSON(cascadeFile);
    const realMetrics   = ValidationMetrics.extractRealMetrics(realCascade);
    const realDrift     = ContentDriftValidation.extractRealDrift(realCascade, articleText);
    console.log(`  Real metrics: depth=${realMetrics.depth} breadth=${realMetrics.breadth} SV=${realMetrics.structuralVirality.toFixed(3)}`);

    // Step 3 — prepare article (LLM call for QA questions)
    console.log(`\n[DigitalTwin] Preparing article…`);
    const article = await RealGraphImporter.prepareArticle(
      articleText, TEMP_ARTICLE_ID, domain, this.modelId
    );

    // Step 4 — inject article into articles.json
    this._injectArticle(article);

    // Step 5 — run simulation (possibly multiple times)
    const simResults = [];
    try {
      for (let run = 0; run < this.numRuns; run++) {
        if (this.numRuns > 1) console.log(`\n[DigitalTwin] Run ${run + 1} / ${this.numRuns}`);

        const simConfig = this._buildSimConfig(topoConfig);
        const sim = new Simulation(simConfig);
        await sim.run();

        const simMetrics = ValidationMetrics.extractSimulatedMetrics(sim.experimentDir, TEMP_ARTICLE_ID);
        const simDrift   = ContentDriftValidation.extractSimDrift(sim.experimentDir, TEMP_ARTICLE_ID);
        simResults.push({ simMetrics, simDrift, experimentDir: sim.experimentDir });

        console.log(`  Sim metrics: depth=${simMetrics.depth} breadth=${simMetrics.breadth} SV=${simMetrics.structuralVirality.toFixed(3)}`);
      }
    } finally {
      // Always restore articles.json
      this._removeArticle();
    }

    // Step 6 — average across runs
    const avgSimMetrics = this._averageMetrics(simResults.map((r) => r.simMetrics));
    const lastSimDrift  = simResults[simResults.length - 1].simDrift;

    // Step 7 — compare
    const structComparison  = ValidationComparison.compare(realMetrics, avgSimMetrics);
    const contentComparison = ContentDriftValidation.compare(lastSimDrift, realDrift);
    const dtfs = ValidationComparison.computeDTFS(
      structComparison.structuralSimilarity,
      structComparison.structuralSimilarity, // distributional = structural for single-cascade
      contentComparison.contentCorrelation   || 0
    );

    const report = {
      experimentId:    this.experimentId,
      cascadeFile:     path.resolve(cascadeFile),
      realData:        topoConfig._realData,
      numRuns:         this.numRuns,
      inferenceStrategy: this.inference,
      realMetrics,
      simulatedMetrics: avgSimMetrics,
      structuralComparison: structComparison,
      contentDrift: {
        simulated: lastSimDrift,
        real:      realDrift,
        comparison: contentComparison,
      },
      dtfs,
    };

    writeJSON(path.join(this.experimentDir, "validation_report.json"), report);

    this._printReport(report);
    return report;
  }

  // ── Simulation config builder ──────────────────────────────────────────────

  _buildSimConfig(topoConfig) {
    return {
      topology:         "custom",
      nodes:            topoConfig.nodes,
      edges:            topoConfig.edges,
      seedArticles:     [TEMP_ARTICLE_ID],
      seedNodes:        topoConfig.seedNodes,
      maxTicks:         this.maxTicks,
      defaultModel:     this.modelId,
      auditorModel:     this.auditorModel,
      auditorQuestions: 5,
      enableBeliefs:         this.enableBeliefs,
      enableFrameAnalysis:   this.enableFrameAnalysis,
      enableProvenance:      this.enableProvenance,
      enableNetworkEvolution: false,
      enableOpinionDynamics:  false,
      enableInstitutionalTrust: false,
    };
  }

  // ── Article management ─────────────────────────────────────────────────────

  _injectArticle(article) {
    const data = readJSON(ARTICLES_PATH);
    // Remove any stale temp article first
    const filtered = data.articles.filter((a) => a.id !== TEMP_ARTICLE_ID);
    filtered.push(article);
    writeJSON(ARTICLES_PATH, { articles: filtered });
  }

  _removeArticle() {
    if (!fileExists(ARTICLES_PATH)) return;
    try {
      const data     = readJSON(ARTICLES_PATH);
      const filtered = data.articles.filter((a) => a.id !== TEMP_ARTICLE_ID);
      writeJSON(ARTICLES_PATH, { articles: filtered });
    } catch (_) { /* silent */ }
  }

  // ── Metric averaging ───────────────────────────────────────────────────────

  _averageMetrics(metricsArray) {
    if (metricsArray.length === 1) return metricsArray[0];
    const keys = ["depth", "breadth", "size", "structuralVirality", "speedTicks", "meanMI"];
    const avg  = {};
    for (const key of keys) {
      const vals = metricsArray.map((m) => m[key] ?? 0);
      avg[key]   = vals.reduce((s, v) => s + v, 0) / vals.length;
    }
    avg._runCount = metricsArray.length;
    return avg;
  }

  // ── Report printer ─────────────────────────────────────────────────────────

  _printReport(report) {
    const r = report;
    console.log("\n══════════════════════════════════════════════════════");
    console.log("  Digital Twin Validation Report");
    console.log("══════════════════════════════════════════════════════");
    console.log(`  Experiment:    ${r.experimentId}`);
    console.log(`  Cascade:       ${path.basename(r.cascadeFile)}`);
    console.log(`  Label:         ${r.realData.label}`);
    console.log(`  Users:         ${r.realData.totalUsers}  Retweets: ${r.realData.totalRetweets}`);
    console.log(`  Inference:     ${r.inferenceStrategy}`);
    console.log("");
    console.log("  Structure comparison (real → simulated):");
    for (const [k, v] of Object.entries(r.structuralComparison.scalarComparison || {})) {
      if (!v.real && !v.simulated) continue;
      const tick = v.match !== undefined ? (v.match ? "✓" : "✗") : " ";
      console.log(`    [${tick}] ${k.padEnd(20)} real=${String(v.real ?? "-").padEnd(8)} sim=${v.simulated ?? "-"}`);
    }
    console.log(`  Structural Similarity: ${(r.structuralComparison.structuralSimilarity * 100).toFixed(1)}%`);
    console.log(`  Content Drift:  ${r.contentDrift.comparison.available ? r.contentDrift.comparison.matchLabel : "N/A (no real text)"}`);
    console.log("");
    console.log(`  DTFS:  ${r.dtfs.dtfs}  ${r.dtfs.isValidated ? "✓ VALIDATED" : "✗ Not validated"}`);
    console.log(`  Report: ${r.experimentId}/validation_report.json`);
    console.log("══════════════════════════════════════════════════════\n");
  }
}

module.exports = DigitalTwinRunner;
