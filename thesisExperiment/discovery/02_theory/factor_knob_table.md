# Factor → config / engine knobs

**Scope:** keys the **existing** simulator already honours. Inspected read-only: `config/experiment.js`, `src/Simulation.js`, `src/SocietyGraph.js`, `src/SimulationNode.js`, `src/Auditor.js`, `src/InterventionEngine.js`, `src/FrameAuditor.js`, `src/MetricsEngine.js`, `thesisExperiment/configs/*.json`, persona JSON schema.

The object `"pfeffer": { ... }` in campaign JSON is **documentation only**. `Simulation._mergeConfig` stores it in `metadata.json` but no engine branch reads it.

Pfeffer et al. (2014) list **seven** qualitative factors. The proposal remaps a **computational six**. Cross-media dynamics has **no knob** (§8).

---

## How to read the table

| Column | Meaning |
|---|---|
| Factor | Proposal / campaign name |
| IV grain | What you actually change |
| Exact keys | JSON paths as written in a run config or persona file |
| Engine site | Where the key is consumed |
| Campaign status | Swept / held / measured in `thesisExperiment/configs/` (pilot) |

Defaults in `config/experiment.js` apply unless a run config overrides them.

---

## 1. Valence (emotional charge)

| | |
|---|---|
| **IV (primary)** | Seed text + persona affective style |
| **Exact keys** | `seedArticles` (array of article ids) · `articlesPath` · persona fields `emotionalTone`, `toxicityPrior`, `nrcStyle`, `systemPrompt` · optional `enableFrameAnalysis` (bool) |
| **Engine** | `Simulation._propagateGroup` injects `article.text` at tick 0. Rewrite prompt is `persona.systemPrompt` (`SimulationNode._reinterpret`). FrameAuditor (`src/FrameAuditor.js`) writes `history[].frameAnalysis.{sentiment, sentimentDelta}` only if `enableFrameAnalysis: true`. |
| **Campaign** | **Varied** by article contrast: `scopex_2017` (calm, factual) vs `chemtrails_gates_2018_2021` (conspiracy-adjacent, high-arousal topic). BP tones: conspiracy `emotionalTone: "alarming"`, climate action `"urgent"`, environmental `"cautious"` (`thesisExperiment/personas/*.json`). FrameAuditor **off**. |
| **Not a key** | There is no `valence:` engine parameter. Do not invent one. |

**Manipulation check (optional, extra LLM cost):** `enableFrameAnalysis: true` → compare `frameAnalysis.sentiment` across seeds. Not required for H1 if the two seed texts are treated as the valence contrast by design.

---

## 2. Surprise (volume shock vs drip)

| | |
|---|---|
| **IV (primary)** | Cardinality of simultaneous seeds at tick 0 |
| **Exact keys** | `seedNodes` (array) · optional `competitiveGroups[].seedNodes` · `nodeParams.actionWeights.reinterpret` |
| **Engine** | `Simulation._propagateGroup`: **every** id in `seedNodes` receives `article.text` at `tick: 0`. Drip = `["node_0"]`. Shock = all `node_0` … `node_{n-1}`. Reinterpret weight controls overwrite of the original frame (`SimulationNode._sampleAction`). |
| **Campaign** | **Held** drip: `"seedNodes": ["node_0"]`. Reinterpret held at `0.50`. Volume-shock cell **not** in `grid.json`. |
| **Secondary** | `maxInboxSize` caps how much of a shock survives (excess discarded). Shock × dense graph will hit this cap. |

**Not implemented as a named “surprise” flag.** Proposal’s “tweet-volume deviation from 30-day baseline” is approximated by seed fan-out, not by a time-series of tweet counts.

---

## 3. Identity alignment (message–identity fit)

| | |
|---|---|
| **IV (primary)** | Persona mix + assignment |
| **Exact keys** | `personasPath` · `defaultPersonaAssignment` (`"sequential"` \| `"by_cluster"` \| `"random"`) · `topologyParams.personasByCluster` · persona `id`, `tags`, `ideologicalBias`, `debnathType`, `systemPrompt` |
| **Engine** | `Simulation._makeNodeConfigs` maps personas onto `node_i`. `SocietyGraph._homophilyTrust` sets initial edge trust from Jaccard of `tags` (not a config key). `nodeParams.trustThreshold` (default `0.2`; campaign `0.15`) gates drop vs process. |
| **Campaign** | **Swept:** `thesisExperiment/personas/homogeneous_conspiracy.json` vs `mixed_three_bp.json`. Assignment `"sequential"` on A/B; `"by_cluster"` on `D_echo_mix.json`. |

Homophily trust is **automatic** whenever `personaMap` is passed into ER / scale-free / echo / polarized / hierarchical builders (`src/SocietyGraph.js`). There is no `"_homophilyTrust": true` switch.

---

## 4. Network clustering (hubs vs random vs bubbles)

| | |
|---|---|
| **IV (primary)** | Graph generator |
| **Exact keys** | `topology` · `topologyParams` · `graphRandomSeed` |
| **Engine** | `Simulation._buildGraph` switch. RNG: `Simulation._graphRng` → `SocietyGraph.mulberry32` iff `graphRandomSeed` is set. |

| `topology` value | `topologyParams` keys | Builder |
|---|---|---|
| `"scale_free"` | `numNodes`, `m` (BA attachments; default `m=2`) | `SocietyGraph.buildScaleFree` |
| `"random_er"` | `numNodes`, `edgeProbability`, `minSeedOutDegree` | `buildRandomER` (seeded + min out-degree) |
| `"echo_chamber"` | `numNodes`, `numChambers`, `intraEdgeProb`, `interEdgeProb`, `intraTrust`, `interTrust`, `minSeedOutDegree`, optional `personasByCluster` | `buildEchoChamber` |
| `"small_world"` | `numNodes`, `k`, `beta` | `buildSmallWorld` |
| `"polarized"` | `intraEdgeProb`, `interEdgeProb`, `intraTrust`, `interTrust`, `bridgeNodeIds` | `buildPolarized` |
| `"hierarchical"` | `branchingFactor`, `downTrust`, `upTrust` | `buildHierarchical` |
| `"linear_chain"` | `numNodes` | `buildLinearChain` — **CIKM object; not a firestorm clustering contrast** |
| `"ring"` | `numNodes` | `buildRing` |
| `"custom"` | uses top-level `nodes`, `edges` | `buildCustom` |

**Campaign:** **Swept** `scale_free` (`m: 2`) vs `random_er` (`edgeProbability: 0.42`, `minSeedOutDegree: 2`). Extra `echo_chamber` in `D_echo_mix.json`. `graphRandomSeed: 42` on all climate cells.

`minSeedOutDegree` is a **cascade-death guard**, not a clustering factor. Unseeded ER can leave `node_0` with out-degree 0.

---

## 5. Information echo (closed-group repetition)

| | |
|---|---|
| **IV (sweep)** | Chamber wiring + trust evolution |
| **Exact keys** | `topology: "echo_chamber"` + `topologyParams.{intraEdgeProb, interEdgeProb, intraTrust, interTrust, numChambers}` · `nodeParams.relationEvolution` · `nodeParams.trustDelta` · `nodeParams.edgeDeletionThreshold` · optional `enableNetworkEvolution` + `enableBeliefs` + `networkEvolutionParams.{creationProb, severingThreshold, maxNewEdges, trustForNewEdge}` |
| **Engine** | Echo builder: dense high-trust intra edges, sparse low-trust inter edges. `SimulationNode.auditPendingEvents`: if `relationEvolution`, trust \(+\Delta\) when MI \(\le 3\), \(-\Delta\) when MI \(> 3\); edge deleted if trust \(\le\) `edgeDeletionThreshold`. Network evolution (Ext. 3) **creates/severs** edges after audit; requires `enableBeliefs: true`. |
| **Campaign** | Evolution **on** (`relationEvolution: true`, `trustDelta: 0.05`). `enableNetworkEvolution` **false** (default). Echo **measured** on A/B via parser; **swept** only in D. |

**Measured DVs (not knobs)** — `thesisExperiment/scripts/parse_results.js`:

| Parser / engine field | Quantity |
|---|---|
| `echo.edgeHomophily` | fraction of edges with identical `personaId` |
| `echo.conspiracyHomophily` | fraction of edges with matching conspiracy/non-conspiracy cut |
| `echo.modularityConspiracy` | Newman–Girvan-style Q on that cut |
| `polarization.pi` | \(\lvert \overline{\mathrm{MPR}}_{\mathrm{conspiracy}} - \overline{\mathrm{MPR}}_{\mathrm{other}} \rvert\) |
| `giniCoefficient` | `MetricsEngine.giniCoefficient` of per-node mean MI |
| `hopMI` | mean MI by `history[].hops` |

`PolarizationMetrics.polarizationIndex` (belief-stance modularity) requires `enableBeliefs` snapshots; the campaign PI above is the **parser** persona-gap, not Ext. 11.

---

## 6. Temporal acceleration (runaway speed)

| | |
|---|---|
| **IV (primary)** | Opportunity rate × horizon |
| **Exact keys** | `maxTicks` · `nodeParams.maxHops` · `nodeParams.activityPattern` (`"always"` \| `"weekly"` \| `"random"`) · `nodeParams.maxInboxSize` |
| **Engine** | Tick loop `for tick = 1 .. maxTicks` (`Simulation._propagateGroup`). `SimulationNode._isActive`: `weekly` ⇒ `tick % 7 === 1`; `random` ⇒ P(active)\(=0.7\); `always` ⇒ every tick. Messages with `hops > maxHops` are not forwarded. Inbox overflow discarded. |
| **Campaign** | **Held** compressed: `maxTicks: 6`, `maxHops: 6`, `activityPattern: "always"`, `maxInboxSize: 4`. Proposal text mentioned longer interaction windows (\(t \in \{10,30,50\}\) for echo modularity; ~15-tick examples in `examples/run_scale_free.json`). |

**Contrast required to test H6.** Holding 6/6/always documents a setting; it does **not** sweep the factor.

Hop compression \(\neq\) hop index. Never treat `tick` as `hops`.

---

## 7. Cross-domain (Debnath RQ — not a Pfeffer factor)

| | |
|---|---|
| **IV** | Domain of the seed article |
| **Exact keys** | `seedArticles` · `articlesPath` |
| **Climate (thesis)** | `articlesPath: "thesisExperiment/articles/articles.json"` — ids `scopex_2017`, `chemtrails_gates_2018_2021`, plus other geoengineering/ClimateFEVER-style items in that file |
| **Commercial / general news (CIKM corpus, method reuse only)** | default / `"articles/articles.json"` — ids `crime_0`, `education_0`, `technology_0`, `politics_0`, `healthcare_0` |
| **Engine** | Same auditor, same graph. Domain is entirely which `article.text` + `questions` are loaded. |

Do **not** identify this contrast with a 21×10×30 linear-chain reprint. Same society, different seed family.

---

## 8. Correction / continued influence (proposal Exp B)

| | |
|---|---|
| **IV** | Exposures before correction = intervention clock |
| **Exact keys** | `interventions[]`: `{ "type": "fact_checker_injection", "tick": n, "articleId": "...", "targetNodes": optional, "params": { "correctionStrength": 0.9 } }` |
| **Engine** | `InterventionEngine._factCheckerInjection` at that tick injects original `article.text` with a `[FACT CHECK]` header; `injectedTrust` = `correctionStrength` (default 0.85). |
| **Campaign** | `B_sf_mix_n1.json` `tick: 1`; `B_sf_mix_n3.json` `tick: 3`. `n=5` not in the pilot grid. |
| **Siblings** | `"type": "inoculation"` (prebunk; lowers effective scepticism via warning message) · `"type": "content_moderation"` (`params.maxHops`) |

`n` is **timing**, not statistical replicate \(N\).

---

## 9. Shared run keys (hold unless a hypothesis names them)

| Key | Campaign climate cells | Role |
|---|---|---|
| `experimentName` | `A_sf_hom` / `A_sf_mix` / `A_er_hom` / `A_er_mix` / `B_*` / `D_echo_mix` | output folder prefix |
| `outputRoot` | `thesisExperiment/runs` | |
| `defaultModel`, `auditorModel` | `gpt-4o-mini` | |
| `miScoringMode` | `"discrete"` | MI integer 0–5 |
| `nodeParams.actionWeights` | `forward: 0.35`, `reinterpret: 0.50`, `drop: 0.15` | |
| `nodeParams.trustThreshold` | `0.15` | |
| `enableBeliefs` | default `false` | extra LLM; required for Ext. 3/8 |
| `enableFrameAnalysis` | default `false` | valence manipulation check |
| `enableProvenance` | default `false` | chain trust |
| `competitiveGroups` | `[]` | simultaneous articles (attention competition; unused in campaign) |

---

## 10. Pfeffer 2014 factor with no knob

| Pfeffer 2014 | Status |
|---|---|
| Cross-media dynamics (social \(\to\) legacy \(\to\) social) | **Untestable** in this engine. No broadcast / newsroom agent. Flag as a boundary, not a silent sixth-of-seven. |

Binary like/share (Pfeffer “binary choices”) is only a crude analogue of `actionWeights` `{forward, reinterpret, drop}` — ternary, not binary. Do not claim a dedicated binary-choice factor.

---

## 11. Mapping: proposal operationalisation → keys

Proposal Phase I mapping (corpus language) vs what the **simulator** can actually set:

| Proposal phrase | Simulator stand-in |
|---|---|
| valence = toxicity score | persona `toxicityPrior` + seed wording; not live Perspective API |
| surprise = volume vs 30-day baseline | `seedNodes` length at tick 0 |
| identity alignment = BP cluster homogeneity | `personasPath` + assignment |
| network clustering = eigenvector / topology | `topology` + BA `m` / ER `p` |
| information echo = BP homogeneity in cascades | echo topology + measured homophily / Q / PI |
| temporal acceleration = inter-tweet interval compression | `activityPattern` + `maxTicks` / `maxHops` |
