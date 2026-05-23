/**
 * Layer 5 — Extended measurement metrics
 *
 * All methods are pure: they operate on node data read from experiment files.
 * No LLM calls. Call MetricsEngine.computeAll() after the audit phase.
 */

class MetricsEngine {
  // ── Information half-life ──────────────────────────────────────────────────
  // For each node: the tick at which its cumulative MI first exceeds half of the
  // maximum possible MI (numQuestions / 2). Returns per-node tick and the
  // network-wide median.
  static informationHalfLife(nodesData, articleId, maxMI = 5) {
    const threshold = maxMI / 2;
    const perNode = {};

    for (const [nodeId, state] of Object.entries(nodesData)) {
      const events = state.history
        .filter((e) => e.articleId === articleId && e.misinfoIndex !== null)
        .sort((a, b) => a.tick - b.tick);

      let halfLifeTick = null;
      for (const ev of events) {
        if (ev.misinfoIndex >= threshold) {
          halfLifeTick = ev.tick;
          break;
        }
      }
      perNode[nodeId] = halfLifeTick; // null = never reached threshold
    }

    const observed = Object.values(perNode).filter((t) => t !== null);
    const networkMedian =
      observed.length > 0
        ? observed.sort((a, b) => a - b)[Math.floor(observed.length / 2)]
        : null;

    return { perNode, networkMedian };
  }

  // ── Cascade reach vs. fidelity ────────────────────────────────────────────
  // Reach = number of events a node generated for this article.
  // Fidelity = 1 − (meanMI / maxMI).
  // Higher reach with lower fidelity = super-spreader of distorted content.
  static cascadeReachVsFidelity(nodesData, articleId, maxMI = 5) {
    const points = [];
    for (const [nodeId, state] of Object.entries(nodesData)) {
      const events = state.history.filter(
        (e) => e.articleId === articleId && e.misinfoIndex !== null
      );
      if (events.length === 0) continue;
      const meanMI = events.reduce((s, e) => s + e.misinfoIndex, 0) / events.length;
      points.push({
        nodeId,
        personaId: state.personaId,
        reach: events.length,
        meanMI,
        fidelity: 1 - meanMI / maxMI,
      });
    }
    return points.sort((a, b) => b.reach - a.reach);
  }

  // ── Network-level MI over time ────────────────────────────────────────────
  // Mean MI across all nodes at each tick.
  // Produces the "society-level misinformation state" time series.
  static networkMIOverTime(nodesData, articleId, maxTicks) {
    const byTick = {};
    for (let t = 1; t <= maxTicks; t++) byTick[t] = { sum: 0, count: 0 };

    for (const state of Object.values(nodesData)) {
      for (const ev of state.history) {
        if (ev.articleId !== articleId || ev.misinfoIndex === null) continue;
        if (!byTick[ev.tick]) byTick[ev.tick] = { sum: 0, count: 0 };
        byTick[ev.tick].sum += ev.misinfoIndex;
        byTick[ev.tick].count++;
      }
    }

    return Object.entries(byTick)
      .map(([tick, { sum, count }]) => ({
        tick: parseInt(tick),
        meanMI: count > 0 ? sum / count : null,
        activeNodes: count,
      }))
      .filter((r) => r.meanMI !== null)
      .sort((a, b) => a.tick - b.tick);
  }

  // ── Gini coefficient of misinformation ───────────────────────────────────
  // 0 = perfectly equal MI across all nodes; 1 = all MI concentrated in one node.
  // High Gini = echo chambers isolating distortion in specific clusters.
  static giniCoefficient(nodesData, articleId) {
    const miValues = [];
    for (const state of Object.values(nodesData)) {
      const events = state.history.filter(
        (e) => e.articleId === articleId && e.misinfoIndex !== null
      );
      if (events.length > 0) {
        const mean = events.reduce((s, e) => s + e.misinfoIndex, 0) / events.length;
        miValues.push(mean);
      }
    }
    if (miValues.length < 2) return 0;

    miValues.sort((a, b) => a - b);
    const n = miValues.length;
    const sum = miValues.reduce((s, v) => s + v, 0);
    if (sum === 0) return 0;

    let numerator = 0;
    for (let i = 0; i < n; i++) numerator += (2 * (i + 1) - n - 1) * miValues[i];
    return numerator / (n * sum);
  }

  // ── Critical mass threshold ───────────────────────────────────────────────
  // At each tick: fraction of nodes with mean MI > miThreshold.
  // Models network tipping point toward propaganda saturation.
  static criticalMassThreshold(nodesData, articleId, miThreshold = 3) {
    const tickNodeMI = {};

    for (const [nodeId, state] of Object.entries(nodesData)) {
      for (const ev of state.history) {
        if (ev.articleId !== articleId || ev.misinfoIndex === null) continue;
        if (!tickNodeMI[ev.tick]) tickNodeMI[ev.tick] = {};
        if (!tickNodeMI[ev.tick][nodeId]) tickNodeMI[ev.tick][nodeId] = [];
        tickNodeMI[ev.tick][nodeId].push(ev.misinfoIndex);
      }
    }

    const totalNodes = Object.keys(nodesData).length;
    return Object.entries(tickNodeMI)
      .map(([tick, nodeMap]) => {
        const aboveThreshold = Object.values(nodeMap).filter(
          (vals) => vals.reduce((s, v) => s + v, 0) / vals.length > miThreshold
        ).length;
        return {
          tick: parseInt(tick),
          fraction: aboveThreshold / totalNodes,
          aboveThreshold,
        };
      })
      .sort((a, b) => a.tick - b.tick);
  }

  // ── Structural virality (Goel et al. 2016) ───────────────────────────────
  // Average shortest-path distance between all pairs of nodes that received
  // the article, computed on the propagation tree (not the full graph).
  // Low SV ≈ broadcast (hub-and-spoke); high SV ≈ viral chain (peer-to-peer).
  static structuralVirality(nodesData, articleId) {
    // Build propagation tree: nodeId -> [childNodeIds] based on sourceNodeId
    const children = {};
    const adopters = new Set();

    for (const [nodeId, state] of Object.entries(nodesData)) {
      for (const ev of state.history) {
        if (ev.articleId !== articleId) continue;
        if (ev.action === "drop" || ev.action === "dump") continue;
        adopters.add(nodeId);
        const src = ev.sourceNodeId;
        if (src && src !== "ORIGIN") {
          if (!children[src]) children[src] = new Set();
          children[src].add(nodeId);
          adopters.add(src);
        }
      }
    }

    const adopterList = [...adopters];
    if (adopterList.length < 2) return 0;

    // BFS distance from each node in the undirected propagation tree
    const adj = {};
    for (const [parent, childSet] of Object.entries(children)) {
      adj[parent] = adj[parent] || [];
      for (const child of childSet) {
        adj[parent].push(child);
        adj[child] = adj[child] || [];
        adj[child].push(parent);
      }
    }

    let totalDist = 0;
    let pairs = 0;

    for (const src of adopterList) {
      const dist = { [src]: 0 };
      const queue = [src];
      let qi = 0;
      while (qi < queue.length) {
        const cur = queue[qi++];
        for (const nbr of (adj[cur] || [])) {
          if (dist[nbr] === undefined) {
            dist[nbr] = dist[cur] + 1;
            queue.push(nbr);
          }
        }
      }
      for (const dst of adopterList) {
        if (dst > src && dist[dst] !== undefined) {
          totalDist += dist[dst];
          pairs++;
        }
      }
    }

    return pairs > 0 ? totalDist / pairs : 0;
  }

  // ── Frame-level aggregates (from FrameAuditor data in history) ─────────────
  static frameMetrics(nodesData, articleId) {
    const allFrameShifts = [];
    const allSentimentDeltas = [];
    const allNewClaims = [];

    for (const state of Object.values(nodesData)) {
      for (const ev of state.history) {
        if (ev.articleId !== articleId || !ev.frameAnalysis) continue;
        allFrameShifts.push(ev.frameAnalysis.frameShift);
        allSentimentDeltas.push(ev.frameAnalysis.sentimentDelta);
        allNewClaims.push(...(ev.frameAnalysis.newClaims || []));
      }
    }

    const mean = (arr) =>
      arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

    return {
      meanFrameShift: mean(allFrameShifts),
      meanSentimentDelta: mean(allSentimentDeltas),
      totalNewClaims: allNewClaims.length,
      uniqueNewClaims: [...new Set(allNewClaims)].length,
    };
  }

  // ── Human evaluation export ────────────────────────────────────────────────
  // Samples up to N (original, rewritten) pairs across all nodes and articles
  // and writes a CSV for human rating. Raters score factual accuracy,
  // frame shift, and persuasiveness on a 1–5 scale.
  static buildHumanEvalCSV(nodesData, articleMap, sampleSize = 50) {
    const rows = [
      "eval_id,article_id,node_id,persona_id,tick,action,original_text,rewritten_text," +
        "auditor_mi,frame_shift,rating_factual,rating_frame,rating_persuasion",
    ];

    const candidates = [];
    for (const [nodeId, state] of Object.entries(nodesData)) {
      for (const ev of state.history) {
        if (ev.action !== "reinterpret" && ev.action !== "forward") continue;
        if (!ev.contentOut) continue;
        candidates.push({ nodeId, personaId: state.personaId, ev });
      }
    }

    // Shuffle and sample
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const sampled = candidates.slice(0, sampleSize);
    for (let i = 0; i < sampled.length; i++) {
      const { nodeId, personaId, ev } = sampled[i];
      const clean = (s) => (s || "").replace(/"/g, '""').replace(/\n/g, " ");
      rows.push(
        [
          i + 1,
          ev.articleId,
          nodeId,
          personaId,
          ev.tick,
          ev.action,
          `"${clean(ev.contentIn)}"`,
          `"${clean(ev.contentOut)}"`,
          ev.misinfoIndex ?? "",
          ev.frameAnalysis ? ev.frameAnalysis.frameShift.toFixed(3) : "",
          "", // rater fills in
          "",
          "",
        ].join(",")
      );
    }

    return rows.join("\n");
  }

  // ── Bot impact metrics ─────────────────────────────────────────────────────
  // Compares MI between bot-sourced and human-sourced events.
  //
  // botNodeIds — Set or array of node IDs that are bots.
  // Returns:
  //   botMeanMI, humanMeanMI, botMIDelta, botReachFraction,
  //   botAmplificationFactor, cascadeContamination
  static botImpactMetrics(nodesData, botNodeIds, articleId) {
    const bots = new Set(botNodeIds);

    const botMIs = [];
    const humanMIs = [];
    let totalEvents = 0;
    let contaminatedEvents = 0;
    let botForwards = 0;
    let humanForwards = 0;

    for (const [nodeId, state] of Object.entries(nodesData)) {
      const isBot = bots.has(nodeId);
      for (const ev of state.history) {
        if (ev.articleId !== articleId) continue;
        if (ev.misinfoIndex === null || ev.misinfoIndex === undefined) continue;

        totalEvents++;

        // Cascade contamination: any event where provenance includes a bot hop
        const provenance = ev.provenance || [];
        if (provenance.some((hop) => hop.isBot || bots.has(hop.nodeId))) {
          contaminatedEvents++;
        }

        if (isBot) {
          botMIs.push(ev.misinfoIndex);
          botForwards++;
        } else {
          humanMIs.push(ev.misinfoIndex);
          humanForwards++;
        }
      }
    }

    const mean = (arr) =>
      arr.length === 0 ? null : arr.reduce((s, v) => s + v, 0) / arr.length;

    const botMeanMI    = mean(botMIs);
    const humanMeanMI  = mean(humanMIs);
    const botMIDelta   = botMeanMI !== null && humanMeanMI !== null
      ? botMeanMI - humanMeanMI
      : null;

    const totalForwards = botForwards + humanForwards;
    const botReachFraction = totalForwards > 0 ? botForwards / totalForwards : 0;
    const botAmplificationFactor =
      humanForwards > 0 ? botForwards / humanForwards : null;

    const cascadeContamination =
      totalEvents > 0 ? contaminatedEvents / totalEvents : 0;

    return {
      botMeanMI,
      humanMeanMI,
      botMIDelta,
      botReachFraction,
      botAmplificationFactor,
      cascadeContamination,
    };
  }

  // ── Bot counterfactual MI ──────────────────────────────────────────────────
  // Estimates what network mean MI would be without bot influence by excluding
  // any event whose provenance chain includes at least one bot hop.
  //
  // Returns:
  //   actualMeanMI, counterfactualMeanMI, botCausalContribution
  static botCounterfactualMI(nodesData, botNodeIds, articleId) {
    const bots = new Set(botNodeIds);

    const allMIs = [];
    const cleanMIs = [];

    for (const [, state] of Object.entries(nodesData)) {
      for (const ev of state.history) {
        if (ev.articleId !== articleId) continue;
        if (ev.misinfoIndex === null || ev.misinfoIndex === undefined) continue;

        allMIs.push(ev.misinfoIndex);

        const provenance = ev.provenance || [];
        const touchedByBot = provenance.some((hop) => hop.isBot || bots.has(hop.nodeId));
        if (!touchedByBot) {
          cleanMIs.push(ev.misinfoIndex);
        }
      }
    }

    const mean = (arr) =>
      arr.length === 0 ? null : arr.reduce((s, v) => s + v, 0) / arr.length;

    const actualMeanMI        = mean(allMIs);
    const counterfactualMeanMI = mean(cleanMIs);
    const botCausalContribution =
      actualMeanMI !== null && counterfactualMeanMI !== null
        ? actualMeanMI - counterfactualMeanMI
        : null;

    return { actualMeanMI, counterfactualMeanMI, botCausalContribution };
  }

  // ── IFD aggregate metrics (Extension: Information Fidelity Decomposition) ──
  // Mean CR/MR/IR/CMS/IE across all audited events for the article.
  // Events without ifd (old data or pre-IFD runs) are skipped gracefully.
  static ifdMetrics(nodesData, articleId) {
    const cr = [], mr = [], ir = [], cms = [], ie = [];

    for (const state of Object.values(nodesData)) {
      for (const ev of state.history) {
        if (ev.articleId !== articleId || !ev.ifd) continue;
        cr.push(ev.ifd.cr);
        mr.push(ev.ifd.mr);
        ir.push(ev.ifd.ir);
        cms.push(ev.ifd.cms);
        ie.push(ev.ifd.ie);
      }
    }

    const mean = (arr) =>
      arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

    return {
      meanCR: mean(cr),
      meanMR: mean(mr),
      meanIR: mean(ir),
      meanCMS: mean(cms),
      meanIE: mean(ie),
      eventCount: cr.length,
    };
  }

  // ── IFD over time — mean CR/MR/IR/CMS per tick ───────────────────────────
  static ifdOverTime(nodesData, articleId, maxTicks) {
    const byTick = {};
    for (let t = 1; t <= maxTicks; t++) {
      byTick[t] = { cr: [], mr: [], ir: [], cms: [] };
    }

    for (const state of Object.values(nodesData)) {
      for (const ev of state.history) {
        if (ev.articleId !== articleId || !ev.ifd) continue;
        if (!byTick[ev.tick]) byTick[ev.tick] = { cr: [], mr: [], ir: [], cms: [] };
        byTick[ev.tick].cr.push(ev.ifd.cr);
        byTick[ev.tick].mr.push(ev.ifd.mr);
        byTick[ev.tick].ir.push(ev.ifd.ir);
        byTick[ev.tick].cms.push(ev.ifd.cms);
      }
    }

    const mean = (arr) =>
      arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

    return Object.entries(byTick)
      .map(([tick, d]) => ({
        tick: parseInt(tick),
        meanCR: mean(d.cr),
        meanMR: mean(d.mr),
        meanIR: mean(d.ir),
        meanCMS: mean(d.cms),
      }))
      .filter((r) => r.meanCR !== null)
      .sort((a, b) => a.tick - b.tick);
  }

  // ── Per-persona IFD — fidelity vector per persona type ───────────────────
  // Returns array sorted by meanCMS descending (worst distorters first).
  static personaIFD(nodesData, articleId) {
    const byPersona = {};

    for (const state of Object.values(nodesData)) {
      const pid = state.personaId;
      if (!byPersona[pid]) byPersona[pid] = { cr: [], mr: [], ir: [], cms: [] };
      for (const ev of state.history) {
        if (ev.articleId !== articleId || !ev.ifd) continue;
        byPersona[pid].cr.push(ev.ifd.cr);
        byPersona[pid].mr.push(ev.ifd.mr);
        byPersona[pid].ir.push(ev.ifd.ir);
        byPersona[pid].cms.push(ev.ifd.cms);
      }
    }

    const mean = (arr) =>
      arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

    return Object.entries(byPersona)
      .filter(([, d]) => d.cr.length > 0)
      .map(([personaId, d]) => ({
        personaId,
        meanCR: mean(d.cr),
        meanMR: mean(d.mr),
        meanIR: mean(d.ir),
        meanCMS: mean(d.cms),
        eventCount: d.cr.length,
      }))
      .sort((a, b) => b.meanCMS - a.meanCMS);
  }

  // ── Compute everything ─────────────────────────────────────────────────────
  // botNodeIds is optional; pass a non-empty array to include bot metrics.
  static computeAll(nodesData, topology, articleId, maxTicks, botNodeIds = []) {
    const result = {
      informationHalfLife:     MetricsEngine.informationHalfLife(nodesData, articleId),
      cascadeReachVsFidelity:  MetricsEngine.cascadeReachVsFidelity(nodesData, articleId),
      networkMIOverTime:       MetricsEngine.networkMIOverTime(nodesData, articleId, maxTicks),
      giniCoefficient:         MetricsEngine.giniCoefficient(nodesData, articleId),
      criticalMassThreshold:   MetricsEngine.criticalMassThreshold(nodesData, articleId),
      structuralVirality:      MetricsEngine.structuralVirality(nodesData, articleId),
      frameMetrics:            MetricsEngine.frameMetrics(nodesData, articleId),
      ifdMetrics:              MetricsEngine.ifdMetrics(nodesData, articleId),
      ifdOverTime:             MetricsEngine.ifdOverTime(nodesData, articleId, maxTicks),
      personaIFD:              MetricsEngine.personaIFD(nodesData, articleId),
    };

    if (botNodeIds.length > 0) {
      result.botImpact        = MetricsEngine.botImpactMetrics(nodesData, botNodeIds, articleId);
      result.botCounterfactual = MetricsEngine.botCounterfactualMI(nodesData, botNodeIds, articleId);
    }

    return result;
  }
}

module.exports = MetricsEngine;
