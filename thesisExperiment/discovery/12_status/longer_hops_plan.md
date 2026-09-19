# Plan: extend H/He chains from 8 to 30 hops (CIKM length)

**Date.** 18 September 2026.  
**Status.** Planning only. **No 30-hop grid was started.** No 8-hop configs, `thesisExperiment/runs/`, or `results/` tables were modified.  
**Sources.** `src/Simulation.js`, `src/SimulationNode.js`, `src/SocietyGraph.js`, `index.js`, `thesisExperiment/scripts/build_stimuli.js`, `run_full_campaign.js`, `parse_results.js`, `configs/full/H_conspiracy_believer.json`, `configs/grid_full.json`, `results/summary.json` (`llmUsageTotals.calls = 8723`), `discovery/12_status/timeline.md`, `cikm_hops.md`.

Cost is not the constraint. **Wall-clock and isolation** are. A full 12×12×30 reprint is unnecessary for the claim that 8 hops right-censor CIKM’s plateau; a **72-cell subset** answers that in ~40–60 min at concurrency 2.

---

## Recommendation (time-first)

1. **Do not** rerun the full 12×12×30 homogeneous + heterogeneous grid.  
2. **Do not** mutate `configs/full/*.json`, `CHAIN_NODE_PARAMS`, or `grid_full.json` in place.  
3. If anything is run: a **new `outputRoot`**, **new `experimentName` prefix**, **new config dir**. Leave the 8-hop dataset as the thesis object.  
4. Smallest high-value add: **36 homo + 36 hetero cells at 30 hops** (below). Empirical extra ≈ **3.2k LLM calls** vs the current **8723**. Wall ≈ **40–60 min** at concurrency 2.  
5. Optional later: a **1-article 30-hop probe** (~1 min, ~40–50 calls) into `thesisExperiment/runs_h30/` only — not required to write this plan.

---

## What “30 hops” means in this engine

CIKM/LASS: linear branch, **K = 30 rewrite nodes**, auditor after each rewrite. Thesis 8-hop H/He: 8 rewrite stations.

A linear chain is `node_0 → node_1 → … → node_{n-1}` (`SocietyGraph.buildLinearChain`). The seed is delivered to `node_0` with `hops: 0`. Each tick, a node that rewrites/forwards sends `hops + 1`. `SimulationNode` **drops without rewriting** when `msg.hops >= nodeParams.maxHops`. The tick loop is `for (tick = 1; tick <= config.maxTicks)`.

So **three JSON fields must move together**. There is **no** Simulation/CLI key named `hops`.

| Knob | Where | Current | For 30 CIKM-length rewrites | If left at 8 |
|---|---|---|---|---|
| `topologyParams.numNodes` | run JSON; `Simulation._buildGraph` | 8 | **30** | Only 8 rewrite stations exist. Extra ticks idle. |
| `maxTicks` | run JSON; `Simulation._propagateGroup` | 8 | **30** | Wave stops after tick 8; nodes 8–29 never fire. |
| `nodeParams.maxHops` | run JSON; `SimulationNode` drop | 8 | **30** | Incoming `hops >= 8` is `drop` / `max_hops`; later nodes never rewrite. |
| `grid.hops` in `configs/grid_full.json` | campaign **metadata only** | 8 | unused by engine | Cosmetic. Changing it does nothing. |

**CLI.** `index.js` has `--config <file>`, not `--hops` / `--ticks` / `--maxHops`. Hop budget is entirely inside the JSON. `run_full_campaign.js --phase H` reads `grid_full.json` → `configs/full/H_*.json` and writes `outputRoot: "thesisExperiment/runs"`. **Do not use `--phase H` / `--phase He` for a 30-hop extension.**

`build_stimuli.js` sets all three: `CHAIN_NODE_PARAMS.maxHops = 8`, `topologyParams.numNodes: 8`, `maxTicks: 8`, and documents `grid.hops: 8`. Regenerating stimuli with `maxHops: 30` would **overwrite** the 8-hop full-grid configs. Copy a **new** config tree instead.

### Pitfalls that do not yield 30 rewrites

- Only `maxTicks: 30` (keep 8 nodes / `maxHops: 8`): still an 8-hop chain.  
- Only `maxHops: 30` (keep 8 nodes / 8 ticks): still 8 stations, 8 ticks.  
- `numNodes: 30` + `maxTicks: 8`: first eight nodes only.  
- `numNodes: 30` + `maxTicks: 30` + `maxHops: 8`: rewrite stops when `hops >= 8`.

### Heterogeneous assignment at 30 nodes (protocol mismatch)

He mix files have **8 unique** personas, `defaultPersonaAssignment: "sequential"` → `personaId = allPersonaIds[i % length]` (`Simulation._makeNodeConfigs`). On 30 nodes that **cycles**: each of 8 personas appears **3 or 4 times**. CIKM hetero is “at most **2** repetitions per branch.” With only **12** campaign personas, 30 nodes **cannot** satisfy ≤2 reps (30/12 = 2.5). Honest floor: some personas appear **3** times if the mix file lists all 12.

Do not call a 30-node He run a CIKM hetero replication unless that cycling is disclosed.

---

## Cell counts

A **cell** = one (persona or mix) × one article × one chain (N=1). Hop length is the **horizon**, not extra cells.

| Design | Homo cells | Hetero cells | Total cells | Rewrite events (if no early drop) |
|---|---:|---:|---:|---:|
| **Current accepted** | 12×12 = **144** | 12×12 = **144** | **288** | 288 × 8 = 2304 |
| **Full 12×12×30 (both arms)** | 144 | 144 | **288** | 288 × 30 = 8640 |
| **CIKM paper grid** (not this campaign) | 21×10 = 210 | (separate hetero protocol) | 210+ | 210 × 30 |
| **High-value subset (recommended)** | 6×6 = **36** | 6×6 = **36** | **72** | 72 × 30 = 2160 |

Full 12×12×30 does **not** add cells vs today; it only lengthens the same 288 branches. The subset **adds** 72 new 30-hop branches and leaves the 8-hop 288 intact.

---

## API-call estimates vs current 8723

Observed chain usage (`summary.json` `llmUsage`, 12 configs × 12 articles × 8 hops):

| Arm | Calls | Per 8-hop cell (12 arts / 12 configs) | Calls / hop-cell |
|---|---:|---:|---:|
| **H** | **1649** | 11.45 | 1.431 |
| **He** | **1804** | 12.53 | 1.566 |
| **H+He** | **3453** | — | — |
| **Full campaign (H+He+A+B+D+probes)** | **8723** | — | — |

Theoretical ceiling is **2 calls/hop** (agent rewrite + auditor). Observed ≈ **1.43–1.57** because of `drop` (action weights include `drop: 0.05`, plus trust / `maxHops`). Linear scale **30/8 = 3.75**.

### Full 12×12×30 (both arms) — not recommended

| Basis | H calls | He calls | H+He 30-hop | Extra vs **3453** current chains | Extra vs **8723** campaign |
|---|---:|---:|---:|---:|---:|
| Empirical × 3.75 | 6184 | 6765 | **~12 950** | **+9497** | **+9497** if replacing H+He; **+12 950** if adding on top of 8723 |
| Ceiling 2 calls/hop | 8640 | 8640 | **17 280** | **+13 827** | **+13 827** replace / **+17 280** add |

Campaign total if **replace** 8-hop H+He with 30-hop full grid, keep A/B/D: **8723 − 3453 + 12 950 ≈ 18.2k** (empirical).

### High-value subset (recommended)

6 homo personas × 6 articles + 6 mixes × **same** 6 articles = 72 cells.

| Basis | Homo | Hetero | Subset calls | Extra vs **8723** (add-on) |
|---|---:|---:|---:|---:|
| Empirical × 3.75 | **1546** | **1691** | **~3237** | **+3237** → campaign **~12.0k** |
| Ceiling 2/hop | 2160 | 2160 | **4320** | **+4320** → **~13.0k** |

List-price heuristic at the campaign ratio (~$1.0185 / 8723): subset ≈ **$0.38–0.50**. Irrelevant if cost is unconstrained; included so the extra is comparable to the logged **~$1.02**.

**He variant (larger):** 6 mixes × **all 12** articles = 72 hetero + 36 homo = **108 cells**, empirical ≈ **1546 + 3382 = 4928** extra. Only do this if 36 hetero cells look too thin after the first pass.

Early-hop drops make 30-hop **sublinear** (fewer late calls). Growing rewrite text can make **tokens** superlinear. Treat **3.2k–4.3k** as the planning band for the 72-cell subset; **13k–17k** for a full 12×12×30.

Graphs A/B/D are **not** part of a CIKM hop match. Do not set their `maxTicks` to 30 as a side effect.

---

## Smallest high-value subset

**Goal.** See whether the 8-hop right-censoring story in `cikm_hops.md` (He still rising at hop 7; H flat after hop 4; last-index tips) **continues, plateaus, or recovers** through hops 10–30 — without another 288-cell grid.

### Homo (36 cells)

All four conspiracy variants (the high-MPR family) plus both experts (the stabilizer contrast):

| id | Why |
|---|---|
| `conspiracy_believer` | Core chemtrails; H headline |
| `conspiracy_haarp_weather` | Highest H call volume among conspiracy (156) — active rewriter |
| `conspiracy_depopulation` | 2018–2021 broadening |
| `conspiracy_climate_piggyback` | Hijack / justice vocabulary |
| `climate_scientist` | Expert added; expected flat/low MI |
| `science_journalist` | Expert/media; expected resist |

### Articles (6) — reuse Exp A subset

`scopex_2017`, `chemtrails_gates_2018_2021`, `sai_geoengineering`, `paris_agreement`, `climate_consensus`, `polar_bears`.

Spans geoengineering + climate-misinfo valence without a second 12-article pass. **Do not** mix 8-hop 12-article H rows with 30-hop 6-article rows in the same heatmap without a `horizon=8|30` split.

### Hetero (36 cells) — six mixes × same 6 articles

Pick for **contrast**, not a random 6 of 12:

| Mix | Why |
|---|---|
| `mix_00` | Conspiracy-heavy sliding window (four conspiracy then climate-action) |
| `mix_04` | **No** conspiracy in the 8-slot window (climate-action / env / both experts) |
| `mix_05` | Window wraps `conspiracy_believer` at the **end** (late identity shock) |
| `mix_06` | Shuffle: conspiracy ↔ scientist ↔ journalist interleaved |
| `mix_08` | Shuffle: journalist seed then mixed conspiracy |
| `mix_03` | Includes `climate_scientist` after piggyback / climate-action |

On 30 nodes, sequential assignment **repeats** the 8-slot order ~3.75×. Disclose. Optional upgrade: new mix JSON listing **all 12** personas (max frequency 3) — still not CIKM ≤2.

### What this subset can and cannot claim

**Can:** paired 8-vs-30 trajectories on the same six articles for conspiracy vs expert homo, plus mixed-audience continuation past hop 8.  
**Cannot:** “we ran CIKM 21×10×30”; “He 85% propaganda”; gpt-4o / 10 QA; N≥3; Debnath hop depth.

---

## Exact config / CLI (isolated)

### Isolation rules (do not wreck 8-hop)

`parse_results.js` scans **`thesisExperiment/runs` only**, newest folder first, **one row per `experimentName`**. A 30-hop run that reuses `H_conspiracy_believer` **inside `runs/`** would **replace** the 8-hop row in `H_rows.csv` / `summary.json`.

`run_full_campaign.js` `isComplete()` also looks only under `thesisExperiment/runs` and matches `experimentName` + `maxTicks`. Reusing names with `maxTicks: 30` would **re-launch** into `runs/` rather than skip.

Therefore:

| Do | Do not |
|---|---|
| `outputRoot`: `thesisExperiment/runs_h30` | Write into `thesisExperiment/runs` |
| `experimentName`: `H30_*` / `He30_*` / `probe_h30` | Reuse `H_conspiracy_believer`, `He_mix_00` |
| Configs: `thesisExperiment/configs/h30/*.json` | Edit `configs/full/*.json` |
| Parse with a copy or `--` later; default parser ignores `runs_h30` | Run `parse_results.js` if 30-hop folders ever land in `runs/` |
| `node index.js --config thesisExperiment/configs/h30/...` | `run_full_campaign.js --phase H` / `--force` on `grid_full.json` |

### JSON skeleton (homo cell)

Copy `configs/full/H_conspiracy_believer.json`, then change **only**:

```json
{
  "outputRoot": "thesisExperiment/runs_h30",
  "experimentName": "H30_conspiracy_believer",
  "topology": "linear_chain",
  "topologyParams": { "numNodes": 30 },
  "maxTicks": 30,
  "seedArticles": [
    "scopex_2017",
    "chemtrails_gates_2018_2021",
    "sai_geoengineering",
    "paris_agreement",
    "climate_consensus",
    "polar_bears"
  ],
  "nodeParams": {
    "trustThreshold": 0.08,
    "actionWeights": { "forward": 0.1, "reinterpret": 0.85, "drop": 0.05 },
    "relationEvolution": true,
    "trustDelta": 0.05,
    "maxHops": 30,
    "maxInboxSize": 4,
    "activityPattern": "always"
  }
}
```

Keep `personasPath`, `articlesPath`, `defaultModel` / `auditorModel` `gpt-4o-mini`, `miScoringMode: "discrete"`, `seedNodes: ["node_0"]`, chain action weights. Same pattern for He with `personasPath` → `thesisExperiment/personas/hetero/mix_XX.json` and `experimentName` `He30_mix_00` etc.

### Commands

```text
# One isolated cell (example)
node index.js --config thesisExperiment/configs/h30/H30_conspiracy_believer.json

# Optional tiny probe (1 article, 30 hops, new names)
# topologyParams.numNodes 30, maxTicks 30, nodeParams.maxHops 30
# seedArticles: ["chemtrails_gates_2018_2021"]
# experimentName: "probe_h30", outputRoot: "thesisExperiment/runs_h30"
node index.js --config thesisExperiment/configs/h30/_probe_h30.json
```

Concurrency 2: a **small pool script** over the 12 subset configs (6 H30 + 6 He30), **not** `run_full_campaign.js`. If that runner is reused, it must point at a **new grid JSON**, new `outputRoot`, and `hardMs` ≥ 90 min (current chain hard timeout is **45 min** — likely enough, see time section, but 12-article full-grid 30-hop is the risky case).

Campaign stall kill is **25 min** of no stdout. 30-hop ticks still log `[Simulation] Tick k/30`; should not stall if the API is live.

---

## Wall-clock at concurrency 2

8-hop measured (`timeline.md`):

| Phase | Concurrency | Wall | Sum of config `elapsedMs` |
|---|---|---|---|
| H (12 configs × 12 articles) | 2 | **20 m 25 s** | 2396 s ≈ 39.9 min compute |
| He (12 configs × 12 articles) | 2 | **22 m 49 s** | 2546 s ≈ 42.4 min compute |

Mean config: H **3.33 min**, He **3.54 min**. Pool efficiency ≈ 2.0.

Scale **×3.75** for hops, **×0.5** when cutting 12→6 articles.

| Job | Configs | Arts/config | Est. min/config | Waves @ conc=2 | Wall (linear) | Wall (×1.5 context slop) |
|---|---:|---:|---:|---:|---|---|
| **Subset H30** | 6 | 6 | 6.2 | 3 | **~19 min** | ~28 min |
| **Subset He30** | 6 | 6 | 6.6 | 3 | **~20 min** | ~30 min |
| **Subset H then He** | 12 | 6 | — | 6 | **~39 min** | **~50–60 min** |
| Full 12×12 H30 | 12 | 12 | 12.5 | 6 | **~77 min** | ~2 h |
| Full 12×12 He30 | 12 | 12 | 13.3 | 6 | **~86 min** | ~2.1 h |
| Full both (sequential phases) | 24 | 12 | — | — | **~2.7 h** | **~4 h** |
| 1-cell probe (1 art × 30 hops) | 1 | 1 | **~1 min** | 1 | **~1 min** | ~2 min |

**Hard timeout:** a **subset** 6-article config (~6–10 min) is well under 45 min. A **full 12-article** 30-hop config (~12–26 min with token growth) is probably under 45 min; raise `hardMs` if launching those. Probe is trivial.

**Same-afternoon verdict:** 72-cell subset at conc=2 is compatible with “short on time.” Full 12×12×30 is half a workday plus parse/figures, and still not a CIKM reprint (mini, 5 QA, 12 not 21, cycling He).

---

## Tiny probe (only if you run anything)

Allowed: **one** chain, **one** article, 30 hops, **new** `outputRoot`.

Suggested: `H30` persona `conspiracy_believer` × `chemtrails_gates_2018_2021` (high-MPR, already in 8-hop tables). Expect ~**40–50** calls, ~**1–2 min**. Compare hop-MI[0..7] loosely to the existing 8-hop cell (N=1, not a replicate). Then stop. Do **not** parse into `results/`.

This plan did **not** launch that probe.

---

## Examiner one-liner

CIKM’s K=30 is three engine keys (`numNodes`, `maxTicks`, `maxHops`), not a `hops` flag. The 8-hop campaign is 288 cells / 3453 chain calls inside 8723. A 30-hop **full** grid is the same 288 cells and ~13k extra chain calls (~3 h at conc=2). A **72-cell** conspiracy+expert × 6-article × 30-hop add-on is ~3.2k extra calls and ~40–60 min — enough to test plateau vs censoring without replacing the accepted 8-hop dataset.
