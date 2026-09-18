# ACCEPTANCE STATUS — 18 September 2026

Independent checker. Rubric: `thesisExperiment/ACCEPTANCE.md`.  
Snapshot: `results/summary.json` `generatedAt=2026-09-18T06:13:25.119Z`. **No commit. No new grid.**

## Overall: FAIL

Automatic FAIL F1–F5: **none fired** on the offered full campaign (12 climate articles with QA; 144+144 real chain cells; not the 2-seed pilot; MI not identically 0).  
Must-haves are **not** all clean. Loop F12 (zeros averaged in) and the executor’s `"thesisGrade": true` block a PASS. This is **not** “I only write a confirmatory thesis.”

## Must-haves

| ID | Result | One-line evidence |
|---|---|---|
| M1 ≥10 personas | **PASS** | 12 Debnath-expanded ids actually loaded by `configs/full/H_*.json` / `He_mix_*.json` |
| M2 ≥10 articles + QA | **PASS** | `articles/articles.json` 12 climate seeds, 5 questions = 5 `groundTruth` each |
| M3 hom + hetero chains | **PASS** (existence) | `H_rows.csv` 144 + `He_rows.csv` 144, `linear_chain`, 8 hops, `gpt-4o-mini`. Not CIKM 21×10×30 |
| M4 Pfeffer / Exp A / B | **FAIL** as confirmation | Knobs exist. A is N=1 × 6/12 articles; 4/24 graph cells dead. B n=1,3,5 ran but **unidentified**. D live at 8 ticks ≠ t={10,30,50}. Surprise + temporal **held** |
| M5 real LLM, N, model | **FAIL** for confirmatory use | Provenance **real** (8723 calls, every cited `runDir` has `llmUsage.calls>0`). **N=1** is a pilot per ACCEPTANCE, not confirmatory. `"thesisGrade": true` is wrong |
| M6 captioned figures | **PASS** (count) | 16 PNGs + `results/FIGURES.md`. Mask heatmap zeros before paste |
| M7 LOG + README | **PASS** as rerun docs | Full append-only LOG; README rerun commands. Status table over-paints Exp B **green** |
| M8 examiner-safe claims | **FAIL** | `findings.md` avoids 814k / causal B / dry-run science. `summary.json` `thesisGrade: true` and `summary.md` “thesis-grade grid? yes” are **unsafe** |

## Can the student start writing?

**Methods + results + limitations: yes**, from `analysis/`, `results/FIGURES.md`, `results/tables/`, `results/findings.md`, with the Limitations list below in the same draft.

**“Campaign accepted, only write, aiming at 1.0”: no.**

Do not paste `"thesisGrade": true`. Do not treat mixed-SF 1-event zeros as “diversity stops firestorms.” Do not treat Exp B after>before as backfire.

## Must stay in Limitations

- N=1; gpt-4o-mini writer=judge; 5 IFD items (not 10 / not gpt-4o)
- No 814k HDBSCAN; theory-faithful BPs only
- 8 hops/ticks (not 30; not echo t=10,30,50); A used 6 of 12 articles
- Dead cells: 15/144 H, 11/144 He, 4/24 A — listed, not interpreted
- Exp B volume-confounded; no control arm
- Keyword Exp C; no human ratings; k\* is a simulator definition

## Grade implication (this snapshot)

**Not 1.0. Not 1.3.**  
Honest band: **2.0–2.3** if the PDF is written as an exploratory N=1 climate-chain study and LASS is fenced. **1.7** only if dead cells are dropped, B is withdrawn, and venue inflation (`10.1145/3627673`) is killed. **2.3–2.7+** if green checklists and causal language survive.

Executor counts that **did** check out: 12×12 articles/personas, 144+144 CSV rows, 24 A rows, B n=5 present, D 184 calls, 8723 calls / ~$1.02, conspiracy MPR 2.281 vs other 0.641 (zeros included).

Full evidence: `thesisExperiment/CHECKER_REPORT.md`.
