# Phase 2 D-net (Debnath custom graph) status

**Generated.** 2026-09-18T20:49:50Z  
**Key present.** **no** (follow-up poll)  
**Dry-run.** no  
**MI/MPR invented.** no  
**Tweet hydration invented.** no  
**Git commit.** none  

Independent of the 8-topology grid. Isolation: `runs_phase2/`, `results_phase2/` only. Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`.

## Key hunt (no values logged)

Immediate recheck (follow-up): process `OPENAI_API_KEY` unset (length=0); `/workspace/.env` absent; `KEY_READY.md` absent. tmux `phase2-master` **alive** (PID 73069, `master_phase2.js --wait-key --poll-sec 30`). Secret re-requested.

Now polling **every 20s for 15 more minutes**. Will launch `run_dnet.js --concurrency 2` the instant a non-placeholder key appears. Dual and continuous both must actually run. Skip completed. No dry-run. No invented MI.

## Return counts (current)

| Cell | config | `miScoringMode` | completed | skipped | failed | not_started |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Dnet_c_H | `Dnet_c_H_conspiracy.json` | continuous | 0 | 0 | 0 | 1 |
| Dnet_c_He | `Dnet_c_He_mixed.json` | continuous | 0 | 0 | 0 | 1 |
| Dnet_d_H | `Dnet_d_H_conspiracy.json` | dual | 0 | 0 | 0 | 1 |
| Dnet_d_He | `Dnet_d_He_mixed.json` | dual | 0 | 0 | 0 | 1 |
| **four cells** | | | **0** | **0** | **0** | **4** |

**Compare.** Last `debnath_compare.json` **simPending=true**, nSimRuns=0. Pfeffer seven rows; cross-media held.
