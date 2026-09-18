# Environment (no new global installs)

Recorded on the inspection machine: **Windows 10 (win32 x64)**, PowerShell, 18 September 2026. Commands were run from repo root `F:\SocietySimulation_MasterThesis`. **Do not** `npm install` anything (the engine has zero Node package dependencies). **Do not** `pip install` into the global Python; use the existing `.venv` if plotting.

## Node.js

| Item | Value |
|---|---|
| `node -v` | **v26.4.0** |
| `npm -v` | 11.17.0 (not required for the campaign) |
| Repo documented minimum | Node.js **18+** (`README.md` badge) |
| Entry | `node index.js` / `node thesisExperiment/scripts/*.js` |
| npm packages | **none** (`package.json` has no `dependencies`) |

`.nvmrc` / `.python-version` files were **not** present in the repo.

## Python (plots only)

| Item | Value |
|---|---|
| System `python --version` | Python **3.13.5** |
| Project venv | **yes** — `.venv\` (gitignored) |
| Venv interpreter | `.\.venv\Scripts\python.exe` → Python **3.13.5** |
| Repo documented minimum | Python **3.8+** for visualization |
| Plot script | `thesisExperiment/scripts/plot_results.py` |
| Observed venv packages | matplotlib **3.11.2**, numpy **2.5.3** |
| Declared viz pins | `requirements_viz.txt`: matplotlib≥3.7, networkx≥3.1, seaborn≥0.12, numpy≥1.24 |

Plot the existing summary **without installing**:

```powershell
.\.venv\Scripts\python.exe thesisExperiment/scripts/plot_results.py
```

If this venv is missing on another machine, create a **local** venv (not a global install):

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements_viz.txt
```

`networkx` / `seaborn` are listed for the main `visualize.py` dashboard, not imported by `plot_results.py` (that script uses matplotlib + numpy only).

## API keys (names only)

`.env` exists locally and is gitignored. Keys present (values **not** recorded here):

- `OPENAI_API_KEY` — required for `--real` / `--probe-only`
- `ANTHROPIC_API_KEY` — unused by this campaign; may be a placeholder

`src/loadEnv.js` prints a short prefix of non-placeholder values to stdout. Treat run logs as potentially sensitive (`results/logs/`). `redact_manifest.js` only redacts tails already copied into `campaign_manifest.json`.

## OS / shell for the published CLI snippets

Thesis README commands are **PowerShell**. Unix equivalents: same `node …` lines; Python is `.venv/bin/python thesisExperiment/scripts/plot_results.py`.

## What this environment does **not** include

- Twitter / X API (Debnath tweet IDs were not hydrated).
- ADS token (AGU abstract fetch 401; text saved separately).
- Global pip or npm installs performed for this discovery pass.
