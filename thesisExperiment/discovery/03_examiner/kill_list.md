# Kill list — claims that cap the grade

**Use.** If a sentence in the bound thesis matches a row below, the **ceiling** in the right column applies until the sentence is deleted or rewritten as PRIOR / limitation. This is not a style guide. These are the ways a CSS examiner at this chair stops reading generously.

**Companion.** Reprint sentences: `../01_literature/do_not_reprint.md`. Overclaim audit of the current findings page: `../11_redteam/overclaim_watch.md`.

**Honesty.** Avoiding every kill item does **not** produce a 1.0. It only prevents a self-inflicted 2.7–5.0. The scientific bars are in `grade_1_0_rubric.md` and `ACCEPTANCE_1_0.md`.

---

## K1 — Reprinting Maurya et al. as thesis Results

**What it looks like.** Results/Discussion using Young Parent MPR ≈ 5.48; crime0 MPR ≈ 4.2; (47, 97, 66) tier counts; education1 anomaly; “≈85% of heterogeneous branches reached propaganda”; “inflection between nodes 5–9” on 30-hop chains; “this thesis introduces an auditor–node framework / MI / MPR.”

**Why it caps.** Those numbers are **already published** (LASS@CIKM 2025 / arXiv:2511.10384). Presenting them as the master’s empirical contribution is dual submission of the same study. The climate campaign has a different corpus, hop budget, and (so far) no He heatmap.

**Evidence the reprint is tempting.** Repo `README.md` “Reproducing Paper Results”; `do_not_reprint.md` red list; proposal §7 treats CIKM as “foundational” then the gap table still sounds like the thesis *introduces* the auditor.

**Ceiling.** **3.0** if Results is mostly LASS; **5.0** if climate tables contain LASS digits without citation. Allowed: cite in Related Work / Prior Work only.

**Rewrite.** “Maurya et al. (2025) showed … on general-news linear chains. This thesis does not reprint that grid.”

---

## K2 — N=1 overclaim (confirmatory language on a single draw)

**What it looks like.** “Homogeneous conspiracy networks produce irreversible k\*=1”; “identity mix buffers firestorms”; “consistent with Pfeffer valence”; “harder to walk back”; “hint of dose–response”; p-values, Cohen’s d, “significant,” “replicates,” “robust.”

**Why it caps.** `summary.json`: `"thesisGrade": false`, N=1, `gpt-4o-mini`, 8 nodes. Completions at temperature 0.7. Mixed ER × chemtrails died after **1 event** (`results/tables/A_rows.csv`). One cell (`A_sf_hom` × chemtrails, k\*=1) is story selection (`04_stats/limitations_stats.md`).

**Ceiling.** **2.7** for causal/population language on this design; **2.3** if the same numbers are labelled a case-study pilot. 1.x is incompatible with N=1 confirmatory claims.

**Rewrite.** “In this run, …”; “compatible with, not a test of”; report the full matrix including null k\* and dead cells.

---

## K3 — Dry-run (or fail-open) MI as evidence

**What it looks like.** Any table/figure/finding that includes MI ≡ 0 from `--dry-run`, mock auditor all-correct, or parse-error default-to-correct (`Auditor._getIFDScores` catch). Early run dirs `runs/A_*_2026-09-18_02-34-*` are plumbing risk.

**Why it caps.** Dry-run is defined to look like perfect fidelity. Fail-open parse is the same bias. A misinformation thesis that treats measurement failure as truth is not CSS.

**Evidence.** `09_auditor/threats.md` T3; `parse_results.js` INVALID path; `campaign_manifest.json` `"mode": "real"` for the reported A/B/D (keep it that way). Spotcheck S02: conspiracy rewrite scored MI=0 (`spotcheck_sample.md`).

**Ceiling.** **5.0** if dry-run is knowingly reported as LLM results. **3.0** if mixed into aggregates “by accident.” There is no 1.x with unidentified MI=0 events in the headline k\*.

---

## K4 — Fake 814k HDBSCAN / hydrated Debnath dump

**What it looks like.** “We clustered 814,924 tweets with HDBSCAN”; “empirical BP centroids”; “Skip-gram embeddings re-estimated”; “reconstructed cascades via conversation_id”; “digital twin of Debnath”; any figure that is a restyled Debnath 2023 plot claimed as this thesis’s clustering.

**Why it caps.** The public artefacts are **tweet IDs**. OSF `dataset.csv` ≈ 662 MB was **not** downloaded (`data/SOURCES.md` fallback 1 and 6). `data/derived/debnath_bps.md`: clustering **not run**. GitHub `debnath_geoeng/` is analysis **code**, not tweets. Proposal Phase I described HDBSCAN as if it would happen. Doing it in prose without doing it in data is fabrication.

**Ceiling.** **5.0** (misconduct). Honest limitation is **2.0–1.3 compatible**. Theory-faithful BP reductions are allowed if named as such.

**Forbidden half-measures.** Running HDBSCAN on 40 ClimateFEVER rows or on Wikipedia abstracts and calling it “the Debnath dump.”

---

## K5 — Venue inflation: LASS workshop vs CIKM main

**What it looks like.**

- Badge/title: “CIKM 2025 Outstanding Paper” linking `https://dl.acm.org/doi/proceedings/10.1145/3627673` (`README.md` line 5). That DOI is **CIKM 2023 proceedings**, not 2025, not LASS.
- Proposal p.1: “Maurya et al. (ACM CIKM 2025, Outstanding Paper Award)” without workshop in the same sentence.
- Bibliography `booktitle = {Proceedings of the 34th ACM … CIKM}` as if main-track long paper.
- CV/thesis front matter: “published at CIKM” when the archival record is **1st Workshop on LLM Agents for Social Simulation (LASS) @ CIKM 2025**, arXiv:2511.10384.

**Why it caps.** Pfeffer’s chair notices venue. Workshop outstanding paper is a real honour. Calling it CIKM main is a **credibility kill** that makes every other claim suspect. Wrong DOI is sloppy measurement — the chair’s topic.

**Ceiling.** **2.7** if uncorrected in the submitted PDF; **2.3** if corrected everywhere including README before binding. A 1.0 manuscript with a fake main-track citation will not stay 1.0 after the examiner googles it.

**Required bibliographic form.**  
Maurya, R. G., Shukla, V., Dandekar, R. A., Dandekar, R., & Panat, S. (2025). *Simulating Misinformation Propagation in Social Networks using Large Language Models.* **LASS workshop**, ACM CIKM 2025 (Seoul). arXiv:2511.10384. Outstanding Paper **at LASS**, if still true on the workshop page.

---

## K6 — Missing or inverted related work

**What it looks like.** Related work = Generative Agents + own LASS paper + Debnath DOI. No Pfeffer 2014 factor list (or the **wrong** six-factor list attributed to 2014). No Ruths & Pfeffer 2014. No concurrent 2025 LLM-misinfo simulators. No LLM-as-judge validity literature. Claiming “first computational operationalisation of all six factors” while omitting that 2014 has **seven** and that detection/scale papers already exist (Drasch 2015; Nuortimo).

**Why it caps.** A Data & Society thesis is graded on whether the student can place a claim. The supervisor wrote the firestorm paper. Mis-citing it is not a small error.

**Ceiling.** **2.7** for a thin RW chapter; **2.3** if RW is long but still attributes the six-knob list to Pfeffer 2014. 1.x requires the remapping table (`related_work.md` §1.2).

---

## K7 — Kitchen-sink twelve extensions (EMNLP systems thesis)

**What it looks like.** Contribution list includes: node cognition, frame analysis, network co-evolution, strategic agents, opinion dynamics, institutional trust, bot resilience (Ext. 10), emergent polarisation cycles (Ext. 11), digital twin / FakeNewsNet (Ext. 12), IFD continuous mode, Society DSL, `--ab-test` Cohen’s d on crime articles — **without climate identification of any of them**.

**Why it caps.** `README.md` Overview and Ext. 10–12 are an **EMNLP systems** pitch. This master’s is supposed to be a **climate-firestorm CSS** question. Examiners read unused flags as padding. Cohen’s d on N=1 is undefined (`limitations_stats.md`). Digital twin without hydrated tweets is theatre.

**Ceiling.** **2.7** if Ch4/Ch7 are an extension catalogue; **2.3** if extensions are one paragraph “present in `index.js`, not used.” 1.x lists **only** thesis-layer items (climate pack, Debnath BPs, Pfeffer knobs, k\* parser, campaign that ran).

**Proposal collision.** Proposal promised SQLite persistent memory, external BP pipeline, ClimateFEVER demo, cascade cross-validation. Unbuilt items belong in Limitations as **withdrawn**, not in Contributions as “infrastructure.”

---

## K8 — “Pfeffer’s six factors” as 2014 canon

**What it looks like.** “Pfeffer, Zorbach & Carley identified six structural factors: valence, surprise, identity alignment, network clustering, information echo, and temporal acceleration” (proposal p.1, `pfeffer_mapping.md` title).

**Why it caps.** Primary paper lists **seven**: speed/volume, binary choices, network clusters, unrestrained flow, lack of diversity, **cross-media**, network-triggered decisions (`related_work.md` §1.2). Valence/surprise/identity are a **thesis remapping**. Silent remapping = the student did not read the supervisor’s paper.

**Ceiling.** **2.3** if the table exists but the prose still says “Pfeffer’s six”; **2.7** if cross-media is claimed simulated (no legacy-media agent). 1.x: cite seven, show six knobs, name the hole.

---

## K9 — Echo chamber *emergence* when echo was an input (or a dead cell)

**What it looks like.** “Echo chambers emerged from BP–network interaction” (proposal Table 1). Citing `D_echo_mix` homophily 0.9 or homogeneous homophily 1.0 as echo evidence. Citing conspiracy-cut modularity higher on homogeneous graphs.

**Why it caps.** Homophily=1 is tautological (`11_redteam/confounds.md` §4). `D_echo_mix`: **0 LLM calls**, 1 event (`summary.md`; `findings.md`). Topology costume, not discourse. `enableNetworkEvolution` is not the climate grid. Proposal Exp D asked t={10,30,50}; campaign has 6–8 ticks.

**Ceiling.** **2.7** for emergence claims; **2.3** if D is reported as a failed cell and PI is labelled a persona-gap, not “echo.”

---

## K10 — Intervention / continued-influence as identified

**What it looks like.** “Belief-correction resistance increases with n”; “fact-check at k∗−1 arrests MPR”; Lewandowsky “replicated in an LLM society”; n=3 max MPR 3.00 vs n=1 max MPR 3.83 as a law.

**Why it caps.** `B_sf_mix_n1`: **n before = 0**. `B_sf_mix_n3`: after-mean MI **higher** (2.15 vs 1.14) on 104 vs 7 events — cascade volume, not correction (`summary.md` Experiment B). n=5 not run. No no-injection control.

**Ceiling.** **2.7** for causal correction claims; **2.0–1.7** if B is a methods failure analysis. 1.0 needs an identified estimator (`must_have_evidence.md`).

---

## K11 — k\* theatre (truncated ticks, MI=3 recoded, 0 for none)

**What it looks like.** k\*=0 meaning “no tip”; MI=3 called propaganda; 6-tick last-point spike called irreversible firestorm; chain hop-inflection from LASS reused as climate k\*; node-level k\* substituted for network k\* to make mixed graphs look like they tipped.

**Why it caps.** Spec: `kstar_definition.md`. Propaganda is **MI>3**. Undefined is `none`. Irreversibility on 6 ticks is **right-censored**. Mixed graphs can have conspiracy-node propaganda while network k\* is none — that is the finding to report, not to erase.

**Ceiling.** **2.3** for sloppy definition; **2.7** if k\* is massaged to fit the proposal.

---

## K12 — ClimateFEVER / Wikipedia / paper-quoted slice as 814k analysis

**What it looks like.** “Cross-corpus validity demonstrated on ClimateFEVER (1,535 claims)” when the slice is unused in A (`SOURCES.md`; `chapter_skeleton.md` §5.1). Treating `debnath_paper_slice.json` as a cascade graph.

**Ceiling.** **2.7** if implied as run; fine if “downloaded, not in the factorial.”

---

## K13 — Model and protocol laundering (mini as 4o; graphs as CIKM replication)

**What it looks like.** “We replicated the outstanding paper” on `gpt-4o-mini`, 8-node BA/ER, 5 QA, 8 hops. Hetero mixes without experts claimed as CIKM-style. Probe 2-node chain (MPR 0.00 in `campaign_manifest.json` probe stdout) sold as Exp (a).

**Ceiling.** **2.7**. Conceptual replication has a separate bar (`11_redteam/replication_of_cikm.md`): chains, ≥10 articles, expert-inclusive hetero, heatmaps, per-type MPR. Pilot: **NOT TESTED**. H-only snapshot: homo arm only.

---

## K14 — Co-author / EMNLP work claimed as sole master’s contribution

**What it looks like.** “I developed the society simulation framework and all extensions as part of this thesis” (`README.md` closing). Hiding Shukla, Dandekar, Panat. Counting unpublished EMNLP under review as thesis Results.

**Ceiling.** **3.0–5.0** depending on the declaration. TUM requires individual contribution. Fill `10_repro/individual_contribution.md` with names. Engine = cite. Climate campaign = thesis if it actually ran.

---

## K15 — Keyword taxonomy as Debnath piggyback “finding”

**What it looks like.** Exp C regex `climate_justice_hijack` cited as reproducing Debnath’s 2018–2021 semantic broadening / piggyback.

**Why it caps.** Personas are **instructed** to use those hashtags. Keyword overlap is prompt compliance (`findings.md` already says heuristic; `overclaim_watch.md` still flags the parenthetical).

**Ceiling.** **2.3** if called a classifier or an empirical replication; OK as exploratory tags.

---

## Quick examiner scan (print this page)

| If the PDF contains… | Cap |
|---|---|
| Young Parent / crime0 / 85% hetero in Results | 3.0–5.0 |
| Dry-run or fail-open MI in tables | 3.0–5.0 |
| HDBSCAN on 814k (not done) | 5.0 |
| “CIKM 2025” as main track + DOI 10.1145/3627673 | 2.7 |
| “Pfeffer’s six factors” without remapping | 2.3–2.7 |
| 12 EMNLP extensions as contributions | 2.7 |
| N=1 “proves” / “significant” / textbook k\*=1 | 2.7 |
| Echo emergence from dead D cell or homophily=1 | 2.7 |
| Fact-check dose–response from B n=1/n=3 | 2.7 |
| Honest pilot, no reprint, no fake cluster | **2.3 default** (see rubric) |

---

*Adversarial examiner file. Write the thesis as if every sentence will be checked against `results/summary.json` and the 2014 PDF.*
