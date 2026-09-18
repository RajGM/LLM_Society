# CHECKER REPORT — 18 September 2026 (rewritten)

Independent scientific check against `thesisExperiment/ACCEPTANCE.md`, `discovery/03_examiner/ACCEPTANCE_1_0.md`, and `discovery/11_redteam/loop_instructions.md`.  
**No new LLM grid. No keys printed. No commit.** The prior `CHECKER_REPORT.md` described a 2-seed graph pilot and is **obsolete**.

**Overall vs ACCEPTANCE.md: FAIL.** Automatic FAIL triggers F1–F5 do **not** fire on the campaign now offered as results. Must-haves M1–M3, M6, M7 exist on disk. The campaign is still **not** an accepted confirmatory thesis grid: N=1, dead cells remain inside heatmaps and means (loop **F12**), Experiment B is volume-confounded, `summary.json` `"thesisGrade": true` is a **self-PASS the executor was forbidden to make**, and ACCEPTANCE_1_0 eligibility is still FAIL.

**Can the student start writing methods + results from these files?** **Yes, as an exploratory N=1 case-study chapter**, citing `analysis/`, `results/FIGURES.md`, `results/tables/`, and a **demoted** findings text. **No** as “the campaign passed; I only write a 1.0 thesis.” Leave `"thesisGrade": true` out of the PDF.

---

## What the executor claimed vs what is on disk

| Claim | Disk | Checker |
|---|---|---|
| 12 articles × 12 personas | `articles/articles.json`: **12** ids, each **5** questions + **5** `groundTruth`; `personas/expanded_twelve.json`: **12** unique ids | **True** |
| 144 homogeneous + 144 heterogeneous real gpt-4o-mini chain cells | `results/tables/H_rows.csv` **144** rows; `He_rows.csv` **144** rows; 12 `runs/H_*_2026-09-18_03-*`/`04-*` dirs + 12 `runs/He_mix_*` dirs; all CSV `model=gpt-4o-mini`, `status=complete` | **True as cell counts.** Not all cells are live cascades (below). |
| Exp A 24 graph cells | `A_rows.csv` **24** rows = 4 conditions × 6 articles; latest dirs `A_sf_hom_2026-09-18_04-36-11`, `A_sf_mix_…_05-06-16`, `A_er_*_…_05-24-05` | **True.** 4/24 are seed-drop (1 event, MI=0). |
| Exp B n=1,3,5 | `B_before_after.csv` **3** rows; `B_sf_mix_n5_2026-09-18_06-03-18` exists (`configs/full/B_sf_mix_n5.json` inject tick 5) | **True that n=5 ran.** Identification still **FAIL**. |
| D echo live rerun | `D_echo_mix_2026-09-18_06-08-40/metadata.json` `llmUsage.calls=184`; `summary.md` 151 events, mean MPR 3.3535. Old `D_echo_mix_2026-09-18_03-15-58` is leftover. | **True** that the 06:08 cell is live. Not proposal \(t=\{10,30,50\}\). |
| ~8723 calls, ~$1.02 | `results/summary.json` `llmUsage`: **32** unique experiments, **sum calls = 8723**, **sum estimatedUsd = 1.0185**, `generatedAt=2026-09-18T06:13:25.119Z`, `mode=real` | **True** as a list-price heuristic, not an invoice. |
| Homogeneous conspiracy MPR ≈ 2.28 vs others ≈ 0.64 | Recomputed from `H_rows.csv` `meanNodeMPR`: conspiracy-cluster 4 personas × 12 = 48 cells **mean 2.2812**; other 96 cells **mean 0.6406**; He 144-cell mean **1.6163** | **Numerically true, including dead zeros.** |
| Paste-ready `analysis/`, `FIGURES.md`, `findings.md` | `analysis/{methods,results_paragraphs,limitations,examiner_safe_claims,figure_captions}.md`; `results/FIGURES.md` + 16 PNGs under `results/figures/`; `results/findings.md` | **Files exist.** Not ACCEPTANCE-clean (self-PASS flag; zeros in heatmaps). |
| Still red: no 814k, N=1, dead mixed-graph seeds, Exp B confounded | Matches disk | **True.** Also red: same-family auditor, 5 QA, 8 hops, A uses 6/12 articles, empty human ratings, `thesisGrade: true`. |
| Do not self-PASS ACCEPTANCE.md | `summary.json` `"thesisGrade": true`; `summary.md` “Thesis-grade grid? **yes** (count bar)” | **Executor violated this.** Count bar ≠ ACCEPTANCE pass. |

`results/full_campaign_manifest.json`: `mode=real`, `model=gpt-4o-mini`, `startedAt=2026-09-18T03:49:27.732Z`, `finishedAt=2026-09-18T06:12:45.737Z`.

---

## Sources actually read this pass

| Source | Path | Notes |
|---|---|---|
| Rubric | `thesisExperiment/ACCEPTANCE.md` | Must-haves M1–M8; auto-FAIL F1–F5 |
| 1.0 eligibility | `thesisExperiment/discovery/03_examiner/ACCEPTANCE_1_0.md` | Stale snapshot (He=0). Re-scored below against **this** disk. |
| Loop gates | `thesisExperiment/discovery/11_redteam/loop_instructions.md` | HARD FAIL F1–F12 |
| Campaign docs | `LOG.md`, `README.md`, `pfeffer_mapping.md`, `findings.md`, `FIGURES.md` | Executor wrap 06:20Z |
| Machine tables | `results/summary.json`, `full_campaign_manifest.json`, `heatmaps.json`, `results/tables/*.csv` | `generatedAt` 06:13:25Z |
| Stimuli | `articles/articles.json`, `personas/expanded_twelve.json`, `personas/DEBNATH_MAPPING.md`, `configs/full/` | 12×12 design |
| Spot-check runs | listed in § Spot-check | Real vs dry-run |

`Paper/` PDFs were **not** re-opened this pass; ACCEPTANCE already encodes the CIKM/proposal bars.

---

## Automatic FAIL triggers (ACCEPTANCE.md)

| ID | Status | Evidence |
|---|---|---|
| F1 MI identically 0 | **Not fired** for the offered campaign as a whole | H maxEventMI range 0–5, not all-zero (mean of cell-mean MPR 1.1875). He max 0–5 (mean MPR 1.6163). A live cells reach MI=5. **Do fire** on leftover dry-run folders `runs/*_02-34-*` / `*_02-35-*` (all node MPR=0). Those **runDirs are absent** from `H_rows.csv` / `He_rows.csv` / `A_rows.csv`. |
| F2 Dry-run sentinels | **Not fired** if the student cites only `summary.json` `mode=real` tables | Sentinel: `runs/A_sf_hom_2026-09-18_02-34-15/metadata.json` has **no** `llmUsage.calls`; `results_scopex_2017.json` every node `mpr=0` with dozens of events; inbox `content` equals seed/`originalContent`. **Would fire** if those folders re-enter `summary.md`. |
| F3 &lt; 10 articles with QA | **Not fired** | 12 climate/geoeng articles, 5+5 QA each (`scopex_2017` … `attribution_extremes`). |
| F4 Missing hetero linear chain | **Not fired** | 12 `configs/full/He_mix_00.json`–`He_mix_11.json`, topology `linear_chain`, 8 unique personas/mix, 144 CSV rows. |
| F5 Only 2-seed mini-pilot | **Not fired** if the **full** H/He/A tables are the results chapter | Pilot leftovers remain under `runs/A_*_02-*` / `03-02` / `03-06`. README correctly says they are not the chapter. **Would fire** if the student pastes only the 08:47-era three bar PNGs (`mi_mpr_by_condition.png`, `kstar_by_condition.png`, `b_before_after.png`) as “the grid.” |

**Automatic FAIL: none on the offered full campaign.** That does **not** imply ACCEPTANCE PASS.

---

## Loop HARD FAIL (redteam `loop_instructions.md`)

| ID | Status | Evidence |
|---|---|---|
| F1 articles &lt; 10 | **not tripped** | 12 |
| F2 no homo/hetero heatmap PNG | **not tripped** | `results/figures/01_H_heatmap_mpr.png` (93291 B), `04_He_heatmap_mpr.png` (76745 B), plus max-MI and k\* maps; captions in `FIGURES.md` |
| F3 all k\* = none | **not tripped** | `analysis/results_paragraphs.md`: irreversible network k\* in **11** H cells and **22** He cells; A has multiple k\* ∈ {1,2,3,4} |
| F4 dry-run zeros in summary tables | **not tripped** for current CSV `runDir`s | Watch the leftover `*_02-34-*` folders |
| F5 dead-cascade rate ≥ 20% of cells | **not tripped globally** | events≤2: H **15/144 = 10.4%**, He **11/144 = 7.6%**, A **4/24 = 16.7%**, all-rows **30/316 ≈ 9.5%**. Graph A is **close** to the 20% knife-edge. |
| F6 homophily/PI with 0 LLM calls | **not tripped** on current D | D 06:08 has 184 calls. Echo CSV still prints topology homophily on **dead A article-rows** (PI=0 for `A_sf_mix`×scopex/chemtrails/SAI). Do not narrate those PI=0 rows as “mixed graphs suppress echo.” |
| F7 Pfeffer/Debnath/CIKM replication claim | **soft** | `findings.md` is mostly careful. `README.md` status table paints Exp B/D **green**. Root `README.md` still has the CIKM 2023 DOI badge (`10.1145/3627673`) — venue inflation lives **outside** this folder. |
| F8 Exp B dose–response without paired windows + control | **TRIPPED if B is a results claim** | `B_before_after.csv`: n=1 `nBefore=0`; n=3 `nBefore=7` vs `nAfter=159`; n=5 `26` vs `104`. No no-injection control. `findings.md` correctly says descriptive. README checklist still marks Exp B **green**. |
| F9 homophily=1 as echo evidence | **not tripped in findings.md** | D reports edge homophily **0.44**. `echo_modularity.csv` still lists A_hom rows with homophily **1**. `results_paragraphs.md` notes this is by construction — keep that sentence. |
| F10 model swap | **not tripped** | All reported metadata `gpt-4o-mini` |
| F11 hetero mixes lack expert/factual personas | **not tripped as a whole** | mix_03+ include `climate_scientist` / `science_journalist`. **mix_00, mix_01, mix_02, mix_11 have no expert_added ids** (`DEBNATH_MAPPING.md`). Do not call every He row a CIKM expert-mix replicate. |
| F12 aggregates include invalid cells | **TRIPPED** | `heatmaps.json` `H_meanMPR.matrix` encodes **0** for dead and GT-preserving cells (e.g. first column `attribution_extremes` is 0 for several personas). `A_rows.csv` still averages/plots `A_sf_mix`×{scopex, chemtrails, SAI} and `A_er_mix`×polar_bears as MPR=0. Conspiracy vs other **2.28 vs 0.64** uses those zeros. Loop PASS bar required dead cells **&lt;10% or listed and excluded** — they are listed in `findings.md` but **not excluded**. |

**Loop status: FAIL (F12; F8 if Experiment B is treated as identified).**

---

## Must-haves (ACCEPTANCE M1–M8)

### M1 ≥ 10 personas — **PASS**

- Used in H: 12 ids in `personas/expanded_twelve.json` and `personas/homo/*.json` (4 conspiracy variants, 3 climate-action, 3 environmental-concern, 2 expert-added).
- Homogeneous configs set `personasPath` to a **single-persona** file (`configs/full/H_conspiracy_believer.json` etc.).
- Heterogeneous: 8 **unique** personas per mix (`personas/hetero/mix_00.json`–`mix_11.json`); mixing rule in `README.md`.
- Climate/geoengineering Debnath-grounded + expert controls. Not a silent swap to CIKM “Young Parent.”
- Floor was 10. CIKM used 21 — **limitation**, not M1 fail.

### M2 ≥ 10 articles with QA — **PASS**

- Campaign `articlesPath` file has 12 climate/geoeng seeds, each 5 auditor questions aligned with `groundTruth`, non-empty `text` (999–1506 chars).
- Domain: SCoPEx, chemtrails–Gates, SAI, SPICE, Paris, consensus, glaciers, polar bears, CO2 fertilisation, sea-level, net-zero, attribution.
- 5 QA / `gpt-4o-mini` (not CIKM 10 / gpt-4o) — **must stay in Limitations**.

### M3 Homogeneous and heterogeneous linear chains — **PASS (existence); FAIL if sold as CIKM-scale**

| Check | Disk |
|---|---|
| Chain not graph | H/He `topology=linear_chain`, `numNodes=8`, `maxTicks=8` |
| Hom grid | 12 personas × 12 articles = **144** `H_rows.csv` |
| Hetero grid | 12 mixes × 12 articles = **144** `He_rows.csv` |
| Metrics | MI, MPR, k\*, heatmaps `01`–`05`, hop figures `11`–`12` |
| Not the 2-node probe | `_probe_api.json` is leftover plumbing |

Hop compression **8 vs 30** is logged (`LOG.md`, `pfeffer_mapping.md`). That is allowed by ACCEPTANCE if logged; it is **not** LASS K=30. N=1. Dead H cells 15/144.

### M4 Pfeffer six factors; Exp A \(k^*\); Exp B if claimed — **PASS as operationalisation; FAIL as proposal-faithful confirmation**

| Factor | Disk | Grade |
|---|---|---|
| Valence | 12 seeds + BP `emotionalTone` | Varied |
| Surprise | Held drip `node_0` | OK **only if not a finding** |
| Identity alignment | H 12-persona vs He mixes vs graph hom/mix | Swept |
| Network clustering | chain / BA m=2 / ER p=0.42 / echo | Swept at **8 nodes** |
| Information echo | Measured on A/B/D; D live 184 calls | Measured at **8 ticks**, not \(t=10,30,50\) |
| Temporal acceleration | Held 8 hops/ticks | Documented hold |

**Exp A \(k^*\).** Definition in `README.md` matches ACCEPTANCE (network-mean MI>3, no recovery). 2 topo × 2 mix × **6 of 12** articles, N=1, 8 ticks. Headline irreversible cells exist (e.g. `A_sf_hom`×chemtrails k\*=1; `A_er_hom`×paris/consensus k\*=1). Mixed-SF **died** on three seeds (1 event). Usable as a **factorial illustration**, not a confirmatory 2×2×12.

**Exp B.** Claimed in README as green. n=5 **exists**. Before/after is **not identified** (`nBefore=0` at n=1; after counts dwarf before at n=3,5 because the cascade grows). ACCEPTANCE: report as **descriptive only**. Do not write dose–response.

**Exp C.** Keyword heuristic (`14_C_distortion_stack.png` caption says so). Appendix only.

**Exp D.** Live rerun; modularity **0.2948** at 8 ticks. Not proposal times.

**814k HDBSCAN.** Not run. `personas/DEBNATH_MAPPING.md` is honest. Engine `src/SocietyGraph.js` does export `mulberry32` and `minSeedOutDegree` (LOG’s crash-fix is on disk).

### M5 Real LLM; N and model documented — **PASS for provenance of the 03:50Z+ wave; FAIL for confirmatory inference**

Every unique H/He/A `runDir` in the CSVs has `metadata.json` `llmUsage.calls` **> 0** (H 119–156; He 121–176; A 707–1465). Model `gpt-4o-mini` both writer and auditor.

**N = 1** is named. ACCEPTANCE: allowed **only as a pilot**; **not** enough for confirmatory claims. `thesisGrade: true` contradicts that sentence.

Spot-check (§ below): offered-campaign rewrites are **not** seed copies; dry-run leftover **is**.

### M6 Figures/tables + captions — **PASS (count); FAIL if zeros are treated as science**

`results/FIGURES.md` captions **16** PNGs in `results/figures/` (00 methods schematic through 15 A trajectories). All files are non-empty (41–208 KB). That meets the ≥8 captioned-figure floor **from this campaign**, not the May–June dry-runs.

Figure 3 caption claims empty/NaN for no-crossing k\*; `heatmaps.json` stores **numeric 0**. Hatch or mask before chapter paste. Pilot bars at `results/*.png` (08:47-era) must not be the chapter set.

Human-eval CSVs exist (`human_eval_template.csv`) with rewrite text; **rating columns empty**.

### M7 LOG.md + README.md — **PASS as a rerun log; FAIL as an acceptance stamp**

- `LOG.md` is now append-only run records (H→He→A crash/retry→B n=1,3,5→D) plus a 06:20 wrap. Tokens, dead mixed-SF seeds, hops=8, A 6/12, no 662 MB dump: logged.
- `README.md` says how to rerun `scripts/run_full_campaign.js --phase …`, model, N, paths, what is not claimed.
- **Defect:** README status table is uniformly **green**, including Exp B and “You can start writing.” That is executor marketing, not a checker PASS.

### M8 Examiner-safe claims — **PASS on `findings.md` prohibited list; FAIL on machine/README grade language**

`findings.md` does **not** claim 814k HDBSCAN, gpt-4o 21×10×30, causal Exp B, echo from the dead 03:15 D cell, or CIKM crime heatmaps as new.

**Unsafe artefacts the student must not paste:**

- `summary.json` `"thesisGrade": true`
- `summary.md` “Thesis-grade grid? yes (count bar)”
- README “You can start writing” without the N=1 / dead-cell / mini-auditor caveats in the same paragraph
- `analysis/examiner_safe_claims.md` “mixed personas **can buffer**” — true **vs homogeneous conspiracy** (2.28 vs He 1.62); **false** if read as He < all of H (H overall mean MPR **1.19** &lt; He **1.62**)

---

## Spot-check (3 campaign cells + dry-run sentinel)

Selection: one high-MPR conspiracy cell, one hetero mix cell, one expert MI=0 cell with 8 events (the failure mode that looks like dry-run). Plus the known dry-run folder as negative control.

### Dry-run sentinel — `A_sf_hom_2026-09-18_02-34-15` × `scopex_2017`

- `metadata.json`: **no** `llmUsage.calls`
- `results_scopex_2017.json`: every node `mpr=0`, `severity=factual_error`, eventCounts 66–73
- `nodes/node_2.json` inbox: `content` **equals** `originalContent` (seed chemtrails/SCoPEx prose); history `contentOut` is the **seed SCoPEx paragraph**, `misinfoIndex` 0 (or null)
- **Signature of mock auditor / no rewrite.** Must stay out of thesis tables.

### Cell 1 — `H_conspiracy_believer_2026-09-18_03-50-56` × `chemtrails_gates_2018_2021`

- `llmUsage`: **147** calls, 64871 prompt / 14040 completion, model `gpt-4o-mini`
- `H_rows.csv`: events=8, maxEventMI=4, meanNodeMPR=3.25, `networkRecoveredAfterPropaganda=true`
- `results_*.json`: node MPRs 2–4, actions dominated by `reinterpreted`
- `nodes/node_2.json` history tick 3, article chemtrails: `action=reinterpret`, `misinfoIndex=3`, `contentOut` is conspiracy inversion (“NOT harmless contrails… covert spraying”), **not** the seed
- **Real LLM.** Not dry-run.

### Cell 2 — `He_mix_07_2026-09-18_04-23-12` × `paris_agreement`

- `llmUsage`: **176** calls, 72009 / 18386 tokens
- `He_rows.csv`: events=8, maxEventMI=5, meanNodeMPR=0.875, k\*=8
- Mix file personas are unique and include `science_journalist` plus terminal `conspiracy_haarp_weather`
- `nodes/node_2.json` (`climate_action_advocate`) paris event: `action=forward`, `contentOut==contentIn` (identity **forward**, MI=0 at hop 2) — this is an engine action, not a mock rewrite of the seed. Downstream hops produce max MI=5 (table).
- **Real LLM chain.** Hetero MPR 0.875 with max MI 5 is a **recovery / late-hop** pattern, not a dry-run zero grid.

### Cell 3 — `H_climate_scientist_2026-09-18_04-06-57` × `scopex_2017`

- `llmUsage`: **140** calls, 58325 / 14641 tokens — **not** a 0-call cell
- CSV: events=8, maxEventMI=0, meanNodeMPR=0
- `nodes/node_2.json`: `action=reinterpret`, `contentOut` is a **paraphrase** of SCoPEx (Keutsch, 20 km gondola, CaCO3 grams–kilograms, Sweden 2021 hold, March 2024 discontinuation), **not** byte-identical to the seed; `ifd.scores` all `+1`, `misinfoIndex=0`
- **Real LLM, GT-preserving expert roleplay.** Do **not** treat this zero as dry-run, and do **not** average it with conspiracy 5s as if it were a failed cascade.

---

## Per-grid sanity (latest completed `runDir` only)

Ignore `*_02-34-*`, `*_02-35-*`, `A_*_03-02-43`, `A_*_03-06-36`, `A_*_02-49-17`, `A_*_02-56-00`, `D_*_03-15-58` for numbers.

| Grid | Folders | Cells in CSV | Usable? |
|---|---|---|---|
| H | 12 persona dirs (03:50–04:08Z) | 144 | Yes as N=1 heatmap; **15** events≤2; **28** maxEventMI=0 (mix of death + expert/mitigation GT-keep) |
| He | 12 mix dirs (04:12–04:31Z) | 144 | Yes as N=1 heatmap; **11** events≤2; **11** maxEventMI=0 |
| A | 4 latest graph dirs (04:36–05:24Z) | 24 | **20 live / 4 dead.** Dead: `A_sf_mix`×scopex, chemtrails, SAI; `A_er_mix`×polar_bears |
| B | n1 05:51, n3 05:56, n5 06:03 | 3 | Descriptive only |
| D | 06:08:40 | 1 | Live (184 calls); 8-tick modularity only |
| Probe | `probe_*` × 10 leftover dirs | — | Plumbing |

LOG’s first A_er attempt `A_er_*_05-21-10` exited status=1 in 105 ms (`mulberry32` crash); retry `05-24-05` completed. Do not parse the 105 ms dirs.

---

## False / over-claim watch (`findings.md` and siblings)

| Statement | Verdict |
|---|---|
| 8723 calls, ~$1.02 | **True** (1.0185 list-price sum) |
| Conspiracy MPR ≈2.28 vs others ≈0.64 | **True including zeros.** Disclose dead/GT-keep cells or recompute on events≥5. |
| He mean MPR ≈1.62 “sits in between” | **True vs the two H clusters.** Misleading vs **overall** H (1.19). |
| A mixed-SF dropped three seeds; not immunisation | **True and required** |
| Exp B after>before is cascade volume, not causal backfire | **True** |
| D rerun 151 events, MPR 3.35, homophily 0.44, modularity 0.29 | **Matches** `summary.md` / `echo_modularity.csv` (0.2948) |
| No 814k / no Phase III / 5 QA / mini / 8 hops | **True** |
| `summary.json` thesisGrade true / summary.md “thesis-grade grid? yes” | **False vs ACCEPTANCE and ACCEPTANCE_1_0** |
| README all-green Exp B | **Over-claim** (confounded) |
| analysis “mixed can buffer” as a general law | **Over-claim** (He > H mean) |

`findings.md` itself is one of the more careful files. The overclaim is concentrated in **grade flags** and **green checklists**.

---

## Are current numbers thesis-usable?

**Yes, as:**

- methods description of a real `gpt-4o-mini` climate chain/graph campaign (12×12 H, 12×12 He, 2×2×6 A, B n=1/3/5, one live D);
- N=1 **exploratory** heatmaps and k\* illustrations, with dead cells hatched or dropped;
- evidence that the auditor is not stuck at MI=0 for conspiracy roleplay, and that expert personas can keep GT (MI=0 with non-zero tokens).

**No, as:**

- confirmatory Pfeffer operationalisation (surprise + temporal held; D not t=10/30/50; N=1; 8 nodes);
- Debnath 814k re-analysis or HDBSCAN centroids;
- CIKM LASS reprint (21×10×30, gpt-4o, 10 QA);
- identified Exp B recovery curve;
- a 1.0-eligible results chapter (`ACCEPTANCE_1_0` still FAIL).

---

## ACCEPTANCE_1_0 re-score (eligibility, not a grade)

Stale file used `summary.json` He=0 / 04:11Z. **This disk is 06:13Z.** Block results vs that checklist’s *spirit*:

| Block | Now | Still FAIL because |
|---|---|---|
| 1.A Prior fence | A1 campaign tables are climate **PASS**; A2 root README DOI badge **FAIL**; A3/A4 PDF/contribution **FAIL** | Venue inflation outside `thesisExperiment/` |
| 1.B Data honesty | B1–B5 **PASS** if dry-run folders stay out | Keep it |
| 1.C Homo/hetero | C1–C4 heatmaps **now exist**; C7 zeros as 0 **FAIL** | Hatch zeros |
| 1.D k\* | Definition **PASS**; N=1 headline risk **FAIL** if k\*=1 is “textbook” | `findings.md` is milder than the old pilot text |
| 1.E Topology/B/echo | E1 A=6 articles N=1 **FAIL** vs ≥6 with N≥3; E2–E4 dead cells + B **FAIL**; E5 D live **PASS if D not over-read** | |
| 1.F Instrument | Human ratings empty; writer=judge=`gpt-4o-mini` **FAIL** | |
| 1.G Theory | “Six factors” vs Pfeffer seven; held knobs **FAIL** if claimed confirmed | |
| 1.H Meta | H1 thesisGrade should be **false** → current **true is FAIL** | Flip it before any paste |

**ACCEPTANCE_1_0 remains FAIL.** Finishing He did not buy 1.0.

---

## Grade implication (honest band for THIS snapshot)

Agents do not assign TUM grades. Conditional on the **bound PDF**:

- **1.0: no.** Missing human κ, N≥3 / mini-vs-4o, identified B, surprise/temporal sweep, 814k, proposal echo times, fail-closed auditor.
- **1.3: no** on this snapshot (same list; plus F12 zeros and self-PASS flag).
- **1.7: possible only if** the student writes CSS-carefully: fence LASS (kill `10.1145/3627673` badge), hatch/drop dead cells, withdraw Exp B as unidentified, keep six knobs as a **remap** of Pfeffer, never upgrade theory-faithful BPs to HDBSCAN, and does not paste `thesisGrade: true`.
- **Default honest band: 2.0–2.3** for a careful exploratory N=1 climate-chain thesis.
- **2.3–2.7+** if green checklists, causal B, homophily=1 echo, or CIKM-main branding survive.

This is **better** than the 04:11Z He-empty snapshot (then 2.3–2.7 as the floor). It is **not** a 1.0 file drop.

---

## What must stay in Limitations (non-negotiable)

1. N=1; no p-values / Cohen’s d.
2. `gpt-4o-mini` writer **and** auditor; 5 discrete IFD items; GT in the auditor prompt.
3. No 814,924-tweet HDBSCAN / Skip-gram; BPs are theory-faithful expansions.
4. Hop/tick compression: **8**, not CIKM 30 / proposal 15 / echo t=10,30,50.
5. Graph A used **6/12** articles; do not generalise A to the chain-only six.
6. Dead cascades: list the 15 H + 11 He + 4 A cells; do not interpret mixed-SF deaths as immunisation.
7. Exp B: no pre-window at n=1; volume-confounded; **no causal fact-check finding**.
8. Keyword Exp C is not Debnath’s six-type classifier.
9. No human dual-ratings in this folder.
10. k\* is a **simulator operationalisation**, not Twitter ignition time (Phase III omitted).

---

## Concrete remaining gaps (do not fake)

1. Set `summary.json` `"thesisGrade": false` until ACCEPTANCE_1_0 would be all PASS. (Checker did **not** edit it.)
2. Hatch or drop events≤2 (and disclose MI=0 expert chains) in heatmaps; recompute 2.28 vs 0.64 on the live subset.
3. Keep Exp B in an appendix or drop the green checkbox.
4. Do not re-parse `*_02-34-*` dry-runs.
5. Fill or omit human-eval; empty templates are not Pack H.
6. Fix root `README.md` CIKM 2023 DOI badge before submission.
7. Do not run another full LLM grid for writing; a single dry-run-vs-real probe is enough and was already on disk.

---

*Independent checker. Re-score only if `summary.json` `generatedAt` changes. Do not self-PASS.*
