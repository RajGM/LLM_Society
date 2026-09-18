# Grade rubric — TUM CSS chair (Pfeffer), this thesis only

**Programme.** TUM School of Social Sciences and Technology, M.Sc. Data & Society.  
**Supervisor.** Prof. Dr. Jürgen Pfeffer, Chair of Computational Social Science.  
**Co-supervisor.** Dr. Ramit Debnath, CHIA, University of Cambridge.  
**Scale.** German 1.0–5.0 (1.0 *sehr gut*; 4.0 last pass; 5.0 fail).  
**Object.** A master’s thesis in **computational social science**, not a software demo, not a workshop reprint, not an LLM playground.

**Honesty first.** No agent, rubric, or campaign checklist can guarantee a 1.0. The grade is assigned by examiners after reading the bound thesis and hearing the defence. This file states what *this chair* has historically treated as *sehr gut* work in CSS, and what would be required for *this* topic to even be *eligible*. Previous internal review: **1.0 is unlikely; 2.0–2.3 is the honest default** if the student writes a careful, non-reprint climate-firestorm thesis. That default still stands on the 18 September 2026 snapshot.

---

## 0. What this chair grades (and what it does not)

Pfeffer’s line of work (firestorms 2014; *Science* sampling caution with Ruths 2014; Twitter Sample API integrity 2018) is **measurement + social mechanism**, not product engineering. Debnath’s line is **empirical climate/geoengineering publics**. A 1.0 here looks like a short, publishable CSS paper: a clean theoretical question, an honest operationalisation, a design that can actually falsify the claim, and limitations a measurement scientist would sign.

| This chair rewards | This chair punishes |
|---|---|
| Precise theory → knob mapping, including what was **not** swept | “Pfeffer’s six factors” as if 2014 listed valence/surprise |
| New **domain evidence** (climate/geoengineering) with a stated PRIOR boundary vs the LASS paper | Reprinting Young Parent / crime0 / 85% hetero propaganda as thesis Results |
| Measurement validity of the DV (MI, k\*) | LLM-as-judge circularity left untested |
| Data honesty (IDs ≠ tweets; no fake clustering) | Fake 814k HDBSCAN, hydrated-cascade cosplay |
| Individual contribution vs co-authors, named in one page | Engine + EMNLP kitchen-sink sold as the master’s work |
| Related work that includes concurrent 2025 LLM-society papers | Related work that is only Generative Agents + own CIKM paper |
| Reproducible configs, seeds, fail-closed auditor | Dry-run MI=0, dead cascades averaged as “no propaganda” |

A polished GitHub README, 12 engine extensions, and a CIKM-gold badge are **not** a thesis. If the bound PDF reads like `README.md` (layers, bots, digital twin, IFD, Society DSL), the scientific grade caps regardless of code quality.

---

## 1. Grade portraits for *this* topic

The portraits assume English body ~60–80 pages, TUM statutory declaration, and a defence. They are **not** a bargaining menu. Missing a 1.0 bar does not automatically yield 1.3; overclaiming a 1.7 manuscript is how it becomes 2.3.

### 1.0 — *sehr gut* (exceptional; rare for a 3-month M.Sc. that already has a co-authored workshop paper)

A 1.0 on **this** topic would be independently citable as CSS, not as “we also ran the engine on climate.” Examiners can answer yes to all of:

1. **Question.** One primary RQ a CSS reader can repeat: whether a *generative* operationalisation of firestorm conditions produces a measurable, irreversible tipping clock \(k^*\) on *scientific* misinformation, and whether that clock is invariant to identity mix and topology. Not “we built an open-source society.”
2. **Theory.** Pfeffer et al. (2014) cited for the **seven** factors and the firestorm definition. The thesis six knobs are labelled a **remapping**. Cross-media is a named hole. No sentence of the form “Pfeffer identified six factors: valence, surprise…”.
3. **Prior work fence.** Maurya et al. is **LASS@CIKM 2025** (workshop), not CIKM main. Outstanding Paper, if claimed, is attributed to LASS. Crime/news linear-chain numbers never appear in Results. Individual vs co-author split is explicit (engine + LASS grid vs climate-firestorm campaign).
4. **New evidence object.** Homogeneous vs heterogeneous **linear chains on a new climate corpus** (persona×article and mix×article heatmaps), plus a networked factorial (topology × mix × valence) with \(k^*\) defined *before* seeing the cells. Heatmaps are climate data, not CIKM Fig. 3 with new colours.
5. **Design that can fail.** Held knobs (surprise, temporal acceleration) are either swept in a matched add-on or declared untested. Echo is measured on graphs that actually talked. Intervention has a control and a non-confounded estimator. Dead cells are excluded, not interpreted.
6. **Instrument.** Human–auditor agreement on a frozen climate rewrite sample (dual-rated, κ or percent-agreement on the MI>3 cut). Fail-open parse → MI=0 is closed or every MI=0 is audited. Generator and judge are not the same unvalidated loop, or the loop is quantified.
7. **Statistics.** N and model on every figure. No p-values on N=1. Primary DVs pre-specified. No “textbook k\*=1” from a single 6-tick series.
8. **Data.** Debnath 814,924 tweets: IDs not hydrated, HDBSCAN **not run**, BPs theory-faithful. That limitation is in Methods, not a footnote after a “we clustered users” sentence.
9. **Related work.** Firestorm measurement after 2014; Debnath 2023; cascade/opinion models; LLM societies (Simulacra → Generative Agents → AgentSociety); LLM-as-judge threats; **concurrent** 2025 misinfo-agent papers (MOSAIC/FUSE/rumour agents). Gap paragraph does not claim chronological priority over the student’s own LASS paper.
10. **Writing.** Claims match tables. Limitations read like Ruths & Pfeffer (2014): what the platform/instrument cannot support. Ethics: no dual-use playbook, no named users.

A 1.0 is **not** “all proposal Phase I–III done.” Hydrating 814k tweets is neither necessary nor sufficient. A 1.0 *is* a complete, honest, falsifiable CSS argument on the climate object.

**If any of the following is true, 1.0 is off the table:** reprint; venue inflation left in title/CV/citation; fake clustering; dry-run in Results; kitchen-sink of unused EMNLP extensions as contributions; N=1 presented as confirmatory; auditor validity zero; related work missing the 2014 paper’s actual factor list.

### 1.3 — *sehr gut* (very strong; still exceptional)

Same scientific object as 1.0, with **one** admitted hole that does not destroy identification:

- N=1 everywhere, but sign-stable across **≥10 climate articles** on chains and a full 2×2 topology×mix on graphs, with dead cells <10% and excluded; **or**
- Auditor human sample exists but κ is modest (e.g. 0.4–0.6) and k\* is caveated; **or**
- Surprise **or** temporal acceleration remains held, and the text never says “six factors confirmed.”

Still required: LASS vs CIKM main correct; no reprint; no fake 814k; heatmaps on climate H **and** He; k\* definition in Methods matching the parser; individual contribution page; Pfeffer 7→6 remapping table.

A 1.3 is the **best realistic target** if the campaign finishes He, produces both heatmaps, fixes Exp B language, validates the auditor on ≥20 items, and the student writes like a CSS paper rather than a systems paper.

### 1.7 — *gut* (good to very good; strong master’s)

A real CSS thesis with incomplete identification. Examiners see a **new domain evaluation** of a prior instrument, not a new theory of firestorms.

Typical 1.7 package:

- Climate H grid complete; He complete enough for a homo>hetero **directional** statement with persona-stratified MPR (not only mean dilution).
- Network A: SF vs ER × hom vs mix on **more than two** articles, or on two articles with N≥3. k\* used as a clock with right-censoring disclosed (6–8 ticks ≠ 30-hop plateau).
- Exp B reported as **confounded**, not as Lewandowsky replication.
- Pfeffer knobs: three swept (valence, identity, clustering), two held, echo measured not emerged.
- Related work adequate (Pfeffer 2014 correctly; Debnath; LASS as prior; at least some concurrent agent-sim papers).
- Limitations chapter does the work; Results do not smuggle “consistent with Pfeffer valence.”

1.7 dies if the student still calls the venue “CIKM 2025 outstanding paper” without “workshop,” or pastes CIKM numbers into Ch7.

### 2.0 — *gut* (solid pass of the scientific bar)

Meets the master’s contract: a bounded question, a method, new climate stimuli, honest N=1, no fraud.

- Engine cited as Maurya et al. (LASS@CIKM 2025). Thesis contribution = climate seeds + Debnath-reduced BPs + Pfeffer knob table + whatever cells actually ran.
- H heatmap exists; He missing or thin → chain contrast is **incomplete**, stated as such.
- Graph pilot (2×2×2) is a **case study**, not a factorial law.
- No human auditor study. MI treated as an engineering score, not a validated misinformation index.
- Proposal over-promise (HDBSCAN, SQLite memory, cascade twin, ClimateFEVER, n=5, t=50) is **withdrawn in writing**.

This is a **defensible 2.0** if the prose is strict. It is also the floor of the “honest default” band.

### 2.3 — *gut* (honest default if writing is careful but science is a pilot)

The 18 September 2026 snapshot, written without reprint and without fake 814k, is **at best 2.3** as a finished thesis:

- Real `gpt-4o-mini` MI on climate seeds (non-zero, persona-sensitive) — necessary, not impressive.
- H 12×12 exists in `summary.json`; He **not in the results snapshot**; heatmaps.json has empty `He_meanMPR`.
- Graph A still the 2-article 6-tick N=1 pilot; `A_er_mix` chemtrails and `D_echo_mix` invalid.
- Exp B has no pre-period at n=1 and a volume confound at n=3.
- Auditor spot-check 6/10 sane (`discovery/09_auditor/spotcheck_sample.md`); human CSV empty.
- Surprise and temporal acceleration held; six-factor generative model **not tested**.

2.3 is not an insult. It is “competent master’s project, measurement and design not yet at *sehr gut*.” Moving the same snapshot to 2.0 requires better writing and contribution fencing, not more adjectives. Moving it to 1.7 requires **new valid evidence**, not a longer related-work chapter.

### 2.7 and below — where this thesis goes if the student is greedy

| Grade | Typical path |
|---|---|
| **2.7** | Kitchen-sink chapters (bots, digital twin, IFD, 12 extensions) with no climate identification; or He never finished and chain claims still made; or Pfeffer “confirmed.” |
| **3.0–3.3** | Results chapter is the LASS paper with climate adjectives; or dry-run / dead-cell averages; or 814k clustering described as done. |
| **3.7–4.0** | Unreadable, unreproducible, or contribution cannot be separated from co-authors. |
| **5.0** | Academic misconduct: invented HDBSCAN, dry-run as real LLM, CIKM numbers as new measurements, or hidden co-author text. |

---

## 2. Bars that maximize P(1.3–1.7) — do these even if 1.0 stays out of reach

These are the **scientific** bars. They do not purchase a 1.0. They make a 1.7 *available* and a 1.3 *possible*. Skip them and the honest default remains 2.0–2.3.

1. **Fence the prior paper.** Title, abstract, Ch1, Ch4, bibliography: *LASS workshop at CIKM 2025*, arXiv:2511.10384. Remove or correct the README badge that links CIKM 2023 proceedings `10.1145/3627673`. Never “we introduce MI/MPR” in the thesis.
2. **Finish the climate homo/hetero object.** H **and** He on ≥10 climate articles; both heatmaps as PNGs in the thesis, not only `heatmaps.json` for H. Hetero mixes include expert-class personas (already in the 12-id list). Report persona-stratified MPR so “mix buffers” is not seat-count dilution.
3. **Define k\* once, use it always.** Methods quotes `discovery/02_theory/kstar_definition.md`: network-mean MI>3, irreversible, `none` ≠ 0, 6–8 ticks = right-censored. Plot grey for undefined. Do not crown `A_sf_hom` chemtrails k\*=1 as the result of the thesis.
4. **Invalid cells out.** `events ≤ 2` or `LLM calls = 0` excluded from aggregates (`A_er_mix` chemtrails; `D_echo_mix`). If dead-cell rate ≥20%, do not interpret topology.
5. **Exp B: estimator or silence.** No recovery/dose–response language without matched windows, per-node pairing, and a no-injection control. Current n=1/n=3 table is a methods warning.
6. **Pfeffer remapping table in Ch3.** Seven 2014 factors → six knobs; swept / held / measured; cross-media omitted. Held factors are limitations, not Results.
7. **No-814k paragraph in Ch5.** Mendeley IDs, OSF ~662 MB not downloaded, BPs theory-faithful. One sentence: clustering was **not** performed.
8. **Related work that a Pfeffer student must have.** 2014 firestorm paper (actual factors); Ruths & Pfeffer 2014; Debnath 2023; Vosoughi-class cascade facts as *contrast* not replication; LLM-society lineage; LLM-as-judge; concurrent 2025 agent-misinfo systems. Gap map: what *this* thesis uniquely shows.
9. **Individual contribution.** One page: co-authors own the engine and LASS grid; the student owns climate corpus, Debnath BPs, Pfeffer knobs, k\* campaign, thesis prose. Fill `discovery/10_repro/individual_contribution.md` for real names/roles.
10. **Limitations that match the data.** N=1, mini vs gpt-4o, generator–judge overlap, hop compression, prompt obedience vs belief, failed echo cell. No “future work” that re-promises the proposal’s Phase III twin.

---

## 3. Extra bars for a *possible* 1.0 (still not a guarantee)

Do the §2 bars first. Then, and only then, these extras change eligibility from 1.3-ish to 1.0-*possible*. Missing two of them keeps the ceiling at 1.3.

| Extra bar | Why Pfeffer/Debnath would ask |
|---|---|
| **Human criterion validity** on ≥20 dual-rated climate rewrites; report agreement on the propaganda cut, not only mean MI | The DV is the thesis. Unvalidated LLM-as-judge is a 2.3 instrument (`09_auditor/threats.md`). |
| **Fail-closed auditor + temperature 0 + no leaked GT** (or a documented ablation on a frozen bundle) | Fail-open MI=0 and leaked Yes/No are measurement malpractice, not a “limitation.” |
| **N≥3** on a pre-registered subset (at least the headline graph cells and a chain subset), **or** a second model ablation (mini vs 4o) on ≥2 articles | Stochastic completions at T=0.7; one draw is a case. |
| **Matched add-on for at least one held factor** (volume-shock vs drip, **or** slow vs compressed ticks) | Otherwise “operationalise all six factors” is false advertising vs the proposal. |
| **Intervention identified** (control arm, matched post-window, n∈{1,3,5} or a written withdrawal of n=5) | Proposal sold correction resistance; current B cannot identify it. |
| **Echo as outcome on live mixed graphs** (PI trajectory, trust evolution, non-tautological homophily); dead `echo_chamber` cell either rerun or omitted | Proposal sold emergence; `enableNetworkEvolution` false + dead D cell ≠ emergence. |
| **Related-work depth** that could survive a CSS journal review (including what Pfeffer 2014 does *not* give you) | Chair will open the 2014 PDF. |
| **Contribution hygiene** so a co-author could not claim the climate Results | Legal and academic requirement, not etiquette. |

Phase III cascade-twin against hydrated Debnath tweets is **not** a 1.0 requirement. Pretending it was done is a 5.0 path. Omitting it with a measurement-reason (IDs, no API) is 1.3-compatible.

---

## 4. Mapping grades to this repository (snapshot, not prophecy)

| If the bound thesis is… | Likely band |
|---|---|
| Snapshot as of `results/summary.json` 2026-09-18T04:11:22, written greedily (CIKM main, six factors confirmed, k\*=1 textbook, 814k clustered, 12 extensions) | **2.7–5.0** depending on how false the sentences are |
| Same snapshot, written as a real-LLM **pilot** with H heatmap, no He, graph 2×2×2, B confounded, auditor unvalidated | **2.3** (default) |
| He finished + both climate heatmaps + invalid cells out + Pfeffer remapping + LASS fencing + strict prose | **2.0–1.7** |
| Above + auditor validity pack + no six-factor overclaim + k\* caveated + contribution page | **1.7–1.3** |
| Above + extra bars in §3 and a CSS-quality argument | **1.3, 1.0 possible not promised** |

`results/summary.json` currently sets `"thesisGrade": false`. That flag is correct. Do not delete it to feel closer to 1.0.

---

## 5. Examiner one-liners (defence)

- “This is not a software thesis. Where is the **social** finding that is not prompt-obedience?”
- “Pfeffer 2014 has **seven** factors. Show the remapping or retract ‘all six.’”
- “Is this LASS or CIKM main? Why does the README DOI point at 2023 proceedings?”
- “Point to the **heterogeneous climate** heatmap. Not the JSON stub.”
- “k\* on six ticks is right-censored. Why is irreversibility the headline?”
- “Did you cluster 814k tweets?” — only acceptable answer: **no**.
- “Who wrote the LASS experiments?” — if the answer is fuzzy, the grade is not 1.x.

---

*Adversarial examiner note for `thesisExperiment/discovery/03_examiner/`. Does not run experiments. Does not edit `src/`. Does not guarantee a grade.*
