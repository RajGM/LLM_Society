# T2c_H ABORT — OPENAI_API_KEY missing (second hunt)

**When.** 2026-09-18T16:42:02Z (hunt-1) + 20s recheck (hunt-2 below)  
**Slice.** Phase 2 CONTINUOUS homogeneous (`T2c_H_*` only). 8 topologies × 12 personas = **96 configs** × 6 articles.  
**Key found.** **no** (length=0). Did not invent a key. Did not write `/workspace/.env`. Did not dry-run. Did not invent MI/MPR.

## Hunt-1 paths (no values logged)

### Files that do not exist

| Path | Exists |
|---|---|
| `/workspace/.env` | **no** |
| `/workspace/.env.local` | no |
| `/workspace/.env.production` | no |
| `/workspace/.env.development` | no |
| `/workspace/thesisExperiment/.env` | **no** |
| `/workspace/thesisExperiment/.env.local` | no |
| `/workspace/config/.env` | no |
| `/workspace/src/.env` | no |
| `/home/ubuntu/.env` (`~/.env`) | **no** |
| `/home/ubuntu/.env.local` | no |
| `/root/.env` | no |
| `/tmp/.env` | no |
| `/tmp/cursor/.env` | no |
| `/opt/.env` | no |
| `/exec-daemon/.env` | no |
| `/workspace/.cursor/environment.json` | no |
| `/workspace/.cursor/environment.json.local` | no |
| `/home/ubuntu/.cursor/environment.json` | no |
| `/home/ubuntu/.config/cursor/environment.json` | no |
| `/home/ubuntu/.config/openai` | no |
| `/home/ubuntu/.openai` | no |
| `/home/ubuntu/.bash_profile` | no |
| `/home/ubuntu/.zshrc` | no |
| `/run/secrets/openai` | no |
| `/run/secrets/OPENAI_API_KEY` | no |
| `/var/run/secrets` | no |
| `/var/run/secrets/OPENAI_API_KEY` | no |
| `/etc/secrets` | no |
| `/etc/secrets/OPENAI_API_KEY` | no |
| `/secrets` | no |
| `/secrets/OPENAI_API_KEY` | no |
| `/workspace/.env` mtime in last few minutes | n/a (file absent) |

`find` over `/workspace`, `/home/ubuntu`, `/tmp`, `/opt`, `/usr/local` (maxdepth 6) for `.env`, `.env.*`, `*openai*key*`, `secrets.json`, `credentials.json`: **no matches**.

Git history / stash: no `.env` ever committed; `stash@{0}` is PHASE2_PLAN.md only.

### Files that exist but contain no OPENAI_API_KEY assignment

| Path | Note |
|---|---|
| `/etc/environment` | exists; no OPENAI/API_KEY assignment |
| `/etc/profile` | no key assignment |
| `/etc/bash.bashrc` | no key assignment |
| `/home/ubuntu/.bashrc` | no key assignment |
| `/home/ubuntu/.profile` | no key assignment |
| `/root/.bashrc` | no key assignment |
| `/home/ubuntu/.config/gh/hosts.yml` | GitHub oauth fields only; **not** an OpenAI key; unused |
| `/home/ubuntu/.cursor/projects/workspace/agent-tools/*.txt` | 4 files; no OPENAI / `sk-proj` |
| `/home/ubuntu/.cursor/projects/workspace/terminals/` | empty |
| `/tmp/cursor/cloud-agent-transcripts/**` | environment-info / events / setup-logs; no secret injected |
| `/workspace/thesisExperiment/runs_phase2/_status/*` | sibling aborts; key missing |
| `/workspace/thesisExperiment/runs_phase2/_blockers/*_no_key.md` | sibling topology blockers |
| `/workspace/thesisExperiment/results/logs/probe_api.log` | Phase 1 Windows run logged a **truncated** `OPENAI_API_KEY` prefix via `loadEnv.js` (not a recoverable full key). Anthropic value is an explicit mock placeholder. |

### Process / container / cloud

| Check | Result |
|---|---|
| `process.env.OPENAI_API_KEY` | unset, **length=0** |
| Process env names containing OPENAI / API_KEY / ANTHROPIC / SECRET / TOKEN | **none** |
| `/proc/self/environ` | 36 vars; no keyish names |
| `/proc/1/environ` | exists; **PermissionError** on read |
| Docker | `docker` not installed; no `/run/secrets` |
| Kubernetes service-account secrets | `/var/run/secrets/kubernetes.io` absent |
| Cursor cloud `environment-info` | personal env; `environmentJson` not exposed; **no injected OpenAI secret** |
| Cursor cloud `run-info` | this run `bc-ae018774-7b0f-5b07-aff9-266cc91ecde4` |
| Sibling agent `Hunt OPENAI_API_KEY everywhere` | running (`bc-aff97a98-…`); did not write `/workspace/.env` as of hunt-1 |
| Sibling agent `IFD probe then parse` | running (`bc-30de2f48-…`); `.env` still absent as of hunt-1 |
| `gh secret list` | failed (no repo secret values available) |
| `src/loadEnv.js` `isMockKey` | not applied (no value) |

Did **not** treat truncated log prefixes as a key. Did **not** copy GitHub oauth tokens into `OPENAI_API_KEY`.

## Grid that did not run

96 `thesisExperiment/configs/phase2/T2c_H_*.json` (all 8 topologies × 12 personas). Each: `miScoringMode: continuous`, `outputRoot: thesisExperiment/runs_phase2`, 6 core articles, 8 nodes / 8 ticks, `gpt-4o-mini`. Unique `experimentName`s.

| Count | n |
|---|---:|
| configs | 96 |
| completed | 0 |
| failed | 0 |
| skipped (already complete) | 0 |
| not_started | 96 |
| LLM calls | 0 |
| Est. USD | 0 |

Probe (2-node continuous cell): **not started** (would fail `Env var OPENAI_API_KEY not set`; real usage would not be > 0).

## Isolation

Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`. Did not write `phase2_manifest.json`. Did not dry-run.

## Resume

Place a non-placeholder `OPENAI_API_KEY` in gitignored `/workspace/.env` (mode 600). Then: probe one 2-node continuous cell until LLM usage > 0; run all 96 `T2c_H_*.json` concurrency 3 into `runs_phase2`; skip completed (`metadata.status` completed + `miScoringMode` continuous); refresh `results_phase2/manifest_T2c_H.json`.

## Hunt-2 (after 20s)

**When.** 2026-09-18T16:42:45Z  
**Key found.** **no**

| Check | Result |
|---|---|
| `/workspace/.env` | still **missing** (probe agent did not create it) |
| `/workspace/thesisExperiment/.env` | missing |
| `/home/ubuntu/.env` | missing |
| `/root/.env` | missing |
| `/tmp/cursor/.env` | missing |
| `find /workspace` `.env*` | **none** |
| `process.env.OPENAI_API_KEY` | unset, length=0 |
| process env keyish names | none |

**Exit counts.** completed=**0** / 96 configs. failed=0. skipped=0. LLM calls=0. Est. USD=$0. No fabrication.
