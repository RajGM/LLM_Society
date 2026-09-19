# T2c_H status — continuous homogeneous, all 8 topologies

**When.** 2026-09-19T05:15:10.793Z
**OPENAI_API_KEY found.** **yes** (length only; value not logged)
**Dry-run.** no. **MI invented.** no.
**Isolation.** `thesisExperiment/runs_phase2` + `thesisExperiment/results_phase2` only.
**N=1, hops/ticks=8, concurrency=4.** Model `gpt-4o-mini`. `miScoringMode: continuous`.
**Configs.** 96 = 8 topologies × 12 personas. Does not stop after one topology.

**Phase.** running T2c_H (watch + resume remaining)

| metric | n |
|---|---:|
| completed | 94 |
| failed | 0 |
| skipped (already complete+continuous+usage>0) | 0 |
| remaining | 2 |
| configs | 96 |

## Per topology (keep going across all eight)

| topology | configs | completed | failed | remaining |
|---|---:|---:|---:|---:|
| linear_chain | 12 | 12 | 0 | 0 |
| ring | 12 | 12 | 0 | 0 |
| random_er | 12 | 12 | 0 | 0 |
| small_world | 12 | 12 | 0 | 0 |
| scale_free | 12 | 12 | 0 | 0 |
| echo_chamber | 12 | 10 | 0 | 2 |
| polarized | 12 | 12 | 0 | 0 |
| hierarchical | 12 | 12 | 0 | 0 |

## Probe (2-node continuous, usage must be > 0)

- failed: False
- usageCalls: 2
- runDir: probe_p2_continuous_2026-09-19_02-50-40
- usageLine: 2 calls

## Note

Worker monitors the live T2c_H pool (concurrency 4). Skips complete+continuous+usage>0. Resumes remaining if the pool exits. No dry-run. No invented MI.

## Isolation

Did not write Phase 1 `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Did not write `phase2_manifest.json`. Did not git checkout or commit.

T2c_H_rows.csv data rows=576 (real events only).

