# Phase 2 MASTER status

**Updated.** 2026-09-19T02:58:51.827Z
**OPENAI_API_KEY found.** yes (length=164)
**Dry-run.** no. **MI invented.** no.
**Isolation.** `runs_phase2/` + `results_phase2/` only. Did not write Phase 1 `runs/` or `results/tables/`.

## Grid (288 configs / 1728 cells)

| slice | configs | complete | in_progress | incomplete | not_started | cells (×6) |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| T2c_H | 96 | 19 | 4 | 0 | 73 | 114/576 |
| T2d_H | 96 | 18 | 8 | 0 | 70 | 108/576 |
| T2c_He | 48 | 12 | 4 | 0 | 32 | 72/288 |
| T2d_He | 48 | 12 | 4 | 0 | 32 | 72/288 |
| **grid** | **288** | **61** | **20** |  |  | **366/1728** |

## Per topology (complete/n)

| topology | T2c_H done/n | T2d_H done/n | T2c_He done/n | T2d_He done/n |
| --- | ---: | ---: | ---: | ---: |
| linear_chain | 12/12 | 12/12 | 6/6 | 6/6 |
| ring | 7/12 | 6/12 | 6/6 | 6/6 |
| random_er | 0/12 | 0/12 | 0/6 | 0/6 |
| small_world | 0/12 | 0/12 | 0/6 | 0/6 |
| scale_free | 0/12 | 0/12 | 0/6 | 0/6 |
| echo_chamber | 0/12 | 0/12 | 0/6 | 0/6 |
| polarized | 0/12 | 0/12 | 0/6 | 0/6 |
| hierarchical | 0/12 | 0/12 | 0/6 | 0/6 |

## D-net

- `Dnet_c_H_conspiracy`: in_progress usage=0 (Dnet_c_H_conspiracy_2026-09-19_02-49-31)
- `Dnet_c_He_mixed`: not_started usage=0 (no run dir)
- `Dnet_d_H_conspiracy`: in_progress usage=0 (Dnet_d_H_conspiracy_2026-09-19_02-49-31)
- `Dnet_d_He_mixed`: not_started usage=0 (no run dir)

Dnet complete: **0/4**
live index.js: 24

## Compare

`simPending` = **true**

## Workers

T2c_H=none T2d_H=alive T2c_He=alive T2d_He=alive dnet=alive master_phase2=alive

## Notes

- continuation master loop. complete=61/288 in_progress=20
- gap actions this tick: [{"launched":true,"pid":162661,"slice":"T2c_H","topo":"ring"}]
- no overlapping full grid. no dry-run. no invented MI.

Sibling slice agents may also write `runs_phase2`. This master skips completed cells and does not kill other node processes.
