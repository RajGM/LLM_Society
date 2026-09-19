# Phase 2 comparison — Debnath hashtag graph vs simulated D-net

Generated: 2026-09-19T05:14:43.373Z

## Honesty

- Debnath has NO empirical MPR. Do not claim simulated MI equals Twitter MI.
- Hashtag co-occurrence is a structural/hashtag fallback, not a hydrated retweet cascade.
- 814k tweet IDs were not hydrated; BPs are theory-faithful reductions, not HDBSCAN centroids.
- 8 hops/ticks is logged cost compression vs CIKM 30, not a Debnath hop protocol.
- Pfeffer et al. (2014) lists seven interrelated factors. The thesis six-knob list is a remapping, not a restatement of that paper.
- Cross-media dynamics has no engine knob and is held.

## Data

- Empirical file: `thesisExperiment/data/derived/debnath_hashtag_cascade.json` (reconstruct or existing derived cascade)
- Empirical kind: `hashtag_cooccurrence`; generatedFallback=false
- Simulated runs matched (`Dnet_` name or `topology: custom`): **8**
- Simulated articles compared: **16**
- Isolation: did not write to `thesisExperiment/runs/` or `thesisExperiment/results/tables/`.

## Structural metrics (ValidationMetrics)

Real cascade via `extractRealMetrics`. Simulated via `extractSimulatedMetrics` on matching run dirs.

| metric | empirical | simulated (mean) | note |
| --- | --- | --- | --- |
| depth | 4 | 2.5625 | longest path from root |
| breadth | 33 | 40.9375 | max nodes at one level |
| size | 61 | 53.5 | informational only; real graphs are often larger |
| structuralVirality | 2.7 | 1.7963 | Goel et al. 2016 pairwise distance |
| speed | not available empirically | 7 ticks | do not convert ticks to hours |
| meanMI | no empirical MPR | 2.5529 | auditor only; not Twitter MI |

## ValidationComparison (KS / JS / DTFS)

Structural similarity (compare): **0.6885** (1/3 metrics within 30%).

| metric | real | simulated | ratio | relativeError | match |
| --- | --- | --- | --- | --- | --- |
| depth | 4 | 2.5625 | 0.6406 | 0.3594 | false |
| breadth | 33 | 40.9375 | 1.2405 | 0.2405 | true |
| structuralVirality | 2.7 | 1.7963 | 0.6653 | 0.3347 | false |
| size | 61 | 53.5 | 0.877 | — | — |

Distributional (KS / JS) with nReal=1, nSim=16. **Underpowered if nReal=1** — do not treat KS p-values as a twin-validation claim.

| metric | realMean | simMean | KS D | KS p | JS divergence | distributionsMatch |
| --- | --- | --- | --- | --- | --- | --- |
| depth | 4 | 2.5625 | 1 | 0.1104 | 1 | false |
| breadth | 33 | 40.9375 | 0.8125 | 0.2954 | 1 | false |
| structuralVirality | 2.7 | 1.7963 | 1 | 0.1104 | 1 | false |

DTFS = **0.2754** (isValidated=false; threshold 0.70). Content correlation set to 0: Debnath has no empirical MPR / tweet-text MI to correlate.

## Pfeffer observables (empirical vs simulated)

Seven rows: thesis remapping including held cross-media. See `pfeffer_observables.md` for Pfeffer 2014 vs this table.

| observable | Pfeffer 2014 map | empirical | simulated | status |
| --- | --- | --- | --- | --- |
| valence | toxicity / hashtag proxy (not MPR) | 0.1097 (paper mean 0.17) | mean MI 2.5529 (auditor; **not** Twitter MI) | measured_proxy |
| surprise | Pfeffer #1 speed/volume | paper SCoPEx spike quoted; not reconstructed | held (drip) | held_drip |
| identity | Pfeffer #5 lack of diversity | conspiracy 0.4444 / other 0.5556 | conspiracy share 0.7222 | measured_hashtag_mix |
| clustering | Pfeffer #3 network clusters | n=63 meanDeg=7.2381 Q_conspiracy=0.4039 | n=63 meanDeg=7.2381 Q=0.4566 | measured_hashtag_graph |
| echo | edge homophily | identityHomophily=0.864 | edgeHomophily=1 identityHomophily=1 | measured_edge_homophily |
| temporal | Pfeffer #1 / #7 | not available empirically | ticks 7 (sim clock only) | not_available_empirically |
| cross-media | Pfeffer #6 | held | held (no engine knob) | held_no_engine_knob |

## Files

- `thesisExperiment/results_phase2/debnath_compare.json`
- `thesisExperiment/results_phase2/summary.md`
- `thesisExperiment/results_phase2/pfeffer_observables.md`
