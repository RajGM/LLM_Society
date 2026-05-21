/**
 * Validation Comparison — statistical tests for digital twin fidelity.
 *
 * Implements:
 *   - Scalar metric comparison (per-cascade)
 *   - KS test (two-sample Kolmogorov-Smirnov) — distributional match
 *   - Jensen-Shannon divergence — distributional distance
 *   - Pearson correlation — linear agreement
 *   - Digital Twin Fidelity Score (DTFS) — composite summary
 *
 * All methods are pure (no I/O).
 */

class ValidationComparison {

  // ── Per-cascade structural comparison ─────────────────────────────────────

  /**
   * Compare scalar metrics from one real vs one simulated cascade.
   *
   * @returns {Object} report with per-metric ratios + overall structural similarity
   */
  static compare(realMetrics, simMetrics) {
    const METRICS = ["depth", "breadth", "structuralVirality"];
    const scalarComparison = {};
    const diffs            = [];

    for (const key of METRICS) {
      const real = realMetrics[key] ?? 0;
      const sim  = simMetrics[key]  ?? 0;
      const denom = real || 1;
      const ratio = sim / denom;
      const relDiff = Math.abs(ratio - 1);
      diffs.push(relDiff);

      scalarComparison[key] = {
        real,
        simulated: sim,
        ratio: +ratio.toFixed(4),
        relativeError: +relDiff.toFixed(4),
        match: relDiff < 0.30, // within 30% = reasonable match
      };
    }

    // Size is informational only (not included in similarity score —
    // real cascades are often much larger than simulation)
    const realSize = realMetrics.size ?? 0;
    const simSize  = simMetrics.size  ?? 0;
    scalarComparison.size = {
      real: realSize,
      simulated: simSize,
      ratio: +(simSize / (realSize || 1)).toFixed(4),
    };

    const structuralSimilarity = +(1 - (diffs.reduce((s, v) => s + v, 0) / diffs.length)).toFixed(4);
    const matchCount = Object.values(scalarComparison).filter((v) => v.match).length;

    return {
      scalarComparison,
      structuralSimilarity: Math.max(0, structuralSimilarity),
      matchedMetrics:       matchCount,
      totalMetrics:         METRICS.length,
    };
  }

  // ── Cross-cascade distributional comparison ────────────────────────────────

  /**
   * Compare distributions of cascade metrics across N real vs N simulated runs.
   *
   * @param {Object[]} realMetricsArray — array of real metric objects
   * @param {Object[]} simMetricsArray  — array of simulated metric objects
   * @returns {Object} per-metric KS, JS, and correlation + overall scores
   */
  static distributionalComparison(realMetricsArray, simMetricsArray) {
    const METRICS = ["depth", "breadth", "structuralVirality"];
    const report  = {};

    for (const key of METRICS) {
      const realVals = realMetricsArray.map((m) => m[key] ?? 0);
      const simVals  = simMetricsArray.map((m)  => m[key] ?? 0);

      const ks   = ValidationComparison._ksTest(realVals, simVals);
      const jsd  = ValidationComparison._jsDivergence(realVals, simVals, 20);
      const corr = ValidationComparison._pearsonR(realVals, simVals);

      report[key] = {
        realMean:     +_mean(realVals).toFixed(4),
        simMean:      +_mean(simVals).toFixed(4),
        realStd:      +_std(realVals).toFixed(4),
        simStd:       +_std(simVals).toFixed(4),
        ks:           { statistic: +ks.statistic.toFixed(4), pValue: +ks.pValue.toFixed(4) },
        jsDivergence: +jsd.toFixed(4),
        correlation:  +corr.toFixed(4),
        // distributionsMatch if KS p > 0.05 and JS < 0.1
        distributionsMatch: ks.pValue > 0.05 && jsd < 0.10,
      };
    }

    // Aggregate validation scores
    const metricVals = Object.values(report);
    const overallCorrelation = +_mean(metricVals.map((m) => Math.abs(m.correlation))).toFixed(4);
    const overallJSD         = +_mean(metricVals.map((m) => m.jsDivergence)).toFixed(4);
    const overallKS          = +_mean(metricVals.map((m) => m.ks.statistic)).toFixed(4);
    const distributionalScore = +(1 - overallJSD).toFixed(4); // D_k ∈ [0,1]

    report._summary = {
      overallCorrelation,
      overallJSD,
      overallKS,
      distributionalScore: Math.max(0, distributionalScore),
      nReal: realMetricsArray.length,
      nSim:  simMetricsArray.length,
    };

    return report;
  }

  // ── Digital Twin Fidelity Score ───────────────────────────────────────────

  /**
   * DTFS = w1·S_struct + w2·D + w3·ρ_content
   *
   * DTFS ≥ 0.70 → "validated" digital twin
   */
  static computeDTFS(structuralSimilarity, distributionalScore, contentCorrelation = 0, weights = {}) {
    const w = {
      structure:    weights.structure    ?? 0.40,
      distribution: weights.distribution ?? 0.40,
      content:      weights.content      ?? 0.20,
    };
    const dtfs =
      w.structure    * Math.max(0, Math.min(1, structuralSimilarity)) +
      w.distribution * Math.max(0, Math.min(1, distributionalScore))  +
      w.content      * Math.max(0, Math.min(1, contentCorrelation));

    return {
      dtfs:              +dtfs.toFixed(4),
      isValidated:       dtfs >= 0.70,
      structuralSimilarity: +structuralSimilarity.toFixed(4),
      distributionalScore:  +distributionalScore.toFixed(4),
      contentCorrelation:   +contentCorrelation.toFixed(4),
      weights: w,
    };
  }

  // ── Two-sample Kolmogorov-Smirnov test ────────────────────────────────────

  /**
   * KS statistic + approximate p-value.
   * Small D → distributions are similar.
   * p < 0.05 → significantly different.
   */
  static _ksTest(sample1, sample2) {
    const n1 = sample1.length;
    const n2 = sample2.length;
    if (n1 === 0 || n2 === 0) return { statistic: 1, pValue: 0 };

    const tagged = [
      ...sample1.map((v) => ({ v, s: 1 })),
      ...sample2.map((v) => ({ v, s: 2 })),
    ].sort((a, b) => a.v - b.v || a.s - b.s);

    let cdf1 = 0, cdf2 = 0, maxDiff = 0;
    for (const pt of tagged) {
      if (pt.s === 1) cdf1 += 1 / n1;
      else            cdf2 += 1 / n2;
      const diff = Math.abs(cdf1 - cdf2);
      if (diff > maxDiff) maxDiff = diff;
    }

    // Approximate p-value via Kolmogorov distribution
    const en     = Math.sqrt((n1 * n2) / (n1 + n2));
    const lambda = (en + 0.12 + 0.11 / en) * maxDiff;
    const pValue = 2 * Math.exp(-2 * lambda * lambda);

    return {
      statistic: maxDiff,
      pValue:    Math.max(0, Math.min(1, pValue)),
    };
  }

  // ── Pearson correlation coefficient ───────────────────────────────────────

  static _pearsonR(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 3) return 0;
    const xs = x.slice(0, n), ys = y.slice(0, n);
    const mx = _mean(xs), my = _mean(ys);
    let num = 0, dx = 0, dy = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - mx) * (ys[i] - my);
      dx  += (xs[i] - mx) ** 2;
      dy  += (ys[i] - my) ** 2;
    }
    return num / (Math.sqrt(dx * dy) + 1e-10);
  }

  // ── Jensen-Shannon divergence ─────────────────────────────────────────────

  /**
   * JS divergence ∈ [0, 1] (log base 2).
   * 0 = identical distributions, 1 = completely disjoint.
   */
  static _jsDivergence(sample1, sample2, numBins = 20) {
    if (sample1.length === 0 || sample2.length === 0) return 1;
    const allVals = [...sample1, ...sample2];
    const lo  = Math.min(...allVals);
    const hi  = Math.max(...allVals) + 1e-10;
    const width = (hi - lo) / numBins;

    const bin = (v) => Math.min(numBins - 1, Math.floor((v - lo) / width));

    const h1 = new Array(numBins).fill(0);
    const h2 = new Array(numBins).fill(0);
    for (const v of sample1) h1[bin(v)]++;
    for (const v of sample2) h2[bin(v)]++;

    const eps = 1e-10;
    const p   = h1.map((c) => c / sample1.length + eps);
    const q   = h2.map((c) => c / sample2.length + eps);
    const m   = p.map((v, i) => (v + q[i]) / 2);

    let kl1 = 0, kl2 = 0;
    for (let i = 0; i < numBins; i++) {
      kl1 += p[i] * Math.log2(p[i] / m[i]);
      kl2 += q[i] * Math.log2(q[i] / m[i]);
    }

    return Math.max(0, Math.min(1, (kl1 + kl2) / 2));
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function _mean(arr) {
  return arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length;
}

function _std(arr) {
  if (arr.length === 0) return 0;
  const m = _mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

module.exports = ValidationComparison;
