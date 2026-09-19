# Round 1 — Literature and citation audit

## Verdict

**Major revision required before submission.** The literature review is generally careful about inference boundaries, and its central readings of Debnath and Pfeffer are substantially accurate. However, the draft bibliography is not compile-complete, one dataset record has the wrong title/year/authorship, and the status of the Maurya paper is overstated relative to the verifiable record. Coverage is good at the intersection of diffusion, network topology, LLM societies, and construct validity, but thin on misinformation correction, modern generative-ABM validation, topology confounds, and validation of automated factuality measures.

Scope: all citation commands in `thesisExperiment/thesis_work/drafts/*.tex`, with detailed claim checking of `02_INTRODUCTION.tex`, `03_LITERATURE_REVIEW.tex`, `04_THEORY.tex`, `05_METHODS_SIMULATION.tex`, `06_METHODS_MEASUREMENT.tex`, `11_PFEFFER_APPLICATION.tex`, `12_DISCUSSION.tex`, and `13_VALIDITY_ETHICS.tex`, against `03_REFERENCES.bib`. DOI metadata were checked through Crossref or DataCite and recent/central claims against publisher, proceedings, arXiv, PMC, and repository records on 2026-09-19.

## Blocking and high-priority findings

1. **Two cited keys are absent from the draft bibliography.**
   - `tornberg2024validation`, cited at `02_INTRODUCTION.tex:36`.
   - `ruths2014social`, cited at `12_DISCUSSION.tex:158`.
   - The latter exists in `thesis_final/references.bib` but not in the bibliography assembled from `thesis_work/drafts/03_REFERENCES.bib`.
   - The former is also bibliographically misdescribed in the introduction’s source note. The verified publication is Maik Larooij and Petter Törnberg, “Validation is the central challenge for generative social simulation: a critical review of LLMs in agent-based modeling,” *Artificial Intelligence Review*, first published online in 2025, DOI `10.1007/s10462-025-11412-6`; it is not a 2024 *Journal of Computational Social Science* article.

2. **`debnath2023dataset` is a mismatched record.**
   - DOI `10.17632/546hsym93p.1` exists, but DataCite identifies version 1 as **Ramit Debnath, “Geoengineering on Twitter,” Mendeley Data, 2022**, not “Conspiracy Spillovers and Geoengineering,” 2023, by all seven article authors.
   - The current citation at `03_LITERATURE_REVIEW.tex:108` supports the existence of the deposit, but the `.bib` metadata must be replaced. Version 2 is a 2023 update (`10.17632/546hsym93p.2`); cite the version actually used.

3. **The Maurya publication-status claim is not independently verified.**
   - arXiv `2511.10384` and DataCite DOI `10.48550/arXiv.2511.10384` exist, with the listed authors, title, and 2025 year. Its technical claims about 21 personas, ten domains, 30-step branches, MI/MPR, expert stabilization, and heterogeneous escalation are supported by the preprint.
   - The DOI identifies an **arXiv preprint**, not workshop proceedings. Searches of the indexed ACM CIKM 2025 proceedings did not locate this title, and no independent LASS programme/proceedings record was found in this audit. Therefore `03_LITERATURE_REVIEW.tex:166–170` (“presented at the LASS workshop”), the `@inproceedings` type, and repeated “award paper” language in `04_THEORY.tex`/`12_DISCUSSION.tex` need documentary evidence (official programme, acceptance letter, award page, or proceedings entry). Without it, cite as `@misc`/arXiv and call it a preprint. Do not state “Outstanding Paper Award” from the proposal alone.

4. **The bibliography’s verification comment is currently false.**
   - `03_REFERENCES.bib:1–3` says DOI and metadata were checked, yet two cited works are missing and the dataset metadata are wrong. Remove or update that assertion only after a reproducible final check.

5. **The research-gap claim is broader than the cited evidence.**
   - `03_LITERATURE_REVIEW.tex:304–310` says LLM-society misinformation evaluations “commonly” emphasize sharing, plausibility, or believability rather than validated proposition-level trajectories. The preceding examples show several systems, but do not establish field prevalence. Support this with a systematic/critical review (the verified Larooij–Törnberg review is directly relevant) or narrow to “the systems reviewed here.”

## Claim-support audit

### Misinformation and diffusion

- `lazer2018science`, `vosoughi2018false`, `kempe2003influence`, and `goel2016virality` exist with correct title/year/DOI metadata. The claims about false-news reach and speed, the independent-cascade rule, structural virality, and the scale-free contagion model’s failure to recover empirical structural diversity are supported.
- The Vosoughi sentence at `03_LITERATURE_REVIEW.tex:22–26` is accurate but should preserve the authors’ key qualification: bots accelerated true and false news at roughly the same rate; the differential spread was attributed primarily to humans.
- `03_LITERATURE_REVIEW.tex:31–34` introduces “related compartmental and threshold models” without a source. Add canonical citations or remove the generalized claim.
- `02_INTRODUCTION.tex:14` (“These claims can affect how citizens interpret research, institutions, and climate policy”) is a plausible consequential claim but uncited. Debnath documents discourse, not downstream citizen effects. Cite public-opinion/risk-perception evidence or soften to “may shape discourse about…”.
- Coverage is propagation-heavy. It lacks sustained treatment of misinformation belief, correction, continued influence, and debiasing. `lewandowsky2012misinformation` already exists in `thesis_final/references.bib` and is an obvious addition; distinguish content falsity, exposure, belief, sharing, and correction more systematically.

### ABM and LLM agents

- `park2022simulacra`, `park2023generative`, `gao2023s3`, `yang2024oasis`, `piao2025agentsociety`, and `li2026diffusion` all exist, and the stated system capabilities are supported. The Li DOI, title, authors, 2026 year, journal, volume, and issue are verified.
- `piao2025agentsociety` is valid as a 2025 arXiv citation, although a 2026 *Information Fusion* publication now exists. Select one version consistently.
- `argyle2023one` and `horton2023silicus` support bounded claims about selected survey/economic patterns. The draft appropriately rejects treating these results as general human replacement.
- The persona-validity threat list at `03_LITERATURE_REVIEW.tex:194–204`—contamination, prompt sensitivity, stereotype amplification, restricted within-group variance, and instruction obedience—is important but mostly uncited. Add direct evidence and the Larooij–Törnberg review rather than leaving it as author assertion.
- The review omits adjacent LLM-enhanced ABM systems specifically aimed at information propagation, such as LAID/LAIDSim (IJCAI 2024, DOI `10.24963/ijcai.2024/1007`). It need not be exhaustive, but this is close enough to require either inclusion or an explicit selection rule.
- Classic ABM validation is represented by Richiardi, Windrum, and Sargent, which is useful. Consider adding an established model-description protocol (e.g. ODD) because implementation transparency is central to the thesis’s argument.

### Network topology and echo chambers

- The Erdős–Rényi, Watts–Strogatz, Barabási–Albert, Centola–Macy, McPherson et al., Del Vicario et al., Törnberg, and Newman records exist and their headline claims are supported.
- The canonical topology coverage is sound, but the **implemented** “echo chamber,” “polarised,” and “hierarchical” generators have no literature source. They are legitimate bespoke treatments if explicitly labelled as such; topology names alone must not imply validated platform models.
- The draft correctly warns that modularity is structural segregation, not truth/extremity, and that one graph seed cannot identify a topology-class effect.
- Missing coverage relevant to the design includes seed centrality, directed/weighted social networks, degree-preserving comparisons, recommender-mediated exposure, and the confounding of topology class with density/degree/path length. These omissions matter because the empirical argument compares named generators rather than structurally matched graphs.

### Measurement validity

- `cronbach1955construct`, `messick1995validity`, `fabbri2022qafacteval`, `zheng2023judge`, `maccallum2002dichotomization`, and `altman2006cost` exist with correct metadata.
- The QAFactEval claim at `03_LITERATURE_REVIEW.tex:221–228` is directionally supported, but “more directly than lexical overlap” should be phrased as a construct-targeting contrast, not as proof that QA scoring escapes lexical heuristics. QAFactEval itself uses answer-overlap components and was validated for summarization, not this instrument.
- The Zheng citation supports position, verbosity, self-enhancement, and limited-reasoning biases and reports strong agreement with human preferences. The draft correctly says this does not validate climate factuality scoring.
- The distinction among score validity, calibration, reliability, and agreement needs sharpening. Human agreement alone does not establish content coverage, criterion validity, calibration, or invariance across judges/prompts.
- Add literature on inter-rater reliability/agreement and recent critical evaluations of automated factuality metrics. The current validation prescriptions at `03_LITERATURE_REVIEW.tex:251–258` are sensible but not directly sourced.
- The continuous/discrete warning is strong. The draft correctly states that a common numerical range does not make two instruments commensurate and that the MI > 3 bands are inherited operational thresholds, not psychometric categories.

### Debnath

- `debnath2023conspiracy` has correct title, authors, journal, year, article number, and DOI.
- The detailed claims at `03_LITERATURE_REVIEW.tex:91–100` are supported: 814,924 English-language `#geoengineering` tweets over 2009–2021; chemtrails spillover; UK/US/India/Sweden links; positive emotion following governance events; negative/neutral emotion following project/experiment announcements; and toxicity shaping spillover breadth.
- Prefer the paper’s wording “tweets and retweets containing `#geoengineering`” and its precise collection interval (January 2009–November 2021 in the methods), rather than implying a complete calendar-year corpus.
- The draft is commendably explicit that Debnath supplies an observational discourse study, not causal diffusion, user clusters, retweet cascades, MI/MPR, or a digital twin.
- `04_THEORY.tex:384–396` goes slightly beyond the paper by calling the environment “identity-structured” and assigning profile-specific interpretive mechanisms. Debnath identifies discourse themes and regional/semantic spillovers, not stable individual identities or behavioural types. Keep these as thesis hypotheses, not findings “from Debnath.”
- “Climate action,” “environmental concern,” and “conspiracy” are defensible thematic reductions, but not recovered user clusters or fitted population shares. The draft usually says this correctly; retain that caveat at every first use.

### Pfeffer

- `pfeffer2014firestorms` has correct title, authors, journal, volume/issue, pages, and DOI. Crossref records online publication in 2013; 2014 is the journal issue year and is an acceptable citation year.
- The firestorm definition and exact seven Outlook factors are correctly represented: speed/volume, binary choices, network clusters, unrestrained information flow, lack of diversity, cross-media dynamics, and network-triggered decision processes.
- The draft’s strongest correction is valid: valence, surprise, identity alignment, clustering, echo, and temporal acceleration are thesis-level remappings, not Pfeffer’s original six factors.
- The claims that Pfeffer does not supply an LLM/ABM, MI/MPR, or numeric tipping threshold are supported.
- Do not imply experimental confirmation of Pfeffer. The simulation omits cross-media dynamics, uses ternary rather than binary actions, and does not identify the four-stage network-triggered process. `11_PFEFFER_APPLICATION.tex` and `04_THEORY.tex` state these boundaries well.

## Bibliographic metadata ledger

### Verified as entered in substance

The following 31 records exist and match the entered title/year/DOI (allowing capitalization and online-versus-issue-year conventions): `altman2006cost`, `argyle2023one`, `barabasi1999emergence`, `centola2007complex`, `cronbach1955construct`, `debnath2023conspiracy`, `delvicario2016echo`, `fabbri2022qafacteval`, `gao2023s3`, `goel2016virality`, `horton2023silicus`, `kempe2003influence`, `lazer2018science`, `li2026diffusion`, `maccallum2002dichotomization`, `maurya2025simulating` **as an arXiv object only**, `mcpherson2001homophily`, `messick1995validity`, `newman2006modularity`, `nuortimo2020scale`, `nuortimo2025scale`, `park2022simulacra`, `park2023generative`, `piao2025agentsociety`, `pfeffer2014firestorms`, `sargent2013verification`, `tornberg2018echo`, `vosoughi2018false`, `watts1998collective`, `yang2024oasis`, and `zheng2023judge`.

### Valid URL-only records

- `erdos1960evolution`: bibliographic title/year/journal/pages and supplied PDF URL are credible; no DOI is required.
- `richiardi2006protocol`: title/year/journal/volume/issue/article number and JASSS URL match.
- `windrum2007validation`: title/year/journal/volume/issue/article number and JASSS URL match.

### Incorrect, incomplete, or status-sensitive

- `debnath2023dataset`: incorrect title, year, and creator list; see blocking finding 2.
- `maurya2025simulating`: title/authors/year/arXiv DOI verified; proceeding type, workshop presentation, and award status not verified by that DOI.
- `li2026diffusion`: core metadata verified, but `pages={1}` is likely incomplete publisher metadata rather than a meaningful full page range. Use the journal’s preferred article locator/page format.
- `nuortimo2025scale`: DOI and 2025 online-publication metadata verified; update volume/issue/pages if assigned in the final journal issue.
- `piao2025agentsociety`: valid preprint, but now version-sensitive because a 2026 journal record exists.

## Citation hygiene and uncited assertions

- Citation-key check: 37 keys are used in the drafts, 35 are defined, and no defined key is unused. The two undefined keys are listed above.
- Several chapter-level literature statements rely on a citation only many sentences later. Move citations closer to the exact proposition, especially in `04_THEORY.tex:112–117`, `04_THEORY.tex:230–240`, and `04_THEORY.tex:278–290`.
- “The award paper assumes a perfect auditor” (`04_THEORY.tex:290`) needs a page/section pointer or quotation check.
- “Pfeffer’s article provides qualitative and case-based theoretical evidence” (`04_THEORY.tex:467`) is fair, but “evidence” may overstate a conceptual synthesis; “qualitative synthesis of cases and theory” is more exact.
- Article source notes and five ground-truth questions are measurement inputs, not self-validating ground truth. The thesis should cite the scientific source for each campaign article/answer key in the methods or appendix.
- Statistical methods (Wilcoxon, Mann–Whitney, Spearman, KS, Jensen–Shannon) and the ad hoc thresholds/DTFS weights should be separated. Standard methods need normal methodological citations; the thresholds and weights need explicit labeling as author/code choices, not literature-backed validity criteria.

## Coverage assessment

- **Misinformation:** adequate diffusion core; insufficient belief/correction taxonomy and platform-governance context.
- **ABM/LLM agents:** good representative system coverage; missing the most relevant modern validation review in the bibliography and at least one adjacent propagation simulator.
- **Network topology:** strong canonical foundations; weak support for bespoke treatment labels and structurally matched causal comparison.
- **Measurement validity:** conceptually the strongest section; needs reliability/calibration/factuality-metric evidence and clearer separation of construct validity from judge agreement.
- **Debnath:** strong and accurately bounded, subject to dataset metadata correction and avoiding “identity”/cluster over-attribution.
- **Pfeffer:** strong and accurately corrected from the proposal’s false six-factor framing.

## Required revision order

1. Add/fix the two missing bibliography records and correct the Mendeley dataset metadata.
2. Resolve Maurya workshop/award provenance; otherwise downgrade every venue/award claim to arXiv-preprint status.
3. Narrow or substantiate the field-wide research-gap claim.
4. Add sources for compartmental/threshold diffusion, persona-validity threats, misinformation correction, and automated-measure validity.
5. Label bespoke graph treatments and all validation thresholds/weights as design choices.
6. Run a final automated key check and DOI/DataCite metadata check after bibliography assembly.

No source draft was edited as part of this audit.
