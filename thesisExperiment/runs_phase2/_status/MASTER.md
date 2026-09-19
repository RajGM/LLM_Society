# Phase 2 MASTER status

**Updated.** 2026-09-19T04:33:26.604Z
**OPENAI_API_KEY found.** yes (length=164)
**Dry-run.** no. **MI invented.** no.
**Isolation.** `runs_phase2/` + `results_phase2/` only. Did not write Phase 1 `runs/` or `results/tables/`.

## Grid (288 configs / 1728 cells)

| slice | configs | complete | in_progress | incomplete | not_started | cells (×6) |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| T2c_H | 96 | 77 | 13 | 0 | 6 | 462/576 |
| T2d_H | 96 | 86 | 10 | 0 | 0 | 516/576 |
| T2c_He | 48 | 47 | 1 | 0 | 0 | 282/288 |
| T2d_He | 48 | 46 | 2 | 0 | 0 | 276/288 |
| **grid** | **288** | **256** | **26** |  |  | **1536/1728** |

## Per topology (complete/n)

| topology | T2c_H done/n | T2d_H done/n | T2c_He done/n | T2d_He done/n |
| --- | ---: | ---: | ---: | ---: |
| linear_chain | 12/12 | 12/12 | 6/6 | 6/6 |
| ring | 12/12 | 12/12 | 6/6 | 6/6 |
| random_er | 12/12 | 12/12 | 6/6 | 6/6 |
| small_world | 11/12 | 9/12 | 6/6 | 6/6 |
| scale_free | 9/12 | 9/12 | 6/6 | 6/6 |
| echo_chamber | 5/12 | 12/12 | 5/6 | 5/6 |
| polarized | 5/12 | 8/12 | 6/6 | 5/6 |
| hierarchical | 11/12 | 12/12 | 6/6 | 6/6 |

## D-net

- `Dnet_c_H_conspiracy`: complete usage=3273 (Dnet_c_H_conspiracy_2026-09-19_02-49-31)
- `Dnet_c_He_mixed`: complete usage=719 (Dnet_c_He_mixed_2026-09-19_04-07-50)
- `Dnet_d_H_conspiracy`: complete usage=4941 (Dnet_d_H_conspiracy_2026-09-19_02-49-31)
- `Dnet_d_He_mixed`: complete usage=722 (Dnet_d_He_mixed_2026-09-19_04-10-09)

Dnet complete: **4/4**
live index.js: 39

## Compare

`simPending` = **false**

## Workers

T2c_H=alive T2d_H=alive T2c_He=alive T2d_He=alive dnet=alive master_phase2=alive

## Notes

- continuation master loop. complete=256/288 in_progress=26
- gap actions this tick: none (workers healthy or no gap)
- no overlapping full grid. no dry-run. no invented MI.

Sibling slice agents may also write `runs_phase2`. This master skips completed cells and does not kill other node processes.
