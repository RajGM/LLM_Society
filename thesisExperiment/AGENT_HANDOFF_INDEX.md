# AGENT_HANDOFF index (paths only)

Read `thesisExperiment/AGENT_HANDOFF.md` first. This file is a path map, not findings.

## Canonical harvest (do not invent; do not print OPENAI_API_KEY)

- `thesisExperiment/results_phase2/summary.json` — official parse stamp `generatedAt=2026-09-19T05:14:37.163Z`; 288 configs / 1728 cells / nMissing=0 / nDead=292 / thesisGrade=false / dnetSimPending=false
- `thesisExperiment/results_phase2/PARSE.md` — same harvest, table row counts
- `thesisExperiment/runs_phase2/_status/PARSE.md` — copy of PARSE.md
- `thesisExperiment/runs_phase2/_status/MASTER_DONE.json` — 288 complete; hatch 292; officialHarvestAt matches summary.json
- `thesisExperiment/runs_phase2/_status/MASTER.md` — live status; later prose also mentions a 290/05:27:59 figure — **prefer summary.json 292 / 05:14:37**
- `thesisExperiment/runs_phase2/_status/KEY_READY.md` — key loaded, length only (no value)

## Isolated Phase 2 trees

- `thesisExperiment/configs/phase2/` — 288 T2 configs + 4 Dnet + probes; never overwrite `configs/full/`
- `thesisExperiment/configs/grid_phase2.json` — campaign index (1728 estimated cells)
- `thesisExperiment/runs_phase2/` — raw LLM runs (do not commit huge JSON in handoff PRs)
- `thesisExperiment/results_phase2/tables/` — TH/THe/continuous/dual_discrete/dual_gap/dead_cells/all_rows/missing_cells
- `thesisExperiment/results_phase2/figures/` — analysis_phase2 PNG copies
- `thesisExperiment/results_phase2/debnath_compare.json` — structural compare; simPending=false
- `thesisExperiment/results_phase2/pfeffer_observables.md` — seven-factor remapping table
- `thesisExperiment/results_phase2/summary.md` — Debnath vs sim writeup (not MPR equality)
- `thesisExperiment/results_phase2/dnet_manifest.json` — runner log; `failed=true` on He is **stale vs MASTER complete**
- `thesisExperiment/analysis_phase2/` — SUMMARY.md, RESULTS.md, stats.json, plot_phase2.py, tables/, figures/, HYDRATION.md
- `thesisExperiment/analysis_full/` — sibling full comparisons (COMPARISONS.md + PFEFFER_DEBNATH_VS_SIM.md ingested into AGENT_HANDOFF.md §7 / §7.1)
- `thesisExperiment/latex_phase2/` — sibling TUM LaTeX draft (present on disk; untracked at handoff write time)

## Phase 1 isolation (read-only)

- `thesisExperiment/runs/` — Phase 1 discrete 12×12
- `thesisExperiment/results/tables/` — Phase 1 CSVs (different columns)
- `thesisExperiment/configs/full/` — Phase 1 configs
- `thesisExperiment/analysis/` — Phase 1 examiner paste text

## Debnath / data

- `thesisExperiment/data/derived/debnath_hashtag_cascade.json` — 63 nodes / 228 edges; `notARetweetCascade=true`
- `thesisExperiment/data/derived/debnath_reconstruct_report.md`
- `thesisExperiment/data/derived/HYDRATION.md` — pointer to analysis_phase2/HYDRATION.md
- `thesisExperiment/data/derived/debnath_osf_hashtag_sample.json` — OSF 5k prefix aggregates only
- `thesisExperiment/data/debnath_hydrated/` — ID samples; no tweets; gitignores dumps
- `thesisExperiment/data/debnath_geoeng/` — Ramit1201/geoeng codes, not tweets
- `thesisExperiment/data/SOURCES.md` — download log
- `thesisExperiment/analysis_phase2/HYDRATION.md` — canonical hydration-failed note
- `thesisExperiment/scripts/reconstruct_debnath.js`
- `thesisExperiment/scripts/debnath_hashtag_osf.js`

## Personas / articles / Pfeffer

- `thesisExperiment/personas/merged.json` — 17 personas
- `thesisExperiment/personas/phase2/` — homo/hetero files actually used by T2 configs
- `thesisExperiment/personas/DEBNATH_MAPPING.md` — **Phase 1 mix windows; not Phase 2 mix_00..05**
- `thesisExperiment/articles/articles.json` — 12 campaign articles
- `thesisExperiment/articles/merged.json` — 24 (12 + extras); grid uses 6 core
- `thesisExperiment/pfeffer_mapping.md` — thesis six-knob operationalisation
- `thesisExperiment/analysis_full/PFEFFER_DEBNATH_VS_SIM.md` — ingested §7.1: no new LLM; 56/63 persona-id match; clustering pre-sim; echo label-dependent; temporal N/A
- `thesisExperiment/analysis_full/pfeffer_debnath_vs_sim.json` — machine companion (`generatedAt=2026-09-19T12:26:19.169Z`, `newLlmRuns=false`)
- `thesisExperiment/analysis_phase2/PFEFFER_FIRESTORM.md` — on PR2 branch `cursor/pfeffer-firestorm-extract-d727` (may be absent on other checkouts)

## Scripts

- `thesisExperiment/scripts/parse_phase2.js` — re-parse runs_phase2 → results_phase2/tables
- `thesisExperiment/scripts/compare_phase2.js` — Debnath vs Dnet; do not flip simPending without cause
- `thesisExperiment/scripts/master_phase2.js` — skip-complete orchestrator
- `thesisExperiment/scripts/run_phase2.js` — `--force` to ignore skip-complete
- `thesisExperiment/scripts/run_t2c_h.js` / `run_t2d_h.js` / `run_t2c_he.js` / `run_t2d_he.js` / `run_dnet.js`
- `thesisExperiment/scripts/check_openai_key.js` — length-only; writes gitignored `.env` only with `--write-env`
- `thesisExperiment/scripts/build_phase2.js` — generated configs/phase2
- `thesisExperiment/analysis_phase2/plot_phase2.py` — regenerate analysis_phase2
- `thesisExperiment/analysis_full/analyze_full.py` — regenerate analysis_full
- `thesisExperiment/scripts/pfeffer_debnath_vs_sim.js` — score existing Dnet vs empirical graph (no new LLM)
- `src/Auditor.js` — dual = two LLM calls; gap is `Math.abs`
- `src/loadEnv.js` — loads `/workspace/.env`; never print key
- `src/Simulation.js` — persona-name fallback (commit 438af78)
- `src/SocietyGraph.js` — `minSeedOutDegree` on ER/echo/polarized

## Env / gitignore

- `/workspace/.env` and `thesisExperiment/.env` — gitignored, mode 600; **never commit, never dump value**
- `.gitignore` — `.env`, `thesisExperiment/data/debnath_hydrated/*.csv` etc.

## Git / PRs (do not overwrite PR1 title/body)

- PR1 `https://github.com/RajGM/LLM_Society/pull/1` — `cursor/need-openai-api-key-caf6` harvest
- PR2 `https://github.com/RajGM/LLM_Society/pull/2` — `cursor/pfeffer-firestorm-extract-d727`
- PR3 `https://github.com/RajGM/LLM_Society/pull/3` — `cursor/debnath-hashtag-hydration-2187`
- This handoff branch: `cursor/phase2-agent-handoff-e0ee`
