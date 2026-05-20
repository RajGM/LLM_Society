// Default parameters for an experiment run.
// Override any of these in your run config object.
const DEFAULTS = {
  // Graph topology: "linear_chain" | "ring" | "random_er" | "custom"
  topology: "linear_chain",
  topologyParams: {
    numNodes: 5,
    edgeProbability: 0.3,
  },

  maxTicks: 10,
  defaultModel: "gpt-4o-mini",
  auditorModel: "gpt-4o-mini",
  auditorQuestions: 5,

  // ── Layer 1: Node cognition ─────────────────────────────────────────────────
  // Belief state + confirmation bias (extra LLM call per message processed)
  enableBeliefs: false,
  // Frame detection + sentiment drift + claim injection (extra LLM call per audit event)
  enableFrameAnalysis: false,

  // ── Extension 1: Provenance-aware trust ────────────────────────────────────
  // Chain trust T_chain = ∏ t(r,p_i) · δ^(n-1-i). Drops messages whose chain
  // trust falls below trustThreshold. Adds ~0 LLM calls.
  enableProvenance: false,
  provenanceRecencyDiscount: 0.9,

  // ── Extension 4: Strategic agents ─────────────────────────────────────────
  // Personas with a "strategy" field use utility-maximising action selection.
  // strategies: maximize_downstream_mi | maximize_reach |
  //             minimize_downstream_mi | maximize_alignment
  enableStrategicAgents: false,

  // ── Extension 3: Network co-evolution ─────────────────────────────────────
  // After each article audit, create opinion-similar edges and sever
  // low-alignment / low-trust edges. Requires enableBeliefs: true.
  enableNetworkEvolution: false,
  networkEvolutionParams: {
    creationProb:      0.05,  // P_create = α × creationProb
    severingThreshold: 0.25,  // alignment below which edge is a sever candidate
    maxNewEdges:       3,     // cap on new edges per article per round
    trustForNewEdge:   0.40,  // trust assigned to newly created edges
  },

  // ── Extension 8: Population-level opinion dynamics ─────────────────────────
  // Runs DeGroot / Bounded-Confidence / Voter models on final belief states.
  // Results saved to opinion_dynamics_{articleId}.json. Requires enableBeliefs.
  enableOpinionDynamics: false,
  opinionDynamicsParams: {
    steps:     50,
    epsilon:   0.3,  // Bounded Confidence threshold
    voterRuns: 10,
  },

  // ── Extension 9: Institutional trust ──────────────────────────────────────
  // Per-node trust toward media / science / government / corporate institutions.
  // Adjusts effective edge trust via a multiplier; erodes when nodes spread MI.
  enableInstitutionalTrust: false,
  institutionalTrustParams: {
    erosionRate:  0.03,
    recoveryRate: 0.01,
  },

  // ── Layer 3: Competitive propagation ────────────────────────────────────────
  // Each group runs its articles simultaneously through the same tick loop,
  // so they compete for node attention rather than propagating in isolation.
  // Format: [{ articles: ["id1","id2"], seedNodes: ["node_0"] }]
  competitiveGroups: [],

  // ── Layer 4: External interventions ─────────────────────────────────────────
  // Applied mid-simulation at the specified tick.
  // types: "fact_checker_injection" | "inoculation" | "content_moderation"
  // Format: [{ type, tick, articleId, targetNodes, params }]
  interventions: [],

  // Node decision parameters (can be overridden per node in run config)
  nodeParams: {
    trustThreshold: 0.2,
    actionWeights: {
      forward: 0.3,
      reinterpret: 0.5,
      drop: 0.2,
    },
    relationEvolution: true,
    trustDelta: 0.05,
    maxHops: 8,
    strippedProperties: [],

    // Node activity pattern — models real-world usage behaviour
    // "always": active every tick (default)
    // "weekly": active every 7 ticks (low-frequency users)
    // "random": active each tick with 70% probability
    activityPattern: "always",

    // Trust score below which an edge is deleted (0 disables edge deletion)
    edgeDeletionThreshold: 0.05,

    // Max messages per article queued in a node's inbox at one time.
    // Prevents exponential cascade floods in dense graphs (echo chamber, scale-free).
    // Excess messages are silently discarded — realistic: feeds have a scroll limit.
    maxInboxSize: 20,
  },

  seedArticles: ["crime_0"],
  seedNodes: ["node_0"],
};

module.exports = { DEFAULTS };
