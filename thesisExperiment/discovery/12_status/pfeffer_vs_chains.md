# Two families: CIKM-style chains vs Pfeffer graphs

**Date.** 18 September 2026.  
**Object.** Completed `configs/full/` cells in the accepted real `gpt-4o-mini` campaign (`configs/grid_full.json`, `results/full_campaign_manifest.json`, `results/tables/`).  
**Proposal source.** `discovery/01_literature/_extract/proposal_pfeffer_v5.txt` (Phase II A–D; Phase III intervention).  
**CIKM source.** LASS@CIKM 2025 linear-branch design (homogeneous vs heterogeneous **chains**). Prior method only.

This note is the mapping you paste from. It is **not** a claim that either family replicated its paper at original scale.

---

## 1. The only split that matters

There are **two experiment families**. They share the auditor, the 12 climate articles, the Debnath-reduced personas, `gpt-4o-mini`, N=1, and an 8-step budget. They do **not** share a clock, a topology, or a proposal letter.

| Family | What it is | Campaign letters | Clock | Topology |
|---|---|---|---|---|
| **CIKM-style chains** | Same vs mixed personas along a **path**. Reuses only the LASS **homogeneous vs heterogeneous linear-chain** design. Climate seeds, not crime/news. | **H**, **He** | **Hop** (rewrite depth along the chain) | `linear_chain` |
| **Pfeffer graphs** | Networked firestorm cells: hubs vs random vs echo; mix vs conspiracy; fact-check; echo metrics. Proposal Phase II **A / B / D**. | **A**, **B**, **D** | **Tick** (simulation step on the graph) | `scale_free`, `random_er`, `echo_chamber` |

**Experiment C** is not a family and not a run config. It is a **post-hoc keyword heuristic** on rewrite text from both families.

Do **not** write “the CIKM graph” or “Pfeffer hops.” CIKM objects were **branches**. Pfeffer operationalisation in this campaign is **graphs** (plus the six-knob remap). Matching `maxHops: 8` and `maxTicks: 8` in JSON does **not** make hop = tick.

---

## 2. Hop ≠ tick (do not conflate)

| | **Hop** (chain family) | **Tick** (graph family) |
|---|---|---|
| Engine field | `history[].hops`, `nodeParams.maxHops` | `history[].tick`, `maxTicks` |
| Meaning | Path length: how many rewrites a **message** has already undergone. A hop-`k` cell is the *k*-th rewrite on that path. | Simulation time: which **step** of the always-on loop the society is in. Several nodes can act in the same tick. |
| CIKM analogue | \(K=30\) rewrite **nodes** on a branch | None. CIKM had no social graph. |
| Proposal analogue | Homogeneous / heterogeneous **branches** inside Exp A’s k\* sentence | Graph k\*; Exp B injection time; Exp D \(t=\{10,30,50\}\) |
| Campaign budget | H / He: **8 hops**, 8 nodes | A / B / D: **8 ticks**, 8 nodes |
| \(k^*\) you report | First **hop-index** in the chain series (`networkMIOverTime` / hop MI) where network-mean MI \(> 3\) and later scored points do not return to \(\le 3\) | First **tick** where the same irreversibility holds |
| Censoring | Last-hop tip = right-censored vs CIKM’s 10–30 plateau | Last-tick tip = right-censored vs proposal 15-tick / \(t=50\) windows |

On a linear chain, one hop often **coincides** with one tick because the path is a queue. That coincidence is an implementation accident. On a graph, a message can sit in an inbox, take several edges, and still be hop-2 at tick 5. Messages with `hops > maxHops` are not forwarded; that cap is **path length**, not firestorm duration.

**Write:** “8-hop chains” for H/He; “8-tick graphs” for A/B/D.  
**Do not write:** “8 hops/ticks” as if they were one quantity when comparing families; “CIKM 8-tick replication”; “Pfeffer 8-hop firestorm.”

`kstar_definition.md` already splits \(K_{\mathrm{net,hop}}\) (CIKM depth) from \(K_{\mathrm{net,tick}}\) (proposal graph clock). Use hop k\* when comparing to LASS **depth**. Use tick k\* for Experiments A/B/D.

---

## 3. How proposal letters relate to campaign letters

Proposal Phase II named **A–D**. The campaign **split** proposal A’s chain arm into CIKM-named H/He and kept A for the graph factorial.

| Proposal (v5) | What it asked | Campaign mapping | Honest coverage |
|---|---|---|---|
| **A** — tipping-point \(k^*\) across homogeneous branches, heterogeneous branches, **and** scale-free vs random | Network-mean MI \(> 3\), no recovery | **H** + **He** = the two **branch** arms (CIKM-style). **A** = SF vs ER × hom vs mix (Pfeffer graphs). | Partial. Chains exist (8 hops, not 30). Graphs exist (8 ticks, 6/12 articles, N=1, 4/24 dead). |
| **B** — belief-correction after \(n\in\{1,3,5\}\) conspiracy exposures | MI recovery; monotonicity; BP type | **B** `fact_checker_injection` at **calendar ticks** 1, 3, 5 | Partial and **unidentified**. n is tick, not exposure count, not \(k^*\). No control arm. Cascade volume confounds after vs before. |
| **C** — six Debnath-linked distortion types | BP × distortion matrix | **No config.** Keyword counts on all rewrites | Heuristic only. Not a classifier, not HDBSCAN labels. |
| **D** — echo emergence | Modularity at \(t=\{10,30,50\}\); BP-aligned vs diverging clusters | **D** `echo_chamber` + echo metrics on A/B | Live cell at **8 ticks**. Not the proposal times. |
| **Phase III** — bridge / counter-narrative at \(k^*-1,k^*,k^*+1\); 814k cascade k\*; ClimateFEVER | Intervention timed on measured \(k^*\) | **Missing.** B is not this. | Omitted. |

CIKM **H / He** are **not** proposal letters. They are the LASS design names the campaign reused for climate chains. Do not call H “Experiment A homogeneous” in a results heading if the reader will hear “proposal A graph.” In Methods, one sentence is enough: proposal A’s branch contrast was run as H/He; proposal A’s topology contrast was run as graph A.

---

## 4. Config → family → proposal / CIKM map

Canonical paths: `thesisExperiment/configs/full/`. Index: `configs/grid_full.json`.  
Do **not** map leftover `configs/A_*.json`, `configs/B_*.json`, `configs/D_echo_mix.json` (pilot, 6-tick / 2-article era) or `configs/_probe_api.json` (API smoke test).

### Family 1 — CIKM-style chains (hop clock)

All: `topology: linear_chain`, 8 nodes, `maxHops: 8`, `maxTicks: 8`, drip `seedNodes: ["node_0"]`, 12 articles, reinterpret 0.85, N=1.

| Config | Campaign | Maps to | Mix |
|---|---|---|---|
| `H_conspiracy_believer.json` | H | CIKM **H** (homogeneous branch) | one persona × 8 nodes |
| `H_conspiracy_haarp_weather.json` | H | CIKM H | same |
| `H_conspiracy_depopulation.json` | H | CIKM H | same |
| `H_conspiracy_climate_piggyback.json` | H | CIKM H | same |
| `H_climate_action_advocate.json` | H | CIKM H | same |
| `H_climate_justice_youth.json` | H | CIKM H | same |
| `H_mitigation_first_policy.json` | H | CIKM H | same |
| `H_environmental_concern.json` | H | CIKM H | same |
| `H_ozone_stratosphere_specialist.json` | H | CIKM H | same |
| `H_biodiversity_food_security.json` | H | CIKM H | same |
| `H_climate_scientist.json` | H | CIKM H | same |
| `H_science_journalist.json` | H | CIKM H | same |
| `He_mix_00.json` … `He_mix_11.json` (12 files) | He | CIKM **He** (heterogeneous branch) | 8 **unique** personas, no within-chain repeats |

**Cells:** 12×12 = 144 H + 12×12 = 144 He. Tables: `results/tables/H_rows.csv`, `He_rows.csv`.

**Also a slice of proposal A** (the “homogeneous / heterogeneous BP branches” clause). Not a CIKM 21×10×30 reprint: climate articles, 12 personas, 5 QA, `gpt-4o-mini`, **8 hops**.

### Family 2 — Pfeffer graphs (tick clock)

All: 8 nodes, `maxTicks: 8`, `maxHops: 8` (path cap, not the DV clock), drip `node_0`, `graphRandomSeed: 42`, reinterpret 0.50, N=1.

| Config | Campaign | Maps to | Topology × mix × seed |
|---|---|---|---|
| `A_sf_hom.json` | A | Proposal **A** (SF × aligned identity) | scale-free `m=2` × homogeneous conspiracy × **6**/12 articles |
| `A_sf_mix.json` | A | Proposal **A** (SF × mixed) | scale-free × mixed-8BP × 6 articles |
| `A_er_hom.json` | A | Proposal **A** (ER × aligned) | ER `p=0.42`, `minSeedOutDegree=2` × hom conspiracy × 6 articles |
| `A_er_mix.json` | A | Proposal **A** (ER × mixed) | ER same × mixed-8BP × 6 articles |
| `B_sf_mix_n1.json` | B | Proposal **B** (n=1) | SF × mixed × chemtrails; inject at **tick 1** |
| `B_sf_mix_n3.json` | B | Proposal **B** (n=3) | same; inject at **tick 3** |
| `B_sf_mix_n5.json` | B | Proposal **B** (n=5) | same; inject at **tick 5** |
| `D_echo_mix.json` | D | Proposal **D** | `echo_chamber` 2 chambers, mixed-8BP, chemtrails |

**A articles (cost subset):** `scopex_2017`, `chemtrails_gates_2018_2021`, `sai_geoengineering`, `paris_agreement`, `climate_consensus`, `polar_bears`. H/He still use all 12. Logged, not faked.

**A cells:** 2×2×6 = 24 rows (`A_rows.csv`). Four mixed cells died after 1 event (see `dead_cells_and_figures.md`).

**B cells:** 3 (`B_before_after.csv`). Injection tick is a **calendar tick**, not “after n conspiracy exposures” and not \(k^*\).

**D cells:** 1 live rerun (`D_echo_mix_2026-09-18_06-08-40`, 184 LLM calls). The 03:15 pilot with 0 calls is **invalid**.

### Not a config

| Item | Maps to | What exists |
|---|---|---|
| Experiment **C** | Proposal C | Keyword heuristic on rewrite text (Fig. 14). No `C_*.json`. |
| Phase III bridge / inoculation at \(k^*\pm 1\) | Proposal Phase III **intervention** | **Nothing ran.** |
| S_shock (all `seedNodes`) | Surprise factor | **Nothing ran.** Drip only. |
| T_slow (`maxTicks: 15` / weekly) | Temporal acceleration | **Nothing ran.** Always-on 8. |
| 814k HDBSCAN BPs | Phase I corpus / BP construction | Theory-faithful 12 ids. Dump not hydrated. |

---

## 5. Missing versus the proposal (the five cuts)

These are **absent**, not “approximately delivered.” Put them in Limitations. Do not fill them with H/He hops or with B’s ticks.

| Proposal item | What it would have been | What ran | Why the substitute fails |
|---|---|---|---|
| **15 ticks** (temporal acceleration / longer firestorm clock; T_slow contrast) | Graph `maxTicks` ≈ 15, or weekly vs always-on at a long horizon | **8 ticks**, `activityPattern: "always"` on every A/B/D cell | 8 is a cost cut (logged; also cut from a 12-hop chain clone). It is not a temporal **sweep**. Pfeffer temporal acceleration is **held**. |
| **\(t=\{10,30,50\}\)** (Exp D modularity snapshots) | Echo metrics at those **ticks** | D modularity at **tick 8** only | Tick 8 is before 10, far before 30/50. You cannot claim echo “at proposal times.” |
| **\(k^*\)-timed intervention** | Phase III: bridge agents and counter-narratives at \(k^*-1\), \(k^*\), \(k^*+1\) | **B** injects at ticks **1, 3, 5** regardless of whether that cell’s \(k^*\) exists | Calendar n ≠ measured \(k^*\). A cell that never tips still gets a tick-3 fact-check. A cell that tips at tick 6 is not treated at \(k^*-1\). |
| **814k BPs** | Phase I: 814,924 geoengineering tweets → HDBSCAN empirical centroids into persona memory | 12 **theory-faithful** Debnath-type expansions | Not cluster centroids. Not a re-analysis of Debnath. Kill-list if you say otherwise. |
| **Surprise shock** | Volume shock: `seedNodes` = all eight nodes at tick 0 (vs 30-day tweet-volume deviation in the proposal text) | **Drip:** `seedNodes: ["node_0"]` on every completed config | Surprise is **held**. Exp B’s fact-check is a mid-cascade **correction**, not a seed-fan-out shock. Do not relabel B as the surprise cell. |

Related omissions (same Limitations paragraph, not this table’s five): Phase III real-cascade \(k^*\); ClimateFEVER as a second corpus experiment; gpt-4o / 10 QA / 30-hop CIKM scale; N≥3; identified B (control + matched windows).

---

## 6. What each family can support in the PDF

**Chains (H/He).** Identity compounding vs mixing **along a path**, hop-wise MI, chain k\* under an 8-hop budget. Cite LASS as **prior method**. Climate increment = Debnath-type personas + geoengineering seeds. Truncation vs \(K=30\) is a limitation (`cikm_hops.md`).

**Graphs (A/B/D).** Topology × mix k\* (A); descriptive before/after at injection **ticks** (B — unidentified); echo metrics at 8 **ticks** (D). Cite Pfeffer 2014 for the firestorm **definition** and this campaign for a **six-knob remap**. Surprise and temporal acceleration were not tested.

**Do not** average chain hops with graph ticks in one heatmap. **Do not** treat H’s hop-5 as A’s tick-5. **Do not** say Experiment A “includes 288 chain cells” in a graph-results figure.

---

## 7. Examiner one-liner

This campaign is two families on purpose: **CIKM-style 8-hop climate chains** (H/He) and **Pfeffer-style 8-tick graphs** (A/B/D). Hop is chain depth; tick is graph time. Proposal A–D are only partly covered; **15 ticks**, **\(t=10,30,50\)**, **\(k^*\)-timed intervention**, **814k BPs**, and **surprise shock** were not run.
