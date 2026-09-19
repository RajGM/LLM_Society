# Phase 2 analysis summary

Generated from LIVE tables. Harvest stamp: `2026-09-19T05:14:37.163Z`.
Isolation: this folder is `thesisExperiment/analysis_phase2/`. Phase 1 `analysis/` and `results/tables/` were not overwritten.

## What this is

Phase 2 ran the climate/geoengineering IFD engine on **8 topologies × homogeneous (12 personas) and heterogeneous (6 mixes) × two scoring modes**, plus a small Debnath custom-graph (D-net) set. Six core articles. N=1. Model `gpt-4o-mini`. **8 hops/ticks** (logged cost cut vs CIKM 30, not a Debnath hop protocol).

Two scoring modes, two headlines:

- **Continuous (T2c_)** — headline MI/MPR is the continuous auditor float (~0–5). Table: `continuous.csv`.
- **Dual-discrete (T2d_)** — headline MI/MPR is the **discrete** 0–5 score. Continuous is a sidecar on the same events. Table: `dual_discrete.csv`.
- **Dual gap** (`dual_gap.csv`) is discrete minus sidecar continuous. It is a **scoring diagnostic**, not a third ground-truth MPR.

Cell headline used below = `meanMI` (same rule as `parse_phase2.js` / `summary.json`). `meanNodeMPR` is the mean-of-node-means of the same headline and is reported beside it, not mixed into it.

## Grid that was actually harvested

| slice | configs | cells | hatched dead |
| --- | --- | --- | --- |
| T2c_H | 96/96 | 576/576 | 96 |
| T2d_H | 96/96 | 576/576 | 98 |
| T2c_He | 48/48 | 288/288 | 50 |
| T2d_He | 48/48 | 288/288 | 48 |
| D-net | 4 configs | 8 article-rows | 0 |

Thesis grid cells: **1728** expected, **0** missing. Dead-cell table rows: **292** (all `hatched_dead_after_llm`). `thesisGrade`: **False**.

## Headlines — do not pool these

Live-cell means of `meanMI`. Dead cells excluded. H and He are separate. Discrete and continuous are separate.

| arm | continuous MPR (T2c) | n live cont | dual-discrete MPR (T2d) | n live dual | mean dual gap |
| --- | --- | --- | --- | --- | --- |
| H (homo) | 0.8643 | 480 | 1.6814 | 478 | 0.8804 |
| He (hetero) | 1.0192 | 238 | 2.0800 | 240 | 1.1145 |

Harvest `summary.json` cross-check (H only): continuous `0.8643`, dual headline `1.6814`. Recomputed live: continuous `0.8643`, dual `1.6814`.

Same cells as `meanNodeMPR` (not interchangeable with `meanMI`): H continuous `0.8630`, H dual `1.6839`, He continuous `1.0140`, He dual `2.0737`.

**Reading the two headlines.** Dual-discrete H (1.68) is not “the same MPR as continuous H (0.86) but higher.” The auditors are different instruments. Dual-discrete sits higher than continuous on every topology in this harvest; that is a **scoring-mode effect**, not evidence that the discrete campaign “found more misinformation” in a shared unit. Dual gap on H live cells is 0.8804 — the sidecar continuous on dual events is not the T2c continuous headline.

## Topology

Figure: `results_phase2/figures/fig01_topology_mpr_discrete_vs_continuous.png` (H and He panels; two bars per topology).

### Homogeneous (H)

| topology | n live dual | discrete MPR | k* dual | dead dual | n live cont | continuous MPR | k* cont | dead cont | dual gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| linear_chain | 68/72 | 1.6127 | 14.7% | 5.6% | 62/72 | 0.9129 | 14.5% | 13.9% | 0.9672 |
| ring | 61/72 | 1.6402 | 18.0% | 15.3% | 65/72 | 0.9160 | 15.4% | 9.7% | 0.8803 |
| random_er | 56/72 | 1.7809 | 19.6% | 22.2% | 57/72 | 0.8736 | 14.0% | 20.8% | 0.9680 |
| small_world | 59/72 | 1.5977 | 20.3% | 18.1% | 56/72 | 0.7215 | 12.5% | 22.2% | 0.8255 |
| scale_free | 57/72 | 1.7034 | 21.1% | 20.8% | 60/72 | 0.9205 | 16.7% | 16.7% | 0.8463 |
| echo_chamber | 61/72 | 1.7984 | 23.0% | 15.3% | 63/72 | 0.8490 | 12.7% | 12.5% | 0.8923 |
| polarized | 57/72 | 1.7005 | 21.1% | 20.8% | 65/72 | 0.8356 | 15.4% | 9.7% | 0.8553 |
| hierarchical | 59/72 | 1.6315 | 23.7% | 18.1% | 52/72 | 0.8751 | 11.5% | 27.8% | 0.7973 |

### Heterogeneous (He)

| topology | n live dual | discrete MPR | k* dual | dead dual | n live cont | continuous MPR | k* cont | dead cont | dual gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| linear_chain | 33/36 | 2.0852 | 24.2% | 8.3% | 32/36 | 0.8638 | 0.0% | 11.1% | 1.2960 |
| ring | 33/36 | 2.1768 | 39.4% | 8.3% | 33/36 | 0.8760 | 3.0% | 8.3% | 1.3123 |
| random_er | 29/36 | 2.0412 | 27.6% | 19.4% | 29/36 | 0.6593 | 0.0% | 19.4% | 1.1335 |
| small_world | 32/36 | 1.9096 | 28.1% | 11.1% | 31/36 | 0.7545 | 3.2% | 13.9% | 1.1049 |
| scale_free | 29/36 | 1.9924 | 31.0% | 19.4% | 30/36 | 0.8157 | 6.7% | 16.7% | 1.1058 |
| echo_chamber | 30/36 | 1.9632 | 23.3% | 16.7% | 32/36 | 1.3775 | 9.4% | 11.1% | 0.8830 |
| polarized | 26/36 | 1.8830 | 42.3% | 27.8% | 25/36 | 1.4137 | 12.0% | 30.6% | 0.8784 |
| hierarchical | 28/36 | 2.5934 | 42.9% | 22.2% | 26/36 | 1.5242 | 30.8% | 27.8% | 1.1354 |

### What the topology numbers say

- **H continuous:** highest `scale_free` (0.9205), lowest `small_world` (0.7215). **H dual-discrete:** highest `echo_chamber` (1.7984), lowest `small_world` (1.5977).
- **He continuous:** highest `hierarchical` (1.5242), lowest `random_er` (0.6593). **He dual-discrete:** highest `hierarchical` (2.5934), lowest `polarized` (1.8830).
- Rank order is **not the same** across scoring modes. Do not pick a single “best topology” from a pooled number.
- Linear chain and ring are short, low-degree paths; hierarchical is a different degree sequence. With N=1 these gaps are descriptive, not a significance claim about ER vs scale-free.

## H vs He

Figure: `results_phase2/figures/fig02_h_vs_he_mpr.png`.

| comparison | continuous | dual-discrete |
| --- | --- | --- |
| H meanMI | 0.8643 | 1.6814 |
| He meanMI | 1.0192 | 2.0800 |
| He − H (same mode only) | 0.1549 | 0.3986 |

Collapsed He is **higher** than collapsed H on both instruments (continuous 0.1549; dual-discrete 0.3986). That is the opposite of a pooled “hetero buffers firestorms” claim. The H mean mixes conspiracy personas (~2–3) with scientists (~0–1). The He mean mixes conspiracy-heavy `mix_00`/`mix_01` with conspiracy-free `mix_02`. Composition, not the H/He label, is what moves MPR.

Do **not** read dead He cells as “mix immunises.” They are hatched (`nScored≤1` after real LLM calls).

## Personas (homogeneous)

Figures: `fig03_persona_mpr_bars.png`, `fig05_persona_article_heatmaps.png`, `fig06_persona_topology_heatmaps.png`, `fig12_persona_family.png`.

| persona | family | discrete MPR | continuous MPR | k* dual | k* cont | dead dual | dead cont |
| --- | --- | --- | --- | --- | --- | --- | --- |
| conspiracy_believer | conspiracy | 3.3522 | 2.4842 | 65.8% | 47.7% | 10/48 | 4/48 |
| conspiracy_haarp_weather | conspiracy | 3.3571 | 2.4829 | 70.5% | 47.5% | 4/48 | 8/48 |
| conspiracy_depopulation | conspiracy | 3.2823 | 1.9535 | 59.5% | 34.9% | 11/48 | 5/48 |
| conspiracy_climate_piggyback | conspiracy | 2.6838 | 1.9570 | 42.5% | 31.7% | 8/48 | 7/48 |
| climate_action_advocate | climate_action | 1.0665 | 0.2258 | 0.0% | 0.0% | 11/48 | 11/48 |
| climate_justice_youth | climate_action | 1.3072 | 0.2454 | 2.2% | 0.0% | 2/48 | 7/48 |
| mitigation_first_policy | climate_action | 0.7571 | 0.0464 | 0.0% | 0.0% | 5/48 | 9/48 |
| environmental_concern | science_env | 0.8359 | 0.1423 | 0.0% | 0.0% | 11/48 | 8/48 |
| biodiversity_food_security | science_env | 1.1470 | 0.2115 | 0.0% | 0.0% | 11/48 | 9/48 |
| ozone_stratosphere_specialist | science_env | 0.9639 | 0.1627 | 0.0% | 0.0% | 11/48 | 10/48 |
| science_journalist | science_env | 0.6745 | 0.0310 | 0.0% | 0.0% | 9/48 | 11/48 |
| climate_scientist | science_env | 0.7517 | 0.0130 | 0.0% | 0.0% | 5/48 | 7/48 |

| family | n personas | discrete MPR | continuous MPR | k* dual | k* cont |
| --- | --- | --- | --- | --- | --- |
| conspiracy | 4 | 3.1691 | 2.2194 | 59.7% | 40.5% |
| climate_action | 3 | 1.0488 | 0.1729 | 0.8% | 0.0% |
| science_env | 5 | 0.8687 | 0.1118 | 0.0% | 0.0% |

Conspiracy-family H cells are the high-MPR group on **both** instruments (discrete `3.1691`, continuous `2.2194`). Science/env is lowest continuous (`0.1118`) but not uniformly lowest dual-discrete (`0.8687` vs climate-action `1.0488`). Scientist / journalist personas often sit near 0 on continuous and still pick up discrete points on some articles (see heatmaps). That is a mode disagreement, not “the scientist believed chemtrails.”

Full persona × topology grid: `RESULTS.md` and `tables/persona_topology_mpr.csv`.

## Heterogeneous mixes

Figures: `fig04_mix_mpr_bars.png`, `fig07_mix_topology_heatmaps.png`.

| mix | composition | discrete MPR | continuous MPR | k* dual | k* cont |
| --- | --- | --- | --- | --- | --- |
| mix_00 | 4 conspiracy + 4 climate/env | 3.1321 | 1.7712 | 57.5% | 12.8% |
| mix_01 | 2 conspiracy + 6 climate/env | 2.7795 | 1.4770 | 58.5% | 9.8% |
| mix_02 | 0 conspiracy + 8 science/climate | 1.1882 | 0.2645 | 0.0% | 0.0% |
| mix_03 | 1 conspiracy + 7 other | 2.0410 | 0.8945 | 33.3% | 10.3% |
| mix_04 | 2 conspiracy-adj + 6 other | 1.6896 | 0.7021 | 20.5% | 5.3% |
| mix_05 | 2 conspiracy-adj + 6 other | 1.6713 | 1.0134 | 23.3% | 7.5% |

`mix_00` (conspiracy-heavy) and `mix_02` (no conspiracy) are the useful contrast. Continuous: mix_00 `1.7712` vs mix_02 `0.2645`. Dual-discrete: mix_00 `3.1321` vs mix_02 `1.1882`. If mix_02 is lower, that is “this conspiracy-free mix scored lower in these N=1 runs,” not “diversity always stops firestorms.”

## Articles (secondary)

| article | H discrete | H continuous | He discrete | He continuous |
| --- | --- | --- | --- | --- |
| scopex_2017 | 1.5390 | 0.7322 | 2.3718 | 0.7694 |
| chemtrails_gates_2018_2021 | 2.1383 | 1.3541 | 2.3885 | 1.7852 |
| sai_geoengineering | 1.3576 | 0.1974 | 1.1160 | 0.1523 |
| paris_agreement | 1.7321 | 1.3357 | 2.4591 | 1.6821 |
| climate_consensus | 2.2610 | 1.5934 | 2.8991 | 1.8896 |
| polar_bears | 1.0399 | 0.0185 | 1.1444 | 0.0415 |

## k* and dead cells

k* = first tick where tick-mean MI > 3 and every later tick stays > 3 (`parse_phase2.js`). Censored at 8 ticks. Reported only on live cells.

| arm × mode | live cells | k* rate | dead rate |
| --- | --- | --- | --- |
| H continuous | 480 | 14.2% | 16.7% |
| H dual-discrete | 478 | 20.1% | 17.0% |
| He continuous | 238 | 7.6% | 17.4% |
| He dual-discrete | 240 | 32.1% | 16.7% |

Hatched dead after LLM: **292** / 1728 thesis cells (16.9%). Hatch pattern in `fig08_dead_cell_rates.png`. Hierarchical and some short chains show more dead cells (few scored events), which **inflates uncertainty** for those topologies — do not treat a live-only mean on a half-dead topology as a clean topology effect.

Dual k* uses the discrete series; continuous k* uses the continuous series. Do not add them.

## D-net / Debnath compare (structural, not MPR)

Figure: `fig11_dnet_structural.png`. Source: `results_phase2/debnath_compare.json`.

- Debnath has NO empirical MPR. Do not claim simulated MI equals Twitter MI.
- Hashtag co-occurrence is a structural/hashtag fallback, not a hydrated retweet cascade.
- 814k tweet IDs were not hydrated; BPs are theory-faithful reductions, not HDBSCAN centroids.
- 8 hops/ticks is logged cost compression vs CIKM 30, not a Debnath hop protocol.
- Pfeffer et al. (2014) lists seven interrelated factors. The thesis six-knob list is a remapping, not a restatement of that paper.
- Cross-media dynamics has no engine knob and is held.

| metric | empirical hashtag graph | simulated mean (16 cascades) | match (30% band) |
| --- | --- | --- | --- |
| depth | 4 | 2.5625 | no |
| breadth | 33 | 40.9375 | yes |
| size (info only) | 61 | 53.5 | — |
| structural virality | 2.7 | 1.7963 | no |
| speed | not available empirically | 7 ticks (sim clock) | — |
| meanMI | no empirical MPR | 2.5529 | do not equate |

Structural similarity: **0.6885** (1/3 metrics within 30%). KS (nReal=1, nSim=16; underpowered): depth D=1 p=0.1104; breadth D=0.8125 p=0.2954; virality D=1 p=0.1104. JS divergence = 1 on all three. DTFS = **0.2754** (`isValidated=False`; threshold 0.70). Content correlation = 0 because Debnath has no empirical MPR.

Simulated D-net auditor scores (from `all_rows.csv`) are listed in `RESULTS.md`. They are LLM-as-judge MI on a hashtag co-occurrence graph. **They are not Twitter MPR.**

## Honest limitations

- **N=1.** One seed (`graphRandomSeed: 42`), one run per config. No error bars, no topology significance tests.
- **8 hops vs CIKM 30.** Logged cost compression. Not Debnath’s hop protocol; not an empirical firestorm duration.
- **Hatched dead cells: 292.** Kept. Not zeros. Not “mix immunises.” Live-only means drop those cells.
- **`thesisGrade: false`.** Harvest itself marks this campaign as not thesis-grade.
- **Two instruments.** Dual-discrete headline ≠ continuous headline. Dual gap ≠ MPR.
- **Debnath reconstruct is a hashtag co-occurrence fallback**, not a hydrated retweet cascade. 814k tweet IDs were not hydrated. BPs are theory-faithful reductions, not HDBSCAN centroids.
- **No empirical MPR** on Debnath. Do not write “the simulator matched Twitter misinformation.”
- **KS/JS with nReal=1** cannot support a twin-validation claim. DTFS failed the 0.70 threshold.
- **Pfeffer 2014 has seven factors.** The thesis six-knob list is a remapping; cross-media is held (no engine knob). Surprise held as drip.
- **gpt-4o-mini roleplay** is not chemtrails communities in the wild.
- Phase 1 discrete 12×12 (`runs/`, `results/tables/`) is a different campaign. Do not splice those MPR numbers into these headlines.

## Figures

| file | what |
| --- | --- |
| `results_phase2/figures/fig01_topology_mpr_discrete_vs_continuous.png` | 8 topologies × discrete vs continuous, H and He panels |
| `results_phase2/figures/fig02_h_vs_he_mpr.png` | H vs He for each mode |
| `results_phase2/figures/fig03_persona_mpr_bars.png` | 12 homo personas, two bars |
| `results_phase2/figures/fig04_mix_mpr_bars.png` | 6 hetero mixes, two bars |
| `results_phase2/figures/fig05_persona_article_heatmaps.png` | persona × article, both modes |
| `results_phase2/figures/fig06_persona_topology_heatmaps.png` | persona × topology, both modes |
| `results_phase2/figures/fig07_mix_topology_heatmaps.png` | mix × topology, both modes |
| `results_phase2/figures/fig08_dead_cell_rates.png` | hatched dead % |
| `results_phase2/figures/fig09_kstar_rates.png` | k* % by topology |
| `results_phase2/figures/fig10_dual_gap_diagnostic.png` | dual gap, not MPR |
| `results_phase2/figures/fig11_dnet_structural.png` | empirical vs sim structure |
| `results_phase2/figures/fig12_persona_family.png` | conspiracy vs climate-action vs science/env |

Copies also under `analysis_phase2/figures/`.

## How to regenerate

```bash
python3 thesisExperiment/analysis_phase2/plot_phase2.py
```

Reads only `results_phase2/tables/*.csv`, `summary.json`, `debnath_compare.json`. Writes `analysis_phase2/` and `results_phase2/figures/`.
