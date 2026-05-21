const path = require("path");
const SocietyGraph = require("./SocietyGraph");
const Auditor = require("./Auditor");
const FrameAuditor = require("./FrameAuditor");
const BeliefEngine = require("./BeliefEngine");
const InterventionEngine = require("./InterventionEngine");
const MetricsEngine = require("./MetricsEngine");
const InstitutionalTrust = require("./InstitutionalTrust");
const NetworkEvolution = require("./NetworkEvolution");
const OpinionDynamics = require("./OpinionDynamics");
const ProvenanceEngine = require("./ProvenanceEngine");
const { readJSON, writeJSON, ensureDir, fileExists } = require("./fileIO");
const { DEFAULTS } = require("../config/experiment");
const BotEngine = require("./BotEngine");

const STATE_FILE = "state.json";

class Simulation {
  constructor(runConfig = {}) {
    this.config = this._mergeConfig(runConfig);
    this.experimentId = this._makeId();
    this.experimentDir = path.join(
      process.cwd(),
      "experiments",
      this.experimentId
    );
    ensureDir(this.experimentDir);

    this.personas = readJSON(
      path.join(process.cwd(), "personas", "personas.json")
    ).personas;
    this.articles = readJSON(
      path.join(process.cwd(), "articles", "articles.json")
    ).articles;

    this.personaMap = Object.fromEntries(this.personas.map((p) => [p.id, p]));
    this.articleMap = Object.fromEntries(this.articles.map((a) => [a.id, a]));

    this.auditor = new Auditor(this.config.auditorModel, this.articles);
    this.frameAuditor = this.config.enableFrameAnalysis
      ? new FrameAuditor(this.config.auditorModel)
      : null;

    this.graph = null;
    this.interventionEngine = null;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  async run() {
    this._saveMetadata("running");
    console.log(`\n[Simulation] Experiment: ${this.experimentId}`);
    console.log(`[Simulation] Dir: ${this.experimentDir}\n`);

    this.graph = this._buildGraph();
    this.graph.saveTopology();

    // Bot injection — replace selected nodes' personas with bot personas
    if (this.config.botInjection && this.config.botInjection.enabled) {
      this._injectBots();
    }

    // Initialise per-node belief files if enabled
    if (this.config.enableBeliefs) {
      for (const nodeId of Object.keys(this.graph.nodes)) {
        BeliefEngine.init(nodeId, this.experimentDir);
      }
    }

    // Initialise institutional trust layer if enabled
    if (this.config.enableInstitutionalTrust) {
      InstitutionalTrust.initialize(
        this.graph.getNodePersonaMap(), this.personaMap, this.experimentDir
      );
    }

    this.interventionEngine = new InterventionEngine(
      this.config.interventions,
      this.graph,
      this.articleMap
    );

    const simState = this._initState();
    this._saveState(simState);

    return this._execute(simState);
  }

  // Resume an interrupted experiment from its directory.
  static async resume(experimentDir) {
    const statePath = path.join(experimentDir, STATE_FILE);
    if (!fileExists(statePath)) {
      throw new Error(`No state.json found in ${experimentDir}. Cannot resume.`);
    }

    const simState = readJSON(statePath);
    if (simState.status === "complete") {
      console.log(`[Simulation] Experiment already complete: ${experimentDir}`);
      return readJSON(path.join(experimentDir, "metadata.json")).results;
    }

    console.log(`\n[Simulation] Resuming: ${simState.experimentId}`);
    console.log(`[Simulation] Phase: ${simState.phase}, Status: ${simState.status}`);
    console.log(`[Simulation] Dir: ${experimentDir}\n`);

    const meta = readJSON(path.join(experimentDir, "metadata.json"));
    const sim = new Simulation(meta.config);
    sim.experimentDir = experimentDir;
    sim.experimentId = simState.experimentId;
    sim.graph = SocietyGraph.loadExisting(experimentDir);
    sim.interventionEngine = new InterventionEngine(
      sim.config.interventions,
      sim.graph,
      sim.articleMap
    );

    return sim._execute(simState);
  }

  // ── Execution engine ───────────────────────────────────────────────────────

  async _execute(simState) {
    try {
      if (simState.phase === "propagation" || simState.phase === "failed") {
        simState.phase = "propagation";
        simState.status = "in_progress";
        this._saveState(simState);
        await this._runPropagationPhase(simState);
      }

      if (simState.phase === "audit") {
        await this._runAuditPhase(simState);
      }

      const results = this._collectResults();
      simState.status = "complete";
      simState.lastUpdated = new Date().toISOString();
      this._saveState(simState);
      this._saveMetadata("complete", results);

      // Human eval CSV export (always generated; raters fill in the rating columns)
      this._exportHumanEvalCSV();

      console.log(`\n[Simulation] Done. Results in: ${this.experimentDir}`);
      return results;
    } catch (err) {
      simState.status = "failed";
      simState.error = {
        phase: simState.phase,
        articleId: simState.phase === "propagation"
          ? simState.propagation.currentArticle
          : simState.audit.currentArticle,
        message: err.message,
        timestamp: new Date().toISOString(),
      };
      simState.lastUpdated = new Date().toISOString();
      this._saveState(simState);
      this._saveMetadata("failed");
      throw err;
    }
  }

  // ── Phase 1: Propagation ───────────────────────────────────────────────────

  async _runPropagationPhase(simState) {
    const enableBeliefs = !!this.config.enableBeliefs; // kept for log context only

    // Standard sequential articles
    const articlesToRun = this._flatArticleIds().filter(
      (id) => !simState.propagation.completedArticles.includes(id)
    );

    for (const articleId of articlesToRun) {
      const article = this.articleMap[articleId];
      if (!article) {
        console.warn(`[Simulation] Unknown article: ${articleId}, skipping`);
        continue;
      }

      simState.propagation.currentArticle = articleId;
      simState.propagation.currentTick = 0;
      this._saveState(simState);

      this._cleanArticleFromAllNodes(articleId);

      console.log(`\n[Simulation] === Propagating: ${articleId} ===`);
      await this._propagateGroup([article], simState, enableBeliefs);

      simState.propagation.completedArticles.push(articleId);
      simState.propagation.currentArticle = null;
      this._saveState(simState);
    }

    // Competitive groups — multiple articles propagating simultaneously
    for (const group of (this.config.competitiveGroups || [])) {
      const groupKey = group.articles.join("+");
      if (simState.propagation.completedArticles.includes(groupKey)) continue;

      const articles = group.articles.map((id) => this.articleMap[id]).filter(Boolean);
      if (articles.length === 0) continue;

      simState.propagation.currentArticle = groupKey;
      simState.propagation.currentTick = 0;
      this._saveState(simState);

      for (const a of articles) this._cleanArticleFromAllNodes(a.id);

      console.log(`\n[Simulation] === Competitive group: ${groupKey} ===`);
      await this._propagateGroup(articles, simState, enableBeliefs, group.seedNodes);

      simState.propagation.completedArticles.push(groupKey);
      simState.propagation.currentArticle = null;
      this._saveState(simState);
    }

    simState.phase = "audit";
    simState.lastUpdated = new Date().toISOString();
    this._saveState(simState);
  }

  // Core propagation loop — handles one or more articles simultaneously (competitive mode).
  async _propagateGroup(articles, simState, _enableBeliefs, seedNodeIds = null) {
    const resolvedParams = this._resolveParams();
    const seeds = seedNodeIds || this.config.seedNodes;

    // Seed all articles into starting nodes
    for (const article of articles) {
      for (const nodeId of seeds) {
        if (!this.graph.nodes[nodeId]) {
          console.warn(`[Simulation] Seed node ${nodeId} not in graph`);
          continue;
        }
        this.graph.nodes[nodeId].deliverMessage({
          articleId:       article.id,
          sourceNodeId:    "ORIGIN",
          senderPersonaId: null,
          content:         article.text,
          originalContent: article.text,
          provenance:      [],
          hops:            0,
          tick:            0,
        });
      }
    }

    for (let tick = 1; tick <= this.config.maxTicks; tick++) {
      simState.propagation.currentTick = tick;
      this._saveState(simState);

      console.log(`[Simulation]   Tick ${tick}/${this.config.maxTicks}`);

      // Apply interventions for each article in this group at this tick
      for (const article of articles) {
        await this.interventionEngine.applyAtTick(tick, article.id);
      }

      const tickOutgoing = [];

      for (const [nodeId, nodeInst] of Object.entries(this.graph.nodes)) {
        const state = nodeInst.read();
        if (state.inbox.length === 0) continue;

        const persona = this._getPersonaForNode(state);
        const nodeParams = { ...resolvedParams, ...state.params };

        console.log(
          `[Simulation]     ${nodeId} (${persona.name}): ${state.inbox.length} message(s)`
        );

        const outgoing = await nodeInst.processTick(
          tick, persona, nodeParams, this._buildExtensions()
        );
        tickOutgoing.push(...outgoing);
      }

      for (const { targetNodeId, message } of tickOutgoing) {
        if (this.graph.nodes[targetNodeId]) {
          this.graph.nodes[targetNodeId].deliverMessage(message);
        }
      }

      if (tickOutgoing.length === 0) {
        console.log(`[Simulation]   No propagation at tick ${tick}, stopping.`);
        break;
      }
    }
  }

  // ── Phase 2: Audit ─────────────────────────────────────────────────────────

  async _runAuditPhase(simState) {
    const resolvedParams = this._resolveParams();
    const allArticleIds  = this._allAuditableArticleIds();

    const articlesToAudit = allArticleIds.filter(
      (id) => !simState.audit.completedArticles.includes(id)
    );

    for (const articleId of articlesToAudit) {
      const article = this.articleMap[articleId];
      if (!article) continue;

      simState.audit.currentArticle = articleId;
      this._saveState(simState);

      console.log(`\n[Simulation] === Auditing: ${articleId} ===`);

      for (const [nodeId, nodeInst] of Object.entries(this.graph.nodes)) {
        console.log(`[Simulation]   Scoring ${nodeId}`);
        await nodeInst.auditPendingEvents(articleId, this.auditor, resolvedParams.trustDelta, {
          frameAuditor: this.frameAuditor,
          beliefEngine: this.config.enableBeliefs,
          edgeDeletionThreshold: resolvedParams.edgeDeletionThreshold,
          articleText: article.text,
        });
      }

      // Network co-evolution after each article's audit (requires beliefs for opinion signals)
      let networkEvolutionMetrics = null;
      if (this.config.enableNetworkEvolution && this.config.enableBeliefs) {
        console.log(`[Simulation]   Running network evolution for ${articleId}`);
        const evoResult = NetworkEvolution.evolve(
          this.graph, articleId, this.experimentDir,
          this.config.networkEvolutionParams || {}
        );
        networkEvolutionMetrics = {
          ...evoResult,
          ...NetworkEvolution.computeMetrics(this.graph, this.personaMap),
        };
        console.log(
          `[Simulation]   Network: +${evoResult.edgesAdded} edges, ` +
          `-${evoResult.edgesRemoved} edges`
        );
      }

      this._writeArticleResults(article.id, networkEvolutionMetrics);

      simState.audit.completedArticles.push(articleId);
      simState.audit.currentArticle = null;
      this._saveState(simState);
    }

    // Opinion dynamics — run once after all articles are audited
    if (this.config.enableOpinionDynamics && this.config.enableBeliefs) {
      const beliefsDir  = path.join(this.experimentDir, "beliefs");
      const trustMatrix = this.graph.toRowStochasticMatrix();
      const adjacency   = this.graph.toAdjacencyMap();

      for (const articleId of allArticleIds) {
        if (!this.articleMap[articleId]) continue;
        console.log(`[Simulation]   Running opinion dynamics for ${articleId}`);
        const opinions = OpinionDynamics.extractOpinions(
          Object.keys(this.graph.nodes), beliefsDir, articleId
        );
        const odResult = OpinionDynamics.compare(
          opinions, trustMatrix, adjacency,
          this.config.opinionDynamicsParams || {}
        );
        writeJSON(
          path.join(this.experimentDir, `opinion_dynamics_${articleId}.json`),
          odResult
        );
      }
    }

    // Update institutional trust based on final audit results
    if (this.config.enableInstitutionalTrust) {
      const trustData = InstitutionalTrust.read(this.experimentDir);
      if (trustData) {
        const auditResults = this._collectResults();
        InstitutionalTrust.update(
          trustData, auditResults, this.personaMap,
          this.config.institutionalTrustParams || {}
        );
        InstitutionalTrust.write(trustData, this.experimentDir);
      }
    }
  }

  // ── Results ────────────────────────────────────────────────────────────────

  _collectResults() {
    const results = {};
    for (const articleId of this._allAuditableArticleIds()) {
      if (!this.articleMap[articleId]) continue;
      results[articleId] = this._buildArticleResult(articleId);
    }
    return results;
  }

  _writeArticleResults(articleId, networkEvolutionMetrics = null) {
    const nodesData     = this._readAllNodeStates();
    const nodeSummaries = this._buildNodeSummaries(articleId, nodesData);
    const metrics       = MetricsEngine.computeAll(
      nodesData, this.graph, articleId, this.config.maxTicks,
      this.config._botNodeIds || []
    );
    const provenanceMetrics = ProvenanceEngine.metricsFromHistory(nodesData, articleId);

    const result = {
      nodeSummaries,
      metrics,
      provenanceMetrics,
      networkEvolution: networkEvolutionMetrics,
    };
    writeJSON(
      path.join(this.experimentDir, `results_${articleId}.json`),
      result
    );
    return result;
  }

  _buildArticleResult(articleId) {
    const nodesData = this._readAllNodeStates();
    const nodeSummaries = this._buildNodeSummaries(articleId, nodesData);
    const metrics = MetricsEngine.computeAll(
      nodesData, this.graph, articleId, this.config.maxTicks
    );
    return { nodeSummaries, metrics };
  }

  _buildNodeSummaries(articleId, nodesData) {
    const summaries = {};
    for (const [nodeId, state] of Object.entries(nodesData)) {
      const articleHistory = state.history.filter((e) => e.articleId === articleId);
      const mpr = Auditor.computeMPR(articleHistory);
      summaries[nodeId] = {
        personaId: state.personaId,
        stats: state.stats,
        mpr,
        severity: Auditor.severity(mpr),
        eventCount: articleHistory.length,
      };
    }
    return summaries;
  }

  _readAllNodeStates() {
    const data = {};
    for (const [nodeId, nodeInst] of Object.entries(this.graph.nodes)) {
      data[nodeId] = nodeInst.read();
    }
    return data;
  }

  _exportHumanEvalCSV() {
    const nodesData = this._readAllNodeStates();
    const csv = MetricsEngine.buildHumanEvalCSV(nodesData, this.articleMap);
    const fs = require("fs");
    fs.writeFileSync(
      path.join(this.experimentDir, "human_eval_template.csv"),
      csv,
      "utf8"
    );
  }

  // ── Article ID helpers ─────────────────────────────────────────────────────

  // All individual article IDs from seedArticles (strings only, not groups)
  _flatArticleIds() {
    return (this.config.seedArticles || []).filter((id) => typeof id === "string");
  }

  // All article IDs that need auditing (individual + competitive group members)
  _allAuditableArticleIds() {
    const ids = new Set(this._flatArticleIds());
    for (const group of (this.config.competitiveGroups || [])) {
      for (const id of group.articles) ids.add(id);
    }
    return [...ids];
  }

  // ── Graph helpers ──────────────────────────────────────────────────────────

  _cleanArticleFromAllNodes(articleId) {
    for (const nodeInst of Object.values(this.graph.nodes)) {
      nodeInst.cleanArticleState(articleId);
    }
  }

  // ── State management ───────────────────────────────────────────────────────

  _initState() {
    return {
      experimentId: this.experimentId,
      phase: "propagation",
      status: "in_progress",
      propagation: {
        completedArticles: [],
        currentArticle: null,
        currentTick: 0,
      },
      audit: {
        completedArticles: [],
        currentArticle: null,
      },
      error: null,
      lastUpdated: new Date().toISOString(),
    };
  }

  _saveState(simState) {
    simState.lastUpdated = new Date().toISOString();
    writeJSON(path.join(this.experimentDir, STATE_FILE), simState);
  }

  // ── Graph building ─────────────────────────────────────────────────────────

  _buildGraph() {
    const cfg = this.config;
    const topology = cfg.topology;
    const tp = cfg.topologyParams;

    if (topology === "custom") {
      return SocietyGraph.buildCustom(this.experimentDir, cfg.nodes, cfg.edges || []);
    }

    const n = tp.numNodes || 5;
    const nodeConfigs = this._makeNodeConfigs(n, topology, tp);

    switch (topology) {
      case "linear_chain":
        return SocietyGraph.buildLinearChain(this.experimentDir, nodeConfigs);
      case "ring":
        return SocietyGraph.buildRing(this.experimentDir, nodeConfigs);
      case "random_er":
        return SocietyGraph.buildRandomER(this.experimentDir, nodeConfigs, tp.edgeProbability ?? 0.3);
      case "small_world":
        return SocietyGraph.buildSmallWorld(this.experimentDir, nodeConfigs, tp.k ?? 4, tp.beta ?? 0.1, this.personaMap);
      case "scale_free":
        return SocietyGraph.buildScaleFree(this.experimentDir, nodeConfigs, tp.m ?? 2, this.personaMap);
      case "echo_chamber":
        return SocietyGraph.buildEchoChamber(
          this.experimentDir, nodeConfigs,
          tp.numChambers ?? 2, tp.intraEdgeProb ?? 0.7, tp.interEdgeProb ?? 0.05,
          tp.intraTrust ?? 0.85, tp.interTrust ?? 0.15, this.personaMap
        );
      case "polarized":
        return SocietyGraph.buildPolarized(
          this.experimentDir, nodeConfigs,
          tp.intraEdgeProb ?? 0.75, tp.interEdgeProb ?? 0.05,
          tp.intraTrust ?? 0.88, tp.interTrust ?? 0.10,
          tp.bridgeNodeIds ?? [], this.personaMap
        );
      case "hierarchical":
        return SocietyGraph.buildHierarchical(
          this.experimentDir, nodeConfigs,
          tp.branchingFactor ?? 3, tp.downTrust ?? 0.85, tp.upTrust ?? 0.3, this.personaMap
        );
      default:
        throw new Error(`Unknown topology: ${topology}`);
    }
  }

  _injectBots() {
    const { density, botType, placement, removal } = this.config.botInjection;
    BotEngine.validateBotType(botType);
    BotEngine.validatePlacementStrategy(placement || "random");

    // Build adjacency map from graph for centrality computations
    const nodeIds = Object.keys(this.graph.nodes);
    const adjacency = {};
    for (const nodeId of nodeIds) {
      const state = this.graph.nodes[nodeId].read();
      adjacency[nodeId] = Object.keys(state.relations);
    }

    const count = Math.max(1, Math.round(nodeIds.length * (density || 0.1)));

    // Seeded RNG for reproducibility
    let seed = 0xdeadbeef;
    const rng = () => {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      return (seed >>> 0) / 0x100000000;
    };

    let selected = BotEngine.injectBots(nodeIds, count, placement || "random", adjacency, rng);

    // Apply removal strategy if set
    if (removal && removal !== "none") {
      const survivors = BotEngine.applyRemoval(selected, removal, adjacency, rng);
      const removed = new Set(selected.filter((id) => !survivors.includes(id)));
      selected = survivors;
      console.log(`[BotInjection] Removed ${removed.size} bots via strategy: ${removal}`);
    }

    const botPersonaId = `bot_${botType}`;
    if (!this.personaMap[botPersonaId]) {
      throw new Error(`Bot persona not found: ${botPersonaId}. Add it to personas.json.`);
    }

    for (const nodeId of selected) {
      const nodeInst = this.graph.nodes[nodeId];
      const state = nodeInst.read();
      state.personaId = botPersonaId;
      const { writeJSON: wj } = require("./fileIO");
      wj(nodeInst.filePath, state);
    }

    console.log(
      `[BotInjection] Injected ${selected.length} ${botType} bots` +
      ` via ${placement || "random"} placement (density=${density})`
    );

    // Store bot node IDs in config for downstream metrics
    this.config._botNodeIds = selected;
  }

  _makeNodeConfigs(n, topology, tp) {
    const allPersonaIds = Object.keys(this.personaMap);
    const strategy = this.config.defaultPersonaAssignment || "sequential";
    const clusterPools = tp.personasByCluster || this._defaultClusterPools(topology, tp);

    return Array.from({ length: n }, (_, i) => {
      let personaId;
      if (strategy === "random") {
        personaId = allPersonaIds[Math.floor(Math.random() * allPersonaIds.length)];
      } else if (strategy === "by_cluster" && clusterPools.length > 0) {
        const numChambers = tp.numChambers ?? clusterPools.length;
        const cluster = i % numChambers;
        const pool = clusterPools[cluster] || allPersonaIds;
        personaId = pool[i % pool.length];
      } else {
        personaId = allPersonaIds[i % allPersonaIds.length];
      }
      return {
        nodeId: `node_${i}`,
        personaId,
        modelId: this.config.defaultModel,
        params: this.config.nodeParams,
      };
    });
  }

  _defaultClusterPools(topology, tp) {
    if (topology === "polarized") {
      return [
        ["politically_biased_left", "lgbtq_advocate", "environmentalist", "lifestyle_influencer", "conflict_creator"],
        ["politically_biased_right", "religious_leader", "gadget_enthusiast", "young_parent", "startup_founder"],
      ];
    }
    if (topology === "echo_chamber") {
      const numChambers = tp.numChambers ?? 2;
      const allPools = [
        ["politically_biased_left", "lgbtq_advocate", "environmentalist", "lifestyle_influencer"],
        ["politically_biased_right", "religious_leader", "young_parent", "gadget_enthusiast"],
        ["neutral_news", "investigative_journalist", "medical_expert", "tech_expert"],
        ["sensationalist_news", "opinion_columnist", "startup_founder", "conflict_creator"],
      ];
      return allPools.slice(0, numChambers);
    }
    if (topology === "hierarchical") {
      return [
        ["neutral_news", "investigative_journalist"],
        ["opinion_columnist", "sensationalist_news", "tech_expert", "medical_expert"],
        ["politically_biased_left", "politically_biased_right", "lifestyle_influencer", "startup_founder"],
        ["young_parent", "rural_educator", "low_education", "gadget_enthusiast", "environmentalist"],
      ];
    }
    return [];
  }

  _getPersonaForNode(state) {
    const persona = this.personaMap[state.personaId];
    if (!persona) {
      console.warn(`Unknown personaId ${state.personaId}, using neutral`);
      return this.personaMap["neutral"];
    }
    const stripped = (state.params && state.params.strippedProperties) || [];
    if (stripped.length === 0) return persona;

    const strippedPersona = { ...persona };
    let prompt = persona.systemPrompt;
    for (const prop of stripped) {
      const val = persona[prop];
      if (val) {
        const re = new RegExp(val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        prompt = prompt.replace(re, "[removed]");
      }
    }
    strippedPersona._strippedPrompt = prompt;
    return strippedPersona;
  }

  // Build the extensions object passed to every processTick call.
  // institutionalTrust is re-read from disk each time so mid-sim file edits are reflected.
  _buildExtensions() {
    return {
      enableBeliefs:             !!this.config.enableBeliefs,
      enableProvenance:          !!this.config.enableProvenance,
      provenanceRecencyDiscount: this.config.provenanceRecencyDiscount ?? 0.9,
      enableStrategicAgents:     !!this.config.enableStrategicAgents,
      personaMap:                this.personaMap,
      institutionalTrust:        this.config.enableInstitutionalTrust
        ? InstitutionalTrust.read(this.experimentDir)
        : null,
    };
  }

  _resolveParams() {
    return { ...DEFAULTS.nodeParams, ...this.config.nodeParams };
  }

  _mergeConfig(runConfig) {
    return {
      ...DEFAULTS,
      ...runConfig,
      nodeParams: { ...DEFAULTS.nodeParams, ...(runConfig.nodeParams || {}) },
      topologyParams: { ...DEFAULTS.topologyParams, ...(runConfig.topologyParams || {}) },
    };
  }

  _saveMetadata(status, results = null) {
    writeJSON(path.join(this.experimentDir, "metadata.json"), {
      experimentId: this.experimentId,
      status,
      timestamp: new Date().toISOString(),
      config: this.config,
      results,
    });
  }

  _makeId() {
    const ts = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .slice(0, 19);
    return `exp_${ts}`;
  }
}

module.exports = Simulation;
