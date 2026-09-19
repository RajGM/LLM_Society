# Round 1 review: figures, tables, and captions

## Scope and overall finding

Reviewed the compiled 104-page `thesisExperiment/thesis_final/main.pdf`, its LaTeX cross-references, and the figure assets cited by the Results chapter.

The main defect is not cosmetic: the PDF contains only three figures—Figure 4.1, Figure 5.1, and Figure 5.2—but the Results text repeatedly asks the reader to consult “Figures 10–22.” Those numbered figures do not exist in the PDF or List of Figures. Thirteen corresponding PNG assets exist, but they are not included as LaTeX figure floats and have no figure labels. This removes much of the visual evidence on which Sections 5.2–5.3 rely.

## Required fixes

### 1. Restore the missing Results figures and use real cross-references

The following cited assets are absent from the PDF:

- `fig10_h_persona_article_mpr.png`
- `fig11_h_persona_article_maxmi.png`
- `fig12_h_persona_article_kstar.png`
- `fig13_he_mix_article_mpr.png`
- `fig14_he_mix_article_maxmi.png`
- `fig15_persona_topology_mpr.png`
- `fig16_mix_topology_mpr.png`
- `fig17_topology_article_mpr.png`
- `fig18_dead_rates.png`
- `fig19_kstar_rates.png`
- `fig20_ifd_dual_gap_agreement.png`
- `fig21_article_valence_h.png`
- `fig22_article_valence_he.png`

Add each retained asset in a `figure` environment with a semantic `\label`, then replace every hard-coded “Figure 10,” “Figures 10–12,” and “Figures 10–22” in Sections 5.2–5.3 with `\cref`. The current numbers appear to have been copied from a standalone analysis document and cannot be correct in the integrated thesis.

Suggested IDs are `fig:h-persona-article-mpr`, `fig:h-persona-article-maxmi`, `fig:h-persona-article-kstar`, `fig:he-mix-article-mpr`, `fig:he-mix-article-maxmi`, `fig:persona-topology-mpr`, `fig:mix-topology-mpr`, `fig:topology-article-mpr`, `fig:dead-rates`, `fig:kstar-rates`, `fig:dual-gap-agreement`, `fig:article-valence-h`, and `fig:article-valence-he`.

Also replace the raw filenames printed in Section 5.3—`fig17_topology_article_mpr.png`, `fig15_persona_topology_mpr.png`, `fig16_mix_topology_mpr.png`, and `fig18_dead_rates.png`—with those cross-references.

### 2. Prevent floats from crossing subsection boundaries

Several floats render before the heading or prose that introduces them:

- `tab:mpr-diagnostics` (PDF Table 5.2) appears before heading 5.1.2, although it belongs to that subsection.
- `tab:results-mixes` (Table 5.5) appears before heading 5.2.2 and before its introduction.
- `tab:results-articles` (Table 5.6) appears before heading 5.2.3 and before its introduction.
- `tab:topology-dual` (Table 5.8) appears before heading 5.3.2.
- `tab:pfeffer-reveal-limits` (Table 5.11) appears before heading 5.5.3 and interrupts the preceding subsection’s argument.
- `fig:c1-h-he` and `fig:c1-delta` (Figures 5.1–5.2) occupy the top of the page headed 5.4 even though they support Section 5.3.

Use subsection-level float barriers (for example, `placeins` and `\FloatBarrier`) and place each float after its first explicit textual callout. Keep Figures 5.1–5.2 before Section 5.4.

`tab:theory-operation-evidence` (Table 3.2) is isolated on a nearly empty float page and is set unusually small. Replace `[p]` with a normal top/bottom placement if possible, or use a landscape/full-page treatment that enlarges the text rather than leaving most of the page blank.

### 3. Preserve continuous-versus-discrete separation in labels, not color alone

The missing heatmaps generally do the right conceptual thing by putting T2c continuous and T2d dual-discrete in separate panels. Preserve that separation when adding them. Do not combine the values into one color scale without panel labels.

The compact headings in `tab:results-personas` (Table 5.4), `tab:results-mixes` (Table 5.5), and `tab:c2c3-mpr` (Table 5.1) make the distinction too dependent on subscripts such as \(c\), \(d\), H, and He. Add grouped headers spelling out “Continuous (T2c)” and “Dual-discrete (T2d),” and define H/He and all count columns in the caption or table notes.

In `fig:c1-h-he` (Figure 5.1), explain or remove the dashed line at 3. It is visually prominent but absent from the legend and caption. A tick-level \(k^*\) threshold is not automatically meaningful on topology-level live-cell aggregates.

### 4. Replace inaccessible or fragile color encodings

- `fig:c1-h-he` uses green and muted purple with very similar grayscale luminance. In grayscale, the two series are difficult to distinguish; bar order is the only reliable cue. Use a colorblind-safe blue/orange pair plus different hatch patterns or direct series labels.
- `fig10_h_persona_article_mpr.png`, `fig11_h_persona_article_maxmi.png`, `fig13_he_mix_article_mpr.png`, `fig14_he_mix_article_maxmi.png`, `fig15_persona_topology_mpr.png`, `fig16_mix_topology_mpr.png`, and `fig17_topology_article_mpr.png` use green–yellow–red scales. Although cells contain numbers, those annotations will be very small at thesis width. Use a perceptually uniform colorblind-safe sequential map such as `viridis`/`cividis`, retaining numeric values.
- `fig18_dead_rates.png` uses blue/orange but gives both series the same hatch. Give T2c and T2d distinct fill/pattern encodings so the legend survives grayscale printing.
- `fig12_h_persona_article_kstar.png` already uses a colorblind-safe sequential scale and a separate gray “no \(k^*\)” category; retain this design.
- `fig:c1-delta` (Figure 5.2) is understandable without color because its panels and zero baseline encode the argument. Retain the zero line and panel labels.

### 5. Remove redundant presentations

`tab:c2c3-mpr`, `tab:topology-continuous`, `tab:topology-dual`, `fig:c1-h-he`, and `fig:c1-delta` repeatedly present the same eight topology means and derived differences. Figures 5.1–5.2 are also adjacent on one page, immediately after Tables 5.7–5.8.

Keep one numeric source for exact values and one visual source for the sign/pattern argument. A defensible consolidation is:

- retain `tab:c2c3-mpr` for exact cross-instrument means;
- retain `fig:c1-delta` for the same-mode H–He sign reversal;
- move the live/dead denominators from `tab:topology-continuous` and `tab:topology-dual` into a compact note or appendix; and
- remove `fig:c1-h-he`, unless it is redesigned to show information not already in the tables.

Likewise, consider combining `fig21_article_valence_h.png` and `fig22_article_valence_he.png` into one four-panel figure with a shared 0–5 axis. Their separate files duplicate titles, legends, axes, and article labels.

## Caption and readability fixes by ID

- `fig:simulation-pseudocode` (Figure 4.1): the “figure” is readable, but its caption merely repeats that it is pseudocode. State the argumentative point: synchronous delivery, the eight-tick/eight-hop cap, and post-hoc auditing after all six articles.
- `fig:c1-h-he` (Figure 5.1): define H and He, expand T2c/T2d, explain the dashed 3 line, and state that the comparison is across survivor/live cells. The existing `N=1` warning is useful.
- `fig:c1-delta` (Figure 5.2): the caption supports the argument well. Add that each bar is one topology-level difference and expand T2c/T2d.
- Missing Figures 10–22: internal plot titles such as “Paper grammar H1” and “paper Exp A grammar” are production notes, not thesis captions. Remove that jargon from the images. Supply self-contained LaTeX captions that define the unit, aggregation, live/dead treatment, instrument, and the one conclusion the reader should take from the panel.
- `tab:two-axis-outcomes` (Table 3.1): readable and concise, but it is never cross-referenced. Add an in-text callout where the two-axis model is introduced.
- `tab:theory-operation-evidence` (Table 3.2): too small on an otherwise mostly blank page and never cross-referenced. Enlarge it and cite it from the surrounding synthesis.
- `tab:simulation-topologies` (Table 4.1): readable and appropriately concise.
- `tab:mm-c1-c5` (Table 4.2): dense, narrow columns produce awkward line breaks. Use a landscape table or shorten cells into phrases with a note below. Add an in-text cross-reference; its label is currently declaration-only.
- `tab:c2c3-mpr` (Table 5.1): readable, but define H/He and T2c/T2d in the caption or a note.
- `tab:mpr-diagnostics` (Table 5.2): caption correctly says neither measure is another MPR. Define the possible range and interpretation of “agreement.”
- `tab:c4-mpr` (Table 5.3): long mathematical headers are small. Use two-line grouped headers. The caption correctly prevents causal interpretation.
- `tab:results-personas` (Table 5.4): `\scriptsize`, code-like persona names, and nine compact columns make it difficult to scan. Use grouped instrument headers and spell out \(n\), \(k^*\), and “Dead c/d.” Consider landscape orientation.
- `tab:results-mixes` (Table 5.5): same grouped-header fix as Table 5.4. Define “conspiracy-adj.” rather than relying on the abbreviated cell text.
- `tab:results-articles` (Table 5.6): the caption is too thin to support the argument. State that values are live-cell, event-weighted mean MI/MPR, dead cells are excluded, and continuous and dual-discrete columns are separate instruments.
- `tab:topology-continuous` and `tab:topology-dual` (Tables 5.7–5.8): captions are appropriately cautious, but the tables duplicate other displays. Consolidate as above.
- `tab:dnet-arms` (Table 5.9): readable; the caption correctly distinguishes the dual sidecar. Rename “Headline score” to “Headline MI” and state explicitly that rows are simulation auditor scores.
- `tab:pfeffer-original-remap` (Table 5.10): readable and its caption clearly marks the thesis terminology as a mapping.
- `tab:pfeffer-reveal-limits` (Table 5.11): strong argumentative structure, but the prose is too dense at `\scriptsize`. Use landscape orientation or split it into two tables (“reveals” and “cannot reveal”) at normal small text.

## Appendix tables

The appendix tables restart visibly as “Table 1” through “Table 10,” while the body uses chapter-qualified numbers such as Table 5.11. Use appendix-qualified numbering (for example, Table A.1–A.10) to avoid ambiguous references and List-of-Tables entries.

Specific readability fixes:

- `tab:appendix-config-matrix` (Appendix Table 1): seven narrow columns split “dual; discrete headline” and formulas awkwardly. Use shorter column labels and move arithmetic details to a note.
- `tab:appendix-personas` (Appendix Table 3), `tab:appendix-articles` (Appendix Table 4), and `tab:appendix-dnet-mismatches` (Appendix Table 9): identifiers break across arbitrary character positions, harming readability and copy/paste. Use landscape pages, a wider identifier column, or short display IDs with exact IDs in a separate code listing.
- `tab:appendix-raw-schema` (Appendix Table 6) and `tab:appendix-artifacts` (Appendix Table 10): long paths wrap heavily. Prefer a dedicated full-width monospaced path block or landscape longtable.
- `tab:appendix-ifd-fields` (Appendix Table 5), `tab:appendix-table-schema` (Appendix Table 7), and `tab:appendix-dnet-counts` (Appendix Table 8) are readable at the rendered size.

## Cross-reference audit

The build has no undefined-reference warning, but that is misleading because hard-coded figure numbers do not participate in LaTeX’s reference checks. In addition to the missing Figures 10–22, the following labels are declaration-only and receive no explicit in-text cross-reference:

- `tab:two-axis-outcomes`
- `tab:theory-operation-evidence`
- `fig:simulation-pseudocode`
- `tab:mm-c1-c5`
- `tab:mpr-diagnostics`
- `tab:results-personas`
- `tab:results-mixes`
- `tab:results-articles`
- `tab:pfeffer-original-remap`
- `tab:pfeffer-reveal-limits`

Add a meaningful `\cref` callout before each retained float. Do not rely on proximity, especially while floats can move across headings.

## Priority order

1. Add or remove every currently cited but absent Figure 10–22 and replace hard-coded numbers with labels.
2. Stop Tables 5.2, 5.5, 5.6, 5.8, and 5.11 from floating before their owning subsection.
3. Consolidate the repeated topology tables/figures.
4. Correct color accessibility and grayscale encoding.
5. Enlarge dense tables and make captions self-contained.
6. Change appendix numbering to A.1–A.10.
