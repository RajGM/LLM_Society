# Round-1 revision matrix

Status after the senior revision-editor pass on `thesisExperiment/thesis_final/`.
Line numbers refer to the revised sources at the time of this matrix. Decisions:

- **Accepted** — manuscript revised using existing evidence.
- **Deferred** — cannot be completed without official template text, identity fields, new runs, hydration, human evaluation, or a public archive.
- **Rejected** — not applied; rationale given.

No experiment was rerun. No grade is guaranteed. `.env` contents were not printed or committed.

Verified forensic facts used throughout: 64,270 HTTP-error counters; 203,928 successes; 121/288 runs affected; 36,194 audit-eligible events unscored; no observed parse/all-correct fallback; continuous He−H +0.1549 canonical but −0.0295 zero-error (not robust); dual +0.3986 canonical and +0.4695 zero-error; only 5 clean alternative reruns; homogeneous modularity \(Q=0\).

---

## 01 TUM compliance

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| TUM-01 | Unofficial cover and unfilled identity fields | Deferred | Official TUM template was unavailable. Cover now uses explicit placeholders (`[CANDIDATE ID]`, `[SUPERVISORS]`, `[SUBMISSION DATE]`) and a labelled template note rather than invented official wording. | `main.tex:57–83` |
| TUM-02 | Declaration is a placeholder | Deferred | Statutory wording was not supplied. Page remains an explicit `[OFFICIAL DECLARATION]` placeholder. | `main.tex:141–144` |
| TUM-03 | Individual contribution unresolved | Deferred | No verified co-author allocation exists. Front matter and Methods keep an explicit submission requirement rather than inventing a split. | `main.tex:132–139`; `04_methods.tex:11–12` |
| TUM-04 | Official front-matter order unverifiable | Accepted (placeholders) | Added labelled German abstract and acknowledgements as optional placeholders; official order still requires the school template. | `main.tex:122–130` |
| TUM-05 | Results cite nineteen nonexistent figures | Accepted | Inserted Figures 10–22 as labelled floats with `\Cref`. | `05_results.tex:248–575` |
| TUM-06 | `meanMI` and MPR conflated | Accepted | Headline estimand is event-weighted / equal-cell live-cell mean MI; MPR reserved for node/branch aggregation. | `main.tex:97–103`; `04_methods.tex:400–412`; `05_results.tex:17–18,288–313` |
| TUM-07 | “Irreversible” \(k^*\) | Accepted | Defined as eight-tick sustained crossing through the last later scored observation; right-censored. | `main.tex:163`; `04_methods.tex:614–639`; `08_conclusion.tex:36–37` |
| TUM-08 | Title/firestorm framing exceeds measured construct | Accepted | Retitled around audited semantic degradation; firestorm theory is a design audit, not the measured object. | `main.tex:36–38,57–58,87–93`; `01_introduction.tex:16–21` |
| TUM-09 | Constructed fallback treated as empirical validation | Accepted | Consistently a constructed/hashtag co-occurrence graph; DTFS is an implementation diagnostic. | `04_methods.tex:737–739`; `05_results.tex:879–892`; `08_conclusion.tex:39–47` |
| TUM-10 | Reproducibility overclaimed | Accepted | “Traceable / protocol-replicable”; exact replay disclaimed; archive placeholder retained. | `04_methods.tex:440–454`; `09_appendices.tex:629–638` |
| TUM-11 | “One graph seed” misleading | Accepted | Seed 42 consumed only by echo/polarised builders; ER/SW/SF and action sampling unseeded. | `04_methods.tex:41–47,445–450`; `07_validity_ethics.tex:14–16` |
| TUM-12 | Exploratory significance tests | Accepted | Principal results use signs, medians, ranges; p-values not presented as inference. | `05_results.tex:34–38`; `07_validity_ethics.tex:21–26` |
| TUM-13 | Source articles lack scholarly provenance | Accepted | Added provenance table with citations; JSON remains the executable stimulus. | `04_methods.tex:69–99`; `tab:article-provenance` |
| TUM-14 | Unsupported public-effects sentence | Accepted | Narrowed to discourse motivation with Debnath citation; no uncited citizen-effect claim. | `01_introduction.tex:9–21` |
| TUM-15 | Bibliography not APA | Accepted | `biblatex-apa` + Biber; British `babel`/`csquotes`. | `main.tex:10–11,30–34` |
| TUM-16 | Maurya record not publication-complete | Accepted | Cited as `@misc` arXiv preprint; workshop/award not asserted. | `references.bib:195–204`; `02_related_work.tex:170` |
| TUM-17 | Chapter 7 malformed hierarchy | Accepted | Promoted five headings to `\section`. | `07_validity_ethics.tex:11–` |
| TUM-18 | Appendix numbering malformed | Accepted | `\appendix` before appendices, then `\backmatter`. Inner `\appendix` commented. | `main.tex:178–181`; `09_appendices.tex:1` |
| TUM-19 | Results/Discussion not separated | Accepted | Pfeffer section kept as a design audit with mapping table; interpretation concentrated in Discussion RQ order. Residual overlap is shorter than the original second theory chapter. | `05_results.tex:895–1155`; `06_discussion.tex:13–14` |
| TUM-20 | RQ order changes | Accepted | Discussion now RQ1–RQ4. | `06_discussion.tex:16–164` |
| TUM-21 | Captions not self-contained | Accepted | Captions now define instruments, live-only population, hatch rule, and \(k^*\). | `05_results.tex:59–62,126–130,305–313,415–421` |
| TUM-22 | Table/appendix typography | Accepted (partial) | `\emergencystretch`, `\sloppy` in dense chapters, caption notes; remaining hyphenation deferred to a print-proof pass. | `main.tex:16`; `05_results.tex:3`; `09_appendices.tex` |
| TUM-23 | Pipeline status / `thesisGrade` as claims | Accepted | Internal flags and credential instructions removed from thesis prose; data-availability keeps only governance. | `09_appendices.tex:629–638` |
| TUM-24 | Paths not a durable availability statement | Deferred | Added explicit archive placeholder; no DOI/licence/checksums exist yet. | `09_appendices.tex:632–636` |
| TUM-25 | Language variety inconsistent | Accepted | British English throughout; code identifiers retained. | `main.tex:10–11`; `03_theory.tex:452–455` |
| TUM-26 | PDF metadata absent | Accepted (placeholders) | `pdftitle`/`pdfauthor`/`pdfsubject`/`pdfkeywords` set; author remains `[CANDIDATE NAME]`. | `main.tex:35–39` |
| TUM-27 | Draft-chapter comments | Accepted | Companion source list and stale draft comments removed. | `01_introduction.tex` (end) |

---

## 02 Narrative coherence

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| NAR-1.1 | Title/opening promise a firestorm study | Accepted | Semantic-audit framing; firestorm as design prompt. | `main.tex:57–93`; `01_introduction.tex:16–21` |
| NAR-1.2 | Two competing centres | Accepted | Measurement sensitivity is primary; composition/network secondary. | `01_introduction.tex:87–90`; abstract |
| NAR-1.3 | Propositions promise unrun analyses | Accepted | P1/P5 examined; P2–P4 marked indirect. | `03_theory.tex:514–517` |
| NAR-2.1 | RQ1 unanswered as written | Accepted | RQ1 narrowed to levels and network-condition ordering; \(k^*\) under RQ2/RQ3. | `01_introduction.tex:125–128`; `06_discussion.tex:16–30` |
| NAR-2.2 | RQ2 causal “explain” | Accepted | Rewritten as descriptive variation across named compositions. | `01_introduction.tex:130–133` |
| NAR-2.3 | RQ3 incomplete / irreversible | Accepted | RQ3 is bundled network conditions, live-cell mean MI, and survival. | `01_introduction.tex:135–138` |
| NAR-2.4 | Roadmap/chapter order | Accepted | Roadmap and Discussion use RQ1–RQ4. | `01_introduction.tex:209–213` |
| NAR-3.1–3.4 | meanMI called MPR; wrong expansions; abstract | Accepted | Live-cell mean MI throughout; MPR expansion restored. | `main.tex:97–103`; `05_results.tex:288–350` |
| NAR-4.1 | Chain not topology-only | Accepted | Chain *and ring* use CHAIN_NODE_PARAMS; bundled protocol contrast. | `04_methods.tex:210–213,235–247` |
| NAR-4.2 | One graph seed | Accepted | See TUM-11. | `04_methods.tex:445–450` |
| NAR-4.3 | H/He not a controlled composition contrast | Accepted | Bundled assignment contrast. | `05_results.tex:235–244` |
| NAR-5.1 | Empirical object/structure labels | Accepted | Hashtag co-occurrence / reconstructed stand-in. | `05_results.tex:766,991,1135` |
| NAR-5.2 | “Transfers cleanly” / “survives” | Accepted | Recurrence, not replication. | `05_results.tex`; `08_conclusion.tex:41–42` |
| NAR-5.3 | DTFS as validation | Accepted | Implementation diagnostic; failed check. | `05_results.tex:886–890` |
| NAR-6.1 | Article independence contradiction | Accepted | Shared graph/protocol; inboxes cleared. | `07_validity_ethics.tex:17–21` |
| NAR-6.2 | Surprise as drip seed | Accepted | Single-node, single-time seed; surprise held. | `01_introduction.tex:66–67` |
| NAR-6.3 | Integrated causal argument | Accepted | Generative/design language; no causal identification. | `03_theory.tex` |
| NAR-6.4 | Unsupported public-effects sentence | Accepted | See TUM-14. | `01_introduction.tex:9–21` |
| NAR-6.5 | Valence not isolated | Accepted | Section retitled; article identity bundled. | `05_results.tex:232,471–473` |
| NAR-7 | Repetition | Accepted (partial) | Transitions shortened; remaining caveats kept where they prevent overclaim. | Chs 1–8 |
| NAR-8.1–8.4 | Administrative transitions | Accepted | Argumentative openings/closings added. | `02_related_work.tex` end; `04_methods.tex:4–9,876–879`; `05_results.tex:4–5` |
| NAR-9.1 | Contribution placeholder | Deferred | See TUM-03. | `main.tex:132–139` |
| NAR-9.2 | Literature-gap overclaim | Accepted | Narrowed to systems reviewed here. | `02_related_work.tex:315–320` |
| NAR-9.3 | “Constructs” overstates ownership | Accepted | “Documents” / “evaluates” / “links”. | `01_introduction.tex:155–168` |
| NAR-9.4 | Failed digital-twin as novelty | Accepted | Documented stress test; check failed. | `08_conclusion.tex:44–47` |
| NAR-10 | Missing figure references | Accepted | See TUM-05. | `05_results.tex:248–575` |
| NAR-11 | Recommended architecture | Accepted | Measurement first; firestorm as audit. | Abstract; Chs 1, 5, 6, 8 |

---

## 03 Methods / reproducibility

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| METH-1 | API failure omitted | Accepted | 203,928 / 64,270 / 121/288 / 36,194; rewrite fallback; auditor null; no observed parse fallback. | `04_methods.tex:414–438`; abstract; Chs 5–8 |
| METH-2 | Ring uses chain action regime | Accepted | Linear chain *and* ring: 0.10/0.85/0.05 and \(\tau=0.08\). | `04_methods.tex:210–213,235–247`; `09_appendices.tex:53` |
| METH-3 | Five He mixes unrealised on echo/polarised/hierarchical | Accepted | Filtering/cycling realises 4–5 unique personas; polarised index/group mismatch noted. | `04_methods.tex:146–148`; `09_appendices.tex:202`; `fig:mix-topology-mpr` caption |
| METH-4 | D-net pools duplicates/API-damaged runs | Accepted | Four configs / eight article cells stated; 16-cascade KS/DTFS kept as implementation diagnostic with \(n_{\mathrm{real}}=1\). No rerun. | `05_results.tex:772–778,880–890`; abstract |
| METH-5 | N=1 is a parser rule | Accepted | 77 names had multiple directories; mtime selection. | `04_methods.tex:41–47` |
| METH-6 | ER ignores minSeedOutDegree / seed | Accepted | Option present but ignored; unseeded `Math.random`. | `04_methods.tex:447–450`; `09_appendices.tex:101` |
| METH-7 | Trust uses receiver reverse relation | Accepted | Reverse lookup; default 0.5; `relationEvolution` inert. | `04_methods.tex:227–230` |
| METH-8 | No hop-8 events | Accepted | Eight processing ticks; recorded hops 0–7. | `04_methods.tex:364` |
| METH-9 | Silent inbox overflow | Accepted | Four-message cap discards without counter. | `04_methods.tex:254` |
| METH-10 | “Drip seed” misleading | Accepted | Single-node, single-time seed into `node_0`. | `04_methods.tex:218`; `09_appendices.tex:51` |
| METH-11 | Unpinned model / missing request metadata | Accepted | `gpt-4o-mini` alias; no snapshot/fingerprint/request IDs; temperature 0.7, max_tokens 700, no retry. | `04_methods.tex:417–422`; `07_validity_ethics.tex:51–65,67–79` |
| METH-12 | Appendix prompts not byte-exact | Accepted | Sentinels restored. | `09_appendices.tex:307–308` |
| METH-13 | Stimulus provenance incomplete | Accepted | Provenance table + JSON-as-stimulus boundary. | `04_methods.tex:69–72`; `09_appendices.tex:252–256` |
| METH-14 | Topology details | Accepted | Shared seed-42 RNG coupling; homophily formula; snapshot vs later relations. | `04_methods.tex`; `09_appendices.tex` |
| METH-15 | Schema omits failure semantics | Accepted | calls vs errors; complete ≠ scored; rewrite/auditor failure; mtime parser. | `04_methods.tex:414–438`; appendix schema |
| METH-competing-docs | Stale methods documents | Deferred | `analysis/methods.md` and `latex_phase2` are outside this thesis_final pass; thesis now points to `grid_phase2.json` as canonical. | `09_appendices.tex:6–8` |

---

## 04 Statistics / measurement

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| STAT-1 | Discrete/continuous not same scale | Accepted | Missing-item 1 vs 0.5; non-equivalent MI>3. | `05_results.tex:26–32`; abstract |
| STAT-2 | Fail-open auditor | Accepted | Path exists; **no observed parse/all-correct fallback**. | `04_methods.tex:429–433`; `07_validity_ethics.tex:75–77` |
| STAT-3 | Dual agreement selected denominator | Accepted | 270/478 H; 171/240 He; cell-level means of defined correlations. | `05_results.tex:91,115–118,126–130` |
| STAT-4 | \(k^*\) not irreversible | Accepted | See TUM-07. | `04_methods.tex:614–639` |
| STAT-5 | Dual gap is equal-cell-weighted | Accepted | Captions state equal-cell-weighted means of cell means. | `05_results.tex:126–130,572` |
| STAT-6 | Group “MPR” is mean of cell means | Accepted | Live-cell mean MI; event-weighted cell mean then equal cell weight. | `05_results.tex:305–313,488–490` |
| STAT-7 | Hatch excludes one-event cells | Accepted | 232 zero-score + 60 one-score = 292; no new threshold sensitivity (no rerun). | `04_methods.tex:657–664` |
| STAT-8 | Complete-case / survivor conditioning | Accepted | Survival reported as co-outcome; live means conditional. | `05_results.tex:524–531`; RQ3 |
| STAT-9 | Wilcoxon pseudo-replicates | Accepted | Sign counts/medians retained; p-values not used as inference. | `05_results.tex:52–55,110–113` |

---

## 05 Numerical results

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| NUM-FAIL | “Four primary D-net cells” | Accepted | Four configurations and eight article-level cells; 61/63 reach in all eight. | `05_results.tex:772–778`; `08_conclusion.tex:40`; abstract |
| NUM-PASS | All other checked arithmetic | Accepted | Existing tables retained; no numerical rewrite of PASS values. | `05_results.tex` tables |
| NUM-API | Continuous He−H not robust | Accepted | +0.1549 canonical; −0.0295 zero-error. Dual remains positive. | `05_results.tex:648–650,698`; `06_discussion.tex:48–51`; `08_conclusion.tex:61–63` |

---

## 06 Literature / citations

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| LIT-1 | Missing `tornberg2024validation` / `ruths2014social` | Accepted | Cite `larooij2025validation` (verified 2025 *AI Review*) and `ruths2014social`. | `01_introduction.tex:39`; `06_discussion.tex:178`; `references.bib` |
| LIT-2 | `debnath2023dataset` metadata | Accepted | v1 2022 Debnath sole author; v2 2023 update. | `references.bib:72–89`; `02_related_work.tex:110–115` |
| LIT-3 | Maurya workshop/award unverified | Accepted | Preprint only; no Outstanding Paper Award claim. | `references.bib:195–204` |
| LIT-4 | Bibliography verification comment false | Accepted | Comment now states 2026-09-19 checks and Maurya caveat. | `references.bib:1–4` |
| LIT-5 | Research-gap overclaim | Accepted | See NAR-9.2. | `02_related_work.tex:315–320` |
| LIT-diffusion | Compartmental/threshold unsourced; Vosoughi bots; citizen effects | Accepted | Added Kermack, Granovetter, Lewandowsky; softened effects. | `02_related_work.tex:32–34,264`; intro |
| LIT-ABM | Persona-validity uncited; omit LAID | Accepted | Larooij–Törnberg; added `hu2024laid`. | `02_related_work.tex:193,207` |
| LIT-Debnath-identity | “Identity-structured” beyond paper | Accepted | Kept as thesis hypothesis / grounded reduction. | `03_theory.tex:387` |
| LIT-article-sources | Core article citations | Accepted | Keutsch, IPCC, UNFCCC, Cook. | `04_methods.tex:86–101`; `references.bib:436–491` |

---

## 07 Figures / tables

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| FIG-1 | Restore missing figures / `\cref` | Accepted | 13 PNGs included with semantic labels. | `05_results.tex:255–575,709–723` |
| FIG-2 | Floats crossing subsections | Accepted (partial) | `\FloatBarrier` after heatmap blocks; `[htbp]`/`[t]`. Residual float drift possible. | `05_results.tex:284,397,484` |
| FIG-3 | Continuous/discrete separation in labels | Accepted | Captions and grouped T2c/T2d wording. | table/figure captions |
| FIG-4 | Color encodings | Deferred | Existing PNGs retained; regenerating colorblind-safe maps would be a plotting rerun, not an experiment rerun, but was out of this text-revision pass. | `figures/fig10–22*.png` |
| FIG-5 | Redundant presentations | Deferred | Tables kept as numeric source; both C1 figures retained with clarified captions. Consolidation would drop evidence the prior review also demanded restored. | `fig:c1-h-he`, `fig:c1-delta` |
| FIG-captions | Self-contained captions | Accepted | See TUM-21. | `05_results.tex` captions |

---

## 08 Debnath / Pfeffer

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| DEB-1 | Invalid modularity | Accepted | Unique-undirected Newman–Girvan; homogeneous \(Q=0\); mixed conspiracy cut \(Q=0.4297\). Old 0.404/0.457 withdrawn. | `05_results.tex:1002–1023`; `08_conclusion.tex:46` |
| DEB-2 | Designed reconstruction, not empirical graph | Accepted | Literature-informed hashtag stand-in. | `05_results.tex:991` |
| DEB-3 | Direction has no empirical meaning | Accepted | 63 seats, 228 stored arcs, 171 unique pairs. | methods/results D-net |
| DEB-4 | 56/63 match is internal | Accepted | Exact ID match vs intended BP family; mitigation seat crosses graph environmental/climate-action boundary. | `05_results.tex:742–770` |
| DEB-5 | No empirical Twitter MPR | Accepted | Kept strictly separate. | `05_results.tex:848`; `01_introduction.tex:116` |
| DEB-6 | Seven factors vs remapping | Accepted | Original Outlook list; valence/surprise not numbered factors; ternary actions. | `05_results.tex:908–934`; `tab:pfeffer-original-remap` |
| DEB-echo | Homophily denominator | Accepted | Values reported with stored-arc convention in existing tables; unique-pair alternative not recomputed (no rerun). | `05_results.tex` echo row |
| DEB-clustering | Closure is pre-simulation | Accepted | Transitivity 0.315 / local clustering 0.515 as designed closure. | `05_results.tex:999,1051` |

## 08A Modularity correction

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| MOD-canon | Preserve corrected Q values | Accepted | \(Q=0.5489/0.5322/0.4908/0.4297/0\); directed 0.3941 sensitivity only. | `05_results.tex:1002–1023`; `08A_MODULARITY_CORRECTION.md` |

---

## 09 Validity / ethics

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| VAL-1 | API failures unanalysed | Accepted | Integrated in methods, results, validity, conclusion; sensitivity not a causal correction. | `07_validity_ethics.tex:67–89` |
| VAL-2 | Hatch rule unvalidated | Accepted | 0 vs 1 vs ≥2 counts reported; threshold not redesigned. | `04_methods.tex:657–660` |
| VAL-3 | Displayed p-values | Accepted | Removed from principal results. | Chs 5–7 |
| VAL-4 | Construct validity unestablished | Accepted | MI as automated claim-recoverability; no human eval. | abstract; `08_conclusion.tex:64–65` |
| VAL-5 | Auditor circularity | Accepted | Same-model-family generator/judge stated. | `07_validity_ethics.tex:51–58` |
| VAL-6 | API reproducibility unspecified | Accepted | Alias, no retry, no request IDs. | `07_validity_ethics.tex:67–79` |
| VAL-7 | External validity | Accepted | Already strong; retained. | `07_validity_ethics.tex` |
| VAL-8 | Hydration / D-net | Accepted | Failed hydration; constructed graph; Q=0. | Chs 5, 7 |
| VAL-privacy | Privacy | Accepted | Public identifiers only; no invented tweets. | Ch. 7 ethics |
| VAL-human | Human-eval absence | Accepted | Explicit. | `08_conclusion.tex:64–65` |
| VAL-dual-use | Dual use | Accepted | Retained bounded discussion. | Ch. 7 |

---

## 10 Language / style

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| LANG-1 | Terminology | Accepted | MI / live-cell mean MI / node MPR / \(k^*\) / D-net. | throughout |
| LANG-2 | British English | Accepted | `babel`/`csquotes` British; operationalise/polarised. | `main.tex:10–11` |
| LANG-3 | Tense by function | Accepted (partial) | Methods procedural past; residual mixed tense in formula-adjacent prose. | `04_methods.tex` |
| LANG-4 | Repeated transitions | Accepted (partial) | Cut companion list and several stock caveats; remaining “does not” sentences kept where they bound claims. | Chs 1–8 |
| LANG-award | “Award paper” | Accepted | Prior preprint; no award language. | `references.bib:195–204` |

---

## 11 LaTeX technical

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| TEX-high | `\backmatter` before `\appendix` | Accepted | Appendix then backmatter. | `main.tex:178–181` |
| TEX-meta | Empty PDF metadata | Accepted | hyperref fields set with placeholders. | `main.tex:35–39` |
| TEX-placeholders | Visible placeholders | Deferred | Required until identity/declaration supplied. | `main.tex` front matter |
| TEX-overfull | Four overfull boxes | Accepted (target) | `emergencystretch`; inspect after rebuild. | `main.tex:16` |
| TEX-underfull | Numerous underfull boxes | Deferred | Table hyphenation remains a print-proof issue. | appendix longtables |
| TEX-bookmark | Math in PDF strings | Accepted | `\texorpdfstring` on \(k^*\) headings. | `04_methods.tex:614`; `main.tex:163` |
| TEX-font | LM bold small-caps | Deferred | `\MPR`/`\MI` still use `\textsc` in bold headings; substitution warning expected. | `main.tex:50–51` |
| TEX-koma | Float compatibility warning | Deferred | `scrhack` already loaded; remaining KOMA notice is class-level. | `main.tex:25` |

---

## 12 Award jury

Manuscript-fixable (M) items were accepted. Design limits (D) are deferred; they require new runs or new data. No award/1.0 claim is made.

| ID | Finding | Type | Decision | Rationale | File:line |
|---|---|---|---|---|---|
| AWD-1 | Causal contrasts not identified | D | Accepted (reframe) | Bundled configurations, not treatment effects. | RQ3; methods |
| AWD-2 | N=1 cannot support inference | D | Accepted (reframe) | Descriptive harvest only. | Chs 1, 4, 7, 8 |
| AWD-3 | RQ1 mixes instrument and realisation | M/D | Accepted | Whole-pipeline sensitivity; sidecar as same-event evidence. | `05_results.tex:20–24` |
| AWD-4 | Threshold transferred across scales | M/D | Accepted | Arbitrary high-loss cut; non-equivalent penalties. | `05_results.tex:26–32` |
| AWD-5 | No independent validity | D | Accepted (reframe) | Automated claim-recoverability. | abstract; conclusion |
| AWD-6 | Prompt-compliance alternative | D | Accepted | Stated as prompt responsiveness. | `07_validity_ethics.tex:56–58` |
| AWD-7 | Dead-cascade selection | M/D | Accepted | Survival as co-outcome. | RQ3 |
| AWD-8 | MPR not a propagation rate | M | Accepted | Live-cell mean MI. | Results tables |
| AWD-9 | Firestorm not tested | M | Accepted | Design audit only. | title; intro; conclusion |
| AWD-10 | Incremental originality | D | Deferred | Contribution split still unresolved. | front matter |
| AWD-11 | Individual contribution | D | Deferred | See TUM-03. | `main.tex:132–139` |
| AWD-12 | D-net not empirical validation | M | Accepted | Stress test. | RQ4 |
| AWD-13 | DTFS false precision | M | Accepted | Implementation diagnostic. | `05_results.tex:886–890` |
| AWD-14 | Placement confounded with position | D | Accepted (disclose) | Fixed seats; no matched ablation. | D-net methods |
| AWD-15 | Unmatched graph-class comparisons | D | Accepted (disclose) | Bundled generators. | `04_methods.tex:208–213` |
| AWD-16 | Six-article “valence” | M | Accepted | Article identity, not valence. | `05_results.tex:232,471–473` |
| AWD-17 | No LLM-network baseline | D | Deferred | Would require new runs. | — |
| AWD-18 | Retrospective theory integration | M | Accepted | Ledger as mapping, not confirmation. | Chs 3, 5 |
| AWD-19 | Repetitive manuscript | M | Accepted (partial) | Cuts applied; remaining caveats bound claims. | Chs 1–8 |
| AWD-20 | Unfinished submission | M/D | Deferred | Placeholders remain; not presentation-ready for TUM deposit. | `main.tex` front matter |

---

## API-error forensic correction

| ID | Finding | Decision | Rationale | File:line |
|---|---|---|---|---|
| API-counts | 64,270 errors; 203,928 successes; 121/288 | Accepted | Canonical counters throughout. | abstract; `04_methods.tex:417–423`; Chs 5–8 |
| API-nulls | 36,194 unscored eligible events | Accepted | Distinct from cell hatch. | `04_methods.tex:427–428` |
| API-fallback | No observed parse/all-correct fallback | Accepted | Fail-open remains a latent risk. | `04_methods.tex:429–433` |
| API-sens | Continuous not robust; dual remains + | Accepted | Conditioned sensitivity, not a correction. | `05_results.tex:648–650`; `08_conclusion.tex:61–63` |
| API-reruns | Only 5 clean alternative reruns | Accepted | Not substituted into canonical tables. | `04_methods.tex:435–438` |

---

## Counts (pre-compile)

| Decision | n |
|---|---|
| Accepted | 148 |
| Deferred | 18 |
| Rejected | 0 |

Deferred items are identity/template/declaration/contribution, public archive, figure-color regeneration, competing methods docs, unmatched baselines/new runs, human evaluation/hydration, residual typography/font/KOMA warnings, and award-level design limits.
