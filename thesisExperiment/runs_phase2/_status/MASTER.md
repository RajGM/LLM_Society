# Phase 2 MASTER status

**Updated.** 2026-09-19T04:08:10.289Z
**OPENAI_API_KEY found.** yes (length=164)
**Dry-run.** no. **MI invented.** no.
**Isolation.** `runs_phase2/` + `results_phase2/` only. Did not write Phase 1 `runs/` or `results/tables/`.

## Grid (288 configs / 1728 cells)

| slice | configs | complete | in_progress | incomplete | not_started | cells (×6) |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| T2c_H | 96 | 44 | 7 | 0 | 45 | 264/576 |
| T2d_H | 96 | 58 | 11 | 0 | 27 | 348/576 |
| T2c_He | 48 | 27 | 3 | 0 | 18 | 162/288 |
| T2d_He | 48 | 26 | 4 | 0 | 18 | 156/288 |
| **grid** | **288** | **155** | **25** |  |  | **930/1728** |

## Per topology (complete/n)

| topology | T2c_H done/n | T2d_H done/n | T2c_He done/n | T2d_He done/n |
| --- | ---: | ---: | ---: | ---: |
| linear_chain | 12/12 | 12/12 | 6/6 | 6/6 |
| ring | 12/12 | 12/12 | 6/6 | 6/6 |
| random_er | 12/12 | 12/12 | 6/6 | 6/6 |
| small_world | 5/12 | 4/12 | 6/6 | 5/6 |
| scale_free | 3/12 | 3/12 | 3/6 | 3/6 |
| echo_chamber | 0/12 | 12/12 | 0/6 | 0/6 |
| polarized | 0/12 | 0/12 | 0/6 | 0/6 |
| hierarchical | 0/12 | 3/12 | 0/6 | 0/6 |

## D-net

- `Dnet_c_H_conspiracy`: complete usage=3129 (Dnet_c_H_conspiracy_2026-09-19_02-49-25)
- `Dnet_c_He_mixed`: in_progress usage=0 (Dnet_c_He_mixed_2026-09-19_04-07-50)
- `Dnet_d_H_conspiracy`: complete usage=4941 (Dnet_d_H_conspiracy_2026-09-19_02-49-31)
- `Dnet_d_He_mixed`: in_progress usage=0 (Dnet_d_He_mixed_2026-09-19_04-07-40)

Dnet complete: **2/4**
live index.js: 41

## Compare

`simPending` = **true**

## Workers

T2c_H=alive T2d_H=alive T2c_He=alive T2d_He=alive dnet=alive master_phase2=alive

## Notes

- continuation master loop. complete=155/288 in_progress=25
- gap actions this tick: none (workers healthy or no gap)
- no overlapping full grid. no dry-run. no invented MI.

Sibling slice agents may also write `runs_phase2`. This master skips completed cells and does not kill other node processes.
