# Phase 2 API-error and fallback audit

## Finding

The reported **64,270** is real as a sum of archived `llmUsage.errors` counters across the exact 288 run directories selected by the canonical Phase 2 table. It is **not** a retry counter and is not duplicate aggregation of reruns: `llmClient.js` has no retry loop, and each selected directory is counted once.

The counter is narrower than “all API errors.” It increments once when an individual request receives a parseable HTTP response with status at least 400. Request IDs were not retained, so provider-side uniqueness cannot be proved. In dual mode, two auditor requests run concurrently; both can increment the counter even though `Promise.all` exposes only the first rejection to the event-level catch.

Across the selected runs:

- successful responses (`llmUsage.calls`): **203,928**
- HTTP-error responses (`llmUsage.errors`): **64,270**
- counter error share: **23.9636%** of calls plus HTTP errors
- selected runs with at least one HTTP error: **121/288**
- client retries/backoff: **0**
- selected canonical runs marked aborted/failed: **0**
- caught log lines: **57,137 HTTP 429**, **0 other HTTP status**, and **1 transport error**
- HTTP counter increments without a corresponding caught HTTP line: **7,133**; these cannot be assigned an exact status or stage, chiefly because dual `Promise.all` can hide a sibling rejection and the metadata is not a request ledger
- auditor parse-fallback warnings: **0**
- scored-payload schema anomalies recoverable from node files: **0**

Therefore, 64,270 is best described as **HTTP-failure responses observed by client invocations**, not 64,270 proven unique provider requests and not 64,270 affected simulation events.

## Exact counter breakdown

| slice | runs | successes | HTTP errors | error share | runs affected | audit-eligible events | scored | left null |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| T2c_H | 96 | 51,121 | 20,007 | 28.1282% | 47 | 44,505 | 30,832 | 13,673 |
| T2c_He | 48 | 25,699 | 5,743 | 18.2654% | 17 | 19,720 | 14,743 | 4,977 |
| T2d_H | 96 | 88,988 | 24,426 | 21.5370% | 36 | 45,317 | 34,416 | 10,901 |
| T2d_He | 48 | 38,120 | 14,094 | 26.9928% | 21 | 20,122 | 13,479 | 6,643 |

By scoring mode, continuous runs recorded **25,750** HTTP errors and dual runs **38,520**. By start hour, the burden was highly time-dependent: **0** at 02:00 UTC, **6,853** at 03:00, and **57,417** at 04:00. The 04:00 cohort’s counter error share was **44.6589%**.

Topology counts and all per-run values are in:

- `tables/api_error_by_topology.csv`
- `tables/api_error_by_slice.csv`
- `tables/api_error_by_time.csv`
- `tables/api_error_by_run.csv`

## What the engine wrote

There are three distinct paths:

1. **Rewrite request failure.** `SimulationNode.processTick` catches the error, writes the received `contentIn` back as `contentOut`, retains action `reinterpret`, and propagates that unchanged text. If its later audit succeeds, its score is included normally in event `meanMI`, node MPR, tick means used by \(k^*\), and dead/live classification. Its descendants can also be affected.
2. **Auditor request failure.** `auditPendingEvents` catches the error and leaves `misinfoIndex` and `ifd` null. The canonical parser excludes null events from `meanMI`, `meanNodeMPR`, and \(k^*\), but the loss reduces `nScored` and can move the article-cell to the `nScored <= 1` hatch.
3. **Malformed auditor response.** `Auditor.js` fails open: discrete parsing returns five `+1` scores and continuous parsing five `1.0` scores. Both yield **MI=0**. Such an event would enter `meanMI`, MPR, \(k^*\), trust updates, and dead/live classification as a valid all-correct score. No parse-warning line was found in the selected log sections, so the observed count is **0**; raw model responses were not retained, preventing independent re-parsing.

The raw final states contain **129,664** audit-eligible events, of which **93,470** are scored and **36,194** remain null. These are exact final-state counts, but a null event cannot be mapped one-to-one to an HTTP counter increment: a dual event can lose one or two requests, and logs/counters are not an atomic event ledger.

Rewrite failures were not tagged in node JSON. There are **13,585** `reinterpret` events where `contentOut == contentIn`, close to **13,494** caught rewrite-failure lines, but this is not exact linkage: **211** identity events occur in zero-error runs. Of the identity candidates, **6,127** were scored, **4,605** had MI=0, and their mean MI was **0.5352**. They are a conservative sensitivity marker, not a proven failure set.

## Sensitivity of headline cell means

Canonical means below reproduce the live-cell table policy. “Identity candidates excluded” removes every `reinterpret` event whose output exactly equals its input; it is conservative and also removes the 211 known non-HTTP-error identities. “Unaffected cells” retains only raw-matching cells with no identity candidate and no null eligible event. “Zero-error runs” is the cleanest available stratification but is condition- and time-selected, not a randomized correction.

| slice | canonical mean (live n) | identity candidates excluded (live n) | zero-HTTP-error runs (live n) | unaffected cells (live n) |
| --- | ---: | ---: | ---: | ---: |
| T2c_H | 0.8643 (480) | 0.8905 (466) | 0.9476 (247) | 0.8275 (277) |
| T2c_He | 1.0192 (238) | 1.0298 (235) | 0.9181 (150) | 0.9183 (173) |
| T2d_H | 1.6814 (478) | 1.7063 (462) | 1.7654 (304) | 1.5890 (326) |
| T2d_He | 2.0800 (240) | 2.1540 (230) | 2.2349 (139) | 2.1895 (162) |

Same-mode He−H deltas:

| sensitivity | continuous | dual-discrete |
| --- | ---: | ---: |
| canonical | +0.1549 | +0.3986 |
| identity candidates excluded | +0.1393 | +0.4477 |
| zero-HTTP-error runs only | **−0.0295** | +0.4695 |
| unaffected cells only | +0.0909 | +0.6005 |

The dual-discrete He>H headline is directionally stable across these checks. The continuous He>H headline is **not robust**: it reverses slightly in the zero-error-run subset. Neither subset identifies a causal correction because failures were concentrated by time, topology, and condition.

Conservatively excluding identity candidates changes the hatch count from **292** canonical dead cells to **333** among the 1,726 cells whose raw node state still matches the canonical table, and changes cells with a non-null \(k^*\) from **266** to **262**. The complete corrected cell ledger is `tables/api_error_cells_sensitivity.csv`; raw results were not rewritten.

## Reruns and archive integrity

There are multiple run directories for **77/288** experiment names. Only **12** names have an alternative complete zero-error directory, and only **5** of those replace a selected run that itself had HTTP errors. Thus reruns do **not** provide a clean replacement set for the affected campaign.

The exact alternatives are listed in `tables/api_error_rerun_replacements.csv`. They were not silently substituted because reruns are stochastic and replacement would change the canonical selection after results were reported.

Two canonical directories currently have `running`/`in_progress` metadata, and **2** article-cells no longer match the canonical node-state snapshot. Their canonical table values are preserved, but event-level sensitivity is omitted for those cells. This is an additional archive-integrity limitation and supports using immutable manifests/checksums.

## Conclusion

The canonical parser does not impute auditor request failures as MI=0; it correctly excludes null scores. It does, however, include successfully audited unchanged rewrite fallbacks because the events are indistinguishable from normal reinterpretations, and complete-case means are conditioned on successful auditing. The error process is large, time-clustered, and condition-dependent.

The main composition claim must therefore be narrowed:

- dual-discrete He>H remains descriptive and directionally stable under the available checks;
- continuous He>H is sensitive to API availability and reverses in the zero-error-run subset;
- dead-cell counts conflate sparse propagation with unavailable audits;
- no score should be invented for the 36,194 null eligible events.

Machine-readable totals and limitations are in `api_error_audit.json`. The generator script is `audit_api_errors.py`.
