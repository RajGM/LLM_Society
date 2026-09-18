# Blocker: linear_chain Phase 2 — OPENAI_API_KEY missing

**Time:** 2026-09-18T16:40:00Z  
**Topology:** `linear_chain`  
**Slices requested:** T2c_H, T2d_H, T2c_He, T2d_He  
**LLM runs:** STOPPED. No cells launched. Did not dry-run. Did not invent MI/MPR.

## Key check (no values logged)

| Source | Result |
| --- | --- |
| Process env `OPENAI_API_KEY` | unset (length=0) |
| `/workspace/.env` | does not exist |
| `/workspace/thesisExperiment/.env` | does not exist |
| `~/.env` | does not exist |
| `~/.openai` / `~/.config/openai` | do not exist |
| `/run/secrets/OPENAI_API_KEY` | does not exist |
| `/secrets/OPENAI_API_KEY` | does not exist |
| Workspace `*.env` / `*.pem` / `*.key` / `*.secret` | none found |
| `src/loadEnv.js` `isMockKey` | not applied (no value to test) |
| Cloud environment secrets | none injected; no OPENAI* names in process env |

Searched `/workspace`, `/home/ubuntu`, `/tmp/cursor`, `/run` (names and existence only). Did **not** invent a key. Did **not** write `.env`.

## What was not run

`node thesisExperiment/scripts/run_phase2.js` would probe then execute grid cells via `node index.js --config …`. Without a key, `index.js` exits with `Env var OPENAI_API_KEY not set`. Dry-run is forbidden (forces MI=0). Fabricating MI/MPR is forbidden.

36 configs exist (12+12+6+6), each with 6 seed articles → **216 persona×article cells**. None started.

## Isolation

Did not write to `thesisExperiment/runs/`, `thesisExperiment/results/tables/`, or `configs/full/`.

## Resume

1. Place a non-placeholder `OPENAI_API_KEY` in gitignored `/workspace/.env`.
2. Confirm: `node thesisExperiment/scripts/run_phase2.js --probe-only` (continuous + dual usage > 0).
3. Run remaining linear_chain configs only (skip complete `runs_phase2` dirs):

```bash
# T2c_H then T2d_H then T2c_He then T2d_He
# or pass the 36 linear_chain paths; runner skips completed metadata.status
node thesisExperiment/scripts/run_phase2.js --phase TH --concurrency 4
node thesisExperiment/scripts/run_phase2.js --phase THe --concurrency 4
```

(`run_phase2.js --phase TH` also runs other TH topologies in `grid_phase2.json`. Prefer invoking `node index.js --config thesisExperiment/configs/phase2/<slice>_linear_chain_*.json` per cell if isolating this topology.)

4. `node thesisExperiment/scripts/parse_phase2.js` into `results_phase2` only.
5. Hatch dead cells (`nScored <= 1`); do not drop them.
