# Society Simulation — Architecture & Progress

Extension of the CIKM 2025 outstanding paper  
**"Simulating Misinformation Propagation in Social Networks using Large Language Models"**  
Submitted to **EMNLP 2025, Computational Social Science and Cultural Analytics track**

---

## What Was Built (MVP)

The original paper used a fixed linear chain of 30 nodes × 21 homogeneous/heterogeneous branches. This codebase extends that into a full **society simulation** where:

- Nodes exist in an arbitrary graph (not just a chain)
- Each node has a **persona** and a **model** (independently configurable)
- Nodes receive information from **multiple sources** simultaneously
- For each incoming article, a node makes a **decision**: `forward`, `reinterpret`, `drop`, or `dump`
- Decisions are governed by **trust scores** between nodes, which **evolve** over time
- Every node's full event history is persisted to disk (file-backed, not in-memory)
- The same QA-based **auditor** from the paper measures factual fidelity at every step
- A Python visualization pipeline converts every experiment run into publication-ready images

---

## File Layout

```
SocietySimulation/
├── config/
│   ├── models.js              # Model registry — add any provider/endpoint here
│   └── experiment.js          # Default experiment parameters (all overridable)
│
├── personas/
│   └── personas.json          # 22 personas (21 from paper + neutral baseline)
│
├── articles/
│   └── articles.json          # 5 seed articles across 5 domains
│
├── src/
│   ├── fileIO.js              # JSON read/write/update utilities (no in-memory state)
│   ├── llmClient.js           # Generic LLM caller (OpenAI / Anthropic / Ollama)
│   ├── SimulationNode.js      # Node class — inbox, decision engine, history
│   ├── SocietyGraph.js        # Graph builder (9 topology modes)
│   ├── Auditor.js             # QA scorer -> MI -> MPR -> severity
│   ├── BeliefEngine.js        # Layer 1 — per-node belief state + confirmation bias
│   ├── FrameAuditor.js        # Layer 2 — frame detection, sentiment drift, claim injection
│   ├── InterventionEngine.js  # Layer 4 — fact-checker, inoculation, content moderation
│   ├── MetricsEngine.js       # Layer 5 — extended metrics (Gini, SV, half-life, …)
│   ├── ABTestRunner.js        # Layer 6 — A/B testing harness with Cohen's d
│   └── Simulation.js          # Orchestrator — two-phase, resumable, all layers wired in
│
├── examples/
│   ├── run_linear_chain.json  # 5-node chain, 2 articles, 8 ticks
│   └── run_custom_graph.json  # 4-node politics graph with explicit edges
│
├── experiments/               # Created at runtime — one folder per run
│   └── exp_{timestamp}/
│       ├── state.json                   # Master state: phase, status, checkpoints
│       ├── metadata.json                # Config, status, final results
│       ├── graph_topology.json          # Snapshot of all nodes and edges
│       ├── nodes/
│       │   └── {nodeId}.json            # Per-node inbox, history, stats, relations
│       ├── beliefs/
│       │   └── {nodeId}.json            # Per-node belief state + emotional state (Layer 1)
│       ├── results_{articleId}.json     # Node summaries + all Layer 5 metrics
│       ├── human_eval_template.csv      # Sampled (original, rewritten) pairs for human rating
│       └── plots/             # Created by visualize.py
│           ├── 01_graph_topology.png
│           ├── 02_mpr_heatmap.png
│           ├── 03_action_distribution.png
│           ├── 04_propagation_wave.png
│           ├── 05_mi_trajectory.png
│           ├── 06_trust_evolution.png
│           └── dashboard.png
│
├── ab_tests/                  # Created by --ab-test runs
│   └── comparison_{timestamp}.json
├── visualize.py               # Python visualization pipeline
├── requirements_viz.txt       # Python dependencies for visualization
└── index.js                   # CLI entry point
```

---

## Quick Start

### Requirements

- Node.js (any recent version, no npm packages needed)
- Python 3.8+ with pip (for visualization only)
- An API key for at least one LLM provider (or use `--dry-run` for free testing)

### Install visualization dependencies

```bash
pip install -r requirements_viz.txt
# installs: matplotlib, networkx, seaborn, numpy
```

### Run a simulation (no API key needed)

```bash
# Dry-run: full pipeline, no LLM calls, zero cost
node index.js --dry-run --config examples/run_linear_chain.json
```

### Visualize the results

```bash
# Auto-picks the most recent experiment
python visualize.py --latest

# Or point at a specific run
python visualize.py experiments/exp_2026-05-20_16-58-40
```

Images are written to `experiments/{run}/plots/`.

---

## Components

### `config/models.js` — Model Registry

Defines every LLM provider the system can call. Add a new model by adding one entry:

```js
"my-model": {
  provider: "openai",           // "openai" | "anthropic" | "ollama"
  apiUrl: "https://...",
  model: "model-id",
  apiKeyEnv: "MY_API_KEY",      // env var name, null for local models
}
```

Supported providers out of the box:

| Model ID | Provider | Notes |
|---|---|---|
| `gpt-4o` | OpenAI | Requires `OPENAI_API_KEY` |
| `gpt-4o-mini` | OpenAI | Cheaper, faster |
| `claude-sonnet-4-6` | Anthropic | Requires `ANTHROPIC_API_KEY` |
| `ollama-llama3` | Ollama | Local, no key needed |

Any OpenAI-compatible endpoint (vLLM, Together, Fireworks, etc.) works by adding a new entry with `provider: "openai"`.

---

### `config/experiment.js` — Default Parameters

All parameters are overridable in a run config JSON. Key ones:

| Parameter | Default | Description |
|---|---|---|
| `topology` | `linear_chain` | Graph shape |
| `maxTicks` | `10` | Propagation rounds |
| `defaultModel` | `gpt-4o-mini` | Model for all nodes unless overridden |
| `auditorModel` | `gpt-4o-mini` | Model used by the auditor and FrameAuditor |
| `enableBeliefs` | `false` | Layer 1 — per-node belief state + confirmation bias |
| `enableFrameAnalysis` | `false` | Layer 2 — frame shift, sentiment drift, claim injection |
| `competitiveGroups` | `[]` | Layer 3 — article groups that propagate simultaneously |
| `interventions` | `[]` | Layer 4 — fact-checker, inoculation, content moderation |
| `trustThreshold` | `0.2` | Min trust to engage with a message |
| `actionWeights` | `{forward:0.3, reinterpret:0.5, drop:0.2}` | Sampling probabilities |
| `relationEvolution` | `true` | Trust scores change after interactions |
| `trustDelta` | `0.05` | How much trust shifts per interaction |
| `maxHops` | `8` | Hard cap on propagation depth |
| `activityPattern` | `"always"` | Node dormancy — `"always"` / `"weekly"` / `"random"` |
| `maxInboxSize` | `20` | Per-article inbox cap (prevents cascade floods in dense graphs) |
| `edgeDeletionThreshold` | `0.05` | Trust floor below which edges are removed |
| `strippedProperties` | `[]` | Persona properties to ablate |

---

### `personas/personas.json` — Persona Library

22 personas, all from the paper plus a neutral baseline. Each entry has:

```json
{
  "id": "politically_biased_left",
  "name": "Politically Biased Individual (Left-Wing)",
  "systemPrompt": "...",
  "tags": ["ideology", "political"],
  "emotionalTone": "passionate",
  "ideologicalBias": "left-wing",
  "expertiseDomain": null
}
```

The `tags`, `emotionalTone`, `ideologicalBias`, and `expertiseDomain` fields are metadata for ablation studies — pass their keys in `strippedProperties` to remove their influence from the system prompt at runtime.

**Full persona list:**

| ID | Name |
|---|---|
| `politically_biased_left` | Politically Biased Individual (Left-Wing) |
| `politically_biased_right` | Politically Biased Individual (Right-Wing) |
| `lifestyle_influencer` | Social Media Influencer (Lifestyle Influencer) |
| `brand_collaborator` | Social Media Influencer (Brand Collaborator) |
| `sensationalist_news` | News Agency (Sensationalist) |
| `neutral_news` | News Agency (Politically Neutral) |
| `medical_expert` | Domain Expertise Specialist (Medical Expert) |
| `tech_expert` | Domain Expertise Specialist (Technology Expert) |
| `conflict_creator` | Intentional Agent (Conflict Creator) |
| `peacekeeper` | Intentional Agent (Peacekeeper) |
| `simplifier` | Content Creator with Simple Tone (Simplifier) |
| `rural_educator` | Rural Educator (Primary Educator) |
| `young_parent` | Parent (Young Parent) |
| `low_education` | Contextually Unaware Agent (Low Education Level) |
| `lgbtq_advocate` | Gender Equality Advocate (LGBTQ+ Advocate) |
| `investigative_journalist` | Journalist (Investigative Journalist) |
| `opinion_columnist` | Journalist (Opinion Columnist) |
| `religious_leader` | Religious Leader (Conservative Religious Leader) |
| `gadget_enthusiast` | Tech-Savvy Consumer (Gadget Enthusiast) |
| `environmentalist` | Environmentalist (Sustainable Living Advocate) |
| `startup_founder` | Entrepreneur (Tech Startup Founder) |
| `neutral` | Neutral Agent (No Persona) — baseline |

---

### `articles/articles.json` — Seed Articles

5 real articles from the paper, each with pre-written auditor questions and ground-truth answers:

| ID | Domain | Title |
|---|---|---|
| `crime_0` | crime | FBI 2023 Crime Report |
| `education_0` | education | AI in College Debate |
| `technology_0` | technology | IBM AI Debater |
| `politics_0` | politics | AI Policy: Trump vs Harris |
| `healthcare_0` | healthcare | Cancer Facts 2024 |

Each article carries 5 yes/no questions and a `groundTruth` boolean array used by the auditor.

---

### `src/fileIO.js` — File-Backed State

All node state is stored as JSON on disk. No node data lives in memory between ticks. Key functions:

- `readJSON(path)` — parse a JSON file
- `writeJSON(path, data)` — atomic write (creates dirs if needed)
- `updateJSON(path, fn)` — read → apply function → write (used for inbox delivery)

This design keeps RAM flat regardless of graph size or simulation depth, which is critical for long runs (30+ ticks × 21+ nodes).

---

### `src/llmClient.js` — LLM Client

Single `callLLM(modelId, systemPrompt, userPrompt)` function. Dispatches to the correct provider based on `config/models.js`. Uses Node's built-in `https`/`http` — no external dependencies required.

**Dry-run mode:** when `DRY_RUN=1` is set, all LLM calls are intercepted locally — node rewrites return the input unchanged, auditor calls return a perfect-fidelity JSON response. No network traffic, no cost.

---

### `src/SimulationNode.js` — Node Decision Engine

Each node is backed by a JSON file at `experiments/{id}/nodes/{nodeId}.json`:

```json
{
  "nodeId": "left_wing",
  "personaId": "politically_biased_left",
  "modelId": "gpt-4o-mini",
  "relations": { "journalist": 0.5, "right_wing": 0.2 },
  "params": {},
  "inbox": [],
  "history": [
    {
      "tick": 2,
      "articleId": "politics_0",
      "sourceNodeId": "origin",
      "hops": 1,
      "action": "reinterpret",
      "contentIn": "...",
      "contentOut": "...",
      "misinfoIndex": null,
      "reason": null,
      "timestamp": "2025-05-20T..."
    }
  ],
  "stats": {
    "received": 4,
    "forwarded": 1,
    "reinterpreted": 2,
    "dropped": 0,
    "dumped": 1
  }
}
```

`misinfoIndex` is `null` during the propagation phase and is backfilled to an integer (0–5) during the audit phase.

**Propagation tick decision flow (`processTick`):**

```
For each message in inbox:
  1. Check hops < maxHops              -> drop if exceeded
  2. Check sourceTrust >= threshold    -> drop if too low
  3. Sample action from actionWeights  -> forward / reinterpret / drop / dump
  4. If reinterpret: call LLM with persona system prompt
  5. Record event with misinfoIndex = null (auditing deferred)
  6. Write outgoing messages to neighbor inboxes
  7. Clear inbox, flush node file
```

**Audit phase (`auditPendingEvents`):**

```
For each history event where misinfoIndex === null and action in {forward, reinterpret}:
  1. Call auditor.score(articleId, contentOut) -> MI integer
  2. Write MI back into the history event
  3. Apply trust evolution: if MI > 3 decrease trust in source by trustDelta, else increase
  4. Flush node file
```

**`create()` is idempotent** — if the node file already exists (resume scenario), the write is skipped entirely so no partial state is overwritten.

---

### `src/SocietyGraph.js` — Graph Topologies

Nine topology builders covering both baseline and real-world-inspired structures. All accept a `nodeConfigs` array (with `personaId` pre-assigned) and return a `SocietyGraph`.

Edges are directed. Trust scores are stored in the source node's `relations` map and optionally adjusted using **homophily** (nodes sharing persona tags receive higher initial trust).

**`addEdge()` is idempotent** — if a trust score already exists for a target, the write is skipped. This preserves evolved trust values when an experiment is resumed.

**`loadExisting(experimentDir)`** reconstructs a `SocietyGraph` from a saved `graph_topology.json` without touching any node files. Used exclusively by the resume path.

#### Baseline topologies

| Topology key | Description |
|---|---|
| `linear_chain` | node_0 -> node_1 -> ... -> node_n. Original CIKM paper structure. |
| `ring` | Each node connects to next; last wraps to first. |
| `random_er` | Erdos-Renyi: each pair connected with probability `edgeProbability`. |
| `custom` | Explicit `edges` list with per-edge trust scores and per-node personas. |

#### Real-world society topologies

| Topology key | Real-world analogy | Network science model |
|---|---|---|
| `small_world` | Offline friend groups, academic circles, workplaces | Watts-Strogatz |
| `scale_free` | Twitter/X, YouTube, news aggregation — few hubs, many followers | Barabasi-Albert preferential attachment |
| `echo_chamber` | Facebook groups, partisan subreddits, ideological silos | Stochastic block model — dense intra, sparse inter |
| `polarized` | Strongly partisan political Twitter, extreme two-party systems | Two-cluster block model with bridge nodes |
| `hierarchical` | Traditional media (editor -> reporter -> audience), org comms, government | Rooted B-ary tree |

#### How each model works

**Small-world (Watts-Strogatz)**
1. Start with a ring lattice where every node connects to its `k` nearest neighbours.
2. For each edge, with probability `beta`, rewire the target to a random node.
Result: high local clustering (your friends know each other) with occasional long-range shortcuts (six degrees of separation).

**Scale-free (Barabasi-Albert)**
1. Seed with a small fully-connected core of `m+1` nodes.
2. Add remaining nodes one at a time; each new node connects to `m` existing nodes chosen with probability proportional to their current degree.
Result: power-law degree distribution — a few super-connected hubs (influencers, major outlets) and many ordinary nodes. Hub nodes act as super-spreaders.

**Echo chamber**
Divide nodes into `numChambers` clusters. Within a cluster: high edge probability (`intraEdgeProb`) and high trust (`intraTrust`). Between clusters: low edge probability (`interEdgeProb`) and low trust (`interTrust`). Persona pools per cluster are configurable; default assigns left-leaning, right-leaning, and expert personas to separate clusters.

**Polarized**
Variant of echo chamber hardened to two clusters with very sparse cross-cluster edges (`interEdgeProb ~0.04`) and near-zero cross trust (`interTrust ~0.10`). Designated `bridgeNodeIds` (e.g. neutral news, investigative journalists) receive moderate probability of connecting to either side. Models extreme political polarization.

**Hierarchical**
Rooted B-ary tree with `branchingFactor` children per node. Parent-to-child edges carry high trust (`downTrust ~0.85`) — authority speaks downward. Optional child-to-parent edges carry low trust (`upTrust ~0.25`) — audience feedback is rarely believed. Default persona assignment: root = authoritative media, mid-levels = editors/reporters, leaves = general audience.

#### Homophily trust

All society topologies (small_world, scale_free, echo_chamber, polarized, hierarchical) support homophily-based trust initialisation. When `personaMap` is available, the trust on each edge is adjusted using Jaccard similarity of the two nodes' persona tags:

- Same tags (e.g. both `ideology`) -> trust boosted toward `baseTrust + 0.3`
- No shared tags -> trust reduced toward `baseTrust - 0.2`

This means a left-wing persona automatically trusts another left-wing persona more than a medical expert, without any manual configuration.

---

### `src/Auditor.js` — Misinformation Metrics

Implements the same QA-based auditor from the paper.

**Misinformation Index (MI)** at a node — number of questions whose answer in the rewritten text differs from the ground-truth answer in the original article (0 = perfect fidelity, 5 = complete distortion for 5-question articles).

**Misinformation Propagation Rate (MPR)** for a branch — mean MI across all events in that node's history for a given article.

**Severity taxonomy:**

| MPR range | Tier | Colour in plots |
|---|---|---|
| <= 1 | `factual_error` | Green |
| 1 – 3 | `lie` | Orange |
| > 3 | `propaganda` | Red |

---

### `src/Simulation.js` — Orchestrator

Runs the experiment in two sequential phases, with a `state.json` checkpoint written before and after every article so any interruption can be resumed exactly.

#### Two-phase execution

**Phase 1 — Propagation**

All ticks run using LLM rewrite calls only. The auditor is never called. `misinfoIndex` in every history event is left as `null`. Trust scores do not evolve during this phase.

```
For each article (skipping already-completed ones per state.json):
  1. Write state.json (currentArticle, currentTick = 0)
  2. Clean any partial state from a previous interrupted attempt
  3. Seed the article into seed node inboxes
  4. Tick loop up to maxTicks:
       - Each node with inbox messages calls processTick()
       - Outgoing messages delivered to neighbor inboxes
       - state.json updated with currentTick
       - Early exit if no messages propagate
  5. Mark article complete in state.json
```

**Phase 2 — Audit**

After all propagation is done, every node's history is scanned for null `misinfoIndex` entries. These are scored by the auditor in bulk, MI is written back, and trust evolution is applied.

```
For each article (skipping already-audited ones per state.json):
  1. Write state.json (currentArticle)
  2. For each node: call auditPendingEvents(articleId, auditor, trustDelta)
  3. Write results_{articleId}.json
  4. Mark article audited in state.json
```

#### `state.json` — Master State File

Written to `experiments/{id}/state.json` at every checkpoint:

```json
{
  "experimentId": "exp_2026-05-20_18-17-04",
  "phase": "audit",
  "status": "complete",
  "propagation": {
    "completedArticles": ["crime_0", "technology_0"],
    "currentArticle": null,
    "currentTick": 0
  },
  "audit": {
    "completedArticles": ["crime_0", "technology_0"],
    "currentArticle": null
  },
  "error": null,
  "lastUpdated": "2026-05-20T18:17:04.785Z"
}
```

`status` values: `in_progress` | `complete` | `failed`  
`phase` values: `propagation` | `audit`

On failure, `error` contains `{ phase, articleId, message, timestamp }`.

#### Resume path (`Simulation.resume(experimentDir)`)

```
1. Read state.json
2. If status === "complete": load metadata.json and return existing results
3. Otherwise:
   a. Load saved config from metadata.json
   b. Rebuild graph via SocietyGraph.loadExisting() (preserves evolved trust)
   c. Continue _execute() from the saved phase and completedArticles lists
   d. For any in-progress article: clean partial state then restart from tick 0
```

---

### `index.js` — CLI

```bash
node index.js                                                    # run with all defaults
node index.js --dry-run                                          # no LLM calls, free
node index.js --config examples/run_linear_chain.json            # custom config
node index.js --config examples/run_custom_graph.json            # 4-node politics graph
node index.js --dry-run --config examples/run_linear_chain.json  # dry-run + config
node index.js --resume experiments/exp_2026-05-20_18-17-04       # resume interrupted run
node index.js --dry-run --resume experiments/exp_...             # resume with dry-run
node index.js --list-personas                                    # print all persona IDs
node index.js --list-articles                                    # print all article IDs

# A/B testing — compare two or more topologies/configs on the same metrics
node index.js --dry-run --ab-test \
    --base examples/run_linear_chain.json \
    --variant examples/run_echo_chamber.json \
    [--variant examples/run_polarized.json] \
    [--runs 3]
```

`--resume` accepts both relative and absolute paths. If the target experiment is already complete, it prints the summary and exits without re-running anything.

`--ab-test` requires `--base` and at least one `--variant`. For meaningful effect sizes, both configs should use the same `seedArticles`. The report is written to `ab_tests/comparison_{timestamp}.json`.

---

## Extended Architecture — Six Research Layers

### Layer 1: Node-level cognition (`src/BeliefEngine.js`)

Enable with `"enableBeliefs": true` in run config. Adds two extra LLM calls per message processed — one for alignment scoring, one for belief update. Free to test via `--dry-run`.

**Belief state** is stored per-node at `experiments/{id}/beliefs/{nodeId}.json`:

```json
{
  "nodeId": "node_0",
  "topicBeliefs": {
    "politics_0": { "stance": "AI deregulation risks civil liberties", "confidence": 0.72, "encounterCount": 3, "lastUpdatedTick": 5 }
  },
  "emotionalState": { "emotion": "excited", "intensity": 0.45, "lastUpdatedTick": 5 }
}
```

**Confirmation bias** — before sampling an action, the node's existing stance is compared to the incoming content via an LLM call that returns an alignment score [0, 1]. The score shifts the action weight distribution:

| Alignment | Effect |
|---|---|
| High (> 0.7) | Forward probability ↑, drop probability ↓ — node amplifies agreeable content |
| Low (< 0.3) | Drop probability ↑ — node rejects disconfirming information |
| Any | High emotional intensity ↑ reinterpret probability — emotionally primed nodes distort more |

**Emotional state** decays by 15% per tick (configurable). Spikes on reinterpret actions (+0.25) and on confirmed high-MI content in the audit phase (+0.30). Beliefs persist across articles — cross-article memory is automatic.

---

### Layer 2: Content-level analysis (`src/FrameAuditor.js`)

Enable with `"enableFrameAnalysis": true`. Runs in the audit phase alongside the QA auditor. Each audited history event gets a `frameAnalysis` field:

```json
{
  "frameShift": 0.72,
  "sentiment": -0.4,
  "sentimentDelta": -0.65,
  "newClaims": ["Scientists confirmed 100% safety", "Government is hiding data"],
  "coherenceScore": 0.6
}
```

| Field | Range | Meaning |
|---|---|---|
| `frameShift` | 0–1 | 0 = same framing, 1 = completely reframed |
| `sentiment` | -1–1 | Emotional valence of the rewritten text |
| `sentimentDelta` | -2–2 | Change in valence from original to rewrite |
| `newClaims` | list | Claims injected by the node not present in the original |
| `coherenceScore` | 0–1 | How coherent is the rewrite as information |

Aggregate frame metrics (mean frame shift, total new claims) are included in `results_{articleId}.json` under `metrics.frameMetrics`.

---

### Layer 3: Network dynamics

**Competitive propagation** — two or more articles seeded simultaneously into the same network and run through the same tick loop. Configure via `competitiveGroups`:

```json
{
  "competitiveGroups": [
    { "articles": ["politics_0", "healthcare_0"], "seedNodes": ["node_0"] }
  ]
}
```

Both articles compete for node attention (inbox cap applies per-article). Use this to replicate Vosoughi et al.'s finding that falsehood propagates faster than truth by seeding a distorted variant alongside the original.

**Node activity patterns** — configure via `nodeParams.activityPattern`:

| Value | Behaviour |
|---|---|
| `"always"` | Active every tick (default) |
| `"weekly"` | Active on tick 1, 8, 15, ... (models low-frequency users) |
| `"random"` | Active each tick with 70% probability |

Dormant nodes hold their inbox and process it on the next active tick.

**Inbox cap** (`nodeParams.maxInboxSize`, default 20) — limits messages queued per article per node. Prevents exponential cascade floods in dense topologies (echo chamber, scale-free). Realistic: social media feeds have a finite scroll depth.

**Edge deletion** — when trust on an edge drops below `nodeParams.edgeDeletionThreshold` (default 0.05) during the audit phase, the edge is removed from `state.relations`. Models unfollowing behaviour after repeated exposure to low-quality content from a source.

---

### Layer 4: External interventions (`src/InterventionEngine.js`)

Configure via the `interventions` array in the run config. Each intervention fires at a specific tick:

```json
{
  "interventions": [
    {
      "type": "fact_checker_injection",
      "tick": 5,
      "articleId": "politics_0",
      "targetNodes": ["node_0", "node_1"],
      "params": { "correctionStrength": 0.9 }
    },
    {
      "type": "inoculation",
      "tick": 0,
      "articleId": "politics_0",
      "targetNodes": ["node_3", "node_4"]
    },
    {
      "type": "content_moderation",
      "tick": 4,
      "articleId": "politics_0",
      "targetNodes": ["node_0"],
      "params": { "maxHops": 3 }
    }
  ]
}
```

| Type | Mechanism | Research question |
|---|---|---|
| `fact_checker_injection` | Injects the original article as a high-trust correction message | Does truth correct misinformation after it spreads? |
| `inoculation` | Seeds a pre-emptive warning before the article arrives | Does prebunking reduce receptivity? |
| `content_moderation` | Removes messages that have travelled > N hops from target inboxes | What is the optimal moderation threshold to minimise MPR? |

---

### Layer 5: Extended metrics (`src/MetricsEngine.js`)

All metrics are computed after the audit phase and stored in `results_{articleId}.json` under the `metrics` key. No additional LLM calls.

| Metric | Method | What it measures |
|---|---|---|
| Information half-life | `informationHalfLife()` | Tick at which MI first exceeds 50% of max. Short half-life = fast degradation |
| Cascade reach vs. fidelity | `cascadeReachVsFidelity()` | Scatter: eventCount vs meanMI per node. Identifies super-spreaders of distortion |
| Network MI over time | `networkMIOverTime()` | Mean MI across all nodes at each tick — society-level misinformation trajectory |
| Gini coefficient | `giniCoefficient()` | MI inequality across nodes. High Gini = distortion isolated in specific clusters |
| Critical mass threshold | `criticalMassThreshold()` | Fraction of nodes with MI > 3 at each tick — tipping-point detection |
| Structural virality | `structuralVirality()` | Goel et al. average pairwise distance in propagation tree. Low = broadcast, high = viral chain |
| Frame metrics | `frameMetrics()` | Aggregate frame shift, sentiment delta, total injected claims (requires Layer 2) |
| Human eval CSV | `buildHumanEvalCSV()` | Sample of (original, rewritten) pairs with blank rating columns for crowd-sourcing |

The key metrics (Gini, structural virality, MI half-life) are printed in the console summary after each run.

---

### Layer 6: Validation infrastructure (`src/ABTestRunner.js`)

**A/B testing harness** — runs a baseline config and one or more variant configs, collects Layer 5 metrics for each, and computes Cohen's d effect sizes. Best practice: vary exactly one parameter (topology, persona pool, trust delta) while keeping `seedArticles` identical.

```bash
node index.js --dry-run --ab-test \
  --base  examples/run_linear_chain.json \
  --variant examples/run_echo_chamber.json \
  --runs 3
```

Effect size interpretation follows Cohen's d conventions: < 0.2 negligible, 0.2–0.5 small, 0.5–0.8 medium, > 0.8 large.

**Human evaluation export** — `human_eval_template.csv` is generated automatically at the end of every run. Columns: `eval_id`, `article_id`, `node_id`, `persona_id`, `tick`, `action`, `original_text`, `rewritten_text`, `auditor_mi`, `frame_shift`, plus blank `rating_factual`, `rating_frame`, `rating_persuasion` columns for raters. Upload to Label Studio, Mechanical Turk, or share with co-authors directly.

---

## Visualization Pipeline (`visualize.py`)

A standalone Python script that reads every JSON file from an experiment run and produces 7 images.

### Setup

```bash
pip install -r requirements_viz.txt
```

`requirements_viz.txt`:
```
matplotlib>=3.7
networkx>=3.1
seaborn>=0.12
numpy>=1.24
```

### Running

```bash
# Auto-pick the most recent experiment folder
python visualize.py --latest

# Point at a specific experiment
python visualize.py experiments/exp_2026-05-20_16-58-40

# Write images to a custom directory (e.g. for a paper submission)
python visualize.py --latest --out-dir paper_figures/
```

### Generated images

All images use a dark theme and are saved at 150 DPI.

| File | Panel | What it shows |
|---|---|---|
| `01_graph_topology.png` | Graph | Directed graph of nodes and edges. Node colour = persona category, node size = total messages received across all articles, edge width and colour = trust score. Trust delta (initial vs final) annotated when relation evolution is on. |
| `02_mpr_heatmap.png` | Heatmap | Nodes (rows) x articles (columns) MPR table. Severity colour scale: green (factual_error <=1), orange (lie 1-3), red (propaganda >3). Mirrors Fig 3 from the CIKM paper. |
| `03_action_distribution.png` | Bar chart | Stacked bar per node showing forward / reinterpret / drop / dump message counts across all articles. |
| `04_propagation_wave.png` | Line chart | Messages generated per tick per article — shows propagation speed and reach before the article dies out. |
| `05_mi_trajectory.png` | Line chart | MI value at each tick for every (node, article) pair. Background bands mark severity tiers. Mirrors Fig 4 from the paper. |
| `06_trust_evolution.png` | Bar chart | Initial vs final trust score for every directed edge. Delta annotated in green (trust grew) or red (trust dropped). |
| `dashboard.png` | All panels | All 6 plots plus an experiment metadata banner in a single 22x20 figure. Ready for sharing or quick review. |

### Persona category colour key (graph topology)

| Category | Colour |
|---|---|
| ideology / political | Purple |
| media | Blue |
| expert | Green |
| social-media | Pink |
| advocacy | Teal |
| intentional | Orange |
| education / community | Yellow / Brown |
| environment | Dark green |
| consumer / entrepreneurship | Coral / Amber |
| neutral / cognitive | Grey |

---

## End-to-End Test Run (No API Key)

This sequence exercises the complete pipeline — simulation + visualization — in under 10 seconds with no external calls.

```bash
# 1. Dry-run a linear chain (5 nodes, 2 articles, 8 ticks)
node index.js --dry-run --config examples/run_linear_chain.json

# 2. Visualize it
python visualize.py --latest

# 3. Check outputs
#    experiments/exp_{timestamp}/
#      state.json               <- phase: audit, status: complete
#      metadata.json
#      graph_topology.json
#      nodes/node_0.json ... node_4.json   <- misinfoIndex filled in by audit phase
#      results_crime_0.json
#      results_technology_0.json
#      plots/
#        01_graph_topology.png
#        02_mpr_heatmap.png
#        03_action_distribution.png
#        04_propagation_wave.png
#        05_mi_trajectory.png
#        06_trust_evolution.png
#        dashboard.png
```

Or test the custom 4-node politics graph:

```bash
node index.js --dry-run --config examples/run_custom_graph.json
python visualize.py --latest
```

### Test resumability

```bash
# 1. Start a dry-run
node index.js --dry-run --config examples/run_linear_chain.json

# 2. Grab the experiment directory from the output, then resume it
#    (it finishes instantly since status is already "complete")
node index.js --dry-run --resume experiments/exp_2026-05-20_18-17-04

# 3. To test a mid-run resume, open state.json in the experiment folder,
#    set "status": "failed" and "phase": "propagation", then run --resume.
#    The simulation will re-run only the incomplete articles.
```

---

## Running a Real Experiment

### Set API keys (PowerShell)

```powershell
$env:OPENAI_API_KEY = "sk-..."
# or
$env:ANTHROPIC_API_KEY = "sk-ant-..."
```

### Set API keys (bash)

```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
```

### Run

```bash
node index.js --config examples/run_linear_chain.json
```

### Then visualize

```bash
python visualize.py --latest
```

---

## Society Topology Configs

Each topology has a ready-to-use example config in `examples/`. Run any with `--dry-run` first.

### Small-world — `examples/run_small_world.json`

```json
{
  "topology": "small_world",
  "topologyParams": { "numNodes": 15, "k": 4, "beta": 0.15 },
  "seedArticles": ["crime_0", "healthcare_0"],
  "seedNodes": ["node_0"]
}
```
`k` controls neighbourhood size; `beta` controls rewiring probability (0 = pure ring lattice, 1 = random graph).

### Scale-free — `examples/run_scale_free.json`

```json
{
  "topology": "scale_free",
  "topologyParams": { "numNodes": 20, "m": 2 },
  "seedArticles": ["technology_0", "politics_0"],
  "seedNodes": ["node_0"]
}
```
`m` = number of edges each new node adds. Higher m -> denser hub formation.

### Echo chamber — `examples/run_echo_chamber.json`

```json
{
  "topology": "echo_chamber",
  "topologyParams": {
    "numNodes": 18, "numChambers": 3,
    "intraEdgeProb": 0.70, "interEdgeProb": 0.05,
    "intraTrust": 0.85,    "interTrust": 0.15,
    "personasByCluster": [
      ["politically_biased_left", "lgbtq_advocate", "environmentalist", "lifestyle_influencer"],
      ["politically_biased_right", "religious_leader", "young_parent", "gadget_enthusiast"],
      ["neutral_news", "investigative_journalist", "medical_expert", "tech_expert"]
    ]
  },
  "defaultPersonaAssignment": "by_cluster"
}
```
Omit `personasByCluster` to use built-in defaults for 2 or 3 chambers.

### Polarized — `examples/run_polarized.json`

```json
{
  "topology": "polarized",
  "topologyParams": {
    "numNodes": 14,
    "intraEdgeProb": 0.78, "interEdgeProb": 0.04,
    "intraTrust": 0.90,    "interTrust": 0.08,
    "bridgeNodeIds": ["node_6", "node_7"]
  },
  "defaultPersonaAssignment": "by_cluster"
}
```
`bridgeNodeIds` are exempt from cluster assignment and connect to both sides.

### Hierarchical — `examples/run_hierarchical.json`

```json
{
  "topology": "hierarchical",
  "topologyParams": {
    "numNodes": 13,
    "branchingFactor": 3,
    "downTrust": 0.82,
    "upTrust": 0.25
  },
  "defaultPersonaAssignment": "by_cluster"
}
```
Set `upTrust: 0` to make information flow strictly downward.

---

## Writing a Run Config

A run config is a plain JSON file. Any field not set falls back to `config/experiment.js`.

### Minimal (all defaults)
```json
{}
```

### Linear chain, specific articles
```json
{
  "topology": "linear_chain",
  "topologyParams": { "numNodes": 6 },
  "maxTicks": 10,
  "seedArticles": ["crime_0"],
  "seedNodes": ["node_0"]
}
```

### Custom graph — per-node models and personas
```json
{
  "topology": "custom",
  "maxTicks": 6,
  "seedArticles": ["politics_0"],
  "seedNodes": ["origin"],
  "nodes": [
    { "nodeId": "origin",     "personaId": "neutral",                 "modelId": "gpt-4o-mini" },
    { "nodeId": "left_wing",  "personaId": "politically_biased_left",  "modelId": "gpt-4o" },
    { "nodeId": "right_wing", "personaId": "politically_biased_right", "modelId": "claude-sonnet-4-6" },
    { "nodeId": "journalist", "personaId": "investigative_journalist", "modelId": "gpt-4o-mini" }
  ],
  "edges": [
    { "from": "origin",     "to": "left_wing",  "trust": 0.7 },
    { "from": "origin",     "to": "right_wing", "trust": 0.7 },
    { "from": "left_wing",  "to": "journalist", "trust": 0.5 },
    { "from": "right_wing", "to": "journalist", "trust": 0.5 },
    { "from": "left_wing",  "to": "right_wing", "trust": 0.2 },
    { "from": "right_wing", "to": "left_wing",  "trust": 0.2 }
  ]
}
```

### Ablation — strip emotional tone from all personas
```json
{
  "nodeParams": {
    "strippedProperties": ["emotionalTone"]
  }
}
```

---

## Extending the System

### Add a new persona
Append an entry to `personas/personas.json` — no code changes needed.

### Add a new article
Append an entry to `articles/articles.json` with `id`, `domain`, `title`, `text`, `questions` (array of strings), and `groundTruth` (array of booleans).

### Add a new LLM provider
Add an entry to `config/models.js` and add the matching dispatch branch in `src/llmClient.js`.

### Add a new topology
Add a static `build*` method to `src/SocietyGraph.js` and a matching `if` branch in `Simulation._buildGraph()`.

### Add a new visualization panel
Add a `plot_*` function to `visualize.py` following the same `(data..., ax)` signature, call `save_individual` for it, and add an `ax` slot to `build_dashboard`.

---

## Planned Next Steps (EMNLP Extension)

- [x] Dry-run mode — full pipeline with no LLM calls
- [x] Visualization pipeline — 7 images per experiment run
- [x] Society-realistic topologies — small-world, scale-free, echo chamber, polarized, hierarchical
- [x] Homophily-based trust — personas with matching tags get higher initial trust
- [x] Cluster-aware persona assignment — `by_cluster` strategy for echo chamber and polarized
- [x] Propagation-first, audit-last architecture — LLM rewrites and QA scoring decoupled
- [x] Full resumability — `state.json` master state with per-article checkpoints; `--resume` CLI flag
- [x] Layer 1: Node-level cognition — belief state, confirmation bias, emotional priming
- [x] Layer 2: Content-level analysis — frame detection, sentiment drift, claim injection
- [x] Layer 3: Network dynamics — competitive propagation, node dormancy, inbox cap, edge deletion
- [x] Layer 4: External interventions — fact-checker injection, inoculation, content moderation
- [x] Layer 5: Extended metrics — Gini, structural virality, half-life, critical mass, reach vs fidelity
- [x] Layer 6: Validation infrastructure — A/B testing with Cohen's d, human eval CSV export
- [ ] Continuous MI scoring (0.0–1.0 float) replacing binary question answers
- [ ] Multi-model ablation runner — same persona, N different models, compare MPRs
- [ ] Temporal dynamics — trust decay over time, re-seeding articles mid-simulation
- [ ] Strategic node placement optimizer — given K expert nodes, find placement minimizing MPR
- [ ] Batch API support for cheaper large-scale runs
- [ ] More articles (target: 10 domains x 3 articles each, matching paper scale)
- [ ] Export graph as Graphviz DOT for inclusion in paper figures
