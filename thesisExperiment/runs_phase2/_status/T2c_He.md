# T2c_He status (continuous heterogeneous, all 8 topologies)

**Updated:** 2026-09-19T04:31:00Z
**OPENAI_API_KEY present:** yes (length=164; value not logged)
**Dry-run:** no
**MI/MPR invented:** no
**Continuous:** headline MI/MPR is float ~0–5 (`src/Auditor.js` `miScoringMode: continuous`)
**Concurrency:** 4
**Isolation:** `thesisExperiment/runs_phase2` only (not Phase 1 `runs/` or `results/tables/`)

**Phase:** finished. completed=48 failed=0 skipped=34 pending=0.

Key loaded from gitignored `/workspace/.env` (dotenv). Sibling `KEY_READY.md` present. Polled 2s; file already existed.

## Counts (configs; each seeds 6 core articles)

| Count | n |
| --- | ---: |
| configs | 48 |
| completed | 48 |
| failed | 0 |
| skipped (already complete continuous) | 34 |
| pending / not_started | 0 |
| LLM calls (this slice + probe) | 25700 |
| Est. USD | $3.2366 |

## By topology

| topology | configs | completed | failed | skipped | pending |
| --- | ---: | ---: | ---: | ---: | ---: |
| echo_chamber | 6 | 6 | 0 | 4 | 0 |
| hierarchical | 6 | 6 | 0 | 0 | 0 |
| linear_chain | 6 | 6 | 0 | 6 | 0 |
| polarized | 6 | 6 | 0 | 0 | 0 |
| random_er | 6 | 6 | 0 | 6 | 0 |
| ring | 6 | 6 | 0 | 6 | 0 |
| scale_free | 6 | 6 | 0 | 6 | 0 |
| small_world | 6 | 6 | 0 | 6 | 0 |

## Probe (continuous)

- experiment: `probe_T2c_He`
- first probe: `probe_T2c_He_2026-09-19_02-51-00` status=complete failed=false usage=2 calls, 1056 prompt / 220 completion tokens ~$0.0003
- later re-probe: `probe_T2c_He_2026-09-19_04-14-23` status=complete failed=false usage=1 calls, 604 prompt / 28 completion tokens ~$0.0001
- usageCalls (latest): 1
- usage>0 before grid: yes

## Notes

- First 18 echo/hierarchical/polarized attempts (04:08Z) crashed on unknown cluster persona ids (`conspiracy_peripheral_skywatcher`, `climate_action_sweden_scopex`) before the engine fallback in `src/Simulation.js`. Those cells were **not** treated as thesis results. After the fallback, all 18 were re-run with real LLM usage and completed.
- Did not stop after one topology. Skip-completed used `metadata.status` complete + `miScoringMode: continuous`.
- 8 hops/ticks is a logged cost cut vs CIKM K=30, not Debnath.

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Manifest: `thesisExperiment/results_phase2/manifest_T2c_He.json`. Did not run `T2c_H_`, `T2d_H_`, or `T2d_He_` configs. Did not git commit.
