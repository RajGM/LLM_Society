# Phase 2 harvest — partial grid + Debnath compare

Harvest generated: 2026-09-18T16:42:14Z  
Debnath compare generated: 2026-09-18T16:42:25.769Z

## T-H / T-He grid (honest partial)

**OPENAI_API_KEY found: no.** Real dual+continuous IFD probe: **not run**. Dry-run: no. MI invented: no.

| slice | configs | persona×article cells | completed | running | blocked |
| --- | ---: | ---: | ---: | ---: | ---: |
| T2c_H | 96 | 576 | 0 | 0 | 576 |
| T2d_H | 96 | 576 | 0 | 0 | 576 |
| T2c_He | 48 | 288 | 0 | 0 | 288 |
| T2d_He | 48 | 288 | 0 | 0 | 288 |
| **grid** | **288** | **1728** | **0** | **0** | **1728** |

**0 / 288** thesis configs finished. All eight topologies × four slices are **blocked** (see `thesisExperiment/runs_phase2/_status/ALL_TOPOLOGIES.md`).

### parse_phase2.js

Ran against `runs_phase2`. Shared tables under `results_phase2/tables/`:

| file | rows |
| --- | ---: |
| `TH_rows.csv` | 0 |
| `THe_rows.csv` | 0 |
| `continuous.csv` | 1 (failed `probe_dnet_custom`, not a thesis cell) |
| `dual_discrete.csv` | 0 |
| `dual_gap.csv` | 0 |
| `dead_cells.csv` | 1 (`probe_dnet_custom`, nScored=0, llmCalls=0) |
| `all_rows.csv` | 1 |

`summary.json`: nRows=1, nTH=0, nTHe=0, nDual=0, nDead=1, meanMPR_TH_continuous=null, meanMPR_TH_dualHeadline=null, thesisGrade=false.

**Hatch.** No real LLM dead cells (`nScored <= 1` after usage>0). The D-net probe row is API-fail (hatched). The 1728 grid cells are missing/blocked, not empirical MI=0.

Do **not** mix discrete and continuous means. Dual headline MPR is discrete; continuous is sidecar. Neither field was observed on a live auditor response this harvest.

Isolation: did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`.

---

# Phase 2 comparison — Debnath hashtag graph vs simulated D-net

Generated: 2026-09-18T16:42:25.769Z

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
- Simulated runs matched (`Dnet_` name or `topology: custom`): **0**
- **Sim pending.** D-net / custom cells were not found under `thesisExperiment/runs_phase2/`. Empirical Pfeffer table is still written.
- Isolation: did not write to `thesisExperiment/runs/` or `thesisExperiment/results/tables/`.

## Structural metrics (ValidationMetrics)

Real cascade via `extractRealMetrics`. Simulated via `extractSimulatedMetrics` on matching run dirs.

| metric | empirical | simulated (mean) | note |
| --- | --- | --- | --- |
| depth | 4 | sim pending | longest path from root |
| breadth | 33 | sim pending | max nodes at one level |
| size | 61 | sim pending | informational only; real graphs are often larger |
| structuralVirality | 2.7 | sim pending | Goel et al. 2016 pairwise distance |
| speed | not available empirically | sim pending | do not convert ticks to hours |
| meanMI | no empirical MPR | sim pending | auditor only; not Twitter MI |

## ValidationComparison (KS / JS / DTFS)

Not computed — **sim pending**.

## Pfeffer observables (empirical vs simulated)

Seven rows: thesis remapping including held cross-media. See `pfeffer_observables.md` for Pfeffer 2014 vs this table.

| observable | Pfeffer 2014 map | empirical | simulated | status |
| --- | --- | --- | --- | --- |
| valence | toxicity / hashtag proxy (not MPR) | 0.1097 (paper mean 0.17) | sim pending | measured_proxy |
| surprise | Pfeffer #1 speed/volume | paper SCoPEx spike quoted; not reconstructed | sim pending | held_drip |
| identity | Pfeffer #5 lack of diversity | conspiracy 0.4444 / other 0.5556 | sim pending | measured_hashtag_mix |
| clustering | Pfeffer #3 network clusters | n=63 meanDeg=7.2381 Q_conspiracy=0.4039 | sim pending | measured_hashtag_graph |
| echo | edge homophily | identityHomophily=0.864 | sim pending | measured_edge_homophily |
| temporal | Pfeffer #1 / #7 | not available empirically | sim pending | not_available_empirically |
| cross-media | Pfeffer #6 | held | held (no engine knob) | held_no_engine_knob |

## Files

- `thesisExperiment/results_phase2/debnath_compare.json`
- `thesisExperiment/results_phase2/summary.md`
- `thesisExperiment/results_phase2/pfeffer_observables.md`
