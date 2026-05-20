/**
 * Extension 9 — Institutional Trust Modeling
 *
 * Tracks per-node trust toward four societal institutions:
 *   media, science, government, corporate
 *
 * When a message is received, the sender's institutional affiliation
 * applies a multiplier to the raw edge trust, amplifying or dampening
 * message acceptance based on how much the recipient trusts that institution.
 *
 * Stored at experiments/{id}/institutional_trust.json
 *
 * Schema:
 * {
 *   nodes: {
 *     [nodeId]: { media: 0.5, science: 0.5, government: 0.4, corporate: 0.4 }
 *   }
 * }
 */

const path = require("path");
const { readJSON, writeJSON, fileExists } = require("./fileIO");

const INSTITUTIONS = ["media", "science", "government", "corporate"];

// Maps persona tags to institution affiliation
const TAG_TO_INSTITUTION = {
  media:          "media",
  expert:         "science",
  ideology:       "government",
  political:      "government",
  "social-media": "media",
  marketing:      "corporate",
  entrepreneurship: "corporate",
  consumer:       "corporate",
  education:      "science",
  environment:    "science",
};

// Initial institutional trust biases per persona tag
const INITIAL_BIASES = {
  ideology:         { media: 0.40, science: 0.50, government: 0.55, corporate: 0.40 },
  political:        { media: 0.40, science: 0.50, government: 0.55, corporate: 0.40 },
  media:            { media: 0.55, science: 0.50, government: 0.45, corporate: 0.40 },
  expert:           { media: 0.50, science: 0.75, government: 0.45, corporate: 0.35 },
  "social-media":   { media: 0.65, science: 0.40, government: 0.35, corporate: 0.60 },
  advocacy:         { media: 0.50, science: 0.55, government: 0.35, corporate: 0.30 },
  intentional:      { media: 0.30, science: 0.30, government: 0.25, corporate: 0.25 },
  education:        { media: 0.50, science: 0.70, government: 0.50, corporate: 0.35 },
  cognitive:        { media: 0.55, science: 0.40, government: 0.45, corporate: 0.45 },
  consumer:         { media: 0.55, science: 0.50, government: 0.40, corporate: 0.65 },
  entrepreneurship: { media: 0.50, science: 0.55, government: 0.35, corporate: 0.70 },
  environment:      { media: 0.45, science: 0.75, government: 0.40, corporate: 0.25 },
  family:           { media: 0.45, science: 0.60, government: 0.50, corporate: 0.40 },
  neutral:          { media: 0.50, science: 0.50, government: 0.50, corporate: 0.50 },
};

const DEFAULT_BIASES = { media: 0.50, science: 0.50, government: 0.50, corporate: 0.50 };

class InstitutionalTrust {
  static _filePath(experimentDir) {
    return path.join(experimentDir, "institutional_trust.json");
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  static initialize(nodePersonaMap, personaMap, experimentDir) {
    const fp = InstitutionalTrust._filePath(experimentDir);
    if (fileExists(fp)) return; // idempotent for resume

    const data = { nodes: {} };

    for (const [nodeId, personaId] of Object.entries(nodePersonaMap)) {
      const persona = personaMap[personaId] || {};
      const tags = persona.tags || [];

      // Average over all matching tag biases
      const sum = { media: 0, science: 0, government: 0, corporate: 0 };
      let count = 0;
      for (const tag of tags) {
        if (INITIAL_BIASES[tag]) {
          for (const inst of INSTITUTIONS) sum[inst] += INITIAL_BIASES[tag][inst];
          count++;
        }
      }
      data.nodes[nodeId] =
        count > 0
          ? Object.fromEntries(INSTITUTIONS.map((inst) => [inst, sum[inst] / count]))
          : { ...DEFAULT_BIASES };
    }

    writeJSON(fp, data);
  }

  static read(experimentDir) {
    const fp = InstitutionalTrust._filePath(experimentDir);
    if (!fileExists(fp)) return null;
    return readJSON(fp);
  }

  static write(data, experimentDir) {
    writeJSON(InstitutionalTrust._filePath(experimentDir), data);
  }

  // ── Institution lookup ─────────────────────────────────────────────────────

  // Returns which institution a persona belongs to (null if none)
  static getInstitution(personaId, personaMap) {
    const persona = personaMap[personaId] || {};
    const tags = persona.tags || [];
    for (const tag of tags) {
      if (TAG_TO_INSTITUTION[tag] !== undefined) {
        return TAG_TO_INSTITUTION[tag];
      }
    }
    return null;
  }

  // ── Trust multiplier ───────────────────────────────────────────────────────

  // adjustedTrust = clamp(directTrust × (0.5 + instTrust), 0, 1)
  //   instTrust = 0.5 → multiplier = 1.0 (neutral)
  //   instTrust = 0.0 → multiplier = 0.5 (penalise untrusted institution)
  //   instTrust = 1.0 → multiplier = 1.5 (boost trusted institution)
  static applyMultiplier(
    directTrust, senderPersonaId, recipientNodeId, trustData, personaMap
  ) {
    if (!trustData || !trustData.nodes[recipientNodeId]) return directTrust;
    const institution = InstitutionalTrust.getInstitution(senderPersonaId, personaMap);
    if (!institution) return directTrust;
    const instTrust = trustData.nodes[recipientNodeId][institution] ?? 0.50;
    return Math.max(0, Math.min(1, directTrust * (0.5 + instTrust)));
  }

  // ── Update after audit ─────────────────────────────────────────────────────

  // Erode institutional trust for nodes whose content had high MI;
  // recover trust for nodes whose content was accurate.
  static update(trustData, auditResults, personaMap, params = {}) {
    const erosionRate  = params.erosionRate  ?? 0.03;
    const recoveryRate = params.recoveryRate ?? 0.01;

    for (const result of Object.values(auditResults)) {
      for (const summary of Object.values(result.nodeSummaries || {})) {
        const institution = InstitutionalTrust.getInstitution(
          summary.personaId, personaMap
        );
        if (!institution) continue;
        const mpr = summary.mpr || 0;

        for (const instTrusts of Object.values(trustData.nodes)) {
          if (mpr > 3) {
            instTrusts[institution] = Math.max(
              0, instTrusts[institution] - erosionRate
            );
          } else {
            instTrusts[institution] = Math.min(
              1, instTrusts[institution] + recoveryRate
            );
          }
        }
      }
    }
    return trustData;
  }
}

module.exports = InstitutionalTrust;
