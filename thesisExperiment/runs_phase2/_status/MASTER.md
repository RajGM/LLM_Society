# Phase 2 MASTER status

**Updated.** 2026-09-19T03:58:09.833Z
**OPENAI_API_KEY found.** yes (length=164)
**Dry-run.** no. **MI invented.** no.
**Isolation.** `runs_phase2/` + `results_phase2/` only. Did not write Phase 1 `runs/` or `results/tables/`.

## Grid (288 configs / 1728 cells)

| slice | configs | complete | in_progress | incomplete | not_started | cells (×6) |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| T2c_H | 96 | 40 | 8 | 0 | 48 | 240/576 |
| T2d_H | 96 | 51 | 13 | 0 | 32 | 306/576 |
| T2c_He | 48 | 25 | 5 | 0 | 18 | 150/288 |
| T2d_He | 48 | 24 | 5 | 0 | 19 | 144/288 |
| **grid** | **288** | **140** | **31** |  |  | **840/1728** |

## Per topology (complete/n)

| topology | T2c_H done/n | T2d_H done/n | T2c_He done/n | T2d_He done/n |
| --- | ---: | ---: | ---: | ---: |
| linear_chain | 12/12 | 12/12 | 6/6 | 6/6 |
| ring | 12/12 | 12/12 | 6/6 | 6/6 |
| random_er | 11/12 | 10/12 | 6/6 | 6/6 |
| small_world | 3/12 | 2/12 | 4/6 | 5/6 |
| scale_free | 2/12 | 3/12 | 3/6 | 1/6 |
| echo_chamber | 0/12 | 12/12 | 0/6 | 0/6 |
| polarized | 0/12 | 0/12 | 0/6 | 0/6 |
| hierarchical | 0/12 | 0/12 | 0/6 | 0/6 |

## D-net

- `Dnet_c_H_conspiracy`: in_progress usage=0 (Dnet_c_H_conspiracy_2026-09-19_02-49-31)
- `Dnet_c_He_mixed`: not_started usage=0 (no run dir)
- `Dnet_d_H_conspiracy`: in_progress usage=0 (Dnet_d_H_conspiracy_2026-09-19_02-49-31)
- `Dnet_d_He_mixed`: not_started usage=0 (no run dir)

Dnet complete: **0/4**
live index.js: 45

## Compare

`simPending` = **true**

## Workers

T2c_H=alive T2d_H=alive T2c_He=alive T2d_He=alive dnet=alive master_phase2=alive

## Notes

- continuation master loop. complete=140/288 in_progress=31
- gap actions this tick: none (workers healthy or no gap)
- no overlapping full grid. no dry-run. no invented MI.

Sibling slice agents may also write `runs_phase2`. This master skips completed cells and does not kill other node processes.
