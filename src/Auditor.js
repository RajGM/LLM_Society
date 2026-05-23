const { callLLM } = require("./llmClient");

class Auditor {
  constructor(modelId, articles) {
    this.modelId = modelId;
    this.articleMap = {};
    for (const art of articles) {
      this.articleMap[art.id] = {
        questions: art.questions,
        groundTruth: art.groundTruth,
      };
    }
  }

  // Returns IFD object: { mi, cr, mr, ir, cms, ie, scores }
  // mi is backward-compatible integer count (missing + incorrect)
  async score(articleId, text) {
    const art = this.articleMap[articleId];
    if (!art) throw new Error(`Unknown articleId: ${articleId}`);
    const scores = await this._getIFDScores(text, art.questions, art.groundTruth);
    return Auditor.computeIFD(scores);
  }

  // Three-way LLM scoring: returns array of -1 (incorrect), 0 (missing), or 1 (correct)
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

    const userPrompt = `Text:\n${text}\n\nQuestions (with expected answers):\n${questionsFormatted}\n\nIFD_SCORE_QUERY: Return only the JSON with values 1, 0, or -1.`;

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

  // Pure function: compute IFD metrics from a scores array of -1/0/1
  static computeIFD(scores) {
    const m = scores.length;
    if (m === 0) return { mi: 0, cr: 1, mr: 0, ir: 0, cms: 0, ie: 0, scores: [] };

    const correctCount   = scores.filter((s) => s ===  1).length;
    const missingCount   = scores.filter((s) => s ===  0).length;
    const incorrectCount = scores.filter((s) => s === -1).length;

    const cr = correctCount   / m;
    const mr = missingCount   / m;
    const ir = incorrectCount / m;

    // Backward-compatible MI: count of non-correct answers
    const mi = missingCount + incorrectCount;

    // CMS = IR / (CR + ε) — ratio of distortion to remaining accuracy
    const cms = ir / (cr + 1e-9);

    // Shannon entropy over the three information states
    const safelog = (p) => (p > 0 ? p * Math.log2(p) : 0);
    const ie = -(safelog(cr) + safelog(mr) + safelog(ir));

    return { mi, cr, mr, ir, cms, ie, scores };
  }

  // Compute MPR (mean MI) for a branch history array — backward compatible
  static computeMPR(historyEntries) {
    const scored = historyEntries.filter((e) => e.misinfoIndex !== null);
    if (scored.length === 0) return 0;
    const sum = scored.reduce((acc, e) => acc + e.misinfoIndex, 0);
    return sum / scored.length;
  }

  // Classify MPR into severity tier
  static severity(mpr) {
    if (mpr <= 1) return "factual_error";
    if (mpr <= 3) return "lie";
    return "propaganda";
  }
}

module.exports = Auditor;
