# Reproducing the archived analysis

Run these commands from the repository root. They read archived data and do not call an LLM API. Outputs go to `reproduction_output/`, leaving the retained tables and histories unchanged.

## Requirements

Use Node.js 18 or later and Python 3.10 or later. The comparative analysis imports NumPy, pandas, SciPy, and Matplotlib:

```bash
python -m pip install numpy pandas scipy matplotlib
```

This is a dependency list, not a frozen historical environment. Rendering and floating-point library differences may affect newly generated figures or low-order digits.

## Regenerate the reconciled tables

Keep `thesisExperiment/results_phase2/retained_runs_manifest.json` fixed. Its entries select the archived runs independently of directory modification times.

PowerShell:

```powershell
$env:RECONCILED_OUTPUT_DIR = Join-Path (Get-Location) 'reproduction_output/tables'
node thesisExperiment/results_phase2/tables_reconciled/regenerate_reconciled.js
```

Bash:

```bash
RECONCILED_OUTPUT_DIR=reproduction_output/tables node thesisExperiment/results_phase2/tables_reconciled/regenerate_reconciled.js
```

Expected output: 1,741 rows, two rows differing from the historical tables on metric fields, and ten additional rows differing only in status/call-count fields. The script writes seven CSV files, a reconciliation report, and a checksum list. Compare CSV contents with `thesisExperiment/results_phase2/tables_reconciled/`, allowing for checkout line-ending conversion. Timestamps in the new report will differ.

Do not run `build_manifest.js` or the top-level historical parser for this reproduction step. Those are maintenance tools, not required regeneration steps.

## Regenerate the comparative analysis

The analysis reads the checked-in reconciled tables. Its output directory can be redirected.

PowerShell:

```powershell
$env:THESIS_ANALYSIS_OUTPUT_DIR = Join-Path (Get-Location) 'reproduction_output/analysis'
python -X utf8 thesisExperiment/analysis_full_reconciled/analyze_full_reconciled.py
```

Bash:

```bash
THESIS_ANALYSIS_OUTPUT_DIR=reproduction_output/analysis python -X utf8 thesisExperiment/analysis_full_reconciled/analyze_full_reconciled.py
```

This produces derived tables, key numbers, exploratory comparisons, and the analysis script's legacy plots. Event- and cell-level exploratory p-values do not supply the independent run replication absent from the design.

## Scope

The repository contains the simulation engine, archived histories, the fixed run manifest, reconciled tables, and comparative analysis. Two event histories are incomplete, as documented in the [reconciliation record](../thesisExperiment/results_phase2/tables_reconciled/README.md).

The final Overleaf source folder `6aaeb12d2d2eaea03e67a80b/` was removed before this cleanup. The final manuscript's `notes/` figure and supplementary verification scripts, and the companion archive's `reproduce.py`, are not present in this checkout. Consequently, the commands above do not reproduce every final-thesis figure or supplementary audit. `thesisExperiment/thesis_final/` is an older manuscript and must not be presented as the final signed PDF's source.

Restoring the final scripts and their dependency record is required before claiming complete GitHub-only reproduction of the signed thesis. The archived numerical analysis remains inspectable and reproducible within the scope described above. Exact replay of hosted LLM calls is not supported.
