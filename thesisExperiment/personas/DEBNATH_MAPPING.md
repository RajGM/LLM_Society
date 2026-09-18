# Debnath mapping — 12 personas (not only 3 BPs)

Date: 18 September 2026.

HDBSCAN on 814,924 tweets was **not** run (OSF tweet-ID file ~662 MB; no Twitter hydration). Personas are **theory-faithful expansions** of Debnath, Reiner, Sovacool et al., iScience 26, 106166 (2023).

## Type → variants

| Debnath type | Persona id | Variant | Role |
|---|---|---|---|
| conspiracy_cluster | `conspiracy_believer` | core_chemtrails | Geoengineering Conspiracy Believer (Debnath chemtrails cluster) |
| conspiracy_cluster | `conspiracy_haarp_weather` | haarp_weather_warfare | HAARP / weather-warfare believer (Debnath chemtrails neighbour terms) |
| conspiracy_cluster | `conspiracy_depopulation` | depopulation_gates | Depopulation / Gates-target believer (Debnath 2018–2021 broadening) |
| conspiracy_cluster | `conspiracy_climate_piggyback` | climate_justice_piggyback | Climate-action piggyback conspiracist (Debnath hijack stream) |
| climate_action | `climate_action_advocate` | mitigation_justice | Climate Action Advocate (Debnath non-conspiracy stream) |
| climate_action | `climate_justice_youth` | youth_justice | Climate justice youth organiser (Debnath climate-action variant) |
| climate_action | `mitigation_first_policy` | srm_governance_policy | Mitigation-first policy analyst (Debnath climate-action / SRM-governance) |
| environmental_concern | `environmental_concern` | general_ecological_risk | Environmental Concern Specialist (Debnath ozone/biodiversity stream) |
| environmental_concern | `ozone_stratosphere_specialist` | ozone_chemistry | Ozone / stratosphere concern voice (Debnath ozone neighbour) |
| environmental_concern | `biodiversity_food_security` | biodiversity_food | Biodiversity and food-security concern (Debnath ecology/food terms) |
| expert_added | `climate_scientist` | publishing_scientist | Climate scientist (expert voice for heterogeneous mix) |
| expert_added | `science_journalist` | science_journalist | Science journalist (expert/media voice for heterogeneous mix) |

## Heterogeneous mixes

Each He chain is 8 **unique** personas (no within-chain repeats). Mixes 00–05 are sliding windows over the 12 ids; mixes 06–11 are seeded shuffles.

- **mix_00:** conspiracy_believer → conspiracy_haarp_weather → conspiracy_depopulation → conspiracy_climate_piggyback → climate_action_advocate → climate_justice_youth → mitigation_first_policy → environmental_concern
- **mix_01:** conspiracy_haarp_weather → conspiracy_depopulation → conspiracy_climate_piggyback → climate_action_advocate → climate_justice_youth → mitigation_first_policy → environmental_concern → ozone_stratosphere_specialist
- **mix_02:** conspiracy_depopulation → conspiracy_climate_piggyback → climate_action_advocate → climate_justice_youth → mitigation_first_policy → environmental_concern → ozone_stratosphere_specialist → biodiversity_food_security
- **mix_03:** conspiracy_climate_piggyback → climate_action_advocate → climate_justice_youth → mitigation_first_policy → environmental_concern → ozone_stratosphere_specialist → biodiversity_food_security → climate_scientist
- **mix_04:** climate_action_advocate → climate_justice_youth → mitigation_first_policy → environmental_concern → ozone_stratosphere_specialist → biodiversity_food_security → climate_scientist → science_journalist
- **mix_05:** climate_justice_youth → mitigation_first_policy → environmental_concern → ozone_stratosphere_specialist → biodiversity_food_security → climate_scientist → science_journalist → conspiracy_believer
- **mix_06:** conspiracy_climate_piggyback → climate_scientist → conspiracy_believer → science_journalist → climate_justice_youth → conspiracy_haarp_weather → mitigation_first_policy → environmental_concern
- **mix_07:** environmental_concern → ozone_stratosphere_specialist → climate_action_advocate → climate_justice_youth → science_journalist → mitigation_first_policy → biodiversity_food_security → conspiracy_haarp_weather
- **mix_08:** science_journalist → conspiracy_depopulation → mitigation_first_policy → ozone_stratosphere_specialist → conspiracy_haarp_weather → conspiracy_believer → climate_action_advocate → conspiracy_climate_piggyback
- **mix_09:** climate_scientist → biodiversity_food_security → environmental_concern → conspiracy_believer → conspiracy_haarp_weather → science_journalist → conspiracy_depopulation → climate_justice_youth
- **mix_10:** biodiversity_food_security → science_journalist → environmental_concern → mitigation_first_policy → climate_action_advocate → conspiracy_believer → conspiracy_depopulation → conspiracy_haarp_weather
- **mix_11:** climate_justice_youth → conspiracy_climate_piggyback → mitigation_first_policy → climate_action_advocate → conspiracy_believer → conspiracy_haarp_weather → ozone_stratosphere_specialist → conspiracy_depopulation
