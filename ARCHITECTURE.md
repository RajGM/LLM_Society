# Society Simulation — Architecture & Progress

Extension of the CIKM 2025 outstanding paper  
**"Simulating Misinformation Propagation in Social Networks using Large Language Models"**  
Submitted to **EMNLP 2025, Computational Social Science and Cultural Analytics track**

---

## What Was Built

The original paper used a fixed linear chain of 30 nodes × 21 homogeneous/heterogeneous branches. This codebase extends that into a full **society simulation** where:

- Nodes exist in an arbitrary graph (not just a chain)
- Each node has a **persona** and a **model** (independently configurable)
- Nodes receive information from **multiple sources** simultaneously
- For each incoming message, a node makes a **decision**: `forward`, `reinterpret`, `drop`, or `dump`
- Decisions are governed by **trust scores** between nodes, which **evolve** over time
- Every node's full event history is persisted to disk (file-backed, not in-memory)
- The same QA-based **auditor** from the paper measures factual fidelity at every step
- Six research layers and five extensions add cognitive, structural, strategic, and institutional modeling
- A Python visualization pipeline converts every experiment run into publication-ready images (19 plot types + dashboard)

---

## File Layout

```
SocietySimulation/
├── config/
│   ├── models.js              # Model registry — add any provider/endpoint here
│   └── experiment.js          # Default parameters (all overridable per run)
│
├── personas/
│   └── personas.json          # 26 personas (22 human + 4 bot personas)
│
├── articles/
│   └── articles.json          # 5 seed articles across 5 domains
│
├── src/
│   ├── fileIO.js              # JSON read/write/update utilities (no in-memory state)
│   ├── llmClient.js           # Generic LLM caller (OpenAI / Anthropic / Ollama)
│   ├── SimulationNode.js      # Node class — inbox, decision engine, history, audit
│   ├── SocietyGraph.js        # Graph builder (9 topology modes) + matrix helpers
│   ├── Auditor.js             # QA scorer -> MI -> MPR -> severity
│   ├── Simulation.js          # Orchestrator — two-phase, resumable, all layers wired
│   ├── DSLCompiler.js         # Society DSL — YAML scenario → JSON run config
│   │
│   ├── BeliefEngine.js        # Layer 1 — per-node belief state + confirmation bias
│   ├── FrameAuditor.js        # Layer 2 — frame detection, sentiment drift, claim injection
│   ├── InterventionEngine.js  # Layer 4 — fact-checker, inoculation, content moderation
│   ├── MetricsEngine.js       # Layer 5 — extended metrics (Gini, SV, half-life, bot impact)
│   ├── ABTestRunner.js        # Layer 6 — A/B testing harness with Cohen's d
│   │
│   ├── ProvenanceEngine.js    # Extension 1 — multi-hop chain trust
│   ├── NetworkEvolution.js    # Extension 3 — homophily-driven edge creation/deletion
│   ├── StrategyEngine.js      # Extension 4 — utility-maximising strategic agents
│   ├── OpinionDynamics.js     # Extension 8 — DeGroot / BC / Voter model
│   ├── InstitutionalTrust.js  # Extension 9 — per-node trust toward 4 institutions
│   ├── BotEngine.js           # Extension 10 — bot detection, injection, centrality
│   ├── BotResilienceRunner.js # Extension 10 — 3-phase experiment automation
│   │
│   ├── PolarizationMetrics.js # Extension 11 — Polarization Index, phase transition detection
│   ├── MultiCycleRunner.js    # Extension 11 — multi-cycle runner with belief carry-over
│   │
│   ├── RealGraphImporter.js   # Extension 12 — FakeNewsNet/PHEME cascade importer
│   ├── ValidationMetrics.js   # Extension 12 — cascade structure metrics (depth, breadth, SV)
│   ├── ValidationComparison.js # Extension 12 — KS test, JS divergence, DTFS
│   ├── ContentDriftValidation.js # Extension 12 — sentiment trajectory comparison
│   ├── DigitalTwinRunner.js   # Extension 12 — single-cascade digital twin experiment
│   ├── BatchValidationRunner.js  # Extension 12 — N-cascade distributional validation
│   └── SensitivityRunner.js   # Extension 12 — persona inference sensitivity analysis
│
├── scenarios/
│   └── climate_debate.yaml    # Example DSL scenario (202 nodes, all extensions)
│
├── data/
│   └── fakenewsnet/           # Sample cascade files for Extension 12
│       ├── sample_cascade.json      # 13-node fake-news cascade
│       └── sample_cascade_real.json # 8-node real-news cascade
│
├── examples/
│   ├── run_linear_chain.json
│   ├── run_custom_graph.json
│   ├── run_small_world.json
│   ├── run_scale_free.json
│   ├── run_echo_chamber.json
│   ├── run_polarized.json
│   ├── run_hierarchical.json
│   ├── run_bot_resilience.json  # Bot resilience echo-chamber baseline config
│   ├── run_polarization.json    # Emergent polarization 24-node ER config (Extension 11)
│   └── run_digital_twin.json    # Digital twin validation config (Extension 12)
│
├── experiments/               # Created at runtime — one folder per run
│   ├── exp_{timestamp}/
│   │   ├── state.json                        # Master state: phase, status, checkpoints
│   │   ├── metadata.json                     # Config, status, final results
│   │   ├── graph_topology.json               # Snapshot of all nodes and edges
│   │   ├── nodes/
│   │   │   └── {nodeId}.json                 # Per-node inbox, history, stats, relations
│   │   ├── beliefs/
│   │   │   └── {nodeId}.json                 # Per-node belief + emotional state (Layer 1)
│   │   ├── institutional_trust.json          # Per-node institutional trust (Extension 9)
│   │   ├── results_{articleId}.json          # Node summaries + Layer 5/10 metrics
│   │   ├── opinion_dynamics_{articleId}.json # DeGroot / BC / Voter results (Extension 8)
│   │   ├── human_eval_template.csv           # (original, rewritten) pairs for rating
│   │   └── plots/
│   │       ├── 01_graph_topology.png
│   │       ├── 02_mpr_heatmap.png
│   │       ├── 03_action_distribution.png
│   │       ├── 04_propagation_wave.png
│   │       ├── 05_mi_trajectory.png
│   │       ├── 06_trust_evolution.png
│   │       ├── 07_network_evolution.png
│   │       ├── 08_opinion_dynamics.png
│   │       ├── 09_institutional_trust.png
│   │       ├── 10_bot_impact.png
│   │       └── dashboard.png
│   └── bot_resilience_{timestamp}/
│       ├── summary.json                      # Cross-run baseline / injection / removal table
│       └── exp_{timestamp}/                  # One sub-experiment per combination
│
├── ab_tests/                  # Created by --ab-test runs
│   └── comparison_{timestamp}.json
├── visualize.py               # Python visualization pipeline (10 plots + dashboard)
├── requirements_viz.txt
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

# Verify all five extensions end-to-end (DRY_RUN=1 automatic)
node index.js --test-extensions
```

### Visualize the results

```bash
python visualize.py --latest
python visualize.py experiments/exp_2026-05-20_16-58-40
```

Images are written to `experiments/{run}/plots/`.

---

## CLI Reference

```bash
node index.js                                                    # run with all defaults
node index.js --dry-run                                          # no LLM calls, free
node index.js --config examples/run_linear_chain.json            # custom config
node index.js --dry-run --config examples/run_linear_chain.json  # dry-run + config
node index.js --resume experiments/exp_2026-05-20_18-17-04       # resume interrupted run
node index.js --list-personas                                    # print all persona IDs
node index.js --list-articles                                    # print all article IDs

# Society DSL — YAML scenario workflow
node index.js --validate scenarios/climate_debate.yaml           # validate only (no compile)
node index.js --compile  scenarios/climate_debate.yaml --summary # compile → stdout + report
node index.js --compile  scenarios/climate_debate.yaml \
    --out compiled.json                                          # compile → file
node index.js --scenario scenarios/climate_debate.yaml           # compile + run
node index.js --dry-run --scenario scenarios/climate_debate.yaml # compile + dry-run

# A/B testing
node index.js --dry-run --ab-test \
    --base    examples/run_linear_chain.json \
    --variant examples/run_echo_chamber.json \
    [--variant examples/run_polarized.json] \
    [--runs 3]

# Extension smoke test — 3-node chain, all extensions on, DRY_RUN=1
# Checks 10 output files and reports PASS/FAIL for each
node index.js --test-extensions

# Bot resilience — 3-phase experiment (baseline → injection → removal)
node index.js --dry-run --bot-resilience --config examples/run_bot_resilience.json
node index.js --bot-resilience --config examples/run_bot_resilience.json \
    --bot-densities 0.05,0.10,0.20 \
    --bot-types amplifier,distorter,agenda,flooder \
    --bot-placements random,hubs,bridges,periphery,targeted_cluster \
    --bot-removals none,remove_hubs,remove_random,remove_bridges,remove_all \
    --article politics_0

# Extension 11 — Emergent Polarization
node index.js --dry-run --polarization --config examples/run_polarization.json
node index.js --dry-run --polarization --config examples/run_polarization.json \
    --cycles 10 \
    --sequence controversy_gradient \
    --pi-weights '{"bimodality":0.3,"modularity":0.4}'
node index.js --dry-run --polarization-phase-diagram \
    --config examples/run_polarization.json \
    --param interEdgeProb --values 0.01,0.05,0.10,0.20 --cycles 6
node index.js --dry-run --polarization-intervention \
    --config examples/run_polarization.json \
    --intervention-tick 3 --intervention-type fact_checker_injection

# Extension 12 — Digital Twin Validation
node index.js --dry-run --digital-twin \
    --cascade data/fakenewsnet/sample_cascade.json \
    --config examples/run_digital_twin.json
node index.js --dry-run --validate-batch \
    --cascade-dir data/fakenewsnet/ --max-cascades 10 --inference inferred
node index.js --dry-run --validate-sensitivity \
    --cascade data/fakenewsnet/sample_cascade.json \
    --strategies inferred,follower_only,random,neutral --runs-per-strategy 3
```

`--resume` accepts both relative and absolute paths. If the experiment is already complete it prints the summary and exits without re-running anything.

`--ab-test` requires `--base` and at least one `--variant`. For meaningful effect sizes both configs should use the same `seedArticles`. Report written to `ab_tests/comparison_{timestamp}.json`.

`--test-extensions` runs `DRY_RUN=1` automatically — no API key required. It verifies: `state.json`, `graph_topology.json`, `metadata.json`, `institutional_trust.json`, `human_eval_template.csv`, `nodes/`, `beliefs/`, `results_crime_0.json`, `opinion_dynamics_crime_0.json`, and provenance fields in node history.

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

Any OpenAI-compatible endpoint (vLLM, Together, Fireworks, etc.) works with `provider: "openai"`.

---

### `config/experiment.js` — Default Parameters

All parameters are overridable in a run config JSON.

#### Core parameters

| Parameter | Default | Description |
|---|---|---|
| `topology` | `linear_chain` | Graph shape |
| `maxTicks` | `10` | Propagation rounds |
| `defaultModel` | `gpt-4o-mini` | Model for all nodes unless overridden |
| `auditorModel` | `gpt-4o-mini` | Model for auditor and FrameAuditor |
| `trustThreshold` | `0.2` | Min effective trust to accept a message |
| `actionWeights` | `{forward:0.3, reinterpret:0.5, drop:0.2}` | Probabilistic sampling weights |
| `relationEvolution` | `true` | Trust scores evolve after interactions |
| `trustDelta` | `0.05` | Trust change per interaction |
| `maxHops` | `8` | Hard cap on propagation depth |
| `activityPattern` | `"always"` | Node dormancy: `"always"` / `"weekly"` / `"random"` |
| `maxInboxSize` | `20` | Per-article inbox cap (prevents cascade floods) |
| `edgeDeletionThreshold` | `0.05` | Trust floor below which edges are removed |
| `strippedProperties` | `[]` | Persona properties to ablate |

#### Research layer flags

| Flag | Default | Description |
|---|---|---|
| `enableBeliefs` | `false` | Layer 1: belief state + confirmation bias (+2 LLM calls/message) |
| `enableFrameAnalysis` | `false` | Layer 2: frame shift, sentiment drift, claim injection |
| `competitiveGroups` | `[]` | Layer 3: article groups that propagate simultaneously |
| `interventions` | `[]` | Layer 4: fact-checker, inoculation, moderation |

#### Extension flags

| Flag | Default | Description |
|---|---|---|
| `enableProvenance` | `false` | Ext 1: chain trust check on each incoming message |
| `provenanceRecencyDiscount` | `0.9` | δ in chain trust formula (recent hops weighted more) |
| `enableStrategicAgents` | `false` | Ext 4: utility-maximising action for personas with `strategy` field |
| `enableNetworkEvolution` | `false` | Ext 3: homophily edge creation + alignment-based severing (requires `enableBeliefs`) |
| `networkEvolutionParams` | see below | creationProb, severingThreshold, maxNewEdges, trustForNewEdge |
| `enableOpinionDynamics` | `false` | Ext 8: DeGroot / BC / Voter model after audit (requires `enableBeliefs`) |
| `opinionDynamicsParams` | see below | steps, epsilon, voterRuns |
| `enableInstitutionalTrust` | `false` | Ext 9: per-node trust toward 4 institutions; multiplies edge trust |
| `institutionalTrustParams` | see below | erosionRate, recoveryRate |

Extension parameter defaults:
```js
networkEvolutionParams: {
  creationProb: 0.05,      // P_create = alignment × creationProb
  severingThreshold: 0.25, // alignment below which an edge is a sever candidate
  maxNewEdges: 3,          // cap on new edges per article per evolution round
  trustForNewEdge: 0.40,   // trust assigned to newly created edges
},
opinionDynamicsParams: {
  steps: 50,       // max iterations for DeGroot and BC models
  epsilon: 0.3,    // Bounded-Confidence threshold |x_i - x_j| < epsilon
  voterRuns: 10,   // runs to average for Voter model
},
institutionalTrustParams: {
  erosionRate: 0.03,   // trust decrease when a node's content has MI > 3
  recoveryRate: 0.01,  // trust increase when content is accurate
},
```

---

### `personas/personas.json` — Persona Library

26 personas — 22 human personas (all from the paper plus a neutral baseline) plus 4 bot personas (Extension 10).

Human persona entry:

```json
{
  "id": "politically_biased_left",
  "name": "Politically Biased Individual (Left-Wing)",
  "systemPrompt": "...",
  "tags": ["ideology", "political"],
  "emotionalTone": "passionate",
  "ideologicalBias": "left-wing",
  "expertiseDomain": null,
  "strategy": null
}
```

Bot persona entry (additional fields):

```json
{
  "id": "bot_distorter",
  "name": "Bot — Distorter",
  "systemPrompt": "...",
  "tags": ["bot", "distorter"],
  "isBot": true,
  "botType": "distorter",
  "strategy": "maximize_downstream_mi",
  "botConfig": {
    "actionOverride": "reinterpret",
    "bypassBeliefs": true,
    "bypassProvenance": true,
    "duplicateMessages": 1
  }
}
```

| Field | Human | Bot | Description |
|---|---|---|---|
| `isBot` | absent | `true` | Signals `BotEngine.isBot()` to activate the fast-path |
| `botType` | absent | `amplifier` / `distorter` / `agenda` / `flooder` | Determines processing behavior in `BotEngine.processMessage()` |
| `botConfig.actionOverride` | absent | `"forward"` / `"reinterpret"` | Deterministic action (bypasses probabilistic sampling) |
| `botConfig.bypassBeliefs` | absent | bool | Skip `BeliefEngine` entirely |
| `botConfig.bypassProvenance` | absent | bool | Skip provenance chain trust check |
| `botConfig.duplicateMessages` | absent | int | Push this many copies per outgoing neighbor |

The `tags`, `emotionalTone`, `ideologicalBias`, and `expertiseDomain` fields support ablation via `strippedProperties`.

The optional `strategy` field (Extension 4) activates strategic action selection. Supported values: `maximize_downstream_mi`, `maximize_reach`, `minimize_downstream_mi`, `maximize_alignment`.

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

5 articles from the paper, each with pre-written auditor questions and ground-truth answers:

| ID | Domain | Title |
|---|---|---|
| `crime_0` | crime | FBI 2023 Crime Report |
| `education_0` | education | AI in College Debate |
| `technology_0` | technology | IBM AI Debater |
| `politics_0` | politics | AI Policy: Trump vs Harris |
| `healthcare_0` | healthcare | Cancer Facts 2024 |

Each carries 5 yes/no questions and a `groundTruth` boolean array used by the auditor.

---

### `src/fileIO.js` — File-Backed State

All node state is stored as JSON on disk. No node data lives in memory between ticks. Key functions:

- `readJSON(path)` — parse a JSON file
- `writeJSON(path, data)` — atomic write (creates dirs if needed)
- `updateJSON(path, fn)` — read → apply function → write (used for inbox delivery)
- `fileExists(path)` — check existence without throwing
- `ensureDir(path)` — mkdir -p

This design keeps RAM flat regardless of graph size or simulation depth.

---

### `src/llmClient.js` — LLM Client

Single `callLLM(modelId, systemPrompt, userPrompt)` function. Dispatches to the correct provider. Uses Node's built-in `https`/`http` — no external dependencies.

**Dry-run sentinel system:** when `DRY_RUN=1` is set, every LLM call type is matched by a unique keyword embedded in its `userPrompt`. The interceptor returns appropriate mock JSON without any network calls:

| Sentinel keyword | Returns |
|---|---|
| `Return only the JSON` | Auditor QA answers: `{"answers":[1,1,...]}` |
| `BELIEF_ALIGNMENT_QUERY` | Alignment: `{"alignment":0.5}` |
| `BELIEF_UPDATE_QUERY` | Stance update: `{"stance":"...", "confidence":0.5}` |
| `FRAME_ANALYSIS_QUERY` | Frame data: `{"frameShift":0.1, ...}` |
| `DT_ARTICLE_QA_QUERY` | Digital twin article QA: `{"questions":[...5 questions...], "groundTruth":[true,...]}` |
| *(anything else)* | Node rewrite: returns last paragraph of user prompt |

---

### `src/SimulationNode.js` — Node Decision Engine

Each node is backed by a JSON file at `experiments/{id}/nodes/{nodeId}.json`:

```json
{
  "nodeId": "node_0",
  "personaId": "politically_biased_left",
  "modelId": "gpt-4o-mini",
  "relations": { "node_1": 0.5, "node_2": 0.2 },
  "params": {},
  "inbox": [],
  "history": [
    {
      "tick": 2,
      "articleId": "politics_0",
      "sourceNodeId": "node_1",
      "hops": 1,
      "action": "reinterpret",
      "contentIn": "...",
      "contentOut": "...",
      "misinfoIndex": null,
      "frameAnalysis": null,
      "reason": null,
      "chainTrust": 0.42,
      "provenance": [{"nodeId": "node_0", "personaId": "politically_biased_left"}],
      "timestamp": "2026-05-20T..."
    }
  ],
  "stats": { "received": 4, "forwarded": 1, "reinterpreted": 2, "dropped": 0, "dumped": 1 }
}
```

`misinfoIndex` is `null` during propagation and backfilled (0–5) during the audit phase.
`chainTrust` and `provenance` are `null` when Extension 1 is disabled.

**Message schema** (fields on every queued inbox message):

```json
{
  "articleId": "crime_0",
  "sourceNodeId": "node_1",
  "senderPersonaId": "politically_biased_left",
  "content": "...",
  "hops": 2,
  "originalContent": "...",
  "provenance": [{"nodeId": "node_0", "personaId": "..."}, ...],
  "tick": 3
}
```

**Propagation tick decision flow (`processTick(tick, persona, resolvedParams, extensions)`):**

```
For each message in inbox:
  1. If interventionType: record as "forward", skip propagation
  2. [Ext 10] If BotEngine.isBot(persona): BOT FAST-PATH
       a. Call BotEngine.processMessage(msg, persona, nodeId)
          → agenda bots drop ~33% of messages deterministically
          → distorter bots corrupt content without LLM
          → flooder/amplifier bots push duplicateCount copies per neighbor
       b. Append provenance hop with isBot:true
       c. Push duplicateCount copies to outgoing; continue (skip all checks below)
  3. Check hops < maxHops                           -> drop if exceeded
  4. Compute effective trust:
       a. Direct trust from relations map (or 0.5 fallback)
       b. [Ext 9] Multiply by institutional trust multiplier
  5. Check effective trust >= trustThreshold        -> drop if too low
  6. [Ext 1] Compute chain trust T_chain            -> drop if below threshold
  7. [Layer 1] Compute belief alignment, adjust action weights
  8. [Ext 4] If persona.strategy: use StrategyEngine.chooseAction()
             Else: probabilistic sample from (adjusted) action weights
  9. If "drop": record, optionally update beliefs, continue
  10. If "reinterpret": call LLM with persona system prompt
  11. If "dump": record locally, do not forward
  12. Record history event (misinfoIndex = null)
  13. [Layer 1] Update belief state
  14. Build outgoing messages with updated provenance chain
  15. Deliver to neighbor inboxes
  16. [Layer 1] Decay emotional state at tick end
```

**Audit phase (`auditPendingEvents`):**

```
For each history event where misinfoIndex === null, action in {forward, reinterpret}:
  1. Call auditor.score(articleId, contentOut) -> MI integer
  2. Write MI back into the history event
  3. [Layer 2] Run FrameAuditor; write frameAnalysis into the event
  4. Apply trust evolution: MI > 3 -> decrease trust; else increase
  5. Edge deletion: if trust <= edgeDeletionThreshold, delete edge
  6. [Layer 1] Spike emotional state for confirmed high-MI content
```

`create()` is **idempotent** — if the node file already exists (resume scenario), the write is skipped.

---

### `src/SocietyGraph.js` — Graph Topologies

Nine topology builders covering both baseline and real-world-inspired structures. Edges are directed; trust scores live in the source node's `relations` map.

**`addEdge()` is idempotent** — preserves evolved trust on resume.  
**`loadExisting(experimentDir)`** reconstructs the graph from `graph_topology.json` without touching node files.

#### Graph helper methods (added for extensions)

| Method | Returns | Purpose |
|---|---|---|
| `removeEdge(fromId, toId)` | — | Delete edge from adjacency + node file (Extension 3) |
| `getNodeIds()` | `string[]` | All node IDs |
| `getNeighbors(nodeId)` | `string[]` | Adjacency list for a node |
| `toRowStochasticMatrix()` | `{[from]: {[to]: weight}}` | Trust matrix normalised per row (DeGroot model) |
| `toAdjacencyMap()` | `{[node]: string[]}` | Unweighted adjacency (BC / Voter models) |
| `getNodePersonaMap()` | `{[nodeId]: personaId}` | Used by InstitutionalTrust.initialize() |

#### Baseline topologies

| Key | Description |
|---|---|
| `linear_chain` | node_0 → node_1 → … → node_n. Original CIKM paper structure. |
| `ring` | Each node connects to next; last wraps to first. |
| `random_er` | Erdős-Rényi: each pair connected with probability `edgeProbability`. |
| `custom` | Explicit `edges` list with per-edge trust scores and per-node personas. |

#### Real-world society topologies

| Key | Real-world analogy | Model |
|---|---|---|
| `small_world` | Friend groups, academic circles, workplaces | Watts-Strogatz |
| `scale_free` | Twitter/X, YouTube, news aggregation | Barabási-Albert preferential attachment |
| `echo_chamber` | Partisan subreddits, ideological silos | Stochastic block model |
| `polarized` | Extreme two-party political Twitter | Two-cluster block model + bridge nodes |
| `hierarchical` | Traditional media, org comms, government | Rooted B-ary tree |

#### Homophily trust

All society topologies support homophily-based trust initialisation. When `personaMap` is available, trust is adjusted by Jaccard similarity of the two nodes' persona tags:

- Same tags (e.g. both `ideology`) → trust boosted toward `baseTrust + 0.3`
- No shared tags → trust reduced toward `baseTrust - 0.2`

---

### `src/DSLCompiler.js` — Society DSL

The Society DSL lets researchers describe experiments as human-readable YAML rather than hand-crafting flat JSON run configs. The compiler translates YAML scenarios into the exact JSON format that `Simulation.js` consumes — the engine never sees YAML.

#### Compilation pipeline (10 steps)

| Step | Input → Output |
|---|---|
| 1. Parse | YAML text → plain JS object (minimal recursive parser, zero deps) |
| 2. Validate | Schema + known persona/article ID checks → `errors[]`; throws on failure |
| 3. expandGroups | Group entries + seeded PRNG → `{nodes[], groupIndex}` |
| 4. expandBridges | Bridge entries → bridge node configs |
| 5. intraEdges | Per-group `internal_connectivity` × `internal_trust` → base edges |
| 6. interEdges | `relations[]` probabilistic cross-group sampling → upsert edges |
| 7. bridgeEdges | `bridge.connects_to[]` → upsert edges |
| 8. customLinks | Explicit `custom_links[]` → upsert edges (highest priority) |
| 9. strategies | `strategic_overrides[]` → write strategy into `node.params.strategy` |
| 10. buildConfig | All of the above → complete JSON run config |

Edge priority is enforced by call order with last-write-wins `_upsertEdge`: intra (lowest) → inter → bridge → custom (highest).

#### DSL schema (top-level keys)

```yaml
title: Human-readable experiment name
description: >
  Folded scalar — collapsed to a single string by the parser.

simulation:
  random_seed: 42          # Seeded PRNG (xorshift32) → deterministic graph
  max_ticks: 12
  default_model: gpt-4o-mini
  trust_threshold: 0.30
  action_weights: { forward: 0.35, reinterpret: 0.40, drop: 0.15, dump: 0.10 }
  trust_delta: 0.05
  edge_deletion_threshold: 0.05

groups:
  - name: progressives        # Required: used as node ID prefix
    size: 80
    personas:
      - id: environmentalist  # Weighted sampling
        weight: 3
      - id: neutral_news
        weight: 1
    internal_connectivity: 0.15  # P(edge between any two group members)
    internal_trust: 0.80
    params:                   # Per-node overrides; snake_case → camelCase
      trust_threshold: 0.35
      action_weights: { forward: 0.55, reinterpret: 0.20, drop: 0.10, dump: 0.15 }
      max_hops: 6
      activity_pattern: always

bridges:
  - name: media_hub           # Single node; nodeId = bridge name
    persona: neutral_news
    connects_to:
      - group: progressives
        trust: 0.60
        direction: bidirectional  # outgoing | incoming | bidirectional
    params:
      trust_threshold: 0.10

relations:
  - from: progressives        # Group-to-group cross edges
    to: skeptics
    trust: 0.30
    connectivity: 0.04        # P(edge between a from-member and a to-member)
    direction: outgoing

custom_links:                 # Highest precedence; support index syntax
  - from: experts[0]          # First member
    to: progressives[0]
    trust: 0.95
  - from: media_hub           # Bare bridge name
    to: amplifiers[*]         # All members
    trust: 0.70
  - from: experts[0:2]        # Slice: indices 0, 1, 2 (inclusive)
    to: progressives[0]
    trust: 0.90
  - from: skeptics[-1]        # Last member
    to: media_hub
    trust: 0.50

strategic_overrides:
  - node: amplifiers[0]
    strategy: maximize_downstream_mi  # Overrides persona.strategy

seed:
  articles: [politics_0, technology_0]
  entry_points: [media_hub, progressives[0]]
  competitive_groups:
    - articles: [politics_0]
      entry_points: [progressives[0], skeptics[0]]

interventions:
  - type: inject_article
    tick: 3
    article: healthcare_0     # Note: 'article', not 'article_id'
    targets: [skeptics[0], skeptics[1], skeptics[2]]
    params:
      injected_trust: 0.80

bots:                         # Extension 10 — optional; first entry is used
  - type: distorter           # amplifier | distorter | agenda | flooder
    density: 0.10             # Fraction of nodes to convert to bots
    placement: hubs           # random | hubs | bridges | periphery | targeted_cluster
    removal: none             # none | remove_hubs | remove_random | remove_bridges | remove_all

extensions:
  beliefs: true
  frame_analysis: true
  provenance: true
  strategic_agents: true
  network_evolution: true
  opinion_dynamics: true
  institutional_trust: true

extension_params:
  provenance:
    recency_discount: 0.88
  network_evolution:
    homophily_weight: 0.6
  opinion_dynamics:
    model: bounded_confidence
    epsilon: 0.35
  institutional_trust:
    media: { progressives: 0.70, skeptics: 0.35 }
    science: { progressives: 0.85, skeptics: 0.30 }
```

#### Node reference syntax

| Syntax | Resolves to |
|---|---|
| `group[0]` | First group member |
| `group[-1]` | Last group member |
| `group[*]` | All group members |
| `group[0:2]` | Members at index 0, 1, 2 (inclusive) |
| `bridge_name` | The bridge node itself |
| `group_name` | All members (bare group name) |

#### Seeded PRNG

`simulation.random_seed` seeds an xorshift32 PRNG used for all probabilistic graph operations. Same scenario file + same seed → identical graph every compile, enabling reproducible experiment families.

#### Params normalisation

Group and bridge `params` use `snake_case` keys; `_normalizeParams()` converts them to `camelCase` for the engine:

| DSL key | Engine key |
|---|---|
| `trust_threshold` | `trustThreshold` |
| `action_weights` | `actionWeights` |
| `activity_pattern` | `activityPattern` |
| `max_hops` | `maxHops` |
| `max_inbox_size` | `maxInboxSize` |
| `trust_delta` | `trustDelta` |

#### Per-node strategy routing

`strategic_overrides` writes the chosen strategy into `node.params.strategy`. `SimulationNode.processTick()` checks `resolvedParams.strategy` before falling back to `StrategyEngine.getStrategy(persona)`, so DSL-specified strategies override persona-level ones.

#### YAML parser notes

The built-in `YAMLParser` class handles the DSL subset without external dependencies:
- Block mappings and sequences
- Flow sequences `[a, b, c]` and flow mappings `{a: 1}`
- Folded scalars (`key: >`)
- Inline comments (`# ...`)
- Scalar coercion: bool, int, float, null, quoted strings, plain strings
- **Slice expressions** like `group[0:4]` are treated as plain strings (the `:` inside `[...]` is not mistaken for a mapping separator)

---

### `src/Auditor.js` — Misinformation Metrics

Implements the QA-based auditor from the paper.

**Misinformation Index (MI)** — number of questions whose answer in the rewritten text differs from ground truth (0 = perfect fidelity, 5 = complete distortion).

**MPR** — mean MI across all events in a node's history for a given article.

**Severity taxonomy:**

| MPR | Tier | Colour |
|---|---|---|
| ≤ 1 | `factual_error` | Green |
| 1–3 | `lie` | Orange |
| > 3 | `propaganda` | Red |

---

### `src/Simulation.js` — Orchestrator

Runs the experiment in two sequential phases, with a `state.json` checkpoint before and after every article.

#### Two-phase execution

**Phase 1 — Propagation**

```
For each article (skipping already-completed ones per state.json):
  1. Write state.json
  2. Clean partial state from any prior interrupted attempt
  3. Seed article into seed node inboxes (with empty provenance=[])
  4. Tick loop up to maxTicks:
       - Build extensions object (_buildExtensions)
       - [Ext 4] Apply InterventionEngine at this tick
       - Each node processes inbox via processTick(tick, persona, params, extensions)
       - Outgoing messages delivered to neighbor inboxes
       - state.json updated with currentTick
       - Early exit if no messages propagate
  5. Mark article complete
```

**Phase 2 — Audit**

```
For each article (skipping already-audited ones):
  1. For each node: auditPendingEvents() — score MI, backfill history, evolve trust
  2. [Ext 3] NetworkEvolution.evolve() — create/sever edges based on opinion similarity
  3. Write results_{articleId}.json (metrics + provenanceMetrics + networkEvolution)
  4. Mark article audited

After all articles:
  5. [Ext 8] OpinionDynamics.compare() per article — write opinion_dynamics_{id}.json
  6. [Ext 9] InstitutionalTrust.update() — erode/recover institution trust based on MPRs
```

**`_buildExtensions()`** — assembles the extensions object passed to every `processTick` call. Reads `institutional_trust.json` from disk each call so mid-simulation file edits are reflected.

#### `state.json` — Master State File

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

`status`: `in_progress` | `complete` | `failed`  
`phase`: `propagation` | `audit`

#### Resume path

```
1. Read state.json
2. If status === "complete": load metadata.json and return existing results
3. Otherwise:
   a. Load saved config from metadata.json
   b. Rebuild graph via SocietyGraph.loadExisting() (preserves evolved trust)
   c. Continue _execute() from the saved phase and completedArticles lists
```

---

## Research Layers

### Layer 1: Node-level cognition (`src/BeliefEngine.js`)

Enable with `"enableBeliefs": true`. Adds ~2 LLM calls per message processed.

**Belief state** at `experiments/{id}/beliefs/{nodeId}.json`:

```json
{
  "nodeId": "node_0",
  "topicBeliefs": {
    "politics_0": { "stance": "AI deregulation risks civil liberties", "confidence": 0.72, "encounterCount": 3, "lastUpdatedTick": 5 }
  },
  "emotionalState": { "emotion": "excited", "intensity": 0.45, "lastUpdatedTick": 5 }
}
```

**Confirmation bias** — alignment score [0,1] shifts the action weight distribution:

| Alignment | Effect |
|---|---|
| High (> 0.7) | Forward ↑, drop ↓ — node amplifies agreeable content |
| Low (< 0.3) | Drop ↑ — node rejects disconfirming information |
| Any | High emotional intensity ↑ reinterpret probability |

Emotional intensity decays 15% per tick; spikes +0.25 on reinterpret, +0.30 on confirmed high-MI audit. Beliefs persist **across articles** — cross-article memory is automatic.

---

### Layer 2: Content-level analysis (`src/FrameAuditor.js`)

Enable with `"enableFrameAnalysis": true`. Runs during the audit phase. Each audited history event gains a `frameAnalysis` field:

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
| `sentiment` | -1–1 | Emotional valence of the rewrite |
| `sentimentDelta` | -2–2 | Change from original |
| `newClaims` | list | Claims injected not present in the original |
| `coherenceScore` | 0–1 | Internal coherence of the rewrite |

---

### Layer 3: Network dynamics

**Competitive propagation** — multiple articles share the same tick loop:

```json
{
  "competitiveGroups": [
    { "articles": ["politics_0", "healthcare_0"], "seedNodes": ["node_0"] }
  ]
}
```

**Node dormancy** (`activityPattern`): `"always"` | `"weekly"` (tick % 7 === 1) | `"random"` (70%)

**Inbox cap** (`maxInboxSize`, default 20) — prevents cascade floods in dense topologies.

**Edge deletion** — when trust drops below `edgeDeletionThreshold` during the audit phase, the edge is removed.

---

### Layer 4: External interventions (`src/InterventionEngine.js`)

```json
{
  "interventions": [
    { "type": "fact_checker_injection", "tick": 5, "articleId": "politics_0", "targetNodes": ["node_0"] },
    { "type": "inoculation",            "tick": 0, "articleId": "politics_0", "targetNodes": ["node_3"] },
    { "type": "content_moderation",     "tick": 4, "articleId": "politics_0", "targetNodes": ["node_0"], "params": { "maxHops": 3 } }
  ]
}
```

| Type | Mechanism |
|---|---|
| `fact_checker_injection` | Injects original article as a high-trust correction message |
| `inoculation` | Seeds a pre-emptive warning before the article arrives |
| `content_moderation` | Removes messages with hops > N from target inboxes |

---

### Layer 5: Extended metrics (`src/MetricsEngine.js`)

All computed post-audit and stored in `results_{articleId}.json` under `metrics`. No LLM calls.

| Metric | What it measures |
|---|---|
| Information half-life | Tick when society-level MI first exceeds 50% of max |
| Cascade reach vs fidelity | Per-node scatter: event count vs mean MI (identifies super-spreaders) |
| Network MI over time | Mean MI across all nodes at each tick |
| Gini coefficient | MI inequality across nodes |
| Critical mass threshold | Fraction of nodes with MI > 3 at each tick |
| Structural virality | Goel et al. avg pairwise distance in propagation tree |
| Frame metrics | Aggregate frame shift, sentiment delta, total injected claims |
| Human eval CSV | Sampled (original, rewritten) pairs with blank rating columns |
| Bot impact metrics | `botMeanMI`, `humanMeanMI`, `botMIDelta`, `botReachFraction`, `botAmplificationFactor`, `cascadeContamination` (Extension 10) |
| Bot counterfactual MI | `actualMeanMI`, `counterfactualMeanMI`, `botCausalContribution` — network MI excluding bot-contaminated provenance chains (Extension 10) |

---

### Layer 6: Validation infrastructure (`src/ABTestRunner.js`)

```bash
node index.js --dry-run --ab-test \
  --base examples/run_linear_chain.json \
  --variant examples/run_echo_chamber.json \
  --runs 3
```

Collects Layer 5 metrics across N runs per config, computes Cohen's d effect sizes, and writes `ab_tests/comparison_{timestamp}.json`. Effect size interpretation: < 0.2 negligible, 0.2–0.5 small, 0.5–0.8 medium, > 0.8 large.

**Human evaluation export** — `human_eval_template.csv` generated automatically every run. Columns: `eval_id`, `article_id`, `node_id`, `persona_id`, `tick`, `action`, `original_text`, `rewritten_text`, `auditor_mi`, `frame_shift`, plus blank `rating_factual`, `rating_frame`, `rating_persuasion` for raters.

---

## Extensions

### Extension 1: Provenance-Aware Trust (`src/ProvenanceEngine.js`)

Enable with `"enableProvenance": true`.

Every message carries a `provenance` array recording each node it passed through: `[{nodeId, personaId}, ...]` (oldest first, immediate sender last). When a node receives a message, it computes chain trust before deciding whether to engage:

```
T_chain = ∏_{i=0}^{n-1} t(r, p_i) · δ^(n-1-i)
```

- `t(r, p_i)` = recipient's direct trust in provenance hop i (falls back to category default if not in relations)
- `δ` = `provenanceRecencyDiscount` (default 0.9) — recent hops get full weight, older hops are discounted
- Exponent 0 for newest hop (no discount), n-1 for oldest hop (max discount)

**Category trust defaults** (for nodes outside the recipient's relations):

| Persona tags | Default trust |
|---|---|
| `expert`, `media` | 0.50 |
| `advocacy` | 0.45 |
| `intentional` | 0.20 |
| other | 0.40 |

If T_chain < `trustThreshold`, the message is dropped with reason `chain_trust_below_threshold`.

**Metrics** stored in `results_{articleId}.json` under `provenanceMetrics`:

| Field | Meaning |
|---|---|
| `meanChainTrust` | Mean T_chain across all accepted messages |
| `provenanceDiversity` | Count of unique propagation paths |

---

### Extension 3: Network Co-evolution (`src/NetworkEvolution.js`)

Enable with `"enableNetworkEvolution": true` (also requires `enableBeliefs: true`).

After each article's audit phase, the graph topology is updated based on opinion similarity. Opinion values are extracted from BeliefEngine confidence values:

```
σ_i = 2 × confidence_i - 1       (maps [0,1] → [-1,1])
α   = 1 - |σ_i - σ_j| / 2        (alignment ∈ [0,1])
```

**Edge creation** — for each non-connected node pair:
```
P_create = α × creationProb
```
At most `maxNewEdges` edges are created per round. New edges get `trustForNewEdge` (default 0.40).

**Edge severing** — an edge is removed when both:
- Opinion alignment between the two nodes < `severingThreshold` (default 0.25)
- Current edge trust < 0.15 (already collapsed)

**Metrics** stored in `results_{articleId}.json` under `networkEvolution`:

| Field | Meaning |
|---|---|
| `edgesAdded` | New edges created this round |
| `edgesRemoved` | Edges severed this round |
| `modularityQ` | Newman-Girvan modularity Q (community labels from `ideologicalBias` or first tag) |
| `homophilyIndex` | Fraction of edges where both endpoints share at least one persona tag |

**Newman-Girvan Q formula:**
```
Q = (1/2m) Σ_{ij} [A_ij - k_i·k_j / (2m)] · δ(c_i, c_j)
```
where A is the adjacency matrix, k_i is degree, m is total edges, c_i is community assignment.

---

### Extension 4: Strategic Agents (`src/StrategyEngine.js`)

Enable with `"enableStrategicAgents": true`.

Add a `"strategy"` field to any persona in `personas.json` to make it utility-maximising rather than probabilistic. No code changes required — just a JSON edit.

**Supported strategies:**

| Strategy | Behaviour | Research question |
|---|---|---|
| `maximize_downstream_mi` | Always reinterprets — maximises distortion at every hop | How much does one adversarial node raise society-level MPR? |
| `maximize_reach` | Always forwards — maximises spread regardless of fidelity | How far does a broadcaster push content? |
| `minimize_downstream_mi` | Drops messages with ≥ 3 hops (already drifted), forwards otherwise | Can one moderator node contain MI propagation? |
| `maximize_alignment` | Forwards aligned content (≥ 0.60), drops misaligned (≤ 0.35), reinterprets neutral | How does echo-chamber behaviour affect MI distribution? |

When `enableStrategicAgents` is true but the persona has no `strategy` field, the node falls back to normal weighted-random sampling. Strategic choice uses `beliefAlignment` from Layer 1 when both extensions are enabled.

---

### Extension 8: Population-level Opinion Dynamics (`src/OpinionDynamics.js`)

Enable with `"enableOpinionDynamics": true` (also requires `enableBeliefs: true`).

Runs three classic opinion dynamics models on the final belief-state output of the simulation. Does not modify simulation state — purely a post-hoc analysis.

**Opinion extraction:** confidence values from `beliefs/{nodeId}.json` for the target article. Range [0, 1] (0 = uncertain, 1 = fully confident).

**Results saved to `opinion_dynamics_{articleId}.json`:**

```json
{
  "initialOpinions": {"node_0": 0.5, "node_1": 0.72, ...},
  "degroot": {
    "final": {...}, "steps": 12, "trajectory": [...], "convergenceType": "consensus"
  },
  "boundedConfidence": { ... },
  "voter": { ... }
}
```

**Models:**

| Model | Update rule | Parameters |
|---|---|---|
| DeGroot | x(t+1) = W·x(t) where W is row-stochastic trust matrix | `steps` |
| Bounded Confidence (H-K) | x_i(t+1) = mean(x_j where edge(i,j) and \|x_i - x_j\| < ε) | `steps`, `epsilon` |
| Voter | Each node adopts a random neighbour's opinion; averaged over `voterRuns` | `steps`, `voterRuns` |

**Convergence classification:**

| Type | Condition |
|---|---|
| `consensus` | All opinions within 0.10 of each other |
| `polarized` | > 25% of nodes near 0 AND > 25% near 1, with < 35% in middle |
| `fragmented` | Spread ≥ 0.10 but no clear bimodal clustering |

---

### Extension 9: Institutional Trust Modeling (`src/InstitutionalTrust.js`)

Enable with `"enableInstitutionalTrust": true`.

Each node maintains a trust score toward four societal institutions: **media**, **science**, **government**, **corporate**. When receiving a message, the sender's institutional affiliation applies a multiplier to the raw edge trust before the threshold check.

**Institution affiliation** is derived from persona tags:

| Tags | Institution |
|---|---|
| `media`, `social-media`, `opinion` | media |
| `expert`, `education`, `environment` | science |
| `ideology`, `political` | government |
| `marketing`, `entrepreneurship`, `consumer` | corporate |
| others | no affiliation (multiplier not applied) |

**Trust multiplier formula:**
```
adjustedTrust = clamp(directTrust × (0.5 + instTrust), 0, 1)
```
- `instTrust = 0.5` → multiplier = 1.0 (neutral)
- `instTrust = 0.0` → multiplier = 0.5 (penalise untrusted institution)
- `instTrust = 1.0` → multiplier = 1.5 (boost trusted institution)

**Initial trust biases** are derived from persona tags (average of all matching tag entries). Expert personas start with high science trust (0.75); ideology personas start with higher government trust (0.55); social-media personas start with higher media trust (0.65).

**Post-audit update:** for each audited node, if MPR > 3, all nodes' trust toward that node's institution erodes by `erosionRate`. If MPR ≤ 3, trust recovers by `recoveryRate`.

**State file** at `experiments/{id}/institutional_trust.json`:

```json
{
  "nodes": {
    "node_0": { "media": 0.41, "science": 0.50, "government": 0.57, "corporate": 0.40 },
    "node_1": { "media": 0.55, "science": 0.50, "government": 0.45, "corporate": 0.40 }
  }
}
```

---

---

### Extension 10: Bot Detection and Resilience Testing (`src/BotEngine.js`, `src/BotResilienceRunner.js`)

Enable by passing `botInjection` in the run config or via the DSL `bots:` key.

#### `src/BotEngine.js` — Pure static class

| Method | Signature | Purpose |
|---|---|---|
| `isBot(persona)` | `→ bool` | Returns `true` if persona has `isBot: true` |
| `processMessage(msg, persona, nodeId)` | `→ {outContent, action, duplicateCount}` | Deterministic bot processing (no LLM) |
| `injectBots(nodeIds, count, strategy, adjacency, rng)` | `→ string[]` | Selects bot nodes using placement strategy |
| `applyRemoval(botNodeIds, strategy, adjacency, rng)` | `→ string[]` | Returns surviving bot IDs after removal |
| `_computeDegrees(nodeIds, adjacency)` | `→ {id: int}` | Degree centrality for hub/periphery placement |
| `_approximateBetweenness(nodeIds, adjacency)` | `→ {id: float}` | Brandes BFS betweenness (O(V·(V+E))) |
| `_randomSample(arr, k, rng)` | `→ T[]` | Fisher-Yates shuffle, k draws |

#### Bot types and behaviors

| Type | `actionOverride` | Special behavior | `duplicateMessages` |
|---|---|---|---|
| `amplifier` | `forward` | None — pure forwarding | 3 |
| `distorter` | `reinterpret` | `_distort()` corrupts content without LLM | 1 |
| `agenda` | `forward` | djb2 hash drops ~33% of messages as "off-agenda" | 2 |
| `flooder` | `forward` | None — volume attack | 5 |

#### Placement strategies

| Strategy | Algorithm |
|---|---|
| `random` | Fisher-Yates shuffle |
| `hubs` | Sort by degree descending, take top N |
| `bridges` | Brandes BFS betweenness, sort descending, take top N |
| `periphery` | Sort by degree ascending, take top N |
| `targeted_cluster` | Highest-degree seed + its neighbors, then fill from rest |

#### Removal strategies (applied to the selected bot set)

| Strategy | Effect |
|---|---|
| `none` | No bots removed |
| `remove_hubs` | Remove top 50% by degree |
| `remove_bridges` | Remove top 50% by betweenness |
| `remove_random` | Remove 50% at random |
| `remove_all` | Remove all bots before simulation |

#### `src/BotResilienceRunner.js` — 3-phase automation

```
Phase 1 — Baseline: single clean run with no bots
Phase 2 — Injection: full factorial loop
    for density in [0.05, 0.10, 0.20]:
      for botType in [amplifier, distorter, agenda, flooder]:
        for placement in [random, hubs, bridges, periphery, targeted_cluster]:
          run Simulation with botInjection={density, botType, placement}
          collect: botImpact, botCounterfactual metrics
Phase 3 — Removal: worst-case injection × each removal strategy
    worstCase = {density=max, botType=distorter, placement=hubs}
    for removal in [none, remove_hubs, remove_random, remove_bridges, remove_all]:
      run worstCase + removal
      collect metrics

Output: experiments/bot_resilience_{ts}/summary.json
```

#### `Simulation._injectBots()` integration

Called from `Simulation.run()` after `_buildGraph()`, before belief/trust initialization:

1. Build adjacency map from all node files
2. Call `BotEngine.injectBots(nodeIds, count, placement, adjacency, rng)`
3. Apply removal strategy if set
4. Overwrite `personaId` for selected nodes to `bot_{type}` in their JSON files
5. Store `selected` IDs in `this.config._botNodeIds` for downstream metrics

Bot node IDs flow to `MetricsEngine.computeAll(nodesData, ..., botNodeIds)` which adds `botImpact` and `botCounterfactual` to the results file.

#### Provenance contamination tracking

`SimulationNode` bot fast-path appends `{nodeId, personaId, isBot: true}` to the provenance chain. `MetricsEngine.botImpactMetrics()` scans all history events and marks any event whose provenance contains `isBot: true` OR whose source node ID is in the bot set as "contaminated", computing `cascadeContamination`.

`MetricsEngine.botCounterfactualMI()` computes mean MI twice — once across all events and once excluding contaminated events — and reports `botCausalContribution = actualMeanMI − counterfactualMeanMI`.

---

---

### Extension 11: Emergent Polarization (`src/PolarizationMetrics.js`, `src/MultiCycleRunner.js`)

#### `src/PolarizationMetrics.js` — Pure static class

| Method | Signature | Purpose |
|---|---|---|
| `snapshot(experimentDir, cycle, articleId)` | `→ PolarizationSnapshot` | Read graph + beliefs; compute all 4 PI components |
| `polarizationIndex(snapshot, weights?)` | `→ float [0,1]` | Weighted composite PI |
| `detectPhaseTransition(piTrajectory, windowSize?, threshold?)` | `→ TransitionResult` | Sliding-window change-point detection |
| `bimodalityCoefficient(values)` | `→ float` | B = (skewness²+1)/kurtosis |
| `trustBifurcation(values)` | `→ float` | variance / 0.083 (normalised) |
| `modularityQ(graph, communities)` | `→ float` | Newman-Girvan Q |
| `extremityFraction(values, threshold?)` | `→ float` | Fraction with \|v − 0.5\| > 0.35 |

**Polarization Index formula:**
```
PI = w₁·bimodality + w₂·trustBifurcation + w₃·modularity + w₄·extremity
```

Default weights: `{ bimodality: 0.30, trustBifurcation: 0.20, modularity: 0.30, extremity: 0.20 }`

**Phase transition detection:**
```
ΔPI = mean(PI[i:i+window]) − mean(PI[0:i]) > θ   (default window=3, θ=0.15)
Returns { transitionCycle, jumpMagnitude, confidence, isSignificant }
```

**Bimodality normalisation:** B > 5/9 ≈ 0.555 is the accepted threshold for bimodal distributions. `bimodalityCoefficient` normalises by 0.555 so the threshold maps to 1.0.

**Trust bifurcation:** maximum theoretical variance for U[0,1] is 1/12 ≈ 0.083. `trustBifurcation = clamp(variance / 0.083, 0, 1)`.

#### `src/MultiCycleRunner.js` — Multi-cycle orchestrator

**Core design:** each cycle creates a new `Simulation` instance. Carry-over is achieved by copying files into the new experimentDir before `sim.run()` is called, exploiting the idempotent init pattern in `BeliefEngine` and `InstitutionalTrust`.

**Carry-over mechanism:**
```
prevExpDir → copy beliefs/*.json → nextExpDir/beliefs/   (BeliefEngine.init skips if fileExists)
prevExpDir → copy institutional_trust.json → nextExpDir/  (InstitutionalTrust.initialize skips if fileExists)
prevExpDir → read graph_topology.json → extract {nodeId, personaId, modelId, relations} → nextCycleConfig topology:"custom"
```

**`_buildCycleConfig(cycleIdx, articles, prevExpDir)`:**
- Cycle 0: uses topology from base config (e.g. `random_er`)
- Cycle 1+: `topology: "custom"`, nodes/edges from `_loadTopologyFromPrev(prevExpDir)`

**Article sequence strategies:**

| Strategy | Algorithm |
|---|---|
| `repeat_shuffle` | Fisher-Yates shuffle of `articles` array each cycle |
| `controversy_gradient` | Cycle n uses `articles[0..n]` (one more per cycle, capped at all) |
| `alternating` | Even cycles: first half; odd cycles: second half |

**`runPhaseDiagram(baseConfig, param, values, cycles)`:**
For each value, deep-clone base config, set `topologyParams[param]` to the value, run `this.run()`, collect final PI. Returns matrix: `{ value → piTrajectory[] }`.

**`runInterventionExperiment(baseConfig, interventionTick, interventionType, cycles)`:**
Runs baseline (no intervention) + test (intervention injected at `interventionTick`). Returns `{ baseline: piTrajectory, test: piTrajectory }`.

**Output files:**
```
experiments/polarization_{ts}/
├── polarization_report.json          # { cycles, piTrajectory, snapshots, phaseTransition }
└── cycle_{n}/exp_{ts}/
    └── polarization_snapshot.json    # { cycle, bimodality, trustBifurcation, modularity, extremity, pi }
```

---

### Extension 12: Digital Twin Validation

Seven modules across the importer, metrics, comparison, and runner layers.

#### `src/RealGraphImporter.js` — Cascade importer

| Method | Signature | Purpose |
|---|---|---|
| `importCascade(cascadeFile, inferenceStrategy?)` | `→ TopologyConfig` | Parse cascade JSON → simulation topology config |
| `inferPersona(profile, strategy?)` | `→ personaId` | Map user profile to simulation persona |
| `estimateTrust(fromProfile, toProfile)` | `→ float [0.10, 0.95]` | Heuristic edge trust from profile properties |
| `prepareArticle(articleText, articleId, domain, modelId?)` | `→ ArticleObject` | LLM-generate QA questions for the article |

**`inferPersona` strategies:**

| Strategy | Algorithm |
|---|---|
| `inferred` | BIO_RULES array: ordered `[regex, minFollowers, personaId, requireVerified]` — first match wins; fallback to `follower_only` |
| `follower_only` | Band by follower count thresholds |
| `random` | Uniform random from 15 non-bot personas |
| `neutral` | Always `"neutral"` |

**`estimateTrust` formula:**
```
base 0.40
+ 0.15 if toProfile.verified
+ 0.15 if toProfile.followers > 100,000
+ 0.12 if fromProfile.tags ∩ toProfile.tags ≠ ∅  (homophily)
clamp [0.10, 0.95]
```

**`prepareArticle` dry-run:** embeds `DT_ARTICLE_QA_QUERY` in the LLM prompt → intercepted by `callLLMDryRun` to return 5 yes/no questions and all-true ground truth.

#### `src/ValidationMetrics.js` — Cascade structure metrics

| Method | Purpose |
|---|---|
| `extractRealMetrics(cascade)` | Parse real cascade JSON → `{ depth, breadth, size, structuralVirality, speedHours, root }` |
| `extractSimulatedMetrics(experimentDir, articleId)` | Read nodes/*.json, reconstruct tree from provenance chains → `{ depth, breadth, size, structuralVirality, speedTicks, meanMI }` |
| `_structuralVirality(children, root)` | Goel et al. avg pairwise shortest path; capped at 500 nodes |

**Structural virality algorithm:** BFS from each node to all reachable nodes, accumulate sum of distances, divide by n(n-1). Capped at 500 nodes for O(n²) cost management.

#### `src/ValidationComparison.js` — Statistical comparison

| Method | Purpose |
|---|---|
| `compare(realMetrics, simMetrics)` | Per-cascade ratio comparison → `{ structuralSimilarity, depthRatio, breadthRatio, svRatio, isValidated }` |
| `distributionalComparison(realArray, simArray)` | KS test + JSD + Pearson R per metric across N cascades |
| `computeDTFS(structSim, distScore, contentCorr, weights?)` | Weighted DTFS score → `{ dtfs, isValidated }` |
| `_ksTest(sample1, sample2)` | Two-sample KS via tagged sort + CDF tracking; p-value via Kolmogorov approximation |
| `_jsDivergence(sample1, sample2, numBins?)` | Histogram both → KL divergences → JSD = (KL_PM + KL_QM)/2 |

**Structural Similarity Score:**
```
S = 1 − (1/K) Σ |m_sim/m_real − 1|    K = 3 (depth, breadth, structural virality)
```

**Distributional match criteria:** `p_ks > 0.05 AND jsd < 0.10` → distributions not significantly different.

**DTFS formula:**
```
DTFS = w₁·S_struct + w₂·D_dist + w₃·ρ_content
Default weights: structure=0.40, distribution=0.40, content=0.20
Validated: DTFS ≥ 0.70
```

#### `src/ContentDriftValidation.js` — Sentiment trajectory

| Method | Purpose |
|---|---|
| `extractSimDrift(experimentDir, articleId)` | Group frameAnalysis events by cascade depth → sentiment trajectory |
| `extractRealDrift(cascade, articleText)` | Keyword heuristic on quote-tweet text → real sentiment trajectory |
| `compare(simDrift, realDrift)` | Align by depth, compute Pearson R → `{ contentCorrelation, available, matchLabel }` |

Sentiment keywords: positive list (agree, confirm, support, ...) and negative list (fake, wrong, mislead, ...). Score = (pos_count − neg_count) / (pos_count + neg_count + 1).

#### `src/DigitalTwinRunner.js` — Single cascade experiment

**Workflow:**
```
1. RealGraphImporter.importCascade(cascadeFile, inferenceStrategy) → topoConfig
2. ValidationMetrics.extractRealMetrics(cascade) → realMetrics
3. RealGraphImporter.prepareArticle(articleText, TEMP_ARTICLE_ID, domain) → article
4. _injectArticle(article) → articles.json (atomic add)
5. new Simulation(cycleConfig) → sim.run()  [in try/finally]
6. _removeArticle(TEMP_ARTICLE_ID)          [always in finally]
7. ValidationMetrics.extractSimulatedMetrics(sim.experimentDir, TEMP_ARTICLE_ID) → simMetrics
8. ValidationComparison.compare(realMetrics, simMetrics)
9. ContentDriftValidation.extractSimDrift + extractRealDrift + compare
10. ValidationComparison.computeDTFS(...)
11. Write validation_report.json
```

`TEMP_ARTICLE_ID = "_dt_real_article_temp"` — stable sentinel used for article injection and cleanup. The `try/finally` ensures `_removeArticle` runs even on simulation error.

#### `src/BatchValidationRunner.js` — N-cascade batch

Discovers all `*.json` files in `cascadeDir`, runs up to `maxCascades` via `DigitalTwinRunner`, collects `realMetrics[]` and `simMetrics[]` arrays, calls `ValidationComparison.distributionalComparison()`, writes `batch_summary.json`.

#### `src/SensitivityRunner.js` — Inference sensitivity

Runs the same cascade with each of 4 strategies × `runsPerStrategy` runs. Reports:

```json
{
  "inferred":      { "avgStructuralSimilarity": 0.81, "stdStructuralSimilarity": 0.04, "avgDTFS": 0.73 },
  "follower_only": { "avgStructuralSimilarity": 0.74, "stdStructuralSimilarity": 0.07, "avgDTFS": 0.68 },
  "random":        { "avgStructuralSimilarity": 0.61, "stdStructuralSimilarity": 0.12, "avgDTFS": 0.55 },
  "neutral":       { "avgStructuralSimilarity": 0.58, "stdStructuralSimilarity": 0.09, "avgDTFS": 0.51 },
  "dtfsRange": 0.22,
  "highSensitivity": true,
  "bestStrategy": "inferred"
}
```

`highSensitivity` = `dtfsRange > 0.15` (DTFS range across strategies exceeds 15 percentage points).

---

## Visualization Pipeline (`visualize.py`)

Reads every JSON file from an experiment run and produces 10 individual plots plus a dashboard.

```bash
pip install -r requirements_viz.txt

python visualize.py --latest
python visualize.py experiments/exp_2026-05-20_16-58-40
python visualize.py --latest --out-dir paper_figures/
```

### Generated images (all dark theme, 150 DPI)

| File | Panel | What it shows |
|---|---|---|
| `01_graph_topology.png` | Graph | Directed graph; node colour = persona category, size = messages received; edge width = trust |
| `02_mpr_heatmap.png` | Heatmap | Nodes × articles MPR with severity colour scale |
| `03_action_distribution.png` | Bar chart | forward / reinterpret / drop / dump counts per node |
| `04_propagation_wave.png` | Line chart | Messages generated per tick per article (propagation speed) |
| `05_mi_trajectory.png` | Line chart | MI value per tick per node per article |
| `06_trust_evolution.png` | Bar chart | Initial vs final trust score per edge |
| `07_network_evolution.png` | Bar chart | Edges added/removed, modularity Q, homophily index per article (Extension 3); shows "not enabled" message if extension off |
| `08_opinion_dynamics.png` | Line chart | DeGroot convergence trajectory per node (Extension 8); shows "not enabled" message if extension off |
| `09_institutional_trust.png` | Grouped bar | Per-node trust toward media / science / government / corporate (Extension 9); shows "not enabled" message if extension off |
| `10_bot_impact.png` | 4-panel | (A) contamination vs density, (B) reach by placement, (C) causal MI by bot type, (D) removal effectiveness (Extension 10); shows placeholder if no bot resilience data |
| `11_polarization_trajectory.png` | Line chart | PI composite + 4 component lines across cycles; phase transition marker (Extension 11) |
| `12_belief_distribution.png` | Histogram | Belief confidence distribution per cycle (stacked or overlaid) (Extension 11) |
| `13_modularity_evolution.png` | Dual-axis | Newman-Girvan Q (left) and homophily index (right) across cycles (Extension 11) |
| `14_phase_diagram.png` | Heatmap | PI value over swept parameter × cycle grid (phase diagram mode, Extension 11) |
| `15_intervention_comparison.png` | Multi-line | PI trajectory for each intervention timing variant (Extension 11) |
| `16_cascade_comparison.png` | Bar chart | Real vs simulated depth/breadth/structural-virality with ✓/✗ match markers (Extension 12) |
| `17_distribution_match.png` | Histogram (×4) | Depth/breadth/SV/speed distributions overlaid real vs simulated; degrades to KS bar chart if not standalone (Extension 12) |
| `18_content_drift.png` | Dual-line | Sentiment trajectory by cascade depth: real (solid) vs simulated (dashed), Pearson ρ annotated (Extension 12) |
| `19_sensitivity_analysis.png` | Bar + error | DTFS per inference strategy with ±std error bars; best strategy highlighted green (Extension 12) |
| `dashboard.png` | All panels | All plots + metadata banner in a single composite figure |

Plots 07–19 **degrade gracefully** — if the corresponding extension data is absent, they display an informative placeholder rather than crashing.

`plot_bot_impact()` looks for `summary.json` in the experiment directory first, then searches sibling `bot_resilience_*` directories for the most recent run.

---

## Society Topology Configs

### Small-world — `examples/run_small_world.json`

```json
{
  "topology": "small_world",
  "topologyParams": { "numNodes": 15, "k": 4, "beta": 0.15 },
  "seedArticles": ["crime_0", "healthcare_0"],
  "seedNodes": ["node_0"]
}
```

### Scale-free — `examples/run_scale_free.json`

```json
{
  "topology": "scale_free",
  "topologyParams": { "numNodes": 20, "m": 2 },
  "seedArticles": ["technology_0", "politics_0"],
  "seedNodes": ["node_0"]
}
```

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

### Hierarchical — `examples/run_hierarchical.json`

```json
{
  "topology": "hierarchical",
  "topologyParams": { "numNodes": 13, "branchingFactor": 3, "downTrust": 0.82, "upTrust": 0.25 },
  "defaultPersonaAssignment": "by_cluster"
}
```

---

## Writing a Run Config

### Minimal (all defaults)
```json
{}
```

### Linear chain with specific articles
```json
{
  "topology": "linear_chain",
  "topologyParams": { "numNodes": 6 },
  "maxTicks": 10,
  "seedArticles": ["crime_0"],
  "seedNodes": ["node_0"]
}
```

### Custom graph with per-node models
```json
{
  "topology": "custom",
  "maxTicks": 6,
  "seedArticles": ["politics_0"],
  "seedNodes": ["origin"],
  "nodes": [
    { "nodeId": "origin",     "personaId": "neutral",                  "modelId": "gpt-4o-mini" },
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

### All extensions enabled
```json
{
  "topology": "small_world",
  "topologyParams": { "numNodes": 20, "k": 4, "beta": 0.15 },
  "maxTicks": 15,
  "seedArticles": ["crime_0", "politics_0"],
  "enableBeliefs": true,
  "enableFrameAnalysis": true,
  "enableProvenance": true,
  "enableStrategicAgents": true,
  "enableNetworkEvolution": true,
  "enableOpinionDynamics": true,
  "enableInstitutionalTrust": true,
  "nodeParams": {
    "trustThreshold": 0.2,
    "actionWeights": { "forward": 0.3, "reinterpret": 0.5, "drop": 0.2 }
  }
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

## End-to-End Test Run (No API Key)

```bash
# 1. Verify all five extensions (10-point check, ~5 seconds)
node index.js --test-extensions

# 2. Dry-run a linear chain (5 nodes, 1 article, 10 ticks)
node index.js --dry-run --config examples/run_linear_chain.json

# 3. Visualize all 9 plots + dashboard
python visualize.py --latest
```

### Test resumability

```bash
# 1. Start a dry-run
node index.js --dry-run --config examples/run_linear_chain.json

# 2. Resume it (instant — already complete)
node index.js --resume experiments/exp_2026-05-20_18-17-04

# 3. Test mid-run resume: open state.json, set "status":"failed",
#    "phase":"propagation", then run --resume.
#    Only incomplete articles are re-run.
```

---

## Running a Real Experiment

```powershell
$env:OPENAI_API_KEY = "sk-..."
# or
$env:ANTHROPIC_API_KEY = "sk-ant-..."
```

```bash
node index.js --config examples/run_linear_chain.json
python visualize.py --latest
```

---

## Extending the System

| What to add | Where |
|---|---|
| New persona | Append entry to `personas/personas.json` |
| New bot persona | Append with `"isBot": true`, `"botType"`, `"strategy"`, and `"botConfig"` fields |
| Strategic persona | Add `"strategy": "maximize_reach"` to a persona JSON entry |
| New article | Append entry to `articles/articles.json` with `id`, `domain`, `title`, `text`, `questions`, `groundTruth` |
| New scenario | Add a `.yaml` file in `scenarios/` using the DSL schema; validate with `--validate`, compile with `--compile --summary`, run with `--scenario` |
| New LLM provider | Add entry to `config/models.js` + dispatch branch in `src/llmClient.js` |
| New topology | Add `static build*()` to `src/SocietyGraph.js` + case in `Simulation._buildGraph()` |
| New visualization panel | Add `plot_*()` to `visualize.py` with `(data..., ax)` signature; call `save_individual`; add subplot to `build_dashboard` |
| New dry-run mock | Add unique sentinel keyword to the LLM call + matching branch in `callLLMDryRun()` |

---

## Planned Next Steps (EMNLP Extension)

- [x] Dry-run mode — full pipeline with no LLM calls
- [x] Visualization pipeline — 9 plots per experiment run
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
- [x] Extension 1: Provenance-aware trust — multi-hop chain trust with recency discount
- [x] Extension 3: Network co-evolution — homophily edge creation, alignment-based severing, modularity Q
- [x] Extension 4: Strategic agents — utility-maximising personas (4 strategies via JSON config)
- [x] Extension 8: Population-level opinion dynamics — DeGroot / Bounded-Confidence / Voter model
- [x] Extension 9: Institutional trust modeling — per-node trust toward media/science/government/corporate
- [x] `--test-extensions` CLI flag — 10-point smoke test for all five extensions
- [x] Society DSL (`src/DSLCompiler.js`) — YAML scenario compiler: seeded PRNG, weighted persona sampling, 10-step pipeline, edge deduplication with precedence, per-node strategy override, `--scenario` / `--compile` / `--validate` CLI flags
- [x] Extension 10: Bot Detection and Resilience Testing — 4 bot persona types, 5 placement strategies, 5 removal strategies, `BotEngine.js`, `BotResilienceRunner.js`, `botImpactMetrics`, `botCounterfactualMI`, `--bot-resilience` CLI, `bots:` DSL key, `10_bot_impact.png` visualization
- [x] Extension 11: Emergent Polarization — `PolarizationMetrics.js` (PI formula, phase transition detection, bimodality/trust bifurcation/modularity/extremity), `MultiCycleRunner.js` (belief carry-over, topology carry-over, 3 article sequence strategies, phase diagram, intervention experiment), `--polarization` / `--polarization-phase-diagram` / `--polarization-intervention` CLI flags, plots 11–15
- [x] Extension 12: Digital Twin Validation — `RealGraphImporter.js` (FakeNewsNet/PHEME importer, 4 persona inference strategies, trust heuristic), `ValidationMetrics.js` (depth/breadth/structural virality for real + simulated cascades), `ValidationComparison.js` (KS test, JS divergence, DTFS formula), `ContentDriftValidation.js` (sentiment trajectory Pearson R), `DigitalTwinRunner.js` (article injection/cleanup via TEMP_ARTICLE_ID), `BatchValidationRunner.js` (N-cascade distributional comparison), `SensitivityRunner.js` (4-strategy DTFS sensitivity), `--digital-twin` / `--validate-batch` / `--validate-sensitivity` CLI flags, `DT_ARTICLE_QA_QUERY` dry-run sentinel, sample cascade data, plots 16–19
- [ ] Continuous MI scoring (0.0–1.0 float) replacing binary question answers
- [ ] Multi-model ablation runner — same persona, N different models, compare MPRs
- [ ] Temporal dynamics — trust decay over time, re-seeding articles mid-simulation
- [ ] Strategic node placement optimizer — given K expert nodes, find placement minimizing MPR
- [ ] Batch API support for cheaper large-scale runs
- [ ] More articles (target: 10 domains × 3 articles each, matching paper scale)
- [ ] Export graph as Graphviz DOT for inclusion in paper figures
