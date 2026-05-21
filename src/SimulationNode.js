const path = require("path");
const { readJSON, writeJSON, updateJSON, fileExists } = require("./fileIO");
const { callLLM } = require("./llmClient");
const BeliefEngine = require("./BeliefEngine");
const ProvenanceEngine = require("./ProvenanceEngine");
const StrategyEngine = require("./StrategyEngine");
const InstitutionalTrust = require("./InstitutionalTrust");
const BotEngine = require("./BotEngine");

class SimulationNode {
  constructor(nodeId, experimentDir) {
    this.nodeId = nodeId;
    this.experimentDir = experimentDir;
    this.filePath = path.join(experimentDir, "nodes", `${nodeId}.json`);
  }

  // Idempotent: skips write if file already exists (resume support).
  static create(nodeId, experimentDir, options = {}) {
    const node = new SimulationNode(nodeId, experimentDir);
    if (fileExists(node.filePath)) return node;
    const state = {
      nodeId,
      personaId: options.personaId || "neutral",
      modelId: options.modelId || "gpt-4o-mini",
      relations: options.relations || {},
      params: options.params || {},
      inbox: [],
      history: [],
      stats: {
        received: 0,
        forwarded: 0,
        reinterpreted: 0,
        dropped: 0,
        dumped: 0,
      },
    };
    writeJSON(node.filePath, state);
    return node;
  }

  read() {
    return readJSON(this.filePath);
  }

  deliverMessage(message) {
    updateJSON(this.filePath, (state) => {
      const maxInboxSize = (state.params && state.params.maxInboxSize) || 20;
      const queued = state.inbox.filter((m) => m.articleId === message.articleId).length;
      if (queued < maxInboxSize) state.inbox.push(message);
      return state;
    });
  }

  // ── Propagation tick ───────────────────────────────────────────────────────
  // extensions object keys:
  //   enableBeliefs, enableProvenance, provenanceRecencyDiscount,
  //   enableStrategicAgents, personaMap, institutionalTrust
  async processTick(tick, persona, resolvedParams, extensions = {}) {
    // Accept plain boolean for backwards-compat (old callers passed enableBeliefs)
    if (typeof extensions === "boolean") {
      extensions = { enableBeliefs: extensions };
    }
    const {
      enableBeliefs         = false,
      enableProvenance      = false,
      provenanceRecencyDiscount = 0.9,
      enableStrategicAgents = false,
      personaMap            = null,
      institutionalTrust    = null,
    } = extensions;

    const state = this.read();

    // Dormancy check — inactive nodes hold their inbox for the next active tick
    if (!this._isActive(state, tick, resolvedParams.activityPattern)) {
      return [];
    }

    const outgoing = [];

    for (const msg of state.inbox) {
      // Special handling for intervention messages (always accepted)
      if (msg.interventionType) {
        this._recordEvent(state, tick, msg, "forward", msg.content, null, "intervention");
        state.stats.forwarded++;
        continue;
      }

      // ── Bot fast-path: bypass all trust/belief/provenance checks ──────────
      if (BotEngine.isBot(persona)) {
        const { outContent, action, duplicateCount } = BotEngine.processMessage(
          msg, persona, this.nodeId
        );

        if (action === "drop") {
          this._recordEvent(state, tick, msg, "drop", null, null, "bot_agenda_filter", null, msg.provenance);
          state.stats.dropped++;
          continue;
        }

        const botProvenance = [
          ...(msg.provenance || []),
          { nodeId: this.nodeId, personaId: persona.id, isBot: true },
        ];

        this._recordEvent(state, tick, msg, action, outContent, null, "bot", null, botProvenance);
        if (action === "forward") state.stats.forwarded++;
        else if (action === "reinterpret") state.stats.reinterpreted++;

        // Flooders/amplifiers push multiple copies into the outgoing queue
        for (let copy = 0; copy < duplicateCount; copy++) {
          for (const targetNodeId of Object.keys(state.relations)) {
            outgoing.push({
              targetNodeId,
              message: {
                articleId:       msg.articleId,
                sourceNodeId:    this.nodeId,
                senderPersonaId: persona.id,
                content:         outContent,
                hops:            msg.hops + 1,
                originalContent: msg.originalContent,
                provenance:      botProvenance,
                tick,
              },
            });
          }
        }
        continue;
      }
      // ── End bot fast-path ──────────────────────────────────────────────────

      if (msg.hops >= resolvedParams.maxHops) {
        this._recordEvent(state, tick, msg, "drop", null, null, "max_hops");
        state.stats.dropped++;
        continue;
      }

      // Raw direct trust
      let sourceTrust = msg.injectedTrust ?? (state.relations[msg.sourceNodeId] ?? 0.5);

      // Institutional trust multiplier — amplify or dampen based on sender's institution
      if (institutionalTrust && msg.senderPersonaId && personaMap) {
        sourceTrust = InstitutionalTrust.applyMultiplier(
          sourceTrust, msg.senderPersonaId, this.nodeId, institutionalTrust, personaMap
        );
      }

      if (sourceTrust < resolvedParams.trustThreshold) {
        this._recordEvent(state, tick, msg, "drop", null, null, "trust_below_threshold");
        state.stats.dropped++;
        continue;
      }

      // Provenance chain trust check
      let chainTrust = null;
      if (enableProvenance && msg.provenance && msg.provenance.length > 0) {
        chainTrust = ProvenanceEngine.computeChainTrust(
          msg.provenance, state.relations, provenanceRecencyDiscount, personaMap
        );
        if (chainTrust < resolvedParams.trustThreshold) {
          this._recordEvent(state, tick, msg, "drop", null, null, "chain_trust_below_threshold");
          state.stats.dropped++;
          continue;
        }
      }

      state.stats.received++;

      // Confirmation bias: compute belief alignment and adjust action weights
      let actionWeights = resolvedParams.actionWeights;
      let beliefAlignment = 0.5;
      if (enableBeliefs) {
        const beliefs = BeliefEngine.read(this.nodeId, this.experimentDir);
        beliefAlignment = await BeliefEngine.computeAlignment(
          msg.content, msg.articleId, beliefs, persona, state.modelId
        );
        const emotionalIntensity = beliefs.emotionalState.intensity;
        actionWeights = BeliefEngine.modifyActionWeights(
          actionWeights, beliefAlignment, emotionalIntensity
        );
      }

      // Strategic action selection overrides probabilistic sampling
      let action = null;
      if (enableStrategicAgents) {
        const strategy = resolvedParams.strategy || StrategyEngine.getStrategy(persona);
        if (strategy) {
          action = StrategyEngine.chooseAction(state, msg, strategy, beliefAlignment);
        }
      }
      if (action === null) action = this._sampleAction(actionWeights);

      if (action === "drop") {
        this._recordEvent(state, tick, msg, "drop", null, null, "action_sampled", chainTrust, msg.provenance);
        state.stats.dropped++;
        if (enableBeliefs) {
          await BeliefEngine.updateAfterAction(
            msg.content, msg.articleId, "drop",
            this.nodeId, this.experimentDir, persona, state.modelId, tick
          );
        }
        continue;
      }

      let outContent = msg.content;

      if (action === "reinterpret") {
        try {
          outContent = await this._reinterpret(msg.content, persona, resolvedParams, state.modelId);
        } catch (err) {
          console.error(`[${this.nodeId}] LLM error during reinterpret: ${err.message}`);
          outContent = msg.content;
        }
        state.stats.reinterpreted++;
      } else if (action === "forward") {
        state.stats.forwarded++;
      } else {
        // dump — record locally; don't forward
        this._recordEvent(state, tick, msg, "dump", outContent, null, null, chainTrust, msg.provenance);
        state.stats.dumped++;
        continue;
      }

      // misinfoIndex intentionally null — filled by auditPendingEvents()
      this._recordEvent(state, tick, msg, action, outContent, null, null, chainTrust, msg.provenance);

      // Update belief state after engaging with this message
      if (enableBeliefs) {
        await BeliefEngine.updateAfterAction(
          outContent, msg.articleId, action,
          this.nodeId, this.experimentDir, persona, state.modelId, tick
        );
      }

      // Build updated provenance: append self so next recipient sees the full chain
      const nextProvenance = [
        ...(msg.provenance || []),
        { nodeId: this.nodeId, personaId: persona.id },
      ];

      for (const targetNodeId of Object.keys(state.relations)) {
        outgoing.push({
          targetNodeId,
          message: {
            articleId:       msg.articleId,
            sourceNodeId:    this.nodeId,
            senderPersonaId: persona.id,
            content:         outContent,
            hops:            msg.hops + 1,
            originalContent: msg.originalContent,
            provenance:      nextProvenance,
            tick,
          },
        });
      }
    }

    // Emotional decay at end of each tick
    if (enableBeliefs) {
      BeliefEngine.decayEmotion(this.nodeId, this.experimentDir, tick);
    }

    state.inbox = [];
    writeJSON(this.filePath, state);
    return outgoing;
  }

  // ── Audit phase ────────────────────────────────────────────────────────────
  // Score all null-MI history events for this article, write MI back, apply
  // trust evolution, delete edges that drop below threshold.
  async auditPendingEvents(articleId, auditor, trustDelta, options = {}) {
    const state = this.read();
    const frameAuditor = options.frameAuditor || null;
    const beliefEngine = options.beliefEngine || null;
    const edgeDeletionThreshold = options.edgeDeletionThreshold ?? 0.05;
    let changed = false;

    // Load original article text for frame analysis
    const originalText = options.articleText || null;

    for (const event of state.history) {
      if (event.articleId !== articleId) continue;
      if (event.misinfoIndex !== null) continue;
      if (!event.contentOut) continue;
      if (event.action !== "reinterpret" && event.action !== "forward") continue;

      try {
        event.misinfoIndex = await auditor.score(articleId, event.contentOut);
        changed = true;

        // Frame analysis (optional)
        if (frameAuditor && originalText) {
          try {
            event.frameAnalysis = await frameAuditor.analyze(originalText, event.contentOut);
          } catch (err) {
            console.error(`[${this.nodeId}] FrameAuditor error: ${err.message}`);
          }
        }

        // Trust evolution: penalise sources that produced high-MI content
        if (trustDelta && event.sourceNodeId && event.sourceNodeId in state.relations) {
          const change = event.misinfoIndex > 3 ? -trustDelta : trustDelta;
          state.relations[event.sourceNodeId] = Math.max(
            0,
            Math.min(1, state.relations[event.sourceNodeId] + change)
          );

          // Edge deletion: remove edges where trust has collapsed
          if (
            edgeDeletionThreshold > 0 &&
            state.relations[event.sourceNodeId] <= edgeDeletionThreshold
          ) {
            delete state.relations[event.sourceNodeId];
            console.log(
              `[${this.nodeId}] Edge to ${event.sourceNodeId} deleted (trust collapsed)`
            );
          }
        }

        // Emotional spike from confirmed propaganda
        if (beliefEngine) {
          BeliefEngine.spikeFromMI(this.nodeId, this.experimentDir, event.misinfoIndex, event.tick);
        }
      } catch (err) {
        console.error(`[${this.nodeId}] Auditor error for ${articleId}: ${err.message}`);
      }
    }

    if (changed) writeJSON(this.filePath, state);
  }

  // Remove inbox and history entries for a given articleId.
  // Used when restarting a partially-propagated article on resume.
  cleanArticleState(articleId) {
    updateJSON(this.filePath, (state) => {
      state.inbox = state.inbox.filter((m) => m.articleId !== articleId);
      state.history = state.history.filter((e) => e.articleId !== articleId);
      return state;
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  _isActive(state, tick, activityPattern) {
    const pattern = (state.params && state.params.activityPattern) || activityPattern || "always";
    if (pattern === "weekly") return tick % 7 === 1; // active once per 7-tick week
    if (pattern === "random") return Math.random() < 0.7;
    return true; // "always"
  }

  async _reinterpret(content, persona, params, modelId) {
    let systemPrompt = persona.systemPrompt;
    if (params.strippedProperties && params.strippedProperties.length > 0) {
      systemPrompt = persona._strippedPrompt || systemPrompt;
    }
    const userPrompt =
      `Here is the information you received. Rewrite it through your perspective in ` +
      `100-200 words. Return only the rewritten text, no preamble:\n\n${content}`;
    return callLLM(modelId, systemPrompt, userPrompt);
  }

  _sampleAction(weights) {
    const r = Math.random();
    let cumulative = 0;
    for (const [action, prob] of Object.entries(weights)) {
      cumulative += prob;
      if (r < cumulative) return action;
    }
    return "dump";
  }

  _recordEvent(state, tick, msg, action, contentOut, misinfoIndex, reason, chainTrust, provenance) {
    state.history.push({
      tick,
      articleId:   msg.articleId,
      sourceNodeId: msg.sourceNodeId,
      hops:        msg.hops,
      action,
      contentIn:   msg.content,
      contentOut:  contentOut || null,
      misinfoIndex,
      frameAnalysis: null,
      reason:      reason || null,
      chainTrust:  chainTrust ?? null,
      provenance:  provenance || null,
      timestamp:   new Date().toISOString(),
    });
  }
}

module.exports = SimulationNode;
