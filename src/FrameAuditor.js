/**
 * Layer 2 — Content-level analysis
 *
 * Runs alongside the QA auditor in the audit phase. For each reinterpreted
 * or forwarded message, it measures:
 *
 *   - frameShift      0–1    How much the framing changed from the original
 *   - sentiment       -1–1   Emotional valence of the rewritten text
 *   - sentimentDelta  float  Change in sentiment from original to rewritten
 *   - newClaims       [str]  Claims present in rewrite but absent in original
 *   - coherenceScore  0–1    How coherent the rewritten article is as information
 *
 * Results are written back into the history event as a `frameAnalysis` field.
 *
 * Dry-run: the frame analysis userPrompt always contains FRAME_ANALYSIS_QUERY,
 * which the dry-run interceptor in llmClient.js detects and mocks.
 */

const { callLLM } = require("./llmClient");

class FrameAuditor {
  constructor(modelId) {
    this.modelId = modelId;
  }

  // Returns frame analysis object for a (original, rewritten) pair.
  async analyze(originalText, rewrittenText) {
    const systemPrompt =
      "You are a media framing and misinformation analyst. " +
      "Given an original text and a rewritten version, analyse key dimensions. " +
      "Return only valid JSON with these exact keys: " +
      "{\"frameShift\":0.0,\"sentiment\":0.0,\"sentimentDelta\":0.0," +
      "\"newClaims\":[],\"coherenceScore\":0.0}";

    const userPrompt =
      `Original:\n${originalText.slice(0, 600)}\n\n` +
      `Rewritten:\n${rewrittenText.slice(0, 600)}\n\n` +
      `FRAME_ANALYSIS_QUERY Analyse and return only the JSON object with:\n` +
      `- frameShift: 0.0 (same frame) to 1.0 (completely different framing)\n` +
      `- sentiment: -1.0 (very negative) to 1.0 (very positive) of the rewritten text\n` +
      `- sentimentDelta: change in sentiment (rewritten minus original)\n` +
      `- newClaims: array of strings — claims in rewrite not present in original\n` +
      `- coherenceScore: 0.0 to 1.0 (how coherent is the rewrite as information)`;

    const raw = await callLLM(this.modelId, systemPrompt, userPrompt);
    return FrameAuditor._parse(raw);
  }

  static _parse(raw) {
    try {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return FrameAuditor._defaultResult();
      const p = JSON.parse(m[0]);
      return {
        frameShift:     clamp(parseFloat(p.frameShift)     || 0, 0, 1),
        sentiment:      clamp(parseFloat(p.sentiment)      || 0, -1, 1),
        sentimentDelta: clamp(parseFloat(p.sentimentDelta) || 0, -2, 2),
        newClaims:      Array.isArray(p.newClaims) ? p.newClaims : [],
        coherenceScore: clamp(parseFloat(p.coherenceScore) || 1, 0, 1),
      };
    } catch {
      return FrameAuditor._defaultResult();
    }
  }

  static _defaultResult() {
    return { frameShift: 0, sentiment: 0, sentimentDelta: 0, newClaims: [], coherenceScore: 1 };
  }
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

module.exports = FrameAuditor;
