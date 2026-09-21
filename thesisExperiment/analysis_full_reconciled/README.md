# Phase 2 full analysis on the RECONCILED table set (`analysis_full_reconciled/`)

**Status.** Primary analysis folder of the thesis since 2026-09-20 (decision A1,
`6aaeb12d2d2eaea03e67a80b/notes/GLOBAL_FIX_DECISIONS_round3.md`). It is the output of
`analyze_full_reconciled.py`, a copy of `../analysis_full/analyze_full.py` whose only differences are the
input path (`results_phase2/tables` -> `results_phase2/tables_reconciled`) and the output folder (this folder).
The analysis logic is unchanged. `../analysis_full/` (derived from the historical canonical tables) is preserved
untouched as the historical version; nothing under `thesisExperiment/` other than this new folder was created
or modified.

All thesis figures (`6aaeb12d2d2eaea03e67a80b/notes/make_figures.py`, configuration block `ANALYSIS_DIR` /
`TABLES_DIR`) and all key numbers in the thesis text are taken from this folder and from
`results_phase2/tables_reconciled/`.

## Provenance

| Item | Value |
|---|---|
| Input tables | `thesisExperiment/results_phase2/tables_reconciled/` (regenerated from the archived node histories through the fixed manifest `results_phase2/retained_runs_manifest.json`; see `tables_reconciled/README.md` and `6aaeb12d2d2eaea03e67a80b/notes/verify_archive.md`) |
| `tables_reconciled/all_rows.csv` SHA-256 | `aeaa63b6f1c4c417ea7f237f0f4bcfcd2e06fcaea85c295ca79f088dbac6115a` |
| `retained_runs_manifest.json` SHA-256 | `760a1aa30c8ece3650dcd726c5e7f158b927b866084e5bd2901bf39278398957` |
| Other inputs (unchanged, shared with `analysis_full`) | `results_phase2/debnath_compare.json`, `results_phase2/summary.json` |
| Script | `analyze_full_reconciled.py`, SHA-256 `8651ed6b92e7359755ea921102b2486d9517c333776259ea34fe9b358584b226` (CRLF, like the original) |
| Original script | `../analysis_full/analyze_full.py`, SHA-256 `44ecc582028f8e6a7e760762961b1a08461e01fa9fd0e59f3f903a81193f1cd4` |
| `key_numbers.json` SHA-256 | `9cacea890f2682eac406f1554d44e74383a75e8eb5e700f9674e1807cc808112` |
| Run | 2026-09-20, `PYTHONUTF8=1 python thesisExperiment/analysis_full_reconciled/analyze_full_reconciled.py` (Python 3.13.5, pandas 2.3.3, scipy 1.16.3, numpy 2.2.6, matplotlib 3.10.3, Windows; `PYTHONUTF8=1` is needed on Windows because the script writes Unicode markdown with the platform default encoding; it changes no number) |

Digests are of the files as written (text outputs carry CRLF line endings on Windows, exactly like the
canonical `analysis_full/` outputs, which were produced the same way).

### Exact differences between `analyze_full_reconciled.py` and `analyze_full.py` (`diff`, 9 lines)

| Line | `analyze_full.py` | `analyze_full_reconciled.py` |
|---:|---|---|
| 4 | docstring: `Writes thesisExperiment/analysis_full/ …` | `Writes thesisExperiment/analysis_full_reconciled/ …` |
| 8 | docstring: `results_phase2/tables/ only.` | `results_phase2/tables_reconciled/ only.` |
| 32 | `TABLES = ROOT / "results_phase2" / "tables"` | `TABLES = ROOT / "results_phase2" / "tables_reconciled"` |
| 35 | `OUT = ROOT / "analysis_full"` | `OUT = ROOT / "analysis_full_reconciled"` |
| 939 | `"source": "LIVE thesisExperiment/results_phase2/tables"` (string written into `key_numbers.json`) | `… /tables_reconciled` |
| 1396 | README title `analysis_full/` | `analysis_full_reconciled/` |
| 1402 | README `Live tables only: …/tables/` | `…/tables_reconciled/` |
| 1433 | README regenerate command | `python3 thesisExperiment/analysis_full_reconciled/analyze_full_reconciled.py` |
| 1474 | `(OUT / "README.md").write_text(...)` | `(OUT / "README_analysis.md").write_text(...)` so that the script-generated readme does not overwrite this provenance file |

No computation, filter, weighting, test or rounding was changed.

## Contents

- `tables/` — the 18 derived CSVs (same names and columns as `../analysis_full/tables/`; the six `api_error_*.csv`
  files of the canonical folder are **not** here: they are produced by `../analysis_full/audit_api_errors.py`
  from the run logs and raw histories, do not depend on the table set, and remain in `../analysis_full/tables/`).
- `key_numbers.json`, `exploratory_tests.json`, `COMPARISONS.md`, `notes/01…05_*.md`, `README_analysis.md`
  (script-generated).
- `figures/` — the script's legacy PNG figures (fig00–fig22). **Unused by the thesis**; the thesis figures are
  built by `6aaeb12d2d2eaea03e67a80b/notes/make_figures.py` into `6aaeb12d2d2eaea03e67a80b/figures/`.

## Differences from `../analysis_full/` (canonical, historical)

The two input tables differ in exactly two `polar_bears` cells of T2d H (`polarized` x `ozone_stratosphere_specialist`,
37 instead of 122 scored events, mean MI 1.5405 instead of 1.4836; `scale_free` x `biodiversity_food_security`,
18 instead of 153, 0.8333 instead of 1.0784). Consequently only T2d H quantities move; every T2c, He and D-net
quantity, every live/dead flag and every k* value is identical. Full field-level list with 2-dp flags:
`6aaeb12d2d2eaea03e67a80b/notes/reconciled_diff.md`.

`key_numbers.json` fields that differ at four decimals (20 of 245 leaves; the `source` string also differs):

| Field | canonical | reconciled | changes at 2 dp |
|---|---:|---:|:---:|
| `meanMI_T2d_H` | 1.6814 | 1.6810 | no (1.68) |
| `meanNodeMPR_T2d_H` | 1.6839 | 1.6835 | no (1.68) |
| `meanDualGap_H` | 0.8804 | 0.8799 | no (0.88) |
| `meanAgreement_H` | 0.6487 | 0.6490 | no (0.65) |
| `c1_T2d_He_minus_H_cell_pool` | 0.3986 | 0.3990 | no (0.40) |
| `c1_T2d_mean_topo_delta` | 0.3974 | 0.3978 | no (0.40) |
| `c2_mean_topo_delta_dual_minus_cont` | 0.8201 | 0.8197 | no (0.82) |
| `c4_mean_topo_delta_T2cHe_minus_T2dH` | -0.6476 | -0.6472 | no (-0.65) |
| `c5_T2d_science_MPR` | 0.8687 | 0.8677 | no (0.87) |
| `tests.c1_wilcoxon_T2d_He_vs_H_topo8.median_delta_b_minus_a` | 0.3005 | 0.3026 | no (0.30) |
| `tests.c2_wilcoxon_T2d_vs_T2c_H_topo8.median_delta_b_minus_a` | 0.8239 | 0.8222 | no (0.82) |
| `tests.c2_spearman_H_topo_cont_vs_disc.rho` | 0.0952 | -0.0476 | **yes (0.10 -> -0.05)** |
| `tests.c2_spearman_H_topo_cont_vs_disc.p` | 0.8225 | 0.9108 | **yes (0.82 -> 0.91)** |
| `tests.c2_wilcoxon_paired_live_cells.statistic` / `.p` | 1582 / 1.40e-56 | 1583 / 1.42e-56 | statistic only (not printed in the thesis) |
| `tests.c5_mw_T2d_H_vs_He_cells.statistic` / `.p` | 45593.5 / 7.17e-06 | 45576.5 / 6.95e-06 | statistic only (not printed) |
| `tests.c5_mw_T2d_conspiracy_vs_science.statistic` / `.median_b` / `.p` | 27129.5 / 0.8456 / 2.36e-35 | 27135.5 / 0.8333 / 2.18e-35 | statistic and median_b (0.85 -> 0.83; not printed) |

Derived tables that differ (rows): `article_mpr.csv` (1), `c1_same_mode_h_vs_he_by_topology.csv` (2),
`c1_same_mode_h_vs_he_by_topology_article.csv` (2), `c2_homo_t2c_vs_t2d_by_topology.csv` (2),
`c2_homo_t2c_vs_t2d_paired_live_cells.csv` (2), `c4_cross_mode_by_topology.csv` (2), `c5_pooled_cells.csv` (2),
`c5_pooled_vs_topology_equal.csv` (1), `ifd_dual_agreement_gap.csv` (2), `persona_family_mpr.csv` (1),
`persona_mpr.csv` (2), `persona_topology_mpr.csv` (2), `topology_arm_mode.csv` (2). Identical:
`c3_*` (2 files), `c5_dnet_cells.csv`, `mix_mpr.csv`, `mix_topology_mpr.csv`.

Two-decimal changes in printed thesis quantities (all T2d H): C2 delta polarised 0.86 -> 0.87; C4 delta scale-free
-0.89 -> -0.88; persona means ozone_stratosphere_specialist 0.96 -> 0.97 and biodiversity_food_security 1.15 -> 1.14;
scale-free dual gap 0.85 -> 0.84; zero-HTTP-error pooled mean 1.76 (was 1.77); C2 condition-mean Spearman -0.05 (was 0.10);
same-event condition-mean Spearman 0.62 (was 0.67); six heatmap cells (see `reconciled_diff.md`).

## Regenerate

```
node   thesisExperiment/results_phase2/tables_reconciled/build_manifest.js
node   thesisExperiment/results_phase2/tables_reconciled/regenerate_reconciled.js
PYTHONUTF8=1 python thesisExperiment/analysis_full_reconciled/analyze_full_reconciled.py
PYTHONUTF8=1 python 6aaeb12d2d2eaea03e67a80b/notes/make_figures.py
```
