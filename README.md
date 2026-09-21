# LLM Society Simulation

Code and archived experiments for the master's thesis **Simulating Misinformation Propagation in Social Networks: From Linear Chains to Society-Scale Digital Twins**.

The implemented thesis study audits source-claim preservation in persona-conditioned LLM networks. Its main campaign contains 288 configurations and 1,728 configuration-article cells, using six climate/geoengineering articles, eight network conditions, two scoring regimes, and an eight-tick horizon. One run is retained per configuration. A separate stress test uses a constructed 63-node hashtag graph; it is not a validated digital twin of a real user network.

## Start here

| Resource | Purpose |
|---|---|
| [Thesis experiments](thesisExperiment/README.md) | Executed design, data locations, and limitations |
| [Reproduction instructions](docs/REPRODUCIBILITY.md) | Regenerate the retained tables and comparative analysis without model calls |
| [Architecture](ARCHITECTURE.md) | Technical reference for the engine and optional modules |
| [Reconciled tables](thesisExperiment/results_phase2/tables_reconciled/README.md) | Primary table set and the two incomplete event histories |
| [Reconciled analysis](thesisExperiment/analysis_full_reconciled/README.md) | Derived comparisons and historical differences |

## Run the engine

Use Node.js 18 or later. The JavaScript engine uses built-in Node modules; it does not require an npm install. Python is needed only for analysis and visualisation.

```bash
git clone https://github.com/RajGM/LLM_Society.git
cd LLM_Society
node index.js --dry-run --config examples/run_linear_chain.json
```

The dry run uses mock model responses and writes to `experiments/`. It checks execution, not scientific validity.

For a live run, set `OPENAI_API_KEY` in your environment or local `.env`, then omit `--dry-run`. Live runs call the configured model provider and incur usage costs. Do not commit credentials.

```bash
node index.js --config examples/run_linear_chain.json
node index.js --list-personas
node index.js --list-articles
```

To visualise engine output:

```bash
python -m pip install -r requirements_viz.txt
python visualize.py --latest
```

The examples demonstrate engine capabilities. They are not the retained thesis experiment configurations, which are under `thesisExperiment/configs/phase2/`.

## Repository layout

| Path | Contents |
|---|---|
| `src/`, `index.js`, `config/` | Simulation engine, command-line interface, and model configuration |
| `examples/`, `scenarios/` | Demonstration configurations and scenario definitions |
| `articles/`, `personas/` | Default engine inputs |
| `thesisExperiment/articles/`, `thesisExperiment/personas/phase2/` | Thesis stimuli and persona assignments |
| `thesisExperiment/configs/phase2/` | Phase 2 experiment configurations |
| `thesisExperiment/runs_phase2/` | Archived run metadata and node histories |
| `thesisExperiment/results_phase2/` | Fixed run manifest, historical tables, and reconciled tables |
| `thesisExperiment/analysis_full_reconciled/` | Primary comparative analysis |
| `thesisExperiment/data/` | Data-source records and graph-construction inputs |
| `thesisExperiment/thesis_final/` | Earlier manuscript snapshot; not the source of the signed final PDF |

Optional bot, intervention, polarisation, and cascade-comparison modules are implemented in the engine. Their presence does not establish that the thesis evaluated those capabilities or completed empirical digital-twin validation. Some terminology in the historical architecture reference predates the final thesis framing; the executed study is described in the thesis experiment documentation.

## Contribution and AI assistance

The auditor-node framework builds on prior co-authored work. The thesis-specific work concerns climate stimuli, persona assignments, the network campaign, measurement and coverage audits, and interpretation. Component history and data provenance should be consulted when attributing individual contributions.

Development and manuscript preparation used AI assistance. The author reported using Cursor and Claude; OpenAI Codex also assisted with analysis-verification scripts, methodological and source review, reference corrections, substantive prose revision, and figure/layout refinements. Experimental use of GPT-4o-mini as the simulated agents and auditor is a separate role. This repository acknowledgement does not replace the thesis's tool-use declaration.

Obsolete planning and editorial review files have been removed from the current tree. Their committed versions remain in Git history; research provenance, data-access limitations, and numerical reconciliation records are retained.

## Interpretation limits

The results are descriptive for the retained configurations. They do not estimate seed-to-seed uncertainty, isolate topology from bundled action policies, or establish human criterion validity for the scoring instruments. The constructed hashtag graph is not an observed user-interaction network. Exact replay of hosted model outputs is unsupported.

See [reproduction scope and missing final-manuscript resources](docs/REPRODUCIBILITY.md#scope) before treating this repository as a complete reproduction of every figure and supplementary audit in the signed thesis.
