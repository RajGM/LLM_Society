#!/usr/bin/env node
/**
 * Isolated Phase 2 T2d_H runner (dual IFD, homogeneous, all 8 topologies).
 *   node thesisExperiment/scripts/run_t2d_h.js
 *
 * Polls /workspace/.env and KEY_READY.md if the key is missing
 * (--poll-interval-ms, --poll-max-ms). Probes one dual cell until LLM usage > 0, then runs every
 * T2d_H_*.json into runs_phase2 (concurrency 3, skip completed).
 *
 * Does not write thesisExperiment/runs/ or thesisExperiment/results/tables/.
 * Does not write phase2_manifest.json. No dry-run. No invented MI. Dual =
 * two auditor LLM calls per event (src/Auditor.js).
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { isMockKey } = require("../../src/loadEnv");

const ROOT = path.join(__dirname, "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const CFG_DIR = path.join(EXP, "configs", "phase2");
const RUNS = path.join(EXP, "runs_phase2");
const LOG_MD = path.join(EXP, "LOG.md");
const LOG_DIR = path.join(EXP, "results_phase2", "logs");
const MANIFEST = path.join(EXP, "results_phase2", "manifest_T2d_H.json");
const STATUS = path.join(EXP, "runs_phase2", "_status", "T2d_H.md");
const BLOCKER = path.join(EXP, "runs_phase2", "_blockers", "T2d_H_no_key.md");
const POLL_LOG = path.join(EXP, "runs_phase2", "_status", "T2d_H_poll.json");

const CONCURRENCY = 3;

function parseArgs(argv) {
  const intervalIdx = argv.indexOf("--poll-interval-ms");
  const maxIdx = argv.indexOf("--poll-max-ms");
  return {
    pollIntervalMs: Math.max(1000, Number(intervalIdx !== -1 ? argv[intervalIdx + 1] : 20 * 1000) || 20 * 1000),
    pollMaxMs: Math.max(0, Number(maxIdx !== -1 ? argv[maxIdx + 1] : 8 * 60 * 1000) || 0),
  };
}
const TOPOLOGIES = [
  "echo_chamber",
  "hierarchical",
  "linear_chain",
  "polarized",
  "random_er",
  "ring",
  "scale_free",
  "small_world",
];

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(RUNS, { recursive: true });
fs.mkdirSync(path.dirname(STATUS), { recursive: true });
fs.mkdirSync(path.dirname(BLOCKER), { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });

function nowIso() {
  return new Date().toISOString();
}

function appendLog(text) {
  fs.appendFileSync(LOG_MD, `\n## ${nowIso()}\n\n${text.trim()}\n\n---\n`);
}

function listConfigs() {
  return fs
    .readdirSync(CFG_DIR)
    .filter((f) => f.startsWith("T2d_H_") && f.endsWith(".json"))
    .sort()
    .map((f) => path.posix.join("thesisExperiment/configs/phase2", f));
}

function readCfg(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function latestRunDir(experimentName) {
  if (!fs.existsSync(RUNS)) return null;
  const dirs = fs
    .readdirSync(RUNS)
    .filter((d) => d.startsWith(experimentName + "_"))
    .map((d) => ({ d, t: fs.statSync(path.join(RUNS, d)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return dirs.length ? dirs[0].d : null;
}

function isComplete(experimentName, expectedCfg) {
  const d = latestRunDir(experimentName);
  if (!d) return false;
  const metaPath = path.join(RUNS, d, "metadata.json");
  if (!fs.existsSync(metaPath)) return false;
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    const okStatus = meta.status === "completed" || meta.status === "complete";
    if (!okStatus) return false;
    const got = ((meta.config && meta.config.seedArticles) || []).join("|");
    const want = (expectedCfg.seedArticles || []).join("|");
    if (want && got !== want) return false;
    const mode = meta.config && meta.config.miScoringMode;
    if (mode !== "dual") return false;
    if (expectedCfg.miScoringMode && mode !== expectedCfg.miScoringMode) return false;
    return true;
  } catch {
    return false;
  }
}

function extractUsage(stdout) {
  const m = (stdout || "").match(/LLM usage: ([^\n]+)/);
  return m ? m[1].trim() : null;
}

function parseUsageCalls(usageLine) {
  if (!usageLine) return 0;
  const m = usageLine.match(/(\d+)\s+calls/);
  return m ? Number(m[1]) : 0;
}

function classifyKeyValue(value) {
  if (value == null) return { present: false, length: 0, placeholder: false, ok: false };
  const v = String(value).trim().replace(/^["']|["']$/g, "");
  if (!v) return { present: false, length: 0, placeholder: false, ok: false };
  const placeholder = isMockKey(v);
  return { present: true, length: v.length, placeholder, ok: !placeholder && v.length >= 20 };
}

function readDotEnvKey(envPath) {
  if (!fs.existsSync(envPath)) return { exists: false, key: null };
  const text = fs.readFileSync(envPath, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    if (k !== "OPENAI_API_KEY") continue;
    return { exists: true, key: line.slice(eq + 1).trim().replace(/^["']|["']$/g, "") };
  }
  return { exists: true, key: null };
}

function keyReadyPaths() {
  return [
    path.join(ROOT, "KEY_READY.md"),
    path.join(EXP, "KEY_READY.md"),
    path.join(RUNS, "_status", "KEY_READY.md"),
  ];
}

function checkKey() {
  const envPath = path.join(ROOT, ".env");
  const fromFile = readDotEnvKey(envPath);
  const fromProc = process.env.OPENAI_API_KEY;
  const fileClass = classifyKeyValue(fromFile.key);
  const procClass = classifyKeyValue(fromProc);
  const ready = keyReadyPaths().filter((p) => fs.existsSync(p));
  const chosen = fileClass.ok ? { ...fileClass, source: envPath, value: fromFile.key } : procClass.ok ? { ...procClass, source: "process.env", value: fromProc } : null;
  return {
    ok: Boolean(chosen),
    envFileExists: fromFile.exists,
    envFileHasKey: Boolean(fromFile.key),
    OPENAI_API_KEY_length: chosen ? chosen.length : fileClass.present ? fileClass.length : procClass.present ? procClass.length : 0,
    placeholder: chosen ? false : fileClass.placeholder || procClass.placeholder || null,
    source: chosen ? chosen.source : fromFile.exists ? envPath : fromProc ? "process.env" : null,
    KEY_READY_md: ready,
    value: chosen ? chosen.value : null,
  };
}

function applyKeyToEnv(check) {
  if (check.ok && check.value && !process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = check.value;
  }
}

function emptyCounts() {
  return {
    configs: 0,
    completed: 0,
    failed: 0,
    skipped: 0,
    pending: 0,
    not_started: 0,
    llmCalls: 0,
    estUsd: 0,
  };
}

function tally(campaign) {
  const configs = campaign.configRels || [];
  const byName = new Map();
  for (const r of campaign.runs || []) {
    byName.set(r.experimentName, r);
  }
  let completed = 0;
  let failed = 0;
  let skipped = 0;
  let pending = 0;
  let llmCalls = 0;
  let estUsd = 0;
  for (const rel of configs) {
    const cfg = readCfg(rel);
    const row = byName.get(cfg.experimentName);
    if (!row) {
      if (isComplete(cfg.experimentName, cfg)) {
        skipped += 1;
        completed += 1;
      } else pending += 1;
      continue;
    }
    if (row.skipped) {
      skipped += 1;
      completed += 1;
    } else if (row.status === 0 && row.done) {
      completed += 1;
    } else {
      failed += 1;
    }
    const calls = parseUsageCalls(row.usageLine);
    llmCalls += calls;
    const usd = (row.usageLine || "").match(/~\$([0-9.]+)/);
    if (usd) estUsd += Number(usd[1]);
  }
  if (campaign.probe && campaign.probe.usageLine) {
    llmCalls += parseUsageCalls(campaign.probe.usageLine);
    const usd = campaign.probe.usageLine.match(/~\$([0-9.]+)/);
    if (usd) estUsd += Number(usd[1]);
  }
  return {
    configs: configs.length,
    completed,
    failed,
    skipped,
    pending,
    not_started: pending,
    llmCalls,
    estUsd: Math.round(estUsd * 10000) / 10000,
  };
}

function topologyBreakdown(campaign) {
  const out = {};
  for (const t of TOPOLOGIES) out[t] = { configs: 0, completed: 0, failed: 0, skipped: 0, pending: 0 };
  const byName = new Map();
  for (const r of campaign.runs || []) byName.set(r.experimentName, r);
  for (const rel of campaign.configRels || []) {
    const cfg = readCfg(rel);
    const t = cfg.topology;
    if (!out[t]) out[t] = { configs: 0, completed: 0, failed: 0, skipped: 0, pending: 0 };
    out[t].configs += 1;
    const row = byName.get(cfg.experimentName);
    const done = row
      ? row.skipped || (row.status === 0 && row.done)
      : isComplete(cfg.experimentName, cfg);
    const fail = row && !row.skipped && !(row.status === 0 && row.done);
    if (row && row.skipped) out[t].skipped += 1;
    if (done) out[t].completed += 1;
    else if (fail) out[t].failed += 1;
    else out[t].pending += 1;
  }
  return out;
}

function writeManifest(campaign) {
  const copy = { ...campaign };
  delete copy._keyValue;
  const counts = tally(campaign);
  copy.counts = counts;
  copy.byTopology = topologyBreakdown(campaign);
  copy.updatedAt = nowIso();
  fs.writeFileSync(MANIFEST, JSON.stringify(copy, null, 2));
}

function writeStatus(campaign, extra = "") {
  const counts = tally(campaign);
  const byT = topologyBreakdown(campaign);
  const keyLine = campaign.keyCheck
    ? campaign.keyCheck.ok
      ? "yes"
      : "no"
    : "unknown";
  const lines = [
    `# T2d_H status (dual homogeneous, all 8 topologies)`,
    ``,
    `**Updated:** ${nowIso()}`,
    `**OPENAI_API_KEY present:** ${keyLine} (length=${campaign.keyCheck ? campaign.keyCheck.OPENAI_API_KEY_length : 0}; value not logged)`,
    `**Dry-run:** no`,
    `**MI/MPR invented:** no`,
    `**Dual:** 2 auditor LLM calls per event (\`src/Auditor.js\` \`miScoringMode: dual\`)`,
    `**Concurrency:** ${CONCURRENCY}`,
    `**Isolation:** \`thesisExperiment/runs_phase2\` only (not Phase 1 \`runs/\` or \`results/tables/\`)`,
    ``,
    extra ? extra.trim() + "\n" : "",
    `## Counts (configs; each seeds 6 core articles)`,
    ``,
    `| Count | n |`,
    `| --- | ---: |`,
    `| configs | ${counts.configs} |`,
    `| completed | ${counts.completed} |`,
    `| failed | ${counts.failed} |`,
    `| skipped (already complete dual) | ${counts.skipped} |`,
    `| pending / not_started | ${counts.pending} |`,
    `| LLM calls (this slice + probe) | ${counts.llmCalls} |`,
    `| Est. USD | $${counts.estUsd} |`,
    ``,
    `## By topology`,
    ``,
    `| topology | configs | completed | failed | skipped | pending |`,
    `| --- | ---: | ---: | ---: | ---: | ---: |`,
  ];
  for (const t of TOPOLOGIES) {
    const r = byT[t] || { configs: 0, completed: 0, failed: 0, skipped: 0, pending: 0 };
    lines.push(`| ${t} | ${r.configs} | ${r.completed} | ${r.failed} | ${r.skipped} | ${r.pending} |`);
  }
  if (campaign.probe) {
    lines.push(``);
    lines.push(`## Probe (dual)`);
    lines.push(``);
    lines.push(`- experiment: \`${campaign.probe.experimentName || "probe_p2_dual"}\``);
    lines.push(`- status: ${campaign.probe.status}`);
    lines.push(`- failed: ${campaign.probe.failed}`);
    lines.push(`- usage: ${campaign.probe.usageLine || "n/a"}`);
    lines.push(`- usageCalls: ${campaign.probe.usageCalls ?? "n/a"}`);
  }
  if (campaign.aborted) {
    lines.push(``);
    lines.push(`## Abort`);
    lines.push(``);
    lines.push(`\`${campaign.aborted}\``);
    if (campaign.abortReason) lines.push(campaign.abortReason);
  }
  lines.push(``);
  lines.push(`## Isolation`);
  lines.push(``);
  lines.push(`Did not write \`thesisExperiment/runs/\` or \`thesisExperiment/results/tables/\`. Manifest: \`thesisExperiment/results_phase2/manifest_T2d_H.json\`. Did not run \`T2c_\` or \`He_\` configs. Did not git commit.`);
  lines.push(``);
  fs.writeFileSync(STATUS, lines.join("\n"));
}

function writeBlocker(campaign, polls) {
  const counts = tally(campaign);
  const body = `# Blocker: T2d_H dual homogeneous — OPENAI_API_KEY missing

**Time:** ${nowIso()}
**Slice:** \`T2d_H\` (dual IFD, homogeneous persona×article, 8 topologies)
**Configs:** ${counts.configs} (\`thesisExperiment/configs/phase2/T2d_H_*.json\`)
**LLM runs:** STOPPED after polling. No cells launched. Did not dry-run. Did not invent MI/MPR.

## Key poll (no values logged)

Polled \`/workspace/.env\` and \`KEY_READY.md\` every ${Math.round((campaign.pollIntervalMs || 30000) / 1000)}s for up to ~${Math.round((campaign.pollMaxMs || 0) / 60000)} minutes (${polls.length} checks). Still missing or placeholder.

| Source | Result |
| --- | --- |
| Process env \`OPENAI_API_KEY\` | unset or unusable (length=${campaign.keyCheck ? campaign.keyCheck.OPENAI_API_KEY_length : 0}) |
| \`/workspace/.env\` | ${campaign.keyCheck && campaign.keyCheck.envFileExists ? "exists but no usable key" : "does not exist"} |
| \`KEY_READY.md\` | ${(campaign.keyCheck && campaign.keyCheck.KEY_READY_md && campaign.keyCheck.KEY_READY_md.length) ? campaign.keyCheck.KEY_READY_md.join(", ") : "not found"} |
| Placeholder | ${campaign.keyCheck ? String(campaign.keyCheck.placeholder) : "n/a"} |

Did **not** invent a key. Did **not** write \`.env\`.

## Counts

| Count | n |
| --- | ---: |
| configs | ${counts.configs} |
| completed | ${counts.completed} |
| failed | ${counts.failed} |
| skipped | ${counts.skipped} |
| pending | ${counts.pending} |
| LLM calls | 0 |
| Est. USD | $0 |

## Isolation

Did not write to \`thesisExperiment/runs/\` or \`thesisExperiment/results/tables/\`. Manifest remains \`thesisExperiment/results_phase2/manifest_T2d_H.json\`.

## Resume

1. Place a non-placeholder \`OPENAI_API_KEY\` in gitignored \`/workspace/.env\` (optional \`KEY_READY.md\` signal, no secret body).
2. Probe one dual cell until LLM usage > 0.
3. Run all \`T2d_H_*.json\` into \`thesisExperiment/runs_phase2\`, concurrency 3, skip completed dual runs.
`;
  fs.writeFileSync(BLOCKER, body);
}

function writeProbeConfig() {
  const probeConfig = {
    experimentName: "probe_p2_dual",
    personasPath: "thesisExperiment/personas/phase2/homo/conspiracy_believer.json",
    articlesPath: "thesisExperiment/articles/merged.json",
    outputRoot: "thesisExperiment/runs_phase2",
    topology: "linear_chain",
    topologyParams: { numNodes: 2 },
    maxTicks: 1,
    defaultModel: "gpt-4o-mini",
    auditorModel: "gpt-4o-mini",
    miScoringMode: "dual",
    seedArticles: ["scopex_2017"],
    seedNodes: ["node_0"],
    graphRandomSeed: 42,
    nodeParams: {
      maxHops: 1,
      maxInboxSize: 4,
      actionWeights: { forward: 0.2, reinterpret: 0.8, drop: 0.0 },
    },
  };
  const tmp = path.join(CFG_DIR, "_probe_p2_dual.json");
  fs.writeFileSync(tmp, JSON.stringify(probeConfig, null, 2));
  return path.relative(ROOT, tmp).replace(/\\/g, "/");
}

function probeFailedFrom(result) {
  const blob = `${result.stderr || ""}\n${result.stdout || ""}`;
  if (result.status !== 0 || result.signal != null) return true;
  const openaiAuthFail =
    /OPENAI_API_KEY looks like a placeholder|Env var OPENAI_API_KEY not set|HTTP 401:|HTTP 403:|not set/i.test(blob);
  const done = /\[Simulation\] Done/.test(blob);
  const calls = parseUsageCalls(extractUsage(result.stdout));
  return openaiAuthFail || !done || calls <= 0;
}

function runCli(configRel, logName, { stallMs, hardMs }) {
  const args = ["index.js", "--config", configRel];
  console.log(`\n$ node ${args.join(" ")}`);
  const logPath = path.join(LOG_DIR, `${logName || "run"}.log`);
  const log = fs.createWriteStream(logPath, { flags: "a" });
  log.write(`\n=== ${nowIso()}  node ${args.join(" ")}\n`);

  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    let lastActivity = Date.now();
    let killedFor = null;

    const onChunk = (buf, isErr) => {
      const s = buf.toString("utf8");
      lastActivity = Date.now();
      if (isErr) {
        stderr += s;
        process.stderr.write(s);
      } else {
        stdout += s;
        process.stdout.write(s);
      }
      log.write(s);
    };
    child.stdout.on("data", (b) => onChunk(b, false));
    child.stderr.on("data", (b) => onChunk(b, true));

    const stallTimer = setInterval(() => {
      if (Date.now() - lastActivity > stallMs) {
        killedFor = `stall>${stallMs}ms`;
        child.kill("SIGTERM");
        setTimeout(() => {
          try {
            child.kill("SIGKILL");
          } catch {
            /* ignore */
          }
        }, 5000);
      }
    }, 15000);

    const hardTimer = setTimeout(() => {
      killedFor = `hard-timeout>${hardMs}ms`;
      child.kill("SIGTERM");
      setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch {
          /* ignore */
        }
      }, 5000);
    }, hardMs);

    const finish = (status, signal, error) => {
      clearInterval(stallTimer);
      clearTimeout(hardTimer);
      log.end();
      resolve({
        args,
        status,
        signal,
        error,
        killedFor,
        stdout,
        stderr,
        elapsedMs: Date.now() - started,
        logPath: path.relative(ROOT, logPath),
      });
    };

    child.on("close", (status, signal) => finish(status, signal, null));
    child.on("error", (err) => finish(1, null, err.message));
  });
}

async function runOne(rel, timeouts) {
  const cfg = readCfg(rel);
  const result = await runCli(rel, cfg.experimentName, timeouts);
  return {
    config: rel,
    experimentName: cfg.experimentName,
    topology: cfg.topology,
    status: result.status,
    signal: result.signal,
    killedFor: result.killedFor,
    elapsedMs: result.elapsedMs,
    runDir: latestRunDir(cfg.experimentName),
    error: result.error,
    usageLine: extractUsage(result.stdout),
    logPath: result.logPath,
    done: /\[Simulation\] Done/.test(result.stdout || ""),
    miScoringMode: cfg.miScoringMode,
    skipped: false,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function pollForKey(campaign, { pollIntervalMs, pollMaxMs }) {
  const polls = [];
  const started = Date.now();
  let attempt = 0;
  const intervalSec = Math.round(pollIntervalMs / 1000);
  const maxMin = Math.round(pollMaxMs / 60000);
  while (true) {
    attempt += 1;
    const check = checkKey();
    const row = {
      attempt,
      at: nowIso(),
      elapsedMs: Date.now() - started,
      envFileExists: check.envFileExists,
      KEY_READY_md: check.KEY_READY_md,
      ok: check.ok,
      length: check.OPENAI_API_KEY_length,
      placeholder: check.placeholder,
    };
    polls.push(row);
    fs.writeFileSync(
      POLL_LOG,
      JSON.stringify({ round: campaign.pollRound || 1, pollIntervalMs, pollMaxMs, polls }, null, 2)
    );
    campaign.keyCheck = {
      envFile: "/workspace/.env",
      envFileExists: check.envFileExists,
      OPENAI_API_KEY_length: check.OPENAI_API_KEY_length,
      placeholder: check.placeholder,
      ok: check.ok,
      source: check.source,
      KEY_READY_md: check.KEY_READY_md.length > 0,
      KEY_READY_paths: check.KEY_READY_md,
      recheckAt: nowIso(),
      pollAttempt: attempt,
      pollIntervalMs,
      pollMaxMs,
    };
    writeManifest(campaign);
    writeStatus(
      campaign,
      `**Phase:** polling for key (attempt ${attempt}; every ${intervalSec}s, max ~${maxMin} min).\n\nDid not invent a key. Did not write \`.env\`.`
    );
    console.log(
      `[T2d_H] key poll ${attempt} ok=${check.ok} envFile=${check.envFileExists} length=${check.OPENAI_API_KEY_length} readyMd=${check.KEY_READY_md.length}`
    );
    if (check.ok) {
      applyKeyToEnv(check);
      return { ok: true, check, polls };
    }
    if (Date.now() - started >= pollMaxMs) {
      return { ok: false, check, polls };
    }
    await sleep(pollIntervalMs);
  }
}

async function runPool(campaign, timeouts) {
  const queue = [...campaign.configRels];
  const workers = [];
  const runNext = async () => {
    while (queue.length) {
      const rel = queue.shift();
      const cfg = readCfg(rel);
      if (isComplete(cfg.experimentName, cfg)) {
        const skip = {
          config: rel,
          experimentName: cfg.experimentName,
          topology: cfg.topology,
          status: 0,
          skipped: true,
          done: true,
          runDir: latestRunDir(cfg.experimentName),
          miScoringMode: "dual",
        };
        campaign.runs.push(skip);
        writeManifest(campaign);
        writeStatus(campaign, `**Phase:** grid (skip complete ${cfg.experimentName}).`);
        appendLog(`SKIP complete ${cfg.experimentName} (${skip.runDir})`);
        continue;
      }
      appendLog(`START ${cfg.experimentName} config=${rel}`);
      writeStatus(campaign, `**Phase:** grid START ${cfg.experimentName} (queue left ${queue.length}).`);
      const row = await runOne(rel, timeouts);
      campaign.runs.push(row);
      writeManifest(campaign);
      writeStatus(campaign, `**Phase:** grid END ${row.experimentName} status=${row.status} done=${row.done}.`);
      appendLog(
        `END ${row.experimentName} status=${row.status} elapsedMs=${row.elapsedMs} runDir=${row.runDir} usage=${row.usageLine || "n/a"} killedFor=${row.killedFor || "none"} done=${row.done}`
      );
    }
  };
  for (let i = 0; i < CONCURRENCY; i++) workers.push(runNext());
  await Promise.all(workers);
}

function validateConfigs(rels) {
  const problems = [];
  const seenTopo = new Set();
  for (const rel of rels) {
    const cfg = readCfg(rel);
    if (cfg.miScoringMode !== "dual") problems.push(`${rel} miScoringMode=${cfg.miScoringMode}`);
    if (cfg.outputRoot !== "thesisExperiment/runs_phase2") problems.push(`${rel} outputRoot=${cfg.outputRoot}`);
    if (!String(cfg.experimentName || "").startsWith("T2d_H_")) problems.push(`${rel} experimentName=${cfg.experimentName}`);
    seenTopo.add(cfg.topology);
  }
  return { problems, topologies: [...seenTopo].sort() };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rels = listConfigs();
  const { problems, topologies } = validateConfigs(rels);
  if (problems.length) {
    console.error("T2d_H config validation failed:\n" + problems.join("\n"));
    process.exit(2);
  }
  if (rels.length !== 96) {
    console.error(`Expected 96 T2d_H configs, found ${rels.length}`);
    process.exit(2);
  }

  const campaign = {
    slice: "T2d_H",
    startedAt: nowIso(),
    mode: "real",
    model: "gpt-4o-mini",
    concurrency: CONCURRENCY,
    outputRoot: "thesisExperiment/runs_phase2",
    dualAuditorCallsPerEvent: 2,
    pollRound: 2,
    pollIntervalMs: args.pollIntervalMs,
    pollMaxMs: args.pollMaxMs,
    configRels: rels,
    topologies,
    keyCheck: null,
    probe: null,
    aborted: null,
    isolation: {
      didNotWrite: ["thesisExperiment/runs", "thesisExperiment/results/tables"],
      didNotRunPrefixes: ["T2c_", "T2d_He_", "T2c_He_"],
      manifestOnly: "thesisExperiment/results_phase2/manifest_T2d_H.json",
    },
    runs: [],
    pending: rels.map((rel) => {
      const cfg = readCfg(rel);
      return {
        config: rel,
        experimentName: cfg.experimentName,
        miScoringMode: cfg.miScoringMode,
        topology: cfg.topology,
        status: "pending",
        skipped: false,
      };
    }),
  };

  writeManifest(campaign);
  writeStatus(campaign, "**Phase:** start. Validated 96 dual homogeneous configs across 8 topologies.");
  appendLog(`T2d_H slice start n=${rels.length} topologies=${topologies.join(",")} concurrency=${CONCURRENCY}`);

  const polled = await pollForKey(campaign, args);
  if (!polled.ok) {
    campaign.aborted = "real_api_unavailable";
    campaign.abortReason = `OPENAI_API_KEY missing/placeholder after ~${Math.round(args.pollMaxMs / 60000)} min poll of /workspace/.env and KEY_READY.md (interval ${Math.round(args.pollIntervalMs / 1000)}s). Refusing to invent MI/MPR.`;
    campaign.finishedAt = nowIso();
    writeManifest(campaign);
    writeBlocker(campaign, polled.polls);
    writeStatus(
      campaign,
      `**Phase:** ABORT. Key still missing after ~${Math.round(args.pollMaxMs / 60000)} min poll. Probe and grid not started. Follow-up exit once.`
    );
    appendLog(
      `T2d_H ABORT real_api_unavailable after ${polled.polls.length} polls (~${Math.round(args.pollMaxMs / 60000)} min, every ${Math.round(args.pollIntervalMs / 1000)}s). completed=0 failed=0 skipped=0 pending=96. Did not dry-run. Did not invent MI.`
    );
    console.error("[T2d_H] key missing after poll; exiting without dry-run.");
    process.exit(2);
  }

  if (fs.existsSync(BLOCKER)) {
    fs.unlinkSync(BLOCKER);
  }

  writeStatus(campaign, "**Phase:** key present. Starting dual probe until usage>0.");
  appendLog(`T2d_H key present (length=${campaign.keyCheck.OPENAI_API_KEY_length}, source=${campaign.keyCheck.source}). Probe dual.`);

  const probeRel = writeProbeConfig();
  let probeResult = null;
  let probeFailed = true;
  for (let i = 1; i <= 3 && probeFailed; i++) {
    console.log(`=== T2d_H dual probe attempt ${i} ===`);
    probeResult = await runCli(probeRel, "probe_p2_dual", {
      stallMs: 10 * 60 * 1000,
      hardMs: 4 * 60 * 1000,
    });
    probeFailed = probeFailedFrom(probeResult);
    const usageLine = extractUsage(probeResult.stdout);
    campaign.probe = {
      attempt: i,
      experimentName: "probe_p2_dual",
      status: probeResult.status,
      elapsedMs: probeResult.elapsedMs,
      failed: probeFailed,
      usageLine,
      usageCalls: parseUsageCalls(usageLine),
      at: nowIso(),
    };
    writeManifest(campaign);
    writeStatus(campaign, `**Phase:** dual probe attempt ${i} failed=${probeFailed} usage=${usageLine || "n/a"}.`);
    appendLog(
      `PROBE_T2d_H dual attempt=${i} status=${probeResult.status} failed=${probeFailed} elapsedMs=${probeResult.elapsedMs} usage=${usageLine || "n/a"}`
    );
    if (probeFailed) await sleep(5000);
  }

  if (probeFailed || !campaign.probe || campaign.probe.usageCalls <= 0) {
    campaign.aborted = "probe_usage_zero_or_failed";
    campaign.abortReason = "Dual probe did not produce LLM usage > 0. Refusing to invent MI/MPR or dry-run the 96-cell grid.";
    campaign.finishedAt = nowIso();
    writeManifest(campaign);
    writeStatus(campaign, "**Phase:** ABORT. Dual probe failed or usage=0. Grid not started.");
    appendLog("T2d_H ABORT probe_failed — refusing to invent Phase 2 MI/MPR.");
    process.exit(2);
  }

  appendLog(`PHASE_T2d_H n=${rels.length} concurrency=${CONCURRENCY}`);
  writeStatus(campaign, "**Phase:** grid. Dual probe usage>0. Running all T2d_H_*.json, skip completed, concurrency 3. Do not stop after one.");
  const timeouts = { stallMs: 25 * 60 * 1000, hardMs: 70 * 60 * 1000 };
  await runPool(campaign, timeouts);

  campaign.finishedAt = nowIso();
  campaign.pending = (campaign.configRels || []).filter((rel) => {
    const cfg = readCfg(rel);
    return !isComplete(cfg.experimentName, cfg);
  });
  writeManifest(campaign);
  const counts = tally(campaign);
  writeStatus(campaign, `**Phase:** finished. completed=${counts.completed} failed=${counts.failed} skipped=${counts.skipped} pending=${counts.pending}.`);
  appendLog(
    `T2d_H finished completed=${counts.completed} failed=${counts.failed} skipped=${counts.skipped} pending=${counts.pending} llmCalls=${counts.llmCalls} estUsd=${counts.estUsd}`
  );
  process.exit(counts.failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  appendLog(`FATAL_T2d_H ${err.message}`);
  process.exit(1);
});
