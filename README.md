# LLM Society Simulation

Simulation engine, archived experiments, analysis scripts, and figures for **Simulating Misinformation Propagation in Social Networks: From Linear Chains to Society-Scale Digital Twins**.

The study measures source-claim preservation in persona-conditioned LLM networks. The primary campaign contains 288 configurations and 1,728 configuration-article cells. Use the reconciled Phase 2 tables and their comparative analysis as the primary numerical results.

## Start here

| Resource | Purpose |
|---|---|
| [Reconciled tables](thesisExperiment/results_phase2/tables_reconciled/) | Primary scores, coverage, and reconciliation records |
| [Retained-run manifest](thesisExperiment/results_phase2/retained_runs_manifest.json) | Fixed selection of archived run directories |
| [Comparative analysis](thesisExperiment/analysis_full_reconciled/) | Derived tables, key numbers, and exploratory comparisons |
| [Figures](thesisExperiment/analysis_full_reconciled/figures/) | Plots generated from the reconciled tables |
| [Experiment configurations](thesisExperiment/configs/phase2/) | Network, persona, article, and scoring settings |
| [Archived runs](thesisExperiment/runs_phase2/) | Metadata, node histories, and aggregate results |

## Setup and engine usage

Use Node.js 18 or later and Python 3.10 or later. The JavaScript engine uses built-in Node modules and does not require an npm install. Python analysis requires NumPy, pandas, SciPy, and Matplotlib:

```bash
python -m pip install numpy pandas scipy matplotlib
node index.js --dry-run --config examples/run_linear_chain.json
```

The dry run uses mock model responses and writes to `experiments/`. It checks engine execution. For live runs, set `OPENAI_API_KEY` in the environment or a local `.env` file, then run:

```bash
node index.js --config examples/run_linear_chain.json
node index.js --list-personas
node index.js --list-articles
node index.js --help
```

Live runs incur model usage costs. Credentials belong in the environment or the ignored `.env` file. Model/provider settings are in `config/models.js`; default simulation settings are in `config/experiment.js`.

For engine-output visualisation:

```bash
python -m pip install -r requirements_viz.txt
python visualize.py --latest
```

The configurations in `examples/` demonstrate engine features. Retained research configurations are in `thesisExperiment/configs/phase2/`. Dependencies above describe the current analysis requirements rather than a frozen historical environment; library versions can affect rendering and low-order floating-point digits.

## Repository layout

| Path | Contents |
|---|---|
| `index.js`, `src/` | Command-line interface, simulation, graph construction, agents, auditing, and optional research modules |
| `config/` | Default experiment parameters and model-provider registry |
| `examples/`, `scenarios/` | Example JSON configurations and YAML scenario definitions |
| `articles/`, `personas/` | Default engine stimuli and persona profiles |
| `data/` | Sample cascade data for graph-import demonstrations |
| `visualize.py`, `requirements_viz.txt` | General engine-output plotting and dependencies |
| `experiments/`, `ab_tests/` | Local runtime outputs, excluded from version control |
| `thesisExperiment/articles/` | Research stimulus library, including `merged.json` |
| `thesisExperiment/personas/` | Research personas; Phase 2 profiles and heterogeneous mixes are in `phase2/` |
| `thesisExperiment/configs/` | Pilot and Phase 2 experiment configurations |
| `thesisExperiment/scripts/` | Input builders, campaign runners, parsers, graph reconstruction, and plotting utilities |
| `thesisExperiment/runs_phase2/` | Archived Phase 2 metadata, node histories, and per-article outputs |
| `thesisExperiment/results_phase2/` | Fixed manifest, historical tables, reconciled tables, execution logs, and graph comparisons |
| `thesisExperiment/analysis_full_reconciled/` | Primary comparative analysis, 18 derived CSV tables, numeric summaries, and 23 figures |
| `thesisExperiment/analysis_full/` | Comparative analysis of historical tables and the API-error audit |
| `thesisExperiment/analysis_phase2/` | Earlier Phase 2 plots, derived tables, and `stats.json`, based on historical tables |
| `thesisExperiment/runs/`, `thesisExperiment/results/` | Pilot campaign histories, tables, and figures |
| `thesisExperiment/discovery/` | Reference extracts, candidate inputs, and exploratory plotting resources |
| `thesisExperiment/data/` | Downloaded source material, external analysis code, hashtag aggregates, and graph inputs |
| `thesisExperiment/CONSOLIDATED_OVERLAPS/` | Alternative archived outputs and scripts; use the fixed manifest for primary run selection |
| `reproduction_output/` | Isolated local regeneration outputs, excluded from version control |

## Experiment design

The main campaign uses six climate/geoengineering articles, each with five keyed source-claim questions. Both generation and auditing use GPT-4o-mini.

| Dimension | Settings |
|---|---|
| Articles | SCoPEx, chemtrails/Gates, stratospheric aerosol injection, Paris Agreement, climate consensus, polar bears |
| Network conditions | Linear chain, ring, Erdos-Renyi, small-world, scale-free, echo chamber, polarised, hierarchical |
| Homogeneous arm (`H`) | Twelve persona conditions |
| Heterogeneous arm (`He`) | Six persona mixes |
| Continuous regime (`T2c`) | Continuous auditor score as the headline |
| Dual regime (`T2d`) | Discrete headline score with a continuous sidecar on the same events |
| Size and horizon | Eight nodes and eight ticks per main-grid configuration |
| Replication | One retained run per configuration; graph seed 42 |

Eight network conditions × eighteen persona/mix conditions × two regimes yield 288 configurations, or 1,728 article cells. A separate four-configuration, eight-cell stress test uses a constructed 63-node hashtag graph (D-net). The manifest selects 297 run directories including auxiliary records; the complete table contains 1,741 rows. Filter to the main grid before computing campaign-wide summaries.

The engine also implements bot injection, interventions, belief and opinion dynamics, evolving networks, institutional trust, and cascade comparisons. Their implementation does not imply that the main campaign evaluated each feature. `Simulation.js` coordinates execution; `SocietyGraph.js` builds networks; `SimulationNode.js` handles messages and actions; `Auditor.js` scores claim preservation; `llmClient.js` handles model requests.

## Reproduce the archived numerical results

Run these commands from the repository root. They read archived data without model API calls. Keep `thesisExperiment/results_phase2/retained_runs_manifest.json` fixed: rebuilding the manifest or running the historical parser directly is unnecessary for this workflow.

### Regenerate reconciled tables

PowerShell:

```powershell
$env:RECONCILED_OUTPUT_DIR = Join-Path (Get-Location) 'reproduction_output/tables'
node thesisExperiment/results_phase2/tables_reconciled/regenerate_reconciled.js
```

Bash:

```bash
RECONCILED_OUTPUT_DIR=reproduction_output/tables node thesisExperiment/results_phase2/tables_reconciled/regenerate_reconciled.js
```

Expected outputs are seven CSV files, `reconciliation_diff.json`, and `SHA256SUMS.txt`. The combined table has 1,741 rows. Compare CSV contents with `thesisExperiment/results_phase2/tables_reconciled/`, allowing for checkout line-ending conversion. Report timestamps will differ.

### Regenerate comparative analysis and figures

This script reads the checked-in reconciled tables and writes to the selected output directory.

PowerShell:

```powershell
$env:THESIS_ANALYSIS_OUTPUT_DIR = Join-Path (Get-Location) 'reproduction_output/analysis'
python -X utf8 thesisExperiment/analysis_full_reconciled/analyze_full_reconciled.py
```

Bash:

```bash
THESIS_ANALYSIS_OUTPUT_DIR=reproduction_output/analysis python -X utf8 thesisExperiment/analysis_full_reconciled/analyze_full_reconciled.py
```

Outputs include `tables/`, `key_numbers.json`, `exploratory_tests.json`, and `figures/`, with figure descriptions in `figures/captions.json`. These commands reproduce the archived numerical analysis and the figures generated by this script. They do not establish complete reproduction of every figure or supplementary audit in the submitted thesis. Exact replay of hosted model responses is unsupported.

### Other analysis scripts

| Script | Inputs and purpose |
|---|---|
| `thesisExperiment/analysis_phase2/plot_phase2.py` | Historical Phase 2 tables → twelve figures, derived tables, and `stats.json` |
| `thesisExperiment/analysis_full/analyze_full.py` | Historical Phase 2 tables → full comparisons and figures |
| `thesisExperiment/analysis_full/audit_api_errors.py` | Archived logs and histories → API-failure and scoring-coverage audit |
| `thesisExperiment/scripts/plot_results.py` | Pilot results → pilot figures and captions |
| `thesisExperiment/scripts/compare_phase2.js` | Phase 2 outputs → structural and scoring comparisons |
| `thesisExperiment/scripts/selfcheck.js` | Stimulus and configuration completeness checks |

These utilities use their script-defined output locations and may refresh checked-in derived outputs. The primary reproduction commands above use isolated output directories.

## Tables, metrics, and coverage

`all_rows.csv` contains all retained article rows; `TH_rows.csv` and `THe_rows.csv` separate the main homogeneous and heterogeneous arms. `continuous.csv`, `dual_discrete.csv`, and `dual_gap.csv` provide instrument-specific views. `dead_cells.csv` records the 292 main-grid cells with at most one scored event. Such cells remain in coverage counts and are excluded from live-cell averages.

| Field | Interpretation |
|---|---|
| `meanMI` | Mean scored-event loss or contradiction of keyed source claims within a cell |
| `meanNodeMPR` | Mean of node-level means; differs from the event-weighted `meanMI` |
| `meanDualGap` | Discrete score minus continuous sidecar on the same dual-regime events |
| `meanAgreement` | Available agreement diagnostic for dual-regime scoring |
| `kStarContinuous`, `kStarDiscrete` | Start of the terminal sequence of scored ticks with mean MI above three, within the eight-tick window |
| `nScored`, `dead`, `hatchStatus` | Scoring coverage and live/dead classification |

MPR is an average score despite the inherited word "rate". Continuous and discrete scores use different omission penalties and should be reported separately. The dual gap is a diagnostic, not another misinformation score. These instruments measure preservation of selected source claims, rather than misinformation, intent, toxicity, or belief in general.

Two archived node histories end before auditing completed. Relative to the historical tables, the reconciled table therefore changes two `polar_bears` cells:

| Configuration | Historical / archived scored events | Historical / reconciled `meanMI` |
|---|---|---|
| `T2d_H_polarized_ozone_stratosphere_specialist` | 122 / 37 | 1.4836 / 1.5405 |
| `T2d_H_scale_free_biodiversity_food_security` | 153 / 18 | 1.0784 / 0.8333 |

The remaining 1,739 rows have identical primary metrics. Ten additional rows differ only in status/call-count fields. Aggregate run summaries corroborate the historical totals, but the 220 missing event scores cannot be reconstructed from those aggregates. No live/dead flag or `k*` value changes. Exact differences and run identifiers are recorded in [reconciliation_diff.json](thesisExperiment/results_phase2/tables_reconciled/reconciliation_diff.json) and the fixed manifest.

## Data sources

`thesisExperiment/data/raw/` contains downloaded reference material used to ground the stimuli, including Wikipedia extracts, Harvard SCoPEx pages, the Debnath iScience article, and dataset landing pages. `thesisExperiment/data/debnath_geoeng/` contains external analysis code associated with the Debnath study. `thesisExperiment/data/derived/` contains extracts, hashtag aggregates, and graph-construction outputs.

The full Debnath tweet corpus was not hydrated into an observed user-interaction network. The OSF processing used a 5,000-record prefix to extract hashtag counts; tweet text was discarded after extraction. Scientific-notation tweet identifiers in that sample were unsuitable for hydration. The D-net input, `thesisExperiment/data/derived/debnath_hashtag_cascade.json`, is a constructed graph with synthetic roles, 63 nodes, and 228 edges. Hashtag counts annotate its edges; it is not a recovered retweet cascade. Its auditor scores have no corresponding empirical Twitter misinformation scores.

The auditor framework builds on prior co-authored work. Research inputs and external code retain their source information in their data records and source files.

## Interpretation limits

The comparisons are descriptive for the retained configurations. Article cells and scored events do not provide independent run replication or seed-to-seed uncertainty. Network conditions combine graph structure, action policies, and assignment procedures. Exploratory p-values in the analysis do not resolve those design limitations.

The eight-tick `k*` statistic describes only the observed window. Human criterion validity for the scoring instruments and empirical digital-twin validation are not established. D-net comparisons should be interpreted as a separate structural stress test.
