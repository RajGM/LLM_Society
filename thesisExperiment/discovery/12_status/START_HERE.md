# START HERE — write the thesis, do not rerun

**18 Sep 2026.** Real `gpt-4o-mini` campaign is on disk (H 144 + He 144 + A 24 + B 3 + D rerun; ~8723 calls, ~$1.02). `summary.json` `"thesisGrade": false` is correct: **N=1 case study**, not confirmatory stats.

**Do not start another LLM campaign.** No HDBSCAN, no gpt-4o, no 30 hops, no Phase III. Those stay **red** and go in Limitations.

Honest ceiling if you overclaim: **2.7+**. Honest ceiling if you paste carefully: **~2.3**. 1.0 is not available on this snapshot.

---

## What to write first (little time)

Paste in this order. Expand later only if hours remain.

| # | Hours | Write | Paste from | Why first |
|---|------|--------|------------|-----------|
| 1 | 2–3 | **Ch7 Results** + insert figures | `analysis/results_paragraphs.md` + `results/FIGURES.md` + `results/tables/` | This is the thesis object. Without it, nothing else matters. |
| 2 | 1 | **Ch9 Limitations** (N=1, no-814k, B confound, auditor circularity) | `analysis/limitations.md` + `analysis/examiner_safe_claims.md` | Stops grade-killing sentences. |
| 3 | 2 | **Ch6 Methods** (H/He/A/B/D, k*, CLI) | `analysis/methods.md` + `thesisExperiment/README.md` | Examiner must see what actually ran. |
| 4 | 1 | **Ch5 Data** (12 articles, 12 BPs, **no 814k**) | `articles/articles.json`, `personas/DEBNATH_MAPPING.md`, `data/SOURCES.md` | Burying this looks like fabrication. |
| 5 | 1 | **Ch3 Pfeffer knobs** | `pfeffer_mapping.md` + `discovery/02_theory/factor_knob_table.md` | **Seven** factors in 2014; thesis **six** knobs = remapping. Surprise + time are **held**. |
| 6 | 1 | **Ch1** RQs + contributions | skeleton §1.3–1.4, numbers from `results/findings.md` | Keep C1–C4 modest. |
| 7 | leftover | **Ch2** from notes, then Ch4 (CIKM = prior), Ch8, abstract | `01_literature/` then skeleton Ch4/Ch8 | Literature last so cites match what you used. |
| 8 | 20 min | Fill **your names** | `discovery/10_repro/individual_contribution.md` | Empty `[names]` is a 3.0–5.0 kill. |

**Do not** write Ch7 from the **2-article 6-tick pilot**, from `examples/` crime chains, or from `ACCEPTANCE_1_0.md` (that file still says He=0; it is a **stale snapshot**). Current findings: `results/findings.md`.

---

## Chapter-ready (green — paste, do not invent)

| File | Use as |
|------|--------|
| `thesisExperiment/analysis/methods.md` | Ch6 prose |
| `thesisExperiment/analysis/results_paragraphs.md` | Ch7 prose (H/He/A/B/echo/cost) |
| `thesisExperiment/analysis/limitations.md` | Ch9 |
| `thesisExperiment/analysis/examiner_safe_claims.md` | Voice check before every Results sentence |
| `thesisExperiment/results/FIGURES.md` | Captions for 16 PNGs in `results/figures/` (Fig. 0–15). Same text in `results/figures/captions.md`. |
| `thesisExperiment/results/tables/*.csv` | Tab. 7.x numbers |
| `thesisExperiment/discovery/01_literature/related_work.md` | Ch2 backbone (~8–12 pp notes) |
| `…/01_literature/gap_map.md` | “what is unique vs prior” table |
| `…/01_literature/bibliography.bib` + `references.md` | citations |
| `…/01_literature/do_not_reprint.md` | **Red list** — Young Parent / crime0 / 85% hetero / MI-introduced-here stay in Related Work only |
| `…/07_chapters/chapter_skeleton.md` | **Section order + page budget only** |

**Skeleton warning.** Use it for chapter *shape*. Its honesty banner and drop-in paths are **stale** (2 articles, 6 ticks, He missing, dead D). For what ran, trust `README.md`, `findings.md`, `analysis/`, and `FIGURES.md`.

---

## Still red (leave red; write as limits)

| Red | Status | In the PDF |
|-----|--------|------------|
| Bound thesis | **unwritten** | This is the remaining work. |
| 814k HDBSCAN / hydrated Debnath / Phase III | **omitted** | “Not done.” Never imply clustering. |
| gpt-4o, 10 QA, 15/30 hops, N≥3 | **omitted** | gpt-4o-mini, 5 QA, 8 hops, N=1. |
| Human dual-rating / κ | **empty templates** | Unused instrument, not a validity study. |
| Identified fact-check (control, matched windows) | **not identified** | B is a **methods confound** (after > before from cascade volume). Withdraw dose–response. |
| Surprise / temporal acceleration | **held** | Drip seed; 8-tick compression. Not “six factors confirmed.” |
| Fail-closed auditor, T=0, different-family judge | **not patched** | Same-model IFD; disclose circularity. |
| LASS vs “CIKM main” + wrong DOI | **repo risk** | Cite **LASS@CIKM 2025**, arXiv:2511.10384. Do not use `10.1145/3627673` as the paper. |
| `individual_contribution.md` | **template** | Hand-fill co-authors vs climate campaign. Engine ≠ sole thesis. |
| ACCEPTANCE_1_0 / `overclaim_watch.md` | **stale vs campaign** | Follow `kill_list.md` *principles*; ignore “He missing / three PNGs” as current facts. |

---

## Three sentences that must appear

1. This thesis is a **climate-firestorm simulation**, not a reprint of the LASS/CIKM crime-news grid.  
2. Belief profiles are **theory-faithful Debnath reductions**, not 814k HDBSCAN centroids.  
3. Numbers are **N=1, gpt-4o-mini**; report the matrix including **dead cascades**; do not write “significant,” “replicates,” or “textbook k*=1.”

Kill list (print once): `discovery/03_examiner/kill_list.md`. Rerun CLI (appendix only): `thesisExperiment/README.md`.
