# T2c_He status (continuous heterogeneous, all 8 topologies)

**Updated:** 2026-09-19T04:19:56.791Z
**OPENAI_API_KEY present:** yes (length=164; value not logged)
**Dry-run:** no
**MI/MPR invented:** no
**Continuous:** headline MI/MPR is float ~0–5 (`src/Auditor.js` `miScoringMode: continuous`)
**Concurrency:** 4
**Isolation:** `thesisExperiment/runs_phase2` only (not Phase 1 `runs/` or `results/tables/`)

**Phase:** grid (sibling T2c_He orchestrator live; concurrency 4; skip completed).

Orchestrators: pid 155290, pid 181271, pid 181981, pid 182799.

## Counts (configs; each seeds 6 core articles)

| Count | n |
| --- | ---: |
| configs | 48 |
| completed | 35 |
| failed | 0 |
| skipped (already complete continuous) | 0 |
| in-flight | 13 |
| pending / not_started | 13 |
| LLM calls (this slice + probe) | 18686 |
| Est. USD | $2.2901 |

## By topology

| topology | configs | completed | failed | skipped | pending | in-flight |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| echo_chamber | 6 | 0 | 0 | 0 | 6 | 6 |
| hierarchical | 6 | 6 | 0 | 0 | 0 | 0 |
| linear_chain | 6 | 6 | 0 | 0 | 0 | 0 |
| polarized | 6 | 0 | 0 | 0 | 6 | 6 |
| random_er | 6 | 6 | 0 | 0 | 0 | 0 |
| ring | 6 | 6 | 0 | 0 | 0 | 0 |
| scale_free | 6 | 5 | 0 | 0 | 1 | 1 |
| small_world | 6 | 6 | 0 | 0 | 0 | 0 |

## Probe (continuous)

- experiment: `probe_T2c_He`
- status: complete
- failed: false
- usage: 1 calls, 604 prompt / 28 completion tokens ~$0.0001
- usageCalls: 1

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Manifest: `thesisExperiment/results_phase2/manifest_T2c_He.json`. Did not run `T2c_H_`, `T2d_H_`, or `T2d_He_` configs. Did not git commit.
