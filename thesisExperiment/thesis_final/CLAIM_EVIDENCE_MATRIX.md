# Claim--evidence matrix

| Claim | Evidence | Boundary |
|---|---|---|
| The canonical campaign contains 288 configurations and 1,728 cells. | `results_phase2/summary.json`; `configs/grid_phase2.json` | Excludes D-net and probes. |
| The canonical harvest retains 292 hatched-dead cells. | `results_phase2/summary.json`; `results_phase2/tables/dead_cells.csv` | Dead means `nScored <= 1`; it is not MI zero. |
| The campaign used `gpt-4o-mini`, eight hops, and N=1. | `configs/grid_phase2.json`; raw metadata; `AGENT_HANDOFF.md` | Eight hops are a cost cut, not empirical time. |
| Continuous H/He means are 0.8643/1.0192. | `analysis_full/COMPARISONS.md`, C1 | Live cells only; same instrument. |
| Dual-discrete H/He means are 1.6814/2.0800. | `analysis_full/COMPARISONS.md`, C1 | Live cells only; not pooled with continuous. |
| Dual-discrete exceeds continuous on 8/8 topology aggregates in both arms. | `analysis_full/COMPARISONS.md`, C2--C3 | Instrument effect; no criterion-validity claim. |
| Conspiracy-family H exceeds science/environment H under both instruments. | `analysis_full/tables/persona_family_mpr.csv` | Prompt-conditioned agents, not human groups. |
| `mix_00` exceeds `mix_02` under both instruments. | `analysis_full/tables/mix_mpr.csv` | N=1; not a universal diversity law. |
| Continuous He--H changes sign by topology. | `analysis_full/tables/c1_same_mode_h_vs_he_by_topology.csv` | Descriptive one-seed comparison. |
| C5 pooling is a table union. | `analysis_full/COMPARISONS.md`, C5; analysis code | It is not a physical supergraph. |
| D-net is a separate 63-node, 228-edge custom graph. | `data/derived/debnath_hashtag_cascade.json` | Hashtag co-occurrence, not a retweet cascade. |
| D-net H exceeds He on both articles and instruments. | `analysis_full/tables/c5_dnet_cells.csv` | Simulated auditor MI only. |
| Exact mixed D-net persona IDs match 56/63 seats. | `analysis_full/PFEFFER_DEBNATH_VS_SIM.md` | Seven remaining seats preserve coarse type only. |
| D-net breadth matches the 30% band; depth and virality do not. | `results_phase2/debnath_compare.json` | One empirical object. |
| DTFS is 0.2754 and validation is false. | `results_phase2/debnath_compare.json` | No digital-twin claim. |
| Pfeffer et al. list seven Outlook factors. | `analysis_phase2/PFEFFER_FIRESTORM.md`; DOI 10.1080/13527266.2013.797778 | Six knobs are a thesis remapping. |
| Cross-media and empirical temporal evidence are unavailable. | `analysis_full/PFEFFER_DEBNATH_VS_SIM.md` | Hierarchy does not substitute for cross-media. |
| Debnath provides no empirical 0--5 MPR. | `analysis_phase2/HYDRATION.md`; Debnath article | Simulated MI is not Twitter MPR. |
| Hydration was impossible in this campaign. | `analysis_phase2/HYDRATION.md` | No IDs, tweets, or users were invented. |
| Human evaluation is absent. | Raw templates and `chapters/07_validity_ethics.tex` | Templates are not participant data. |
| MI/MPR and the auditor--node framework are prior co-authored work. | Maurya et al. (2025), arXiv:2511.10384 | Thesis contribution starts at the climate layer. |
