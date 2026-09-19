# AGENT_HANDOFF — Phase 2 climate-firestorm campaign (for future AI agents)

**Audience.** Future AI agents continuing this repo. Not examiners. Density over prose.  
**Written from live disk** `/workspace` on 2026-09-19. Numbers below are copied from files named here. Do not invent MI/MPR. **Never print `OPENAI_API_KEY`.**  
**Official parse timestamp.** `thesisExperiment/results_phase2/summary.json` → `"generatedAt": "2026-09-19T05:14:37.163Z"`. Also copied to `results_phase2/PARSE.md` and `runs_phase2/_status/PARSE.md`. Prefer this stamp over later MASTER.md recheck prose that mentions `2026-09-19T05:27:59.674Z` / hatch 290.  
**`analysis_full/` ingested.** YES (`COMPARISONS.md`, `key_numbers.json`, `README.md`, **`PFEFFER_DEBNATH_VS_SIM.md` + `pfeffer_debnath_vs_sim.json`**). JSON `generatedAt=2026-09-19T12:26:19.169Z`, `newLlmRuns=false`.  
**`latex_phase2/`.** Present on disk as sibling untracked draft (`main.tex` + `sections/01`–`05` + `references.bib`). Do not treat as harvest-canonical.

Companion path index: `thesisExperiment/AGENT_HANDOFF_INDEX.md`.

---

## 0. Hard rules (violate these and you poison the chapter)

1. **Isolation.** Phase 2 writes only `thesisExperiment/runs_phase2/` and `thesisExperiment/results_phase2/` (plus `analysis_phase2/`, `analysis_full/`, `latex_phase2/` as analysis overlays). **Do not overwrite** `thesisExperiment/runs/`, `thesisExperiment/results/tables/`, `thesisExperiment/configs/full/`, or Phase 1 `thesisExperiment/analysis/`.
2. **Two instruments.** Dual headline ≠ continuous headline. Never pool T2c meanMI with T2d meanMI. Dual gap is **not** a third MPR.
3. **Dead cells.** `dead = nScored <= 1`. Hatched after real LLM (`llmCalls>0`) and **kept**. Not zeros. Not “mix immunises.” Live means drop them (`nScored>1` / `dead=false`).
4. **N=1.** `graphRandomSeed: 42`. One run per config. Exploratory SciPy p-values in `analysis_full/` are **not** replicate inference.
5. **8 hops/ticks ≠ CIKM 30 ≠ Debnath “eight”.** Cost cut vs CIKM K=30. Debnath’s eight is a **skip-gram word window**.
6. **Debnath has no empirical MPR.** Simulated auditor MI ≠ Twitter MI. Hashtag graph 63/228 is **not** a retweet cascade. Hydration failed; do not invent tweet IDs.
7. **Pfeffer 2014 has seven Outlook factors.** Thesis six knobs + held cross-media are a remapping. Do not write “Pfeffer identified six factors.”
8. **`thesisGrade: false`** in `summary.json`. This harvest is not thesis-grade confirmatory stats.
9. **Never commit `.env`.** Never dump the key. `KEY_READY.md` is length-only.
10. **Do not rewrite PR1 title/body** (`https://github.com/RajGM/LLM_Society/pull/1`). Human may have edited it.

---

## 1. Repo map

Repo: `https://github.com/RajGM/LLM_Society`. Engine root `/workspace` (`index.js`, `src/`, `package.json` name `societysimulation`). Thesis campaign folder: `thesisExperiment/`.

### 1.1 Engine (not thesis-only)

| Path | Role |
|---|---|
| `index.js` | CLI entry |
| `src/Simulation.js` | run loop; persona assignment; **persona-name fallback** (commit `438af78`) |
| `src/SocietyGraph.js` | topologies; `minSeedOutDegree` guard on ER / echo / polarized |
| `src/Auditor.js` | IFD discrete / continuous / **dual (2 LLM calls, Promise.all)** |
| `src/MetricsEngine.js` | `ifdMetrics`, `ifdDualMetrics`, network MI series |
| `src/RealGraphImporter.js` | FakeNewsNet-shaped JSON → custom graph (D-net) |
| `src/ValidationMetrics.js` / `src/ValidationComparison.js` | depth/breadth/virality, KS/JS/DTFS |
| `src/loadEnv.js` | loads `process.cwd()/.env`; mock-key detector; logs prefix+len only |
| `src/llmClient.js` | OpenAI calls |
| `src/BeliefEngine.js` | rewrite prompts (`persona.name`) |
| `config/` `personas/personas.json` `articles/articles.json` `examples/` | engine demos (CIKM-era crime/news personas live here; **not** Phase 2 climate BPs) |
| `ARCHITECTURE.md` `README.md` | engine docs |
| `.env` | gitignored; mode 600 observed |
| `.gitignore` | `.env`, `.venv/`, `thesisExperiment/data/debnath_hydrated/*.{csv,tsv,zip}`, `osf_dataset.csv`, `hydrated_tweets.json` |

### 1.2 `thesisExperiment/` layout

```
thesisExperiment/
  PHASE2_PLAN.md          isolation + grid design (2026-09-18)
  README.md               Phase 1 campaign how-to (H/He/A/B/D); not Phase 2 runner
  LOG.md                  append-only (~8526 lines / 259829 bytes at write time)
  pfeffer_mapping.md      thesis six-knob operationalisation
  ACCEPTANCE.md / ACCEPTANCE_STATUS.md / CHECKER_REPORT.md
  configs/
    full/                 Phase 1 configs — DO NOT OVERWRITE
    phase2/               Phase 2 T2c_/T2d_/Dnet_/_probe_*
    grid.json / grid_full.json / grid_phase2.json
  runs/                   Phase 1 raw (56 dirs counted) — READ-ONLY
  runs_phase2/            Phase 2 raw (~388 experiment dirs + _status/_blockers)
  results/tables/         Phase 1 CSVs — READ-ONLY
  results_phase2/         Phase 2 parse/compare/figures/logs/manifests
  analysis/               Phase 1 examiner paste — DO NOT OVERWRITE
  analysis_phase2/        first Phase 2 analysis overlay
  analysis_full/          sibling five-comparison overlay (INGESTED)
  latex_phase2/           sibling TUM LaTeX (present; not harvest-canonical)
  personas/               expanded_twelve, homo/, hetero/mix_00..11, phase2/, merged.json (17)
  articles/               articles.json (12), merged.json (24)
  data/raw|derived|debnath_geoeng|debnath_hydrated
  discovery/01_literature … 11_redteam
  scripts/                parse/compare/master/run_*/reconstruct/build_phase2
```

### 1.3 `configs/phase2` (on-disk counts)

`ls` at write time: **298** json files in `configs/phase2/`.

| glob | n | role |
|---|---:|---|
| `T2c_H_*.json` | 96 | continuous × 8 topologies × 12 homo personas |
| `T2d_H_*.json` | 96 | dual × 8 × 12 |
| `T2c_He_*.json` | 48 | continuous × 8 × 6 mixes |
| `T2d_He_*.json` | 48 | dual × 8 × 6 |
| **T2 total** | **288** | thesis grid |
| `Dnet_c_H_conspiracy.json` `Dnet_d_H_conspiracy.json` `Dnet_c_He_mixed.json` `Dnet_d_He_mixed.json` | 4 | custom 63-node graph |
| `Dnet_index.json` | 1 | index (63 nodes / 228 edges / seed `user_chemtrails_hub`) |
| `_probe_p2_continuous.json` `_probe_p2_dual.json` `_probe_T2c_He.json` `_probe_T2d_He.json` `_probe_dnet_custom.json` | 5 | tiny probes |

`grid_phase2.json`: `"estimatedCells": 1728`, `"mergedPersonaCount": 17`, `"mergedArticleCount": 24`, `"nReplicates": 1`, `"hops": 8`, `"model": "gpt-4o-mini"`. Isolation block names `configs/phase2`, `runs_phase2`, `results_phase2`, `notTouched`: `runs`, `results/tables`, `configs/full`.

### 1.4 `runs_phase2`

- **388** experiment dirs (not counting `_status`). Split observed: T2 **371**, Dnet **8**, probes **9**.
- Duplicate timestamps exist (esp. Dnet: two dirs per experiment). Parser rule: **latest complete dir with `llmUsage.calls>0` per `experimentName`**.
- `_status/`: `MASTER.md`, `MASTER_DONE.json`, `PARSE.md`, `probe_ifd.md`, `KEY_READY.md`, `ORCHESTRATOR.md`, per-slice `T2c_H.md` `T2d_H.md` `T2c_He.md` `T2d_He.md`, per-topology notes, poll jsons.
- `_blockers/`: historical NEED_OPENAI_API_KEY notes from Sep 18 abort (superseded).

### 1.5 `results_phase2`

Canonical tables live in `results_phase2/tables/`. Also: `summary.json`, `summary.md`, `PARSE.md`, `debnath_compare.json`, `pfeffer_observables.md`, `phase2_manifest.json`, per-slice `manifest_T2*.json`, `dnet_manifest.json`, `figures/fig01`–`fig12`, `logs/`.

**Stale / abort leftovers (do not treat as the 1728 harvest):** `dead_cells_polarized.csv`, `dead_cells_scale_free.csv`, `dead_cells_hierarchical.json`, `tables/polarized_dead_cells.csv`, `tables/linear_chain_dead_cells.csv`, `tables/ring_rows.csv` (header only, 0 data rows), `ring_parse.json`, `logs/ring_dead_cells.md`, `logs/linear_chain_dead_cells.md`. These date to 2026-09-18 key-missing aborts.

**Narrow leftover:** `tables/T2c_H_rows.csv` columns `experimentName,topology,articleId,nEvents,nScored,meanContinuousMI,llmCalls,status,miScoringMode,runDir` — 576 data rows; superseded by `TH_rows.csv` / `continuous.csv`.

### 1.6 `analysis_phase2/` vs `analysis_full/` vs `latex_phase2/`

| folder | status at this handoff | purpose |
|---|---|---|
| `analysis/` | Phase 1; do not overwrite | examiner paragraphs |
| `analysis_phase2/` | committed on harvest/analysis commits | topology/persona/mix MPR; `plot_phase2.py` |
| `analysis_full/` | **present; INGESTED** | five numbered comparisons C1–C5; `analyze_full.py` |
| `latex_phase2/` | present on disk; sibling draft | TUM KOMA-Script results chapter |

`analysis_full/` isolation claim (its README): does not overwrite Phase 1 `analysis/` or `analysis_phase2/`. At write time the sibling **had re-run `plot_phase2.py`**, so `analysis_phase2/SUMMARY.md` harvest stamp now matches `summary.json` (`2026-09-19T05:14:37.163Z`) and hatch **292**. An earlier on-disk SUMMARY (before that re-run) had stamp `05:27:59.674Z`, T2c_H hatch 94, n live H cont 482, mean 0.8608 — **do not revive those**. Official tables + current SUMMARY + analysis_full agree on 0.8643 / 480 / 292.

### 1.7 Phase 1 (do not splice MPR into Phase 2 headlines)

Phase 1 README status: Exp H 12×12×8 hops (144 cells), He 12 mixes ×12×8 (144), A 2×2×6 articles, B n∈{1,3,5}, D echo cell. Model gpt-4o-mini, N=1. Tables: `results/tables/H_rows.csv`, `He_rows.csv`, `A_rows.csv`, `all_rows.csv` with columns starting `experiment,experimentName,topology,bpMix,articleId,...meanNodeMPR...kStar_network...` — **different schema from Phase 2**. Parser `thesisExperiment/scripts/parse_results.js`.

---

## 2. Experiment design

Climate/geoengineering **IFD** campaign (Pfeffer / Debnath framing). Not a CIKM crime-news reprint. H/He reuse only the CIKM/LASS homogeneous vs heterogeneous **design**, not their articles/personas.

### 2.1 Factorial grid (thesis cells)

```
8 topologies
× {12 homo personas | 6 hetero mixes}
× {T2c continuous | T2d dual}
× 6 core articles
× N=1
= 1728 cells
```

Arithmetic:

- T-H: 8 × 12 × 2 modes = **192 configs** × 6 articles = **1152 cells**
- T-He: 8 × 6 × 2 = **96 configs** × 6 = **576 cells**
- Total configs **288**, cells **1728**

Prefixes: `T2c_` = `miScoringMode: "continuous"`; `T2d_` = `"dual"`. Arm in name: `_H_` vs `_He_`. Topology token immediately after arm. Rest = persona id (H) or `mix_0{0-5}` (He).

Example names: `T2c_H_linear_chain_climate_scientist`, `T2d_He_polarized_mix_00`.

### 2.2 Eight topologies

`linear_chain`, `ring`, `random_er`, `small_world`, `scale_free`, `echo_chamber`, `polarized`, `hierarchical`.

Typical T2 node count: `topologyParams.numNodes: 8`. Chains: high reinterpret (`forward 0.1 / reinterpret 0.85 / drop 0.05`, `trustThreshold 0.08`). Graphs: `forward 0.35 / reinterpret 0.5 / drop 0.15`, `trustThreshold 0.15` (see `T2d_He_polarized_mix_00.json`). `maxTicks: 8`, `nodeParams.maxHops: 8`, `maxInboxSize: 4`, `activityPattern: "always"`, `seedNodes: ["node_0"]` (drip), `graphRandomSeed: 42`, `relationEvolution: true`, `trustDelta: 0.05`. `defaultModel`/`auditorModel`: `gpt-4o-mini`. `articlesPath`: `thesisExperiment/articles/merged.json`. `outputRoot`: `thesisExperiment/runs_phase2`.

**Polarized / echo / hierarchical** use `defaultPersonaAssignment: "by_cluster"` and `personasByCluster` pools that include extra persona ids (`conspiracy_peripheral_skywatcher`, `climate_action_sweden_scopex`, `platform_moderator_toxicity`, `caregiver_air_quality`) which may **not** be in the mix file. That is why the engine fallback exists (see §10). Polarized configs set `minSeedOutDegree: 2` so `node_0` is not isolated (commit `c05d99e`).

### 2.3 Scoring modes (do not mix)

**Continuous (T2c).** One auditor call per scored event (`Auditor._getContinuousScores`). Scores ∈ [0,1] per question. `computeIFD(..., "continuous")`: `cr = mean(scores)`, `mi = m * (1 - cr)` with `m =` number of GT questions (**5** on campaign articles) → headline MI typically ~0–5 float. `event.misinfoIndex` = that float. `event.ifd.mode = "continuous"`. No `ifd.dual`.

**Dual (T2d).** **Two auditor LLM calls per event**, in parallel (`Promise.all` of discrete IFD scores and continuous scores). `computeDual`: top-level IFD **mirrors discrete** (`...discrete`, `mode: "dual"`). Sidecar `event.ifd.dual = { discrete, continuous, gap, agreement }`. `gap = Math.abs(discrete.mi - continuous.mi)` in `src/Auditor.js` (absolute, not signed). `agreement` = Pearson r after mapping discrete {−1,0,+1} → {0, 0.5, 1}. Headline `event.misinfoIndex` = **discrete** MI (`missingCount + incorrectCount`, integer 0–5 for m=5).

Parser (`parse_phase2.js`):

- `meanMI` = mean of `event.misinfoIndex` on scored events → **headline**
- `meanDiscreteMI` / `meanContinuousMI` from dual sidecar or mode-appropriate field
- `meanDualGap` = mean of `event.ifd.dual.gap` (abs)
- `meanNodeMPR` = mean-of-per-node-means of `misinfoIndex` (same headline, **not interchangeable** with meanMI)
- k* discrete uses discrete MI series; k* continuous uses continuous series

**Dual gap is a scoring diagnostic, not a third ground-truth MPR.** Sidecar continuous on dual events is **not** the T2c continuous headline (different events / different campaign). ANALYSIS.md wording “discrete minus sidecar continuous” vs Auditor `Math.abs`: **stored gap is abs**. Probe example: discrete mi=5, continuous mi=3, gap=2.

### 2.4 k*

`parse_phase2.js` `kStar(events, miOf)`: tick = `ev.tick` else `ev.hops`; mean MI per tick; **first tick where mean > 3 and every later tick with data also > 3**. Censored at 8 ticks. Null = never. `kStarCensoredDiscrete` true if k equals last observed tick. Phase 1 README uses the same operational definition (`network-mean MI > 3` stays > 3). **Not** Twitter ignition time. Dual k* and continuous k* must not be added.

### 2.5 Personas (17 merged; 12 on H grid; 6 mixes on He)

`personas/merged.json` and `personas/phase2/MERGE.md`: **17** ids.

**12 homo (H grid)** — `configs/grid_phase2.json` `homoIds` / `personas/phase2/homo/<id>.json`:

- conspiracy: `conspiracy_believer`, `conspiracy_haarp_weather`, `conspiracy_depopulation`, `conspiracy_climate_piggyback`
- climate_action: `climate_action_advocate`, `climate_justice_youth`, `mitigation_first_policy`
- science_env: `environmental_concern`, `ozone_stratosphere_specialist`, `biodiversity_food_security`, `climate_scientist`, `science_journalist`

**5 extras** (in merged library + cluster pools; not H-grid columns): `conspiracy_peripheral_skywatcher`, `climate_action_sweden_scopex`, `platform_moderator_toxicity`, `caregiver_air_quality`, `hashtag_attention_communicator`.

**Phase 2 He mixes (8 unique ids each)** — `personas/phase2/hetero/mix_0{0-5}.json` (these are what T2 configs `personasPath` point at):

| mix | ids in file (order) | analysis note |
|---|---|---|
| mix_00 | conspiracy_believer, conspiracy_haarp_weather, conspiracy_depopulation, conspiracy_climate_piggyback, climate_action_advocate, climate_justice_youth, mitigation_first_policy, environmental_concern | 4 conspiracy + 4 climate/env |
| mix_01 | conspiracy_depopulation, conspiracy_climate_piggyback, climate_action_advocate, climate_justice_youth, mitigation_first_policy, environmental_concern, ozone_stratosphere_specialist, biodiversity_food_security | 2 conspiracy + 6 climate/env |
| mix_02 | climate_action_advocate, climate_justice_youth, mitigation_first_policy, environmental_concern, ozone_stratosphere_specialist, biodiversity_food_security, climate_scientist, science_journalist | **0 conspiracy** + 8 science/climate |
| mix_03 | mitigation_first_policy, platform_moderator_toxicity, ozone_stratosphere_specialist, climate_action_sweden_scopex, biodiversity_food_security, climate_scientist, conspiracy_believer, climate_justice_youth | 1 conspiracy + extras |
| mix_04 | climate_action_advocate, conspiracy_peripheral_skywatcher, science_journalist, biodiversity_food_security, climate_action_sweden_scopex, platform_moderator_toxicity, ozone_stratosphere_specialist, conspiracy_depopulation | conspiracy-adj extras |
| mix_05 | climate_scientist, climate_action_advocate, conspiracy_climate_piggyback, biodiversity_food_security, platform_moderator_toxicity, science_journalist, ozone_stratosphere_specialist, conspiracy_peripheral_skywatcher | conspiracy-adj extras |

**GOTCHA.** `personas/DEBNATH_MAPPING.md` mix_00..11 are **Phase 1 sliding windows** (mix_02 there still contains conspiracy_depopulation). **Do not use DEBNATH_MAPPING.md mix lists for Phase 2 He.** Use `personas/phase2/hetero/` and `grid_phase2.json` `heteroMixes`.

### 2.6 Articles (24 merged; 6 in the 1728 grid)

`articles/articles.json` **12** ids: `scopex_2017`, `chemtrails_gates_2018_2021`, `sai_geoengineering`, `spice_uk_cancelled`, `paris_agreement`, `climate_consensus`, `glaciers_retreat`, `polar_bears`, `co2_fertilization`, `sea_level_rise`, `net_zero`, `attribution_extremes`. Each has **5** GT questions.

`articles/merged.json` **24** = those 12 + extras: `paris_agreement_2015`, `consensus_97_percent`, `glacier_retreat`, `polar_bears_sea_ice`, `co2_plant_food`, `sai_solar_geoengineering`, `net_zero_2050`, `extreme_weather_attribution`, `climatefever_polar_bears`, `climatefever_co2_claims`, `volcanic_vs_human_co2`, `great_barrier_reef_bleaching`.

**6 core articles in every T2 cell** (`grid_phase2.json` `coreArticles` / every T2 config `seedArticles`):

`scopex_2017`, `chemtrails_gates_2018_2021`, `sai_geoengineering`, `paris_agreement`, `climate_consensus`, `polar_bears`

**D-net uses only 2:** `scopex_2017`, `chemtrails_gates_2018_2021`.

Probes use `scopex_2017` only; probe chains are 2 nodes × 1 tick (`_probe_p2_dual.json`).

### 2.7 D-net (not one of the eight topologies)

Custom graph from `data/derived/debnath_hashtag_cascade.json` embedded into Dnet configs (`topology: "custom"`, `nodes` + `edges` arrays in the json; 63/228). Seed `["user_chemtrails_hub"]`. Homo personas: `personas/phase2/homogeneous_conspiracy.json` (every seat `conspiracy_believer`). Mixed: `personas/phase2/mixed_graph.json`. `maxTicks: 8`. Output still `runs_phase2`. Node files are `user_*.json`, not `node_*.json`. `results_*.json` only for the two seed articles. `nodeSummaries` has 63 keys.

### 2.8 Probes (IFD field check; not in 1728)

Canonical (from `runs_phase2/_status/probe_ifd.md`, recheck 2026-09-19T09:30:06Z, **PASS**):

| mode | runDir | calls | dual fields |
|---|---|---:|---|
| continuous | `probe_p2_continuous_2026-09-19_02-50-40` | 2 | n/a; headline `ifd.mode=continuous` (`mi=1.5`) |
| dual | `probe_p2_dual_2026-09-19_02-50-19` | 3 | `ifd.dual.discrete.mi=5`, `ifd.dual.continuous.mi=3`, `gap=2` |

Siblings with usage>0: `probe_p2_continuous_2026-09-19_02-49-15` (2), `probe_p2_dual_2026-09-19_02-49-23` (2), `probe_T2c_He_2026-09-19_02-51-00` (2), `probe_T2c_He_2026-09-19_04-14-23` (1), `probe_T2d_He_2026-09-19_02-51-59` (2). **Ignore** `probe_dnet_custom_2026-09-18_16-08-07` (Sep 18 abort, calls=0) for IFD confirmation. Parser still emitted a `probe_dnet_custom` row in `all_rows.csv` (see §4).

---

## 3. Counts (official parse)

**Source of truth:** `thesisExperiment/results_phase2/summary.json` `generatedAt=2026-09-19T05:14:37.163Z`.

```
nRows: 1741
nTH: 1152
nTHe: 576
nContinuous: 864
nDual: 864
nDead: 292
nHatchedDeadAfterLlm: 292
nExpectedCells: 1728
nMissingCells: 0
nInProgressCells: 0
nDnetRows: 8
inProgressConfigs: []
dnetSimPending: false
thesisGrade: false
isolation: "results_phase2 only"
meanMPR_TH_continuous: 0.8643
meanMPR_TH_dualHeadline: 1.6814
harvestRule: latest complete run with llmCalls>0 per experiment
```

Slice block (same file):

| slice | configs | cells parsed | hatchedDead | harvest |
|---|---:|---:|---:|---|
| T2c_H | 96/96 | 576/576 | 96 | fully_harvested |
| T2d_H | 96/96 | 576/576 | 98 | fully_harvested |
| T2c_He | 48/48 | 288/288 | 50 | fully_harvested |
| T2d_He | 48/48 | 288/288 | 48 | fully_harvested |

96+98+50+48 = **292**. MASTER_DONE.json `nHatchedDeadAfterLlm: 292`, `officialHarvestAt: "2026-09-19T05:14:37.163Z"`. Dnet usage in MASTER_DONE: c_H 3273, c_He 2382, d_H 4941, d_He 3620.

**Hatch 290 vs 292.** `analysis_full/README.md` and `key_numbers.json` explicitly: live `dead_cells.csv` has **292**; “brief said 290”. MASTER.md live-disk recheck paragraph claimed 290 / `summary.json` 05:27:59.674Z — **that stamp is not the current summary.json**. Prefer **292**. Range the user asked to remember: ~290–292; official ledger **292**.

**`all_rows` 1741 = 1728 thesis + 8 Dnet + 5 probes.** Probe experimentNames in all_rows: `probe_T2c_He`, `probe_T2d_He`, `probe_dnet_custom`, `probe_p2_continuous`, `probe_p2_dual` (one article-row each). Those 5 have empty `slice`/`arm`. all_rows hatchStatus: live 1444 + hatched_dead_after_llm **297** (= 292 thesis dead + 5 probe nScored=1 rows). `dead_cells.csv` is thesis-only (arm H or He) → 292. All 292 have `llmCalls>0`. dead nScored: 232 zeros + 60 ones.

**Live cells (nScored>1 / dead=false) computed from current CSVs:**

| arm × mode | n live | meanMI | meanNodeMPR |
|---|---:|---:|---:|
| H continuous | 480 | 0.864338… → 0.8643 | 0.863028… |
| H dual | 478 | 1.681380… → 1.6814 | 1.683907… |
| He continuous | 238 | 1.019249… → 1.0192 | 1.013978… |
| He dual | 240 | 2.079979… → 2.0800 | 2.073732… |

576−96=480; 576−98=478; 288−50=238; 288−48=240.

**missing_cells.csv:** 0 bytes (no header). `nMissingCells=0`.

**Dnet 4/4 configs, 8 article-rows, dead=0** (all nScored ≫ 1). Selected runDirs in all_rows: `Dnet_c_H_conspiracy_2026-09-19_02-49-31`, `Dnet_c_He_mixed_2026-09-19_04-05-50`, `Dnet_d_H_conspiracy_2026-09-19_02-49-31`, `Dnet_d_He_mixed_2026-09-19_04-07-40`. Duplicate earlier dirs exist (`…02-49-25`, `…04-07-50`, `…04-10-09`).

**`dnet_manifest.json` gotcha:** records He runs `failed: true` and top-level `"aborted": "real_api_unavailable"` with usage lines still populated. **Do not treat as incomplete.** MASTER_DONE + metadata.status `complete` + calls>0 + parse nDnetRows=8 win.

TH unique experimentNames: 192. THe: 96. Unique in all_rows: 297 (= 192+96+4 Dnet+5 probes).

---

## 4. Table schemas and how to join

### 4.1 Canonical parse tables (`results_phase2/tables/`)

**Shared wide schema** (TH_rows, THe_rows, continuous, dual_discrete, dead_cells, all_rows):

```
runDir, experimentName, slice, arm, topology, rest, miScoringMode, articleId,
status, llmCalls, nEvents, nScored, dead, meanMI, meanNodeMPR, maxMI,
meanDiscreteMI, meanContinuousMI, meanDualGap, meanAgreement,
kStarDiscrete, kStarContinuous, kStarCensoredDiscrete, hatchStatus, hatchNote
```

`parse_phase2.js` `rowFromRun` builds exactly these keys. `toCsv` uses `Object.keys(rows[0])` order as above.

**`dual_gap.csv` is NOT the wide schema.** Columns:

```
experimentName, articleId, topology, meanDualGap, meanAgreement, meanDiscreteMI, meanContinuousMI
```

Same 864 dual thesis rows; join to `dual_discrete.csv` on `(experimentName, articleId)`.

**Row counts (header not included):** TH 1152, THe 576, continuous 864, dual_discrete 864, dual_gap 864, dead_cells 292, all_rows 1741, missing_cells 0.

### 4.2 How tables are sliced (`parse_phase2.js`)

```
th   = arm==="H" && !experimentName.startsWith("probe")
the  = arm==="He"
cont = miScoringMode==="continuous" && (arm H or He)
dual = miScoringMode==="dual" && (arm H or He)
dead = (arm H or He) && dead
all  = every selected completed experiment × seedArticles
```

`parseName`: `/^(T2c|T2d)_(H|He)_(.+)$/` then topology = first of TOPOLOGIES that equals restAll or is a prefix + `_`. `rest` = persona or mix id. Dnet names do not match → `arm=null`, `topology` falls back to `meta.config.topology` (`custom`).

**Live vs hatched**

- `hatchStatus==="live"` ⇔ not dead ⇔ `nScored > 1`
- `hatchStatus==="hatched_dead_after_llm"` ⇔ dead and `llmCalls>0`
- `hatchStatus==="hatched_api_fail_or_unscored"` ⇔ dead and llmCalls==0 (none in this harvest’s dead_cells)

Analysis live filter: `plot_phase2.py` `live(df) = ~df["dead"]`. RESULTS.md text: “live cells (`nScored > 1`)”. Equivalent on these tables.

**Join keys**

| grain | key |
|---|---|
| cell | `(experimentName, articleId)` |
| config | `experimentName` |
| topology×arm×mode | `topology, arm, miScoringMode` |
| persona (H) | `rest` (equals persona id) |
| mix (He) | `rest` (`mix_00`…) |
| run directory | `runDir` (timestamped folder under `runs_phase2/`) |

Join T2c vs T2d **paired cells**: same `topology + rest + articleId`, different `miScoringMode`. analysis_full C2: n paired live H = **398**; C3 paired live He = **198**. Dead-on-one-side must not be filled with 0.

Join Phase 1 tables: **don’t**, except qualitative methods. Different `meanNodeMPR` / `kStar_network` definitions and discrete-only IFD.

### 4.3 `analysis_phase2/tables/` (derived)

| file | columns | rows (incl header) |
|---|---|---:|
| `topology_arm_mode.csv` | topology,arm,n_cells_continuous,n_live_continuous,n_dead_continuous,dead_rate_continuous,meanMI_continuous,meanNodeMPR_continuous,kStar_rate_continuous,n_cells_dual,n_live_dual,n_dead_dual,dead_rate_dual,meanMI_dualHeadline,meanNodeMPR_dualHeadline,kStar_rate_dual,meanDualGap,meanAgreement | 17 |
| `persona_mpr.csv` | persona,family,n_cells,n_live_continuous,n_dead_continuous,continuous_MPR,n_live_dual,n_dead_dual,discrete_MPR,kStar_rate_continuous,kStar_rate_dual | 13 |
| `persona_family_mpr.csv` | family,n_personas,n_live_continuous,continuous_MPR,n_live_dual,discrete_MPR,kStar_rate_continuous,kStar_rate_dual | 4 |
| `persona_topology_mpr.csv` | persona,family,topology,n_live_continuous,n_dead_continuous,continuous_MPR,continuous_meanNodeMPR,n_live_dual,n_dead_dual,discrete_MPR,discrete_meanNodeMPR,kStar_rate_continuous,kStar_rate_dual | 97 |
| `mix_mpr.csv` | mix,mix_note,n_live_continuous,continuous_MPR,n_live_dual,discrete_MPR,kStar_rate_continuous,kStar_rate_dual | 7 |
| `mix_topology_mpr.csv` | mix,mix_note,topology,n_live_continuous,continuous_MPR,n_live_dual,discrete_MPR | 49 |
| `article_mpr.csv` | articleId,arm,n_live_continuous,continuous_MPR,n_live_dual,discrete_MPR | 13 |
| `dnet_cells.csv` | experimentName,miScoringMode,articleId,dead,meanMI,meanNodeMPR,meanDiscreteMI,meanContinuousMI,meanDualGap,kStarDiscrete,kStarContinuous,nScored | 9 |

### 4.4 `analysis_full/tables/` (C1–C5)

See `analysis_full/README.md`. Notable: `c1_same_mode_h_vs_he_by_topology.csv`, `c1_same_mode_h_vs_he_by_topology_article.csv`, `c2_homo_t2c_vs_t2d_by_topology.csv`, `c2_homo_t2c_vs_t2d_paired_live_cells.csv`, `c3_hetero_*`, `c4_cross_mode_by_topology.csv`, `c5_pooled_cells.csv`, `c5_pooled_vs_topology_equal.csv`, `c5_dnet_cells.csv`, `ifd_dual_agreement_gap.csv`, plus copies of persona/mix/article/topology summaries. `topology_arm_mode.csv` here adds `maxMI_*` columns vs analysis_phase2.

---

## 5. Raw run schema

### 5.1 Directory layout (T2 8-node)

```
runs_phase2/<experimentName>_<YYYY-MM-DD_HH-MM-SS>/
  metadata.json
  state.json
  graph_topology.json
  human_eval_template.csv
  results_<articleId>.json     # 6 files for T2; 2 for Dnet; 1 for probes
  nodes/node_0.json … node_7.json
```

Dnet: `nodes/user_chemtrails_hub.json` … **63** `user_*.json`. Same metadata/state/results pattern; `results_scopex_2017.json` + `results_chemtrails_gates_2018_2021.json` only.

### 5.2 `metadata.json`

Top-level keys observed: `experimentId`, `status`, `timestamp`, `config`, `llmUsage`, `results`.

**`metadata.experimentName` is often null.** Parser uses `meta.experimentName || meta.config.experimentName || dirname-without-timestamp`. Always read `config.experimentName`.

`status`: `complete` (parser also accepts `completed`).

`config` keys (T2 linear example, 31 keys): `topology`, `topologyParams`, `maxTicks`, `defaultModel`, `auditorModel`, `auditorQuestions`, `miScoringMode`, `enableBeliefs`, `enableFrameAnalysis`, `enableProvenance`, `provenanceRecencyDiscount`, `enableStrategicAgents`, `enableNetworkEvolution`, `networkEvolutionParams`, `enableOpinionDynamics`, `opinionDynamicsParams`, `enableInstitutionalTrust`, `institutionalTrustParams`, `competitiveGroups`, `interventions`, `nodeParams`, `seedArticles`, `seedNodes`, `personasPath`, `articlesPath`, `outputRoot`, `graphRandomSeed`, `_description`, `experimentName`, `defaultPersonaAssignment`, `pfeffer`.

Dnet config extras: `nodes`, `edges`, `_honesty`. `topology: "custom"`. No `topologyParams`.

`llmUsage`: `calls`, `promptTokens`, `completionTokens`, `totalTokens`, `errors`, `model`, `estimatedUsd`.

`results.<articleId>`: small sidecar per article (metrics pointer / summary). Dual runs also expose `metrics.ifdDualMetrics` inside `results_*.json`.

Example usage: `T2c_H_linear_chain_climate_scientist_2026-09-19_02-53-23` calls=80; `T2d_H_echo_chamber_conspiracy_believer_2026-09-19_03-07-58` calls=1692; Dnet_c_H selected dir calls=3273; Dnet_d_H=4941.

### 5.3 `state.json`

`experimentId`, `phase`, `status`, `propagation.{completedArticles,currentArticle,currentTick}`, `audit.{completedArticles,currentArticle}`, `error`, `lastUpdated`. T2 complete: `completedArticles` length 6. Dnet: length 2. Probe: length 1.

### 5.4 `nodes/node_*.json` (T2) / `nodes/user_*.json` (Dnet)

`nodeId`, `personaId`, `modelId`, `relations` (neighborId → trust), `params` (trustThreshold, actionWeights, relationEvolution, trustDelta, maxHops, strippedProperties, activityPattern, edgeDeletionThreshold, maxInboxSize — Dnet sample lacked strippedProperties/edgeDeletionThreshold), `inbox`, `history[]`, `stats.{received,forwarded,reinterpreted,dropped,dumped}`.

**History event keys:** `tick`, `articleId`, `sourceNodeId`, `hops`, `action`, `contentIn`, `contentOut`, `misinfoIndex`, `frameAnalysis`, `reason`, `chainTrust`, `provenance`, `timestamp`, and usually `ifd`.

Parser scores events with `misinfoIndex != null` filtered to `articleId`. Collects **all nodes’ histories**.

**IFD object**

Continuous: `{ mi, cr, mr, ir, cms, ie, scores, mode:"continuous" }`

Dual: same top-level **discrete** fields + `mode:"dual"` + `dual:{ discrete:{… mode:"discrete"}, continuous:{…}, gap, agreement }`.

Dnet sample `user_srm_peri_1.json` history[0] in one dump **lacked `ifd`** while still having `misinfoIndex` — parser still uses `misinfoIndex` for meanMI; dual sidecar fields then null. Dual Dnet `results_*.json` still has `ifdDualMetrics`.

### 5.5 `results_<articleId>.json`

Top-level: `nodeSummaries` (8 T2 keys / 63 Dnet keys / 2 probe keys), `metrics`, `provenanceMetrics`, `networkEvolution`.

`nodeSummaries.<id>`: 5 fields each (not expanded here; includes per-node MI summaries).

`metrics` typical: `informationHalfLife`, `cascadeReachVsFidelity` (list), `networkMIOverTime` (len=8 T2/Dnet; len=1 probe), `giniCoefficient`, `criticalMassThreshold`, `structuralVirality`, `frameMetrics`, `ifdMetrics`, `ifdOverTime`, `personaIFD`. Dual adds `ifdDualMetrics`, `personaIFDDual`.

### 5.6 `graph_topology.json`

Adjacency/trust dump used by compare (`extractSimulatedMetrics`). Dnet compare uses these run dirs (nSim=16 cascades = 4 configs × 2 articles × ? wait: summary.md says “Simulated runs matched … **8**” and “Simulated articles compared: **16**”. 4 Dnet configs × 2 articles = 8 rows in all_rows; structural extract may count each article cascade → **16** in avgSimMetrics. Copy from `debnath_compare.json` / `summary.md`: nSimRuns language “8” vs “16 cascades”. **summary.md table uses simulated mean over 16 cascades.** Do not invent a third count.

---

## 6. Key findings — `analysis_phase2/SUMMARY.md` + `RESULTS.md`

Copied from **current** files after sibling re-plot. Harvest stamp in SUMMARY: `2026-09-19T05:14:37.163Z`. Cell headline = `meanMI` on live cells. Discrete MPR = T2d headline. Continuous MPR = T2c headline. **Not averaged.**

### 6.1 Headlines

| arm | continuous MPR (T2c) | n live cont | dual-discrete MPR (T2d) | n live dual | mean dual gap |
|---|---:|---:|---:|---:|---:|
| H | 0.8643 | 480 | 1.6814 | 478 | 0.8804 |
| He | 1.0192 | 238 | 2.0800 | 240 | 1.1145 |

He−H same-mode only: continuous **0.1549**, dual-discrete **0.3986**. meanNodeMPR (not interchangeable): H cont 0.8630, H dual 1.6839, He cont 1.0140, He dual 2.0737.

Dual-discrete sits higher than continuous on every topology in this harvest — **scoring-mode effect**, not “more misinformation in a shared unit.”

### 6.2 Topology (H)

| topology | n live dual | discrete MPR | k* dual | dead dual | n live cont | continuous MPR | k* cont | dead cont | dual gap |
|---|---|---:|---|---|---|---:|---|---|---:|
| linear_chain | 68/72 | 1.6127 | 14.7% | 5.6% | 62/72 | 0.9129 | 14.5% | 13.9% | 0.9672 |
| ring | 61/72 | 1.6402 | 18.0% | 15.3% | 65/72 | 0.9160 | 15.4% | 9.7% | 0.8803 |
| random_er | 56/72 | 1.7809 | 19.6% | 22.2% | 57/72 | 0.8736 | 14.0% | 20.8% | 0.9680 |
| small_world | 59/72 | 1.5977 | 20.3% | 18.1% | 56/72 | 0.7215 | 12.5% | 22.2% | 0.8255 |
| scale_free | 57/72 | 1.7034 | 21.1% | 20.8% | 60/72 | 0.9205 | 16.7% | 16.7% | 0.8463 |
| echo_chamber | 61/72 | 1.7984 | 23.0% | 15.3% | 63/72 | 0.8490 | 12.7% | 12.5% | 0.8923 |
| polarized | 57/72 | 1.7005 | 21.1% | 20.8% | 65/72 | 0.8356 | 15.4% | 9.7% | 0.8553 |
| hierarchical | 59/72 | 1.6315 | 23.7% | 18.1% | 52/72 | 0.8751 | 11.5% | 27.8% | 0.7973 |

H continuous highest `scale_free` 0.9205, lowest `small_world` 0.7215. H dual highest `echo_chamber` 1.7984, lowest `small_world` 1.5977. **Rank order is not the same across modes.**

### 6.3 Topology (He)

| topology | n live dual | discrete MPR | k* dual | dead dual | n live cont | continuous MPR | k* cont | dead cont | dual gap |
|---|---|---:|---|---|---|---:|---|---|---:|
| linear_chain | 33/36 | 2.0852 | 24.2% | 8.3% | 32/36 | 0.8638 | 0.0% | 11.1% | 1.2960 |
| ring | 33/36 | 2.1768 | 39.4% | 8.3% | 33/36 | 0.8760 | 3.0% | 8.3% | 1.3123 |
| random_er | 29/36 | 2.0412 | 27.6% | 19.4% | 29/36 | 0.6593 | 0.0% | 19.4% | 1.1335 |
| small_world | 32/36 | 1.9096 | 28.1% | 11.1% | 31/36 | 0.7545 | 3.2% | 13.9% | 1.1049 |
| scale_free | 29/36 | 1.9924 | 31.0% | 19.4% | 30/36 | 0.8157 | 6.7% | 16.7% | 1.1058 |
| echo_chamber | 30/36 | 1.9632 | 23.3% | 16.7% | 32/36 | 1.3775 | 9.4% | 11.1% | 0.8830 |
| polarized | 26/36 | 1.8830 | 42.3% | 27.8% | 25/36 | 1.4137 | 12.0% | 30.6% | 0.8784 |
| hierarchical | 28/36 | 2.5934 | 42.9% | 22.2% | 26/36 | 1.5242 | 30.8% | 27.8% | 1.1354 |

He continuous highest `hierarchical` 1.5242, lowest `random_er` 0.6593. He dual highest `hierarchical` 2.5934, lowest `polarized` 1.8830.

Collapsed He>H is **not** “hetero buffers firestorms.” H mean mixes conspiracy (~2–3) with scientists (~0–1). He mean mixes mix_00/01 with mix_02.

### 6.4 Personas (H collapsed; from SUMMARY)

| persona | family | discrete MPR | continuous MPR | k* dual | k* cont | dead dual | dead cont |
|---|---|---:|---:|---|---|---|---|
| conspiracy_believer | conspiracy | 3.3522 | 2.4842 | 65.8% | 47.7% | 10/48 | 4/48 |
| conspiracy_haarp_weather | conspiracy | 3.3571 | 2.4829 | 70.5% | 47.5% | 4/48 | 8/48 |
| conspiracy_depopulation | conspiracy | 3.2823 | 1.9535 | 59.5% | 34.9% | 11/48 | 5/48 |
| conspiracy_climate_piggyback | conspiracy | 2.6838 | 1.9570 | 42.5% | 31.7% | 8/48 | 7/48 |
| climate_action_advocate | climate_action | 1.0665 | 0.2258 | 0.0% | 0.0% | 11/48 | 11/48 |
| climate_justice_youth | climate_action | 1.3072 | 0.2454 | 2.2% | 0.0% | 2/48 | 7/48 |
| mitigation_first_policy | climate_action | 0.7571 | 0.0464 | 0.0% | 0.0% | 5/48 | 9/48 |
| environmental_concern | science_env | 0.8359 | 0.1423 | 0.0% | 0.0% | 11/48 | 8/48 |
| biodiversity_food_security | science_env | 1.1470 | 0.2041 | 0.0% | 0.0% | 11/48 | 9/48 |
| ozone_stratosphere_specialist | science_env | 0.9639 | 0.1672 | 0.0% | 0.0% | 11/48 | 9/48 |
| science_journalist | science_env | 0.6745 | 0.0310 | 0.0% | 0.0% | 9/48 | 11/48 |
| climate_scientist | science_env | 0.7517 | 0.0120 | 0.0% | 0.0% | 5/48 | 6/48 |

Family: conspiracy discrete 3.1691 / cont 2.2194 / k* dual 59.7% / k* cont 40.5%; climate_action 1.0488 / 0.1729; science_env 0.8687 / 0.1108. Full persona×topology grid: `RESULTS.md` (do not retype here unless you need a cell; file is 230 lines).

**GOTCHA vs analysis_full paper-style table:** COMPARISONS.md persona continuous for `biodiversity_food_security` 0.2115, `ozone_stratosphere_specialist` 0.1627, `climate_scientist` 0.0130 vs SUMMARY 0.2041 / 0.1672 / 0.0120. Copy from the file you cite; do not average the two docs.

### 6.5 Mixes (He collapsed)

| mix | note | discrete | continuous | k* dual | k* cont |
|---|---|---:|---:|---|---|
| mix_00 | 4 conspiracy + 4 climate/env | 3.1321 | 1.7712 | 57.5% | 12.8% |
| mix_01 | 2 conspiracy + 6 climate/env | 2.7795 | 1.4770 | 58.5% | 9.8% |
| mix_02 | 0 conspiracy + 8 science/climate | 1.1882 | 0.2645 | 0.0% | 0.0% |
| mix_03 | 1 conspiracy + 7 other | 2.0410 | 0.8945 | 33.3% | 10.3% |
| mix_04 | 2 conspiracy-adj + 6 other | 1.6896 | 0.7021 | 20.5% | 5.3% |
| mix_05 | 2 conspiracy-adj + 6 other | 1.6713 | 1.0134 | 23.3% | 7.5% |

mix_00 vs mix_02 is the intended contrast. Not a law that “diversity always stops firestorms.”

### 6.6 Articles (SUMMARY secondary)

| article | H discrete | H continuous | He discrete | He continuous |
|---|---:|---:|---:|---:|
| scopex_2017 | 1.5390 | 0.7322 | 2.3718 | 0.7694 |
| chemtrails_gates_2018_2021 | 2.1383 | 1.3541 | 2.3885 | 1.7852 |
| sai_geoengineering | 1.3576 | 0.1974 | 1.1160 | 0.1523 |
| paris_agreement | 1.7321 | 1.3357 | 2.4591 | 1.6821 |
| climate_consensus | 2.2610 | 1.5934 | 2.8991 | 1.8896 |
| polar_bears | 1.0399 | 0.0185 | 1.1444 | 0.0415 |

### 6.7 k* / dead (SUMMARY)

| arm × mode | live | k* rate | dead rate |
|---|---:|---:|---:|
| H continuous | 480 | 14.2% | 16.7% |
| H dual-discrete | 478 | 20.1% | 17.0% |
| He continuous | 238 | 7.6% | 17.4% |
| He dual-discrete | 240 | 32.1% | 16.7% |

Hatched dead **292 / 1728 (16.9%)**. Hierarchical has more dead (few scored events) → live-only mean is **not** a clean topology effect.

### 6.8 D-net auditor MPR (RESULTS.md) — **not Twitter MPR**

| run | article | mode | discrete | continuous | dual sidecar cont |
|---|---|---|---:|---:|---:|
| Dnet_c_H_conspiracy | scopex_2017 | continuous | — | 1.7349 | — |
| Dnet_c_H_conspiracy | chemtrails_gates_2018_2021 | continuous | — | 3.3378 | — |
| Dnet_c_He_mixed | scopex_2017 | continuous | — | 0.9983 | — |
| Dnet_c_He_mixed | chemtrails_gates_2018_2021 | continuous | — | 2.5068 | — |
| Dnet_d_H_conspiracy | scopex_2017 | dual-discrete | 4.2537 | — | 2.2495 |
| Dnet_d_H_conspiracy | chemtrails_gates_2018_2021 | dual-discrete | 3.7303 | — | 3.1251 |
| Dnet_d_He_mixed | scopex_2017 | dual-discrete | 2.6880 | — | 1.1302 |
| Dnet_d_He_mixed | chemtrails_gates_2018_2021 | dual-discrete | 1.5297 | — | 1.1497 |

On D-net, **H (conspiracy-only) > He (mixed)** on both instruments and both articles. That matches composition and **does not match** naive 8-node collapsed He>H.

### 6.9 Structural Debnath compare (`debnath_compare.json` / SUMMARY / results_phase2/summary.md)

| metric | empirical hashtag graph | simulated mean (16 cascades) | 30% band match |
|---|---:|---:|---|
| depth | 4 | 2.5625 | no |
| breadth | 33 | 40.9375 | yes |
| size (info) | 61 | 53.5 | — |
| structural virality | 2.7 | 1.7963 | no |
| speed | n/a empirically | 7 ticks | — |
| meanMI | no empirical MPR | 2.5529 | **do not equate** |

Structural similarity **0.6885** (1/3 metrics within 30%). KS nReal=1 nSim=16 **underpowered**: depth D=1 p=0.1104; breadth D=0.8125 p=0.2954; virality D=1 p=0.1104. JS=1 on all three. DTFS **0.2754** `isValidated=false` (threshold 0.70). Content correlation 0.

Pfeffer observable row copies (summary.md): valence empirical 0.1097 (paper mean 0.17) vs sim mean MI 2.5529 **not Twitter MI**; identity conspiracy 0.4444 / other 0.5556 vs sim conspiracy share 0.7222; clustering n=63 meanDeg=7.2381 Q_conspiracy=0.4039 vs sim Q=0.4566; echo identityHomophily=0.864 vs sim edgeHomophily=1 identityHomophily=1; surprise held drip; temporal n/a vs 7 ticks; cross-media held.

Regenerate analysis_phase2: `python3 thesisExperiment/analysis_phase2/plot_phase2.py` (reads tables + summary.json + debnath_compare.json; writes analysis_phase2/ and results_phase2/figures/).

---

## 7. `analysis_full/` — INGESTED from `COMPARISONS.md`

Folder exists. Canonical narrative: `thesisExperiment/analysis_full/COMPARISONS.md`. Machine: `key_numbers.json`. Regenerator: `python3 thesisExperiment/analysis_full/analyze_full.py`. Exploratory SciPy is **not** campaign-replicate inference (N=1 seed; cells nested in topologies).

Harvest snapshot in COMPARISONS.md (matches official tables):

| slice | n cells | n live | meanMI | meanNodeMPR | k* rate | dead rate |
|---|---:|---:|---:|---:|---:|---:|
| T2c_H | 576 | 480 | 0.8643 | 0.8630 | 14.2% | 16.7% |
| T2c_He | 288 | 238 | 1.0192 | 1.0140 | 7.6% | 17.4% |
| T2d_H | 576 | 478 | 1.6814 | 1.6839 | 20.1% | 17.0% |
| T2d_He | 288 | 240 | 2.0800 | 2.0737 | 32.1% | 16.7% |

Hatched-dead **292** (brief 290). All kept.

### C1 same topology, homo vs hetero, SAME mode

Δ He−H by topology (copied):

| topology | T2c H | T2c He | Δ | T2d H | T2d He | Δ |
|---|---:|---:|---:|---:|---:|---:|
| linear_chain | 0.9129 | 0.8638 | -0.0491 | 1.6127 | 2.0852 | 0.4725 |
| ring | 0.9160 | 0.8760 | -0.0400 | 1.6402 | 2.1768 | 0.5366 |
| random_er | 0.8736 | 0.6593 | -0.2143 | 1.7809 | 2.0412 | 0.2602 |
| small_world | 0.7215 | 0.7545 | 0.0330 | 1.5977 | 1.9096 | 0.3120 |
| scale_free | 0.9205 | 0.8157 | -0.1048 | 1.7034 | 1.9924 | 0.2890 |
| echo_chamber | 0.8490 | 1.3775 | 0.5284 | 1.7984 | 1.9632 | 0.1647 |
| polarized | 0.8356 | 1.4137 | 0.5780 | 1.7005 | 1.8830 | 0.1825 |
| hierarchical | 0.8751 | 1.5242 | 0.6490 | 1.6315 | 2.5934 | 0.9618 |

Cell-pooled Δ(He−H): T2c **0.1549**, T2d **0.3986**. Topo-mean Δ: T2c **0.1725**, T2d **0.3974**. He>H on **4/8** continuous topologies and **8/8** dual. Continuous He>H **not uniform** (path graphs H higher; echo/polar/hier He higher). Exploratory Wilcoxon 8 topo means: T2c W=14 p=0.6406 median Δ=-0.0035 (n+=4 n-=4); T2d W=0 p=0.007812 median Δ=0.3005 (n+=8). **Not** “hetero buffers firestorms.”

### C2 same topology, H vs H, DIFFERENT MPR (T2c_H vs T2d_H)

Dual-discrete > continuous on **8/8** H topologies. Mean topo Δ(disc−cont)=**0.8201**. Paired live cells n=**398**, median Δ=0.8125. Dead one side only: T2c 80, T2d 82; both dead 16. Dual gap H live=**0.8804**. Spearman topo ranks ρ=0.095 p=0.8225 n=8.

### C3 same topology, He vs He, DIFFERENT MPR

Dual > continuous **8/8** He. Mean topo Δ=**1.0450**. Paired live n=**198**, median Δ=0.9778. Dual gap He=**1.1145**, agreement **0.6174**. IFD CR/MR/IR **not in live tables** (not invented). Spearman ρ=0.167 p=0.6932.

### C4 cross-mode (do not pool)

T2c_H vs T2d_He and T2d_H vs T2c_He. Mean topo Δ(T2d_He − T2c_H)=**1.2176**; Δ(T2c_He − T2d_H)=**-0.6476**. Signs reverse because scoring-mode gap is large. **No C4 headline by averaging those deltas.**

### C5 pooling + D-net

Pooling = concatenate live article-cells across eight 8-node topologies. **Not a physical super-graph.** D-net 63-node reported separately.

Family pooled H: T2c conspiracy **2.2194**, climate_action **0.1729**, science_env **0.1118**; T2d 3.1691 / 1.0488 / 0.8687. mix_00 vs mix_02: T2c 1.7712 vs 0.2645; T2d 3.1321 vs 1.1882. Restricting H to conspiracy family **reverses** the naive H/He story (conspiracy H ≫ overall He).

D-net H>He both instruments both seeds (numbers in §6.8). Structural DTFS failed. Exploratory MW on pooled cells (nested, not i.i.d.): T2c H vs He U=44698.5 p=1.3136e-06 median 0.04135 vs 0.5 n=480/238; T2d U=45593.5 p=7.17e-06 median 1.13395 vs 1.75 n=478/240.

Hop-wise MI / CR / MR / IR **absent** from parse tables — analysis_full omitted hop figures rather than invent.

Figures: `analysis_full/figures/fig00`–`fig22` (list in README). Notes: `notes/01`–`05`.

### 7.1 `analysis_full/PFEFFER_DEBNATH_VS_SIM.md` — INGESTED (no new LLM)

Companion JSON: `thesisExperiment/analysis_full/pfeffer_debnath_vs_sim.json` (`generatedAt=2026-09-19T12:26:19.169Z`, **`newLlmRuns: false`**). Regenerator if present: `thesisExperiment/scripts/pfeffer_debnath_vs_sim.js`. Scored **already-complete** Dnet cells only. Mapping already in `configs/phase2/Dnet_*.json`. Isolation: analysis overlay; no Phase 1 overwrite; `.env` not read for a new sim.

**Do not treat as absent.** The four Dnet cells (`Dnet_c_H`, `Dnet_c_He`, `Dnet_d_H`, `Dnet_d_He`) were already complete; this note did **not** launch LLM. Empirical object = hashtag co-occurrence `data/derived/debnath_hashtag_cascade.json` (**63 nodes, 228 directed**). Comparable sim graph = **this D-net 63-node custom topology**, not T2 n=8 generators.

Honesty copied from that file (do not violate): no empirical MPR; not a retweet/`conversation_id` cascade; 814,924 IDs not hydrated; BPs theory-faithful not HDBSCAN centroids; **temporal N/A** (`temporalAvailable: false`; no tweet clock; timestamps synthetic); cross-media held; 8 ticks ≠ Debnath skip-gram eight; `results_phase2/summary.md` averaged H+He into one sim echo row (`edgeHomophily=1`) = **homo artefact** — this note **splits** H vs He.

#### Persona-id match **56/63** (7 type-only mismatches)

`mapping.nMapped=63`, `nExactPersonaMatch=56`, `nMismatch=7`. Conspiracy / climate-action / environmental-concern **types match nodes already in Dnet**. Homo Dnet overwrites **every** seat to `conspiracy_believer`. Mixed `personaId` is the seat used at run time; reconstruct `user_profiles[].intended_debnath_bp` is the hashtag→BP rule.

Type counts (copied):

| Layer | conspiracy | climate action | environmental | expert / other |
|---|---:|---:|---:|---:|
| Empirical hashtag **cluster identity** | 28 (chemtrails 26 + piggyback 2) | 19 (climate_action 16 + geo 3) | 14 | 2 expert |
| Reconstruct **intended BP family** | 28 | 19 (`climate_action_advocate` 18 + `mitigation_first_policy` 1; `#ipcc` already `climate_scientist`) | 13 remaining env BPs after mitigation | 3 (`climate_scientist`×2 + `science_journalist`) |
| Mixed Dnet **persona family** | 28 | 19 | 13 | 3 |
| Homo Dnet | 63 | 0 | 0 | 0 |

Seven seats stay in the same Debnath **type** but use a coarser mixed-library id (`†` in the full 63-row map in that MD):

| Node | Hashtag | Reconstruct intended BP | Mixed Dnet `personaId` | Type still match? |
|---|---|---|---|---|
| `user_depopulation_amp` | `#depopulation` | `conspiracy_depopulation` | `conspiracy_believer` | yes (conspiracy) |
| `user_climateaction_piggyback_amp` | `#climateaction` (piggyback) | `conspiracy_climate_piggyback` | `conspiracy_believer` | yes (conspiracy) |
| `user_climateaction_piggyback_peri_1` | `#climateaction` (piggyback) | `conspiracy_climate_piggyback` | `conspiracy_believer` | yes (conspiracy) |
| `user_biodiversity_hub` | `#biodiversity` | `biodiversity_food_security` | `environmental_concern` | yes (environmental) |
| `user_biodiversity_peri_1` | `#biodiversity` | `biodiversity_food_security` | `environmental_concern` | yes (environmental) |
| `user_foodsecurity_amp` | `#foodsecurity` | `biodiversity_food_security` | `environmental_concern` | yes (environmental) |
| `user_mitigation_amp` | `#mitigation` | `mitigation_first_policy` | `climate_action_advocate` | family yes; **cluster** is environmental |

Seed: `user_chemtrails_hub` (`#chemtrails`, `conspiracy_believer`). Articles scored here: `scopex_2017`, `chemtrails_gates_2018_2021`. Full 63-row map stays in that MD — do not invent missing seats.

Empirical identity mix: conspiracy **0.4444** (28/63) / other **0.5556**. Intended BP mix is **12 ids**, not 3. Averaged compare `conspiracyShare=0.722` is H+He pooled, not a third mix. Identity on the 63-node graph is **majority non-conspiracy (55.6%)**; treating D-net as a chemtrails-only firestorm is the **H cell**, not Debnath’s three discourse types.

#### Where observables were applied

**(a) Empirical structure, before simulation.** Metrics on `debnath_hashtag_cascade.json` only (no auditor scores).  
**(b) Simulated cascades, after existing Dnet runs.** Same 63/228 topology. Primary dirs (duplicates `04-07-50`, `04-10-09`, `02-49-25` **not** used):

| Cell | Mix | MI mode | Primary `runDir` |
|---|---|---|---|
| Dnet_c_H | homo conspiracy | continuous | `Dnet_c_H_conspiracy_2026-09-19_02-49-31` |
| Dnet_c_He | mixed Debnath BPs | continuous | `Dnet_c_He_mixed_2026-09-19_04-05-50` |
| Dnet_d_H | homo conspiracy | dual | `Dnet_d_H_conspiracy_2026-09-19_02-49-31` |
| Dnet_d_He | mixed Debnath BPs | dual | `Dnet_d_He_mixed_2026-09-19_04-07-40` |

**H and He share identical edge sets.** Clustering coefficients therefore match empirical structure. Homophily and conspiracy-cut modularity **change with labels**. JSON `structureNote`: clustering identical; homophily and Q differ because persona labels differ.

#### Clustering is **pre-sim** (not a sim result)

Transitivity **0.3146** / local clustering **0.5153** / mixed-label Q **0.4039** live on the hashtag graph *before* any LLM call. MD rounds 0.315 / 0.515 / 0.404. D-net **copies** that graph; it does not grow clusters. T2 8-node graphs are **not** this measurement.

JSON `empiricalPfeffer.clustering` / graph: n=63, 228 directed, `nUniqueUndirectedEdges=171`, `meanUniqueDegree=5.4286` (MD 5.43), `hubUniqueDegree=33` (`chemtrails_hub`), directed-incidence `meanUndirectedDegree=7.2381` (MD 7.24; bidirected pairs counted twice; campaign `compare_phase2` number), `maxUndirectedDegree=53` (stub incidence, ≠ unique-neighbour 33), `nWedges=1211`, `nClosedTriads=381`, `hubShareOfStubs=0.1162`. Sim cells copy transitivity 0.3146 / local 0.5153 / meanUndirectedDegree 7.2381. Q **0.4039** on mixed labels; Q **0.4566** (MD 0.457) if every node labelled conspiracy (H). Not Watts–Strogatz generative clustering; not retweet triadic closure; n=63 ≠ Outlook #4 hundreds of neighbours.

#### Echo is **label-dependent** (do not pool H+He)

Empirical: identity (cluster) homophily **0.8728** (MD 0.873), BP-family **0.8377** (MD 0.838), exact-persona **0.5439** (MD 0.544). Sparse cross-cluster bridges at trust 0.32 (p0210-style).

Sim **He** (mixed labels on same edges): identity homophily **0.8377**, persona **0.636**, family **0.8377**. Sim **H**: identity **1.0** / persona **1.0** / family **1.0** **by construction**. Mixed sim reproduces block echo; homo sim **cannot** measure echo (every edge same-persona). `summary.md` “sim homophily=1” is **not** the mixed-graph result.

#### Temporal **N/A** empirically

JSON `temporal.available=false` / reason: hashtag co-occurrence has no tweet clock; timestamps synthetic. Sim: held **8 ticks / 8 hops**, always-on, inbox 4. All four primary cells: `maxTickObserved=8`, **61/63** nodes reached. Cannot recover half-life, inter-arrival, or SCoPEx April 2017 dynamics. Ticks ≠ hours. k\* is a thesis rule, not a Pfeffer statistic.

Surprise held drip: `seedNodes: [user_chemtrails_hub]` only. Paper-quoted SCoPEx April 2017 ~8k interactions/day (~+300% vs Feb) is a **citation**, not a reconstructed series (`reconstructedShockSeries: false`). Cross-media **held**. Binary/Outlook #2: engine ternary; JSON action shares forward ~0.33–0.37, reinterpret ~0.46–0.53, drop ~0.13–0.17; not Schelling binary; ablation not run.

Valence is **proxy-to-auditor, never MPR-to-MPR**. Paper toxicity mean 0.17 / severe 0.12; hashtag prior proxy 0.1097. Dual vs continuous must not be averaged. Dual discrete headline does **not** preserve continuous article order on He.

#### Primary sim MI (auditor only; copied)

| Cell | Article | mean MI | n scored | k\* (mean MI>3, stays) | n nodes reached |
|---|---|---:|---:|---:|---:|
| Dnet_c_H | scopex_2017 | 1.735 | 970 | — | 61 |
| Dnet_c_H | chemtrails_gates_2018_2021 | 3.338 | 984 | 2 | 61 |
| Dnet_c_He | scopex_2017 | 0.998 | 591 | — | 61 |
| Dnet_c_He | chemtrails_gates_2018_2021 | 2.507 | 1035 | — | 61 |
| Dnet_d_H | scopex_2017 | 4.254 | 1076 | 2 | 61 |
| Dnet_d_H | chemtrails_gates_2018_2021 | 3.730 | 749 | 4 | 61 |
| Dnet_d_He | scopex_2017 | 2.688 | 407 | 7 | 61 |
| Dnet_d_He | chemtrails_gates_2018_2021 | 1.530 | 1027 | — | 61 |

JSON unrounded means: c_H 1.7349 / 3.3378; c_He 0.9983 / 2.5068; d_H 4.2537 / 3.7303; d_He 2.688 / 1.5297.

Structural compare (already in `debnath_compare.json`, nReal=1): empirical depth 4 / breadth 33 / size 61 / SV 2.7 vs sim means depth 2.56 / breadth 40.9 / size 53.5 / SV 1.80. DTFS 0.275, `isValidated=false`. That table is **cascade-shape**, not a Pfeffer factor.

Highlights to keep in later prose: (1) clustering pre-sim, (2) echo label-dependent, (3) identity mix majority non-conspiracy, (4) valence proxy≠MPR, (5) surprise/temporal held or missing, (6) hub unique degree 33 is not Outlook #4 scale, (7) larger graph = D-net 63 not T2 n=8.

---

## 8. Debnath

### 8.1 What the empirical object is

File: `thesisExperiment/data/derived/debnath_hashtag_cascade.json`  
schema `thesisExperiment.debnath_hashtag_cascade.v1`  
`kind: hashtag_cooccurrence`  
`notARetweetCascade: true`  
`generatedFallback: false`  
`empiricalMPR: false`  
`temporalAvailable: false`  
`tweet_ids: []` (length 0)  
`user_profiles`: **63**  
`retweets`: **228** (importer **edge container**, not observed RTs)  
`cooccurrence`: 171  
seed user `chemtrails_hub` / `#chemtrails`  
edge_semantics `hashtag_cooccurrence_same_cluster`

Reconstruct report (2026-09-19T10:21:34.147Z): clusters encoded `chemtrails 26, climate_action 16, environmental 14, geo 3, piggyback 2, expert 2`. Follower counts on fallback nodes are **Figure 2 illustrative bands**, not scraped profiles.

### 8.2 Hydration is impossible (do not retry without new IDs + bearer)

Attempts (`debnath_reconstruct_report.md` / `analysis_phase2/HYDRATION.md`):

- Mendeley `10.17632/546hsym93p.1` tweet-ID dump: Files API HTTP 200 body error 400 / Elsevier 404. Landing HTML only.
- OSF `osf.io/75ye3` `dataset.csv` ~662MB: streamed **5000 CSV records**; `tweet_id` Excel scientific notation (`1.00048E+18`); **usable digit IDs = 0**. Text/user fields discarded after hashtag extract. Records with text 2158; with ≥1 hashtag **987**; distinct hashtags **564**; tweets with ≥2 documented tags **361**; documented tag-pairs **65**; directed edges with OSF count>0 **48**. OSF counts **annotate** edges (`osfSampleCount`); **do not add nodes**.
- Twitter/X bearer **absent** → hydrate did not run; IDs not invented.
- GitHub `Ramit1201/geoeng` at `data/debnath_geoeng/`: codes (`hashtag_ext`, skip-gram, NRC, Perspective), **not tweets**.
- Cannot recover 814,924 IDs; cannot rebuild retweet/`conversation_id` cascades; cannot re-run HDBSCAN on 814k tweets.

`compare_phase2.js` was **not** re-run solely to attach OSF counts. **Do not wipe `simPending=false`.** Dnet configs not rewritten (topology unchanged).

### 8.3 Debnath’s “eight”

STAR Methods word2vec skip-gram **context window of eight words** in a tweet (`p_together` with “chemtrails”). Public R uses `unnest_tokens(..., n=10)` as implementation detail; **paper says eight**. Experiment **8 hops/ticks ≠ that window**.

### 8.4 Dnet mapping

Homo: every node `conspiracy_believer`. Mixed: cluster+keyword map into `mixed_graph.json`. Simulation seeds are thesis articles, not tweet text. `article_text` in cascade JSON is an importer placeholder.

Do **not** equate sim MI with Twitter MPR. Debnath reports toxicity/NRC/embeddings/hashtag nets — not 0–5 MPR.

---

## 9. Pfeffer 2014 vs thesis remapping

Paper: Pfeffer, Zorbach & Carley (2014) *Understanding online firestorms*, J. Marketing Communications 20(1–2):117–128. Outlook lists **seven** interrelated factors:

1. Speed and volume of communication  
2. Binary choices (like/share/retweet; Schelling)  
3. Network clusters  
4. Unrestrained information flow  
5. Lack of diversity  
6. Cross-media dynamics  
7. Network-triggered decision processes  

Thesis operational six knobs (`pfeffer_mapping.md`) + held **cross-media** as seventh observable (`pfeffer_observables.md`): valence, surprise, identity, clustering, echo, temporal, cross-media.

| Observable | closest 2014 | engine | Phase 2 status |
|---|---|---|---|
| valence | affective character (definition, not numbered) | articles + persona tone | varied; **not Twitter MI** |
| surprise | #1 speed/volume | `seedNodes` | **held drip** `node_0` |
| identity | #5 lack of diversity | personas / mixes | swept H vs He; measured D-net |
| clustering | #3 | `topology` | swept 8 generators + custom |
| echo | #3+#4+#5 parts | trust / homophily | measured |
| temporal | #1 / #7 | maxTicks/hops | **held 8** |
| cross-media | #6 | none | **held, no engine knob** |

Binary choice (#2): engine is **ternary** forward/reinterpret/drop — no dedicated row; implicit in actionWeights.

`analysis_phase2/PFEFFER_FIRESTORM.md` lives on PR2 branch `cursor/pfeffer-firestorm-extract-d727` (may be absent on other checkouts). Do not dump copyrighted full text.

Pfeffer-on-Debnath **vs this harvest’s D-net** is §7.1 (`PFEFFER_DEBNATH_VS_SIM.md`): **no new LLM**; persona-id match **56/63**; clustering **pre-sim**; echo **label-dependent**; temporal **N/A**.

---

## 10. Honesty flags (keep these in any later prose)

| flag | fact |
|---|---|
| `thesisGrade` | **false** (`summary.json`) |
| N | **1** (`graphRandomSeed` 42) |
| hatched dead | **292** kept; nScored≤1 after llmCalls>0; not zeros; not mix immunity |
| polarized `minSeedOutDegree` | **2** on polarized (and echo/ER guards in `SocietyGraph.js`) so seed is not isolated |
| persona-name fallback | commit `438af78` `src/Simulation.js`: unknown `by_cluster` ids filtered to `personaMap`; `_getPersonaForNode` no longer crashes on `persona.name` when id missing (`neutral` else first map key else synthetic `{name: personaId}`) |
| 8 hops | cost cut vs CIKM 30, not Debnath protocol |
| Debnath “eight” | skip-gram window, not hops |
| dual ≠ continuous | two instruments |
| dual gap ≠ MPR | diagnostic; Auditor stores **abs** |
| no empirical Debnath MPR | do not claim Twitter match |
| gpt-4o-mini roleplay | not wild chemtrails communities |
| Phase 1 discrete 12×12 | different campaign; do not splice MPR |
| KS/JS nReal=1 | cannot support twin-validation; DTFS failed 0.70 |
| surprise / cross-media / temporal | held; empirical Debnath temporal **N/A** (`temporalAvailable: false`) |
| `PFEFFER_DEBNATH_VS_SIM` | **no new LLM**; 56/63 exact persona match; clustering pre-sim; echo label-dependent; do not pool H+He homophily |

---

## 11. Git / PRs

Repo `RajGM/LLM_Society`. **Do not overwrite PR1 title or body.**

| PR | title (as returned by `gh pr view`) | branch | state |
|---|---|---|---|
| 1 | Phase 2 live grid complete: 288 configs, 4 Dnet, real LLM harvest | `cursor/need-openai-api-key-caf6` | DRAFT OPEN |
| 2 | Pfeffer 2014 firestorm: seven Outlook factors and methods later | `cursor/pfeffer-firestorm-extract-d727` | DRAFT OPEN |
| 3 | Debnath hashtag fallback: OSF tag counts, no tweet-ID hydration | `cursor/debnath-hashtag-hydration-2187` | DRAFT OPEN |

PR1 harvest commits of record: `2a774f5` parse+compare, `6efcca1` complete grid simPending=false, `bfc5366` 292 hatched note, `1c3950c` probe IFD PASS, `b683187` analysis_phase2. Key load: `e0e0dd9`. Persona fallback: `438af78`. Polarized seed guard + master: `c05d99e`. Sep 18 aborts are historical (0 cells, missing key).

Other local/remote branches seen: `cursor/pfeffer-debnath-vs-sim-843e`, `cursor/phase2-full-analysis-e0ee`, `cursor/phase2-llm-experiments-38ac`, `cursor/phase2-dnet-sims-bdeb`, `cursor/phase2-debnath-reconstruct-d202`, slice abort branches (`phase2-t2c-h-abort-cde4`, `t2c-he-continuous-abort-4b8c`, …), `main`.

This handoff is intended for **`cursor/phase2-agent-handoff-e0ee`**. Do not push `.env` or raw `runs_phase2/**/*.json`.

---

## 12. How to re-parse, skip-complete, and where `.env` lives

### 12.1 `.env` (never dump)

Hunt order (`check_openai_key.js` `findKey`): `process.env.OPENAI_API_KEY`, `/workspace/.env`, `thesisExperiment/.env`. Slice runners also check `$HOME/.env`. Observed: both workspace and thesisExperiment `.env` present, mode **600**, length **164**, not a placeholder. `KEY_READY.md` text: `OPENAI_API_KEY loaded, length=164`. `loadEnv.js` if it logs, prints **prefix + len only**. `isMockKey` matches /mock|replace|your[_-]?key|placeholder|example/i. Too short if length≤20.

Gitignore: `.env`, `.env.local`, `.env.*.local`.

Write env (only if missing): `node thesisExperiment/scripts/check_openai_key.js --write-env` (will not print value). Check: `node thesisExperiment/scripts/check_openai_key.js` → JSON `{found, length, candidates}` without value.

### 12.2 Skip completed

`run_phase2.js` / `master_phase2.js` / slice runners: `isComplete(experimentName, cfg)` true iff latest `runs_phase2/<name>_*` with metadata has status complete/completed **and** (master) `llmUsage.calls>0` **and** seedArticles + miScoringMode match. Skip unless `--force`. Master “does not kill other node processes.” Slice concurrency env vars e.g. `T2C_H_CONCURRENCY` default 4.

Do **not** re-run the 1728-cell grid unless `--force` and you intend to spend money. Harvest is complete.

### 12.3 Re-parse / compare / plots

From repo root:

```bash
node thesisExperiment/scripts/parse_phase2.js
# writes results_phase2/tables/*.csv, summary.json, PARSE.md, runs_phase2/_status/PARSE.md
# does NOT rewrite debnath_compare.json simPending

node thesisExperiment/scripts/compare_phase2.js
# writes debnath_compare.json, summary.md, pfeffer_observables.md
# Honesty: no empirical MPR. Only re-run if empirical topology actually changed.

python3 thesisExperiment/analysis_phase2/plot_phase2.py
python3 thesisExperiment/analysis_full/analyze_full.py   # if that folder exists
```

`parse_phase2.js` dry-run: none (always real files). `run_phase2.js --allow-dry-plumbing` is plumbing-only; default refuses dry-run as thesis. Master: `node thesisExperiment/scripts/master_phase2.js --skip-probe` after grid done.

### 12.4 Dnet runner

`node thesisExperiment/scripts/run_dnet.js` — skip-complete; 4 configs; 2 articles. Reconstruct: `node thesisExperiment/scripts/reconstruct_debnath.js` (will not invent tweets; will not launch LLM sims). OSF hashtag annotate: `node thesisExperiment/scripts/debnath_hashtag_osf.js`.

### 12.5 Untracked leftover results JSON

At write time, git status showed untracked `results_*.json` under a few late T2c_H echo_chamber / T2d_H dirs (e.g. `T2c_H_echo_chamber_climate_scientist_2026-09-19_05-05-08`). Parser already selected **latest complete** dirs (e.g. echo biodiversity `…04-43-08` in all_rows). Do not assume untracked files are a new harvest. Do not commit them in a handoff PR.

---

## 13. Engine IFD formulas (so you do not reverse-engineer wrong)

**Discrete** (`src/Auditor.js` `computeIFD` scores ∈ {−1,0,+1}):  
`mi = missingCount + incorrectCount` (for m=5 → 0..5). cr/mr/ir = counts/m.

**Continuous** (scores ∈ [0,1]):  
`cr = mean(scores)`; correct if ≥0.67, incorrect if ≤0.33; `mi = m * (1 - cr)`.

**Dual top-level = discrete.** Sidecar continuous on the same text. gap abs. agreement Pearson.

Auditor questions: 5 GT items per article (`auditorQuestions` in config). Defaulting on parse error: discrete → all 1 (correct); continuous → all 1.0.

---

## 14. Siblings in flight (do not clobber)

Cloud-agent names observed while writing: “Full comparison analysis new folder” (`analysis_full/`), “TUM LaTeX analysis writeup” (`latex_phase2/`), “Pfeffer Debnath vs sim graphs”. Working tree on `cursor/phase2-full-analysis-e0ee` had **staged** analysis_full outputs. This handoff commit must **only** add the two markdown files. Leave sibling index/worktree alone.

`latex_phase2/main.tex`: standalone `scrartcl`, English, compile `pdflatex && biber && pdflatex ×2`. Figures expected from `results_phase2/figures/`. Isolation comment: does not write Phase 1 runs/tables.

---

## 15. What “done” looks like

- 288/288 T2 configs, 1728/1728 cells, missing=0  
- Dnet 4/4, 8 article-rows, simPending=false  
- Probes PASS (dual both MI fields)  
- Hatch 292 kept  
- thesisGrade false, N=1, 8 hops, two instruments  
- Debnath 63/228 hashtag fallback, hydration failed  
- Pfeffer seven factors; cross-media held  
- PR1 harvest exists; do not retitle it  

If a later agent re-parses, **update this file only after diffing `summary.json` `generatedAt`**. If `generatedAt` is still `2026-09-19T05:14:37.163Z`, the official harvest has not moved.
