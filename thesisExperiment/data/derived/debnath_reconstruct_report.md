# Debnath reconstruct report

Date: 2026-09-19T10:21:34.147Z

## Headline

**Hydration failed.** Twitter/X hydration did not run: no bearer token, and OSF `tweet_id` is Excel scientific notation (0 hydratable IDs). Tweet IDs were **not invented**. The artefact used as the empirical graph is a **documented hashtag co-occurrence / same-cluster graph** in FakeNewsNet JSON shape so `RealGraphImporter` can attach a custom topology. Edges occupy `retweets[]` only as a directed-edge container. This graph is **NOT a retweet cascade**.

### Debnath’s “eight” vs our 8 hops

Debnath, Reiner, Sovacool et al. (iScience 2023, STAR Methods) define a skip-gram **context window of eight**: a batch of eight **words** in an individual tweet to estimate `p_together` with “chemtrails”. That is a **word2vec/skip-gram window**, not a hop protocol. This experiment’s **8 hops/ticks** is a logged cost cut vs CIKM K=30. Do not equate the two.

## Isolation

- Did **not** write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`.
- Simulation configs use `outputRoot: thesisExperiment/runs_phase2`.
- LLM simulations were **not** started by this script (no invented MI/MPR).
- OPENAI_API_KEY present: **yes**.

## Attempts

| Step | ok | detail |
|---|---|---|
| `detect_twitter_bearer` | no | absent — will not invent tweets |
| `detect_openai` | yes | present |
| `github_ramit1201_geoeng` | yes |  |
| `mendeley_files_api` | no | HTTP 200 — API body error 400 |
| `mendeley_files_api` | no | HTTP 200 — API body error 400 |
| `mendeley_files_api` | no | HTTP 404 — https://api.elsevier.com/content/datasets/doi/10.17632/546hsym93p.1 |
| `mendeley_landing` | yes | Landing page only; tweet-ID dump not retrieved. |
| `osf_guid` | yes | HTTP 200 |
| `osf_node_files` | yes | HTTP 200 |
| `osf_dataset_sample` | yes | HTTP 200, 5000 lines — tweet text discarded after hashtag extraction; IDs not invented |
| `twitter_hydrate` | no | no_bearer_token |
| `hashtag_cooccurrence_fallback` | yes | NOT a retweet cascade. Empirical graph for D-net / compare. |
| `osf_hashtag_extract` | yes | Hashtags only; tweet text discarded. Topology not expanded from the 5k prefix. |
| `topology_fingerprint` | yes | Node/edge endpoints unchanged; OSF counts are annotations only. |
| `realgraphimporter_validate` | yes |  |
| `write_dnet_configs` | yes | topology_unchanged |

## Sources

1. **Mendeley** `10.17632/546hsym93p.1` — tweet **IDs**, not text. Files API historically 400; landing page may already sit in `data/raw/mendeley_546hsym93p_landing.html`.
   - This run: no dump (API error 400 / landing only).
2. **OSF** `osf.io/75ye3` `dataset.csv` ~662MB. Policy: store a **sample of IDs only** (first 5k records) if the file is reachable; never keep the full CSV in-repo. The live OSF CSV also contains tweet **text and user fields** — those columns were **discarded** (ethics: no re-identification). `tweet_id` in the sample is Excel scientific notation, so IDs are not hydratable. **Hashtags** were extracted from `text` in memory (Ramit1201/geoeng `hashtag_ext` regex) and only aggregate counts were kept.
   - This run: sample 5000 records; usable digit IDs 0; PII discarded=true; hashtag tweets 987; documented pairs observed 65.
3. **GitHub** `Ramit1201/geoeng` at `thesisExperiment/data/debnath_geoeng/` — analysis codes (`hashtag_ext`, NRC, embeddings, Perspective), **not** tweets.
   - Present: **yes**.
4. **Twitter/X API** — bearer env: **absent**. If absent, tweets are not invented.

## Graph used for D-net

This hashtag co-occurrence graph is the **empirical graph** for Phase 2 comparison. It is **not** a hydrated retweet cascade and **not** HDBSCAN on 814k tweets.

- File: `thesisExperiment/data/derived/debnath_hashtag_cascade.json`
- Nodes (user_profiles): **63**
- Directed edges (`retweets[]` container): **228**
- Seed user (chemtrails hub): **chemtrails_hub**
- Edge semantics: **hashtag_cooccurrence_same_cluster**
- Clusters: {"chemtrails":26,"climate_action":16,"environmental":14,"geo":3,"piggyback":2,"expert":2}
- Documented pairs encoded: 50

### OSF hashtag annotation (not a topology change)

- Records streamed: **5000**; with ≥1 hashtag: **987**; distinct hashtags: **564**.
- Documented tag-pairs observed in the prefix: **65**. Directed edges carrying a positive OSF count: **48**.
- These counts **annotate** documented edges (`osfSampleCount`). They do **not** add or remove nodes/edges. The 5k-record prefix is not Debnath’s full co-occurrence network.

### What the nodes are

Accounts keyed by published Debnath hashtags (`#chemtrails`, `#geoengineering`, `#haarp`, `#srm`, `#climateaction`, `#ozone`, …) plus a small expert pair (science journalist / climate scientist) so mixed BPs can map. Follower counts are **illustrative bands** from Figure 2 (≥10k = highly influential), not scraped profiles.

### What the edges are

Documented **hashtag co-occurrence** and **same-cluster** links:

- Table 1 co-tags (chemtrails × haarp × geoengineering × srm/sag/nexrad/nwo/illuminati/gmo).
- Figure 3 2018–2021 broadening (stopspraying, depopulation, climate-action piggyback).
- Figure 4 / p0160 non-conspiracy terms (ozone, biodiversity, air pollution, food security, mitigation).
- p0175 Sweden SCoPEx / `#wedonotconsent` / climate action.
- p0210 UK moderate influence (0.1–0.3) of conspiracy hashtags on public health, climate justice, SG governance — **sparse cross-cluster bridges**, not a complete mixing.
- Figure 5–6 geospecific `#usa` `#uk` `#india` `#sweden` co-occurrence with `#chemtrails`.

They are **not** observed retweets, replies, or `conversation_id` chains.

### Persona mapping

`user_profiles[].description` carries Debnath BP keywords (chemtrails / HAARP / climate action / ozone / journalist / phd). `RealGraphImporter` still uses CIKM bio rules for `--digital-twin`; Dnet configs **override** `personaId` with Debnath BPs:

- Homo: every node `conspiracy_believer` (`personas/phase2/homogeneous_conspiracy.json` if present).
- Mixed: cluster + keyword map into `personas/phase2/mixed_graph.json` (else `expanded_twelve.json`).

## Dnet configs (not executed here)

- `thesisExperiment/configs/phase2/Dnet_c_H_conspiracy.json` — homo, `miScoringMode=continuous`, 63 nodes / 228 edges, seed ["user_chemtrails_hub"]
- `thesisExperiment/configs/phase2/Dnet_d_H_conspiracy.json` — homo, `miScoringMode=dual`, 63 nodes / 228 edges, seed ["user_chemtrails_hub"]
- `thesisExperiment/configs/phase2/Dnet_c_He_mixed.json` — mixed, `miScoringMode=continuous`, 63 nodes / 228 edges, seed ["user_chemtrails_hub"]
- `thesisExperiment/configs/phase2/Dnet_d_He_mixed.json` — mixed, `miScoringMode=dual`, 63 nodes / 228 edges, seed ["user_chemtrails_hub"]

- `seedArticles`: `scopex_2017`, `chemtrails_gates_2018_2021`
- `outputRoot`: `thesisExperiment/runs_phase2`
- LLM subsample: not needed (graph ≤200 nodes); full co-occurrence graph kept
- Dnet config rewrite: **skipped** (topology unchanged; completed D-net sims not overwritten).

## compare_phase2.js

- Empirical **topology unchanged** (same node/edge endpoints). `compare_phase2.js` was **not** re-run; do not wipe `simPending=false`.

## Non-claims / still impossible

- Not HDBSCAN / Skip-gram re-estimation of 814,924 tweets.
- Not a digital twin of Debnath retweet virality.
- Not empirical MPR. Debnath reports toxicity, NRC, embeddings, hashtag networks — not 0–5 MPR.
- Hydration failed: comparison is **structural / hashtag**, not “simulated MPR = Twitter MPR.”
- Cannot recover true tweet IDs from Excel scientific notation (`1.00048E+18` has lost low digits).
- Cannot build `conversation_id` / retweet chains from this OSF sample (those IDs are also unusable / PII-adjacent; text discarded).
- Cannot claim OSF 5k-record prefix = Debnath’s published country-scale Gephi co-occurrence nets.

