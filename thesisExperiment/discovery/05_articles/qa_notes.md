# QA notes for climate/geoengineering seed articles

**Location:** `thesisExperiment/discovery/05_articles/` (discovery only).  
**Do not run experiments from this folder.** The campaign executor should copy `articles_candidates.json` to `thesisExperiment/articles/articles.json` (replace or merge; this file is already wrapped as `{"articles": [...]}` to match the live schema).

This pack has **15** articles × **5** yes/no auditor items (75 questions). Required seeds **SCoPEx (2017)** and **chemtrails–Gates** are first. Remaining items cover Paris, 97% consensus, glaciers, polar bears, CO2-as-plant-food, SAI/geoengineering, net zero, extreme-weather attribution, sea level, volcanic CO2, Great Barrier Reef bleaching, and ClimateFEVER-documented claims.

## Schema (must match `thesisExperiment/articles/articles.json`)

Each object:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable seed id used by campaign configs |
| `domain` | string | `climate_geoengineering`, `climate_misinformation`, `climate_science`, or `climate_policy` |
| `title` | string | Short factual headline |
| `text` | string | Ground-truth base the auditor scores rewrites against |
| `questions` | string[5] | Yes/no; auditor compares rewrite answers to `groundTruth` |
| `groundTruth` | boolean[5] | Parallel to `questions` |
| `sources` | string[] | URLs / DOIs (full bibliography in `sources.md`) |

Engine use: `src/Auditor.js` formats each item as `N. question (expected: Yes|No)` and scores whether a node's rewritten text still answers correctly. Mix true/false expected answers so a conspiracy rewrite that flips facts raises MI.

## How an auditor should score

1. Read the **article `text`**, not the viral slogan the article is correcting.
2. Answer each question Yes/No as the **ground-truth article** would.
3. A node rewrite that drops, inverts, or conspires a fact (e.g. “SCoPEx sprayed thousands of tonnes”, “chemtrails are real”, “97% is a hoax”, “volcanoes out-emit humans”) should mismatch `groundTruth` and score as distortion.
4. Do **not** invent quotations. Numbers in the seed texts are taken from the URLs in `sources.md`.
5. ClimateFEVER labels are **dataset annotations**, not new field measurements. Questions that mention ClimateFEVER ask about those labels or about the matching physical fact, never both confused as one.

## Per-article key (expected Yes/No)

| id | Q1 | Q2 | Q3 | Q4 | Q5 | What a firestorm rewrite typically flips |
|---|---|---|---|---|---|---|
| `scopex_2017` | Y | N | Y | N | Y | Measurement experiment → covert deployment / megatonne spray |
| `chemtrails_gates_2018_2021` | N | Y | Y | Y | N | Contrails → secret Gates spraying / depopulation |
| `paris_agreement_2015` | Y | Y | N | Y | Y | NDCs → one-world emissions dictatorship; deny 1.5/2°C goals |
| `consensus_97_percent` | Y | Y | Y | N | Y | Conditional 97% → “scientists are split” or “97% of all papers” |
| `glacier_retreat` | Y | Y | N | Y | Y | Global mass loss → “glaciers are growing” |
| `polar_bears_sea_ice` | Y | Y | N | Y | N | Habitat loss → “bears are thriving so warming is fake” |
| `co2_plant_food` | Y | N | Y | Y | N | Photosynthesis → CO2 cannot cause warming/acidification |
| `sai_solar_geoengineering` | Y | N | Y | N | Y | Proposed SRM mask → already deployed, or “solves CO2” |
| `net_zero_2050` | Y | Y | N | Y | N | Mid-century accounting goal → hoax, or pledge = physics |
| `extreme_weather_attribution` | Y | Y | N | Y | Y | Odds/intensity → “climate caused this storm alone” or “attribution is fake” |
| `climatefever_polar_bears` | Y | Y | Y | Y | N | Dataset labels → “ClimateFEVER proves bears extinct / booming” |
| `climatefever_co2_claims` | Y | N | Y | Y | N | Ice-age ocean degassing / greenhouse-generator slogans |
| `sea_level_rise` | Y | Y | N | Y | N | Observed rise → “sea level is not happening” |
| `volcanic_vs_human_co2` | Y | Y | N | Y | N | USGS <1% → “volcanoes dwarf humans” |
| `great_barrier_reef_bleaching` | Y | Y | Y | N | N | Heat-driven mass bleaching → runoff-only or “reef is fine / all dead” |

## ClimateFEVER

Fetchable as **`tdiggelm/climate_fever`** on Hugging Face (paper arXiv:2012.00614). A 40-row datasets-server pull already lives under `thesisExperiment/data/`. This folder’s **`climatefever_documented_slice.json`** lists the five claims actually wired into seed articles, copied from that slice (no invented labels).

Three articles are ClimateFEVER-style:

- `climatefever_polar_bears` — claims 0 (SUPPORTS) and 6 (REFUTES)
- `climatefever_co2_claims` — claims 10 and 19 (both REFUTES)
- `great_barrier_reef_bleaching` — claim 14 (SUPPORTS), plus Wikipedia GBR/bleaching pages that ClimateFEVER itself used as evidence sources

Unused slice claims (sea-level slogans, wind-turbine Harvard headline, iceberg Archimedes mix-up, etc.) are listed in the documented slice for later expansion. They were **not** turned into extra seeds here because some ClimateFEVER evidence pages are noisy (the hub card warns about disputed / multi-facet claims).

## Copy instructions for the executor

```text
Copy thesisExperiment/discovery/05_articles/articles_candidates.json
  → thesisExperiment/articles/articles.json
```

Keep `id` values stable if configs already name `scopex_2017` and `chemtrails_gates_2018_2021`. Additional ids can be added to Experiment A grids when the executor expands beyond the two-seed pilot.

## Limitations (explicit)

- Debnath 814,924 tweets: **not hydrated**. Volume (~8,000 around April 2017 SCoPEx) is from the iScience paper / PMC notes, not from a local tweet dump.
- UN net-zero coalition page timed out in this discovery pass; net-zero numbers are IPCC SR15 / AR6 WG III FAQ.
- Article bodies are short encyclopedic paraphrases. They are **ground truth for MI**, not a literature review.
- No quotes were invented. IPCC glacier “unprecedented in at least the last 2000 years” is carried as NOAA’s citation of IPCC, not as a made-up interview.
