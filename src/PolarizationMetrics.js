/**
 * Polarization Metrics — pure static class, no LLM calls.
 *
 * Composite Polarization Index (PI):
 *   PI = w1·bimodality + w2·trustBifurcation + w3·modularity + w4·extremity
 *
 * All component scores are normalised to [0, 1].
 */

const path = require("path");
const fs   = require("fs");
const { readJSON, fileExists } = require("./fileIO");

const DEFAULT_WEIGHTS = { bimodality: 0.30, trustBifurcation: 0.20, modularity: 0.30, extremity: 0.20 };

class PolarizationMetrics {
  // ── Polarization Index ────────────────────────────────────────────────────

  static polarizationIndex(snapshot, weights = {}) {
    const w = { ...DEFAULT_WEIGHTS, ...weights };
    const pi =
      w.bimodality       * (snapshot.bimodality       ?? 0) +
      w.trustBifurcation * (snapshot.trustBifurcation ?? 0) +
      w.modularity       * (snapshot.modularity       ?? 0) +
      w.extremity        * (snapshot.extremity        ?? 0);
    return Math.min(1, Math.max(0, pi));
  }

  // ── Phase transition detection — sliding-window change-point ─────────────

  static detectPhaseTransition(piTrajectory, windowSize = 3, threshold = 0.15) {
    const n = piTrajectory.length;
    if (n < windowSize * 2) {
      return { transitionCycle: null, jumpMagnitude: 0, confidence: 0, isSignificant: false };
    }

    let maxJump = 0;
    let transitionCycle = null;

    for (let i = windowSize; i <= n - windowSize; i++) {
      const pre  = piTrajectory.slice(i - windowSize, i);
      const post = piTrajectory.slice(i, i + windowSize);
      const preMean  = pre.reduce((s, x) => s + x, 0)  / pre.length;
      const postMean = post.reduce((s, x) => s + x, 0) / post.length;
      const jump = postMean - preMean;
      if (jump > maxJump) {
        maxJump = jump;
        transitionCycle = i + 1; // 1-indexed cycle number
      }
    }

    const isSignificant = maxJump > threshold;
    const confidence    = Math.min(1, maxJump / (threshold * 2));
    return { transitionCycle, jumpMagnitude: maxJump, confidence, isSignificant };
  }

  // ── Newman-Girvan modularity Q ────────────────────────────────────────────
  // Community assignment: belief stance for the given article.

  static computeModularity(topology, beliefs, articleId) {
    const nodes = topology.nodes || [];
    const edges = topology.edges || [];
    const m = edges.length;
    if (m === 0 || nodes.length === 0) return 0;

    // Assign community: 0 = pro/supportive, 1 = con/skeptical
    const community = {};
    for (const n of nodes) {
      const belief = beliefs[n.nodeId];
      const stance = (
        belief?.topicBeliefs?.[articleId]?.stance ?? ""
      ).toLowerCase();
      if (/support|agree|true|affirm|confirm/.test(stance)) community[n.nodeId] = 0;
      else if (/skeptic|disagree|false|deny|refute/.test(stance))  community[n.nodeId] = 1;
      else community[n.nodeId] = 0;
    }

    // Degree of each node
    const degree = {};
    for (const n of nodes) degree[n.nodeId] = 0;
    for (const e of edges) {
      degree[e.from] = (degree[e.from] || 0) + 1;
      degree[e.to]   = (degree[e.to]   || 0) + 1;
    }

    const adjSet = new Set(edges.map((e) => `${e.from}:${e.to}`));
    const nodeIds = nodes.map((n) => n.nodeId);

    let Q = 0;
    for (const ni of nodeIds) {
      for (const nj of nodeIds) {
        if (community[ni] !== community[nj]) continue;
        const A_ij    = adjSet.has(`${ni}:${nj}`) ? 1 : 0;
        const expected = ((degree[ni] || 0) * (degree[nj] || 0)) / (2 * m);
        Q += A_ij - expected;
      }
    }
    Q /= 2 * m;
    return Math.max(0, Math.min(1, Q));
  }

  // ── Homophily — fraction of edges between same-tag personas ──────────────

  static computeHomophily(topology) {
    const edges = topology.edges || [];
    if (edges.length === 0) return 0;

    const nodeMap = {};
    for (const n of (topology.nodes || [])) nodeMap[n.nodeId] = n;

    let sameTag = 0;
    for (const e of edges) {
      const nFrom = nodeMap[e.from];
      const nTo   = nodeMap[e.to];
      if (!nFrom || !nTo) continue;
      const tagsFrom = new Set(nFrom.tags || []);
      const tagsTo   = new Set(nTo.tags   || []);
      if ([...tagsFrom].some((t) => tagsTo.has(t))) sameTag++;
    }
    return sameTag / edges.length;
  }

  // ── Trust statistics ──────────────────────────────────────────────────────

  static trustStats(edges) {
    if (!edges || edges.length === 0) {
      return { mean: 0, variance: 0, skewness: 0, fractionBroken: 0, fractionStrong: 0 };
    }
    const trusts = edges.map((e) => e.trust ?? 0.5);
    const mean   = trusts.reduce((s, t) => s + t, 0) / trusts.length;
    const variance = trusts.reduce((s, t) => s + (t - mean) ** 2, 0) / trusts.length;
    const std      = Math.sqrt(variance);
    const skewness = std > 0
      ? trusts.reduce((s, t) => s + ((t - mean) / std) ** 3, 0) / trusts.length
      : 0;
    const fractionBroken = trusts.filter((t) => t < 0.20).length / trusts.length;
    const fractionStrong = trusts.filter((t) => t > 0.75).length / trusts.length;
    return { mean, variance, skewness, fractionBroken, fractionStrong };
  }

  // ── Opinion / belief statistics ───────────────────────────────────────────

  static opinionStats(beliefs, articleId) {
    const stances     = [];
    const confidences = [];

    for (const belief of Object.values(beliefs)) {
      const tb = belief?.topicBeliefs?.[articleId];
      if (!tb) continue;
      if (tb.stance)                          stances.push(tb.stance.toLowerCase());
      if (typeof tb.confidence === "number")  confidences.push(tb.confidence);
    }

    if (confidences.length === 0) {
      return { bimodality: 0, modeSeparation: 0, extremeFraction: 0, type: "none", count: 0 };
    }

    const mean = confidences.reduce((s, c) => s + c, 0) / confidences.length;
    const variance = confidences.reduce((s, c) => s + (c - mean) ** 2, 0) / confidences.length;
    const std      = Math.sqrt(variance);

    const skewness = std > 0
      ? confidences.reduce((s, c) => s + ((c - mean) / std) ** 3, 0) / confidences.length
      : 0;
    const kurtosis = std > 0
      ? confidences.reduce((s, c) => s + ((c - mean) / std) ** 4, 0) / confidences.length
      : 3;

    // Bimodality coefficient: B = (skewness² + 1) / kurtosis
    // B > 5/9 ≈ 0.555 is the bimodality threshold.
    const B          = (skewness ** 2 + 1) / Math.max(1, kurtosis);
    const bimodality = Math.min(1, B / 1.5);

    // Mode separation across pro/con stances
    const proConf = [];
    const conConf = [];
    for (let i = 0; i < stances.length; i++) {
      const s = stances[i];
      const c = confidences[i] ?? 0.5;
      if (/support|agree|true|affirm/.test(s))  proConf.push(c);
      else if (/skeptic|disagree|false|deny/.test(s)) conConf.push(c);
    }
    const proMean = proConf.length > 0 ? proConf.reduce((s, c) => s + c, 0) / proConf.length : 0.5;
    const conMean = conConf.length > 0 ? conConf.reduce((s, c) => s + c, 0) / conConf.length : 0.5;
    const modeSeparation = Math.abs(proMean - conMean);

    const extremeFraction = confidences.filter((c) => c > 0.75).length / confidences.length;

    let type;
    if (bimodality > 0.6 && modeSeparation > 0.3) type = "polarized";
    else if (extremeFraction > 0.5)                type = "extreme";
    else if (variance > 0.04)                      type = "dispersed";
    else                                           type = "neutral";

    return { bimodality, modeSeparation, extremeFraction, type, count: confidences.length };
  }

  // ── Cluster detection — histogram peak counting ───────────────────────────

  static detectClusters(topology, beliefs, articleId) {
    const confidences = [];
    for (const belief of Object.values(beliefs)) {
      const tb = belief?.topicBeliefs?.[articleId];
      if (tb && typeof tb.confidence === "number") confidences.push(tb.confidence);
    }

    if (confidences.length === 0) return { numPeaks: 1, histogram: [] };

    const bins = new Array(10).fill(0);
    for (const c of confidences) {
      bins[Math.min(9, Math.floor(c * 10))]++;
    }

    let numPeaks = 0;
    for (let i = 1; i < bins.length - 1; i++) {
      if (bins[i] > bins[i - 1] && bins[i] > bins[i + 1]) numPeaks++;
    }
    return { numPeaks: numPeaks || 1, histogram: bins };
  }

  // ── Full snapshot from an experiment directory ────────────────────────────

  static snapshot(experimentDir, cycle, articleId) {
    const topoPath = path.join(experimentDir, "graph_topology.json");
    const topology = fileExists(topoPath) ? readJSON(topoPath) : { nodes: [], edges: [] };

    // Load belief files if present
    const beliefs    = {};
    const beliefsDir = path.join(experimentDir, "beliefs");
    if (fs.existsSync(beliefsDir)) {
      for (const f of fs.readdirSync(beliefsDir)) {
        if (!f.endsWith(".json")) continue;
        const nodeId    = f.replace(".json", "");
        beliefs[nodeId] = readJSON(path.join(beliefsDir, f));
      }
    }

    const trust    = PolarizationMetrics.trustStats(topology.edges);
    const opinions = PolarizationMetrics.opinionStats(beliefs, articleId);
    const clusters = PolarizationMetrics.detectClusters(topology, beliefs, articleId);
    const homophily  = PolarizationMetrics.computeHomophily(topology);
    const modularity = PolarizationMetrics.computeModularity(topology, beliefs, articleId);

    // Normalise trust variance: max theoretical variance for U[0,1] is 1/12 ≈ 0.083
    const trustBifurcation = Math.min(1, trust.variance / 0.083);

    return {
      cycle,
      articleId,
      experimentDir,
      bimodality:       opinions.bimodality,
      trustBifurcation,
      modularity,
      extremity:        opinions.extremeFraction,
      homophily,
      trustStats:       trust,
      opinionStats:     opinions,
      clusters,
      nodeCount: (topology.nodes || []).length,
      edgeCount: (topology.edges || []).length,
    };
  }
}

module.exports = PolarizationMetrics;
