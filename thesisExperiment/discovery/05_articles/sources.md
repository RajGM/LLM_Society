# Source URLs for `articles_candidates.json`

Discovery-only pack (18 Sep 2026). Do **not** treat this folder as the live campaign seed file; the executor copies into `thesisExperiment/articles/`.

Facts below are paraphrased from the public pages listed. **No fabricated quotations.** Where a sentence in article text is close to a source, it is a short paraphrase of that page, not an invented interview.

## ClimateFEVER slice (documented, fetchable)

| Item | URL / path |
|---|---|
| Hugging Face dataset | https://huggingface.co/datasets/tdiggelm/climate_fever |
| Paper (arXiv) | https://arxiv.org/abs/2012.00614 |
| GitHub | https://github.com/tdiggelm/climate-fever-dataset |
| UZH landing | https://www.sustainablefinance.uzh.ch/en/research/climate-fever.html |
| Local 40-row hub pull | `thesisExperiment/data/raw/climatefever_hf_rows_0_40.json` |
| Local parsed slice | `thesisExperiment/data/derived/climatefever_slice.json` |
| This folder's documented subset | `climatefever_documented_slice.json` |

**Fetch notes (already logged in `thesisExperiment/data/SOURCES.md`):** `amandakonet/climate_fever` parquet 404; keyword search endpoints timed out / 500; used `tdiggelm/climate_fever` via Hugging Face datasets-server (40 test-split rows). Full hub card: 1,535 claims / 7,675 evidence pairs, single `test` split.

## Per-article sources

### `scopex_2017`

- https://www.keutschgroup.com/scopex — mass 100 g–2 kg, ~20 km, CaCO3, 1 km × 100 m plume, Sweden platform test with **no** particle release, not a geoengineering deployment test.
- https://salatainstitute.harvard.edu/an-update-on-scopex/ — 18 Mar 2024: Keutsch no longer pursuing SCoPEx; platform to be repurposed.
- https://ui.adsabs.harvard.edu/abs/2017AGUFMGC43H1162K/abstract — AGU Fall Meeting 2017 abstract (Keutsch / Keith / Dykema). Local copy: `thesisExperiment/data/raw/agu_2017_scopex_abstract.txt`.

### `chemtrails_gates_2018_2021`

- https://en.wikipedia.org/wiki/Chemtrail_conspiracy_theory — consensus: persistent trails are ice-crystal contrails, not a secret spray program.
- https://doi.org/10.1016/j.isci.2023.106166 — Debnath et al., *Conspiracy spillovers and geoengineering*, iScience 26, 106166 (2023).
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10040962/ — open PMC HTML (Cell HTML/PDF 403 from this environment).
- Mendeley 10.17632/546hsym93p.1 — tweet-ID landing only; **814k dump not downloaded**.

### `paris_agreement_2015`

- https://www.un.org/en/climatechange/paris-agreement — COP21 12 Dec 2015; entry into force 4 Nov 2016; 195 Parties; well below 2°C / pursue 1.5°C; five-year NDC cycle; COP28 first global stocktake.
- https://unfccc.int/process-and-meetings/the-paris-agreement
- https://unfccc.int/sites/default/files/english_paris_agreement.pdf — treaty text (Articles 2, 4, 14).

### `consensus_97_percent`

- https://science.nasa.gov/climate-change/faq/do-scientists-agree-on-climate-change/
- https://doi.org/10.1088/1748-9326/8/2/024024 — Cook et al. 2013: 11,944 abstracts; 66.4% no position; 97.1% of position-taking abstracts endorse AGW.
- https://iopscience.iop.org/article/10.1088/1748-9326/8/2/024024

### `glacier_retreat`

- https://www.climate.gov/news-features/understanding-climate/climate-change-mountain-glaciers — NOAA, 9 May 2025 (Lindsey; reviewed by Zemp, Pelto, Raup). 37 consecutive loss years; 27.3 m w.e. since 1970; IPCC 2,000-year quote.
- https://wgms.ch/latest-glacier-mass-balance-data/
- https://www.ipcc.ch/report/ar6/wg1/

### `polar_bears_sea_ice`

- https://www.nasa.gov/science-research/polar-bears-across-the-arctic-face-shorter-sea-ice-season/
- https://doi.org/10.5194/tc-10-2027-2016 — Stern & Laidre 2016, all 19 regions, 1979–2014.
- https://iucn.org/content/new-assessment-highlights-climate-change-most-serious-threat-polar-bear-survival-iucn-red-list — Vulnerable; sea-ice loss primary threat; >30% decline probability over ~35–40 years.
- https://www.iucn-pbsg.org/iucn-redlist/

### `co2_plant_food`

- https://science.nasa.gov/earth/earth-observatory/the-carbon-cycle/ — ~30% of anthropogenic CO2 into ocean; pH −0.1 since 1750 (~30% acidity).
- https://www.nasa.gov/centers-and-facilities/goddard/carbon-dioxide-fertilization-greening-earth-study-finds/
- https://www.nasa.gov/science-research/earth-science/land-ecosystems-are-becoming-less-efficient-at-absorbing-co2/
- https://www.reuters.com/fact-check/co2-does-help-plants-grow-it-is-still-bad-for-global-warming-2024-04-29/ — secondary fact-check; article text uses NASA, not Reuters wording as a quote.

### `sai_solar_geoengineering`

- https://en.wikipedia.org/wiki/Stratospheric_aerosol_injection — mechanism; Pinatubo ~0.5°C; SCoPEx context.
- https://www.ipcc.ch/report/ar6/wg1/
- https://www.c2g2.net/wp-content/uploads/20220308-C2G-Brief-AR6_WG2_SRM_EN.pdf — SRM is at best a supplement to net-zero CO2, not the main response.
- https://www.c2g2.net/wp-content/uploads/20210810-C2GBrief_AR6_WG1_SRMfinal.pdf — termination shock / regional unevenness (C2G brief of AR6 WG I).

### `net_zero_2050`

- https://www.ipcc.ch/sr15/ — ~45% CO2 cut by 2030 vs 2010; net zero around 2050 for 1.5°C no/limited overshoot.
- https://www.ipcc.ch/report/ar6/wg3/downloads/faqs/IPCC_AR6_WGIII_FAQ_Chapter_03.pdf — net-zero CO2 required to stabilize warming.
- https://www.un.org/en/climatechange/paris-agreement — UN wording on a shift toward a net-zero emissions world.

The UN “net-zero coalition” explainer (https://www.un.org/en/climatechange/net-zero-coalition) timed out when fetched in this session; net-zero numbers in the article are therefore taken from IPCC SR15 / AR6 WG III FAQ, not from an unsourced UN slogan.

### `extreme_weather_attribution`

- https://www.ipcc.ch/report/ar6/wg1/downloads/faqs/IPCC_AR6_WGI_FAQ_Chapter_11.pdf
- https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-11/
- https://www.worldweatherattribution.org/faqs/ — intensity / likelihood / vulnerability; not every event type in every region; every heatwave now more likely and more intense; Stott et al. 2004.

### `climatefever_polar_bears` / `climatefever_co2_claims` / `great_barrier_reef_bleaching`

- https://huggingface.co/datasets/tdiggelm/climate_fever
- https://arxiv.org/abs/2012.00614
- Local labels: claim 0 SUPPORTS, 6 REFUTES, 10 REFUTES, 14 SUPPORTS, 19 REFUTES (see `climatefever_documented_slice.json`).
- Physical grounding: NASA carbon cycle; IUCN/NASA polar bears; Wikipedia GBR / coral bleaching pages as used by ClimateFEVER evidence fields.

### `sea_level_rise`

- https://www.climate.gov/news-features/understanding-climate/climate-change-global-sea-level — 21–24 cm since 1880; 2023 = 101.4 mm above 1993.
- https://sealevel.nasa.gov/understanding-sea-level/by-the-numbers — 3.34 ± 0.40 mm/yr (1993–2020); 1.56 ± 0.30 mm/yr (1900–2018).
- https://en.wikipedia.org/wiki/Sea_level_rise

### `volcanic_vs_human_co2`

- https://www.usgs.gov/programs/VHP/volcanoes-can-affect-climate — volcanoes <1% of human CO2; 0.13–0.44 Gt/yr vs ~35 Gt in 2010; volcanic CO2 has not caused detectable modern warming; eruptions can cool via sulfate.
- https://volcanoes.usgs.gov/vsc/file_mngr/file-154/Gerlach-2011-EOS_AGU.pdf
- https://www.usgs.gov/programs/VHP/volcanic-gases-can-be-harmful-health-vegetation-and-infrastructure

## Local repo extracts already on disk (not re-invented)

- `thesisExperiment/data/derived/wikipedia_chemtrail_extract.json`
- `thesisExperiment/data/derived/wikipedia_sai_extract.json`
- `thesisExperiment/data/raw/harvard_keutsch_scopex.html`
- `thesisExperiment/data/raw/harvard_salata_scopex_update_2024.html`
- `thesisExperiment/data/derived/debnath_iscience_notes.txt`
