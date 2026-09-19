# Round 2 — Severe final MA examiner report

**Object.** Revised 116-page PDF `thesisExperiment/thesis_final/main.pdf` (rebuild 2026-09-19 17:10 UTC; `pdftotext` 37,016 words; 0 undefined citations/cross-references).  
**Mandate.** Act as a severe final master's examiner. Check whether round-one *critical* risks were addressed. Separate remaining **submission blockers** from **irreducible design limits**. Do not edit the thesis. Do not guarantee a grade.  
**Round-one baselines.** `reviews/round1/01_TUM_COMPLIANCE.md`, `03_METHODS_REPRODUCIBILITY.md`, `04_STATS_MEASUREMENT.md`, `09_VALIDITY_ETHICS.md`, `12_AWARD_JURY.md`, and the post-revision `REVISION_MATRIX.md` (148 accepted / 18 deferred / 0 rejected; no experiment rerun).  
**Examiner stance.** A completed harvest is not a completed thesis. Documentation of a confound is not identification. Candour is a necessary condition for a pass, not a sufficient condition for a distinction.

This report assigns **no grade**. The ranges below are evidence-conditioned forecasts of how a severe TUM MA examiner would likely mark the work *after* the listed blockers are cleared. They are not a promise, a recommended mark, or an examination-office decision.

---

## 1. Verdict

**Not submissible in the present PDF.**

The scholarly overclaim that made round one academically unsafe has largely been *reframed*, not *repaired*. That is the correct manuscript response when no experiment can be rerun. It is not a substitute for a TUM deposit package. The compiled PDF still prints bracketed administrative blanks on the cover, in the front matter, in Chapter 7, and in the appendix. Until those blanks are replaced with official text and a verified individual-contribution statement, the work is not an examinable thesis. A severe examiner would return it unread or refuse to open the oral.

**If, and only if, the P0 checklist in §7 is completed without inventing facts and without new overclaim,** the manuscript is a defensible, unusually transparent **measurement-sensitivity case study** of an inherited auditor–node instrument. It is not a validated study of online firestorms, Twitter diffusion, topology treatment effects, or human misinformation. On that narrowed object, a pass is supportable. A 1.0 / award recommendation is not.

---

## 2. Evidence-based grade range (not a guarantee)

TUM verbal bands used below: 1.0–1.3 *sehr gut*; 1.7–2.3 *gut*; 2.7–3.3 *befriedigend*; 3.7–4.0 *ausreichend*; 5.0 fail / return.

| Condition | Likely severe-examiner range | Why this range, not another |
|---|---|---|
| **Submitted as the current 116-page PDF** | **No mark.** Administrative return. | Cover, declaration, contribution, German abstract, ethics determination, and archive fields still print as `[…]` placeholders (`main.tex:78–83,125–145`; `07_validity_ethics.tex:265–267`; `09_appendices.tex:632–636`). A thesis that advertises “official template to be applied before submission” is not a submission. |
| **P0 cleared; contribution statement is precise, supervisor-confirmed, and shows substantial independent work on the climate layer** | **2.0–2.3 (*gut*)** | Primary contribution is now honestly a measurement audit. Design limits are disclosed rather than denied. Originality remains incremental (inherited engine, MI, MPR). Identification is absent. Human/independent validity is absent. That combination is a solid but not distinguished MA. |
| **P0 cleared; contribution statement is vague, or the independent layer is mainly campaign execution and prose** | **2.7–3.3 (*befriedigend*)** | Reuse of a co-authored auditor–node system without a sentence-level split leaves the examiner unable to credit the candidate for the only technically impressive artefact. The remaining original layer is then a large unreplicated prompt grid plus a constructed hashtag graph. |
| **Optimistic ceiling after P0, if the oral defends the narrow estimand without backsliding into firestorm/topology-effect language** | **1.7** | Possible if the examiner values methodological candour, the API-error forensic, the modularity correction, and the instrument-separation argument as the intellectual centre. Still *gut*, not *sehr gut*. |
| **1.0–1.3 / award** | **Not supported** | See §6. No identified causal contrast, no independent outcome validation, \(N=1\), same-model generator/judge, ~24% HTTP-error counters, and an inherited core method. Documentation of those facts is not an award-level result. |
| **5.0 fail on scholarly content, after P0** | **Not indicated** | The narrowed claims are now largely commensurate with the harvest. A fail would require either an unresolved authorship problem or a relapse into digital-twin / firestorm / causal-topology claims. Return-for-revision is more likely than a content fail. |

**Central forecast after a clean P0, from this examiner:** **2.0–2.3**.  
**Do not treat 1.7 as expected.** Do not treat 2.7 as a worst case if the contribution split remains unresolved: that case is a return, not a low pass.

---

## 3. Were round-one critical risks addressed?

Classification used here:

- **Closed by manuscript** — the claim is now commensurate with the evidence; no new run was required.
- **Disclosed, still material** — the threat remains in the data; the text no longer hides it. Not a prose failure; still a grade limit.
- **Open blocker** — still prevents submission or examination.
- **Irreducible** — cannot be closed without new runs, new annotations, or new empirical data.

### 3.1 TUM / assessment-risk criticals (`01_TUM_COMPLIANCE.md`)

| ID | Round-one critical | Round-two status | Evidence |
|---|---|---|---|
| TUM-01 | Unofficial cover; unfilled identity | **Open blocker** | PDF p. 1 still prints `[CANDIDATE ID]`, `[SUPERVISORS]`, `[SUBMISSION DATE]`, and `[OFFICIAL TUM TEMPLATE TO BE APPLIED BEFORE SUBMISSION]`. `pdfauthor` is `[CANDIDATE NAME]`. Placeholders are now *labelled*, not filled. Labelling is not compliance. |
| TUM-02 | Declaration is a placeholder | **Open blocker** | PDF still: `[OFFICIAL DECLARATION: insert the current statutory TUM wording…]` (`main.tex:141–145`). No originality wording, no AI disclosure, no signature block. Direct deposit veto. |
| TUM-03 | Individual contribution unresolved | **Open blocker (academic + administrative)** | Front matter still: `[CONTRIBUTION SPLIT: insert the verified allocation…]` (`main.tex:133–140`). Methods still: “The verified allocation of individual contributions remains an explicit front-matter submission requirement” (`04_methods.tex:12`). Because MI/MPR/engine are co-authored prior work (`maurya2025simulating`), this is not a courtesy page. Without it the examiner cannot legally attribute the work. |
| TUM-05 | Results cite 19 nonexistent figures | **Closed by manuscript** | LoF now contains Figure 4.1 and Figures 5.1–5.15; Results uses `\includegraphics` + `\Cref`/`\cref` for the previously missing heatmaps and C1 panels. `main.log` has no undefined references. The round-one “Figures 10–22” hard-coded citations are gone. |
| TUM-06 | `meanMI` / MPR conflated; wrong expansion | **Closed by manuscript, residual naming** | Headline is now event-weighted / equal-cell live-cell mean MI; MPR reserved for node/branch means (`main.tex:160–161`; `04_methods.tex:498–578`; Results captions). One leftover: Results still labels the RQ1 section `sec:results-mpr` and several PNG filenames still contain `_mpr` / `_valence`. Captions no longer call cell means a propagation rate. Not a blocker. |
| TUM-09 | Constructed fallback treated as empirical validation | **Closed by manuscript** | Title, abstract, RQ4, D-net Results, Discussion, and Conclusion now call the 63-node object a constructed hashtag-graph **stress test**. DTFS is labelled a failed implementation diagnostic (`isValidated=false`, 0.2754 < 0.70). Residual: DTFS and KS distances remain in the *main* argument (Results, Discussion, Conclusion), not an appendix, contrary to the award-jury P1 instruction. Still not a digital-twin claim. |

### 3.2 Methods / measurement criticals

| ID | Round-one critical | Round-two status | Evidence |
|---|---|---|---|
| METH-1 / VAL-1 / API | 64k HTTP errors omitted | **Disclosed, still material** | Canonical counters now appear in abstract, methods, validity, conclusion: 203,928 successes; 64,270 HTTP-error counters; 121/288 runs; 36,194 unscored eligible events; rewrite fallback; auditor nulls; no observed parse/all-correct fallback (`04_methods.tex:415–439`; `07_validity_ethics.tex:67–89`). Continuous He−H **reverses** under zero-error restriction (\(+0.1549\) → \(-0.0295\)). Dual remains positive. This is a real sensitivity, not a cosmetic caveat. It correctly prevents a collapsed-arm headline. It does **not** restore an undamaged harvest. |
| METH-2 | Ring uses chain action regime | **Closed by manuscript** | Linear chain *and* ring: \(0.10/0.85/0.05\), \(\tau=0.08\) (`04_methods.tex:210–247`; appendix). Topology rankings are now explicitly bundled protocol contrasts. The confound remains in the design (irreducible). |
| METH-3 | Five He mixes not realised on echo/polarised/hierarchical | **Closed by manuscript** | Filtering/cycling and polarised index/group mismatch are stated (`04_methods.tex:146–154`; Figure 5.7 caption). H vs He is a bundled assignment contrast. The 216 affected cells are still in the tables. |
| METH-4 / DEB | D-net pools duplicates; “four primary cells” | **Closed by manuscript** | Four configs / eight article cells throughout. 16-cascade KS/DTFS kept as implementation diagnostic with \(n_{\mathrm{real}}=1\). Structural averages still pool 16 cascades; the text now says so. |
| STAT-1 | Discrete/continuous not equivalent scales | **Closed by manuscript** | Missing-item 1 vs 0.5 and non-equivalent \(\mathrm{MI}>3\) are in the abstract, Results opening, Discussion RQ1, and Conclusion. This is one of the revision’s genuine intellectual gains. |
| STAT-2 | Fail-open auditor | **Disclosed as latent** | Path exists; observed fallback count reported as zero from selected logs (`04_methods.tex:430–434`). The non-observation is not a proof of absence in every event; raw judge payloads were not retained. Acceptable as a stated limit, not as a validity demonstration. |
| STAT-3 | Dual agreement selected denominator | **Closed by manuscript** | 270/478 H and 171/240 He defined correlations are in captions and prose (`05_results.tex:91–93,116–118,126–131`). |
| STAT-4 / TUM-07 | “Irreversible” \(k^*\) | **Closed by manuscript** | Defined as eight-tick sustained crossing through the last later scored observation; right-censored (`04_methods.tex:614–641`; abbreviations). “Irreversible” / “lock-in” not used as the estimator name. Validity still notes tick-eight may recover at tick nine. |
| VAL-3 / TUM-12 | Exploratory \(p\)-values in principal results | **Mostly closed** | Wilcoxon/Mann–Whitney \(p\)-values are gone from Results. Spearman \(\rho=0.095/0.167\) remains as a **descriptive** rank correlation with an explicit non-inferential sentence (`05_results.tex:155–159`; `06_discussion.tex:121–123`). KS distances remain as diagnostics, without campaign-level \(p\)-as-inference. Acceptable. |
| AWD-8 / NAR-3 | MPR is not a rate | **Closed in prose** | Abbreviations restore “Misinformation Propagation Rate” as node/branch mean MI, not a time-normalised rate. The acronym still contains “Rate.” A severe examiner will still ask why. Not a blocker. |

### 3.3 Award-jury / validity criticals that were *design* problems

These were never manuscript-repairable. Round two correctly **narrows the claim**. That converts them from “false thesis” risks into **grade ceiling** limits. They are not submission blockers if the oral stays inside the narrowed estimand.

| ID | Round-one critical | Round-two status |
|---|---|---|
| AWD-1 | Topology/H–He not identified treatments | **Disclosed, irreducible.** RQ3 is “bundled network conditions.” Discussion body matches. Residual: Discussion heading 6.1.3 still asks “How does network topology **affect** misinformation **propagation**?” (`06_discussion.tex:74–75`). Heading lags the argument. |
| AWD-2 | \(N=1\) cannot support inference | **Disclosed, irreducible.** Parser/mtime rule is now accurate (`04_methods.tex:41–47`). 1,728 cells are not 1,728 replicates. |
| AWD-3 | T2c vs T2d are separate realisations | **Closed by manuscript.** RQ1 is whole-pipeline sensitivity; same-event evidence is the dual sidecar. |
| AWD-4 | \(>3\) transferred across non-equivalent scales | **Closed by manuscript** as an arbitrary high-loss cut. No threshold-sensitivity rerun (deferred; not required for submission). |
| AWD-5 / VAL-4 | No independent validity | **Disclosed, irreducible.** MI = automated claim-recoverability. No human eval. Same `gpt-4o-mini` generator and judge. |
| AWD-6 | Persona result ≈ prompt compliance | **Disclosed, irreducible.** Validity and Discussion state this as a live alternative. The thesis still gives the contrast major weight, now as prompt-conditioned composition rather than a social law. That is the most the harvest can bear. |
| AWD-7 | Dead-cascade selection | **Disclosed, not remedied.** Survival is a co-outcome; live means remain complete-case. No hurdle model, no unconditional bounds. Adequate for a descriptive MA; inadequate for topology ranking. |
| AWD-9 | Firestorm not tested | **Closed by manuscript.** New title; abstract and Ch. 8 say the study does not test whether a firestorm occurred. Pfeffer is a design audit. Residual: a long Results §5.5 mapping still sits in the *results* chapter. |
| AWD-11 / NAR-9.1 | Individual contribution | **Open blocker.** See TUM-03. |
| AWD-12 / AWD-13 | D-net / DTFS as validation | **Claim closed; metric still on stage.** Failed check is reported. Four-decimal DTFS still appears in Results, Discussion, Validity, Methods, *and* Conclusion. That is leftover validation theatre for a software flag. Move it or stop leading with it. Not a blocker. |
| AWD-20 | Visibly unfinished | **Open blocker.** Placeholders remain; `thesisGrade=false` is no longer quoted as a thesis claim (good). |

**Summary of the critical-risk ledger.**  
Academic *overclaim* criticals: **addressed**.  
Academic *design* criticals: **disclosed, irreducible**.  
Administrative *deposit* criticals: **not addressed**, and they were never going to be addressed by a text-revision pass that refused to invent official wording. They remain the examiner’s stop sign.

---

## 4. Remaining blocking submission issues

These prevent a TUM deposit or prevent this examiner from opening the academic assessment. They are **not** “limitations of the study.” They are unfinished examination documents.

### B1. Official template, identity, and PDF metadata — **hard deposit veto**

The cover is still a KOMA-Script fallback that tells the reader the official template has not been applied. Required fields are empty. PDF Author is `[CANDIDATE NAME]`. The PDF is untagged. The chair guide’s instruction to use the school template is unmet.

**Clear only with:** current school/programme template; populated name, matriculation number, programme, school, first examiner, supervisor, advisor, date; official title-page order; `hyperref` author field; confirmation of German-abstract / acknowledgements requirements.

### B2. Statutory declaration — **hard deposit veto**

There is no declaration. There is an instruction to paste one later. That is not a legal instrument.

**Clear only with:** verbatim official wording, place, date, signature field, originality, and the currently required generative-AI disclosure. Do not paraphrase.

### B3. Individual contribution and prior-work boundary — **examination veto**

This is the single most important remaining *academic* blocker. The engine, MI, MPR, and linear-chain study are co-authored (`maurya2025simulating`). The thesis correctly *excludes* those from the contribution claim and then **fails to state who did the climate layer**. An examiner who cannot attribute conception, code, stimuli, execution, analysis, figures, and writing cannot award a master’s mark for independent work.

**Clear only with:** a verified, supervisor-confirmed, artefact-linked split (modules, commits, campaign execution, analysis scripts, figures, chapters). Inventing a split is academic misconduct. Leaving the blank is non-submission.

### B4. German abstract still an instruction, not a text — **likely deposit veto if the school requires it**

PDF p. v is `[GERMAN ABSTRACT: insert…]`. If the examination office requires a *Zusammenfassung*, this page is a fail. If it does not, delete the page rather than print the instruction.

### B5. Ethics-determination placeholder prints in Chapter 7 — **examination defect**

`07_validity_ethics.tex:265–267` still prints `[ETHICS DETERMINATION: record whether the school required review, exemption, or a not-required determination.]` in the body of the validity chapter. This is not front-matter scaffolding. It tells the examiner the ethics status of the work is unknown. For a thesis that discussed OSF/Mendeley identifier access and possible future human evaluation, that is unacceptable.

**Clear only with:** the actual determination (review / exemption / not required), or a sentence that no human-subjects protocol was triggered and no review was required, if that is true. Do not guess.

### B6. Data/code availability is still a blank — **major, possibly blocking**

`09_appendices.tex:632–636` prints `[ARCHIVE: insert repository URL, commit SHA, licence, and checksums before submission.]`. The harvest is described as traceable via repository-relative paths. A PDF-only examiner cannot follow those paths. Many chairs will accept a private repository plus a statement; they will not accept a visible “insert later” box.

**Clear only with:** URL or archived bundle, commit SHA, licence, and checksums, *or* an explicit restricted-access statement if the raw runs cannot be published. Do not claim a DOI that does not exist.

### B7. Acknowledgements page is an instruction

Optional at many chairs. If the template does not require it, omit the page. Do not submit a page that says “insert personal thanks.”

**None of B1–B7 is an irreducible scientific limit.** They are unfinished administration. Round one already classified them as deferred. Deferral past the point of “final thesis PDF” is a submission failure.

---

## 5. Irreducible limitations (not submission blockers)

The following remain true of the harvest. The revised manuscript now generally *says* they are true. A severe examiner will still use them to cap the mark. They do **not** justify withholding the thesis once P0 is done, unless the oral re-inflates the claims.

1. **\(N=1\) parser replicate.** One retained complete positive-call directory per configuration; 77 names had extra directories; selection is mtime. No seed-to-seed uncertainty.
2. **Unseeded `Math.random`** in ER, small-world, scale-free, and action sampling. Seed 42 is not a campaign-wide graph seed.
3. **Bundled “topology” conditions.** Chain and ring use a different action/trust regime; echo/polarised/hierarchical use a different persona-assignment mechanism; generators differ in density, direction, and seed out-degree.
4. **Bundled H/He.** Prevalence, identity, placement, and (on three generators) assignment procedure move together. Five of six He mixes are not realised as eight unique seats on echo/polarised/hierarchical graphs.
5. **Fixed placement and seed seat.** Node 0 is always the seed; mix order is not randomised.
6. **Same-model generator and judge** (`gpt-4o-mini`). Dual scoring is two prompts, not two instruments.
7. **No human or cross-family criterion validity.** Five author-curated items. Human-eval templates exist and were not used.
8. **Prompt-compliance alternative** for the conspiracy vs science contrast is live and unrefuted.
9. **API damage.** 64,270 HTTP-error counters; 121/288 runs; 36,194 unscored eligible events; failed rewrites propagate unchanged text labelled `reinterpret`. Continuous collapsed He−H is **not robust**. Only five clean alternative reruns exist and were not substituted. This cannot be prose-corrected into an undamaged experiment.
10. **Survivor-conditioned live means.** 292/1,728 cells hatched (`nScored ≤ 1`); 232 zeros, 60 ones. Hierarchical/polarised He dead rates are high. Rankings of live means are not unconditional severity.
11. **Eight-tick, right-censored horizon.** Cost cut vs prior 30-hop chains; not Debnath’s skip-gram eight; not empirical time.
12. **Six unmatched articles.** Topic, truth status, length, and item difficulty are bundled. “Valence” is not identified. Figure files `fig21_article_valence_*.png` still carry the old name; captions now deny a valence isolation (good).
13. **No matched baseline** (neutral persona, forward-only, no-rewrite, independent cascade model, independent judge family).
14. **D-net is a constructed hashtag co-occurrence graph** (63 nodes, 228 stored arcs, 171 unique pairs). Hydration failed. No empirical Twitter MPR. Homogeneous \(Q=0\); mixed conspiracy cut \(Q=0.4297\). 56/63 exact persona IDs. DTFS 0.2754 failed. These are now correctly described; they still supply no external validation.
15. **Core method is inherited.** Originality is the climate layer, the measurement-sensitivity ledger, the composition audit, and the documented stress test — not MI, MPR, or the auditor–node architecture.
16. **No LLM-network or classical-diffusion comparator** in this harvest.

A later paper can repair these. This thesis cannot, and should not pretend it can.

---

## 6. Residual manuscript defects (grade-relevant, not deposit vetoes)

A severe examiner would still mark these down after P0. None should delay depositing *once B1–B6 are real*.

| Defect | Why it still matters | Where |
|---|---|---|
| DTFS and 16-cascade KS still occupy main-text real estate | Four-decimal software score for a one-object, zero-content-correlation index. The failure is the result; the number is not a finding. | `04_methods.tex:827–841`; `05_results.tex:890–903`; `06_discussion.tex:158–159`; `08_conclusion.tex:44–47` |
| Excessive displayed precision | \(0.8201346884\) and \(1.0450048645\) in display math; \(0.97785\) in prose. \(N=1\) harvest. Two decimals, or the table’s four, are enough. | `05_results.tex:49,108,112` |
| Causal heading vs descriptive body | Discussion RQ3 heading uses “affect” and “propagation.” The body correctly refuses a topology-invariant ranking. Headings are what examiners quote. | `06_discussion.tex:74–75`; cf. Conclusion opening “affect outputs” (`08_conclusion.tex:5–6`) |
| “Reproducible configuration files” | Methods now deny exact replay. Introduction contribution 2 still says “reproducible.” | `01_introduction.tex:160` vs `04_methods.tex:441–455` |
| Results still hosts a second theory chapter | §5.5 Pfeffer application is a design audit. Round one asked it moved. Residual overlap remains, including a duplicated “two stages” paragraph. | `05_results.tex:906–1155`, esp. 981–999 |
| Colour encodings unchanged | Green–yellow–red heatmaps; C1 green/purple. Deferred. Print/greyscale risk, not a scientific error. | `figures/fig10–22*.png` |
| Typography | 3 overfull boxes (TOC 3.32 pt; methods table 3.90 pt; appendix CSV 8.69 pt); ~85 underfull boxes; Latin Modern bold small-caps substitution. Legible, not print-clean. | `main.log`; `THESIS_LOG.md` |
| Length vs synthesis | 116 pages, 37k words. The 60-page minimum is met. Repetition of \(N=1\) / no Twitter MPR / D-net-not-a-cascade is reduced but still a structural habit. A severe examiner may read this as diligence substituting for a shorter, sharper thesis. | Chs 1, 5, 6, 7, 8 |
| Section label archaeology | `sec:results-mpr` for a live-cell mean-MI section. Harmless, sloppy. | `05_results.tex:18` |

These are the difference between a clean 2.0 and a dragged 2.3, not between pass and fail.

---

## 7. Submission-blocker checklist

Print this. Do not submit until every **Must** line is ticked with a real artefact, not a TODO.

### Must — examination office / chair (P0)

- [ ] Official school/programme template applied; fallback note removed from the cover.
- [ ] Candidate name, matriculation number, programme, school/department on the title page.
- [ ] First examiner, supervisor, advisor, submission date filled; terminology matches the office.
- [ ] `hyperref` `pdfauthor` is the candidate’s name, not `[CANDIDATE NAME]`.
- [ ] Statutory declaration pasted verbatim, with place, date, signature field, originality, and required AI disclosure.
- [ ] Individual-contribution statement completed, artefact-linked, and supervisor-confirmed; Methods sentence updated to match, not left as “remains a requirement.”
- [ ] German abstract either written or the *Zusammenfassung* chapter deleted after office confirmation.
- [ ] Acknowledgements either written or omitted; no “insert thanks” page.
- [ ] Ethics determination recorded in Chapter 7 without a bracketed instruction.
- [ ] Data/code availability: URL or restricted-access statement, commit SHA, licence, checksums; no `[ARCHIVE:]` box.
- [ ] Clean rebuild from a checkout that contains every figure currently in `thesis_final/figures/`; List of Figures matches every `\includegraphics`.
- [ ] No remaining `[ALL-CAPS INSTRUCTION]` strings in the PDF (`pdftotext` grep).

### Must not — academic relapse (checked at oral)

- [ ] Do not call D-net a retweet cascade, empirical user graph, or digital twin.
- [ ] Do not call live-cell mean MI a propagation *rate* or a Twitter MPR.
- [ ] Do not call \(k^*\) irreversible, a firestorm ignition time, or a Pfeffer statistic.
- [ ] Do not present topology or H/He differences as treatment effects.
- [ ] Do not present T2c vs T2d campaign gaps as a clean instrument effect on frozen text.
- [ ] Do not treat DTFS 0.2754 as a scientific fidelity estimate.
- [ ] Do not treat 1,728 cells as 1,728 independent experimental units.
- [ ] Do not restore \(p\)-values as inference.
- [ ] Do not claim the continuous collapsed He−H direction as a robust headline (it reverses under zero-error restriction).
- [ ] Do not claim human, platform, or population effects.

### Should — polish before print (not a veto)

- [ ] Round display-math deltas; drop ten-decimal ornaments.
- [ ] Rename Discussion RQ3 heading so it does not say “affect” / “propagation.”
- [ ] Replace “reproducible configuration files” in the contribution list.
- [ ] Compress or relocate §5.5; delete the duplicated “two stages” paragraph.
- [ ] Inspect the 8.69 pt appendix overfull box at 100% zoom.
- [ ] Confirm British English remains consistent in any last-minute inserts.

### Cannot be ticked without a new study (do not delay submission waiting for these)

- Independent stochastic replicates and fully seeded RNGs.
- Matched factorial of topology, action policy, composition, and placement.
- Human/domain-expert labels and an independent judge family; fail-closed parsing.
- Hydrated, timestamped user-to-user cascades.
- Neutral / no-rewrite / classical baselines.
- Longer horizon; larger matched stimulus set; colourblind figure regeneration; public DOI if the archive does not yet exist.

---

## 8. What the oral will still attack

A severe examiner who has read the revision will not waste time on “you forgot to mention \(N=1\).” They will ask whether the remaining *positive* claims are still too large.

1. **What, precisely, did you implement, run, analyse, and write, given that MI/MPR and the engine are co-authored?** (If B3 is blank, the oral should not start.)
2. **Why is conspiracy-prompt → high auditor MI more than a manipulation check?**
3. **What is the experimental unit?** Event, article cell, configuration, graph realisation, or campaign?
4. **How can any network-condition ordering survive the chain/ring action confound, cluster-assignment non-realisation, and hatch selection?**
5. **If zero-error runs reverse continuous He−H, which composition claim is actually robust, and why is it not the only headline?**
6. **Why keep DTFS in the conclusion after declaring it an implementation diagnostic that failed?**
7. **What does five author-written questions, judged by the same model family, measure besides prompt-echo?**
8. **Which Pfeffer factor was manipulated rather than mapped?**
9. **Show the individual-contribution statement against the git history and the prior preprint.**
10. **If I delete Chapters 3 and 5.5, does a thesis remain?** (The honest answer should be: yes — a measurement-sensitivity and composition-audit of one harvest.)

Safe oral strategy: lead with the instrument-dependence result and the composition-vs-label result; treat D-net as a negative validation finding; refuse every causal, Twitter, and firestorm sentence.

Unsafe oral strategy: defending topology rankings, “heterogeneity,” digital-twin language, or the campaign size as originality.

---

## 9. Examiner’s bottom line

Round one threatened two different failures: **(i)** a TUM packet that was not a thesis, and **(ii)** a scientific story that outran a damaged, unreplicated, same-model prompt experiment.

Round two has largely closed **(ii)** as a *wording* problem. The PDF now states, in the abstract and again in the conclusion, that the object is automated claim-recoverability in synthetic LLM-agent networks; that firestorms were not tested; that D-net is not a twin; that continuous He−H is not robust to API errors; and that no human evaluation was done. Missing figures are present. MI vs MPR, \(k^*\), ring parameters, mix realisation, modularity \(Q=0\), and the 64,270-error audit are in the record. That is a real revision.

It has **not** closed **(i)**. The same PDF still contains seven visible fill-in-later fields, including the contribution split that makes independent examination possible. Until those fields are real, the grade range above is hypothetical.

**After P0:** this examiner would expect a **pass in the *gut* band (centrally 2.0–2.3)**, with **1.7 as a ceiling** and **2.7–3.3 as the floor** if the independent contribution is thin. **1.0 is not in play. 5.0 is not indicated on the narrowed scientific claims.** No grade is guaranteed. A contribution statement that cannot be defended is a return, not a low mark.

*This report does not modify the thesis. It does not certify TUM compliance. It does not replace the examination office or the appointed examiners.*
