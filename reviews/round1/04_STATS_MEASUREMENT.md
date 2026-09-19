# Round 1 audit: statistics and measurement

## Bottom line

The headline arithmetic in the Phase 2 results tables is reproducible. The main problems are not transcription errors; they are measurement and denominator errors that make several labels and comparisons more confident than the implemented quantities warrant.

## Critical errors

### 1. Discrete and continuous MI are not merely two resolutions of the same 0--5 scale

The instruments assign different penalties to the same semantic category:

- discrete missing item: \(1\) MI unit;
- continuous missing/neutral item at 0.5: \(0.5\) MI units;
- discrete and continuous incorrect item: \(1\) MI unit.

Thus five missing answers produce discrete MI \(=5\) but continuous MI \(=2.5\). A missing-only continuous event can never cross the \(MI>3\) threshold, whereas the equivalent discrete event necessarily crosses it. This mechanical asymmetry explains part of both the higher T2d levels and the much higher T2d \(k^*\) rates. Calling the scales the same “nominal 0--5 range” is mathematically true but substantively misleading.

Consequences:

- C2/C3 level gaps are partly built into the scoring rules, not only empirical “instrument sensitivity.”
- A common threshold of 3 has different meanings under the two instruments.
- Cross-instrument \(k^*\) rates are not threshold-equivalent.
- Agreement or convergence cannot establish interchangeability.

The thesis states the formulas, but the Results, Discussion, Abstract, and Conclusion do not foreground this decisive asymmetry.

### 2. Auditor failures are silently imputed as perfect factuality

`src/Auditor.js` defaults every item to correct when either auditor response cannot be parsed. This yields MI \(=0\), with no failure flag carried into the event or tables. Unexpected discrete values are also coerced to “missing,” and returned array length is not checked against the required five items.

This is a critical measurement failure:

- malformed judge output is indistinguishable from a genuinely perfect score;
- MI, MPR, dead/live classification, and \(k^*\) can all be biased downward;
- the frequency of this bias cannot be recovered from `results_phase2` tables.

The validity chapter recommends a future fail-closed auditor but does not make clear that the present data already use fail-open imputation. All factuality claims require this explicit qualification.

### 3. The reported dual “agreement” means have an undisclosed selected denominator

Pearson \(r\) is undefined whenever either five-item vector is constant. The engine returns `null`; the parser drops those events when calculating a cell mean; the full analysis then drops cells with no defined cell mean.

From `results_phase2/tables/all_rows.csv`:

- H: agreement is present for only 270 of 478 live dual cells (56.5%);
- He: agreement is present for 171 of 240 live dual cells (71.3%).

The tables do not preserve the number of events contributing to each cell's agreement, so the actual event denominator cannot be reconstructed. The reported 0.6487 and 0.6174 are therefore means of available cell-level correlations, not agreement “across all live dual events.” Comparing H and He agreement is especially unsafe because availability differs sharply by arm and is outcome-dependent.

The five-item Pearson coefficient is also intrinsically unstable. Report the defined/undefined counts and event denominators, or omit aggregate agreement.

### 4. \(k^*\) is not an irreversible-crossing estimator

The parser finds the first observed scored tick above 3 for which every later **observed scored tick** is above 3. Unscored ticks are absent. A crossing at the last scored tick automatically qualifies even if the run continues, and an eight-tick endpoint cannot establish irreversibility.

The censor flag does not solve this:

- it exists only for discrete \(k^*\);
- it compares \(k^*\) with the maximum tick among all events, not the last scored tick or the configured horizon;
- continuous \(k^*\) has no corresponding field;
- no tick series or number of scored ticks is retained in the result tables.

The reported rates reproduce as 68/480, 18/238, 96/478, and 77/240, but they should be named “crossed \(MI>3\) and stayed above through the last later scored observation within eight ticks,” not irreversible crossing, tipping, locking, or persistence.

### 5. “Mean dual gap across events” is actually an equal-cell-weighted mean

The parser first averages event gaps within each cell. The analysis then gives every live cell equal weight. The Results call 0.8804 (H) and 1.1145 (He) same-event mean gaps, which implies event weighting.

Using `nScored` to event-weight the published cell means gives approximately:

- H: 0.8768 rather than 0.8804;
- He: 1.0985 rather than 1.1145.

The published numbers are valid only as means of 478 and 240 live cell means. The unit and denominator must be stated.

## Major statistical and denominator issues

### 6. Group “MPR” is a mean of cell means, not the event-level MPR over the pool

Within a cell, `meanMI` is event-weighted. All higher summaries then weight each live article cell equally, regardless of `nScored`. That is a defensible estimand, and Methods eventually says so, but Results repeatedly labels it simply MPR.

The distinction is material:

- T2c H: cell-weighted 0.8643; event-weighted approximately 0.8136;
- T2c He: 1.0192; event-weighted approximately 0.9196;
- T2d H: 1.6814; event-weighted approximately 1.7145;
- T2d He: 2.0800; event-weighted approximately 2.0030.

Accordingly, the cell-weighted He--H contrasts are 0.1549 and 0.3986, while approximate event-weighted contrasts are 0.1061 and 0.2886. This is not an arithmetic error, but it is a consequential denominator choice. Call these “mean live-cell MI” or “cell-weighted MPR,” and retain event-pooled sensitivity summaries.

### 7. The hatch threshold excludes valid one-event measurements without a statistical rationale

“Dead” is defined as `nScored <= 1`, not as absence of a score. Of 292 dead cells:

- 232 have zero scored events;
- 60 have one scored event.

The 60 one-event cells contain observed MI but are discarded from every live mean and \(k^*\) denominator. No measurement or variance argument justifies why two events are sufficient while one is unusable. This policy changes the estimand and should have a sensitivity analysis separating `nScored=0`, `nScored=1`, and `nScored>=2`.

Also, `hatched_dead_after_llm` is based on configuration-level `llmCalls>0`. It does not prove that the particular article cell received an auditor call. The phrase “despite real LLM calls” is therefore too specific at cell level.

### 8. Complete-case comparisons condition on post-treatment cascade survival

All C1--C5 means and pairs exclude cells based on `nScored`, which is itself affected by topology, persona composition, actions, and run stochasticity. Dead rates vary substantially by topology. The resulting quantities describe surviving/scorable cascades, not unconditional configured-cell outcomes.

The thesis acknowledges survivor conditioning, but substantive sentences such as “persona and article composition strongly structure observed persistence” still read as general treatment findings. The survival process should be treated as a co-primary outcome, and contrasts should be described explicitly as conditional on being live.

### 9. The paired Wilcoxon tests do not have independent paired replicates

C2/C3 joins correctly align topology--persona/mix--article labels, but T2c and T2d are separately executed stochastic campaigns, not two measurements of the same realised event history. Moreover, six article cells share a configuration/run, and all cells share one campaign seed regime.

The paired differences are useful descriptive blocking summaries. Their cell-level Wilcoxon \(p\)-values (398 and 198 apparent pairs) are pseudo-replicated and should not be presented as inferential evidence. The eight-topology Wilcoxon test has a different problem: the eight fixed topology families are design strata, not a random sample from a topology population. The exact \(p=0.0078125\) merely restates that all eight signs agree.

The caveats are good, but reporting these \(p\)-values still invites an inferential reading unsupported by the design. Sign counts, medians, and ranges are sufficient.

## C1--C5 and pooling audit

- **C1:** Correctly keeps instruments separate and reports both cell-pooled and topology-equal summaries. H and He are unmatched compositions, so the contrast is descriptive and does not isolate heterogeneity.
- **C2/C3:** Arithmetic and key joins reproduce. “Paired” means matched design labels only; it must not imply common event histories or independent pairs.
- **C4:** Correctly labels both directions and does not average them. Because arm and instrument both change, neither delta identifies an arm effect.
- **C5:** Correctly implements row concatenation, not a physical supergraph. D-net is correctly excluded from the 1,728-cell pool.
- **Pooling:** Cell-pooled and topology-equal results are both shown, but event-pooled sensitivity is omitted. This omission matters because cell event counts vary widely.

No evidence was found that discrete and continuous headlines were numerically averaged together or that dead cells were imputed as zero.

## Spot checks recomputed from `results_phase2` tables

The following published values reproduce from `all_rows.csv`, `continuous.csv`, and `dual_discrete.csv` after applying `dead == false`:

- harvest: 1,728 thesis cells; 292 dead; 1,436 live;
- live counts: T2c H 480, T2c He 238, T2d H 478, T2d He 240;
- dead counts: 96, 50, 98, and 48 respectively;
- cell-weighted means: 0.864338, 1.019250, 1.681381, and 2.079979;
- C1 He--H: 0.154911 continuous and 0.398599 dual-discrete;
- topology-equal C1 deltas: 0.172547 and 0.397417;
- C2: 398 live pairs; median delta 0.8125; 342 positive, 26 negative, 30 zero;
- C3: 198 live pairs; median delta 0.97785; 169 positive, 25 negative, 4 zero;
- C4 topology-equal deltas: 1.217552 and -0.647588;
- \(k^*\) rates: 68/480, 18/238, 96/478, and 77/240;
- dual cell-mean gaps: 0.880405 H and 1.114537 He.

The topology tables and persona/mix/article values inspected also agree with the derived CSVs to the displayed precision.

## Terminology and claim-strength corrections

1. `chapters/05_results.tex` expands MPR as “misinformation persistence rate.” The defined term is **Misinformation Propagation Rate**.
2. The same passage expands MI as “misinformation intensity.” The defined term is **Misinformation Index**.
3. “MPR” should not alternate among node mean, event-weighted cell mean, and equal-cell-weighted group mean without qualification.
4. Replace “irreversible,” “tipping,” and “locking” for \(k^*\) with finite-window sustained crossing language.
5. Replace “strongest separation,” “strongly structure,” “transfers cleanly,” and “survives a change” with direct descriptions of observed contrasts in this harvest.
6. “D-net supported a controlled composition comparison” is too strong: topology is fixed, but composition, homogeneity, and persona prevalence all change together.
7. “Dual-discrete exceeded continuous” must immediately note the mechanically different missing-item penalty and non-equivalent threshold.

## Priority before submission

1. Disclose and bound the fail-open auditor problem.
2. Reframe discrete/continuous levels and \(k^*\) around their non-equivalent item penalties.
3. Add exact denominators for dual agreement and stop describing cell-weighted gaps as event means.
4. Rename \(k^*\) as an eight-tick sustained-observation rule.
5. Separate zero-score and one-score hatch cases and provide a sensitivity analysis.
6. Remove or quarantine pseudo-replicated \(p\)-values.
7. Standardise MI/MPR terminology and state the aggregation level with every headline.
