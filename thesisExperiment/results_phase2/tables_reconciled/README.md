> For isolated regeneration that preserves the checked-in outputs, follow the [current reproduction instructions](../../../docs/REPRODUCIBILITY.md). Keep the manifest fixed; rebuilding it is not a routine reproduction step. The provenance and historical hashes below describe the 20 September reconciliation.

# Reconciled Phase 2 table set (`tables_reconciled/`)

**Status.** Derived, reproducible table set regenerated on 2026-09-20 from the retained raw node
histories at the current repository tree (HEAD `69e3c0c82b5f0be3cbe144d4fac99797b1890e04`), using a
fixed retained-run manifest instead of directory-mtime selection. It is the recommended primary
dataset for the thesis. The canonical set in `../tables/` is preserved untouched as the historical
version.

## Provenance

| Item | Value |
|---|---|
| Raw source | `thesisExperiment/runs_phase2/<runDir>/nodes/*.json` and `metadata.json` of the 297 run directories listed in the manifest (git trees identical from the harvest commit `2a774f5a…` through HEAD; `nodesGitTreeAtHead` is recorded per entry) |
| Run selection | `thesisExperiment/results_phase2/retained_runs_manifest.json` — the `runDir` column of the canonical `all_rows.csv`, taken literally per `experimentName`. SHA-256 `760a1aa30c8ece3650dcd726c5e7f158b927b866084e5bd2901bf39278398957` |
| Parser arithmetic | `thesisExperiment/scripts/parse_phase2.js`, evaluated through `rowFromRun` and `toCsv` only, inside a Node `vm` context with a read-only `fs` facade; `main()` and the parser's `mkdirSync` statement are never evaluated. Parser SHA-256: `c091582846b0a1fc4fbe5f28cb2ed89bc8af54d8c7e7b1a30f3ab78146b7755a` (CRLF working tree) / `c31f0b1e927475babb76c842c446e6ac32249be5197405fe8f32a226a55cfcca` (git blob, LF) |
| Canonical comparison target | `thesisExperiment/results_phase2/tables/all_rows.csv`, git blob `c1ebd9d01dfd7b2bab057e97ae2921b9ac9b12b2` (written in commit `6efcca1b077139ddfb66b30c8ddc1f17c72b064b`, 2026-09-19 05:15:17 UTC). SHA-256 `dcf2cc5c3326c55f42aee956c924d2393960acaa397c52ee63c58926692685fd` (CRLF working tree, as recorded by the reviewers) / `de5dfe7445c4bf9111d04f273d3f5a59c00e51ab364cf95bafc468d13e3fdac5` (git blob, LF) |
| Scripts | `build_manifest.js` (writes the manifest), `regenerate_reconciled.js` (writes this folder). Both read research data only; no model or network calls. |

Regenerate with, from the repository root:

```
node thesisExperiment/results_phase2/tables_reconciled/regenerate_reconciled.js
```

Repeating regeneration with the retained manifest after copying or re-checking-out the archive selects the same 297 run IDs,
because selection no longer depends on directory modification times. (On the current checkout the
parser's own mtime rule would pick a different directory for 9 of the 297 experiment names; see
`counts.entriesWhereMtimeSelectionTodayDiffers` and the per-entry `mtimeSelectionTodayWouldPick` field
in the manifest.)

## Files and SHA-256 digests (LF line endings, as written)

| File | Rows (excl. header) | SHA-256 |
|---|---:|---|
| `all_rows.csv` | 1,741 | `aeaa63b6f1c4c417ea7f237f0f4bcfcd2e06fcaea85c295ca79f088dbac6115a` |
| `TH_rows.csv` | 1,152 | `5331dec308b55d2e0ba3bd460cec2102b94ab1db42c456e8484ccf528f7fe4fc` |
| `THe_rows.csv` | 576 | `4027ad60ae285dfd4be8d20a32f4ce947937490469b2c6c98658359314ec4bc3` |
| `continuous.csv` | 864 | `dceebd776ecf0281348b5d5cfb35e4c23bbf340202aeb8df131b0c561750f9f0` |
| `dual_discrete.csv` | 864 | `eaf68a738a7316679cda7edb25e62baa35d0b215a914ed2bda7e89462436b2d1` |
| `dual_gap.csv` | 864 | `4dd4767ccfb1d9fce7eb99ba09f93ff641fafceacba25a8b4dc48bc2baf8223e` |
| `dead_cells.csv` | 292 | `411229d03854ffd31af7159a92ab49cf5be421e9c6256968b14bcf179d5882b5` |
| `reconciliation_diff.json` | — | `aa8f55bb6786c5518430e6bb48279b0934e0848ea80b3c38a94acf563c591681` |
| `SHA256SUMS.txt` | — | `23d77c179f574f5b6d7871a7c9724ce7a31ab03e10afcdeafa506b3a2c65e051` |

The seven CSV files carry the same columns, filters and row order as the canonical set
(`missing_cells.csv` is not regenerated: it is empty in the canonical set and depends on the parser's
in-progress bookkeeping rather than on rows). Row counts are identical to the canonical tables
(1,741 rows; 292 dead cells; 478 live T2d H cells).

## Differences from the canonical tables

The reconciled `all_rows.csv` differs from the canonical `all_rows.csv` **in exactly two rows on the
thirteen primary metric fields**, both `polar_bears` cells of runs whose archived node files are the
05:10:14 UTC mid-audit snapshot (see the manifest `knownDiscrepancies` and `note` fields):

| CSV line | Run directory | Field | Canonical | Reconciled (archived node histories) |
|---:|---|---|---:|---:|
| 1155 | `T2d_H_polarized_ozone_stratosphere_specialist_2026-09-19_04-49-20` | nEvents | 139 | 139 |
| | | nScored | 122 | 37 |
| | | meanMI = meanDiscreteMI | 1.4836 | 1.5405 |
| | | meanNodeMPR | 1.4752 | 1.5208 |
| | | maxMI | 3 | 3 |
| | | meanContinuousMI | 0.0697 | 0.0946 |
| | | meanDualGap | 1.4303 | 1.4459 |
| | | meanAgreement | 0.2517 | 0.3345 |
| | | dead / kStarDiscrete / kStarContinuous / kStarCensoredDiscrete | false / – / – / false | false / – / – / false |
| 1311 | `T2d_H_scale_free_biodiversity_food_security_2026-09-19_04-43-08` | nEvents | 176 | 176 |
| | | nScored | 153 | 18 |
| | | meanMI = meanDiscreteMI | 1.0784 | 0.8333 |
| | | meanNodeMPR | 1.0750 | 0.8333 |
| | | maxMI | 2 | 2 |
| | | meanContinuousMI | 0 | 0 |
| | | meanDualGap | 1.0784 | 0.8333 |
| | | meanAgreement | – | – |
| | | dead / kStarDiscrete / kStarContinuous / kStarCensoredDiscrete | false / – / – / false | false / – / – / false |

All other 1,739 rows reproduce field-for-field. In addition, the non-metric columns `status` and
`llmCalls` read `running` / `0` instead of `complete` / `1725` (polarised run) and `complete` / `2374`
(scale-free run) in **all twelve rows** of these two runs, because the archived `metadata.json` files are
the same mid-run snapshot (`reconciliation_diff.json` lists these ten further rows separately under
`statusOrLlmCallsOnlyDifferences`). The run logs
(`results_phase2/logs/T2d_H_polarized_ozone_stratosphere_specialist.log` line 1406 and
`…scale_free_biodiversity_food_security.log` line 1733) record the completed usage of 1,725 and 2,374
calls. No cell changes live/dead status and no k* value changes.

The canonical values for the two cells are corroborated, at aggregate level only, by the engine-written
run summaries `results_polar_bears.json` in each run directory (`ifdDualMetrics.eventCount` 122 / 153,
`meanDiscreteMI` 1.48360655… / 1.07843137…, `meanContinuousMI` 0.06967213… / 0, `meanGap` 1.43032786… /
1.07843137…, `meanAgreement` 0.25168367… / null, and per-node `mpr` values whose means are 1.47519… /
1.07502…). Those files were added to the repository in commit `9115af50…` (15:32:22 UTC) and contain no
per-event scores, so the 85 + 135 = 220 event-level scores missing from the archived node histories
cannot be recovered; nothing in this folder reconstructs them.
