# Blocker: T2d_H dual homogeneous — OPENAI_API_KEY missing

**Time:** 2026-09-18T16:41:55Z  
**Slice:** `T2d_H` (dual IFD, homogeneous persona×article)  
**Configs:** 96 (`thesisExperiment/configs/phase2/T2d_H_*.json` = 8 topologies × 12 personas)  
**LLM runs:** STOPPED. No cells launched. Did not dry-run. Did not invent MI/MPR.

Follow-up hunt after first abort (0/96). Waited ~15s and rechecked once. Still missing.

## Key check (no values logged)

| Source | Result |
| --- | --- |
| Process env `OPENAI_API_KEY` | unset (length=0) |
| Process env `OPENAI_KEY` | unset (length=0) |
| `/workspace/.env` | does not exist |
| `/workspace/thesisExperiment/.env` | does not exist |
| `KEY_READY.md` (workspace / other runners) | not found |
| `~/.env` | does not exist |
| `/run/secrets/OPENAI_API_KEY` | does not exist |
| `/secrets/OPENAI_API_KEY` | does not exist |
| `src/loadEnv.js` `isMockKey` | not applied (no value to test) |
| Cloud environment secrets | none injected; no OPENAI* names in process env |

Searched `/workspace`, `/home/ubuntu`, `/tmp`, `/run` (names and existence only). Did **not** invent a key. Did **not** write `.env`.

## What was not run

Probe of one dual cell (2 auditor calls per event) was not started. `index.js` would exit with `Env var OPENAI_API_KEY not set` and would not yield real LLM usage > 0. The 96-config concurrency-3 grid was not started. Skip-completed was not reached (0 `T2d_H_*` run dirs).

## Counts

| Count | n |
| --- | ---: |
| configs | 96 |
| completed | 0 |
| failed | 0 |
| skipped | 0 |
| pending | 96 |
| LLM calls | 0 |
| Est. USD | $0 |

## Isolation

Did not write to `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Manifest remains `thesisExperiment/results_phase2/manifest_T2d_H.json`. Did not run `T2c_` or `He_` configs.

## Resume

1. Place a non-placeholder `OPENAI_API_KEY` in gitignored `/workspace/.env`.
2. Probe one dual cell until LLM usage > 0.
3. Run all `T2d_H_*.json` into `thesisExperiment/runs_phase2`, concurrency 3, skip completed dual runs.
4. Refresh `thesisExperiment/results_phase2/manifest_T2d_H.json` only.
