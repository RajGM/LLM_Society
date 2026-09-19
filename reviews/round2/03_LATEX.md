# Round 2: LaTeX technical check

## Verdict

**PASS** after a clean `latexmk`/`biber` rebuild and correction of the remaining
margin overflows. The post-revision thesis compiles without undefined
references, undefined citations, duplicate labels, missing graphics, fatal
errors, or overfull boxes. All PDF fonts are subset-embedded. Appendix
numbering is A / A.1–A.10 / Table A.1–A.10. Cosmetic underfull boxes in
narrow tables remain and do not hide text.

No grade is implied.

## Build checked

- Working directory: `thesisExperiment/thesis_final/`
- Command: `latexmk -g -pdf -interaction=nonstopmode -halt-on-error main.tex`
- Equivalent bibliography pass: Biber 2.19 on `references.bib` (46 citekeys;
  no Biber warnings or errors)
- Toolchain: pdfTeX 1.40.25 (TeX Live 2023/Debian), LaTeX 2023-11-01,
  latexmk 4.83
- Result: success; `main.pdf`, **116 physical pages**, 2,242,482 bytes
- PDF-extracted word count: **37,892** (front matter, tables, captions,
  references, and appendices included)
- latexmk reported all targets up to date; no extra LaTeX/Biber pass requested

## Round-1 items rechecked

| Round-1 finding | Round-2 status |
|---|---|
| High: `\backmatter` before `\appendix` broke A-numbering | **Resolved.** `main.tex` calls `\appendix` then inputs `chapters/09_appendices.tex`, then `\backmatter`. TOC shows Appendix A and A.1–A.10; listings resolve as A.1–A.6; tables as A.1–A.10. |
| Medium: empty PDF Title/Author/Subject/Keywords | **Resolved at hyperref level.** `pdfinfo` reports Title, Author (`Raj Gaurav Maurya`), Subject, and Keywords. Not tagged; no XMP metadata stream. |
| Medium: visible submission placeholders | **Deferred (not a build failure).** Remaining blanks print as `[USER INPUT REQUIRED] (…)` for matriculation, official wording, declaration text, signature, and related office fields. Acknowledgements page is omitted. |
| Low: four overfull hboxes (TOC 3.32 pt; methods 3.90 pt; appendix 8.69 pt) | **Resolved in this pass** (see Fixes). Final log: **0 overfull `\hbox`**, **0 overfull `\vbox`**. |
| Low: underfull boxes | **Documented; not treated as blocking.** 78 underfull `\hbox`, 10 underfull `\vbox`. |
| Low: bookmark math for \(k^{*}\) | **Resolved.** Headings use `\texorpdfstring`. No `Token not allowed` hyperref warnings. |
| Low: Latin Modern bold small caps / `lmtt` bx→b | **Unchanged font fallback.** `T1/lmtt/bx/n` substituted by `T1/lmtt/b/n` (expected). All 32 listed fonts remain subset-embedded Type 1. |
| Low: KOMA `\float@addtolist` | **Resolved.** `scrhack` is loaded; no KOMA float compatibility warning. |

## Fixes applied in this pass

Critical/major technical defects were edited in source and the PDF was rebuilt.

1. **Stale appendix compile note.** The appendix no longer tells the reader it
   is a `drafts/15_APPENDICES` fragment without a master file. It now points to
   `thesisExperiment/thesis_final/main.tex` and `BUILD.md`.
2. **Appendix `dual_gap.csv` paragraph (was 8.69 pt overfull).** Wrapped in
   `\begin{sloppypar}\raggedright` so unhyphenated `\texttt` field names wrap
   inside the type block.
3. **SHA-256 checksum table (was 146.81 pt overfull).** Hashes sat in an `l`
   column beside paths and overflowed by about 5 cm. Each path/hash pair is now
   stacked in `p{\textwidth}`.
4. **Comparison-family table (was 3.90 pt overfull).** `tab:mm-c1-c5` column
   fractions plus `\tabcolsep` exceeded `\textwidth`. The table now uses
   `@{}` outer padding and slightly narrower `p{…}` widths
   (`0.07+0.30+0.23+0.26`).
5. **`\UserInput` overflow (was 1.09 pt and 27.50 pt).** The whole placeholder
   string was bold typewriter and could not hyphenate. The tag remains
   `\texttt{[USER INPUT REQUIRED]}`; the detail is roman and may wrap. The
   long ethics placeholder is also in `sloppypar`.
6. **TOC Roman page numbers (was 3.32 pt overfull on bold `xvii`).**
   `\DeclareTOCStyleEntry[pagenumberwidth=2.6em]{tocline}{chapter}`.

## Checks with no defect found

- **References and labels:** 161 unique labels, no duplicates. Every `\ref` /
  `\cref` / `\Cref` / `\eqref` target exists, including listings labels
  `lst:config-name-grammar` (A.1, p. 84) through `lst:reproduction-commands`.
  0 undefined cross-references in `main.log`.
- **Citations:** 46 cited keys; all present in `references.bib`. 0 undefined
  citations. One database entry is uncited and correctly omitted:
  `geoeng2023codes`.
- **Figures:** 15 `\includegraphics` files, all present under `figures/`.
  List of Figures contains Figure 4.1 and Figures 5.1–5.15. No missing-graphic
  error. Twenty additional PNGs in `figures/` are unused assets, not missing
  includes (`fig00_methods.png`, alternate `fig01`–`fig12` analysis-layer
  names).
- **Floats:** no “float too large”, “too many unprocessed floats”, or lost-float
  warning.
- **Page sequence (A4, twoside, openright):** internally consistent.
  - Physical 1: title leaf (no printed folio); physical 2 blank.
  - Roman front matter: Abstract iii, Zusammenfassung v, Individual
    contribution vii, Declaration ix, Contents xi–xiv, List of Figures xv–xvi,
    List of Tables xvii–xviii, Abbreviations xix; physical 20 blank.
  - Main matter restarts at Arabic 1 (physical 21): Ch. 1 p. 1, Ch. 2 p. 7,
    Ch. 3 p. 15, Ch. 4 p. 25, Ch. 5 p. 41, Ch. 6 p. 63, Ch. 7 p. 71,
    Ch. 8 p. 77.
  - References 79–82 (physical 99–102).
  - Appendix A 83–95 (physical 103–115); physical 116 is the expected final
    even verso.
  Open-right blanks remain before chapters 2, 3, 5, 7 (printed 6, 14, 40, 70).
- **PDF safety basics:** PDF 1.5, unencrypted, no JavaScript, no forms, no
  rotation, `Suspects: no`.

## Residual warnings (cosmetic)

- **78 underfull `\hbox`:** almost all in narrow `p{…}` / `longtable` cells
  (theory ledger, methods comparison, results tables, appendix inventories).
  High-badness cells still hyphenate aggressively (for example “dis-crete
  head-line”, “Identity” in the configuration matrix). They do not overflow
  the margin.
- **10 underfull `\vbox`:** page-stretch around floats/tables (badness up to
  10000). No unprocessed floats.
- **`lmtt` bold fallback:** `Font shape T1/lmtt/bx/n` → `T1/lmtt/b/n` on the
  title-page and declaration placeholder tag. Not a missing PDF font.
- **Informational package probes:** optional `biblatex-dm.cfg` “not found”
  remains a package search, not a missing project file.
- **Untagged PDF / no XMP stream:** may be required later for accessibility
  submission rules; not a compile failure.
- **`\path` line breaks** in Table A.10 still split some long identifiers
  (for example `results_phase2`) at non-slash points. Readable; no overfull
  box.

## Page and warning summary

| Item | Value |
|---|---|
| Physical pages | **116** |
| Printed last content folio | **95** (Appendix A.10); physical 116 blank |
| Words (`pdftotext`) | **37,892** |
| Undefined refs | **0** |
| Undefined cites | **0** |
| Overfull `\hbox` / `\vbox` | **0 / 0** |
| Underfull `\hbox` / `\vbox` | **78 / 10** (cosmetic) |
| Embedded fonts | **32 / 32** subset-embedded Type 1 |
| Appendix numbering | **A / A.1–A.10 / Table A.1–A.10** |

## Remaining non-build submission work

These are unchanged deferred office/identity items, not LaTeX errors:

- Official TUM template, matriculation number, chair/programme wording,
  first-examiner labels, submission date.
- Verbatim statutory declaration and generative-AI disclosure.
- Confirmed individual-contribution split and ethics-determination artefact.
- Licence file vs README/`package.json` mismatch; archive DOI if minted.
- PDF tagging if the examination office requires it.
