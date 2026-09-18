# Chapter skeleton — TUM M.Sc. thesis (English, Data & Society)

**Working title.** Operationalising Pfeffer firestorm factors in an LLM society simulation: climate geoengineering discourse after Debnath, not a CIKM reprint.

**Programme.** TUM M.Sc. (Data & Society / computational social science framing). Target **60–80 pages** of body text (front matter and appendix extra). Language: English.

**How to use this file.** Each section gives (i) a page budget, (ii) 5–10 talking points to expand into prose, (iii) which `thesisExperiment/results/` (and related) files drop in, and (iv) paste-ready methods sentences grounded in the actual CLI. Do not invent HDBSCAN on 814k tweets. Do not treat dry-run MI=0 as results. Cite CIKM as **prior system**, not as this thesis’s empirical contribution.

**Honesty banner (put in Ch1 and Ch9).** The 18 September 2026 campaign in `thesisExperiment/results/` is a **real `gpt-4o-mini` N=1 pilot** (8 nodes, 6 hop-compressed ticks, 2 climate articles, 3 Debnath-reduced BPs). `results/summary.json` sets `"thesisGrade": false`. Experiment (a) — CIKM-style homogeneous/heterogeneous **linear chains on the climate corpus** — is specified here with CLI; it is **not** in the current `results/` drop-in set. `D_echo_mix` died at tick 1 (0 LLM calls) and is unusable as an echo-chamber finding.

---

## Front matter (not numbered; ~4 pages, not in the 60–80)

- **Title page** (TUM template): title, student, supervisor (Pfeffer), advisor/examiner line, Data & Society, date.
- **Abstract (EN, ≤1 page):** climate-firestorm simulation; Pfeffer six factors as knobs; Debnath-grounded BPs without 814k hydration; four experiments (chains / k* / correction / echo); N=1 real-LLM pilot; boundary vs CIKM commercial/crime firestorms.
- **Abstract (DE)** if the TUM chair requires it — one paragraph restating the EN abstract.
- **Acknowledgements.**
- **Statutory declaration** (TUM *Ehrenwörtliche Erklärung*).
- **Contents, list of figures, list of tables, abbreviations.**

**Abbreviations to list.** MI, MPR, k*, BP, ER, BA, SAI, SCoPEx, SRM, PI, IFD, NRC, OSF.

---

## Global figure / table number plan

Use these numbers in Ch7 even if a plot is still a placeholder. When a later campaign adds heatmaps, keep the numbers and swap the file.

| ID | Caption (draft) | Drop-in file (now / later) |
|---|---|---|
| Fig. 1.1 | Thesis argument: CIKM engine → Pfeffer knobs → Debnath climate seeds | draw in Ch1; no results file |
| Fig. 3.1 | Six Pfeffer factors → engine knobs (swept / held / measured) | `thesisExperiment/pfeffer_mapping.md` (typeset as table+figure) |
| Fig. 4.1 | Two-phase pipeline (propagate, then audit) with thesis-only extensions boxed | architecture diagram; cite CIKM for unboxed core |
| Fig. 5.1 | Data lineage: public sources → articles + reduced BPs; 814k **not** in path | `thesisExperiment/data/SOURCES.md` |
| Fig. 6.1 | Design matrix: (a) chains, (b) A 2×2×2, (c) B n∈{1,3}, (d) echo | `thesisExperiment/configs/grid.json` |
| Fig. 7.1 | Homogeneous vs mixed **chain** MPR heatmap, climate corpus | **PLACEHOLDER** — not in current `results/` |
| Fig. 7.2 | Hop-wise MI trajectory on climate chains (CIKM-analogue of paper Fig. 4) | **PLACEHOLDER** — not in current `results/` |
| Fig. 7.3 | Max event MI and mean node MPR by networked condition | `thesisExperiment/results/mi_mpr_by_condition.png` |
| Fig. 7.4 | k* tick by condition (grey = no irreversible k*) | `thesisExperiment/results/kstar_by_condition.png` |
| Fig. 7.5 | Experiment B: mean event MI before vs after fact-check | `thesisExperiment/results/b_before_after.png` |
| Fig. 7.6 | Distortion-type keyword counts (Exp C heuristic) | **PLACEHOLDER plot** from `summary.md` Distortion heuristic section |
| Fig. 7.7 | Echo metrics: homophily / conspiracy-cut modularity / PI | **PLACEHOLDER plot** from `summary.md` Echo / PI table |
| Fig. 8.1 | Boundary sketch: climate vs CIKM commercial/crime firestorms | discussion figure; no new run |
| Tab. 1.1 | Research questions and chapter map | this skeleton |
| Tab. 3.1 | Pfeffer factors, knobs, campaign status | `pfeffer_mapping.md` |
| Tab. 5.1 | Seed articles, 5 QA items, sources | `thesisExperiment/articles/articles.json` |
| Tab. 5.2 | Three Debnath types → persona IDs | `data/derived/debnath_bps.md` |
| Tab. 5.3 | What was **not** downloaded (814k / OSF IDs) | `data/SOURCES.md` |
| Tab. 6.1 | Run grid actually executed | `configs/grid.json` + `results/campaign_manifest.json` |
| Tab. 7.1 | k*, MI, MPR by cell × article | `results/summary.md` first table |
| Tab. 7.2 | B before/after MI | `results/summary.md` Experiment B table |
| Tab. 7.3 | Echo / PI | `results/summary.md` Echo table |
| Tab. 7.4 | Distortion heuristic counts | `results/summary.md` Distortion section |
| Tab. A.1 | Config inventory | `thesisExperiment/configs/` |
| Tab. A.2 | LLM usage and list-price cost | `results/summary.md` LLM usage + `campaign_manifest.json` |
| Tab. A.3 | Seeds and held knobs | `pfeffer_mapping.md` + configs |

---

# Chapter 1 — Introduction (~8 pages)

## 1.1 Motivation: climate firestorms, not generic “fake news”

- Climate geoengineering discourse is a **firestorm** setting (Pfeffer): high valence, identity-loaded, clustered networks, echo, and temporal bursts — not a one-shot rumour.
- Debnath, Reiner, Sovacool et al. (*iScience* 2023) show #geoengineering Twitter (2009–2021, 814,924 English tweets) is **chemtrails-dominated**, with a volume shock around Harvard **SCoPEx** (April 2017) and a 2018–2021 broadening (toxicity up; climate-justice piggyback; weaponization; depopulation).
- That empirical paper is **observational Twitter**. This thesis asks whether an **LLM-agent society** can *operationalise* the same identities and seeds as a controllable experiment.
- Policy stake: SAI/SCoPEx is a small paused science programme; public talk treats it as covert spraying. Distortion here is not “entertainment clickbait.”
- TUM Data & Society angle: computational method + social-theory factors (Pfeffer) + empirical climate discourse (Debnath).

## 1.2 Gap: CIKM engine exists; climate-firestorm evaluation does not

- **Prior system (cite, do not reprint):** Maurya et al., CIKM 2025 outstanding paper — LLM nodes, linear chain, QA auditor, MI/MPR, commercial/crime-style articles (`crime_0`, Young Parent-class news). Engine lives in this repo (`index.js`, `src/`).
- CIKM empirical object is **linear-chain commercial/crime news**, 5 nodes, heterogeneous personas. That is the **last paper**, not this thesis.
- Gap 1: no Pfeffer-factor *knobs* (valence, surprise, identity, clustering, echo, temporal acceleration) in that evaluation.
- Gap 2: no Debnath climate BPs or SCoPEx/chemtrails seeds.
- Gap 3: networked k* (irreversible propaganda on graphs) was not the CIKM claim.
- Gap 4: belief-correction timing (`fact_checker_injection` after n exposures) not evaluated on climate seeds.
- State clearly: **this thesis is not a CIKM reprint** (`thesisExperiment/README.md`).

## 1.3 Research questions

Paste **Tab. 1.1** (expand each RQ into one paragraph after the table).

| ID | Question | Experiment | Success criterion (honest) |
|---|---|---|---|
| **RQ1** | On a **linear chain** with the *new climate corpus*, how do **homogeneous** conspiracy BPs vs **heterogeneous** (mixed 3 Debnath BPs) change hop-wise MI and node MPR — the CIKM comparison, new domain? | (a) chains | Directional: hom > mix MPR; hop-rise on conspiracy nodes. N=1 until replicated. |
| **RQ2** | On **networks**, which topology × identity mix × seed valence produces irreversible **k\*** (first tick with network-mean MI>3 and no later recovery)? | (b) A | k* defined in `parse_results.js`; report even when k*=none. |
| **RQ3** | After **n∈{1,3}** chemtrails exposures, does **fact-check injection** of the original article recover MI? | (c) B | Before/after means **and** the cascade-volume confound. |
| **RQ4** | Does **echo** (measured homophily / conspiracy-cut modularity / PI, plus an `echo_chamber` cell) concentrate propaganda in the conspiracy subset when mixed BPs buffer the mean? | (d) D | PI on mixed graphs; do **not** interpret the dead `D_echo_mix` cell as a negative result. |

**Optional umbrella RQ0 (one sentence in 1.3, answered in Ch8).** Can Pfeffer’s six firestorm factors be encoded as simulation knobs (swept / held / measured) rather than post-hoc narrative?

## 1.4 Contributions (claim only these)

- **C1.** Pfeffer six-factor **operationalisation** as config knobs + status table (`pfeffer_mapping.md`).
- **C2.** Climate seed pack + Debnath-**reduced** BPs, with an explicit **no-814k** limitation (not a fake HDBSCAN).
- **C3.** Four-experiment protocol on the existing CIKM engine: (a) chain analogue, (b) networked k*, (c) correction, (d) echo metrics.
- **C4.** Boundary discussion: climate conspiracy firestorms vs CIKM commercial/crime chains.
- Non-claims: not a Twitter digital twin; not 814k clustering; not EMNLP bot-resilience / FakeNewsNet chapters.

## 1.5 Thesis structure (one paragraph + pointer)

- Ch2 related work → **`thesisExperiment/discovery/01_literature/`** (do not duplicate a second bibliography here).
- Ch3 Pfeffer operationalisation; Ch4 system (CIKM prior + thesis extensions only); Ch5 data; Ch6 methods; Ch7 results; Ch8 discussion; Ch9 limitations/ethics/open-source; Ch10 conclusion; Appendix configs/prompts/cost/seeds.

**Drop-in for Ch1.** `thesisExperiment/README.md` (one-page campaign fact sheet); `results/findings.md` last paragraph for the “what an examiner can accept” sentence. No plots yet except Fig. 1.1 (drawn).

---

# Chapter 2 — Related work (~10 pages)

**Instruction.** Write this chapter by **expanding notes in `thesisExperiment/discovery/01_literature/`**. This skeleton only lists the section order and what the student must *connect* to RQs. Do not start a parallel literature pile in `07_chapters/`.

## 2.1 Computational social science of rumours, cascades, and firestorms

- Classical cascade models (independent cascade, structural virality) vs **content-mutating** LLM rewrites.
- Pfeffer firestorm factors as the theoretical spine (detail in Ch3; here: who said what, what is missing empirically).
- Why “firestorm” ≠ “fake-news classification paper.”

## 2.2 Climate misinformation and geoengineering publics (Debnath line)

- Debnath et al. 2023: 814,924 tweets, chemtrails dominance, SCoPEx 2017 shock, 2018–2021 spillover.
- Adjacent: SAI governance, SCoPEx cancellation (Harvard Salata 2024) — facts used as auditor ground truth, not as Twitter replication.
- Conspiracy studies (chemtrails, HAARP) at the level needed to justify BPs — not a history of every theory.

## 2.3 LLM agents as simulated societies

- CIKM 2025 outstanding paper (Maurya et al.): method + **crime/tech news** findings. Cite as **prior**.
- Other LLM-agent social sims (position this thesis as **evaluation on climate firestorms**, not as a new general agent framework).
- Limits of LLM personas as “belief profiles” (sycophancy, prompt-following vs stubborn identities).

## 2.4 Network structure, homophily, echo chambers

- BA hubs vs ER null vs stochastic-block echo chambers — the three topologies this thesis actually uses (`scale_free`, `random_er`, `echo_chamber`).
- Homophily and modularity as **measurements** (Exp D), not just metaphors.
- Polarisation index as a between-group MPR gap (this campaign’s PI), vs richer PI in unused EMNLP polarisation cycles.

## 2.5 Corrections, inoculation, backfire

- Fact-check timing literature → justifies Exp B n=1 vs n=3.
- Distinguish **engine feature** (`fact_checker_injection` in `src/InterventionEngine.js`) from **thesis finding** (confounded before/after).
- Inoculation and content_moderation exist in the engine; **this thesis does not run them** (say so, one sentence).

## 2.6 Positioning paragraph (end of Ch2)

- CIKM: chain + commercial corpus. Debnath: observational Twitter. Pfeffer: factors without an LLM testbed.
- This thesis: **Pfeffer knobs + Debnath-reduced identities + climate seeds + networked k\*** on the CIKM engine.

**Drop-in.** Whatever annotated bib / notes live under `thesisExperiment/discovery/01_literature/`. Cross-link `data/derived/debnath_iscience_notes.txt` and `data/derived/debnath_paper_slice.json` for empirical claims about the 2023 paper.

---

# Chapter 3 — Pfeffer operationalisation (~8 pages)

**Goal.** Examiners should see that the six factors are **not a literature review leftover** but a design table with knobs and a swept/held/measured status.

## 3.1 The six factors (theory → one paragraph each)

Use `pfeffer_mapping.md` as the source of truth.

1. **Valence** — emotional charge. Operationalised as seed wording (calm SCoPEx vs toxic chemtrails–Gates) plus persona `emotionalTone` (`alarming` / `urgent` / `cautious`). FrameAuditor off (cost). Status: **varied** via 2 seeds + BP tone; no third “extra-toxic rewrite” cell.
2. **Surprise** — volume shock vs drip. Operationalised as `seedNodes: ["node_0"]` only. Status: **held** (drip). Seeding all nodes at t=0 would be the shock cell; **not run** (cost).
3. **Identity alignment** — message–identity fit. Operationalised as `homogeneous_conspiracy.json` vs `mixed_three_bp.json`, plus homophily-weighted trust. Status: **swept**.
4. **Network clustering** — hubs vs random vs bubbles. Operationalised as `topology: scale_free` (BA `m=2`) vs `random_er` (`p=0.42`, `graphRandomSeed=42`, `minSeedOutDegree=2`) vs extra `echo_chamber`. Status: **swept** (echo extra failed).
5. **Information echo** — closed-group repetition. Operationalised as `relationEvolution: true`, `trustDelta: 0.05`; **measured** as edge homophily, conspiracy-cut modularity, Gini of MI, last-tick PI. Echo topology would *sweep* this factor; the extra cell died.
6. **Temporal acceleration** — runaway speed. Operationalised as `maxTicks=6`, `maxHops=6`, `activityPattern: "always"`, `maxInboxSize=4`. Status: **held** at hop compression vs a 15-tick proposal.

## 3.2 Mapping table (Tab. 3.1 / Fig. 3.1)

- Typeset the table from `thesisExperiment/pfeffer_mapping.md` in thesis style.
- Add a column “Which RQ?” (valence→RQ2; identity→RQ1/RQ2; clustering→RQ2/RQ4; echo→RQ4; surprise/temporal→limitations).

## 3.3 k* as the firestorm clock

- Severity bands (engine, CIKM-compatible): MI ≤ 1 factual error; 1 < MI ≤ 3 lie; **MI > 3 propaganda** (`README.md` Misinformation Index table; `Auditor.severity`).
- **Network k\*** (thesis metric, `parse_results.js` `irreversibleKStar`): first tick where **network-mean MI > 3** and mean MI stays > 3 on all later ticks with data; if it later falls ≤ 3, k* is **none** and `recovered=true`.
- Node-level k* (first irreversible node propaganda) is reported as secondary (`kStar_firstIrreversibleNode` / hop).
- k* is a **clock**, not a classifier of “is this Twitter?”

## 3.4 What this operationalisation refuses

- No claim that 6 ticks equal Debnath’s 2009–2021 timeline.
- No claim that `toxicityPrior: 0.17` is a live Perspective API.
- Surprise and temporal acceleration are **held**; do not write as if they were swept.

**Drop-in.** `thesisExperiment/pfeffer_mapping.md`; k* definition from `thesisExperiment/scripts/parse_results.js` (functions `irreversibleKStar`, `firstIrreversibleNodePropaganda`); severity from `src/Auditor.js` `severity()`.

### Paste-ready methods sentences (Ch3)

> We treat Pfeffer’s six firestorm factors as config-level knobs rather than post-hoc labels. Each factor is marked swept, held, or measured in the run JSON (`pfeffer` block in `thesisExperiment/configs/A_*.json`). Identity alignment is swept by swapping `personasPath` between `thesisExperiment/personas/homogeneous_conspiracy.json` and `mixed_three_bp.json`. Network clustering is swept by `topology` `scale_free` (Barabási–Albert `m=2`) versus `random_er` (`edgeProbability=0.42`, `graphRandomSeed=42`, `minSeedOutDegree=2`). Valence is varied by the two seed articles `scopex_2017` and `chemtrails_gates_2018_2021`. Surprise is held as a drip seed (`seedNodes: ["node_0"]`). Temporal acceleration is held at hop compression (`maxTicks=6`, `maxHops=6`, `activityPattern: "always"`, `maxInboxSize=4`). Information echo is measured on the last-tick graph (edge homophily, conspiracy-cut modularity) and on node MPR (polarisation index = |mean MPR_conspiracy − mean MPR_other|).

> Irreversible k* is the first tick at which network-mean MI exceeds 3 (propaganda) and does not return to ≤ 3 on any later tick with data, as implemented in `thesisExperiment/scripts/parse_results.js`.

---

# Chapter 4 — System (~8 pages)

**Rule.** Cite **CIKM 2025 as the prior system**. List **only new thesis-layer extensions**. Do not narrate unused EMNLP layers (bots, digital twin, polarisation cycles, IFD continuous, institutional trust, Society DSL) except a one-line “present in `index.js`, not used.”

## 4.1 Prior system (CIKM) — cite, then stop

Talking points (keep to ~2 pages):

- Each node is a persona-conditioned LLM agent; actions: forward / reinterpret / drop (dump unused here).
- Two-phase execution: **propagation first, batch audit second** (`README.md`; `index.js` entry `node index.js --config …`).
- Auditor: five binary QA items; discrete MI = (# missing) + (# incorrect) on {+1, 0, −1} scores (`src/Auditor.js` `computeIFD`, `miScoringMode: "discrete"`).
- MPR = mean MI over a node’s scored history (`Auditor.computeMPR`).
- Linear chain is the **CIKM topology** (`examples/run_linear_chain.json`: 5 nodes, `crime_0` / `technology_0`).
- File-backed JSON runs; resume via `node index.js --resume <dir>`.
- Dry-run exists (`--dry-run`) and **must not** be reported as MI results.

**Do not** fill Ch4 with the nine-topology catalogue or 26 stock personas. Those are engine background.

## 4.2 Thesis-only extensions (ONLY these)

Number as 4.2.1 … so examiners can tick them.

1. **Climate article pack + path override.** `articlesPath: "thesisExperiment/articles/articles.json"` (not repo-root `articles/articles.json`). Two seeds with 5 QA + `groundTruth` each.
2. **Debnath-reduced personas + path override.** `personasPath` → `homogeneous_conspiracy.json` or `mixed_three_bp.json`. Sequential assignment (`defaultPersonaAssignment: "sequential"`); echo cell uses `by_cluster`.
3. **Pfeffer block in configs.** Documentation of swept/held/measured per run (`pfeffer: { … }` in A_*.json and D_echo_mix.json).
4. **Seeded ER + min seed out-degree.** `graphRandomSeed` + `topologyParams.minSeedOutDegree=2` so `node_0` cannot have out-degree 0 (cascade-death fix; `pfeffer_mapping.md`). Homophily-weighted ER trust in engine.
5. **Campaign runner.** `node thesisExperiment/scripts/run_campaign.js --probe-only | --real` wraps `node index.js --config <cell>` with logs under `results/logs/` and `results/campaign_manifest.json`. Probe is a 2-node `linear_chain` on `scopex_2017` (`configs/_probe_api.json`).
6. **k* and echo/PI parser.** `node thesisExperiment/scripts/parse_results.js` — not part of CIKM.
7. **Distortion keyword taxonomy (Exp C).** Heuristic regexes in `parse_results.js` `DISTORTION_TYPES` + `climate_justice_hijack`. **Not a trained classifier.**
8. **Hop-compressed firestorm protocol.** 8 nodes, 6 ticks/hops, inbox 4, reinterpret weight 0.50 — a *protocol*, not a new module.
9. **Climate-targeted fact-check cells.** Same `interventions[].type = "fact_checker_injection"` as the engine, **new** in the sense of climate configs `B_sf_mix_n1.json` / `B_sf_mix_n3.json` (tick 1 vs 3, `correctionStrength: 0.9`).
10. **Plots script.** `python thesisExperiment/scripts/plot_results.py` → Fig. 7.3–7.5.

**Explicitly not thesis contributions (one paragraph):** `--bot-resilience`, `--digital-twin`, `--polarization*`, `--ab-test` Cohen’s d grids on crime articles, continuous/dual IFD, `enableBeliefs`, strategic agents. They remain in `index.js` for the prior papers.

## 4.3 What a run writes (so Ch7 can cite paths)

- `thesisExperiment/runs/<experimentName>_<timestamp>/`: `metadata.json`, `graph_topology.json`, `state.json`, `nodes/node_*.json`, `results_<articleId>.json`, `human_eval_template.csv`.
- Campaign aggregation: `results/summary.json`, `summary.md`, `findings.md`, `campaign_manifest.json`, three PNGs.

**Drop-in.** `index.js` header comment (CLI inventory); `thesisExperiment/README.md` “How to rerun”; `ARCHITECTURE.md` only for the CIKM core citation, not as a feature dump.

### Paste-ready methods sentences (Ch4)

> All cells are executed through the existing CIKM engine entry point. From the repository root: `node index.js --config <config.json>`. The thesis campaign additionally probes the live API and then loops Experiment A/B/D configs with `node thesisExperiment/scripts/run_campaign.js --real`, which spawns `node index.js --config …` (see `run_campaign.js` `runCli`). A failed probe (`OPENAI_API_KEY` placeholder, HTTP 401/403, or missing `[Simulation] Done`) aborts real mode and refuses to invent LLM results.

> Discrete MI follows the CIKM auditor: five questions, scores in {+1, 0, −1}, `mi = missingCount + incorrectCount` (`src/Auditor.js`, `miScoringMode: "discrete"` in every thesis config). Propaganda is MI > 3. Model and auditor are both `gpt-4o-mini`.

> Fact-check interventions call the engine’s `InterventionEngine`: at the configured tick, every target node receives the original article text prefixed with `[FACT CHECK] …` and `injectedTrust = correctionStrength` (0.9 in B cells). We do not run `inoculation` or `content_moderation`.

---

# Chapter 5 — Data (~6 pages)

## 5.1 Corpus philosophy

- **Public, citable, small.** Articles are written from Harvard SCoPEx pages, Wikipedia chemtrails/SAI, AGU 2017 abstract, Debnath paper claims — not scraped tweet text.
- Two seeds match Debnath’s two temporal poles: **April 2017 SCoPEx launch** vs **2018–2021 chemtrails–Gates broadening**.
- ClimateFEVER slice exists (`data/derived/climatefever_slice.json`) and was **unused in the A grid** (`SOURCES.md`). Say so.

## 5.2 Articles (Tab. 5.1)

From `thesisExperiment/articles/articles.json`:

| id | Domain | Role in Pfeffer valence | QA n | `groundTruth` |
|---|---|---|---|---|
| `scopex_2017` | `climate_geoengineering` | Calm factual measurement experiment (not deployment); CaCO3 grams–kg; Sweden 2021 hardware-only; 2024 halt | 5 | `[true, false, true, false, true]` |
| `chemtrails_gates_2018_2021` | `climate_misinformation` | High-valence conspiracy object + scientific rebuttal of chemtrails; Debnath 814k cited **as a fact in the seed**, not as hydrated data | 5 | `[false, true, true, true, false]` |

- Expand: quote the five questions in an appendix table, not necessarily in Ch5 body.
- Sources listed in each article’s `sources` array (Keutsch group, Salata 2024, ADS/AGU, Wikipedia, Debnath DOI, Mendeley landing).

## 5.3 Belief profiles (Tab. 5.2) — theory-faithful, not HDBSCAN

From `data/derived/debnath_bps.md`:

| Debnath type | Persona id | Tone | Centrality in prompt | Mix file |
|---|---|---|---|---|
| Chemtrails conspiracy (dominant) | `conspiracy_believer` | `alarming` | high-centrality amplifier | both |
| Climate action / justice (smaller) | `climate_action_advocate` | `urgent` | ordinary citizen | mixed only |
| Environmental concern (Fig. 4 non-conspiracy) | `environmental_concern` | `cautious` | specialist, not hub | mixed only |

- Prompt features taken from Ramit1201/geoeng **codes** (NRC labels, hashtag regex, Perspective means as `toxicityPrior`) — **not** from labelled tweets (`debnath_bps.md`).
- Homogeneous condition: 8 nodes, **one** persona cycled sequentially → all conspiracy.
- Mixed condition: 3 personas sequential on 8 nodes → pattern advocate / environmental / conspiracy / … (state actual assignment from a `nodes/node_*.json` if needed).

## 5.4 Limitation of no-814k (Tab. 5.3) — do not bury

- Mendeley `10.17632/546hsym93p.1` is **tweet IDs**, not text; landing HTML only.
- OSF `osf.io/75ye3` `dataset.csv` ≈ **662 MB IDs**; not downloaded this campaign (`SOURCES.md` fallback 1 and 6).
- Hydration would still need a Twitter/X API. **No fake HDBSCAN.**
- `data/derived/debnath_paper_slice.json` is **paper-quoted** toxicity/hashtags/semantic neighbours — a style exemplar, **not** a cascade graph.
- GitHub `data/debnath_geoeng/*` = NRC / embeddings / hashtag / Perspective **scripts**, not the dump.
- Therefore BPs are **reduced types** from the paper’s three discourse streams. External validity claim is “theory-faithful personas,” not “cluster centroids.”

## 5.5 Download reproducibility

- `node thesisExperiment/scripts/download_public_data.js` — small public files only; script header: “no 814k tweet dump.”
- Document 403/401 fallbacks: Cell Press vs PMC HTML; ADS without token → `raw/agu_2017_scopex_abstract.txt`; ClimateFEVER dataset rename (`tdiggelm/climate_fever`).

**Drop-in.** `thesisExperiment/articles/articles.json`; `personas/*.json`; `data/SOURCES.md`; `data/derived/debnath_bps.md`; `data/derived/debnath_paper_slice.json`; `data/derived/debnath_iscience_notes.txt`.

### Paste-ready methods sentences (Ch5)

> Seed texts and five-item auditor keys live in `thesisExperiment/articles/articles.json` and are loaded via `articlesPath` in every campaign config. We did not use the repository’s CIKM articles (`crime_0`, `technology_0`, …). Public sources were retrieved with `node thesisExperiment/scripts/download_public_data.js` and inventoried in `thesisExperiment/data/SOURCES.md`.

> We did not download or cluster Debnath’s 814,924 tweets. The public Mendeley/OSF artefacts are tweet-ID lists (OSF `dataset.csv` is on the order of 662 MB). Belief profiles are theory-faithful reductions of the three discourse types in Debnath et al. (iScience 2023), documented in `thesisExperiment/data/derived/debnath_bps.md`, not Skip-gram/HDBSCAN centroids.

---

# Chapter 6 — Experiments (~8–10 pages)

Open with Fig. 6.1 and Tab. 6.1. Then four subsections matching the target design: **(a) chains, (b) networked k\* A, (c) belief-correction B, (d) echo D**. Shared protocol first.

## 6.0 Shared protocol (all cells)

- Nodes 8; ticks 6; `maxHops` 6; `maxInboxSize` 4; `trustThreshold` 0.15; `actionWeights` forward 0.35 / reinterpret 0.50 / drop 0.15; `relationEvolution` true; `trustDelta` 0.05; `activityPattern` `"always"`; `graphRandomSeed` 42; models `gpt-4o-mini`; `miScoringMode` `"discrete"`; **N = 1**.
- Seed always `node_0` (drip).
- Output root `thesisExperiment/runs`.
- After runs: `node thesisExperiment/scripts/parse_results.js` then `.\.venv\Scripts\python.exe thesisExperiment/scripts/plot_results.py`.

### Paste-ready rerun block (put in 6.0 or Appendix)

```powershell
# From repo root F:\SocietySimulation_MasterThesis
# Requires a non-placeholder OPENAI_API_KEY in .env (never commit .env)

node thesisExperiment/scripts/run_campaign.js --probe-only
node thesisExperiment/scripts/run_campaign.js --real
node thesisExperiment/scripts/parse_results.js
.\.venv\Scripts\python.exe thesisExperiment/scripts/plot_results.py
```

Flags actually implemented (`run_campaign.js`): `--dry-run`, `--real`, `--probe-only`, `--skip-b`, `--skip-extra`. Extra (D) is skipped if any Experiment A cell fails.

---

## 6.1 (a) Homogeneous / heterogeneous chains on the **new climate corpus**

**This is the CIKM last-paper comparison, new domain.** CIKM: linear chain of 5 nodes, 21 heterogeneous personas, 5 commercial/crime articles (`README.md` “Reproducing Paper Results”). Thesis: same **topology idea**, Debnath BPs, climate articles.

Talking points:

- Topology: `linear_chain` (A→B→C→…), `seedNodes: ["node_0"]`, climate `articlesPath` / `personasPath`.
- **Homogeneous chain:** all nodes `conspiracy_believer` (`homogeneous_conspiracy.json`), sequential assignment.
- **Heterogeneous chain:** mixed 3 BPs (`mixed_three_bp.json`), sequential cycling.
- Outcomes: hop-wise MI, node MPR, severity; analogue of CIKM Figs. 3–4 (heatmap + MI trajectory) as **Fig. 7.1–7.2**.
- Probe already used a **2-node** climate chain (`run_campaign.js` `probeRealApi`, `topology: "linear_chain"`, `numNodes: 2`, `maxTicks: 1`, `seedArticles: ["scopex_2017"]`) — that is an **API probe**, not Exp (a).
- **Current `results/` does not contain a full H/He chain grid.** `thesisExperiment/LOG.md` records a planned larger H/He campaign; until those runs exist, Ch7.1 is a placeholder and the student must not fill MI from the 2-node probe (node MPR 0.00 on probe is not a chain result).
- If chain configs are added, follow CIKM CLI, **not** `run_campaign.js` grid (grid.json currently lists only A/B/D):

```powershell
# Pattern (CIKM entry point, climate files). Adjust numNodes/maxTicks to the logged protocol.
node index.js --config thesisExperiment/configs/<H_chain_hom>.json
node index.js --config thesisExperiment/configs/<He_chain_mix>.json

# Optional CIKM-style A/B wrapper (engine supports it; not used in the 18 Sep campaign):
# node index.js --ab-test --base <H_chain_hom.json> --variant <He_chain_mix.json> --runs 1
```

- Compare **qualitatively** to CIKM crime_0 chains in Ch8 (boundary), never by concatenating those old numbers into Tab. 7.1.

### Paste-ready methods sentences (6.1)

> Experiment (a) repeats the CIKM homogeneous-versus-heterogeneous **linear-chain** contrast on the climate corpus. The engine topology is `linear_chain` (`index.js --config`, same constructor as `examples/run_linear_chain.json`), but `articlesPath` and `personasPath` point at `thesisExperiment/articles/articles.json` and the Debnath-reduced persona files. Homogeneous chains assign only `conspiracy_believer`; heterogeneous chains cycle the three Debnath types. We do not report the campaign API probe (2 nodes, 1 tick, `configs/_probe_api.json`) as a chain experiment.

---

## 6.2 (b) Networked k* — Experiment A

Talking points:

- 2 topologies × 2 BP mixes × 2 articles, N=1, listed in `configs/grid.json` `experimentA`.
- Cells: `A_sf_hom`, `A_sf_mix`, `A_er_hom`, `A_er_mix` (configs with those filenames).
- Scale-free: `topology: "scale_free"`, `topologyParams: { numNodes: 8, m: 2 }`.
- ER: `topology: "random_er"`, `edgeProbability: 0.42`, `minSeedOutDegree: 2`, `graphRandomSeed: 42`.
- Articles run **sequentially** in one process (`seedArticles: ["scopex_2017", "chemtrails_gates_2018_2021"]`).
- Primary DV: network k*; secondary: max event MI, mean/max MPR, event counts, Gini, structural virality (printed by `index.js` `printSummary`).
- ER cascade-death rationale: unseeded `Math.random()` ER can isolate `node_0`; mixed-ER × chemtrails still died after 1 event **even with the fix** (N=1 stochastic drop) — discuss in Ch7/Ch9, do not hide.

### Paste-ready methods sentences (6.2)

> Experiment A is a 2×2 factorial on topology (scale-free BA m=2 vs seeded ER p=0.42) and identity mix (homogeneous conspiracy vs mixed three BPs), crossed with two climate seeds, N=1. Cells are `thesisExperiment/configs/A_{sf|er}_{hom|mix}.json` and are launched by `node thesisExperiment/scripts/run_campaign.js --real`, which calls `node index.js --config` for each path in `configs/grid.json`. k* is computed post hoc by `node thesisExperiment/scripts/parse_results.js` from `metrics.networkMIOverTime`.

---

## 6.3 (c) Belief-correction — Experiment B

Talking points:

- Topology × mix held at **scale-free × mixed**; article **chemtrails only**.
- `n` = number of ticks of conspiracy-prone exposure **before** injection: n=1 → inject at tick 1 (`B_sf_mix_n1.json`); n=3 → inject at tick 3 (`B_sf_mix_n3.json`). `n=5` **not run**.
- Intervention JSON:

```json
"interventions": [{
  "type": "fact_checker_injection",
  "tick": 1,
  "articleId": "chemtrails_gates_2018_2021",
  "params": { "correctionStrength": 0.9 }
}]
```

- Parser split: `miBeforeAfter` uses `ev.tick < splitTick` vs `>= splitTick` (`parse_results.js`).
- **Pre-register the confound:** most scored events occur in late ticks, so mean MI after injection is dominated by cascade **volume**, not by correction success. Ch7 must report n_before / n_after (Tab. 7.2: n1 has 0 events before).

### Paste-ready methods sentences (6.3)

> Experiment B holds topology and mix at scale-free × mixed three BPs and varies only the fact-check tick on `chemtrails_gates_2018_2021`. Configs `B_sf_mix_n1.json` and `B_sf_mix_n3.json` set `interventions` to `fact_checker_injection` at tick 1 or 3 with `correctionStrength` 0.9. Before/after mean MI is an event-level split at that tick (`parse_results.js` `miBeforeAfter`), not a paired per-node recovery curve.

---

## 6.4 (d) Echo — Experiment D

Talking points:

- **Measured on A/B graphs** (no extra run required): edge homophily, conspiracy-cluster homophily, conspiracy-cut modularity, PI (`graphEchoMetrics`, `polarizationIndex`).
- **Swept extra cell:** `configs/D_echo_mix.json` — `topology: "echo_chamber"`, 2 chambers, `intraEdgeProb=0.75`, `interEdgeProb=0.08`, `intraTrust=0.85`, `interTrust=0.15`, `defaultPersonaAssignment: "by_cluster"`, chemtrails only.
- Grid includes it under `experimentExtra`; campaign runs extra only if all A cells exit 0.
- **Outcome of the 18 Sep extra cell:** 1 event, 0 LLM calls, seed drop at tick 1 — **unusable**. Do not interpret as “echo chambers suppress firestorms” (`findings.md`, `summary.md`).
- Homophily = 1.0 on homogeneous graphs is **tautological**; PI undefined/— when there is no “other” group.

### Paste-ready methods sentences (6.4)

> Echo is primarily a measurement layer on Experiment A/B graphs: last-tick `graph_topology.json` yields edge homophily (same `personaId` on an edge) and a two-block modularity on the conspiracy vs non-conspiracy cut; PI is the absolute gap in mean MPR between those groups (`parse_results.js`). An additional cell `D_echo_mix.json` sets `topology` to `echo_chamber` with two chambers and `by_cluster` persona assignment. That extra cell is reported as a failed seed drop (0 LLM calls in `campaign_manifest.json`) and is excluded from substantive echo claims.

---

## 6.5 Experiment C (nested; not a fourth run)

- Keyword tags on rewrite `contentOut` into six Debnath-linked types (`debnath_bps.md`; `parse_results.js` regexes).
- Types: `spraying_chemtrails`, `weather_haarp`, `weaponization`, `depopulation`, `climate_justice_hijack`, `antivax_spillover`.
- One paragraph in methods; results as Tab. 7.4 / Fig. 7.6. Stress **heuristic, not classifier**.

**Drop-in for all of Ch6.** `configs/grid.json`; each `configs/*.json`; `results/campaign_manifest.json` (commands, timestamps, `mode: "real"`); `results/logs/*.log` only if quoting a console line (e.g. `[Intervention] fact_checker_injection`).

---

# Chapter 7 — Results (~12 pages)

**Voice.** N=1, directional, no p-values. Lead with what **can** be claimed (`findings.md`). Every subsection names the drop-in file.

**Validity sentence (first paragraph of Ch7).**  
The numbers below are a real-LLM pilot (`gpt-4o-mini`, N=1, 8 nodes, 6 hop-compressed ticks). They are **not** thesis-grade confirmation (`summary.json` `"thesisGrade": false`). Earlier dry-run MI=0 series are invalid and are not plotted.

---

## 7.1 (a) Chain analogue — Fig. 7.1, Fig. 7.2

- **Status:** PLACEHOLDER until H/He climate-chain runs exist under `thesisExperiment/runs/` and are parsed into `results/`.
- Talking points to fill later: hop 0–k MI for hom vs mix; which persona inflates MPR on mixed chains; whether SCoPEx stays more factual than chemtrails on the *same* chain.
- Do **not** substitute networked Tab. 7.1 for chain figures.
- Do **not** use `probe_api` MPR=0 as a result.

**Drop-in (when present).** New rows in `results/summary.json`; optional `visualize.py` plots 02/05 from a chain run dir; or a dedicated heatmap PNG in `results/`.

---

## 7.2 (b) Networked k* — Tab. 7.1, Fig. 7.3, Fig. 7.4

Talking points (already supported by files):

- **Headline cell:** homogeneous conspiracy × chemtrails × scale-free: **k\*=1**, mean MPR ≈ 4.16, no recovery (`summary.md` row `A_sf_hom` / `chemtrails_gates_2018_2021`).
- Same graph, factual SCoPEx: mean MI>3 at tick 4 then **recovered** (k\*=none) — valence contrast on identical identity+topology.
- Mixed BPs buffer **network-mean** k*: `A_sf_mix` never irreversible k* on either article; chemtrails still hits mean MI>3 at tick 3 then recovers.
- Mixed graphs still show **node** propaganda on conspiracy IDs (e.g. MPR ≈ 3.6) vs lie-band climate/environment nodes (≈ 2.2–2.5) — preview of RQ4.
- Seeded ER + homogeneous: irreversible k* (SCoPEx k\*=2, chemtrails k\*=3) but **fewer events** than scale-free.
- `A_er_mix` × chemtrails: **1 event, MI=0** — N=1 drop; sibling `A_er_mix` × SCoPEx ran 75 events. Do not conclude “ER prevents propaganda.”
- Max event MI = 5 appears in many cells: the auditor **can** saturate; k* is about *staying* there at the **mean**.

**Drop-in.** `results/summary.md` table “k*, MI, MPR by condition”; `results/summary.json` `rows`; `results/mi_mpr_by_condition.png` → **Fig. 7.3**; `results/kstar_by_condition.png` → **Fig. 7.4**; `results/findings.md` paragraphs 2–4; per-cell `runs/A_*/results_*.json` if quoting a node.

**Caption drafts.**

- *Fig. 7.3.* Max event MI and mean node MPR by condition and article. Red dashed line: propaganda threshold MI=3. Source: `plot_results.py` on `summary.json`.
- *Fig. 7.4.* Irreversible network k* (tick). Grey bars: no k*. Source: same.

---

## 7.3 (c) Belief correction — Tab. 7.2, Fig. 7.5

Talking points:

- n=1: split tick 1; **n before = 0**; mean MI after ≈ 2.65 (103 events). No pre-period.
- n=3: mean MI before ≈ 1.14 (7 events) vs after ≈ 2.15 (104 events) — after is **higher**, opposite of a naive recovery story, consistent with **volume confound**.
- Descriptive endpoint: n=3 max MPR = 3.00 (no node-mean propaganda) vs n=1 max MPR = 3.83 — a **hint**, not a dose–response law (`findings.md`).
- Do not average B with A_sf_mix as if n=0 were a third arm unless you define it carefully (A_sf_mix chemtrails is a different random draw).

**Drop-in.** `results/summary.md` “Experiment B: MI before vs after fact-check”; `results/b_before_after.png` → **Fig. 7.5**; B logs if quoting `[Intervention] fact_checker_injection @ tick …`.

---

## 7.4 (d) Echo and PI — Tab. 7.3, Fig. 7.7

Talking points:

- Homogeneous homophily = 1.0 (tautology); PI = —.
- Mixed scale-free homophily ≈ 0.31; mixed ER ≈ 0.42; PI ≈ 1.3–1.4 on mixed scale-free (distortion in conspiracy subset **without** swapping topology).
- Conspiracy-cut modularity **higher** on homogeneous graphs because there is only one community — do not celebrate that as “more echo.”
- `D_echo_mix`: homophily 0.9 but **0 LLM calls** — report as failed cell, exclude from interpretation.
- B_n3 PI ≈ 0.95 vs B_n1 ≈ 1.51 — mention as descriptive only.

**Drop-in.** `results/summary.md` “Echo / PI”; `summary.json` echo/polarization fields; **Fig. 7.7** to be drawn from that table (not yet a PNG).

---

## 7.5 Distortion heuristic (C) — Tab. 7.4, Fig. 7.6

Talking points:

- Homogeneous SCoPEx rewrites: almost all tagged `spraying_chemtrails` + `weather_haarp` (schema violation of a scientific seed).
- Homogeneous chemtrails: those tags plus **depopulation** (90/102 on A_sf_hom).
- Mixed chemtrails: high `climate_justice_hijack` (79/99 on A_sf_mix) — Debnath 2018–2021 piggyback, **keyword overlap**.
- `A_er_mix` chemtrails nTexts=0; `D_echo_mix` nTexts=0.
- Antivax spillover counts are low/absent in the printed summary — do not overclaim spillover.

**Drop-in.** `results/summary.md` “Distortion heuristic (Exp C)”; regexes in `scripts/parse_results.js` (cite in methods, not in the figure).

---

## 7.6 Cost and validity box (short; full table in Appendix)

- Campaign LLM usage lines in `summary.md`: A_sf_hom $0.0372 … D $0; README headline **~$0.15** list-price heuristic.
- `campaign_manifest.json` `mode: "real"`, `finishedAt`, per-run `elapsedMs` and `usageLine`.
- Probe: 1 call, ~$0.0001 (`campaign_manifest.json` `probe.usageLine`).

**Drop-in.** `results/summary.md` LLM usage; `results/campaign_manifest.json`; `results/findings.md` “What was not shown.”

---

# Chapter 8 — Discussion: boundary conditions (~6 pages)

**Title emphasis.** Climate vs commercial firestorms (CIKM crime/tech news). This chapter **answers RQ0** and interprets RQs without new runs.

## 8.1 What transferred from CIKM

- Persona-conditioned rewrite still moves MI; mixed identities still **buffer the mean** while a conspiracy subset saturates — structurally similar to “heterogeneous chain is not uniformly propaganda.”
- Discrete 5-item auditor still yields a usable 0–5 MI on a new domain (non-zero, persona-sensitive MI: the engine claim that *must* hold or the thesis dies).

## 8.2 What did not transfer (the boundary)

- **Identity content:** CIKM “Young Parent / crime_0” personas are journalistic/political stereotypes; Debnath BPs are **conspiracy vs climate-justice vs ecological risk**. Buffering here is a **cross-cutting climate coalition**, not left/right news.
- **Valence:** chemtrails–Gates is closer to a Pfeffer firestorm (fear/anger/disgust, depopulation) than a crime-stat rewrite. SCoPEx on a homogeneous conspiracy graph still **recovered** after tick 4; the commercial corpus may not have an equivalent “calm scientific seed.”
- **Time:** CIKM chain hops vs Debnath’s multi-year Twitter. 6-tick hop compression **cannot** mimic 2017→2021 semantic broadening except as a prompt instruction (`temporalWindow: "2018-2021"`).
- **Network:** CIKM headline is the chain; this thesis’s k* lives on **BA vs ER**. Hubs plus homogeneous conspiracy produced the only textbook k*=1.
- **Correction:** CIKM did not sell n-delay fact-check on climate; our B result is a **methods warning** (volume confound) more than a policy finding.

## 8.3 Pfeffer factors: which ones actually moved the needle (N=1)

- **Moved:** identity mix (hom vs mix); valence (two seeds); clustering (SF vs ER event volume + k* timing).
- **Did not get a fair test:** surprise (held drip); temporal acceleration (held 6 ticks); echo topology (dead cell). Measured echo (PI) still informative on mixed graphs.
- Do not write a six-factor “all confirmed” paragraph.

## 8.4 Implications (modest)

- For **simulation design:** mixed BPs are not a courtesy — they change whether k* exists.
- For **communication:** injecting the original SCoPEx-style text into a late, high-volume cascade is not a clean undo (Exp B).
- For **Debnath:** simulation is a **complement** to 814k observation, not a substitute, until hydrated cascades exist.

## 8.5 Alternative explanations

- gpt-4o-mini may **play along** with conspiracy system prompts (role-play, not stubborn belief).
- Reinterpret weight 0.50 encourages schema violation by design.
- Sequential persona assignment on 8 nodes is not Debnath’s empirical mixing proportions.
- Auditor five items are author-written; a different QA key could move MI.

**Drop-in.** `results/findings.md` (whole page); CIKM citation + `README.md` reproducing-paper paragraph for the commercial baseline **as literature**, not as extra numbers in Tab. 7.1. Fig. 8.1 (drawn).

---

# Chapter 9 — Limitations, ethics, open-source (~5 pages)

## 9.1 Statistical and design limits

- N=1; 8 nodes; 6 ticks; one model (`gpt-4o-mini`); no gpt-4o / Claude robustness.
- Two articles, three BPs — LOG.md’s “12 articles × 12 personas” is **not** this results folder.
- Failed cells: `A_er_mix` chemtrails cascade death; `D_echo_mix` seed drop.
- Held knobs: surprise, temporal acceleration, FrameAuditor off, n=5 skipped.
- k* undefined / none is a **result**, not a missing value to impute.

## 9.2 Data limits (repeat no-814k)

- No hydrated 814k; no cascade reconstruction; no digital-twin `--cascade` on Debnath (and `--digital-twin` is out of scope anyway).
- Reduced BPs can over-concentrate conspiracy language (Exp C tags on SCoPEx).
- ClimateFEVER unused; Wikipedia SAI ≠ a SCoPEx page (`SOURCES.md` fallback 2).

## 9.3 Ethics (Data & Society — write this as a real section)

- **Do not amplify.** Conspiracy system prompts are for a closed simulator; thesis will not publish shareable “how to write chemtrails tweets” beyond the already-public Debnath themes.
- **No targeting of individuals.** Personas are types, not named users; no hydrated user IDs.
- **Dual use:** a firestorm simulator could be read as a playbook. Mitigations: public scientific seeds, fact-check intervention, open methods, no bot-amplification experiments in this thesis.
- **Environmental cost of LLM calls:** report ~$0.15 / ~1.2k calls (Appendix) as a minimal but honest energy proxy.
- **Auditor as “truth.”** Ground truth is the author-curated scientific record (Harvard, Wikipedia consensus), not a moral claim that mixed-BP nodes are “the good citizens.”
- Human eval template is written (`human_eval_template.csv` in each run) but **not** a completed IRB study — say if unused.

## 9.4 Open-source and reproducibility

- Engine + thesisExperiment configs/scripts/results (non-secret) intended for the public repo.
- Reproduce: Ch6.0 command block; Node 18+; `.env` `OPENAI_API_KEY`; Python venv for plots (`plot_results.py`).
- **Never commit `.env`.** Manifest stderr may show placeholder Anthropic keys — redacted in the thesis PDF.
- Licence: follow the repository licence statement in `README.md` (MIT badge). Cite CIKM if the engine is reused.
- Dry-run is for plumbing; examiners should look at `campaign_manifest.json` `"mode": "real"`.

**Drop-in.** `results/findings.md` “What was not shown”; `data/SOURCES.md`; `campaign_manifest.json` (mode, aborted-if-any); `human_eval_template.csv` as an unused instrument.

---

# Chapter 10 — Conclusion (~3 pages)

## 10.1 Answers to RQs (four tight paragraphs)

- **RQ1:** pending full climate-chain grid; expected directional claim = homogeneous conspiracy chains distort more than mixed 3-BP chains **on this corpus**, paralleling CIKM’s hom/het contrast without copying crime_0 numbers.
- **RQ2:** only homogeneous × chemtrails × scale-free produced textbook irreversible **k\*=1**; mixed BPs buffered network-mean k*; ER reduced volume but not always k* under homogeneous identity.
- **RQ3:** fact-check before/after is **not** a clean recovery estimator; n=3 vs n=1 endpoint MPR is a hint with a volume confound.
- **RQ4:** PI on mixed graphs shows conspiracy-concentrated distortion; the explicit echo topology cell failed and must not be spun.

## 10.2 Contributions restated (C1–C4, past tense, modest)

- Operationalised Pfeffer; built a climate pack without faking 814k; ran a real-LLM networked pilot; stated boundary vs commercial CIKM firestorms.

## 10.3 Future work (only items that follow from limits)

- N≥5; 15-tick or true surprise (seed-all) cell; n=5 correction; seeded `echo_chamber` retry with `minSeedOutDegree`; Exp (a) climate chains; optional hydration of tweet IDs **if** API access appears; not a promise to download 662 MB in the acknowledgements.

## 10.4 Closing sentence (one)

- LLM societies can host a **climate firestorm clock** (k*), but only as a **pilot instrument** until Debnath-scale data and replicates exist.

**Drop-in.** `results/findings.md` bottom line; `thesisExperiment/README.md` headline k*.

---

# Appendix (~8–10 pages, unnumbered chapters)

## A. Config inventory (Tab. A.1)

Paste paths and one-line roles:

| File | Experiment | Topology | Personas | Articles | Notes |
|---|---|---|---|---|---|
| `configs/grid.json` | campaign index | — | — | — | A list, B list, extra D |
| `configs/A_sf_hom.json` | A | scale_free m=2 | homogeneous | both | |
| `configs/A_sf_mix.json` | A | scale_free m=2 | mixed 3 | both | |
| `configs/A_er_hom.json` | A | random_er p=0.42 | homogeneous | both | `minSeedOutDegree=2` |
| `configs/A_er_mix.json` | A | random_er p=0.42 | mixed 3 | both | chemtrails cell died |
| `configs/B_sf_mix_n1.json` | B | scale_free | mixed 3 | chemtrails | inject tick 1 |
| `configs/B_sf_mix_n3.json` | B | scale_free | mixed 3 | chemtrails | inject tick 3 |
| `configs/D_echo_mix.json` | D extra | echo_chamber | mixed 3 `by_cluster` | chemtrails | **failed** |
| `configs/_probe_api.json` | probe | linear_chain n=2 | homogeneous | scopex_2017 | 1 tick; not Exp (a) |

Include a **verbatim** JSON of one A cell and one B `interventions` block (already short). Point to `pfeffer` keys.

**Drop-in.** `thesisExperiment/configs/*.json`.

---

## B. Prompts (verbatim, student-owned)

### B.1 Auditor (engine; cite as CIKM-compatible)

From `src/Auditor.js` `_getIFDScores` (discrete mode used throughout):

> You are a fact-checker. For each question, the expected correct answer is provided. Evaluate the given text and return a score for each question: 1 = text correctly states the expected answer; 0 = text does not contain enough information to address the question; −1 = text contradicts or distorts the expected answer. Return only a JSON object: `{"answers": [1, 0, -1, ...]}`.

User side: article rewrite + numbered questions with expected Yes/No from `groundTruth`.

### B.2 Fact-check injection header (engine)

From `src/InterventionEngine.js`:

> `[FACT CHECK] The following is the verified original report on this topic. Cross-reference with what you have seen:` + original `article.text`.

### B.3 Persona system prompts (thesis)

Paste in full from:

- `thesisExperiment/personas/homogeneous_conspiracy.json` (`conspiracy_believer`)
- `thesisExperiment/personas/mixed_three_bp.json` (all three)

These are the **only** identity treatments. Do not paste repo-root `personas/personas.json` (CIKM 26-pack).

### B.4 Article QA keys

Paste `questions` + `groundTruth` from `thesisExperiment/articles/articles.json` (not the full Wikipedia-length `text` if the chair wants a shorter PDF; then put full text in a digital supplement).

---

## C. Cost (Tab. A.2)

From `results/summary.md` / `summary.json` `llmUsage` (real campaign; list-price heuristic):

| Cell | Calls | Prompt tok. | Completion tok. | Est. USD |
|---|---|---|---|---|
| A_sf_hom | 299 | 147447 | 25126 | 0.0372 |
| A_sf_mix | 311 | 147013 | 25891 | 0.0376 |
| A_er_hom | 162 | 80550 | 14045 | 0.0205 |
| A_er_mix | 104 | 47975 | 8009 | 0.012 |
| B_sf_mix_n1 | 161 | 74582 | 12835 | 0.0189 |
| B_sf_mix_n3 | 165 | 77658 | 12455 | 0.0191 |
| D_echo_mix | 0 | 0 | 0 | 0 |
| **Campaign (README)** | | | | **~$0.15** |
| Probe | 1 | 551 | 13 | ~0.0001 |

Elapsed times (`campaign_manifest.json`): A_sf_hom 403614 ms; A_sf_mix 403065 ms; A_er_hom 232515 ms; A_er_mix 128982 ms; B_n1 223323 ms; B_n3 209526 ms; D 337 ms.

**Drop-in.** `results/summary.md` LLM usage; `results/campaign_manifest.json`; `results/summary.json` `llmUsage`.

---

## D. Seeds and held knobs (Tab. A.3)

| Item | Value |
|---|---|
| `graphRandomSeed` | **42** |
| ER `edgeProbability` | 0.42 |
| ER `minSeedOutDegree` | 2 |
| BA `m` | 2 |
| `seedNodes` | `node_0` |
| Article ids | `scopex_2017`, `chemtrails_gates_2018_2021` |
| Replicates | N=1 |
| Model | gpt-4o-mini (agent + auditor) |
| Tick / hop / inbox | 6 / 6 / 4 |
| Action weights | 0.35 / 0.50 / 0.15 |
| Fact-check ticks | 1 and 3 |
| Echo chamber params | 2 chambers; intra 0.75 / 0.85; inter 0.08 / 0.15 |
| Dry-run | not used for reported MI |

**Drop-in.** `pfeffer_mapping.md`; `configs/grid.json` `notes`; each config `nodeParams`.

---

## E. Result-file map (for the student, not necessarily printed)

| Need | File |
|---|---|
| Examiner one-pager | `thesisExperiment/results/findings.md` |
| Tables | `thesisExperiment/results/summary.md` |
| Machine tables | `thesisExperiment/results/summary.json` |
| What ran | `thesisExperiment/results/campaign_manifest.json` |
| Fig. 7.3 | `thesisExperiment/results/mi_mpr_by_condition.png` |
| Fig. 7.4 | `thesisExperiment/results/kstar_by_condition.png` |
| Fig. 7.5 | `thesisExperiment/results/b_before_after.png` |
| Console | `thesisExperiment/results/logs/{A_sf_hom,A_sf_mix,A_er_hom,A_er_mix,B_sf_mix_n1,B_sf_mix_n3,D_echo_mix,probe_api}.log` |
| How to rerun | `thesisExperiment/README.md` |
| Pfeffer table | `thesisExperiment/pfeffer_mapping.md` |
| Literature notes | `thesisExperiment/discovery/01_literature/` |
| This skeleton | `thesisExperiment/discovery/07_chapters/chapter_skeleton.md` |

---

## Page budget check (body)

| Ch | Pages | Role |
|---|---|---|
| 1 Introduction + RQs | 8 | argument, Tab. 1.1 |
| 2 Related work | 10 | pointer to 01_literature |
| 3 Pfeffer operationalisation | 8 | knobs + k* |
| 4 System | 8 | CIKM prior + thesis extensions only |
| 5 Data | 6 | BPs, articles, no-814k |
| 6 Experiments | 8–10 | (a)(b)(c)(d) + CLI |
| 7 Results | 12 | Fig. 7.1–7.7, Tab. 7.1–7.4 |
| 8 Discussion | 6 | climate vs commercial |
| 9 Limitations, ethics, OSS | 5 | |
| 10 Conclusion | 3 | |
| **Body total** | **74–84** | trim Ch2/Ch7 if over 80; do not trim Ch5 no-814k or Ch9 ethics |

If the chair wants ≤60 pages: keep Ch1, 3, 5, 6, 7, 9, 10; fold Ch2 into 6 pages; merge Ch8 into Ch7+Ch10; move prompts entirely to appendix.

---

## Student writing order (practical)

1. Typeset Tab. 7.1–7.3 and Fig. 7.3–7.5 from `results/` (already on disk).
2. Write Ch5 no-814k and Ch9 ethics (these cannot be faked later).
3. Write Ch3 from `pfeffer_mapping.md` and Ch6 from this CLI block.
4. Expand Ch2 from `01_literature` last, so citations match what you actually cited.
5. Fill Ch7.1 only after climate-chain runs exist; until then keep the placeholder and do not borrow probe MI.
6. Ch8 after Ch7, not before — the boundary claim needs the k*=1 cell and the B confound in print.
