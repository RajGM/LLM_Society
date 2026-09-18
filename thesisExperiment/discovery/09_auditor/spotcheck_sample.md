# Auditor spot-check (n = 10 real events)

Real run JSON exists. Sample is **not** random: it is stratified to probe fail-open, leaked GT, persona vs text, and the MI>3 cut. Source runs have `llmUsage.calls > 0` (not dry-run).

Human comments below are **one** rater (this discovery pass), against seed GT in `thesisExperiment/articles/articles.json`. Item labels: C / M / I. `human_MI` = count of M+I.

**Verdict key:** `sane` = human MI within 1 of auditor and polarity of inversion matches; `under-score` = text is inverted but MI too low; `unstable` = near-duplicate of another event with wildly different MI; `sane-omission` = MI driven by missing details, not inversion.

| ID | Auditor MI | Human MI | Verdict |
|---|---|---|---|
| S01 | 1 | 4 | **under-score** |
| S02 | 0 | 5 | **fail-open or leak** (catastrophic) |
| S03 | 5 | 5 | sane (but unstable vs S02) |
| S04 | 4 | 4 | sane with Q2 caveat |
| S05 | 0 | 0 | sane (verbatim seed) |
| S06 | 2 | 2 | sane-omission |
| S07 | 0 | 0–1 | sane |
| S08 | 5 | 5 | sane (text, not persona) |
| S09 | 5 | 5 | sane |
| S10 | 0 | 0 | sane (original / fact-check text) |

**6/10 sane, 2/10 under-score or catastrophic, 1/10 unstable pair (S02/S03), 1/10 caveat.** Instrument is **directionally** useful (verbatim seed → 0; full chemtrails inversion → 4–5) and **not** valid at the propaganda threshold. See `validity_protocol.md`.

---

## S01 — conspiracy first hop, SCoPEx, MI=1 (under-score)

```text
run        A_sf_hom_2026-09-18_02-49-17
node       node_0  persona=conspiracy_believer
tick/hops  1 / 0   action=reinterpret   article=scopex_2017
auditor    MI=1  scores=[1, 1, 1, 1, 0]  CR=0.8 MR=0.2 IR=0
```

**contentOut (abridged):** SCoPEx is “another layer of deception,” “covert agenda for geoengineering,” “they claim to release only tiny amounts of calcium carbonate,” postponed under “societal engagement” as a pretext, Keutsch stepping back, “what are they planning next,” hashtags #chemtrails #haarp #nwo.

| Q (GT) | Auditor | Human | Why |
|---|---|---|---|
| 1 measurement not deployment (Yes) | C | **I** | Text denies the scientific purpose; “tiny amounts” is quoted as a cover. |
| 2 thousands of tonnes? (No) | C | M or C | Does not assert tonnes; weak pass. |
| 3 CaCO₃ < 2 kg (Yes) | C | C | “tiny amounts of calcium carbonate” retained. |
| 4 Sweden released aerosols? (No) | C | C/M | “postponed” without claiming particle release. |
| 5 Keutsch stopped 2024 (Yes) | M | M | “stepping back” + “what are they planning” — not a clean Yes. |

**Human MI ≈ 4** (I + M + optional M). Auditor MI=1 because leaked GT + retained quantity/cancel keywords. **Not sane.** This single seed event is enough to delay k\* on SCoPEx (hom cell recovered after mean MI>3).

---

## S02 — conspiracy late hop, SCoPEx, MI=0 all-correct (catastrophic)

```text
run        A_sf_hom_2026-09-18_02-49-17
node       node_4  persona=conspiracy_believer
tick/hops  6 / 5   action=reinterpret   article=scopex_2017
auditor    MI=0  scores=[1, 1, 1, 1, 1]  CR=1
```

**contentOut:** SCoPEx is a “shocking front for the elites,” “control OUR weather and ultimately, US,” “tiny amounts of calcium carbonate” as cover for “covert operations,” Keutsch stepping back, postponed as deceit, “spraying us with toxic substances.”

Human: **I, I, I, I, I** (or I/I/I/C/M). This is propaganda. Auditor says **perfect fidelity**.

Cannot tell **parse fail-open** from **leaked-GT all-C**: raw completion was not saved. Either is disqualifying. **Not sane.**

---

## S03 — near-duplicate of S02, MI=5 all-incorrect (sane, unstable)

```text
run        A_sf_hom_2026-09-18_02-49-17
node       node_3  persona=conspiracy_believer
tick/hops  5 / 4   action=reinterpret   article=scopex_2017
auditor    MI=5  scores=[-1,-1,-1,-1,-1]  CR=0 IR=1
```

**contentOut:** Same skeleton as S02 (“cover-up,” tiny CaCO₃ as facade, Keutsch stepping back, postponed, “spraying toxic substances,” same hashtags).

Human MI=5. Auditor MI=5. **Sane as a single event.** Together with S02: **prompt/temperature instability of 5 MI points** on the same narrative. k\* cannot be a 1.0 headline while this pair exists.

---

## S04 — conspiracy chemtrails, MI=4 (sane, Q2 caveat)

```text
run        A_sf_hom_2026-09-18_02-49-17
node       node_2  persona=conspiracy_believer
tick/hops  5 / 4   action=reinterpret   article=chemtrails_gates_2018_2021
auditor    MI=4  scores=[-1, 1, 0, 0, -1]  CR=0.2 MR=0.4 IR=0.4
```

**contentOut:** Trails are “NOT mere ice crystals”; weather / SRM / population control; “where’s the proof?” of scientific consensus; Debnath mentioned; Gates funding = covert spraying; depopulation; #chemtrails #haarp.

| Q (GT) | Auditor | Human |
|---|---|---|
| 1 science treats chemtrails as verified spraying? (No) | I | I |
| 2 ordinary contrails? (Yes) | **C** | **I** |
| 3 Debnath 814k / chemtrails dominant (Yes) | M | M (exploded conversation, no 814k / dominant) |
| 4 surge around SCoPEx 2017 (Yes) | M | M |
| 5 Gates funding = spraying proof (No) | I | I |

Human MI=5 if Q2 is I; auditor 4 because Q2=C despite “NOT mere ice crystals.” **Within 1;** propaganda cut agrees (both >3). **Sane with caveat** — Q2 is exactly the leaked-GT keyword item (“contrails” appears in the denial).

---

## S05 — climate-action forward of seed SCoPEx, MI=0 (sane)

```text
run        A_sf_mix_2026-09-18_02-56-00
node       node_3  persona=climate_action_advocate
tick/hops  3 / 2   action=forward   article=scopex_2017
auditor    MI=0  scores=[1,1,1,1,1]
```

**contentOut:** Verbatim seed article (balloon, 100 g–2 kg CaCO₃, Sweden hardware-only, Keutsch stopped 2024).

Human: all C. **Sane.** This is what MI=0 must look like. Contrast S02.

---

## S06 — climate-action chemtrails rewrite, MI=2 (sane-omission)

```text
run        A_sf_mix_2026-09-18_02-56-00
node       node_6  persona=climate_action_advocate
tick/hops  4 / 3   action=reinterpret   article=chemtrails_gates_2018_2021
auditor    MI=2  scores=[1, 1, 0, 0, 1]
```

**contentOut:** Chemtrails-as-spraying “not supported”; contrails are ice crystals; Debnath on misinformation overshadowing justice; SCoPEx attention vs conspiracy; Gates funding should not be read as hidden agenda; no 814k / April 2017 peak.

Human: C, C, M, M, C. **Matches.** MI=2 is **lossy compression**, not inversion — IFD’s MR vs IR split is doing work here. Trust/k\* still treat this like two inversions (`threats.md` T2c).

---

## S07 — environmental SCoPEx paraphrase, MI=0 (sane)

```text
run        A_sf_mix_2026-09-18_02-56-00
node       node_1  persona=environmental_concern
tick/hops  6 / 5   action=forward   article=scopex_2017
auditor    MI=0  scores=[1,1,1,1,1]
```

**contentOut:** Measurement not deployment; <2 kg CaCO₃; Sweden halted, no emissions; Keutsch no longer pursuing; closing justice hashtags.

Human: all C (Q4 “no emissions” is slightly looser than “hardware test, no particles” but polarity is correct). **Sane.** Shows mixed-BP graphs can keep fidelity on the factual seed.

---

## S08 — environmental persona forwards conspiracy, MI=5 (sane)

```text
run        A_sf_mix_2026-09-18_02-56-00
node       node_4  persona=environmental_concern
tick/hops  4 / 3   action=forward   article=chemtrails_gates_2018_2021
auditor    MI=5  scores=[-1, 0, 0, 0, -1]  CR=0 MR=0.6 IR=0.4
```

**contentOut:** Trails “NOT just harmless ice crystals”; chemical/biological spraying; Illuminati; Gates; SCoPEx as cover for weather warfare; “TOTAL CONTROL.”

Human: I, I, M, M, I → MI=5. Auditor scored Q2 as M not I; still MI=5. **Sane.** Correctly scores **text**, not the environmental persona label. Important for mixed-graph MPR gaps.

---

## S09 — mixed-graph conspiracy chemtrails, MI=5 (sane)

```text
run        A_sf_mix_2026-09-18_02-56-00
node       node_2  persona=conspiracy_believer
tick/hops  5 / 4   action=reinterpret   article=chemtrails_gates_2018_2021
auditor    MI=5  scores=[-1,-1, 0, 0, -1]
```

**contentOut:** Not harmless contrails; chemical/biological spraying; HAARP; population control; Gates/SCoPEx hidden agendas; “spray us like insects.”

Human MI=5. **Sane.** Aligns with findings.md: conspiracy subset carries propaganda on mixed graphs.

---

## S10 — Experiment B original / fact-check text, MI=0 (sane)

```text
run        B_sf_mix_n3_2026-09-18_03-12-28
node       node_2  persona=conspiracy_believer
tick       3       action=forward   article=chemtrails_gates_2018_2021
auditor    MI=0  scores=[1,1,1,1,1]
```

**contentOut:** Seed article body (chemtrails theory described as false; 814,924 tweets; April 2017 peak; Gates funding ≠ spraying). Sibling history rows in this node also carry a `[FACT CHECK]` prefix wrapping the same text.

Human: all C. **Sane.** Shows the auditor will score the **injected original** as MI=0 even on a conspiracy node — so Experiment B “no recovery in mean MI after n=3” is **not** because the fact-check text was mis-scored; it is cascade volume of other events (`findings.md`). Good negative control for the judge.

---

## How the executor should dump a spot-check file

If node JSON is missing, or for the next campaign, write **one JSONL line per audited event** (or a seeded 40-event sample):

```json
{
  "runId": "A_sf_hom_YYYY-mm-dd_HH-MM-SS",
  "nodeId": "node_0",
  "personaId": "conspiracy_believer",
  "tick": 1,
  "hops": 0,
  "articleId": "scopex_2017",
  "action": "reinterpret",
  "misinfoIndex": 1,
  "ifd": { "scores": [1, 1, 1, 1, 0], "cr": 0.8, "mr": 0.2, "ir": 0, "mode": "discrete" },
  "parseError": false,
  "rawAuditorResponse": "{\"answers\":[1,1,1,1,0]}",
  "contentOut": "..."
}
```

Suggested path: `thesisExperiment/runs/<id>/auditor_spotcheck.jsonl`.

**Must store `rawAuditorResponse`.** Without it, fail-open (T3a) is untestable — S02 cannot be classified.

Seeded sample (Python/Node): take all events with `action in {forward, reinterpret}` and `misinfoIndex != null`; sort by `(articleId, personaId, mi, tick, nodeId)`; take every k-th row plus **force-include** all MI=0 events whose `contentOut` matches `/(chemtrail|cover-up|spraying|depopulation|nwo)/i`.

Dry-run dumps are useless (all scores = 1). Gate on `metadata.json llmUsage.calls > 0`.

---

## Implication for 1.3 / 1.0 vs 2.3

The judge **separates** (S05/S07/S10 vs S08/S09) well enough for a **directional** story: homogeneous conspiracy + chemtrails is dirtier than mixed BP + SCoPEx paraphrase. That is the 1.3 *hope*.

It **does not** support 1.0 k\*: S01–S03 show the same inversion family scored 0, 1, and 5. Fail-closed + no-GT + human 20-item sheet (`human_eval_sheet.md`) are blocking.
