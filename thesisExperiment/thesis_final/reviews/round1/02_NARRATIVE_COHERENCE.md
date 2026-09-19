# Round 1 hostile-examiner review: narrative coherence

## Verdict

**Major revision.** The thesis contains a potentially defensible study of **instrument-conditioned semantic degradation in a small LLM-agent simulation**, but it repeatedly presents that study through the larger language of online firestorms, empirical grounding, topology effects, and digital-twin validation. The manuscript itself admits that it does not measure the defining affective and communication-escalation components of a firestorm. That admission is correct, but it leaves the title, motivation, theory chapter, Results application section, and claimed contribution pulling in different directions.

The most serious defects are not stylistic:

1. RQ1 asks about \(k^*\) occurrence and topology ordering, but the RQ1 Results section does not report a topology-resolved \(k^*\) comparison.
2. RQ3 asks how topology conditions composition, live-cell MI, and \(k^*\), but the topology Results section reports topology-conditioned MI and dead cells, not topology-conditioned \(k^*\).
3. Methods defines the reported headline as event-weighted `meanMI` and reserves `meanNodeMPR` as a companion statistic; Results repeatedly renames `meanMI` as “MPR” and once expands MPR as “misinformation persistence rate,” contradicting the thesis-wide definition.
4. The linear chain uses a different action distribution and trust threshold from every other topology. Consequently, an eight-topology comparison is not a clean topology comparison.
5. The exact individual contribution remains an explicit placeholder. Until it is resolved, the originality and ownership of the claimed thesis contribution cannot be examined.
6. Results refers to Figures 10–22 as if they are in the thesis, but the chapter contains no corresponding figure environments. This makes several result claims unauditable from the manuscript.

## 1. The thesis does not yet tell one coherent story

### 1.1 The title and opening promise a firestorm study; the measured study is semantic auditing

**Locations:** `main.tex:51–53`; `chapters/01_introduction.tex:10–20`; `chapters/03_theory.tex:22–29`; `chapters/03_theory.tex:479–509`; `chapters/05_results.tex:747–980`.

The title foregrounds “Climate Firestorms,” and the Introduction opens with firestorm theory. The theory chapter then correctly states that MI and MPR do not identify a firestorm and that firestorm interpretation additionally requires communication escalation and negative affect. The campaign does not measure negative word-of-mouth, affect, empirical speed, or cross-media escalation. The long “Applying the Pfeffer firestorm framework” section therefore does not complete the promised test; it mostly inventories absent constructs.

This is a conceptual mismatch, not merely a limitation. A thesis may use firestorms as motivation, but it cannot make firestorms the apparent empirical object and then operationalize only claim recoverability.

**Required decision:** either:

- reframe the entire thesis as an audited semantic-propagation study, with firestorm theory as a bounded motivation and design audit; or
- add and analyse actual communication-escalation and affect outcomes.

The existing evidence supports only the first route.

**Concrete title rewrite:**

> **Audited Semantic Degradation in LLM-Agent Networks: Persona Composition, Topology, and Geoengineering Messages**

**Concrete replacement for `01_introduction.tex:17–21`:**

> Online-firestorm theory motivates attention to clustered, rapid, identity-structured communication. This thesis does not test whether a firestorm occurs, because it does not measure negative word-of-mouth, empirical communication speed, or cross-media escalation. It instead uses selected firestorm mechanisms as design prompts for a controlled study of how factual claims change during synthetic transmission.

**Concrete replacement for the opening of `05_results.tex:747–757`:**

> This section audits how the implemented design corresponds to Pfeffer et al.’s framework. It is not a further empirical test and does not classify any simulated cascade as a firestorm. The audit identifies which theoretical conditions are represented, held fixed, or absent.

Move that section to the end of the Discussion or compress it into the theory-to-design ledger. In its current Results position, it interrupts the empirical story with a second theory chapter.

### 1.2 The manuscript has two competing centres

**Locations:** `01_introduction.tex:80–105`; `01_introduction.tex:140–162`; `03_theory.tex:510–545`; `05_results.tex:17–221`; `05_results.tex:224–742`.

One possible centre is measurement sensitivity: continuous and discrete auditors produce different levels and rankings. The other is substantive: composition and topology condition degradation. The data strongly support the first as the primary contribution because it is directly observed and repeatedly qualified. The second is exploratory because of one run, incomplete seeding, bundled treatments, and survivor conditioning.

The thesis currently gives both equal rhetorical status. This weakens the work: the best-supported claim is buried among much broader claims.

**Concrete replacement for `01_introduction.tex:80–86`:**

> This thesis evaluates an exploratory testbed for semantic degradation in climate and geoengineering messages. Its primary question is measurement: whether substantive conclusions about persona composition and topology remain stable under two auditor regimes. Composition and topology comparisons are secondary, descriptive mechanism probes within the executed campaign.

Use the same hierarchy in the Abstract, Discussion, and Conclusion.

### 1.3 The propositions promise analyses that never arrive

**Locations:** `03_theory.tex:510–545`; Results chapter throughout.

The theory chapter says P1–P5 “organize the empirical analysis.” They do not. P2 predicts position-dependent persona effects, but Results does not compare matched hub/periphery placements. P3 distinguishes clustering from identity homophily, but no matched clustering/homophily test is reported. P4 requires reach and severity to be analysed separately, but Results mostly substitutes dead-cell rates for a reach analysis. Only P1 and P5 receive recognizable tests.

**Concrete rewrite for `03_theory.tex:513–515`:**

> The framework yields five propositions. P1 and P5 are examined directly in the present campaign. P2–P4 identify mechanisms that the current bundled design can describe only indirectly and that require matched ablations for a direct test.

Then label each proposition in Results, or remove the proposition list and retain it as future-work logic.

## 2. Research-question alignment is incomplete

### 2.1 RQ1 is not answered as written

**RQ location:** `01_introduction.tex:113–118`.

RQ1 asks how the instruments change “misinformation severity, \(k^*\) occurrence, and topology ordering.” The dedicated RQ1 Results section (`05_results.tex:17–221`) reports severity and topology-rank agreement but not topology-resolved \(k^*\) occurrence. Aggregate \(k^*\) rates appear much later at `05_results.tex:400–408`. Discussion’s RQ1 answer (`06_discussion.tex:16–19`) omits \(k^*\) entirely. Conclusion’s RQ1 answer (`08_conclusion.tex:11–18`) also omits it.

Either provide the missing topology-by-mode \(k^*\) comparison or narrow the RQ.

**Concrete RQ1 rewrite if no new analysis is added:**

> **RQ1:** Holding identity arm and topology labels fixed, how do the continuous and dual-discrete auditor regimes change estimated semantic-degradation severity and topology ordering?

Then treat \(k^*\) under RQ3 only.

**Concrete Discussion rewrite for `06_discussion.tex:16–19`:**

> Dual-discrete scores exceeded continuous scores on every topology aggregate in both arms, while topology ranks aligned weakly. The campaign therefore establishes that severity levels and topology ordering depend on the auditor regime. Because the dedicated comparison does not provide topology-resolved \(k^*\) rates, it does not separately answer an instrument effect on threshold occurrence.

### 2.2 RQ2 uses causal language without a defined criterion

**Location:** `01_introduction.tex:119–123`.

“Does explicit conspiracy composition explain … more consistently” is not operationalized. There is no model comparison, variance decomposition, predictive criterion, or preregistered definition of “more consistently.” The thesis shows descriptive gradients, not explanatory superiority.

**Concrete RQ2 rewrite:**

> **RQ2:** Within each auditor regime, how do severity and within-window \(k^*\) occurrence vary across named persona families and heterogeneous compositions, and how do those patterns compare with the pooled H/He contrast?

This matches the actual tables and avoids pretending that an explanation has been estimated.

### 2.3 RQ3 is only partially answered

**RQ location:** `01_introduction.tex:124–128`; evidence at `05_results.tex:436–578`.

RQ3 asks how topology conditions composition, live-cell MI, and “irreversible \(k^*\).” The topology section provides MI and dead-cell counts but not topology-conditioned \(k^*\). It also calls \(k^*\) irreversible even though the thesis correctly says that final-tick crossings are right-censored.

**Concrete RQ3 rewrite if no topology-\(k^*\) table is added:**

> **RQ3:** How does topology condition same-regime H/He differences in live-cell mean MI and cascade survival across the eight-tick horizon?

If topology-\(k^*\) results are added, replace “irreversible” with “sustained through the observed horizon.”

### 2.4 The roadmap and chapter order contradict each other

**Locations:** `01_introduction.tex:190–199`; `05_results.tex:4–5`; `06_discussion.tex:14–129`.

The roadmap says Results answers RQ2 and RQ3, then RQ4; it omits RQ1. Results actually starts with RQ1, then RQ2, RQ3, RQ4. Discussion orders the questions RQ1, RQ3, RQ2, RQ4 while claiming to synthesize them.

**Concrete replacement for `01_introduction.tex:194–198`:**

> Chapter 5 answers RQ1 by establishing instrument sensitivity, RQ2 by comparing named persona compositions, RQ3 by examining topology-conditioned same-regime contrasts, and RQ4 through the separate D-net boundary test. Chapter 6 interprets these findings in the same order.

Reorder Discussion subsections to RQ1, RQ2, RQ3, RQ4. Do not make the reader reconstruct the analytical sequence.

## 3. Outcome terminology is contradictory

### 3.1 Results renames `meanMI` as MPR

**Locations:** `04_methods.tex:409–416`, `04_methods.tex:471–493`; `05_results.tex:241–264`, `05_results.tex:317–371`; `09_appendices.tex:446–449`.

Methods is explicit:

- event MI is the event-level score;
- `meanMI` is the event-weighted cell headline;
- node MPR is a node-level mean;
- `meanNodeMPR` is a companion statistic, not the headline.

Results then calls the headline values “MPR” throughout. No evidence is given that the displayed family, mix, and article values are `meanNodeMPR` rather than `meanMI`. The topology tables explicitly label them `meanMI`, confirming the inconsistency.

This is a fatal reporting ambiguity: the reader cannot know which weighting rule generated the central numbers.

**Concrete rewrite throughout Results:**

- Replace “continuous MPR” with “continuous live-cell mean MI.”
- Replace “dual-discrete MPR” with “dual-discrete live-cell mean MI.”
- Reserve “node MPR” for results actually calculated from `meanNodeMPR`.
- Rename `sec:results-mpr` to “Auditor-regime contrasts in live-cell mean MI.”

**Concrete replacement for `05_results.tex:240–247`:**

> Figures 10–12 cross the twelve homogeneous personas with the six articles. Figure 10 shows event-weighted live-cell mean MI, Figure 11 shows maximum event MI, and Figure 12 shows within-window \(k^*\). Across live homogeneous cells, the four conspiracy personas have continuous mean MI of \(2.2194\) and dual-discrete mean MI of \(3.1691\).

### 3.2 MPR is expanded incorrectly

**Location:** `05_results.tex:241`.

The text says “mean misinformation persistence rate (MPR).” Everywhere else MPR means “Misinformation Propagation Rate.” This is not a harmless synonym.

**Concrete rewrite:** use “event-weighted live-cell mean MI.” Do not invent a second expansion for MPR.

### 3.3 MI is also renamed “maximum misinformation intensity”

**Location:** `05_results.tex:241–242`.

MI is defined as Misinformation Index, not intensity. “Maximum misinformation intensity (MI)” changes the construct mid-chapter.

**Concrete rewrite:** “maximum event-level Misinformation Index.”

### 3.4 The Abstract inherits the same ambiguity

**Location:** `main.tex:97–101`.

“Continuous and dual-discrete MPR remained separate” suggests that the central outcome is MPR, although Results primarily reports `meanMI`.

**Concrete rewrite:**

> Continuous and dual-discrete MI were analysed as separate auditor outputs. The dual-discrete headline exceeded the continuous headline on every topology aggregate; this is evidence of instrument sensitivity, not a common-scale increase.

## 4. The topology story is confounded and over-interpreted

### 4.1 The chain is not varied only by topology

**Location:** `04_methods.tex:171–190`; repeated at `09_appendices.tex:51–59`.

The linear chain uses action probabilities \(0.10/0.85/0.05\) and trust threshold \(0.08\); every other topology uses \(0.35/0.50/0.15\) and \(0.15\). Any chain-versus-other difference combines adjacency, reinterpretation probability, drop probability, forwarding probability, and trust threshold.

Yet RQ3 and Results repeatedly describe an “eight-topology sweep” as if topology were the varying factor.

**Concrete insertion after `04_methods.tex:190`:**

> The linear-chain condition is not a topology-only contrast with the other seven generators: it also uses a more rewrite-heavy action policy and a lower trust threshold. Chain-versus-graph differences therefore estimate a bundled protocol contrast. Topology-only interpretation is restricted to comparisons among conditions sharing the graph action policy, and even those remain one-realisation descriptions.

**Concrete replacement for `05_results.tex:440–445`:**

> This section describes outcomes across eight named network conditions. The linear-chain condition also differs in action probabilities and trust threshold, so the full eight-condition ranking is not attributable to topology alone. Comparisons among the seven graph-policy conditions still describe one realised graph per configuration and do not identify topology-class effects.

### 4.2 “One graph seed” is repeatedly misleading

**Locations:** `01_introduction.tex:90–92`; `04_methods.tex:394–397`; `04_methods.tex:342–354`; `07_validity_ethics.tex:18–21`.

The thesis repeatedly summarizes the campaign as using one graph seed, but Methods later concedes that ER, small-world, scale-free, and action sampling use unseeded `Math.random`. The configured value 42 is therefore not a campaign-wide stochastic seed.

**Concrete global rewrite:**

> Configurations recorded `graphRandomSeed: 42`, but the checked implementation consumed it only in selected generators; other graph construction and action sampling remained unseeded.

Do not use “one graph seed” as shorthand after disclosing that it did not govern much of the randomness.

### 4.3 The treatment is a bundle, not a controlled composition contrast

**Location:** `04_methods.tex:93–105`.

“Consequently, H versus He is a controlled composition contrast” is too strong. H and He differ in identity prevalence, number of persona types, ordered placement, and—on echo/polarized graphs—assignment procedure and possible identifier filtering.

**Concrete rewrite:**

> Consequently, H versus He is a bundled assignment contrast. It changes persona prevalence, diversity, and placement, and in some generators also changes the assignment procedure. The named persona and mix results are therefore more interpretable than the pooled arm label.

## 5. The D-net narrative repeatedly upgrades a fallback into empirical structure

### 5.1 “Empirical object” and “empirical structure” are not justified labels

**Locations:** `05_results.tex:821–849`; `05_results.tex:883–899`; `06_discussion.tex:340–344`.

The object is a 63-node hashtag co-occurrence reconstruction with synthetic account-like node identifiers and importer edges, created because hydration failed. It may be *derived from reported hashtags*, but it is not an observed user interaction graph or an empirical cascade. Calling its transitivity and homophily “empirical” invites exactly the digital-twin interpretation the thesis says it rejects.

**Concrete terminology rule:**

- “derived hashtag fallback graph,” not “empirical graph”;
- “pre-simulation fallback structure,” not “empirical structure”;
- “reported discourse labels,” not “empirical identities.”

**Concrete replacement for `05_results.tex:821–838`:**

> The application proceeds in two stages. First, structural observables are calculated on a 63-node hashtag co-occurrence fallback derived from published discourse categories. Because tweet hydration failed, this object is not an observed user graph, retweet cascade, or temporal diffusion record. Second, D-net imports that fixed fallback structure and simulates propagation on it. The simulation therefore tests behaviour on a documented stand-in; it does not reconstruct or validate the original Twitter network.

### 5.2 “Transfers cleanly” and “survives” overstate one directional recurrence

**Locations:** `05_results.tex:673–679`; `06_discussion.tex:155–160`; `06_discussion.tex:340–344`.

The D-net comparison uses one fixed graph, two articles, one conspiracy-only assignment, and one mixed assignment. It does not replicate the small-grid contrast. “Only the composition result transfers cleanly” and “the composition interpretation survives” imply generalization unsupported by the design.

**Concrete rewrite for `05_results.tex:673–679`:**

> One directional pattern recurs in D-net: the conspiracy-only assignment scores above the mixed assignment for both articles under both auditor regimes. This recurrence is consistent with the small-grid persona-family gradient, but it is not a replication because graph size, assignment definitions, event counts, and article coverage differ.

### 5.3 DTFS is an implementation diagnostic, not validation evidence

**Locations:** `04_methods.tex:747–765`; `05_results.tex:723–742`; `07_validity_ethics.tex:153–165`.

The score combines three components with weights \(0.40/0.40/0.20\), a threshold of 0.70, one fallback graph, and 16 simulated cascades. No external justification is supplied for the weights, threshold, or comparison of graph-level fallback scalars with simulated cascade distributions. The thesis commendably reports failure, but the very label “Digital Twin Fidelity Score” lends unsupported authority to an ad hoc diagnostic.

**Concrete insertion at `04_methods.tex:760`:**

> These weights, component definitions, and the 0.70 threshold are implementation choices from the repository, not externally validated criteria. DTFS is reported only to document that the implemented check failed; it is not treated as a validated measure of digital-twin fidelity.

Move the detailed KS/JS/DTFS machinery to the appendix and keep one short Results paragraph.

## 6. Contradictions and broken sentence-to-sentence logic

### 6.1 Article independence is described inconsistently

**Locations:** `04_methods.tex:61–66`, `04_methods.tex:223–230`; `07_validity_ethics.tex:19–23`.

Methods says article history and inboxes are cleared before each article and that post-hoc trust updates occur only after all six articles have propagated, so those updates cannot affect trajectories. Validity then says article-cells are dependent because they share “node states, inboxes, trust updates, and article history.” That directly contradicts the documented execution order.

**Concrete replacement for `07_validity_ethics.tex:19–24`:**

> Article cells within a configuration share the realised graph, persona assignment, protocol, and hosted model context, so they should not be treated as independent campaign replicates. Inboxes and per-article histories were cleared between articles, and post-hoc trust updates could not alter the already completed trajectories; these fields are therefore not a valid reason to claim cross-article dependence.

### 6.2 “Surprise remains a single-node drip seed” is incoherent

**Location:** `01_introduction.tex:56–63`.

A drip seed is a seeding regime, not evidence of surprise. The later Pfeffer section correctly says surprise is held and no shock condition exists.

**Concrete rewrite:**

> Surprise is not manipulated: every run uses the same single-node drip seed. The temporal horizon is also fixed.

### 6.3 “Integrated causal argument” conflicts with the no-causal-inference boundary

**Location:** `03_theory.tex:37`; repeated no-causal claims at `01_introduction.tex:135–137`, `04_methods.tex:675–679`.

The thesis explicitly disclaims causal identification. Calling the conceptual diagram a “causal argument” is needlessly provocative.

**Concrete heading rewrite:** “The integrated generative argument.”

### 6.4 Unsupported public-effects sentence

**Location:** `01_introduction.tex:13–16`.

“These claims can affect how citizens interpret research, institutions, and climate policy” is plausible but uncited and broader than the cited Debnath discourse analysis.

**Concrete rewrite:**

> Their presence in public discourse raises a policy-relevant question about how scientific proposals become attached to narratives of weather control and elite manipulation.

Alternatively, retain the effect claim only with a source that actually studies citizen interpretation.

### 6.5 “Valence” is not isolated by the article comparison

**Locations:** `05_results.tex:224`, `05_results.tex:363–397`; `05_results.tex:910–955`.

The section heading promises “article valence,” but the text admits that article identity bundles topic, framing, source facts, and persona fit. MI does not measure valence, toxicity, or affect.

**Concrete section-title rewrite:** “Persona composition, article identity, and within-window persistence.”

**Concrete rewrite for `05_results.tex:363–366`:**

> Article identity is associated with different live-cell mean MI values across arms. Because article identity bundles topic, wording, ground-truth questions, and compatibility with persona prompts, these comparisons are descriptive article effects, not a test of valence.

## 7. Repetition obscures rather than reinforces the argument

The same boundary statements recur at excessive length:

- seven original Pfeffer factors versus six-knob remapping: `01_introduction.tex:47–63`, `02_related_work.tex:50–72`, `03_theory.tex:421–474`, `05_results.tex:747–819`, `06_discussion.tex:264–299`, `08_conclusion.tex:54–59`;
- D-net is not a retweet cascade and has no empirical MPR: `01_introduction.tex:70–76`, `02_related_work.tex:101–117`, `03_theory.tex:401–419`, `04_methods.tex:647–651`, `05_results.tex:584–592`, `05_results.tex:701–742`, `07_validity_ethics.tex:133–151`, `08_conclusion.tex:36–43`;
- H/He does not equal diversity: `01_introduction.tex:119–123`, `03_theory.tex:104–129`, `04_methods.tex:93–105`, `05_results.tex:224–236`, `06_discussion.tex:74–94`, `06_discussion.tex:165–197`;
- one run/eight ticks/no causal inference: nearly every chapter.

Repetition at this scale signals that the design does not align with the headline constructs. State each rule once in Methods, summarize it once in Results, and interpret it once in Discussion.

**Recommended cuts:**

1. Reduce Literature Review’s operational detail (`02_related_work.tex:60–72`) to one sentence pointing forward to Chapter 3.
2. Retain the complete Pfeffer mapping only in Chapter 3; replace `05_results.tex:747–980` with at most one result paragraph on represented versus absent constructs.
3. Retain the full D-net provenance boundary in Methods; shorten repeated Results caveats to one sentence and use Discussion for implications.
4. Remove repeated campaign-design restatement at `04_methods.tex:380–419`; it duplicates `04_methods.tex:10–45` and `04_methods.tex:300–339`.

**Concrete transition replacing `04_methods.tex:375–386`:**

> The preceding section defined the simulation and raw event records. This section now defines the analytical units, estimands, exclusion rule, and comparisons applied to those records. It does not repeat the factorial design.

Then begin directly with the four nested measurement units.

## 8. Chapter transitions are administrative rather than argumentative

### 8.1 Literature Review to Theory

**Locations:** `02_related_work.tex:294–324`; `03_theory.tex:7–20`.

The Literature Review ends with a broad novelty claim and a question; Theory restarts with “This thesis explains…” without converting the literature gap into a testable model.

**Concrete final paragraph for Chapter 2:**

> The review therefore leaves three requirements for the analytical framework: separate content change from cascade reach, model persona composition jointly with network position, and treat auditor output as a measurement rather than ground truth. Chapter 3 turns these requirements into a generative process, five propositions, and an explicit evidence boundary.

### 8.2 Theory to Methods

**Locations:** `03_theory.tex:600–622`; `04_methods.tex:4–8`.

Theory ends with an ambitious bridge; Methods opens with an authorship placeholder. The prior-work boundary is essential, but it is not a transition.

**Concrete opening for Chapter 4 before the boundary paragraph:**

> Chapter 3 specified the relations that the campaign seeks to observe and the claims it cannot support. This chapter translates that framework into the executed persona assignments, network conditions, propagation protocol, auditor regimes, and analysis rules. It first separates inherited components from the candidate’s thesis-specific work.

### 8.3 Methods to Results

**Locations:** `04_methods.tex:787–791`; `05_results.tex:4–5`.

The Methods ending discusses directory boundaries rather than naming the exact inferential sequence. Results claims to follow the RQs but then includes C1–C5 terminology, persona families, D-net, and an unnumbered Pfeffer application.

**Concrete final Methods paragraph:**

> The Results therefore proceed in four steps: auditor-regime sensitivity (RQ1), named persona compositions (RQ2), topology-conditioned same-regime contrasts with dead-cell rates (RQ3), and the separate D-net boundary test (RQ4). All means are live-cell descriptions; dead-cell rates are reported as a distinct outcome.

### 8.4 Results to Discussion

End Results with factual findings, not a second theoretical interpretation. The existing final paragraph (`05_results.tex:970–980`) already interprets Pfeffer. After relocating that section, end Results with the failed D-net validation and one sentence:

> In summary, the campaign yields robust evidence of auditor-regime sensitivity, descriptive composition gradients, topology-dependent survivor patterns, and a failed D-net validation check; Chapter 6 evaluates what those findings mean.

## 9. Unsupported or insufficiently bounded novelty

### 9.1 The candidate contribution is unresolved

**Locations:** `main.tex:113–121`; `04_methods.tex:4–7`.

The thesis literally says the exact sentence-level division of code, design, analysis, and writing remains unresolved. An examiner cannot assess originality while this placeholder remains.

**Required action before any substantive novelty claim is accepted:** replace the placeholder with an auditable contribution statement naming:

- inherited code and metrics;
- candidate-written code;
- candidate-designed experiments;
- candidate-run experiments;
- candidate-produced analyses and figures;
- reused or co-authored text.

No rewrite can be supplied without factual authorship information. This is a submission blocker.

### 9.2 The literature-gap claim is broader than the review demonstrates

**Location:** `02_related_work.tex:311–324`.

“A question not answered by any one parent literature” is weak novelty rhetoric: interdisciplinary theses almost always combine questions not answered by one literature. The review does not establish that no prior work studies proposition-level mutation under persona and topology manipulations; it samples adjacent systems.

**Concrete rewrite:**

> Within the literature reviewed here, prior studies do not combine geoengineering-specific persona prompts, multiple small-network generators, and claim-recovery auditing in one controlled campaign. The thesis contribution is this documented combination and its measurement-sensitivity analysis, not a new general-purpose agent architecture or a validated model of social-media users.

### 9.3 “Constructs” overstates the research layer if artefacts are inherited or co-authored

**Locations:** `01_introduction.tex:142–158`; `08_conclusion.tex:46–52`.

The verbs “constructs,” “evaluates,” and “links” imply candidate ownership, but the contribution statement is unresolved. After authorship is clarified, use exact verbs: “designed,” “implemented,” “curated,” “executed,” or “analysed.” Until then, the contribution list is not examinable.

### 9.4 Do not present a failed digital-twin check as a novelty contribution

**Location:** `08_conclusion.tex:46–52`.

“An honest 63-node boundary test” is rhetoric, not a scholarly contribution. Honesty is expected. The contribution is either the derived graph and documented stress test, or it is not.

**Concrete rewrite:**

> The thesis contributes a documented stress test on a 63-node hashtag-derived fallback graph and reports that the implemented structural-validation criterion failed.

## 10. Missing and misleading figure references

**Locations:** `05_results.tex:240–242`, `05_results.tex:256–257`, `05_results.tex:309–318`, `05_results.tex:365–366`, `05_results.tex:400–427`, `05_results.tex:571–577`.

The prose refers to Figures 10–22, but the Results source includes only two figure environments, labelled `fig:c1-h-he` and `fig:c1-delta`. Later it refers to raw filenames instead of numbered thesis figures. A reader compiling the submitted manuscript cannot inspect most of the claimed evidence.

This is not merely formatting. Claims such as “Figures 10–22 support…” rely on absent exhibits.

**Required correction:**

- include every cited figure with a stable `\label{...}`;
- replace manual numbers with `\Cref{...}`;
- ensure captions state the unit, live-only population, instrument, and dead-cell treatment;
- remove all references to figures not present in the compiled thesis.

**Concrete rewrite pattern:**

> \Cref{fig:persona-article-mi,fig:persona-article-kstar} show the persona-by-article live-cell mean MI and within-window \(k^*\) occurrence. Each plotted cell is one executed configuration–article cell, not an independent replicate; hatched cells have at most one scored event.

## 11. Recommended narrative architecture

The existing material can become coherent without adding broader claims. Rebuild the story in this order:

1. **Problem:** semantic content changes during synthetic transmission, but the result depends on who rewrites, who is connected, and how change is scored.
2. **Primary contribution:** expose auditor-regime dependence.
3. **Secondary mechanism probes:** describe named persona compositions and topology-conditioned survivor outcomes.
4. **Boundary test:** repeat a narrow composition comparison on a hashtag-derived fallback graph and report failed validation.
5. **Firestorm theory:** use it as a design audit showing why MI alone is insufficient—not as the object supposedly validated.

**Suggested one-sentence thesis claim:**

> In this one-run LLM-agent campaign, conclusions about semantic degradation depend strongly on the auditor regime; named persona composition is more informative than the pooled H/He label, topology conditions survivor-only outcomes without yielding a stable ranking, and a hashtag-derived D-net stress test does not validate the simulator against Twitter.

Every chapter can support that sentence. The current title and several sections support a broader claim that the evidence cannot carry.

## 12. Priority revision order

1. Resolve the individual-contribution placeholder.
2. Decide whether the thesis is about semantic auditing or firestorms; the current data support the former.
3. Align RQ1 and RQ3 with the analyses actually reported, or add the missing topology-resolved \(k^*\) analyses.
4. Correct MI/MPR terminology and verify every reported value against its actual aggregation rule.
5. Disclose the chain policy confound wherever topology comparisons are interpreted.
6. Replace “empirical D-net” language with “hashtag-derived fallback graph” and demote DTFS to an unvalidated implementation diagnostic.
7. Include or remove Figures 10–22.
8. Remove repeated boundary material and restore argumentative transitions.

Until items 1–5 are fixed, the thesis is not ready for examination: the examiner cannot reliably identify the candidate’s novelty, the research questions do not match the reported evidence, and the main dependent variable changes identity between Methods and Results.
