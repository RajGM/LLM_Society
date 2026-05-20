/**
 * Extension 3 — Network Co-evolution
 *
 * After each article's audit phase, evolves the social graph based on
 * opinion similarity between node pairs:
 *
 *   σ_i = 2 * confidence_i - 1        (maps [0,1] confidence → [-1,1])
 *   α   = 1 - |σ_i - σ_j| / 2        (opinion alignment ∈ [0,1])
 *
 *   Edge creation: P_create = α × creationProb  (homophily-driven rewiring)
 *   Edge severing: remove edges where alignment < severingThreshold
 *                  AND current trust < 0.15 (already collapsed trust)
 *
 * Metrics returned per evolve() call:
 *   modularityQ    — Newman-Girvan Q (requires personaMap for community labels)
 *   homophilyIndex — fraction of edges where endpoints share a persona tag
 *   edgesAdded     — count of new edges created this round
 *   edgesRemoved   — count of edges severed this round
 */

const path = require("path");
const { readJSON, fileExists } = require("./fileIO");

class NetworkEvolution {
  // ── Opinion helpers ────────────────────────────────────────────────────────

  static _readOpinion(nodeId, beliefsDir, articleId) {
    const fp = path.join(beliefsDir, `${nodeId}.json`);
    if (!fileExists(fp)) return 0.5;
    const beliefs = readJSON(fp);
    const topic = beliefs.topicBeliefs && beliefs.topicBeliefs[articleId];
    return topic ? (topic.confidence ?? 0.5) : 0.5;
  }

  static _alignment(confA, confB) {
    const sigA = 2 * confA - 1;
    const sigB = 2 * confB - 1;
    return 1 - Math.abs(sigA - sigB) / 2;
  }

  // ── Main evolution step ────────────────────────────────────────────────────

  // graph: SocietyGraph instance (must support removeEdge and addEdge)
  // articleId: used to read belief confidences
  // experimentDir: base experiment directory
  // params: { creationProb, severingThreshold, maxNewEdges, trustForNewEdge }
  static evolve(graph, articleId, experimentDir, params = {}) {
    const {
      creationProb      = 0.05,
      severingThreshold = 0.25,
      maxNewEdges       = 3,
      trustForNewEdge   = 0.40,
    } = params;

    const beliefsDir = path.join(experimentDir, "beliefs");
    const nodeIds    = Object.keys(graph.nodes);

    const opinions = {};
    for (const id of nodeIds) {
      opinions[id] = NetworkEvolution._readOpinion(id, beliefsDir, articleId);
    }

    let edgesAdded   = 0;
    let edgesRemoved = 0;

    // Edge severing: only when opinion alignment is low AND trust already collapsed
    for (const fromId of nodeIds) {
      const fromState = graph.nodes[fromId].read();
      for (const [toId, trust] of Object.entries(fromState.relations || {})) {
        if (!(toId in opinions)) continue;
        const align = NetworkEvolution._alignment(opinions[fromId], opinions[toId]);
        if (align < severingThreshold && trust < 0.15) {
          graph.removeEdge(fromId, toId);
          edgesRemoved++;
        }
      }
    }

    // Edge creation: homophily-driven new connections (cap per round)
    let newThisRound = 0;
    outerLoop:
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = 0; j < nodeIds.length; j++) {
        if (newThisRound >= maxNewEdges) break outerLoop;
        if (i === j) continue;
        const aId = nodeIds[i];
        const bId = nodeIds[j];
        const aState = graph.nodes[aId].read();
        if (bId in (aState.relations || {})) continue; // already connected

        const alpha = NetworkEvolution._alignment(opinions[aId], opinions[bId]);
        if (Math.random() < alpha * creationProb) {
          graph.addEdge(aId, bId, trustForNewEdge);
          edgesAdded++;
          newThisRound++;
        }
      }
    }

    return { edgesAdded, edgesRemoved };
  }

  // ── Newman-Girvan modularity Q ─────────────────────────────────────────────

  // Community labels derived from persona ideologicalBias, then first tag.
  // Q = (1/2m) Σ_{ij} [A_ij - k_i*k_j/(2m)] * δ(c_i, c_j)
  static computeModularity(graph, personaMap) {
    const nodeIds = Object.keys(graph.nodes);
    if (nodeIds.length === 0) return null;

    const community = {};
    for (const nodeId of nodeIds) {
      const state   = graph.nodes[nodeId].read();
      const persona = personaMap && personaMap[state.personaId];
      community[nodeId] =
        (persona && persona.ideologicalBias) ||
        (persona && persona.tags && persona.tags[0]) ||
        "default";
    }

    const degree = Object.fromEntries(nodeIds.map((id) => [id, 0]));
    const adj    = Object.fromEntries(nodeIds.map((id) => [id, new Set()]));
    let m = 0;

    for (const [fromId, targets] of Object.entries(graph.adjacency)) {
      for (const toId of targets) {
        degree[fromId] = (degree[fromId] || 0) + 1;
        adj[fromId].add(toId);
        m++;
      }
    }

    if (m === 0) return 0;

    let Q = 0;
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = 0; j < nodeIds.length; j++) {
        const a = nodeIds[i];
        const b = nodeIds[j];
        if (community[a] !== community[b]) continue;
        const Aij      = adj[a].has(b) ? 1 : 0;
        const expected = (degree[a] * degree[b]) / (2 * m);
        Q += Aij - expected;
      }
    }
    return Q / (2 * m);
  }

  // ── Homophily index ────────────────────────────────────────────────────────

  // Fraction of edges where both endpoints share at least one persona tag.
  static computeHomophily(graph, personaMap) {
    let shared = 0;
    let total  = 0;

    for (const [fromId, targets] of Object.entries(graph.adjacency)) {
      const fromState  = graph.nodes[fromId].read();
      const fromPersona = personaMap && personaMap[fromState.personaId];
      const fromTags   = new Set(fromPersona ? (fromPersona.tags || []) : []);

      for (const toId of targets) {
        const toState  = graph.nodes[toId].read();
        const toPersona = personaMap && personaMap[toState.personaId];
        const toTags   = toPersona ? (toPersona.tags || []) : [];
        total++;
        if (toTags.some((t) => fromTags.has(t))) shared++;
      }
    }

    return total > 0 ? shared / total : null;
  }

  // ── Combined metrics ───────────────────────────────────────────────────────

  static computeMetrics(graph, personaMap) {
    return {
      modularityQ:    NetworkEvolution.computeModularity(graph, personaMap),
      homophilyIndex: NetworkEvolution.computeHomophily(graph, personaMap),
    };
  }
}

module.exports = NetworkEvolution;
