# Phase 2 hierarchical status

**Updated:** 2026-09-18T16:40:52Z  
**OPENAI_API_KEY:** **no** (length=0; `/workspace/.env` missing)  
**Outcome:** ABORT before probe and grid. All four slices recorded as dead cells.

## Counts

Persona×article cells = configs × 6 core articles.

| Slice | Mode | Configs | Cells | Completed | Skipped | Failed | Dead / not started |
|---|---|---:|---:|---:|---:|---:|---:|
| T2c_H | continuous homo | 12 | 72 | 0 | 0 | 0 | 72 |
| T2d_H | dual homo | 12 | 72 | 0 | 0 | 0 | 72 |
| T2c_He | continuous hetero | 6 | 36 | 0 | 0 | 0 | 36 |
| T2d_He | dual hetero | 6 | 36 | 0 | 0 | 0 | 36 |
| **all hierarchical** | | **36** | **216** | **0** | **0** | **0** | **216** |

LLM calls: **0**. Est. USD: **$0**. Real MI/MPR: **none** (none invented).

N=1, 8 nodes, 8 hops/ticks, `gpt-4o-mini`. Runner would have been `thesisExperiment/scripts/run_phase2.js` with configs already pointing `outputRoot` at `thesisExperiment/runs_phase2`.

## Paths

| What | Path |
|---|---|
| Blocker | `thesisExperiment/runs_phase2/_blockers/hierarchical_no_key.md` |
| This status | `thesisExperiment/runs_phase2/_status/hierarchical.md` |
| Dead cells | `thesisExperiment/results_phase2/dead_cells_hierarchical.json` |
| Runner | `thesisExperiment/scripts/run_phase2.js` |
| Parser (not run) | `thesisExperiment/scripts/parse_phase2.js` |
| Configs | `thesisExperiment/configs/phase2/T2{c,d}_H{,e}_hierarchical_*.json` |
| Runs (empty for hierarchical) | `thesisExperiment/runs_phase2/` |
| Phase 1 (untouched) | `thesisExperiment/runs/`, `thesisExperiment/results/tables/` |

## Dead cells

All 36 configs (216 persona×article cells) exist on disk; none have a completed `runs_phase2/<experimentName>_*/metadata.json`. Reason for every cell: `OPENAI_API_KEY missing (length=0); hierarchical campaign aborted before probe`. Full machine log: `thesisExperiment/results_phase2/dead_cells_hierarchical.json` (36 config rows; each covers 6 articles).

### T2c_H (continuous, 12 personas)

- `T2c_H_hierarchical_biodiversity_food_security`
- `T2c_H_hierarchical_climate_action_advocate`
- `T2c_H_hierarchical_climate_justice_youth`
- `T2c_H_hierarchical_climate_scientist`
- `T2c_H_hierarchical_conspiracy_believer`
- `T2c_H_hierarchical_conspiracy_climate_piggyback`
- `T2c_H_hierarchical_conspiracy_depopulation`
- `T2c_H_hierarchical_conspiracy_haarp_weather`
- `T2c_H_hierarchical_environmental_concern`
- `T2c_H_hierarchical_mitigation_first_policy`
- `T2c_H_hierarchical_ozone_stratosphere_specialist`
- `T2c_H_hierarchical_science_journalist`

### T2d_H (dual, 12 personas)

- `T2d_H_hierarchical_biodiversity_food_security`
- `T2d_H_hierarchical_climate_action_advocate`
- `T2d_H_hierarchical_climate_justice_youth`
- `T2d_H_hierarchical_climate_scientist`
- `T2d_H_hierarchical_conspiracy_believer`
- `T2d_H_hierarchical_conspiracy_climate_piggyback`
- `T2d_H_hierarchical_conspiracy_depopulation`
- `T2d_H_hierarchical_conspiracy_haarp_weather`
- `T2d_H_hierarchical_environmental_concern`
- `T2d_H_hierarchical_mitigation_first_policy`
- `T2d_H_hierarchical_ozone_stratosphere_specialist`
- `T2d_H_hierarchical_science_journalist`

### T2c_He (continuous, 6 mixes)

- `T2c_He_hierarchical_mix_00` … `mix_05`

### T2d_He (dual, 6 mixes)

- `T2d_He_hierarchical_mix_00` … `mix_05`

## Notes

- Did not stop after one slice: all four slices were enumerated and marked dead for the same blocker.
- Did not switch git branches.
- Did not overwrite Phase 1.
- Parse skipped: no hierarchical run artifacts; refusing empty/zero MI as thesis numbers.
