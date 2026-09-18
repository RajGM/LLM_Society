# Phase 2 results — ABORTED (no live OpenAI key)

**Status.** Probe **failed**. Full T-H / T-He grid **not started**.  
**Thesis-grade.** No. Do not read probe MI=0 as a result.

## Probe

| Mode | Process exit | `failed` | Elapsed | Usage | Why failed |
|---|---|---|---|---|---|
| continuous | 0 | true | 42 ms | n/a | `OPENAI_API_KEY` not set |
| dual | 0 | true | 39 ms | n/a | `OPENAI_API_KEY` not set |

Engine still printed `[Simulation] Done` and wrote run dirs with **unscored** events (nScored=0, hatched dead). That is missing-key plumbing, not gpt-4o-mini scoring.

## Campaign cells

| Arm | Configs in grid | Ran | Skipped complete | LLM calls | Est. USD |
|---|---|---|---|---|---|
| T-H (8 topo × 12 homo × 2 modes) | 192 | **0** | 0 | 0 | $0 |
| T-He (8 topo × 6 mixes × 2 modes) | 96 | **0** | 0 | 0 | $0 |
| Probes | 2 | 2 | — | **0** | **$0** |

Refused `--allow-dry-plumbing` / dry-run of the ~1728-cell grid (that would stamp MI=0 and look like a real table).

## Isolation

Wrote only:

- `thesisExperiment/runs_phase2/` (two probe dirs)
- `thesisExperiment/results_phase2/`
- `thesisExperiment/LOG.md` (append)
- `thesisExperiment/configs/phase2/_probe_p2_*.json`

Did **not** write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`.

## Tables (hatched dead probes only)

- `thesisExperiment/results_phase2/tables/TH_rows.csv` — empty (0 campaign rows)
- `thesisExperiment/results_phase2/tables/THe_rows.csv` — empty
- `thesisExperiment/results_phase2/tables/continuous.csv`
- `thesisExperiment/results_phase2/tables/dual_discrete.csv`
- `thesisExperiment/results_phase2/tables/dual_gap.csv`
- `thesisExperiment/results_phase2/tables/dead_cells.csv` — both probe rows hatched
- `thesisExperiment/results_phase2/tables/all_rows.csv`

## Resume

Put a real non-placeholder `OPENAI_API_KEY` in `.env` (gitignored) and rerun:

```bash
node thesisExperiment/scripts/run_phase2.js --probe-only
node thesisExperiment/scripts/run_phase2.js --phase all --concurrency 4
```

Completed cells are skipped unless `--force`.
