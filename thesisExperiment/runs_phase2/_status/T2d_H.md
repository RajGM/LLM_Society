# T2d_H status (dual homogeneous, all 8 topologies)

**Updated:** 2026-09-19T05:03:16.790Z
**OPENAI_API_KEY present:** yes (length=164; value not logged)
**Dry-run:** no
**MI/MPR invented:** no
**Dual:** 2 auditor LLM calls per event (`src/Auditor.js` `miScoringMode: dual`)
**Concurrency:** 4
**Isolation:** `thesisExperiment/runs_phase2` only (not Phase 1 `runs/` or `results/tables/`)

**Phase:** grid END T2d_H_scale_free_climate_scientist status=0 done=true.

## Counts (configs; each seeds 6 core articles)

| Count | n |
| --- | ---: |
| configs | 96 |
| completed | 95 |
| failed | 0 |
| skipped (already complete dual) | 62 |
| pending / not_started | 1 |
| LLM calls (this slice + probe) | 38103 |
| Est. USD | $4.0266 |

## By topology

| topology | configs | completed | failed | skipped | pending |
| --- | ---: | ---: | ---: | ---: | ---: |
| echo_chamber | 12 | 12 | 0 | 0 | 0 |
| hierarchical | 12 | 12 | 0 | 0 | 0 |
| linear_chain | 12 | 12 | 0 | 12 | 0 |
| polarized | 12 | 12 | 0 | 4 | 0 |
| random_er | 12 | 12 | 0 | 12 | 0 |
| ring | 12 | 12 | 0 | 12 | 0 |
| scale_free | 12 | 11 | 0 | 10 | 1 |
| small_world | 12 | 12 | 0 | 12 | 0 |

## Probe (dual)

- experiment: `probe_p2_dual`
- status: 0
- failed: false
- usage: 3 calls, 1522 prompt / 249 completion tokens ~$0.0004
- usageCalls: 3

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Manifest: `thesisExperiment/results_phase2/manifest_T2d_H.json`. Did not run `T2c_` or `He_` configs. Did not git commit.
