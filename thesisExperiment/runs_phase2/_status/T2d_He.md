# T2d_He status (dual heterogeneous, all 8 topologies)

**Updated:** 2026-09-19T03:35:02.859Z
**OPENAI_API_KEY present:** yes (length=164; value not logged)
**Dry-run:** no
**MI/MPR invented:** no
**Dual:** 2 auditor LLM calls per event (`src/Auditor.js` `miScoringMode: dual`)
**Concurrency:** 4
**Isolation:** `thesisExperiment/runs_phase2` only (not Phase 1 `runs/` or `results/tables/`)
**Git commit:** no

**Phase:** peer T2d_He orchestrator live (pids 155296). Watching; skip completed/in-progress; will run leftovers. Do not stop after one topology.

## Counts (configs; each seeds 6 core articles)

| Count | n |
| --- | ---: |
| configs | 48 |
| completed | 18 |
| failed | 0 |
| skipped (already complete dual) | 18 |
| in_progress | 4 |
| pending / not_started | 26 |
| LLM calls (this slice + probe) | 10869 |
| Est. USD | $1.1497 |

## By topology

| topology | configs | completed | failed | skipped | in_progress | pending |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| echo_chamber | 6 | 0 | 0 | 0 | 0 | 6 |
| hierarchical | 6 | 0 | 0 | 0 | 0 | 6 |
| linear_chain | 6 | 6 | 0 | 6 | 0 | 0 |
| polarized | 6 | 0 | 0 | 0 | 0 | 6 |
| random_er | 6 | 6 | 0 | 6 | 0 | 0 |
| ring | 6 | 6 | 0 | 6 | 0 | 0 |
| scale_free | 6 | 0 | 0 | 0 | 0 | 6 |
| small_world | 6 | 0 | 0 | 0 | 4 | 2 |

## Probe (dual)

- experiment: `probe_T2d_He`
- status: 0
- failed: false
- usage: 2 calls, 1155 prompt / 41 completion tokens ~$0.0002
- usageCalls: 2

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Manifest: `thesisExperiment/results_phase2/manifest_T2d_He.json`. Did not run `T2c_H_`, `T2d_H_`, or `T2c_He_` configs. Did not git commit.
