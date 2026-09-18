# linear_chain Phase 2 status

**Updated:** 2026-09-18T16:43:00Z  
**OPENAI_API_KEY present:** no (rechecked twice; waited ~15s between checks)  
**Dry-run:** not used  
**MI/MPR invented:** no

## Counts (persona × article cells)

Each config seeds 6 core articles (`scopex_2017`, `chemtrails_gates_2018_2021`, `sai_geoengineering`, `paris_agreement`, `climate_consensus`, `polar_bears`). N=1, 8 nodes / 8 hops / 8 ticks.

| slice | configs | cells | attempted | completed | failed (after start) | remaining |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| T2c_H | 12 | 72 | 0 | 0 | 0 | 72 |
| T2d_H | 12 | 72 | 0 | 0 | 0 | 72 |
| T2c_He | 6 | 36 | 0 | 0 | 0 | 36 |
| T2d_He | 6 | 36 | 0 | 0 | 0 | 36 |
| **total** | **36** | **216** | **0** | **0** | **0** | **216** |

Attempted = 0 because the key check failed before any `node index.js --config` launch. Remaining = all 216; skip-complete found no `T2*_linear_chain_*` dirs under `runs_phase2/`.

## Outputs

| path | role |
| --- | --- |
| `thesisExperiment/runs_phase2/_blockers/linear_chain_no_key.md` | blocker |
| `thesisExperiment/runs_phase2/_status/linear_chain.md` | this file |
| `thesisExperiment/results_phase2/logs/linear_chain_dead_cells.md` | hatch log (all 216 listed) |
| `thesisExperiment/results_phase2/tables/linear_chain_dead_cells.csv` | same cells as CSV |
| `thesisExperiment/configs/phase2/*linear_chain*.json` | existing configs (not modified) |

Did **not** run `parse_phase2.js`: no linear_chain run dirs exist. The only `runs_phase2` experiment dir is `probe_dnet_custom_*` (custom topology, LLM calls=0). Parsing it would write MPR=0 rows that are not thesis cells.

Did **not** touch Phase 1: `runs/`, `results/tables/`, `configs/full/`.

## Blocker

See `_blockers/linear_chain_no_key.md`. Recheck at ~16:42Z: process env unset, `/workspace/.env` absent, `thesisExperiment/.env` absent, `KEY_READY.md` absent. Waited ~15s and rechecked: still missing. Exited without launching cells.
