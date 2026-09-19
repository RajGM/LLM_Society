#!/usr/bin/env node
/**
 * Isolated Phase 2 T2d_He runner (dual IFD, heterogeneous, all 8 topologies).
 *   node thesisExperiment/scripts/run_t2d_he.js
 *
 * Polls /workspace/.env and KEY_READY.md every 2s up to 90s if the key is missing.
 * Loads dotenv without printing the key. Probes one dual cell until LLM usage > 0
 * (dual = 2 auditor calls per event). Then runs every T2d_He_*.json into
 * runs_phase2 (concurrency 4, skip completed, do not stop after one topology).
 *
 * Does not write thesisExperiment/runs/ or thesisExperiment/results/tables/.
 * Does not write phase2_manifest.json. No dry-run. No invented MI. No git commit.
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
const MANIFEST = path.join(EXP, "results_phase2", "manifest_T2d_He.json");
const STATUS = path.join(EXP, "runs_phase2", "_status", "T2d_He.md");
const BLOCKER = path.join(EXP, "runs_phase2", "_blockers", "T2d_He_no_key.md");
const POLL_LOG = path.join(EXP, "runs_phase2", "_status", "T2d_He_poll.json");

const POLL_INTERVAL_MS = Number(process.env.T2D_HE_POLL_MS) > 0 ? Number(process.env.T2D_HE_POLL_MS) : 2 * 1000;
const POLL_MAX_MS = Number(process.env.T2D_HE_POLL_MAX_MS) > 0 ? Number(process.env.T2D_HE_POLL_MAX_MS) : 90 * 1000;
const CONCURRENCY = Number(process.env.T2D_HE_CONCURRENCY) > 0 ? Number(process.env.T2D_HE_CONCURRENCY) : 4;
const EXPECTED_CONFIGS = 48;
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
    .filter((f) => f.startsWith("T2d_He_") && f.endsWith(".json"))
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

function readMeta(experimentName) {
  const d = latestRunDir(experimentName);
  if (!d) return null;
  const metaPath = path.join(RUNS, d, "metadata.json");
  if (!fs.existsSync(metaPath)) return { dir: d, meta: null };
  try {
    return { dir: d, meta: JSON.parse(fs.readFileSync(metaPath, "utf8")) };
  } catch {
    return { dir: d, meta: null };
  }
}

function isComplete(experimentName, expectedCfg) {
  const got = readMeta(experimentName);
  if (!got || !got.meta) return false;
  const meta = got.meta;
  const okStatus = meta.status === "completed" || meta.status === "complete";
  if (!okStatus) return false;
  const gotArts = ((meta.config && meta.config.seedArticles) || []).join("|");
  const want = (expectedCfg.seedArticles || []).join("|");
  if (want && gotArts !== want) return false;
  const mode = meta.config && meta.config.miScoringMode;
  if (mode !== "dual") return false;
  if (expectedCfg.miScoringMode && mode !== expectedCfg.miScoringMode) return false;
  return true;
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

function envFileCandidates() {
  return [path.join(ROOT, ".env"), path.join(EXP, ".env")];
}

function keyReadyPaths() {
  return [
    path.join(ROOT, "KEY_READY.md"),
    path.join(EXP, "KEY_READY.md"),
    path.join(RUNS, "_status", "KEY_READY.md"),
  ];
}

function keySignalExists() {
  return envFileCandidates().some((p) => fs.existsSync(p)) || keyReadyPaths().some((p) => fs.existsSync(p));
}

function checkKey() {
  const files = envFileCandidates().map((p) => ({ path: p, ...readDotEnvKey(p) }));
  const fromProc = process.env.OPENAI_API_KEY;
  const procClass = classifyKeyValue(fromProc);
  const ready = keyReadyPaths().filter((p) => fs.existsSync(p));

  let chosen = null;
  for (const f of files) {
    const cls = classifyKeyValue(f.key);
    if (cls.ok) {
      chosen = { ...cls, source: f.path, value: f.key };
      break;
    }
  }
  if (!chosen && procClass.ok) {
    chosen = { ...procClass, source: "process.env", value: fromProc };
  }

  const anyFile = files.find((f) => f.exists);
  const anyFileClass = anyFile ? classifyKeyValue(anyFile.key) : { present: false, length: 0, placeholder: false };
  return {
    ok: Boolean(chosen),
    envFileExists: Boolean(anyFile),
    envFileHasKey: files.some((f) => Boolean(f.key)),
    envFiles: files.map((f) => ({ path: f.path, exists: f.exists, hasKey: Boolean(f.key) })),
    OPENAI_API_KEY_length: chosen
      ? chosen.length
      : anyFileClass.present
        ? anyFileClass.length
        : procClass.present
          ? procClass.length
          : 0,
    placeholder: chosen ? false : anyFileClass.placeholder || procClass.placeholder || null,
    source: chosen ? chosen.source : anyFile ? anyFile.path : fromProc ? "process.env" : null,
    KEY_READY_md: ready,
    value: chosen ? chosen.value : null,
  };
}

function applyKeyToEnv(check) {
  if (check.ok && check.value && !process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = check.value;
  }
}

function listCmdlines() {
  const out = [];
  const proc = "/proc";
  if (!fs.existsSync(proc)) return out;
  for (const pid of fs.readdirSync(proc)) {
    if (!/^\d+$/.test(pid)) continue;
    try {
      const raw = fs.readFileSync(path.join(proc, pid, "cmdline"));
      const cmd = raw.toString("utf8").replace(/\0/g, " ").trim();
      if (cmd) out.push({ pid: Number(pid), cmd });
    } catch {
      /* gone */
    }
  }
  return out;
}

function configRelRunning(rel) {
  const needle = rel;
  return listCmdlines().some(
    (p) => p.pid !== process.pid && p.cmd.includes("index.js") && p.cmd.includes(needle)
  );
}

function competingOrchestrators() {
  return listCmdlines().filter((p) => {
    if (p.pid === process.pid) return false;
    const c = p.cmd;
    if (c.includes("run_t2d_he.js")) return true;
    if (c.includes("run_phase2.js") && c.includes("T2d_He")) return true;
    return false;
  });
}

function experimentInProgress(experimentName, expectedCfg) {
  if (isComplete(experimentName, expectedCfg)) return false;
  const rel = `thesisExperiment/configs/phase2/${experimentName}.json`;
  if (configRelRunning(rel)) return true;
  const got = readMeta(experimentName);
  if (got && got.meta && String(got.meta.status || "").toLowerCase() === "running") return true;
  return false;
}

function diskRow(rel) {
  const cfg = readCfg(rel);
  if (isComplete(cfg.experimentName, cfg)) {
    return {
      config: rel,
      experimentName: cfg.experimentName,
      topology: cfg.topology,
      status: 0,
      skipped: true,
      done: true,
      runDir: latestRunDir(cfg.experimentName),
      miScoringMode: "dual",
      source: "disk",
    };
  }
  if (experimentInProgress(cfg.experimentName, cfg)) {
    return {
      config: rel,
      experimentName: cfg.experimentName,
      topology: cfg.topology,
      status: "running",
      skipped: false,
      done: false,
      runDir: latestRunDir(cfg.experimentName),
      miScoringMode: "dual",
      source: "in_progress",
    };
  }
  return null;
}

function tally(campaign) {
  const configs = campaign.configRels || [];
  const byName = new Map();
  for (const r of campaign.runs || []) byName.set(r.experimentName, r);
  let completed = 0;
  let failed = 0;
  let skipped = 0;
  let pending = 0;
  let inProgress = 0;
  let llmCalls = 0;
  let estUsd = 0;
  for (const rel of configs) {
    const cfg = readCfg(rel);
    let row = byName.get(cfg.experimentName);
    if (!row) {
      if (isComplete(cfg.experimentName, cfg)) {
        skipped += 1;
        completed += 1;
      } else if (experimentInProgress(cfg.experimentName, cfg)) {
        inProgress += 1;
      } else pending += 1;
      const got = readMeta(cfg.experimentName);
      if (got && got.meta && got.meta.llmUsage && got.meta.llmUsage.calls) {
        llmCalls += Number(got.meta.llmUsage.calls) || 0;
        estUsd += Number(got.meta.llmUsage.estimatedUsd) || 0;
      }
      continue;
    }
    if (row.skipped) {
      skipped += 1;
      completed += 1;
    } else if (row.status === 0 && row.done) {
      completed += 1;
    } else if (row.status === "running" || row.source === "in_progress") {
      inProgress += 1;
    } else {
      failed += 1;
    }
    const calls = parseUsageCalls(row.usageLine);
    if (calls) {
      llmCalls += calls;
      const usd = (row.usageLine || "").match(/~\$([0-9.]+)/);
      if (usd) estUsd += Number(usd[1]);
    } else {
      const got = readMeta(cfg.experimentName);
      if (got && got.meta && got.meta.llmUsage && got.meta.llmUsage.calls) {
        llmCalls += Number(got.meta.llmUsage.calls) || 0;
        estUsd += Number(got.meta.llmUsage.estimatedUsd) || 0;
      }
    }
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
    in_progress: inProgress,
    not_started: pending,
    llmCalls,
    estUsd: Math.round(estUsd * 10000) / 10000,
  };
}

function topologyBreakdown(campaign) {
  const out = {};
  for (const t of TOPOLOGIES) out[t] = { configs: 0, completed: 0, failed: 0, skipped: 0, pending: 0, in_progress: 0 };
  const byName = new Map();
  for (const r of campaign.runs || []) byName.set(r.experimentName, r);
  for (const rel of campaign.configRels || []) {
    const cfg = readCfg(rel);
    const t = cfg.topology;
    if (!out[t]) out[t] = { configs: 0, completed: 0, failed: 0, skipped: 0, pending: 0, in_progress: 0 };
    out[t].configs += 1;
    const row = byName.get(cfg.experimentName);
    const complete = row
      ? row.skipped || (row.status === 0 && row.done)
      : isComplete(cfg.experimentName, cfg);
    const running = row
      ? row.status === "running" || row.source === "in_progress"
      : experimentInProgress(cfg.experimentName, cfg);
    const fail = row && !row.skipped && !(row.status === 0 && row.done) && !running;
    if (row && row.skipped) out[t].skipped += 1;
    if (complete) out[t].completed += 1;
    else if (running) out[t].in_progress += 1;
    else if (fail) out[t].failed += 1;
    else out[t].pending += 1;
  }
  return out;
}

function writeManifest(campaign) {
  if (competingOrchestrators().length) {
    return;
  }
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
  const keyLine = campaign.keyCheck ? (campaign.keyCheck.ok ? "yes" : "no") : "unknown";
  const lines = [
    `# T2d_He status (dual heterogeneous, all 8 topologies)`,
    ``,
    `**Updated:** ${nowIso()}`,
    `**OPENAI_API_KEY present:** ${keyLine} (length=${campaign.keyCheck ? campaign.keyCheck.OPENAI_API_KEY_length : 0}; value not logged)`,
    `**Dry-run:** no`,
    `**MI/MPR invented:** no`,
    `**Dual:** 2 auditor LLM calls per event (\`src/Auditor.js\` \`miScoringMode: dual\`)`,
    `**Concurrency:** ${CONCURRENCY}`,
    `**Isolation:** \`thesisExperiment/runs_phase2\` only (not Phase 1 \`runs/\` or \`results/tables/\`)`,
    `**Git commit:** no`,
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
    `| in_progress | ${counts.in_progress} |`,
    `| pending / not_started | ${counts.pending} |`,
    `| LLM calls (this slice + probe) | ${counts.llmCalls} |`,
    `| Est. USD | $${counts.estUsd} |`,
    ``,
    `## By topology`,
    ``,
    `| topology | configs | completed | failed | skipped | in_progress | pending |`,
    `| --- | ---: | ---: | ---: | ---: | ---: | ---: |`,
  ];
  for (const t of TOPOLOGIES) {
    const r = byT[t] || { configs: 0, completed: 0, failed: 0, skipped: 0, pending: 0, in_progress: 0 };
    lines.push(
      `| ${t} | ${r.configs} | ${r.completed} | ${r.failed} | ${r.skipped} | ${r.in_progress} | ${r.pending} |`
    );
  }
  if (campaign.probe) {
    lines.push(``);
    lines.push(`## Probe (dual)`);
    lines.push(``);
    lines.push(`- experiment: \`${campaign.probe.experimentName || "probe_T2d_He"}\``);
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
  lines.push(
    `Did not write \`thesisExperiment/runs/\` or \`thesisExperiment/results/tables/\`. Manifest: \`thesisExperiment/results_phase2/manifest_T2d_He.json\`. Did not run \`T2c_H_\`, \`T2d_H_\`, or \`T2c_He_\` configs. Did not git commit.`
  );
  lines.push(``);
  fs.writeFileSync(STATUS, lines.join("\n"));
}

function writeBlocker(campaign, polls) {
  const counts = tally(campaign);
  const body = `# Blocker: T2d_He DUAL — OPENAI_API_KEY missing

**Time:** ${nowIso()}
**Slice:** T2d_He (heterogeneous persona×article, \`miScoringMode: dual\`; 2 auditor calls per event)
**Grid:** 8 topologies × 6 mixes = **${counts.configs} configs** (each × 6 core articles)
**LLM runs:** STOPPED after polling ~${Math.round(POLL_MAX_MS / 1000)}s. No cells launched. Did not dry-run. Did not invent MI/MPR.

## Key poll (no values logged)

Polled \`/workspace/.env\`, \`thesisExperiment/.env\`, process.env, and \`KEY_READY.md\` every ${Math.round(POLL_INTERVAL_MS / 1000)}s for up to ~${Math.round(POLL_MAX_MS / 1000)}s (${polls.length} checks). Still missing or placeholder.

| Source | Result |
| --- | --- |
| Process env \`OPENAI_API_KEY\` | unset or unusable (length=${campaign.keyCheck ? campaign.keyCheck.OPENAI_API_KEY_length : 0}) |
| \`/workspace/.env\` | ${campaign.keyCheck && campaign.keyCheck.envFileExists ? "exists but no usable key" : "does not exist"} |
| \`KEY_READY.md\` | ${(campaign.keyCheck && campaign.keyCheck.KEY_READY_paths && campaign.keyCheck.KEY_READY_paths.length) ? campaign.keyCheck.KEY_READY_paths.join(", ") : "not found"} |
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

Did not write to \`thesisExperiment/runs/\` or \`thesisExperiment/results/tables/\`. Manifest remains \`thesisExperiment/results_phase2/manifest_T2d_He.json\`. Did not git commit.

## Resume

1. Place a non-placeholder \`OPENAI_API_KEY\` in gitignored \`/workspace/.env\` (optional \`KEY_READY.md\` signal, no secret body).
2. Probe one dual cell until LLM usage > 0.
3. Run all 48 \`T2d_He_*.json\` into \`thesisExperiment/runs_phase2\`, concurrency ${CONCURRENCY}, skip completed dual runs.
`;
  fs.writeFileSync(BLOCKER, body);
}

function writeProbeConfig() {
  const probeConfig = {
    experimentName: "probe_T2d_He",
    personasPath: "thesisExperiment/personas/phase2/hetero/mix_00.json",
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
  const tmp = path.join(CFG_DIR, "_probe_T2d_He.json");
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

async function pollForKey(campaign) {
  const polls = [];
  const started = Date.now();
  let attempt = 0;
  while (true) {
    attempt += 1;
    const signal = keySignalExists();
    const check = checkKey();
    const row = {
      attempt,
      at: nowIso(),
      elapsedMs: Date.now() - started,
      signalExists: signal,
      envFileExists: check.envFileExists,
      envFiles: check.envFiles,
      KEY_READY_md: check.KEY_READY_md,
      ok: check.ok,
      length: check.OPENAI_API_KEY_length,
      placeholder: check.placeholder,
    };
    polls.push(row);
    fs.writeFileSync(POLL_LOG, JSON.stringify({ polls }, null, 2));
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
    };
    writeManifest(campaign);
    writeStatus(
      campaign,
      `**Phase:** polling for .env / KEY_READY.md (attempt ${attempt}; every ${Math.round(POLL_INTERVAL_MS / 1000)}s, max ${Math.round(POLL_MAX_MS / 1000)}s).\n\nDid not invent a key. Did not write \`.env\`. Did not print the key.`
    );
    console.log(
      `[T2d_He] key poll ${attempt} ok=${check.ok} envFile=${check.envFileExists} length=${check.OPENAI_API_KEY_length} readyMd=${check.KEY_READY_md.length}`
    );
    if (check.ok) {
      applyKeyToEnv(check);
      return { ok: true, check, polls };
    }
    if (Date.now() - started >= POLL_MAX_MS) {
      return { ok: false, check, polls };
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

function syncDiskRuns(campaign) {
  const byName = new Map();
  for (const r of campaign.runs || []) byName.set(r.experimentName, r);
  for (const rel of campaign.configRels || []) {
    const cfg = readCfg(rel);
    const existing = byName.get(cfg.experimentName);
    if (existing && existing.skipped) continue;
    if (existing && existing.status === 0 && existing.done) continue;
    const disk = diskRow(rel);
    if (!disk) continue;
    if (existing && existing.source === "worker" && !existing.done && disk.source === "in_progress") continue;
    if (existing) {
      Object.assign(existing, disk);
    } else {
      campaign.runs.push(disk);
      byName.set(cfg.experimentName, disk);
    }
  }
}

async function waitForCompeting(campaign) {
  while (true) {
    const others = competingOrchestrators();
    if (!others.length) return;
    syncDiskRuns(campaign);
    writeStatus(
      campaign,
      `**Phase:** peer T2d_He orchestrator live (pids ${others.map((p) => p.pid).join(",")}). Watching; skip completed/in-progress; will run leftovers. Do not stop after one topology.`
    );
    console.log(`[T2d_He] waiting on peer orchestrator pids=${others.map((p) => p.pid).join(",")}`);
    await sleep(15000);
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
          source: "disk",
        };
        campaign.runs = campaign.runs.filter((r) => r.experimentName !== cfg.experimentName);
        campaign.runs.push(skip);
        writeManifest(campaign);
        writeStatus(campaign, `**Phase:** grid (skip complete ${cfg.experimentName}).`);
        appendLog(`SKIP complete ${cfg.experimentName} (${skip.runDir})`);
        continue;
      }
      if (experimentInProgress(cfg.experimentName, cfg)) {
        const inflight = {
          config: rel,
          experimentName: cfg.experimentName,
          topology: cfg.topology,
          status: "running",
          skipped: false,
          done: false,
          runDir: latestRunDir(cfg.experimentName),
          miScoringMode: "dual",
          source: "in_progress",
        };
        campaign.runs = campaign.runs.filter((r) => r.experimentName !== cfg.experimentName);
        campaign.runs.push(inflight);
        writeManifest(campaign);
        writeStatus(campaign, `**Phase:** grid (peer in-progress ${cfg.experimentName}; not duplicated).`);
        appendLog(`SKIP in_progress ${cfg.experimentName} (${inflight.runDir})`);
        continue;
      }
      appendLog(`START ${cfg.experimentName} config=${rel}`);
      writeStatus(campaign, `**Phase:** grid START ${cfg.experimentName} (queue left ${queue.length}).`);
      const row = await runOne(rel, timeouts);
      row.source = "worker";
      campaign.runs = campaign.runs.filter((r) => r.experimentName !== cfg.experimentName);
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

async function waitInFlightThenRetry(campaign, timeouts) {
  const started = Date.now();
  const maxWait = 90 * 60 * 1000;
  while (Date.now() - started < maxWait) {
    let still = 0;
    for (const rel of campaign.configRels) {
      const cfg = readCfg(rel);
      if (!isComplete(cfg.experimentName, cfg) && experimentInProgress(cfg.experimentName, cfg)) still += 1;
    }
    if (!still) break;
    syncDiskRuns(campaign);
    writeStatus(campaign, `**Phase:** waiting for ${still} in-flight peer cells before leftover retry.`);
    await sleep(20000);
  }
  syncDiskRuns(campaign);
  const leftovers = campaign.configRels.filter((rel) => {
    const cfg = readCfg(rel);
    return !isComplete(cfg.experimentName, cfg) && !experimentInProgress(cfg.experimentName, cfg);
  });
  if (!leftovers.length) return;
  appendLog(`T2d_He leftover retry n=${leftovers.length} concurrency=${CONCURRENCY}`);
  const saved = campaign.configRels;
  campaign.configRels = leftovers;
  await runPool(campaign, timeouts);
  campaign.configRels = saved;
}

function validateConfigs(rels) {
  const problems = [];
  const seenTopo = new Set();
  for (const rel of rels) {
    const cfg = readCfg(rel);
    if (cfg.miScoringMode !== "dual") problems.push(`${rel} miScoringMode=${cfg.miScoringMode}`);
    if (cfg.outputRoot !== "thesisExperiment/runs_phase2") problems.push(`${rel} outputRoot=${cfg.outputRoot}`);
    if (!String(cfg.experimentName || "").startsWith("T2d_He_")) problems.push(`${rel} experimentName=${cfg.experimentName}`);
    seenTopo.add(cfg.topology);
  }
  return { problems, topologies: [...seenTopo].sort() };
}

async function main() {
  delete process.env.DRY_RUN;
  const rels = listConfigs();
  const { problems, topologies } = validateConfigs(rels);
  if (problems.length) {
    console.error("T2d_He config validation failed:\n" + problems.join("\n"));
    process.exit(2);
  }
  if (rels.length !== EXPECTED_CONFIGS) {
    console.error(`Expected ${EXPECTED_CONFIGS} T2d_He configs, found ${rels.length}`);
    process.exit(2);
  }

  const campaign = {
    slice: "T2d_He",
    startedAt: nowIso(),
    mode: "real",
    model: "gpt-4o-mini",
    miScoringMode: "dual",
    dualAuditorCallsPerEvent: 2,
    concurrency: CONCURRENCY,
    outputRoot: "thesisExperiment/runs_phase2",
    configRels: rels,
    topologies,
    keyCheck: null,
    probe: null,
    aborted: null,
    isolation: {
      didNotWrite: [
        "thesisExperiment/runs",
        "thesisExperiment/results/tables",
        "thesisExperiment/results_phase2/phase2_manifest.json",
      ],
      didNotRunPrefixes: ["T2c_H_", "T2d_H_", "T2c_He_"],
      manifestOnly: "thesisExperiment/results_phase2/manifest_T2d_He.json",
      gitCommit: false,
    },
    runs: [],
  };

  writeManifest(campaign);
  writeStatus(campaign, "**Phase:** start. Validated 48 dual heterogeneous configs across 8 topologies.");
  appendLog(`T2d_He slice start n=${rels.length} topologies=${topologies.join(",")} concurrency=${CONCURRENCY}`);

  const polled = await pollForKey(campaign);
  if (!polled.ok) {
    campaign.aborted = "real_api_unavailable";
    campaign.abortReason = `OPENAI_API_KEY missing/placeholder after ~${Math.round(POLL_MAX_MS / 1000)}s poll of /workspace/.env, thesisExperiment/.env, process.env, and KEY_READY.md. Refusing to invent MI/MPR.`;
    campaign.finishedAt = nowIso();
    writeManifest(campaign);
    writeBlocker(campaign, polled.polls);
    writeStatus(
      campaign,
      `**Phase:** ABORT. Key still missing after ${Math.round(POLL_MAX_MS / 1000)}s poll. Probe and grid not started. Did not invent results.`
    );
    const counts = tally(campaign);
    appendLog(
      `T2d_He ABORT real_api_unavailable after ${polled.polls.length} polls. completed=${counts.completed} failed=${counts.failed} skipped=${counts.skipped} pending=${counts.pending}. Did not dry-run. Did not invent MI.`
    );
    console.error("[T2d_He] key missing after poll; exiting without dry-run.");
    process.exit(2);
  }

  if (fs.existsSync(BLOCKER)) {
    fs.unlinkSync(BLOCKER);
  }

  writeStatus(campaign, "**Phase:** key present. Starting dual probe until usage>0.");
  appendLog(
    `T2d_He key present (length=${campaign.keyCheck.OPENAI_API_KEY_length}, source=${campaign.keyCheck.source}). Probe dual.`
  );

  const probeRel = writeProbeConfig();
  let probeResult = null;
  let probeFailed = true;
  for (let i = 1; i <= 8 && probeFailed; i++) {
    console.log(`=== T2d_He dual probe attempt ${i} ===`);
    probeResult = await runCli(probeRel, "probe_T2d_He", {
      stallMs: 10 * 60 * 1000,
      hardMs: 4 * 60 * 1000,
    });
    probeFailed = probeFailedFrom(probeResult);
    const usageLine = extractUsage(probeResult.stdout);
    campaign.probe = {
      attempt: i,
      experimentName: "probe_T2d_He",
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
      `PROBE_T2d_He dual attempt=${i} status=${probeResult.status} failed=${probeFailed} elapsedMs=${probeResult.elapsedMs} usage=${usageLine || "n/a"}`
    );
    if (probeFailed) await sleep(5000);
  }

  if (probeFailed || !campaign.probe || campaign.probe.usageCalls <= 0) {
    campaign.aborted = "probe_usage_zero_or_failed";
    campaign.abortReason =
      "Dual probe did not produce LLM usage > 0. Refusing to invent MI/MPR or dry-run the 48-cell grid.";
    campaign.finishedAt = nowIso();
    writeManifest(campaign);
    writeStatus(campaign, "**Phase:** ABORT. Dual probe failed or usage=0. Grid not started.");
    appendLog("T2d_He ABORT probe_failed — refusing to invent Phase 2 MI/MPR.");
    process.exit(2);
  }

  appendLog(`PHASE_T2d_He n=${rels.length} concurrency=${CONCURRENCY}`);
  writeStatus(
    campaign,
    `**Phase:** grid. Dual probe usage>0. Running all T2d_He_*.json across 8 topologies, skip completed, concurrency ${CONCURRENCY}. Do not stop after one.`
  );
  const timeouts = { stallMs: 25 * 60 * 1000, hardMs: 70 * 60 * 1000 };

  await waitForCompeting(campaign);
  await runPool(campaign, timeouts);
  await waitInFlightThenRetry(campaign, timeouts);

  campaign.finishedAt = nowIso();
  syncDiskRuns(campaign);
  writeManifest(campaign);
  const counts = tally(campaign);
  writeStatus(
    campaign,
    `**Phase:** finished. completed=${counts.completed} failed=${counts.failed} skipped=${counts.skipped} pending=${counts.pending} in_progress=${counts.in_progress}.`
  );
  appendLog(
    `T2d_He finished completed=${counts.completed} failed=${counts.failed} skipped=${counts.skipped} pending=${counts.pending} llmCalls=${counts.llmCalls} estUsd=${counts.estUsd}`
  );
  process.exit(counts.failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  appendLog(`FATAL_T2d_He ${err.message}`);
  process.exit(1);
});
