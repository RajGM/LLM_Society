# Round 2 evidence audit

## Verdict

**PASS.** No CRITICAL factual error in `/workspace/thesisExperiment/thesis_final/main.pdf` or its LaTeX source.

Checked against:

- `thesisExperiment/results_phase2/summary.json`
- `thesisExperiment/results_phase2/tables/all_rows.csv`
- `thesisExperiment/analysis_full/key_numbers.json`
- `thesisExperiment/analysis_full/API_ERROR_AUDIT.md` and `api_error_audit.json`
- `thesisExperiment/thesis_final/reviews/round1/08A_MODULARITY_CORRECTION.md`
- `thesisExperiment/analysis_full/pfeffer_debnath_vs_sim.json`
- `thesisExperiment/analysis_full/tables/` (`c1`, `c2`, `c3`, `c4`, `c5_dnet_cells`, persona/mix/article, IFD, API-error-by-time)
- `thesisExperiment/results_phase2/debnath_compare.json`

Thesis source and PDF were **not edited**. Working-tree PDF text matches committed HEAD (`042023488cefb343e739ad4b4bdba5d23171ff48`); extracted text is identical (116 pages). A working-tree binary hash differs from HEAD (`6d6aec89…` vs `9dcfa75a…`) at the same byte size; that is a rebuild artefact, not a wording change.

Conventions:

- `PASS` — printed value agrees with source truth at displayed precision.
- `FAIL` — claim is numerically or count-wise false as written.
- `CRITICAL` — a false central number or a reversed substantive conclusion (robustness, modularity, campaign size, D-net cell unit). None found.
- Live-cell means exclude `dead = (nScored <= 1)`.
- Continuous He−H is \(\mathrm{He}-\mathrm{H}\) on live-cell mean MI.

---

## Targeted wording checks (round-1 FAIL items)

### 1. Continuous He−H robustness — PASS

Source truth (`api_error_audit.json` sensitivity; `API_ERROR_AUDIT.md`; `key_numbers.json`):

| Quantity | Exact | Displayed |
|---|---:|---:|
| Canonical live-cell He−H, continuous | \(+0.1549112465\) | \(+0.1549\) |
| Zero-HTTP-error runs, continuous | \(-0.0295021188\) | \(-0.0295\) |
| Canonical live-cell He−H, dual-discrete | \(+0.3985986227\) | \(+0.3986\) |
| Zero-HTTP-error runs, dual-discrete | \(+0.4694504591\) | \(+0.4695\) |

The continuous collapsed-arm direction **reverses** in the zero-error subset and is **not robust**. Dual-discrete remains positive. Only **5** affected experiment names have a complete zero-error alternative (`reruns.affectedExperimentNamesWithCleanCompleteReplacement`).

| Location | What the text says | Pass/fail |
|---|---|---|
| Abstract (`main.tex:116–118`; PDF p. 1) | Canonical \(+0.1549\) → zero-error \(-0.0295\); “is not robust”. Dual \(+0.3986\) / \(+0.4695\) remains positive. | PASS |
| Results C1 continuous (`05_results.tex:657–659`) | Pooled continuous He−H from \(+0.1549\) to \(-0.0295\); “that direction is therefore not robust.” | PASS |
| Results C1 dual (`05_results.tex:698–701`) | Canonical 0.3986; zero-error “remained positive (0.4695)”. | PASS |
| Discussion RQ2 (`06_discussion.tex:35–51`) | Collapsed He>H \(0.1549\) / \(0.3986\); zero-error reverses continuous (\(-0.0295\) rather than \(+0.1549\)); dual stays \(+0.4695\); “not robust to API availability.” | PASS |
| Validity (`07_validity_ethics.tex:81–88`) | Canonical continuous \(+0.1549\) becomes \(-0.0295\); dual \(+0.3986\) / \(+0.4695\); continuous direction “not robust”; dual “stable across the audited checks.” Conditioned analysis, not a causal correction. | PASS |
| Conclusion (`08_conclusion.tex:60–64`) | Zero-error “reverses the small continuous He−H contrast”; continuous collapsed-arm direction “is not a robust headline conclusion.” | PASS |

No remaining claim treats continuous collapsed He>H as a robust headline. Dual He>H is correctly limited to directional stability under the audited checks.

Minor (not critical): the abstract and a few H/He-contrast sentences write “H--He difference” while attaching the signed He−H values. Results, validity, and conclusion use “He--H” for the signed quantity. The signs and the “not robust” conclusion are correct either way.

### 2. Four-config / eight-cell D-net wording — PASS

Source truth: `summary.json.nDnetRows = 8`; `c5_dnet_cells.csv` has **8** article-level rows from **4** configurations (`Dnet_c_H_conspiracy`, `Dnet_c_He_mixed`, `Dnet_d_H_conspiracy`, `Dnet_d_He_mixed`) × two articles. `pfeffer_debnath_vs_sim.json.simulatedPfeffer.cells` has eight cells; each records `nReached = 61`.

Round 1 FAIL was “Across the four primary D-net cells, 61 of 63 nodes receive a message.” That sentence is gone from source and PDF (`pdftotext` has no “four primary” and no `0.4039` / `0.4566`).

| Location | What the text says | Pass/fail |
|---|---|---|
| Abstract (`main.tex:109`) | “four configurations and eight article-level cells” | PASS |
| Results (`05_results.tex:783–788`) | Four configurations × two articles → “eight article-level results” in `tab:dnet-arms` | PASS |
| Table caption (`05_results.tex:793`) | “four D-net configurations” with eight body rows | PASS |
| Previously failing sentence (`05_results.tex:1036–1037`) | “Across all eight article-level D-net cells (four configurations), 61 of 63 nodes receive a message within the held eight-tick horizon.” | PASS |
| Conclusion (`08_conclusion.tex:40`) | “four configurations and eight article-level cells” | PASS |
| Appendix index (`09_appendices.tex:610`) | “four D-net configs” | PASS |

The 61/63 reach claim is scoped to all eight article-level cells, with the seeded-component saturation caveat retained.

---

## Corrected modularity — PASS

Source: `08A_MODULARITY_CORRECTION.md`; `pfeffer_debnath_vs_sim.json` clustering block (unique-undirected Newman–Girvan).

| Partition | Exact | Printed |
|---|---:|---|
| Homogeneous one-community | \(0\) | \(Q=0\) |
| Mixed / assigned conspiracy cut | \(0.429670667898\) | \(0.4297\) |
| Six assigned graph clusters | \(0.548852638419\) | \(0.5489\) |
| Four assigned discourse identities | \(0.532249239082\) | \(0.5322\) |
| Mixed / intended BP-family | \(0.490766389658\) | \(0.4908\) |
| Directed-arc sensitivity (not headline) | \(0.394121268082\) | not used as headline |

Withdrawn values \(Q=0.4039\) / \(0.4566\) (and rounded \(0.404\) / \(0.457\)) are absent from chapters and from the PDF. Homogeneous one-community \(Q=0\) appears in results, the Pfeffer limits table, and the conclusion. Clustering (transitivity \(0.3146\), mean local clustering \(0.5153\)) remains distinct from label modularity. Homogeneous homophily \(1.0\) is described as tautological, not as emergent echo.

Some prose rounds transitivity/homophily to \(0.315\) / \(0.873\) / \(0.838\); the structural-comparison paragraph keeps four-decimal source values. Rounding is consistent with displayed precision, not a substitution of the withdrawn modularity.

---

## API-error audit — PASS

Source: `api_error_audit.json` totals and `API_ERROR_AUDIT.md`.

| Claim | Thesis | Source | Pass/fail |
|---|---:|---:|---|
| Successful calls | 203,928 | `llm_calls=203928` | PASS |
| HTTP-error counters | 64,270 | `http_errors=64270` | PASS |
| Runs affected | 121/288 | `runs_with_http_errors=121` | PASS |
| Audit-eligible / scored / null | 129,664 / 93,470 / 36,194 | exact | PASS |
| Observed parse/all-correct fallback | 0 | `parse_fallbacks=0`; `observedParseFallbackWarnings=0` | PASS |
| Clean alternative reruns for affected names | 5 | `affectedExperimentNamesWithCleanCompleteReplacement=5` | PASS |
| 04:00 UTC error cluster | 57,417 | `api_error_by_time.csv` 04:00Z `http_errors=57417` | PASS |
| No client retries | stated | audit: retries/backoff 0 | PASS |

Methods, validity, abstract, and conclusion treat 64,270 as client HTTP-error counters, not a unique-request ledger. Null scores are excluded from MI/MPR/\(k^{*}\) and can change hatch status. Fail-open parse fallback is described as latent and unobserved.

---

## Campaign size, hatch, and live populations — PASS

Recomputed from `all_rows.csv` (1,728 T2 rows) and `summary.json`.

| Claim | Source truth | Pass/fail |
|---|---|---|
| 288 configs, 1,728 cells, 0 missing / 0 in-progress | `nExpectedCells=1728`, `nMissingCells=0`, `nInProgressCells=0`; grid 96+96+48+48 | PASS |
| 292 hatched dead (not 290) | `nDead=292`; recomputed 292 | PASS |
| Dead split 232 zero-scored + 60 one-scored | recomputed `{0: 232, 1: 60}` | PASS |
| Slice dead 96 / 98 / 50 / 48 (T2c-H, T2d-H, T2c-He, T2d-He) | `sliceCounts.*.hatchedDead` and recomputed | PASS |
| Live 480 / 478 / 238 / 240 | `key_numbers.json` and recomputed | PASS |
| Overall dead rate 16.9% | \(292/1728=0.168981\) | PASS |
| Slice dead rates 16.7%, 17.4%, 17.0%, 16.7% | \(96/576\), \(50/288\), \(98/576\), \(48/288\) | PASS |
| D-net excluded from the 1,728-cell factorial | `nDnetRows=8` extra; methods/appendix say so | PASS |

---

## C1–C4, instruments, composition — PASS

Headline live-cell means (`key_numbers.json`):

| Slice | Exact mean MI | Printed |
|---|---:|---:|
| T2c H | 0.8643383333 | 0.8643 |
| T2c He | 1.0192495798 | 1.0192 |
| T2d H | 1.6813805439 | 1.6814 |
| T2d He | 2.0799791667 | 2.0800 |

| Claim | Source | Pass/fail |
|---|---|---|
| Topology-equal C1 Δ 0.1725 continuous / 0.3974 dual | `c1_T2c_mean_topo_delta`, `c1_T2d_mean_topo_delta` | PASS |
| Continuous C1 signs 4/4; dual 8/0 | `c1_T2c_n_topologies_He_gt_H=4`, `c1_T2d=8` | PASS |
| Continuous topology-mean median Δ −0.0035 | Wilcoxon record −0.00351357 | PASS |
| Dual topology-mean median Δ 0.3005 | 0.3004919 | PASS |
| C2/C3: dual > continuous on 8/8 topologies | `c2_`/`c3_n_topologies_discrete_gt_continuous=8` | PASS |
| Mean topology Δ 0.8201 H / 1.0450 He | 0.8201346884 / 1.0450048645 | PASS |
| Exact displayed C2/C3 equation values | `05_results.tex:49,108` | PASS |
| C2 paired live 398; median 0.8125; 342/26/30 | tests + zeros \(398-342-26\) | PASS |
| C3 paired live 198; median 0.97785; 169/25/4 | tests + zeros \(198-169-25\) | PASS |
| Dead-only C2 80/82/16; C3 42/40/8 | `key_numbers.json` | PASS |
| Dual gap/agreement H 0.8804 / 0.6487; He 1.1145 / 0.6174 | equal-cell live means | PASS |
| Agreement defined 270/478 H and 171/240 He | figure caption and results prose | PASS |
| Spearman topology-rank 0.0952 H / 0.1667 He | 0.095238 / 0.166667; discussion rounds 0.095 / 0.167 | PASS |
| C4 mean Δ 1.2176 and −0.6476 | 1.2175517040 / −0.6475878488 | PASS |
| All eight C2/C3/C4 table rows | match `c2`/`c3`/`c4` CSVs at four decimals | PASS |
| All eight C1 continuous and dual topology rows (live/dead/mean/Δ) | match `c1_same_mode_h_vs_he_by_topology.csv` | PASS |

Missingness extrema (polarised He continuous 30.6% = 11/36; hierarchical continuous 27.8%; polarised He dual 27.8%; linear-chain H dual 5.6%; ring He 8.3% both instruments) recompute from the C1 live/dead counts.

Composition headlines:

| Claim | Source | Pass/fail |
|---|---|---|
| Conspiracy family 2.2194 / 3.1691; n=168/159; k* 40.5%/59.7% | `persona_family_mpr.csv` | PASS |
| Climate-action 0.1729 / 1.0488; n=117/126; k* 0.0%/0.8% | same | PASS |
| Science/env 0.1118 / 0.8687; n=195/193; k* 0%/0% | same | PASS |
| Twelve persona table rows | `persona_mpr.csv` at displayed precision | PASS |
| `mix_00` 1.7712 / 3.1321 vs `mix_02` 0.2645 / 1.1882 | `mix00_only_*` / mix table, not the broader `c5_*_mix00` fields | PASS |
| Six mix table rows including dead c/d | `mix_mpr.csv` | PASS |
| Six article rows; consensus highest, polar bears lowest, chemtrails>SCoPEx in all four slices | `article_mpr.csv` | PASS |
| k* rates 14.2% / 20.1% H and 7.6% / 32.1% He | 0.141667, 0.200837, 0.075630, 0.320833 | PASS |

---

## D-net scores and structural validation — PASS

Score table (`c5_dnet_cells.csv`) matches `tab:dnet-arms` including dual sidecars 2.2495 / 3.1251 / 1.1302 / 1.1497 and n-scored 970 / 984 / 591 / 1,035 / 1,076 / 749 / 407 / 1,027.

H>He in all four like-for-like article/instrument pairs. Dual>continuous fails only for mixed chemtrails–Gates (1.5297 vs 2.5068).

Graph: 63 nodes, 228 directed stored arcs, 171 unique undirected pairs; hub unique degree 33; mean unique degree 5.4286 (printed 5.4286 or 5.43). Mapping 56/63 exact IDs; mixed placement 28/19/13/3; empirical identity mix 28/19/14/2; conspiracy share \(28/63=0.444\).

Validation (`debnath_compare.json`):

| Claim | Source | Pass/fail |
|---|---|---|
| Empirical depth/breadth/size/virality 4 / 33 / 61 / 2.7 | `realMetrics` | PASS |
| Sim means 2.5625 / 40.9375 / 53.5 / 1.7963 over 16 cascades | `avgSimMetrics`; `nSim=16` | PASS |
| Only breadth in 30% band | relative errors 0.3594 / 0.2405 / 0.3347 | PASS |
| Structural similarity 0.6885 | exact | PASS |
| KS D 1.0000 / 0.8125 / 1.0000; p 0.1104 / 0.2954 / 0.1104 | distributional block | PASS |
| JS 1.0000 all three; match flags false; distributional score 0 | exact | PASS |
| DTFS 0.2754; threshold 0.70; `isValidated=false` | `dtfs` | PASS |

---

## PDF versus source

| Item | Result |
|---|---|
| Pages | 116 |
| `pdftotext` vs HEAD PDF | identical |
| Central strings in PDF | 292; 1,728; 64,270; 203,928; 36,194; \(+0.1549\); \(-0.0295\); “not robust”; four configurations / eight article-level cells; \(Q=0.4297\); \(Q=0\) |
| Withdrawn strings in PDF | none (`four primary`, `0.4039`, `0.4566`) |

---

## Bottom line

Round-1 numerical FAIL (D-net cell unit) and forensic FAIL (non-standard modularity; continuous He−H treated as robust) are corrected in both source and PDF. Central harvest, C1–C4, composition, D-net scores, API-error counters, and DTFS figures reproduce from the canonical JSON/CSV chain at the thesis’s displayed precision.

**Action:** none. Do not edit `thesis_final` sources or rebuild.

**Thesis SHA:** unchanged (`042023488cefb343e739ad4b4bdba5d23171ff48`).
