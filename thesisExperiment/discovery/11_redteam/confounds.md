# Confounds — pilot and any future 10×10 / H–He grid

**Status.** Critique of existing **gpt-4o-mini N=1 2-article pilot**. The planned large homo/hetero run (LOG: Exp H ~12p×12a, Exp He ~12 mixes×12a; user “10×10”) is **not done**. These confounds already poison the pilot and will silently fail a “1.0” acceptance if ignored.

---

## 1. ER cascade death (`A_er_mix × chemtrails_gates`)

| Fact | Implication |
|---|---|
| 1 event, max MI=0, mean MPR=0, propaganda=false, k\*=none, 0 rewrite texts | Not a null scientific finding. Cascade never started. |
| Sibling `A_er_mix × scopex` ran 75 events | Same topology label ≠ same connectivity realization per article if seeding / early drop differs. |
| `D_echo_mix` also died (1 event, 0 LLM calls) | Pattern: **seed-drop / out-degree / early extinction**, not topology science. |
| Pilot claimed ER fix (`graphRandomSeed`, `minSeedOutDegree`) | Fix is incomplete: chemtrails ER-mix and echo still died. Claiming “seeded ER is safe” is false. |

**Adversarial rule.** Any cell with `events ≤ 2` or `LLM calls = 0` is **INVALID**. Exclude from k\*, MI, MPR, PI, and topology comparisons. If ≥20% of grid cells are invalid, the campaign FAILS — do not average zeros with real cascades.

**How 10×10 still fails 1.0.** Heterogeneous ER / echo / sparse chains silently produce zero-MI rows; parser treats them as “no propaganda”; heatmap looks “safe”; thesis claims mix buffers firestorms. That is garbage-in.

---

## 2. D echo drop (`D_echo_mix`)

| Fact | Implication |
|---|---|
| 0 LLM calls, PI=0, nTexts=0, edge homophily reported 0.9 | Homophily/modularity on a graph that never talked. Metrics are topology costumes. |
| findings.md correctly says unusable | Any future prose that cites D as “echo chambers …” FAILS review. |
| Retry without proving seed out-degree **and** first-hop delivery | Will reproduce the same fake null. |

**Adversarial rule.** Echo cell counts only if: seed delivers ≥1 scored rewrite by tick 1, LLM calls > 0, and events scale with ticks. Homophily alone never counts as echo evidence.

---

## 3. Experiment B tick confounding

| Fact | Implication |
|---|---|
| `B_sf_mix_n1`: split tick 1; **n before = 0**; mean MI after = 2.65 on 103 events | There is no “before.” Before/after is undefined. |
| `B_sf_mix_n3`: n before = 7, n after = 104; mean MI after **higher** (2.15 > 1.14) | Looks like fact-check **worsened** MI if naively read — actually late-tick cascade volume dominates. |
| findings “hint” that n=3 max MPR 3.00 < n=1 max MPR 3.83 | Confounds: different cascade lengths (124 vs 115 events), different node hit patterns, no matched post-injection window, no holdout of non-exposed nodes. |
| Fact-check injects original article text mid-cascade | Nodes already holding high-MI rewrites; injection competes with inbox cap 4 and reinterpret weight — not a clean correction trial. |

**Adversarial rule.** Exp B claims require: (a) matched tick windows pre/post, (b) per-node paired MI, (c) n∈{1,3,5} on same graph seed, (d) separate “no injection” control. Until then, **ban** recovery / dose–response language.

**How 10×10 still fails 1.0.** Adding articles without fixing the estimator produces a prettier wrong before/after plot.

---

## 4. Homogeneous homophily = 1.0 by construction

| Fact | Implication |
|---|---|
| All nodes share one persona → edge homophily = 1, conspiracy-cluster homophily = 1 | Not measured echo; definitional. |
| Modularity on conspiracy cut higher on homogeneous graphs | One community vs forced cut — geometric tautology. |
| summary Exp D table still lists these as results | Examiner bait: “we measured echo = 1.0.” |

**Adversarial rule.** Report homogeneous homophily only in a “sanity / tautology” footnote. Echo claims allowed **only** on mixed graphs (edge homophily, within-BP repetition, PI trajectory, trust evolution). Homogeneous cells test **identity alignment / distortion severity**, not echo.

**How 10×10 still fails 1.0.** Homogeneous persona×article heatmap will show high MPR; someone will label the diagonal “echo.” Fail that framing in ACCEPTANCE.

---

## 5. Mini model (`gpt-4o-mini`) vs CIKM `gpt-4o` (and paper setup)

| Gap | Why it kills “replication” talk |
|---|---|
| Model: mini vs full gpt-4o (CIKM-class runs often use stronger auditor/node models) | Distortion rates, refusal, and auditor harshness differ. Mini may saturate MI=5 faster or paraphrase less aggressively — unknown, **unablated**. |
| Topology: 8-node BA/ER graphs vs CIKM **linear chain** of ~5 (paper) / longer homogeneous branches | Different mixing, degree, and hop geometry. Graph k\* ≠ chain MPR. |
| Personas: 3 Debnath BPs vs CIKM identity + expert roster (Young Parent, medical_expert, …) | Climate BPs are not a drop-in for crime-news identity/expert contrast. |
| Articles: 2 climate seeds vs multi-domain CIKM article set | Domain shift is the point of the thesis — then **do not** claim CIKM confirmation from 2 seeds. |
| Auditor: five binary items, propaganda MI>3 | Same schema family, but item difficulty and climate QA quality unvalidated against human raters. |
| Ticks: 6 hop-compressed vs longer paper horizons | Truncation biases k\* toward “none” (no time to stay high) or toward early lock-in. |

**Adversarial rule.** Label every result `model=gpt-4o-mini`. A climate homo/hetero “replication of CIKM” is **conceptual** only until: same chain protocol, comparable persona classes (identity vs expert), ≥10 articles, and ideally a mini-vs-4o ablation on a subset.

**How 10×10 still fails 1.0.** Finishing a mini-only 10×10 without chain protocol / expert personas / heatmaps yields scale without validity — a larger wrong pilot.

---

## 6. Cross-cutting pilot confounds (still live)

- **N=1** everywhere — no SE, no sign stability.
- **Network-mean MI** dilutes mixed graphs — identity effect partially mechanical.
- **Prompt-programmed conspiracy** — high MI on conspiracy BPs is obedience, not emergence.
- **Valence seed confound** — chemtrails seed already contains conspiracy framing; homogeneous BPs double-count.
- **Held Pfeffer factors** — surprise drip, temporal compression held → cannot claim six-factor coverage.
- **Invalid dry-run history** — any accidental merge of dry-run zeros into summaries is instant FAIL.

---

## Checklist before trusting any cell

1. LLM calls > 0 and events ≫ ticks  
2. Not dry-run / not MI≡0 with empty texts  
3. Homophily≠1 used only if mix  
4. Exp B uses paired windows, not raw after-mean  
5. Model and chain-vs-graph protocol stated  
6. Dead ER/echo cells excluded from aggregates
