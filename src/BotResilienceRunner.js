/**
 * BotResilienceRunner — Automated bot injection / removal experiment runner.
 *
 * Three-phase protocol:
 *   1. Baseline  — clean run, no bots
 *   2. Injection — full factorial: density × botType × placement
 *   3. Removal   — worst-case injection × each removal strategy
 *
 * Results are written to experiments/bot_resilience_<timestamp>/summary.json
 */

const fs   = require("fs");
const path = require("path");
const Simulation   = require("./Simulation");
const BotEngine    = require("./BotEngine");
const MetricsEngine = require("./MetricsEngine");
const { readJSON, writeJSON, ensureDir } = require("./fileIO");

const BOT_TYPES        = ["amplifier", "distorter", "agenda", "flooder"];
const PLACEMENTS       = ["random", "hubs", "bridges", "periphery", "targeted_cluster"];
const REMOVALS         = ["none", "remove_hubs", "remove_random", "remove_bridges", "remove_all"];
const DEFAULT_DENSITIES = [0.05, 0.10, 0.20];

class BotResilienceRunner {
  /**
   * @param {object} baseConfig   — standard Simulation runConfig (no bots)
   * @param {object} options
   * @param {number[]} options.densities        — fractions of nodes to bot-ify
   * @param {string[]} options.botTypes         — subset of BOT_TYPES to test
   * @param {string[]} options.placements       — subset of PLACEMENTS to test
   * @param {string[]} options.removals         — subset of REMOVALS to test
   * @param {string}   options.articleId        — article to track (first seed article by default)
   */
  constructor(baseConfig, options = {}) {
    this.baseConfig  = baseConfig;
    this.densities   = options.densities  || DEFAULT_DENSITIES;
    this.botTypes    = options.botTypes   || BOT_TYPES;
    this.placements  = options.placements || PLACEMENTS;
    this.removals    = options.removals   || REMOVALS;
    this.articleId   = options.articleId  || (baseConfig.seedArticles || [])[0] || null;

    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    this.outDir = path.join(process.cwd(), "experiments", `bot_resilience_${ts}`);
    ensureDir(this.outDir);
  }

  // ── Public entry point ─────────────────────────────────────────────────────

  async run() {
    console.log(`\n[BotResilienceRunner] Output dir: ${this.outDir}`);

    // ── Phase 1: Baseline ──────────────────────────────────────────────────
    console.log("\n[BotResilienceRunner] Phase 1 — Baseline");
    const baseline = await this._runAndCollect(this.baseConfig, "baseline", {});

    const results = {
      baseline,
      injection: [],
      removal:   [],
    };

    // ── Phase 2: Injection ─────────────────────────────────────────────────
    console.log("\n[BotResilienceRunner] Phase 2 — Injection");
    for (const density of this.densities) {
      for (const botType of this.botTypes) {
        for (const placement of this.placements) {
          const label = `inj_d${density}_${botType}_${placement}`;
          console.log(`  ${label}`);
          const config = this._makeBotConfig(density, botType, placement);
          const row = await this._runAndCollect(config, label, { density, botType, placement });
          results.injection.push(row);
        }
      }
    }

    // ── Phase 3: Removal ──────────────────────────────────────────────────
    // Use highest density + worst bot type (distorter) + hubs placement.
    console.log("\n[BotResilienceRunner] Phase 3 — Removal");
    const worstDensity  = Math.max(...this.densities);
    const worstBotType  = this.botTypes.includes("distorter") ? "distorter" : this.botTypes[0];
    const worstPlacement = this.placements.includes("hubs") ? "hubs" : this.placements[0];

    for (const removal of this.removals) {
      const label = `rem_${removal}`;
      console.log(`  ${label}`);
      const config = this._makeBotConfig(worstDensity, worstBotType, worstPlacement, removal);
      const row = await this._runAndCollect(config, label, {
        density: worstDensity, botType: worstBotType,
        placement: worstPlacement, removal,
      });
      results.removal.push(row);
    }

    // ── Summary ────────────────────────────────────────────────────────────
    const summary = this._buildSummary(results);
    writeJSON(path.join(this.outDir, "summary.json"), summary);
    this._printSummary(summary);
    return summary;
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  _makeBotConfig(density, botType, placement, removal = "none") {
    return {
      ...this.baseConfig,
      botInjection: {
        enabled:   true,
        density,
        botType,
        placement,
        removal,
      },
    };
  }

  async _runAndCollect(config, label, meta) {
    const sim = new Simulation(config);
    let results;
    try {
      results = await sim.run();
    } catch (err) {
      console.error(`  [FAIL] ${label}: ${err.message}`);
      return { label, meta, error: err.message };
    }

    // Gather node data for metrics
    const nodesDir = path.join(sim.experimentDir, "nodes");
    const nodesData = {};
    if (fs.existsSync(nodesDir)) {
      for (const f of fs.readdirSync(nodesDir)) {
        if (!f.endsWith(".json")) continue;
        const nodeId = f.replace(".json", "");
        nodesData[nodeId] = readJSON(path.join(nodesDir, f));
      }
    }

    // Identify bot nodes from personaMap
    const botNodeIds = [];
    for (const [nodeId, state] of Object.entries(nodesData)) {
      const persona = sim.personaMap[state.personaId];
      if (persona && persona.isBot) botNodeIds.push(nodeId);
    }

    const articleId = this.articleId ||
      Object.keys(results || {})[0] || null;

    let botImpact       = null;
    let botCounterfactual = null;
    if (articleId && botNodeIds.length > 0) {
      botImpact        = MetricsEngine.botImpactMetrics(nodesData, botNodeIds, articleId);
      botCounterfactual = MetricsEngine.botCounterfactualMI(nodesData, botNodeIds, articleId);
    }

    return {
      label,
      meta,
      experimentDir: sim.experimentDir,
      botNodeIds,
      botImpact,
      botCounterfactual,
    };
  }

  _applyRemoval(botNodeIds, removal, adjacency) {
    // xorshift32 seeded PRNG for reproducible removal sampling
    let seed = 0xdeadbeef;
    const rng = () => {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      return (seed >>> 0) / 0x100000000;
    };
    return BotEngine.applyRemoval(botNodeIds, removal, adjacency, rng);
  }

  _buildSummary(results) {
    const baseline = results.baseline;
    const baselineMI = baseline.botImpact
      ? baseline.botImpact.humanMeanMI
      : null;

    const injection = results.injection.map((row) => ({
      label:                  row.label,
      density:                row.meta.density,
      botType:                row.meta.botType,
      placement:              row.meta.placement,
      botReachFraction:       row.botImpact?.botReachFraction ?? null,
      cascadeContamination:   row.botImpact?.cascadeContamination ?? null,
      botMIDelta:             row.botImpact?.botMIDelta ?? null,
      botCausalContribution:  row.botCounterfactual?.botCausalContribution ?? null,
    }));

    const removal = results.removal.map((row) => ({
      label:                  row.label,
      removal:                row.meta.removal,
      cascadeContamination:   row.botImpact?.cascadeContamination ?? null,
      botCausalContribution:  row.botCounterfactual?.botCausalContribution ?? null,
    }));

    return {
      outDir:    this.outDir,
      articleId: this.articleId,
      baselineMI,
      injection,
      removal,
      raw:       results,
    };
  }

  _printSummary(summary) {
    console.log("\n═══ BOT RESILIENCE SUMMARY ═══\n");
    console.log(`Article: ${summary.articleId}`);
    console.log(`Baseline human mean MI: ${summary.baselineMI?.toFixed(3) ?? "n/a"}\n`);

    console.log("── Injection Results ──");
    console.log(
      `${"Label".padEnd(38)} ${"Reach%".padEnd(8)} ${"Contam%".padEnd(10)} ${"MIDelta".padEnd(10)} CausalContr`
    );
    console.log("-".repeat(80));
    for (const r of summary.injection) {
      console.log(
        `${r.label.padEnd(38)} ` +
        `${(r.botReachFraction != null ? (r.botReachFraction * 100).toFixed(1) + "%" : "n/a").padEnd(8)} ` +
        `${(r.cascadeContamination != null ? (r.cascadeContamination * 100).toFixed(1) + "%" : "n/a").padEnd(10)} ` +
        `${(r.botMIDelta != null ? r.botMIDelta.toFixed(3) : "n/a").padEnd(10)} ` +
        `${r.botCausalContribution != null ? r.botCausalContribution.toFixed(3) : "n/a"}`
      );
    }

    console.log("\n── Removal Results ──");
    console.log(`${"Label".padEnd(30)} ${"Contam%".padEnd(10)} CausalContr`);
    console.log("-".repeat(55));
    for (const r of summary.removal) {
      console.log(
        `${r.label.padEnd(30)} ` +
        `${(r.cascadeContamination != null ? (r.cascadeContamination * 100).toFixed(1) + "%" : "n/a").padEnd(10)} ` +
        `${r.botCausalContribution != null ? r.botCausalContribution.toFixed(3) : "n/a"}`
      );
    }

    console.log(`\nFull results: ${summary.outDir}/summary.json`);
  }
}

module.exports = BotResilienceRunner;
