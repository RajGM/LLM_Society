# Phase 2 D-net (Debnath custom graph) status

**Generated.** 2026-09-18T18:25:03Z  
**Key present.** **no**  
**Dry-run.** no  
**MI/MPR invented.** no  
**Tweet hydration invented.** no  
**Git commit.** none (instruction: do not git commit)

Independent of the 8-topology grid. Isolation: `runs_phase2/`, `results_phase2/` only. Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`.

## Key hunt (no values logged)

Polled `.env` / `KEY_READY` **every 20s for 480s (~8 min), 25 checks**. Still missing. Did **not** invent a key. Did **not** write `.env` or `KEY_READY.md`. Did **not** launch `run_dnet.js` (would abort `real_api_unavailable` and yield 0 LLM calls).

| Source | Result |
| --- | --- |
| Process `OPENAI_API_KEY` | unset (length=0) |
| `/workspace/.env` | absent |
| `thesisExperiment/.env` | absent |
| `~/.env` | absent |
| `/run/secrets/OPENAI_API_KEY` | absent |
| `runs_phase2/_status/KEY_READY.md` | absent |
| `src/loadEnv.js` `isMockKey` | not applied (no value) |

## Return counts

| Cell | config | `miScoringMode` | mix | completed | skipped | failed | not_started |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| Dnet_c_H | `Dnet_c_H_conspiracy.json` | continuous | homo conspiracy | 0 | 0 | 0 | 1 |
| Dnet_c_He | `Dnet_c_He_mixed.json` | continuous | mixed Debnath BPs | 0 | 0 | 0 | 1 |
| Dnet_d_H | `Dnet_d_H_conspiracy.json` | dual | homo conspiracy | 0 | 0 | 0 | 1 |
| Dnet_d_He | `Dnet_d_He_mixed.json` | dual | mixed Debnath BPs | 0 | 0 | 0 | 1 |
| **four cells** | | | | **0** | **0** | **0** | **4** |

**Key: no.** **4-cell: 0/4 finished.** Dual vs continuous headlines **did not run** (must actually run; will not copy one onto the other).

## Compare

Did **not** re-run `compare_phase2.js` (no Dnet sims exist). Last `results_phase2/debnath_compare.json`:

- **simPending = true**
- nSimRuns = 0
- reason: `No thesisExperiment/runs_phase2 directories matching Dnet_ or topology=custom`
- KS/JS/DTFS not computed
- Pfeffer seven rows: empirical filled; simulated pending; **cross-media held**

Prior probe `runs_phase2/probe_dnet_custom_2026-09-18_16-08-07` is **not** a Dnet cell (`compare_phase2.js` skips `probe`). Do not treat that dir’s MPR as a thesis cell.

## Honesty

- 8 hops/ticks is a cost cut vs CIKM K=30, not Debnath’s skip-gram window.
- Debnath has **no empirical MPR**. Simulated MI is an auditor score, not Twitter MI.
- Hashtag co-occurrence graph (63 nodes / 228 edges) is **not** a retweet cascade. Tweets **not** invented.

## Resume

Place a non-placeholder `OPENAI_API_KEY` in gitignored `/workspace/.env`. Then:

```
node thesisExperiment/scripts/run_dnet.js --concurrency 2
node thesisExperiment/scripts/compare_phase2.js
```

Skip completed. Both continuous and dual must actually run. Do not invent MI.
