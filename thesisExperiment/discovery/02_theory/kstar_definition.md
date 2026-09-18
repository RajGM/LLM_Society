# Operational definition of \(k^*\)

**Status:** theory lock for Methods. Matches the thesis proposal (`Paper/proposal_pfeffer_v5.pdf`, extract in `01_literature/_extract/proposal_pfeffer_v5.txt`) and the auditor already in this repo. Does **not** introduce a new metric.

Parser of record: `thesisExperiment/scripts/parse_results.js` (`irreversibleKStar`, `firstIrreversibleNodePropaganda`).  
If parser and this file disagree, **this file wins** for the thesis text; file a discrepancy table.

---

## 1. Proposal wording (source of truth)

Experiment A (proposal Phase II):

> The node \(k^*\) at which MI crosses from lie tier (\(1 < \mathrm{MI} \le 3\)) into propaganda (\(\mathrm{MI} > 3\)) **and does not recover**.

That sentence does three things that must not be silently changed:

1. The **crossing** is defined on **MI**, not on MPR (MPR is a node-average of MI; see §3).
2. The **from** band is the **lie** interval \(1 < \mathrm{MI} \le 3\). \(\mathrm{MI} \le 1\) is **factual error**, not lie. \(\mathrm{MI} = 3\) is still lie.
3. The **to** band is **propaganda** \(\mathrm{MI} > 3\) (strict inequality).
4. The crossing is a tipping point only if it is **irreversible** (no later return to \(\mathrm{MI} \le 3\)).

CIKM / LASS 2025 (prior method, cite Maurya et al.; do not “rediscover”):

> Factual error: \(|\mathrm{MPR}| \le 1\); Lie: \(1 < |\mathrm{MPR}| \le 3\); Propaganda: \(|\mathrm{MPR}| > 3\).

The thesis reuses those **bins**. It does **not** reuse CIKM’s linear-chain \(K=30\) “node index” as the primary \(k^*\) on networked climate cells.

---

## 2. Instrument (existing auditor)

Campaign configs set `"miScoringMode": "discrete"` (`config/experiment.js`, `src/Auditor.js`).

Let \(m = 5\) gold QA items per article (`articles[].questions`, `articles[].groundTruth`).  
Auditor returns scores \(s_i \in \{+1, 0, -1\}\) (correct / missing / incorrect).

\[
\mathrm{MI} = \#\{i : s_i = 0\} + \#\{i : s_i = -1\} \in \{0,1,2,3,4,5\}.
\]

(`Auditor.computeIFD`: `mi = missingCount + incorrectCount`.)

| MI (event) | Band | `Auditor.severity` if applied to a **mean** |
|---|---|---|
| \(0, 1\) | factual error | `factual_error` iff value \(\le 1\) |
| \(2, 3\) | lie | `lie` iff \(1 <\) value \(\le 3\) |
| \(4, 5\) | propaganda | `propaganda` iff value \(> 3\) |

**Threshold \(\tau = 3\) is a strict inequality.** Discrete propaganda at event grain is MI \(\in \{4,5\}\). MI \(= 3\) is lie. Do not recode MI \(= 3\) as propaganda.

`Auditor.severity(mpr)` uses the same cuts on **MPR**. That is a **node summary**, not \(k^*\).

Continuous / dual modes (`mi = m \times (1 - \mathrm{mean\_score})`) are implemented but **off** in the climate campaign. Do not mix modes in one \(k^*\) table.

---

## 3. Three DVs (do not collapse)

### 3.1 Event MI

Atomic observation: `nodes/node_*.json` → `history[].misinfoIndex` for `action ∈ {forward, reinterpret}` after audit. Drops/dumps are typically `null` and are **excluded**.

### 3.2 Node MPR

\[
\mathrm{MPR}_v(a) = \mathrm{mean}\{\mathrm{MI}_e : e \in \text{history of } v,\; e.\mathrm{articleId}=a,\; \mathrm{MI}_e \ne \mathrm{null}\}.
\]

(`Auditor.computeMPR`.) Used for H1–H8 as a **severity** DV. **Not** the clock for \(k^*\).

A node can have \(\mathrm{MPR} > 3\) after a **reversible** early spike; that is propaganda-tier **average**, not \(k^*\).

### 3.3 Network-mean MI (clock for primary \(k^*\))

`MetricsEngine.networkMIOverTime` → `results_{articleId}.json` → `metrics.networkMIOverTime[]`:

```
{ tick, meanMI, activeNodes }
```

`meanMI(t)` = mean of scored event MI **at tick \(t\)**.  
`activeNodes` is the **count of scored events**, not unique node IDs.

Ticks with `meanMI === null` are dropped (no scored events).

---

## 4. Irreversibility predicate

Let series \(S = [(t_i, x_i)]\) with \(t_i\) strictly increasing, \(x_i\) numeric or missing.

```
IRREVERSIBLE_KSTAR(S, τ=3):
  first ← min { t : x(t) ≠ null and x(t) > τ }   # else undefined
  recovered ← exists t' ≥ first with x(t') ≠ null and x(t') ≤ τ
  k* ← first if not recovered else undefined
```

Python-equivalent (same logic as `parse_results.js`):

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

**Recovery** is any later point \(\le \tau\), including oscillation \(>3, \le 3, >3\). Do **not** take the last crossing. First return to \(\le 3\) voids \(k^*\).

**Undefined vs 0.** If the series never exceeds \(\tau\), \(k^*\) is `null` / “none”, **not** 0. Tick 0 is the seed-delivery clock (`Simulation._propagateGroup` delivers at `tick: 0`); scored processing starts at tick 1.

---

## 5. Official variants (compute all three)

### \(K_{\mathrm{net,tick}}\) — primary (proposal adapted to graphs)

Proposal said “the **node** \(k^*\)” because CIKM objects were linear branches. On graphs, the society-level analogue of “the cascade has tipped” is the **network-mean** series.

```
series = networkMIOverTime sorted by tick
IRREVERSIBLE_KSTAR(series)
```

| This spec | Parser field |
|---|---|
| \(k^*\) | `kStar_network` |
| first cross | `firstMeanMiOver3` |
| recovered | `networkRecoveredAfterPropaganda` |

This is the DV labelled **\(k^*\)** in H1–H8 unless a hypothesis explicitly says otherwise.

### \(K_{\mathrm{net,hop}}\) — required sensitivity

Hop \(\neq\) tick (`history[].hops` vs `history[].tick`). Build mean MI by hop, then `IRREVERSIBLE_KSTAR`. Report `kStar_network_hop`. Empty hop bins are **absent**, not MI \(= 0\).

Use this when comparing to CIKM chain **depth**, not as a substitute for \(K_{\mathrm{net,tick}}\).

### \(K_{\mathrm{node}}\) — secondary (literal proposal “node \(k^*\)”)

For each node, sort scored events by `(tick, hops)`. First event with MI \(> 3\) is a candidate iff **no later** event has MI \(\le 3\). \(K_{\mathrm{node}}\) = candidate with smallest tick, then smallest hop.

Parser: `kStar_firstIrreversibleNode`, `kStar_hop`, `kStar_nodeId`.

A mixed graph can have \(K_{\mathrm{node}}\) set on a conspiracy agent while \(K_{\mathrm{net,tick}}\) is null (network mean buffered). Report both; do not substitute.

---

## 6. Companion indicators (not \(k^*\))

| Name | Rule |
|---|---|
| `propagandaOccurred` | any event MI \(> 3\) **or** any node MPR \(> 3\) **or** any tick meanMI \(> 3\) |
| `time_to_cross` | `firstCross` (defined even when \(k^*\) is null) |
| `crossedButRecovered` | `firstCross ≠ null` and `recovered` |
| `neverCrossed` | `firstCross = null` |
| information half-life | `MetricsEngine.informationHalfLife` (MI \(\ge 2.5\)) — **not** \(k^*\) |
| critical mass | `MetricsEngine.criticalMassThreshold` (fraction of nodes with mean MI \(> 3\)) — **not** \(k^*\) |

---

## 7. Censoring and edge cases

| Case | Rule |
|---|---|
| No scored events | all \(k^*\) null; flag `cascade_empty` (seed drop / isolation) |
| Single scored event, MI \(> 3\) | `firstCross` set; recovered false **for lack of later points**; label `kStar_censored = true` (weak irreversibility) |
| Series ends while meanMI \(> 3\) | \(k^* =\) firstCross, but report `lastTick`, `lastMeanMI`, `nTicksAfterCross`. With `maxTicks: 6` this is **right-censored** irreversibility, not a 30-hop plateau |
| Experiment B (`fact_checker_injection`) | same algorithm on the **full** series; also compute `kStar_post_inject` on ticks \(\ge\) intervention tick |
| Dry-run auditor | MI identically 0 — **invalid**; exclude |

Do not require two consecutive ticks above \(\tau\) (engine does not). Optional sensitivity (not primary): sticky \(k^*\) needs \(\ge 2\) remaining points all \(> \tau\); a last-tick-only spike is a **terminal spike**, not textbook \(k^*\).

---

## 8. What this is not

- Not CIKM’s “inflection between nodes 5–9 on a 30-step chain” (prior result; different object).
- Not the first hop at which any node rewrites.
- Not MPR \(> 3\).
- Not a psychometric cut-point validated outside this auditor. \(\tau = 3\) is the **design choice inherited from CIKM**, applied here to climate items with \(m = 5\).
