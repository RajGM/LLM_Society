# Reporting template — tables for a ~60-page results chapter

Fill from `summary.json`, `results_*.json`, and the event table (U1). **N=1 cells:** put `—` in SE / CI / p / d columns, not `0`.  
Every table caption must state unit of analysis (`analysis_plan.md` §2) and N.

Suggested chapter map (page budget is indicative):

| § | Topic | ~pp |
|---|---|---|
| 6.1 | Design, grid, validity | 6 |
| 6.2 | Measurement (MI, MPR, k\*) | 5 |
| 6.3 | Experiment A factorial | 14 |
| 6.4 | Heatmaps and mixed-chain | 8 |
| 6.5 | Experiment B fact-check | 6 |
| 6.6 | Distortion heuristic (C) | 4 |
| 6.7 | Echo / PI (D) | 5 |
| 6.8 | Human audit subsample | 4 |
| 6.9 | Robustness / k\* variants | 4 |
| 6.10 | Limitations (stats) | 4 |

---

## T0 — Validity and exclusion (must be Table 1)

| Column | Content |
|---|---|
| `runDir` | basename |
| `experimentName` | A_sf_hom … |
| `status` | complete / failed |
| `mode` | real / dry-run |
| `model` | gpt-4o-mini |
| `llm_calls` | from `metadata.llmUsage` |
| `n_articles` | results files |
| `include_in_results` | yes / no + reason |

**Always exclude:** dry-run, `probe_api`, `D_echo_mix` if 0 LLM calls. Footnote duplicate `runDir`s (keep manifest real-campaign dirs).

---

## T1 — Design matrix (Pfeffer operationalisation)

One row per cell (not per article):

| Cell | Topology | BP mix | Articles | Nodes | Ticks / hops / inbox | Replicates N | Intervention |
|---|---|---|---|---|---|---|---|
| A_sf_hom | scale-free BA m=2 | homogeneous conspiracy | both seeds | 8 | 6 / 6 / 4 | 1 | none |
| … | | | | | | | |

Held factors: drip seed `node_0`, `graphRandomSeed=42`, `temperature=0.7`, discrete auditor, m=5 items.

---

## T2 — Primary DVs by cell × article (lead results table)

Unit: **U-cell** (N=1 point estimates).

| Cell | Article | totalEvents | maxEventMI | meanNodeMPR | maxNodeMPR | maxNetworkMeanMI | propagandaOccurred | k\*_net_tick | firstCross | recovered | k\*_net_hop | k\*_node (tick/hop/id) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

Source: parser `rows[]` plus hop-k\* from `kstar_rules.md`.  
**k\* display:** `none` if null; never `0`.

---

## T3 — Persona-stratified MPR (mixed and homogeneous)

Unit: **U-persona**.

| Cell | Article | personaId | n_nodes | mean MPR | min–max MPR | n_scored_events | severity of mean |
|---|---|---|---|---|---|---|---|

Homogeneous: one persona row. Mixed: three rows. This table is the numeric companion to heatmaps H1/H2b (`heatmap_spec.md`).

---

## T4 — Node × article MPR (CIKM-grammar, this corpus only)

Unit: **U-node**. One subtable per homogeneous run (`A_sf_hom`, `A_er_hom`).

| nodeId | personaId | MPR scopex | events scopex | MPR chemtrails | events chemtrails |

Caption: analog of CIKM node×article heatmap **grammar**; numbers are climate-grid only.

---

## T5 — Network MI trajectories

Unit: **U2**. Long format or wide ticks 1–6.

| Cell | Article | tick | meanMI | n_scored_events | above_τ |

Optional second table: hop-indexed mean MI (U1 hop bins).

Figure companion: one line plot per article, colour = cell; hline at 3.

---

## T6 — k\* decision log (transparency)

| Cell | Article | firstCross_tick | values after cross (list) | recovered | k\*_net | censored_flag | firstCross_hop | k\*_hop | K_node |

This is where reversible SCoPEx spikes vs irreversible chemtrails cells are **shown**, not only asserted.

---

## T7 — Experiment A planned contrasts (descriptive)

At N=1: **delta only**, no tests.

| Contrast | Hold fixed | DV | Cell A value | Cell B value | Δ | Direction (qualitative) |
|---|---|---|---|---|---|---|
| Identity | SF + chemtrails | k\*_net, mean MPR | | | | |
| Identity | SF + SCoPEx | … | | | | |
| Identity | ER + each article | … | | | | |
| Topology | hom + each article | … | | | | |
| Topology | mix + each article | … | | | | |
| Valence | each topo×mix | … | | | | |

Footnote: Δ is not an effect size.

---

## T8 — Experiment B (fact-check timing)

| Cell | inject_tick | nBefore | mean MI before | nAfter | mean MI after | Δ | maxNodeMPR | k\*_net | confound note |
|---|---|---|---|---|---|---|---|---|---|

**Required sentence under the table:** most scored events occur after the split; Δ is not a causal recovery estimate.

If N≥3 later, add tick-matched rows (t = inject vs t = inject+1).

---

## T9 — Distortion heuristic (Exp C)

| Cell | Article | nTexts | spraying_chemtrails | weather_haarp | weaponization | depopulation | climate_justice_hijack | antivax_spillover |

Counts from parser `distortionHeuristic`. Caption: **keyword overlap, not a trained classifier.** Rates = count / nTexts (a text may have multiple tags).

---

## T10 — Echo / polarization (Exp D)

| Cell | Article | edgeHomophily | conspiracyHomophily | modularityConspiracy | PI | meanConspiracyMPR | meanOtherMPR | Gini | structuralVirality |

Note: homophily = 1.0 is **tautological** on homogeneous graphs. PI is the mixed-graph echo readout.

---

## T11 — IFD decomposition (secondary)

If `ifd` present on events:

| Cell | Article | persona | mean MI | mean CR | mean MR | mean IR | n |

Shows whether propaganda is **omission** (MR) vs **inversion** (IR). Discrete mode only in this campaign.

---

## T12 — Human evaluation subsample

From `human_eval_template.csv`:

| eval_id | article | node | persona | tick | action | auditor_mi | rating_factual | rating_frame | rating_persuasion | agreement |

At submission time many rating columns are **blank**. Table T12 is a **template to fill after crowd/expert coding**. Until filled, report n sampled and that human columns are empty (do not impute auditor_mi as human).

Cohen’s κ / Krippendorff’s α: only after ≥2 human raters; not vs the LLM auditor as if it were a gold label (circularity — `limitations_stats.md`).

---

## T13 — LLM usage and cost

| Cell | calls | prompt tokens | completion tokens | est. USD | errors | model |

Do not treat cost as a scientific DV. Needed for reproducibility and examiner questions.

---

## T14 — Multiple-comparison ledger (pre-registered)

| Family | Members | N=1 action | N≥3 action |
|---|---|---|---|
| Primary | maxEventMI, meanNodeMPR, k\*_net | no tests | Holm–Bonferroni within family |
| Secondary | Gini, SV, PI, homophily, hop-k\*, B Δ | descriptive | FDR (BH) or uncorrected with “exploratory” label |
| Keyword tags (6) | Exp C | descriptive | exploratory only |

---

## T15 — CIKM design comparison (related-work or methods; **not** results numbers)

| Item | CIKM setup | This thesis grid |
|---|---|---|
| Graph | 5-node linear chain | 8-node SF / ER |
| Personas | 21 news BPs | 1 or 3 Debnath BPs |
| Articles | 5 news domains | 2 climate seeds |
| Auditor | MI 0–5, MPR heatmap | same engine, new items |
| Claim | — | **leave numeric CIKM cells out** |

---

## T16 — Failed / unusable cells

| Cell | Symptom | LLM calls | Interpretation allowed |
|---|---|---|---|
| D_echo_mix | seed drop tick 1 | 0 | none (do not claim echo suppression) |
| A_er_mix × chemtrails (if 1 event) | cascade death | low | stochastic drop, not “ER prevents propaganda” |

---

## Figures that must accompany tables (filenames for the chapter pipeline)

| Fig | Spec | Table |
|---|---|---|
| H1 | homogeneous persona/topo × article MPR | T3, T4 |
| H2a | mixed hop × persona MI violin+strip | T3, T5 hop |
| H2b | mixed persona × article MPR heatmap | T3 |
| K1 | k\* by cell (no zero-for-none) | T2, T6 |
| B1 | MI before/after with nBefore/nAfter annotated | T8 |
| Traj | U2 meanMI vs tick, hline τ=3 | T5 |

Do not ship `plot_results.py`’s grey bar at 0 for missing k\* without rewriting the caption.

---

## Caption boilerplate (copy)

> N = 1 independent replicate (`gpt-4o-mini`, 8 nodes, 6 hop-compressed ticks). Values are descriptive. Cohen’s d is not reported (see analysis plan §5: `ABTestRunner` d on length-1 averages is undefined and returns 0). Dry-run MI=0 series excluded.

---

## What the 60-page chapter should not contain

- Inferential p-values from events-as-i.i.d.
- Engine A/B `cohensD` printout.
- CIKM crime/Young Parent digits in results tables.
- Echo-chamber cell as a topology finding.
- n=1 vs n=3 fact-check as a dose–response law.
