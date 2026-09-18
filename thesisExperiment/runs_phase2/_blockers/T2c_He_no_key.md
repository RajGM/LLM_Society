# Blocker: T2c_He CONTINUOUS — OPENAI_API_KEY missing

**Time:** 2026-09-18T16:42:07Z  
**Slice:** T2c_He (heterogeneous persona×article, `miScoringMode: continuous`)  
**Grid:** 8 topologies × 6 mixes = **48 configs** (each × 6 core articles)  
**LLM runs:** STOPPED. No probe. No cells launched. Did not dry-run. Did not invent MI/MPR.

## Key hunt (no values logged)

First check, then **wait ~15s**, then one recheck. Still missing.

| Source | First check | Recheck (2026-09-18T16:41:56Z) |
| --- | --- | --- |
| Process env `OPENAI_API_KEY` | unset (length=0) | unset (length=0) |
| `/workspace/.env` | does not exist | does not exist |
| `/workspace/thesisExperiment/.env` | does not exist | does not exist |
| `/home/ubuntu/.env` | does not exist | does not exist |
| `thesisExperiment/runs_phase2/_status/KEY_READY.md` | does not exist | does not exist |
| OPENAI* / API_KEY names in process env | none | none |
| `src/loadEnv.js` `isMockKey` | not applied (no value) | not applied |

Did **not** invent a key. Did **not** write `.env`. Instruction after recheck: write this blocker and exit.

## What was not run

- Probe of one `T2c_He_*` cell (required real usage > 0) — not started.
- All 48 `thesisExperiment/configs/phase2/T2c_He_*.json` at concurrency 3 — not started.
- Topologies not launched: `linear_chain`, `ring`, `random_er`, `small_world`, `scale_free`, `echo_chamber`, `polarized`, `hierarchical`.
- Skip-completed: no `T2c_He_*` run dirs under `runs_phase2/` (nothing to skip).
- `parse_phase2.js` not run.

| Count | n |
| ---: | ---: |
| configs | 48 |
| completed | 0 |
| failed | 0 |
| skipped | 0 |
| not_started | 48 |
| LLM calls | 0 |

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Did not write `phase2_manifest.json`.

## Paths

| path | role |
| --- | --- |
| `thesisExperiment/runs_phase2/_blockers/T2c_He_no_key.md` | this blocker |
| `thesisExperiment/results_phase2/manifest_T2c_He.json` | slice manifest (0/48, abort) |
| `thesisExperiment/configs/phase2/T2c_He_*.json` | 48 configs (not modified) |
| `thesisExperiment/runs_phase2/` | no T2c_He experiment dirs |

## Resume

1. Place a non-placeholder `OPENAI_API_KEY` in gitignored `/workspace/.env` (or export it; optional `runs_phase2/_status/KEY_READY.md` with no secret body).
2. Probe one T2c_He cell until LLM usage > 0.
3. Run all 48 `T2c_He_*.json` into `runs_phase2`, concurrency 3, skip completed, no dry-run.
4. Refresh `thesisExperiment/results_phase2/manifest_T2c_He.json` only.
