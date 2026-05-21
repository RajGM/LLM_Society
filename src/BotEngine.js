/**
 * BotEngine — Bot injection, detection, and message processing.
 *
 * Pure static class; no I/O, no LLM calls. All graph operations use
 * adjacency data passed in from the caller.
 */

const BOT_TYPES = new Set(["amplifier", "distorter", "agenda", "flooder"]);

// Placement strategies resolve which nodes become bots.
const PLACEMENT_STRATEGIES = new Set([
  "random",
  "hubs",
  "bridges",
  "periphery",
  "targeted_cluster",
]);

// Removal strategies applied during resilience testing.
const REMOVAL_STRATEGIES = new Set([
  "none",
  "remove_hubs",
  "remove_random",
  "remove_bridges",
  "remove_all",
]);

class BotEngine {
  // ── Detection ──────────────────────────────────────────────────────────────

  static isBot(persona) {
    return persona && persona.isBot === true;
  }

  // ── Message processing ─────────────────────────────────────────────────────
  // Returns { outContent, action, duplicateCount }.
  // Bots bypass trust, provenance, and belief checks entirely.
  static processMessage(msg, persona, nodeId) {
    const cfg = persona.botConfig || {};
    const action = cfg.actionOverride || "forward";
    const duplicateCount = cfg.duplicateMessages ?? 1;

    // Agenda bots may drop messages that don't match their keyword bias.
    // We approximate this with a simple hash so it's deterministic and cheap.
    let outContent = msg.content;
    if (persona.botType === "agenda") {
      const hash = BotEngine._simpleHash(msg.content + nodeId);
      if (hash % 3 === 0) {
        // ~33% of messages are "off-agenda" and dropped
        return { outContent: null, action: "drop", duplicateCount: 0 };
      }
    }

    // Distorter bots corrupt the content deterministically (no LLM call).
    if (persona.botType === "distorter" && action === "reinterpret") {
      outContent = BotEngine._distort(msg.content);
    }

    return { outContent, action, duplicateCount };
  }

  // ── Graph injection ────────────────────────────────────────────────────────
  // Selects `count` nodes from `nodeIds` using `strategy` and marks them as bots.
  // Returns an array of selected node IDs.
  //
  // `adjacency` is a plain object: { nodeId: [neighborId, ...] }
  static injectBots(nodeIds, count, strategy, adjacency, rng) {
    if (!PLACEMENT_STRATEGIES.has(strategy)) {
      throw new Error(`Unknown bot placement strategy: ${strategy}`);
    }
    if (count <= 0 || nodeIds.length === 0) return [];

    const n = Math.min(count, nodeIds.length);

    let ranked;
    switch (strategy) {
      case "hubs": {
        const degrees = BotEngine._computeDegrees(nodeIds, adjacency);
        ranked = [...nodeIds].sort((a, b) => degrees[b] - degrees[a]);
        break;
      }
      case "bridges": {
        const btwn = BotEngine._approximateBetweenness(nodeIds, adjacency);
        ranked = [...nodeIds].sort((a, b) => btwn[b] - btwn[a]);
        break;
      }
      case "periphery": {
        const degrees = BotEngine._computeDegrees(nodeIds, adjacency);
        ranked = [...nodeIds].sort((a, b) => degrees[a] - degrees[b]);
        break;
      }
      case "targeted_cluster": {
        // Pick the highest-degree seed, then take its immediate neighbors.
        const degrees = BotEngine._computeDegrees(nodeIds, adjacency);
        const seed = [...nodeIds].sort((a, b) => degrees[b] - degrees[a])[0];
        const cluster = new Set([seed, ...(adjacency[seed] || [])]);
        ranked = [
          ...cluster,
          ...[...nodeIds].filter((id) => !cluster.has(id)),
        ];
        break;
      }
      default: // random
        ranked = BotEngine._randomSample([...nodeIds], nodeIds.length, rng);
    }

    return ranked.slice(0, n);
  }

  // ── Removal ────────────────────────────────────────────────────────────────
  // Returns the subset of `botNodeIds` that survive after applying `strategy`.
  static applyRemoval(botNodeIds, strategy, adjacency, rng) {
    if (!REMOVAL_STRATEGIES.has(strategy)) {
      throw new Error(`Unknown bot removal strategy: ${strategy}`);
    }
    if (strategy === "none") return [...botNodeIds];
    if (strategy === "remove_all") return [];

    const bots = new Set(botNodeIds);

    if (strategy === "remove_hubs") {
      const degrees = BotEngine._computeDegrees([...bots], adjacency);
      const sorted = [...bots].sort((a, b) => degrees[b] - degrees[a]);
      return sorted.slice(Math.ceil(sorted.length / 2));
    }

    if (strategy === "remove_bridges") {
      const btwn = BotEngine._approximateBetweenness([...bots], adjacency);
      const sorted = [...bots].sort((a, b) => btwn[b] - btwn[a]);
      return sorted.slice(Math.ceil(sorted.length / 2));
    }

    // remove_random — remove 50 % at random
    const shuffled = BotEngine._randomSample([...bots], bots.size, rng);
    return shuffled.slice(Math.ceil(shuffled.length / 2));
  }

  // ── Graph utilities ────────────────────────────────────────────────────────

  static _computeDegrees(nodeIds, adjacency) {
    const deg = {};
    for (const id of nodeIds) deg[id] = 0;
    for (const id of nodeIds) {
      const neighbors = adjacency[id] || [];
      for (const nb of neighbors) {
        if (id in deg) deg[id]++;
        if (nb in deg) deg[nb]++;
      }
    }
    return deg;
  }

  // Brandes BFS-based approximate betweenness centrality.
  // Runs full BFS from every source node — O(V·(V+E)) but fine for ≤500 nodes.
  static _approximateBetweenness(nodeIds, adjacency) {
    const nodeSet = new Set(nodeIds);
    const btwn = {};
    for (const id of nodeIds) btwn[id] = 0;

    for (const s of nodeIds) {
      const stack = [];
      const pred = {};
      const sigma = {};
      const dist = {};

      for (const w of nodeIds) {
        pred[w] = [];
        sigma[w] = 0;
        dist[w] = -1;
      }

      sigma[s] = 1;
      dist[s] = 0;
      const queue = [s];

      while (queue.length > 0) {
        const v = queue.shift();
        stack.push(v);
        for (const w of (adjacency[v] || [])) {
          if (!nodeSet.has(w)) continue;
          if (dist[w] < 0) {
            queue.push(w);
            dist[w] = dist[v] + 1;
          }
          if (dist[w] === dist[v] + 1) {
            sigma[w] += sigma[v];
            pred[w].push(v);
          }
        }
      }

      const delta = {};
      for (const w of nodeIds) delta[w] = 0;

      while (stack.length > 0) {
        const w = stack.pop();
        for (const v of pred[w]) {
          delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
        }
        if (w !== s) btwn[w] += delta[w];
      }
    }

    return btwn;
  }

  // Fisher-Yates shuffle limited to `k` draws.
  static _randomSample(arr, k, rng) {
    const out = [...arr];
    const max = Math.min(k, out.length);
    for (let i = 0; i < max; i++) {
      const j = i + Math.floor((rng ? rng() : Math.random()) * (out.length - i));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out.slice(0, max);
  }

  // Simple deterministic hash for agenda-bot filtering (djb2 variant).
  static _simpleHash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  // ── Validation helpers ─────────────────────────────────────────────────────

  static validateBotType(botType) {
    if (!BOT_TYPES.has(botType)) {
      throw new Error(`Unknown bot type "${botType}". Valid: ${[...BOT_TYPES].join(", ")}`);
    }
  }

  static validatePlacementStrategy(strategy) {
    if (!PLACEMENT_STRATEGIES.has(strategy)) {
      throw new Error(`Unknown placement strategy "${strategy}". Valid: ${[...PLACEMENT_STRATEGIES].join(", ")}`);
    }
  }

  static validateRemovalStrategy(strategy) {
    if (!REMOVAL_STRATEGIES.has(strategy)) {
      throw new Error(`Unknown removal strategy "${strategy}". Valid: ${[...REMOVAL_STRATEGIES].join(", ")}`);
    }
  }
}

module.exports = BotEngine;
