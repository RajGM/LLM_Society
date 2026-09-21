# Phase 2 full analysis (`analysis_full_reconciled/`)

Isolated folder for the **full Phase 2 harvest**. Does not overwrite Phase 1 `thesisExperiment/analysis/` or `analysis_phase2/`.

## Source

Live tables only: `thesisExperiment/results_phase2/tables_reconciled/`.
`/workspace/Paper/` was **not present** in this environment. Visual grammar follows the previous campaign’s CIKM-style pack:
`discovery/04_stats/heatmap_spec.md`, `discovery/08_figures/figure_plan.md`, `scripts/plot_results.py` (persona/mix × article heatmaps, k* as absence not zero, homo vs hetero, topology facets).
Structural D-net numbers (depth/breadth) come from `results_phase2/debnath_compare.json` when present; **all MI/MPR/k*/dead/IFD-adjacent numbers come from the CSVs.**

## Hard rules (honoured)

- Do not invent MI. Dead cells stay in the ledger; they are **excluded from means**, not coded as 0.
- Discrete (T2d headline) ≠ continuous (T2c headline). Never averaged into one headline MPR.
- Dual gap is **not** a third MPR.
- N=1 replicate. **8 hops** vs CIKM 30.
- Hatched-dead kept. Live `dead_cells.csv` has **292** rows (brief said 290; TH+THe dead flags = 292).
- Pooling concatenates article-cells across topologies. **Not** a physical super-graph.
- D-net is a **63-node** custom hashtag graph, reported separately. Auditor MI ≠ Twitter MPR.
- Never print `.env`.
- Exploratory SciPy tests treat topology means or pooled cells as vectors. They are **not** campaign-replicate inference.

## Metrics present in live tables

| metric | table field | notes |
| --- | --- | --- |
| meanMI (cell headline) | `meanMI` | parse_phase2.js scored-event mean |
| MPR | `meanNodeMPR` | mean-of-node-means; reported beside meanMI, not mixed into it |
| k* | `kStarContinuous` (T2c) / `kStarDiscrete` (T2d) | first irreversible mean MI>3; null = none |
| dead | `dead` / `hatchStatus` | nScored≤1 after LLM; hatched |
| IFD-adjacent | `meanAgreement`, `meanDualGap` | CR/MR/IR **not** in tables — not invented |
| hop-wise MI | — | **absent** from live tables; hop figures omitted |

## How to regenerate

```bash
python3 thesisExperiment/analysis_full_reconciled/analyze_full_reconciled.py
```

Writes `tables/`, `figures/`, `COMPARISONS.md`, `key_numbers.json`, `notes/`.

## Figure list

| file | what |
| --- | --- |
| `figures/fig00_methods.png` | Methods schematic (8 hops, two IFD instruments) |
| `figures/fig01_c1_h_vs_he_same_mode.png` | C1 same-mode H vs He by topology |
| `figures/fig02_c1_delta_he_minus_h.png` | C1 Δ(He−H) by topology |
| `figures/fig03_c2_c3_same_arm_different_mpr.png` | C2/C3 T2c vs T2d within H and within He |
| `figures/fig04_c2_c3_paired_scatter.png` | Paired live cells T2c vs T2d |
| `figures/fig05_c4_cross_mode.png` | C4 cross-mode two-factor table (not pooled) |
| `figures/fig06_c5_pooled_h_vs_he.png` | C5 cell-pooled H vs He |
| `figures/fig07_c5_conspiracy_composition.png` | C5 family and mix composition |
| `figures/fig08_c5_dnet.png` | C5 D-net 63-node auditor MI |
| `figures/fig09_dnet_structural.png` | D-net structural compare (not MPR) |
| `figures/fig10_h_persona_article_mpr.png` | H persona × article MPR heatmaps |
| `figures/fig11_h_persona_article_maxmi.png` | H persona × article max MI |
| `figures/fig12_h_persona_article_kstar.png` | H persona × article k* |
| `figures/fig13_he_mix_article_mpr.png` | He mix × article MPR |
| `figures/fig14_he_mix_article_maxmi.png` | He mix × article max MI |
| `figures/fig15_persona_topology_mpr.png` | H persona × topology |
| `figures/fig16_mix_topology_mpr.png` | He mix × topology |
| `figures/fig17_topology_article_mpr.png` | Topology × article, all arms/modes |
| `figures/fig18_dead_rates.png` | Hatched dead rates |
| `figures/fig19_kstar_rates.png` | k* rates |
| `figures/fig20_ifd_dual_gap_agreement.png` | Dual gap + agreement (not MPR) |
| `figures/fig21_article_valence_h.png` | H article valence |
| `figures/fig22_article_valence_he.png` | He article valence |

## Numbered findings

See `COMPARISONS.md`.
