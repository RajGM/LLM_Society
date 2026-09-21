> Historical manuscript record. This snapshot is not the source of the signed final PDF. Editorial files referenced below were removed during submission cleanup; their committed versions remain in Git history. See the [current repository guide](../../README.md).

# Build and verification

The named template `6aaeb12d2d2eaea03e67a80b` was unavailable. The thesis
therefore uses `scrbook` with A4 paper, two-sided layout, author--date
citations, and explicit metadata placeholders.

## Build

From `thesisExperiment/thesis_final/`:

```bash
latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex
```

Clean generated intermediates without deleting `main.pdf`:

```bash
latexmk -c main.tex
```

The equivalent manual sequence is:

```bash
pdflatex -interaction=nonstopmode -halt-on-error main.tex
biber main
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
```

## Counts and checks

```bash
pdfinfo main.pdf | sed -n 's/^Pages:[[:space:]]*//p'
pdftotext main.pdf - | wc -w
rg 'undefined references|undefined citations|Citation .* undefined' main.log
rg 'Overfull \\\\hbox|Overfull \\\\vbox' main.log
```

The word count is a PDF-text extraction count and therefore includes front
matter, tables, captions, references, and appendices. The final counts and
residual warnings are recorded in `THESIS_LOG.md`.
Figures are local under `figures/`; the build does not depend on Phase 1.
