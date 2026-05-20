/**
 * Layer 4 — External interventions
 *
 * Applied mid-simulation during the propagation tick loop. Configured via the
 * `interventions` array in the run config:
 *
 *   { type, tick, articleId, targetNodes, params }
 *
 * Supported types:
 *
 *   fact_checker_injection
 *     At `tick`, inject a correction message into targetNodes' inboxes.
 *     The correction is the original article text with a prebunking header.
 *     params: { correctionStrength: 0.9 } — trust score of the injected message.
 *
 *   inoculation
 *     At tick 0 (before article arrives), inject a "be skeptical" warning.
 *     The warning primes targeted nodes to apply higher skepticism.
 *     Mechanically: temporarily lowers their trustThreshold by 0.1 for this article.
 *     params: { warningMessage: string (optional) }
 *
 *   content_moderation
 *     At `tick`, scan targetNodes' inboxes and remove messages for this article
 *     where the estimated message length exceeds a threshold (heuristic proxy for
 *     sensationalism). A real deployment would use the auditor, but that requires
 *     an LLM call — this heuristic keeps moderation cost-free.
 *     params: { maxHops: 2 } — remove messages that have propagated more than N hops.
 */

class InterventionEngine {
  constructor(interventions, graph, articleMap) {
    this.interventions = interventions || [];
    this.graph = graph;
    this.articleMap = articleMap;
  }

  // Call once per tick during propagation phase.
  async applyAtTick(tick, articleId) {
    const applicable = this.interventions.filter(
      (iv) =>
        iv.tick === tick &&
        (!iv.articleId || iv.articleId === articleId)
    );
    for (const iv of applicable) {
      await this._apply(iv, articleId, tick);
    }
  }

  async _apply(iv, articleId, tick) {
    switch (iv.type) {
      case "fact_checker_injection":
        return this._factCheckerInjection(iv, articleId, tick);
      case "inoculation":
        return this._inoculation(iv, articleId, tick);
      case "content_moderation":
        return this._contentModeration(iv, articleId);
      default:
        console.warn(`[InterventionEngine] Unknown intervention type: ${iv.type}`);
    }
  }

  _factCheckerInjection(iv, articleId, tick) {
    const article = this.articleMap[articleId];
    if (!article) return;

    const correctionStrength = (iv.params && iv.params.correctionStrength) || 0.85;
    const correctionContent =
      `[FACT CHECK] The following is the verified original report on this topic. ` +
      `Cross-reference with what you have seen:\n\n${article.text}`;

    const targets = iv.targetNodes || Object.keys(this.graph.nodes);
    for (const nodeId of targets) {
      const nodeInst = this.graph.nodes[nodeId];
      if (!nodeInst) continue;
      nodeInst.deliverMessage({
        articleId,
        sourceNodeId: "FACT_CHECKER",
        content: correctionContent,
        originalContent: article.text,
        hops: 0,
        tick,
        interventionType: "fact_checker_injection",
        // Override source trust for this message via a special field read in processTick
        injectedTrust: correctionStrength,
      });
    }
    console.log(
      `[Intervention] fact_checker_injection @ tick ${tick} for ${articleId} -> ${targets.join(", ")}`
    );
  }

  _inoculation(iv, articleId, tick) {
    const article = this.articleMap[articleId];
    if (!article) return;

    const warning =
      (iv.params && iv.params.warningMessage) ||
      `[ADVISORY] You may soon receive claims about "${article.title}". ` +
      `This topic has been flagged as susceptible to misinformation. ` +
      `Please apply careful scrutiny to any information you receive on this subject.`;

    const targets = iv.targetNodes || Object.keys(this.graph.nodes);
    for (const nodeId of targets) {
      const nodeInst = this.graph.nodes[nodeId];
      if (!nodeInst) continue;
      nodeInst.deliverMessage({
        articleId,
        sourceNodeId: "INOCULATION",
        content: warning,
        originalContent: warning,
        hops: 0,
        tick,
        interventionType: "inoculation",
        injectedTrust: 0.9,
      });
    }
    console.log(
      `[Intervention] inoculation @ tick ${tick} for ${articleId} -> ${targets.join(", ")}`
    );
  }

  _contentModeration(iv, articleId) {
    const maxHops = (iv.params && iv.params.maxHops != null) ? iv.params.maxHops : 2;
    const targets = iv.targetNodes || Object.keys(this.graph.nodes);

    for (const nodeId of targets) {
      const nodeInst = this.graph.nodes[nodeId];
      if (!nodeInst) continue;

      // Remove messages for this article that have travelled too far (proxy for viral spread)
      const state = nodeInst.read();
      const before = state.inbox.length;
      state.inbox = state.inbox.filter(
        (m) => !(m.articleId === articleId && m.hops > maxHops)
      );
      if (state.inbox.length < before) {
        const { writeJSON } = require("./fileIO");
        writeJSON(nodeInst.filePath, state);
        console.log(
          `[Intervention] content_moderation removed ${before - state.inbox.length} ` +
          `message(s) from ${nodeId}`
        );
      }
    }
  }
}

module.exports = InterventionEngine;
