/**
 * Multi-cycle runner for emergent polarization experiments.
 *
 * Each "cycle" is a complete Simulation run with optional carry-over of:
 *   - evolved trust topology (custom graph built from previous cycle's node files)
 *   - per-node belief files (copied before Simulation.run())
 *   - institutional trust file (copied before Simulation.run())
 *
 * Usage:
 *   const runner = new MultiCycleRunner(baseConfig, {
 *     cycles: 8,
 *     articleSequence: ["politics_0", "technology_0", "crime_0"],
 *     sequenceStrategy: "repeat_shuffle",   // or "controversy_gradient", "alternating"
 *     polarizationWeights: { bimodality: 0.35, trustBifurcation: 0.20, ... },
 *   });
 *   const { snapshots, piTrajectory, transitions } = await runner.run();
 */

const path = require("path");
const fs   = require("fs");
const Simulation         = require("./Simulation");
const PolarizationMetrics = require("./PolarizationMetrics");
const { readJSON, writeJSON, fileExists, ensureDir } = require("./fileIO");

class MultiCycleRunner {
  constructor(baseConfig, options = {}) {
    this.baseConfig           = baseConfig;
    this.cycles               = options.cycles || 5;
    this.articleSequence      = options.articleSequence  || null;
    this.sequenceStrategy     = options.sequenceStrategy || "repeat_shuffle";
    this.polarizationWeights  = options.polarizationWeights || null;
    this.interventionCycle    = options.interventionCycle ?? null;
    this.outDir               = options.outDir || path.join(process.cwd(), "experiments");

    const ts = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
    this.experimentId  = `polarization_${ts}`;
    this.experimentDir = path.join(this.outDir, this.experimentId);
  }

  // ── Main entry point ───────────────────────────────────────────────────────

  async run() {
    ensureDir(this.experimentDir);
    console.log(`\n[MultiCycleRunner] Experiment: ${this.experimentId}`);
    console.log(`[MultiCycleRunner] Cycles: ${this.cycles}`);

    const articles = this.articleSequence || this.baseConfig.seedArticles || [];
    if (articles.length === 0) {
      console.warn("[MultiCycleRunner] No articles specified — using crime_0 fallback");
      articles.push("crime_0");
    }

    const sequence    = MultiCycleRunner.generateSequence(this.sequenceStrategy, this.cycles, articles);
    const snapshots   = [];
    const piTrajectory = [];
    let prevExpDir    = null;

    for (let c = 0; c < this.cycles; c++) {
      console.log(`\n[MultiCycleRunner] ══ Cycle ${c + 1} / ${this.cycles} ══`);

      const cycleArticles = Array.isArray(sequence[c]) ? sequence[c] : [sequence[c]];
      const cycleConfig   = this._buildCycleConfig(c, cycleArticles, prevExpDir);

      const sim = new Simulation(cycleConfig);

      // Carry over evolved state from previous cycle
      if (prevExpDir) {
        this._copyBeliefs(prevExpDir, sim.experimentDir);
        this._copyInstitutionalTrust(prevExpDir, sim.experimentDir);
      }

      await sim.run();
      prevExpDir = sim.experimentDir;

      // Snapshot: use first article in the cycle as the primary focal article
      const primaryArticle = cycleArticles[0];
      const snap = PolarizationMetrics.snapshot(sim.experimentDir, c + 1, primaryArticle);
      snap.pi    = PolarizationMetrics.polarizationIndex(snap, this.polarizationWeights || undefined);
      snapshots.push(snap);
      piTrajectory.push(snap.pi);

      console.log(
        `[MultiCycleRunner] Cycle ${c + 1} done. ` +
        `PI=${snap.pi.toFixed(4)}  bimod=${snap.bimodality.toFixed(3)}  ` +
        `modularity=${snap.modularity.toFixed(3)}  trustBif=${snap.trustBifurcation.toFixed(3)}`
      );
    }

    const windowSize  = Math.max(2, Math.min(3, Math.floor(this.cycles / 3)));
    const transitions = PolarizationMetrics.detectPhaseTransition(piTrajectory, windowSize);

    if (transitions.isSignificant) {
      console.log(
        `\n[MultiCycleRunner] Phase transition detected at cycle ${transitions.transitionCycle}` +
        ` (ΔPI=${transitions.jumpMagnitude.toFixed(4)}, conf=${transitions.confidence.toFixed(3)})`
      );
    } else {
      console.log(`\n[MultiCycleRunner] No significant phase transition (max ΔPI=${transitions.jumpMagnitude.toFixed(4)})`);
    }

    const summary = {
      experimentId:  this.experimentId,
      cycles:        this.cycles,
      sequenceStrategy: this.sequenceStrategy,
      articleSequence:  articles,
      piTrajectory,
      snapshots,
      transitions,
      finalPI: piTrajectory[piTrajectory.length - 1] ?? 0,
    };
    writeJSON(path.join(this.experimentDir, "polarization_summary.json"), summary);
    console.log(`\n[MultiCycleRunner] Summary: ${this.experimentDir}/polarization_summary.json`);

    return { snapshots, piTrajectory, transitions, experimentDir: this.experimentDir, summary };
  }

  // ── Config builder ─────────────────────────────────────────────────────────

  _buildCycleConfig(cycleIdx, articles, prevExpDir) {
    const config = {
      ...this.baseConfig,
      seedArticles: articles,
    };

    // From cycle 1 onward, replace topology with the evolved custom graph
    if (prevExpDir) {
      const customTopo = this._loadTopologyFromPrev(prevExpDir);
      if (customTopo) {
        config.topology = "custom";
        config.nodes    = customTopo.nodes;
        config.edges    = customTopo.edges;
        // topologyParams no longer used for custom topology
      }
    }

    // Inject expert bridge nodes at the configured intervention cycle
    if (this.interventionCycle !== null && cycleIdx + 1 === this.interventionCycle) {
      config._intervention = "inject_expert_bridges";
    }

    return config;
  }

  _loadTopologyFromPrev(prevExpDir) {
    const topoPath = path.join(prevExpDir, "graph_topology.json");
    if (!fileExists(topoPath)) return null;

    const topo = readJSON(topoPath);

    // Rebuild nodeConfigs with evolved trust embedded in edges
    const nodes = topo.nodes.map((n) => ({
      nodeId:    n.nodeId,
      personaId: n.personaId,
      modelId:   n.modelId,
      params:    this.baseConfig.nodeParams || {},
    }));

    const edges = topo.edges.map((e) => ({
      from:  e.from,
      to:    e.to,
      trust: e.trust,
    }));

    return { nodes, edges };
  }

  // ── State carry-over helpers ───────────────────────────────────────────────

  _copyBeliefs(srcDir, destDir) {
    if (!this.baseConfig.enableBeliefs) return;
    const srcBeliefs  = path.join(srcDir,  "beliefs");
    const destBeliefs = path.join(destDir, "beliefs");
    if (!fs.existsSync(srcBeliefs)) return;
    ensureDir(destBeliefs);
    for (const f of fs.readdirSync(srcBeliefs)) {
      if (!f.endsWith(".json")) continue;
      fs.copyFileSync(path.join(srcBeliefs, f), path.join(destBeliefs, f));
    }
    console.log(`[MultiCycleRunner] Carried over beliefs from ${srcDir}`);
  }

  _copyInstitutionalTrust(srcDir, destDir) {
    if (!this.baseConfig.enableInstitutionalTrust) return;
    const src  = path.join(srcDir,  "institutional_trust.json");
    const dest = path.join(destDir, "institutional_trust.json");
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`[MultiCycleRunner] Carried over institutional trust from ${srcDir}`);
    }
  }

  // ── Article sequence generator ─────────────────────────────────────────────

  static generateSequence(strategy, cycles, articles) {
    if (articles.length === 0) return new Array(cycles).fill(["crime_0"]);

    const seq = [];

    if (strategy === "repeat_shuffle") {
      for (let c = 0; c < cycles; c++) {
        const shuffled = [...articles].sort(() => Math.random() - 0.5);
        seq.push(shuffled);
      }

    } else if (strategy === "controversy_gradient") {
      // Start with a single article; each cycle adds one more until using all
      for (let c = 0; c < cycles; c++) {
        const count = Math.max(1, Math.ceil(((c + 1) / cycles) * articles.length));
        seq.push(articles.slice(0, count));
      }

    } else if (strategy === "alternating") {
      const half = Math.ceil(articles.length / 2);
      const setA = articles.slice(0, half);
      const setB = articles.slice(half).length > 0 ? articles.slice(half) : setA;
      for (let c = 0; c < cycles; c++) {
        seq.push(c % 2 === 0 ? setA : setB);
      }

    } else {
      // Default: all articles every cycle
      for (let c = 0; c < cycles; c++) seq.push([...articles]);
    }

    return seq;
  }

  // ── Phase diagram: vary ideology × expert fraction, capture final PI ───────

  async runPhaseDiagram(ideologyRange, expertRange, personaPool) {
    const results = [];

    for (const ideologyFrac of ideologyRange) {
      for (const expertFrac of expertRange) {
        console.log(
          `\n[MultiCycleRunner] Phase diagram: ideology=${ideologyFrac.toFixed(2)}, expert=${expertFrac.toFixed(2)}`
        );

        const config = this._buildPhaseDiagramConfig(ideologyFrac, expertFrac, personaPool);
        const runner = new MultiCycleRunner(config, {
          cycles:          this.cycles,
          articleSequence: this.articleSequence,
          sequenceStrategy: this.sequenceStrategy,
          outDir:          this.experimentDir,
        });

        const result   = await runner.run();
        const finalPI  = result.piTrajectory[result.piTrajectory.length - 1] ?? 0;
        const isPolar  = result.transitions.isSignificant;
        results.push({ ideologyFrac, expertFrac, finalPI, transitioned: isPolar });
      }
    }

    const summary = { type: "phase_diagram", ideologyRange, expertRange, results };
    writeJSON(path.join(this.experimentDir, "phase_diagram.json"), summary);
    console.log(`\n[MultiCycleRunner] Phase diagram written to: ${this.experimentDir}/phase_diagram.json`);
    return summary;
  }

  _buildPhaseDiagramConfig(ideologyFrac, expertFrac, personaPool) {
    // Persona pool split: ideologically biased vs expert vs neutral
    const allPersonas = personaPool || [
      "politically_biased_left", "politically_biased_right",
      "medical_expert", "tech_expert", "investigative_journalist",
      "neutral_news", "lifestyle_influencer", "young_parent",
    ];

    const ideologicalPersonas = [
      "politically_biased_left", "politically_biased_right",
      "religious_leader", "environmentalist", "lgbtq_advocate",
    ];
    const expertPersonas = [
      "medical_expert", "tech_expert", "investigative_journalist", "neutral_news",
    ];
    const neutralPersonas = allPersonas.filter(
      (p) => !ideologicalPersonas.includes(p) && !expertPersonas.includes(p)
    );

    const n = this.baseConfig.topologyParams?.numNodes || 20;
    const numIdeo   = Math.round(n * ideologyFrac);
    const numExpert = Math.round(n * expertFrac);
    const numNeutral = Math.max(0, n - numIdeo - numExpert);

    const pool = [
      ...Array(numIdeo).fill(null).map((_, i) => ideologicalPersonas[i % ideologicalPersonas.length]),
      ...Array(numExpert).fill(null).map((_, i) => expertPersonas[i % expertPersonas.length]),
      ...Array(numNeutral).fill(null).map((_, i) => (neutralPersonas[i % neutralPersonas.length] || "neutral")),
    ];

    return {
      ...this.baseConfig,
      defaultPersonaAssignment: "sequential",
      _personaPool: pool,
    };
  }

  // ── Intervention timing: inject expert bridges at different cycles ──────────

  async runInterventionExperiment(interventionCycles) {
    const results = [];

    // Baseline: no intervention
    const baseRunner = new MultiCycleRunner(this.baseConfig, {
      cycles:          this.cycles,
      articleSequence: this.articleSequence,
      sequenceStrategy: this.sequenceStrategy,
      outDir:          this.experimentDir,
    });
    const baseResult = await baseRunner.run();
    const basePI     = baseResult.piTrajectory[baseResult.piTrajectory.length - 1] ?? 0;
    results.push({ interventionCycle: null, label: "no_intervention", finalPI: basePI, piTrajectory: baseResult.piTrajectory });

    // One run per intervention timing
    for (const ic of interventionCycles) {
      console.log(`\n[MultiCycleRunner] Intervention experiment: inject at cycle ${ic}`);

      const runner = new MultiCycleRunner(this.baseConfig, {
        cycles:           this.cycles,
        articleSequence:  this.articleSequence,
        sequenceStrategy: this.sequenceStrategy,
        outDir:           this.experimentDir,
        interventionCycle: ic,
      });
      const result  = await runner.run();
      const finalPI = result.piTrajectory[result.piTrajectory.length - 1] ?? 0;
      results.push({ interventionCycle: ic, label: `intervene_c${ic}`, finalPI, piTrajectory: result.piTrajectory });
    }

    const summary = { type: "intervention_timing", interventionCycles, results };
    writeJSON(path.join(this.experimentDir, "intervention_results.json"), summary);
    console.log(`\n[MultiCycleRunner] Intervention results: ${this.experimentDir}/intervention_results.json`);
    return summary;
  }

  // ── Summary printer ────────────────────────────────────────────────────────

  static printSummary(summary) {
    console.log("\n══════════════════════════════════════════");
    console.log("  Multi-Cycle Polarization Summary");
    console.log("══════════════════════════════════════════");
    console.log(`  Experiment: ${summary.experimentId}`);
    console.log(`  Cycles: ${summary.cycles}  |  Strategy: ${summary.sequenceStrategy}`);
    console.log(`  Final PI: ${summary.finalPI?.toFixed(4)}`);
    console.log("  PI trajectory:", summary.piTrajectory.map((v) => v.toFixed(3)).join(" → "));
    if (summary.transitions?.isSignificant) {
      console.log(`  Phase transition at cycle ${summary.transitions.transitionCycle}`);
      console.log(`    ΔPI=${summary.transitions.jumpMagnitude.toFixed(4)}, conf=${summary.transitions.confidence.toFixed(3)}`);
    } else {
      console.log("  No significant phase transition detected.");
    }
    console.log("══════════════════════════════════════════\n");
  }
}

module.exports = MultiCycleRunner;
