# Must-have evidence pack — what a 1.0 paper would include

**Role.** The bound thesis is graded as CSS, not as a repo tour. A 1.0 manuscript would *contain* the packs below as figures, tables, or numbered appendix items, each tied to a file an examiner can open. This is the evidence list, not a promise that assembling it yields 1.0 (`grade_1_0_rubric.md`).

**Snapshot gap.** On 18 September 2026 the campaign has pieces of Packs A–C and almost none of Packs D–G. Details in `ACCEPTANCE_1_0.md`.

---

## Pack A — Homo / hetero heatmaps on **new climate data**

**Scientific job.** Show the LASS *design rhyme* (identity vs mixed chains, MPR colour scale) on a **different corpus**, so Results cannot be a reprint.

| Item | 1.0 bar | Why |
|---|---|---|
| **H heatmap** | Persona × article mean MPR, **≥10** climate articles, real LLM, empty cells as `—` not 0.00 | Domain claim; CIKM Fig. 3 grammar without CIKM numbers (`04_stats/heatmap_spec.md`) |
| **He heatmap** | Mix × article mean MPR, same articles, mixes with **≥1 expert/journalist** | Without He, “mixed identities buffer” is untested on chains |
| **Persona-stratified mixed MPR** | Conspiracy vs climate-action vs environmental vs expert on the **same** articles | Stops dilution pseudo-success (`11_redteam/replication_of_cikm.md`) |
| **Hop / tick trajectories** | MI vs hop (chains) and vs tick (graphs), line at MI=3 | LASS analogue of paper Fig. 4; climate only |
| **Validity overlay** | Dead cells hatched; N, model, m=5 in every caption | Examiner will look for zero-event “safe” rows |

**Files that would count.** PNG in `thesisExperiment/results/` or `results/figures/` plus the matrix in `results/heatmaps.json` **with both `H_meanMPR` and `He_meanMPR` filled**. Caption cites `articles/articles.json` (climate ids), not repo-root crime articles.

**Does not count.** `visualize.py` plots from `examples/run_linear_chain.json`; Young Parent rows; 2-node probe; graph A 2×2 bars as a substitute for chain heatmaps; `heatmaps.json` with `"He_meanMPR": { "rows": [], "matrix": [] }`.

**Climate corpus (new data).** Seeds must be geoengineering / climate consensus items with 5 GT questions each (`scopex_2017`, `chemtrails_gates_2018_2021`, SAI, SPICE, Paris, consensus, glaciers, polar bears, CO2, sea level, net zero, attribution — 12 ids in `articles/articles.json`). Citing Debnath’s 814k **in the article text** is not “using the 814k dump.”

---

## Pack B — \(k^*\) with a definition the parser implements

**Scientific job.** Tipping is the proposal’s CSS contribution. If \(k^*\) is undefined, renamed, or only a node index from LASS, the thesis has no firestorm clock.

| Item | 1.0 bar |
|---|---|
| **Definition in Methods** | First time **network-mean MI > 3** (propaganda) **and** no later point ≤ 3. MI=3 is still lie. `none` ≠ 0. Cite `discovery/02_theory/kstar_definition.md` / `parse_results.js` `irreversibleKStar`. |
| **Three columns** | \(K_{\mathrm{net,tick}}\) primary; \(K_{\mathrm{net,hop}}\) sensitivity; \(K_{\mathrm{node}}\) secondary. Mixed graphs: node propaganda **without** network k\* reported, not substituted. |
| **Censoring** | Table of `lastTick`, `nTicksAfterCross`, `kStar_censored` for 6–8 tick runs. A last-tick spike is a terminal spike, not a 30-hop plateau. |
| **Full matrix** | Every valid cell’s k\* / recovered / never-crossed — including SCoPEx recovery on `A_sf_hom` — not only chemtrails k\*=1. |
| **Figure** | Bar/heatmap with **grey = undefined** (`kstar_by_condition.png` is a start; chapter figure must not plot 0 for none). |

**Does not count.** LASS “nodes 5–9 inflection”; MPR>3 as k\*; information half-life; critical-mass fraction; crowning one N=1 cell “textbook.”

---

## Pack C — Mixed vs homogeneous (identity factor)

**Scientific job.** Pfeffer remapping of *lack of diversity / homophily*. Debnath types as BPs. This is the thesis’s identity treatment, not 21 news archetypes.

| Item | 1.0 bar |
|---|---|
| **Homogeneous arm** | Single-persona chains (H) across conspiracy **and** expert/steward personas (already in 12-id list) |
| **Heterogeneous arm** | 8 unique personas per mix, expert-inclusive (`personas/DEBNATH_MAPPING.md`) |
| **Graph arm** | Homogeneous conspiracy vs mixed BPs on SF and ER (Exp A), same seeds |
| **Pre-registered direction** | Hom conspiracy **higher** distortion than expert-inclusive mix on a majority of articles; **refute** if reverse (`02_theory/hypotheses.md` H3) |
| **Not only means** | Per-type MPR; polarisation index as \|mean MPR_conspiracy − mean MPR_other\|, labelled a **gap**, not echo emergence |

**Does not count.** Three activist BPs with no expert while claiming LASS replication; network-mean drop explained as “buffering” without per-type table; prompt-obedience (“conspiracy BP inverts SCoPEx”) sold as social discovery.

---

## Pack D — Topology (clustering factor)

**Scientific job.** Pfeffer *network clusters* as a knob, beyond the LASS linear chain.

| Item | 1.0 bar |
|---|---|
| **Contrast** | Scale-free (BA m=2) vs seeded ER vs (optional) echo topology, **same** mix and seeds |
| **Live cascades** | Compare only cells with events ≫ ticks and LLM calls > 0 |
| **Volume vs distortion** | Event counts reported separately from MPR/k\* (ER may be quieter without being “safer”) |
| **Seeds** | `graphRandomSeed` documented; `minSeedOutDegree` disclosed as a cascade-death patch, not as theory |

**Does not count.** `A_er_mix` × chemtrails (1 event, MI=0) as “random graphs prevent propaganda”; engine demo `examples/run_scale_free.json` with crime articles; unseeded ER that isolates `node_0`.

**Current hole.** Exp A in `summary.json` is still **2 articles × 6 ticks**. A 1.0 topology claim needs the logged full-A subset (≥6 articles, 8 ticks) **or** N≥3 on the 2×2, not a single 2-article pilot.

---

## Pack E — Intervention (correction / continued influence)

**Scientific job.** Proposal Exp B / Lewandowsky framing. A 1.0 paper either **identifies** correction or **withdraws** the claim.

| Item | 1.0 bar |
|---|---|
| **Control** | No-injection cell on the same topology×mix×article×seed |
| **n** | {1,3,5} as proposed, or written withdrawal of n=5 |
| **Estimator** | Per-node paired MI; matched tick windows; not mean-after dominated by cascade volume |
| **Table** | n_before, n_after, split tick, max MPR — already in `summary.md` but currently **confounded** |
| **Language** | No “recovery curve,” no “inoculation works at k∗−1” without Pack E |

**Does not count.** `B_sf_mix_n1` (0 events before); n=3 after-mean > before-mean sold as a hint; `b_before_after.png` without the confound sentence in the caption.

---

## Pack F — Limitations a measurement chair would accept

**Scientific job.** Ruths & Pfeffer (2014) style: what the instrument and platform cannot support. Not a “future work” shopping list that re-promises Phase III.

A 1.0 limitations chapter would **number** at least:

1. **N=1 / T=0.7 / mini.** No SE; generator and judge same family (`04_stats/limitations_stats.md`).
2. **Auditor threats.** Fail-open; leaked GT; empty human ratings; spot-check 6/10 (`09_auditor/threats.md`, `spotcheck_sample.md`).
3. **No 814k.** IDs, 662 MB not downloaded, BPs theory-faithful (`data/SOURCES.md`, `debnath_bps.md`).
4. **Held Pfeffer knobs.** Surprise drip; temporal compression; cross-media absent (`pfeffer_mapping.md`).
5. **Invalid cells.** ER-mix chemtrails; D echo 0 LLM calls.
6. **k\* censoring.** 6–8 ticks vs proposal 15 / LASS 30.
7. **Prompt vs belief.** High MI on conspiracy BPs may be instruction-following.
8. **Ethics / dual use.** Closed sim; no targeting; rewrite JSON looks like conspiracy posts (`10_repro/ethics.md`).
9. **PRIOR fence.** What LASS already owns.
10. **Withdrawn proposal items.** HDBSCAN, SQLite memory as delivered science, ClimateFEVER factorial, cascade twin, echo at t=50, n=5 if not run.

**Does not count.** “Limitations: more compute”; blaming the API; burying no-814k after a clustering-sounding methods paragraph.

---

## Pack G — Individual contribution vs co-authors

**Scientific job.** TUM statutory declaration. Pfeffer will ask who did the LASS experiments.

| Item | 1.0 bar |
|---|---|
| **One page in front matter** | Names of Shukla, Dandekars, Panat (confirm spellings); venue **LASS@CIKM 2025**; student’s role vs theirs |
| **Owned by co-authored paper** | Engine (`src/`, `index.js`), linear-chain news grid, MI/MPR definitions, default personas/articles |
| **Owned by this thesis** | `thesisExperiment/` climate articles & QA, Debnath-mapped personas, Pfeffer knob table, k\* campaign scripts, climate Results (if valid) |
| **Not owned until run** | He heatmaps, full A, identified B, live D, human ratings |
| **EMNLP** | Cite as unpublished / under review **only if true**; do not dump Ext. 10–12 into thesis contributions |

Template: `discovery/10_repro/individual_contribution.md` (still unfilled brackets — **fail** until the student writes it by hand).

---

## Pack H — Auditor validity (required for 1.0 *instrument*, not optional polish)

Without this pack, k\* and “propaganda” are engineering scores. Ceiling **2.3** on the DV (`09_auditor/validity_protocol.md`).

| Item | 1.0 bar |
|---|---|
| Dual-rated **n≥20** climate rewrites, auditor hidden | κ or percent agreement on MI and on MI>3 cut |
| Frozen sample ids (run/node/tick) | Not `Math.random()` CSV shuffle |
| Fail-closed parse **or** 100% audit of MI=0 conspiracy texts | S02-class events cannot remain unidentified |
| Disclose leaked GT and same-family judge | Ablation if claiming 1.0 |
| Human sheet uses **seed + GT**, not hop-to-hop `contentIn` | `human_eval_sheet.md` |

`human_eval_template.csv` exists in run dirs with **empty** rating columns. Existence of a template is not Pack H.

---

## Pack I — Theory and literature objects (non-empirical, still mandatory)

| Item | File / action |
|---|---|
| Pfeffer 2014 seven-factor table + remapping | Ch3; `01_literature/related_work.md` |
| Debnath 2023 claims with PMC-checked numbers | `data/derived/debnath_iscience_notes.txt` — do not invent R² |
| Gap map: unique vs PRIOR | `01_literature/gap_map.md` |
| Concurrent LLM-society / misinfo-sim papers | MOSAIC / FUSE / AgentSociety — dates, not “we were first” |
| Open science: configs, seeds, cost, no `.env` | `10_repro/`; `campaign_manifest.json` `"mode": "real"` |

---

## Minimum figure set a 1.0 CSS examiner would look for

From `08_figures/figure_plan.md` / `chapter_skeleton.md`, **filled from climate results**:

| ID | Content | 1.0 without it? |
|---|---|---|
| F01 | H persona×article MPR heatmap (climate) | No |
| F02 | He mix×article (or hop×persona) | No |
| F03 / Fig 7.4 | k\* by condition, grey=none | No |
| F04 | MI trajectories | Almost no |
| F05 | Pfeffer 7→6 schematic, swept/held/measured | No (theory) |
| F06 | Exp B only with confound caption | Optional if B withdrawn |
| F07 | Echo on **live mixed** graphs | If echo is a claim |
| F08 | Event volume SF vs ER | If topology is a claim |
| Validity ledger | Dead cells, dry-run excluded, model id | No |

Three PNGs currently in `results/` (`mi_mpr_by_condition.png`, `kstar_by_condition.png`, `b_before_after.png`) are **pilot bars**, not Pack A heatmaps. `08_figures/generated_index.txt` lists template names; that is not evidence.

---

## Mapping packs → grade eligibility (not a guarantee)

| Packs present and honest | Eligibility band |
|---|---|
| A(H only) + B(pilot) + F(partial) + no reprint | 2.3 |
| A(H+He) + B + C + F + G + I | 2.0–1.7 |
| + D (live, ≥6 articles or N≥3) + E identified or withdrawn + H auditor | 1.7–1.3 |
| + extra bars in `grade_1_0_rubric.md` §3 | 1.3, 1.0 *possible* |

Agents cannot complete Pack G or Pack H. The student must.

---

*Examiner evidence list for `thesisExperiment/discovery/03_examiner/`. Do not treat a completed checklist as a 1.0.*
