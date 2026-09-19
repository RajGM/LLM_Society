# Campaign wall-clock timeline (H / He / A / B / D)

**Sources:** `thesisExperiment/LOG.md`, `thesisExperiment/README.md`, `thesisExperiment/results/full_campaign_manifest.json`, run-folder names under `thesisExperiment/runs/`.  
**No LLM runs** — parse-only. All times below are **UTC** unless marked IST.

Campaign window (manifest): **`2026-09-18T03:49:27.732Z` → `2026-09-18T06:12:45.737Z`** = **8581.005 s** = **2 h 23 m 18.005 s**.  
IST (+05:30): **09:19:27.732 → 11:42:45.737**.

Phases ran **sequentially** in order **H → He → A → B → D** (`README.md`: `--phase all`). Probes between phases are not counted as experiment wall time.

---

## Phase summary

| Phase | Concurrency | Phase start (UTC) | Phase end (UTC) | Wall clock | Notes |
|---|---|---|---|---|---|
| **H** | **2** | `2026-09-18T03:50:56.730Z` | `2026-09-18T04:11:22.220Z` | **1225.490 s** = **20 m 25.490 s** | 12 configs; 2 at a time |
| **He** | **2** | `2026-09-18T04:12:14.281Z` | `2026-09-18T04:35:03.244Z` | **1368.963 s** = **22 m 48.963 s** | 12 mixes; 2 at a time |
| **A** (attempt 1) | **1** | `2026-09-18T04:36:11.428Z` | `2026-09-18T05:21:13.284Z` | **2701.856 s** = **45 m 1.856 s** | SF ok; ER crash (~100 ms each) |
| **A** (attempt 2) | **2** | `2026-09-18T05:24:05.653Z` | `2026-09-18T05:50:41.313Z` | **1595.660 s** = **26 m 35.660 s** | SF skipped; ER pair parallel |
| **B** | **1** | `2026-09-18T05:51:25.287Z` | `2026-09-18T06:08:02.824Z` | **997.537 s** = **16 m 37.537 s** | n1 → n3 → n5 sequential |
| **D** | **1** | `2026-09-18T06:08:40.718Z` | `2026-09-18T06:12:45.737Z` | **245.019 s** = **4 m 5.019 s** | single `D_echo_mix` |

**A inclusive span** (first PHASE A → second CAMPAIGN finished A), including ~2 m 52 s gap:  
`04:36:11.428Z` → `05:50:41.313Z` = **4469.885 s** = **1 h 14 m 29.885 s**.  
Gap between A attempts: `05:21:13.284Z` → `05:24:05.653Z` = **172.369 s**.

Phase start = `PHASE …` log line; phase end = `CAMPAIGN command finished phase=…`.

---

## Sequential phases vs concurrency

1. **Between phases:** strictly sequential — H finishes before He starts, then A, then B, then D.  
2. **Inside H / He:** pool of **2** concurrent run configs (LOG: `concurrency=2`). Next config starts when a slot frees.  
3. **Inside A attempt 1:** **concurrency=1** — `A_sf_hom` then `A_sf_mix` then failed `A_er_hom` / `A_er_mix`.  
4. **Inside A attempt 2:** **concurrency=2** — `A_er_hom` and `A_er_mix` overlap; completed SF cells skipped.  
5. **Inside B / D:** **concurrency=1** — one config at a time.

---

## H — homogeneous chains

| Event | UTC | IST (+05:30) |
|---|---|---|
| PHASE H n=12 concurrency=2 | `03:50:56.730Z` | `09:20:56.730` |
| First START (`H_conspiracy_believer` + `H_conspiracy_haarp_weather`) | `03:50:56.731Z` / `03:50:56.740Z` | `09:20:56` |
| Last END (`H_science_journalist`) | `04:11:21.052Z` | `09:41:21.052` |
| CAMPAIGN finished phase=H | `04:11:22.220Z` | `09:41:22.220` |

**Wall:** **20 m 25.490 s** (phase) · first START→last END **1224.321 s** = **20 m 24.321 s**.

Run dirs (folder stamp = start UTC):  
`H_*_2026-09-18_03-50-56` … `H_science_journalist_2026-09-18_04-08-22`.

| Config | START (UTC) | END (UTC) | elapsedMs |
|---|---|---|---|
| H_conspiracy_believer | 03:50:56.731Z | 03:54:28.037Z | 211305 |
| H_conspiracy_haarp_weather | 03:50:56.740Z | 03:54:35.708Z | 218966 |
| H_conspiracy_depopulation | 03:54:28.038Z | 03:57:54.576Z | 206537 |
| H_conspiracy_climate_piggyback | 03:54:35.709Z | 03:57:31.811Z | 176101 |
| H_climate_action_advocate | 03:57:31.812Z | 04:00:33.695Z | 181882 |
| H_climate_justice_youth | 03:57:54.577Z | 04:01:30.321Z | 215743 |
| H_mitigation_first_policy | 04:00:33.695Z | 04:03:41.611Z | 187914 |
| H_environmental_concern | 04:01:30.322Z | 04:04:47.471Z | 197148 |
| H_ozone_stratosphere_specialist | 04:03:41.611Z | 04:06:57.253Z | 195640 |
| H_biodiversity_food_security | 04:04:47.472Z | 04:08:22.656Z | 215184 |
| H_climate_scientist | 04:06:57.254Z | 04:10:28.566Z | 211311 |
| H_science_journalist | 04:08:22.657Z | 04:11:21.052Z | 178393 |

---

## He — heterogeneous chains

| Event | UTC | IST |
|---|---|---|
| PHASE He n=12 concurrency=2 | `04:12:14.281Z` | `09:42:14.281` |
| First START (`He_mix_00` / `He_mix_01`) | `04:12:14.282Z` / `04:12:14.397Z` | `09:42:14` |
| Last END (`He_mix_11`) | `04:35:01.173Z` | `10:05:01.173` |
| CAMPAIGN finished phase=He | `04:35:03.244Z` | `10:05:03.244` |

**Wall:** **22 m 48.963 s** · first START→last END **1366.891 s** = **22 m 46.891 s**.

Run dirs: `He_mix_00_2026-09-18_04-12-14` … `He_mix_11_2026-09-18_04-31-03`.

| Config | START (UTC) | END (UTC) | elapsedMs |
|---|---|---|---|
| He_mix_00 | 04:12:14.282Z | 04:15:31.567Z | 197283 |
| He_mix_01 | 04:12:14.397Z | 04:15:29.790Z | 195390 |
| He_mix_02 | 04:15:29.790Z | 04:19:13.800Z | 224008 |
| He_mix_03 | 04:15:31.568Z | 04:18:37.614Z | 186045 |
| He_mix_04 | 04:18:37.615Z | 04:21:34.461Z | 176844 |
| He_mix_05 | 04:19:13.800Z | 04:23:12.755Z | 238953 |
| He_mix_06 | 04:21:34.461Z | 04:25:16.261Z | 221798 |
| He_mix_07 | 04:23:12.756Z | 04:27:24.033Z | 251276 |
| He_mix_08 | 04:25:16.262Z | 04:29:08.483Z | 232218 |
| He_mix_09 | 04:27:24.033Z | 04:31:03.785Z | 219750 |
| He_mix_10 | 04:29:08.483Z | 04:31:53.150Z | 164665 |
| He_mix_11 | 04:31:03.786Z | 04:35:01.173Z | 237386 |

---

## A — graphs (two attempts)

### Attempt 1 — concurrency=1

| Event | UTC | IST |
|---|---|---|
| PHASE A n=4 concurrency=1 | `04:36:11.428Z` | `10:06:11.428` |
| END A_sf_hom | `05:06:16.732Z` | `10:36:16.732` |
| END A_sf_mix | `05:21:10.543Z` | `10:51:10.543` |
| END A_er_hom (fail) | `05:21:10.651Z` | `10:51:10.651` |
| END A_er_mix (fail) | `05:21:10.758Z` | `10:51:10.758` |
| CAMPAIGN finished phase=A | `05:21:13.284Z` | `10:51:13.284` |

**Wall:** **45 m 1.856 s**.

| Config | START | END | elapsedMs | status |
|---|---|---|---|---|
| A_sf_hom | 04:36:11.430Z | 05:06:16.732Z | 1805300 | 0 done |
| A_sf_mix | 05:06:16.733Z | 05:21:10.543Z | 893807 | 0 done |
| A_er_hom | 05:21:10.544Z | 05:21:10.651Z | 105 | 1 fail |
| A_er_mix | 05:21:10.653Z | 05:21:10.758Z | 103 | 1 fail |

Run dirs: `A_sf_hom_2026-09-18_04-36-11`, `A_sf_mix_2026-09-18_05-06-16`, `A_er_*_2026-09-18_05-21-10` (failed).

### Attempt 2 — concurrency=2 (retry after mulberry32 fix)

| Event | UTC | IST |
|---|---|---|
| PHASE A n=4 concurrency=2 | `05:24:05.653Z` | `10:54:05.653` |
| SKIP A_sf_hom / A_sf_mix | `05:24:05.662Z` / `05:24:05.670Z` | — |
| START A_er_hom + A_er_mix | `05:24:05.671Z` / `05:24:05.686Z` | `10:54:05` |
| END A_er_mix | `05:44:50.898Z` | `11:14:50.898` |
| END A_er_hom | `05:50:38.265Z` | `11:20:38.265` |
| CAMPAIGN finished phase=A | `05:50:41.313Z` | `11:20:41.313` |

**Wall:** **26 m 35.660 s**.

| Config | START | END | elapsedMs | status |
|---|---|---|---|---|
| A_er_mix | 05:24:05.686Z | 05:44:50.898Z | 1245211 | 0 done |
| A_er_hom | 05:24:05.671Z | 05:50:38.265Z | 1592592 | 0 done |

Run dirs: `A_er_*_2026-09-18_05-24-05`.

**Successful A cell wall (sum of live elapsedMs):** 1805300 + 893807 + 1245211 + 1592592 = **5536910 ms** ≈ **1 h 32 m 16.910 s** compute-time (overlaps during attempt 2).

---

## B — fact-check n∈{1,3,5}

| Event | UTC | IST |
|---|---|---|
| PHASE B n=3 concurrency=1 | `05:51:25.287Z` | `11:21:25.287` |
| END B_sf_mix_n1 | `05:56:49.014Z` | `11:26:49.014` |
| END B_sf_mix_n3 | `06:03:18.144Z` | `11:33:18.144` |
| END B_sf_mix_n5 | `06:07:59.761Z` | `11:37:59.761` |
| CAMPAIGN finished phase=B | `06:08:02.824Z` | `11:38:02.824` |

**Wall:** **16 m 37.537 s** (fully sequential).

| Config | START | END | elapsedMs | runDir |
|---|---|---|---|---|
| B_sf_mix_n1 | 05:51:25.289Z | 05:56:49.014Z | 323723 | `B_sf_mix_n1_2026-09-18_05-51-25` |
| B_sf_mix_n3 | 05:56:49.015Z | 06:03:18.144Z | 389127 | `B_sf_mix_n3_2026-09-18_05-56-49` |
| B_sf_mix_n5 | 06:03:18.145Z | 06:07:59.761Z | 281615 | `B_sf_mix_n5_2026-09-18_06-03-18` |

---

## D — echo chamber

| Event | UTC | IST |
|---|---|---|
| PHASE D n=1 concurrency=1 | `06:08:40.718Z` | `11:38:40.718` |
| START D_echo_mix | `06:08:40.720Z` | `11:38:40.720` |
| END D_echo_mix | `06:12:42.474Z` | `11:42:42.474` |
| CAMPAIGN finished phase=D | `06:12:45.737Z` | `11:42:45.737` |

**Wall:** **4 m 5.019 s** · cell `elapsedMs=241752` (**4 m 1.752 s**).  
Run dir: `D_echo_mix_2026-09-18_06-08-40`.  
(Pilot `D_echo_mix_2026-09-18_03-15-58` is **not** this timeline.)

---

## Compact IST view (local wall)

| Phase | Start IST | End IST | Duration |
|---|---|---|---|
| H | 09:20:56.730 | 09:41:22.220 | 20 m 25.490 s |
| He | 09:42:14.281 | 10:05:03.244 | 22 m 48.963 s |
| A₁ | 10:06:11.428 | 10:51:13.284 | 45 m 1.856 s |
| A₂ | 10:54:05.653 | 11:20:41.313 | 26 m 35.660 s |
| B | 11:21:25.287 | 11:38:02.824 | 16 m 37.537 s |
| D | 11:38:40.718 | 11:42:45.737 | 4 m 5.019 s |

---

## Folder-timestamp cross-check

Canonical full-campaign run folders embed the **START** UTC in the name (`YYYY-MM-DD_HH-MM-SS`). Those stamps match LOG START lines (e.g. H pair `…_03-50-56`, He `…_04-12-14`, A SF `…_04-36-11` / `…_05-06-16`, A ER success `…_05-24-05`, B `…_05-51-25` / `…_05-56-49` / `…_06-03-18`, D `…_06-08-40`). Earlier pilot folders under `runs/` (`02-*`, `03-02`…`03-15`) are **out of scope** for this campaign timeline.
