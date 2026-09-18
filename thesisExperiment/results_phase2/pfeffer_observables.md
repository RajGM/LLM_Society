# Pfeffer observables — seven-factor remapping (Phase 2)

Pfeffer, Zorbach & Carley (2014) *Understanding online firestorms* lists **seven** interrelated factors in the Outlook section. It does **not** list the thesis six-knob names (valence, surprise, identity, clustering, echo, temporal) as a canonical six-factor theory. Those six are a **computational remapping**. Phase 2 records a seventh observable (**cross-media**) as held, so the operational table has seven rows — matching the paper’s count, not renaming its factors.

Source: Pfeffer, J., Zorbach, T., & Carley, K. M. (2014). Understanding online firestorms: Negative word-of-mouth dynamics in social media networks. *Journal of Marketing Communications*, 20(1–2), 117–128.

## Pfeffer 2014 — seven factors (primary)

| # | Factor | Mechanism (paraphrase) |
|---|---|---|
| 1 | Speed and volume of communication | Real-time platforms compress reaction cycles; topic dominance → high volume |
| 2 | Binary choices | Like / share / retweet as either–or (Schelling binary choice); limited discursive interaction |
| 3 | Network clusters | Local clustering / triadic closure → information echoes from multiple neighbours |
| 4 | Unrestrained information flow | Hundreds–thousands of weak ties vs offline sympathy-group limits |
| 5 | Lack of diversity | Homophily + algorithmic filter bubbles |
| 6 | Cross-media dynamics | Social → legacy media → social amplification loop |
| 7 | Network-triggered decision processes | Knowledge / persuasion / propagation / affirmation compressed into network effects |

## Thesis remapping (seven observables)

Do not write “Pfeffer identified six factors.” Do not write “Pfeffer identified these seven knobs.” Cite 2014 for the table above; cite this file for the engine mapping.

| Observable (this campaign) | Closest Pfeffer 2014 factor(s) | Empirical Debnath | Simulated D-net / custom | Engine status |
|---|---|---|---|---|
| **Valence** | Affective / indignation character of firestorm messages (definition), not a numbered Outlook factor | Paper-quoted toxicity mean ~0.17 / hashtag toxicity proxy | Mean auditor MI; frame sentiment if FrameAuditor is on | Varied via articles + persona tone. **Not Twitter MI.** |
| **Surprise** | #1 speed and volume (shock vs drip) | Paper notes SCoPEx April 2017 volume spike; not a reconstructed shock series | Drip `seedNodes: [node_0]` unless a shock cell exists | **Held** (drip) |
| **Identity** | #5 lack of diversity | Hashtag mix: conspiracy vs climate-action vs environmental vs other | BP mix / conspiracy vs other personas on `graph_topology.json` | Swept homo vs hetero in T-H / T-He; measured on D-net |
| **Clustering** | #3 network clusters | Degree / conspiracy-cut modularity on hashtag graph | Degree / modularity on `graph_topology.json` | Swept in topology grid; measured on custom graph |
| **Echo** | #3 clusters + #4 unrestrained flow + parts of #5 | Edge homophily on hashtag identity | Edge homophily on persona / conspiracy cut | Measured |
| **Temporal** | #1 speed and volume; #7 network-triggered decisions | **Not available** on a hashtag co-occurrence fallback (no tweet clock) | `speedTicks` / `maxTicks` / hops | **Held** at 8 ticks (compression, not Debnath) |
| **Cross-media** | #6 cross-media dynamics | Not in the reconstruct used here | No legacy-media broadcast agent | **Held**, no engine knob |

**Binary choices (Pfeffer 2014 #2)** has no dedicated observable row: the engine is three-way (forward / reinterpret / drop), not like/share binary. It is implicit in action weights, not swept.

## Honesty

- Debnath has **no empirical MPR**. Simulated MI is an LLM-as-judge auditor score. Do not equate the two.
- Hashtag co-occurrence is **not** a retweet cascade.
- If `runs_phase2` D-net / custom cells are missing, the comparison JSON still holds the empirical Pfeffer table and marks simulation **pending**.
