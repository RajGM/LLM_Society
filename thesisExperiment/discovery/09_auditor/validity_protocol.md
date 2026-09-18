# QA auditor validity protocol (thesis 1.0 vs 2.3)

**Status (18 Sep 2026):** the climate-firestorm campaign reports k\*, MPR, and “propaganda = MI>3” from a **gpt-4o-mini LLM-as-judge** (`src/Auditor.js`, discrete IFD, five binary items). Human rating columns in every `human_eval_template.csv` are **empty**. Until this protocol is executed and the fail-open / leaked-GT bugs are closed, MI-dependent claims are **2.3 (unvalidated judge)**, not **1.0 / 1.3**.

This note is measurement-validity only. Do not treat it as an engine patch. Documented Auditor bugs are listed here and in `threats.md`; `src/Auditor.js` is left unchanged.

---

## 1. What “valid auditor” means for this thesis

The auditor is the **dependent-variable instrument**. Network-mean MI, node MPR, severity bands (≤1 factual error / ≤3 lie / >3 propaganda), and **k\*** (first tick where mean MI>3 and does not recover) are all functions of `event.misinfoIndex`.

A 1.0-level thesis must show that MI tracks **factual fidelity of `contentOut` to the seed article’s ground-truth answers**, not:

- persona style / toxicity / hashtags,
- hop-to-hop paraphrase of an already-distorted `contentIn`,
- the rewriter model agreeing with itself,
- parse failures scored as “all correct.”

Construct: **item-level IFD** on five yes/no questions with author-fixed `groundTruth` in `thesisExperiment/articles/articles.json`.

| Score | Meaning | Discrete MI contribution |
|---|---|---|
| +1 Correct | Text states the expected answer | 0 |
| 0 Missing | Text does not address the item | +1 |
| −1 Incorrect | Text contradicts or distorts the expected answer | +1 |

`MI = missingCount + incorrectCount` ∈ {0,…,5}. Propaganda threshold **MI>3** therefore means **≥4 of 5 items** missing or wrong.

---

## 2. Known instrument failures (must be closed or disclosed)

| ID | Location | Failure | Effect on MI |
|---|---|---|---|
| **FO** | `Auditor._getIFDScores` catch (lines 73–75) and continuous analogue (105–107) | **Fail-open:** parse error → `questions.map(() => 1)` | **MI = 0** (looks like perfect fidelity) |
| **DR** | `llmClient.callLLMDryRun` on `IFD_SCORE_QUERY` | Dry-run returns all-correct | **MI ≡ 0**; already flagged invalid in `parse_results.js` |
| **GT** | Auditor user prompt | Each question is annotated `(expected: Yes/No)` | Judge can match leaked labels / retained keywords instead of reading the claim |
| **HR** | `human_eval_template.csv` | `rating_factual`, `rating_frame`, `rating_persuasion` never filled | No criterion validity |
| **T07** | `llmClient.callOpenAI` | Auditor calls share **temperature 0.7** with rewriters | Unstable item scores; same text can be MI=0 and MI=5 (see `spotcheck_sample.md` S02 vs S03) |
| **FAM** | campaign configs | `defaultModel` = `auditorModel` = `gpt-4o-mini` | Same-family rewriter/judge circularity (`threats.md`) |

**Fail-closed recommendation (required for 1.0; do not implement in this folder):**

1. On JSON/parse/`answers` length mismatch: set `misinfoIndex = null`, `ifd.parseError = true`, **do not** default to all-correct.
2. Exclude `null` MI from MPR / network-mean MI / k\* (already the `!== null` filter); log a **parse-error rate**.
3. If parse-error rate > 5% of audited events, halt the cell.
4. Dry-run: keep plumbing, but **refuse to write thesis tables** (already the parse_results INVALID path). Never present dry-run MI as results.
5. Auditor calls: `temperature = 0` (or 0.0–0.1), separate `auditorModel` from rewriter, **do not leak GT** in the prompt (questions only; GT used only in scoring after the judge answers Yes/No/Unknown).
6. Optional gold path: judge answers the five questions as Yes/No/Unstated **without** seeing expected labels; code compares to `groundTruth`.

Until FO is fixed, **every MI=0 event is unidentified**: true fidelity, leaked-GT keyword hit, **or** a swallowed parse error.

---

## 3. Spot-check sample (this campaign)

Protocol: stratified **n = 10** events from real run JSON, scored by a human against the five GT items, compared to stored `ifd.scores`. Executed in `spotcheck_sample.md`.

**Pass (pilot):** ≥ 8/10 events “sane” (human MI within 1 of auditor MI **and** no all-correct on inverted conspiracy text).

**This campaign:** 6/10 sane, 3/10 under-score or unstable, 1/10 catastrophic (conspiracy inversion scored MI=0). **Fails.** Directional MI (conspiracy chemtrails high, verbatim seed low) is visible, but the **threshold MI>3 / k\*** is not trustworthy.

A 1.0 campaign repeats this on **every cell**, not one hom + one mix run.

---

## 4. Human criterion sample (n = 20 dual-rated, plus full CSV)

Use existing export columns (see `human_eval_sheet.md`). Engine already samples up to 50 `(contentIn, contentOut)` rows per run into `human_eval_template.csv`.

**Minimum for 1.0 (small N=1 pilot):**

| Layer | n | Raters | Blind |
|---|---|---|---|
| Calibration | 5 items, discussed | 2 | auditor_mi hidden |
| Dual-rated core | **20** stratified | 2 independent | auditor_mi hidden; seed article + GT shown |
| Single-rated pool | rest of CSV (≤50/run) | 1 | same |
| Adjudication | disagreements \|Δfactual\| ≥ 2 | 3rd or discussion | after lock |

**Stratification (20-item core):**

- 8 homogeneous-conspiracy events (A_sf_hom), mix of SCoPEx / chemtrails, MI ∈ {0–1, 2–3, 4–5}
- 8 mixed-BP events (A_sf_mix): ≥2 per persona (climate_action, environmental_concern, conspiracy)
- 4 Experiment B events including ≥1 `[FACT CHECK]` / original-text injection
- ≥6 `forward`, ≥6 `reinterpret`
- Force-include any MI=0 conspiracy rewrite (fail-open / leak probe)

**Do not** ask raters to judge `original_text` (that field is `contentIn`, often already distorted). Show **seed article text + five questions + GT**. Rate `rewritten_text` = `contentOut` only.

---

## 5. Agreement statistics (report in thesis, not just “looks fine”)

Compute after ratings are locked. Map `rating_factual` (1–5, 5 = fully faithful to GT) to a human MI proxy:

```
human_mi_proxy = 5 - rating_factual     # 5→0, 1→5
```

Item-level (preferred; extra columns in the sheet):

```
human_mi_items = count(q_i ∈ {Missing, Incorrect})
```

**Must report:**

1. **Quadratic weighted Cohen’s κ** between rater A and B on `rating_factual` (and on item-level C/M/I if collected).
2. **Quadratic weighted κ** (or Spearman ρ) between **adjudicated** `human_mi_proxy` and `auditor_mi`.
3. Confusion at the **propaganda cut:** human_mi_proxy > 3 vs auditor_mi > 3 (precision/recall). This is the k\* cut.
4. Parse-error rate; count of auditor MI=0 that humans mark as inverted.

**1.0 / 1.3 bars (pre-register; do not tune after seeing κ):**

| Claim level | Inter-rater κ (factual) | Human–auditor κ (MI proxy) | Propaganda-cut recall |
|---|---|---|---|
| **1.0** usable DV | ≥ 0.60 | ≥ 0.60 | ≥ 0.80 on inverted conspiracy text |
| **1.3** directional only | ≥ 0.40 | ≥ 0.40 | ≥ 0.70 |
| **2.3** unvalidated | below those, or FO/DR/HR unfixed | — | — |

If human–auditor κ < 0.40 **or** conspiracy inversions systematically score MI≤1, **do not interpret k\***. Report MI as an exploratory LLM-judge score.

---

## 6. Reliability / sensitivity (needed to beat circularity)

Run on a **frozen 20-item bundle** (same `contentOut` strings):

| Test | Manipulation | What to report |
|---|---|---|
| Prompt GT leak | score with vs without `(expected: Yes/No)` | Δ mean MI, item-κ between conditions |
| Temperature | 0.0 vs 0.7, 3 repeats | within-text MI range (spotcheck already shows 0 vs 5) |
| Model family | auditor `gpt-4o` or Claude vs rewriter `gpt-4o-mini` | correlation of MI series; k\* agreement |
| Fail-closed | inject truncated / non-JSON mock | must yield `null` MI, never 0 |
| Dry-run gate | `DRY_RUN=1` | tables must mark INVALID |

A 1.0 write-up includes at least **GT-ablation + different-family auditor** on the 20-item bundle (cheap: 20×2 calls). Full-campaign re-audit with a stronger judge is the gold standard.

---

## 7. What the executor should dump

Per run, besides `human_eval_template.csv`:

```
thesisExperiment/runs/<id>/auditor_spotcheck.jsonl
```

One JSON object per audited event (or a seeded sample of 40): `runId, nodeId, personaId, tick, hops, articleId, action, contentOut, misinfoIndex, ifd.scores, ifd.cr, ifd.mr, ifd.ir, parseError, rawAuditorResponse`.

Keep `rawAuditorResponse` (truncated) so parse failures are auditable. Current runs **do not** store the raw LLM string — only parsed `ifd`. That makes FO vs true-all-correct **unidentifiable** after the fact.

Sampling recipe if JSONL is missing: see `spotcheck_sample.md` § How to dump.

---

## 8. Decision rule for this repository

| Evidence | Grade |
|---|---|
| Real LLM, non-zero MI, persona-sensitive **and** human κ≥0.60, FO fixed, GT not leaked, auditor ≠ rewriter family | **1.0** instrument; k\* interpretable |
| Real LLM, directional MI, human κ 0.40–0.59 **or** GT still leaked but disclosed + ablation | **1.3** directional; k\* with strong caveats |
| Real LLM, no human ratings, FO still in code, same-family judge, spotcheck failures | **2.3** — current state |

**Current campaign (findings.md, N=1 gpt-4o-mini):** empirically **2.3 on the DV**, even though the **engine and design** may be 1.3-capable. Filling `human_eval_sheet.md` and applying fail-closed + no-GT scoring is the shortest path to 1.3; 1.0 still needs a different-family (or human-only) judge on the propaganda cut.
