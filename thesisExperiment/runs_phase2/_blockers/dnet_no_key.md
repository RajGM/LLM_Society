# Blocker: D-net custom-graph LLM cells — OPENAI_API_KEY missing

**Time:** 2026-09-18T18:25:03Z  
**Slice:** Debnath custom graph (`Dnet_c_H`, `Dnet_c_He`, `Dnet_d_H`, `Dnet_d_He`)  
**LLM runs:** STOPPED. Polled `.env`/`KEY_READY` every 20s for 480s (25 checks). Still missing. Did not launch `run_dnet.js`. Did not dry-run. Did not invent MI/MPR. Did not invent tweet hydration.

## Key check (no values logged)

| Source | Result |
| --- | --- |
| Process env `OPENAI_API_KEY` | unset (length=0) |
| `/workspace/.env` | does not exist |
| `/workspace/thesisExperiment/.env` | does not exist |
| `~/.env` | does not exist |
| `/run/secrets/OPENAI_API_KEY` | does not exist |
| `thesisExperiment/runs_phase2/_status/KEY_READY.md` | does not exist |
| `src/loadEnv.js` `isMockKey` | not applied (no value) |

Did **not** invent a key. Did **not** write `.env`.

## 4-cell counts

| Cell | config | `miScoringMode` | mix | status |
| --- | --- | --- | --- | --- |
| Dnet_c_H | `configs/phase2/Dnet_c_H_conspiracy.json` | continuous | homo conspiracy | not_started (0/1) |
| Dnet_c_He | `configs/phase2/Dnet_c_He_mixed.json` | continuous | mixed Debnath BPs | not_started (0/1) |
| Dnet_d_H | `configs/phase2/Dnet_d_H_conspiracy.json` | dual | homo conspiracy | not_started (0/1) |
| Dnet_d_He | `configs/phase2/Dnet_d_He_mixed.json` | dual | mixed Debnath BPs | not_started (0/1) |

completed=**0** skipped=**0** failed=**0** not_started=**4**. Dual headline MPR is **not** continuous headline MPR. Neither mode ran.

## Compare

`simPending=true` (no Dnet sims under `runs_phase2`). Did not re-run compare (no sims).

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Did not git commit.

## Resume

1. Place a non-placeholder `OPENAI_API_KEY` in gitignored `/workspace/.env`.
2. `node thesisExperiment/scripts/run_dnet.js --concurrency 2` (real API; skip completed).
3. Confirm dual and continuous both produce real LLM usage and **different** headline MPR.
4. `node thesisExperiment/scripts/compare_phase2.js` into `results_phase2/` only.
