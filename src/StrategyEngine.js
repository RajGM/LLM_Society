/**
 * Extension 4 — Strategic Agents
 *
 * Personas with a "strategy" field in personas.json bypass the default
 * probabilistic action sampling and instead use utility-maximising selection.
 *
 * Strategies:
 *   maximize_downstream_mi   — adversarial; always reinterpret to maximise distortion
 *   maximize_reach           — broadcaster; always forward to maximise spread
 *   minimize_downstream_mi   — moderator; drop heavily-drifted messages
 *   maximize_alignment       — echo-chamber; forward when aligned, drop when not
 *
 * Returns null when the persona has no strategy; caller falls back to
 * weighted-random sampling.
 */

class StrategyEngine {
  // ── Action selection ───────────────────────────────────────────────────────

  // Returns an action string or null (no strategy → probabilistic fallback).
  // beliefAlignment ∈ [0,1]: 1 = fully aligned, 0 = opposed (used by maximize_alignment)
  static chooseAction(nodeState, message, strategy, beliefAlignment = 0.5) {
    const hasNeighbors = Object.keys(nodeState.relations || {}).length > 0;

    switch (strategy) {
      case "maximize_downstream_mi":
        // Adversarial: always introduce reinterpretation distortion
        return "reinterpret";

      case "maximize_reach":
        // Broadcaster: pass verbatim to as many nodes as possible
        return hasNeighbors ? "forward" : "dump";

      case "minimize_downstream_mi":
        // Benign moderator: reject messages that have accumulated many hops of
        // potential distortion; pass early-stage messages cleanly
        return message.hops >= 3 ? "drop" : "forward";

      case "maximize_alignment":
        // Echo-chamber: engage only with ideologically confirming content
        if (beliefAlignment >= 0.60) return "forward";
        if (beliefAlignment <= 0.35) return "drop";
        return "reinterpret"; // neutral → impose own framing

      default:
        return null; // unrecognised strategy → caller uses probabilistic sampling
    }
  }

  // ── Persona strategy lookup ────────────────────────────────────────────────

  static getStrategy(persona) {
    return persona && persona.strategy ? persona.strategy : null;
  }
}

module.exports = StrategyEngine;
