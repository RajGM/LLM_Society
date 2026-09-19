# Round 1 language and style audit

## Scope and sampling

This audit samples the complete thesis systematically: front matter and abstract; the opening, middle, and closing sections of Chapters 1--9; all research-question answers; all results subsections; and the appendix prose surrounding tables and listings. The review targets academic English suitable for a TUM master's thesis. It does not assess numerical correctness or edit the manuscript.

The prose is generally controlled and appropriately cautious. The highest-impact weaknesses are:

1. inconsistent use of **MPR** (propagation rate versus persistence rate, and sometimes as a synonym for cell-level mean MI);
2. repeated stock transitions and contrast formulas;
3. long sentences that combine design, evidence, and limitation;
4. vague demonstratives such as “this,” “these,” and “it” when several possible antecedents are present;
5. nominal and passive constructions that obscure the responsible actor or analytical operation;
6. occasional conversational, promotional, or metaphorical wording;
7. local paragraph drift, especially where results paragraphs move into interpretation;
8. mixed tense in the methods chapter and mixed British/American usage.

## Global revisions

### 1. Stabilise terminology

Use the following terms consistently:

- **Misinformation Propagation Rate (MPR)** only for the defined node- or branch-level mean. Never expand it as “misinformation persistence rate.”
- **event-level MI**, **cell mean MI**, and **mean node MPR** for the three distinct aggregates. Do not call `meanMI` “MPR.”
- **prior LASS workshop paper** instead of “award paper,” “CIKM study,” “CIKM/LASS study,” or “CIKM chain.” “Award paper” sounds promotional and does not identify the source.
- **hashtag co-occurrence graph** for the 63-node object. Use “structural fallback” only when discussing its role after defining the object.
- **continuous-only campaign** and **dual campaign with a discrete headline** on first use in each chapter; thereafter use T2c and T2d.
- **small-world** and **scale-free** as attributive adjectives; retain underscores or American spelling only inside literal code identifiers.

High-impact terminology correction:

> “Figure~10 shows mean misinformation persistence rate (MPR)”

Replace with:

> “Figure~10 shows mean node Misinformation Propagation Rate (MPR).”

If Figure 10 actually displays `meanMI`, use:

> “Figure~10 shows cell-level mean MI.”

Apply the same distinction throughout Chapter 5, especially where tables labelled “MPR” report `meanMI`.

### 2. Adopt one English variety

The manuscript predominantly uses British English (“behaviour,” “operationalisation,” “polarised,” “prioritise”), while `babel` and `csquotes` are configured for American English. For a TUM thesis, either variety is acceptable if consistent. The least disruptive choice is British English:

- change the LaTeX language settings to British English at typesetting stage;
- use **judgement**, **behaviour**, **organisation**, **polarised**, **generalisation**, and **programme** in prose;
- retain source titles, quotations, API fields, and code identifiers exactly.

### 3. Use tense by function

- Literature and definitions: present tense (“Pfeffer et al. identify”).
- Executed procedures: past tense (“Each article was processed”; “The auditor received”).
- Mathematical definitions and enduring artefact descriptions: present tense (“Equation 4 defines”; “The repository contains”).
- Results: past tense for observed campaign outcomes; present tense only when referring to a table or figure (“Table 5 shows”).

Chapter 4 currently alternates between “was,” “uses,” “contains,” “is processed,” and “receives” within descriptions of the executed campaign. Convert procedural narration to past tense while retaining present tense for formulas and repository contents.

### 4. Reduce repeated transition formulas

“Therefore,” “however,” “consequently,” “accordingly,” “likewise,” “in particular,” and “this distinction” occur frequently. Many can be deleted because the logical relation is already explicit. Also vary the repeated structure “It does not …” only when variation improves cohesion; do not replace it with ornamental synonyms.

Example:

> “Accordingly, C4 remains a labelled sensitivity contrast. Averaging its two deltas would cancel differences created by swapping instruments and would produce a quantity with no instrument-specific interpretation. No pooled C4 MPR is therefore reported.”

Replace with:

> “C4 is reported only as a labelled sensitivity contrast. Averaging its two deltas would cancel instrument-specific differences and yield an uninterpretable quantity; hence, the analysis reports no pooled C4 MPR.”

## Precise high-impact replacements

### Front matter and abstract

1. **Causal overstatement and vague relative clause** (`main.tex`, abstract)

Original:

> “Dual-discrete scores exceeded continuous scores on every topology aggregate, which demonstrates instrument sensitivity rather than a common-scale increase.”

Replace with:

> “Dual-discrete scores exceeded continuous scores for every topology aggregate. This consistent difference indicates instrument sensitivity, not an increase on a common measurement scale.”

2. **Compressed list and vague modifier** (`main.tex`, abstract)

Original:

> “The D-net experiment applied the same protocol to a 63-node hashtag co-occurrence graph.”

Replace with:

> “The D-net experiment applied the simulation protocol to a separate 63-node hashtag co-occurrence graph.”

“Same” is imprecise because graph size, article set, and assignment conditions differ.

### Chapter 1: Introduction

3. **Vague demonstrative** (Problem and motivation)

Original:

> “This process matters when a scientific proposal becomes attached to an established conspiracy narrative.”

Replace with:

> “Such semantic transformation is consequential when communicators attach a scientific proposal to an established conspiracy narrative.”

4. **Nominalisation and loose coordination** (Research gap)

Original:

> “The gap addressed here lies at their intersection. It concerns how to design and audit a controlled climate-firestorm simulation without treating simulation output as observed social behaviour.”

Replace with:

> “This thesis addresses how researchers can design and audit a controlled climate-firestorm simulation without treating its output as observed social behaviour.”

5. **Passive ambiguity** (Aim and analytical approach)

Original:

> “It excludes those cells from live-cell means but does not recode them as zero.”

Replace with:

> “The analysis excludes these cells from live-cell means and does not recode them as zero.”

The replacement names the analytical actor and the relevant cells.

6. **Repetitive roadmap and duplicated chapter reference** (Thesis roadmap)

Original:

> “Chapter~\ref{chap:methods} separates the inherited system from the climate-specific design and documents the articles, behavioural profiles, and hashtag graph. Chapter~\ref{chap:methods} specifies the factorial campaign, both auditor modes, dead-cell rule, and \(k^{*}\).”

Replace with:

> “Chapter~\ref{chap:methods} separates the inherited system from the climate-specific design and documents the articles, behavioural profiles, hashtag graph, factorial campaign, auditor modes, dead-cell rule, and \(k^{*}\).”

7. **Rhetorical conclusion and vague “it”** (end of chapter)

Original:

> “An LLM society can expose how climate-misinformation results depend on identity, topology, and the scoring instrument, but this campaign cannot stand in for the public it simulates.”

Replace with:

> “The LLM-agent society reveals how simulated climate-misinformation outcomes vary with identity, topology, and scoring instrument; it does not represent the relevant human population.”

### Chapter 2: Literature Review

8. **Long opening sentence and vague “these literatures”**

Original:

> “The distinction between these literatures matters. A model may reproduce the reach of a cascade without representing how its claims change, while fluent agent output may look socially plausible without constituting a valid model of people.”

Replace with:

> “These research areas address different analytical objects. A model may reproduce cascade reach without representing changes in claims. Conversely, fluent agent output may appear socially plausible without providing a valid model of human behaviour.”

9. **Film-like framing**

Original:

> “This point prevents a common attribution error.”

Replace with:

> “The distinction is necessary because the thesis dimensions are not Pfeffer et al.'s original factors.”

10. **Vague antecedent**

Original:

> “Neither result validates this thesis's exact instrument: fixed binary questions about geoengineering, answered by an LLM judge, are a different construct and use case.”

Replace with:

> “Neither QA-based factuality evaluation nor reported LLM-judge agreement validates the instrument used here. This instrument asks an LLM judge to answer fixed binary questions about geoengineering and therefore measures a different construct in a different setting.”

11. **Hype and nominalised contribution claim** (Synthesis and research gap)

Original:

> “The gap filled by this thesis is therefore \emph{not} a new general-purpose agent architecture and not a replication of an 814,924-tweet study.”

Replace with:

> “This thesis neither proposes a general-purpose agent architecture nor replicates the 814,924-tweet study.”

12. **Overloaded closing question**

Original:

> “This design addresses a question not answered by any one parent literature: under fixed scientific seeds, are apparent firestorm thresholds robust to who occupies the network, how those agents are connected, and how factual degradation is measured?”

Replace with:

> “The design examines whether apparent firestorm thresholds remain stable when persona composition, network structure, or the factual-degradation instrument changes while scientific seed messages remain fixed.”

### Chapter 3: Theoretical Framework

13. **Choppy sequence**

Original:

> “The explanation has three levels. Persona composition defines the agents that transform a message. Topology defines who can expose whom. Propagation joins these elements over time.”

Replace with:

> “The explanation distinguishes three levels: persona composition determines which agents transform a message, topology determines potential exposure, and propagation links agent transformations and exposure over time.”

14. **Vague “This point” and promotional source label**

Original:

> “This point follows directly from the award paper's results.”

Replace with:

> “Results from the prior LASS workshop paper illustrate this dependence on composition and order.”

Replace every later occurrence of “award paper” with “prior LASS workshop paper” or “prior study.”

15. **Unnecessary personification**

Original:

> “Topology does not directly alter a sentence. It changes the opportunities for alteration.”

Replace with:

> “Topology affects factual content indirectly by determining which agents can receive and transform a message.”

16. **Abstract nominalisations**

Original:

> “The extension is conceptual, not merely technical.”

Replace with:

> “Extending the model from chains to complex networks changes the interpretation of composition, exposure order, and MPR aggregation.”

17. **Paragraph ending in vague metaphor**

Original:

> “The thesis joins these elements in a complex-network design. It then tests where the bridge holds, where it depends on measurement, and where it fails.”

Replace with:

> “The thesis combines these elements in a complex-network design and tests which findings persist across network structures and measurement instruments.”

### Chapter 4: System, Data, and Methods

18. **Long sentence and administrative aside** (Prior-work boundary)

Original:

> “This thesis uses that system as an inherited instrument. Its individual research layer comprises the climate corpus, the Pfeffer mapping, the Phase~2 factorial design, the composition analysis, and the D-net boundary test. The exact division of implementation and writing among co-authors remains an administrative placeholder on the title pages.”

Replace with:

> “This thesis uses the published system as an inherited instrument. The thesis-specific work comprises the climate corpus, Pfeffer mapping, Phase~2 factorial design, composition analysis, and D-net boundary test. Before submission, the title pages must state each co-author's contribution to implementation and writing.”

19. **Passive and dense procedure sentence** (Articles and ground truth)

Original:

> “Before each article, its prior history was removed and all node inboxes were flushed.”

Replace with:

> “Before processing each article, the simulation cleared the article's prior history and all node inboxes.”

20. **Overloaded persona-assignment paragraph**

Original:

> “Echo-chamber and polarised heterogeneous configurations instead request cluster-based assignment from declared persona pools; unavailable identifiers are filtered by the engine before assignment.”

Replace with:

> “For heterogeneous echo-chamber and polarised configurations, the engine assigns personas to clusters from declared persona pools. Before assignment, it removes identifiers that are unavailable in the loaded persona library.”

21. **Long computational-budget sentence**

Original:

> “Dense and cyclic graphs can generate many events per tick, so retaining the 30-step horizon while expanding to eight topologies, 288 configurations, six articles, and dual auditing would multiply paid model calls.”

Replace with:

> “Dense and cyclic graphs can generate many events per tick. A 30-step horizon across eight topologies, 288 configurations, six articles, and two auditor calls in dual mode would therefore require substantially more paid model calls.”

22. **Vague actor and nominal phrase** (Reproducibility)

Original:

> “Together with \(N=1\), these facts make the archived realised graphs and event logs the reproducible record of what was executed, while a fresh run is a protocol replication rather than a bitwise reproduction.”

Replace with:

> “Because the campaign used one replicate and several unseeded or externally stochastic operations, the archived graphs and event logs provide the authoritative record of the executed campaign. A new run can replicate the protocol but cannot reproduce the outputs bit for bit.”

23. **Methods paragraph repeats prior material**

The opening of “Measurement and analysis” repeats the simulation design, model, graph list, article count, and 1,728-cell calculation already presented earlier in Chapter 4. Replace the first two paragraphs of that section with:

> “The measurement analysis used four nested units: audit item, scored event, node--article MPR, and configuration--article cell. The following sections define these units and the corresponding aggregation rules. All scores are LLM-as-judge measurements produced by \texttt{gpt-4o-mini}; they are neither human annotations nor observations from Twitter.”

Retain the equation only once in the chapter and cross-reference the earlier design subsection.

24. **Passive ambiguity in source register**

Original:

> “All operational definitions and numerical counts in this chapter are traceable to the following repository artefacts:”

Replace with:

> “The following repository artefacts document the operational definitions and numerical counts used in this chapter:”

### Chapter 5: Results

25. **Overclaim in chapter opening**

Original:

> “The D-net evidence then tests whether those patterns survive a change from generated eight-node graphs to the separate 63-node complex network.”

Replace with:

> “The D-net analysis then examines whether the descriptive patterns recur on a separate 63-node complex network.”

“Tests whether … survive” suggests stronger inferential support than a one-run descriptive comparison provides.

26. **Metaphorical verb**

Original:

> “The dual-run diagnostics locate this separation inside the scoring procedure.”

Replace with:

> “The dual-run diagnostics show that the difference also occurs when both instruments score the same event.”

27. **Conversational subsection heading**

Original:

> “Why level and rank need not agree”

Replace with:

> “Differences between score levels and topology rankings”

28. **Vague “This is expected”**

Original:

> “This is expected given the large instrument-level separation in C2 and C3.”

Replace with:

> “The sign reversal is consistent with the large instrument-level differences observed in C2 and C3.”

29. **Incoherent use of “valence”**

The subsection “Article valence and topology” reports article-specific differences but does not measure valence separately from topic, framing, or persona fit. Rename it:

> “Article-specific and topology-conditioned differences”

Replace:

> “However, ‘valence’ bundles topic, framing, and fit with a persona's prior narrative.”

with:

> “Because the study did not manipulate valence independently, these article differences jointly reflect topic, framing, and compatibility with persona prompts.”

30. **Results drift into interpretation**

Original:

> “The defensible result is therefore compositional---conspiracy-heavy mixes generally score above the conspiracy-free mix---rather than a universal claim that heterogeneous networks amplify or suppress a cascade.”

Replace in Results:

> “Across both instruments, conspiracy-heavy mixes generally scored above the conspiracy-free mix; the ordering among intermediate mixes was not monotonic.”

Move the claim about what is “defensible” to the Discussion.

31. **Promotional phrasing**

Original:

> “Only the composition result transfers cleanly.”

Replace with:

> “The composition pattern recurred, whereas the aggregate H/He and instrument orderings did not recur consistently.”

32. **Anthropomorphic and vague graph description**

Original:

> “The copied graph has global transitivity 0.3146…”

Replace with:

> “The imported hashtag co-occurrence graph has a global transitivity of 0.3146…”

33. **Overloaded final interpretation sentence**

Original:

> “Third, content auditing can describe simulated factual degradation after propagation, but it cannot supply the missing empirical temporal, binary-choice, weak-tie, or cross-media processes.”

Replace with:

> “Third, content auditing quantifies factual degradation in simulated messages. It cannot compensate for the absence of empirical timing, binary-choice behaviour, weak-tie diffusion, or cross-media processes.”

### Chapter 6: Discussion

34. **Abstract and awkward synthesis**

Original:

> “The measurement result precedes all substantive comparisons.”

Replace with:

> “The instrument comparison constrains the interpretation of all substantive results.”

35. **Nominalisation**

Original:

> “The observed He$>$H collapse is compatible with a strong composition gradient”

Replace with:

> “The aggregate He$>$H difference is consistent with the composition-specific pattern”

“Collapse” is technical shorthand that is not defined for readers.

36. **Film-like dialogue**

Original:

> “There is therefore no empirical contradiction to resolve.”

Replace with:

> “The two orderings address different comparisons because the H condition has different compositions in the generated-topology and D-net analyses.”

37. **Defensive filler**

Original:

> “These limitations do not make the campaign uninformative. They narrow the appropriate claim.”

Replace with:

> “These limitations restrict the claim to the documented prompts, graph protocols, and auditor scores.”

38. **Vague “travels” metaphor**

Original:

> “The qualitative composition gradient travels from the generated graphs to D-net”

Replace with:

> “The qualitative composition pattern recurs in D-net”

39. **Hype-like phrasing**

Original:

> “Pfeffer's framework is most productive here as an audit of what the simulation represents and omits.”

Replace with:

> “In this thesis, Pfeffer's framework serves primarily to identify what the simulation represents and omits.”

### Chapter 7: Validity, Ethics, and Reproducibility

40. **Vague “it” and compressed causal chain**

Original:

> “The failed DTFS score (\(0.2754<0.70\)) is evidence against the configured validation threshold, not a near-success to be rescued by individual metric matches.”

Replace with:

> “The DTFS of \(0.2754\) falls below the configured validation threshold of \(0.70\). Individual metric matches do not alter this failed validation result.”

The original phrase “rescued” is conversational and imputes an argumentative motive.

41. **Long hydration sentence**

Original:

> “Hydration of the reported 814,924 tweet identifiers did not occur: the accessible OSF identifiers were stored in lossy scientific notation, the Mendeley identifier dump was not retrieved, and no Twitter/X bearer token was available.”

Replace with:

> “The study did not hydrate the reported 814,924 tweet identifiers. The accessible OSF identifiers were stored in lossy scientific notation, the Mendeley identifier dump was unavailable to the study, and the researchers had no Twitter/X bearer token.”

42. **Vague passive actor**

Original:

> “Although this campaign uses curated articles and synthetic personas, future hydration could introduce usernames, tweet text, profile fields, or deleted content.”

Replace with:

> “Although the present campaign uses curated articles and synthetic personas, a future empirical data collection could process usernames, tweet text, profile fields, or subsequently deleted content.”

43. **Promotional contrast**

Original:

> “The most consequential next step is not a larger unreplicated grid.”

Replace with:

> “The next study should prioritise a smaller, preregistered validation design over a larger unreplicated grid.”

### Chapter 8: Conclusion

44. **Vague “connected”**

Original:

> “It connected a measurement instrument to persona composition, topology, a separate complex network, and Pfeffer's firestorm account.”

Replace with:

> “It examined how persona composition and network topology affect outputs from two factual-degradation instruments and interpreted the design using Pfeffer's firestorm framework.”

45. **Self-evaluative hype**

Original:

> “The thesis contributes a transparent theory-to-design ledger, a 1,728-cell climate factorial, an explicit measurement-sensitivity analysis, a composition-conditioned interpretation, and an honest 63-node boundary test.”

Replace with:

> “The thesis contributes a theory-to-design ledger, a 1,728-cell climate factorial, a measurement-sensitivity analysis, a composition-conditioned interpretation, and a documented 63-node boundary test.”

“Honest” is self-congratulatory; the evidence should establish transparency.

46. **Vague closing reference**

Original:

> “Until those conditions are met, this testbed is best used to probe mechanisms and expose measurement assumptions.”

Replace with:

> “Until independent replication, human validation, longer-horizon analysis, and empirical temporal data are available, the testbed should be used only for mechanism-oriented simulation and measurement-sensitivity analysis.”

### Chapter 9: Appendices

47. **Passive authority and long opening**

Original:

> “The canonical machine-readable design is \path{thesisExperiment/configs/grid_phase2.json}; where this appendix and a generated artefact disagree, that file and the raw run metadata take precedence.”

Replace with:

> “The file \path{thesisExperiment/configs/grid_phase2.json} provides the canonical machine-readable design. If the appendix conflicts with a generated artefact, readers should follow this file and the raw run metadata.”

48. **Conversational warning**

Original:

> “Never paste a value into a configuration, manuscript, terminal transcript, issue, manifest, or committed file; never print \path{.env}.”

Replace with:

> “API credentials must not appear in configurations, manuscripts, terminal transcripts, issues, manifests, committed files, or printed \path{.env} contents.”

49. **Appendix closing phrasing**

Original:

> “older 290-cell analysis copies remain … for auditability and must not replace the canonical tables.”

Replace with:

> “The repository retains older 290-cell analysis copies … for provenance; these copies are non-canonical and must not be used in place of the 292-cell tables.”

## Paragraph-level coherence findings

1. **Chapter 4 repeats the design.** “Simulation design” and “Measurement and analysis” both introduce the model, topology grid, arms, article count, eight-tick horizon, and 1,728-cell total. Keep design facts in the former section and begin the latter with measurement units and estimands.

2. **Chapter 5 sometimes mixes results and interpretation.** Statements about what is “defensible,” what “should” be inferred, and why a pattern “supports” a theoretical reading belong in Chapter 6. Keep Chapter 5 focused on observed values, denominators, and non-monotonic patterns.

3. **Chapter 3 repeats scope limitations after nearly every construct.** The Theory--Operationalisation--Evidence structure is useful, but repeated formulations (“It does not…,” “They cannot…”) make the chapter longer without always adding a new boundary. Retain one specific evidence boundary per construct and rely on the final ledger for consolidation.

4. **Chapter 6 repeats evidence already given in Chapter 5 at considerable numerical detail.** In Discussion, retain only the values required for interpretation and refer readers to results tables for the full set.

5. **Chapter 7’s repeated “Mitigation” paragraphs are coherent but formulaic.** Where a mitigation merely restates an existing reporting practice, shorten it to one sentence. Reserve fuller mitigation paragraphs for future design changes.

## Passive ambiguity and pronoun checklist

During revision, search for the following patterns:

- “is/was retained,” “is/was excluded,” “is/was reported,” and “is/was calculated”: name **the analysis**, **the parser**, **the engine**, or **the thesis** when responsibility matters.
- sentence-initial “This” or “These”: follow with a noun (“This difference,” “These scores,” “This design”) rather than a bare pronoun.
- “it” after sentences containing both the simulator and auditor: replace with the specific component.
- “same” in comparisons: specify which dimensions are held constant.
- “available” and “unavailable”: identify whether the limitation concerns public access, repository presence, study access, or API permission.

## Priority order

1. Correct MPR/MI terminology in Chapter 5 and all figure/table captions.
2. Standardise “prior LASS workshop paper,” D-net naming, and British English.
3. Remove duplicated design prose in Chapter 4.
4. Apply the precise replacements above to long or ambiguous sentences.
5. Separate observed results from interpretation in Chapter 5.
6. Reduce repeated transitions and limitation formulas in Chapters 3, 6, and 7.

No substantial film-like dialogue appears in the manuscript. The few dialogue-like or rhetorical formulations identified above (“no contradiction to resolve,” “rescued,” “why … need not agree”) should nevertheless be replaced because they weaken the formal register.
