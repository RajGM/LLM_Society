# Thesis figure and table plan (examiner pack)

**Scope.** Layout, captions, and field bindings for the climate-firestorm campaign. Templates live in this folder. Numeric panels are filled only from `thesisExperiment/results/` (and the run directories that `summary.json` points at). This document does **not** report result values.

**How to generate.** From repo root, with the project venv:

```powershell
.\.venv\Scripts\python.exe thesisExperiment\discovery\08_figures\plot_templates.py
```

`--empty` writes axes-only placeholders (no JSON values drawn). Default behaviour plots whatever the executor has already written under `results/`. Missing files yield a labelled empty panel, not fabricated series.

**Validity banner (put under every empirical figure).** Real-LLM campaign status, model id, N, node count, and tick budget come from `summary.json` (`mode`, `validity`, `thesisGrade`, `rows[].model`). If `mode` is `dry-run`, the figure must be labelled **invalid for thesis** (auditor mock returns all-correct, MI identically 0). Do not caption dry-run plumbing as evidence.

**Severity scale (engine, not a fitted result).** Discrete auditor, five items: MI = missing + incorrect. Bands used on colour bars: MI ≤ 1 factual error; 1 < MI ≤ 3 lie; **MI > 3 propaganda**. **k\*** = first tick at which network-mean MI exceeds 3 and mean MI stays above 3 on all later ticks with data (`parse_results.js` `irreversibleKStar`).

---

## Source files the executor is expected to fill

| Path | Role |
|---|---|
| `thesisExperiment/results/summary.json` | Primary table: one row per experiment × article |
| `thesisExperiment/results/campaign_manifest.json` | Wall-clock, run dirs, usage lines |
| `thesisExperiment/runs/<runDir>/metadata.json` | Config, `llmUsage`, nested `results` |
| `thesisExperiment/runs/<runDir>/results_<articleId>.json` | `nodeSummaries`, `metrics` |
| `thesisExperiment/runs/<runDir>/nodes/node_*.json` | Event history, IFD scores, rewrite text |
| `thesisExperiment/runs/<runDir>/graph_topology.json` | Nodes, directed edges, persona ids |
| `thesisExperiment/runs/<runDir>/human_eval_template.csv` | Sampled rewrite pairs + `auditor_mi` |
| `thesisExperiment/articles/articles.json` | QA items and `groundTruth` |
| `thesisExperiment/pfeffer_mapping.md` | Factor definitions (schematic only) |

Pilot files currently in `results/` are a **smoke-test** source for layout. Captions below do not treat them as the final thesis grid (LOG.md records a larger executor pass).

---

## JSON field dictionary

Bindings use `summary.json` unless a run-level path is named.

### Row identity

| Field | Use |
|---|---|
| `rows[].runDir` | Join to `runs/<runDir>/` |
| `rows[].experiment` | `A` / `B` / `D` (C is a parse-time heuristic, not a separate run) |
| `rows[].experimentName` | Cell id (`A_sf_hom`, `B_sf_mix_n3`, …) |
| `rows[].topology` | `scale-free` / `random-ER` / `echo-chamber` |
| `rows[].bpMix` | `homogeneous-conspiracy` / `mixed-3BP` |
| `rows[].articleId` | `scopex_2017` / `chemtrails_gates_2018_2021` (executor may add ids) |
| `rows[].personasUsed[]` | Persona ids present in that article run |
| `rows[].status` | Completeness; incomplete cells are hatched, not dropped |
| `rows[].model` | Auditor/agent model label |

### Distortion / k* / MI

| Field | Use |
|---|---|
| `rows[].meanNodeMPR`, `maxNodeMPR` | Heatmap / bars |
| `rows[].maxEventMI`, `maxNetworkMeanMI` | Peak severity |
| `rows[].propagandaOccurred` | Boolean overlay |
| `rows[].kStar_network` | Irreversible network k*; JSON `null` = no k* (**not** zero) |
| `rows[].firstMeanMiOver3` | First crossing, even if later recovery |
| `rows[].networkRecoveredAfterPropaganda` | Distinguishes firestorm vs recovery |
| `rows[].kStar_firstIrreversibleNode`, `kStar_hop`, `kStar_nodeId` | Node-level k* |
| `rows[].networkMIOverTime[].tick`, `.meanMI`, `.activeNodes` | Trajectories |
| `rows[].totalEvents` | Volume (F08) |
| `rows[].giniCoefficient`, `structuralVirality` | Inequality / cascade shape |
| `rows[].echo.edgeHomophily`, `.conspiracyHomophily`, `.modularityConspiracy`, `.nEdges` | Exp D |
| `rows[].polarization.pi`, `.meanConspiracyMPR`, `.meanOtherMPR` | Persona-gap PI |
| `rows[].distortionHeuristic.nTexts`, `.counts.<type>` | Exp C keyword tags |
| `rows[].bRecovery.splitTick`, `.beforeMean`, `.afterMean`, `.nBefore`, `.nAfter` | Exp B |

### Run payloads (heatmaps, auditor QA, actions)

| Field | File | Use |
|---|---|---|
| `nodeSummaries.<nodeId>.personaId` | `results_<articleId>.json` | Heatmap rows |
| `nodeSummaries.<nodeId>.mpr` | same | Cell value |
| `nodeSummaries.<nodeId>.severity` | same | Band label |
| `nodeSummaries.<nodeId>.eventCount` | same | Weight / filter empty nodes |
| `nodeSummaries.<nodeId>.stats.{received,forwarded,reinterpreted,dropped,dumped}` | same | Action mix (F15) |
| `metrics.networkMIOverTime` | same | Same series as the summary copy |
| `metrics.ifdMetrics.{meanCR,meanMR,meanIR}` | same | Optional IFD inset |
| `history[].tick`, `.articleId`, `.action`, `.contentIn`, `.contentOut` | `nodes/node_*.json` | Auditor example |
| `history[].misinfoIndex` | same | Event MI |
| `history[].ifd.scores` | same | Per-question `{1,0,-1}` |
| `history[].ifd.{mi,cr,mr,ir,mode}` | same | IFD decomposition |
| `articles[].questions[]`, `articles[].groundTruth[]` | `articles.json` | QA stubs |
| `llmUsage.{calls,promptTokens,completionTokens,totalTokens,estimatedUsd,errors,model}` | `summary.json` and `metadata.json` | Cost |
| `runs[].elapsedMs`, `runs[].usageLine`, `runs[].runDir` | `campaign_manifest.json` | Wall-clock |
| `pfefferVaried`, `pfefferHeld`, `pfefferMeasured` | `summary.json` | Schematic status |

**Null handling.** `kStar_network: null` is drawn as “none” (grey/hatch). `bRecovery.beforeMean: null` with `nBefore: 0` is “no pre-injection scored events”, not MI = 0. `polarization.pi: null` on homogeneous graphs is tautological (no out-group), not a missing measurement error.

---

## Catalogue

### Figure 1 — Homogeneous MPR heatmap (persona × article)

**File.** `F01_homo_mpr_heatmap.png`

**Caption.** Mean misinformation propagation rate (MPR) by persona and seed article under homogeneous conspiracy assignment (Experiment A). Separate panels are topology (scale-free vs seeded Erdős–Rényi). Colour follows the auditor severity bands defined above. A companion node × article panel, if shown, is the CIKM-style layout restricted to a single belief-persona; it is **not** a reprint of the published crime-news heatmap. N and model are taken from `summary.json`. Cells with no scored events are left blank.

**Feeds.** Filter `rows[]` where `experiment=="A"` and `bpMix=="homogeneous-conspiracy"`. Cell value: mean of `nodeSummaries.*.mpr` grouped by `personaId` × `articleId` × `topology`, joined via `runDir`. Fallback if run files are absent: `rows[].meanNodeMPR` (one number per article-condition; persona axis collapses to `personasUsed[0]`).

**Examiner note.** With a single BP the persona axis has one row until the executor expands the homogeneous roster. Do not pad with unused CIKM personas.

---

### Figure 2 — Heterogeneous MPR heatmap and distribution

**File.** `F02_hetero_mpr_heatmap_dist.png`

**Caption.** (a) Mean node MPR by Debnath-reduced persona and article on mixed-BP graphs. (b) Distribution of node-level MPR within each persona, pooled across mixed Experiment A cells that completed. The scientific claim under test is whether distortion concentrates in the conspiracy subset rather than spreading uniformly. A cascade that died after a single event is annotated and excluded from the distribution, not treated as a zero-MPR finding.

**Feeds.** `rows[]` with `bpMix=="mixed-3BP"` and `experiment=="A"`. Heatmap: mean `nodeSummaries.*.mpr` by `personaId` × `articleId` (facet `topology`). Violin/box: the same node-level `mpr` values. Optional overlay: `polarization.meanConspiracyMPR` vs `meanOtherMPR`.

---

### Figure 3 — k\* by topology × mix

**File.** `F03_kstar_topology_mix.png`

**Caption.** First irreversible propaganda tick (network-mean MI > 3 with no subsequent recovery) for each Experiment A cell, faceted by seed article. Grey or hatched cells indicate that network-mean MI never remained above the propaganda threshold for the remainder of the run. First crossing without irreversibility is reported separately (`firstMeanMiOver3`) and must not be labelled k\*. Because N = 1 in the pilot protocol, this is a map of observed onsets, not a latency distribution.

**Feeds.** `kStar_network`, `firstMeanMiOver3`, `networkRecoveredAfterPropaganda`, `topology`, `bpMix`, `articleId`, `experiment`. Marker of node-level onset: `kStar_firstIrreversibleNode`, `kStar_hop`, `kStar_nodeId`.

**Construction.** Categorical heatmap or grouped bars; **never** recode `null` as 0 (that would imply k\* at tick 0).

---

### Figure 4 — Network-mean MI trajectories (firestorm vs recovery)

**File.** `F04_mi_trajectories.png`

**Caption.** Network-mean MI against tick for two Experiment A series chosen by rule, not by fishing: (i) a cell with `kStar_network` not null (irreversible propaganda), and (ii) a cell with `firstMeanMiOver3` not null and `networkRecoveredAfterPropaganda==true`. Horizontal guides mark MI = 1 and MI = 3. Marker size or a twin axis may show `activeNodes`. The figure illustrates the k\* definition; it does not generalise beyond the plotted cells.

**Feeds.** `networkMIOverTime[].tick`, `.meanMI`, `.activeNodes`; selection keys above. Prefer homogeneous scale-free if both patterns exist there, so topology is held.

---

### Figure 5 — Pfeffer six-factor schematic

**File.** `F05_pfeffer_schematic.png`

**Caption.** Operationalisation of Pfeffer’s six firestorm factors in this campaign. Each factor is classified as **varied**, **held**, or **measured** from the campaign summary, not from post-hoc interpretation of MI. Engine knobs (persona mix, topology, seed valence, drip seeding, hop compression, homophily/modularity) are listed; factors that were not swept are shown as held even if they are theoretically interesting.

**Feeds.** `pfefferVaried`, `pfefferHeld`, `pfefferMeasured` in `summary.json`. Labels and knob names from `thesisExperiment/pfeffer_mapping.md` (static text). No MI numbers.

| Factor | Status source | Knob (mapping file) |
|---|---|---|
| Valence | varied / article contrast | two seeds; BP `emotionalTone` |
| Surprise | held | `seedNodes` drip; no all-node shock cell |
| Identity alignment | varied | homogeneous vs mixed personas |
| Network clustering | varied | `topology` scale-free vs ER |
| Information echo | measured (optional extra cell) | homophily, modularity, PI, Gini |
| Temporal acceleration | held | `maxTicks` / `maxHops` compression |

---

### Figure 6 — Experiment B, before vs after fact-check

**File.** `F06_expB_before_after.png`

**Caption.** Mean event MI before and after `fact_checker_injection` on scale-free mixed-BP chemtrails cells, split at the configured intervention tick. Sample sizes (`nBefore`, `nAfter`) are printed on the bars. A companion panel shows network-mean MI over ticks with a vertical line at `splitTick`. **Caveat (mandatory in caption or footnote):** late-tick cascade volume can dominate the post-injection mean; a rise in after-mean is not, by itself, evidence that the correction failed, and a fall is not, by itself, evidence that it worked.

**Feeds.** `bRecovery.*`; `networkMIOverTime`; `experimentName` matching `B_*`. Intervention tick is also in `runs/<runDir>/metadata.json` `config.interventions[]` (`type==fact_checker_injection`, `tick`).

---

### Figure 7 — Echo, homophily, and modularity

**File.** `F07_modularity_echo.png`

**Caption.** Last-graph echo metrics and persona-gap polarisation. Edge homophily is the fraction of directed edges whose endpoints share a persona id; conspiracy-cluster homophily and Newman-style modularity use a two-block conspiracy vs other cut (`parse_results.js` `graphEchoMetrics`). PI is the absolute gap in mean MPR between conspiracy and other personas; it is undefined on homogeneous graphs. An echo-chamber extra cell with a dropped seed (zero scored LLM events) is marked unusable and is not interpreted as suppression of a firestorm.

**Feeds.** `echo.*`, `polarization.*`, `totalEvents`, `topology`. Topology file `graph_topology.json` `nodes[].personaId`, `edges[]` if the executor needs a small graph drawing.

---

### Figure 8 — Event volume, scale-free vs ER

**File.** `F08_event_volume_sf_er.png`

**Caption.** Count of scored node-article events (`totalEvents`) for Experiment A, grouped by topology and belief-persona mix, with seed article as hue. Scale-free vs ER is the clustering contrast; volume is a process outcome (reach × reinterpret), not an independent variable. Cells with a single event or an empty `networkMIOverTime` series are labelled stochastic/seed-drop failures.

**Feeds.** `totalEvents`, `topology`, `bpMix`, `articleId`, `experiment=="A"`. Optional twin: last-tick `activeNodes` or sum of `nodeSummaries.*.stats.received`.

---

### Figure 9 — Distortion taxonomy (Experiment C)

**File.** `F09_distortion_taxonomy.png`

**Caption.** Keyword-heuristic classification of rewrite texts (`contentOut`) into Debnath-linked distortion types. Counts are occurrences, not exclusive labels; a text may hit several patterns. This is **not** a trained classifier and not HDBSCAN on the 814k-tweet corpus. Types implemented in `parse_results.js`: `spraying_chemtrails`, `weather_haarp`, `weaponization`, `depopulation`, `antivax_spillover`, plus `climate_justice_hijack` when justice/mitigation language co-occurs with conspiracy tags. Normalise by `nTexts` when comparing cells.

**Feeds.** `distortionHeuristic.nTexts`, `distortionHeuristic.counts`. Experiment C exists as this parse-time overlay on A/B/D runs; there is no separate `C_*` config in the pilot grid.

**If C is empty.** If every `nTexts` is 0, the template draws an empty axes panel stating that the executor has not yet produced rewrite texts. Do not invent tag counts.

---

### Figure 10 — Auditor QA worked example

**File.** `F10_auditor_qa_example.png`

**Caption.** Worked example of the five-item discrete auditor on one propagation event. Each row is a pre-registered question from `articles.json`, the expected yes/no (`groundTruth`), and the auditor’s ternary score (`ifd.scores`: 1 correct, 0 missing, −1 incorrect). Event MI equals missing + incorrect. The rewrite excerpt is truncated for the figure; the full strings remain in `nodes/node_*.json` and `human_eval_template.csv`. This panel is a method figure. It does not establish human inter-rater agreement unless those ratings are later filled in the CSV.

**Feeds.** `articles.json` `questions`, `groundTruth`. Event: `history[]` with non-null `ifd.scores` (prefer a `reinterpret` with propaganda-band `misinfoIndex` if present, else the earliest scored event). CSV columns `article_id`, `node_id`, `persona_id`, `tick`, `action`, `original_text`, `rewritten_text`, `auditor_mi` for a parallel human-eval stub.

**Selection rule (deterministic).** First complete Experiment A run in `summary.json` order; first node file in sorted order; first history event with `ifd.scores` length matching the article’s question count. Document the chosen `(runDir, nodeId, tick, articleId)` on the figure.

---

### Figure 11 — Cost and compute

**File.** `F11_cost_compute.png`

**Caption.** LLM call counts, token totals, list-price heuristic USD, and wall-clock per campaign cell. Cost is an accounting figure from returned usage objects, not a scientific outcome. Probe and dry-run rows, if present, are excluded from the thesis total. Echo or mix cells with zero calls are retained as failed-cell diagnostics.

**Feeds.** `summary.json` `llmUsage[]` (`calls`, `promptTokens`, `completionTokens`, `totalTokens`, `estimatedUsd`, `errors`, `model`, `experimentName`). `campaign_manifest.json` `runs[].elapsedMs`, `usageLine`, `startedAt`, `finishedAt`. Do not back-calculate tokens from elapsed time.

---

### Table 12 — Comparison with the CIKM 2025 paper (replicated vs new)

**File.** `T12_cikm_comparison.png` (and markdown copy below)

**Caption.** What this thesis campaign reuses from the CIKM 2025 society-simulation engine, and what it does not reprint. Replicated items are **methods** (auditor, MPR, severity, homo/hetero contrast). New items are the climate-firestorm design (Pfeffer factors, Debnath-grounded BPs, k\*, fact-check intervention, distortion overlay, graph clustering). This table contains no empirical MI/MPR numbers from either paper.

**Feeds.** Static design contrast (README / `examples/run_linear_chain.json` vs `thesisExperiment/README.md` and configs). Not a JSON metric.

| Dimension | CIKM 2025 paper (engine / protocol) | This thesis campaign | Status |
|---|---|---|---|
| Domain / seeds | News articles `crime_0`, `education_0`, `technology_0`, `politics_0`, `healthcare_0` | Climate-geoengineering seeds `scopex_2017`, `chemtrails_gates_2018_2021` (executor may add further climate items) | **New domain** |
| Personas | 21 heterogeneous roles (e.g. Young Parent) + optional bots | Debnath-reduced BPs: `conspiracy_believer`, `climate_action_advocate`, `environmental_concern` | **New personas**; CIKM roster not run |
| Graph | Linear chain of 5 nodes (`linear_chain`) as the paper setup | Scale-free BA, seeded ER, optional `echo_chamber`; N_nodes from configs | **New topologies** for the thesis question |
| Mix contrast | Homogeneous vs heterogeneous chains | Homogeneous conspiracy vs mixed 3 BPs on the same graphs | **Replicated idea**, new assignment |
| Auditor | Five QA items; discrete MI = missing + incorrect | Same engine (`Auditor.js`), climate questions in `articles.json` | **Replicated method** |
| MPR / severity | Mean MI; factual error / lie / propaganda | Same thresholds | **Replicated method** |
| k\* | Not the CIKM headline metric | First irreversible network-mean MI > 3 | **New DV** |
| Interventions | Not the CIKM crime-news grid | `fact_checker_injection` at n ∈ {1,3} (n = 5 only if run) | **New** |
| Distortion types | Not in the CIKM news protocol | Keyword taxonomy on rewrites (Exp C) | **New** (heuristic) |
| Echo / PI | Optional extensions in the later codebase | Homophily, conspiracy-cut modularity, PI on thesis graphs | **New application** |
| Published CIKM figures | Fig. 3 node×article MPR; Fig. 4 MI trajectories on crime/news | Analogous **layout** on climate cells | **Layout analogue only** — not a numeric replication |
| HDBSCAN / 814k tweets | Not a CIKM result | Debnath corpus not downloaded; BPs are theory-faithful reductions | **Not replicated** (documented gap) |

---

### Figure 13 — Polarisation and inequality (supporting)

**File.** `F13_polarization_gini.png`

**Caption.** Persona-gap PI (mixed graphs only) and Gini of node MPR. High Gini with low PI would indicate a hub-driven cascade rather than a belief-split; the reverse pattern is the echo reading. Structural virality is shown if present but is weakly identified on 8-node hop-compressed graphs.

**Feeds.** `polarization.pi`, `giniCoefficient`, `structuralVirality`, `bpMix`.

---

### Table 14 — Cell validity ledger (supporting)

**File.** `T14_validity_ledger.png`

**Caption.** Completeness ledger for every parsed article-condition: event count, whether `networkMIOverTime` is non-empty, propaganda flag, and a usability tag (`ok` / `seed-drop` / `dry-run-invalid`). Examiners should read empirical figures only against this ledger.

**Feeds.** `rows[]` identity fields plus `totalEvents`, `status`, `propagandaOccurred`; `summary.mode`, `validity`, `thesisGrade`.

---

### Figure 15 — Action mix (supporting)

**File.** `F15_action_mix.png`

**Caption.** Per-node action counts (forward, reinterpret, drop, dump) aggregated by persona and mix condition. High reinterpret weight is a configured prior (`nodeParams.actionWeights`), not an emergent finding, unless the executor compares against a different weight grid.

**Feeds.** `nodeSummaries.*.stats` from `results_<articleId>.json`.

---

## Caption register (copy into the thesis)

Use these sentences as figure captions. Do not insert numeric results by hand; the plots carry the values from JSON.

1. Mean MPR by persona and article under homogeneous conspiracy assignment (Experiment A), faceted by topology. Colour scale: auditor severity bands. Source: `results/summary.json` joined to `runs/*/results_*.json` `nodeSummaries`.
2. Mixed-BP (heterogeneous) MPR: persona × article heatmap and node-level distribution. Failed one-event cells annotated, not coded as zero distortion.
3. k\* (first irreversible network-mean MI > 3) by topology and belief-persona mix. Null k\* shown as absence, not as tick 0.
4. Illustrative network-mean MI trajectories: one irreversible propaganda series and one recovery series, selected by the k\* rule.
5. Pfeffer six-factor schematic: varied, held, and measured knobs in this campaign.
6. Experiment B: mean event MI before versus after fact-check injection, with n and the cascade-volume caveat.
7. Echo metrics (homophily, conspiracy-cut modularity) and polarisation index. Unusable echo extra cell marked.
8. Scored event volume on scale-free versus ER graphs.
9. Experiment C keyword distortion taxonomy (normalised by number of rewrite texts). Not a trained classifier.
10. Worked auditor item: five pre-registered questions, ground truth, and ternary IFD scores for one recorded event.
11. LLM calls, tokens, list-price USD heuristic, and wall-clock by cell.
12. Methods comparison with the CIKM 2025 paper: replicated auditor/MPR machinery versus new climate-firestorm design. No empirical reprint.

---

## What the captions must not say

- Do not call the campaign a CIKM replication, a Debnath 814k replication, or a 15-tick firestorm if ticks were compressed.
- Do not interpret `D_echo_mix` seed-drop as “echo chambers suppress propaganda”.
- Do not treat Experiment B after-means as a clean recovery ATE.
- Do not draw error bars unless the executor writes replicates (`N>1`) into `summary.json`.
- Do not fill empty heatmaps with CIKM crime-news numbers or with guessed MI.
