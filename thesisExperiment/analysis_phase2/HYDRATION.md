# Debnath tweet hydration — hashtag path

Status: **hydration failed**. Empirical graph: **hashtag co-occurrence fallback**.

This note records what reconstruct could and could not do. It does not invent tweet IDs. It does not print secrets.

## What we tried

1. **Mendeley** `10.17632/546hsym93p.1` — tweet-ID dump (not text). Files API returns HTTP 200 with body error 400 / Elsevier 404. Landing HTML only.
2. **OSF** `osf.io/75ye3` `dataset.csv` (~662 MB). Streamed the first 5k **CSV records** from the `files.osf.io` object URL. Parsed `tweet_id` and extracted hashtags from column `text`. Discarded tweet text, user names, bios, locations, profile image URLs.
3. **Twitter/X hydration** — bearer **absent**. Usable digit IDs from OSF: **0**. Hydration **did not run**. Tweets were not invented.
4. **GitHub** `Ramit1201/geoeng` at `thesisExperiment/data/debnath_geoeng/` — present. Codes (`hashtag_ext`, skip-gram embeddings, NRC, Perspective), **not** tweets.
5. **PMC HTML** of Debnath et al. 2023 — published Table 1 / Figures 3–6 hashtags already encoded in `HASHTAG_SPEC` / `DOCUMENTED_PAIRS`.

## Why hydration failed

- OSF `tweet_id` is Excel **scientific notation** (e.g. `1.00048E+18`). Low digits are gone. Tokens do not round-trip to Twitter snowflake IDs. **0 hydratable IDs** in the sample.
- No Twitter/X bearer in the environment. Reconstruct refuses to call the API without one, and refuses to fabricate IDs to hydrate random tweets.
- Mendeley ID dump was not retrieved. Even if it were, hydration would still need a bearer.

## Hashtag method (empirical graph)

Debnath’s own hashtag path (STAR Methods; Ramit1201/geoeng `hashtag_ext`):

- Extract `#ngram`s with `#[a-zA-Z0-9_-]+` (lowercase, strip punctuation).
- **Co-occurrence** = two hashtags in the **same tweet** (`freq`). In their Gephi nets, nodes are hashtags; edges are undirected and weighted by frequency. Country tags (`#usa`, `#uk`, `#india`, `#sweden`) locate those nets.
- They filtered retweets **before skip-gram**, not as a FakeNewsNet retweet cascade.

This repo’s artefact is a **user graph keyed by those published hashtags** (hub / amplifier / periphery accounts per tag) so `RealGraphImporter` can read FakeNewsNet-shaped JSON. Edges reuse `retweets[]` only as a directed-edge container. `notARetweetCascade: true`.

| Field | Value |
|---|---|
| File | `thesisExperiment/data/derived/debnath_hashtag_cascade.json` |
| Nodes (users keyed by hashtags) | **63** |
| Directed edges | **228** |
| `notARetweetCascade` | **true** |
| `kind` | `hashtag_cooccurrence` |
| Seed | `chemtrails_hub` / `#chemtrails` |
| Topology changed this run | **no** |

OSF prefix hashtags **annotate** documented edges (`osfSampleCount`) and are stored as aggregates in `thesisExperiment/data/derived/debnath_osf_hashtag_sample.json`. They do **not** add nodes, do **not** invent users, and do **not** replace Debnath’s published co-occurrence networks with a 5k-record file prefix.

### OSF hashtag sample (this run)

- Records: **5000**; scientific-notation `tweet_id` tokens: **1786**; usable digit IDs: **0**; with text: **2158**; with ≥1 hashtag: **987**.
- Distinct hashtags: **564**. Tweets with ≥2 documented tags: **361**.
- Documented tag-pairs observed: **65**. Directed edges with OSF count > 0: **48**.
- PII: tweet text and user fields discarded after extraction.

## Debnath’s “eight” is not our 8 hops

From Debnath et al. 2023 STAR Methods (word embeddings): they use word2vec skip-gram and **define a context window of eight** — a batch of eight **words** in an individual tweet — to estimate the conditional probability `p_together` of neighbouring words with “chemtrails”. Their public R (`thesisExperiment/data/debnath_geoeng/embeddings`) uses `unnest_tokens(..., n = 10)` n-grams as an implementation detail; the **paper** says eight.

This experiment’s **8 hops / 8 ticks** is a logged cost compression versus CIKM K=30. It is **not** Debnath’s skip-gram window and **not** a Debnath hop protocol.

## compare_phase2.js

Empirical topology **unchanged** (same node set and `from→to` endpoints). `compare_phase2.js` was **not** re-run solely because OSF counts were attached. Do not wipe `simPending=false`.

Dnet configs (`thesisExperiment/configs/phase2/Dnet_*.json`) were **not rewritten** (topology match).

## What remains impossible

- Recovering the 814,924 tweet IDs or hydrating them without a bearer and a non-scientific-notation ID list.
- Reconstructing retweet / reply / `conversation_id` cascades from this OSF file prefix.
- Re-running HDBSCAN or skip-gram on 814k tweets (no corpus; codes without data).
- Equating simulated MI (LLM auditor) with Twitter MI, or claiming empirical MPR (Debnath did not report 0–5 MPR).
- Treating follower counts on fallback nodes as scraped profiles (they are Figure 2 illustrative bands).

## Isolation

- Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/` (Phase 1).
- Did not invent tweets, tweet IDs, or API keys. Did not print secrets.

## Attempts (this run)

| Step | ok | detail |
|---|---|---|
| `detect_twitter_bearer` | no | absent — will not invent tweets |
| `detect_openai` | yes | present |
| `github_ramit1201_geoeng` | yes |  |
| `mendeley_files_api` | no | API body error 400 |
| `mendeley_files_api` | no | API body error 400 |
| `mendeley_files_api` | no | https://api.elsevier.com/content/datasets/doi/10.17632/546hsym93p.1 |
| `mendeley_landing` | yes | Landing page only; tweet-ID dump not retrieved. |
| `osf_guid` | yes |  |
| `osf_node_files` | yes |  |
| `osf_dataset_sample` | yes | tweet text discarded after hashtag extraction; IDs not invented |
| `twitter_hydrate` | no | no_bearer_token |
| `hashtag_cooccurrence_fallback` | yes | NOT a retweet cascade. Empirical graph for D-net / compare. |
| `osf_hashtag_extract` | yes | Hashtags only; tweet text discarded. Topology not expanded from the 5k prefix. |
| `topology_fingerprint` | yes | Node/edge endpoints unchanged; OSF counts are annotations only. |
| `realgraphimporter_validate` | yes |  |
| `write_dnet_configs` | yes | topology_unchanged |

