# Related-work backbone (examiner notes)

**Thesis context:** TUM M.Sc. Data & Society — climate / geoengineering firestorm simulation with LLM agents (Pfeffer factors + Debnath-grounded belief profiles), building on but **not reprinting** Maurya et al. LASS@CIKM 2025.

**Sources used:** primary PDFs in `Paper/`; PMC/Cell for Debnath; arXiv/ACM for agent simulation and cascades; thesis proposal `Paper/proposal_pfeffer_v5.pdf`; campaign notes in `thesisExperiment/` (read-only for framing).

**Accuracy rule:** Claims below are tagged **[primary]** when checked against the cited source text, **[secondary]** when taken from a reliable index/abstract but not fully read, or **[UNVERIFIED]** when the proposal or README asserts something that could not be confirmed here.

---

## 0. How to use this note in the thesis

Structure the Related Work / Background chapter as four pillars + one “prior contribution” section:

1. Online firestorm theory (Pfeffer / Zorbach / Carley) and measurement successors  
2. Empirical climate–conspiracy discourse (Debnath et al.)  
3. Classical cascade + opinion-dynamics models (what LLM agents replace / complement)  
4. Generative LLM social simulation (Social Simulacra → Generative Agents → AgentSociety) and evaluation validity (LLM-as-judge / QA auditors)  
5. **Candidate’s prior work (LASS@CIKM 2025):** what is already published vs what the thesis must newly show  

Keep the voice: theory → gap → what *this* simulation uniquely operationalises. Never present CIKM crime/marketing linear-chain results as thesis findings.

---

## 1. Online firestorms — Pfeffer, Zorbach, Carley (2014)

### 1.1 Primary citation and definition

**[primary]** Pfeffer, J., Zorbach, T., & Carley, K. M. (2014). Understanding online firestorms: Negative word-of-mouth dynamics in social media networks. *Journal of Marketing Communications*, 20(1–2), 117–128. https://doi.org/10.1080/13527266.2013.797778  

Definition (paraphrase): an **online firestorm** is the sudden discharge of large quantities of messages containing negative WOM and complaint behaviour against a person, company, or group in social media, often with intense indignation and a high affective (opinion-heavy) character; messages may be rumor-based or event-based.

Canonical commercial / celebrity cases in the paper include #McDStories, #QantasLuxury, and related sudden outrage cascades. The article’s goal is descriptive–theoretical: group observations, link to social/economic theory, and extract **generalised factors** that favour firestorm proliferation.

### 1.2 Seven factors in the *primary* paper (do not mis-cite as “six”)

**[primary]** Outlook section lists **seven** interrelated factors:

| # | Factor (exact framing) | Mechanism sketch |
|---|------------------------|------------------|
| 1 | Speed and volume of communication | Real-time platforms compress reaction cycles to minutes/hours; topic dominance → high volume |
| 2 | Binary choices | Like / share / retweet as either–or; limited discursive interaction (Schelling 1973 binary choice) |
| 3 | Network clusters | Local clustering / triadic closure → information echoes from multiple neighbours |
| 4 | Unrestrained information flow | Hundreds–thousands of weak ties vs offline sympathy-group limits |
| 5 | Lack of diversity | Homophily + algorithmic filter bubbles (Pariser 2011; McPherson et al. 2001) |
| 6 | Cross-media dynamics | Social→legacy media→social amplification loop |
| 7 | Network-triggered decision processes | Knowledge / persuasion / propagation / affirmation compressed into network effects |

**Examiner note — critical for a 1.0-level thesis:** The candidate’s proposal (`proposal_pfeffer_v5.pdf`) and campaign mapping (`thesisExperiment/pfeffer_mapping.md`) operationalise a **different six-factor list**:

> valence, surprise, identity alignment, network clustering, information echo, temporal acceleration  

That list is a **thesis remapping / operationalisation**, not a verbatim restatement of Pfeffer et al. (2014). In the thesis text:

- Cite Pfeffer 2014 for the **seven-factor** theory and firestorm definition.  
- Explicitly present the six knobs as **your computational operationalisation** (mapping table required).  
- Do **not** write “Pfeffer identified six factors: valence, surprise…” unless you locate a later Pfeffer publication that uses that wording. **[UNVERIFIED]** No such six-factor Pfeffer paper was found in this discovery pass.

Suggested mapping (for Related Work + Methods):

| Thesis knob | Closest Pfeffer 2014 factor(s) | Simulation operationalisation (campaign) |
|-------------|-------------------------------|------------------------------------------|
| Temporal acceleration | Speed and volume; network-triggered decisions | `maxTicks` / hops / activity pattern |
| Surprise | Speed and volume (shock vs drip) | Seed fan-out / volume shock (often held as drip) |
| Valence | Affective / indignation character of firestorm messages | Seed wording + persona emotional tone |
| Identity alignment | Lack of diversity / homophily | Homogeneous vs mixed Debnath BPs |
| Network clustering | Network clusters | Scale-free vs ER (optional echo topology) |
| Information echo | Clusters + unrestrained flow + (parts of) lack of diversity | Trust evolution, measured modularity / PI; echo topology |

**Cross-media dynamics** is the clearest Pfeffer factor **not** fully simulated in the current LLM society (no legacy-media broadcast agent). Flag as a boundary condition, not a silent omission.

### 1.3 What Pfeffer 2014 does *not* provide (gap the thesis claims)

**[primary]** The paper is qualitative–synthetic: no agent-based generative model, no tipping-point parameter \(k^*\), no controlled intervention experiment, no scientific-misinformation domain.

Successors / measurement literature (for “state of the art after Pfeffer”):

- **[primary abstract]** Nuortimo, K., Härkönen, J., Breznik, K., & Hannes, R. (2025). Developing a social media firestorm scale… *Journal of Marketing Analytics*. https://doi.org/10.1057/s41270-025-00439-x — builds on Nuortimo et al. (2020) SMF scale (width / height / duration); authors themselves describe it as a step toward full validation.  
- **[secondary]** Drasch et al. (2015) ICIS — firestorm *detection* after ignition (cited in proposal; full paper not re-read here).  
- **[primary]** Ruths, D., & Pfeffer, J. (2014). Social media for large studies of behavior. *Science*, 346(6213), 1063–1064. https://doi.org/10.1126/science.1257756 — platform-bias caution for large observational studies.  
- **[primary]** Pfeffer, J., Mayer, K., & Morstatter, F. (2018). Tampering with Twitter’s Sample API. *EPJ Data Science*, 7, 50. https://doi.org/10.1140/epjds/s13688-018-0178-0 — sample-API integrity.

**Thesis angle:** move from descriptive factors and post-hoc scales to a **generative, parameterised firestorm testbed** in a scientific domain.

---

## 2. Debnath et al. — geoengineering / chemtrails Twitter (2023)

### 2.1 Primary citation

**[primary]** Debnath, R., Reiner, D. M., Sovacool, B. K., Müller-Hansen, F., Repke, T., Alvarez, R. M., & Fitzgerald, S. D. (2023). Conspiracy spillovers and geoengineering. *iScience*, 26(3), 106166. https://doi.org/10.1016/j.isci.2023.106166 · PMC: PMC10040962 · PMID: 36994188  

Corpus: **814,924** English tweets with `#geoengineering`, ~Jan 2009–Nov 2021. Methods: NLP, deep learning (toxicity), network analysis.

### 2.2 Core empirical claims useful for grounding the thesis

**[primary / PMC notes + paper abstract]**

1. **Chemtrails conspiracy dominates** geoengineering discourse on Twitter in this corpus (airplanes allegedly spray poison / modify weather via contrails).  
2. **Conspiracy spillover** into regional debates (UK, USA, India, Sweden) and broader political considerations.  
3. **Affective dynamics:** positive emotions rise after SRM *governance* events; negative/neutral rise after SRM *projects / experiment announcements*.  
4. **Toxicity** shapes breadth of spillover and anti-SRM views.  
5. Temporal structure around **Harvard SCoPEx** (April 2017 launch reporting) is a documented volume spike in the literature used by the campaign (~8,000 interactions/day order of magnitude; ~+300% vs Feb 2017 — **[primary]** as used in Debnath notes / proposal; retain exact figures only if re-checked in PMC HTML before final thesis).  

### 2.3 What Debnath provides vs what simulation must add

| Debnath provides | Thesis simulation can add |
|------------------|---------------------------|
| Observational map of discourse, emotion, toxicity, networks | Controllable generative cascades with known seed text |
| Three discourse tendencies (conspiracy / climate action / environmental concern) | Explicit BP-conditioned rewrite agents |
| Real event timing (SCoPEx, funder narratives incl. Gates) | Counterfactual topologies and fact-check interventions |
| No LLM agent society | Auditor-traced MI / MPR under Pfeffer knobs |

**Honesty constraints (already documented in campaign):** full 814k hydrated tweets were **not** downloaded; BPs are **theory-faithful reductions**, not HDBSCAN centroids on the dump. Do not claim “we clustered Debnath’s 814k users.”

Dataset landing: Mendeley https://doi.org/10.17632/546hsym93p.1 (tweet IDs). Analysis codes: https://github.com/Ramit1201/geoeng .

---

## 3. Classical cascade models (SIR / Independent Cascade)

These are the **null / baseline formalisms** against which LLM rewrite societies should be positioned.

### 3.1 Epidemic / rumor SIR lineage

**[primary via standard citation]** Kermack, W. O., & McKendrick, A. G. (1927). A contribution to the mathematical theory of epidemics. *Proc. Royal Society A*, 115(772), 700–721. https://doi.org/10.1098/rspa.1927.0118  

**[primary]** Goffman, W., & Newill, V. A. (1964). Generalization of epidemic theory: An application to the transmission of ideas. *Nature*, 204, 225–228. https://doi.org/10.1038/204225a0  

**[primary]** Daley, D. J., & Kendall, D. G. (1964). Epidemics and rumours. *Nature*, 204, 1118. https://doi.org/10.1038/2041118a0  

**Use in Related Work:** SIR-type models treat adoption as infection with closed-form compartments. They excel at **volume / threshold** questions but **cannot** represent claim-level semantic mutation (chemtrails reframing of SCoPEx).

### 3.2 Independent Cascade (IC) and influence maximisation

**[primary]** Kempe, D., Kleinberg, J., & Tardos, É. (2003). Maximizing the spread of influence through a social network. *KDD ’03*, 137–146. https://doi.org/10.1145/956750.956769  

IC: a newly active node gets one probabilistic chance to activate each inactive neighbour. Linear Threshold is the sibling model in the same paper.

**Thesis contrast:** IC edges carry a scalar probability; the thesis graph carries **LLM rewrite operators** \(T_{b,k}\) (content transformation) plus a QA auditor. Topology still matters (scale-free hubs vs ER), but the state is **text**, not a binary infected bit.

### 3.3 Empirical cascade facts that motivate agent simulation

**[primary]** Vosoughi, S., Roy, D., & Aral, S. (2018). The spread of true and false news online. *Science*, 359(6380), 1146–1151. https://doi.org/10.1126/science.aap9559  

~126k rumor cascades; falsehood spreads farther/faster/deeper; novelty and emotion matter; bots do not explain the true/false gap. This is the empirical warrant for **persona / cognitive** mechanisms beyond pure topology.

---

## 4. Opinion dynamics (DeGroot, Hegselmann–Krause, voter)

Position these as the classical **continuous / discrete opinion** layer that LLM societies partially replace with natural-language belief expressions.

### 4.1 DeGroot averaging

**[primary]** DeGroot, M. H. (1974). Reaching a consensus. *Journal of the American Statistical Association*, 69(345), 118–121. https://doi.org/10.1080/01621459.1974.10480137  

Repeated weighted averaging; consensus under connectivity / weight conditions.

### 4.2 Bounded confidence (HK)

**[primary]** Hegselmann, R., & Krause, U. (2002). Opinion dynamics and bounded confidence: Models, analysis, and simulation. *JASSS*, 5(3). https://www.jasss.org/5/3/2.html  

Agents average only neighbours within confidence radius \(\varepsilon\) → consensus, polarisation, or fragmentation.

Related: **[secondary]** Deffuant et al. (2000) pairwise bounded-confidence (DW) model — cite if discussing asynchronous updating.

### 4.3 Voter model

**[primary]** Holley, R. A., & Liggett, T. M. (1975). Ergodic theorems for weakly interacting infinite systems and the voter model. *Annals of Probability*, 3(4), 643–663. https://doi.org/10.1214/aop/1176996306  

Also independently: Clifford & Sudbury (1973). Binary opinion imitation on graphs; finite connected graphs reach consensus a.s.

### 4.4 Bridge to the thesis

| Classical OD | Limitation for climate firestorm thesis | LLM society analogue |
|--------------|-----------------------------------------|----------------------|
| Scalar opinion \(x_i\in[0,1]\) | Cannot encode “chemtrails as weather warfare” | Persona-conditioned rewrite text |
| Fixed \(\varepsilon\) / weights | No claim-level fidelity tracking | MI / MPR auditor |
| Homogeneous update rules | Weak identity / valence coupling | Debnath BP prompts + tone |

Do **not** claim the thesis “implements Hegselmann–Krause” unless you literally code HK updates. Prefer: *complements* OD by replacing scalars with audited language.

---

## 5. Generative LLM social simulation

### 5.1 Social Simulacra (UIST 2022)

**[primary]** Park, J. S., Popowski, L., Cai, C. J., Morris, M. R., Liang, P., & Bernstein, M. S. (2022). Social Simulacra: Creating populated prototypes for social computing systems. *UIST ’22*. https://doi.org/10.1145/3526113.3545616 · arXiv:2208.04024  

Prototyping technique: designer specifies community goal/rules/seed personas → LLM generates large populations of posts/replies including antisocial behaviour. Evaluation: humans often cannot distinguish simulacra from real community behaviour; designers refine designs via WhatIf / Multiverse.

**Relevance:** justifies LLM-populated communities as *design probes*; weak on claim-level factual drift metrics.

### 5.2 Generative Agents (UIST 2023)

**[primary]** Park, J. S., O’Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., & Bernstein, M. S. (2023). Generative Agents: Interactive simulacra of human behavior. *UIST ’23*, Article 2. https://doi.org/10.1145/3586183.3606763 · arXiv:2304.03442  

Architecture: memory stream + reflection + planning over an LLM. Sims-like sandbox (~25 agents); emergent coordination (party invitations). Ablations show observation / planning / reflection each matter for believability.

**Relevance:** memory + reflection is the architectural target the thesis proposal cites as missing from CIKM linear chains. Generative Agents emphasise *believable daily behaviour*, not *misinformation severity taxonomies*.

### 5.3 AgentSociety (2025 preprint)

**[primary abstract]** Piao, J., Yan, Y., Zhang, J., Li, N., … Li, Y. (2025). AgentSociety: Large-scale simulation of LLM-driven generative agents… arXiv:2502.08691  

~10k agents, ~5M interactions; urban/social/economic environment; case studies include polarisation and inflammatory-message spread. Positions itself as generative social science at scale.

**Relevance:** scale and institutional environments exceed the thesis pilot; the thesis’s unique angle is **Pfeffer-operationalised climate firestorm + claim auditor**, not city-scale economics.

### 5.4 Adjacent 2025 misinformation-agent work (position carefully)

Cite as *related concurrent work*, not prior art owned by the candidate:

- **[primary]** Liu et al. (2025). MOSAIC… *EMNLP 2025*. https://doi.org/10.18653/v1/2025.emnlp-main.325 — social-graph LLM agents; moderation strategies.  
- **[primary]** Liu et al. (2025). FUSE / Stepwise Deception… *EMNLP 2025*. https://aclanthology.org/2025.emnlp-main.1330/ — evolution from true news to fake with role agents + FUSE-EVAL.  
- **[secondary]** arXiv:2502.01450 — rumor spreading with >100 LLM agents across topologies.

**Differentiation:** auditor–node MI/MPR + climate–Debnath grounding + Pfeffer knobs.

---

## 6. LLM-as-judge / QA auditor validity

The thesis inherits a **QA-based auditor** from CIKM. Related Work must show both warrant and threats to validity.

### 6.1 LLM-as-a-judge (preference / open-ended evaluation)

**[primary]** Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., … Stoica, I. (2023). Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. *NeurIPS 2023 Datasets and Benchmarks*. arXiv:2306.05685 · NeurIPS proceedings DOI https://doi.org/10.52202/075280-2020  

Findings: strong judges (e.g. GPT-4) can reach ~human-level agreement (~80%) on preference tasks; documented biases: position, verbosity, self-enhancement; limited reasoning failure modes.

**Transfer caution:** MT-Bench agreement does **not** automatically validate binary fact-recovery auditors on climate claims. Thesis should treat Zheng et al. as *motivation for automated judging* + *bias checklist*, then argue why QA against a fixed gold answer set is a **narrower, more verifiable** task.

### 6.2 QA-based factual consistency

**[primary]** Fabbri, A., Wu, C.-S., Liu, W., & Xiong, C. (2022). QAFactEval: Improved QA-based factual consistency evaluation for summarization. *NAACL 2022*, 2587–2601. https://doi.org/10.18653/v1/2022.naacl-main.187  

Warrant for claim-level QA over ROUGE/BLEU/BERTScore for factual drift (also used in CIKM methodology section).

### 6.3 Validity threats for the thesis auditor

State explicitly in Limitations / Related Work:

1. Same-model family generating rewrites and judging (shared bias).  
2. Binary recoverability collapses missing vs inverted facts (CIKM itself notes this; repo IFD extension addresses it — only claim if thesis actually uses IFD).  
3. Human agreement on climate conspiracy items not yet measured in the N=1 pilot.  
4. Propaganda threshold MI>3 is a **design choice carried from CIKM**, not an externally validated psychometric cut-point.

---

## 7. Candidate’s prior work — LASS@CIKM 2025 (PRIOR vs THESIS)

### 7.1 Bibliographic record

**[primary]** Maurya, R. G., Shukla, V., Dandekar, R. A., Dandekar, R., & Panat, S. (2025). Simulating Misinformation Propagation in Social Networks using Large Language Models. Accepted as a long paper at the **1st Workshop on LLM Agents for Social Simulation (LASS)** at **ACM CIKM 2025** (Seoul, 14 Nov 2025). arXiv:2511.10384 · https://doi.org/10.48550/arXiv.2511.10384  

**[UNVERIFIED]** Separate ACM DL DOI for the workshop proceedings version was not located in this pass; cite arXiv + workshop acceptance until ACM DOI is confirmed.  

Outstanding Paper Award at LASS@CIKM 2025 is attested by workshop/community pages and the repo README; treat as true unless contradicted by official proceedings.

### 7.2 What is PRIOR (already published — cite, do not “rediscover”)

From the paper PDF / arXiv HTML **[primary]**:

- Auditor–node framework: persona-conditioned rewrite agents + QA auditor with \(m=10\) questions.  
- Metrics: **MI** (Hamming distance of answer vectors) and **MPR** (mean MI along a branch).  
- Severity taxonomy: error \(\lvert\mathrm{MPR}\rvert\le 1\); lie \(1<\lvert\mathrm{MPR}\rvert\le 3\); propaganda \(\lvert\mathrm{MPR}\rvert>3\).  
- Homogeneous branches: 21 personas × 10 domains × 30 hops; identity/ideology personas as accelerators; experts as stabilizers.  
- Heterogeneous branches: ≈**85%** of branch–domain pairs reach propaganda tier.  
- Young Parent highest average MPR (~5.48); crime0 most vulnerable domain (~4.2).  
- Early inflection often nodes ~5–9 on high-MPR chains.  
- Explicit limitations: no realistic social graph; static model; perfect auditor assumption; categorical bins only; gpt-4o only.

### 7.3 What the THESIS must add (non-reprint contribution)

Aligned with proposal + campaign (honest scope):

| Thesis claim target | Status relative to CIKM |
|---------------------|-------------------------|
| Climate / geoengineering domain (SCoPEx, chemtrails–Gates) | **New domain** |
| Debnath-grounded BPs (even if reduced) | **New grounding** |
| Network topologies (SF / ER / optional echo) | **Beyond linear chains** |
| Pfeffer-factor knobs + \(k^*\) tipping definition on network-mean MI | **New theory operationalisation** |
| Fact-check / belief-correction after \(n\) exposures | **New experiment class** (Lewandowsky continued-influence framing) |
| Distortion-type taxonomy linked to Debnath semantics | **New analysis layer** |
| Echo / modularity / PI as measured outcomes | **New** relative to CIKM |
| Open climate-firestorm configs / pipeline | Infrastructure contribution |

**Pilot honesty:** N=1, 8 nodes, 6 hop-compressed ticks, gpt-4o-mini — report as pilot evidence, not as a completed three-month proposal.

### 7.4 Continued-influence theory (for Exp B framing)

**[primary]** Lewandowsky, S., Ecker, U. K. H., Seifert, C. M., Schwarz, N., & Cook, J. (2012). Misinformation and its correction: Continued influence and successful debiasing. *Psychological Science in the Public Interest*, 13(3), 106–131. https://doi.org/10.1177/1529100612451018  

Use to theorise why fact-check injection may fail after conspiracy exposures — without claiming human psychological replication unless validated.

---

## 8. Synthesis paragraph (thesis-ready)

Classical cascade and opinion-dynamics models explain *when* and *how fast* binary states spread, but not *how* scientific claims mutate into conspiracy narratives. Pfeffer et al. (2014) name the structural conditions of online outrage, yet leave them non-generative; Debnath et al. (2023) map those conditions in geoengineering Twitter without a controllable counterfactual society. Generative Agents and Social Simulacra show that LLMs can populate believable social worlds, while AgentSociety scales them; none combine a claim-level misinformation auditor with an explicit firestorm-factor design in the climate domain. Maurya et al. (LASS@CIKM 2025) supply the auditor–node instrument and severity taxonomy on linear persona chains over general news. The present thesis therefore treats CIKM as **prior method**, and asks whether a networked, Debnath-grounded, Pfeffer-operationalised LLM society can produce **testable tipping and correction behaviour** for climate firestorms — a question neither the 2014 theory paper nor the 2025 workshop paper answers.

---

## 9. Verification backlog (finish before submission)

1. Re-read Debnath PMC for exact SCoPEx volume / centrality numbers before quoting to two decimals.  
2. Confirm ACM DOI / proceedings page numbers for LASS@CIKM 2025 camera-ready.  
3. Locate any Pfeffer lecture/slide that uses the six-factor valence/surprise list — or keep calling it a thesis remapping.  
4. Human–auditor agreement study on ≥30 climate rewrites (validity).  
5. Decide whether EMNLP “under review” extension is cited as unpublished manuscript only.

---

*Discovery written for `thesisExperiment/discovery/01_literature/`. Do not treat campaign pilot numbers as literature claims.*
