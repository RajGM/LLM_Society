# ACCEPTANCE_1_0 — binary checklist vs current snapshot

**Rule.** Each row is **PASS** or **FAIL**. No “mostly.” Soft language in `results/findings.md` does not flip a FAIL.

**Grade honesty (read this before the table).**

- Completing this list does **not** guarantee a 1.0. Examiners grade the bound PDF and the defence. Agents do not assign TUM grades.
- This list is the **eligibility** bar for even *asking* for 1.0. The 18 September 2026 snapshot is **FAIL** overall.
- Bars that maximize **P(1.3–1.7)** if the student stops overclaiming: §3. Extra bars for a **possible** 1.0: §4. Rubric portraits: `grade_1_0_rubric.md`. Kill sentences: `kill_list.md`. Evidence packs: `must_have_evidence.md`.

**Snapshot used for marks**

| Source | Timestamp / fact |
|---|---|
| `thesisExperiment/results/summary.json` | `"generatedAt": "2026-09-18T04:11:22.188Z"` |
| Same file | `"thesisGrade": false`, `"mode": "real"` |
| Same file `counts` | `H: 144`, `He: 0`, `A: 8`, `B: 2`, `D: 1` |
| `thesisExperiment/LOG.md` | After that parse: **PHASE He** started 04:12:14Z; mixes 00–05 in flight. **Not in `summary.json`.** |
| `results/heatmaps.json` | `H_meanMPR` filled 12×12; `He_meanMPR.rows: []` |
| `results/tables/He_rows.csv` | Header only (no data rows) |
| `campaign_manifest.json` | `"mode": "real"`, gpt-4o-mini, A/B/D **pilot** (2 articles, 6 ticks) |

He runs on disk after 04:12Z are **out of the results snapshot**. They do not turn He checklist rows to PASS until parsed into `summary.json` / heatmaps / thesis figures.

**Campaign ACCEPTANCE_1_0: FAIL**

---

## 1. Binary checklist (must all PASS for 1.0 *eligibility*)

### 1.A Prior-work fence (instant FAIL if any FAIL)

| ID | Requirement | Snapshot | Evidence |
|---|---|---|---|
| A1 | Results contain **no** LASS digits (Young Parent 5.48, crime0 4.2, 85% hetero, 47/97/66, nodes 5–9 as *this* study) | **PASS** (campaign tables are climate) | `results/summary.md` cells are H/A/B/D climate ids; `do_not_reprint.md` still required in the PDF |
| A2 | Thesis/repo does **not** brand LASS as CIKM **main**; DOI is not `10.1145/3627673` as the paper | **FAIL** | `README.md` badge “CIKM 2025 Outstanding Paper” → `10.1145/3627673` (CIKM **2023** proceedings). Proposal extract calls “ACM CIKM 2025 Outstanding Paper” on p.1 |
| A3 | MI/MPR/taxonomy cited as Maurya et al. (2025), not “introduced in this thesis” | **FAIL** until PDF exists; **repo risk FAIL** | `README.md` “we introduce” language is the engine voice; `findings.md` is more careful. Bound thesis not written |
| A4 | Individual vs co-author page filled (names, roles) | **FAIL** | `discovery/10_repro/individual_contribution.md` still `[names]` / `[e.g. implementation…]` |

### 1.B Data honesty

| ID | Requirement | Snapshot | Evidence |
|---|---|---|---|
| B1 | No claim of HDBSCAN / Skip-gram on 814,924 tweets | **PASS** (campaign docs) | `data/SOURCES.md` fallback 1; `data/derived/debnath_bps.md` “was **not** run”; `summary.json` validity string |
| B2 | OSF ~662 MB IDs not silently substituted by a toy cluster | **PASS** | `SOURCES.md` fallback 6; no fake cluster artefact under `data/` |
| B3 | Climate articles ≥10 with 5 GT items each | **PASS** (stimuli) | `articles/articles.json` 12 ids (`scopex_2017` … `attribution_extremes`) |
| B4 | BPs labelled theory-faithful, not centroids | **PASS** (docs) | `personas/DEBNATH_MAPPING.md`; `debnath_bps.md` |
| B5 | Dry-run excluded from thesis tables | **PASS** for `summary.json` | `"mode": "real"`; `llmUsage` non-zero on H and A cells. **Watch:** older `runs/*_02-34-*` must not be re-parsed in |

### 1.C Climate homo/hetero object (Pack A)

| ID | Requirement | Snapshot | Evidence |
|---|---|---|---|
| C1 | Homogeneous climate chain grid complete (persona×article) | **PASS** (data) | `counts.H: 144` = 12×12; `tables/H_rows.csv`; `heatmaps.json` `H_meanMPR` 12 rows × 12 cols |
| C2 | Heterogeneous climate chain grid complete (mix×article) | **FAIL** | `counts.He: 0`; `He_rows.csv` empty; `He_meanMPR.matrix: []`. LOG: He started after snapshot |
| C3 | **PNG** homo heatmap in results/figures for the thesis | **FAIL** | No `results/figures/`; only `mi_mpr_by_condition.png`, `kstar_by_condition.png`, `b_before_after.png` (graph/B bars). `08_figures/generated_index.txt` is template names |
| C4 | **PNG** hetero heatmap | **FAIL** | Same; He matrix empty |
| C5 | Hetero mixes include expert-class personas | **PASS** (design) | `DEBNATH_MAPPING.md` mix_03+ include `climate_scientist` / `science_journalist`; mixes exist on disk. **Not scored** until He is in `summary.json` |
| C6 | Persona-stratified MPR (not only chain mean) | **FAIL** | No He table; graph mix PI exists in `summary.md` Echo table but is N=1 2-article pilot |
| C7 | Dead/low-event H cells not treated as “accurate” | **FAIL** (reporting) | e.g. `H_rows.csv` `glaciers_retreat` events=1 MI=0; `heatmaps.json` uses 0 not `—` (`heatmap_spec.md`) |

### 1.D k\* (Pack B)

| ID | Requirement | Snapshot | Evidence |
|---|---|---|---|
| D1 | Written definition = network-mean MI>3 irreversible | **PASS** (spec) | `README.md` k\* paragraph; `02_theory/kstar_definition.md`; parser fields in `summary.md` |
| D2 | `none` not plotted/coded as 0 in chapter figures | **FAIL** | Spec warns parser plots may use 0; chapter PNGs are pilot bars (`kstar_by_condition.png`) not the H/He matrix |
| D3 | Right-censoring disclosed (6–8 ticks) | **PARTIAL → FAIL** | `findings.md` mentions 6 ticks; proposal was 15; not a systematic censoring table |
| D4 | Headline is **not** a single N=1 k\*=1 cell | **FAIL** if `findings.md` is pasted | `findings.md`: “textbook irreversible k\*” language flagged in `overclaim_watch.md` |
| D5 | Node k\* not substituted for network k\* on mixed graphs | **PASS** (parser design) | `kstar_definition.md` §5; `A_sf_mix` chemtrails network k\* none / recovered true in `A_rows.csv` |

### 1.E Topology, intervention, echo (Packs D–E)

| ID | Requirement | Snapshot | Evidence |
|---|---|---|---|
| E1 | Graph factorial on **≥6** climate articles or N≥3 on 2×2 | **FAIL** | `A_rows.csv`: 2 articles only (`scopex_2017`, `chemtrails_gates_2018_2021`); 6-tick pilot dirs `A_*_02-49` / `03-02` / `03-06`. LOG target 6 articles / 8 ticks **not** in `summary.json` |
| E2 | Invalid cascades excluded (events≤2 or 0 LLM calls) | **FAIL** | `A_er_mix` chemtrails: 1 event, MI=0 still in table; `D_echo_mix`: 0 calls in `summary.md` LLM usage, still listed in Echo table |
| E3 | Dead-cell rate <20% of **reported** graph cells | **FAIL** | 2 of 8 A rows invalid or empty (25% of A article-rows); D 100% dead. `confounds.md` F5 |
| E4 | Exp B identified (control + matched windows + n=5 or withdrawal) | **FAIL** | B: n=1 and n=3 only; n1 `n before = 0`; n3 after>before (`summary.md` Experiment B). No control arm |
| E5 | Echo claims only on live mixed graphs; homophily=1 not echo | **FAIL** if D used; **PASS** if D excluded | `findings.md` correctly calls D unusable **and** still discusses homophily 1.0. Echo table includes D homophily 0.9 |

### 1.F Instrument (Pack H)

| ID | Requirement | Snapshot | Evidence |
|---|---|---|---|
| F1 | Human dual-rated n≥20 on climate rewrites | **FAIL** | `human_eval_template.csv` present, ratings empty (`validity_protocol.md`) |
| F2 | Spot-check ≥8/10 sane | **FAIL** | `spotcheck_sample.md`: **6/10** sane; S02 MI=0 on inversion |
| F3 | Fail-open parse closed or MI=0 conspiracy texts audited | **FAIL** | `threats.md` T3; `src/` not to be patched from this folder; S02 unidentified |
| F4 | Auditor temperature 0 / no leaked GT / different-family judge | **FAIL** | Campaign: both models `gpt-4o-mini`; GT in prompt; T=0.7 (`threats.md` T1–T2) |

### 1.G Theory, statistics, kitchen-sink

| ID | Requirement | Snapshot | Evidence |
|---|---|---|---|
| G1 | Pfeffer 2014 cited as **seven** factors; six knobs = remapping | **FAIL** (proposal/campaign titles) | Proposal p.1 “six structural factors”; `pfeffer_mapping.md` “six-factor mapping”; `related_work.md` already warns |
| G2 | Held knobs not reported as confirmed | **FAIL** if six-factor generative model claimed | Surprise **held** drip; temporal **held** 8/6 ticks (`pfeffer_mapping.md`) |
| G3 | No p-values / Cohen’s d on N=1 | **PASS** (results files) | `summary.md` descriptive; `thesisGrade: false` |
| G4 | EMNLP Ext. 10–12 / IFD continuous / bots / digital twin **not** listed as thesis contributions | **FAIL** (repo) | `README.md` Overview + Ext. 10–12; closing sentence “all extensions were developed as part of the EMNLP 2025 submission” / thesis confusion |
| G5 | Related-work backbone exists for the student to write Ch2 | **PASS** (discovery) | `01_literature/related_work.md`, `gap_map.md`, `bibliography.bib`. **Thesis PDF still unwritten → Ch2 FAIL until bound** |

### 1.H Snapshot meta

| ID | Requirement | Snapshot | Evidence |
|---|---|---|---|
| H1 | `summary.json` `"thesisGrade": true` only if this file would be all PASS | **PASS as false** | `"thesisGrade": false` is the correct machine flag |
| H2 | Real LLM, cost logged | **PASS** (pilot+H) | `summary.md` LLM usage; H ~2851 calls in header; manifests `mode: real` |
| H3 | Findings do not exceed tables | **FAIL** | `overclaim_watch.md` vs `findings.md` (valence causal, “buffered,” “textbook,” “hint”) |

---

## 2. Scoreboard (eligibility, not a grade)

| Block | PASS | FAIL | Block result |
|---|---|---|---|
| 1.A Prior fence | 1 | 3 | **FAIL** |
| 1.B Data honesty | 5 | 0 | PASS (docs; keep it) |
| 1.C Homo/hetero | 2 | 5 | **FAIL** |
| 1.D k\* | 2 | 3 | **FAIL** |
| 1.E Topology/B/echo | 0 | 5 | **FAIL** |
| 1.F Instrument | 0 | 4 | **FAIL** |
| 1.G Theory/kitchen | 2 | 3 | **FAIL** |
| 1.H Meta | 2 | 1 | **FAIL** |

**ACCEPTANCE_1_0 = FAIL.**  
**If submitted tomorrow as a finished thesis on this snapshot:** honest band **2.3** (careful pilot write-up) to **2.7+** (if K5 venue inflation, K7 extensions, and `findings.md` causal language survive). **1.0: no. 1.3: no. 1.7: no.**

---

## 3. Bars that maximize P(1.3–1.7) — campaign must hit these next

Flip these from FAIL to PASS **without** claiming 1.0:

1. **A2** Bibliographic hygiene: LASS@CIKM 2025 + arXiv:2511.10384; kill `10.1145/3627673` badge.
2. **A4** Hand-written contribution split.
3. **C2–C4** Parse He; emit both heatmaps as PNGs; hatch zeros.
4. **E2–E3** Drop dead A/D cells from inference.
5. **E4** Withdraw dose–response **or** add control + estimator (n=5 optional if withdrawn).
6. **G1–G2** Remapping table; held = untested.
7. **G4** Contributions = climate campaign only.
8. **H3** Rewrite `findings.md` per `overclaim_watch.md` before any chapter paste.
9. **D3–D4** Censoring table; no textbook k\*=1.
10. Keep **B1–B2** (no fake 814k). One false clustering sentence resets the grade to misconduct.

That package, plus strict prose, is how P(1.3–1.7) rises. It does not make 1.0 likely.

---

## 4. Extra bars for a *possible* 1.0 (all still FAIL)

From `grade_1_0_rubric.md` §3:

| Extra | Snapshot |
|---|---|
| Human κ on propaganda cut (Pack H) | **FAIL** |
| Fail-closed + no leaked GT + T=0 (or ablation) | **FAIL** |
| N≥3 or mini-vs-4o ablation | **FAIL** (`grid` N=1) |
| Matched surprise **or** temporal add-on | **FAIL** (held) |
| Identified intervention | **FAIL** |
| Echo as live outcome, not D corpse | **FAIL** |
| CSS-journal related work in the **PDF** | **FAIL** (notes exist) |

Until these move, talk of 1.0 is vanity.

---

## 5. What the snapshot *does* have (do not throw away)

These are real, and they are **not** a 1.0:

- Real `gpt-4o-mini` climate H 12×12 (`H_rows.csv`, 144 rows).
- Real graph pilot 2×2×2 with non-zero MI (`A_rows.csv`; `campaign_manifest.json` usage lines).
- Documented no-814k (`SOURCES.md`).
- k\* specification on disk (`kstar_definition.md`).
- Discovery literature pack (`01_literature/`).
- `"thesisGrade": false` — leave it until this file would be all PASS.

---

## 6. Examiner verdict (one paragraph)

The campaign is a **real-LLM climate pilot** plus a **homogeneous 12×12 chain grid**, sitting on a co-authored **LASS workshop** engine. It is not a completed operationalisation of Pfeffer’s firestorm theory, not a Debnath 814k re-analysis, and not a CIKM-main paper. Heterogeneous climate heatmaps are missing from the results snapshot; graph and intervention cells are N=1, short-horizon, and partly invalid; the auditor is unvalidated and fail-open. Venue inflation in the README is already a credibility problem. **1.0 cannot be guaranteed by agents and is not available on this snapshot.** Maximize P(1.3–1.7) by finishing He, publishing both climate heatmaps, fencing LASS, dropping dead cells, withdrawing unidentified B claims, and writing like CSS. Treat 2.0–2.3 as the honest default until those bars move.

---

*Binary examiner gate. Re-score only when `summary.json` `generatedAt` changes and the PDF exists. Do not run experiments from this folder. Do not edit `src/`.*
