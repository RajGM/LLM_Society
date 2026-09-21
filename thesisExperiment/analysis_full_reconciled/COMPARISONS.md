# Phase 2 full comparisons — numbered findings

Live tables only. N=1. 8 hops vs CIKM 30. Discrete ≠ continuous. Dual gap ≠ MPR. Dead cells hatched and kept.
Exploratory SciPy lines are **not** replicate inference.

## Harvest snapshot

| slice | n cells | n live | meanMI | meanNodeMPR | k* rate | dead rate |
| --- | --- | --- | --- | --- | --- | --- |
| T2c_H | 576 | 480 | 0.8643 | 0.8630 | 14.2% | 16.7% |
| T2c_He | 288 | 238 | 1.0192 | 1.0140 | 7.6% | 17.4% |
| T2d_H | 576 | 478 | 1.6810 | 1.6835 | 20.1% | 17.0% |
| T2d_He | 288 | 240 | 2.0800 | 2.0737 | 32.1% | 16.7% |

Hatched-dead rows in `dead_cells.csv`: **292** (brief 290). All kept.

## 1. Same topology, homo vs hetero, SAME MPR mode

Pairs: `T2c_H` vs `T2c_He`; `T2d_H` vs `T2d_He`. CSV: `tables/c1_same_mode_h_vs_he_by_topology.csv`.
Figures: `fig01_c1_h_vs_he_same_mode.png`, `fig02_c1_delta_he_minus_h.png`.

| topology | T2c H | T2c He | Δ He−H | T2d H | T2d He | Δ He−H |
| --- | --- | --- | --- | --- | --- | --- |
| linear_chain | 0.9129 | 0.8638 | -0.0491 | 1.6127 | 2.0852 | 0.4725 |
| ring | 0.9160 | 0.8760 | -0.0400 | 1.6402 | 2.1768 | 0.5366 |
| random_er | 0.8736 | 0.6593 | -0.2143 | 1.7809 | 2.0412 | 0.2602 |
| small_world | 0.7215 | 0.7545 | 0.0330 | 1.5977 | 1.9096 | 0.3120 |
| scale_free | 0.9205 | 0.8157 | -0.1048 | 1.6991 | 1.9924 | 0.2933 |
| echo_chamber | 0.8490 | 1.3775 | 0.5284 | 1.7984 | 1.9632 | 0.1647 |
| polarized | 0.8356 | 1.4137 | 0.5780 | 1.7015 | 1.8830 | 0.1815 |
| hierarchical | 0.8751 | 1.5242 | 0.6490 | 1.6315 | 2.5934 | 0.9618 |

**1.1** Cell-pooled same-mode Δ(He−H): continuous **0.1549** (H 0.8643 vs He 1.0192); dual-discrete **0.3990** (H 1.6810 vs He 2.0800). Collapsed He is higher on both instruments.
**1.2** Topology-mean Δ(He−H) averaged over 8 topologies: T2c **0.1725**; T2d **0.3978**. He>H on **4/8** topologies (continuous) and **8/8** (dual-discrete). Continuous He>H is **not uniform**: He higher on small_world, echo_chamber, polarized, hierarchical; H higher on linear_chain, ring, random_er, scale_free. Dual-discrete He>H on every topology. Exploratory Wilcoxon median Δ on T2c is near 0 because the four negative path-graph deltas cancel the four large echo/polar/hier positives — cell-pooled and topo-equal means stay positive because the positive gaps are larger.
**1.3** That is **not** “hetero buffers firestorms.” Collapsed H mixes conspiracy BPs with scientists; collapsed He mixes conspiracy-heavy `mix_00`/`mix_01` with conspiracy-free `mix_02`. See §5.
**1.4** Exploratory Wilcoxon on 8 topology means: T2c W=14, p=0.6406, median Δ=-0.0035, n=8 (n+=4, n-=4); T2d W=0, p=0.007812, median Δ=0.3026, n=8 (n+=8, n-=0). N=1 seed.
**1.5** Dead He cells are hatched (`nScored≤1` after LLM), not evidence that mix immunises.

## 2. Same topology, homo vs homo, DIFFERENT MPR (`T2c_H` vs `T2d_H`)

CSV: `tables/c2_homo_t2c_vs_t2d_by_topology.csv`, paired live cells `c2_homo_t2c_vs_t2d_paired_live_cells.csv`.

| topology | T2c H cont | T2d H disc | Δ disc−cont | n live T2c | n live T2d | dual gap |
| --- | --- | --- | --- | --- | --- | --- |
| linear_chain | 0.9129 | 1.6127 | 0.6999 | 62 | 68 | 0.9672 |
| ring | 0.9160 | 1.6402 | 0.7242 | 65 | 61 | 0.8803 |
| random_er | 0.8736 | 1.7809 | 0.9073 | 57 | 56 | 0.9680 |
| small_world | 0.7215 | 1.5977 | 0.8762 | 56 | 59 | 0.8255 |
| scale_free | 0.9205 | 1.6991 | 0.7786 | 60 | 57 | 0.8420 |
| echo_chamber | 0.8490 | 1.7984 | 0.9494 | 63 | 61 | 0.8923 |
| polarized | 0.8356 | 1.7015 | 0.8659 | 65 | 57 | 0.8556 |
| hierarchical | 0.8751 | 1.6315 | 0.7564 | 52 | 59 | 0.7973 |

**2.1** Dual-discrete sits above continuous on **8/8** H topologies. Mean topology Δ(disc−cont) = **0.8197**.
**2.2** This is a **scoring-mode / instrument** difference, not evidence that the dual campaign “found more misinformation” in a shared unit. Dual ≠ continuous. Do not average the two headlines.
**2.3** Paired live cells (same topology × persona × article, both live): n=398; median Δ(T2d−T2c)=0.8125. Dead on one side only: T2c 80, T2d 82; both dead 16. Dead cells were not filled with 0.
**2.4** Dual gap on H live cells (discrete − sidecar continuous on the **same** dual events) = **0.8799**. That sidecar is not the T2c headline. Dual gap is not a third MPR.
**2.5** Exploratory Wilcoxon (8 topo means): W=0, p=0.007812, median Δ=0.8222, n=8 (n+=8, n-=0). Spearman rank of topology means: ρ=-0.048, p=0.9108, n=8.

## 3. Same topology, hetero vs hetero, DIFFERENT MPR (`T2c_He` vs `T2d_He`)

CSV: `tables/c3_hetero_t2c_vs_t2d_by_topology.csv`.

| topology | T2c He cont | T2d He disc | Δ disc−cont | n live T2c | n live T2d | dual gap |
| --- | --- | --- | --- | --- | --- | --- |
| linear_chain | 0.8638 | 2.0852 | 1.2214 | 32 | 33 | 1.2960 |
| ring | 0.8760 | 2.1768 | 1.3008 | 33 | 33 | 1.3123 |
| random_er | 0.6593 | 2.0412 | 1.3818 | 29 | 29 | 1.1335 |
| small_world | 0.7545 | 1.9096 | 1.1552 | 31 | 32 | 1.1049 |
| scale_free | 0.8157 | 1.9924 | 1.1767 | 30 | 29 | 1.1058 |
| echo_chamber | 1.3775 | 1.9632 | 0.5857 | 32 | 30 | 0.8830 |
| polarized | 1.4137 | 1.8830 | 0.4693 | 25 | 26 | 0.8784 |
| hierarchical | 1.5242 | 2.5934 | 1.0692 | 26 | 28 | 1.1354 |

**3.1** Dual-discrete sits above continuous on **8/8** He topologies. Mean topology Δ(disc−cont) = **1.0450**.
**3.2** Paired live He cells n=198; median Δ=0.9778. Same-instrument warning as §2: do not pool T2c and T2d.
**3.3** Dual gap He live = **1.1145**; agreement = **0.6174**. IFD CR/MR/IR are not in the live tables.
**3.4** Exploratory Wilcoxon (8 topo means): W=0, p=0.007812, median Δ=1.1659, n=8 (n+=8, n-=0). Spearman: ρ=0.167, p=0.6932, n=8.

## 4. Cross-mode: homo vs hetero AND different MPR

Pairs: `T2c_H` vs `T2d_He`; `T2d_H` vs `T2c_He`. **Separate labelled table. Not a pooled mean. Not a third MPR.**
CSV: `tables/c4_cross_mode_by_topology.csv`. Figure: `fig05_c4_cross_mode.png`.

| topology | T2c_H | T2d_He | Δ T2d_He−T2c_H | T2d_H | T2c_He | Δ T2c_He−T2d_H |
| --- | --- | --- | --- | --- | --- | --- |
| linear_chain | 0.9129 | 2.0852 | 1.1724 | 1.6127 | 0.8638 | -0.7489 |
| ring | 0.9160 | 2.1768 | 1.2608 | 1.6402 | 0.8760 | -0.7642 |
| random_er | 0.8736 | 2.0412 | 1.1675 | 1.7809 | 0.6593 | -1.1216 |
| small_world | 0.7215 | 1.9096 | 1.1881 | 1.5977 | 0.7545 | -0.8432 |
| scale_free | 0.9205 | 1.9924 | 1.0719 | 1.6991 | 0.8157 | -0.8834 |
| echo_chamber | 0.8490 | 1.9632 | 1.1141 | 1.7984 | 1.3775 | -0.4209 |
| polarized | 0.8356 | 1.8830 | 1.0474 | 1.7015 | 1.4137 | -0.2878 |
| hierarchical | 0.8751 | 2.5934 | 1.7182 | 1.6315 | 1.5242 | -0.1074 |

**4.1** Mean topology Δ(T2d_He − T2c_H) = **1.2176**. This mixes a higher-scoring instrument (dual-discrete) with the He composition mix. Do not read it as an identity effect.
**4.2** Mean topology Δ(T2c_He − T2d_H) = **-0.6472**. Signs can reverse because the scoring-mode gap is large. That reversal is why C4 must stay unpooled.
**4.3** No C4 headline is formed by averaging the two cross-mode deltas or by averaging discrete with continuous.

## 5. Pooled cells (concatenation) and D-net 63-node graph

Pooling = concatenate live article-cells across the eight 8-node topologies. **This is not a physical super-graph.** D-net is a separate 63-node custom graph.
CSV: `tables/c5_pooled_cells.csv`, `c5_pooled_vs_topology_equal.csv`, `c5_dnet_cells.csv`.

| pool | n live | meanMI | meanNodeMPR | k* rate |
| --- | --- | --- | --- | --- |
| T2c_H_all_topologies | 480 | 0.8643 | 0.8630 | 14.2% |
| T2c_He_all_topologies | 238 | 1.0192 | 1.0140 | 7.6% |
| T2d_H_all_topologies | 478 | 1.6810 | 1.6835 | 20.1% |
| T2d_He_all_topologies | 240 | 2.0800 | 2.0737 | 32.1% |
| T2c_H_conspiracy_family | 168 | 2.2194 | 2.2145 | 40.5% |
| T2c_H_science_env_family | 195 | 0.1118 | 0.1130 | 0.0% |
| T2c_H_climate_action_family | 117 | 0.1729 | 0.1724 | 0.0% |
| T2d_H_conspiracy_family | 159 | 3.1691 | 3.1799 | 59.7% |
| T2d_H_science_env_family | 193 | 0.8677 | 0.8650 | 0.0% |
| T2d_H_climate_action_family | 126 | 1.0488 | 1.0489 | 0.8% |
| T2c_He_conspiracy_heavy_mix00_01 | 80 | 1.6204 | 1.5921 | 11.2% |
| T2c_He_conspiracy_free_mix02 | 41 | 0.2645 | 0.2648 | 0.0% |
| T2d_He_conspiracy_heavy_mix00_01 | 81 | 2.9536 | 2.9500 | 58.0% |
| T2d_He_conspiracy_free_mix02 | 41 | 1.1882 | 1.2043 | 0.0% |

| contrast | cell-pooled H | cell-pooled He | Δ He−H | topo-equal H | topo-equal He | Δ He−H |
| --- | --- | --- | --- | --- | --- | --- |
| T2c H vs He | 0.8643 | 1.0192 | 0.1549 | 0.8630 | 1.0356 | 0.1725 |
| T2d H vs He | 1.6810 | 2.0800 | 0.3990 | 1.6828 | 2.0806 | 0.3978 |

**5.1 H vs He on the pooled cell set.** Same pattern as C1: He > H on both instruments (continuous Δ=0.1549; dual-discrete Δ=0.3990). Topology-equal weighting does not flip the sign (see table). Exploratory MW: T2c U=4.47e+04, p=1.314e-06, median_a=0.0413, median_b=0.5000, n=480/238; T2d U=4.56e+04, p=6.955e-06, median_a=1.1340, median_b=1.7500, n=478/240.
**5.2 Conspiracy-composition still holds on the pooled H cells.** T2c family meanMI: conspiracy **2.2194**, climate_action **0.1729**, science_env **0.1118**. T2d: conspiracy **3.1691**, climate_action **1.0488**, science_env **0.8677**. Conspiracy remains the high group on both instruments.
**5.3 Mix composition still holds on pooled He cells.** mix_00 (4 conspiracy) T2c **1.7712** vs mix_02 (0 conspiracy) **0.2645**; T2d mix_00 **3.1321** vs mix_02 **1.1882**. mix_02 is lower on both instruments in these N=1 runs — not a law that “diversity always stops firestorms.”
**5.4** Collapsed He>H is therefore **compatible** with conspiracy composition: the H mean is pulled down by scientist personas; the He mean is pulled up by conspiracy-heavy mixes. Restricting H to conspiracy family reverses the naive H/He story (conspiracy H >> overall He).

### D-net (63-node custom graph) — not pooled into the eight topologies

Auditor MI on the reconstructed hashtag graph. **Not empirical Twitter MPR.**

| run | article | mode | discrete MPR | continuous MPR | dual sidecar cont (not headline) | k* |
| --- | --- | --- | --- | --- | --- | --- |
| Dnet_c_H_conspiracy | scopex_2017 | continuous | — | 1.7349 | — | none |
| Dnet_c_H_conspiracy | chemtrails_gates_2018_2021 | continuous | — | 3.3378 | — | yes |
| Dnet_c_He_mixed | scopex_2017 | continuous | — | 0.9983 | — | none |
| Dnet_c_He_mixed | chemtrails_gates_2018_2021 | continuous | — | 2.5068 | — | none |
| Dnet_d_H_conspiracy | scopex_2017 | dual-discrete | 4.2537 | — | 2.2495 | yes |
| Dnet_d_H_conspiracy | chemtrails_gates_2018_2021 | dual-discrete | 3.7303 | — | 3.1251 | yes |
| Dnet_d_He_mixed | scopex_2017 | dual-discrete | 2.6880 | — | 1.1302 | yes |
| Dnet_d_He_mixed | chemtrails_gates_2018_2021 | dual-discrete | 1.5297 | — | 1.1497 | none |

**5.5 D-net H vs He (conspiracy-homogeneous vs mixed), continuous:** SCoPEx H 1.7349 vs He 0.9983; chemtrails H 3.3378 vs He 2.5068. Dual-discrete: SCoPEx H 4.2537 vs He 2.6880; chemtrails H 3.7303 vs He 1.5297.
**5.6** On D-net, **H (conspiracy) > He (mixed)** on both instruments and both seeds. That matches composition (D-net H is conspiracy-only) and **does not match** the naive 8-topology collapsed He>H, which mixed scientists into H. Composition holds; the H/He label does not travel unchanged onto the 63-node graph.
- Debnath has NO empirical MPR. Do not claim simulated MI equals Twitter MI.
- Hashtag co-occurrence is a structural/hashtag fallback, not a hydrated retweet cascade.
- 814k tweet IDs were not hydrated; BPs are theory-faithful reductions, not HDBSCAN centroids.
- 8 hops/ticks is logged cost compression vs CIKM 30, not a Debnath hop protocol.
- Pfeffer et al. (2014) lists seven interrelated factors. The thesis six-knob list is a remapping, not a restatement of that paper.
- Cross-media dynamics has no engine knob and is held.
- Structural similarity (compare json, not MI): 0.6885; DTFS=0.2754 isValidated=False.

## Paper-style metric notes

| persona | family | discrete MPR | continuous MPR | k* dual | k* cont |
| --- | --- | --- | --- | --- | --- |
| conspiracy_believer | conspiracy | 3.3522 | 2.4842 | 65.8% | 47.7% |
| conspiracy_haarp_weather | conspiracy | 3.3571 | 2.4829 | 70.5% | 47.5% |
| conspiracy_depopulation | conspiracy | 3.2823 | 1.9535 | 59.5% | 34.9% |
| conspiracy_climate_piggyback | conspiracy | 2.6838 | 1.9570 | 42.5% | 31.7% |
| climate_action_advocate | climate_action | 1.0665 | 0.2258 | 0.0% | 0.0% |
| climate_justice_youth | climate_action | 1.3072 | 0.2454 | 2.2% | 0.0% |
| mitigation_first_policy | climate_action | 0.7571 | 0.0464 | 0.0% | 0.0% |
| environmental_concern | science_env | 0.8359 | 0.1423 | 0.0% | 0.0% |
| biodiversity_food_security | science_env | 1.1404 | 0.2115 | 0.0% | 0.0% |
| ozone_stratosphere_specialist | science_env | 0.9654 | 0.1627 | 0.0% | 0.0% |
| science_journalist | science_env | 0.6745 | 0.0310 | 0.0% | 0.0% |
| climate_scientist | science_env | 0.7517 | 0.0130 | 0.0% | 0.0% |

| mix | composition | discrete MPR | continuous MPR | k* dual | k* cont |
| --- | --- | --- | --- | --- | --- |
| mix_00 | 4 conspiracy + 4 climate/env | 3.1321 | 1.7712 | 57.5% | 12.8% |
| mix_01 | 2 conspiracy + 6 climate/env | 2.7795 | 1.4770 | 58.5% | 9.8% |
| mix_02 | 0 conspiracy + 8 science/climate | 1.1882 | 0.2645 | 0.0% | 0.0% |
| mix_03 | 1 conspiracy + 7 other | 2.0410 | 0.8945 | 33.3% | 10.3% |
| mix_04 | 2 conspiracy-adj + 6 other | 1.6896 | 0.7021 | 20.5% | 5.3% |
| mix_05 | 2 conspiracy-adj + 6 other | 1.6713 | 1.0134 | 23.3% | 7.5% |

**P.1** Heatmaps use live-cell means; all-dead persona×article (or mix×article) cells are **—**, not 0.00.
**P.2** k* heatmaps use grey **—** when the network never stayed above MI>3; that is not k*=0.
**P.3** Dual agreement (IFD-adjacent) H=0.6490, He=0.6174. Hop-wise MI, CR, MR, IR are **not in live tables** and were not invented.

## Limitations (required)

- N=1 (`graphRandomSeed` 42). No error bars on heatmap cells.
- 8 hops is logged cost compression vs CIKM 30, not a Debnath hop protocol.
- 292 hatched-dead cells kept; live-only means drop them.
- `thesisGrade` is false on the harvest.
- gpt-4o-mini roleplay is not chemtrails communities in the wild.
- D-net is a hashtag co-occurrence fallback, not a hydrated retweet cascade.
