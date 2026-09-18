# Debnath-grounded reduced belief profiles

Date: 18 September 2026.

## Limitation (do not hide)

HDBSCAN / Skip-gram clustering on the **814,924-tweet** Debnath dump was **not** run. Reasons:

- Mendeley `10.17632/546hsym93p` is tweet **IDs**, not hydrated text.
- OSF `osf.io/75ye3` `dataset.csv` is **~662 MB**. Downloading it would not finish in this session and still would not yield tweets without a Twitter API.

BPs are **theory-faithful reductions** of the three empirical discourse types in Debnath, Reiner, Sovacool et al., iScience 26, 106166 (2023), PMC10040962 — not data-driven cluster centroids.

## Three types → personas

| Debnath empirical type | Evidence in paper | Persona id | Prompt features |
|---|---|---|---|
| Chemtrails conspiracy (dominant) | Extreme “chemtrails” frequency; 2018–2021 semantic broadening (spraying, weaponization, depopulation, climate-justice piggyback, antivax spillover); high-follower amplifiers (>10k); toxicity mean 0.17 | `conspiracy_believer` | cluster, NRC fear/anger/disgust, high centrality, toxicity prior, 2018–2021 temporal window, hashtags |
| Climate action / justice (smaller non-conspiracy) | Volume linked to SRM governance / COP / IPCC; climate-action wording | `climate_action_advocate` | mitigation/justice hashtags, NRC trust/anticipation, low toxicity |
| Environmental concern (smaller non-conspiracy) | Figure 4 after filtering chemtrails: ozone, biodiversity, air pollution, food security | `environmental_concern` | ecological risk language, NRC ecological fear, specialist not hub |

## Features taken from GitHub codes (`data/debnath_geoeng/`)

Ramit1201/geoeng scripts are **analysis pipelines**, not labelled tweets:

- `NRClex`: NRC lexicon emotions used in prompts — anger, fear, trust, disgust, surprise, joy, sadness, anticipation, positive, negative (their time-series plots).
- `hashtag_ext`: hashtag regex `#[a-zA-Z0-9_-]+`; paper + Table 1 tags used as repertoire (`#chemtrails`, `#haarp`, `#geoengineering`, `#srm`, plus climate/environment tags).
- `Perspective`: toxicity / severe toxicity models; paper means injected as `toxicityPrior`, not live Perspective API.
- `embeddings`: Skip-gram + SVD pipeline; **not** re-estimated (needs the tweet corpus).

## Qualitative slice (not a cascade graph)

No public smaller hydrated tweet file was found. A **paper-quoted** slice lives in `data/derived/debnath_paper_slice.json`: Table 1 toxicity periods + hashtags + semantic neighbour words. That is a style exemplar, **not** a reconstructed 814k cascade.

## Six distortion types (Exp C heuristic)

Keyword taxonomy on rewrite `contentOut`, documented as heuristic not a trained classifier:

1. `spraying_chemtrails` — chemtrails / spraying / poison / lines in the sky
2. `weather_haarp` — HAARP / weather modification / NEXRAD
3. `weaponization` — weather warfare / weapon / manmade earthquakes
4. `depopulation` — depopulation / population control
5. `climate_justice_hijack` — climate action/justice wording **plus** conspiracy markers
6. `antivax_spillover` — vaccine / covid / antivax (2018–2021 spillover)
