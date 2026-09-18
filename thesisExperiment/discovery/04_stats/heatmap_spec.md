# Heatmap and mixed-chain distribution spec

**Audience:** executor plotting the results chapter.  
**CIKM rule:** reuse the **visual language** (nodes/personas × articles, severity colour, MPR in cell). Do **not** copy CIKM Fig. 3 / Young Parent / `crime_0` numbers into climate tables or claim them as new measurements.

Engine reference plot: `visualize.py` → `plot_mpr_heatmap` (`02_mpr_heatmap.png`) — **nodes × articles**, colour by MPR, severity-style cmap. Thesis campaign has **8 nodes** and **2 climate articles**, not a 5-node linear chain of 21 personas × 5 news domains.

---

## 1. Colour and severity (shared with CIKM method, not CIKM data)

Use the engine severity cuts, labelled in the colourbar:

| MPR | Band | Suggested colour |
|---|---|---|
| 0–1 | factual_error | cool / green |
| 1–3 | lie | amber |
| **> 3** | **propaganda** | red |

Draw a **horizontal or legend annotation at MPR = 3**, not a fake CIKM contour. `vmin = 0`, `vmax = 5` (discrete MI ceiling with m=5 questions). Do not copy CIKM’s `vmax=10` clamp unless a cell actually exceeds 5 (it should not in discrete mode).

Cell text: one decimal (e.g. `4.2`). Empty / zero-event nodes: `—` not `0.00` (0.00 reads as “perfectly accurate”).

---

## 2. Figure H1 — homogeneous: persona × article mean MPR

### Why “persona × article” when homogeneous is one persona

Homogeneous configs assign **only** `conspiracy_believer` (`personas/homogeneous_conspiracy.json`). A 1×2 heatmap is too thin for a 60-page chapter. **Construct a 2-way layout that remains persona×article in meaning:**

**Panel A (primary, persona × article):**

- Rows: `conspiracy_believer` (the only BP). Optionally split **rows by topology** so the figure is still a matrix:
  - Row 1: `conspiracy_believer` | scale-free
  - Row 2: `conspiracy_believer` | ER
- Columns: `scopex_2017` | `chemtrails_gates_2018_2021`
- Cell = **mean node MPR** = unweighted mean of `nodeSummaries[i].mpr` for that run×article (8 nodes).

This is the **homogeneous identity** heatmap: one BP, two valences, two clusterings.

**Panel B (CIKM-analog, node × article):**

- For **one** homogeneous run at a time (prefer `A_sf_hom`, then `A_er_hom` as a second page).
- Rows: `node_0` … `node_7` with persona label `(conspiracy_believer)` — same encoding as `visualize.py`.
- Columns: the two articles present in that run’s `results_*.json`.
- Cell = **that node’s MPR** (`nodeSummaries[nodeId].mpr`).

Panel B is the methodological cousin of CIKM Fig. 3 (node/persona × article MPR). Panel A is the thesis-relevant collapse (identity × valence × topology).

### Cell formula (executor)

```
MPR_node(a) = mean { e.misinfoIndex : e in node.history, e.articleId = a, e.misinfoIndex != null }
MPR_persona_cell(a) = mean_i MPR_node_i(a)    # unweighted; N_nodes = 8
```

Do not weight by `eventCount` in the primary heatmap (high-volume nodes would dominate). Put an **event-weighted** twin in the appendix.

### Caption constraints

- State **N=1**, model `gpt-4o-mini`, 8 nodes, 6 ticks.
- “Homogeneous Debnath conspiracy BP, not 21 CIKM news personas.”
- Do not write “replicates the CIKM heatmap finding that … [number].”

---

## 3. Figure H2 — heterogeneous: mixed-chain (hop) distribution

Mixed configs (`mixed_three_bp.json`) cycle personas **sequentially**:

| node | personaId |
|---|---|
| 0, 3, 6 | `climate_action_advocate` |
| 1, 4, 7 | `environmental_concern` |
| 2, 5 | `conspiracy_believer` |

There is **no linear 5-node CIKM chain**. The analog of chain position is **`hops`** on scored events (Unit U1 in `analysis_plan.md`). Tick is a clock, not path length.

### 3.1 What to plot (required)

**H2a — hop × persona MI distribution (main mixed figure)**

For each mixed cell (`A_sf_mix`, `A_er_mix`; optionally B cells):

- X: `hops` ∈ {1,…,6} (bin integer hops; discard null-MI).
- Group: `personaId` (3 colours).
- Y: event `misinfoIndex`.
- Geometry: **box or violin + strip** (N=1: strip is mandatory so the reader sees raw points). Superimpose mean as a marker.
- Facet columns: article (`scopex_2017`, `chemtrails_gates_2018_2021`). Facet rows: topology if combining SF and ER on one page.

Horizontal line at MI = 3.

**H2b — persona mean MPR (mixed heatmap)**

- Rows: the three `personaId`s.
- Columns: two articles.
- Facet or stacked matrices: SF vs ER.
- Cell = mean of node MPRs **within that persona** (3 climate-action nodes, 3 environmental, 2 conspiracy — **unequal n**; print n in the cell or footnote).

**H2c — sequential “chain” strip (optional, CIKM-adjacent)**

Order nodes `node_0`→`node_7` on X (sequential assignment ≈ a ring, not a feed-forward chain). Y = MPR. Colour = persona. This shows **identity banding** (conspiracy nodes 2 and 5 vs others) without pretending the graph is linear.

### 3.2 What not to do

- Do not average mixed personas into one `meanNodeMPR` heatmap as the **only** mixed figure (parser `meanNodeMPR` hides polarization; PI ≈ 1.3–1.4 on mixed SF in the pilot is the point).
- Do not treat hop=6 tick=1 drops as scored chain tips.
- Do not overlay CIKM Young Parent traces.

---

## 4. Comparison to CIKM findings (design rhyme, not number reuse)

| Dimension | CIKM paper setup (engine README) | This campaign | Allowed comparison |
|---|---|---|---|
| Topology | Linear chain of **5** nodes | BA scale-free / seeded ER, **8** nodes | Method: MPR heatmap exists in both; **not** the same generative graph |
| Personas | **21** heterogeneous news-reader BPs (incl. Young Parent) | **1** or **3** Debnath-grounded geoengineering BPs | Identity still modulates MPR; **do not** import 21-persona rank order |
| Articles | Five domains (`crime_0`, politics, …) | Two climate seeds (SCoPEx, chemtrails–Gates) | Valence analog only; crime MPR is **out of sample** |
| Auditor | Five binary items → MI 0–5, MPR, three severity bands | Same engine, climate questions | **Shared measurement**; not a replication sample |
| Figure type | Nodes × articles MPR heatmap (Fig. 3 analog) | H1 Panel B, H2b | Shared **grammar**; new **corpus** |

**Prose template (use this, fill with *this* campaign’s cells only):**

> The CIKM study visualised MPR as a node-by-article heatmap on a linear chain of heterogeneous news personas. We keep that visualisation grammar and the same MI/MPR/severity definitions, but the design is a climate-firestorm grid (Pfeffer identity × clustering × valence), not a reprint of the news-persona × crime-article matrix. Numeric CIKM cells are therefore cited only in the related-work chapter, not copied into Table H1 as if they were additional climate runs.

**Forbidden:** taking a CIKM cell (e.g. a Young Parent × crime MPR) and placing it in a thesis results table, figure, or “replication delta.”

**Allowed in related work (not results):** one sentence that both studies found persona-sensitive MPR under the same auditor. No digits from CIKM in results captions.

---

## 5. Extra maps (appendix, not substitutes for H1/H2)

| ID | Matrix | Cell | Notes |
|---|---|---|---|
| H3 | condition × article | `kStar_network` | Use `none` / hatching if null; do not plot 0 as k\*=0 (parser plots do this — **fix** in chapter figures; grey = no k\* is OK only with caption) |
| H4 | condition × article | `maxEventMI` and `maxNetworkMeanMI` | Two colourbars or two panels; U1 vs U2 |
| H5 | mixed only | PI, edge homophily | Not MPR; Exp D |

Pilot `plot_results.py` bars are **not** heatmaps; replace them for the chapter.

---

## 6. Implementation notes

- Read MPR from `results_<articleId>.json` → `nodeSummaries`, not from `summary.json` alone (need persona IDs).
- Event hops: `nodes/node_*.json` → `history[].hops`.
- Prefer matplotlib/seaborn via `.venv`. File names: `thesisExperiment/discovery/04_stats/` is **spec only**; rendered figures belong in the results chapter pipeline, not this folder unless the executor is later asked to plot.
- N=1: no error bars on heatmap cells. If N≥3 later, cell = mean across replicates; annotate SD in smaller type or inset.
