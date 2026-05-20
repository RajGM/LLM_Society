/**
 * Extension 1 — Provenance-Aware Trust
 *
 * Computes chain trust for multi-hop messages using the formula:
 *   T_chain = ∏_{i=0}^{n-1} t(r, p_i) · δ^(n-1-i)
 *
 *   - provenance[i].nodeId = i-th hop (index 0 = oldest, n-1 = immediate sender)
 *   - δ = recency discount; recent hops (exponent 0) get full weight
 *   - t(r, p_i) = recipient's direct trust in p_i, with persona-category fallback
 *
 * Category trust defaults when node is not in recipient's relations:
 *   expert / media  → 0.50
 *   advocacy        → 0.45
 *   intentional     → 0.20
 *   other           → 0.40
 */

class ProvenanceEngine {
  // ── Category defaults ──────────────────────────────────────────────────────

  static _categoryTrust(personaId, personaMap) {
    const p = personaMap && personaMap[personaId];
    if (!p) return 0.40;
    const tags = p.tags || [];
    if (tags.includes("intentional")) return 0.20;
    if (tags.includes("advocacy"))    return 0.45;
    if (tags.includes("expert"))      return 0.50;
    if (tags.includes("media"))       return 0.50;
    return 0.40;
  }

  // ── Chain trust ────────────────────────────────────────────────────────────

  // provenance: [{ nodeId, personaId }, ...] oldest-first; immediate sender last
  // relations:  recipient's trust map { [nodeId]: trust }
  // delta:      recency discount factor (0 < delta <= 1)
  // personaMap: full map for category fallbacks
  static computeChainTrust(provenance, relations, delta, personaMap) {
    if (!provenance || provenance.length === 0) return 1.0;
    const n = provenance.length;
    let chainTrust = 1.0;
    for (let i = 0; i < n; i++) {
      const hop = provenance[i];
      const directTrust =
        relations[hop.nodeId] !== undefined
          ? relations[hop.nodeId]
          : ProvenanceEngine._categoryTrust(hop.personaId, personaMap);
      // exponent: 0 for newest (no discount), n-1 for oldest (max discount)
      const exponent = n - 1 - i;
      chainTrust *= directTrust * Math.pow(delta, exponent);
    }
    return chainTrust;
  }

  // ── Metrics ────────────────────────────────────────────────────────────────

  // Aggregates provenance metrics across an article's accepted events.
  static metricsFromHistory(nodesData, articleId) {
    const chainTrusts = [];
    const uniquePaths = new Set();

    for (const state of Object.values(nodesData)) {
      for (const event of state.history || []) {
        if (event.articleId !== articleId) continue;
        if (event.chainTrust !== undefined && event.chainTrust !== null) {
          chainTrusts.push(event.chainTrust);
        }
        if (event.provenance) {
          uniquePaths.add(JSON.stringify(event.provenance.map((p) => p.nodeId)));
        }
      }
    }

    return {
      meanChainTrust:
        chainTrusts.length > 0
          ? chainTrusts.reduce((a, b) => a + b, 0) / chainTrusts.length
          : null,
      provenanceDiversity: uniquePaths.size,
    };
  }
}

module.exports = ProvenanceEngine;
