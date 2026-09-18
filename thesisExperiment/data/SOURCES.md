# Downloaded sources (18 Sep 2026)

All files live under `thesisExperiment/data/`. No 814k tweet dump.

| File | Source | Role |
|---|---|---|
| `raw/wikipedia_chemtrail_conspiracy.json` | Wikipedia API, Chemtrail conspiracy theory | Factual consensus for chemtrails article |
| `raw/wikipedia_stratospheric_aerosol_injection.json` | Wikipedia API, Stratospheric aerosol injection | SAI / SCoPEx context |
| `raw/harvard_keutsch_scopex.html` | https://www.keutschgroup.com/scopex | Primary SCoPEx FAQ (mass, altitude, CaCO3, Sweden test) |
| `raw/harvard_salata_scopex_update_2024.html` | Harvard Salata Institute, 18 Mar 2024 | Cancellation: Keutsch no longer pursuing SCoPEx |
| `raw/debnath_iscience_2023.html` / `.pdf` | Cell iScience S2589-0042(23)00243-7 | Debnath et al. conspiracy-spillover paper |
| `raw/mendeley_546hsym93p_landing.html` | DOI 10.17632/546hsym93p.1 | Dataset landing page only |
| `debnath_geoeng/*` | https://github.com/Ramit1201/geoeng | Analysis scripts (NRC, embeddings, hashtags), **not** tweets |
| `raw/climatefever_hf_*.json` | HuggingFace datasets-server `tdiggelm/climate_fever` | Optional claim slice |
| `raw/wikipedia_paris_agreement.json` | Wikipedia API | Paris article grounding |
| `raw/wikipedia_scientific_consensus_climate.json` | Wikipedia API | Consensus article |
| `raw/wikipedia_sea_level_rise.json` | Wikipedia API | Sea-level article |
| `raw/wikipedia_polar_bear.json` | Wikipedia API | Polar-bear article |
| `raw/wikipedia_retreat_of_glaciers.json` | Wikipedia API | Glacier article |
| `raw/osf_75ye3_landing.html` | OSF 75ye3 landing (not dataset.csv) | Confirmed tweet-ID dump; **662MB CSV not downloaded** |

## Fallbacks (documented, not faked)

1. **Debnath 814k tweets:** Mendeley files API returned 400; the public dataset is tweet IDs requiring Twitter API hydration. Not downloaded. Paper + GitHub codes used instead. **No fake HDBSCAN.**
2. **SCoPEx Wikipedia page** does not exist as a standalone article; SAI Wikipedia + Harvard primary pages used.
3. **ClimateFEVER** `amandakonet/climate_fever` parquet URL 404; used `tdiggelm/climate_fever` via datasets-server (40 test-split claims). Keyword search endpoints timed out / 500.
4. **ADS search API** 401 without a token; AGU 2017 abstract saved as `raw/agu_2017_scopex_abstract.txt`.
5. **Cell Press** HTML/PDF 403; **PMC HTML** saved (`debnath_iscience_2023_pmc.html`, PMC10040962). Notes: `derived/debnath_iscience_notes.txt`.
6. **OSF `osf.io/75ye3` `dataset.csv` ~662 MB** (tweet IDs). Not downloaded. Paper-quoted slice: `derived/debnath_paper_slice.json`. Reduced BPs: `derived/debnath_bps.md`.
