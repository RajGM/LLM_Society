# Open science — what to release vs withhold

Goal: someone with this repo + their own API key can **rerun homo/hetero A/B** and recompute aggregate tables, without shipping secrets or a dual-use dump of conspiracy rewrites.

Engine license on the README badge is **MIT**; a `LICENSE` file was **not** found in the repo root at inspection. Add an explicit license before a public archive.

## Release (default public / thesis appendix)

| Asset | Why it is safe enough |
|---|---|
| `thesisExperiment/configs/*.json` except `_probe_api.json` | Protocol. Include SHA-256 from `repro.md`. |
| `thesisExperiment/configs/grid.json` | Cell list and held knobs |
| `thesisExperiment/personas/*.json` | Synthetic BPs; cite Debnath; not user data |
| `thesisExperiment/articles/articles.json` | Factual seeds + auditor items; cite Harvard / Wikipedia / Debnath |
| `thesisExperiment/pfeffer_mapping.md` | Factor operationalisation |
| `thesisExperiment/README.md`, `data/SOURCES.md`, `data/derived/debnath_bps.md` | Limitations (no 814k HDBSCAN) |
| `thesisExperiment/scripts/run_campaign.js`, `parse_results.js`, `plot_results.py`, `download_public_data.js`, `redact_manifest.js` | Rerun path |
| `thesisExperiment/results/summary.json`, `summary.md`, `findings.md` | **Aggregate** MI / MPR / k\* / PI / distortion **counts** |
| Plots | `mi_mpr_by_condition.png`, `kstar_by_condition.png`, `b_before_after.png` |
| `results/campaign_manifest.json` **after** `redact_manifest.js` | Run order, usage line, exit codes — check tails for key fragments first |
| `runs/*/graph_topology.json` | Edges + persona ids; no rewrite text |
| `runs/*/metadata.json` **stripped** | Keep topology, seeds, `llmUsage` totals; drop per-node rewrite-heavy `results` blobs if you publish metadata at all |
| `data/derived/debnath_paper_slice.json` | Quotes/stats from the paper, not tweets |
| Pointers to public sources | Wikipedia API, Keutsch/Salata URLs, PMC, Mendeley **landing** page, HF dataset **name** |
| This folder | `discovery/10_repro/*` |

Optional: empty `human_eval_template.csv` schema without rater responses.

## Do **not** release (or keep in a restricted archive)

| Asset | Reason |
|---|---|
| `.env`, `.env.local` | API keys. Already gitignored. |
| Any file that prints a live key prefix | `src/loadEnv.js` logs `KEY = <prefix>…`. Scrub `results/logs/*.log` before sharing. |
| Raw OpenAI/Anthropic HTTP dumps | Full **system + user prompts** (conspiracy instructions + article text) and completions. The engine does not save HTTP traces by default; do not add debug dumps to git. |
| `runs/*/nodes/node_*.json` as a public tarball | Contains `contentIn` / `contentOut` conspiracy-style rewrites (dual-use) and inbox copies of the seed. Prefer aggregates + a small **redacted** excerpt in the thesis. |
| Hydrated Debnath tweets / user ids / follower graphs | **Not in this repo** — do not add them. IDs-only dumps are still re-identification risk if later hydrated. |
| OSF `dataset.csv` (~662 MB tweet IDs) | Do not mirror; point to the official deposit. |
| Unredacted `campaign_manifest.json` stderr tails | May echo env diagnostics. Run `node thesisExperiment/scripts/redact_manifest.js`. |
| `configs/_probe_api.json` | Ephemeral; not part of the scientific grid. |
| ClimateFEVER full dataset | License **undeclared** on `tdiggelm/climate_fever`; unused in A. If needed, cite HF rather than republishing 1,535 claims. A 40-row derived slice is a grey area — omit from the public zip unless counsel/supervisor agrees. |
| Publisher PDFs behind 403 | Do not ship Cell HTML/PDF; PMC + DOI is enough. |

## Middle ground (supervised / upon request)

- **One** annotated rewrite per condition for the thesis PDF (fair-use quotation, labelled as model output).
- Topology JSON + k\* table without node histories.
- Token **counts** and estimated USD from `metadata.json` `llmUsage` (already aggregate).

## Suggested public bundle layout

```
thesisExperiment/
  README.md
  pfeffer_mapping.md
  configs/          # A_*, B_*, D_echo_mix, grid — no _probe_api, no .env
  personas/
  articles/
  scripts/
  data/SOURCES.md
  data/derived/debnath_bps.md
  data/derived/debnath_paper_slice.json   # optional
  results/summary.json
  results/summary.md
  results/findings.md
  results/*.png
  discovery/10_repro/
```

Omit `data/raw/` HTML snapshots if copyright is unclear; keep URLs in `SOURCES.md`. Omit `runs/` node dumps.

## Checklist before a GitHub/zenodo dump

1. `git status` — `.env` untracked.
2. Grep logs for `sk-` / `OPENAI` / `Bearer` (do not publish hits).
3. Recompute config hashes; paste into `repro.md` if files changed.
4. State **N=1**, `gpt-4o-mini`, temperature 0.7 → **not** bit-identical.
5. Cite Debnath et al. 2023; Diggelmann et al. 2020 if ClimateFEVER appears; Wikipedia CC BY-SA if extracts are included.
6. Contribution split: `individual_contribution.md` so the LASS/CIKM engine is not presented as sole-authored thesis code.

## What “open” still cannot give a re-user

- Twitter text for 814k #geoengineering tweets.
- Deterministic LLM transcripts.
- A license cleaner than “cite the authors” for ClimateFEVER until the original card is updated.
