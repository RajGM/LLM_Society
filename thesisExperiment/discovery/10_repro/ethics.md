# Ethics notes — climate-firestorm simulation

This experiment **simulates** LLM agents with belief profiles drawn from published discourse types. It does **not** contact, scrape, or target living users. It is a TUM thesis pilot of misinformation *dynamics* in a sandbox graph, not an intervention on any platform.

## Simulating conspiracy personas

`thesisExperiment/personas/` contains a **geoengineering-conspiracy** BP (`conspiracy_believer`) plus, in the mixed file, climate-action and environmental-concern BPs. These are **theory-faithful reductions** of three discourse types reported by Debnath, Reiner, Sovacool et al. (*iScience* 26, 106166, 2023), not named individuals and not cluster centroids from re-run HDBSCAN.

Intended use:

- Study how valence, identity mix, and topology change **Misinformation Index (MI)** in an auditor-scored sandbox.
- Compare homogeneous conspiracy graphs vs mixed BPs on the same seeds.

Constraints already in the prompts:

- No slurs; conspiracy style is “alarming and shareable,” not harassment of real people.
- Mixed non-conspiracy personas are instructed **not** to invent secret spraying programs.

Dual-use: rewrite texts in `runs/*/nodes/*.json` can themselves look like conspiracy posts. Release policy is in `open_science.md`. Do not deploy these personas against real accounts or as social-media bots.

## No targeting of real users

| Practice | Status in this repo |
|---|---|
| Messaging or following real Twitter/X users | **Not done** |
| Reconstructing identifiable people from tweet text | **Not done** (no hydrated tweets) |
| Using living persons as named agent identities | **Not done** (generic BP ids) |
| Public figures in **seed articles** | Bill Gates / Keutsch appear only as **already public** scientific-record claims in auditor items (funding ≠ covert spraying) |
| Human subjects / IRB-style recruitment | None; no participants |

Seed articles argue **against** chemtrails as a verified spraying program and treat SCoPEx as a small, later-cancelled measurement proposal. Conspiracy BPs are the *object* of study, not a toolkit for spreading those claims outside the sim.

## Debnath tweet IDs — not hydrated

Debnath et al. released tweet **IDs** (Mendeley `10.17632/546hsym93p`; OSF `osf.io/75ye3` `dataset.csv` ~662 MB). This campaign:

- Did **not** download the 814,924-tweet dump.
- Did **not** call the Twitter/X API to hydrate IDs into text, user metadata, or follower graphs.
- Did **not** re-estimate Skip-gram / HDBSCAN clusters.

What *was* used instead (`data/SOURCES.md`, `data/derived/debnath_bps.md`):

- Paper + PMC HTML notes; GitHub `Ramit1201/geoeng` **analysis scripts** (NRC, hashtags, Perspective pipeline, embeddings code) — **not** tweets.
- Paper-quoted slice (`debnath_paper_slice.json`) as a **style exemplar**, not a reconstructed cascade.
- Reduced BPs in JSON personas.

Hydrating IDs would re-identify users and likely violate platform ToS and the original “IDs only” release. Do not hydrate for this thesis unless a separate ethics review and Twitter/X research access are in place.

## ClimateFEVER license (what is known)

A 40-row slice was pulled from Hugging Face datasets-server `tdiggelm/climate_fever` (`data/raw/climatefever_hf_rows_0_40.json` → `data/derived/climatefever_slice.json`). **It is unused in Experiment A/B seeds** (`articles.json` is SCoPEx + chemtrails–Gates only).

License status as of this inspection:

| Source | License statement |
|---|---|
| Original dataset card `tdiggelm/climate_fever` | Hugging Face loading script leaves `_LICENSE` **empty** (“TODO: Add the licence… if you can find it”). Dataset card emphasizes **citation**, not a SPDX license. |
| GitHub `tdiggelm/climate-fever-dataset` | Same: cite Diggelmann et al.; no SPDX in the README reviewed via public pages. |
| BEIR redistribution `BeIR/climate-fever` | Declares **CC BY-SA 4.0** — that is the *BEIR copy*, not a confirmed original grant. |
| Evidence sentences | Retrieved from **English Wikipedia** (typically **CC BY-SA**). Claims were collected from the internet (mixed third-party text). |

**Practical rule:** treat ClimateFEVER as **cite-and-share-alike / unclear original license**. If the slice is ever redistributed:

1. Cite Diggelmann, Boyd-Graber, Bulian, Ciaramita, Leippold, “CLIMATE-FEVER: A Dataset for Verification of Real-World Climate Claims,” arXiv:2012.00614 (NeurIPS 2020 climate workshop).
2. Do not claim an original license that the authors did not publish.
3. Wikipedia-derived evidence should keep **CC BY-SA** attribution if redistributed.
4. Prefer pointing reproducers to Hugging Face / the authors’ JSONL rather than forking the full dataset.

Because the slice is unused in the A grid, the thesis can omit it from any public release without breaking A/B reruns.

## Other third-party text

| Material | Handling |
|---|---|
| Wikipedia chemtrails / SAI extracts | CC BY-SA; used to ground factual seed wording |
| Harvard Keutsch / Salata SCoPEx pages | Institutional web pages; cited in `articles.json` `sources` |
| Cell/iScience Debnath paper | Publisher HTML 403; PMC HTML saved for notes — respect publisher/PMC terms; quote sparingly |
| Engine default crime/news articles + 26 personas | Co-authored paper corpus; **not** this thesis’s climate grid |

## Human evaluation template

Runs may contain `human_eval_template.csv`. If used, raters should see **simulated** rewrites, not be asked to interact with real users. Store rater IDs separately from open data.

## Bottom line

Sandbox LLM agents + public scientific claims + **unhydrated** tweet-ID datasets. No real-user targeting. Conspiracy personas are research instruments with dual-use rewrite logs — keep those logs off the default public dump (see `open_science.md`).
