# Thesis integration log

## Source register

- Writing rules: uploaded TUM academic-writing skill and chair thesis guide.
- Prior paper: uploaded Maurya et al. LASS manuscript.
- Drafts: all files `thesis_work/drafts/00` through `15`.
- Canonical evidence: `results_phase2/summary.json`,
  `analysis_phase2/`, `analysis_full/`, `AGENT_HANDOFF.md`, and
  `CONSOLIDATION_LOG.md`.
- Build precedent and package set: `latex_phase2/`.
- Template search result: `6aaeb12d2d2eaea03e67a80b` was not found.
- Round-1 reviews: `reviews/round1/01`–`12`, `08A_MODULARITY_CORRECTION.md`,
  `REVISION_MATRIX.md`, `REVISION_SUMMARY.md`, and
  `analysis_full/API_ERROR_AUDIT.md`.
- Round-2 reviews: `reviews/round2/01_EVIDENCE.md`, `02_TUM_LANGUAGE.md`,
  `03_LATEX.md`, `04_EXAMINER.md` (canonical copies under
  `thesisExperiment/thesis_final/reviews/`; identical mirrors at repo-root
  `reviews/`).

## Integration decisions

1. Used a TUM-compatible KOMA-Script `scrbook` fallback. No official wording,
   logo placement, or administrative field was invented.
2. Replaced the Phase 1 material in draft 14. The abstract, introduction,
   discussion, and conclusion now use the same four Phase 2 RQs:
   measurement, persona composition, bundled network conditions, and D-net
   stress test.
3. Kept the prior auditor--node architecture, MI, MPR, and general-news chain
   results outside the thesis contribution claim.
4. Applied the canonical 292 hatched-dead count. Older 290-cell text was not
   revived.
5. Kept T2c continuous and T2d dual-discrete live-cell mean MI separate. The
   dual sidecar and absolute gap remain diagnostics, not a third MPR.
6. Defined C5 as a table union. D-net remains a separately executed 63-node
   custom network with four configurations and eight article cells.
7. Reported N=1 as a parser/mtime rule, eight processing ticks (recorded hops
   0--7), `gpt-4o-mini`, 288 configurations, and 1,728 cells.
8. Treated the Debnath object as hashtag co-occurrence. It is not a retweet
   cascade and supplies no empirical MPR or usable temporal series.
9. Preserved Pfeffer's original seven Outlook factors. The six knobs are a
   computational remapping; cross-media remained held.
10. Stated the absence of human evaluation and the failed hydration attempt.
11. Cited Maurya et al.\ as an arXiv preprint; workshop/award status is not
    independently verified.
12. Copied canonical figures into `thesis_final/figures/` and referenced each
    displayed figure with `\Cref`.
13. Placed schemas and inventories in appendices rather than padding the body.
14. Preserved unique-undirected Newman--Girvan modularity: homogeneous
    one-community \(Q=0\); mixed conspiracy cut \(Q=0.4297\).
15. Reported the API-error audit: 203,928 successes; 64,270 HTTP-error
    counters; 121/288 runs; 36,194 unscored eligible events; no observed
    parse/all-correct fallback. Continuous He−H is not robust to the
    zero-error restriction.

## TUM writing-rule corrections

- Shortened causal or universal claims to descriptive, one-run statements.
- Replaced vague H/He interpretations with explicit composition language.
- Defined acronyms and constructs at first substantive use.
- Removed the conflicting Phase 1 abstract and conclusion.
- Marked prior work, missing evidence, and non-implemented mechanisms.
- Used active academic verbs and paragraph topic sentences where the source
  drafts permitted direct integration.
- British English; `biblatex-apa`; firestorm theory as a design audit.

## Unresolved placeholders

See `SUBMISSION_INPUTS_REQUIRED.md` for the remaining user-only fields.
Round-2 P0 filled every field that the repository could verify and left the
rest as conspicuous `[USER INPUT REQUIRED: ...]`.

## Round-2 P0 submission-blocker pass (2026-09-19)

Filled from repository evidence only:

- Candidate: Raj Gaurav Maurya (`hyperref` `pdfauthor` matched).
- University / school / programme as attested in the proposal extract:
  Technical University of Munich; School of Social Sciences and Technology;
  M.Sc. Data \& Society. Official template wording remains a user input.
- Supervisors: Prof.\ Dr.\ Jürgen Pfeffer; Dr.\ Ramit Debnath.
- German abstract written from the English abstract; MI/MPR caveats retained.
- Acknowledgements page omitted (no “insert thanks”).
- Contribution page: conservative, artefact-linked draft; each assertion
  labelled for candidate confirmation; prior MI/MPR paper not claimed as
  sole authorship.
- Ethics: no determination/approval artefact in the repository; exemption
  not claimed.
- Archive: `https://github.com/RajGM/LLM_Society`;
  `origin/main` SHA `042023488cefb343e739ad4b4bdba5d23171ff48`;
  no `LICENSE` file found; no DOI invented; SHA-256 of five harvest index
  files recorded.

Still required from the candidate/office (not invented):

- Matriculation number; official title metadata; chair/programme wording;
  first-examiner/advisor labels; submission date; official template;
  verbatim statutory declaration and AI disclosure; signature;
  confirmed CRediT split; ethics determination artefact; licence choice;
  archive DOI if one is minted.

## Round-1 revision (2026-09-19)

Finding-level decisions are in `reviews/round1/REVISION_MATRIX.md`
(148 accepted, 18 deferred, 0 rejected). No experiment was rerun. No grade
is implied.

## Build record

- Build command: `latexmk -g -pdf -interaction=nonstopmode -halt-on-error main.tex`.
- Round-2 P0 rebuild (2026-09-19 17:27 UTC): successful; `pdflatex` and `biber`
  completed. Author metadata is Raj Gaurav Maurya. Remaining blanks print as
  `[USER INPUT REQUIRED: ...]`.
- PDF: `thesisExperiment/thesis_final/main.pdf`.
- Page count: 116.
- PDF-extracted word count: 38,032.
- Undefined citations: 0.
- Undefined cross-references: 0.
- Appendix numbering: Appendix A / A.1 / Table A.10.
- Residual warnings: methods comparison table 3.90 pt; two declaration
  placeholder overfulls (1.09 pt and 27.50 pt); underfull boxes in narrow
  tables; `lmtt` bold fallback (`bx` → `b`). These do not hide thesis text.
- PDF metadata: title/subject/keywords set; author is Raj Gaurav Maurya.
- Archive SHA recorded: `origin/main`
  `042023488cefb343e739ad4b4bdba5d23171ff48`.
- Prior round-1 PDF: 116 pages; 37,016 extracted words; `pdfauthor` was still
  `[CANDIDATE NAME]`. That author field is now filled.

## Round-2 TUM language verification (2026-09-19)

Source: uploaded skill `SKILL_TUM-ACADEMIC_WRITING_042a.md` and the chair-guide
extract in `thesis_work/drafts/00_TEMPLATE_COMPLIANCE.md`. Scope: abstract,
introduction, transitions, discussion, conclusion, sentence length, RQ
alignment, and grade/award hype. Only critical/major prose was edited;
numerical claims were preserved.

- Review: `reviews/round2/02_TUM_LANGUAGE.md` (mirrored under
  `thesisExperiment/thesis_final/reviews/round2/`).
- Verdict: **PASS** after those repairs. No grade is implied.
- Principal repairs: removed Conclusion grade-meta sentence; aligned
  Discussion RQ1--RQ4 headings and order; merged duplicate measurement
  block into RQ1; split the 50-word D-net contrast sentence; replaced
  remaining promotional/defensive phrasing in intro, theory close,
  discussion, and Results handover.
- Language-pass rebuild: `latexmk -g -pdf -interaction=nonstopmode -halt-on-error main.tex`.
  Status: successful. Pages: 116. PDF-extracted words: 37,894.
  Undefined citations/references: 0 / 0.
  Residual overfull boxes: declaration placeholder 1.09 pt; methods
  comparison table 3.90 pt; ethics/declaration line 27.50 pt.

## Round-2 LaTeX technical check (2026-09-19)

Clean `latexmk -g` / Biber rebuild after wrapping remaining overfull boxes.
Review: `reviews/round2/03_LATEX.md` (mirrored under
`thesisExperiment/thesis_final/reviews/round2/`).

- Status: successful; 116 pages; 2,242,482 bytes; 37,892 extracted words.
- Undefined citations/references: 0 / 0.
- Overfull boxes: **0**.
- Underfull boxes: 78 hbox / 10 vbox (narrow tables; cosmetic).
- Appendix numbering: A / A.1--A.10 / Table A.1--A.10.
- Fonts: 32 subset-embedded Type 1; `lmtt` bx→b fallback unchanged.
- PDF metadata: title/subject/keywords set; author Raj Gaurav Maurya;
  untagged; no XMP stream.

## Final consolidation milestones (2026-09-19)

Preserved thesis commit: `389b0bf85d5e054a1f972989217f7c7009e04e6d`
(`Fix remaining thesis overfull boxes and record round-2 LaTeX check`).
Science, LaTeX source, and PDF were not rewritten in this consolidation.
The only missing review artefact was copied from
`cursor/round2-evidence-a349` (`179ec7a`); all other round-1/round-2 reports
were already on `main`.

| Milestone | Commit | Artefact |
|---|---|---|
| Initial integration | `13e4ca4` | Assemble complete Phase 2 master's thesis into `thesis_final/` |
| Initial PDF | `4383827` | First verified `main.pdf` |
| 12 round-1 reviews | on `main` | `reviews/round1/01`–`12` (TUM, narrative, methods, stats, numbers, literature, figures, Debnath/Pfeffer, validity, language, LaTeX, award jury) |
| Modularity correction | `47b4f52`, `d804c52` | Unique-undirected Newman–Girvan; \(Q=0\) / \(Q=0.4297\); `08A_MODULARITY_CORRECTION.md` |
| API-failure audit | `d6cb55c`, `8cd6a85`, `0a22657` | `analysis_full/API_ERROR_AUDIT.md`; 203,928 successes; 64,270 HTTP-error counters; continuous He−H not robust |
| Round-1 revision | `7e75c52`, `0420234` | `REVISION_MATRIX.md` (148 accepted, 18 deferred, 0 rejected); `REVISION_SUMMARY.md`; 116-page rebuild |
| Submission metadata pass | `d86f285`, `e98f7f8` | Verifiable fields filled; remainder as `[USER INPUT REQUIRED]`; `SUBMISSION_INPUTS_REQUIRED.md` |
| Round-2 examiner | `280c016` | `reviews/round2/04_EXAMINER.md` (severe MA report; no grade implied) |
| Round-2 evidence | `179ec7a` (now on `main`) | `reviews/round2/01_EVIDENCE.md` (PASS; thesis not edited) |
| Round-2 TUM language | `8da2383`, `560d766` | `reviews/round2/02_TUM_LANGUAGE.md`; PASS after critical/major prose repairs |
| Round-2 LaTeX | `389b0bf` | `reviews/round2/03_LATEX.md`; 0 overfull boxes |

### Review inventory on `main`

Canonical directory: `thesisExperiment/thesis_final/reviews/`.
Identical mirrors: repo-root `reviews/`.

- Round 1: **15** files (12 reviews + `08A_MODULARITY_CORRECTION.md` +
  `REVISION_MATRIX.md` + `REVISION_SUMMARY.md`).
- Round 2: **4** files (`01_EVIDENCE`, `02_TUM_LANGUAGE`, `03_LATEX`,
  `04_EXAMINER`).
- Also present: `SUBMISSION_INPUTS_REQUIRED.md`, `CLAIM_EVIDENCE_MATRIX.md`.

### Final PDF (thesis source unchanged from `389b0bf`)

Clean `latexmk -g -pdf -interaction=nonstopmode -halt-on-error main.tex`
on 2026-09-19 17:40 UTC reproduced the same document. Science was not
edited. The rebuilt binary differed only by PDF timestamp; the committed
file remains the `389b0bf` artefact.

- Path: `thesisExperiment/thesis_final/main.pdf`
- Pages: 116
- Bytes: 2,242,482
- PDF-extracted words: 37,892
- Undefined citations / cross-references: 0 / 0
- Overfull boxes: 0
- Underfull boxes: 78 hbox / 10 vbox (narrow tables; cosmetic)

### Unresolved user inputs (not invented)

See `SUBMISSION_INPUTS_REQUIRED.md`. Remaining `\UserInput{…}` sites: **14**
(12 in `main.tex`, 1 in Chapter 7 ethics, 1 in Appendix data-availability)
plus **8** `[CANDIDATE MUST CONFIRM]` contribution lines.

Must still come from the candidate/office:

1. Matriculation number
2. Official title metadata
3. Official chair / programme / degree wording
4. First-examiner / advisor labels
5. Official submission date
6. Official school/programme LaTeX template
7. Statutory declaration (verbatim)
8. Generative-AI disclosure (verbatim)
9. Place and date of signature
10. Wet-ink or accepted electronic signature
11. CRediT / contribution confirmation (8 labelled lines)
12. Ethics determination artefact
13. Archive licence
14. Archive DOI (only if one is minted)

Search the compiled PDF for `USER INPUT REQUIRED`. Do not invent values.
Do not commit `.env`. No grade is implied.
