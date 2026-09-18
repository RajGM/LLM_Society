# Pre-analysis plan (executor / results chapter)

**Status:** locked before further analysis. Do not run the LLM grid from this folder.  
**Campaign inspected:** `thesisExperiment/results/summary.json` (mode=`real`, `thesisGrade=false`, N=1 `gpt-4o-mini` pilot).  
**Parsers / schemas:** `thesisExperiment/scripts/parse_results.js`, `src/MetricsEngine.js`, `src/Auditor.js`, `src/ABTestRunner.js`, `results_*.json`, `nodes/node_*.json`.

This document tells the analysis executor **what to compute, at which unit, with which N-rule**. It does not interpret cell magnitudes as thesis-grade effects.

---

## 0. Do-not-violate rules

1. Dry-run rows (`mode=dry-run`, auditor mock → MI identically 0) are **invalid**. Exclude them.
2. `D_echo_mix` with 0 LLM calls / seed drop at tick 1 is **unusable**. Report as a failed cell, not a finding.
3. Do **not** call `ABTestRunner._cohensD` on campaign outputs (see §5).
4. Experiment B’s `n∈{1,3}` is **intervention timing**, not statistical replicate N (see §4).
5. Do not copy CIKM crime-news / Young Parent cell values into climate tables (see `heatmap_spec.md`).
6. Primary claims for the N=1 pilot are **descriptive**. Inferential language (`significant`, `effect size d=…`, `p<`) is reserved for a future N≥3 grid.

---

## 1. Data sources and field map

| Object | Path | Role |
|---|---|---|
| Campaign row | `results/summary.json` → `rows[]` | One row = one **run × article** (parser already flattened) |
| Node MPR | `runs/<runDir>/results_<articleId>.json` → `nodeSummaries[nodeId]` | `{personaId, mpr, severity, eventCount, stats}` |
| Network MI series | same file → `metrics.networkMIOverTime[]` | `{tick, meanMI, activeNodes}` |
| Reach/fidelity | `metrics.cascadeReachVsFidelity[]` | `{nodeId, personaId, reach, meanMI, fidelity}` |
| Event | `runs/<runDir>/nodes/node_*.json` → `history[]` | see event schema below |
| Topology | `graph_topology.json` | echo / homophily (Exp D) |
| Human ratings | `human_eval_template.csv` | blank `rating_*` columns; auditor_mi filled |

### 1.1 Event schema (atomic observation)

Each history entry (probed):

```
tick, articleId, sourceNodeId, hops, action,
contentIn, contentOut, misinfoIndex, ifd, frameAnalysis,
reason, chainTrust, provenance, timestamp
```

- **Scored event:** `misinfoIndex != null` (drops/dumps are typically null; auditor not called).
- **Discrete MI:** `ifd.mi = missingCount + incorrectCount` on **m = 5** binary items → MI ∈ {0,1,2,3,4,5}.
- **IFD extras (secondary):** `ifd.{cr, mr, ir, cms, ie, scores[], mode}`. Campaign used `miScoringMode: "discrete"`.
- **Hop ≠ tick.** Schema probe on `A_sf_hom` showed pairs such as `(hops=3, tick=4)` and `(hops=6, tick=1, action=drop, MI=null)`. Never treat hop-compressed ticks as identical to `hops`.

### 1.2 Severity (engine, keep as-is)

| MI (event) | MPR (node mean MI) | `Auditor.severity` |
|---|---|---|
| — | ≤ 1 | `factual_error` |
| — | ≤ 3 | `lie` |
| **> 3** | **> 3** | **`propaganda`** |

Propaganda threshold for k\* is **strictly greater than 3** (MI ∈ {4,5} at event level).

---

## 2. Units of analysis (pre-register both; do not mix in one test)

Two complementary units. The executor must label every table/figure with the unit used.

### Unit U1 — event / hop (micro)

**Key:** `(runDir, articleId, nodeId, personaId, tick, hops)`  
**DV grain:** event `misinfoIndex` (and optional IFD rates).

Use U1 for:

- hop-resolved distortion (analog of a CIKM “chain position”);
- node-level irreversible k\* (`kstar_rules.md`);
- mixed-BP distributions (violin/box of MI or MPR by persona × hop);
- Experiment B **event** MI before vs after injection tick (not a clean RCT; see confound).

**Aggregation allowed at U1:** mean MI by `(articleId, personaId, hops)` within a run.  
**Not allowed:** treating those length-1 cell means as a sample for Cohen’s d.

### Unit U2 — network-mean (macro)

**Key:** `(runDir, articleId, tick)` from `metrics.networkMIOverTime`.  
**DV:** `meanMI` = mean of **scored events that tick** (not a mean of node MPRs).  
`activeNodes` in that object is an **event count**, not unique nodes (name is historical; parser uses it as-is).

Use U2 for:

- primary **network k\*** (irreversible propaganda at society level);
- plots of firestorm trajectory;
- `maxNetworkMeanMI`.

**Do not** average U2 `meanMI` across ticks and call it MPR. MPR is a **node** mean of event MI (`Auditor.computeMPR`).

### Derived units (report, do not test as if independent)

| Unit | How | Typical DV |
|---|---|---|
| U-node | `(runDir, articleId, nodeId)` | `mpr`, `severity`, `eventCount` |
| U-persona | mean of U-node MPR by `personaId` | persona × article mean MPR |
| U-cell | `(experimentName, articleId)` at N=1 | `kStar_network`, `meanNodeMPR`, `maxEventMI` |
| U-replicate | `(experimentName, articleId, replicate_id)` | only if N≥3 later |

**Independence warning:** events on the same node share persona, inbox, and trust state. Nodes share a graph. U1 observations are **clustered**. Even at N≥3, inference is at **replicate (run)** level, with nodes/events nested inside.

---

## 3. Primary dependent variables

Pre-registered primary family (results chapter lead):

| ID | DV | Unit | Definition | Source |
|---|---|---|---|---|
| DV1 | **MI** | U1 | Discrete auditor score, 0–5 | `history[].misinfoIndex` |
| DV2 | **MPR** | U-node | Mean of scored MI for that node×article | `nodeSummaries[].mpr` |
| DV3 | **k\*** | U2 (primary) + U1 node (secondary) | First irreversible propaganda time | `kstar_rules.md` |

**Primary reporting scalars per cell × article (N=1):**

1. `maxEventMI` — peak U1 MI (existence of propaganda events).
2. `meanNodeMPR` — unweighted mean of 8 node MPRs (parser). Also report **persona-stratified** MPR on mixed graphs.
3. `maxNetworkMeanMI` — peak U2.
4. `kStar_network` — DV3 network; `null` if never irreversible.
5. `propagandaOccurred` — `maxMpr > 3 OR eventPeakMI > 3 OR maxMeanMI > 3` (parser). Keep the flag; always also show the three constituents.

**Secondary (pre-specified, not in the primary Holm family):**

- Gini of node-mean MI, structural virality, information half-life median.
- Polarization index PI = |mean MPR_conspiracy − mean MPR_other| (undefined on homogeneous graphs except as 0-other).
- Echo: `edgeHomophily`, `conspiracyHomophily`, `modularityConspiracy`.
- Distortion heuristic keyword counts (Exp C; not a classifier).
- Exp B `bRecovery` `{beforeMean, afterMean, nBefore, nAfter, splitTick}` — **descriptive only** (cascade-volume confound).

**Do not promote to primary:** keyword tags, LLM token spend, failed echo cell.

---

## 4. How to handle N=1 vs N≥3

`grid.json` has `"runsPerCell": 1`. Current `summary.json` validity string already states N=1 pilot.

`N` always means **independent simulation replicates** (new LLM stochasticity; same config). It does **not** mean:

- 8 nodes,
- event count,
- Experiment B injection index `n∈{1,3}`.

### 4.1 N = 1 (this campaign)

| Allowed | Forbidden |
|---|---|
| Point estimates, trajectories, heatmaps, k\* timestamps | Standard errors, t-tests, ANOVA, mixed models |
| Qualitative cell contrasts (“this cell crossed; that cell recovered”) | “significantly higher”, Cohen’s d, Bayes factors |
| Sensitivity: hop- vs tick-indexed k\*; persona-stratified MPR | Pooling two articles as replicates of one condition |
| Report `totalEvents` as a **volume** descriptor | Treating events as i.i.d. sample size |

**Missing-data / dead cascades:** if `totalEvents` is 0–1 (mixed ER chemtrails; echo cell), report **cascade death**, do not impute MI=0 as “accurate society.”

**Two articles** are a **valence factor** (SCoPEx vs chemtrails–Gates), not N=2.

### 4.2 N ≥ 3 (future grid only)

Minimum for any numeric uncertainty:

1. Build a **replicate-level** table: one row per `(experimentName, articleId, replicate)`.
2. Cell DVs: `meanNodeMPR`, `maxEventMI`, `maxNetworkMeanMI`, `kStar_network` (use survival/censoring for k\*; see `kstar_rules.md`).
3. Report mean, SD, and **percentile bootstrap 95% CI** (B=10_000, seed documented). With N=3, CIs will be wide; that is honest.
4. Contrasts (e.g. hom vs mix on the same topology+article): **permutation test** of the replicate means (exact if 2N is small). Do not use unpaired t on N=3 as the headline.
5. Cohen’s d (Hedges’ g preferred for N<20) **only** on the **vector of replicate DVs**, never on pre-averaged scalars (§5).
6. Nested models (events in nodes in runs) are optional appendix; primary inference stays at replicate.

**N=2** (if a second seed is added later): still no t-test; show both replicates as dots.

### 4.3 Experiment B `n=1` vs `n=3`

Configs: `B_sf_mix_n1.json` injects `fact_checker_injection` at **tick 1**; `B_sf_mix_n3.json` at **tick 3**. Both are N=1 runs.

Parser `miBeforeAfter` splits events with `ev.tick < splitTick` vs `>=`. Most scored events occur **late**, so `afterMean` is dominated by cascade volume. **Do not** interpret Δmean MI as a recovery causal effect. Required covariates if N≥3 later: `nBefore`, `nAfter`, tick of injection, and a **tick-matched** contrast (mean MI at t=split vs t=split+1 among nodes that received the correction).

---

## 5. Why Cohen’s d on length-1 averages is invalid (ABTestRunner bug)

**Do not use `src/ABTestRunner.js` effect sizes in the thesis.**

### 5.1 What the code does

1. `_runConfig` may run `this.runs` simulations and collect per-run metric objects.
2. `_aggregateRuns` **averages scalars first** (`giniCoefficient`, `structuralVirality`) into a **single number**. Time series are taken from the **last** run only.
3. `_compareMetrics` then computes:

```javascript
const d = this._cohensD([bm[key]], [vm[key]]);
```

Each group is a **length-1 array of the already-averaged scalar**.

4. `_cohensD`:

```javascript
const varA = aVals.reduce((s, v) => s + (v - meanA) ** 2, 0) / Math.max(1, aVals.length - 1);
```

For `n = 1`, `meanA = aVals[0]`, the squared deviation is **0**, `n-1` is replaced by `max(1,0)=1`, so **sample variance is 0**. Same for group B. Pooled SD is 0. The function **returns 0** whenever `pooledSD === 0`.

### 5.2 Why that is not an effect size

Cohen’s d is \((\bar x_B - \bar x_A) / s_{\text{pooled}}\). The denominator is a **within-group** SD estimated from **replicates**. A length-1 group has no within-group variance. The ratio is **0/0**, mapped to **d = 0**, then labelled `"negligible"` by `_interpretD`.

Consequences:

- Two conditions can differ by a large delta (e.g. Gini 0.06 vs 0.40) and still print **d = 0 (negligible)**.
- Even if `_aggregateRuns` were skipped, wrapping each side as `[mean]` still yields d = 0.
- Averaging **before** d destroys the only variance d is supposed to use. Correct order: keep replicate vectors of length N, then d (or Hedges’ g) on those vectors, requiring **N≥2** (and N≥3 in this plan).
- `Math.max(1, n-1)` silently prevents a divide-by-zero on n=1 and **hides** the undefined statistic.

**Thesis language:** report raw deltas at N=1. If N≥3, compute Hedges’ g on replicate-level DVs in analysis code **outside** `ABTestRunner`, with a footnote that the engine’s A/B harness is not a valid estimator.

---

## 6. Factorial structure (what is a contrast)

Experiment A is a **2 × 2 × 2** descriptive grid (not a fully powered ANOVA):

| Factor | Levels | Pfeffer mapping |
|---|---|---|
| Topology | scale-free vs ER | network clustering |
| BP mix | homogeneous conspiracy vs mixed 3 BP | identity alignment |
| Article (valence) | `scopex_2017` vs `chemtrails_gates_2018_2021` | valence |

Held: surprise (drip seed `node_0`), temporal acceleration (6 ticks / 6 hops), model (`gpt-4o-mini`), graph seed 42.

**Contrast order (narrative, not p-values at N=1):**

1. Same topology + same article, hom vs mix (identity).
2. Same mix + same article, SF vs ER (clustering).
3. Same cell, SCoPEx vs chemtrails (valence).
4. B: injection tick 1 vs 3 (confounded).

---

## 7. Missingness, scoring failures, and filters

1. **Unscored events:** exclude from MI/MPR/k\*; report count of null-MI by action.
2. **Auditor parse failure:** `Auditor._getIFDScores` defaults **all-correct (MI=0)** — this **biases MI downward**. Log cannot recover these post hoc unless raw LLM traces exist; state as limitation (`limitations_stats.md`).
3. **Prefer latest complete `runDir`** per `experimentName` when duplicates exist (parser uses `campaign_manifest.json` when `mode=real`).
4. Skip `experimentName === probe_api`.
5. Do not mix dry-run and real rows.

---

## 8. Analysis pipeline for the executor (no LLM)

1. Confirm `summary.json.mode === "real"` and `validity` string.
2. Rebuild event-level long table from `nodes/*.json` (U1) — do not rely only on summary rows.
3. Recompute k\* with `kstar_rules.md` (tick-network, hop-network, node-first). Cross-check against parser fields `kStar_network`, `firstMeanMiOver3`, `networkRecoveredAfterPropaganda`, `kStar_firstIrreversibleNode`, `kStar_hop`.
4. Build heatmaps / mixed distributions per `heatmap_spec.md`.
5. Fill `reporting_template.md` tables. Leave inferential columns blank or `N/A (N=1)`.
6. Copy limitation bullets from `limitations_stats.md` into the chapter, unchanged in substance.

**Python:** repo `.venv` only. No campaign rerun.

---

## 9. Software cross-walk (parser vs plan)

| Parser field | Plan name | Note |
|---|---|---|
| `meanNodeMPR` | cell-mean MPR | Unweighted across nodes; mixed graphs need persona split |
| `maxEventMI` | peak MI | `max(eventPeak, cascadeReach meanMI)` in parser — prefer **raw event max** from U1 |
| `kStar_network` | DV3 network | `null` if recovered **or** never crossed |
| `firstMeanMiOver3` | first crossing | Keep even when k\* is null (reversible spike) |
| `kStar_firstIrreversibleNode` | DV3 node tick | Earliest irreversible **node**, not network |
| `bRecovery` | Exp B split means | Confounded; nBefore/nAfter mandatory |
| `polarization.pi` | PI | Null if a group is empty |
| `distortionHeuristic` | Exp C | Keyword overlap only |

If recomputed k\* disagrees with the parser, **prefer the algorithm in `kstar_rules.md`**, and document the discrepancy in an appendix table.
