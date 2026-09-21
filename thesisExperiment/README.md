# Thesis experiments

This directory contains the executed climate/geoengineering campaign, archived histories, and analysis. The primary results use **Phase 2 reconciled tables**. Phase 1 and earlier manuscript materials remain as historical records.

## Executed design

- Six article stimuli, each scored against five source-claim questions.
- Eight network conditions: linear chain, ring, Erdos-Renyi, small-world, scale-free, echo chamber, polarised, and hierarchical.
- Twelve homogeneous persona conditions and six heterogeneous mixes.
- Continuous scoring and a dual regime with a discrete headline score and continuous sidecar.
- 288 configurations and 1,728 configuration-article cells, with eight nodes, eight ticks, and one retained run per configuration.
- A separate four-configuration, eight-cell stress test on a constructed 63-node hashtag graph.

Both generation and auditing use GPT-4o-mini. These are descriptive comparisons; event counts and article cells are not independent simulation replications. Network conditions bundle graph structure, action policies, and assignment procedures.

## Primary research records

| Path | Purpose |
|---|---|
| `articles/merged.json` | Stimulus library; the campaign uses six specified articles |
| `personas/phase2/` | Homogeneous profiles and heterogeneous mixes |
| `configs/phase2/` | Configurations used by the campaign |
| `runs_phase2/` | Recorded runs, node histories, and metadata |
| `results_phase2/retained_runs_manifest.json` | Fixed selection of 297 run directories, including auxiliary records |
| `results_phase2/tables_reconciled/` | Primary tables: 1,741 rows including auxiliary records |
| `analysis_full_reconciled/` | Comparative analysis derived from the reconciled tables |
| `analysis_full/API_ERROR_AUDIT.md` | Audit of execution failures and scoring coverage |
| `data/SOURCES.md`, `data/derived/` | Data provenance, access failures, and graph-construction records |
| `CONSOLIDATION_LOG.md` | Historical reconciliation of overlapping branch outputs |

The main 1,728-cell grid is a subset of the 1,741 archived rows. Use the documented filters rather than treating every row as a main-grid observation.

## Reproduce existing results

Follow the [offline reproduction instructions](../docs/REPRODUCIBILITY.md). Use the fixed retained-run manifest. Do not rerun the historical parser's modification-time selection or rebuild the manifest as a routine reproduction step.

The reconciled tables reproduce 1,739 historical rows without metric changes. Two cells differ because their node histories were archived before auditing completed; 220 later event scores are absent. Aggregate summaries corroborate the historical totals but cannot reconstruct those missing event scores. The [table provenance record](results_phase2/tables_reconciled/README.md) gives the exact fields and run IDs.

## Read the metrics correctly

MI measures loss or contradiction of the five keyed source claims under a specified auditor. It does not exhaustively measure misinformation, intent, toxicity, or belief. MPR is an average score despite the inherited word "rate". The two scoring regimes assign different omission penalties and are not interchangeable scales.

The within-window statistic `k*` identifies the beginning of a terminal sequence of scored ticks whose mean MI exceeds three. It is not evidence of irreversible degradation beyond the observed horizon or an observed real-world firestorm onset.

## Historical material and scope

`runs/`, `results/`, `analysis/`, `analysis_phase2/`, and `analysis_full/` contain pilot or historical results. `thesis_final/` is an earlier manuscript snapshot. Planning documents and examples may describe proposed experiments; they do not supersede the final design above. References in historical logs to removed editorial files identify documents available in Git history.

The Debnath tweet corpus was not reconstructed into a validated user network. The available hashtag aggregates supported a constructed graph with synthetic roles. The campaign represents selected, bundled proxies motivated by Pfeffer's framework, not an implementation and empirical test of all firestorm mechanisms.

AI-assisted development and writing are acknowledged in the [repository README](../README.md#contribution-and-ai-assistance). Provenance records are retained separately from obsolete editorial coordination notes.
