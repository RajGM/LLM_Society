# Debnath reconstruct report

Date: 2026-09-18T16:41:55.958Z

## Headline

This graph is **NOT a retweet cascade**. Twitter/X hydration did not run (no bearer token and/or no usable ID dump). The artefact is a **documented hashtag co-occurrence / same-cluster graph** in FakeNewsNet JSON shape so `RealGraphImporter` can attach a custom topology. Edges occupy `retweets[]` only as a directed-edge container.

## Isolation

- Did **not** write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`.
- Simulation configs use `outputRoot: thesisExperiment/runs_phase2`.
- LLM simulations were **not** started by this script (no invented MI/MPR).
- OPENAI_API_KEY present: **no**.

## Attempts

| Step | ok | detail |
|---|---|---|
| `detect_twitter_bearer` | no | absent — will not invent tweets |
| `detect_openai` | no | absent — Dnet configs written, LLM not run |
| `github_ramit1201_geoeng` | yes |  |
| `mendeley_files_api` | no | HTTP 200 — API body error 400 |
| `mendeley_files_api` | no | HTTP 200 — API body error 400 |
| `mendeley_files_api` | no | HTTP 404 — https://api.elsevier.com/content/datasets/doi/10.17632/546hsym93p.1 |
| `mendeley_landing` | yes | Landing page only; tweet-ID dump not retrieved. |
| `osf_guid` | yes | HTTP 200 |
| `osf_node_files` | yes | HTTP 200 |
| `osf_dataset_sample` | yes | HTTP 200, 4043 lines — https://files.osf.io/v1/resources/75ye3/providers/osfstorage/63a03f8750be9e0d13772c09 |
| `twitter_hydrate` | no | no_bearer_token |
| `hashtag_cooccurrence_fallback` | yes | NOT a retweet cascade. |
| `realgraphimporter_validate` | yes |  |
| `subsample_for_llm` | yes |  |
| `write_dnet_configs` | yes |  |

## Sources

1. **Mendeley** `10.17632/546hsym93p.1` — tweet **IDs**, not text. Files API historically 400; landing page may already sit in `data/raw/mendeley_546hsym93p_landing.html`.
   - This run: no dump (API error 400 / landing only).
2. **OSF** `osf.io/75ye3` `dataset.csv` ~662MB. Policy: store a **sample of IDs only** (first 5k lines) if the file is reachable; never keep the full CSV in-repo. The live OSF CSV also contains tweet **text and user fields** — those columns were **discarded** (ethics: no re-identification). `tweet_id` in the sample is Excel scientific notation, so IDs are not hydratable.
   - This run: sample 4043 lines; usable digit IDs 0; PII discarded=true.
3. **GitHub** `Ramit1201/geoeng` at `thesisExperiment/data/debnath_geoeng/` — analysis codes (`hashtag_ext`, NRC, embeddings, Perspective), **not** tweets.
   - Present: **yes**.
4. **Twitter/X API** — bearer env: **absent**. If absent, tweets are not invented.

## Graph used for D-net

- File: `thesisExperiment/data/derived/debnath_hashtag_cascade.json`
- Nodes (user_profiles): **63**
- Directed edges (`retweets[]` container): **228**
- Seed user (chemtrails hub): **chemtrails_hub**
- Edge semantics: **hashtag_cooccurrence_same_cluster**
- Clusters: {"chemtrails":26,"climate_action":16,"environmental":14,"geo":3,"piggyback":2,"expert":2}
- Documented pairs encoded: 50

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

## Non-claims

- Not HDBSCAN / Skip-gram re-estimation of 814,924 tweets.
- Not a digital twin of Debnath retweet virality.
- Not empirical MPR. Debnath reports toxicity, NRC, embeddings, hashtag networks — not 0–5 MPR.
- If hydration failed, comparison in later steps is **structural / hashtag**, not “simulated MPR = Twitter MPR.”

