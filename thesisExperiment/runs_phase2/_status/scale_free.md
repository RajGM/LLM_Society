# Phase 2 status — topology `scale_free`

**When.** 2026-09-18T16:40:48Z  
**OPENAI_API_KEY present.** **no** (length=0)  
**Branch.** stayed on existing working branch (no checkout).  
**Isolation.** outputs only under `runs_phase2/`, `results_phase2/`, `configs/phase2/` (read configs; no overwrite of Phase 1).

## Counts

| Slice | Configs | Articles / config | Cells | Completed | Skipped | Failed | Not started |
|---|---:|---:|---:|---:|---:|---:|---:|
| T2c_H (continuous homo) | 12 | 6 | 72 | 0 | 0 | 0 | 72 |
| T2d_H (dual homo) | 12 | 6 | 72 | 0 | 0 | 0 | 72 |
| T2c_He (continuous hetero) | 6 | 6 | 36 | 0 | 0 | 0 | 36 |
| T2d_He (dual hetero) | 6 | 6 | 36 | 0 | 0 | 0 | 36 |
| **All four slices** | **36** | 6 | **216** | **0** | **0** | **0** | **216** |

LLM calls: **0**. Est. USD: **$0**. Existing `runs_phase2` scale_free dirs: **0**.

N=1. Nodes/hops/ticks=8. Model `gpt-4o-mini`. `outputRoot: thesisExperiment/runs_phase2`. `graphRandomSeed: 42`. `topologyParams.m: 2`.

## Articles (all configs)

`scopex_2017`, `chemtrails_gates_2018_2021`, `sai_geoengineering`, `paris_agreement`, `climate_consensus`, `polar_bears`

## Configs (36)

### T2c_H — continuous homogeneous (12)

- `thesisExperiment/configs/phase2/T2c_H_scale_free_conspiracy_believer.json`
- `thesisExperiment/configs/phase2/T2c_H_scale_free_conspiracy_haarp_weather.json`
- `thesisExperiment/configs/phase2/T2c_H_scale_free_conspiracy_depopulation.json`
- `thesisExperiment/configs/phase2/T2c_H_scale_free_conspiracy_climate_piggyback.json`
- `thesisExperiment/configs/phase2/T2c_H_scale_free_climate_action_advocate.json`
- `thesisExperiment/configs/phase2/T2c_H_scale_free_climate_justice_youth.json`
- `thesisExperiment/configs/phase2/T2c_H_scale_free_mitigation_first_policy.json`
- `thesisExperiment/configs/phase2/T2c_H_scale_free_environmental_concern.json`
- `thesisExperiment/configs/phase2/T2c_H_scale_free_ozone_stratosphere_specialist.json`
- `thesisExperiment/configs/phase2/T2c_H_scale_free_biodiversity_food_security.json`
- `thesisExperiment/configs/phase2/T2c_H_scale_free_climate_scientist.json`
- `thesisExperiment/configs/phase2/T2c_H_scale_free_science_journalist.json`

### T2d_H — dual homogeneous (12)

- `thesisExperiment/configs/phase2/T2d_H_scale_free_conspiracy_believer.json`
- `thesisExperiment/configs/phase2/T2d_H_scale_free_conspiracy_haarp_weather.json`
- `thesisExperiment/configs/phase2/T2d_H_scale_free_conspiracy_depopulation.json`
- `thesisExperiment/configs/phase2/T2d_H_scale_free_conspiracy_climate_piggyback.json`
- `thesisExperiment/configs/phase2/T2d_H_scale_free_climate_action_advocate.json`
- `thesisExperiment/configs/phase2/T2d_H_scale_free_climate_justice_youth.json`
- `thesisExperiment/configs/phase2/T2d_H_scale_free_mitigation_first_policy.json`
- `thesisExperiment/configs/phase2/T2d_H_scale_free_environmental_concern.json`
- `thesisExperiment/configs/phase2/T2d_H_scale_free_ozone_stratosphere_specialist.json`
- `thesisExperiment/configs/phase2/T2d_H_scale_free_biodiversity_food_security.json`
- `thesisExperiment/configs/phase2/T2d_H_scale_free_climate_scientist.json`
- `thesisExperiment/configs/phase2/T2d_H_scale_free_science_journalist.json`

### T2c_He — continuous heterogeneous (6)

- `thesisExperiment/configs/phase2/T2c_He_scale_free_mix_00.json`
- `thesisExperiment/configs/phase2/T2c_He_scale_free_mix_01.json`
- `thesisExperiment/configs/phase2/T2c_He_scale_free_mix_02.json`
- `thesisExperiment/configs/phase2/T2c_He_scale_free_mix_03.json`
- `thesisExperiment/configs/phase2/T2c_He_scale_free_mix_04.json`
- `thesisExperiment/configs/phase2/T2c_He_scale_free_mix_05.json`

### T2d_He — dual heterogeneous (6)

- `thesisExperiment/configs/phase2/T2d_He_scale_free_mix_00.json`
- `thesisExperiment/configs/phase2/T2d_He_scale_free_mix_01.json`
- `thesisExperiment/configs/phase2/T2d_He_scale_free_mix_02.json`
- `thesisExperiment/configs/phase2/T2d_He_scale_free_mix_03.json`
- `thesisExperiment/configs/phase2/T2d_He_scale_free_mix_04.json`
- `thesisExperiment/configs/phase2/T2d_He_scale_free_mix_05.json`

## Probe / run

Not started. Instruction: stop if key missing. Did not invoke `node thesisExperiment/scripts/run_phase2.js`. Did not invoke `node index.js --config`. Did not dry-run.

## Parse / dead cells

Did not run `parse_phase2.js` (no scale_free run dirs; parser rewrites shared CSVs). Logged blocked cells (not 1-event hatch-dead) in:

- `thesisExperiment/results_phase2/dead_cells_scale_free.csv` (216 rows, reason=`OPENAI_API_KEY missing`)
- `thesisExperiment/results_phase2/manifest_scale_free.json`

Simulation-dead (1-event) count: **0** (nothing ran).

## Paths

| Role | Path |
|---|---|
| Blocker | `thesisExperiment/runs_phase2/_blockers/scale_free_no_key.md` |
| Status | `thesisExperiment/runs_phase2/_status/scale_free.md` |
| Dead/blocked cells | `thesisExperiment/results_phase2/dead_cells_scale_free.csv` |
| Manifest | `thesisExperiment/results_phase2/manifest_scale_free.json` |
| Runner (unread as executed) | `thesisExperiment/scripts/run_phase2.js` |
| Configs | `thesisExperiment/configs/phase2/*_scale_free_*.json` |
