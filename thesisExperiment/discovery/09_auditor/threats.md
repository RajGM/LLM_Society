# Threats to validity of the QA auditor (MI)

The thesis DV is LLM-as-judge IFD (`src/Auditor.js`). k\*, MPR, and “propaganda” are downstream. This note lists threats that keep the current campaign at **2.3** on the instrument even when the **design** (Pfeffer knobs, Debnath BPs, real gpt-4o-mini rewrites) is stronger.

---

## T1. Circularity (rewriter and judge in the same loop)

### T1a. Same-family model as rewriter

Campaign configs set `defaultModel` and `auditorModel` both to **`gpt-4o-mini`**. Nodes rewrite with a conspiracy / climate-action / environmental system prompt; the auditor then “fact-checks” the same model family with temperature 0.7.

Risks:

- Shared priors: both sides know the SCoPEx / chemtrails Wikipedia-shaped story. The judge may reward **surface overlap** (calcium carbonate, Keutsch, Debnath, Gates) that the rewriter kept as a foil (“they *claim* only kilograms”).
- Shared refusal / helpfulness style: the judge may treat alarming tone as style rather than inversion (spotcheck S01: covert-agenda rewrite, MI=1).
- Shared errors: if the rewriter fabricates a “fact” that 4o-mini also believes, the judge will not flag it.

**Mitigation:** different provider or a clearly stronger judge (gpt-4o, Claude, or a frozen local classifier) on a frozen bundle; report MI correlation and k\* agreement. Human ratings on the 20-item sheet are the non-circular criterion.

### T1b. GT leaked into the judge prompt

The discrete prompt literally includes the answer:

```text
${i + 1}. ${q} (expected: ${groundTruth[i] ? "Yes" : "No"})
```

System prompt: “the expected correct answer is provided.” This is **not** blind QA. It is “does this text agree with the label I just showed you,” which collapses to keyword spotting.

Consequences:

- A conspiracy rewrite that **quotes** “tiny amounts of calcium carbonate” while denying the measurement-science purpose still scores **C on quantity items** (S01 scores `[1,1,1,1,0]`).
- True inversions that drop the keywords score MI=5 (S03). Same narrative, different leftover phrases → **3–5 point MI swing**. That swing moves events across the **MI>3 propaganda cut**.

**Mitigation:** judge answers Yes / No / Unstated **without** expected labels; code compares to `groundTruth`. Ablate leak vs no-leak on the 20-item bundle (`validity_protocol.md` §6).

### T1c. Human CSV compares the wrong pair

`buildHumanEvalCSV` exports `original_text = contentIn` and `rewritten_text = contentOut`. The auditor scores `contentOut` against the **seed article**, not against `contentIn`. If humans rate hop-to-hop similarity, they will:

- give high `rating_factual` to “forward of propaganda” (text matches previous hop, MI vs seed is 5),
- disagree with the auditor for the wrong reason.

That is a **second circularity** if one then “validates” MI against those ratings.

**Mitigation:** `human_eval_sheet.md` hides `original_text` and shows seed + GT.

### T1d. Persona-conditioned rewriting is the treatment; scoring must ignore persona

Spotcheck S08: `environmental_concern` **forwards** a chemtrails conspiracy post, MI=5. That is **correct** (score the text). A circular judge that “knows” the node is an environmental specialist might down-score distortion. Do not put `persona_id` in the auditor prompt (currently it is not — keep it that way). Hide persona from human raters too.

---

## T2. Prompt sensitivity

### T2a. Temperature 0.7 on the judge

`callOpenAI` uses `temperature: 0.7` for **all** calls, including IFD. Fact-checking is not a creative task. Spotcheck S02 vs S03: near-duplicate conspiracy SCoPEx rewrites scored **MI=0** (`[1,1,1,1,1]`) vs **MI=5** (`[-1,-1,-1,-1,-1]`). With T=0.7 that can be stochastic; with leaked GT it can also be keyword-thresholding. Either way, **k\* is prompt-noise**.

**Mitigation:** auditor temperature 0; three-repeat majority vote on the 20-item bundle; report within-text MI range.

### T2b. Five items, coarse cut

Propaganda = MI>3 means **≥4/5** items fail. One unstable item (often SCoPEx Q1 “measurement vs deployment” or chemtrails Q2 “ordinary contrails”) moves a node between “lie” and “propaganda.” Mean IR/CR in homogeneous chemtrails is high, so the **cell-level** story (hom conspiracy × chemtrails is worse) can survive even if **event-level** MI is noisy. k\* **tick** is event-aggregated and still fragile when early ticks have n=1 (A_sf_hom chemtrails k\*=1 from a single seed rewrite).

### T2c. Missing vs incorrect are collapsed in MI

`MI = MR*m + IR*m`. Omission of Debnath’s 814k-tweet count (climate-action rewrite, S06, MI=2, scores `[1,1,0,0,1]`) equals two **inversions**. IFD stores CR/MR/IR, but **trust evolution and k\* use MI only**. A 1.0 thesis should either (a) define k\* on IR (inversions) not MI, or (b) show human agreement that omission and inversion deserve the same weight.

### T2d. CMS numerical blow-up

`cms = ir / (cr + 1e-9)` becomes ~1e8 when CR=0. `ifdMetrics.meanCMS` in A_sf_hom metadata is therefore **not interpretable**. Do not report CMS. Not an MI bug, but a sibling IFD threat.

---

## T3. Fail-open parse and dry-run (MI=0 contamination)

### T3a. Parse failure → all-correct

```javascript
} catch (e) {
  console.warn(`Auditor IFD parse error: ${e.message}. Defaulting all to correct.`);
  return questions.map(() => 1);
}
```

Malformed JSON, missing `answers`, or a truncated `{...}` match → **MI=0**. This is the worst default for a misinformation study: **measurement failure looks like truth**. Raw auditor strings are **not stored**, so S02 (all-correct on a spraying-program rewrite) cannot be distinguished from FO after the fact.

**Fail-closed:** `misinfoIndex = null` + `parseError` flag; drop from MPR; halt if error rate > 5% (`validity_protocol.md` §2).

### T3b. Dry-run all-correct

`IFD_SCORE_QUERY` mock fills `answers` with 1. Continuous mock fills 0.9 (MI not identically 0 in continuous mode, but discrete campaign mode is). `parse_results.js` already marks dry-run INVALID. **Never mix dry-run folders into thesis tables.** Early timestamps `02-34-*` in `thesisExperiment/runs/` look like plumbing; use the later real-LLM folders with `llmUsage.calls > 0`.

### T3c. Auditor exception path in `SimulationNode.auditPendingEvents`

If `auditor.score` **throws** (unknown articleId, HTTP error), the event is logged and **left with `misinfoIndex: null`** (fail-closed for throws). Only the **inner** parse catch fail-opens. Mixed behavior: network errors drop the event; garbage completions **launder** it as MI=0.

---

## T4. Other construct threats

| Threat | Why it matters |
|---|---|
| **No human ratings** | CSV is a template. Criterion validity is currently **zero**. |
| **Auditor sees only `contentOut`** | Intended. Disclose that forwards of propaganda inherit high MI (good) and that hop-compression repeats the same text many times (inflates event counts, not necessarily mean MI). |
| **Unseeded human-eval sample** | `Math.random()` shuffle — 50-row CSV is not a replicable sample. Freeze H01–H20 by run/node/tick. |
| **N=1, 8 nodes, 6 ticks** | Even a perfect auditor cannot make k\* a population estimate. Instrument validity is necessary, not sufficient, for 1.0 **results**. |
| **Questions written by the same authors as the personas** | GT items highlight exactly the facts personas are instructed to invert. That is acceptable for a **targeted** IFD, but it overfits Debnath talking points; a held-out question set would strengthen 1.0. |
| **English-only, gpt-4o-mini toxicity style** | Debnath’s 814k tweets are not reproduced; auditor never sees real tweets. External validity of MI vs Twitter is out of scope; do not claim otherwise. |

---

## T5. How threats map to 1.3 / 1.0 vs 2.3

| If you only… | Examiner reading |
|---|---|
| Report non-zero MI and persona gaps | **2.3** “LLM judged itself” |
| Add 20 dual ratings, disclose leak, fail-open, same-family | **1.3** directional, k\* caveated |
| Fail-closed + no-GT scoring + different-family or human κ≥0.60 on propaganda cut | **1.0** instrument; results still N=1 limited |

Circularity (T1) and fail-open (T3) are the two issues that **cannot** be waived with “N=1 pilot” language. Prompt sensitivity (T2) is why k\* should not be the headline until T=0 + ablation exist.
