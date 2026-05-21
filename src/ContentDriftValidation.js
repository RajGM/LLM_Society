/**
 * Content Drift Validation — Level 4 validation.
 *
 * Measures how content changes as it propagates through the simulated
 * cascade: sentiment trajectory, frame shifts, new claim injection.
 *
 * When real quote-tweet / reply text is available it can be compared
 * against the simulated drift. Without real content data this module
 * still characterises the simulated drift for internal analysis.
 */

const path = require("path");
const { readJSON, fileExists } = require("./fileIO");
const ValidationMetrics = require("./ValidationMetrics");
const ValidationComparison = require("./ValidationComparison");

class ContentDriftValidation {

  // ── Simulated content drift ────────────────────────────────────────────────

  /**
   * Extract content drift statistics from a simulation experiment.
   *
   * @param {string} experimentDir
   * @param {string} articleId
   * @returns {Object} sentimentTrajectory, frameShifts, claimInjection summary
   */
  static extractSimDrift(experimentDir, articleId) {
    const nodesData = ValidationMetrics._loadAllNodes(experimentDir);

    const byDepth    = {}; // depth → [sentiments]
    const frameShifts = [];
    const allNewClaims = [];
    let   totalReinterpreted = 0;
    let   totalForwarded     = 0;

    for (const [nodeId, nodeData] of Object.entries(nodesData)) {
      const events = (nodeData.history || []).filter(
        (e) => e.articleId === articleId
      );

      for (const ev of events) {
        const depth = (ev.provenance || []).length - 1;

        if (ev.action === "reinterpret") totalReinterpreted++;
        if (ev.action === "forward")     totalForwarded++;

        // Frame analysis data (if enableFrameAnalysis was on)
        if (ev.frameAnalysis) {
          const fa = ev.frameAnalysis;
          if (typeof fa.sentiment === "number") {
            if (!byDepth[depth]) byDepth[depth] = [];
            byDepth[depth].push(fa.sentiment);
          }
          if (typeof fa.frameShift === "number") {
            frameShifts.push({ depth, nodeId, frameShift: fa.frameShift });
          }
          if (Array.isArray(fa.newClaims)) {
            allNewClaims.push(...fa.newClaims);
          }
        }

        // MI trajectory as proxy for content drift if no frame analysis
        if (ev.misinfoIndex !== null && ev.misinfoIndex !== undefined) {
          if (!byDepth[depth]) byDepth[depth] = [];
          // Treat MI as negative sentiment proxy (higher MI = more negative drift)
          // Only if no frame analysis sentiment present
          if (!ev.frameAnalysis) {
            byDepth[depth].push(-ev.misinfoIndex);
          }
        }
      }
    }

    // Sentiment trajectory: mean sentiment at each depth level
    const sentimentTrajectory = Object.entries(byDepth)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([depth, sents]) => ({
        depth:   Number(depth),
        mean:    +_mean(sents).toFixed(4),
        std:     +_std(sents).toFixed(4),
        n:       sents.length,
      }));

    const meanFrameShift = frameShifts.length > 0
      ? _mean(frameShifts.map((f) => f.frameShift))
      : null;

    const reinterpretRate = (totalForwarded + totalReinterpreted) > 0
      ? totalReinterpreted / (totalForwarded + totalReinterpreted)
      : 0;

    return {
      sentimentTrajectory,
      meanFrameShift:      meanFrameShift !== null ? +meanFrameShift.toFixed(4) : null,
      frameShiftVariance:  frameShifts.length > 0
        ? +_variance(frameShifts.map((f) => f.frameShift)).toFixed(4) : null,
      totalNewClaims:      allNewClaims.length,
      uniqueNewClaims:     new Set(allNewClaims).size,
      reinterpretRate:     +reinterpretRate.toFixed(4),
      totalReinterpreted,
      totalForwarded,
    };
  }

  // ── Real content drift ────────────────────────────────────────────────────

  /**
   * Extract content drift from real cascade data.
   *
   * Requires quote-tweet or reply text in the cascade JSON:
   * retweets[i].text — the quote-tweet text (if available)
   *
   * Without text, returns null (caller should skip content comparison).
   */
  static extractRealDrift(cascade, articleText) {
    const retweets = cascade.retweets || cascade.replies || [];
    const textItems = retweets.filter((rt) => rt.text && rt.text.trim().length > 0);

    if (textItems.length === 0) return null;

    // Heuristic sentiment: count positive vs negative keywords (no LLM call here)
    const POS = /\bgood|great|true|correct|right|fact|confirm|accurate/gi;
    const NEG = /\bwrong|false|lie|fake|misinformation|mislead|distort|manipulate/gi;

    const byDepth = {};

    // Build depth map from retweet chain
    const parentOf = {};
    for (const rt of retweets) {
      const child  = String(rt.user_id || "");
      const parent = String(rt.retweeted_from || rt.replied_to || "");
      if (child && parent) parentOf[child] = parent;
    }

    const depthOf = (userId) => {
      let d = 0, cur = userId;
      const seen = new Set();
      while (parentOf[cur] && !seen.has(cur)) {
        seen.add(cur); cur = parentOf[cur]; d++;
      }
      return d;
    };

    for (const rt of textItems) {
      const userId = String(rt.user_id || "");
      const depth  = depthOf(userId);
      const text   = rt.text;

      const posCount = (text.match(POS) || []).length;
      const negCount = (text.match(NEG) || []).length;
      const sentiment = (posCount - negCount) / (posCount + negCount + 1);

      if (!byDepth[depth]) byDepth[depth] = [];
      byDepth[depth].push(sentiment);
    }

    const sentimentTrajectory = Object.entries(byDepth)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([depth, sents]) => ({
        depth:  Number(depth),
        mean:   +_mean(sents).toFixed(4),
        std:    +_std(sents).toFixed(4),
        n:      sents.length,
      }));

    return { sentimentTrajectory };
  }

  // ── Comparison ────────────────────────────────────────────────────────────

  /**
   * Compare real and simulated content drift.
   *
   * Returns contentCorrelation ∈ [-1, 1] and a qualitative match label.
   */
  static compare(simDrift, realDrift) {
    if (!realDrift || !realDrift.sentimentTrajectory || !simDrift.sentimentTrajectory) {
      return { contentCorrelation: 0, available: false, note: "Real content text not available" };
    }

    // Align by depth
    const realByDepth = Object.fromEntries(
      realDrift.sentimentTrajectory.map((d) => [d.depth, d.mean])
    );
    const simByDepth  = Object.fromEntries(
      simDrift.sentimentTrajectory.map((d) => [d.depth, d.mean])
    );

    const commonDepths = Object.keys(realByDepth)
      .filter((d) => simByDepth[d] !== undefined)
      .map(Number)
      .sort((a, b) => a - b);

    if (commonDepths.length < 2) {
      return { contentCorrelation: 0, available: true, note: "Insufficient depth overlap" };
    }

    const realSents = commonDepths.map((d) => realByDepth[d]);
    const simSents  = commonDepths.map((d) => simByDepth[d]);

    const r = ValidationComparison._pearsonR(realSents, simSents);

    let label;
    if (r > 0.70)       label = "strong_match";
    else if (r > 0.40)  label = "moderate_match";
    else if (r > 0.10)  label = "weak_match";
    else if (r > -0.10) label = "no_correlation";
    else                label = "inverse_correlation";

    return {
      contentCorrelation: +r.toFixed(4),
      available:          true,
      matchLabel:         label,
      commonDepths:       commonDepths.length,
    };
  }
}

function _mean(arr) {
  return arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length;
}

function _std(arr) {
  if (arr.length === 0) return 0;
  const m = _mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

function _variance(arr) {
  if (arr.length === 0) return 0;
  const m = _mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
}

module.exports = ContentDriftValidation;
