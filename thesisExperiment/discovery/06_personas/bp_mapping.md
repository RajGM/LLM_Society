# Persona → Debnath type → Pfeffer identity factor

Date: 18 September 2026.
Discovery output only. Campaign executor copies into `thesisExperiment/personas/`; this folder is not the live campaign library.

## Limitation (do not hide)

HDBSCAN / Skip-gram clustering on the **814,924-tweet** Debnath dump was **not** run.

- Mendeley `10.17632/546hsym93p` is tweet **IDs**, not hydrated text.
- OSF `osf.io/75ye3` `dataset.csv` is **~662 MB** tweet IDs.
- `data/debnath_geoeng/` (Ramit1201/geoeng) is **analysis code**, not labelled users.

Personas are **theory-faithful reductions** of Debnath, Reiner, Sovacool et al., *Conspiracy spillovers and geoengineering*, iScience 26, 106166 (2023), PMC10040962, plus the three discourse types already reduced in `data/derived/debnath_bps.md`. They are **not** cluster centroids.

## Schema (engine-compatible)

Matches `personas/personas.json` human entries:

| Field | Required | Notes |
|---|---|---|
| `id`, `name`, `systemPrompt` | yes | LLM rewrite identity |
| `tags` | yes | Homophily Jaccard + InstitutionalTrust (`expert`→science, `media`→media, `environment`→science, `advocacy`, `social-media`→media) |
| `emotionalTone` | yes | Pfeffer **valence** knob |
| `ideologicalBias`, `expertiseDomain` | yes (nullable) | Ablation / identity |

Debnath extension fields (already used in `thesisExperiment/personas/mixed_three_bp.json`; ignored by the LLM call, useful for mapping and Exp C):

`debnathType`, `debnathVariant`, `nrcStyle`, `hashtagRepertoire`, `toxicityPrior`, `temporalWindow`, plus discovery-only `centralityBand`, `followerPrior`, `linguisticStyle`, `distortionFamily`, `pfefferIdentity`.

`Simulation` reads `file.personas`; the `_discovery` object in `personas_candidates.json` is safe to leave or strip.

## Debnath’s three empirical types (what we expand)

| Type | Paper evidence | Volume | Default valence |
|---|---|---|---|
| **Conspiracy (chemtrails)** | Extreme “chemtrails” frequency (Fig 2); 2018–2021 broadening (stop spraying, climate-action piggyback, weaponization, depopulation, antivax spillover); mean Perspective toxicity **0.17**, severe **0.12**, median up in 2018–21 (Fig 3B–C); ≥10k-follower amplifiers (Fig 2) | Dominant | High (alarming) |
| **Climate action / justice** | Smaller non-conspiracy stream after filtering chemtrails; mitigation, climate justice, accountability; tweet **volume** tied to SRM governance / COP / IPCC / NASEM; Sweden SCoPEx protests as climate-action case (p0175, S4C, HOME/ETC) | Smaller | Urgent, low toxicity |
| **Environmental concern** | Fig 4 after filtering chemtrails: ozone, biodiversity, air pollution, food security, ecology, public health | Smaller still | Cautious ecological fear |

Experts / journalists / moderators are **not** Debnath centroids. They are added so Experiment He (heterogeneous linear chains) and mixed-graph firestorm cells are not 12 conspiracy clones — the CIKM design needs identity contrast (experts vs identity personas), on a **new climate corpus**.

## GitHub codes → prompt features (not tweet lists)

`data/debnath_geoeng/` does **not** ship a hashtag vocabulary file. Features injected:

| Folder | What it actually is | How personas use it |
|---|---|---|
| `hashtag_ext` | Regex `#[a-zA-Z0-9_-ー\\.]+`; lowercases; optional filter of `#geoengineering` / `#sweden` for country files; top-30 barplots; Gephi co-occurrence | `hashtagRepertoire` filled from **paper** Table 1–2 and named Fig 6 tags, not from a fake ranked CSV |
| `NRClex` | `textdata` NRC join; cumulative plots of trust, anger, positive, negative, surprise, disgust, fear (and joy subset) | `nrcStyle` arrays; STAR Methods grouping: positive = joy/trust/optimism; negative = disgust/sadness/fear/anger; neutral = anticipation/surprise |
| `Perspective` | `peRspective` `TOXICITY` / `SEVERE_TOXICITY` (and other models) | `toxicityPrior` = paper **mean** 0.17 as corpus prior; variants sit around that mean. Table 1 scores 0.94–0.99 are the **explicit-language tail**, not a persona to clone (prompts forbid slurs) |
| `embeddings` | Skip-gram + SVD | **Not** re-estimated. 2018–2021 neighbour words come from the paper / `data/derived/debnath_paper_slice.json` |

Hashtags used in repertoires (paper-quoted, not invented): `#geoengineering`, `#chemtrails`, `#haarp`, `#srm`, `#sag`, `#weathermodification`, `#nwo`, `#illuminati`, `#gmo`, `#climate`, `#nexrad`, `#ActOnClimate`, `#wedonotconsent`, `#usa`, `#uk`, `#india`, `#sweden`, plus Fig 4-style `#mitigation`, `#biodiversity`, `#airpollution`, `#ozone`, `#environment`, `#climatejustice`, `#ecology`, `#foodsecurity`.

**Not copied into prompts:** Table 2 India antisemitic tropes; 5G “genocide” tags; Table 1 slur strings. Paper finding kept: India/Sweden emphasise SG as **Western influence**.

## Variant axes (why 16, not 3)

| Axis | Debnath source | How it splits personas |
|---|---|---|
| **Toxicity** | Mean 0.17; 2018–21 rise; Table 1 tail | Hubs 0.16–0.18; periphery 0.10; climate/env 0.03–0.08; experts/moderator 0.02–0.03 |
| **Centrality** | Fig 2 ≥10k followers; Fig 5 eigenvector low 0–0.09 / mid 0.1–0.29 / high 0.3–1.0; `#chemtrails` central in UK 0.58, USA 0.47, Sweden 0.68, India 0.37 | `conspiracy_believer` / `depopulation` / `hashtag_attention_communicator` = high; HAARP / piggyback / climate-action = mid; skywatcher / ozone / biodiversity / caregiver = low; scientist / journalist / moderator = institutional |
| **Linguistic style** | Table 1 alarming/explicit vs Fig 4 technical vs p0095 hashtag attention-seeking vs first-person sky reports (Table 1 2009–12 “sky above my neighborhood”) | Short high-arousal; military-tech paranoid; activist-hijack; first-person sky report; policy brief; hedged science; inverted-pyramid; procedural sanitising |
| **Temporal window** | Paper’s three frames: 2009–12, 2013–17, **2018–21** | Conspiracy core locked to 2018–21 broadening; HAARP retains 2009–12 neighbour lexicon; climate-action keyed to governance events (COP21, NASEM, Sweden 2021) |
| **Hashtags** | Table 1, Fig 6, `hashtag_ext` regex | Per-persona repertoire (see JSON) |
| **Distortion family** (Exp C heuristic) | `data/derived/debnath_bps.md` six types | `spraying_chemtrails`, `weather_haarp`, `depopulation`, `climate_justice_hijack`; `weaponization` folded into HAARP; `antivax_spillover` folded into depopulation (2018–21), not a seventh BP |

## Mapping table

Pfeffer **identity alignment** = message–identity fit. Engine knobs: persona prompts + tag homophily (`_homophilyTrust`) + InstitutionalTrust tag biases. Swept as homogeneous conspiracy vs mixed BPs vs 12 unique He chains.

Identity fit to the two campaign seeds:

- **chemtrails–Gates (2018–2021)** high-valence conspiracy frame → aligned for conspiracy BPs, misaligned for experts/moderator/climate-action (except piggyback hybrid).
- **SCoPEx (2017)** calm factual science frame → aligned for scientist/journalist/ozone specialist; still usable by climate-action (governance/moral hazard); conspiracy BPs **recode** it (identity clash → expected MI rise).

| id | Debnath type | Variant | Pfeffer identity factor | Valence (`emotionalTone`) | Core 12? |
|---|---|---|---|---|---|
| `conspiracy_believer` | conspiracy_cluster | high-centrality chemtrails hub, tox 0.17, 2018–21 | Conspiracy identity **aligned** with chemtrails seed; high echo potential on scale-free hubs | alarming | yes |
| `conspiracy_haarp_weather` | conspiracy_cluster | HAARP / NEXRAD / weather warfare | Conspiracy identity aligned with **weaponization** frame; mid centrality | alarming | yes |
| `conspiracy_depopulation` | conspiracy_cluster | Gates / depopulation / antivax spillover, tox 0.18 | Conspiracy identity aligned with Gates–chemtrails seed; high disgust valence | alarming | yes |
| `conspiracy_climate_piggyback` | conspiracy_cluster | 2018–21 climate-justice **hijack** | **Hybrid**: justice tags raise homophily with climate-action nodes while payload stays conspiracy | urgent | yes |
| `conspiracy_peripheral_skywatcher` | conspiracy_cluster | low centrality, tox 0.10, first-person sky reports | Same conspiracy identity, **weaker** amplifier / echo strength | anxious | extra |
| `climate_action_advocate` | climate_action | mitigation / justice, governance-event reactive | Climate-action identity **misaligned** with chemtrails payload; moral-hazard fit to SAI | urgent | yes |
| `climate_action_sweden_scopex` | climate_action | Sweden SCoPEx / HOME / ETC, `#sweden` | Climate-action identity, **event-reactive** (Pfeffer surprise held as drip; this BP still *talks* shock) | urgent | yes |
| `mitigation_first_policy` | climate_action | NASEM/IPCC/COP policy register | Institutional-policy identity; low valence | measured | extra |
| `environmental_concern` | environmental_concern | Fig 4 general ecological risk | Ecological-risk identity; partial fit to SAI caveats, reject spraying | cautious | yes |
| `ozone_stratosphere_specialist` | environmental_concern | ozone neighbour | Scientific-risk identity; aligned with factual SAI/SCoPEx seed | cautious | yes |
| `biodiversity_food_security` | environmental_concern | ecology / food / monsoon-yield | Livelihood-ecology identity; misaligned with conspiracy payload | concerned | yes |
| `climate_scientist` | expert_added | publishing atmospheric/climate scientist | **Science-institution** identity; CIKM-style expert buffer | neutral | yes |
| `science_journalist` | expert_added | science desk, not sensationalist | **Media-verification** identity | neutral | yes |
| `platform_moderator_toxicity` | expert_added | Perspective TOXICITY analogue | **Platform-institution** identity opposed to toxic valence (Pfeffer valence brake) | calm | yes |
| `caregiver_air_quality` | environmental_concern | public health / air pollution | Health-protection identity; **not** CIKM Young Parent | protective | extra |
| `hashtag_attention_communicator` | climate_action | p0095 hashtag attention-seeking, ≥10k | Visibility identity (reach); **not** CIKM Lifestyle Influencer | enthusiastic | extra |

Type counts in **recommended core 12**: conspiracy 4, climate_action 2, environmental_concern 3, expert_added 3. Satisfies executor `selfcheck.js` floors (conspiracy ≥3, climate_action ≥2, environmental ≥2, expert_added ≥2) and the user request for scientist / journalist / **platform-moderator**.

Full file: **16** personas.

## Not a CIKM reprint

CIKM 2025 used commercial/crime-news identities (Young Parent, Lifestyle Influencer, left/right, etc.) on `crime_0`–style articles. **Do not** treat this list as those 22 names with climate stickers.

| Temptation | What we did |
|---|---|
| Rename `young_parent` → climate parent | **Rejected as a rename.** Extra persona `caregiver_air_quality` exists only with an explicit Debnath map: Fig 4 public health + air pollution; UK network moderate-centrality public-health cluster (p0210). Different `id`, different tags (`environment`, `public-health`), no CIKM family-filter prompt. |
| Rename `lifestyle_influencer` → eco influencer | **Rejected as a rename.** Extra persona `hashtag_attention_communicator` maps Debnath p0095 (hashtags as attention-seeking), `hashtag_ext` regex, and Fig 2 ≥10k amplifiers. Not fashion/wellness/emojis. |
| Rename `medical_expert` / `tech_expert` | Replaced by `climate_scientist` (atmospheric/climate) and `ozone_stratosphere_specialist` (Fig 4 ozone). |
| Rename `sensationalist_news` | Not included. `science_journalist` is verification-desk, low valence. |
| Rename `peacekeeper` | Closest new role is `platform_moderator_toxicity`, grounded in Debnath’s Perspective toxicity measurement, not a generic peacekeeper. |

If the executor needs exactly 12 IDs for Experiment H (one homogeneous chain per persona), use `_discovery.recommendedCore12` in `personas_candidates.json`.

## Suggested mix files (executor)

Do not write these here. Copy instructions:

1. `thesisExperiment/personas/expanded_twelve.json` ← core 12 from `personas_candidates.json`.
2. `homo/{id}.json` ← one persona each for Exp H.
3. `mixed_three_bp.json` ← `climate_action_advocate`, `environmental_concern`, `conspiracy_believer` (keep the 3-type factorial).
4. `homogeneous_conspiracy.json` ← `conspiracy_believer` only.
5. `mixed_graph.json` ← 8 of 12 spanning all four `debnathType`s (include at least one expert and the moderator).
6. He mixes: 8 **unique** IDs, sliding windows + shuffles, so no chain is 8 conspiracy clones.

`conspiracy_climate_piggyback` shares the `climate-action` tag with genuine climate-action BPs: that is intentional for homophily measurement (identity vocabulary vs payload).

## Pfeffer six-factor reminder (identity only)

Identity alignment is **swept** by this library. Other factors stay with configs (`pfeffer_mapping.md`):

| Factor | This discovery pack | Not this pack |
|---|---|---|
| Valence | `emotionalTone` + `toxicityPrior` + seed wording | Extra-toxic rewrite cell |
| Surprise | Sweden BP *talks* event shock | Seed-all-nodes volume shock |
| **Identity alignment** | 16 BPs / core 12 | — |
| Network clustering | tags for homophily | topology JSON |
| Information echo | piggyback tag overlap; hub vs periphery | echo-chamber topology |
| Temporal acceleration | `temporalWindow` in prompts only | `maxTicks` / `maxHops` |

## Ethics

Simulated conspiracy personas are for measuring **misinformation integrity (MI/MPR/k\*)**, not for targeting real users. Prompts forbid slurs and violent instructions. No hydrated Debnath user is impersonated.
