# Pfeffer 2014 firestorm paper — extract for later thesis use

**Status.** Methods notebook, not a new experiment. Do not treat this file as a results chapter.  
**Date of extract.** 19 September 2026.  
**Rule.** Citations below were checked against the publisher landing page, mediaTUM, and an author-posted PDF. Do not invent papers. Do not dump copyrighted full text.

Related local files (already in the repo; this note does not replace them):

- `thesisExperiment/results_phase2/pfeffer_observables.md` — Phase 2 seven-row operational table
- `thesisExperiment/scripts/compare_phase2.js` — empirical vs simulated observables
- `thesisExperiment/pfeffer_mapping.md` — six-knob engine mapping (older campaign language)
- `thesisExperiment/discovery/01_literature/related_work.md` — examiner notes on the seven-vs-six issue
- `thesisExperiment/discovery/02_theory/factor_knob_table.md` — exact JSON keys
- `PHASE2_PLAN.md` — 8 hops = cost cut vs CIKM 30

---

## 1. Canonical paper

| Field | Value |
|---|---|
| Authors | Jürgen Pfeffer, Thomas Zorbach, Kathleen M. Carley |
| Year | **2014** (published online 10 June 2013) |
| Title | Understanding online firestorms: Negative word-of-mouth dynamics in social media networks |
| Venue | *Journal of Marketing Communications*, **20**(1–2), 117–128 |
| DOI | [10.1080/13527266.2013.797778](https://doi.org/10.1080/13527266.2013.797778) |
| Publisher page | https://www.tandfonline.com/doi/abs/10.1080/13527266.2013.797778 |
| mediaTUM | https://mediatum.ub.tum.de/1338435?show_id=1453601 |
| Author-posted PDF (Zorbach / vm-people) | https://vm-people.de/wp-content/uploads/2016/02/Understanding-online-firestorms-Negative-word-of-mouth-dynamics-in-social-media-networks.pdf |

**BibTeX (matches `thesisExperiment/discovery/01_literature/bibliography.bib`):**

```bibtex
@article{pfeffer2014firestorms,
  author  = {Pfeffer, J{\"u}rgen and Zorbach, Thomas and Carley, Kathleen M.},
  title   = {Understanding online firestorms: Negative word-of-mouth dynamics in social media networks},
  journal = {Journal of Marketing Communications},
  year    = {2014},
  volume  = {20},
  number  = {1-2},
  pages   = {117--128},
  doi     = {10.1080/13527266.2013.797778}
}
```

**CORE.ac.uk.** Searched (`core.ac.uk` + title/authors). No confirmed CORE deposit of this article was found. The user-facing “CORE” here is the **canonical firestorm paper** Prof. Pfeffer is known for, not a CORE.ac.uk identifier. Do not cite a CORE PDF that was not located.

**What the paper is.** Qualitative–synthetic marketing-communications article. It (i) defines online firestorms, (ii) walks three commercial cases, (iii) groups observations into **seven** generalised factors with theory links, (iv) offers crisis-communication implications, (v) sketches SNA-based future work. It is **not** a generative agent model, not a tipping-point estimator, and not a climate/geoengineering study.

**Definition (paraphrase, not a quotation dump).** An online firestorm is the sudden discharge of large quantities of messages containing negative word-of-mouth and complaint behaviour against a person, company, or group in social media. Messages often carry intense indignation without a specific criticism; they can be rumour-based (unconfirmed) or event-based (confirmed); the essential feature is that they are predominantly **opinion, not fact**, hence highly affective.

**Cases used as observations (paper, not this thesis):** McDonald’s `#McDStories` (Jan 2012), Qantas `#QantasLuxury` (Nov 2011), ING-DiBa vegan Facebook attack (Jan 2012). Also mentioned: Kryptonite lock video (2004), “Weinergate,” Ashton Kutcher.

**Paper method (what they actually did).** Group recent firestorm observations → map each group onto social/economic theory → name a generalised factor (their Table 1) → discuss marketer counter-moves. No LLM society. No MI/MPR. No hop protocol.

---

## 2. Is it 6 or 7? Exact original list

**Seven.** The Outlook section states that opinion-forming dynamics on social media are dominated by **seven** interrelated factors. The body introduces them as “we extract seven factors” and “assembled them in seven groups (see first column of Table 1).”

The thesis six-knob list is a **computational remapping**. It is **not** Pfeffer’s original list. The proposal (`proposal_pfeffer_v5`) incorrectly wrote “six structural factors: valence, surprise, identity alignment, network clustering, information echo, and temporal acceleration.” Do not write “Pfeffer identified six factors.” Do not write “Pfeffer identified these seven knobs.”

### Original Pfeffer 2014 list (Outlook / Table 1)

Exact names as listed in the Outlook (order preserved):

| # | Factor (paper name) | Observation (paraphrase) | Theory the paper cites | Engine analogue in this thesis |
|---|---|---|---|---|
| 1 | **Speed and volume of communication** | Real-time feed displaces the previous item; attractive topics dominate; reaction cycle is hours/minutes vs a newspaper day; Twitter meme/hashtag half-life on the order of hours or minutes | Burton & Kebler (1960) half-life; Fang & Huberman (2007) novelty/attention | Thesis knobs **surprise** (shock vs drip) and **temporal acceleration** (`maxTicks` / `maxHops` / `activityPattern`). **Not** a reconstructed tweet-clock. |
| 2 | **Binary choices** | Like / +1 / retweet / sign-a-petition as either–or; short messages; little discursive interaction; no gradualist opinion widget | Schelling (1973) binary choices with externalities | Engine is **ternary** (`forward` / `reinterpret` / `drop`). Implicit in `actionWeights`. **No dedicated observable row. Not swept.** |
| 3 | **Network clusters** | Local transitivity: *a–b* and *b–c* ⇒ likely *a–c*; information echoes from several neighbours, creating the impression that “everybody” shares the topic/opinion; local clusters matter for epidemic takeoff | Heider (1946); Watts & Strogatz (1998); Lotan (2012) KONY2012; Pfeffer & Carley (2013, IJITM, cited as forthcoming in 2014) | Thesis knob **clustering**. Topologies: `echo_chamber`, `polarized`, `small_world`, vs `random_er` control. Measured: degree, conspiracy-cut modularity. |
| 4 | **Unrestrained information flow** | Offline sympathy groups ~12–20 people (Zhou et al. 2005); core discussion 2–3 (Marsden 1987). Social media gives equal attention to hundreds–thousands of weak-tie neighbours, amplifying transitive echo | Granovetter (1973) strength of weak ties | Partial: high-degree `scale_free`; dense intra `echo_chamber`. **n=8 is not hundreds of neighbours.** Measured with echo/homophily, not tie-strength. |
| 5 | **Lack of diversity** | Homophily of ties + algorithmic ranking = filter bubble; information is limited **and** biased (bounded rationality) | Pariser (2011); McPherson, Smith-Lovin & Cook (2001); Simon (1972) | Thesis knob **identity**. Swept T-H vs T-He; measured hashtag/BP mix. |
| 6 | **Cross-media dynamics** | Social story → legacy media broadcast with social hooks → more online activity → more coverage. Myers, Zhu & Leskovec (2012) estimate ~one-third of social-media information volume is triggered by **external** events | Key (1966) echo chamber (politics–media–populace); Diakopoulos, De Choudhury & Naaman (2012); Myers et al. (KDD 2012) | Thesis seventh row **cross-media**. **Held.** No newsroom / broadcast agent. Hierarchical topology is **not** this factor. |
| 7 | **Network-triggered decision processes** | Rogers (1995) adoption steps (knowledge → persuasion → propagation → affirmation) compressed: filter bubble limits knowledge; echo chamber supplies persuasion/affirmation; “everyone already agrees” so cognition is replaced by network effects | Rogers (1995); Pfeffer & Carley (2013) opinion-adoption adaptation | Thesis **temporal** row points here plus #1. **Not operationalised as four named steps.** k\* (MI>3) is a thesis tipping rule, not a Pfeffer statistic. |

**Valence is not a numbered Outlook factor.** Affect / indignation is in the **definition** (“messages … predominantly opinion, not fact, thus having a high affective nature”). Mapping it to a knob is legitimate operationalisation; claiming Pfeffer numbered “valence” is not.

### Thesis remapping (what the campaign actually records)

| Thesis observable | Closest 2014 factor(s) | Status in Phase 2 |
|---|---|---|
| Valence | Definition (affective character), not Outlook # | Varied via articles + persona tone. Empirical: paper-quoted Debnath toxicity ~0.17 / hashtag proxy. Sim: auditor **MI**, not Twitter MI. |
| Surprise | #1 speed/volume (shock vs drip) | **Held drip** (`seedNodes: [node_0]`). SCoPEx +300% / ~8k interactions/day is **paper-quoted Debnath**, not a reconstructed shock series. |
| Identity | #5 lack of diversity | Swept homo vs hetero; measured mix. |
| Clustering | #3 network clusters | Swept 8 topologies; measured Q / degree. |
| Echo | #3 + #4 + parts of #5 | Measured edge / identity homophily. |
| Temporal | #1 and #7 | **Held** 8 ticks/hops. Empirical tweet clock **unavailable** on hashtag fallback. |
| Cross-media | #6 | **Held**, no engine knob. |

That is **seven rows** because Phase 2 added held cross-media so the operational table matches the paper’s **count**. It does **not** rename Pfeffer’s seven names as the six knobs.

---

## 3. Methods in the paper that we should apply later

Pfeffer 2014 is not a cookbook. The Outlook and implications sections **recommend** methods. Below: apply later vs already approximated. **Do not implement a new experiment from this file.**

### 3.1 Operationalisation: simulated vs empirical graphs

| Paper recommendation | Empirical (Debnath side) | Simulated (this engine) | Apply later |
|---|---|---|---|
| Treat platforms as **communication networks** (Rogers & Kincaid 1981); SNA (Wasserman & Faust 1995; Newman, Barabási & Watts 2006) | Hashtag co-occurrence graph, n=63, 228 directed edges. **Not** a retweet / conversation cascade. 814k tweet IDs **not hydrated**. | `graph_topology.json` from generators or `custom` D-net import | Hydrate tweet IDs if X API exists; reconstruct `conversation_id` / retweet trees; then re-run ValidationMetrics on **that** graph, not hashtags. |
| Identify **important users** and **communities / subgroups** | Hashtag identity mix; conspiracy-cut modularity Q≈0.40. Debnath paper quotes eigenvector centrality of `#chemtrails` (e.g. UK 0.58) — **not re-estimated here** | Degree, conspiracy-cut Q, edge homophily. No eigenvector / betweenness on sim graphs in `compare_phase2.js` | Compute centrality + community detection on both sides with the **same** algorithm; report node-type-conditioned MI, not only network means. |
| **Preincident** structure of users in the **early** firestorm | Not available (no tweet clock on fallback) | Seed is `node_0` at tick 0; no “members of a pre-existing vegetarian network activate” protocol | Test the paper’s hypothesis: firestorms activate **preexistent** clusters (e.g. conspiracy BP chamber) rather than spontaneously forming new ones. Compare echo/polarized (pre-wired) vs ER (no pre-cluster). |
| Speed: meme **half-life** hours/minutes (Fang & Huberman 2007) | Debnath SCoPEx spike is quoted, not reconstructed as a half-life | `speedTicks` is the sim clock (Phase 2 mean 7 ticks on D-net). **Do not convert ticks to hours** | If hydrated timestamps exist: half-life / inter-arrival. Else keep “sim ticks ≠ wall clock.” |
| Cross-media / **external influence** ~1/3 of volume (Myers, Zhu & Leskovec 2012) | No legacy-media layer in the reconstruct | No broadcast agent | Optional newsroom node or exogenous volume pulse. Until then: held. |
| Binary choice (Schelling) | Twitter like/retweet is closer to binary than our engine | Ternary `actionWeights` | Ablation: force binary (forward vs drop, reinterpret=0) vs current ternary. |
| Network-triggered decisions (Rogers steps compressed) | Not measured | Auditor MI after rewrite is a **content** score, not knowledge/persuasion/affirmation | Optional: log first-exposure vs repeated-neighbour echo vs affirmation (same-frame repeats). |
| Diversity stabilises shocks (paper: **untested hypothesis**) | — | Homo vs hetero is the closest contrast | Shock cell (all-node seed) × mix; paper predicted diverse communities more stable. **H2 is currently untested** (`factor_knob_table.md`). |
| Counter-info: early + trusted sources; inoculation (McGuire 1961); paired contradictory messages; slight drop in P(propagate) at tipping points (Gladwell, cited as popularisation) | Debnath inoculation is a **different** paper (proposal ref [5]) | Exp B `fact_checker_injection` exists but is confounded (no matched windows / no control) | Re-do B with control + paired pre/post; optional `inoculation` type. Do not cite Pfeffer as having run this experiment. |
| Local-cluster simulation (Pfeffer & Carley 2013 IJITM) | — | Topology grid is the descendant | Keep citing 2013 for cluster diffusion; 2014 for firestorm factors. |

### 3.2 Already applied (`compare_phase2.js` / `pfeffer_observables.md`) vs missing

**Already applied (Phase 2 compare, as of `results_phase2/summary.md` 2026-09-19):**

- Honesty notes: no empirical MPR; hashtag ≠ retweet; 8 hops ≠ CIKM 30; seven factors; cross-media held.
- Structural: depth / breadth / size / structural virality (Goel-style) on empirical vs D-net. DTFS **0.2754**, `isValidated=false` (threshold 0.70). Do not call this a digital twin.
- KS/JS with nReal=1 — **underpowered**; do not treat *p*-values as twin-validation.
- Seven observable rows written for empirical + simulated.
- Identity mix, clustering Q, echo homophily measured on hashtag graph vs `graph_topology.json`.
- Sim valence = mean auditor MI (**not** Twitter MI). Empirical valence = paper-quoted toxicity / hashtag proxy.
- Topology grid exists: `linear_chain`, `ring`, `random_er`, `small_world`, `scale_free`, `echo_chamber`, `polarized`, `hierarchical`, plus D-net `custom`.
- Homo vs hetero personas; continuous + dual IFD.

**Still missing (checklist for later — not this commit):**

- [ ] Shock vs drip (Pfeffer #1 as an IV, thesis H2)
- [ ] Binary-choice ablation (Pfeffer #2)
- [ ] Cross-media / external-influence agent (Pfeffer #6)
- [ ] Four-step network-triggered decision log (Pfeffer #7)
- [ ] Empirical tweet clock / half-life (needs hydration)
- [ ] Same centrality + community algorithm on both graphs
- [ ] Preexistent-cluster activation vs spontaneous formation
- [ ] Eigenvector centrality re-estimated (Debnath quotes; we did not recompute)
- [ ] HDBSCAN BPs from 814k tweets (still theory-faithful reductions)
- [ ] FrameAuditor on as valence manipulation check
- [ ] `enableBeliefs` PolarizationMetrics (parser PI ≠ Ext. 11)
- [ ] Exp B identified (control + matched windows)
- [ ] CIKM-length hop budget (K=30) or an explicit “compressed horizon” limitation in the thesis prose
- [ ] Myers et al. external-fraction analogue
- [ ] Do **not** fill gaps by equating Debnath skip-gram windows with hops (see §5)

---

## 4. Mapping to our topologies and to MPR/MI

### 4.1 Topologies → Pfeffer factors

Phase 2 eight generators (`SocietyGraph.js`) plus D-net. n=8, `graphRandomSeed: 42`, `minSeedOutDegree: 2` on ER/echo/polarized (cascade-death guard, **not** a clustering factor).

| Topology | What the engine builds | Closest 2014 factor(s) | Honest use in the thesis |
|---|---|---|---|
| `linear_chain` | Path of 8 nodes | None as clustering contrast | **CIKM object.** Needed for climate-domain homo/hetero chain replication. Not a firestorm cluster test. |
| `ring` | Cycle | Weak #3 (regular local neighbours, no hubs) | Low-hub control. Not in Pfeffer’s cases. |
| `random_er` | Erdős–Rényi | Control for #3/#4 (low clustering) | Contrast to small-world / echo. Isolated-seed death is an engine bug class, not a finding. |
| `small_world` | Watts–Strogatz (`k`, `beta`) | #3 (paper cites Watts & Strogatz 1998) | Best **named** clustering generator relative to the paper. |
| `scale_free` | Barabási–Albert `m=2` | #4 unrestrained flow (hubs / heavy tail), not transitivity per se | Hub amplifier. Do not call BA “the Pfeffer cluster model.” |
| `echo_chamber` | Dense high-trust intra, sparse low-trust inter | #3 + #4 + #5 | Strongest **structural** analogue of the paper’s “echo from several neighbours.” Pre-wired, not emergent (proposal Exp D wanted emergence). |
| `polarized` | Two camps, few low-trust bridges | #5 lack of diversity; weak #3 | Two-cluster homophily. Bridge nodes ≠ legacy media. |
| `hierarchical` | Rooted tree, high down-trust | Not a 2014 factor | Org/authority broadcast. **Do not claim this operationalises cross-media (#6).** |
| `custom` / D-net | Imported hashtag graph | Empirical **stand-in** for #3/#5 on Debnath tags | Structural compare only. Not a retweet firestorm. |

Homo vs hetero assignment sits **on top of** topology: that is identity (#5), not clustering (#3). Mixing BPs on an echo graph is the intended joint test; network-mean MI will **dilute** if conspiracy seats drop — report node-type-conditioned MPR (`discovery/11_redteam/replication_of_cikm.md`).

### 4.2 MPR / MI (thesis instrument, not Pfeffer)

| Metric | Origin | What it is | What it is not |
|---|---|---|---|
| **MI** | Maurya et al., LASS@CIKM 2025 (arXiv:2511.10384) | LLM-as-judge factual-degradation score on a rewrite (discrete 0–5 or continuous) | Not a Pfeffer quantity. Not Twitter toxicity. Not Debnath Perspective scores. |
| **MPR** | Same CIKM paper | Propagation/severity aggregation of MI along a chain/graph | Debnath has **no** empirical MPR. Never write “simulated MPR = Twitter MPR.” |
| Severity bins | CIKM: error \|MI\|≤1; lie 1<\|MI\|≤3; propaganda \|MI\|>3 | Thesis k\* uses network-mean MI>3 with no recovery | Pfeffer never defines k\*. Gladwell “tipping point” in 2014 is a citation, not an estimator. |
| Dual IFD | Phase 2 | Discrete headline + continuous sidecar | Not a third ground truth. Dual gap ≠ validation. |

Pfeffer outcomes in 2014 are qualitative (outrage volume, media pickup, reputation). Mapping MI>3 onto “firestorm” is a **thesis operational definition**. Say so.

---

## 5. Honesty constraints (do not violate in later prose)

1. **8 hops / 8 ticks is a cost cut vs CIKM K=30**, logged in `PHASE2_PLAN.md` and `compare_phase2.js`. It is **not** a Debnath hop protocol and **not** a claim that eight steps match Twitter diffusion depth.
2. **Debnath skip-gram ≠ hops.** Debnath et al. (iScience 2023) used skip-gram + SVD **word embeddings** for semantic neighbourhoods (`discovery/06_personas/bp_mapping.md`). That window is linguistic. Simulation `maxHops` is message-forwarding depth. Do not equate them.
3. Hashtag co-occurrence is **not** a retweet cascade.
4. Toxicity mean ~0.17 is **paper-quoted Debnath**, not live Perspective on our rewrites.
5. Proposal “six factors named valence…” is a remapping error relative to the 2014 Outlook. Cite 2014 for seven names; cite this file / `pfeffer_observables.md` for knobs.
6. Author-posted PDF was used for notes only. **No full-text reprint in the repo** (`discovery/01_literature/do_not_reprint.md` is about CIKM; the same rule applies here).

### Nearby citations (verified enough to point; not this paper)

| Work | Why it sits next to 2014 | Do not conflate with |
|---|---|---|
| Pfeffer & Carley (2013), *Int. J. Innovation and Technology Management* 10(5): 1340022 | Local clusters for opinion diffusion; cited in 2014 as forthcoming | Firestorm **factor list** (that is 2014) |
| Pfeffer & Carley (2011), IEEE NSW | Interpersonal-network calibration | Firestorm definition |
| Ruths & Pfeffer (2014), *Science* 346: 1063–1064 | Platform bias for large social-media studies (proposal corpus-audit citation) | Firestorm factors |
| Debnath et al. (2023), *iScience* 26: 106166 | Climate/geoengineering empirical domain for **this** thesis | Pfeffer’s commercial cases |
| Maurya et al. (2025), LASS@CIKM, arXiv:2511.10384 | MI/MPR instrument; 30-hop chains | Pfeffer theory; Debnath skip-gram |

---

## 6. One-page mapping table (print this in Methods later)

| If the thesis sentence needs… | Cite | Do not cite as |
|---|---|---|
| Definition of online firestorm; seven named factors; #McDStories / Qantas / ING-DiBa | Pfeffer, Zorbach & Carley 2014 | “six knobs” |
| Affective charge as an IV | 2014 definition + this remapping | “Pfeffer factor valence” |
| Graph clustering / echo / homophily | 2014 #3–#5 + Watts–Strogatz / McPherson | CIKM chain results |
| Speed, half-life, shock | 2014 #1 + Fang & Huberman 2007 (if half-life is actually measured) | 8-tick sim clock |
| Like/retweet binary | 2014 #2 Schelling | Our ternary actions |
| Social ↔ TV/news loop | 2014 #6 + Myers et al. 2012 | `hierarchical` topology |
| MI, MPR, propaganda tier, k\* | Maurya et al. 2025 + thesis k\* rule | Pfeffer 2014 |
| Chemtrails / SCoPEx volume / toxicity 0.17 / skip-gram neighbours | Debnath et al. 2023 | Simulation hops |
| Hop length 8 | Cost log vs CIKM 30 | Theory-derived horizon |

**Bottom line for later chapters.** Operationalise all **seven** 2014 factors as a mapping table. Six knobs are what the engine can sweep; the seventh (cross-media) stays held unless a broadcast layer is built. Binary choice (#2) is the other silent factor. Everything else in this file is a **methods debt**, not a result.
