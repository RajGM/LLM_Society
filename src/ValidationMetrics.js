/**
 * Validation Metrics — pure static class.
 *
 * Extracts comparable cascade structure metrics from both real-world
 * cascade data and simulation experiment directories.
 *
 * Cascade metrics (Vosoughi et al. / Goel et al. definitions):
 *   depth            — longest path from root
 *   breadth          — max nodes at any single level
 *   size             — total nodes in cascade
 *   structuralVirality — average pairwise distance (Goel et al. 2016)
 *   speedHours/speedTicks — time span of cascade
 */

const path = require("path");
const fs   = require("fs");
const { readJSON, fileExists } = require("./fileIO");

class ValidationMetrics {

  // ── Real cascade metrics ──────────────────────────────────────────────────

  /**
   * Extract structural metrics from a real cascade object.
   *
   * @param {Object} cascade — parsed cascade JSON with `retweets`, `seed_user`
   */
  static extractRealMetrics(cascade) {
    const retweets = cascade.retweets || cascade.replies || [];

    // Build parent→children adjacency
    const children = {};
    for (const rt of retweets) {
      const parent = String(rt.retweeted_from || rt.replied_to || "");
      const child  = String(rt.user_id || "");
      if (!parent || !child || parent === child) continue;
      if (!children[parent]) children[parent] = [];
      children[parent].push(child);
    }

    // Find root (retweeted_from but never user_id)
    const allChildren = new Set(Object.values(children).flat());
    const allParents  = new Set(Object.keys(children));
    const rootCandidates = [...allParents].filter((p) => !allChildren.has(p));
    const root = cascade.seed_user
      ? String(cascade.seed_user)
      : (rootCandidates[0] || [...allParents][0] || "");

    const depth  = ValidationMetrics._treeDepth(children, root);
    const breadth = ValidationMetrics._treeBreadth(children, root);
    const size    = ValidationMetrics._treeSize(children, root);
    const sv      = ValidationMetrics._structuralVirality(children, root);

    // Speed: hours from first to last timestamp
    const timestamps = retweets
      .map((rt) => rt.timestamp ? new Date(rt.timestamp).getTime() : null)
      .filter((t) => t !== null && !isNaN(t));
    const speedHours = timestamps.length > 1
      ? (Math.max(...timestamps) - Math.min(...timestamps)) / 3600000
      : 0;

    return { depth, breadth, size, structuralVirality: sv, speedHours, root };
  }

  // ── Simulated cascade metrics ─────────────────────────────────────────────

  /**
   * Extract structural metrics from a simulation experiment directory.
   *
   * Reconstructs the propagation tree from event provenance chains.
   *
   * @param {string} experimentDir — path to experiment directory
   * @param {string} articleId     — article to analyze
   */
  static extractSimulatedMetrics(experimentDir, articleId) {
    const nodesData = ValidationMetrics._loadAllNodes(experimentDir);

    const children = {};
    let minTick = Infinity, maxTick = 0;
    let totalForwardingEvents = 0;
    const allMIs = [];

    for (const [nodeId, nodeData] of Object.entries(nodesData)) {
      const events = (nodeData.history || []).filter(
        (e) => e.articleId === articleId &&
                (e.action === "forward" || e.action === "reinterpret")
      );

      for (const ev of events) {
        totalForwardingEvents++;
        if (ev.tick < minTick) minTick = ev.tick;
        if (ev.tick > maxTick) maxTick = ev.tick;
        if (ev.misinfoIndex !== null && ev.misinfoIndex !== undefined) {
          allMIs.push(ev.misinfoIndex);
        }

        // Infer parent from provenance chain
        const prov = ev.provenance || [];
        if (prov.length >= 2) {
          const parentNodeId = prov[prov.length - 2].nodeId;
          if (parentNodeId && parentNodeId !== nodeId) {
            if (!children[parentNodeId]) children[parentNodeId] = [];
            if (!children[parentNodeId].includes(nodeId)) {
              children[parentNodeId].push(nodeId);
            }
          }
        }
      }
    }

    // Find root: in allParents but not in allChildren
    const allChildrenSet = new Set(Object.values(children).flat());
    const allParentsArr  = Object.keys(children);
    const rootCandidates = allParentsArr.filter((p) => !allChildrenSet.has(p));
    const root = rootCandidates[0] || allParentsArr[0] || Object.keys(nodesData)[0] || "";

    const depth  = ValidationMetrics._treeDepth(children, root);
    const breadth = ValidationMetrics._treeBreadth(children, root);
    const size    = ValidationMetrics._treeSize(children, root);
    const sv      = ValidationMetrics._structuralVirality(children, root);

    const meanMI = allMIs.length > 0
      ? allMIs.reduce((s, v) => s + v, 0) / allMIs.length
      : 0;

    return {
      depth,
      breadth,
      size,
      structuralVirality: sv,
      speedTicks:         maxTick === 0 ? 0 : maxTick - minTick + 1,
      totalEvents:        totalForwardingEvents,
      meanMI,
      miDistribution:     allMIs,
    };
  }

  // ── Tree algorithms ───────────────────────────────────────────────────────

  /** Longest path from root via BFS. */
  static _treeDepth(children, root) {
    if (!root || !children) return 0;
    let maxDepth = 0;
    const queue   = [{ node: root, depth: 0 }];
    const visited = new Set();

    while (queue.length > 0) {
      const { node, depth } = queue.shift();
      if (visited.has(node)) continue;
      visited.add(node);
      if (depth > maxDepth) maxDepth = depth;
      for (const child of (children[node] || [])) {
        if (!visited.has(child)) queue.push({ node: child, depth: depth + 1 });
      }
    }
    return maxDepth;
  }

  /** Maximum nodes at any single depth level. */
  static _treeBreadth(children, root) {
    if (!root || !children) return 0;
    const levels  = {};
    const queue   = [{ node: root, depth: 0 }];
    const visited = new Set();

    while (queue.length > 0) {
      const { node, depth } = queue.shift();
      if (visited.has(node)) continue;
      visited.add(node);
      levels[depth] = (levels[depth] || 0) + 1;
      for (const child of (children[node] || [])) {
        if (!visited.has(child)) queue.push({ node: child, depth: depth + 1 });
      }
    }
    const vals = Object.values(levels);
    return vals.length > 0 ? Math.max(...vals) : 0;
  }

  /** Total unique nodes reachable from root. */
  static _treeSize(children, root) {
    if (!root) return 0;
    const visited = new Set();
    const queue   = [root];
    while (queue.length > 0) {
      const node = queue.shift();
      if (visited.has(node)) continue;
      visited.add(node);
      for (const child of (children[node] || [])) {
        if (!visited.has(child)) queue.push(child);
      }
    }
    return visited.size;
  }

  /**
   * Structural virality (Goel et al. 2016):
   * average pairwise shortest path distance in the cascade tree.
   *
   * SV = (1 / n(n-1)) Σ_{i≠j} d(i,j)
   *
   * Low SV ≈ broadcast (star); High SV ≈ viral (chain).
   * O(n²) BFS — capped at 500 nodes to stay fast.
   */
  static _structuralVirality(children, root) {
    if (!root) return 0;

    // Collect all reachable nodes
    const allNodes = new Set();
    const queue    = [root];
    while (queue.length > 0) {
      const node = queue.shift();
      if (allNodes.has(node)) continue;
      allNodes.add(node);
      for (const child of (children[node] || [])) {
        if (!allNodes.has(child)) queue.push(child);
      }
    }

    const nodeList = [...allNodes];
    const n = nodeList.length;
    if (n < 2) return 0;

    // Cap at 500 to keep complexity manageable
    const sample = n > 500 ? nodeList.slice(0, 500) : nodeList;
    const sn     = sample.length;

    // Build undirected adjacency (tree edges only)
    const adj = {};
    for (const parent of Object.keys(children)) {
      for (const child of (children[parent] || [])) {
        if (!adj[parent]) adj[parent] = [];
        if (!adj[child])  adj[child]  = [];
        if (!adj[parent].includes(child)) adj[parent].push(child);
        if (!adj[child].includes(parent)) adj[child].push(parent);
      }
    }

    let totalDist = 0;
    for (const source of sample) {
      const dist  = { [source]: 0 };
      const bfsQ  = [source];
      while (bfsQ.length > 0) {
        const cur = bfsQ.shift();
        for (const nb of (adj[cur] || [])) {
          if (dist[nb] === undefined) {
            dist[nb] = dist[cur] + 1;
            bfsQ.push(nb);
          }
        }
      }
      for (const target of sample) {
        if (target !== source && dist[target] !== undefined) {
          totalDist += dist[target];
        }
      }
    }

    return totalDist / (sn * (sn - 1));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  static _loadAllNodes(experimentDir) {
    const nodesDir = path.join(experimentDir, "nodes");
    if (!fs.existsSync(nodesDir)) return {};
    const nodes = {};
    for (const f of fs.readdirSync(nodesDir)) {
      if (!f.endsWith(".json")) continue;
      const nodeId   = f.replace(".json", "");
      nodes[nodeId]  = readJSON(path.join(nodesDir, f));
    }
    return nodes;
  }
}

module.exports = ValidationMetrics;
