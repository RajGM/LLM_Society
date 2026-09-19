# Round 1: LaTeX technical review

## Verdict

The thesis builds successfully and reproducibly, with no undefined references,
undefined citations, duplicate labels, missing build inputs, fatal errors, or
unprocessed-float warnings. The generated PDF is readable and all fonts are
embedded. One source-ordering defect should be fixed before submission:
`\backmatter` is entered before `\appendix`, which suppresses the appendix
chapter letter and produces incorrect appendix numbering.

## Build checked

- Working directory: `thesisExperiment/thesis_final/`
- Command: `latexmk -g -pdf -interaction=nonstopmode -halt-on-error main.tex`
- Result: success; `main.pdf`, 104 physical pages, 960,928 bytes
- Toolchain: pdfTeX 1.40.25, LaTeX 2023-11-01, Biber 2.19, latexmk 4.83
- Bibliography pass: 36 cited keys processed; no Biber warnings or errors

The forced build completed without requesting another LaTeX/Biber pass.

## Findings

### High: appendix numbering is broken by back-matter ordering

`main.tex` invokes `\backmatter` before loading `chapters/09_appendices.tex`;
that chapter then invokes `\appendix`. In `scrbook`, back matter uses unnumbered
chapters. The output consequently shows:

- TOC entry `Reproducibility materials` without “Appendix A”;
- appendix sections numbered `1` through `9`, not `A.1` through `A.9`;
- appendix tables numbered `1` through `10`, not `A.1` through `A.10`;
- internal destinations such as `section.Alph0.8` and `table.Alph0.10`.

The first appendix page visibly begins “1 Configuration matrix” and “Table 1”.
Move the appendix out of `\backmatter` (or otherwise establish numbered appendix
matter) when source changes are permitted.

### Medium: PDF document metadata is empty

`pdfinfo` reports empty Title, Author, Subject, and Keywords fields even though
the source has `\title` and `\author`. The PDF has no XMP metadata stream and is
not tagged. At minimum, set `pdftitle`, `pdfauthor`, `pdfsubject`, and
`pdfkeywords` through `hyperref` after replacing the candidate placeholders.
PDF tagging may also be required by the submission/accessibility rules.

### Medium: unresolved submission placeholders remain visible

The title page still contains candidate, matriculation, programme, examiner,
supervisor, advisor, department, and date placeholders. Front matter also
contains explicit unresolved contribution and statutory-declaration text and
identifies the layout as a KOMA-Script fallback. These are not build failures,
but they make the current PDF unsuitable for submission.

### Low: four overfull boxes

The final log contains four overfull horizontal boxes and no overfull vertical
boxes:

- `main.toc` line 5: 0.1675 pt (Roman page number `xiii`);
- `main.toc` line 7: 3.31563 pt (Roman page number `xvii`);
- `chapters/04_methods.tex` lines 590–621: 3.90222 pt, comparison-family table;
- `chapters/09_appendices.tex` lines 458–466: 8.68666 pt, long monospaced CSV
  field names.

The appendix overflow is the most likely to be visible and should be inspected
and corrected before final output. The two TOC overruns are small.

### Low: numerous underfull boxes

The log contains 78 underfull `\hbox` and 10 underfull `\vbox` reports. Most
horizontal reports arise in narrow table columns, especially the theory ledger,
methods comparison table, results tables, and appendix longtables. The 10
vertical reports are page-stretch warnings around float/table placement. They
do not stop the build, but high-badness appendix table cells visibly produce
aggressive word breaks such as “per-sonas” and “dis-crete head-line”.

### Low: PDF bookmark strips mathematics

The heading `Network threshold \(k^{*}\)` generates two `hyperref` warnings:
math shift and superscript tokens are removed from the PDF string. The printed
heading is unaffected, but its bookmark will not faithfully contain `k*`.
Provide a text bookmark alternative (for example with `\texorpdfstring`) when
editing is allowed.

### Low: font substitutions in one styled phrase

All 32 listed fonts are subset-embedded Type 1 fonts with Unicode mappings.
There are no unembedded fonts. Latin Modern lacks bold small caps
(`T1/lmr/bx/sc`), so the bold-small-caps combination around `\MPR` in
`chapters/07_validity_ethics.tex` line 134 is replaced by bold upright. The log
also records the expected Latin Modern mono bold fallback. These are style
substitutions, not missing PDF fonts.

### Low: KOMA-Script float compatibility warning

KOMA-Script reports deprecated `\float@addtolist` use, triggered by the float/
caption package stack. No float is lost, oversized, stuck, or silently moved
because of an invalid placement specifier. Loading `scrhack` or revisiting the
caption package combination would remove the compatibility warning.

## Checks with no defect found

- **References and labels:** 146 resolved auxiliary labels, all unique; no
  undefined or multiply defined references. The listing label
  `lst:config-name-grammar` resolves correctly.
- **Citations:** 83 citation calls covering 36 unique keys; every cited key is
  present. The two uncited database entries are correctly omitted by the
  default cited-only bibliography.
- **Bibliography:** author–year output is consistently generated; initials,
  2023a/2023b disambiguation, DOI/URL links, accents, and sorting render
  correctly. Long DOI/URL strings wrap, but generate no overfull box.
- **Files:** all chapter and graphic inputs used by the build exist. Both PNG
  figures are embedded. No `No file`, missing graphic, or missing bibliography
  error occurs. The optional `authoryear.dbx` and `biblatex-dm.cfg` “not found”
  lines are informational package probes, not missing project dependencies.
- **Floats:** no “float too large”, “too many unprocessed floats”, changed
  specifier, or lost-float warning. Figure 5.1 and Figure 5.2 share thesis page
  47 as intended; lists of figures and tables are populated.
- **Page sequence:** A4, two-sided/open-right layout is internally consistent.
  The title leaf occupies physical page 1 without a printed number; Roman front
  matter begins with Abstract on iii; main matter restarts at Arabic page 1;
  References occupy 71–73; blank page 74 is the expected open-right verso; the
  appendix starts on 75. The defect is appendix *counter formatting*, not the
  physical page sequence.
- **PDF safety basics:** PDF 1.5, unencrypted, no JavaScript, no forms, no
  rotation, and no suspect-font report.

## Recommended pre-submission order

1. Correct appendix/back-matter ordering and verify A-style numbering.
2. Replace all title/front-matter placeholders and official declaration text.
3. Add real PDF metadata (and tagging if required).
4. Fix the 8.69 pt appendix overflow and review narrow longtable typography.
5. Supply bookmark-safe text for the mathematical heading and resolve the
   remaining font/float compatibility warnings if the template permits.
