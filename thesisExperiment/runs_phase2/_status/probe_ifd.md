# Phase 2 IFD probe (continuous + dual)

**When.** 2026-09-19T09:30:06Z (live-disk recheck; probes themselves ran 2026-09-19T02:49–02:52Z)  
**Verdict.** **PASS**  
**OPENAI_API_KEY found.** **yes** (length=164; value not logged)  
**Dry-run.** no  
**MI/MPR invented.** no  
**Sep 18 abort.** superseded. This file previously recorded a key-missing abort (`2026-09-18T16:42:14Z`, 0 LLM calls). Real probes exist on disk from 2026-09-19.

## Key hunt (values not logged)

| Source | Result |
| --- | --- |
| `/workspace/.env` | present, mode 600, key length=164, not a placeholder |
| `thesisExperiment/.env` | present, mode 600 (gitignored) |
| process / logs | length only; value never printed |

Did **not** invent a key. Did **not** echo any secret. `.env` stays gitignored.

## Probe runs (real LLM, usage > 0)

Canonical tiny probes used for IFD field confirmation:

| Mode | runDir | status | LLM calls | prompt / completion / total tokens | Dual discrete | Dual continuous |
| --- | --- | --- | ---: | --- | --- | --- |
| continuous | `thesisExperiment/runs_phase2/probe_p2_continuous_2026-09-19_02-50-40` | complete | **2** | 1050 / 219 / 1269 | n/a | headline `ifd.mode=continuous` (`mi=1.5`) |
| dual | `thesisExperiment/runs_phase2/probe_p2_dual_2026-09-19_02-50-19` | complete | **3** | 1522 / 249 / 1771 | **yes** `ifd.dual.discrete.mi=5` | **yes** `ifd.dual.continuous.mi=3` |

Earlier same-day siblings (also usage > 0, not the Sep 18 abort):

| Mode | runDir | calls | tokens |
| --- | --- | ---: | ---: |
| continuous | `probe_p2_continuous_2026-09-19_02-49-15` | 2 | 1327 |
| dual | `probe_p2_dual_2026-09-19_02-49-23` | 2 | 1196 (also has `ifd.dual.discrete` + `ifd.dual.continuous`) |
| continuous He | `probe_T2c_He_2026-09-19_02-51-00` | 2 | 1276 |
| continuous He | `probe_T2c_He_2026-09-19_04-14-23` | 1 | 632 |
| dual He | `probe_T2d_He_2026-09-19_02-51-59` | 2 | 1196 |

`probe_dnet_custom_2026-09-18_16-08-07` is the Sep 18 abort (calls=0). Ignore it for this probe.

## Dual event field parse (Auditor / node history)

From `probe_p2_dual_2026-09-19_02-50-19/nodes/node_0.json` event `scopex_2017`:

- `event.ifd.mode` = `dual`
- `event.ifd.dual.discrete` present (`mi=5`, `mode=discrete`)
- `event.ifd.dual.continuous` present (`mi=3`, `mode=continuous`)
- `event.ifd.dual.gap` = 2
- metadata sidecar `results.scopex_2017.metrics.ifdDualMetrics`: `meanDiscreteMI=5`, `meanContinuousMI=3`, `meanGap=2`

Continuous probe headline is float MI (`ifd.mi=1.5`, `mode=continuous`), not discrete 0–5.

**Both MI fields parsed on a real dual event. Not dry-run. Not invented.**

## Isolation

Did not write Phase 1 `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Did not re-run the 1728-cell grid (already complete). Did not commit `.env`.
