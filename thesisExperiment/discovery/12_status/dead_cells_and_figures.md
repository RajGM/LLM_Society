# Dead mixed-graph cells and figures inventory

**Evidence date:** 18 Sep 2026 campaign tables/figures on disk.  
**No LLM runs.** Sources: `results/tables/A_rows.csv`, `results/heatmaps.json`, `results/figures/`, `results/FIGURES.md`, `scripts/plot_results.py`, run `results_*.json`.

---

## 1. Dead mixed-graph cells (1-event drops)

Criterion from `A_rows.csv`: `bpMix=mixed-8BP` and `totalEvents=1` (cascade death / seed drop). Matches `results/findings.md` Exp A note and `CHECKER_REPORT.md` (4/24 A cells).

| experimentName | topology | articleId | totalEvents | meanNodeMPR | maxEventMI | runDir | on-disk result path |
|---|---|---|---:|---:|---:|---|---|
| `A_sf_mix` | scale-free | `scopex_2017` | 1 | 0 | 0 | `A_sf_mix_2026-09-18_05-06-16` | `thesisExperiment/runs/A_sf_mix_2026-09-18_05-06-16/results_scopex_2017.json` |
| `A_sf_mix` | scale-free | `chemtrails_gates_2018_2021` | 1 | 0 | 0 | `A_sf_mix_2026-09-18_05-06-16` | `thesisExperiment/runs/A_sf_mix_2026-09-18_05-06-16/results_chemtrails_gates_2018_2021.json` |
| `A_sf_mix` | scale-free | `sai_geoengineering` | 1 | 0 | 0 | `A_sf_mix_2026-09-18_05-06-16` | `thesisExperiment/runs/A_sf_mix_2026-09-18_05-06-16/results_sai_geoengineering.json` |
| `A_er_mix` | random-ER | `polar_bears` | 1 | 0 | 0 | `A_er_mix_2026-09-18_05-24-05` | `thesisExperiment/runs/A_er_mix_2026-09-18_05-24-05/results_polar_bears.json` |

**Per-file corroboration (each of the four JSON paths above):**  
`sum(nodeSummaries.*.eventCount) = 1`, `metrics.networkMIOverTime` length `0`, `metrics.ifdMetrics.eventCount = 0`.

**CSV row evidence:** `thesisExperiment/results/tables/A_rows.csv` lines for those four `(experimentName, articleId)` pairs.

**Count:** 4 / 24 Experiment A article-rows (all mixed-BP). Homogeneous A cells are not in this dead set.

**Do not interpret** as “mixed BPs immunise networks” (`findings.md`).

---

## 2. Sixteen catalogue figures: present vs missing He heatmap

Catalogue = `results/FIGURES.md` / `results/figures/captions.md` (Fig. 00–15). Plotter: `scripts/plot_results.py`.

| # | Filename | On disk under `results/figures/` |
|---|---|---|
| 00 | `00_methods_chain_auditor.png` | **exists** |
| 01 | `01_H_heatmap_mpr.png` | **exists** |
| 02 | `02_H_heatmap_maxmi.png` | **exists** |
| 03 | `03_H_heatmap_kstar.png` | **exists** |
| 04 | `04_He_heatmap_mpr.png` | **exists** |
| 05 | `05_He_heatmap_maxmi.png` | **exists** |
| 06 | `06_A_mi_mpr_topology.png` | **exists** |
| 07 | `07_A_kstar.png` | **exists** |
| 08 | `08_A_heatmap_mpr.png` | **exists** |
| 09 | `09_B_before_after.png` | **exists** |
| 10 | `10_echo_modularity.png` | **exists** |
| 11 | `11_H_hop_mi.png` | **exists** |
| 12 | `12_H_vs_He_hop_mi.png` | **exists** |
| 13 | `13_llm_calls.png` | **exists** |
| 14 | `14_C_distortion_stack.png` | **exists** |
| 15 | `15_A_mi_trajectories.png` | **exists** |

**All 16 numbered PNGs in the catalogue exist** (non-empty; sizes ~41–208 KB).

### Missing He heatmap (asymmetry vs H)

H has three heatmaps: MPR, max MI, **k\***.  
He has only two: MPR + max MI.

| Expected parallel | Status |
|---|---|
| `04_He_heatmap_mpr.png` | present |
| `05_He_heatmap_maxmi.png` | present |
| He k\* heatmap (e.g. `*_He_heatmap_kstar.png`) | **missing** — no such file in `results/figures/` |

**Machine evidence for the gap:**

- `heatmaps.json` top-level keys: `H_meanMPR`, `H_maxMI`, `H_kStar`, `He_meanMPR`, `He_maxMI`, `A_meanMPR`, `A_kStar` — **no `He_kStar`**.
- `plot_results.py` writes `03_H_heatmap_kstar.png` from `H_kStar`, then jumps to `04`/`05` He MPR/maxMI; **never** saves an He k\* PNG.

So: catalogue of 16 is complete; the **missing He heatmap** is the He k\* panel that would mirror `03_H_heatmap_kstar.png`.

---

## 3. Do heatmaps include zeros from dead cells?

**Yes** for Experiment A MPR (and H/He numeric matrices that store 0 for dead / no-crossing cells).

### A (mixed-graph dead cells → literal 0)

`heatmaps.json` → `A_meanMPR`:

- cols order: `chemtrails_gates_2018_2021`, `climate_consensus`, `paris_agreement`, `polar_bears`, `sai_geoengineering`, `scopex_2017`
- row `A_er_mix`: `[3.2335, 3.9384, 3.9129, **0**, 0.8331, 2.913]` → **0** at `polar_bears`
- row `A_sf_mix`: `[**0**, 4.7172, 3.5503, 1.4685, **0**, **0**]` → **0** at chemtrails, SAI, scopex

`08_A_heatmap_mpr.png` is plotted from that matrix (`plot_results.py` → `heatmap(..., heat["A_meanMPR"])`). The helper only masks NaN (`np.ma.masked_invalid`); **numeric 0 is drawn as zero**, not hatched/excluded.

Same four cells appear as MPR=0 / MI=0 in `A_rows.csv` and are still in aggregates (`CHECKER_REPORT.md` loop **F12**).

### H / He

- Spec (`discovery/04_stats/heatmap_spec.md`): empty/zero-event cells should be `—`, not `0.00`.
- Practice: `heatmaps.json` `H_meanMPR` / `He_meanMPR` store numeric **0** for dead and GT-preserving cells; F12 notes those zeros enter means/heatmaps.
- Caption for Fig. 3 claims empty/NaN for no k\*; matrix/`plot_results.py` still treat missing k\* as **0** for H (`"grey-ish 0 = none"`).

**Bottom line:** dead mixed-graph 1-event cells are **encoded as 0** in `A_meanMPR` and therefore **included** in `08_A_heatmap_mpr.png` and any mean that averages that matrix/CSV without exclusion.
