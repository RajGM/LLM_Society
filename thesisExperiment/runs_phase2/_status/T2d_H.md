# T2d_H status (dual homogeneous, all 8 topologies)

**Updated:** 2026-09-18T18:36:47.366Z
**OPENAI_API_KEY present:** no (length=0; value not logged)
**Dry-run:** no
**MI/MPR invented:** no
**Dual:** 2 auditor LLM calls per event (`src/Auditor.js` `miScoringMode: dual`)
**Concurrency:** 3
**Isolation:** `thesisExperiment/runs_phase2` only (not Phase 1 `runs/` or `results/tables/`)

**Phase:** polling for key (attempt 18; every 30s, max ~20 min).

Did not invent a key. Did not write `.env`.

## Counts (configs; each seeds 6 core articles)

| Count | n |
| --- | ---: |
| configs | 96 |
| completed | 0 |
| failed | 0 |
| skipped (already complete dual) | 0 |
| pending / not_started | 96 |
| LLM calls (this slice + probe) | 0 |
| Est. USD | $0 |

## By topology

| topology | configs | completed | failed | skipped | pending |
| --- | ---: | ---: | ---: | ---: | ---: |
| echo_chamber | 12 | 0 | 0 | 0 | 12 |
| hierarchical | 12 | 0 | 0 | 0 | 12 |
| linear_chain | 12 | 0 | 0 | 0 | 12 |
| polarized | 12 | 0 | 0 | 0 | 12 |
| random_er | 12 | 0 | 0 | 0 | 12 |
| ring | 12 | 0 | 0 | 0 | 12 |
| scale_free | 12 | 0 | 0 | 0 | 12 |
| small_world | 12 | 0 | 0 | 0 | 12 |

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Manifest: `thesisExperiment/results_phase2/manifest_T2d_H.json`. Did not run `T2c_` or `He_` configs. Did not git commit.
