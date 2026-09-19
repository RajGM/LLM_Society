# Round-1 revision summary

This pass applied round-one reviewer findings and both forensic corrections to
`thesisExperiment/thesis_final/` without rerunning experiments and without a
grade guarantee. Identity fields, official TUM wording, and `.env` contents
were not invented or printed.

## Outcome

- **Primary PDF:** `thesisExperiment/thesis_final/main.pdf` (rebuild recorded below).
- **Narrative centre:** measurement-sensitivity audit of an inherited
  auditor–node instrument; composition and bundled network conditions are
  secondary descriptive probes; firestorm theory is a design audit.
- **Preserved modularity:** unique-undirected Newman–Girvan; homogeneous
  one-community \(Q=0\); mixed conspiracy cut \(Q=0.4297\).
- **API-error facts used throughout:** 64,270 HTTP-error counters; 203,928
  successes; 121/288 runs affected; 36,194 audit-eligible events unscored; no
  observed parse/all-correct fallback; continuous He−H \(+0.1549\) canonical
  but \(-0.0295\) zero-error (**not robust**); dual \(+0.3986\) canonical and
  \(+0.4695\) zero-error; only 5 clean alternative reruns.

## Decisions

See `REVISION_MATRIX.md` for finding-by-finding status.

| Decision | Count |
|---|---|
| Accepted | 148 |
| Deferred | 18 |
| Rejected | 0 |

## Deferred (not resolvable in this pass)

1. Official TUM cover/template, identity fields, statutory declaration, German
   abstract confirmation, acknowledgements if required.
2. Verified individual-contribution split among co-authors.
3. Public archive URL, DOI, licence, checksums.
4. Colorblind-safe regeneration of existing heatmap PNGs.
5. New matched factorials, independent seeds, human evaluation, hydration, or
   an LLM-network baseline.
6. Residual table hyphenation / KOMA float / Latin Modern bold-small-caps
   warnings.

## Main manuscript changes

- British English; `biblatex-apa`; hyperref metadata placeholders.
- `\appendix` before appendices, then `\backmatter`.
- RQ alignment (RQ1 measurement; RQ2 named compositions; RQ3 bundled network
  conditions and survival; RQ4 constructed-graph stress test).
- Live-cell mean MI vs node MPR; eight-tick sustained \(k^*\); four D-net
  configs / eight article cells.
- Ring shares the chain action regime; N=1 is a parser/mtime rule; hop 0–7;
  inbox overflow; reverse trust; He mix realisation caveats.
- Maurya cited as arXiv preprint; Debnath dataset v1/v2 metadata; Larooij 2025;
  Hu 2024 LAID; Cook/IPCC/UNFCCC/Keutsch article provenance.
- Figures 10–22 inserted as labelled floats.

## Build

- Command: `latexmk -g -pdf -interaction=nonstopmode -halt-on-error main.tex`
- PDF: `thesisExperiment/thesis_final/main.pdf`
- Pages: 116
- Words (pdftotext): 37,016
- Undefined refs/cites: 0 / 0
- Warnings: 3 overfull hboxes (3.32 pt TOC; 3.90 pt methods table; 8.69 pt
  appendix CSV names); 85 underfull boxes; `lmtt` bold fallback
- Appendix numbering: A / A.1 / Table A.10

No grade is implied by this revision.
