# Individual contribution — template (LASS workshop paper vs this thesis)

Fill the bracketed fields. This file is a **declaration template**, not a claim that the LASS/CIKM paper is unpublished work of the thesis alone.

The engine README currently cites a **CIKM 2025 outstanding paper** and an **EMNLP 2025** extension. If the co-authored venue is a **LASS** workshop (Language Agents / social simulation), put that bibliographic record in §1. Do not list thesis-only climate cells as workshop results.

---

## 1. Co-authored LASS / workshop paper (not claimed as sole thesis work)

| Field | Fill in |
|---|---|
| Working title | Simulating misinformation propagation in social networks using LLMs *(confirm exact title)* |
| Venue | LASS workshop / CIKM 2025 *(confirm which is the archival record)* |
| Status | [e.g. Outstanding Paper / workshop paper / under review] |
| Co-authors | [names, affiliations] |
| Thesis author’s role | [e.g. implementation of engine, experiments on linear chain, writing §…] |
| Shared artefacts | Engine in this repo: `index.js`, `src/`, default `personas/personas.json`, default `articles/articles.json`, `examples/run_*.json` |

### What that paper owns (do not re-brand as thesis-only)

- **Simulator core:** persona-conditioned nodes, forward / reinterpret / drop, disk-backed state, QA auditor, discrete MI, dry-run.
- **CIKM-style evaluation:** **linear chain**, mixed **crime / news / tech** articles (`crime_0`, `politics_0`, …), default heterogeneous personas (Young Parent, experts, political bias, …).
- **Example topologies as engine demos** (not the thesis factorial): `examples/run_linear_chain.json`, `run_echo_chamber.json`, `run_scale_free.json`, `run_polarized.json`, `run_small_world.json`, `run_hierarchical.json`, plus bot-resilience / digital-twin / polarization extensions if those were workshop/EMNLP layers.
- **Engine A/B CLI:** `node index.js --ab-test --base examples/run_linear_chain.json --variant examples/run_echo_chamber.json` — Cohen’s d on Layer 5 metrics; **not** the climate k\* grid.

Reproduce the *paper* setup (from root README), not the thesis:

```powershell
node index.js --config examples/run_linear_chain.json
```

---

## 2. This master’s thesis — individual research layer

Working title / topic: **climate-firestorm simulation** (Pfeffer factors + Debnath-grounded BPs). Folder: `thesisExperiment/`. Explicitly **not a CIKM reprint** (`thesisExperiment/README.md`).

### New graphs (thesis design, not the linear-chain paper cell)

| Thesis cell | Topology | Why it is not the workshop linear chain |
|---|---|---|
| A_sf_* | Scale-free BA, n=8, m=2, `graphRandomSeed=42` | Hubs vs chain; climate BPs |
| A_er_* | Seeded ER p=0.42, `minSeedOutDegree=2` | Random baseline + cascade-death fix |
| D_echo_mix | Echo chamber extra | Failed seed-drop in the pilot; still a thesis knob, not the 18-node example echo file |

Pfeffer **network clustering** is swept here (SF vs ER). The workshop `examples/run_scale_free.json` uses different n, ticks, and **non-climate** articles.

### Climate domain (not crime_0 / Young Parent)

- Seeds: Harvard **SCoPEx** (2017 public concept / later cancellation) vs **chemtrails–Gates** (2018–2021 Debnath window).
- Auditor items are climate/geoengineering facts, not the five-article news battery.
- Framing: climate **firestorm** / conspiracy spillover, not generic crime-news MI.

### Pfeffer six-factor operationalisation (thesis)

See `thesisExperiment/pfeffer_mapping.md`. Each factor is a **config knob** with status swept / held / measured:

| Factor | Thesis status |
|---|---|
| Valence | Varied via two seeds + BP tone (not a third extra-toxic cell) |
| Surprise | **Held** (drip `node_0` only) |
| Identity alignment | **Swept** homogeneous conspiracy vs mixed 3 Debnath BPs |
| Network clustering | **Swept** SF vs ER |
| Information echo | **Measured** (homophily, conspiracy-cut modularity, PI, Gini) |
| Temporal acceleration | **Held** at 6-tick / 6-hop compression vs a 15-tick proposal |

This mapping is not in `examples/run_linear_chain.json`.

### New corpus (thesis)

| Asset | Path | Contrast with workshop corpus |
|---|---|---|
| Climate articles + QA | `thesisExperiment/articles/articles.json` | Not `articles/articles.json` crime/news set |
| Homogeneous conspiracy BP | `thesisExperiment/personas/homogeneous_conspiracy.json` | Not the 26 default personas |
| Mixed 3 Debnath BPs | `thesisExperiment/personas/mixed_three_bp.json` | climate action / environmental concern / conspiracy |
| Public source pack | `thesisExperiment/data/` (Wikipedia, Harvard pages, Debnath notes; **no hydrated tweets**) | New collection for this campaign |
| A/B configs + grid | `thesisExperiment/configs/` | New factorial; k\* and fact-check n∈{1,3} |
| Campaign scripts | `run_campaign.js`, `parse_results.js`, `plot_results.py` | Thesis pipeline |

ClimateFEVER slice is optional/unused in A; Debnath 814k tweets were **not** ingested.

---

## 3. Shared vs individual — one-page checklist

Tick before the examiner’s contribution statement.

| Item | LASS / workshop co-authored | This thesis (individual) |
|---|---|---|
| Node–auditor engine | ☐ | ☐ (use only; cite paper) |
| Linear chain + crime/news articles | ☐ | ☐ do not present as thesis result |
| Default 26 personas | ☐ | ☐ |
| Scale-free vs ER **climate** 2×2 | ☐ | ☐ |
| Homogeneous vs mixed **Debnath BPs** | ☐ | ☐ |
| SCoPEx + chemtrails–Gates corpus | ☐ | ☐ |
| Pfeffer factor table + knobs | ☐ | ☐ |
| k\* (network-mean MI>3, no recover) | ☐ | ☐ |
| Fact-checker n=1 vs n=3 | ☐ | ☐ |
| Keyword distortion taxonomy (Exp C) | ☐ | ☐ |
| Echo/PI metrics on climate graphs (Exp D) | ☐ | ☐ |
| EMNLP layers (IFD, bots, digital twin, …) | ☐ if in that paper | ☐ only if thesis-specific analysis |

---

## 4. Suggested wording (adapt)

> The simulation engine and the linear-chain news-misinformation study were developed **jointly** for the [LASS / CIKM 2025] paper with [co-authors]. This thesis **does not reprint** that grid. Individual work is a **climate-firestorm** campaign: new SCoPEx and chemtrails–Gates articles, Debnath-grounded homogeneous vs mixed belief profiles, Pfeffer-factor knobs, and a scale-free vs Erdős–Rényi factorial with k\* and fact-check timing (N=1 `gpt-4o-mini` pilot). Tweet-ID datasets were not hydrated.

---

## 5. What the student should still write by hand

- Exact LASS workshop name, dates, and paper ID/DOI.
- Sentence-level split of code vs writing vs experiment design with co-authors.
- Whether EMNLP 2025 extensions count as co-authored or thesis-only.
- Supervisor / TUM declaration format required by the examination office.
