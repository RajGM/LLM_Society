# Blocker: OPENAI_API_KEY missing

**Time:** 2026-09-18T18:36:49.350Z
**Polls:** 32

Phase 2 LLM grid cannot run without a real key (length > 20, not a placeholder).
Did **not** invent a key. Did **not** dry-run. Did **not** invent MI/MPR.

Requested via `cursor-cloud-request-environment-setup-actions` (`add_secrets` / `OPENAI_API_KEY`).

## Exact user action

1. Copy `OPENAI_API_KEY` into gitignored `/workspace/.env` (mode 600).
2. Or add it to the Cloud Agent environment secrets.

The orchestrator keeps polling. The moment `.env` appears it will write `KEY_READY.md` (length only) and launch probes + the 288-config grid + 4 Dnet cells.

**Master polls so far:** 31+ at 30s (~15 min). Slice workers also polled; still length=0.
