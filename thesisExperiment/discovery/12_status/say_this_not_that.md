# Say this, not that — 12×12, 8-hop grid

**Sources.** `thesisExperiment/CHECKER_REPORT.md` (18 Sep 2026 rewrite) and `thesisExperiment/results/findings.md`.  
**Object.** The real `gpt-4o-mini` campaign on disk (`summary.json` `generatedAt=2026-09-18T06:13:25Z`): 144 H + 144 He linear-chain cells, 8 nodes, **8 hops / 8 ticks**, N=1.  
**Rule.** The left column is the strongest sentence the checker will still allow. The right column is already a FAIL in `ACCEPTANCE.md` / `ACCEPTANCE_1_0.md` / loop F7–F8–F12. Paste left. If a draft sentence sounds like right, delete it — do not soften it.

Automatic FAIL F1–F5 do **not** fire on this campaign. That is not a pass. Loop **F12 is tripped** (zeros in heatmaps and in the 2.28 vs 0.64 means). Loop **F8 is tripped** if Experiment B is treated as identified. `"thesisGrade": true` is a self-PASS the executor was forbidden to make.

---

## Ten pairs

| # | SAY THIS (one sentence you may claim) | NOT THAT (overclaim — do not write) |
|---|---|---|
| 1 | I ran a real `gpt-4o-mini` climate/geoengineering campaign of **12 articles × 12 homogeneous personas** (144 chain cells) and **12 mixed chains × the same 12 articles** (144 cells) on 8-node linear chains with a logged **8-hop / 8-tick** budget, plus a 2×2×6 graph-A subset, B at n∈{1,3,5}, and one live echo cell. | This thesis **replicates** Maurya et al. CIKM/LASS **30-hop** results (21 personas × 10 domains × K=30, gpt-4o, 10 QA, Young Parent, crime0, ~85% heterogeneous propaganda). |
| 2 | Eight hops is a **documented cost compression** versus LASS K=30 and versus the proposal’s 15-tick / echo \(t=\{10,30,50\}\) windows; k\* on this series is a **right-censored simulator clock**, not a 30-hop plateau. | We followed **Debnath’s hop protocol** (Twitter `conversation_id` cascades, empirical ignition, Phase III reconstructed hops); 8 LLM rewrites equal Debnath hop distance. |
| 3 | These files support writing **methods + results as an exploratory N=1 case-study chapter**, citing `analysis/`, `results/FIGURES.md`, and `results/tables/`, if dead cells are hatched or dropped and `"thesisGrade": true` never enters the PDF. | The campaign is **1.0-ready** / ACCEPTANCE **PASS** / “thesis-grade grid? yes”; finishing He bought a 1.0; I only need to write the 1.0 thesis now. |
| 4 | Experiment B **ran** fact-check injection at n=1, 3, and 5 on mixed scale-free chemtrails; n=1 has **nBefore=0**, and n=3/5 after-counts dwarf before-counts because the cascade grows, so the table is **descriptive and unidentified**. | Experiment B **works**: fact-checks recover / backfire / show a **dose–response**; after>before is a causal correction finding. |
| 5 | The twelve personas are **theory-faithful expansions** of Debnath, Reiner, Sovacool et al. (iScience 2023) types; **814,924-tweet HDBSCAN was not run**, the ~662 MB OSF dump was not hydrated, and BPs are not cluster centroids. | Belief profiles are **814k HDBSCAN / Skip-gram centroids**, a digital twin of Debnath’s users, or an empirical re-analysis of the tweet dump. |
| 6 | On homogeneous chains, conspiracy-cluster personas (4×12=48 cells) had mean cell MPR **≈ 2.28** versus **≈ 0.64** for the other 96 cells; that contrast **includes dead zeros and GT-preserving expert zeros** and is simulator roleplay, not a measurement of Twitter. | Conspiracy communities **in the wild** distort at MPR 2.28; the 2.28 vs 0.64 gap is a Debnath finding, a significant effect, or a confirmatory identity law. |
| 7 | Heterogeneous 144-cell mean MPR **≈ 1.62** sits **between** the homogeneous conspiracy cluster and the other homogeneous personas; overall H mean is **≈ 1.19**, so mixed chains are **not** milder than homogeneous chains as a class. | Mixed personas **buffer firestorms** / diversity stops propaganda / He < H; this is a **successful CIKM-style expert-mix replication** (mix_00, mix_01, mix_02, and mix_11 have **no** `expert_added` ids). |
| 8 | Mixed scale-free graphs **dropped** scopex, chemtrails, and SAI after **1 event**, and mixed-ER dropped polar_bears (4/24 A cells dead); those rows are **sampled cascade death**, listed in findings, and **still inside** heatmap/mean aggregates (loop F12). | Mixed belief profiles **immunise** networks; PI=0 on those dead A rows shows mixed graphs suppress echo; averaging the zeros with live cells is fine. |
| 9 | The live echo rerun (`D_echo_mix_2026-09-18_06-08-40`, 184 LLM calls, 151 events) gave mean MPR **3.35**, edge homophily **0.44**, and conspiracy-cut modularity **≈ 0.29 at 8 ticks**; the 03:15 D folder is invalid. | Echo **confirms** Pfeffer information-echo at proposal times \(t=\{10,30,50\}\); homogeneous **homophily=1** is echo evidence; the dead 03:15 cell is a result. |
| 10 | Expert homogeneous SCoPEx can keep ground truth (MI=0, MPR=0) with **non-zero tokens and non-identical paraphrases**, while conspiracy chemtrails cells reach MI 4–5 with real rewrites — the offered campaign is **not** a dry-run zero grid, and those expert zeros are **not** failed cascades. | The auditor is validated / fail-closed / human-κ’d; writer=judge `gpt-4o-mini` is 1.0-instrument-ready; MI=0 expert cells should be averaged with conspiracy 5s as “no firestorm.” |

---

## How to use this while writing

1. **If the claim needs 30 hops, gpt-4o, 10 QA, or 21×10 crime/news heatmaps** — it is LASS prior work. Cite Maurya et al. (LASS@CIKM 2025). Do not put it in Results. Kill the root README `10.1145/3627673` badge before binding.
2. **If the claim needs Debnath’s hop/cascade protocol** — Phase III was omitted. Simulator hops ≠ tweet hops. k\* here is **not** Twitter ignition time.
3. **If the claim needs a 1.0** — missing: human κ, N≥3, mini-vs-4o, identified B, surprise/temporal sweep, 814k, proposal echo times, fail-closed auditor, hatched zeros. Honest band for a careful PDF: **2.0–2.3**. **1.0 and 1.3: no.** 1.7 only if LASS is fenced, dead cells dropped, B withdrawn, BPs not upgraded to HDBSCAN, and `thesisGrade` stays out.
4. **If the claim needs Exp B to “work”** — F8. No pre-window at n=1; no no-injection control; after>before is **volume**. Appendix or drop. README green checkbox is executor marketing.
5. **If the claim needs 814k BPs** — fabrication (kill-list K4). Write “theory-faithful,” once, in Methods/Limitations.

**Do not paste:** `summary.json` `"thesisGrade": true`; `summary.md` “Thesis-grade grid? yes (count bar)”; README “You can start writing” without N=1 / dead-cell / mini-auditor in the **same** paragraph; `analysis/examiner_safe_claims.md` “mixed personas can buffer” if the reader will hear He < all of H.

**Recompute before a headline.** Conspiracy 2.28 vs 0.64 uses F12 zeros. Hatch or drop events≤2 (H 15/144, He 11/144, A 4/24) and disclose MI=0 expert chains, or do not lead with those two decimals.

Checker: **FAIL** vs ACCEPTANCE and ACCEPTANCE_1_0. You may write the left column. You may not promote it.
