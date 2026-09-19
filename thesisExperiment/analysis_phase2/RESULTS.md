# Phase 2 RESULTS — persona, topology, discrete MPR, continuous MPR

Source: LIVE `thesisExperiment/results_phase2/tables/` (not Phase 1).
Cell headline = `meanMI` from `parse_phase2.js` on live cells (`nScored > 1`).
**Discrete MPR** = dual-run headline (`dual_discrete.csv`, T2d_*).
**Continuous MPR** = continuous-only headline (`continuous.csv`, T2c_*).
These two columns are **not** the same quantity and are **not** averaged.
Dual-gap sidecar continuous is omitted here (not a ground-truth MPR).
Dead cells are excluded from the mean; `n_live` is the count in the mean.
N=1 per config. `thesisGrade=false`. 8 hops, not CIKM 30.

## Homogeneous (H) — persona × topology

| persona | topology | n_live disc | discrete MPR | n_live cont | continuous MPR |
| --- | --- | --- | --- | --- | --- |
| conspiracy_believer | linear_chain | 5 | 2.6250 | 6 | 2.3854 |
| conspiracy_believer | ring | 3 | 3.5417 | 6 | 2.4271 |
| conspiracy_believer | random_er | 4 | 3.8700 | 4 | 2.7708 |
| conspiracy_believer | small_world | 6 | 3.3879 | 5 | 2.0733 |
| conspiracy_believer | scale_free | 4 | 3.3536 | 6 | 2.3271 |
| conspiracy_believer | echo_chamber | 5 | 3.4566 | 6 | 2.5512 |
| conspiracy_believer | polarized | 5 | 3.6333 | 5 | 2.5218 |
| conspiracy_believer | hierarchical | 6 | 3.1601 | 6 | 2.8503 |
| conspiracy_haarp_weather | linear_chain | 6 | 3.3958 | 6 | 2.6583 |
| conspiracy_haarp_weather | ring | 5 | 3.2250 | 5 | 2.7250 |
| conspiracy_haarp_weather | random_er | 5 | 3.4386 | 3 | 2.1889 |
| conspiracy_haarp_weather | small_world | 6 | 2.9283 | 6 | 2.3736 |
| conspiracy_haarp_weather | scale_free | 5 | 3.6156 | 5 | 2.8322 |
| conspiracy_haarp_weather | echo_chamber | 6 | 3.3221 | 5 | 2.2670 |
| conspiracy_haarp_weather | polarized | 5 | 4.1406 | 6 | 2.6056 |
| conspiracy_haarp_weather | hierarchical | 6 | 2.9557 | 4 | 1.9508 |
| conspiracy_depopulation | linear_chain | 4 | 3.0714 | 6 | 2.0729 |
| conspiracy_depopulation | ring | 5 | 3.4250 | 5 | 1.7225 |
| conspiracy_depopulation | random_er | 5 | 3.4277 | 6 | 2.1399 |
| conspiracy_depopulation | small_world | 4 | 2.7213 | 4 | 1.0985 |
| conspiracy_depopulation | scale_free | 5 | 3.0596 | 5 | 1.8261 |
| conspiracy_depopulation | echo_chamber | 6 | 3.3071 | 6 | 2.0005 |
| conspiracy_depopulation | polarized | 5 | 3.1543 | 6 | 2.5729 |
| conspiracy_depopulation | hierarchical | 3 | 4.3661 | 5 | 1.8289 |
| conspiracy_climate_piggyback | linear_chain | 5 | 2.9643 | 5 | 1.2758 |
| conspiracy_climate_piggyback | ring | 5 | 2.6250 | 6 | 2.3542 |
| conspiracy_climate_piggyback | random_er | 4 | 2.9865 | 6 | 2.1927 |
| conspiracy_climate_piggyback | small_world | 5 | 2.8254 | 4 | 1.8379 |
| conspiracy_climate_piggyback | scale_free | 6 | 2.2371 | 5 | 2.0031 |
| conspiracy_climate_piggyback | echo_chamber | 6 | 2.5014 | 6 | 2.0541 |
| conspiracy_climate_piggyback | polarized | 4 | 2.9167 | 4 | 2.0979 |
| conspiracy_climate_piggyback | hierarchical | 5 | 2.6471 | 5 | 1.6984 |
| climate_action_advocate | linear_chain | 6 | 1.1667 | 6 | 0.1562 |
| climate_action_advocate | ring | 4 | 1.5000 | 6 | 0.2812 |
| climate_action_advocate | random_er | 4 | 1.1075 | 5 | 0.3317 |
| climate_action_advocate | small_world | 5 | 0.9314 | 4 | 0.2591 |
| climate_action_advocate | scale_free | 6 | 0.9703 | 5 | 0.3237 |
| climate_action_advocate | echo_chamber | 5 | 1.1902 | 3 | 0.0278 |
| climate_action_advocate | polarized | 3 | 0.7917 | 5 | 0.0000 |
| climate_action_advocate | hierarchical | 4 | 0.8068 | 3 | 0.4444 |
| climate_justice_youth | linear_chain | 6 | 1.3750 | 5 | 0.5375 |
| climate_justice_youth | ring | 6 | 1.3750 | 5 | 0.2500 |
| climate_justice_youth | random_er | 6 | 1.3230 | 5 | 0.2750 |
| climate_justice_youth | small_world | 6 | 1.1097 | 6 | 0.3125 |
| climate_justice_youth | scale_free | 6 | 1.3865 | 4 | 0.3353 |
| climate_justice_youth | echo_chamber | 6 | 1.4913 | 6 | 0.0398 |
| climate_justice_youth | polarized | 4 | 1.1042 | 6 | 0.0069 |
| climate_justice_youth | hierarchical | 6 | 1.2256 | 4 | 0.3125 |
| mitigation_first_policy | linear_chain | 6 | 1.0278 | 4 | 0.1250 |
| mitigation_first_policy | ring | 6 | 0.9167 | 5 | 0.1000 |
| mitigation_first_policy | random_er | 6 | 0.7543 | 5 | 0.0459 |
| mitigation_first_policy | small_world | 5 | 0.8420 | 6 | 0.0083 |
| mitigation_first_policy | scale_free | 6 | 0.5522 | 4 | 0.0321 |
| mitigation_first_policy | echo_chamber | 5 | 0.5200 | 6 | 0.0106 |
| mitigation_first_policy | polarized | 5 | 0.7059 | 6 | 0.0008 |
| mitigation_first_policy | hierarchical | 4 | 0.6772 | 3 | 0.1111 |
| environmental_concern | linear_chain | 6 | 1.0833 | 5 | 0.2286 |
| environmental_concern | ring | 6 | 0.7500 | 6 | 0.2812 |
| environmental_concern | random_er | 4 | 0.9301 | 4 | 0.3424 |
| environmental_concern | small_world | 1 | 1.8000 | 3 | 0.0079 |
| environmental_concern | scale_free | 3 | 0.8333 | 5 | 0.2636 |
| environmental_concern | echo_chamber | 5 | 0.8779 | 6 | 0.0041 |
| environmental_concern | polarized | 6 | 0.4849 | 6 | 0.0212 |
| environmental_concern | hierarchical | 6 | 0.7681 | 5 | 0.0000 |
| biodiversity_food_security | linear_chain | 6 | 1.1805 | 5 | 0.3000 |
| biodiversity_food_security | ring | 5 | 1.2857 | 5 | 0.3358 |
| biodiversity_food_security | random_er | 4 | 1.3274 | 6 | 0.2187 |
| biodiversity_food_security | small_world | 5 | 0.8745 | 3 | 0.0625 |
| biodiversity_food_security | scale_free | 6 | 1.1908 | 5 | 0.2657 |
| biodiversity_food_security | echo_chamber | 4 | 1.4069 | 5 | 0.2771 |
| biodiversity_food_security | polarized | 2 | 1.0000 | 5 | 0.1710 |
| biodiversity_food_security | hierarchical | 5 | 0.8949 | 5 | 0.0000 |
| ozone_stratosphere_specialist | linear_chain | 6 | 0.9683 | 6 | 0.1250 |
| ozone_stratosphere_specialist | ring | 5 | 0.8500 | 5 | 0.2250 |
| ozone_stratosphere_specialist | random_er | 3 | 1.2230 | 3 | 0.0000 |
| ozone_stratosphere_specialist | small_world | 5 | 0.8867 | 5 | 0.1667 |
| ozone_stratosphere_specialist | scale_free | 3 | 1.0071 | 5 | 0.3667 |
| ozone_stratosphere_specialist | echo_chamber | 4 | 0.9178 | 5 | 0.1174 |
| ozone_stratosphere_specialist | polarized | 6 | 1.0550 | 6 | 0.1756 |
| ozone_stratosphere_specialist | hierarchical | 5 | 0.8960 | 3 | 0.0000 |
| science_journalist | linear_chain | 6 | 0.6250 | 3 | 0.0000 |
| science_journalist | ring | 6 | 0.7708 | 5 | 0.1125 |
| science_journalist | random_er | 5 | 0.6729 | 5 | 0.0099 |
| science_journalist | small_world | 5 | 0.4156 | 4 | 0.0049 |
| science_journalist | scale_free | 3 | 0.8322 | 5 | 0.0517 |
| science_journalist | echo_chamber | 4 | 0.7544 | 4 | 0.0221 |
| science_journalist | polarized | 6 | 0.7464 | 5 | 0.0238 |
| science_journalist | hierarchical | 4 | 0.6240 | 6 | 0.0081 |
| climate_scientist | linear_chain | 6 | 0.7500 | 5 | 0.0000 |
| climate_scientist | ring | 5 | 0.7000 | 6 | 0.0208 |
| climate_scientist | random_er | 6 | 0.8359 | 5 | 0.0316 |
| climate_scientist | small_world | 6 | 0.5240 | 6 | 0.0039 |
| climate_scientist | scale_free | 4 | 1.0659 | 6 | 0.0224 |
| climate_scientist | echo_chamber | 5 | 0.6865 | 5 | 0.0095 |
| climate_scientist | polarized | 6 | 0.7639 | 5 | 0.0089 |
| climate_scientist | hierarchical | 5 | 0.7767 | 3 | 0.0000 |

## Homogeneous (H) — persona collapsed across topologies

| persona | family | n_live disc | discrete MPR | n_live cont | continuous MPR |
| --- | --- | --- | --- | --- | --- |
| conspiracy_believer | conspiracy | 38 | 3.3522 | 44 | 2.4842 |
| conspiracy_haarp_weather | conspiracy | 44 | 3.3571 | 40 | 2.4829 |
| conspiracy_depopulation | conspiracy | 37 | 3.2823 | 43 | 1.9535 |
| conspiracy_climate_piggyback | conspiracy | 40 | 2.6838 | 41 | 1.9570 |
| climate_action_advocate | climate_action | 37 | 1.0665 | 37 | 0.2258 |
| climate_justice_youth | climate_action | 46 | 1.3072 | 41 | 0.2454 |
| mitigation_first_policy | climate_action | 43 | 0.7571 | 39 | 0.0464 |
| environmental_concern | science_env | 37 | 0.8359 | 40 | 0.1423 |
| biodiversity_food_security | science_env | 37 | 1.1470 | 39 | 0.2115 |
| ozone_stratosphere_specialist | science_env | 37 | 0.9639 | 38 | 0.1627 |
| science_journalist | science_env | 39 | 0.6745 | 37 | 0.0310 |
| climate_scientist | science_env | 43 | 0.7517 | 41 | 0.0130 |

## Heterogeneous (He) — mix × topology

| mix | note | topology | n_live disc | discrete MPR | n_live cont | continuous MPR |
| --- | --- | --- | --- | --- | --- | --- |
| mix_00 | 4 conspiracy + 4 climate/env | linear_chain | 5 | 2.8633 | 6 | 1.5243 |
| mix_00 | 4 conspiracy + 4 climate/env | ring | 5 | 3.1250 | 6 | 1.8055 |
| mix_00 | 4 conspiracy + 4 climate/env | random_er | 5 | 2.9956 | 5 | 1.3197 |
| mix_00 | 4 conspiracy + 4 climate/env | small_world | 6 | 2.9407 | 4 | 1.5142 |
| mix_00 | 4 conspiracy + 4 climate/env | scale_free | 4 | 2.9736 | 5 | 1.6055 |
| mix_00 | 4 conspiracy + 4 climate/env | echo_chamber | 5 | 3.7500 | 5 | 2.3229 |
| mix_00 | 4 conspiracy + 4 climate/env | polarized | 5 | 3.2903 | 3 | 1.2257 |
| mix_00 | 4 conspiracy + 4 climate/env | hierarchical | 5 | 3.1250 | 5 | 2.6246 |
| mix_01 | 2 conspiracy + 6 climate/env | linear_chain | 6 | 2.6944 | 6 | 1.3576 |
| mix_01 | 2 conspiracy + 6 climate/env | ring | 6 | 2.7917 | 6 | 1.5000 |
| mix_01 | 2 conspiracy + 6 climate/env | random_er | 6 | 2.6452 | 5 | 0.9073 |
| mix_01 | 2 conspiracy + 6 climate/env | small_world | 6 | 2.5512 | 4 | 1.1278 |
| mix_01 | 2 conspiracy + 6 climate/env | scale_free | 5 | 2.9466 | 5 | 1.3572 |
| mix_01 | 2 conspiracy + 6 climate/env | echo_chamber | 4 | 2.9667 | 5 | 2.4977 |
| mix_01 | 2 conspiracy + 6 climate/env | polarized | 4 | 2.8786 | 5 | 1.1964 |
| mix_01 | 2 conspiracy + 6 climate/env | hierarchical | 4 | 2.9375 | 5 | 1.8217 |
| mix_02 | 0 conspiracy + 8 science/climate | linear_chain | 6 | 1.6042 | 6 | 0.2521 |
| mix_02 | 0 conspiracy + 8 science/climate | ring | 6 | 1.1500 | 5 | 0.4375 |
| mix_02 | 0 conspiracy + 8 science/climate | random_er | 5 | 1.1768 | 6 | 0.2402 |
| mix_02 | 0 conspiracy + 8 science/climate | small_world | 6 | 1.3410 | 6 | 0.2652 |
| mix_02 | 0 conspiracy + 8 science/climate | scale_free | 5 | 1.2548 | 6 | 0.1973 |
| mix_02 | 0 conspiracy + 8 science/climate | echo_chamber | 5 | 1.1178 | 5 | 0.1970 |
| mix_02 | 0 conspiracy + 8 science/climate | polarized | 3 | 0.1111 | 4 | 0.2012 |
| mix_02 | 0 conspiracy + 8 science/climate | hierarchical | 5 | 1.2129 | 3 | 0.3800 |
| mix_03 | 1 conspiracy + 7 other | linear_chain | 5 | 1.5750 | 4 | 0.3969 |
| mix_03 | 1 conspiracy + 7 other | ring | 6 | 1.3542 | 6 | 0.1042 |
| mix_03 | 1 conspiracy + 7 other | random_er | 3 | 1.3767 | 6 | 0.4537 |
| mix_03 | 1 conspiracy + 7 other | small_world | 4 | 1.3102 | 5 | 0.4914 |
| mix_03 | 1 conspiracy + 7 other | scale_free | 4 | 1.0537 | 3 | 0.4298 |
| mix_03 | 1 conspiracy + 7 other | echo_chamber | 6 | 2.9349 | 6 | 2.4195 |
| mix_03 | 1 conspiracy + 7 other | polarized | 4 | 2.9318 | 5 | 1.6372 |
| mix_03 | 1 conspiracy + 7 other | hierarchical | 4 | 3.6384 | 4 | 0.8750 |
| mix_04 | 2 conspiracy-adj + 6 other | linear_chain | 5 | 2.1550 | 5 | 0.7000 |
| mix_04 | 2 conspiracy-adj + 6 other | ring | 6 | 2.2708 | 5 | 0.5150 |
| mix_04 | 2 conspiracy-adj + 6 other | random_er | 5 | 1.6133 | 5 | 0.6849 |
| mix_04 | 2 conspiracy-adj + 6 other | small_world | 4 | 1.4792 | 6 | 0.7028 |
| mix_04 | 2 conspiracy-adj + 6 other | scale_free | 6 | 1.8277 | 5 | 0.5665 |
| mix_04 | 2 conspiracy-adj + 6 other | echo_chamber | 5 | 0.4492 | 5 | 0.2543 |
| mix_04 | 2 conspiracy-adj + 6 other | polarized | 4 | 0.9368 | 4 | 2.2151 |
| mix_04 | 2 conspiracy-adj + 6 other | hierarchical | 4 | 2.6375 | 3 | 0.0000 |
| mix_05 | 2 conspiracy-adj + 6 other | linear_chain | 6 | 1.6756 | 5 | 0.7500 |
| mix_05 | 2 conspiracy-adj + 6 other | ring | 4 | 2.7024 | 5 | 0.7375 |
| mix_05 | 2 conspiracy-adj + 6 other | random_er | 5 | 2.0528 | 2 | 0.1990 |
| mix_05 | 2 conspiracy-adj + 6 other | small_world | 6 | 1.4923 | 6 | 0.7593 |
| mix_05 | 2 conspiracy-adj + 6 other | scale_free | 5 | 1.9394 | 6 | 0.7254 |
| mix_05 | 2 conspiracy-adj + 6 other | echo_chamber | 5 | 0.5667 | 6 | 0.5338 |
| mix_05 | 2 conspiracy-adj + 6 other | polarized | 6 | 0.8641 | 4 | 1.9580 |
| mix_05 | 2 conspiracy-adj + 6 other | hierarchical | 6 | 2.3452 | 6 | 2.1262 |

## Heterogeneous (He) — mix collapsed across topologies

| mix | note | n_live disc | discrete MPR | n_live cont | continuous MPR |
| --- | --- | --- | --- | --- | --- |
| mix_00 | 4 conspiracy + 4 climate/env | 40 | 3.1321 | 39 | 1.7712 |
| mix_01 | 2 conspiracy + 6 climate/env | 41 | 2.7795 | 41 | 1.4770 |
| mix_02 | 0 conspiracy + 8 science/climate | 41 | 1.1882 | 41 | 0.2645 |
| mix_03 | 1 conspiracy + 7 other | 36 | 2.0410 | 39 | 0.8945 |
| mix_04 | 2 conspiracy-adj + 6 other | 39 | 1.6896 | 38 | 0.7021 |
| mix_05 | 2 conspiracy-adj + 6 other | 43 | 1.6713 | 40 | 1.0134 |

## Topology collapsed (H and He separate)

| topology | arm | discrete MPR | continuous MPR |
| --- | --- | --- | --- |
| linear_chain | H | 1.6127 | 0.9129 |
| linear_chain | He | 2.0852 | 0.8638 |
| ring | H | 1.6402 | 0.9160 |
| ring | He | 2.1768 | 0.8760 |
| random_er | H | 1.7809 | 0.8736 |
| random_er | He | 2.0412 | 0.6593 |
| small_world | H | 1.5977 | 0.7215 |
| small_world | He | 1.9096 | 0.7545 |
| scale_free | H | 1.7034 | 0.9205 |
| scale_free | He | 1.9924 | 0.8157 |
| echo_chamber | H | 1.7984 | 0.8490 |
| echo_chamber | He | 1.9632 | 1.3775 |
| polarized | H | 1.7005 | 0.8356 |
| polarized | He | 1.8830 | 1.4137 |
| hierarchical | H | 1.6315 | 0.8751 |
| hierarchical | He | 2.5934 | 1.5242 |

## D-net custom graph (not one of the eight topologies)

Auditor MPR on the reconstructed hashtag graph. **Not** empirical Twitter MPR.

| run | article | mode | discrete MPR | continuous MPR | dual sidecar continuous (not headline) |
| --- | --- | --- | --- | --- | --- |
| Dnet_c_H_conspiracy | scopex_2017 | continuous | — | 1.7349 | — |
| Dnet_c_H_conspiracy | chemtrails_gates_2018_2021 | continuous | — | 3.3378 | — |
| Dnet_c_He_mixed | scopex_2017 | continuous | — | 0.9983 | — |
| Dnet_c_He_mixed | chemtrails_gates_2018_2021 | continuous | — | 2.5068 | — |
| Dnet_d_H_conspiracy | scopex_2017 | dual-discrete | 4.2537 | — | 2.2495 |
| Dnet_d_H_conspiracy | chemtrails_gates_2018_2021 | dual-discrete | 3.7303 | — | 3.1251 |
| Dnet_d_He_mixed | scopex_2017 | dual-discrete | 2.6880 | — | 1.1302 |
| Dnet_d_He_mixed | chemtrails_gates_2018_2021 | dual-discrete | 1.5297 | — | 1.1497 |

Machine-readable copies: `analysis_phase2/tables/persona_topology_mpr.csv`, `mix_topology_mpr.csv`.
