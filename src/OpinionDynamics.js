/**
 * Extension 8 — Population-level Opinion Dynamics
 *
 * Models three classic opinion dynamics processes on top of the simulation's
 * belief-state outputs. Run after the full audit phase to project long-run
 * opinion trajectories without modifying simulation state.
 *
 * Models:
 *   DeGroot           — iterative averaging weighted by the trust matrix
 *   BoundedConfidence — Hegselmann-Krause: update only within ε of own opinion
 *   VoterModel        — stochastic adoption of a random neighbour's opinion
 *
 * Opinions are extracted from BeliefEngine confidence values for an article.
 * Value range [0, 1]: 0 = uncertain / no opinion, 1 = fully confident.
 *
 * Requires enableBeliefs: true (otherwise all opinions default to 0.5).
 */

const path = require("path");
const { readJSON, fileExists } = require("./fileIO");

class OpinionDynamics {
  // ── Opinion extraction ─────────────────────────────────────────────────────

  // Returns { [nodeId]: opinion ∈ [0,1] } from belief files.
  static extractOpinions(nodeIds, beliefsDir, articleId) {
    const opinions = {};
    for (const nodeId of nodeIds) {
      const fp = path.join(beliefsDir, `${nodeId}.json`);
      if (fileExists(fp)) {
        const beliefs = readJSON(fp);
        const topic = beliefs.topicBeliefs && beliefs.topicBeliefs[articleId];
        opinions[nodeId] = topic ? (topic.confidence ?? 0.5) : 0.5;
      } else {
        opinions[nodeId] = 0.5;
      }
    }
    return opinions;
  }

  // ── DeGroot model ──────────────────────────────────────────────────────────

  // trustMatrix: row-stochastic { [fromId]: { [toId]: weight } }
  // Converges when max change < 1e-6 or steps exhausted.
  static simulateDeGroot(opinions, trustMatrix, steps = 50) {
    const nodeIds = Object.keys(opinions);
    let current = { ...opinions };
    const trajectory = [{ ...current }];

    for (let s = 0; s < steps; s++) {
      const next = {};
      let maxChange = 0;

      for (const nodeId of nodeIds) {
        const weights = trustMatrix[nodeId] || {};
        let weightSum = 0;
        let weightedOpinion = 0;

        for (const [neighbor, w] of Object.entries(weights)) {
          if (current[neighbor] !== undefined) {
            weightedOpinion += w * current[neighbor];
            weightSum += w;
          }
        }

        // Self fills remainder to preserve row-stochastic property
        const selfWeight = Math.max(0, 1 - weightSum);
        next[nodeId] = weightedOpinion + selfWeight * current[nodeId];
        maxChange = Math.max(maxChange, Math.abs(next[nodeId] - current[nodeId]));
      }

      current = next;
      trajectory.push({ ...current });
      if (maxChange < 1e-6) break;
    }

    return {
      final: current,
      steps: trajectory.length - 1,
      trajectory,
      convergenceType: OpinionDynamics.classifyConvergence(current),
    };
  }

  // ── Bounded Confidence (Hegselmann-Krause) ─────────────────────────────────

  // x_i(t+1) = mean(x_j where |x_i - x_j| < epsilon and edge exists or j==i)
  // adjacency: { [nodeId]: [neighborId, ...] }
  static simulateBoundedConfidence(opinions, adjacency, epsilon = 0.3, steps = 50) {
    const nodeIds = Object.keys(opinions);
    let current = { ...opinions };
    const trajectory = [{ ...current }];

    for (let s = 0; s < steps; s++) {
      const next = {};
      let maxChange = 0;

      for (const nodeId of nodeIds) {
        const peers = [nodeId, ...(adjacency[nodeId] || [])];
        const inBound = peers.filter(
          (p) => current[p] !== undefined && Math.abs(current[nodeId] - current[p]) < epsilon
        );
        next[nodeId] =
          inBound.length > 0
            ? inBound.reduce((s, p) => s + current[p], 0) / inBound.length
            : current[nodeId];
        maxChange = Math.max(maxChange, Math.abs(next[nodeId] - current[nodeId]));
      }

      current = next;
      trajectory.push({ ...current });
      if (maxChange < 1e-6) break;
    }

    return {
      final: current,
      steps: trajectory.length - 1,
      trajectory,
      convergenceType: OpinionDynamics.classifyConvergence(current),
    };
  }

  // ── Voter model ────────────────────────────────────────────────────────────

  // Each node adopts a random neighbour's opinion each step.
  // Run `runs` times; report averaged final opinions and first-run trajectory.
  static simulateVoterModel(opinions, adjacency, steps = 100, runs = 10) {
    const nodeIds = Object.keys(opinions);
    const finalSums = Object.fromEntries(nodeIds.map((id) => [id, 0]));
    let firstTraj = null;

    for (let r = 0; r < runs; r++) {
      let current = { ...opinions };
      const traj = [{ ...current }];

      for (let s = 0; s < steps; s++) {
        const next = { ...current };
        for (const nodeId of nodeIds) {
          const neighbors = adjacency[nodeId] || [];
          if (neighbors.length > 0) {
            const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
            next[nodeId] = current[chosen];
          }
        }
        current = next;
        traj.push({ ...current });
      }

      for (const id of nodeIds) finalSums[id] += current[id];
      if (r === 0) firstTraj = traj;
    }

    const finalAvg = Object.fromEntries(
      nodeIds.map((id) => [id, finalSums[id] / runs])
    );

    return {
      final: finalAvg,
      steps,
      trajectory: firstTraj,
      convergenceType: OpinionDynamics.classifyConvergence(finalAvg),
    };
  }

  // ── Convergence classification ─────────────────────────────────────────────

  // consensus  — all opinions within 0.10 of each other
  // polarized  — bimodal: significant clusters near low and high extremes
  // fragmented — spread > 0.40 without clear clustering
  static classifyConvergence(opinions) {
    const vals = Object.values(opinions);
    if (vals.length === 0) return "unknown";

    const spread = Math.max(...vals) - Math.min(...vals);
    if (spread < 0.10) return "consensus";

    const low  = vals.filter((v) => v < 0.35).length;
    const high = vals.filter((v) => v > 0.65).length;
    const mid  = vals.length - low - high;

    if (
      low > vals.length * 0.25 &&
      high > vals.length * 0.25 &&
      mid < vals.length * 0.35
    ) {
      return "polarized";
    }
    return "fragmented";
  }

  // ── Compare all three models ───────────────────────────────────────────────

  static compare(opinions, trustMatrix, adjacency, params = {}) {
    const { steps = 50, epsilon = 0.3, voterRuns = 10 } = params;
    return {
      initialOpinions: { ...opinions },
      degroot:            OpinionDynamics.simulateDeGroot(opinions, trustMatrix, steps),
      boundedConfidence:  OpinionDynamics.simulateBoundedConfidence(opinions, adjacency, epsilon, steps),
      voter:              OpinionDynamics.simulateVoterModel(opinions, adjacency, steps, voterRuns),
    };
  }
}

module.exports = OpinionDynamics;
