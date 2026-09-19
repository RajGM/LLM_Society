# Round 1 review: validity, reproducibility, and ethics

## Overall assessment

**Recommendation: major revision.**

The thesis is unusually candid about its intended inferential boundary. The
single replicate, eight-tick horizon, model dependence, auditor circularity,
hatched-cell policy, failed hydration, absence of empirical Twitter MPR, failed
digital-twin threshold, and lack of human evaluation are repeated across the
introduction, methods, results, discussion, dedicated limitations chapter, and
conclusion. These limitations are therefore not merely buried in a final
chapter.

However, one implementation-level threat is both material and insufficiently
integrated: the selected 288 campaign runs record 64,270 API errors across 121
runs, versus 203,928 successful calls. Treating the counters as attempted API
requests, errors comprise approximately 24.0% of attempts. The engine handles
these errors in outcome-relevant ways: failed rewrites propagate the unchanged
input while retaining the `reinterpret` action, failed auditor requests leave
events unscored, and malformed auditor output fails open to an all-correct
score. This can affect propagation, MI, cell survival, and group comparisons.
Until its impact is quantified, the harvest cannot be described simply as a
completed N=1 mechanism probe. This is the principal validity blocker.

## Major findings

### 1. API failures create an unanalysed, condition-dependent intervention

The canonical rows point to 288 selected run directories. Their metadata sum
to 203,928 successful calls and 64,270 errors; 121 selected runs have at least
one error. Some runs have more errors than successful calls (for example,
`T2d_H_small_world_ozone_stratosphere_specialist_2026-09-19_04-21-34`
records 1,968 errors and 380 successful calls).

The consequences are not neutral:

- `src/SimulationNode.js:207-214` substitutes the received text when a rewrite
  call fails, then records the action as a reinterpretation and propagates it.
- `src/SimulationNode.js:286-327` catches auditor failures and leaves
  `misinfoIndex` null.
- `src/Auditor.js:62-75` and `src/Auditor.js:100-108` convert malformed judge
  output to all-correct scores, producing MI = 0.
- `src/llmClient.js` has no retry or backoff logic and does not retain request
  IDs, response metadata, error classes, or provider fingerprints.

Thus API availability can mechanically lower MI, preserve source wording,
reduce `nScored`, or move a cell across the hatch threshold. Dense topologies
and dual scoring make more calls and may have different exposure to this
failure process. The existing statement that hatched cells occurred “despite
real LLM calls” does not disclose this mechanism.

Required before substantive interpretation:

1. Separate rewrite failures, auditor request failures, and auditor parse
   failures by run, condition, article, and event.
2. Report how many propagated events used unchanged text because rewriting
   failed, how many audit-eligible events remained null, and how many were
   assigned MI = 0 by fail-open parsing.
3. Recompute results after excluding affected runs/events, or rerun under a
   fail-closed, logged, retried protocol. At minimum, provide sensitivity
   analyses stratified by error burden.
4. Replace “dead cascade” with separate propagation-death and
   audit-unavailability categories.

The current logs do not retain auditor parse warnings, so the third quantity
may be unrecoverable from the archived harvest. That should be stated directly.

### 2. The hatch rule is transparent but not validated

The threshold `nScored <= 1` is consistently stated, and dead cells are
correctly not imputed as MI = 0. Denominators and topology-specific dead rates
are also shown. This is good reporting.

The policy nevertheless lacks a methodological justification or threshold
sensitivity analysis. A cell with one valid event is discarded, while a cell
with two events is treated as a live estimate; neither threshold addresses
whether the scored events are representative of all propagated events. More
importantly, `nScored` combines propagation sparsity with auditor/API failure.
Live-only means are consequently complete-case estimates conditional on both
cascade survival and successful scoring. The limitations chapter recognizes
selection bias in general terms, but the results continue to describe the
hatch pattern primarily as cascade death.

Report propagation events, audit-eligible events, successful audits, and API
failures as separate denominators. Show sensitivity to plausible minimum-score
thresholds and, if recoverable, to all eligible events.

### 3. N=1 is well integrated, but the displayed p-values remain
methodologically misleading

The manuscript repeatedly states that cells, articles, events, and topology
means are not independent simulation replicates. It correctly rejects
population, causal, and confidence-interval interpretations. This limitation
is integrated rather than buried.

Despite that, the thesis reports Wilcoxon, Mann--Whitney, Spearman, and KS
p-values. Calling them exploratory does not create an independent sampling
unit. In particular, the eight topology means are design strata, pooled cells
share runs and inputs, and the D-net KS comparison has one empirical object.
There is also no multiplicity framework for the several exploratory tests.
The low p-values can invite exactly the inferential reading the surrounding
text disclaims.

Prefer descriptive effect sizes, sign patterns, denominators, and sensitivity
plots. If the p-values remain, place them in a clearly non-inferential
appendix and state that their reference distributions do not correspond to
the campaign's replication structure.

### 4. Construct validity remains unestablished

The manuscript carefully distinguishes discrete and continuous instruments,
notes the five author-curated questions, and avoids treating agreement between
the two prompts as accuracy. It also acknowledges that missing and incorrect
items receive equal discrete penalties.

The remaining issue is nomenclature and criterion validity. MI measures an
LLM judge's recovery of five selected propositions from generated text. MPR is
an average of those scores over successfully audited events; it does not
directly measure belief, persuasion, exposure, prevalence, propagation reach,
toxicity, or human judgments of misinformation. Terms such as “persistence,”
“severity,” “propaganda,” and “misinformation propagation rate” can therefore
sound more validated than the operational measure warrants. The inherited
severity boundaries and MI > 3 threshold have no demonstrated psychometric or
behavioral calibration in this domain.

The thesis should consistently call these **simulation audit scores** in
headlines and reserve MI/MPR as implementation labels. Claims about
misinformation should be explicitly conditional on the five-item audit key.

### 5. Auditor circularity and model dependence are acknowledged but stronger
than presented

The generator and judge do not merely share a broad model family: they use the
same `gpt-4o-mini` endpoint, with the same client defaults. Dual scoring is two
prompted calls to that same model, not independent validation. Shared priors,
prompt obedience, stylistic preferences, safety behavior, and correlated
failure modes can produce both persona separation and apparent instrument
agreement.

The thesis recognizes this in the discussion and limitations chapter, which
is a strength. It should go further by making clear that:

- high conspiracy-persona scores may primarily measure role-prompt compliance;
- low scientist-persona scores may measure alignment between generator,
  expected answers, and judge;
- the discrete/continuous comparison tests prompting and scoring behavior of
  one model, not two independently validated instruments; and
- without human or cross-family labels, neither accuracy, realism, nor
  calibration is known.

### 6. API reproducibility is insufficiently specified

The archived outputs provide computational traceability, not exact replay.
The methods commendably disclose that action sampling and three graph builders
use unseeded `Math.random`, even when `graphRandomSeed=42` is configured.
However, prominent references to a fixed graph seed can still imply more
control than was achieved.

Additional gaps:

- `src/llmClient.js` sends `temperature: 0.7` and `max_tokens: 700`, but these
  settings are not reported in the thesis.
- No API seed is sent.
- `gpt-4o-mini` is a mutable alias rather than a retained snapshot identifier.
- Request IDs, response creation times, provider fingerprint/version, and raw
  responses are not archived.
- There is no JavaScript lockfile, and the root `package.json` declares no
  dependencies; Python has only `requirements_viz.txt`.
- Immutable checksums and a deterministic parser fixture are proposed as
  future work rather than supplied.

The wording “reproducible mechanism probe” in the abstract should be narrowed
to “traceable archived execution” unless environments, dependencies, request
parameters, failure behavior, and integrity hashes are documented.

### 7. External validity limitations are strong and well integrated

The manuscript consistently confines claims to six curated articles, prompt
personas, eight-node generated graphs, one 63-node fallback graph, one model,
one run, and eight ticks. It rejects extrapolation to human psychology,
platform recommender systems, real firestorm timing, population effects, and
Twitter behavior. Composition is correctly separated from “diversity,” and
D-net is not pooled into the main grid.

This is one of the strongest aspects of the thesis. Remaining risk comes from
occasional substantive phrasing (“conspiracy content tracks the gradient,”
“composition strongly structures persistence”) that should remain explicitly
qualified as behavior of prompts under this model and surviving-score policy.

### 8. Hydration and D-net limitations are exceptionally clear

The failed hydration is disclosed in the introduction, methods, results,
limitations, conclusion, claim--evidence matrix, and hydration ledger. The
manuscript correctly states that:

- OSF tweet identifiers were lossy scientific-notation values;
- the Mendeley identifier dump was not retrieved;
- no Twitter/X bearer was available;
- no tweet IDs were invented;
- D-net edges are a hashtag co-occurrence/importer structure, not retweets,
  replies, followers, or temporal cascades;
- Debnath et al. provide no empirical 0--5 MI/MPR; and
- DTFS failed at 0.2754.

These limitations are fully integrated and not buried. The `n_real=1` KS
p-values should still be removed or demoted, because failure to reject with one
empirical observation has essentially no validation value.

## Ethics and governance

### Privacy

The present campaign uses curated articles and synthetic personas, so its
direct participant/privacy risk is limited. The hydration workflow's
data-minimization choice is appropriate: tweet text and user fields were
discarded after aggregate hashtag extraction, credentials were not retained,
and raw personal data are not presented as a release artifact.

The thesis should still state explicitly whether the current computational
study received ethics approval, exemption, or a determination that review was
not required. It should also document the legal/licensing basis for accessing
the OSF records and distinguish transient local processing from data sent to a
hosted model. The current text appropriately warns that public availability is
not equivalent to unrestricted ethical reuse.

### Human-evaluation absence

The absence of completed human evaluation is disclosed in the dedicated
chapter, discussion, claim--evidence matrix, and future-work section. Templates
are correctly not represented as participant data. This is substantially
integrated, but the abstract and conclusion should state directly that no
human factuality, realism, or persona-validity evaluation was conducted. At
present, the conclusion frames human coding mainly as the next step rather
than as a missing validity criterion for the reported scores.

Any follow-up requires ethics review as applicable, informed consent, fair
compensation, misinformation-exposure safeguards, debriefing, withdrawal
procedures, and separate expert and lay tasks. Human review must provide an
external criterion, not merely approve model outputs.

### Dual use

The thesis appropriately identifies propaganda optimization, harassment,
astroturfing, and moderation evasion as potential misuse. The current system's
small synthetic graphs and failed empirical validation limit immediate
operational capability, so the risk should not be overstated.

There is nevertheless a tension between the proposed mitigation (“avoid
packaging operational targeting instructions” and consider access tiers) and
the appendix/repository release of exact prompts, graph recipes, high-scoring
persona combinations, and paid execution commands. The thesis should either
justify why these artifacts are low risk in this implementation or apply the
release controls it proposes. A concise threat model should identify actor,
capability, target, plausible misuse path, and why any withheld details would
meaningfully reduce risk.

## Integration verdict by requested area

- **Internal validity:** substantially integrated, but not sufficient because
  API failure and fallback behavior are omitted from the main validity account.
- **External validity:** fully and repeatedly integrated.
- **Construct validity:** substantially integrated; terminology still
  overreaches the unvalidated five-question LLM audit.
- **Statistical validity:** N=1 and dependence are fully disclosed, but the
  continued prominence of p-values weakens the boundary.
- **Auditor circularity/model dependence:** clearly integrated, though the
  exact same-model dependence and fail-open path need stronger emphasis.
- **N=1:** fully integrated and visible from abstract through conclusion.
- **Hatch policy:** numerically integrated; mechanism and threshold validity
  are not.
- **API reproducibility:** insufficiently integrated and presently the most
  serious omission.
- **Dual use:** explicit but concentrated in the ethics chapter, with an
  unresolved release-policy inconsistency.
- **Privacy:** explicit and generally proportionate; oversight and licensing
  status need clarification.
- **Human-evaluation absence:** explicit, but should appear as a headline
  criterion-validity limitation in the abstract and conclusion.
- **Hydration limitations:** fully integrated and exemplary.

## Minimum revision threshold

The thesis can sustain a defensible exploratory contribution if it (1)
quantifies and addresses the 64,270 API errors and all fallback paths, (2)
separates propagation death from scoring failure, (3) removes inferential
weight from pseudo-replicated p-values, (4) narrows MI/MPR terminology to an
unvalidated simulation audit score, and (5) reports exact API settings and
reproducibility boundaries. Without the first two revisions, the principal
persona, topology, instrument, and hatch comparisons remain vulnerable to
condition-dependent infrastructure failure rather than only the limitations
already acknowledged.
