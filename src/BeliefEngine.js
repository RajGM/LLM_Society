/**
 * Layer 1 — Node-level cognition
 *
 * Manages per-node belief state persisted in experiments/{id}/beliefs/{nodeId}.json.
 * Beliefs survive across articles (cross-article memory) and across ticks.
 *
 * Belief file schema:
 * {
 *   nodeId,
 *   topicBeliefs: {
 *     [articleId]: { stance, confidence, encounterCount, lastUpdatedTick }
 *   },
 *   emotionalState: { emotion, intensity, lastUpdatedTick }
 * }
 *
 * Two effects on decision-making:
 *   1. Confirmation bias  — alignment score shifts action weight sampling.
 *   2. Emotional priming  — high intensity increases reinterpret probability.
 */

const path = require("path");
const { readJSON, writeJSON, fileExists, ensureDir } = require("./fileIO");
const { callLLM } = require("./llmClient");

const EMOTION_DECAY = 0.85; // intensity multiplied each tick

class BeliefEngine {
  // ── File helpers ───────────────────────────────────────────────────────────

  static _beliefsPath(nodeId, experimentDir) {
    return path.join(experimentDir, "beliefs", `${nodeId}.json`);
  }

  static init(nodeId, experimentDir) {
    ensureDir(path.join(experimentDir, "beliefs"));
    const fp = BeliefEngine._beliefsPath(nodeId, experimentDir);
    if (fileExists(fp)) return; // idempotent for resume
    writeJSON(fp, {
      nodeId,
      topicBeliefs: {},
      emotionalState: { emotion: "calm", intensity: 0.0, lastUpdatedTick: 0 },
    });
  }

  static read(nodeId, experimentDir) {
    const fp = BeliefEngine._beliefsPath(nodeId, experimentDir);
    if (!fileExists(fp)) {
      BeliefEngine.init(nodeId, experimentDir);
    }
    return readJSON(fp);
  }

  static write(beliefs, experimentDir) {
    writeJSON(BeliefEngine._beliefsPath(beliefs.nodeId, experimentDir), beliefs);
  }

  // ── Alignment scoring ──────────────────────────────────────────────────────

  // Returns alignment ∈ [0,1]: 1 = perfectly aligned with existing belief.
  // Falls back to neutral (0.5) when no prior belief exists.
  static async computeAlignment(content, articleId, beliefs, persona, modelId) {
    const prior = beliefs.topicBeliefs[articleId];
    if (!prior || !prior.stance) return 0.5; // no prior belief → neutral

    const systemPrompt =
      "You assess how aligned a piece of text is with a stated stance. " +
      "Return only JSON in this exact format: {\"alignment\":0.0}";

    const userPrompt =
      `Stance: ${prior.stance}\n\n` +
      `Text: ${content}\n\n` +
      `Rate alignment 0.0 (completely opposed) to 1.0 (fully aligned). ` +
      `BELIEF_ALIGNMENT_QUERY Return only JSON {\"alignment\":VALUE}.`;

    const raw = await callLLM(modelId, systemPrompt, userPrompt);
    try {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return 0.5;
      const parsed = JSON.parse(m[0]);
      const v = parseFloat(parsed.alignment);
      return isNaN(v) ? 0.5 : Math.max(0, Math.min(1, v));
    } catch {
      return 0.5;
    }
  }

  // ── Action weight modification (confirmation bias) ─────────────────────────

  // Alignment ↑ → forward probability ↑, drop probability ↓
  // Alignment ↓ → drop probability ↑ (confirmation bias: reject disconfirming info)
  // Emotional intensity ↑ → reinterpret probability ↑ (emotionally charged sharing)
  static modifyActionWeights(baseWeights, alignment, emotionalIntensity) {
    const w = { ...baseWeights };
    const biasFactor = (alignment - 0.5) * 0.3; // ±0.15 max swing

    w.forward = Math.max(0.05, (w.forward || 0) + biasFactor);
    w.drop = Math.max(0.05, (w.drop || 0) - biasFactor);
    w.reinterpret = Math.max(0.05, (w.reinterpret || 0) + emotionalIntensity * 0.15);

    // Renormalize
    const total = Object.values(w).reduce((s, v) => s + v, 0);
    for (const k of Object.keys(w)) w[k] = w[k] / total;
    return w;
  }

  // ── Belief update ──────────────────────────────────────────────────────────

  // Called after a node takes an action on a message. Updates the node's
  // topicBelief for this article and adjusts emotional state based on action + MI.
  static async updateAfterAction(
    content, articleId, action, nodeId, experimentDir, persona, modelId, tick
  ) {
    const beliefs = BeliefEngine.read(nodeId, experimentDir);
    const prior = beliefs.topicBeliefs[articleId] || {
      stance: null, confidence: 0.5, encounterCount: 0, lastUpdatedTick: 0,
    };

    // Only update stance when node actively engaged (not dropped)
    if (action !== "drop" && action !== "dump") {
      const systemPrompt =
        "You maintain a belief stance on a topic as it evolves through exposure to information. " +
        "Return only JSON in this exact format: {\"stance\":\"text\",\"confidence\":0.0}";

      const currentStance = prior.stance || "No prior opinion formed.";
      const userPrompt =
        `Your current stance: ${currentStance}\n\n` +
        `You just ${action}ed this message: ${content.slice(0, 400)}\n\n` +
        `Persona context: ${persona.name}.\n\n` +
        `BELIEF_UPDATE_QUERY Update your stance. Return only JSON {\"stance\":\"...\",\"confidence\":0.0-1.0}.`;

      try {
        const raw = await callLLM(modelId, systemPrompt, userPrompt);
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) {
          const parsed = JSON.parse(m[0]);
          if (parsed.stance) prior.stance = parsed.stance;
          if (parsed.confidence !== undefined) prior.confidence = parseFloat(parsed.confidence);
        }
      } catch {
        // Keep prior stance on parse failure
      }
    }

    prior.encounterCount = (prior.encounterCount || 0) + 1;
    prior.lastUpdatedTick = tick;
    beliefs.topicBeliefs[articleId] = prior;

    // Emotional spike: engaging content (reinterpret) raises intensity
    if (action === "reinterpret") {
      beliefs.emotionalState.intensity = Math.min(1.0, beliefs.emotionalState.intensity + 0.25);
      beliefs.emotionalState.emotion = "excited";
    } else if (action === "drop") {
      beliefs.emotionalState.intensity = Math.min(1.0, beliefs.emotionalState.intensity + 0.10);
      beliefs.emotionalState.emotion = "skeptical";
    }
    beliefs.emotionalState.lastUpdatedTick = tick;

    BeliefEngine.write(beliefs, experimentDir);
  }

  // ── Emotional decay ────────────────────────────────────────────────────────

  static decayEmotion(nodeId, experimentDir, tick) {
    const beliefs = BeliefEngine.read(nodeId, experimentDir);
    beliefs.emotionalState.intensity *= EMOTION_DECAY;
    if (beliefs.emotionalState.intensity < 0.02) {
      beliefs.emotionalState.intensity = 0;
      beliefs.emotionalState.emotion = "calm";
    }
    beliefs.emotionalState.lastUpdatedTick = tick;
    BeliefEngine.write(beliefs, experimentDir);
  }

  // ── Emotional spike from high-MI audit (called after audit phase) ──────────

  static spikeFromMI(nodeId, experimentDir, misinfoIndex, tick) {
    if (misinfoIndex === null) return;
    const beliefs = BeliefEngine.read(nodeId, experimentDir);
    if (misinfoIndex > 3) {
      beliefs.emotionalState.intensity = Math.min(1.0, beliefs.emotionalState.intensity + 0.3);
      beliefs.emotionalState.emotion = "alarmed";
    }
    beliefs.emotionalState.lastUpdatedTick = tick;
    BeliefEngine.write(beliefs, experimentDir);
  }
}

module.exports = BeliefEngine;
