# Debnath hop depth / cascade length — status

**Date:** 18 September 2026  
**Question:** Did Debnath et al. (geoengineering Twitter, iScience / Mendeley) specify hop depth, cascade length, or 8-step chains?  
**Scope:** Paper (PMC HTML), proposal extract, `thesisExperiment/data` Debnath materials, `discovery/01_literature`. No campaign runs.

---

## Verdict

**8 hops is NOT a Debnath protocol.**

Debnath does **not** specify simulation hop depth, retweet-cascade depth, or 8-step agent chains. The campaign’s `maxTicks` / `numNodes` = 8 is a **thesisExperiment cost compression** (vs CIKM’s 30-hop branches), not a Debnath parameter.

The only Debnath “eight” that is a method number is a **word2vec skip-gram context window of eight words** — not hops.

---

## Sources checked

| Source | Path / cite |
|--------|-------------|
| Primary paper (PMC) | `thesisExperiment/data/raw/debnath_iscience_2023_pmc.html` — Debnath, Reiner, Sovacool et al., *iScience* 26, 106166 (2023), PMC10040962 |
| Notes | `thesisExperiment/data/derived/debnath_iscience_notes.txt` |
| BP / honesty notes | `thesisExperiment/data/derived/debnath_bps.md` |
| GitHub analysis codes | `thesisExperiment/data/debnath_geoeng/` (Ramit1201/geoeng) |
| Literature discovery | `thesisExperiment/discovery/01_literature/related_work.md`, `gap_map.md`, `_extract/proposal_pfeffer_v5.txt` |
| Mendeley | tweet-ID dataset `10.17632/546hsym93p.1` (IDs only; not hydrated here) |

Supplemental PDF `mmc1.pdf` (Tables S1–S5, Figures S1–S6) is linked from PMC but **not present** in this repo. Main-text claims below are from the saved PMC HTML + local codes.

---

## What Debnath’s “network” actually is

Debnath’s network analysis is **hashtag co-occurrence** (nodes = hashtags; edges = co-occurrence frequency within a tweet), built in Gephi, scored with **eigenvector centrality**. It is **not** a reconstructed user→user or tweet→retweet cascade graph.

STAR Methods (§ Measurement of conspiracy theory spillover using network analysis):

> We extracted geospecific hashtags … to construct hashtag co-occurrence networks for #chemtrails across the UK, USA, India and Sweden. … A node represents each hashtag in the co-occurrence network, and the link between two nodes represents an edge, weighted by its frequency.

Main-text “cascade” language is **conceptual spillover** (controversies cascading across agendas / regions), not cascade-depth empirics. Example intro wording: controversies that “cascade … in order to shift a policy agenda” (citing Cuppen et al. spillover literature), then operationalised as hashtag co-occurrence + toxicity.

`debnath_bps.md` already flags the local paper slice as **not** a cascade graph:

> That is a style exemplar, **not** a reconstructed 814k cascade.

---

## The only “8” in Debnath methods (do not confuse with hops)

STAR Methods (§ Estimating conspiracy embedding …):

> We define a **context window of eight**, i.e., we work in a batch of **eight words** in an individual tweet to estimate the conditional probability of other words (termed it as *p_together*) with the ’chemtrails’ conspiracy theory.

Local GitHub code `thesisExperiment/data/debnath_geoeng/embeddings` comments `#create context window with length 8` (paper text is authoritative; the R snippet uses `unnest_tokens(..., n = 10)` — do not treat that as hop depth either).

**This is NLP window size, not hop depth / chain length.**

---

## Cascade size / depth distributions?

**Not reported in the Debnath main text (PMC HTML) as retweet-cascade size or depth distributions.**

What *is* reported (network-adjacent, not cascade depth):

| Quantity | Quote / figure (main text) |
|----------|----------------------------|
| #chemtrails eigenvector centrality (country networks) | #uk ~0.58; #usa ~0.47; #sweden ~0.68; #india ~0.37 |
| Centrality bands (Fig. 5 axis) | low 0–0.09; mid 0.1–0.29; high 0.3–1.0 |
| Corpus size | 814,924 English `#geoengineering` tweets (Jan 2009–Nov 2021) |
| Engagement / volume (notes + proposal reuse) | SCoPEx window ~8,000 interactions/day order; ~+300% vs Feb 2017 — **volume**, not cascade depth |
| Supplemental | Fig. 6 caption: “Detailed network characteristics are shown in **Table S5**” — characteristics of **hashtag co-occurrence** graphs; table body not in-repo |

No main-text distribution of cascade length, max depth, mean depth, or hop counts for information diffusion trees.

---

## Proposal vs Debnath (do not back-attribute)

`discovery/01_literature/_extract/proposal_pfeffer_v5.txt` plans:

- “cascade reconstruction via `conversation_id` and `sourcetweet_author_id`”
- cross-validation of synthetic \(k^*\) against “reconstructed real cascades”

That is a **proposal method for this thesis**, not a protocol Debnath already ran or parameterised with hop = 8. Debnath is cited for corpus scale, chemtrails dominance, toxicity/spillover, and **centrality** numbers — not for chain depth.

`gap_map.md` already separates:

- Debnath = observational NLP/network study  
- Examiner risk: “Equating MI hops with Twitter depth without validation” (Vosoughi / cascade empirics row — not Debnath)

Literature hop numbers that *do* exist elsewhere in discovery:

- **CIKM prior:** ~30-hop homogeneous branches  
- **Thesis campaign docs:** 8 hops / 8 ticks as compression — **not** Debnath

---

## Bottom line for Methods / honesty

1. Do **not** write “Debnath 8-hop protocol” or “Debnath cascade length = 8.”  
2. If mentioning Debnath’s eight: say **skip-gram context window = 8 words**.  
3. If mentioning Debnath networks: say **hashtag co-occurrence + eigenvector centrality**; quote centrality scores above; do **not** invent cascade depth/size distributions from main text.  
4. Attribute **8 hops** only to thesisExperiment / CIKM compression choices.
