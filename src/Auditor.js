const { callLLM } = require("./llmClient");

class Auditor {
  constructor(modelId, articles, scoringMode = "discrete") {
    this.modelId = modelId;
    this.scoringMode = scoringMode;
    this.articleMap = {};
    for (const art of articles) {
      this.articleMap[art.id] = {
        questions: art.questions,
        groundTruth: art.groundTruth,
      };
    }
  }

  // Returns IFD object: { mi, cr, mr, ir, cms, ie, scores, mode, [dual] }
  // mi is always the discrete-equivalent integer (or float in continuous mode)
  // for backward-compatible trust evolution and MPR computation.
  async score(articleId, text) {
    const art = this.articleMap[articleId];
    if (!art) throw new Error(`Unknown articleId: ${articleId}`);

    if (this.scoringMode === "continuous") {
      const scores = await this._getContinuousScores(text, art.questions, art.groundTruth);
      return Auditor.computeIFD(scores, "continuous");
    }

    if (this.scoringMode === "dual") {
      // Both LLM calls issued in parallel — no extra latency vs sequential
      const [discScores, contScores] = await Promise.all([
        this._getIFDScores(text, art.questions, art.groundTruth),
        this._getContinuousScores(text, art.questions, art.groundTruth),
      ]);
      return Auditor.computeDual(discScores, contScores);
    }

    const scores = await this._getIFDScores(text, art.questions, art.groundTruth);
    return Auditor.computeIFD(scores, "discrete");
  }

  // ── Private LLM callers ────────────────────────────────────────────────────

  async _getIFDScores(text, questions, groundTruth) {
    const systemPrompt = [
      "You are a fact-checker. For each question, the expected correct answer is provided.",
      "Evaluate the given text and return a score for each question:",
      "  1  = text correctly states the expected answer",
      "  0  = text does not contain enough information to address the question",
      " -1  = text contradicts or distorts the expected answer",
      'Return only a JSON object: {"answers": [1, 0, -1, ...]}',
    ].join("\n");

    const questionsFormatted = questions
      .map((q, i) => `${i + 1}. ${q} (expected: ${groundTruth[i] ? "Yes" : "No"})`)
      .join("\n");

    const userPrompt =
      `Text:\n${text}\n\nQuestions (with expected answers):\n${questionsFormatted}` +
      `\n\nIFD_SCORE_QUERY: Return only the JSON with values 1, 0, or -1.`;

    const raw = await callLLM(this.modelId, systemPrompt, userPrompt);

    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in auditor response");
      const parsed = JSON.parse(match[0]);
      return parsed.answers.map((v) => {
        const n = Number(v);
        if (n === 1) return 1;
        if (n === -1) return -1;
        return 0;
      });
    } catch (e) {
      console.warn(`Auditor IFD parse error: ${e.message}. Defaulting all to correct.`);
      return questions.map(() => 1);
    }
  }

  async _getContinuousScores(text, questions, groundTruth) {
    const systemPrompt = [
      "You are a fact-checker. For each question, the expected correct answer is provided.",
      "Rate how accurately the given text addresses each question on a scale from 0.0 to 1.0:",
      "  1.0 = text fully and correctly states the expected answer",
      "  0.5 = text does not address this question (information is missing or neutral)",
      "  0.0 = text directly contradicts or inverts the expected answer",
      "Intermediate values represent partial accuracy (e.g. 0.8 = mostly correct, 0.2 = mostly wrong).",
      'Return only a JSON object: {"scores": [1.0, 0.5, 0.8, ...]}',
    ].join("\n");

    const questionsFormatted = questions
      .map((q, i) => `${i + 1}. ${q} (expected: ${groundTruth[i] ? "Yes" : "No"})`)
      .join("\n");

    const userPrompt =
      `Text:\n${text}\n\nQuestions (with expected answers):\n${questionsFormatted}` +
      `\n\nCONTINUOUS_SCORE_QUERY: Return only the JSON with float scores 0.0 to 1.0.`;

    const raw = await callLLM(this.modelId, systemPrompt, userPrompt);

    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in auditor response");
      const parsed = JSON.parse(match[0]);
      return parsed.scores.map((v) => Math.max(0, Math.min(1, Number(v))));
    } catch (e) {
      console.warn(`Auditor continuous parse error: ${e.message}. Defaulting all to 1.0.`);
      return questions.map(() => 1.0);
    }
  }

  // ── Pure static methods ────────────────────────────────────────────────────

  // Compute IFD from a scores array in a single mode.
  static computeIFD(scores, mode = "discrete") {
    const m = scores.length;
    if (m === 0) return { mi: 0, cr: 1, mr: 0, ir: 0, cms: 0, ie: 0, scores: [], mode };

    const safelog = (p) => (p > 0 ? p * Math.log2(p) : 0);

    if (mode === "continuous") {
      const cr = scores.reduce((s, v) => s + v, 0) / m;
      const correctCount   = scores.filter((s) => s >= 0.67).length;
      const incorrectCount = scores.filter((s) => s <= 0.33).length;
      const missingCount   = m - correctCount - incorrectCount;
      const mr  = missingCount   / m;
      const ir  = incorrectCount / m;
      const mi  = m * (1 - cr);
      const cms = (1 - cr) / (cr + 1e-9);
      const ie  = -(safelog(cr) + safelog(1 - cr));
      return { mi, cr, mr, ir, cms, ie, scores, mode: "continuous" };
    }

    // Discrete: scores are -1 / 0 / +1
    const correctCount   = scores.filter((s) => s ===  1).length;
    const missingCount   = scores.filter((s) => s ===  0).length;
    const incorrectCount = scores.filter((s) => s === -1).length;
    const cr  = correctCount   / m;
    const mr  = missingCount   / m;
    const ir  = incorrectCount / m;
    const mi  = missingCount + incorrectCount;
    const cms = ir / (cr + 1e-9);
    const ie  = -(safelog(cr) + safelog(mr) + safelog(ir));
    return { mi, cr, mr, ir, cms, ie, scores, mode: "discrete" };
  }

  // Compute dual IFD: runs both scorers and computes gap + agreement.
  // Top-level fields mirror discrete for backward compat (misinfoIndex, trust, MPR).
  // Full breakdown in .dual: { discrete, continuous, gap, agreement }
  static computeDual(discScores, contScores) {
    const discrete   = Auditor.computeIFD(discScores, "discrete");
    const continuous = Auditor.computeIFD(contScores, "continuous");

    // Normalize discrete [-1,0,+1] → [0,0.5,1] to put both on the same axis for Pearson
    const discNorm = discScores.map((s) => (s + 1) / 2);
    const agreement = Auditor._pearsonR(discNorm, contScores);

    const gap = Math.abs(discrete.mi - continuous.mi);

    return {
      // Top-level = discrete IFD for all existing consumers (trust evolution, MPR, severity)
      ...discrete,
      mode: "dual",
      dual: { discrete, continuous, gap, agreement },
    };
  }

  // Pearson correlation coefficient between two equal-length arrays.
  static _pearsonR(xs, ys) {
    const n = xs.length;
    if (n < 2) return null;
    const mx = xs.reduce((s, v) => s + v, 0) / n;
    const my = ys.reduce((s, v) => s + v, 0) / n;
    let num = 0, dx2 = 0, dy2 = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - mx;
      const dy = ys[i] - my;
      num += dx * dy;
      dx2 += dx * dx;
      dy2 += dy * dy;
    }
    const denom = Math.sqrt(dx2 * dy2);
    return denom > 0 ? num / denom : null;
  }

  // Compute MPR (mean MI) — backward compatible across all three modes
  static computeMPR(historyEntries) {
    const scored = historyEntries.filter((e) => e.misinfoIndex !== null);
    if (scored.length === 0) return 0;
    return scored.reduce((acc, e) => acc + e.misinfoIndex, 0) / scored.length;
  }

  // Severity classification — works for integer and float MI
  static severity(mpr) {
    if (mpr <= 1) return "factual_error";
    if (mpr <= 3) return "lie";
    return "propaganda";
  }
}

module.exports = Auditor;
