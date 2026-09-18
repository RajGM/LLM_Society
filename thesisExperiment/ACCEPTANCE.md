# ACCEPTANCE — TUM M.Sc. campaign rubric

**Role of this file.** Independent scientific checker, 18 September 2026. The campaign executor must satisfy every **must-have** before the student is allowed to treat the campaign as “I only write.” This is a pass/fail bar, not a wishlist.

**Sources (read, do not reprint as new results).**

- `Paper/proposal_pfeffer_v5.pdf` — *An Open-Source Artificial Society for Climate Misinformation…* (Pfeffer / Debnath; deadline in PDF: August 2026).
- `Paper/Arvix_Submission_Simulating_Misinformation_Propagation_in_Social_Networks_using_Large_Language_Models (1).pdf` — LASS @ CIKM 2025, arXiv:2511.10384. Homogeneous vs heterogeneous **linear chains**, 21 personas × 10 news domains, MI/MPR, QA auditor.
- Engine: `src/Simulation.js`, `src/Auditor.js`, `examples/run_linear_chain.json`.
- Climate campaign folder: `thesisExperiment/`.

`Paper/` is listed in `.gitignore`. The PDFs exist on disk; they are **not** part of the GitHub tree.

---

## Overall verdict rule

**PASS** only if **all** must-haves below are PASS and **no** automatic FAIL trigger fired.

If any automatic FAIL fires, the campaign is **FAIL** even if README language is optimistic.

---

## Automatic FAIL (any one is fatal)

Record FAIL in `CHECKER_REPORT.md` and stop treating numbers as thesis results if **any** of:

| ID | Trigger | Why |
|---|---|---|
| F1 | **MI identically 0** on the campaign that is offered as “results” (all node MPR = 0, all event MI = 0) | Dry-run auditor returns all-correct; or seed dropped with no rewrite; not a firestorm measurement |
| F2 | **Dry-run sentinels** in reported runs: `DRY_RUN=1` / `--dry-run`, mock auditor (`IFD_SCORE_QUERY` all-correct), or `contentOut` is a copy of the seed for essentially every event | Not an LLM experiment |
| F3 | **&lt; 10 articles** with `questions[]` **and** aligned `groundTruth[]` in the **campaign article file actually used** | Below “many articles”; ClimateFEVER claim slices without QA do not count |
| F4 | **Missing heterogeneous linear-chain experiment** on climate seeds (mixed personas along a chain, MI/MPR, comparable to the CIKM hetero protocol) | Homogeneous-only graphs are not the last paper’s design |
| F5 | **Only the old 2-seed mini-pilot** (`scopex_2017` + `chemtrails_gates_2018_2021`, 3 BPs, 8 nodes, 6 ticks) is offered as the full results chapter | Explicitly not thesis-sized; executor’s own `results/summary.json` already sets `"thesisGrade": false` |

A **single dead cell** (seed drop, 1 event, MI = 0) is a **gap**, not F1, if sibling cells on the same campaign have non-zero MI from a real LLM. F1 fires when the **campaign as a whole** is an all-zero table.

---

## Must-haves for “student only writes”

### M1 — ≥ 10 personas

**PASS if**

- A campaign persona file (or set) contains **≥ 10 distinct `id`s** used in the reported runs.
- Personas are **climate / geoengineering / Debnath-grounded or expert/neutral controls**, not a silent swap back to “Young Parent / crime news” as the story.
- Homogeneous runs actually **repeat one persona** along the chain/graph; heterogeneous runs **mix** personas (CIKM: random mix, historically ≤ 2 repeats per branch — document the mixing rule).

**FAIL if** only the three reduced BPs (`conspiracy_believer`, `climate_action_advocate`, `environmental_concern`) exist.

CIKM paper used **21** personas. Ten is the **floor** for this thesis campaign, not the paper’s N.

### M2 — ≥ 10 articles with QA

**PASS if**

- ≥ 10 seed articles in the file passed as `articlesPath`.
- Each has `id`, `text`, **≥ 5** auditor `questions`, and `groundTruth` of the **same length**.
- Domain is **climate / geoengineering / climate misinformation** (SCoPEx, SAI, chemtrails, ClimateFEVER-derived **articles**, IPCC/governance, etc.).
- Auditor actually scores those questions (not unused JSON sitting next to a 2-article run).

**Does not count**

- `articles/articles.json` CIKM set (`crime_0`, `technology_0`, …) as the thesis corpus.
- `thesisExperiment/data/derived/climatefever_slice.json` claims **without** QA wrappers.
- Wikipedia/HTML dumps in `thesisExperiment/data/raw/` that were never turned into scored articles.

CIKM used **10 domains × 10 QA items** and **gpt-4o**. If this campaign uses 5 questions and `gpt-4o-mini`, **document it as a limitation**, do not claim paper-scale auditor power.

### M3 — Homogeneous **and** heterogeneous **linear chains** (CIKM protocol, climate seeds)

The last paper (PDF §2.1, Fig. 2–4): **linear branches**, not ER/scale-free as the only design.

- Each article is rewritten hop-by-hop along a chain.
- **Homogeneous:** one persona repeated (paper: 30 hops; this campaign may compress hops **if logged**, but must still be a **chain**, not a 2-node API probe).
- **Heterogeneous:** mixed personas on the same chain length.
- Metrics: per-node **MI**, branch **MPR**, severity (factual error / lie / propaganda), **persona × article heatmap**.
- Seeds: **climate articles from M2**, not a reprint of crime/tech CIKM heatmaps as the only result.

**PASS if** both hom and hetero chain grids exist, complete, real-LLM, on ≥ 10 climate articles and ≥ 10 personas (or a pre-registered subset that is still ≥ 10 × 10 cells, not 2 × 3).

**FAIL if** the only `linear_chain` artefact is `thesisExperiment/configs/_probe_api.json` (2 nodes, 1 tick, 1 article).

Graph experiments (scale-free / ER) **do not substitute** for M3. They belong under M4.

### M4 — Pfeffer six factors operationalised; Exp A \(k^*\); Exp B if claimed

Proposal §4: all six factors mapped to **simulation parameters**; Exp A–D named.

| Factor | Must exist as | Not enough |
|---|---|---|
| Valence | Seed wording and/or BP `emotionalTone` **contrasted** in the grid | Mention in a markdown table only |
| Surprise | A real knob (volume-shock vs drip) **or** explicit **held** with reason | Claiming “surprise” because tweets historically spiked |
| Identity alignment | Homogeneous vs mixed BP assignment, actually run | Tags on unused personas |
| Network clustering | ≥ 2 topologies (proposal: scale-free vs random; CIKM chains are extra, M3) | One 8-node BA graph |
| Information echo | **Measured** (homophily, modularity, PI, or cascade-internal homogeneity) | Setting `echo_chamber` topology and dying at tick 1 |
| Temporal acceleration | Tick/hop/inbox settings **documented**; if not swept, **held** and not narrated as a finding | Calling 6 ticks “acceleration” |

**Experiment A — \(k^*\).** First hop/tick where MI crosses **lie** (\(1 < \mathrm{MI} \le 3\)) into **propaganda** (\(\mathrm{MI} > 3\)) **and does not recover**. Required on climate seeds, **homogeneous vs mixed BP**, **scale-free vs random**. Definition of “network-mean vs first-node” must be one sentence in README and used consistently.

**Experiment B — only if claimed.** Proposal: after \(n \in \{1,3,5\}\) conspiracy exposures, inject a factual counter-narrative; MI recovery by BP. If the thesis claims Exp B, **n = 5 cannot be silently dropped** without a logged cut. `fact_checker_injection` at a tick is acceptable **if** before/after is not confounded by cascade volume; otherwise report as descriptive only.

**Experiment C / D / Phase III** — if claimed in README, they must exist. Keyword tagging is **not** a trained six-type classifier. Echo-chamber modularity at \(t = \{10, 30, 50\}\) is **not** a 6-tick run. ClimateFEVER pipeline and real-cascade \(k^*\) comparison are Phase III; omit or deliver — do not imply they ran.

**HDBSCAN on 814,924 tweets** is a proposal Phase I item. If not run, the thesis must say **theory-faithful reduced BPs**, never “empirical HDBSCAN centroids.”

### M5 — Real LLM; N and model documented

**PASS if** every results table the student will cite comes from runs with:

- `defaultModel` / `auditorModel` named (e.g. `gpt-4o-mini`).
- **N** (replicates) named. N = 1 is allowed only as a **pilot**; it is **not** enough for confirmatory claims.
- `metadata.json` `llmUsage` with **non-zero** `calls` and token counts (or equivalent log line).
- Rewrites that are **not** identity copies of the seed (spot-check ≥ 2 nodes × 2 articles).

**FAIL if** reported numbers come from `thesisExperiment/runs/*_02-34-*` style dry-run folders (MPR = 0 everywhere) or any `--dry-run` campaign.

Never print API keys. Logs must not dump full secrets.

### M6 — Figures/tables enough for ~60 pages (methods + results + appendix), with captions

A TUM M.Sc. methods/results/appendix block cannot be carried by three untitled bar charts.

**Minimum figure/table set (each with a caption in `thesisExperiment/results/FIGURES.md` or equivalent):**

1. Methods: auditor–node / chain diagram (climate campaign, not a screenshot of the CIKM crime heatmap).
2. Methods: Pfeffer six-factor → knob table (already started in `pfeffer_mapping.md`; must match **what ran**).
3. CIKM-style **homogeneous** MPR heatmap: persona × climate article.
4. CIKM-style **heterogeneous** MPR heatmap (or mix-id × article).
5. Node-level MI along hops for high/low MPR branches (paper Fig. 4 analogue).
6. Exp A: \(k^*\) by topology × BP mix × article.
7. Exp A: MI/MPR trajectories over ticks/hops.
8. Exp B (if claimed): recovery by \(n\) and BP — **or** an explicit “confounded, appendix only” caption.
9. Exp C (if claimed): BP × distortion matrix.
10. Exp D (if claimed): modularity / homophily / PI over time.
11. Limitations: dry-run vs real, dead cells, N, model, hop compression.

**PASS if** ≥ 8 distinct captioned figures/tables exist **from the accepted campaign**, not from `experiments/` May–June dry-runs and not from the CIKM crime/tech paper as “new.”

PNG files without captions **do not** pass M6.

### M7 — `LOG.md` + `README.md` maintained

- `thesisExperiment/LOG.md` — append-only, dated, no keys. Records: what ran, what was cut, cost/tokens, dead cells, definition of \(k^*\).
- `thesisExperiment/README.md` — how to rerun **exactly** the accepted grid; model; N; article/persona paths; what is **not** claimed.

A single kickoff paragraph plus a stale README that still describes only the 2-seed pilot is **FAIL** once a larger grid is claimed.

### M8 — Examiner-safe claims (must be listed in README or findings)

The student **may** write:

- The engine can host Pfeffer-style climate-firestorm **simulations**.
- On **this** model, N, topology, and seeds, homogeneous conspiracy BPs produced higher MI/MPR than mixed BPs (**if** the numbers show that).
- \(k^*\) is an **operational definition** in this simulator, not an empirical Twitter ignition time unless Phase III ran.
- Reduced Debnath BPs are **theory-faithful**, not HDBSCAN.
- CIKM LASS is **prior work**; climate chains/graphs are the thesis increment.

The student **must not** write:

- “We replicated Debnath’s 814k-tweet study.”
- “We validated Pfeffer on real firestorms” without cascade comparison.
- “gpt-4o / 21 × 10 × 30” for a `gpt-4o-mini` 8-node 6-tick run.
- Causal dose–response for Exp B if injection tick is confounded by cascade volume.
- That a seed-drop cell (0 LLM calls) shows “echo chambers suppress firestorms.”
- That dry-run MI = 0 is a scientific result.
- That CIKM crime/tech heatmaps are new thesis findings.

---

## CIKM protocol (what “like the last paper” means)

From the LASS PDF, not from `README.md` marketing:

| Paper (LASS @ CIKM 2025) | This thesis campaign |
|---|---|
| Linear branches, length **K = 30** | Linear chains required (M3). Hop compression allowed if **logged**; 2-node probes are not chains |
| **21** homogeneous branches (one persona each) + heterogeneous mix | **≥ 10** personas, both hom and hetero |
| **10** news domains (crime, education, healthcare, marketing, politics, sports, technology) | **≥ 10 climate** articles — **not** those domains as the result |
| **m = 10** binary QA | ≥ 5 QA per article; 10 preferred; document if 5 |
| Model **gpt-4o** | Name the model; mini is cheaper and weaker — say so |
| Metrics MI, MPR, severity, 21 × 10 heatmaps | Same metrics on climate; new heatmaps |

Re-running `examples/run_linear_chain.json` on `crime_0` / `technology_0` is a **reprint**. It does not satisfy M3.

---

## Proposal protocol (what “Pfeffer / Debnath” means)

From `Paper/proposal_pfeffer_v5.pdf`:

- Six factors → parameters + testable \(k^*\).
- Seeds: **SCoPEx (Apr 2017)** and **chemtrails–Bill Gates (2018–2021)** — necessary but **not sufficient** (F5 if they remain the only two).
- Exp A: hom vs hetero BP **and** scale-free vs random.
- Exp B: \(n \in \{1,3,5\}\).
- Exp C: six Debnath distortion types.
- Exp D: modularity at \(t = \{10,30,50\}\).
- Phase III: real-cascade \(k^*\), interventions at \(k^*-1, k^*, k^*+1\), ClimateFEVER demo.

A 2 × 2 graph pilot on two seeds can be an **appendix**, not the dissertation results chapter.

---

## Reproducibility pack (required on PASS)

```
thesisExperiment/
  ACCEPTANCE.md          (this file)
  CHECKER_REPORT.md      (checker)
  LOG.md                 (executor, current)
  README.md              (how to rerun accepted grid)
  personas/              (≥10)
  articles/articles.json (≥10 with QA)
  configs/               (every reported cell)
  runs/                  (complete real-LLM folders + metadata.llmUsage)
  results/
    summary.json / summary.md / findings.md
    FIGURES.md           (captions)
    *.png
    logs/
```

---

## Checker sign-off line (for later)

When the executor believes they are done, they must not self-PASS. A checker re-reads this file against disk: article count, persona count, presence of **hetero linear chains**, non-zero MI, no dry-run sentinels, captioned figures, LOG/README, examiner-safe claims.
