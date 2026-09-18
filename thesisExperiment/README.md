# thesisExperiment — climate-firestorm (Pfeffer / Debnath)

TUM thesis campaign folder. **Climate-firestorm simulation**, not a CIKM crime-news reprint. Experiments **H/He** reuse only the CIKM/LASS **homogeneous vs heterogeneous linear-chain** design.

Date: **18 September 2026**. Model: **real `gpt-4o-mini`**. Dry-run MI=0 numbers are invalid.

**You can start writing** methods, results, and appendix from `analysis/`, `results/findings.md`, `results/FIGURES.md`, and `results/tables/`. N=1 and gpt-4o-mini are limitations, not confirmatory statistics. Do not treat the 2-article 6-tick pilot as the chapter.

## Status checklist

| Deliverable | Status | Notes |
|---|---|---|
| LOG.md append-only | **green** | `thesisExperiment/LOG.md` |
| 12 articles × 5 QA | **green** | `articles/articles.json` |
| 12 personas + Debnath mapping | **green** | `personas/expanded_twelve.json`, `DEBNATH_MAPPING.md` |
| Exp H 12×12×8 hops | **green** | 144 real-LLM cells |
| Exp He 12 mixes ×12×8 | **green** | 144 real-LLM cells |
| Exp A 2×2 × 6 articles, 8 ticks | **green** | 24 cells; some mixed-SF seeds died (1 event) |
| Exp B n∈{1,3,5} | **green** | confounded before/after; appendix-safe |
| Pfeffer echo measured + D cell | **green** | D rerun 184 LLM calls (pilot D invalid) |
| Tables CSV/JSON | **green** | `results/tables/` |
| ≥8 captioned figures | **green** | 16 PNGs + `results/FIGURES.md` |
| analysis/ paste text | **green** | methods, results, limitations, claims |
| Cost/model/N | **green** | gpt-4o-mini, N=1, ~8723 calls, ~$1.02 |
| HDBSCAN 814k / Phase III / 30 hops / gpt-4o | **red** | omitted; documented |

## How to rerun (from repo root)

```powershell
node thesisExperiment/scripts/build_stimuli.js
node thesisExperiment/scripts/selfcheck.js
node thesisExperiment/scripts/run_full_campaign.js --probe-only
node thesisExperiment/scripts/run_full_campaign.js --phase H --concurrency 2
node thesisExperiment/scripts/run_full_campaign.js --phase He --concurrency 2
node thesisExperiment/scripts/run_full_campaign.js --phase A
node thesisExperiment/scripts/run_full_campaign.js --phase B
node thesisExperiment/scripts/run_full_campaign.js --phase D
node thesisExperiment/scripts/parse_results.js
.\.venv\Scripts\python.exe thesisExperiment/scripts/plot_results.py
node thesisExperiment/scripts/write_analysis.js
```

Requires non-placeholder `OPENAI_API_KEY` in `.env`. **Do not commit `.env`.** Completed cells are skipped unless `--force`.

`--phase all` runs H→He→A→B→D. Stall kill: 25 min without stdout; hard timeout 45 min (chains) / 70 min (graphs).

## What exists

| Path | What |
|---|---|
| `articles/articles.json` | 12 climate/geoeng articles, 5 GT questions each |
| `personas/expanded_twelve.json` | all 12 personas |
| `personas/homo/` | single-persona files for H |
| `personas/hetero/mix_00..11.json` | 8 unique personas per mix (no repeats) |
| `personas/mixed_graph.json` | 8-BP mix for graph A/B/D |
| `personas/DEBNATH_MAPPING.md` | type → variant table |
| `configs/grid_full.json` | campaign index |
| `configs/full/` | all run configs |
| `analysis/` | methods, limitations, claims, results paragraphs |
| `results/figures/` | numbered PNGs + `captions.md` |
| `results/tables/` | CSV extracts |
| `pfeffer_mapping.md` | six-factor knobs |
| `data/SOURCES.md` | download log; no 662MB tweet dump |

## Experiments

**H** — 12 personas × 12 articles × 8-node linear chain, high reinterpret.

**He** — 12 mixed chains × 12 articles × 8 hops.

**A** — SF vs ER × hom conspiracy vs mixed-8BP × articles `{scopex_2017, chemtrails_gates_2018_2021, sai_geoengineering, paris_agreement, climate_consensus, polar_bears}`. Cost cut: 6/12 articles; logged.

**B** — fact-check at ticks 1, 3, 5 on chemtrails, SF × mixed.

**C** — keyword distortion taxonomy on rewrite texts (heuristic).

**D** — echo metrics on A/B plus echo-chamber cell (seeded).

## Scale cuts (not faked cells)

- Hops 8 not 12.
- Graph A 6 articles not 12.
- N=1.
- No 814k tweet HDBSCAN.

## Pilot leftover

Earlier 2-article 6-tick N=1 runs remain under `runs/A_*_2026-09-18_02*` etc. They are **not** the results chapter. Parser keeps the **latest** completed run per `experimentName`. Full campaign: `results/full_campaign_manifest.json`.

## k* definition (used in all tables)

**Network k\*** = first tick (graphs) or first time-index in `networkMIOverTime` (chains) where **network-mean MI > 3** (propaganda) **and** later points with data do **not** return to ≤ 3. First-node irreversible MI>3 is a separate column (`kStar_firstIrreversibleNode`); it is not substituted for network k*.

## Heterogeneous mixing rule (CIKM-like, documented)

Each He chain has **8 unique personas** (no within-chain repeats; stricter than the paper’s historical ≤2 repeats). Mixes 00–05: sliding windows over the 12 ids. Mixes 06–11: seeded shuffles. Homogeneous H: one persona file, sequential assignment repeats that id on all 8 nodes.

## What is not claimed

- Not a replication of Debnath’s 814k-tweet HDBSCAN.
- Not gpt-4o / 21 personas / 10 QA / 30 hops (this campaign: **gpt-4o-mini**, 12 personas, **5 QA**, **8 hops**, **N=1**).
- k* is an operational simulator definition, not Twitter ignition time (Phase III omitted).
- N=1 is a **case-study grid**, not confirmatory statistics.
- Exp B before/after is descriptive if cascade volume confounds the split.
- Keyword Exp C is not a trained six-type classifier.
- Exp D modularity is at 8 ticks, **not** proposal t={10,30,50}.
- CIKM crime/tech heatmaps are prior work, not new thesis findings.

## Examiner-safe claims

- The engine can host Pfeffer-style climate-firestorm **simulations**.
- On **this** model, N, topology, and seeds, report the observed H/He/A tables (e.g. homogeneous conspiracy higher MI than mixed **if** numbers show that).
- Reduced Debnath BPs are **theory-faithful**, not HDBSCAN centroids.
- Climate chains/graphs are the thesis increment over CIKM LASS.
