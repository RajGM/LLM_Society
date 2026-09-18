# Overclaim watch — `findings.md` vs data

**Scope.** Adversarial sentence audit of `thesisExperiment/results/findings.md` against `summary.md` / `summary.json`.  
**Campaign status.** Big homo/hetero grid (LOG target ~12×12 chains; not yet run) is **absent**. Critique applies to the **existing real `gpt-4o-mini` N=1, 8-node, 6-tick, 2-article pilot**. No `CHECKER_REPORT.md` / `ACCEPTANCE.md` found in repo.

**Verdict.** Findings are more honest than typical thesis drafts, but still smuggle causal language, “Pfeffer consistency,” and textbook-k\* framing over a design that cannot support those claims. Every flagged line below must be demoted or deleted before an examiner sees it.

---

## Header / framing

| Quote | Why stronger than data |
|---|---|
| “**What an examiner can accept:** this is a **real-LLM pilot** of a climate-firestorm simulation (Pfeffer factors + Debnath-grounded BPs)” | “Pfeffer factors” plural implies a factor study. Only valence (2 seeds), identity mix (2), and topology (2) were touched once; surprise and temporal acceleration were **held**. “Debnath-grounded” overstates three hand-written BPs with no 814k HDBSCAN. |
| “not a full empirical replication of Debnath’s 814k-tweet study” | Correct disclaimer — but the rest of the page still borrows Debnath’s narrative (piggyback, echo) as if measured. |

---

## § What the numbers show

| Quote | Why stronger than data |
|---|---|
| “On **homogeneous conspiracy** networks, both seeds produced propaganda-level events (max event MI=5).” | True as table lookup. Still overclaims *networks*: N=1 graph seed, 8 nodes. Max event MI=5 is auditor ceiling saturation, not graded severity evidence. |
| “**Chemtrails–Gates** on scale-free conspiracy was the starkest cell… **k\*=1** (no recovery)” | One cell, one replicate. Calling it “starkest” ranks a 2×2×2 toy grid. k\* here is network-mean MI>3 with no later recovery under **6 ticks** — recovery window truncated. |
| “mean node MPR ≈ 4.16” | Precise to two decimals on N=1. Implies stability. |
| “Factual **SCoPEx** on the same graph crossed mean MI>3 at tick 4 but **recovered** (k\* none).” | “Recovered” implies corrective dynamics. Could be hop/inbox starvation, fewer late events, or mean dilution — not demonstrated walk-back. Same graph ≠ same cascade trajectory. |
| “That is consistent with Pfeffer **valence**” | Causal leap. Valence was not isolated: seed *content*, *frame*, and *prior conspiracy fit* all change together. Homogeneous nodes are instructed to treat SCoPEx as proof of spraying — so “calm scientific seed” is not calm once rewritten. |
| “the conspiracy-framed seed is harder to walk back than the calm scientific seed, **even when every node is a conspiracy BP**.” | “Harder to walk back” is a recovery claim. No correction mechanism was swept in Exp A. Homogeneous conspiracy BPs are **designed** to invert SCoPEx; any temporary MI>3 then drop can be stochastic, not valence. |
| “**Identity mix** buffered the firestorm.” | Causal verb. Mixed cells have fewer conspiracy nodes by construction → network-mean MI is diluted. Buffering ≠ resistance; could be averaging artifact. |
| “Scale-free mixed BPs never got an irreversible network k\* on either article.” | True for these two rows. Overclaims generality (“identity mix prevents irreversible k\*”). Node-level k\* ticks still hit 6/h5 on both mix articles. |
| “Chemtrails still produced propaganda on conspiracy nodes (MPR ≈ 3.6) while climate-action / environmental nodes stayed in the lie band (MPR ≈ 2.2–2.5).” | Persona gap is the expected prompt compliance test, not a discovery. Ranges look measured; they are single-run node aggregates. |
| “Polarization index ≈ 1.3–1.4: distortion concentrates in the conspiracy subset — an **echo** outcome without swapping topology.” | “Echo outcome” imports Exp D / Pfeffer language. PI≈1.3–1.4 on N=1 mixed SF is descriptive inequality, not demonstrated echo-chamber dynamics. Homophily on mix SF is **0.31** — anti-echo by edge composition. |
| “Seeded ER + homogeneous conspiracy still reached irreversible k\* … but with fewer events than scale-free.” | Fewer events ≠ topology effect on distortion; ER may simply have lower activity / degree. Confounded with cascade volume. |
| “Mixed ER × chemtrails **died after 1 event** (N=1 drop). Do not read that as…” | The parenthetical is good. Still listing the dead cell in a results narrative invites examiner cherry-pick unless marked **INVALID / exclude from inference**. |
| “the sibling mixed-ER × SCoPEx cell ran 75 events with conspiracy-node propaganda.” | Sibling ≠ control. Different article, same dead-cell RNG class risk. Does not rehabilitate the chemtrails drop. |

---

## § Experiment B

| Quote | Why stronger than data |
|---|---|
| “Fact-check at n=1 vs n=3 did **not** yield a clean recovery curve.” | Fair. Still frames Exp B as a recovery experiment that “failed cleanly” rather than a **confounded design that cannot identify recovery**. |
| “Descriptive: n=3 ended with max MPR=3.00 … vs n=1 max MPR=3.83. That is a hint, not a dose–response law.” | “Hint” is still an overclaim under tick confounding: n=3 has mean MI **after** 2.15 vs before 1.14 on n=7 events; n=1 has **0** before events. Direction can reverse under a proper matched-window analysis. Delete “hint.” |

---

## § Exp C / D

| Quote | Why stronger than data |
|---|---|
| “Homogeneous rewrites of SCoPEx were almost all tagged `spraying_chemtrails` + `weather_haarp`.” | Keyword regex on prompted conspiracy text. Confirms prompt obeyed, not that distortion taxonomy emerged. |
| “Mixed chemtrails rewrites also show `climate_justice_hijack` (Debnath’s 2018–2021 piggyback).” | Parenthetical equates keyword hits with Debnath’s empirical piggyback finding. False equivalence. |
| “Homophily is tautological on homogeneous graphs (1.0).” | Correct — then why report it as an Exp D result at all in the positive findings section? |
| “Conspiracy-cut modularity is higher on homogeneous graphs because there is only one community.” | Correct tautology. Must not be cited as evidence of echo. |
| “PI is the more honest mixed-graph echo metric.” | “Honest echo metric” still sells PI as echo. PI is a persona-gap ratio, not information-echo closure. |

---

## § Bottom line

| Quote | Why stronger than data |
|---|---|
| “the engine can produce **non-zero, persona-sensitive MI** on climate seeds” | Barely a claim; dry-run zeros were the alternative. Persona-sensitive is largely **prompt-faithful**, not socially emergent. |
| “homogeneous conspiracy + high-valence chemtrails is the **only** cell with a textbook irreversible k\* on scale-free” | “Textbook” is rhetoric. ER homogeneous cells also have irreversible k\* (2 and 3). “Only … on scale-free” is a narrow carve-out that still crowns a single N=1 cell. |
| “Treat everything else as a directional N=1 pilot.” | “Directional” implies a reliable sign. With dead cells, truncated ticks, and no replicates, signs are **not** directional evidence. |

---

## Sentences that are acceptably cautious (keep)

- Explicit N=1 / gpt-4o-mini / 8 nodes / 6 ticks design statement.
- “This is keyword overlap, not a trained classifier.”
- Rejection of reading ER death as “random graphs prevent propaganda.”
- Rejection of echo-chamber cell as usable.
- Listing of what was not shown (no 814k, no n=5, no 15-tick, surprise held).

---

## Required demotions before thesis prose

1. Replace every “consistent with Pfeffer valence / identity / echo” with “compatible with, not a test of.”
2. Replace “buffered,” “harder to walk back,” “recovered,” “hint” with non-causal table descriptions.
3. Mark `A_er_mix × chemtrails` and `D_echo_mix` as **invalid for inference** (not “interesting failures”).
4. Never call k\*=1 a “textbook” result until N≥3 and ≥6 articles share the pattern.
5. Do not claim Debnath piggyback or echo from keyword tags / PI alone.
