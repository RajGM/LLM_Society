# Round 1 numerical-results fact check

## Verdict

I checked the thesis's central Phase 2 numerical claims against:

- `thesisExperiment/results_phase2/summary.json`;
- `thesisExperiment/analysis_full/key_numbers.json`;
- the CSVs in `thesisExperiment/analysis_full/tables/`;
- `thesisExperiment/results_phase2/tables/all_rows.csv` and the other canonical parsed tables;
- `thesisExperiment/analysis_full/tables/c5_dnet_cells.csv`;
- `thesisExperiment/results_phase2/debnath_compare.json`;
- `thesisExperiment/analysis_full/pfeffer_debnath_vs_sim.json`; and
- the raw D-net graph, `thesisExperiment/data/derived/debnath_hashtag_cascade.json`.

Result: the central tables and quantitative conclusions reconcile with the canonical sources. I found **one scope/count wording failure**, not a wrong measured value: `05_results.tex:864` says “four primary D-net cells,” but D-net has four configurations and eight article-level cells. All eight article-level cells reached 61 of 63 nodes.

Conventions used below:

- `PASS` means the printed value agrees with source truth at the thesis's displayed precision.
- `FAIL` means the claim is numerically or count-wise false as written.
- Live-cell means exclude `dead = (nScored <= 1)`.
- T2c means are continuous headlines; T2d means are discrete headlines. The dual continuous sidecar is not substituted for T2c.

## 1. Campaign size, hatch count, and live populations

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| Main factorial has 288 configurations and 1,728 article cells | `01_introduction.tex:85-92`; `04_methods.tex:389-401`; `08_conclusion.tex:47-51`; `09_appendices.tex:41-48` | `summary.json`: 1,728 expected cells; grid arithmetic gives 288 configurations | PASS | — |
| Canonical harvest has no missing or in-progress main-grid cells | `04_methods.tex:401`; appendix parse ledger | `summary.json`: `nMissingCells=0`, `nInProgressCells=0` | PASS | — |
| 292 cells are hatched dead, not 290 | `01_introduction.tex:98`; `04_methods.tex:571`; `05_results.tex:410-418,453-454`; `06_discussion.tex:8`; `07_validity_ethics.tex:86`; `08_conclusion.tex:50`; `09_appendices.tex:639-642` | `summary.json` and `key_numbers.json`: 292; recomputation from `all_rows.csv`: 292 | PASS | — |
| Overall dead rate is 16.9% | `04_methods.tex:571` | 292/1,728 = 0.168981 = 16.9% | PASS | — |
| Dead counts by slice are 96 T2c-H, 98 T2d-H, 50 T2c-He, 48 T2d-He | `04_methods.tex:571-573` | `summary.json.sliceCounts[*].hatchedDead`: 96, 98, 50, 48 | PASS | — |
| Live populations are 480 T2c-H, 478 T2d-H, 238 T2c-He, 240 T2d-He | `04_methods.tex:572-574`; `05_results.tex:495-496,540-542` | `key_numbers.json` and recomputed `all_rows.csv`: 480, 478, 238, 240 | PASS | — |
| Slice dead rates are 16.7%, 17.4%, 17.0%, 16.7% | `05_results.tex:412-416` | Exact: 96/576=16.6667%, 50/288=17.3611%, 98/576=17.0139%, 48/288=16.6667% | PASS | — |
| Dead cells remain hatched and are not entered as zero | `01_introduction.tex:98-99`; `04_methods.tex:559-574`; `05_results.tex:410-424` | `summary.json.deadNote`; `key_numbers.json.hatched_dead_kept=true`; dead rows retained in `dead_cells.csv` | PASS | — |

## 2. C2/C3 instrument table and deltas

Source: `c2_homo_t2c_vs_t2d_by_topology.csv`, `c3_hetero_t2c_vs_t2d_by_topology.csv`, and `key_numbers.json`.

Each source-truth tuple is `(T2c H, T2d H, ΔH; T2c He, T2d He, ΔHe)`.

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| Linear-chain row | `05_results.tex:65` | (0.9129, 1.6127, 0.6999; 0.8638, 2.0852, 1.2214) | PASS | — |
| Ring row | `05_results.tex:66` | (0.9160, 1.6402, 0.7242; 0.8760, 2.1768, 1.3008) | PASS | — |
| Random-ER row | `05_results.tex:67` | (0.8736, 1.7809, 0.9073; 0.6593, 2.0412, 1.3818) | PASS | — |
| Small-world row | `05_results.tex:68` | (0.7215, 1.5977, 0.8762; 0.7545, 1.9096, 1.1552) | PASS | — |
| Scale-free row | `05_results.tex:70` | (0.9205, 1.7034, 0.7829; 0.8157, 1.9924, 1.1767) | PASS | — |
| Echo-chamber row | `05_results.tex:71` | (0.8490, 1.7984, 0.9494; 1.3775, 1.9632, 0.5857) | PASS | — |
| Polarised row | `05_results.tex:72` | (0.8356, 1.7005, 0.8649; 1.4137, 1.8830, 0.4693) | PASS | — |
| Hierarchical row | `05_results.tex:73` | (0.8751, 1.6315, 0.7564; 1.5242, 2.5934, 1.0692) | PASS | — |
| Mean topology deltas are 0.8201 H and 1.0450 He | `05_results.tex:42-46,97-101,75-78`; `06_discussion.tex:98-101`; `08_conclusion.tex:14-16` | Exact 0.8201346884 and 1.0450048645 | PASS | — |
| T2d exceeds T2c on 8/8 topologies in both arms | `05_results.tex:39-40,95-96`; discussion and conclusion | `key_numbers.json`: 8 and 8 | PASS | — |
| H topology delta range is 0.6999 to 0.9494 | `05_results.tex:46-48,155-157` | Min linear chain 0.699889; max echo chamber 0.949391 | PASS | — |
| He topology delta range is 0.4693 to 1.3818 | `05_results.tex:101-102,156-158` | Min polarised 0.469316; max random ER 1.381817 | PASS | — |

### Paired-cell counts

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| H has 398 paired-live cells; median delta 0.8125; 342 positive, 26 negative, 30 zero | `05_results.tex:48-50`; `06_discussion.tex:100-102` | `key_numbers.json.tests.c2_wilcoxon_paired_live_cells`; zero = 398-342-26 = 30 | PASS | — |
| H dead-only counts are 80 T2c only, 82 T2d only, 16 both | `05_results.tex:50-51` | `key_numbers.json`: 80, 82, 16 | PASS | — |
| He has 198 paired-live cells; median delta 0.97785; 169 positive, 25 negative, 4 zero | `05_results.tex:102-105`; discussion prints 0.9778 | `key_numbers.json.tests.c3_wilcoxon_paired_live_cells`; zero = 198-169-25 = 4 | PASS | — |
| He dead-only counts are 42 T2c only, 40 T2d only, 8 both | `05_results.tex:105-106` | `key_numbers.json`: 42, 40, 8 | PASS | — |

## 3. Same-event dual diagnostics

Source: `ifd_dual_agreement_gap.csv`. Each tuple is `(H gap, H agreement; He gap, He agreement)`.

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| Linear-chain diagnostics | `05_results.tex:126` | (0.9672, 0.6223; 1.2960, 0.7196) | PASS | — |
| Ring diagnostics | `05_results.tex:127` | (0.8803, 0.6656; 1.3123, 0.6404) | PASS | — |
| Random-ER diagnostics | `05_results.tex:128` | (0.9680, 0.6969; 1.1335, 0.6460) | PASS | — |
| Small-world diagnostics | `05_results.tex:130` | (0.8255, 0.5928; 1.1049, 0.6522) | PASS | — |
| Scale-free diagnostics | `05_results.tex:131` | (0.8463, 0.6607; 1.1058, 0.6230) | PASS | — |
| Echo-chamber diagnostics | `05_results.tex:132` | (0.8923, 0.6306; 0.8830, 0.5986) | PASS | — |
| Polarised diagnostics | `05_results.tex:133` | (0.8553, 0.6191; 0.8784, 0.5673) | PASS | — |
| Hierarchical diagnostics | `05_results.tex:134` | (0.7973, 0.6906; 1.1354, 0.2947) | PASS | — |
| Live-cell summaries are H 0.8804/0.6487 and He 1.1145/0.6174 | `05_results.tex:82-86,107-109,136` | Exact pooled values in `key_numbers.json`: 0.880405/0.648720 and 1.114537/0.617382 | PASS | — |
| CR, MR, IR, and hop MI are absent from live analysis tables | `05_results.tex:110-112` | `key_numbers.json.ifd_fields_absent` lists all four | PASS | — |

## 4. Rank agreement and C4 cross-mode table

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| Spearman topology-rank correlations are 0.0952 H and 0.1667 He | `05_results.tex:145-147`; `06_discussion.tex:104-106` | `key_numbers.json.tests`: 0.0952381 and 0.1666667 | PASS | — |
| C4 mean `T2d He - T2c H` is 1.2175517040 | `05_results.tex:172-177,210-213` | `key_numbers.json`: 1.2175517040009343 | PASS | — |
| C4 mean `T2c He - T2d H` is -0.6475878488 | `05_results.tex:178-181,210-213` | `key_numbers.json`: -0.6475878488326554 | PASS | — |
| Linear-chain C4 deltas | `05_results.tex:202` | 1.1724 and -0.7489 | PASS | — |
| Ring C4 deltas | `05_results.tex:203` | 1.2608 and -0.7642 | PASS | — |
| Random-ER C4 deltas | `05_results.tex:204` | 1.1675 and -1.1216 | PASS | — |
| Small-world C4 deltas | `05_results.tex:205` | 1.1881 and -0.8432 | PASS | — |
| Scale-free C4 deltas | `05_results.tex:206` | 1.0719 and -0.8877 | PASS | — |
| Echo-chamber C4 deltas | `05_results.tex:207` | 1.1141 and -0.4209 | PASS | — |
| Polarised C4 deltas | `05_results.tex:208` | 1.0474 and -0.2868 | PASS | — |
| Hierarchical C4 deltas | `05_results.tex:209` | 1.7182 and -0.1074 | PASS | — |
| C4 signs reverse on all topologies | `05_results.tex:182-186` | All first-direction deltas positive; all reverse-direction deltas negative in `c4_cross_mode_by_topology.csv` | PASS | — |

## 5. Persona-family and persona table

Source: `persona_family_mpr.csv` and `persona_mpr.csv`. Persona tuples are `(n continuous, MPR continuous, k* continuous; n dual, MPR dual, k* dual; dead c/d)`.

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| Conspiracy family | `05_results.tex:246-249`; discussion/conclusion | n=168, MPR=2.2194, k*=40.5%; n=159, MPR=3.1691, k*=59.7% | PASS | — |
| Climate-action family | `05_results.tex:249-251` | n=117, MPR=0.1729, k*=0.0%; n=126, MPR=1.0488, k*=0.8% | PASS | — |
| Science/environment family | `05_results.tex:251-254` | n=195, MPR=0.1118, k*=0.0%; n=193, MPR=0.8687, k*=0.0% | PASS | — |
| `conspiracy_believer` | `05_results.tex:272` | (44, 2.4842, 47.7%; 38, 3.3522, 65.8%; 4/10) | PASS | — |
| `conspiracy_haarp_weather` | `05_results.tex:273` | (40, 2.4829, 47.5%; 44, 3.3571, 70.5%; 8/4) | PASS | — |
| `conspiracy_depopulation` | `05_results.tex:274` | (43, 1.9535, 34.9%; 37, 3.2823, 59.5%; 5/11) | PASS | — |
| `conspiracy_climate_piggyback` | `05_results.tex:275` | (41, 1.9570, 31.7%; 40, 2.6838, 42.5%; 7/8) | PASS | — |
| `climate_action_advocate` | `05_results.tex:276` | (37, 0.2258, 0.0%; 37, 1.0665, 0.0%; 11/11) | PASS | — |
| `climate_justice_youth` | `05_results.tex:277` | (41, 0.2454, 0.0%; 46, 1.3072, 2.2%; 7/2) | PASS | — |
| `mitigation_first_policy` | `05_results.tex:278` | (39, 0.0464, 0.0%; 43, 0.7571, 0.0%; 9/5) | PASS | — |
| `environmental_concern` | `05_results.tex:280` | (40, 0.1423, 0.0%; 37, 0.8359, 0.0%; 8/11) | PASS | — |
| `biodiversity_food_security` | `05_results.tex:281` | (39, 0.2115, 0.0%; 37, 1.1470, 0.0%; 9/11) | PASS | — |
| `ozone_stratosphere_specialist` | `05_results.tex:282` | (38, 0.1627, 0.0%; 37, 0.9639, 0.0%; 10/11) | PASS | — |
| `science_journalist` | `05_results.tex:283` | (37, 0.0310, 0.0%; 39, 0.6745, 0.0%; 11/9) | PASS | — |
| `climate_scientist` | `05_results.tex:284` | (41, 0.0130, 0.0%; 43, 0.7517, 0.0%; 7/5) | PASS | — |
| Persona orderings and quoted ranges | `05_results.tex:289-308` | Recompute directly from the 12 rows above | PASS | — |

## 6. Heterogeneous-mix table

Source: `mix_mpr.csv`. Tuples are `(n continuous, MPR continuous, k* continuous; n dual, MPR dual, k* dual; dead c/d)`.

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| `mix_00` | `05_results.tex:339` | (39, 1.7712, 12.8%; 40, 3.1321, 57.5%; 9/8) | PASS | — |
| `mix_01` | `05_results.tex:340` | (41, 1.4770, 9.8%; 41, 2.7795, 58.5%; 7/7) | PASS | — |
| `mix_02` | `05_results.tex:341` | (41, 0.2645, 0.0%; 41, 1.1882, 0.0%; 7/7) | PASS | — |
| `mix_03` | `05_results.tex:342` | (39, 0.8945, 10.3%; 36, 2.0410, 33.3%; 9/12) | PASS | — |
| `mix_04` | `05_results.tex:343` | (38, 0.7021, 5.3%; 39, 1.6896, 20.5%; 10/9) | PASS | — |
| `mix_05` | `05_results.tex:344` | (40, 1.0134, 7.5%; 43, 1.6713, 23.3%; 8/5) | PASS | — |
| `mix_00` versus `mix_02` headline values | `05_results.tex:320-325`; discussion | 1.7712 vs 0.2645 continuous; 3.1321 vs 1.1882 dual | PASS | — |
| `mix_00` dual k* is 1.0 percentage point below `mix_01` | `05_results.tex:357-359` | 57.5% vs 58.5366%, displayed 58.5%; difference ≈1.04 pp | PASS | — |

Note: `key_numbers.json` also contains `c5_*_mix00` values (1.6204 and 2.9536) for a broader C5 family selection. The thesis table explicitly reports the `mix_00`-only rows, whose canonical values are the separate `mix00_only_*` fields (1.7712 and 3.1321). The thesis uses the correct fields for its stated claim.

## 7. Article table

Source: `article_mpr.csv`. Tuples are `(H continuous, H dual, He continuous, He dual)`.

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| SCoPEx | `05_results.tex:377` | (0.7322, 1.5390, 0.7694, 2.3718) | PASS | — |
| Chemtrails--Gates | `05_results.tex:378` | (1.3541, 2.1383, 1.7852, 2.3885) | PASS | — |
| SAI geoengineering | `05_results.tex:380` | (0.1974, 1.3576, 0.1523, 1.1160) | PASS | — |
| Paris agreement | `05_results.tex:381` | (1.3357, 1.7321, 1.6821, 2.4591) | PASS | — |
| Climate consensus | `05_results.tex:382` | (1.5934, 2.2610, 1.8896, 2.8991) | PASS | — |
| Polar bears | `05_results.tex:383` | (0.0185, 1.0399, 0.0415, 1.1444) | PASS | — |
| Climate consensus is highest and polar bears lowest in all four slices | `05_results.tex:388-391` | Directly follows from all six source rows | PASS | — |
| Chemtrails--Gates exceeds SCoPEx in all four slices | `05_results.tex:391-395` | 1.3541>0.7322; 2.1383>1.5390; 1.7852>0.7694; 2.3885>2.3718 | PASS | — |

## 8. Collapsed k-star rates and C1 pooled means

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| H k* rates are 14.2% continuous and 20.1% dual | `05_results.tex:401-403` | `key_numbers.json`: 14.1667% and 20.0837% | PASS | — |
| He k* rates are 7.6% continuous and 32.1% dual | `05_results.tex:402-404`; `06_discussion.tex:102-104` | 7.5630% and 32.0833% | PASS | — |
| Pooled T2c means are H 0.8643 and He 1.0192, delta 0.1549 | `05_results.tex:494-497`; `06_discussion.tex:61-63` | Exact 0.8643383, 1.0192496, delta 0.1549112 | PASS | — |
| Pooled T2d means are H 1.6814 and He 2.0800, delta 0.3986 | `05_results.tex:539-543`; `06_discussion.tex:62-63` | Exact 1.6813805, 2.0799792, delta 0.3985986 | PASS | — |
| Topology-equal C1 deltas are 0.1725 T2c and 0.3974 T2d | `05_results.tex:494,539-540` | Exact 0.1725468 and 0.3974170 | PASS | — |
| T2c C1 signs are 4 positive/4 negative | `05_results.tex:491-493`; conclusion | `key_numbers.json`: 4 He>H; source table has four negative | PASS | — |
| T2d C1 signs are 8 positive/0 negative | `05_results.tex:539,546-547`; conclusion | `key_numbers.json`: 8 He>H | PASS | — |
| T2c Wilcoxon summary W=14, p=0.6406, median=-0.0035 | `05_results.tex:500-503` | Exact W=14, p=0.640625, median=-0.00351357 | PASS | — |
| T2d Wilcoxon summary W=0, p=0.007812, median=0.3005 | `05_results.tex:545-547` | Exact W=0, p=0.0078125, median=0.3004919 | PASS | — |

## 9. C1 topology tables: means, denominators, and deltas

Source: `c1_same_mode_h_vs_he_by_topology.csv`. Each tuple is `(H live/dead/mean; He live/dead/mean; He-H delta)`.

### Continuous

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| Linear chain | `05_results.tex:478` | (62/10/0.9129; 32/4/0.8638; -0.0491) | PASS | — |
| Ring | `05_results.tex:480` | (65/7/0.9160; 33/3/0.8760; -0.0400) | PASS | — |
| Random ER | `05_results.tex:481` | (57/15/0.8736; 29/7/0.6593; -0.2143) | PASS | — |
| Small world | `05_results.tex:482` | (56/16/0.7215; 31/5/0.7545; 0.0330) | PASS | — |
| Scale-free | `05_results.tex:483` | (60/12/0.9205; 30/6/0.8157; -0.1048) | PASS | — |
| Echo chamber | `05_results.tex:484` | (63/9/0.8490; 32/4/1.3775; 0.5284) | PASS | — |
| Polarised | `05_results.tex:485` | (65/7/0.8356; 25/11/1.4137; 0.5780) | PASS | — |
| Hierarchical | `05_results.tex:486` | (52/20/0.8751; 26/10/1.5242; 0.6490) | PASS | — |
| Continuous extrema and associated live counts | `05_results.tex:460-465`; `06_discussion.tex:28-36` | H min small world 0.7215 (56/72), max scale-free 0.9205 (60/72); He min random ER 0.6593 (29/36), max hierarchical 1.5242 (26/36) | PASS | — |

### Dual-discrete

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| Linear chain | `05_results.tex:526` | (68/4/1.6127; 33/3/2.0852; 0.4725) | PASS | — |
| Ring | `05_results.tex:527` | (61/11/1.6402; 33/3/2.1768; 0.5366) | PASS | — |
| Random ER | `05_results.tex:528` | (56/16/1.7809; 29/7/2.0412; 0.2602) | PASS | — |
| Small world | `05_results.tex:530` | (59/13/1.5977; 32/4/1.9096; 0.3120) | PASS | — |
| Scale-free | `05_results.tex:531` | (57/15/1.7034; 29/7/1.9924; 0.2890) | PASS | — |
| Echo chamber | `05_results.tex:532` | (61/11/1.7984; 30/6/1.9632; 0.1647) | PASS | — |
| Polarised | `05_results.tex:533` | (57/15/1.7005; 26/10/1.8830; 0.1825) | PASS | — |
| Hierarchical | `05_results.tex:534` | (59/13/1.6315; 28/8/2.5934; 0.9618) | PASS | — |
| Dual extrema and associated live counts | `05_results.tex:510-513`; `06_discussion.tex:30-34` | H min small world 1.5977 (59/72), max echo 1.7984 (61/72); He min polarised 1.8830 (26/36), max hierarchical 2.5934 (28/36) | PASS | — |

### Missingness extrema

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| Polarised He continuous has largest dead rate, 30.6%, with 25/36 live | `05_results.tex:415-417`; `06_discussion.tex:35-36` | 11/36 dead = 30.5556%; 25 live | PASS | — |
| Hierarchical H and He continuous are both 27.8% dead, with 52/72 and 26/36 live | `05_results.tex:416-418` | 20/72 and 10/36 = 27.7778% | PASS | — |
| Polarised He dual is 27.8% dead, 26/36 live | `05_results.tex:418` | 10/36 = 27.7778% | PASS | — |
| Linear-chain H dual is 5.6% dead, 68/72 live | `05_results.tex:419` | 4/72 = 5.5556% | PASS | — |
| Ring He is 8.3% dead in both instruments, 33/36 live | `05_results.tex:419-420` | 3/36 = 8.3333% in both | PASS | — |

## 10. D-net graph, placement, and score table

### Graph and placement

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| D-net has 63 nodes and 228 directed importer edges | `05_results.tex:588`; methods, validity, appendix | Raw graph: 63 `user_profiles`, 228 `retweets[]` entries; `pfeffer_debnath_vs_sim.json.graph` agrees | PASS | — |
| Directed edges collapse to 171 unique undirected pairs | `05_results.tex:588-589,826` | Deduplicating unordered raw edge endpoints gives 171; `pfeffer_debnath_vs_sim.json.graph.nUniqueUndirectedEdges=171` | PASS | — |
| Both persona conditions use the same topology and seed node | `05_results.tex:592-594` | D-net cells in `pfeffer_debnath_vs_sim.json` all use `user_chemtrails_hub` and 63/228 topology | PASS | — |
| Exact persona-ID mapping is 56/63, with seven coarse substitutions | `05_results.tex:597-615`; appendix | `pfeffer_debnath_vs_sim.json.mapping`: 56 exact, 7 mismatch; listed nodes match | PASS | — |
| Mixed placement has 28 conspiracy, 19 climate-action, 13 environmental, 3 expert | `05_results.tex:616-619`; appendix | `mapping.mixedFamilyCounts`: 28, 19, 13, 3 | PASS | — |
| Empirical identity mix is 28, 19, 14, 2 | `05_results.tex:619-623`; appendix | Raw `identityMix` and `mapping.empiricalIdentityMix`: 28, 19, 14, 2 | PASS | — |
| Conspiracy share is 28/63 = 0.444 | `05_results.tex:848,903-905`; discussion | 28/63 = 0.444444 | PASS | — |

### D-net score table

Source: `c5_dnet_cells.csv`. Tuples are `(headline, nScored, dual sidecar where applicable)`.

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| Continuous H SCoPEx | `05_results.tex:644-646` | (1.7349, 970, —) | PASS | — |
| Continuous H chemtrails--Gates | `05_results.tex:646-648` | (3.3378, 984, —) | PASS | — |
| Continuous He SCoPEx | `05_results.tex:648-650` | (0.9983, 591, —) | PASS | — |
| Continuous He chemtrails--Gates | `05_results.tex:650-652` | (2.5068, 1,035, —) | PASS | — |
| Dual H SCoPEx | `05_results.tex:652-654` | (4.2537, 1,076, 2.2495) | PASS | — |
| Dual H chemtrails--Gates | `05_results.tex:654-656` | (3.7303, 749, 3.1251) | PASS | — |
| Dual He SCoPEx | `05_results.tex:656-658` | (2.6880, 407, 1.1302) | PASS | — |
| Dual He chemtrails--Gates | `05_results.tex:658-660` | (1.5297, 1,027, 1.1497) | PASS | — |
| H exceeds He in all four like-for-like article/instrument comparisons | `05_results.tex:664-668`; discussion | 1.7349>0.9983; 3.3378>2.5068; 4.2537>2.6880; 3.7303>1.5297 | PASS | — |
| D-net instrument ordering fails only for mixed chemtrails--Gates | `05_results.tex:690-696` | Dual>continuous in three comparisons; 1.5297<2.5068 in mixed chemtrails | PASS | — |

## 11. D-net structural metrics and validation

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| Global transitivity 0.3146 and mean local clustering 0.5153 | `05_results.tex:716-717,841-844`; discussion | `pfeffer_debnath_vs_sim.json`: 0.3146 and 0.5153 | PASS | — |
| Mean unique degree is 5.4286 | `05_results.tex:717` | 2×171/63 = 5.428571; `empiricalPfeffer.meanUniqueDegree=5.4286` | PASS | — |
| Chemtrails hub has 33 unique neighbours | `05_results.tex:717-718,844` | Deduplicated raw graph degree = 33 | PASS | — |
| Conspiracy-cut modularity is 0.4039 mixed and 0.4566 homogeneous | `05_results.tex:719-720,860-861` | `pfeffer_debnath_vs_sim.json`: 0.4039 and 0.4566 | PASS | — |
| Mixed simulation homophily is 0.8377; homogeneous is 1.0 | `05_results.tex:720-721,857-860` | `simulatedPfeffer.cells[*].echo.identityHomophily`: 0.8377 and 1 | PASS | — |
| Empirical identity and family homophily are 0.8728 and 0.8377 | `05_results.tex:845-847,894-897` | `empiricalPfeffer.echo`: 0.8728 and 0.8377 | PASS | — |
| Empirical shape is depth 4, breadth 33, reached size 61, virality 2.7 | `04_methods.tex:710-714`; `05_results.tex:724-726` | `debnath_compare.json.realMetrics`: 4, 33, 61, 2.7 | PASS | — |
| Means over 16 simulations are depth 2.5625, breadth 40.9375, size 53.5, virality 1.7963 | `04_methods.tex:711-714`; `05_results.tex:726-728` | `debnath_compare.json.avgSimMetrics`: exact match | PASS | — |
| Only breadth meets the 30% scalar band | `04_methods.tex:713`; `05_results.tex:728-729`; discussion/conclusion | Relative errors: depth 0.3594 fail, breadth 0.2405 pass, virality 0.3347 fail | PASS | — |
| Structural similarity is 0.6885 | `04_methods.tex:714,755`; `05_results.tex:729` | `debnath_compare.json.structuralComparison.structuralSimilarity=0.6885` | PASS | — |
| KS results are depth 1.0000/0.1104, breadth 0.8125/0.2954, virality 1.0000/0.1104 | `04_methods.tex:735-739`; `05_results.tex:731-735` | `debnath_compare.json.distributionalComparison`: exact match | PASS | — |
| JS divergence is 1.0000 for all three; all match flags false; distributional score 0 | `04_methods.tex:739-741`; `05_results.tex:735-737` | `debnath_compare.json`: JS=1 each, flags false, score=0 | PASS | — |
| DTFS is 0.2754, threshold 0.70, validation false | `04_methods.tex:755-761`; `05_results.tex:738-741,962-964`; discussion/conclusion/validity | `debnath_compare.json.dtfs`: 0.2754, `isValidated=false`; implemented threshold documented as 0.70 | PASS | — |
| Structural validation compares one empirical object with 16 simulations | `04_methods.tex:734-735`; `06_discussion.tex:141-142` | `debnath_compare.json`: `nReal=1`, `nSim=16` | PASS | — |

## 12. The identified failure

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| “Across the four primary D-net cells, 61 of 63 nodes receive a message” | `05_results.tex:864-866` | The canonical D-net score table has **four configurations × two articles = eight article-level cells**. `pfeffer_debnath_vs_sim.json.simulatedPfeffer.cells` has eight cells, and each records `nReached=61`. | **FAIL** | Replace with: “Across all eight article-level D-net cells (four configurations), 61 of 63 nodes receive a message within the held eight-tick horizon.” |

The measured reach value, 61/63, is correct. The failure is the number and unit of the cells over which it is asserted.

## 13. Repeated synthesis claims

These repetitions do not introduce additional discrepancies.

| Claim | Thesis location | Source truth | Pass/fail | Correction |
|---|---|---|---|---|
| Discussion topology extrema and dead rates | `06_discussion.tex:24-36` | Same values as C1 source table above | PASS | — |
| Discussion pooled H/He means and deltas | `06_discussion.tex:60-72` | Same values as `key_numbers.json` and composition tables above | PASS | — |
| Discussion instrument means, medians, counts, k* rates, and rank correlations | `06_discussion.tex:97-106` | Same values as C2/C3 and test records above | PASS | — |
| Discussion D-net score contrasts and structural-validation summary | `06_discussion.tex:130-142` | Same values as D-net and validation records above | PASS | — |
| Discussion Pfeffer structural summary 0.315/0.515/~0.84 | `06_discussion.tex:274-276` | Rounded from 0.3146, 0.5153, 0.8377 | PASS | — |
| Conclusion C2/C3 gaps and composition means | `08_conclusion.tex:12-25` | Same source values above | PASS | — |
| Conclusion DTFS and harvest counts | `08_conclusion.tex:37-52` | 0.2754; 288; 1,728; 292 | PASS | — |
| Appendix factorial matrix and D-net counts | `09_appendices.tex:41-48,492-499` | Grid arithmetic, summary, and mapping JSON agree | PASS | — |

## Bottom line

The thesis's central quantitative results are reproducible from the canonical parsed tables. The hatch total of **292**, all reported pooled and topology-equal means, C1--C4 deltas, dual diagnostics, persona/mix/article tables, D-net score table, and structural-validation metrics pass. The only correction required by this audit is to change **“four primary D-net cells”** to **“eight article-level D-net cells (four configurations)”** at `05_results.tex:864`.
