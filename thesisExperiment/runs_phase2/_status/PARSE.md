# Phase 2 parse harvest

**Updated.** 2026-09-19T05:14:37.163Z
**Source.** completed real LLM runs in `runs_phase2/` (latest complete dir with `llmCalls>0` per experiment).
**Dry-run.** no. **MI invented.** no.
**Isolation.** `results_phase2/` tables + this note. Did not write Phase 1 `runs/` or `results/tables/`.
**Dnet compare.** `simPending` = **false** (not rewritten by parse).

## Table row counts

| table | rows |
| --- | ---: |
| TH_rows.csv | 1152 |
| THe_rows.csv | 576 |
| continuous.csv | 864 |
| dual_discrete.csv | 864 |
| dual_gap.csv | 864 |
| dead_cells.csv | 292 |
| all_rows.csv | 1741 |
| missing_cells.csv | 0 |

- hatched dead after LLM (`nScored<=1` and `llmCalls>0`): **292** (kept; not dropped)
- expected grid cells: 1728
- missing / not finished: 0 (of which in-progress: 0)
- Dnet rows in all_rows: 8

## Slices

| slice | configs complete | cells harvested | configs in progress | cells in progress | hatched dead | harvest |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| T2c_H | 96/96 | 576/576 | 0 | 0 | 96 | fully_harvested |
| T2d_H | 96/96 | 576/576 | 0 | 0 | 98 | fully_harvested |
| T2c_He | 48/48 | 288/288 | 0 | 0 | 50 | fully_harvested |
| T2d_He | 48/48 | 288/288 | 0 | 0 | 48 | fully_harvested |

**Fully harvested:** T2c_H, T2d_H, T2c_He, T2d_He
**Still in progress:** (none)

In-progress configs (left missing; not empirical zeros):

- (none)

## Notes

- Dead cells with real usage are hatched (`hatched_dead_after_llm`) and kept in TH/THe/dual/all_rows/dead_cells.
- Still-running homogeneous configs are not scored as zeros.
- This replaces the 2026-09-18 abort harvest (`nMissingCells=1728`, empty TH_rows).
