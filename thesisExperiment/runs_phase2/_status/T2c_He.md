# T2c_He status (continuous heterogeneous, all 8 topologies)

**Updated:** 2026-09-19T03:14:31.097Z
**OPENAI_API_KEY present:** yes (length=164; value not logged)
**Dry-run:** no
**MI/MPR invented:** no
**Continuous:** headline MI/MPR is float ~0–5 (`src/Auditor.js` `miScoringMode: continuous`)
**Concurrency:** 4
**Isolation:** `thesisExperiment/runs_phase2` only (not Phase 1 `runs/` or `results/tables/`)

**Phase:** grid (sibling T2c_He orchestrator live; concurrency 4; skip completed).

Orchestrators: pid 155290.

## Counts (configs; each seeds 6 core articles)

| Count | n |
| --- | ---: |
| configs | 48 |
| completed | 14 |
| failed | 0 |
| skipped (already complete continuous) | 0 |
| in-flight | 4 |
| pending / not_started | 34 |
| LLM calls (this slice + probe) | 2598 |
| Est. USD | $0.3259 |

## By topology

| topology | configs | completed | failed | skipped | pending | in-flight |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| echo_chamber | 6 | 0 | 0 | 0 | 6 | 0 |
| hierarchical | 6 | 0 | 0 | 0 | 6 | 0 |
| linear_chain | 6 | 6 | 0 | 0 | 0 | 0 |
| polarized | 6 | 0 | 0 | 0 | 6 | 0 |
| random_er | 6 | 2 | 0 | 0 | 4 | 4 |
| ring | 6 | 6 | 0 | 0 | 0 | 0 |
| scale_free | 6 | 0 | 0 | 0 | 6 | 0 |
| small_world | 6 | 0 | 0 | 0 | 6 | 0 |

## Probe (continuous)

- experiment: `probe_T2c_He`
- status: complete
- failed: false
- usage: 2 calls, 1056 prompt / 220 completion tokens ~$0.0003
- usageCalls: 2

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Manifest: `thesisExperiment/results_phase2/manifest_T2c_He.json`. Did not run `T2c_H_`, `T2d_H_`, or `T2d_He_` configs. Did not git commit.
