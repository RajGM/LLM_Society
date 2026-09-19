# Round 1 — TUM compliance and assessment-risk audit

## Basis and severity

Reviewed against:

- the uploaded `SKILL_TUM-ACADEMIC_WRITING_0d10.md`;
- the uploaded chair guide, *Successfully Writing a BA or MA Thesis*;
- the compiled 104-page `main.pdf`;
- `main.tex`, all chapter sources, `references.bib`, lists of figures and tables, and the final build log.

Page references use the page number printed in the PDF. “Cover” means physical PDF page 1; roman-numbered front matter is cited as printed. Source locations are file and line ranges.

- **BLOCKER** — not submissible in its present form.
- **CRITICAL** — threatens academic validity or makes a material result unverifiable.
- **MAJOR** — likely assessment deduction or examiner challenge.
- **MODERATE** — clear non-compliance or readability problem.
- **MINOR** — final-polish defect.

The chair guide's quantitative length rule is met: the PDF has 104 physical pages, exceeding the 60-page MA minimum including front matter and references. This does not offset the blockers below.

## Findings

### 1. BLOCKER — unofficial cover and unfilled identity fields

- **Location:** Cover; `main.tex:51–82`.
- **Issue:** The cover contains bracketed fields for school or department, candidate, matriculation number, programme, examiner, supervisor, advisor, and submission date. It also prints an internal note saying that a “TUM-compatible KOMA-Script fallback” was used because template `6aaeb12d2d2eaea03e67a80b` was unavailable. The chair guide, p. 3, directs students to use the TUM cover and document templates. A fallback disclaimer is not thesis content and advertises non-compliance.
- **Fix:** Obtain the current school/programme template, migrate the manuscript, populate every required field exactly, remove the fallback note, and verify logo, naming, title-page order, examiner/advisor terminology, and submission date against the responsible examination office.

### 2. BLOCKER — declaration is a placeholder, not a declaration

- **Location:** p. vii; `main.tex:123–128`.
- **Issue:** The declaration page says “Official wording required” and instructs the candidate to insert the statutory text. It has no official wording, place, date, signature field, or confirmed generative-AI disclosure. This is a direct submission blocker.
- **Fix:** Insert the current official declaration verbatim from the responsible TUM school/examination office, including all required signature, place, date, originality, and AI-use fields. Do not paraphrase it.

### 3. BLOCKER — individual contribution remains unresolved

- **Location:** p. v and p. 25; `main.tex:113–121`; `chapters/04_methods.tex:4–7`.
- **Issue:** The contribution page explicitly says “Unresolved placeholder” and does not attribute code, experimental design, analysis, or writing among co-authors. The methods chapter repeats that the division “remains an administrative placeholder.” Because the thesis reuses a co-authored framework, MI/MPR, and a prior study, exact attribution is essential to establish examinable individual work.
- **Fix:** Name each contributor and state the candidate's precise responsibility for software, data, prompts, campaign design, execution, analysis, figures, and text. Reconcile this statement with the prior paper and obtain supervisor confirmation.

### 4. MAJOR — official front-matter requirements cannot be verified

- **Location:** pp. i–xvii; `main.tex:57–149`.
- **Issue:** The manuscript has an English abstract, contribution statement, declaration placeholder, contents, lists, and abbreviations, but no German abstract or acknowledgements. Their necessity is programme/template-specific. Since the official template was not used, the current order and omissions have no verified administrative basis.
- **Fix:** Confirm with the school whether a German abstract, acknowledgements, embargo/publication statement, or other programme-specific pages are required. Use the official template's exact order rather than the provisional order in this source.

### 5. CRITICAL — the Results chapter cites nineteen nonexistent figures

- **Location:** pp. 42–45 and p. 47; `chapters/05_results.tex:240–242, 256, 309–317, 365–366, 396, 401, 410, 422–427, 571–578`; `main.lof`.
- **Issue:** The prose relies on “Figures 10–22,” but the PDF contains only Figures 4.1, 5.1, and 5.2. The missing heatmaps, article views, dead-rate plot, threshold plot, and diagnostics are central evidence for the persona, article, topology, and missingness claims. Because the references are hard-coded text rather than `\ref`, LaTeX reports no unresolved-reference warning. Page 47 also prints raw filenames such as `fig17_topology_article_mpr.png` instead of figures or formal references.
- **Fix:** Insert every evidentiary figure with `\includegraphics`, a numbered caption, label, and `\cref`; or remove every claim that depends on it. Replace all raw filenames with formal cross-references. Rebuild and verify the List of Figures against every figure cited in prose.

### 6. CRITICAL — `meanMI` and MPR are conflated

- **Location:** pp. iii, 31–32, 42–44, 55–59, and 69; `main.tex:95–101`; `chapters/04_methods.tex:404–417, 470–493`; `chapters/05_results.tex:240–263, 329–371`; `chapters/06_discussion.tex:60–125`; `chapters/08_conclusion.tex:11–28`.
- **Issue:** Methods explicitly distinguish event-weighted cell `meanMI` from node-level `meanNodeMPR`, which weight observations differently. Results then label cell summaries “MPR,” and p. 42 incorrectly expands MPR as “misinformation persistence rate” rather than “misinformation propagation rate.” Table 5.4 and subsequent prose report values as MPR without establishing whether they are `meanMI` or `meanNodeMPR`. This changes the estimand and makes the central results ambiguous.
- **Fix:** Select one named primary estimand. If tables use `meanMI`, call it event-weighted mean MI everywhere. Reserve MPR for the precisely defined node/branch aggregation and report `meanNodeMPR` separately. Correct the acronym expansion throughout, including captions, abstract, discussion, and conclusion.

### 7. MAJOR — “irreversible” is not supported by an eight-tick window

- **Location:** pp. 33, 42–45, 55–57, 63–64, and 69; `chapters/04_methods.tex:530–555`; `chapters/05_results.tex:240–256, 399–408`; `chapters/06_discussion.tex:23–35, 97–124`; `chapters/07_validity_ethics.tex:38–51`; `chapters/08_conclusion.tex:29–35`.
- **Issue:** The thesis repeatedly calls \(k^*\) an “irreversible crossing,” although it only requires no recovery among later *observed* ticks and may first cross at tick eight. The validity chapter itself acknowledges that a tick-eight crossing may recover at tick nine. The label therefore asserts more than the design can observe.
- **Fix:** Rename it throughout as “first threshold crossing sustained through the end of the observed eight-tick horizon.” Report final-tick crossings as right-censored and never use “irreversible,” “lock-in,” or equivalent language.

### 8. MAJOR — the title and firestorm framing exceed the measured construct

- **Location:** Cover; pp. 1–5, 15–24, and 50–53; `main.tex:51–52`; `chapters/01_introduction.tex:10–103`; `chapters/03_theory.tex:21–29, 420–509`; `chapters/05_results.tex:747–980`.
- **Issue:** The subtitle promises “Climate Firestorms,” but the framework concedes that MI/MPR cannot identify a firestorm and the campaign does not test negative affect, empirical speed, cross-media dynamics, binary choice, or platform-scale volume. The study mainly measures audited semantic degradation under synthetic propagation. The title and repeated “climate-firestorm simulation” language create a construct-validity mismatch.
- **Fix:** Either retitle the thesis around audited semantic propagation/climate misinformation, with firestorm theory as a partial interpretive frame, or add and validate the missing firestorm outcomes. Do not label a run a firestorm candidate from MI alone.

### 9. CRITICAL — a constructed fallback is repeatedly treated as empirical validation data

- **Location:** pp. 36–37, 47–53, 57–60, 65, and 69; `chapters/04_methods.tex:680–765`; `chapters/05_results.tex:584–624, 700–742, 820–966`; `chapters/06_discussion.tex:130–160`; `chapters/07_validity_ethics.tex:133–166`; `chapters/08_conclusion.tex:36–43`.
- **Issue:** The D-net object is acknowledged to be a hashtag co-occurrence fallback, not a hydrated retweet cascade, user graph, or temporal diffusion trace. Nevertheless, methods call its values “real,” Results calls it “empirical structure,” and the thesis computes KS tests, distributional similarity, and a “Digital Twin Fidelity Score” against it. A manually reconstructed structural stand-in cannot validate a digital twin of Twitter diffusion. The terminology makes the caveats and the validation claim internally inconsistent.
- **Fix:** Rename the object consistently as a constructed, literature-informed hashtag graph. Remove “real,” “empirical cascade,” and “digital twin validation” language. Present structural comparisons only as sensitivity diagnostics against a designed reference graph, unless genuinely observed interaction data are obtained.

### 10. MAJOR — reproducibility is overclaimed

- **Location:** p. iii, p. 30, pp. 66–67, and pp. 75–86; `main.tex:109–111`; `chapters/04_methods.tex:341–355`; `chapters/07_validity_ethics.tex:169–186`; `chapters/09_appendices.tex`.
- **Issue:** The abstract calls the work a “reproducible mechanism probe,” while Methods states that ER, small-world, scale-free, and action sampling use unseeded `Math.random`, and the hosted generator/judge may vary. The appendix gives local paths but no public archive, commit identifier, checksums, environment lock, licence, or persistent DOI. This supports traceability of one harvest, not exact reproducibility.
- **Fix:** Replace “reproducible” with “archived and traceable” or “protocol-replicable” unless the random-number and model-version controls are repaired. Add a versioned public archive, commit hash, checksums, environment/lock files, licence, and data/code availability statement.

### 11. MAJOR — “one graph seed” is misleading for unseeded generators

- **Location:** pp. 25, 30, 39, 45, 55, 63, and 75; `chapters/04_methods.tex:33–38, 341–355`; `chapters/05_results.tex:30–34, 439–446`; `chapters/06_discussion.tex:5–10`; `chapters/07_validity_ethics.tex:17–28`; `chapters/09_appendices.tex:10–17`.
- **Issue:** The manuscript repeatedly presents `graphRandomSeed=42` as the campaign's graph seed, but Methods admits that several graph builders and action sampling do not consume it. Readers may infer controlled reproducibility or a common seeded realization that does not exist.
- **Fix:** State that one archived realization per configuration was analysed and identify exactly which generators consumed seed 42. Do not describe unseeded realizations as controlled by that seed.

### 12. MAJOR — exploratory significance tests use non-independent pseudo-replicates

- **Location:** pp. 35–36, 45–46, 49, and 63; `chapters/04_methods.tex:654–679, 718–743`; `chapters/05_results.tex:499–504, 545–550, 730–741`; `chapters/07_validity_ethics.tex:17–28`.
- **Issue:** Wilcoxon tests treat eight topology summaries as observations from one campaign; Mann–Whitney tests pool cells nested within shared configurations; KS tests compare one constructed reference object with simulated cascades. The caveats do not make the resulting \(p\)-values inferentially valid. Their presence invites significance-based interpretation that the design cannot support.
- **Fix:** Remove inferential \(p\)-values from the principal thesis results and report effect sizes, signs, denominators, and sensitivity ranges descriptively. If tests remain, place them in an explicitly non-inferential appendix and explain that no sampling distribution over independent runs is available.

### 13. MAJOR — source articles and ground-truth questions lack scholarly provenance

- **Location:** p. 26 and pp. 78–79; `chapters/04_methods.tex:48–60`; `chapters/09_appendices.tex:205–250`.
- **Issue:** Six core articles and five factual questions per article define the measurement target, yet the thesis gives identifiers and short topics without citations to authoritative source documents or a source-by-claim register in the PDF. “Authored or curated” stimuli are not enough to audit whether the Boolean ground truth is valid. Repository paths are not substitutes for citations.
- **Fix:** Add a table for every core article containing source author/institution, title, date, URL/DOI, access date where needed, exact claims/questions, expected answers, and supporting source locations. Cite these sources in Methods and include complete bibliography records.

### 14. MODERATE — unsupported substantive claims remain in the Introduction

- **Location:** p. 1; `chapters/01_introduction.tex:10–16`.
- **Issue:** “These claims can affect how citizens interpret research, institutions, and climate policy” is a substantive effect claim without a citation. The TUM skill requires citations for borrowed, paraphrased, and research-dependent claims.
- **Fix:** Cite empirical work directly supporting the effect, narrow the sentence to motivation rather than established effect, or remove it. Apply the same claim-by-claim check to uncited generalisations in theory and discussion.

### 15. MAJOR — bibliography formatting is not APA or closely APA-like

- **Location:** pp. 71–73; `main.tex:26–31`; `references.bib`.
- **Issue:** The guide permits APA or a closely similar author–date style. The current generic `biblatex` `authoryear` output uses quoted article titles, “In:” before journals, non-APA volume/issue punctuation, and inconsistent URL/DOI presentation. It is author–date, but not closely formatted as APA.
- **Fix:** Confirm the required style with the supervisor and use `biblatex-apa`/Biber or another approved style. Then inspect capitalization, sentence case, journal/volume formatting, DOI URLs, proceedings entries, datasets, and software consistently.

### 16. MAJOR — the prior workshop-paper bibliography record is not publication-complete

- **Location:** reference entry on p. 72; `references.bib:182–193`.
- **Issue:** The entry names the LASS workshop at ACM CIKM 2025 but supplies only an arXiv DOI and no editors, publisher/proceedings title, page/article number, or archival URL. This makes the status of the central prior work ambiguous.
- **Fix:** Replace it with the final archival workshop citation if one exists. If only the preprint exists, cite it explicitly as an arXiv preprint and describe the workshop presentation separately without implying that the arXiv DOI is a proceedings DOI.

### 17. MAJOR — Chapter 7 has malformed hierarchy

- **Location:** pp. 63–67; `chapters/07_validity_ethics.tex:6–16`.
- **Issue:** The chapter begins directly with `\subsection`, producing headings 7.0.1 through 7.0.5. This signals a broken outline and violates the requirement for a logical section hierarchy.
- **Fix:** Promote “Internal and statistical validity,” “Construct and external validity,” “Reproducibility and resource constraints,” “Privacy, research ethics, and dual use,” and “Priority future work” to `\section`, with subordinate items below them.

### 18. MODERATE — appendix numbering is malformed

- **Location:** pp. 75–86; `main.tex:161–164`; `chapters/09_appendices.tex:6–20`.
- **Issue:** `\backmatter` precedes `\appendix`, so the appendix chapter is unnumbered and its sections/tables appear as “1,” “2,” and “Table 1” rather than “Appendix A,” “A.1,” and “Table A.1.” The table numbering is visually confusable with main-matter tables.
- **Fix:** Use the official template's appendix mechanism and place `\appendix` where chapter/float numbering becomes A, A.1, and A.1-style. Verify contents, bookmarks, cross-references, and lists.

### 19. MAJOR — Results and Discussion are not cleanly separated

- **Location:** pp. 50–53 and pp. 55–61; `chapters/05_results.tex:747–980`; `chapters/06_discussion.tex`.
- **Issue:** Results §5.5 contains extended theoretical interpretation, admissible-claim analysis, and three conclusions about Pfeffer. Discussion then repeats the same mapping and implications. This produces redundancy and obscures where evidence ends and interpretation begins.
- **Fix:** Keep §5.5 to observed mapping outputs and measured quantities. Move theoretical meaning, limitations, and implications to Discussion; remove duplicated numerical narration.

### 20. MODERATE — research-question order changes without rationale

- **Location:** pp. 55–57; `chapters/06_discussion.tex:14–160`.
- **Issue:** Discussion answers RQ1, then RQ3, then RQ2, then RQ4, while the Introduction and Conclusion use RQ1–RQ4 order. This weakens traceability between question, method, result, discussion, and conclusion.
- **Fix:** Use the same RQ1–RQ4 order in all chapters, or explicitly justify a different analytical order and provide a question-to-section map.

### 21. MAJOR — several captions are not self-contained

- **Location:** pp. 43–44 and p. 52; `chapters/05_results.tex:263–287, 329–345, 371–386, 875–946`.
- **Issue:** Tables 5.4 and 5.5 use \(n_c\), MPR\(_c\), \(k^*_c\), \(n_d\), MPR\(_d\), and “Dead c/d” without defining all symbols or clarifying that the reported “MPR” conflicts with the primary `meanMI` estimand. Table 5.6 merely says “Article-level live-cell MPR” without denominators or an aggregation definition. Table 5.11 is set in very small type and contains paragraph-length claims that require surrounding prose.
- **Fix:** Define every abbreviation, instrument, population, denominator, weighting rule, exclusion, and \(N\) in each caption or table note. Correct MI/MPR naming. Split Table 5.11 or move detailed limitations into prose.

### 22. MAJOR — table and appendix typography impairs readability

- **Location:** p. 52 and pp. 75–78, especially Tables 5.11 and 1–4; `chapters/05_results.tex:875–946`; `chapters/09_appendices.tex:20–250`.
- **Issue:** Table 5.11 is difficult to read at final page size. Appendix identifiers and prose are broken across lines into fragments such as `conspiracy_haarp_wea/ther` and `T2d H dual; dis-crete head-line`. The build log records extensive underfull boxes and an 8.69 pt overfull box. This fails the final-PDF legibility requirement.
- **Fix:** Redesign wide tables in landscape or as smaller focused tables; use sensible column widths, controlled line breaks, and abbreviated identifiers with a lookup list. Inspect every page at 100% after a clean build.

### 23. MAJOR — internal pipeline status and credential instructions appear as thesis claims

- **Location:** p. 37, p. 63, and p. 86; `chapters/04_methods.tex:654–679`; `chapters/07_validity_ethics.tex:6–13`; `chapters/09_appendices.tex:620–644`.
- **Issue:** The thesis prints an internal `thesisGrade=false` flag and devotes a final section to API-key handling, ignored `.env` files, branch consolidation, and obsolete 290-cell copies. These are repository-maintenance notes, not academic argument. `thesisGrade=false` is especially damaging because it reads as an explicit admission that the harvest is not thesis-grade, without a formal definition of that flag.
- **Fix:** Remove the internal flag from the thesis or define a scientifically meaningful quality criterion independently. Move credential, branch, and conflict-copy instructions to a repository README. Retain only academically relevant reproducibility and data-governance information.

### 24. MAJOR — repository paths are not a durable data/code availability statement

- **Location:** p. 37 and pp. 75–86; `chapters/04_methods.tex:770–790`; `chapters/09_appendices.tex`.
- **Issue:** Reproducibility depends on relative local paths such as `thesisExperiment/...`, but the thesis gives no repository URL, archive DOI, release tag, commit, licence, checksums, or access conditions. An examiner or future reader receiving only the PDF cannot retrieve the materials.
- **Fix:** Add a concise data/code availability section with a persistent archive, exact release/commit, licence, checksums, software environment, and a mapping from thesis tables to archived artifacts.

### 25. MODERATE — language variety and terminology are inconsistent

- **Location:** throughout; examples at pp. 15–24 and pp. 25–37; `main.tex:11–12`; `chapters/03_theory.tex:1, 31–35, 161–170`; `chapters/04_methods.tex:110–150`.
- **Issue:** The manuscript mixes British forms (“operationalisation,” “behaviour,” “polarised”) with American forms (“operationalization,” “behavior,” “polarized”), while `csquotes` is configured for American English. The same concepts also alternate between “misinformation severity,” “persistence,” “propagation rate,” and “mean MI.”
- **Fix:** Select one English variety and enforce it throughout. Create a terminology sheet for MI, MPR, `meanMI`, `meanNodeMPR`, dead cell, \(k^*\), D-net, and firestorm; apply it mechanically and then review meaning in context.

### 26. MODERATE — PDF metadata and accessibility fields are absent

- **Location:** PDF document properties; `main.tex:33`.
- **Issue:** The compiled PDF has blank Title and Author metadata and is untagged. The `\title` and `\author` macros are not propagated because the custom title page is used without explicit `hyperref` metadata. This also exposes the placeholder author source.
- **Fix:** After identity fields are final, set `pdftitle`, `pdfauthor`, `pdfsubject`, and keywords through the official template or `\hypersetup`. Check whether the school requires tagged/accessibility-compliant PDF output.

### 27. MINOR — source still identifies final chapters as drafts

- **Location:** `chapters/01_introduction.tex:1`; `chapters/07_validity_ethics.tex:1–3`; `chapters/09_appendices.tex:1–5`; `references.bib:1`.
- **Issue:** Source comments call chapters “Draft chapter,” “Draft chapter fragment,” and the bibliography “Literature-review bibliography.” These comments do not print, but they indicate that the final source has not received a release-cleanup pass.
- **Fix:** Remove stale draft comments after substantive corrections and rename comments/files to reflect the final thesis-wide role.

## Submission-risk order

1. Replace the unofficial template and resolve all cover, declaration, and contribution fields.
2. Restore or remove every missing figure and raw filename reference.
3. Repair the MI/MPR estimand, \(k^*\) language, and D-net “empirical validation” claims.
4. Remove pseudo-inferential statistics or redesign with independent replications.
5. Add source/ground-truth provenance and durable code/data availability.
6. Apply the approved citation style, rebuild hierarchy/appendix numbering, and complete a page-by-page legibility check.
