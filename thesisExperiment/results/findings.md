# Findings (accepted campaign, 18 Sep 2026)

**Model:** gpt-4o-mini. **N = 1.** **Auditor:** 5 discrete IFD questions (not CIKM’s 10; not gpt-4o). **Hops/ticks:** 8 (logged compression vs 30-hop CIKM and 15-tick proposal). **Cost:** 8723 LLM calls, list-price heuristic **~$1.02**.

**k\*:** first tick/time-index where **network-mean MI > 3** and later points with data do not return to ≤ 3.

## Grids that actually ran (real LLM)

| Exp | Design | Cells |
|---|---|---|
| H | 12 personas × 12 articles × 8-node homogeneous chain | 144 |
| He | 12 mixed chains (8 unique personas, no repeats) × 12 articles | 144 |
| A | SF vs ER × hom conspiracy vs mixed-8BP × 6-article subset, 8 nodes, 8 ticks | 24 |
| B | SF × mixed, chemtrails, fact-check at n∈{1,3,5} | 3 |
| D | Echo chamber, seeded RNG + min seed out-degree, chemtrails | 1 (184 LLM calls; **not** the dead tick-1 pilot) |
| C | Keyword distortion heuristic on rewrite text | all rewrites |

## Headline pattern (descriptive, N=1)

On homogeneous chains, conspiracy-cluster personas had **mean cell MPR ≈ 2.28** vs **≈ 0.64** for climate-action / environmental / expert personas. That is a simulator roleplay contrast, not a measurement of Twitter.

Heterogeneous mixes sit in between (mean MPR ≈ 1.62 across 144 cells). Do not write “diversity stops firestorms” as a law.

## Experiment A

Homogeneous conspiracy graphs often reached high MPR on Paris/consensus/chemtrails/SCoPEx. Mixed scale-free **dropped** three seeds after 1 event (scopex, chemtrails, SAI) — sampled cascade death, **not** evidence that mixed BPs immunise networks. Polar-bears mixed-ER also died (1 event). Report those as dead cells.

## Experiment B

Before/after mean MI: n=1 has **no pre-injection events** (split at tick 1). n=3 and n=5 show **higher** mean MI after injection because most scored events occur later as the cascade grows. **Descriptive only; not a causal backfire finding.**

## Experiment D / echo

Rerun produced 151 events, mean MPR 3.35, edge homophily 0.44, conspiracy-cut modularity 0.29. The 03:15 pilot with 0 LLM calls is **invalid**. Modularity is at 8 ticks, **not** proposal t={10,30,50}.

## What was cut (logged, not faked)

- 8 hops not 12/30.
- Graph A: 6 of 12 articles.
- No 814k HDBSCAN.
- No Phase III real-cascade k\*.
- 5 QA not 10; mini not gpt-4o.

## Examiner-safe vs overclaim

See `README.md` and `analysis/examiner_safe_claims.md`. Reduced Debnath BPs are theory-faithful, not cluster centroids.
