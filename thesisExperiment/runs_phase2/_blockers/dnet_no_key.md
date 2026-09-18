# Blocker: D-net custom-graph LLM cells — OPENAI_API_KEY missing

**Time:** 2026-09-18T16:43:00Z  
**Slice:** Debnath custom graph (`Dnet_c_H`, `Dnet_c_He`, `Dnet_d_H`, `Dnet_d_He`)  
**LLM runs:** STOPPED. Did not re-launch `run_dnet.js`. Did not dry-run. Did not invent MI/MPR.

A prior probe (`probe_dnet_custom_2026-09-18_16-08-07`) already failed with `Env var OPENAI_API_KEY not set` (`dnet_manifest.json` `aborted: real_api_unavailable`). Do **not** treat that directory’s MPR as a thesis cell.

## Key check (no values logged)

| Source | Result |
| --- | --- |
| Process env `OPENAI_API_KEY` | unset (length=0) |
| `/workspace/.env` | does not exist |
| `/workspace/thesisExperiment/.env` | does not exist |
| `~/.env` | does not exist |
| `/run/secrets/OPENAI_API_KEY` | does not exist |
| `/secrets/OPENAI_API_KEY` | does not exist |
| Other process environ (`OPENAI*`) | none |
| Twitter/X bearer names | all unset (hydration also impossible) |
| `src/loadEnv.js` `isMockKey` | not applied (no value to test) |
| Cloud environment secrets | none injected |

Searched `/workspace`, `/home/ubuntu`, `/tmp/cursor`, `/run` (names and existence only). Did **not** invent a key. Did **not** write `.env`.

## What was not run

| Cell | config | `miScoringMode` | mix | status |
| --- | --- | --- | --- | --- |
| Dnet_c_H | `configs/phase2/Dnet_c_H_conspiracy.json` | continuous | homo conspiracy | pending (0/1) |
| Dnet_c_He | `configs/phase2/Dnet_c_He_mixed.json` | continuous | mixed Debnath BPs | pending (0/1) |
| Dnet_d_H | `configs/phase2/Dnet_d_H_conspiracy.json` | dual | homo conspiracy | pending (0/1) |
| Dnet_d_He | `configs/phase2/Dnet_d_He_mixed.json` | dual | mixed Debnath BPs | pending (0/1) |

Dual headline MPR is **not** continuous headline MPR. Neither mode ran; neither was copied from the other.

## Non-LLM work that did run

Reconstruct/import still executed (see status file). Graph kept: `data/derived/debnath_hashtag_cascade.json` (**63** nodes, **228** edges). **Not** a retweet cascade.

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Dnet `outputRoot` remains `thesisExperiment/runs_phase2`.

## Resume

1. Place a non-placeholder `OPENAI_API_KEY` in gitignored `/workspace/.env`.
2. `node thesisExperiment/scripts/run_dnet.js --concurrency 2` (real API; skip completed).
3. Confirm dual and continuous both produce real LLM usage and **different** headline MPR.
4. `node thesisExperiment/scripts/compare_phase2.js` into `results_phase2/` only.
