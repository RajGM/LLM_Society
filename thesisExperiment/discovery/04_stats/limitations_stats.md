# Statistical and measurement limitations (pre-analysis)

These limitations are **in force for the N=1 real-LLM pilot**. Copy their substance into the results chapter; do not wait for a reviewer to name them.

---

## 1. Multiple comparisons

### What was looked at

Experiment A is a 2×2×2 grid (topology × BP mix × article). Experiment B adds two injection times. Experiment C adds six keyword tags. Experiment D adds homophily, modularity, PI, Gini, virality. Parser flags (`propagandaOccurred`, recovered, k\* node vs network) multiply the family further.

That is **many looks** at one small campaign.

### N=1 consequence

There is **no valid p-value**, so Bonferroni/Holm cannot “save” the design. The risk is not Type I error in the NHST sense; it is **story selection**: choosing the cell that looks like a textbook firestorm (homogeneous × chemtrails × scale-free, k\*=1) as *the* result.

**Mitigation (mandatory):**

- Pre-registered **primary family** only: `maxEventMI`, `meanNodeMPR` (persona-stratified on mixed graphs), `kStar_network` (`analysis_plan.md` §3).
- All other metrics labelled **descriptive / exploratory** (Table T14).
- Report the **full** T2 matrix, including null k\* and dead cascades, not only the headline cell.
- Do not add post-hoc DVs (e.g. “share of events with MI=5”) as primary after seeing the data.

### N≥3 (future)

- Test the primary family at the **replicate** level; Holm–Bonferroni within that family.
- Secondary family: Benjamini–Hochberg FDR or explicitly uncorrected exploratory.
- Do not test 6 keyword rates as confirmatory.
- Do not treat two articles as independent replicates of one hypothesis (they are a valence factor).

### Clustering

Events are nested in nodes in a graph in a run. Counting `totalEvents` as N is a multiple-comparison **and** a dependence violation. Even keyword tests on nTexts would be over-precise.

---

## 2. LLM stochasticity

### Sources of randomness (this engine)

| Source | Where | Fixed in pilot? |
|---|---|---|
| Chat completions | `src/llmClient.js` `temperature: 0.7` | No (stochastic) |
| Action sampling | `SimulationNode._sampleAction` | No (`Math.random`) |
| Graph draw | ER / BA | **Yes** (`graphRandomSeed=42`) for reported cells |
| Auditor completions | same client, same temperature | No |

Rewrite **and** audit both call the LLM. A single run is **one draw** from a high-variance process. `grid.json` `runsPerCell: 1`.

### What N=1 cannot do

- Estimate between-run SD of MPR or k\*.
- Separate “identity mix buffers firestorms” from “this seed dropped.” Mixed ER × chemtrails dying after one event is the canonical example: **compatible with** buffering **or** with a stochastic cascade death (sibling mixed-ER × SCoPEx ran many events).
- Support Cohen’s d, CIs, or “robust across seeds.”

### Extra stochasticity traps

- **Temperature 0.7** on the auditor: the same rewrite can receive different MI on a re-score. Discrete 0–5 is not a stable physical instrument.
- **Parse fallback:** auditor JSON parse failure → all-correct scores → **MI=0**. That is a downward bias, not mean-zero noise (`Auditor._getIFDScores`).
- **Hop compression (6 ticks):** irreversibility has almost no post-period; k\* is sensitive to the last one or two ticks (`kstar_rules.md` right-censoring).
- **Inbox cap 4** and action weights (`reinterpret` 0.50) interact with randomness in who speaks.

### Mitigation

- Language: “in this run,” not “homogeneous networks produce k\*=1.”
- If N≥3: report replicate dots, not only means; for k\* use time-to-event / fraction of replicates with irreversible k\*.
- Optional cheap robustness (if ever allowed): re-audit a frozen rewrite corpus at temperature 0; do **not** rerun the full grid from this stats folder.
- Do not interpret B n=1 vs n=3 as two draws of the same cell; they are different interventions.

---

## 3. Auditor circularity

### The loop

| Role | Config field | Model in campaign |
|---|---|---|
| Persona rewrite | `defaultModel` | `gpt-4o-mini` |
| Fact auditor | `auditorModel` | `gpt-4o-mini` |
| Ground truth | `articles.json` questions + expected yes/no | written by experimenters |

The same model family **generates** the distorted text (under a conspiracy or climate-action system prompt) and **scores** it against experimenter-written items. MI is not an independent measurement of “misinformation in the world”; it is **agreement with a rubric, judged by a sibling LLM**.

### Why this inflates or distorts effects

1. **Shared style priors:** gpt-4o-mini may systematically treat sensational rewrites as “incorrect” (−1) rather than “missing” (0), pushing discrete MI = missing+incorrect upward for conspiracy tone. That can **exaggerate** hom vs mix gaps.
2. **Or the reverse:** a compliant model may hedge sensational text enough to look “correct” on binary items, **compressing** MI.
3. **Prompt leakage:** conspiracy BPs are instructed to invert specific facts that the auditor then checks — the DV is partly **instruction-following**, not emergent social distortion.
4. **No independent gold:** `human_eval_template.csv` has blank `rating_factual` / `rating_frame` / `rating_persuasion`. Until humans rate, there is no out-of-model criterion.
5. **Treating auditor_mi as human** in T12 would close the loop a second time.
6. **IFD default-on-error** (all 1s) is circular with “factual” in a different direction (underestimation).

### What is *not* circular

- Graph topology, hop counts, action choices, and **who talked to whom** are engine-internal and not scored by the auditor.
- Keyword distortion tags (Exp C) are regexes — independent of the auditor, but crude and overlapping with persona hashtag instructions (another, weaker, circularity: BPs are told to use `#chemtrails`).

### Mitigation (reporting)

- State explicitly: **generator–judge overlap**.
- Primary claims about **differences across personas/topologies** are more credible than claims about **absolute** MI levels (absolute levels may be judge-specific).
- Plan a human subsample (T12) **before** claiming auditor validity; compute agreement of humans with each other first, then with `auditor_mi` as a *model*, not a gold standard.
- Dual/continuous IFD was **not** run (`miScoringMode: discrete`); cannot use discrete vs continuous gap as an internal reliability check in this campaign.
- Do not use the same LLM to “explain” k\* in-text as additional evidence.

---

## 4. Other limitations the stats chapter must own

| Issue | Effect on inference |
|---|---|
| N=1, 8 nodes, 6 ticks | Not thesis-grade for population claims (`summary.thesisGrade: false`) |
| Reduced Debnath BPs, no 814k HDBSCAN | Identity factor is theory-faithful, not empirically clustered |
| Experiment B volume confound | Before/after mean MI is not a recovery test |
| Homophily on homogeneous graphs = 1 | Not evidence of echo; tautology |
| Cohen’s d in `ABTestRunner` | Undefined; always 0 on length-1 averages (`analysis_plan.md` §5) |
| `activeNodes` misnomer | Event count; do not report as unique participation without recomputing |
| Unequal persona n in mixed (3 / 3 / 2) | Unweighted persona means are not a balanced ANOVA |
| Sequential article order in a run | Possible carry-over in node files; k\* is per `articleId` filter — keep that filter strict |

---

## 5. Language whitelist / blacklist

**Use:** descriptive, in this run, consistent with, compatible with, not identified, right-censored, generator–judge overlap.

**Do not use (N=1):** significant, highly significant, proved, Cohen’s d, replicable effect, causal recovery, echo chambers suppress firestorms (failed cell), CIKM numbers as new climate results.

---

## 6. Executor sign-off

Before writing results prose:

- [ ] Dry-run excluded  
- [ ] Failed echo cell excluded from topology claims  
- [ ] k\* recomputed per `kstar_rules.md`; 0 not used for “none”  
- [ ] No `ABTestRunner` d  
- [ ] Primary family only in the lead paragraph  
- [ ] Mixed MPR persona-stratified  
- [ ] B table includes nBefore / nAfter  
- [ ] CIKM comparison is design-only  
- [ ] Circularity and temperature 0.7 stated  
