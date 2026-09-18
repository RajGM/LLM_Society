# k\* rules — irreversible propaganda from event-level MI

**Definition (thesis):** k\* is the first time index at which the system enters the **propaganda** regime (MI > 3) and **does not return** to MI ≤ 3 on any later observation in the same series. If it returns, the crossing is a **reversible spike**, not k\*. If it never crosses, k\* is **undefined** (`null` / “none”), not 0.

Parser reference (re-implement; if disagreement, this file wins): `irreversibleKStar` and `firstIrreversibleNodePropaganda` in `thesisExperiment/scripts/parse_results.js`.

Threshold **τ = 3** is **strict inequality**: propaganda iff `MI > 3` (discrete MI ∈ {4,5}). `MI == 3` is still `lie`.

---

## 1. Inputs

### 1.1 Event table E (required)

Build from `nodes/node_*.json` `history[]`:

| Column | Rule |
|---|---|
| `runDir`, `articleId`, `nodeId`, `personaId` | from path / state |
| `tick` | integer clock |
| `hops` | integer path length on the message |
| `misinfoIndex` | drop rows where `null` / missing |
| `action` | keep for diagnostics; k\* uses scored rows only |

Sort keys: `(articleId, tick, hops, nodeId)`.

### 1.2 Network tick series (engine; primary k\*)

`metrics.networkMIOverTime` (also copied onto `summary.json` rows):

```
{ tick, meanMI, activeNodes }
```

`meanMI` = mean of scored event MI **that tick** (`MetricsEngine.networkMIOverTime`). `activeNodes` is the **count of scored events**, not unique node IDs.

If the series is missing, recompute from E:

```
for each tick t:
  S_t = { MI : events with articleId, tick=t, MI != null }
  meanMI(t) = mean(S_t) if |S_t|>0 else missing
```

Drop ticks with missing `meanMI` from the series (engine already filters `meanMI !== null`).

---

## 2. Core predicate: irreversible crossing

Given an ordered series `[(t_i, x_i)]` with `x_i` numeric, `t_i` strictly increasing:

```
IRREVERSIBLE_KSTAR(series, τ=3):
  if series empty → { kStar: null, firstCross: null, recovered: false }

  first ← null
  for (t, x) in series:
    if x != null and x > τ:
      first ← t
      break

  if first is null:
    return { kStar: null, firstCross: null, recovered: false }

  after ← { (t, x) in series : t >= first }
  recovered ← exists (t, x) in after with x != null and x <= τ

  return {
    kStar: null if recovered else first,
    firstCross: first,
    recovered
  }
```

**Notes:**

- Recovery is **any** later (or same-index, if you include `t >= first`) point with `x ≤ τ`. The parser uses `t >= first` and therefore counts the crossing tick itself only if `x ≤ τ` there, which it is not. Later ticks can recover.
- **Right-censoring:** if the series **ends** while `x > τ` and never showed `x ≤ τ` after `first`, k\* = `first`. With only 6 ticks this is **weak irreversibility** (no long post-period). Report `lastTick`, `lastMeanMI`, and `nTicksAfterCross`.
- **Do not** require two consecutive ticks above τ (not in the engine). Optional sensitivity: k\*_sticky = first t such that all remaining points are > τ **and** at least 2 points remain; if only the last tick is > τ, classify as **terminal spike**, not k\*.

---

## 3. Three official k\* variants (compute all three)

### K_net_tick (primary, matches parser `kStar_network`)

```
series = networkMIOverTime sorted by tick
IRREVERSIBLE_KSTAR(series)
```

Map to parser names:

| This spec | Parser |
|---|---|
| `kStar` | `kStar_network` |
| `firstCross` | `firstMeanMiOver3` |
| `recovered` | `networkRecoveredAfterPropaganda` |

**Worked logic (pilot, do not treat as new analysis):** `A_sf_hom` × chemtrails: meanMI > 3 from tick 1 onward → k\* = 1. Same graph × SCoPEx: firstCross = 4 then later meanMI ≤ 3 → k\* = null, recovered = true.

### K_net_hop (required sensitivity; hop ≠ tick)

Event-level hop series is the Unit U1 analog of “chain depth”:

```
for each hops h in 1..maxHops:
  S_h = { MI : events with articleId, hops=h, MI != null }
  meanMI_hop(h) = mean(S_h) if |S_h|>0 else missing

series_hop = [(h, meanMI_hop(h))] sorted by h, drop missing
IRREVERSIBLE_KSTAR(series_hop)
```

Report as `kStar_network_hop`. **Do not** assume it equals `kStar_network`. Schema probe: hops and ticks co-occur in mismatched pairs (e.g. hops=3 at tick=4).

If a hop bin is empty (cascade died), that h is absent — **not** imputed as MI=0.

### K_node (secondary; parser `kStar_firstIrreversibleNode`)

For each node, take that node’s scored events for the article, sorted by `(tick, hops)`:

```
for each node:
  series_node = [(tick, hops, MI)] sorted
  first event e* with MI > τ
  if none: skip node
  later = events strictly after e* in (tick, hops) order
  if any later has MI ≤ τ: skip (recovered)
  else: candidate = (tick: e*.tick, hop: e*.hops, nodeId)

kStar_node = candidate with smallest tick, then smallest hop
```

This is **first irreversible node-level propaganda**, not a network mean. A single conspiracy node can have node-k\* while K_net_tick is null (mixed graphs: distortion concentrated; network mean buffered).

Parser fields: `kStar_firstIrreversibleNode` (tick), `kStar_hop`, `kStar_nodeId`.

---

## 4. Binary and time-to-event companions

| Name | Rule | Use |
|---|---|---|
| `propagandaOccurred` | any event MI > 3 **or** any node MPR > 3 **or** any tick meanMI > 3 | Prevalence; not k\* |
| `crossedButRecovered` | `firstCross != null` and `recovered` | Valence / buffering narrative |
| `neverCrossed` | `firstCross == null` | Mixed / dead cascade |
| `time_to_cross` | `firstCross` | Defined even when k\* null |
| `kStar` | irreversible only | Primary DV3 |

**N≥3 survival coding:** treat `kStar` as a time-to-event with:

- event = irreversible propaganda observed,
- censor = never irreversible by `maxTicks` (including recovered spikes).

Do not code `kStar = 0` for “none” (that collides with tick 0 / missing). Parser plots used 0 for none — **chapter figures must not**.

---

## 5. Edge cases

| Case | Rule |
|---|---|
| No scored events | all k\* null; flag `cascade_empty` |
| Single scored event, MI > 3 | firstCross = that t; recovered = false **by lack of later points**; classify as **right-censored k\*** (`kStar_censored=true`), not textbook irreversibility |
| Single scored event, MI ≤ 3 | neverCrossed |
| Mean MI oscillates >3, ≤3, >3 | recovered = true at first return ≤3; k\* null. Do **not** take the last crossing |
| Experiment B injection | still apply the same algorithm on the **full** series; also compute k\* on post-injection subsequence as sensitivity (label `kStar_post_inject`) |
| Homogeneous vs mixed | same algorithm; mixed network mean can recover while K_node is set on conspiracy nodes — report both |
| `activeNodes` tiny at late ticks | series still valid; footnote low event count |

---

## 6. Algorithm (executor checklist)

1. Filter article; drop `misinfoIndex == null`.
2. Build U2 tick series (engine or recompute). Run `IRREVERSIBLE_KSTAR` → K_net_tick.
3. Build hop series from events. Run `IRREVERSIBLE_KSTAR` → K_net_hop.
4. Run per-node scan → K_node.
5. Attach diagnostics: `n_scored`, `maxEventMI`, `maxNetworkMeanMI`, `nTicksAfterCross`, `lastMeanMI`, `kStar_censored`.
6. Diff against `parse_results.js` fields; write a discrepancy table if any.
7. **Never** feed these scalars into `ABTestRunner._cohensD`.

---

## 7. Pseudocode (hop-network, for copy-paste)

```python
def irreversible_kstar(times, values, tau=3.0):
    first = None
    for t, x in sorted(zip(times, values), key=lambda p: p[0]):
        if x is not None and x > tau:
            first = t
            break
    if first is None:
        return {"kStar": None, "firstCross": None, "recovered": False}
    after = [(t, x) for t, x in zip(times, values) if t >= first]
    recovered = any(x is not None and x <= tau for _, x in after)
    return {
        "kStar": None if recovered else first,
        "firstCross": first,
        "recovered": recovered,
    }
```

---

## 8. What k\* is not

- Not the first hop at which **any** node rewrites.
- Not information half-life (`MetricsEngine.informationHalfLife` uses MI ≥ 2.5).
- Not `criticalMassThreshold` (fraction of nodes with mean MI > 3 that tick).
- Not MPR > 3 (node average can exceed 3 after a reversible early spike).
