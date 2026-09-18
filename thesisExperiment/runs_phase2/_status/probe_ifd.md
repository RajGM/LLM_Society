# Phase 2 IFD probe (continuous + dual)

**When.** 2026-09-18T16:42:14Z  
**OPENAI_API_KEY found.** **no**  
**Dry-run.** no  
**MI/MPR invented.** no  
**Engine.** `src/Auditor.js` via `node thesisExperiment/scripts/run_phase2.js --probe-only` (not launched)

## Key hunt (values not logged)

| Source | Result |
| --- | --- |
| `/workspace/.env` | missing (gitignored; not on this VM) |
| `thesisExperiment/.env` | missing |
| process `OPENAI_API_KEY` | unset (length=0) |
| `/proc/*/environ` scan | no OPENAI/API_KEY names |
| Cursor cloud environment secrets | not injected; personal `environment.json` owner-restricted |
| GitHub Actions secrets | 403 (integration cannot list) |
| git history / stash | no `.env` object |
| Phase 1 `results/logs/probe_api.log` | key **was** loaded on the original Windows host `F:\SocietySimulation_MasterThesis\.env` (prefix `sk-proj…`, len=164). Truncated in logs; **not recoverable here**. |
| Sibling agent `Hunt OPENAI_API_KEY everywhere` | still running; has not written `/workspace/.env` |

Did **not** invent a key. Did **not** write `.env`. Did **not** echo any secret.

## Probe not started

Instruction: smallest real probe is 1 persona × 1 article, **continuous AND dual**, using existing engine. Runner would write:

- `thesisExperiment/configs/phase2/_probe_p2_continuous.json` — `miScoringMode: continuous`, 2-node `linear_chain`, `scopex_2017`, persona `conspiracy_believer`, 1 tick
- `thesisExperiment/configs/phase2/_probe_p2_dual.json` — same cell, `miScoringMode: dual`

Both would fail immediately with `Env var OPENAI_API_KEY not set`. Launching that is not a real LLM probe and would not confirm MI field parse. **Stopped before `node index.js --config`.**

| Mode | Launched | `[Simulation] Done` | LLM usage | Discrete MI field | Continuous MI field |
| --- | --- | --- | --- | --- | --- |
| continuous | no | n/a | n/a (0 calls) | **not observed on a real response** | **not observed on a real response** |
| dual | no | n/a | n/a (0 calls) | **not observed on a real response** | **not observed on a real response** |

Dual vs continuous are different headline MPRs. This harvest does **not** treat them as confirmed.

## What a passing probe must show (code contract — not a run)

From `src/Auditor.js` (not from a live response):

- **continuous** — `computeIFD(..., "continuous")` → top-level `{ mi, cr, mr, ir, cms, ie, scores, mode: "continuous" }`. Headline `misinfoIndex` is float ~0–5.
- **dual** — `computeDual` → top-level discrete IFD (`mode: "dual"`) plus sidecar `dual: { discrete, continuous, gap, agreement }`. Headline MI/MPR is **discrete** 0–5; continuous lives at `event.ifd.dual.continuous.mi`.

`parse_phase2.js` reads:

- discrete: `e.ifd.dual.discrete.mi` (dual) or `e.misinfoIndex` when mode is dual/discrete
- continuous: `e.ifd.dual.continuous.mi` (dual sidecar) or `e.misinfoIndex` when mode is continuous

Until a real LLM response exists, those fields are **unverified on disk**.

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Did not switch git branches. Did not kill other agents' node processes.

## Resume

Place a non-placeholder `OPENAI_API_KEY` in gitignored `/workspace/.env` (mode 600). Then:

```
node thesisExperiment/scripts/run_phase2.js --probe-only
```

Pass only if both modes finish with LLM usage > 0 and a dual event contains **both** `ifd.dual.discrete` and `ifd.dual.continuous`.
