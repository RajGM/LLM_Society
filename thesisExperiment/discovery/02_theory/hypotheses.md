# Hypotheses H1–H8

**Object:** networked LLM society in this repo, **not** Pfeffer et al. (2014) as a generative model they already published, and **not** the CIKM linear-chain 21×10×30 grid.

**Remapping note.** Pfeffer, Zorbach & Carley (2014) list **seven** qualitative factors. The proposal operationalises **six knobs** (valence, surprise, identity alignment, network clustering, information echo, temporal acceleration). Cross-media is omitted (§H-boundary). Cite Pfeffer for the firestorm definition; cite this file for the knobs.

**Instrument.** Discrete auditor, \(m=5\). DVs as in `kstar_definition.md`: event **MI**, node **MPR**, primary **\(k^* = K_{\mathrm{net,tick}}\)** (first tick with network-mean MI \(> 3\) that does not return to \(\le 3\)). Secondary: \(K_{\mathrm{node}}\), \(K_{\mathrm{net,hop}}\).

**Pre-register direction before looking at new runs.** The N=1 gpt-4o-mini pilot may be cited as a **sanity check**, not as confirmation.

Knobs: `factor_knob_table.md`. Minimum cells: `minimum_design.md`.

---

## Shared test protocol (all H)

Unless a hypothesis names a contrast, **hold**: `graphRandomSeed: 42`, `numNodes: 8`, `nodeParams.actionWeights` `{forward: 0.35, reinterpret: 0.50, drop: 0.15}`, `trustThreshold: 0.15`, `relationEvolution: true`, `trustDelta: 0.05`, `miScoringMode: "discrete"`, `defaultModel` / `auditorModel: "gpt-4o-mini"`.

Exclude dry-run rows and empty cascades (`cascade_empty`). Compare only cells with scored events.

**Refutation** is at the **sign** of the contrast on valid cells, not at \(p\)-values (N=1 cannot support inferential claims). For a later N\(\ge 3\) grid, require sign-stability across replicates; still do not treat Cohen’s \(d\) on length-1 cell means as evidence.

---

## H1 — Valence

**Statement.** Holding topology and BP mix fixed, a high-arousal conspiracy-framed geoengineering seed produces more factual degradation and more irreversible propaganda than a calm scientific seed on the same claims-family.

| | |
|---|---|
| **IV** | Seed article: `chemtrails_gates_2018_2021` (high valence) vs `scopex_2017` (low valence). Persona `emotionalTone` rides along with BP mix; do not unconfound tone from mix inside H1. |
| **DV** | Mean node MPR; max event MI; \(K_{\mathrm{net,tick}}\); `time_to_cross`; `crossedButRecovered`. |
| **Predicted direction** | \(\overline{\mathrm{MPR}}(\text{chemtrails}) > \overline{\mathrm{MPR}}(\text{SCoPEx})\); \(k^*\) earlier or more often defined for chemtrails; SCoPEx more often `crossedButRecovered` or `neverCrossed`. |
| **Existing test** | Experiment A configs `A_{sf,er}_{hom,mix}.json`: both ids in `seedArticles`. Sequential articles, same graph. Parser rows already split by `articleId`. |
| **Refute** | On the same cell, chemtrails MPR \(\le\) SCoPEx **and** chemtrails \(k^*\) is later/undefined while SCoPEx is irreversible. A single reversible chemtrails spike with lower mean MPR also refutes the “harder to walk back” claim. |

Pfeffer link: affective / indignation character of firestorm messages (not a numbered 2014 factor named “valence”).

---

## H2 — Surprise (volume shock vs drip)

**Statement.** Simultaneous seeding of all nodes at tick 0 (volume shock) produces earlier irreversible propaganda than single-node drip seeding, holding article, mix, and topology fixed.

| | |
|---|---|
| **IV** | `seedNodes`: shock = `["node_0",…,"node_7"]` vs drip = `["node_0"]`. |
| **DV** | \(K_{\mathrm{net,tick}}\), `time_to_cross`, max network-mean MI, event count (`totalEvents`). |
| **Predicted direction** | Shock: smaller \(k^*\) (earlier), higher max mean MI, more scored events before inbox cap. Drip: later or undefined \(k^*\). |
| **Existing test** | Engine already fans out to every id in `seedNodes` at tick 0 (`Simulation._propagateGroup`). **No shock cell is in `grid.json`.** Closest existing cell is drip on A/B/D. To test H2, clone `A_sf_hom.json`, set `seedArticles` to `["chemtrails_gates_2018_2021"]` only, expand `seedNodes`. Watch `nodeParams.maxInboxSize: 4` (shock will discard). |
| **Refute** | Shock \(k^*\) \(\ge\) drip \(k^*\) (later or both null) **and** max mean MI\(_{\mathrm{shock}}\) \(\le\) max mean MI\(_{\mathrm{drip}}\) on the matched article/graph. Inbox-capped shock that dies (`cascade_empty`) is a **failed manipulation**, not support. |

Pfeffer link: speed and volume of communication (shock vs drip as the controllable analogue of “topic dominance”).

---

## H3 — Identity alignment

**Statement.** Homogeneous conspiracy BPs yield higher distortion and more irreversible network-mean propaganda than a mixed three-type Debnath BP population on the same topology and seed.

| | |
|---|---|
| **IV** | `personasPath`: `homogeneous_conspiracy.json` vs `mixed_three_bp.json`. Assignment `defaultPersonaAssignment: "sequential"`. |
| **DV** | Mean node MPR; \(K_{\mathrm{net,tick}}\); \(K_{\mathrm{node}}\); persona-conditioned MPR (`polarization.meanConspiracyMPR` vs `meanOtherMPR`). |
| **Predicted direction** | Homogeneous: higher \(\overline{\mathrm{MPR}}\), more defined \(k^*\). Mixed: lower network-mean MI (buffering). Conspiracy nodes in mixed graphs still exceed non-conspiracy nodes on MPR (\(K_{\mathrm{node}}\) may fire while \(K_{\mathrm{net,tick}}\) does not). |
| **Existing test** | A1/A3 vs A2/A4 (`A_sf_hom` / `A_er_hom` vs `A_sf_mix` / `A_er_mix`). |
| **Refute** | Mixed \(\overline{\mathrm{MPR}}\) \(\ge\) homogeneous on both seeds **and** mixed \(k^*\) earlier or equally often. **Dilution-only:** if conspiracy-node MPR is unchanged and the mix “win” is only fewer conspiracy seats, H3’s *alignment* mechanism is not supported — report as composition artefact. |

Pfeffer link: lack of diversity / homophily. Debnath link: three empirical discourse types (conspiracy / climate action / environmental concern) as BPs.

This is **not** the CIKM claim that heterogeneous *linear branches* reach ~85% propaganda. Different object (graph vs chain; Debnath BPs vs 21 archetypes).

---

## H4 — Network clustering

**Statement.** Preferential-attachment hubs (scale-free) produce earlier or more severe propaganda cascades than a density-matched random graph, especially under high valence and homogeneous conspiracy.

| | |
|---|---|
| **IV** | `topology: "scale_free"` + `topologyParams.m: 2` vs `topology: "random_er"` + `topologyParams.edgeProbability: 0.42`, `minSeedOutDegree: 2`. `graphRandomSeed: 42`. |
| **DV** | \(K_{\mathrm{net,tick}}\), max network-mean MI, `totalEvents`, structural virality if present (`metrics.structuralVirality`). |
| **Predicted direction** | Scale-free: earlier \(k^*\), higher max mean MI on chemtrails × homogeneous. ER: more cascade death or slower hop-wise MI (`hopMI`). |
| **Existing test** | A_sf_* vs A_er_* in `grid.json`. |
| **Refute** | ER \(k^*\) \(\le\) SF \(k^*\) (earlier/equal irreversibility) **and** max mean MI\(_{\mathrm{ER}}\) \(\ge\) max mean MI\(_{\mathrm{SF}}\) on the matched mix and seed. An ER cell that never leaves `node_0` (`minSeedOutDegree` failure / seed drop) is invalid, not an ER “win.” |

Pfeffer link: network clusters. BA vs ER is a **hub** contrast, not clustering coefficient per se. Small-world (`topology: "small_world"`, `k`, `beta`) is available if a clustering-coefficient contrast is required; it is not in the campaign grid.

---

## H5 — Information echo

**Statement.** High intra-chamber / low inter-chamber trust produces more closed-group repetition (homophily, conspiracy-cut modularity, MI Gini, persona-gap PI) and more irreversible propaganda than an open mixed random graph on the same seed and BP inventory.

| | |
|---|---|
| **IV** | `topology: "echo_chamber"` with `intraEdgeProb: 0.75`, `interEdgeProb: 0.08`, `intraTrust: 0.85`, `interTrust: 0.15`, `numChambers: 2`, `defaultPersonaAssignment: "by_cluster"`, `minSeedOutDegree: 2` vs `topology: "random_er"` mixed (`A_er_mix`). `relationEvolution: true` on both (held process). |
| **DV** | `echo.edgeHomophily`, `echo.conspiracyHomophily`, `echo.modularityConspiracy`, `giniCoefficient`, `polarization.pi`; \(K_{\mathrm{net,tick}}\). |
| **Predicted direction** | Echo cell: higher homophily / Q / Gini / PI; \(k^*\) defined more often or earlier on chemtrails. ER mix: lower echo metrics; network mean buffered. |
| **Existing test** | `D_echo_mix.json` vs `A_er_mix.json` (chemtrails row). Parser already computes echo fields. **Pilot D died** (seed drop, 0 LLM calls) — that run **cannot** confirm H5. A re-run with seeded RNG + `minSeedOutDegree` (as in `configs/full/D_echo_mix.json`) is the actual test. Measuring homophily on A/B only **describes** echo; it does not manipulate it. |
| **Refute** | Echo homophily/Q/Gini/PI \(\le\) ER mix **and** echo \(k^*\) later or undefined while ER mix tips. Or echo cell again `cascade_empty`. |

Pfeffer link: clusters + unrestrained flow + homophily (echo as **outcome and** as topology input). Proposal Exp D asked whether chambers **emerge**; with `enableNetworkEvolution: false` the campaign **inputs** chambers. Emergent echo would require Ext. 3 (`enableNetworkEvolution` + `enableBeliefs`) — available, not in the climate grid. Do not claim emergence if only `echo_chamber` was wired.

---

## H6 — Temporal acceleration

**Statement.** Always-on, hop-compressed interaction reaches irreversible propaganda in fewer clock ticks (and fewer hops) than a slowed activity schedule, holding graph, mix, and seed fixed.

| | |
|---|---|
| **IV** | High: `activityPattern: "always"`, `maxTicks: 6`, `maxHops: 6` (campaign). Low: `activityPattern: "weekly"` (active iff `tick % 7 === 1`) with `maxTicks` long enough for \(\ge 2\) active weeks (e.g. 15), **or** `activityPattern: "random"` vs `always` at the same `maxTicks`. Do not change topology/mix/seed in the same contrast. |
| **DV** | \(K_{\mathrm{net,tick}}\), \(K_{\mathrm{net,hop}}\), `time_to_cross`, last-tick mean MI. Report **active opportunities** (ticks where the node processed) so weekly is not mechanically “slower \(k^*\)” by calendar only. |
| **Predicted direction** | Always-on: smaller tick-\(k^*\), higher propaganda prevalence by the horizon. Weekly: later or undefined \(k^*\); hop-\(k^*\) may still match if the cascade is hop-limited rather than clock-limited. |
| **Existing test** | Campaign **holds** 6/6/always (`pfeffer_mapping.md`). Engine support is already in `SimulationNode._isActive` and `maxTicks` / `maxHops`. `examples/run_scale_free.json` uses `maxTicks: 15` as a longer template. **No temporal contrast cell is in `grid.json`.** |
| **Refute** | Weekly (or random) reaches irreversible \(k^*\) at an equal or smaller **active-tick** index **and** always-on does not tip. Or hop-\(k^*\) identical across patterns while tick-\(k^*\) differences vanish after rescaling by activity — then H6 is a clock artefact, not acceleration of distortion. |

Pfeffer link: speed of communication + network-triggered decision compression.

---

## H7 — Debnath cross-domain RQ (climate vs commercial firestorms)

**Statement.** Firestorm tipping (\(k^*\)), severity (MI/MPR), and correction resistance are **not** invariant when the same society is seeded with a scientific-misinformation narrative versus a commercial/general-news narrative. If thresholds differ, that is a **boundary condition** of a theory derived on commercial WOM (Pfeffer 2014), not a failed climate simulation.

| | |
|---|---|
| **IV** | Domain of `seedArticles` / `articlesPath`. Climate: `thesisExperiment/articles/articles.json` (`chemtrails_gates_2018_2021`, `scopex_2017`). Commercial/general: `articles/articles.json` (`crime_0` or `politics_0`) — **one** seed on the **same** graph/BP cell, not the CIKM 21-persona × 10-domain × 30-hop matrix. |
| **DV** | \(K_{\mathrm{net,tick}}\), mean MPR, max event MI; optional Exp B recovery gap on each domain. |
| **Predicted direction (directional, Debnath-motivated)** | Under homogeneous conspiracy × scale-free: chemtrails \(k^*\) \(\le\) commercial \(k^*\) (tips at least as early) and \(\overline{\mathrm{MPR}}\) chemtrails \(\ge\) commercial. Under mixed BPs: climate **factual** SCoPEx is buffered more than a commercial outrage seed (non-conspiracy Debnath streams exist; they have no analogue in a crime-news chain of identity personas). Two-tailed alternative allowed: any **stable** threshold shift (earlier/later \(k^*\), different recovery) counts as a domain boundary; **identity** of MI/MPR/\(k^*\) distributions across domains (within sampling noise) supports unrestricted transfer of Pfeffer thresholds. |
| **Existing test** | Climate arm: A cells. Commercial arm: set `articlesPath` to `articles/articles.json`, `seedArticles: ["crime_0"]` (or `politics_0`), copy `A_sf_hom.json` / `A_sf_mix.json` topology and `nodeParams`. Same auditor code path. **Do not** load CIKM personas (`personas/personas.json` Young Parent, etc.) if the claim is Debnath BP transfer; that would confound domain with identity inventory. |
| **Refute** | No difference in \(k^*\), mean MPR, or recovery between climate and commercial seeds on both hom and mix graphs (transfer unrestricted) **if** the thesis claimed a boundary — or, if the thesis claimed identical dynamics, any large domain gap. Empty commercial cascade is not a domain finding. |

**Forbidden as H7 evidence:** reprinting CIKM Young Parent MPR 5.48, crime0 MPR 4.2, or “85% heterogeneous propaganda” (`01_literature/do_not_reprint.md`).

---

## H8 — Correction resistance after \(n\) exposures

**Statement.** After \(n\) ticks of conspiracy-prone exposure, injecting the original article (`fact_checker_injection`) recovers network-mean MI less at \(n=3\) than at \(n=1\), and conspiracy BPs recover less than climate-action / environmental BPs.

| | |
|---|---|
| **IV** | `interventions[0].tick` \(\in \{1,3\}\) with `"type": "fact_checker_injection"`, `params.correctionStrength: 0.9`, article `chemtrails_gates_2018_2021`, topology scale-free, mix `mixed_three_bp.json`. \(n\) is exposure duration, **not** replicate \(N\). |
| **DV** | Parser `bRecovery` (event MI before vs after split tick); \(\Delta\) mean MI; whether \(K_{\mathrm{net,tick}}\) remains defined after injection (`kStar_post_inject`); persona-stratified MPR after split. |
| **Predicted direction** | Recovery \(\Delta\mathrm{MI}_{n=1} > \Delta\mathrm{MI}_{n=3}\) (more repair after one exposure). Conspiracy nodes: smaller recovery than non-conspiracy. Possible non-recovery: mean MI stays \(> 3\) (Lewandowsky continued influence, as an **LLM-society** pattern — not a human psych replication). |
| **Existing test** | `B_sf_mix_n1.json` (`tick: 1`) and `B_sf_mix_n3.json` (`tick: 3`). `parse_results.js` already computes `miBeforeAfter`. `n=5` exists only as `configs/full/B_sf_mix_n5.json`, not in the pilot grid. |
| **Refute** | \(n=3\) recovers as much or more than \(n=1\) on network-mean MI **and** BP types do not differ in \(\Delta\)MI. Confound to declare, not hide: late-tick cascade **volume** can move the after-mean independently of belief revision (pilot already noted this). If `totalEvents` after injection dwarfs before, H8 is **inconclusive**, not confirmed. |

Theory: Lewandowsky et al. (2012); proposal Exp B. Instrument: CIKM auditor + `InterventionEngine`.

---

## Joint implication (not a ninth hypothesis)

H1 × H3 is the proposal’s tipping mechanism in miniature: irreversible \(k^*\) concentrated in **high valence × homogeneous conspiracy × hubs**. The 2×2×2 A design tests that **pattern**. A chemtrails × mix cell with \(k^*=1\) equal to chemtrails × hom would undermine the identity half; a SCoPEx × hom cell with irreversible \(k^*\) equal to chemtrails would undermine the valence half.

---

## Boundary (untestable here)

**Cross-media dynamics** (Pfeffer 2014 factor 6): no legacy-media agent. Do not fold it into H5 or H6.

**Binary like/share:** actions are ternary (`forward` / `reinterpret` / `drop`). Not hypothesised.

**814k cascade reconstruction / HDBSCAN BPs:** not in the engine; BPs are theory-faithful reductions (`data/derived/debnath_bps.md`). H3/H7 do not claim empirical centroid match.

---

## Hypothesis × existing config matrix

| H | Factor / RQ | Swept in current `grid.json`? | Minimum extra cell |
|---|---|---|---|
| H1 | Valence | Yes (2 seeds on A) | — |
| H2 | Surprise | No (drip held) | 1 shock clone of `A_sf_hom` × chemtrails |
| H3 | Identity | Yes (hom vs mix) | — |
| H4 | Clustering | Yes (SF vs ER) | — |
| H5 | Echo | Partial (D extra; pilot unusable) | re-run `D_echo_mix` with min out-degree |
| H6 | Temporal | No (6/always held) | 1 weekly or 15-tick clone |
| H7 | Climate vs commercial | No | 1 commercial seed on A_sf_hom + A_sf_mix |
| H8 | Correction vs \(n\) | Yes (B n=1,3) | optional n=5 |

H2 and H6 are the two proposal factors that the **existing campaign does not actually manipulate**. Until those cells exist, H2/H6 are **untested**, not supported by “held” settings.
