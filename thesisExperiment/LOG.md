# thesisExperiment campaign log (append-only)

Do not put API keys in this file.

## 2026-09-18T09:10:00+05:30 — full-campaign kickoff (campaign executor)

**Context.** Folder currently holds a **2-article N=1 real-LLM pilot** (`scopex_2017`, `chemtrails_gates_2018_2021`; 3 Debnath BPs; 8 nodes × 6 ticks). That is **not** thesis-sized. User instruction: finish remaining work so they only write ~60 pages. No commit. No dry-run numbers. Model: `gpt-4o-mini`.

**Gaps vs completeness bar**

| Item | Pilot | Target |
|---|---|---|
| Articles + 5 QA | 2 | ≥12 |
| Personas | 3 BPs | ≥12 Debnath-expanded + experts |
| LOG.md / analysis/ | missing | required |
| Exp H homogeneous chains | none | 12p × 12a × 8 hops |
| Exp He heterogeneous chains | none | 12 mixes × 12a × 8 hops |
| Exp A graphs | 2×2 × 2 articles, 6 ticks | 2 topo × 2 mix × ≥6 articles, 8 ticks |
| Exp B n∈{1,3,5} | n=1,3 only | add n=5 if affordable |
| Pfeffer echo cell | D_echo died (seed drop / unseeded RNG) | retry with seeded graph + min out-degree |
| Figures | 3 png | 8–12 with captions |
| Heatmaps persona×article | none | required |

**Scale decision (cost/time, not faking cells)**

- Hops/ticks for chains: **8** (cut from 12; logged).
- Graph A article subset: **6** of 12 (logged). H/He still use all 12.
- N=1, labeled. Concurrency 2 for chain cells.
- Est. spend: ~7–8k LLM calls, **~$1.2–2.0** list-price `gpt-4o-mini` (prompt $0.15/M, completion $0.60/M). Will log actual usage.

**Cut rule.** If a cell stalls >25 min with no stdout, checkpoint and continue. Do not invent MI/MPR.

**Not downloading.** OSF `dataset.csv` ~662 MB tweet IDs. Mendeley tweet-ID dump. Documented limitation; BPs remain theory-faithful reductions.

---

## 2026-09-18T03:49:32.912Z

PROBE status=0 failed=false elapsedMs=5174 usage=1 calls, 551 prompt / 13 completion tokens ~$0.0001

---

## 2026-09-18T03:50:56.729Z

PROBE status=0 failed=false elapsedMs=1602 usage=1 calls, 551 prompt / 13 completion tokens ~$0.0001

---

## 2026-09-18T03:50:56.730Z

PHASE H n=12 concurrency=2

---

## 2026-09-18T03:50:56.731Z

START H_conspiracy_believer config=thesisExperiment/configs/full/H_conspiracy_believer.json

---

## 2026-09-18T03:50:56.740Z

START H_conspiracy_haarp_weather config=thesisExperiment/configs/full/H_conspiracy_haarp_weather.json

---

## 2026-09-18T03:54:28.037Z

END H_conspiracy_believer status=0 elapsedMs=211305 runDir=H_conspiracy_believer_2026-09-18_03-50-56 usage=147 calls, 64871 prompt / 14040 completion tokens ~$0.0182 killedFor=none done=true

---

## 2026-09-18T03:54:28.038Z

START H_conspiracy_depopulation config=thesisExperiment/configs/full/H_conspiracy_depopulation.json

---

## 2026-09-18T03:54:35.708Z

END H_conspiracy_haarp_weather status=0 elapsedMs=218966 runDir=H_conspiracy_haarp_weather_2026-09-18_03-50-56 usage=156 calls, 65665 prompt / 15680 completion tokens ~$0.0193 killedFor=none done=true

---

## 2026-09-18T03:54:35.709Z

START H_conspiracy_climate_piggyback config=thesisExperiment/configs/full/H_conspiracy_climate_piggyback.json

---

## 2026-09-18T03:57:31.811Z

END H_conspiracy_climate_piggyback status=0 elapsedMs=176101 runDir=H_conspiracy_climate_piggyback_2026-09-18_03-54-35 usage=121 calls, 52215 prompt / 13419 completion tokens ~$0.0159 killedFor=none done=true

---

## 2026-09-18T03:57:31.812Z

START H_climate_action_advocate config=thesisExperiment/configs/full/H_climate_action_advocate.json

---

## 2026-09-18T03:57:54.576Z

END H_conspiracy_depopulation status=0 elapsedMs=206537 runDir=H_conspiracy_depopulation_2026-09-18_03-54-28 usage=152 calls, 64121 prompt / 15212 completion tokens ~$0.0187 killedFor=none done=true

---

## 2026-09-18T03:57:54.577Z

START H_climate_justice_youth config=thesisExperiment/configs/full/H_climate_justice_youth.json

---

## 2026-09-18T04:00:33.695Z

END H_climate_action_advocate status=0 elapsedMs=181882 runDir=H_climate_action_advocate_2026-09-18_03-57-31 usage=132 calls, 55079 prompt / 12909 completion tokens ~$0.016 killedFor=none done=true

---

## 2026-09-18T04:00:33.695Z

START H_mitigation_first_policy config=thesisExperiment/configs/full/H_mitigation_first_policy.json

---

## 2026-09-18T04:01:30.321Z

END H_climate_justice_youth status=0 elapsedMs=215743 runDir=H_climate_justice_youth_2026-09-18_03-57-54 usage=152 calls, 61481 prompt / 15267 completion tokens ~$0.0184 killedFor=none done=true

---

## 2026-09-18T04:01:30.322Z

START H_environmental_concern config=thesisExperiment/configs/full/H_environmental_concern.json

---

## 2026-09-18T04:03:41.611Z

END H_mitigation_first_policy status=0 elapsedMs=187914 runDir=H_mitigation_first_policy_2026-09-18_04-00-33 usage=119 calls, 49376 prompt / 12331 completion tokens ~$0.0148 killedFor=none done=true

---

## 2026-09-18T04:03:41.611Z

START H_ozone_stratosphere_specialist config=thesisExperiment/configs/full/H_ozone_stratosphere_specialist.json

---

## 2026-09-18T04:04:47.471Z

END H_environmental_concern status=0 elapsedMs=197148 runDir=H_environmental_concern_2026-09-18_04-01-30 usage=128 calls, 52333 prompt / 13690 completion tokens ~$0.0161 killedFor=none done=true

---

## 2026-09-18T04:04:47.472Z

START H_biodiversity_food_security config=thesisExperiment/configs/full/H_biodiversity_food_security.json

---

## 2026-09-18T04:06:57.253Z

END H_ozone_stratosphere_specialist status=0 elapsedMs=195640 runDir=H_ozone_stratosphere_specialist_2026-09-18_04-03-41 usage=131 calls, 53125 prompt / 14015 completion tokens ~$0.0164 killedFor=none done=true

---

## 2026-09-18T04:06:57.254Z

START H_climate_scientist config=thesisExperiment/configs/full/H_climate_scientist.json

---

## 2026-09-18T04:08:22.656Z

END H_biodiversity_food_security status=0 elapsedMs=215184 runDir=H_biodiversity_food_security_2026-09-18_04-04-47 usage=152 calls, 59622 prompt / 15208 completion tokens ~$0.0181 killedFor=none done=true

---

## 2026-09-18T04:08:22.657Z

START H_science_journalist config=thesisExperiment/configs/full/H_science_journalist.json

---

## 2026-09-18T04:10:28.566Z

END H_climate_scientist status=0 elapsedMs=211311 runDir=H_climate_scientist_2026-09-18_04-06-57 usage=140 calls, 58325 prompt / 14641 completion tokens ~$0.0175 killedFor=none done=true

---

## 2026-09-18T04:11:21.052Z

END H_science_journalist status=0 elapsedMs=178393 runDir=H_science_journalist_2026-09-18_04-08-22 usage=119 calls, 47000 prompt / 11680 completion tokens ~$0.0141 killedFor=none done=true

---

## 2026-09-18T04:11:22.219Z

PARSE after H exit=0

---

## 2026-09-18T04:11:22.220Z

CAMPAIGN command finished phase=H

---

## 2026-09-18T04:12:14.281Z

PROBE status=0 failed=false elapsedMs=3725 usage=2 calls, 1012 prompt / 220 completion tokens ~$0.0003

---

## 2026-09-18T04:12:14.281Z

PHASE He n=12 concurrency=2

---

## 2026-09-18T04:12:14.282Z

START He_mix_00 config=thesisExperiment/configs/full/He_mix_00.json

---

## 2026-09-18T04:12:14.397Z

START He_mix_01 config=thesisExperiment/configs/full/He_mix_01.json

---

## 2026-09-18T04:15:29.790Z

END He_mix_01 status=0 elapsedMs=195390 runDir=He_mix_01_2026-09-18_04-12-14 usage=138 calls, 56623 prompt / 14145 completion tokens ~$0.017 killedFor=none done=true

---

## 2026-09-18T04:15:29.790Z

START He_mix_02 config=thesisExperiment/configs/full/He_mix_02.json

---

## 2026-09-18T04:15:31.567Z

END He_mix_00 status=0 elapsedMs=197283 runDir=He_mix_00_2026-09-18_04-12-14 usage=142 calls, 58143 prompt / 13738 completion tokens ~$0.017 killedFor=none done=true

---

## 2026-09-18T04:15:31.568Z

START He_mix_03 config=thesisExperiment/configs/full/He_mix_03.json

---

## 2026-09-18T04:18:37.614Z

END He_mix_03 status=0 elapsedMs=186045 runDir=He_mix_03_2026-09-18_04-15-31 usage=136 calls, 54319 prompt / 13538 completion tokens ~$0.0163 killedFor=none done=true

---

## 2026-09-18T04:18:37.615Z

START He_mix_04 config=thesisExperiment/configs/full/He_mix_04.json

---

## 2026-09-18T04:19:13.800Z

END He_mix_02 status=0 elapsedMs=224008 runDir=He_mix_02_2026-09-18_04-15-29 usage=164 calls, 66116 prompt / 16318 completion tokens ~$0.0197 killedFor=none done=true

---

## 2026-09-18T04:19:13.800Z

START He_mix_05 config=thesisExperiment/configs/full/He_mix_05.json

---

## 2026-09-18T04:21:34.461Z

END He_mix_04 status=0 elapsedMs=176844 runDir=He_mix_04_2026-09-18_04-18-37 usage=122 calls, 49935 prompt / 11851 completion tokens ~$0.0146 killedFor=none done=true

---

## 2026-09-18T04:21:34.461Z

START He_mix_06 config=thesisExperiment/configs/full/He_mix_06.json

---

## 2026-09-18T04:23:12.755Z

END He_mix_05 status=0 elapsedMs=238953 runDir=He_mix_05_2026-09-18_04-19-13 usage=166 calls, 67045 prompt / 16226 completion tokens ~$0.0198 killedFor=none done=true

---

## 2026-09-18T04:23:12.756Z

START He_mix_07 config=thesisExperiment/configs/full/He_mix_07.json

---

## 2026-09-18T04:25:16.261Z

END He_mix_06 status=0 elapsedMs=221798 runDir=He_mix_06_2026-09-18_04-21-34 usage=148 calls, 60030 prompt / 15050 completion tokens ~$0.018 killedFor=none done=true

---

## 2026-09-18T04:25:16.262Z

START He_mix_08 config=thesisExperiment/configs/full/He_mix_08.json

---

## 2026-09-18T04:27:24.033Z

END He_mix_07 status=0 elapsedMs=251276 runDir=He_mix_07_2026-09-18_04-23-12 usage=176 calls, 72009 prompt / 18386 completion tokens ~$0.0218 killedFor=none done=true

---

## 2026-09-18T04:27:24.033Z

START He_mix_09 config=thesisExperiment/configs/full/He_mix_09.json

---

## 2026-09-18T04:29:08.483Z

END He_mix_08 status=0 elapsedMs=232218 runDir=He_mix_08_2026-09-18_04-25-16 usage=167 calls, 69876 prompt / 16633 completion tokens ~$0.0205 killedFor=none done=true

---

## 2026-09-18T04:29:08.483Z

START He_mix_10 config=thesisExperiment/configs/full/He_mix_10.json

---

## 2026-09-18T04:31:03.785Z

END He_mix_09 status=0 elapsedMs=219750 runDir=He_mix_09_2026-09-18_04-27-24 usage=155 calls, 64103 prompt / 15750 completion tokens ~$0.0191 killedFor=none done=true

---

## 2026-09-18T04:31:03.786Z

START He_mix_11 config=thesisExperiment/configs/full/He_mix_11.json

---

## 2026-09-18T04:31:53.150Z

END He_mix_10 status=0 elapsedMs=164665 runDir=He_mix_10_2026-09-18_04-29-08 usage=121 calls, 50279 prompt / 11922 completion tokens ~$0.0147 killedFor=none done=true

---

## 2026-09-18T04:35:01.173Z

END He_mix_11 status=0 elapsedMs=237386 runDir=He_mix_11_2026-09-18_04-31-03 usage=169 calls, 69022 prompt / 16902 completion tokens ~$0.0205 killedFor=none done=true

---

## 2026-09-18T04:35:03.243Z

PARSE after He exit=0

---

## 2026-09-18T04:35:03.244Z

CAMPAIGN command finished phase=He

---

## 2026-09-18T04:36:11.428Z

PROBE status=0 failed=false elapsedMs=3811 usage=2 calls, 1028 prompt / 240 completion tokens ~$0.0003

---

## 2026-09-18T04:36:11.428Z

PHASE A n=4 concurrency=1

---

## 2026-09-18T04:36:11.430Z

START A_sf_hom config=thesisExperiment/configs/full/A_sf_hom.json

---

## 2026-09-18T05:06:16.732Z

END A_sf_hom status=0 elapsedMs=1805300 runDir=A_sf_hom_2026-09-18_04-36-11 usage=1465 calls, 659196 prompt / 117952 completion tokens ~$0.1697 killedFor=none done=true

---

## 2026-09-18T05:06:16.733Z

START A_sf_mix config=thesisExperiment/configs/full/A_sf_mix.json

---

## 2026-09-18T05:21:10.543Z

END A_sf_mix status=0 elapsedMs=893807 runDir=A_sf_mix_2026-09-18_05-06-16 usage=707 calls, 282419 prompt / 53431 completion tokens ~$0.0744 killedFor=none done=true

---

## 2026-09-18T05:21:10.544Z

START A_er_hom config=thesisExperiment/configs/full/A_er_hom.json

---

## 2026-09-18T05:21:10.651Z

END A_er_hom status=1 elapsedMs=105 runDir=A_er_hom_2026-09-18_05-21-10 usage=n/a killedFor=none done=false

---

## 2026-09-18T05:21:10.653Z

START A_er_mix config=thesisExperiment/configs/full/A_er_mix.json

---

## 2026-09-18T05:21:10.758Z

END A_er_mix status=1 elapsedMs=103 runDir=A_er_mix_2026-09-18_05-21-10 usage=n/a killedFor=none done=false

---

## 2026-09-18T05:21:13.283Z

PARSE after A exit=0

---

## 2026-09-18T05:21:13.284Z

CAMPAIGN command finished phase=A

---

## 2026-09-18T05:24:05.653Z

PROBE status=0 failed=false elapsedMs=3564 usage=2 calls, 1010 prompt / 217 completion tokens ~$0.0003

---

## 2026-09-18T05:24:05.653Z

PHASE A n=4 concurrency=2

---

## 2026-09-18T05:24:05.662Z

SKIP complete A_sf_hom (A_sf_hom_2026-09-18_04-36-11)

---

## 2026-09-18T05:24:05.670Z

SKIP complete A_sf_mix (A_sf_mix_2026-09-18_05-06-16)

---

## 2026-09-18T05:24:05.671Z

START A_er_hom config=thesisExperiment/configs/full/A_er_hom.json

---

## 2026-09-18T05:24:05.686Z

START A_er_mix config=thesisExperiment/configs/full/A_er_mix.json

---

## 2026-09-18T05:44:50.898Z

END A_er_mix status=0 elapsedMs=1245211 runDir=A_er_mix_2026-09-18_05-24-05 usage=976 calls, 406208 prompt / 77455 completion tokens ~$0.1074 killedFor=none done=true

---

## 2026-09-18T05:50:38.265Z

END A_er_hom status=0 elapsedMs=1592592 runDir=A_er_hom_2026-09-18_05-24-05 usage=1218 calls, 552513 prompt / 99715 completion tokens ~$0.1427 killedFor=none done=true

---

## 2026-09-18T05:50:41.312Z

PARSE after A exit=0

---

## 2026-09-18T05:50:41.313Z

CAMPAIGN command finished phase=A

---

## 2026-09-18T05:51:25.287Z

PROBE status=0 failed=false elapsedMs=3598 usage=2 calls, 1023 prompt / 235 completion tokens ~$0.0003

---

## 2026-09-18T05:51:25.287Z

PHASE B n=3 concurrency=1

---

## 2026-09-18T05:51:25.289Z

START B_sf_mix_n1 config=thesisExperiment/configs/full/B_sf_mix_n1.json

---

## 2026-09-18T05:56:49.014Z

END B_sf_mix_n1 status=0 elapsedMs=323723 runDir=B_sf_mix_n1_2026-09-18_05-51-25 usage=248 calls, 104019 prompt / 20206 completion tokens ~$0.0277 killedFor=none done=true

---

## 2026-09-18T05:56:49.015Z

START B_sf_mix_n3 config=thesisExperiment/configs/full/B_sf_mix_n3.json

---

## 2026-09-18T06:03:18.144Z

END B_sf_mix_n3 status=0 elapsedMs=389127 runDir=B_sf_mix_n3_2026-09-18_05-56-49 usage=267 calls, 113131 prompt / 21838 completion tokens ~$0.0301 killedFor=none done=true

---

## 2026-09-18T06:03:18.145Z

START B_sf_mix_n5 config=thesisExperiment/configs/full/B_sf_mix_n5.json

---

## 2026-09-18T06:07:59.761Z

END B_sf_mix_n5 status=0 elapsedMs=281615 runDir=B_sf_mix_n5_2026-09-18_06-03-18 usage=205 calls, 89972 prompt / 16886 completion tokens ~$0.0236 killedFor=none done=true

---

## 2026-09-18T06:08:02.824Z

PARSE after B exit=0

---

## 2026-09-18T06:08:02.824Z

CAMPAIGN command finished phase=B

---

## 2026-09-18T06:08:40.718Z

PROBE status=0 failed=false elapsedMs=3742 usage=2 calls, 998 prompt / 210 completion tokens ~$0.0003

---

## 2026-09-18T06:08:40.718Z

PHASE D n=1 concurrency=1

---

## 2026-09-18T06:08:40.720Z

START D_echo_mix config=thesisExperiment/configs/full/D_echo_mix.json

---

## 2026-09-18T06:12:42.474Z

END D_echo_mix status=0 elapsedMs=241752 runDir=D_echo_mix_2026-09-18_06-08-40 usage=184 calls, 78276 prompt / 14455 completion tokens ~$0.0204 killedFor=none done=true

---

## 2026-09-18T06:12:45.736Z

PARSE after D exit=0

---

## 2026-09-18T06:12:45.737Z

CAMPAIGN command finished phase=D

---

## 2026-09-18T06:20:00Z — campaign executor wrap

**Real LLM, not dry-run.** Probe succeeded (gpt-4o-mini).

| Item | Count |
|---|---|
| Articles with 5 QA | 12 |
| Personas | 12 (4 conspiracy + 3 climate-action + 3 environmental + 2 expert) |
| H cells | 144 |
| He cells | 144 |
| A cells | 24 (6 articles × 4 graph conditions) |
| B cells | 3 (n=1,3,5) |
| D echo | 1 live rerun (184 calls); old 03:15 cell invalid |
| LLM calls | 8723 |
| Est. USD (list price) | ~1.02 |

**k* definition:** network-mean MI>3 with no later recovery.

**Dead/gap cells (not faked):** A_sf_mix dropped scopex, chemtrails, SAI after 1 event; A_er_mix polar_bears 1 event. Some H/He cells have MI=0 because expert/mitigation personas kept GT, not because of dry-run.

**Engine fix:** echo chamber now uses `graphRandomSeed` + `minSeedOutDegree`. Restored `SocietyGraph.mulberry32` after ER crash (`TypeError: mulberry32 is not a function`).

**Cuts:** hops 8 not 12/30; A articles 6/12; 5 QA; gpt-4o-mini; N=1; no 662MB tweet dump.

Student can start writing methods/results from `analysis/` + `results/FIGURES.md` + `results/findings.md`. Do not self-PASS ACCEPTANCE.md; independent checker should re-read disk.

---

## 2026-09-18T15:25:00Z — Phase 2 kickoff (isolated)

**Decision.** New campaign for 8 topologies × homo/hetero × `continuous` + `dual` IFD, then Debnath network reconstruct + Pfeffer comparison.

**Isolation.** Do not write to `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Use `runs_phase2/`, `results_phase2/`, `configs/phase2/`. Plan: `thesisExperiment/PHASE2_PLAN.md`.

**Hops.** Still 8 (logged cost cut vs CIKM 30; not Debnath). Core articles: 6 (same Exp A subset). N=1, gpt-4o-mini.

---

## 2026-09-18T15:34:00Z — Phase 2 Debnath reconstruct

Hydration: no Twitter/X bearer; tweets **not** invented. Mendeley files API body `error 400`. OSF `dataset.csv` is 661,867,256 bytes and is **not** IDs-only (text + user fields); a 5k-line peek was discarded. `tweet_id` is scientific notation → 0 hydratable IDs.

Fallback: documented hashtag co-occurrence graph, **not a retweet cascade** — 63 nodes, 228 directed edges, seed `chemtrails_hub`. FakeNewsNet-shaped for `RealGraphImporter`. Dnet configs: `Dnet_{c|d}_{H_conspiracy|He_mixed}.json` (`continuous` + `dual`; homo conspiracy + mixed BPs; seeds `scopex_2017`, `chemtrails_gates_2018_2021`; `outputRoot` `runs_phase2`). LLM not run (`OPENAI_API_KEY` absent). Did not write `runs/` or `results/tables/`.

---

## 2026-09-18T16:06:00Z — Dnet keep-graph + runner (independent of T-H/T-He)

**Graph kept (not regenerated).** `thesisExperiment/data/derived/debnath_hashtag_cascade.json` already existed (63 `user_profiles`, 228 directed `retweets[]` as an edge container, `graph_topology` 63/228). Kind: **hashtag co-occurrence / same-cluster**. `notARetweetCascade: true`. `empiricalMPR: false`. Seed hashtag user: `chemtrails_hub` (sim `user_chemtrails_hub`). Identity mix: conspiracy 28 / climate_action 19 / environmental_concern 14 / other 2. Not tiny; no extra paper-hashtag expansion.

**Not a retweet cascade.** Twitter/X hydration did not run. Edges occupy FakeNewsNet `retweets[]` only so `RealGraphImporter` / `SocietyGraph.buildCustom` can attach topology. Comparison later is structural/hashtag, not “simulated MPR = Twitter MPR.”

**Dnet configs (already present).** `Dnet_c_H_conspiracy`, `Dnet_d_H_conspiracy`, `Dnet_c_He_mixed`, `Dnet_d_He_mixed` — custom nodes/edges, `outputRoot` `runs_phase2`, 2 climate seeds, homo conspiracy vs mixed BPs, continuous vs dual.

**Runner.** `thesisExperiment/scripts/run_dnet.js` (probe tiny 3-node custom cell, then all Dnet_ configs, concurrency 2, real API). Compare: `thesisExperiment/scripts/compare_phase2.js` after Dnet. Isolation: do not write `runs/` or `results/tables/`.

---

## 2026-09-18T16:06:00Z — Phase 2 ABORT (OPENAI_API_KEY still missing)

**Key check (no values logged).** `/workspace/.env` does not exist. `OPENAI_API_KEY` unset in process env (length=0). `isMockKey` from `src/loadEnv.js` was not applied because there is no value. Searched `/workspace`, `/home/ubuntu`, and process env names only. Did **not** invent a key. Did **not** write `.env`.

**Probe.** Not started. Instruction: stop if key missing/placeholder.

**Grid.** ABORT. Configs completed: **0 / 288** (192 T-H + 96 T-He). Did **not** dry-run. LLM calls: **0**. Est. USD: **$0**.

**Parse / tables.** Not run. No `results_phase2` tables written this attempt.

**Isolation.** Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`.

**Resume.** Place a non-placeholder `OPENAI_API_KEY` in gitignored `/workspace/.env`, then `node thesisExperiment/scripts/run_phase2.js --probe-only`. If both continuous and dual probes pass with real LLM usage (not 0 calls): `node thesisExperiment/scripts/run_phase2.js --phase all --concurrency 4`.

---

