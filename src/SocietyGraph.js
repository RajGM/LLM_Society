const path = require("path");
const SimulationNode = require("./SimulationNode");
const { writeJSON, readJSON, ensureDir, fileExists } = require("./fileIO");

class SocietyGraph {
  constructor(experimentDir) {
    this.experimentDir = experimentDir;
    this.nodes = {}; // nodeId -> SimulationNode instance
    this.adjacency = {}; // nodeId -> [targetNodeId, ...]
    ensureDir(path.join(experimentDir, "nodes"));
  }

  // ── Core primitives ────────────────────────────────────────────────────────

  addNode(nodeId, options = {}) {
    const node = SimulationNode.create(nodeId, this.experimentDir, options);
    this.nodes[nodeId] = node;
    this.adjacency[nodeId] = [];
    return node;
  }

  addEdge(fromId, toId, trust = 0.5) {
    if (!this.nodes[fromId]) throw new Error(`Node ${fromId} not in graph`);
    if (!this.nodes[toId]) throw new Error(`Node ${toId} not in graph`);
    if (!this.adjacency[fromId].includes(toId)) {
      this.adjacency[fromId].push(toId);
    }
    const fromNode = this.nodes[fromId];
    const state = fromNode.read();
    // Preserve evolved trust on resume — only set if not already present
    if (!(toId in state.relations)) {
      state.relations[toId] = trust;
      writeJSON(fromNode.filePath, state);
    }
  }

  // ── Homophily trust helper ─────────────────────────────────────────────────
  // Nodes sharing persona tags get higher trust; opposing ideologies get lower.
  static _homophilyTrust(pidA, pidB, personaMap, baseTrust = 0.5) {
    if (!personaMap || pidA === pidB) return baseTrust;
    const pA = personaMap[pidA] || {};
    const pB = personaMap[pidB] || {};
    const tagsA = new Set(pA.tags || []);
    const tagsB = new Set(pB.tags || []);
    const overlap = [...tagsA].filter((t) => tagsB.has(t)).length;
    const union = new Set([...tagsA, ...tagsB]).size;
    if (union === 0) return baseTrust;
    const jaccard = overlap / union;
    // Range: low similarity -> baseTrust - 0.2, full overlap -> baseTrust + 0.3
    return Math.max(0.05, Math.min(0.95, baseTrust - 0.2 + jaccard * 0.5));
  }

  // ── 1. Linear chain ────────────────────────────────────────────────────────
  static buildLinearChain(experimentDir, nodeConfigs) {
    const graph = new SocietyGraph(experimentDir);
    const ids = nodeConfigs.map((cfg, i) => cfg.nodeId || `node_${i}`);
    for (let i = 0; i < nodeConfigs.length; i++) graph.addNode(ids[i], nodeConfigs[i]);
    for (let i = 0; i < ids.length - 1; i++) graph.addEdge(ids[i], ids[i + 1], 0.7);
    return graph;
  }

  // ── 2. Ring ────────────────────────────────────────────────────────────────
  static buildRing(experimentDir, nodeConfigs) {
    const graph = new SocietyGraph(experimentDir);
    const ids = nodeConfigs.map((cfg, i) => cfg.nodeId || `node_${i}`);
    for (let i = 0; i < nodeConfigs.length; i++) graph.addNode(ids[i], nodeConfigs[i]);
    for (let i = 0; i < ids.length; i++) {
      graph.addEdge(ids[i], ids[(i + 1) % ids.length], 0.7);
    }
    return graph;
  }

  // ── 3. Erdos-Renyi random ──────────────────────────────────────────────────
  static buildRandomER(experimentDir, nodeConfigs, edgeProbability = 0.3) {
    const graph = new SocietyGraph(experimentDir);
    const ids = nodeConfigs.map((cfg, i) => cfg.nodeId || `node_${i}`);
    for (let i = 0; i < nodeConfigs.length; i++) graph.addNode(ids[i], nodeConfigs[i]);
    for (let i = 0; i < ids.length; i++) {
      for (let j = 0; j < ids.length; j++) {
        if (i !== j && Math.random() < edgeProbability) {
          graph.addEdge(ids[i], ids[j], 0.3 + Math.random() * 0.5);
        }
      }
    }
    return graph;
  }

  // ── 4. Custom edge list ────────────────────────────────────────────────────
  static buildCustom(experimentDir, nodeConfigs, edges) {
    const graph = new SocietyGraph(experimentDir);
    for (const cfg of nodeConfigs) graph.addNode(cfg.nodeId, cfg);
    for (const edge of edges) graph.addEdge(edge.from, edge.to, edge.trust ?? 0.5);
    return graph;
  }

  // ── 5. Small-world (Watts-Strogatz) ───────────────────────────────────────
  // Starts as a ring lattice where each node connects to k nearest neighbours.
  // Each edge is then rewired with probability beta to a random target.
  // High clustering + short path lengths — models real friendship / colleague networks.
  static buildSmallWorld(experimentDir, nodeConfigs, k = 4, beta = 0.1, personaMap = null) {
    const graph = new SocietyGraph(experimentDir);
    const ids = nodeConfigs.map((cfg, i) => cfg.nodeId || `node_${i}`);
    const n = ids.length;

    for (let i = 0; i < n; i++) graph.addNode(ids[i], nodeConfigs[i]);

    // Step 1: ring lattice — connect each node to k/2 neighbours on each side
    const kHalf = Math.max(1, Math.floor(k / 2));
    const edges = new Set(); // "from:to" to avoid duplicate addEdge calls

    const addSW = (a, b) => {
      const key = `${a}:${b}`;
      if (!edges.has(key)) {
        edges.add(key);
        const pidA = nodeConfigs[a].personaId;
        const pidB = nodeConfigs[b].personaId;
        const trust = SocietyGraph._homophilyTrust(pidA, pidB, personaMap, 0.65);
        graph.addEdge(ids[a], ids[b], trust);
      }
    };

    for (let i = 0; i < n; i++) {
      for (let d = 1; d <= kHalf; d++) {
        addSW(i, (i + d) % n);
        addSW(i, (i - d + n) % n);
      }
    }

    // Step 2: rewire each edge with probability beta
    for (let i = 0; i < n; i++) {
      for (let d = 1; d <= kHalf; d++) {
        if (Math.random() < beta) {
          const original = (i + d) % n;
          let newTarget;
          do { newTarget = Math.floor(Math.random() * n); }
          while (newTarget === i || newTarget === original);

          // Remove old edge by setting trust to 0 then overwriting (remove from adjacency)
          const state = graph.nodes[ids[i]].read();
          if (state.relations[ids[original]] !== undefined) {
            delete state.relations[ids[original]];
            graph.adjacency[ids[i]] = graph.adjacency[ids[i]].filter((x) => x !== ids[original]);
            writeJSON(graph.nodes[ids[i]].filePath, state);
          }
          addSW(i, newTarget);
        }
      }
    }

    return graph;
  }

  // ── 6. Scale-free (Barabasi-Albert preferential attachment) ───────────────
  // Each new node attaches to m existing nodes with probability proportional
  // to their current in-degree (rich-get-richer). Produces a power-law degree
  // distribution: a few influential hubs (media outlets, celebrities) and many
  // low-degree nodes (ordinary users).
  static buildScaleFree(experimentDir, nodeConfigs, m = 2, personaMap = null) {
    const graph = new SocietyGraph(experimentDir);
    const ids = nodeConfigs.map((cfg, i) => cfg.nodeId || `node_${i}`);
    const n = ids.length;

    if (n <= m) {
      // Degenerate case: just fully connect
      for (let i = 0; i < n; i++) graph.addNode(ids[i], nodeConfigs[i]);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i !== j) graph.addEdge(ids[i], ids[j], 0.5);
        }
      }
      return graph;
    }

    // Seed: fully connect the first m+1 nodes
    for (let i = 0; i <= m; i++) graph.addNode(ids[i], nodeConfigs[i]);
    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= m; j++) {
        if (i !== j) {
          const trust = SocietyGraph._homophilyTrust(
            nodeConfigs[i].personaId, nodeConfigs[j].personaId, personaMap, 0.6
          );
          graph.addEdge(ids[i], ids[j], trust);
        }
      }
    }

    // Preferential attachment: in-degree of existing nodes
    const inDegree = {};
    for (let i = 0; i <= m; i++) inDegree[ids[i]] = m;

    for (let i = m + 1; i < n; i++) {
      graph.addNode(ids[i], nodeConfigs[i]);
      inDegree[ids[i]] = 0;

      const existingIds = ids.slice(0, i);
      const totalDegree = existingIds.reduce((s, id) => s + (inDegree[id] || 1), 0);

      const targets = new Set();
      let attempts = 0;
      while (targets.size < Math.min(m, existingIds.length) && attempts < 1000) {
        attempts++;
        let r = Math.random() * totalDegree;
        for (const eid of existingIds) {
          r -= (inDegree[eid] || 1);
          if (r <= 0) { targets.add(eid); break; }
        }
      }

      for (const target of targets) {
        const trust = SocietyGraph._homophilyTrust(
          nodeConfigs[i].personaId,
          nodeConfigs[existingIds.indexOf(target)].personaId,
          personaMap, 0.5
        );
        // Hub (existing) pushes to new node; new node also sees hub
        graph.addEdge(target, ids[i], Math.min(0.95, trust + 0.1));
        graph.addEdge(ids[i], target, trust);
        inDegree[ids[i]]++;
        inDegree[target] = (inDegree[target] || 0) + 1;
      }
    }

    return graph;
  }

  // ── 7. Echo chamber ───────────────────────────────────────────────────────
  // Nodes are divided into numChambers clusters. Intra-cluster edges are dense
  // with high trust; inter-cluster edges are sparse with low trust.
  // Models ideological bubbles and information silos in social media.
  static buildEchoChamber(
    experimentDir, nodeConfigs,
    numChambers = 2,
    intraEdgeProb = 0.7, interEdgeProb = 0.05,
    intraTrust = 0.85, interTrust = 0.15,
    personaMap = null
  ) {
    const graph = new SocietyGraph(experimentDir);
    const ids = nodeConfigs.map((cfg, i) => cfg.nodeId || `node_${i}`);
    const n = ids.length;

    for (let i = 0; i < n; i++) graph.addNode(ids[i], nodeConfigs[i]);

    // Assign cluster membership
    const clusterOf = ids.map((_, i) => i % numChambers);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const sameCluster = clusterOf[i] === clusterOf[j];
        const prob = sameCluster ? intraEdgeProb : interEdgeProb;
        if (Math.random() < prob) {
          const baseTrust = sameCluster ? intraTrust : interTrust;
          const trust = personaMap
            ? SocietyGraph._homophilyTrust(nodeConfigs[i].personaId, nodeConfigs[j].personaId, personaMap, baseTrust)
            : baseTrust + (Math.random() - 0.5) * 0.1;
          graph.addEdge(ids[i], ids[j], Math.max(0.05, Math.min(0.95, trust)));
        }
      }
    }

    return graph;
  }

  // ── 8. Polarized two-cluster ───────────────────────────────────────────────
  // Two tightly-knit ideological clusters with very few cross-cluster bridges
  // and very low trust across those bridges. Models political polarization.
  // Bridge nodes (if any) have moderate trust in both directions.
  static buildPolarized(
    experimentDir, nodeConfigs,
    intraEdgeProb = 0.75, interEdgeProb = 0.05,
    intraTrust = 0.88, interTrust = 0.10,
    bridgeNodeIds = [], personaMap = null
  ) {
    const graph = new SocietyGraph(experimentDir);
    const ids = nodeConfigs.map((cfg, i) => cfg.nodeId || `node_${i}`);
    const n = ids.length;
    const bridgeSet = new Set(bridgeNodeIds);

    for (let i = 0; i < n; i++) graph.addNode(ids[i], nodeConfigs[i]);

    // Split non-bridge nodes into two halves
    const nonBridge = ids.filter((id) => !bridgeSet.has(id));
    const half = Math.floor(nonBridge.length / 2);
    const leftCluster = new Set(nonBridge.slice(0, half));
    const rightCluster = new Set(nonBridge.slice(half));

    const sameCluster = (a, b) =>
      (leftCluster.has(a) && leftCluster.has(b)) ||
      (rightCluster.has(a) && rightCluster.has(b));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const aId = ids[i], bId = ids[j];
        const aBridge = bridgeSet.has(aId), bBridge = bridgeSet.has(bId);

        let prob, baseTrust;
        if (aBridge || bBridge) {
          // Bridge connects to everyone with moderate probability and trust
          prob = 0.5;
          baseTrust = 0.45;
        } else if (sameCluster(aId, bId)) {
          prob = intraEdgeProb;
          baseTrust = intraTrust;
        } else {
          prob = interEdgeProb;
          baseTrust = interTrust;
        }

        if (Math.random() < prob) {
          const trust = personaMap
            ? SocietyGraph._homophilyTrust(nodeConfigs[i].personaId, nodeConfigs[j].personaId, personaMap, baseTrust)
            : baseTrust + (Math.random() - 0.5) * 0.08;
          graph.addEdge(aId, bId, Math.max(0.05, Math.min(0.95, trust)));
        }
      }
    }

    return graph;
  }

  // ── 9. Hierarchical (tree) ─────────────────────────────────────────────────
  // A rooted tree where information flows downward from authorities (root, editors)
  // to audiences (leaves). Models media hierarchies, organisational structures,
  // or government information dissemination.
  // downTrust: trust from parent -> child (authority speaks down)
  // upTrust:   trust from child -> parent (optional; models feedback)
  static buildHierarchical(
    experimentDir, nodeConfigs,
    branchingFactor = 3,
    downTrust = 0.85, upTrust = 0.3,
    personaMap = null
  ) {
    const graph = new SocietyGraph(experimentDir);
    const ids = nodeConfigs.map((cfg, i) => cfg.nodeId || `node_${i}`);
    const n = ids.length;

    for (let i = 0; i < n; i++) graph.addNode(ids[i], nodeConfigs[i]);

    // Build parent-child relationships for a B-ary tree
    for (let i = 0; i < n; i++) {
      for (let c = 1; c <= branchingFactor; c++) {
        const childIdx = branchingFactor * i + c;
        if (childIdx >= n) break;

        const parentTrust = personaMap
          ? SocietyGraph._homophilyTrust(nodeConfigs[i].personaId, nodeConfigs[childIdx].personaId, personaMap, downTrust)
          : downTrust;
        graph.addEdge(ids[i], ids[childIdx], Math.min(0.95, parentTrust));

        if (upTrust > 0) {
          const childTrust = personaMap
            ? SocietyGraph._homophilyTrust(nodeConfigs[childIdx].personaId, nodeConfigs[i].personaId, personaMap, upTrust)
            : upTrust;
          graph.addEdge(ids[childIdx], ids[i], Math.max(0.05, childTrust));
        }
      }
    }

    return graph;
  }

  // ── Edge removal ──────────────────────────────────────────────────────────

  removeEdge(fromId, toId) {
    if (this.adjacency[fromId]) {
      this.adjacency[fromId] = this.adjacency[fromId].filter((id) => id !== toId);
    }
    const fromNode = this.nodes[fromId];
    if (fromNode) {
      const state = fromNode.read();
      delete state.relations[toId];
      writeJSON(fromNode.filePath, state);
    }
  }

  // ── Graph inspection helpers ───────────────────────────────────────────────

  getNodeIds() {
    return Object.keys(this.nodes);
  }

  getNeighbors(nodeId) {
    return this.adjacency[nodeId] || [];
  }

  // Row-stochastic trust matrix for DeGroot model.
  // { [fromId]: { [toId]: normalised trust } }
  toRowStochasticMatrix() {
    const matrix = {};
    for (const nodeId of Object.keys(this.nodes)) {
      const state     = this.nodes[nodeId].read();
      const relations = state.relations || {};
      const total     = Object.values(relations).reduce((s, v) => s + v, 0);
      matrix[nodeId]  = {};
      if (total > 0) {
        for (const [toId, trust] of Object.entries(relations)) {
          matrix[nodeId][toId] = trust / total;
        }
      }
    }
    return matrix;
  }

  // Unweighted adjacency map { [nodeId]: [neighborId, ...] }
  toAdjacencyMap() {
    const adj = {};
    for (const nodeId of Object.keys(this.nodes)) {
      adj[nodeId] = [...(this.adjacency[nodeId] || [])];
    }
    return adj;
  }

  // { [nodeId]: personaId }
  getNodePersonaMap() {
    const map = {};
    for (const [nodeId, node] of Object.entries(this.nodes)) {
      map[nodeId] = node.read().personaId;
    }
    return map;
  }

  // ── Resume support ─────────────────────────────────────────────────────────

  // Rebuild a SocietyGraph from an existing experiment directory without
  // overwriting any node files. Used when resuming an interrupted run.
  static loadExisting(experimentDir) {
    const topoPath = path.join(experimentDir, "graph_topology.json");
    if (!fileExists(topoPath)) {
      throw new Error(`Cannot resume: graph_topology.json not found in ${experimentDir}`);
    }
    const topo = readJSON(topoPath);
    const graph = new SocietyGraph(experimentDir);

    // Create node wrapper instances without touching the files
    for (const n of topo.nodes) {
      const node = new SimulationNode(n.nodeId, experimentDir);
      graph.nodes[n.nodeId] = node;
      graph.adjacency[n.nodeId] = [];
    }

    // Rebuild adjacency list from saved edge list
    for (const edge of topo.edges) {
      if (graph.adjacency[edge.from] && !graph.adjacency[edge.from].includes(edge.to)) {
        graph.adjacency[edge.from].push(edge.to);
      }
    }

    return graph;
  }

  // ── Topology snapshot ──────────────────────────────────────────────────────

  saveTopology() {
    const topology = {
      nodes: Object.keys(this.nodes).map((id) => {
        const state = this.nodes[id].read();
        return { nodeId: id, personaId: state.personaId, modelId: state.modelId, relations: state.relations };
      }),
      edges: [],
    };
    for (const [from, targets] of Object.entries(this.adjacency)) {
      for (const to of targets) {
        const fromState = this.nodes[from].read();
        topology.edges.push({ from, to, trust: fromState.relations[to] ?? 0.5 });
      }
    }
    writeJSON(path.join(this.experimentDir, "graph_topology.json"), topology);
    return topology;
  }
}

module.exports = SocietyGraph;
