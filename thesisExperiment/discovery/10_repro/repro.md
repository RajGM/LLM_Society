# Reproducibility — thesis climate-firestorm campaign

Inspection date: **18 September 2026**. Working tree at git `ffd876f` (`platform complete`); most of `thesisExperiment/` was **untracked** at inspection, so hashes below are of the files on disk, not of that commit.

This campaign is **not** a CIKM/LASS reprint. Engine CLI is the co-authored simulator; configs, personas, articles, and A/B grid are the thesis experiment.

## What “reproduced” means

| Layer | Deterministic? | Notes |
|---|---|---|
| Graph topology | **Yes**, given `graphRandomSeed` | `42` → `SocietyGraph.mulberry32`. ER also uses `minSeedOutDegree: 2` so `node_0` is never isolated. |
| Persona assignment | **Yes** | `sequential` (A/B) or `by_cluster` (echo extra). |
| LLM rewrites / auditor MI | **No** | OpenAI `gpt-4o-mini`, `temperature: 0.7`, `max_tokens: 700`. No API `seed`. Bit-identical transcripts are not expected. |
| Dry-run | Plumbing only | Mock MI=0. **Invalid** for thesis numbers. |

Pilot that was actually run: **N = 1**, 8 nodes, 6 ticks / 6 hops / inbox 4, real `gpt-4o-mini`. Estimated list-price cost ~**$0.15**.

## Seeds (two meanings)

### 1. RNG seed (graphs)

All campaign configs set:

```json
"graphRandomSeed": 42
```

ER cells also set `topologyParams.minSeedOutDegree: 2` (and `edgeProbability: 0.42`). Scale-free uses Barabási–Albert `m: 2`.

### 2. Information seeds (articles)

| Article id | Role | Used in |
|---|---|---|
| `scopex_2017` | Factual SCoPEx / SAI measurement experiment | Experiment **A** only (first of two sequential seeds) |
| `chemtrails_gates_2018_2021` | Consensus + Debnath-context correction of chemtrails–Gates narratives | Experiment **A** (second seed) and **B** (only seed) |

Seed injection is a **drip**: `seedNodes: ["node_0"]` only (Pfeffer *surprise* held).

## Model IDs

Registry: `config/models.js`.

| Config field | Value | Provider | Env var |
|---|---|---|---|
| `defaultModel` | `gpt-4o-mini` | OpenAI Chat Completions | `OPENAI_API_KEY` |
| `auditorModel` | `gpt-4o-mini` | same | same |
| Campaign / grid note | `gpt-4o-mini` | — | — |

`ANTHROPIC_API_KEY` is **not** used by this campaign. Do not commit `.env`. Do not paste keys into logs or this folder.

LLM call shape (`src/llmClient.js`): `temperature: 0.7`, `max_tokens: 700`. Auditor: five binary items; discrete MI; propaganda = **MI > 3**.

## SHA-256 of campaign files (this inspection)

Computed with PowerShell `Get-FileHash -Algorithm SHA256` from repo root.

### Configs

| File | SHA-256 |
|---|---|
| `thesisExperiment/configs/grid.json` | `11d44bc79300eadf303ee64580e38851d00c7186262ef14dac039ec7eded4120` |
| `thesisExperiment/configs/A_sf_hom.json` | `71a1ad17fbabce2c0a2e634b70a7b9065d8ef10fc15eea2f55363c8ab6baf087` |
| `thesisExperiment/configs/A_sf_mix.json` | `a94fe75a4de14e8379db9f12af66891c11a9400f25b37dcb8b95e4af087ea455` |
| `thesisExperiment/configs/A_er_hom.json` | `760d7e014a01edabf17fd22742f23c1f5434cbd5546a257020101a896a7d0c1f` |
| `thesisExperiment/configs/A_er_mix.json` | `d1c0c9e22d665412f169ba41c37f4c6cdaae1da1cb66b6eddf48030fa43ae197` |
| `thesisExperiment/configs/B_sf_mix_n1.json` | `c0adefe7dd194891d00d372096e237f2584d149521b87a99d7d513a35768f67b` |
| `thesisExperiment/configs/B_sf_mix_n3.json` | `5bb9f89b32e4789d856a9259a0648c84a6a4dff8d134dca98bdb5a959fee444f` |
| `thesisExperiment/configs/D_echo_mix.json` | `90d2a6cb8d94aeed48774934dfdbef0d9d549ba0f009674972bc5f986ab5112f` |

`configs/_probe_api.json` is **generated** by `run_campaign.js` on each probe. Do not treat its hash as a protocol pin. Hash at inspection: `e99b317c485b7cc5e1cac25f8a2a780cf75eb09ce3f28159299188e4d2c23cb3`.

### Personas and articles

| File | SHA-256 |
|---|---|
| `thesisExperiment/personas/homogeneous_conspiracy.json` | `6ceb61f4aa0b19d0558f62a2f2ee4611c68a777b90c737c780ca091fd91b3cd7` |
| `thesisExperiment/personas/mixed_three_bp.json` | `0bfea9054283d4e6182099f7aa932acc471393b237f3eef9f2804d9d13c9742a` |
| `thesisExperiment/articles/articles.json` | `266e1b1685e281849dc170fbd6533340a452d2e0cc1aa9af9014e6c7fe7b21cb` |

Re-hash after any edit:

```powershell
Get-FileHash thesisExperiment\configs\*.json, thesisExperiment\personas\*.json, thesisExperiment\articles\articles.json -Algorithm SHA256
```

## Grid (homo / hetero / A / B)

`thesisExperiment/configs/grid.json` (`protocol`: A 2×2 real LLM; B n in {1,3}; extra echo if time; C/D metrics from A/B texts).

**Experiment A** — 2 topologies × 2 BP mixes × 2 articles, N=1:

| Cell | Topology | BP mix (homo vs hetero) | Config | Personas |
|---|---|---|---|---|
| A1 | scale-free BA m=2 | **homogeneous** conspiracy | `A_sf_hom.json` | `homogeneous_conspiracy.json` |
| A2 | scale-free BA m=2 | **heterogeneous** mixed 3 BPs | `A_sf_mix.json` | `mixed_three_bp.json` |
| A3 | ER p=0.42 | **homogeneous** conspiracy | `A_er_hom.json` | `homogeneous_conspiracy.json` |
| A4 | ER p=0.42 | **heterogeneous** mixed 3 BPs | `A_er_mix.json` | `mixed_three_bp.json` |

Parse script labels: `homogeneous-conspiracy` vs `mixed-3BP` (from whether `personasPath` contains `homogeneous`).

**Experiment B** — scale-free × mixed BPs × chemtrails only; `fact_checker_injection` of original article text:

| Cell | n (ticks before correction) | Injection tick | Config |
|---|---|---|---|
| B1 | 1 | 1 | `B_sf_mix_n1.json` |
| B2 | 3 | 3 | `B_sf_mix_n3.json` |

`n=5` was not run.

**Extra (not required for A/B):** `D_echo_mix.json` — echo-chamber, mixed BPs, chemtrails. The 18 Sep 2026 real run **dropped the seed at tick 1** (0 LLM calls). Unusable as a firestorm cell.

Experiments **C** (keyword distortion tags) and **D** (homophily / modularity / PI) are **metrics on A/B outputs**, not extra LLM campaigns (`parse_results.js`).

## CLI — how to rerun

From repo root. Requires a non-placeholder `OPENAI_API_KEY` in `.env` (gitignored). Node has **zero npm dependencies**.

### 0. Plumbing (no results)

```powershell
node index.js --dry-run --config examples/run_linear_chain.json
node thesisExperiment/scripts/run_campaign.js --dry-run
```

Dry-run MI is mocked to 0. Do not report it.

### 1. API probe (one real call)

```powershell
node thesisExperiment/scripts/run_campaign.js --probe-only
```

Exit 0 = live API; exit 2 = placeholder/401/403 or incomplete probe. Writes `configs/_probe_api.json` and appends `results/logs/probe_api.log`.

### 2. Full A then B then extra (what the campaign runner does)

```powershell
node thesisExperiment/scripts/run_campaign.js --real
```

`--real` **refuses** to continue if the probe fails. Order: A cells in `grid.experimentA`, then B unless `--skip-b`, then extra unless `--skip-extra` or an A cell failed. Timeout per cell: 22 minutes. Manifest: `thesisExperiment/results/campaign_manifest.json`.

A only:

```powershell
node thesisExperiment/scripts/run_campaign.js --real --skip-b --skip-extra
```

B only is **not** a campaign flag. Run the two B configs with the engine CLI (below) after a working probe.

### 3. Single cell (homo, hetero, A, or B)

```powershell
# Homogeneous conspiracy × scale-free (A1)
node index.js --config thesisExperiment/configs/A_sf_hom.json

# Heterogeneous mixed 3 BP × scale-free (A2)
node index.js --config thesisExperiment/configs/A_sf_mix.json

# Homogeneous × ER (A3)
node index.js --config thesisExperiment/configs/A_er_hom.json

# Heterogeneous × ER (A4)
node index.js --config thesisExperiment/configs/A_er_mix.json

# Experiment B n=1 / n=3
node index.js --config thesisExperiment/configs/B_sf_mix_n1.json
node index.js --config thesisExperiment/configs/B_sf_mix_n3.json
```

Outputs land under `thesisExperiment/runs/<experimentName>_<timestamp>/`.

### 4. Parse + plots (no extra LLM)

```powershell
node thesisExperiment/scripts/parse_results.js
.\.venv\Scripts\python.exe thesisExperiment/scripts/plot_results.py
```

`parse_results.js` prefers `campaign_manifest.json` when `mode=real`. Plots: `results/mi_mpr_by_condition.png`, `kstar_by_condition.png`, `b_before_after.png`.

Optional log redaction (does not touch `.env`):

```powershell
node thesisExperiment/scripts/redact_manifest.js
```

### 5. Engine A/B test CLI (examples/, not the thesis grid)

The **thesis** A/B is the campaign above. The **engine** `--ab-test` path (CIKM-style examples) is a different protocol:

```powershell
node index.js --ab-test --base examples/run_linear_chain.json --variant examples/run_echo_chamber.json --runs 3
```

That writes `ab_tests/` (gitignored) and uses crime/news articles + default personas — **not** the climate corpus.

## k\* definition (must match parse)

First tick where **network-mean MI > 3** (propaganda) and mean MI stays > 3 on later ticks that have data. If it later falls ≤ 3, k\* is reported as none (recovered). Severity bands: MI ≤ 1 factual error; 1 < MI ≤ 3 lie; MI > 3 propaganda.

## What is not reproduced by these commands

- Debnath 814,924-tweet HDBSCAN / Skip-gram clusters (tweet IDs were **not hydrated**).
- ClimateFEVER as a seed (slice exists under `data/derived/`; **unused** in the A grid).
- 15-tick temporal-acceleration sweep, volume-shock (seed all nodes), n=5 fact-check, FrameAuditor-on.
- Bit-identical LLM transcripts.

## Canonical real-LLM run dirs (18 Sep 2026 campaign)

From `results/campaign_manifest.json` (`mode: real`):

| Cell | Run directory |
|---|---|
| A_sf_hom | `A_sf_hom_2026-09-18_02-49-17` |
| A_sf_mix | `A_sf_mix_2026-09-18_02-56-00` |
| A_er_hom | `A_er_hom_2026-09-18_03-02-43` |
| A_er_mix | `A_er_mix_2026-09-18_03-06-36` |
| B_sf_mix_n1 | `B_sf_mix_n1_2026-09-18_03-08-45` |
| B_sf_mix_n3 | `B_sf_mix_n3_2026-09-18_03-12-28` |
| D_echo_mix | `D_echo_mix_2026-09-18_03-15-58` (unusable) |

Earlier same-day dirs (e.g. `A_sf_hom_2026-09-18_02-34-15`) are prior attempts; parser uses the manifest when `mode=real`.
