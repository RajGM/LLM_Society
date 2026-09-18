# Phase 2 D-net (Debnath custom graph) status

**Generated.** 2026-09-18T16:43:00Z  
**Key present.** **no** — `thesisExperiment/runs_phase2/_blockers/dnet_no_key.md`  
**Dry-run.** no  
**MI/MPR invented.** no  
**Git branch.** stayed on the workspace branch; did not switch.

Independent of the 8-topology grid. Isolation: `runs_phase2/`, `results_phase2/`, `data/derived/` only.

## What ran

1. **Key hunt.** `OPENAI_API_KEY` unset (length=0). No `.env`. No Twitter/X bearer. Did not invent a key.
2. **Reconstruct (re-run).** `node thesisExperiment/scripts/reconstruct_debnath.js`
   - Mendeley files API still `error 400` / landing only.
   - OSF `dataset.csv` **did stream** this pass via `files.osf.io` object URL (previous `osf.io/download/mx97s` 403). Sample: 4043 data lines, PII columns discarded, **0 usable digit tweet IDs**, 1169 scientific-notation tokens (`1.00048E+18`). Converting those tokens would fabricate IDs (precision lost) — **not done**.
   - Twitter/X hydrate skipped (`no_bearer_token`). Tweets **not** invented.
   - Importer validate: 63 nodes / 228 edges, seed `user_chemtrails_hub`.
3. **Graph kept.** `thesisExperiment/data/derived/debnath_hashtag_cascade.json` — documented **hashtag co-occurrence / same-cluster** fallback. **63** `user_profiles`, **228** directed edges in `retweets[]` (edge container only). `notARetweetCascade: true`. `empiricalMPR: false`. Seed `chemtrails_hub`.
4. **Configs present (not executed).** continuous vs dual × homo vs hetero, `outputRoot: thesisExperiment/runs_phase2`, seeds `scopex_2017` + `chemtrails_gates_2018_2021`, 8 ticks/hops.
5. **Compare.** `node thesisExperiment/scripts/compare_phase2.js` — empirical Pfeffer table written; **sim pending**.

## What blocked

| Item | Status |
| --- | --- |
| `Dnet_c_H_conspiracy` (continuous homo) | not started |
| `Dnet_c_He_mixed` (continuous hetero) | not started |
| `Dnet_d_H_conspiracy` (dual homo) | not started |
| `Dnet_d_He_mixed` (dual hetero) | not started |
| Dual vs continuous headline MPR | **cannot compare** — neither mode ran; will not copy one onto the other |
| Tweet hydration | blocked: no bearer + unusable Excel tweet_id sample |

Prior probe `runs_phase2/probe_dnet_custom_2026-09-18_16-08-07` is **not** a Dnet cell (`compare_phase2.js` skips `probe`). Failed: missing OpenAI key.

## Honesty (hops / skip-gram / MPR)

- **8 hops/ticks is a cost cut vs CIKM K=30**, not Debnath’s skip-gram window, and not a Debnath hop protocol.
- Debnath has **no empirical MPR**. Simulated MI (when it eventually runs) is an auditor score, not Twitter MI.
- Hashtag co-occurrence is **not** a retweet cascade of the 814,924 tweets.

## Pfeffer observables (seven)

Written to `results_phase2/pfeffer_observables.md` + `summary.md`. Rows: valence, surprise, identity, clustering, echo, temporal; **seventh cross-media held**. Empirical side filled from the hashtag graph; simulated side **pending**.

Empirical ValidationMetrics on the fallback (tree-from-seed, not tweet time): depth=4, breadth=33, size=61, structuralVirality=2.7. Speed not available empirically.

## Paths

| Path | Role |
| --- | --- |
| `thesisExperiment/data/derived/debnath_hashtag_cascade.json` | graph used (63 / 228 fallback) |
| `thesisExperiment/data/derived/debnath_reconstruct_report.md` | reconstruct report |
| `thesisExperiment/data/debnath_hydrated/reconstruct_attempts.json` | attempt log |
| `thesisExperiment/data/debnath_hydrated/osf_id_sample.json` | ID sample metadata (no PII / no hydratable IDs) |
| `thesisExperiment/configs/phase2/Dnet_{c,d}_{H_conspiracy,He_mixed}.json` | four cells |
| `thesisExperiment/scripts/run_dnet.js` | LLM runner (not launched this pass) |
| `thesisExperiment/scripts/compare_phase2.js` | comparison |
| `thesisExperiment/results_phase2/summary.md` | compare summary (`simPending`) |
| `thesisExperiment/results_phase2/debnath_compare.json` | compare JSON |
| `thesisExperiment/results_phase2/pfeffer_observables.md` | seven-factor remapping |
| `thesisExperiment/results_phase2/dnet_manifest.json` | last probe abort |
| `thesisExperiment/runs_phase2/_blockers/dnet_no_key.md` | this blocker |
| `thesisExperiment/runs_phase2/_status/dnet.md` | this file |

## Resume

Place a non-placeholder `OPENAI_API_KEY` in gitignored `/workspace/.env`. Then:

```
node thesisExperiment/scripts/run_dnet.js --concurrency 2
node thesisExperiment/scripts/compare_phase2.js
```

Skip completed. Both continuous and dual must actually run. Do not invent MI.
