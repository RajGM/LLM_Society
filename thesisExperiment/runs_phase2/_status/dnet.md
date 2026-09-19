# Phase 2 D-net (Debnath custom graph) status

**Generated.** 2026-09-19T04:55:30Z  
**Key present.** **yes** (length=164)  
**Dry-run.** no  
**MI/MPR invented.** no  
**Tweet hydration invented.** no  
**Git commit.** none  

Independent of the 8-topology grid. Isolation: `runs_phase2/`, `results_phase2/` only. Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/` (those dirs still dated 2026-09-18).

## Key (no values logged)

`.env` was present on first poll. Loaded dotenv silently. `KEY_READY.md` length=164. Process env after load: length=164. Not a placeholder.

## 4-cell counts

Both **continuous** and **dual** actually ran (real API). Dual cells have `ifd.dual.discrete` and `ifd.dual.continuous` on scored events; continuous cells do not. Skip-complete used when a later copy saw a finished dir.

| Cell | config | `miScoringMode` | state | primary runDir | llm_calls | events scored |
| --- | --- | --- | --- | --- | ---: | ---: |
| Dnet_c_H | `Dnet_c_H_conspiracy.json` | continuous | completed | `Dnet_c_H_conspiracy_2026-09-19_02-49-31` | 3273 | 1954 |
| Dnet_c_He | `Dnet_c_He_mixed.json` | continuous | completed | `Dnet_c_He_mixed_2026-09-19_04-05-50` | 2382 | 1626 |
| Dnet_d_H | `Dnet_d_H_conspiracy.json` | dual | completed | `Dnet_d_H_conspiracy_2026-09-19_02-49-31` | 4941 | 1825 (dual disc+cont) |
| Dnet_d_He | `Dnet_d_He_mixed.json` | dual | completed | `Dnet_d_He_mixed_2026-09-19_04-07-40` | 3620 | 1434 (dual disc+cont) |

| | completed | skipped | failed | running | not_started |
| --- | ---: | ---: | ---: | ---: | ---: |
| four cells | **4** | **0** | **0** | **0** | **0** |

**Key: yes (length=164).** **4-cell: 4/4 finished.**

Duplicate copies also completed (master + leftover `run_dnet.js` both launched H then He). Thinner He copies (`04-07-50` / `04-10-09`) exist; compare sees all `Dnet_` dirs. Primary rows above are the fuller audits.

## Compare

`node thesisExperiment/scripts/compare_phase2.js` after all four cells complete:

- **simPending = false**
- nSimRuns = 8 (four cells × two run dirs each)
- nSimCascades = 16
- Pfeffer **seven** observables: valence, surprise, identity, clustering, echo, temporal, **cross-media**
- Cross-media **held** (`held_no_engine_knob`)
- Wrote only `results_phase2/debnath_compare.json`, `summary.md`, `pfeffer_observables.md`

## Honesty

- No dry-run. No invented MI/MPR. No tweet hydration invented.
- Simulated MI is auditor IFD, not Twitter MI. Debnath has no empirical MPR.
- Hashtag co-occurrence is not a retweet cascade.
- No Phase 1 overwrite. No git commit.
