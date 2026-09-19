#!/usr/bin/env node
/**
 * Locate a real OPENAI_API_KEY without printing it.
 * Optionally write gitignored /workspace/.env (mode 600) and KEY_READY.md.
 *
 *   node thesisExperiment/scripts/check_openai_key.js
 *   node thesisExperiment/scripts/check_openai_key.js --write-env
 */
const fs = require("fs");
const path = require("path");
const { isMockKey } = require("../../src/loadEnv");

const ROOT = path.join(__dirname, "..", "..");
const WORKSPACE_ENV = path.join(ROOT, ".env");
const THESIS_ENV = path.join(ROOT, "thesisExperiment", ".env");
const KEY_READY = path.join(ROOT, "thesisExperiment", "runs_phase2", "_status", "KEY_READY.md");

function readEnvFile(p) {
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const raw of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key) out[key] = value;
  }
  return out;
}

function inspectValue(source, value) {
  if (value == null || value === "") {
    return { source, present: false, length: 0, ok: false, reason: "missing" };
  }
  const length = String(value).length;
  if (isMockKey(value)) {
    return { source, present: true, length, ok: false, reason: "placeholder" };
  }
  if (length <= 20) {
    return { source, present: true, length, ok: false, reason: "too_short" };
  }
  return { source, present: true, length, ok: true, reason: "ok", value };
}

function findKey() {
  const candidates = [
    inspectValue("process.env", process.env.OPENAI_API_KEY),
    inspectValue("/workspace/.env", readEnvFile(WORKSPACE_ENV).OPENAI_API_KEY),
    inspectValue("thesisExperiment/.env", readEnvFile(THESIS_ENV).OPENAI_API_KEY),
  ];
  const ok = candidates.find((c) => c.ok);
  return { ok: ok || null, candidates: candidates.map(({ value, ...rest }) => rest) };
}

function writeWorkspaceEnv(value) {
  const body = `OPENAI_API_KEY=${value}\n`;
  fs.writeFileSync(WORKSPACE_ENV, body, { mode: 0o600 });
  fs.chmodSync(WORKSPACE_ENV, 0o600);
}

function writeKeyReady(length) {
  fs.mkdirSync(path.dirname(KEY_READY), { recursive: true });
  fs.writeFileSync(KEY_READY, `OPENAI_API_KEY loaded, length=${length}\n`);
}

function main() {
  const writeEnv = process.argv.includes("--write-env");
  const { ok, candidates } = findKey();
  if (!ok) {
    const summary = {
      found: false,
      length: 0,
      candidates,
    };
    console.log(JSON.stringify(summary));
    process.exit(2);
  }
  if (writeEnv && !fs.existsSync(WORKSPACE_ENV)) {
    writeWorkspaceEnv(ok.value);
  }
  writeKeyReady(ok.length);
  console.log(
    JSON.stringify({
      found: true,
      length: ok.length,
      source: ok.source,
      envWritten: writeEnv && fs.existsSync(WORKSPACE_ENV),
      keyReady: KEY_READY,
    })
  );
}

module.exports = { findKey, writeWorkspaceEnv, writeKeyReady };

if (require.main === module) {
  main();
}
