# LLM Society Simulation

> **Simulating Misinformation Propagation in Social Networks using Large Language Models**

[![Paper](https://img.shields.io/badge/CIKM%202025-Outstanding%20Paper-gold)](https://dl.acm.org/doi/proceedings/10.1145/3627673)
[![Extension](https://img.shields.io/badge/EMNLP%202025-Under%20Review-blue)](https://2025.emnlp.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://python.org/)
[![No npm deps](https://img.shields.io/badge/npm%20dependencies-zero-brightgreen)]()

---

## Overview

This repository implements a configurable, file-backed **LLM-agent society simulation** for studying how misinformation propagates through social networks. Each node in the network is a persona-conditioned LLM agent that receives information, decides how to act on it (forward, reinterpret, drop, or dump), and passes it to its neighbours. A QA-based auditor then scores factual fidelity at every hop.

The base system reproduces the **CIKM 2025 outstanding paper** results. The EMNLP 2025 extension adds six research layers and five extensions covering node cognition, frame analysis, network co-evolution, strategic agents, opinion dynamics, and institutional trust.

```
                        ORIGIN
                          │  (seed article)
                          ▼
         ┌────────────────────────────────┐
         │  SimulationNode (LLM persona)  │
         │  inbox → action → history      │
         └────────────┬───────────────────┘
                      │  forward / reinterpret
              ┌───────┴────────┐
              ▼                ▼
         Node A            Node B
         (distorted         (accurate
          rewrite)           forward)
              │
              ▼
         Auditor: MI = 3 (lie)  ← scored after full propagation
```

**Key properties:**
- Zero RAM accumulation — all state on disk as JSON; restartable at any checkpoint
- Dry-run mode — complete pipeline with no LLM API calls (instant, zero cost)
- 26 personas × 9 graph topologies × 12 configurable flags (including 4 bot personas)
- Two-phase execution: propagation first, batch audit second — LLM rewrites and QA scoring never interleaved

---

## Table of Contents

1. [Citation](#citation)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [CLI Reference](#cli-reference)
6. [Configuration](#configuration)
7. [Society DSL](#society-dsl)
8. [Personas](#personas)
9. [Articles](#articles)
10. [Graph Topologies](#graph-topologies)
11. [Research Layers](#research-layers)
12. [Extensions](#extensions)
13. [Bot Detection & Resilience Testing](#bot-detection--resilience-testing)
14. [Output Files](#output-files)
15. [Visualization](#visualization)
16. [Reproducing Paper Results](#reproducing-paper-results)
17. [Project Structure](#project-structure)
18. [Extending the System](#extending-the-system)
19. [License](#license)
20. [Acknowledgements](#acknowledgements)

---

## Citation

If you use this code, please cite the original paper:

```bibtex
@inproceedings{maurya2025simulating,
  title     = {Simulating Misinformation Propagation in Social Networks using Large Language Models},
  author    = {Maurya, Raj Gaurav and others},
  booktitle = {Proceedings of the 34th ACM International Conference on Information and Knowledge Management (CIKM)},
  year      = {2025},
  note      = {Outstanding Paper Award}
}
```

For the EMNLP 2025 extension (this repository):

```bibtex
@inproceedings{maurya2025society,
  title     = {LLM Society Simulation: Multi-Layer Modeling of Misinformation Dynamics},
  author    = {Maurya, Raj Gaurav and others},
  booktitle = {Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing (EMNLP)},
  year      = {2025},
  note      = {Under review, Computational Social Science and Cultural Analytics track}
}
```

---

## System Requirements

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 18+ | No npm packages required |
| Python | 3.8+ | Visualization only — `pip install -r requirements_viz.txt` |
| OpenAI API key | — | For `gpt-4o` / `gpt-4o-mini` (set `OPENAI_API_KEY`) |
| Anthropic API key | — | For `claude-sonnet-4-6` (set `ANTHROPIC_API_KEY`) |
| Ollama | — | For local models — no key needed |

> **No API key needed** to run the full pipeline. Use `--dry-run` (or `--test-extensions`) to execute every code path with mock LLM responses.

---

## Installation

```bash
git clone https://github.com/RajGM/LLM_Society.git
cd LLM_Society

# No npm install needed — zero external Node.js dependencies

# Install Python visualization dependencies
pip install -r requirements_viz.txt
```

Set API keys (only needed for real LLM calls):

```bash
# Linux / macOS
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...

# PowerShell (Windows)
$env:OPENAI_API_KEY = "sk-..."
$env:ANTHROPIC_API_KEY = "sk-ant-..."
```

---

## Quick Start

### Smoke test — no API key, under 10 seconds

```bash
# Verify all 11 extensions in a 3-node dry-run
node index.js --test-extensions

# Run the base linear chain (5 nodes, 1 article)
node index.js --dry-run --config examples/run_linear_chain.json

# Compile and dry-run the example YAML scenario (202 nodes, all extensions)
node index.js --dry-run --scenario scenarios/climate_debate.yaml

# Run a bot resilience experiment (echo chamber, 3-phase, dry-run)
node index.js --dry-run --bot-resilience --config examples/run_bot_resilience.json

# Visualize all 10 plots
python visualize.py --latest
```

### Real run with GPT-4o-mini

```bash
export OPENAI_API_KEY=sk-...
node index.js --config examples/run_linear_chain.json
python visualize.py --latest
```

### Sample console output

```
[Simulation] Experiment: exp_2026-05-20_18-17-04
[Simulation] Dir: experiments/exp_2026-05-20_18-17-04

[Simulation] === Propagating: crime_0 ===
[Simulation]   Tick 1/10
[Simulation]     node_0 (Politically Biased Individual (Left-Wing)): 1 message(s)
[Simulation]     node_1 (News Agency (Sensationalist)): 1 message(s)
...

═══ SUMMARY ═══

Article: crime_0
Node         Persona                      MPR    Severity
-----------------------------------------------------------------
node_0       politically_biased_left      0.80   factual_error
node_1       sensationalist_news          2.40   lie
node_2       conflict_creator             4.00   propaganda
  Gini coefficient:    0.523
  Structural virality: 1.800
  MI half-life tick:   3
```

---

## CLI Reference

```
node index.js [options]

Options:
  (no args)                        Run with all defaults
  --dry-run                        Intercept all LLM calls; no API calls, no cost
  --config <path>                  Load a run config JSON (overrides defaults)
  --resume <experiment-dir>        Resume an interrupted run from its checkpoint
  --ab-test                        Run A/B comparison (requires --base and --variant)
    --base <path>                  Baseline config JSON
    --variant <path>               Variant config JSON (repeatable for multi-variant)
    --runs <n>                     Repetitions per config (default: 1)
  --test-extensions                Smoke test all five extensions; sets DRY_RUN=1 automatically
  --list-personas                  Print all available persona IDs
  --list-articles                  Print all available article IDs

Society DSL:
  --scenario <path>                Compile YAML scenario and run it
  --compile  <path>                Compile YAML scenario → JSON (does not run)
    --out <path>                   Write compiled JSON to this file (default: stdout)
    --summary                      Print a human-readable compilation report
  --validate <path>                Validate YAML scenario schema only; exit 0 if valid

Bot Resilience Testing:
  --bot-resilience                 Run 3-phase bot injection experiment (requires --config)
    --bot-densities <n,n,...>      Bot densities to test, e.g. 0.05,0.10,0.20 (default)
    --bot-types     <t,t,...>      Bot types: amplifier,distorter,agenda,flooder (default: all)
    --bot-placements <p,p,...>     Placement strategies: random,hubs,bridges,periphery,targeted_cluster
    --bot-removals  <r,r,...>      Removal strategies: none,remove_hubs,remove_random,remove_bridges,remove_all
    --article <id>                 Article ID to track for bot metrics (default: first seed article)
```

### Examples

```bash
# List available personas and articles
node index.js --list-personas
node index.js --list-articles

# Run a custom config
node index.js --config examples/run_echo_chamber.json

# Resume an interrupted run (safe to call even if already complete)
node index.js --resume experiments/exp_2026-05-20_18-17-04

# A/B test: echo chamber vs polarized vs linear chain, 3 runs each
node index.js --dry-run --ab-test \
  --base    examples/run_linear_chain.json \
  --variant examples/run_echo_chamber.json \
  --variant examples/run_polarized.json \
  --runs 3

# Society DSL workflow
node index.js --validate scenarios/climate_debate.yaml
node index.js --compile  scenarios/climate_debate.yaml --summary
node index.js --compile  scenarios/climate_debate.yaml --out compiled.json
node index.js --dry-run  --scenario scenarios/climate_debate.yaml
node index.js --scenario scenarios/climate_debate.yaml

# Bot resilience — full factorial + removal, all defaults
node index.js --dry-run --bot-resilience --config examples/run_bot_resilience.json

# Bot resilience — targeted: two densities, distorter only, hub placement
node index.js --bot-resilience \
  --config examples/run_bot_resilience.json \
  --bot-densities 0.05,0.15 \
  --bot-types distorter \
  --bot-placements hubs \
  --article politics_0
```

---

## Configuration

Experiments are configured by passing a JSON file to `--config`. Any field not set falls back to the defaults in `config/experiment.js`.

### Core parameters

| Parameter | Default | Description |
|---|---|---|
| `topology` | `"linear_chain"` | Graph shape (see [Graph Topologies](#graph-topologies)) |
| `topologyParams` | `{numNodes: 5}` | Topology-specific options |
| `maxTicks` | `10` | Maximum propagation rounds |
| `defaultModel` | `"gpt-4o-mini"` | LLM for all nodes (overridable per node) |
| `auditorModel` | `"gpt-4o-mini"` | LLM for the auditor and FrameAuditor |
| `auditorQuestions` | `5` | QA questions per article |
| `seedArticles` | `["crime_0"]` | Articles to propagate |
| `seedNodes` | `["node_0"]` | Nodes that receive the initial message |
| `defaultPersonaAssignment` | `"sequential"` | `"sequential"` / `"random"` / `"by_cluster"` |

### Node decision parameters (`nodeParams`)

| Parameter | Default | Description |
|---|---|---|
| `trustThreshold` | `0.2` | Minimum effective trust to accept a message |
| `actionWeights` | `{forward:0.3, reinterpret:0.5, drop:0.2}` | Probabilistic sampling weights |
| `relationEvolution` | `true` | Trust scores evolve after each interaction |
| `trustDelta` | `0.05` | Amount trust changes per interaction |
| `maxHops` | `8` | Hard cap on propagation depth |
| `activityPattern` | `"always"` | `"always"` / `"weekly"` / `"random"` |
| `maxInboxSize` | `20` | Per-article inbox cap — prevents cascade floods |
| `edgeDeletionThreshold` | `0.05` | Trust floor; edges below this are deleted |
| `strippedProperties` | `[]` | Persona fields to ablate (`"emotionalTone"`, etc.) |

### Layer and extension flags

| Flag | Default | Requires |
|---|---|---|
| `enableBeliefs` | `false` | — |
| `enableFrameAnalysis` | `false` | — |
| `competitiveGroups` | `[]` | — |
| `interventions` | `[]` | — |
| `enableProvenance` | `false` | — |
| `provenanceRecencyDiscount` | `0.9` | `enableProvenance` |
| `enableStrategicAgents` | `false` | — |
| `enableNetworkEvolution` | `false` | `enableBeliefs` |
| `networkEvolutionParams` | `{creationProb:0.05, ...}` | `enableNetworkEvolution` |
| `enableOpinionDynamics` | `false` | `enableBeliefs` |
| `opinionDynamicsParams` | `{steps:50, epsilon:0.3, voterRuns:10}` | `enableOpinionDynamics` |
| `enableInstitutionalTrust` | `false` | — |
| `institutionalTrustParams` | `{erosionRate:0.03, recoveryRate:0.01}` | `enableInstitutionalTrust` |
| `botInjection` | `null` | Bot injection config; see [Bot Detection](#bot-detection--resilience-testing) |

### Minimal config
```json
{}
```

### Full-featured config
```json
{
  "topology": "small_world",
  "topologyParams": { "numNodes": 20, "k": 4, "beta": 0.15 },
  "maxTicks": 15,
  "defaultModel": "gpt-4o-mini",
  "seedArticles": ["crime_0", "politics_0"],
  "seedNodes": ["node_0"],
  "enableBeliefs": true,
  "enableFrameAnalysis": true,
  "enableProvenance": true,
  "enableStrategicAgents": true,
  "enableNetworkEvolution": true,
  "enableOpinionDynamics": true,
  "enableInstitutionalTrust": true,
  "nodeParams": {
    "trustThreshold": 0.2,
    "actionWeights": { "forward": 0.3, "reinterpret": 0.5, "drop": 0.2 },
    "maxInboxSize": 20
  }
}
```

### Custom graph with explicit edges
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
    { "from": "origin",    "to": "left_wing",  "trust": 0.7 },
    { "from": "origin",    "to": "right_wing", "trust": 0.7 },
    { "from": "left_wing", "to": "journalist", "trust": 0.5 },
    { "from": "right_wing","to": "journalist", "trust": 0.5 }
  ]
}
```

---

## Society DSL

The Society DSL lets you describe entire experiments as a human-readable YAML file rather than hand-crafting flat JSON run configs. `src/DSLCompiler.js` compiles the YAML into the exact JSON format `Simulation.js` consumes.

### Why use the DSL?

| Task | JSON config | YAML scenario |
|---|---|---|
| 200-node polarized network | Enumerate 200 node entries + thousands of edges by hand | `groups: [{name: progressives, size: 100, ...}]` |
| Weighted persona mix | Not supported — one persona per node | `personas: [{id: env, weight: 3}, {id: journalist, weight: 1}]` |
| Deterministic graph | Not supported | `simulation: {random_seed: 42}` |
| Per-node strategy override | Edit each node's `params` manually | `strategic_overrides: [{node: amplifiers[0], strategy: ...}]` |
| Sliced custom links | One edge entry per pair | `- from: experts[0:2]` |

### Workflow

```bash
# 1. Validate — catch schema errors before compile
node index.js --validate scenarios/climate_debate.yaml

# 2. Inspect — compile to JSON and print a summary
node index.js --compile scenarios/climate_debate.yaml --summary

# 3. Save — write the compiled JSON for inspection or sharing
node index.js --compile scenarios/climate_debate.yaml --out compiled.json

# 4. Run — compile + run in one step
node index.js --scenario scenarios/climate_debate.yaml

# 5. Dry-run — free pipeline check
node index.js --dry-run --scenario scenarios/climate_debate.yaml
```

### Minimal YAML scenario

```yaml
title: My Experiment

simulation:
  random_seed: 42
  max_ticks: 10
  default_model: gpt-4o-mini

groups:
  - name: believers
    size: 20
    personas: [environmentalist]
    internal_connectivity: 0.2
    internal_trust: 0.7

  - name: skeptics
    size: 20
    personas:
      - id: politically_biased_right
        weight: 2
      - id: low_education
        weight: 1
    internal_connectivity: 0.2
    internal_trust: 0.65

relations:
  - from: believers
    to: skeptics
    trust: 0.25
    connectivity: 0.05

seed:
  articles: [politics_0]
  entry_points: [believers[0]]

extensions:
  beliefs: true
  provenance: true
  strategic_agents: true
```

### Compilation report

Running `--summary` prints:

```
Compiled: climate_debate.yaml
  Title:      Climate & AI Policy Debate
  Groups:     4 (progressives:80, skeptics:80, amplifiers:20, experts:20)
  Bridges:    2 (media_hub, conflict_node)
  Nodes:      202
  Edges:      3808  (density 0.094)
  Strategic:  4 node(s) (amplifiers_0, amplifiers_1, experts_0, conflict_node)
  Seed:       2 article(s) → media_hub, progressives_0
  Extensions: beliefs, frame_analysis, provenance, strategic_agents, network_evolution, opinion_dynamics, institutional_trust
  Ticks:      12  |  Model: gpt-4o-mini
  Seed (RNG): 42
```

### Node reference syntax

| Syntax | Resolves to |
|---|---|
| `group[0]` | First group member |
| `group[-1]` | Last group member |
| `group[*]` | All members |
| `group[0:2]` | Members at index 0, 1, 2 (inclusive) |
| `bridge_name` | The bridge node itself |

See `scenarios/climate_debate.yaml` for a complete worked example (4 groups, 2 bridge nodes, 3 interventions, all 7 extensions).

---

## Personas

26 personas — 22 LLM-conditioned human personas plus 4 synthetic bot personas. The `strategy` field (optional) activates utility-maximising action selection for Extension 4. Bot personas carry additional fields: `isBot`, `botType`, `botConfig`.

| ID | Name | Tags |
|---|---|---|
| `politically_biased_left` | Politically Biased Individual (Left-Wing) | ideology, political |
| `politically_biased_right` | Politically Biased Individual (Right-Wing) | ideology, political |
| `lifestyle_influencer` | Social Media Influencer (Lifestyle) | social-media, identity |
| `brand_collaborator` | Social Media Influencer (Brand Collaborator) | social-media, marketing |
| `sensationalist_news` | News Agency (Sensationalist) | media, sensationalism |
| `neutral_news` | News Agency (Politically Neutral) | media, neutral |
| `medical_expert` | Domain Expertise Specialist (Medical) | expert, healthcare |
| `tech_expert` | Domain Expertise Specialist (Technology) | expert, technology |
| `conflict_creator` | Intentional Agent (Conflict Creator) | intentional, adversarial |
| `peacekeeper` | Intentional Agent (Peacekeeper) | intentional, prosocial |
| `simplifier` | Content Creator (Simplifier) | communication, accessibility |
| `rural_educator` | Rural Educator | education, community |
| `young_parent` | Parent (Young Parent) | identity, family |
| `low_education` | Contextually Unaware Agent | cognitive, education |
| `lgbtq_advocate` | Gender Equality Advocate | advocacy, identity |
| `investigative_journalist` | Journalist (Investigative) | media, expert |
| `opinion_columnist` | Journalist (Opinion Columnist) | media, opinion |
| `religious_leader` | Religious Leader (Conservative) | ideology, religion |
| `gadget_enthusiast` | Tech-Savvy Consumer | consumer, technology |
| `environmentalist` | Environmentalist | advocacy, environment |
| `startup_founder` | Tech Startup Founder | entrepreneurship, technology |
| `neutral` | Neutral Agent (baseline) | neutral |
| **Bot personas** | | |
| `bot_amplifier` | Bot — Amplifier | bot, amplifier |
| `bot_distorter` | Bot — Distorter | bot, distorter |
| `bot_agenda` | Bot — Agenda Pusher | bot, agenda |
| `bot_flooder` | Bot — Flooder | bot, flooder |

List all at runtime: `node index.js --list-personas`

---

## Articles

5 real-world articles with pre-written QA auditor questions and ground-truth answers.

| ID | Domain | Title | Questions |
|---|---|---|---|
| `crime_0` | Crime | FBI 2023 Crime Report | 5 |
| `education_0` | Education | AI in College Debate | 5 |
| `technology_0` | Technology | IBM AI Debater | 5 |
| `politics_0` | Politics | AI Policy: Trump vs Harris | 5 |
| `healthcare_0` | Healthcare | Cancer Facts 2024 | 5 |

List all at runtime: `node index.js --list-articles`

**Adding a new article** — append to `articles/articles.json`:
```json
{
  "id": "your_article_id",
  "domain": "science",
  "title": "Article Title",
  "text": "Full article text...",
  "questions": [
    "Is claim A true?",
    "Does the article mention B?"
  ],
  "groundTruth": [true, false]
}
```

---

## Graph Topologies

Nine topology modes covering baseline configurations and real-world-inspired network structures.

### Baseline

| Key | Description | Use case |
|---|---|---|
| `linear_chain` | A→B→C→D — exact CIKM paper setup | Replication, ablation |
| `ring` | Each node connects to next; last wraps to first | Circular information flow |
| `random_er` | Erdős-Rényi random graph | Null-model comparison |
| `custom` | Explicit node list + edge list | Controlled experiments |

### Real-world society topologies

| Key | Real-world analogy | Network model | Key parameters |
|---|---|---|---|
| `small_world` | Workplace, academic circles, friend groups | Watts-Strogatz | `k` (neighborhood), `beta` (rewiring) |
| `scale_free` | Twitter/X, YouTube, news aggregators | Barabási-Albert | `m` (edges per new node) |
| `echo_chamber` | Partisan subreddits, ideological silos | Stochastic block model | `numChambers`, `intraEdgeProb`, `interEdgeProb` |
| `polarized` | Two-party political Twitter, extreme polarization | Two-cluster block model | `bridgeNodeIds`, `intraTrust`, `interTrust` |
| `hierarchical` | Traditional media, org comms, government | Rooted B-ary tree | `branchingFactor`, `downTrust`, `upTrust` |

All society topologies support **homophily trust** — edges between nodes with matching persona tags receive higher initial trust via Jaccard similarity.

### Example topology configs

```bash
# Small-world (15 nodes)
node index.js --dry-run --config examples/run_small_world.json

# Scale-free (20 nodes, hub formation)
node index.js --dry-run --config examples/run_scale_free.json

# Three-chamber echo chamber (18 nodes)
node index.js --dry-run --config examples/run_echo_chamber.json

# Polarized two-party (14 nodes + bridge nodes)
node index.js --dry-run --config examples/run_polarized.json

# Hierarchical media tree (13 nodes)
node index.js --dry-run --config examples/run_hierarchical.json
```

---

## Research Layers

The six layers from the EMNLP extension, all disabled by default and composable.

### Layer 1 — Node Cognition (`enableBeliefs`)

Per-node belief state and confirmation bias. Each node maintains a stance and confidence level for each article. High alignment with existing beliefs increases forwarding; low alignment increases dropping. Emotional intensity spikes on reinterpretation and confirmed high-MI content, further amplifying distortion.

*Cost: ~2 extra LLM calls per message processed.*

### Layer 2 — Content Analysis (`enableFrameAnalysis`)

Runs in the audit phase. Scores how much the rewritten content drifts in framing, sentiment, and claims. Adds `frameAnalysis` to every history event with `frameShift`, `sentimentDelta`, `newClaims`, and `coherenceScore`.

*Cost: 1 extra LLM call per audited history event.*

### Layer 3 — Network Dynamics

Competitive propagation, node dormancy, inbox cap, and edge deletion — all configurable independently without enabling any LLM-heavy layer.

### Layer 4 — External Interventions (`interventions`)

Inject corrections (`fact_checker_injection`), pre-emptive warnings (`inoculation`), or message suppression (`content_moderation`) at specified ticks. Fires during the propagation phase.

### Layer 5 — Extended Metrics (always-on)

Gini coefficient, structural virality (Goel et al.), information half-life, critical mass threshold, cascade reach vs. fidelity, frame metrics. All stored in `results_{articleId}.json` and printed in the summary.

### Layer 6 — Validation Infrastructure

A/B testing harness with Cohen's d effect sizes. Human evaluation CSV export with blank rating columns for crowd-sourcing.

---

## Extensions

Five extensions building on the six layers.

### Extension 1 — Provenance-Aware Trust (`enableProvenance`)

Every message carries a provenance chain. Chain trust is computed as:

```
T_chain = ∏_{i=0}^{n-1} t(r, p_i) · δ^(n-1-i)
```

where δ (`provenanceRecencyDiscount`, default 0.9) discounts older hops. Messages whose chain trust falls below `trustThreshold` are dropped.

### Extension 3 — Network Co-evolution (`enableNetworkEvolution`)

After each article's audit phase, edges are created between nodes with similar post-article opinions (homophily) and severed between ideologically incompatible nodes whose trust has collapsed. Tracked via Newman-Girvan modularity Q and homophily index.

*Requires `enableBeliefs: true`.*

### Extension 4 — Strategic Agents (`enableStrategicAgents`)

Add a `"strategy"` field to any persona entry in `personas.json` to switch it from probabilistic to utility-maximising. Four strategies: `maximize_downstream_mi`, `maximize_reach`, `minimize_downstream_mi`, `maximize_alignment`. No code changes needed — just a JSON edit.

### Extension 8 — Opinion Dynamics (`enableOpinionDynamics`)

Post-audit analysis using three classical models: **DeGroot** (iterative trust-weighted averaging), **Bounded Confidence / Hegselmann-Krause** (update only within ε), **Voter model** (random neighbour adoption, averaged over runs). Classifies convergence as consensus / polarized / fragmented. Results saved to `opinion_dynamics_{articleId}.json`.

*Requires `enableBeliefs: true`.*

### Extension 9 — Institutional Trust (`enableInstitutionalTrust`)

Each node maintains trust toward four institutions: **media**, **science**, **government**, **corporate**. When receiving a message, the sender's institutional affiliation multiplies the raw edge trust: `adjustedTrust = clamp(directTrust × (0.5 + instTrust), 0, 1)`. Institutional trust erodes after high-MI events and recovers after accurate ones.

---

## Bot Detection & Resilience Testing

Extension 10 models adversarial automation in the network — measuring how synthetic bots amplify misinformation, identifying the most damaging bot configurations, and testing which removal strategies are most effective.

### Bot personas

Four synthetic bot personas in `personas/personas.json`, each with `isBot: true`, `botType`, and `botConfig`:

| ID | Type | Behavior | duplicateMessages |
|---|---|---|---|
| `bot_amplifier` | `amplifier` | Forwards every message immediately, no modification | 3 |
| `bot_distorter` | `distorter` | Always reinterprets (LLM-free corruption) | 1 |
| `bot_agenda` | `agenda` | Forwards ~67% of messages (drops off-agenda); pushes 2 copies | 2 |
| `bot_flooder` | `flooder` | Saturates by forwarding every message 5 times | 5 |

Bots bypass trust checks, provenance checks, and belief computation — they use the `BotEngine.processMessage()` fast-path.

### Placement strategies

| Strategy | Targets |
|---|---|
| `random` | Uniformly random node selection |
| `hubs` | Highest-degree nodes (maximises initial reach) |
| `bridges` | Highest betweenness centrality (Brandes BFS approximation) |
| `periphery` | Lowest-degree nodes (tests fringe infiltration) |
| `targeted_cluster` | Highest-degree seed + its immediate neighbors |

### Bot metrics (in `results_{articleId}.json`)

| Metric | Meaning |
|---|---|
| `botMeanMI` | Mean MI score for events produced by bot nodes |
| `humanMeanMI` | Mean MI score for events produced by human nodes |
| `botMIDelta` | `botMeanMI − humanMeanMI` (positive = bots cause more distortion) |
| `botReachFraction` | Fraction of all forwarding events attributed to bots |
| `botAmplificationFactor` | `botForwards / humanForwards` ratio |
| `cascadeContamination` | Fraction of all events with at least one bot in their provenance chain |
| `botCausalContribution` | Counterfactual: `actualMeanMI − meanMI_without_bot_provenance` |

### Three-phase experiment protocol

`BotResilienceRunner` automates:

1. **Baseline** — clean run with no bots
2. **Injection** — full factorial: `density × botType × placement` combinations
3. **Removal** — worst-case injection with each of 5 removal strategies tested in turn

Results are written to `experiments/bot_resilience_{timestamp}/summary.json` and printed as a formatted table.

### Running a bot resilience experiment

```bash
# Dry-run (no API calls)
node index.js --dry-run --bot-resilience --config examples/run_bot_resilience.json

# Full run
node index.js --bot-resilience --config examples/run_bot_resilience.json

# Custom: only test distorter at hub positions, two densities
node index.js --bot-resilience \
  --config examples/run_bot_resilience.json \
  --bot-densities 0.05,0.10 \
  --bot-types distorter \
  --bot-placements hubs \
  --bot-removals none,remove_hubs,remove_all \
  --article politics_0
```

### DSL bot injection

Inject bots directly from a YAML scenario with the `bots:` key:

```yaml
bots:
  - type: distorter
    density: 0.10
    placement: hubs
    removal: none
```

The compiler validates `type`, `placement`, `removal`, and `density` and emits a `botInjection` block in the compiled JSON.

---

## Output Files

Every run produces a self-contained experiment folder:

```
experiments/exp_{timestamp}/
├── state.json                        # Phase + status checkpoint (used by --resume)
├── metadata.json                     # Full config, status, results summary
├── graph_topology.json               # Nodes and edges (initial + evolved trust)
├── nodes/
│   └── {nodeId}.json                 # Per-node inbox, full event history, stats
├── beliefs/
│   └── {nodeId}.json                 # Belief state + emotional state (Layer 1)
├── institutional_trust.json          # Per-node institutional trust (Extension 9)
├── results_{articleId}.json          # Node MPR summaries + all Layer 5 metrics
├── opinion_dynamics_{articleId}.json # DeGroot / BC / Voter results (Extension 8)
├── human_eval_template.csv           # Sampled pairs for human rating
└── plots/
    ├── 01_graph_topology.png
    ├── 02_mpr_heatmap.png
    ├── 03_action_distribution.png
    ├── 04_propagation_wave.png
    ├── 05_mi_trajectory.png
    ├── 06_trust_evolution.png
    ├── 07_network_evolution.png
    ├── 08_opinion_dynamics.png
    ├── 09_institutional_trust.png
    ├── 10_bot_impact.png
    └── dashboard.png
```

Bot resilience experiments produce an additional directory:

```
experiments/bot_resilience_{timestamp}/
├── summary.json                      # Baseline, injection, and removal results
└── exp_{timestamp}/                  # One sub-experiment per combination
    └── ...
```

### `results_{articleId}.json` schema

```json
{
  "nodeSummaries": {
    "node_0": {
      "personaId": "politically_biased_left",
      "mpr": 2.4,
      "severity": "lie",
      "eventCount": 3,
      "stats": { "received": 3, "forwarded": 1, "reinterpreted": 2, "dropped": 0, "dumped": 0 }
    }
  },
  "metrics": {
    "giniCoefficient": 0.523,
    "structuralVirality": 1.800,
    "informationHalfLife": { "networkMedian": 3 },
    "criticalMassThreshold": { "1": 0.2, "3": 0.6 },
    "frameMetrics": { "meanFrameShift": 0.42, "totalNewClaims": 7 }
  },
  "provenanceMetrics": {
    "meanChainTrust": 0.38,
    "provenanceDiversity": 4
  },
  "networkEvolution": {
    "edgesAdded": 1,
    "edgesRemoved": 0,
    "modularityQ": 0.312,
    "homophilyIndex": 0.67
  },
  "botImpact": {
    "botMeanMI": 3.8,
    "humanMeanMI": 1.9,
    "botMIDelta": 1.9,
    "botReachFraction": 0.34,
    "botAmplificationFactor": 2.1,
    "cascadeContamination": 0.61
  },
  "botCounterfactual": {
    "actualMeanMI": 2.4,
    "counterfactualMeanMI": 1.1,
    "botCausalContribution": 1.3
  }
}
```

### Misinformation Index (MI) and severity

| MI (0–5) | MPR range | Severity | Meaning |
|---|---|---|---|
| 0 | ≤ 1.0 | `factual_error` | Minor inaccuracies |
| 1–2 | 1.0–3.0 | `lie` | Significant distortion |
| 3–5 | > 3.0 | `propaganda` | Near-complete fabrication |

---

## Visualization

```bash
# Install dependencies (one time)
pip install -r requirements_viz.txt

# Auto-pick the most recent experiment
python visualize.py --latest

# Specific experiment
python visualize.py experiments/exp_2026-05-20_18-17-04

# Write to a custom directory (e.g., for a paper submission)
python visualize.py --latest --out-dir paper_figures/
```

### Generated plots (all dark theme, 150 DPI)

| Plot | Description |
|---|---|
| `01_graph_topology.png` | Directed graph; node color = persona category, size = messages received, edge width = trust |
| `02_mpr_heatmap.png` | Nodes × articles MPR heatmap with severity color scale — mirrors Fig 3 from CIKM paper |
| `03_action_distribution.png` | Stacked bar: forward / reinterpret / drop / dump counts per node |
| `04_propagation_wave.png` | Messages generated per tick per article (propagation speed and reach) |
| `05_mi_trajectory.png` | MI per tick per node per article — mirrors Fig 4 from CIKM paper |
| `06_trust_evolution.png` | Initial vs final trust per edge; delta annotated green (grew) or red (dropped) |
| `07_network_evolution.png` | Edges added/removed, modularity Q, homophily index per article (Extension 3) |
| `08_opinion_dynamics.png` | DeGroot convergence trajectory per node (Extension 8) |
| `09_institutional_trust.png` | Per-node trust toward media / science / government / corporate (Extension 9) |
| `10_bot_impact.png` | 4-panel bot dashboard: contamination vs density, reach by placement, causal MI by bot type, removal effectiveness (Extension 10) |
| `dashboard.png` | All 10 plots + experiment metadata in a single 22×30 figure |

Plots 07–10 **degrade gracefully** — if the corresponding data is absent, they display an informative placeholder rather than raising an error.

---

## Reproducing Paper Results

The CIKM paper used a **linear chain of 5 nodes** with 21 heterogeneous personas propagating 5 articles. Reproduce with:

```bash
export OPENAI_API_KEY=sk-...

# Base paper setup
node index.js --config examples/run_linear_chain.json

python visualize.py --latest
```

For the paper's **homogeneous vs heterogeneous** comparison, run the same article through a single-persona chain vs the mixed-persona chain and compare MPR distributions.

### A/B test: linear chain vs echo chamber

```bash
node index.js --ab-test \
  --base    examples/run_linear_chain.json \
  --variant examples/run_echo_chamber.json \
  --runs 3
```

This reports Cohen's d effect sizes for all Layer 5 metrics. Results written to `ab_tests/comparison_{timestamp}.json`.

### Resuming a failed run

```bash
# If a run was interrupted (e.g., API rate limit), resume it
node index.js --resume experiments/exp_2026-05-20_18-17-04
```

The simulation restarts from the exact article and tick where it stopped. No duplicate LLM calls.

---

## Project Structure

```
LLM_Society/
├── config/
│   ├── models.js              # LLM provider registry
│   └── experiment.js          # All default parameters
│
├── personas/
│   └── personas.json          # 26 persona definitions (22 human + 4 bot)
│
├── articles/
│   └── articles.json          # 5 seed articles with QA ground truth
│
├── src/
│   ├── fileIO.js              # JSON I/O utilities
│   ├── llmClient.js           # Multi-provider LLM client + dry-run interceptor
│   ├── Auditor.js             # MI / MPR / severity computation
│   ├── SimulationNode.js      # Node decision engine (all layers/extensions integrated)
│   ├── SocietyGraph.js        # 9 topology builders + matrix helpers
│   ├── Simulation.js          # Two-phase orchestrator — propagation → audit
│   ├── DSLCompiler.js         # Society DSL — YAML scenario → JSON run config
│   │
│   ├── BeliefEngine.js        # Layer 1: per-node belief state + confirmation bias
│   ├── FrameAuditor.js        # Layer 2: frame shift, sentiment drift, claim injection
│   ├── InterventionEngine.js  # Layer 4: fact-checker, inoculation, moderation
│   ├── MetricsEngine.js       # Layer 5: Gini, structural virality, half-life, bot metrics
│   ├── ABTestRunner.js        # Layer 6: A/B harness with Cohen's d
│   │
│   ├── ProvenanceEngine.js    # Extension 1: multi-hop chain trust
│   ├── NetworkEvolution.js    # Extension 3: homophily edge creation/deletion
│   ├── StrategyEngine.js      # Extension 4: utility-maximising strategic agents
│   ├── OpinionDynamics.js     # Extension 8: DeGroot / BC / Voter model
│   ├── InstitutionalTrust.js  # Extension 9: per-node institutional trust
│   ├── BotEngine.js           # Extension 10: bot detection, injection, centrality
│   └── BotResilienceRunner.js # Extension 10: 3-phase bot resilience experiment runner
│
├── scenarios/                 # YAML scenario files for the Society DSL
│   └── climate_debate.yaml    # Example: 202 nodes, all extensions, 12 ticks
│
├── examples/                  # Ready-to-run config JSON files
│   └── run_bot_resilience.json# Bot resilience echo-chamber config
├── experiments/               # Experiment outputs (auto-created)
├── ab_tests/                  # A/B test reports (auto-created)
│
├── index.js                   # CLI entry point
├── visualize.py               # Python visualization pipeline
├── requirements_viz.txt       # Python dependencies
├── ARCHITECTURE.md            # Full technical reference
└── README.md                  # This file
```

For a deep dive into every design decision, data schema, and component interface, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Extending the System

| What | Where | How |
|---|---|---|
| New persona | `personas/personas.json` | Append a JSON entry; no code changes |
| New bot persona | `personas/personas.json` | Append with `"isBot": true`, `"botType"`, and `"botConfig"` fields |
| Strategic persona | `personas/personas.json` | Add `"strategy": "maximize_reach"` to any entry |
| New article | `articles/articles.json` | Append with `id`, `domain`, `title`, `text`, `questions`, `groundTruth` |
| New scenario | `scenarios/` | Write a `.yaml` file using the DSL schema; validate → compile → run |
| New LLM provider | `config/models.js` + `src/llmClient.js` | Add entry + dispatch branch |
| New topology | `src/SocietyGraph.js` + `src/Simulation.js` | Add `static build*()` + case in `_buildGraph()` |
| New visualization | `visualize.py` | Add `plot_*()` + call in `save_individual` + subplot in `build_dashboard` |
| New dry-run mock | `src/llmClient.js` | Embed unique sentinel keyword in LLM call; add branch in `callLLMDryRun()` |
| New intervention type | `src/InterventionEngine.js` | Add case in `applyAtTick()` |

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgements

This work builds on the CIKM 2025 outstanding paper. The society simulation framework and all extensions were developed as part of the EMNLP 2025 submission.

The five articles used for evaluation are sourced from publicly available news and government reports. The 22 human persona system prompts and 4 bot personas are original contributions of this work.

**LLM providers:** OpenAI GPT-4o / GPT-4o-mini, Anthropic Claude Sonnet 4.6, Ollama (local).

For questions, issues, or collaboration inquiries, please open a GitHub issue.

