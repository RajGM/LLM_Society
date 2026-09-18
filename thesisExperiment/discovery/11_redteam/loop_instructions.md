# Loop instructions — FAIL conditions for the campaign executor

**Role.** Hard gates for iterate-until-done. Soft language in findings does **not** override these.  
**Current state.** `LOG.md` targets Exp H/He (~12×12) and richer grids; **not started**. Existing artifact is gpt-4o-mini N=1 2-article pilot. Treat pilot as baseline only.

If any **HARD FAIL** trips after a claimed “full run,” do **not** write thesis-grade success. Fix, rerun, or explicitly mark INCOMPLETE.

---

## HARD FAIL — campaign incomplete / invalid

| ID | Condition | Why |
|---|---|---|
| F1 | **Articles < 10** with complete 5-item auditor results in the homo/hetero (or H/He) grid | Domain claim and CIKM-style heatmap impossible. Pilot’s 2 articles already fail. |
| F2 | **No hetero heatmap** (mix×article MPR) **or** no homo heatmap (persona×article MPR) written under `results/` or `analysis/` | Without both, homo vs hetero is anecdote. |
| F3 | **All k\* = none** (or hop-analogue never sustains MI>3) across valid cells | Engine too weak / ticks too short / seeds too tame — cannot study firestorms or irreversibility. |
| F4 | **Dry-run zeros** appear in any summary table, plot, or findings number | Invalid. Purge and regenerate from real LLM runs only. |
| F5 | **Dead-cascade rate ≥ 20%** of cells (`events ≤ 2` or `LLM calls = 0`) | Topology/mix “effects” are seed-drop artifacts (see ER chemtrails, D_echo). |
| F6 | Echo / ER / chain cells reported with **homophily or PI** but **0 LLM calls** | Fake metrics. |
| F7 | Findings claim **Pfeffer / Debnath / CIKM replication** while surprise+temporal still held, no 814k, or no chain protocol | Overclaim → rewrite findings, don’t “interpret harder.” |
| F8 | Exp B reports recovery/dose–response without **paired pre/post windows** and a no-injection control | Confounded; strip causal claims. |
| F9 | Homogeneous **homophily=1.0** cited as echo evidence | Tautology FAIL. |
| F10 | Model silently upgraded/downgraded mid-grid without logging; or mini results labeled as gpt-4o | Provenance FAIL. |
| F11 | Hetero mixes **lack any expert/factual persona** while claiming CIKM-style replication | Wrong contrast (see `replication_of_cikm.md`). |
| F12 | Aggregates **include invalid cells** (zeros averaged with live cascades) | Statistical malpractice FAIL. |

---

## HARD FAIL — pilot-specific (already true; do not regress)

| ID | Condition |
|---|---|
| P1 | Shipping pilot `findings.md` as final thesis results |
| P2 | Reintroducing dry-run MI=0 rows into `summary.md` |
| P3 | Interpreting `A_er_mix × chemtrails` or `D_echo_mix` as substantive nulls |
| P4 | Calling N=1 k\*=1 “textbook” without multi-article confirmation |

---

## SOFT FAIL — iterate (campaign may continue, but PASS blocked)

| ID | Condition | Required fix before PASS |
|---|---|---|
| S1 | N=1 only on full 10×10 / 12×12 | Label N=1; run N≥3 on ≥3 articles subset **or** accept “exploratory” only. |
| S2 | Ticks/hops < 8 on chain grid | Extend or document truncation bias on k\*. |
| S3 | Exp B missing n=5 | OK to skip if logged; then **no** dose–response curve claim. |
| S4 | No mini vs gpt-4o ablation | Forbid “matches CIKM model class” language. |
| S5 | Keyword Exp C only | Keep “heuristic” label; no classifier claims. |
| S6 | Graph Exp A article subset < 6 when H/He use 12 | Document subset; don’t generalize A to all 12. |
| S7 | Concurrency/stalls → partial grid | Resume; incomplete heatmaps = F2. |

---

## PASS bar (all required)

1. Real LLM only; usage log non-zero for every reported cell.  
2. ≥10 articles in homo and hetero chain grids.  
3. Both heatmaps on disk + captioned.  
4. Dead cells < 10% **or** listed and excluded with counts.  
5. At least one irreversible propaganda pattern in homo identity/conspiracy **or** documented F3 with redesign (longer ticks / hotter seeds) — do not PASS a flat-zero firestorm study.  
6. Findings sentences pass `overclaim_watch.md` demotions (no valence “proven,” no echo from homophily=1).  
7. CIKM-climate claim either **PASS** per `replication_of_cikm.md` or explicit **FAIL/INCONCLUSIVE** — never implied success.

---

## Executor loop (concrete)

```
while not PASS:
  run next incomplete cells (real LLM)
  parse_results + plots
  if F4: abort and purge dry-run
  if F5 or F6: fix seeding (min out-degree, seed delivery assert), rerun dead cells
  if F1 or F2: do not write findings success; extend articles/heatmaps
  if F3: lengthen hops/ticks or revise seeds; rerun
  redteam: re-read findings against overclaim_watch.md
  if any HARD FAIL remains: status=FAIL, iterate
  else: status=PASS, freeze numbers
```

### Seed-delivery assert (mandatory before counting a cell)

Before accepting a run directory:

- `LLM calls > 0`
- `events >= max(5, ticks)`
- seed node out-degree ≥ configured minimum
- at least one scored MI on tick 0 or 1

Else mark `INVALID_SEED_DROP` and rerun — **do not** put MI=0 in heatmaps.

---

## How a finished “10×10” can still score 0.0

1. 10×10 of **dead or dry** cells → pretty zeros.  
2. 10×10 **without experts** → not CIKM-climate replication.  
3. 10×10 **graphs only**, no chains → wrong object.  
4. 10×10 with **all k\*=none** → no phenomenon.  
5. 10×10 with **homophily=1 celebrated** → tautology.  
6. 10×10 **gpt-4o-mini** sold as CIKM reprint → misrepresentation.  
7. 10×10 averaged **including** ER/echo deaths → false mix safety.  
8. Findings upgraded to causal Pfeffer language → redteam reject.

**Reminder.** Scale ≠ validity. A larger pilot that trips F1–F12 is worse than an honest incomplete LOG.
