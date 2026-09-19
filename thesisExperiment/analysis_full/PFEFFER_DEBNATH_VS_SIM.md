# Pfeffer observables — Debnath hashtag graph vs D-net simulation

**Date.** 19 September 2026.  
**New LLM runs.** **None.** Mapping already exists in Dnet configs; all four cells (`Dnet_c_H`, `Dnet_c_He`, `Dnet_d_H`, `Dnet_d_He`) were already complete. Existing raw runs under `thesisExperiment/runs_phase2/` were scored only.  
**Graph.** Empirical object is hashtag co-occurrence `thesisExperiment/data/derived/debnath_hashtag_cascade.json` (**63 nodes, 228 directed edges**). It is **not** a hydratable retweet cascade. The comparable simulated graph is this **D-net 63-node custom topology**, not the 8-node T2 generators.

Pfeffer, Zorbach & Carley (2014) list **seven** Outlook factors. The thesis six knobs (valence / surprise / identity / clustering / echo / temporal) plus held **cross-media** are a **computational remapping**. Do not write “Pfeffer identified six factors.” Binary choice (Outlook #2) has no dedicated engine row: the engine is ternary (`forward` / `reinterpret` / `drop`).

Related: `thesisExperiment/results_phase2/pfeffer_observables.md`; `thesisExperiment/analysis_phase2/PFEFFER_FIRESTORM.md` (on branch `cursor/pfeffer-firestorm-extract-d727`, read for this note); `thesisExperiment/results_phase2/debnath_compare.json`. Machine-readable companion: `thesisExperiment/analysis_full/pfeffer_debnath_vs_sim.json`.

---

## Honesty (do not violate in later prose)

- Debnath has **no empirical MPR**. Simulated MI is auditor IFD. **Not Twitter MI.**
- Hashtag co-occurrence is **not** a retweet / `conversation_id` cascade. `retweets[]` is only an importer edge container.
- 814,924 tweet IDs were **not** hydrated. BPs are theory-faithful reductions, not HDBSCAN centroids.
- Empirical **temporal** series is **not available** (no tweet clock; placeholder timestamps are synthetic).
- **Cross-media** is held (no legacy-media / broadcast agent).
- 8 ticks / 8 hops is a logged cost cut vs CIKM K=30, **not** Debnath’s skip-gram window of eight words.
- `results_phase2/summary.md` averaged H+He into one sim echo row (`edgeHomophily=1`). That is a **homo artefact**. This note **splits** homogeneous vs mixed.

---

## 1. Mapping Debnath BPs onto the 63-node graph

Already in Dnet configs. No invented tweet MI. Reconstruct `user_profiles[].intended_debnath_bp` is the hashtag→BP rule; mixed Dnet `personaId` is the seat used at run time; homo Dnet overwrites **every** seat to `conspiracy_believer`.

### Type counts

| Layer | conspiracy | climate action | environmental | expert / other |
|---|---:|---:|---:|---:|
| Empirical hashtag **cluster identity** | 28 (chemtrails 26 + piggyback 2) | 19 (climate_action 16 + geo 3) | 14 | 2 expert |
| Reconstruct **intended BP family** | 28 | 19 (`climate_action_advocate` 18 + `mitigation_first_policy` 1; `#ipcc` already `climate_scientist`) | 13 remaining env BPs after mitigation | 3 (`climate_scientist`×2 + `science_journalist`) |
| Mixed Dnet **persona family** | 28 | 19 | 13 | 3 |
| Homo Dnet | 63 | 0 | 0 | 0 |

Conspiracy / climate-action / environmental-concern **types match nodes already in Dnet**. Exact **persona id** match reconstruct↔mixed: **56 / 63**. Seven seats stay in the same Debnath **type** but use a coarser mixed-library id:

| Node | Hashtag | Reconstruct intended BP | Mixed Dnet `personaId` | Type still match? |
|---|---|---|---|---|
| `user_depopulation_amp` | `#depopulation` | `conspiracy_depopulation` | `conspiracy_believer` | yes (conspiracy) |
| `user_climateaction_piggyback_amp` | `#climateaction` (piggyback) | `conspiracy_climate_piggyback` | `conspiracy_believer` | yes (conspiracy) |
| `user_climateaction_piggyback_peri_1` | `#climateaction` (piggyback) | `conspiracy_climate_piggyback` | `conspiracy_believer` | yes (conspiracy) |
| `user_biodiversity_hub` | `#biodiversity` | `biodiversity_food_security` | `environmental_concern` | yes (environmental) |
| `user_biodiversity_peri_1` | `#biodiversity` | `biodiversity_food_security` | `environmental_concern` | yes (environmental) |
| `user_foodsecurity_amp` | `#foodsecurity` | `biodiversity_food_security` | `environmental_concern` | yes (environmental) |
| `user_mitigation_amp` | `#mitigation` | `mitigation_first_policy` | `climate_action_advocate` | family yes; **cluster** is environmental |

Seed: `user_chemtrails_hub` (`#chemtrails`, `conspiracy_believer`). Articles: `scopex_2017`, `chemtrails_gates_2018_2021`.

### Full node map (63)

`†` = persona-id mismatch (type still mapped). Homo column is always `conspiracy_believer` by design.

| Sim node | Hashtag | Cluster | Empirical identity | Intended BP | Mixed Dnet | Homo Dnet |
|---|---|---|---|---|---|---|
| `user_chemtrails_hub` | #chemtrails | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_chemtrails_amp_1` | #chemtrails | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_chemtrails_amp_2` | #chemtrails | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_chemtrails_peri_3` | #chemtrails | chemtrails | conspiracy | `conspiracy_peripheral_skywatcher` | `conspiracy_peripheral_skywatcher` | `conspiracy_believer` |
| `user_haarp_hub` | #haarp | chemtrails | conspiracy | `conspiracy_haarp_weather` | `conspiracy_haarp_weather` | `conspiracy_believer` |
| `user_haarp_amp_1` | #haarp | chemtrails | conspiracy | `conspiracy_haarp_weather` | `conspiracy_haarp_weather` | `conspiracy_believer` |
| `user_geoengineering_hub` | #geoengineering | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_geoengineering_amp_1` | #geoengineering | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_srm_amp` | #srm | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_srm_peri_1` | #srm | chemtrails | conspiracy | `conspiracy_peripheral_skywatcher` | `conspiracy_peripheral_skywatcher` | `conspiracy_believer` |
| `user_sag_amp` | #sag | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_nexrad_amp` | #nexrad | chemtrails | conspiracy | `conspiracy_haarp_weather` | `conspiracy_haarp_weather` | `conspiracy_believer` |
| `user_nwo_amp` | #nwo | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_nwo_peri_1` | #nwo | chemtrails | conspiracy | `conspiracy_peripheral_skywatcher` | `conspiracy_peripheral_skywatcher` | `conspiracy_believer` |
| `user_illuminati_amp` | #illuminati | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_gmo_amp` | #gmo | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_weathermodification_amp` | #weathermodification | chemtrails | conspiracy | `conspiracy_haarp_weather` | `conspiracy_haarp_weather` | `conspiracy_believer` |
| `user_weathermodification_peri_1` | #weathermodification | chemtrails | conspiracy | `conspiracy_haarp_weather` | `conspiracy_haarp_weather` | `conspiracy_believer` |
| `user_weatherwarfare_amp` | #weatherwarfare | chemtrails | conspiracy | `conspiracy_haarp_weather` | `conspiracy_haarp_weather` | `conspiracy_believer` |
| `user_deepstate_amp` | #deepstate | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_maga_amp` | #maga | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_greatawakening_amp` | #greatawakening | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_depopulation_amp` | #depopulation | chemtrails | conspiracy | `conspiracy_depopulation` | `conspiracy_believer`† | `conspiracy_believer` |
| `user_stopspraying_amp` | #stopspraying | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_stopspraying_peri_1` | #stopspraying | chemtrails | conspiracy | `conspiracy_peripheral_skywatcher` | `conspiracy_peripheral_skywatcher` | `conspiracy_believer` |
| `user_monsanto_amp` | #monsanto | chemtrails | conspiracy | `conspiracy_believer` | `conspiracy_believer` | `conspiracy_believer` |
| `user_climateaction_piggyback_amp` | #climateaction | piggyback | conspiracy | `conspiracy_climate_piggyback` | `conspiracy_believer`† | `conspiracy_believer` |
| `user_climateaction_piggyback_peri_1` | #climateaction | piggyback | conspiracy | `conspiracy_climate_piggyback` | `conspiracy_believer`† | `conspiracy_believer` |
| `user_climateaction_hub` | #climateaction | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_climateaction_amp_1` | #climateaction | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_climatejustice_hub` | #climatejustice | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_climatejustice_amp_1` | #climatejustice | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_sweden_hub` | #sweden | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_sweden_peri_1` | #sweden | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_scopex_hub` | #scopex | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_scopex_peri_1` | #scopex | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_wedonotconsent_hub` | #wedonotconsent | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_wedonotconsent_amp_1` | #wedonotconsent | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_fridaysforfuture_amp` | #fridaysforfuture | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_cop26_amp` | #cop26 | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_climate_amp` | #climate | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_ipcc_amp` | #ipcc | climate_action | climate_action | `climate_scientist` | `climate_scientist` | `conspiracy_believer` |
| `user_actonclimate_amp` | #actonclimate | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_netzero_amp` | #netzero | climate_action | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_ozone_hub` | #ozone | environmental | environmental_concern | `ozone_stratosphere_specialist` | `ozone_stratosphere_specialist` | `conspiracy_believer` |
| `user_ozone_peri_1` | #ozone | environmental | environmental_concern | `ozone_stratosphere_specialist` | `ozone_stratosphere_specialist` | `conspiracy_believer` |
| `user_stratosphere_amp` | #stratosphere | environmental | environmental_concern | `ozone_stratosphere_specialist` | `ozone_stratosphere_specialist` | `conspiracy_believer` |
| `user_sai_amp` | #sai | environmental | environmental_concern | `ozone_stratosphere_specialist` | `ozone_stratosphere_specialist` | `conspiracy_believer` |
| `user_biodiversity_hub` | #biodiversity | environmental | environmental_concern | `biodiversity_food_security` | `environmental_concern`† | `conspiracy_believer` |
| `user_biodiversity_peri_1` | #biodiversity | environmental | environmental_concern | `biodiversity_food_security` | `environmental_concern`† | `conspiracy_believer` |
| `user_foodsecurity_amp` | #foodsecurity | environmental | environmental_concern | `biodiversity_food_security` | `environmental_concern`† | `conspiracy_believer` |
| `user_ecology_amp` | #ecology | environmental | environmental_concern | `environmental_concern` | `environmental_concern` | `conspiracy_believer` |
| `user_airpollution_amp` | #airpollution | environmental | environmental_concern | `environmental_concern` | `environmental_concern` | `conspiracy_believer` |
| `user_airpollution_peri_1` | #airpollution | environmental | environmental_concern | `environmental_concern` | `environmental_concern` | `conspiracy_believer` |
| `user_publichealth_amp` | #publichealth | environmental | environmental_concern | `environmental_concern` | `environmental_concern` | `conspiracy_believer` |
| `user_publichealth_peri_1` | #publichealth | environmental | environmental_concern | `environmental_concern` | `environmental_concern` | `conspiracy_believer` |
| `user_environment_amp` | #environment | environmental | environmental_concern | `environmental_concern` | `environmental_concern` | `conspiracy_believer` |
| `user_mitigation_amp` | #mitigation | environmental | environmental_concern | `mitigation_first_policy` | `climate_action_advocate`† | `conspiracy_believer` |
| `user_usa_amp` | #usa | geo | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_uk_amp` | #uk | geo | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_india_amp` | #india | geo | climate_action | `climate_action_advocate` | `climate_action_advocate` | `conspiracy_believer` |
| `user_climate_scientist_hub` | #climatescience | expert | other | `climate_scientist` | `climate_scientist` | `conspiracy_believer` |
| `user_science_journalist_hub` | #climatenews | expert | other | `science_journalist` | `science_journalist` | `conspiracy_believer` |

---

## 2. Where observables were applied

**(a) Empirical structure, before simulation.** Metrics on `debnath_hashtag_cascade.json` only (no auditor scores).

**(b) Simulated cascades, after existing Dnet runs.** Topology from the same 63/228 custom graph (`graph_topology.json` / Dnet configs). Content metrics from primary run dirs:

| Cell | Mix | MI mode | Primary `runDir` |
|---|---|---|---|
| Dnet_c_H | homo conspiracy | continuous | `Dnet_c_H_conspiracy_2026-09-19_02-49-31` |
| Dnet_c_He | mixed Debnath BPs | continuous | `Dnet_c_He_mixed_2026-09-19_04-05-50` |
| Dnet_d_H | homo conspiracy | dual | `Dnet_d_H_conspiracy_2026-09-19_02-49-31` |
| Dnet_d_He | mixed Debnath BPs | dual | `Dnet_d_He_mixed_2026-09-19_04-07-40` |

H and He share **identical** edge sets. Clustering coefficients therefore match empirical structure. Homophily and conspiracy-cut modularity **change with labels** (homo vs mixed).

Duplicate thinner He copies (`04-07-50`, `04-10-09`) and earlier H copies (`02-49-25`) were **not** re-run and were not used as primaries.

---

## 3. Factor table — empirical vs simulated

Thesis remapping rows, plus Outlook #2 (silent) so all **seven** 2014 factors appear.

| Factor (thesis remap → 2014) | Empirical (hashtag structure) | Simulated D-net (63-node, after run) | What it reveals | What it cannot reveal |
|---|---|---|---|---|
| **Valence** (definition: affective character; **not** an Outlook number) | Paper-quoted Perspective-like toxicity mean **0.17** (severe 0.12). Hashtag prior proxy **0.1097** (conspiracy 0.17 / env 0.08 / action 0.05). | Auditor **mean MI**, not toxicity. Continuous H: SCoPEx **1.73** vs chemtrails **3.34**. Mixed He: SCoPEx **1.00** vs chemtrails **2.51**. Dual headline is a different scale (H SCoPEx **4.25**, H chemtrails **3.73**; He SCoPEx **2.69**, He chemtrails **1.53**). FrameAuditor off. | High-arousal chemtrails seed raises continuous MI vs SCoPEx on the **same** graph; homo conspiracy seats raise MI vs mixed. Matches Pfeffer’s “opinion not fact / indignation” *qualitatively*. | **No Twitter MPR.** Paper 0.17 ≠ auditor MI. Dual vs continuous must not be averaged. Cannot claim simulated firestorm = Debnath toxicity spike. |
| **Surprise** (Outlook **#1** speed/volume, shock vs drip) | Debnath **paper-quoted** SCoPEx April 2017 ~8k interactions/day (~+300% vs Feb). **No** reconstructed shock time-series on this graph. | **Held drip:** `seedNodes: [user_chemtrails_hub]` only. No all-node shock cell. | Drip from the chemtrails hub is enough for 61/63 nodes to see a message by tick 8 (hub reach). Chemtrails article hits thesis k\* (network-mean MI>3) in homo cells (continuous k\*=2; dual k\*=4). Mixed continuous never crosses k\*. | Cannot test Pfeffer’s novelty/attention half-life, nor H2 (diverse communities more stable under **shock**). Paper spike is not in the JSON clock. |
| **Identity** (Outlook **#5** lack of diversity) | Hashtag mix **conspiracy 0.444** / other **0.556** (28 / 19 / 14 / 2). Intended BP mix is 12 ids, not 3. | **H:** conspiracy share **1.0** (63× `conspiracy_believer`). **He:** conspiracy **0.444** (28/63), climate_action 19, environmental 13, expert 3 — same type mix as empirical, coarser persona ids. Averaged compare `conspiracyShare=0.722` is H+He pooled, not a third mix. | Empirical graph is **not** a conspiracy monoculture; chemtrails is a plurality with climate-action and environmental blocks. Homo Dnet **destroys** that mix (identity alignment as IV). Mixed Dnet **preserves** type mix. | Not HDBSCAN community membership. Not follower-graph homophily. Expert pair is added for mixed BPs, not Debnath Figure 4. |
| **Clustering** (Outlook **#3** network clusters / transitivity) | n=63, 228 directed / **171 unique undirected**. Mean unique degree **5.43**; chemtrails hub unique neighbours **33**. Directed-incidence mean degree **7.24** (campaign `compare_phase2` number; bidirected pairs counted twice). Global transitivity **0.315**; mean local clustering **0.515**. Conspiracy-cut Q **0.404**. | **Same topology** as empirical. Transitivity **0.315**, local clustering **0.515**, hub unique degree **33**. Q **0.404** on mixed labels; Q **0.457** if every node is labelled conspiracy (H). T2 8-node graphs are **not** this measurement. | Pre-wired same-cluster closure is strong enough for Pfeffer’s “echo from several neighbours” *structurally*. Hub `#chemtrails` is the local epidemic seat. Q shows a conspiracy cut that is **not** an artefact of simulation. | Not Watts–Strogatz generative clustering (this is a documented co-occurrence construction). Not retweet triadic closure. Not Debnath eigenvector centrality re-estimated (paper quotes 0.58 UK / 0.47 USA / 0.68 Sweden / 0.37 India — **not recomputed here**). n=63 ≠ hundreds of neighbours (Outlook **#4**). |
| **Echo / homophily** (Outlook **#3+#4** + parts of **#5**) | Identity (cluster) edge homophily **0.873**. BP-family homophily **0.838**. Exact-persona homophily **0.544**. Sparse cross-cluster bridges at trust 0.32 (p0210-style). | **He** (mixed labels on same edges): identity homophily **0.838**, persona homophily **0.636**. **H:** identity **1.0** and persona **1.0** by construction. | Empirical information mostly stays inside conspiracy / action / env blocks, with a few documented bridges (chemtrails–climateaction, haarp–ozone, piggyback). Mixed sim **reproduces** that block echo. Homo sim **cannot** measure echo: every edge is same-persona. | Not unrestrained weak-tie flow (Outlook #4: hundreds–thousands of ties vs n=63, hub degree 33). Not algorithmic ranking. Not emergent chambers (edges are pre-wired). `summary.md` “sim homophily=1” is not the mixed-graph result. |
| **Temporal** (Outlook **#1** + **#7** network-triggered decisions) | **Not available empirically.** Hashtag co-occurrence has no tweet clock. `temporalAvailable: false`. | Held **8 ticks / 8 hops**, always-on, inbox 4. All four primary cells: max tick observed **8**, **61/63** nodes reached. k\* only where MI stays >3 (see valence). | Sim clock shows **compression**: one drip seed fills almost the whole 63-node graph inside the 8-tick budget. That is engine reach, not Debnath virality speed. | **Cannot** recover half-life, inter-arrival, or SCoPEx April 2017 dynamics. Ticks ≠ hours. Cannot operationalise Rogers knowledge→persuasion→propagation→affirmation as four logged steps. k\* is a thesis rule, not a Pfeffer statistic. |
| **Cross-media** (Outlook **#6**) | **Held.** No legacy-media layer in the reconstruct. | **Held.** No newsroom / broadcast agent. Hierarchical T2 topology is **not** this factor. | Only that the campaign records the seventh 2014 factor as missing. | Myers et al. ~1/3 external-volume analogue; social→TV→social loop; any claim that D-net is a cross-media firestorm. |
| **Binary choices** (Outlook **#2**, no thesis knob) | No like / retweet / petition actions on a hashtag graph. | Ternary actions on scored events: forward ~0.33–0.37, **reinterpret ~0.46–0.53**, drop ~0.13–0.17. Not Schelling binary. | Agents mostly **rewrite** rather than binary-share. That is the opposite of Pfeffer’s “limited discursive interaction.” | Cannot read Twitter retweet/like rates. Cannot claim the engine implements Outlook #2. Ablation (reinterpret=0) was not run. |

---

## 4. Highlights (what Pfeffer actually shows here)

1. **Clustering is an empirical-structure result, not a sim result.** Transitivity 0.315 / local clustering 0.515 / Q 0.404 live on the hashtag graph *before* any LLM call. D-net copies that graph; it does not grow clusters.

2. **Echo is label-dependent.** Mixed Dnet preserves empirical block homophily (~0.84). Homogeneous Dnet reports homophily 1 because identity was erased. Do not pool them.

3. **Identity mix on the 63-node graph is majority non-conspiracy (55.6%).** Treating D-net as a chemtrails-only firestorm is the H cell, not Debnath’s three discourse types.

4. **Valence comparison is proxy-to-auditor, never MPR-to-MPR.** Continuous MI is higher for the chemtrails/Gates seed than for SCoPEx on H and He; dual discrete headline does not preserve that article order on He. Report cells separately.

5. **Surprise and temporal are held / missing empirically.** The paper’s SCoPEx volume shock is a citation, not a reconstructed series. Sim surprise is drip. Sim time is 8 ticks.

6. **Hub concentration is real but not Outlook #4 scale.** `#chemtrails` unique degree 33 / 63 nodes is a local amplifier, not “hundreds–thousands of weak ties.”

7. **Larger graph = D-net 63, not T2 n=8.** T2 topologies sweep clustering as an IV on toy graphs. Pfeffer-on-Debnath must be this custom graph.

---

## 5. Primary sim MI (auditor only)

| Cell | Article | mean MI | n scored | k\* (mean MI>3, stays) | n nodes reached |
|---|---|---:|---:|---:|---:|
| Dnet_c_H | scopex_2017 | 1.735 | 970 | — | 61 |
| Dnet_c_H | chemtrails_gates_2018_2021 | 3.338 | 984 | 2 | 61 |
| Dnet_c_He | scopex_2017 | 0.998 | 591 | — | 61 |
| Dnet_c_He | chemtrails_gates_2018_2021 | 2.507 | 1035 | — | 61 |
| Dnet_d_H | scopex_2017 | 4.254 | 1076 | 2 | 61 |
| Dnet_d_H | chemtrails_gates_2018_2021 | 3.730 | 749 | 4 | 61 |
| Dnet_d_He | scopex_2017 | 2.688 | 407 | 7 | 61 |
| Dnet_d_He | chemtrails_gates_2018_2021 | 1.530 | 1027 | — | 61 |

Structural compare (already in `debnath_compare.json`, nReal=1): empirical depth 4 / breadth 33 / size 61 / SV 2.7 vs sim means depth 2.56 / breadth 40.9 / size 53.5 / SV 1.80. DTFS 0.275, `isValidated=false`. KS with one real cascade is underpowered. That table is **cascade-shape**, not a Pfeffer factor.

---

## 6. New LLM runs

**Did not happen.** Mapping was already in `configs/phase2/Dnet_*.json`. All four Dnet cells were complete (`runs_phase2/_status/dnet.md`). This note scored those raw runs and the empirical JSON. Isolation: `analysis_full/` + this document; no Phase 1 overwrite; `.env` not read for a new sim and not committed.
