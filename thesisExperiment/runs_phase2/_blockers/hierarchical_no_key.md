# Hierarchical Phase 2 ABORT — OPENAI_API_KEY missing

**When:** 2026-09-18T16:40:52Z (follow-up recheck 16:43:12Z and 16:43:36Z)  
**Topology:** hierarchical only, all four slices (T2c_H, T2d_H, T2c_He, T2d_He)  
**Key present:** **no** (still missing after one wait + second check)

## Key check (no values logged)

| Check | Result |
|---|---|
| `process.env.OPENAI_API_KEY` | unset (length=0) |
| `/workspace/.env` | does not exist |
| `/workspace/.env.local` | does not exist |
| `thesisExperiment/.env` | does not exist |
| `/home/ubuntu/.env*` | none |
| `/run/secrets`, `/var/run/secrets`, `/secrets` | none |
| Process env names containing OPENAI / API_KEY / TOKEN | none |
| Cloud Agent environment | personal env `6266889a-b374-11f1-bb68-864e54d14197`; no injected secret |

`src/loadEnv.js` `isMockKey` was **not** applied (there is no value to classify). Did **not** invent a key. Did **not** write `.env`. Did **not** dry-run. Did **not** invent MI/MPR.

## Stop

Instruction: if the key is missing, write this file and **STOP**.

Did **not** call `node thesisExperiment/scripts/run_phase2.js`.  
Did **not** call `node index.js --config …`.  
Did **not** call `parse_phase2.js` (it rewrites shared CSVs; there are no hierarchical run dirs to parse).

A probe would fail immediately with `Env var OPENAI_API_KEY not set` and would not yield real LLM usage > 0.

## Grid that was not run

N=1, 8 nodes / 8 hops, `gpt-4o-mini`, `outputRoot: thesisExperiment/runs_phase2`. Each config seeds 6 core articles, so persona×article cells = configs × 6.

| Slice | Mode | Configs | Persona×article cells | Config glob |
|---|---|---:|---:|---|
| T2c_H | continuous, homogeneous | 12 | 72 | `configs/phase2/T2c_H_hierarchical_*.json` |
| T2d_H | dual, homogeneous | 12 | 72 | `configs/phase2/T2d_H_hierarchical_*.json` |
| T2c_He | continuous, heterogeneous | 6 | 36 | `configs/phase2/T2c_He_hierarchical_*.json` |
| T2d_He | dual, heterogeneous | 6 | 36 | `configs/phase2/T2d_He_hierarchical_*.json` |
| **total** | | **36** | **216** | |

completed=**0** skipped=**0** failed=**0** dead/not_started=**216**  
LLM calls: **0**. Est. USD: **$0**.

No `*hierarchical*` directories exist under `thesisExperiment/runs_phase2/` (nothing to skip as complete).

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Phase 1 untouched.

## Resume

Place a non-placeholder `OPENAI_API_KEY` in gitignored `/workspace/.env`. Then:

1. `node thesisExperiment/scripts/run_phase2.js --probe-only` until both continuous and dual probes show real LLM usage (not 0 calls).
2. Run the 36 hierarchical configs only (skip completed: `metadata.status` completed/complete + matching `miScoringMode`), concurrency as available.
3. `node thesisExperiment/scripts/parse_phase2.js` into `results_phase2`.
4. Refresh `thesisExperiment/runs_phase2/_status/hierarchical.md`.
