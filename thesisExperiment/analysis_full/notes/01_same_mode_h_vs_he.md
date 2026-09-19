
Pairs: `T2c_H` vs `T2c_He`; `T2d_H` vs `T2d_He`. CSV: `tables/c1_same_mode_h_vs_he_by_topology.csv`.
Figures: `fig01_c1_h_vs_he_same_mode.png`, `fig02_c1_delta_he_minus_h.png`.

| topology | T2c H | T2c He | Δ He−H | T2d H | T2d He | Δ He−H |
| --- | --- | --- | --- | --- | --- | --- |
| linear_chain | 0.9129 | 0.8638 | -0.0491 | 1.6127 | 2.0852 | 0.4725 |
| ring | 0.9160 | 0.8760 | -0.0400 | 1.6402 | 2.1768 | 0.5366 |
| random_er | 0.8736 | 0.6593 | -0.2143 | 1.7809 | 2.0412 | 0.2602 |
| small_world | 0.7215 | 0.7545 | 0.0330 | 1.5977 | 1.9096 | 0.3120 |
| scale_free | 0.9205 | 0.8157 | -0.1048 | 1.7034 | 1.9924 | 0.2890 |
| echo_chamber | 0.8490 | 1.3775 | 0.5284 | 1.7984 | 1.9632 | 0.1647 |
| polarized | 0.8356 | 1.4137 | 0.5780 | 1.7005 | 1.8830 | 0.1825 |
| hierarchical | 0.8751 | 1.5242 | 0.6490 | 1.6315 | 2.5934 | 0.9618 |

**1.1** Cell-pooled same-mode Δ(He−H): continuous **0.1549** (H 0.8643 vs He 1.0192); dual-discrete **0.3986** (H 1.6814 vs He 2.0800). Collapsed He is higher on both instruments.
**1.2** Topology-mean Δ(He−H) averaged over 8 topologies: T2c **0.1725**; T2d **0.3974**. He>H on **4/8** topologies (continuous) and **8/8** (dual-discrete). Continuous He>H is **not uniform**: He higher on small_world, echo_chamber, polarized, hierarchical; H higher on linear_chain, ring, random_er, scale_free. Dual-discrete He>H on every topology. Exploratory Wilcoxon median Δ on T2c is near 0 because the four negative path-graph deltas cancel the four large echo/polar/hier positives — cell-pooled and topo-equal means stay positive because the positive gaps are larger.
**1.3** That is **not** “hetero buffers firestorms.” Collapsed H mixes conspiracy BPs with scientists; collapsed He mixes conspiracy-heavy `mix_00`/`mix_01` with conspiracy-free `mix_02`. See §5.
**1.4** Exploratory Wilcoxon on 8 topology means: T2c W=14, p=0.6406, median Δ=-0.0035, n=8 (n+=4, n-=4); T2d W=0, p=0.007812, median Δ=0.3005, n=8 (n+=8, n-=0). N=1 seed.
**1.5** Dead He cells are hatched (`nScored≤1` after LLM), not evidence that mix immunises.

