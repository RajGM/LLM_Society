# Phase 2 polarized status

**When.** 2026-09-18T16:41:30Z  
**Key present.** **no** (length=0)  
**Aborted.** yes — see `thesisExperiment/runs_phase2/_blockers/polarized_no_key.md`  
**Branch.** stayed on existing working branch (no checkout).

## Counts

| Slice | configs | cells (×6 articles) | completed | failed | skipped | dead (`nScored<=1`) | not_started |
|---|---:|---:|---:|---:|---:|---:|---:|
| T2c_H | 12 | 72 | 0 | 0 | 0 | 0 | 72 |
| T2d_H | 12 | 72 | 0 | 0 | 0 | 0 | 72 |
| T2c_He | 6 | 36 | 0 | 0 | 0 | 0 | 36 |
| T2d_He | 6 | 36 | 0 | 0 | 0 | 0 | 36 |
| **total** | **36** | **216** | **0** | **0** | **0** | **0** | **216** |

LLM calls: **0**. Est. USD: **$0**. Probe: **not started**. Parse: **not run** (no polarized run dirs; `parse_phase2.js` rewrites shared CSVs).

N=1. Nodes/hops/ticks=8. Model `gpt-4o-mini`. `outputRoot: thesisExperiment/runs_phase2`. `graphRandomSeed: 42`. `seedNodes: ["node_0"]`.

## Configs (ready, unused)

All 36: 8 nodes / 8 hops / 8 ticks, N=1, `gpt-4o-mini`, `outputRoot: thesisExperiment/runs_phase2`.

**T2c_H (continuous homo, 12)**  
`biodiversity_food_security`, `climate_action_advocate`, `climate_justice_youth`, `climate_scientist`, `conspiracy_believer`, `conspiracy_climate_piggyback`, `conspiracy_depopulation`, `conspiracy_haarp_weather`, `environmental_concern`, `mitigation_first_policy`, `ozone_stratosphere_specialist`, `science_journalist`

**T2d_H (dual homo, 12)** — same 12 personas.

**T2c_He (continuous hetero, 6)** — `mix_00` … `mix_05`

**T2d_He (dual hetero, 6)** — `mix_00` … `mix_05`

Articles (each config): `scopex_2017`, `chemtrails_gates_2018_2021`, `sai_geoengineering`, `paris_agreement`, `climate_consensus`, `polar_bears`.

## Dead / blocked cells

Zero polarized run directories under `runs_phase2`. Simulation-dead (1-event hatch) count: **0**. All 216 persona×article cells are **not_started** / `blocked_no_key`, not mix-immunises.

Logged in:

- `thesisExperiment/results_phase2/tables/polarized_dead_cells.csv` (216 rows)
- `thesisExperiment/results_phase2/dead_cells_polarized.csv` (same)
- `thesisExperiment/results_phase2/manifest_polarized.json`

Do **not** read empty `meanMI` as 0.

## Seed-drop note (not triggered)

Echo chamber previously dropped seeds; `buildEchoChamber` now takes seeded RNG + `minSeedOutDegree`. `buildPolarized` still uses unseeded `Math.random()` and has no out-degree guard. Configs were **not** patched because the campaign never reached graph build. On resume: if `node_0` is isolated, add that guard minimally and continue.

## Paths

| Role | Path |
|---|---|
| blocker | `thesisExperiment/runs_phase2/_blockers/polarized_no_key.md` |
| this status | `thesisExperiment/runs_phase2/_status/polarized.md` |
| runner | `thesisExperiment/scripts/run_phase2.js` |
| parser | `thesisExperiment/scripts/parse_phase2.js` |
| configs | `thesisExperiment/configs/phase2/{T2c_H,T2d_H,T2c_He,T2d_He}_polarized_*.json` |
| blocked cells | `thesisExperiment/results_phase2/tables/polarized_dead_cells.csv` |
| manifest | `thesisExperiment/results_phase2/manifest_polarized.json` |
| runs (empty for this topology) | `thesisExperiment/runs_phase2/` |
| Phase 1 (untouched) | `thesisExperiment/runs/`, `thesisExperiment/results/tables/` |

## Isolation

Did not write Phase 1 `runs/` or `results/tables/`. Did not switch git branches. Did not dry-run. Did not invent MI.
