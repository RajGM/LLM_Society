# Phase 2 consolidation log

**Goal.** Put all Phase 2 work onto `main` (or one PR to `main`) instead of leaving it on scattered `cursor/*` branches.

**When.** 2026-09-19  
**Base.** `origin/main` `c80655c61356c2df045bd2a2e4f841ef00cd7374` (`Feat: experiment complete`)  
**Consolidation branch.** `cursor/phase2-onto-main-e0ee`  
**Merge order.** harvest → harvest abort/probe side-branches → analysis → pfeffer extract → hydration → dnet-pfeffer → handoff → latex  

**Hard rules honored.**

- Did not commit `.env` and did not print `OPENAI_API_KEY`.
- Did not overwrite Phase 1 `thesisExperiment/runs/`, `thesisExperiment/results/tables/`, or `thesisExperiment/configs/full/` (`git diff origin/main` on those paths is empty).
- Did not change GitHub PR #1 title/body. Extra PRs were **not** closed (`ManagePullRequest` / `set_pr_status` not available). They remain on origin until this consolidation is merged.
- No force-push of `main`. No history rewrite of unrelated commits. Merges used `--no-ff`.

**Hatch 290 vs 292.**

| Artifact | Hatched-dead count | Where it lives now |
| --- | ---: | --- |
| Canonical parse harvest | **292** | `thesisExperiment/results_phase2/PARSE.md` and `results_phase2/tables/dead_cells.csv` (292 data rows + header = 293 lines). `all_rows.csv` 1741 data rows. |
| analysis_phase2 as committed on harvest/analysis/latex | **290** | Copied aside to `thesisExperiment/CONSOLIDATED_OVERLAPS/analysis_phase2_hatch290/` before overlay |
| Canonical analysis_phase2 after overlay | **292** | `thesisExperiment/analysis_phase2/` (`SUMMARY.md`, `RESULTS.md`, `stats.json`, tables, figures) plus matching `results_phase2/figures/` |

The parse tables were already 292 on `need-openai-api-key-caf6` / later descendants. `analysis_phase2` on those branches still reported 290 until the uncommitted latex-workspace replot (this consolidation). Keep 292 as canonical; keep 290 as an overlap copy.

---

## Source branches

Statuses:

- `merged_clean` — git merge succeeded; unique files landed in place.
- `merged_with_overlaps` — conflicts; **ours** (first / newer harvest) kept in the live tree; incoming copy saved under `thesisExperiment/CONSOLIDATED_OVERLAPS/<branch>/`.
- `already_included` — ancestor of a branch already merged; no extra commit.

### Named Phase 2 feature branches (user list)

| Source branch | Commit SHA | Role | Merge status | What it added | Where it lives now |
| --- | --- | --- | --- | --- | --- |
| `cursor/need-openai-api-key-caf6` | `b683187aa988bfad0f99c16eaaad9c3425f6bc6d` | harvest | merged_clean | Full live grid: `runs_phase2/`, `results_phase2/` tables (292 hatch parse), `analysis_phase2/` (then 290), configs/personas/scripts, `PHASE2_PLAN.md` | Live tree: `thesisExperiment/runs_phase2/`, `results_phase2/`, `analysis_phase2/` (analysis later overlaid to 292) |
| `cursor/phase2-full-analysis-e0ee` | `de2d3dfd23a0708246c0e0cae5f97112e2207586` | analysis | merged_clean | `analysis_full/` five comparisons, heatmaps, pooled cells, D-net; also contains hydration | `thesisExperiment/analysis_full/` |
| `cursor/pfeffer-firestorm-extract-d727` | `d2a28e068501d2001faf65c2f5e4bf39914878f2` | pfeffer | merged_clean | Pfeffer 2014 firestorm extract | `thesisExperiment/analysis_phase2/PFEFFER_FIRESTORM.md` |
| `cursor/debnath-hashtag-hydration-2187` | `beff6d3a8817bb41cdf81a5a623d0ad4bd8bb476` | hydration | already_included | Hydration failure + hashtag co-occurrence fallback (ancestor of full-analysis) | `thesisExperiment/analysis_phase2/HYDRATION.md`, `thesisExperiment/data/derived/HYDRATION.md` |
| `cursor/pfeffer-debnath-vs-sim-843e` | `ef6e116a33f261ee2375b461187ad67d543db75f` | dnet-pfeffer | merged_clean | Pfeffer observables on Debnath hashtag graph vs D-net | `thesisExperiment/analysis_full/PFEFFER_DEBNATH_VS_SIM.md`, `pfeffer_debnath_vs_sim.json`, `thesisExperiment/scripts/pfeffer_debnath_vs_sim.js` |
| `cursor/phase2-agent-handoff-e0ee` | `294d766992eb3625e5701db264cb5a070939f4b1` | handoff | merged_clean | Agent handoff for future reuse | `thesisExperiment/AGENT_HANDOFF.md`, `AGENT_HANDOFF_INDEX.md` |
| `cursor/phase2-latex-e0ee` | `7aaa09db65e88b2b9082c641a8f1affa4588a475` | latex | merged_clean | TUM-style Phase 2 LaTeX chapter aligned to C1–C5 | `thesisExperiment/latex_phase2/` |

### Other `cursor/*` Phase 2 branches (unique abort/probe artifacts)

| Source branch | Commit SHA | Role | Merge status | What it added | Where it lives now |
| --- | --- | --- | --- | --- | --- |
| `cursor/phase2-llm-experiments-38ac` | `0b7ca00623b75d256d569c7c2ec1ed680dd9816a` | harvest-probes | merged_with_overlaps | Failed OpenAI probe runs (continuous + dual) | Unique raw runs kept: `runs_phase2/probe_p2_continuous_2026-09-18_15-26-28/`, `probe_p2_dual_2026-09-18_15-26-28/`. Empty abort tables saved under `CONSOLIDATED_OVERLAPS/phase2-llm-experiments-38ac/` |
| `cursor/phase2-t2d-he-a349` | `acb82d57ace630c571d5d83c8012c64248d3eafb` | harvest-blocker | merged_with_overlaps | T2d_He no-key blocker note | `runs_phase2/_blockers/T2d_He_no_key.md`; incoming LOG/manifest in overlaps |
| `cursor/phase2-t2d-h-dual-44ad` | `cd64d65e4ca52e790c8fad6c7040a0c38a326fb9` | harvest-blocker | merged_with_overlaps | T2d_H no-key blocker note | `runs_phase2/_blockers/T2d_H_no_key.md`; incoming LOG/manifest in overlaps |
| `cursor/openai-api-key-missing-a576` | `61be845f4ae7cb278c46a7949e69a57e522a3a3a` | harvest-blocker | merged_with_overlaps | Extra `_blockers/` notes (`OPENAI_API_KEY_MISSING.md`, `T2c_He_no_key.md`, `random_er_no_key.md`) | live `_blockers/` plus overlaps for LOG/manifest/status |
| `cursor/phase2-t2c-h-abort-cde4` | `4cacc790c46f1f0ff195cc984b68a45fa5f33549` | harvest-blocker | merged_with_overlaps | Early empty T2c_H abort tables | Incoming empty `T2c_H_rows.csv` / manifest in overlaps; live tables kept 292 harvest |
| `cursor/phase2-compare-abde` | `4eb1b3614ea7582750ed074a7816941285cba1db` | harvest-compare-early | merged_with_overlaps | Early Debnath reconstruct / probe tables overlapping later hydration | Incoming earlier copies in `CONSOLIDATED_OVERLAPS/phase2-compare-abde/`; live tree keeps later hydration/harvest |
| `cursor/phase2-debnath-reconstruct-d202` | `ba860d647ec128e977da4b0c1a6f56f359192a9a` | other | already_included | Reconstruct (ancestor of harvest) | via harvest |
| `cursor/phase2-dnet-sims-bdeb` | `c409e5d5dd0673e461d530fe5058985781912195` | other | already_included | Dnet abort (ancestor of harvest) | via harvest |
| `cursor/phase2-t2c-h-nokey-cde4` | `2f74b8e64cfbcbdbde89f4f19a75b0477e4ddcba` | other | already_included | Hierarchical abort recheck | via harvest |
| `cursor/t2c-he-continuous-abort-4b8c` | `19328c6b1e567fd7cec23fae7715da33e6779440` | other | already_included | small_world key recheck | via harvest |
| `cursor/phase2-abort-missing-key-134d` | `1e7e4f6c3573e70bb42e605e74447d1d27b2f69f` | other | already_included | early missing-key abort | via harvest |

### Current workspace (not a named origin branch)

Uncommitted latex-workspace files at consolidation time (snapshot, then overlaid after merges):

- Replotted `analysis_phase2` + `results_phase2/figures` with **292** dead cells (matches parse).
- Extra raw article JSONs / `human_eval_template.csv` inside already-present run dirs (kept; raw `runs_phase2` not deleted).
- `results_phase2/logs/master_parse.log` and `master_compare.log`.
- LOG.md reconstruct note (hydration already documented in `HYDRATION.md`; the LOG section was missing from latex’s committed log).

---

## Required outputs (checklist)

| Required | Location on this tree |
| --- | --- |
| `runs_phase2` raw | `thesisExperiment/runs_phase2/` (392 run/blocker dirs, including probe abort dirs) |
| `results_phase2` tables | `thesisExperiment/results_phase2/tables/` (`TH_rows.csv` 1152, `THe_rows.csv` 576, `dead_cells.csv` 292, `missing_cells.csv` 0) |
| `analysis_phase2` | `thesisExperiment/analysis_phase2/` |
| `analysis_full` | `thesisExperiment/analysis_full/` |
| `latex_phase2` | `thesisExperiment/latex_phase2/` |
| `AGENT_HANDOFF.md` | `thesisExperiment/AGENT_HANDOFF.md` |
| `PFEFFER_FIRESTORM.md` | `thesisExperiment/analysis_phase2/PFEFFER_FIRESTORM.md` (from `pfeffer-firestorm-extract-d727`) |
| `HYDRATION.md` | `thesisExperiment/analysis_phase2/HYDRATION.md` and `thesisExperiment/data/derived/HYDRATION.md` |
| `PFEFFER_DEBNATH_VS_SIM.md` | `thesisExperiment/analysis_full/PFEFFER_DEBNATH_VS_SIM.md` (from `pfeffer-debnath-vs-sim-843e`) |

Main-only files kept from `origin/main` (not on the feature branches): `thesisExperiment/PLAN.md`, `thesisExperiment/discovery/12_status/*`.

---

## Overlap resolutions

Policy: if both sides were unique analysis/docs, **keep the first (ours) in place** and copy incoming to `thesisExperiment/CONSOLIDATED_OVERLAPS/<source-branch>/...`. If harvest tables conflicted, **keep the newer parse** (292-row harvest vs empty abort tables).

### `phase2-llm-experiments-38ac`

Incoming abort `results_phase2/tables/*.csv` had 1–2 data rows; ours had the 292 harvest. Kept ours. Incoming abort CSVs/logs/LOG.md stored in overlaps.

**Correction:** line-count heuristic briefly preferred the abort `phase2_manifest.json` (24 lines vs harvest 22). Restored harvest `phase2_manifest.json` from `need-openai-api-key-caf6`. Abort probe manifest saved at `CONSOLIDATED_OVERLAPS/phase2-llm-experiments-38ac/thesisExperiment/results_phase2/phase2_manifest.json`. Harvest copy that was stashed during that conflict: `CONSOLIDATED_OVERLAPS/phase2-llm-experiments-38ac/OURS_OLDER_HARVEST/` (name is historical; that file is the **good** harvest manifest).

### `phase2-t2d-he-a349` / `phase2-t2d-h-dual-44ad` / `openai-api-key-missing-a576` / `phase2-t2c-h-abort-cde4`

LOG.md + early manifests/status files: kept harvest LOG/manifests; incoming copies in overlaps. Unique `_blockers/*.md` added to the live tree.

### `phase2-compare-abde`

Earlier Debnath hydrated README / reconstruct JSON / scripts / empty tables conflicted with later harvest+hydration. Kept later versions; incoming early copies in `CONSOLIDATED_OVERLAPS/phase2-compare-abde/`.

### analysis_phase2 hatch 290 vs 292

Not a git merge conflict. After latex merge, `analysis_phase2` still said 290 while `PARSE.md` said 292. Workspace replot (292) is canonical. 290 copies:

`thesisExperiment/CONSOLIDATED_OVERLAPS/analysis_phase2_hatch290/`

(`SUMMARY.md`, `RESULTS.md`, `stats.json`, selected tables and figures).

---

## Leftover origin branches and PRs

User asked for one branch / everything on `main`. Feature branches were **merged into this consolidation**, not deleted on origin.

Open PRs into `main` (titles/bodies untouched):

| PR | Head | Title (do not edit) |
| --- | --- | --- |
| #1 | `cursor/need-openai-api-key-caf6` | Phase 2 live grid complete: 288 configs, 4 Dnet, real LLM harvest |
| #2 | `cursor/pfeffer-firestorm-extract-d727` | Pfeffer 2014 firestorm: seven Outlook factors and methods later |
| #3 | `cursor/debnath-hashtag-hydration-2187` | Debnath hashtag fallback: OSF tag counts, no tweet-ID hydration |
| #4 | `cursor/phase2-full-analysis-e0ee` | Phase 2 full comparisons: topology H/He and discrete vs continuous MPR |
| #5 | `cursor/pfeffer-debnath-vs-sim-843e` | Pfeffer on Debnath hashtag graph vs Dnet simulation |
| #6 | `cursor/phase2-agent-handoff-e0ee` | Agent handoff markdown for Phase 2 harvest |
| #7 | `cursor/phase2-latex-e0ee` | Phase 2 TUM-style LaTeX results chapter |

After this consolidation lands on `main`, those PRs are the same work already present and can be closed by a human. This agent did not close them.

Origin still has the `cursor/*` branches listed above plus abort branches without PRs (`phase2-llm-experiments-38ac`, `phase2-compare-abde`, `phase2-t2d-he-a349`, `phase2-t2d-h-dual-44ad`, `openai-api-key-missing-a576`, `phase2-t2c-h-abort-cde4`, `phase2-t2c-h-nokey-cde4`, `t2c-he-continuous-abort-4b8c`, `phase2-abort-missing-key-134d`, `phase2-debnath-reconstruct-d202`, `phase2-dnet-sims-bdeb`).

---

## First-parent merge commits on this branch

Starting from `origin/main` `c80655c`:

1. Merge `need-openai-api-key-caf6` (harvest)
2. Merge `phase2-llm-experiments-38ac` (overlaps)
3. Merge `phase2-t2d-he-a349` (overlaps)
4. Merge `phase2-t2d-h-dual-44ad` (overlaps)
5. Merge `openai-api-key-missing-a576` (overlaps)
6. Merge `phase2-t2c-h-abort-cde4` (overlaps)
7. Merge `phase2-compare-abde` (overlaps)
8. Merge `phase2-full-analysis-e0ee` (analysis)
9. Merge `pfeffer-firestorm-extract-d727` (pfeffer)
10. `debnath-hashtag-hydration-2187` already included (via analysis)
11. Merge `pfeffer-debnath-vs-sim-843e` (dnet-pfeffer)
12. Merge `phase2-agent-handoff-e0ee` (handoff)
13. Merge `phase2-latex-e0ee` (latex)
14. Follow-up commit: restore harvest manifest, overlay 292 analysis, extra raw run files, this log

---

## How to identify “what came from where”

1. Canonical live analysis/docs: paths in the checklist above.
2. Incoming conflict copies: `thesisExperiment/CONSOLIDATED_OVERLAPS/<source-branch>/thesisExperiment/...`
3. Hatch-290 analysis snapshot: `thesisExperiment/CONSOLIDATED_OVERLAPS/analysis_phase2_hatch290/`
4. Git: `git log --first-parent --oneline origin/main..HEAD` on this branch.
