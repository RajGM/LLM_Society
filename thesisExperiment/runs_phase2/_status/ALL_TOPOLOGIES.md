# Phase 2 global topology progress

**When.** 2026-09-18T16:42:14Z  
**OPENAI_API_KEY found.** **no**  
**Grid configs.** 288 (`T2c_H` 96 + `T2d_H` 96 + `T2c_He` 48 + `T2d_He` 48)  
**Persona×article cells.** 1728 (288 × 6 core articles)  
**Thesis cells completed.** **0 / 288 configs** (0 / 1728 cells)  
**Running `node index.js` topology jobs.** none (no experiment node processes)  
**Dry-run.** no. **MI invented.** no.

Statuses: **pending** (not started, key would allow start) / **running** / **done** / **blocked**.

All eight topologies are **blocked** on the missing key. Sibling topology agents aborted before probe and wrote per-topology `_status/*.md` + `_blockers/*_no_key.md`. Hierarchical labelled never-started configs as "dead"; that is **not** empirical `nScored <= 1` after a real run.

## Matrix (topology × slice)

Each T2c_H / T2d_H cell = 12 configs × 6 articles = 72. Each T2c_He / T2d_He cell = 6 configs × 6 articles = 36. Per topology total = 216 cells.

| topology | T2c_H (continuous homo) | T2d_H (dual homo) | T2c_He (continuous hetero) | T2d_He (dual hetero) | source |
| --- | --- | --- | --- | --- | --- |
| linear_chain | blocked 0/72 | blocked 0/72 | blocked 0/36 | blocked 0/36 | `_status/linear_chain.md` |
| ring | blocked 0/72 | blocked 0/72 | blocked 0/36 | blocked 0/36 | `_status/ring.md` |
| random_er | blocked 0/72 | blocked 0/72 | blocked 0/36 | blocked 0/36 | `_status/random_er.md` |
| small_world | blocked 0/72 | blocked 0/72 | blocked 0/36 | blocked 0/36 | `_status/small_world.md` |
| scale_free | blocked 0/72 | blocked 0/72 | blocked 0/36 | blocked 0/36 | `_status/scale_free.md` |
| echo_chamber | blocked 0/72 | blocked 0/72 | blocked 0/36 | blocked 0/36 | `_status/echo_chamber.md` |
| polarized | blocked 0/72 | blocked 0/72 | blocked 0/36 | blocked 0/36 | `_status/polarized.md` |
| hierarchical | blocked 0/72 | blocked 0/72 | blocked 0/36 | blocked 0/36 | `_status/hierarchical.md` |
| **all** | **blocked 0/576** | **blocked 0/576** | **blocked 0/288** | **blocked 0/288** | harvest |

Config rollup: T2c_H **0/96**, T2d_H **0/96**, T2c_He **0/48**, T2d_He **0/48**.

## Parse / hatch

`node thesisExperiment/scripts/parse_phase2.js` at 2026-09-18T16:41:55Z:

| metric | n |
| --- | ---: |
| parsed rows | 1 |
| T-H thesis rows | 0 |
| T-He thesis rows | 0 |
| continuous thesis rows | 0 |
| dual thesis rows | 0 |
| dead (`nScored <= 1`) | 1 (non-thesis) |

The only `runs_phase2` experiment dir is `probe_dnet_custom_2026-09-18_16-08-07` (`status=complete`, **LLM calls=0**, `nScored=0`). It is a failed D-net API probe, **not** a T2 cell. Do **not** read MPR=0 / empty MI as mix immunity.

**Hatch.** True dead after a real LLM run: **0**. Never-started grid cells: **1728** — hatched as missing/blocked, not as empirical zeros. Did not re-run or invent scores.

## D-net (out of the 288)

`Dnet_{c,d}_{H_conspiracy,He_mixed}`: **0/4** LLM cells. Same key block. Compare/Pfeffer empirical side already written; sim pending.

## Isolation

Did not write Phase 1 `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Did not switch git branches. Did not kill other agents' node processes.

## Resume

1. Inject real `OPENAI_API_KEY` into gitignored `/workspace/.env` (mode 600).
2. Pass dual+continuous probe (`_status/probe_ifd.md`).
3. Topology runners can then fill `runs_phase2`; this harvest parses whatever finishes without waiting for all 288.
