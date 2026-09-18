#!/usr/bin/env node
/**
 * Isolated T2c_H runner: ALL 96 continuous homogeneous configs across 8 topologies.
 * Does not stop after one topology. Writes only runs_phase2 / results_phase2.
 * Real API only. No dry-run. No invented MI. Does not write phase2_manifest.json.
 *
 *   node thesisExperiment/scripts/run_t2c_h.js
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { isMockKey } = require("../../src/loadEnv");

const ROOT = path.join(__dirname, "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const CFG_DIR = path.join(EXP, "configs", "phase2");
const RUNS = path.join(EXP, "runs_phase2");
const RESULTS = path.join(EXP, "results_phase2");
const LOG_DIR = path.join(RESULTS, "logs");
const STATUS_DIR = path.join(RUNS, "_status");
const BLOCK_DIR = path.join(RUNS, "_blockers");
const STATUS_MD = path.join(STATUS_DIR, "T2c_H.md");
const MANIFEST = path.join(RESULTS, "manifest_T2c_H.json");
const LOG_MD = path.join(EXP, "LOG.md");
const ENV_PATH = path.join(ROOT, ".env");
const KEY_READY = path.join(STATUS_DIR, "KEY_READY.md");
const WAITING_MD = path.join(BLOCK_DIR, "T2c_H_waiting.md");
const ORCH_LOG = path.join(LOG_DIR, "T2c_H_orchestrator.log");

const TOPO_ORDER = [
  "linear_chain",
  "ring",
  "random_er",
  "small_world",
  "scale_free",
  "echo_chamber",
  "polarized",
  "hierarchical",
];

const POLL_MS = 20_000;
const POLL_MAX_MS = 8 * 60 * 1000;
const CONCURRENCY = 3;

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(RUNS, { recursive: true });
fs.mkdirSync(path.join(RESULTS, "tables"), { recursive: true });
fs.mkdirSync(STATUS_DIR, { recursive: true });
fs.mkdirSync(BLOCK_DIR, { recursive: true });

function nowIso() {
  return new Date().toISOString();
}

function orch(line) {
  const s = `[${nowIso()}] ${line}\n`;
  fs.appendFileSync(ORCH_LOG, s);
  process.stdout.write(s);
}

function appendLog(text) {
  fs.appendFileSync(LOG_MD, `\n## ${nowIso()}\n\n${text.trim()}\n\n---\n`);
}

function readDotEnvKey(envPath) {
  if (!fs.existsSync(envPath)) return { exists: false, value: "", length: 0 };
  const text = fs.readFileSync(envPath, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim().replace(/^export\s+/, "");
    const v = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (k === "OPENAI_API_KEY") return { exists: true, value: v, length: v.length };
  }
  return { exists: true, value: "", length: 0 };
}

function keyLooksReal(value) {
  if (!value || typeof value !== "string") return false;
  const v = value.trim();
  if (v.length < 20) return false;
  if (isMockKey(v)) return false;
  if (/^(your[_-]?key|xxx+|changeme|todo)$/i.test(v)) return false;
  return true;
}

function inspectKey() {
  const fromProc = (process.env.OPENAI_API_KEY || "").trim();
  const fromFile = readDotEnvKey(ENV_PATH);
  const readyExists = fs.existsSync(KEY_READY);
  const candidate = fromProc || fromFile.value || "";
  const ok = keyLooksReal(candidate);
  return {
    envFileExists: fromFile.exists,
    readyExists,
    procLen: fromProc.length,
    fileLen: fromFile.length,
    candidateLen: candidate.length,
    ok,
    key: ok ? candidate : "",
  };
}

function listT2cHConfigs() {
  const files = fs
    .readdirSync(CFG_DIR)
    .filter((f) => /^T2c_H_.*\.json$/.test(f) && !f.startsWith("T2c_He_"))
    .map((f) => path.join("thesisExperiment", "configs", "phase2", f).replace(/\\/g, "/"));
  const scored = files.map((rel) => {
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
    const topo = cfg.topology || "";
    const ti = TOPO_ORDER.indexOf(topo);
    return { rel, cfg, topo, ti: ti === -1 ? 99 : ti, name: cfg.experimentName };
  });
  scored.sort((a, b) => a.ti - b.ti || a.name.localeCompare(b.name));
  return scored;
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

function readMeta(dirName) {
  if (!dirName) return null;
  const p = path.join(RUNS, dirName, "metadata.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function usageCalls(meta, stdout) {
  const m = (stdout || "").match(/LLM usage: (\d+) calls/);
  const fromOut = m ? Number(m[1]) : 0;
  const fromMeta = meta && meta.llmUsage && meta.llmUsage.calls != null ? Number(meta.llmUsage.calls) : 0;
  return Math.max(fromOut, fromMeta, 0);
}

function isComplete(experimentName, expectedCfg) {
  const d = latestRunDir(experimentName);
  if (!d) return false;
  const meta = readMeta(d);
  if (!meta) return false;
  const okStatus = meta.status === "completed" || meta.status === "complete";
  if (!okStatus) return false;
  const mode = (meta.config && meta.config.miScoringMode) || "";
  if (mode !== "continuous") return false;
  if (expectedCfg && expectedCfg.miScoringMode && mode !== expectedCfg.miScoringMode) return false;
  const got = ((meta.config && meta.config.seedArticles) || []).join("|");
  const want = ((expectedCfg && expectedCfg.seedArticles) || []).join("|");
  if (want && got !== want) return false;
  // Do not skip dry / zero-call "complete" dirs (not thesis cells).
  if (usageCalls(meta, "") <= 0) return false;
  return true;
}

function emptyCampaign() {
  return {
    startedAt: nowIso(),
    slice: "T2c_H",
    mode: "real",
    model: "gpt-4o-mini",
    concurrency: CONCURRENCY,
    isolation: "runs_phase2 / results_phase2 only; not phase2_manifest.json",
    dryRun: false,
    probe: null,
    runs: [],
    counts: { completed: 0, failed: 0, skipped: 0, remaining: 96, attempted: 0 },
  };
}

function readCampaign() {
  if (!fs.existsSync(MANIFEST)) return emptyCampaign();
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch {
    return emptyCampaign();
  }
}

function writeCampaign(campaign) {
  fs.writeFileSync(MANIFEST, JSON.stringify(campaign, null, 2));
}

function countsFrom(items, campaign) {
  const byName = new Map();
  for (const r of campaign.runs || []) {
    if (r && r.experimentName) byName.set(r.experimentName, r);
  }
  let completed = 0;
  let failed = 0;
  let skipped = 0;
  let remaining = 0;
  const perTopo = {};
  for (const t of TOPO_ORDER) perTopo[t] = { total: 0, completed: 0, failed: 0, skipped: 0, remaining: 0 };
  for (const it of items) {
    const t = it.topo;
    if (!perTopo[t]) perTopo[t] = { total: 0, completed: 0, failed: 0, skipped: 0, remaining: 0 };
    perTopo[t].total += 1;
    if (isComplete(it.name, it.cfg)) {
      completed += 1;
      perTopo[t].completed += 1;
      const row = byName.get(it.name);
      if (row && row.skipped) skipped += 1;
      continue;
    }
    const row = byName.get(it.name);
    if (row && row.attempted && !row.skipped && row.status !== 0) {
      failed += 1;
      perTopo[t].failed += 1;
    } else {
      remaining += 1;
      perTopo[t].remaining += 1;
    }
  }
  skipped = (campaign.runs || []).filter((r) => r.skipped).length;
  return { completed, failed, skipped, remaining, attempted: (campaign.runs || []).filter((r) => r.attempted && !r.skipped).length, perTopo };
}

function writeStatus(extra) {
  const items = listT2cHConfigs();
  const campaign = fs.existsSync(MANIFEST) ? readCampaign() : extra.campaign || emptyCampaign();
  const c = countsFrom(items, campaign);
  const probe = campaign.probe || extra.probe || null;
  const keyYes = extra.keyFound === true || (inspectKey().ok && extra.keyFound !== false);
  const lines = [];
  lines.push("# T2c_H status — continuous homogeneous, all 8 topologies");
  lines.push("");
  lines.push(`**When.** ${nowIso()}`);
  lines.push(`**OPENAI_API_KEY found.** **${keyYes ? "yes" : "no"}** (value not logged)`);
  lines.push(`**Dry-run.** no. **MI invented.** no.`);
  lines.push(`**Isolation.** \`thesisExperiment/runs_phase2\` + \`thesisExperiment/results_phase2\` only.`);
  lines.push(`**N=1, hops/ticks=8, concurrency=${CONCURRENCY}.** Model \`gpt-4o-mini\`. \`miScoringMode: continuous\`.`);
  lines.push(`**Configs.** 96 = 8 topologies × 12 personas. Does not stop after one topology.`);
  lines.push("");
  lines.push(`**Phase.** ${extra.phase || "unknown"}`);
  lines.push("");
  lines.push("| metric | n |");
  lines.push("|---|---:|");
  lines.push(`| completed | ${c.completed} |`);
  lines.push(`| failed | ${c.failed} |`);
  lines.push(`| skipped (already complete+continuous+usage>0) | ${c.skipped} |`);
  lines.push(`| remaining | ${c.remaining} |`);
  lines.push(`| attempted this process | ${c.attempted} |`);
  lines.push(`| configs | 96 |`);
  lines.push("");
  lines.push("## Per topology (keep going across all eight)");
  lines.push("");
  lines.push("| topology | configs | completed | failed | remaining |");
  lines.push("|---|---:|---:|---:|---:|");
  for (const t of TOPO_ORDER) {
    const p = c.perTopo[t] || { total: 0, completed: 0, failed: 0, remaining: 0 };
    lines.push(`| ${t} | ${p.total} | ${p.completed} | ${p.failed} | ${p.remaining} |`);
  }
  lines.push("");
  if (probe) {
    lines.push("## Probe (2-node continuous, usage must be > 0)");
    lines.push("");
    lines.push(`- failed: ${probe.failed}`);
    lines.push(`- usageCalls: ${probe.usageCalls}`);
    lines.push(`- elapsedMs: ${probe.elapsedMs}`);
    lines.push(`- usageLine: ${probe.usageLine || "n/a"}`);
    lines.push("");
  }
  if (extra.note) {
    lines.push("## Note");
    lines.push("");
    lines.push(extra.note);
    lines.push("");
  }
  lines.push("## Isolation");
  lines.push("");
  lines.push("Did not write Phase 1 \`thesisExperiment/runs/\` or \`thesisExperiment/results/tables/\`. Did not write \`phase2_manifest.json\`. Did not git checkout or commit.");
  lines.push("");
  fs.writeFileSync(STATUS_MD, lines.join("\n") + "\n");
  return c;
}

function writeWaiting(polls, elapsedMs) {
  const body = `# T2c_H waiting for OPENAI_API_KEY

**When.** ${nowIso()}  
**Slice.** CONTINUOUS homogeneous: 96 \`T2c_H_*.json\` (8 topologies × 12 personas).  
**Key found.** **no** (length=0). Did not invent a key. Did not write \`/workspace/.env\`. Did not dry-run. Did not invent MI/MPR.

Polled \`/workspace/.env\` and \`thesisExperiment/runs_phase2/_status/KEY_READY.md\` every 20s for ~8 minutes (${polls} polls, elapsedMs=${elapsedMs}). Still missing. Master should inject a real key and relaunch this worker.

## Grid that did not run

| metric | n |
|---|---:|
| configs | 96 |
| completed | 0 |
| failed | 0 |
| remaining | 96 |
| LLM calls | 0 |

Probe not started (would fail \`Env var OPENAI_API_KEY not set\`; usage would not be > 0).

## Isolation

Did not write Phase 1 \`runs/\` or \`results/tables/\`. Did not write \`phase2_manifest.json\`.
`;
  fs.writeFileSync(WAITING_MD, body);
}

function writeProbeConfig() {
  const probeConfig = {
    experimentName: "probe_p2_continuous",
    personasPath: "thesisExperiment/personas/phase2/homo/conspiracy_believer.json",
    articlesPath: "thesisExperiment/articles/merged.json",
    outputRoot: "thesisExperiment/runs_phase2",
    topology: "linear_chain",
    topologyParams: { numNodes: 2 },
    maxTicks: 1,
    defaultModel: "gpt-4o-mini",
    auditorModel: "gpt-4o-mini",
    miScoringMode: "continuous",
    seedArticles: ["scopex_2017"],
    seedNodes: ["node_0"],
    graphRandomSeed: 42,
    nodeParams: {
      maxHops: 1,
      maxInboxSize: 4,
      actionWeights: { forward: 0.2, reinterpret: 0.8, drop: 0.0 },
    },
    _description: "T2c_H continuous API probe (2 nodes, 1 tick). Not a thesis cell.",
  };
  const tmp = path.join(CFG_DIR, "_probe_p2_continuous.json");
  fs.writeFileSync(tmp, JSON.stringify(probeConfig, null, 2));
  return path.relative(ROOT, tmp).replace(/\\/g, "/");
}

function extractUsageLine(stdout) {
  const m = (stdout || "").match(/LLM usage: ([^\n]+)/);
  return m ? m[1].trim() : null;
}

function runCli(configRel, logName, { stallMs, hardMs }) {
  const args = ["index.js", "--config", configRel];
  orch(`$ node ${args.join(" ")}`);
  const logPath = path.join(LOG_DIR, `${logName || "run"}.log`);
  const log = fs.createWriteStream(logPath, { flags: "a" });
  log.write(`\n=== ${nowIso()}  node ${args.join(" ")}\n`);

  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, DRY_RUN: "" },
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

function probeFailedFrom(result, calls) {
  const blob = `${result.stderr || ""}\n${result.stdout || ""}`;
  if (result.status !== 0 || result.signal != null) return true;
  const openaiAuthFail =
    /OPENAI_API_KEY looks like a placeholder|Env var OPENAI_API_KEY not set|HTTP 401:|HTTP 403:/i.test(blob);
  const done = /\[Simulation\] Done/.test(blob);
  if (openaiAuthFail || !done) return true;
  if (!calls || calls <= 0) return true;
  return false;
}

function round4(x) {
  if (x == null || Number.isNaN(x)) return null;
  return Math.round(x * 10000) / 10000;
}

function collectEvents(runDir, articleId) {
  const nodesDir = path.join(runDir, "nodes");
  const events = [];
  if (!fs.existsSync(nodesDir)) return events;
  for (const f of fs.readdirSync(nodesDir).filter((x) => x.endsWith(".json"))) {
    let state;
    try {
      state = JSON.parse(fs.readFileSync(path.join(nodesDir, f), "utf8"));
    } catch {
      continue;
    }
    for (const ev of state.history || []) {
      if (ev.articleId !== articleId) continue;
      events.push(ev);
    }
  }
  return events;
}

function writeT2cHRows(items) {
  const rows = [];
  for (const it of items) {
    const d = latestRunDir(it.name);
    if (!d) continue;
    const meta = readMeta(d);
    if (!meta) continue;
    const articles = (meta.config && meta.config.seedArticles) || it.cfg.seedArticles || [];
    const runDir = path.join(RUNS, d);
    for (const articleId of articles) {
      const events = collectEvents(runDir, articleId);
      const scored = events.filter((e) => e.misinfoIndex != null);
      const meanMI =
        scored.length === 0 ? null : round4(scored.reduce((s, e) => s + e.misinfoIndex, 0) / scored.length);
      rows.push({
        experimentName: it.name,
        topology: it.topo,
        articleId,
        nEvents: events.length,
        nScored: scored.length,
        meanContinuousMI: meanMI,
        llmCalls: meta.llmUsage && meta.llmUsage.calls,
        status: meta.status,
        miScoringMode: meta.config && meta.config.miScoringMode,
        runDir: d,
      });
    }
  }
  const keys = [
    "experimentName",
    "topology",
    "articleId",
    "nEvents",
    "nScored",
    "meanContinuousMI",
    "llmCalls",
    "status",
    "miScoringMode",
    "runDir",
  ];
  const lines = [keys.join(",")];
  for (const r of rows) {
    lines.push(keys.map((k) => (r[k] == null ? "" : String(r[k]))).join(","));
  }
  fs.writeFileSync(path.join(RESULTS, "tables", "T2c_H_rows.csv"), lines.join("\n") + (rows.length ? "\n" : "\n"));
  return rows.length;
}

async function pollForKey() {
  const t0 = Date.now();
  let polls = 0;
  while (Date.now() - t0 <= POLL_MAX_MS) {
    polls += 1;
    const info = inspectKey();
    orch(
      `poll ${polls} envFile=${info.envFileExists} keyReady=${info.readyExists} procLen=${info.procLen} fileLen=${info.fileLen} ok=${info.ok}`
    );
    writeStatus({
      phase: `polling for OPENAI_API_KEY (${polls})`,
      keyFound: info.ok,
      note: `Poll ${polls}: /workspace/.env exists=${info.envFileExists}; KEY_READY.md exists=${info.readyExists}; process length=${info.procLen}; file length=${info.fileLen}. Value not logged.`,
    });
    if (info.ok) {
      process.env.OPENAI_API_KEY = info.key;
      return { ok: true, polls, elapsedMs: Date.now() - t0 };
    }
    if (Date.now() - t0 + POLL_MS > POLL_MAX_MS) break;
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  return { ok: false, polls, elapsedMs: Date.now() - t0 };
}

async function runOne(item, timeouts) {
  const result = await runCli(item.rel, item.name, timeouts);
  const runDir = latestRunDir(item.name);
  const meta = readMeta(runDir);
  const calls = usageCalls(meta, result.stdout);
  return {
    config: item.rel,
    experimentName: item.name,
    topology: item.topo,
    status: result.status,
    signal: result.signal,
    killedFor: result.killedFor,
    elapsedMs: result.elapsedMs,
    runDir,
    error: result.error,
    usageLine: extractUsageLine(result.stdout),
    usageCalls: calls,
    logPath: result.logPath,
    done: /\[Simulation\] Done/.test(result.stdout || ""),
    miScoringMode: item.cfg.miScoringMode,
    attempted: true,
    skipped: false,
  };
}

async function runPool(items, campaign) {
  const timeouts = { stallMs: 25 * 60 * 1000, hardMs: 70 * 60 * 1000 };
  const queue = [...items];
  const workers = [];
  const runNext = async () => {
    while (queue.length) {
      const item = queue.shift();
      if (isComplete(item.name, item.cfg)) {
        const skip = {
          config: item.rel,
          experimentName: item.name,
          topology: item.topo,
          status: 0,
          skipped: true,
          attempted: false,
          runDir: latestRunDir(item.name),
          usageCalls: usageCalls(readMeta(latestRunDir(item.name)), ""),
        };
        campaign.runs.push(skip);
        writeCampaign(campaign);
        orch(`SKIP complete ${item.name}`);
        writeStatus({ phase: `running T2c_H queue (skipped ${item.name})`, keyFound: true, campaign });
        continue;
      }
      orch(`START ${item.name} config=${item.rel} topo=${item.topo} remainingInQueue=${queue.length}`);
      appendLog(`START ${item.name} config=${item.rel} topology=${item.topo}`);
      const row = await runOne(item, timeouts);
      campaign.runs.push(row);
      writeCampaign(campaign);
      orch(
        `END ${row.experimentName} status=${row.status} elapsedMs=${row.elapsedMs} runDir=${row.runDir} usageCalls=${row.usageCalls} killedFor=${row.killedFor || "none"} done=${row.done}`
      );
      appendLog(
        `END ${row.experimentName} status=${row.status} elapsedMs=${row.elapsedMs} runDir=${row.runDir} usage=${row.usageLine || "n/a"} killedFor=${row.killedFor || "none"} done=${row.done}`
      );
      writeT2cHRows(items);
      writeStatus({ phase: `running T2c_H queue (ended ${item.name})`, keyFound: true, campaign });
    }
  };
  for (let i = 0; i < CONCURRENCY; i++) workers.push(runNext());
  await Promise.all(workers);
}

async function main() {
  const items = listT2cHConfigs();
  if (items.length !== 96) {
    orch(`FATAL expected 96 T2c_H configs, found ${items.length}`);
    process.exit(1);
  }
  for (const it of items) {
    if (it.cfg.miScoringMode !== "continuous") {
      orch(`FATAL ${it.name} miScoringMode=${it.cfg.miScoringMode}`);
      process.exit(1);
    }
    if (it.cfg.outputRoot !== "thesisExperiment/runs_phase2") {
      orch(`FATAL ${it.name} outputRoot=${it.cfg.outputRoot}`);
      process.exit(1);
    }
    if ((it.cfg.topologyParams && it.cfg.topologyParams.numNodes) !== 8) {
      orch(`FATAL ${it.name} numNodes=${it.cfg.topologyParams && it.cfg.topologyParams.numNodes}`);
      process.exit(1);
    }
    if (it.cfg.maxTicks !== 8) {
      orch(`FATAL ${it.name} maxTicks=${it.cfg.maxTicks}`);
      process.exit(1);
    }
  }

  writeStatus({ phase: "start: check/poll OPENAI_API_KEY", keyFound: inspectKey().ok });
  appendLog("T2c_H worker start: poll /workspace/.env + KEY_READY.md every 20s up to ~8 min, then probe + all 96 configs concurrency 3. Isolation runs_phase2/results_phase2.");

  const first = inspectKey();
  let keyInfo = first.ok
    ? ((process.env.OPENAI_API_KEY = first.key), { ok: true, polls: 1, elapsedMs: 0 })
    : await pollForKey();

  if (!keyInfo.ok) {
    writeWaiting(keyInfo.polls, keyInfo.elapsedMs);
    writeStatus({
      phase: "ABORT waiting for key",
      keyFound: false,
      note: `Polled ${keyInfo.polls} times over ${keyInfo.elapsedMs}ms. Wrote \`${path.relative(ROOT, WAITING_MD)}\`. Master will relaunch.`,
    });
    appendLog(
      `T2c_H ABORT waiting for OPENAI_API_KEY. polls=${keyInfo.polls} elapsedMs=${keyInfo.elapsedMs}. completed=0 failed=0 remaining=96. Wrote runs_phase2/_blockers/T2c_H_waiting.md.`
    );
    orch("EXIT waiting for key");
    process.exit(0);
  }

  if (fs.existsSync(WAITING_MD)) {
    try {
      fs.unlinkSync(WAITING_MD);
    } catch {
      /* ignore */
    }
  }

  process.env.DRY_RUN = "";
  const campaign = emptyCampaign();
  campaign.keyFound = true;
  campaign.keyPolls = keyInfo.polls;
  writeCampaign(campaign);
  writeStatus({ phase: "key present; probing continuous cell", keyFound: true, campaign });

  orch("PROBE continuous 2-node cell");
  appendLog("T2c_H probe start (continuous, 2 nodes, 1 tick, scopex_2017)");
  const probeRel = writeProbeConfig();
  const probeResult = await runCli(probeRel, "probe_p2_continuous", {
    stallMs: 10 * 60 * 1000,
    hardMs: 4 * 60 * 1000,
  });
  const probeDir = latestRunDir("probe_p2_continuous");
  const probeMeta = readMeta(probeDir);
  const probeCalls = usageCalls(probeMeta, probeResult.stdout);
  const probeFailed = probeFailedFrom(probeResult, probeCalls);
  campaign.probe = {
    failed: probeFailed,
    usageCalls: probeCalls,
    usageLine: extractUsageLine(probeResult.stdout),
    elapsedMs: probeResult.elapsedMs,
    status: probeResult.status,
    runDir: probeDir,
    at: nowIso(),
  };
  writeCampaign(campaign);
  appendLog(
    `T2c_H PROBE continuous status=${probeResult.status} failed=${probeFailed} usageCalls=${probeCalls} usage=${campaign.probe.usageLine || "n/a"} elapsedMs=${probeResult.elapsedMs}`
  );
  writeStatus({ phase: probeFailed ? "probe failed" : "probe passed; running all 96", keyFound: true, campaign, probe: campaign.probe });

  if (probeFailed) {
    appendLog("T2c_H ABORT probe usage was not > 0 or API failed. Refusing to invent MI. remaining=96.");
    orch("EXIT probe failed");
    process.exit(2);
  }

  orch("GRID all 96 T2c_H configs concurrency=3 across 8 topologies");
  appendLog(`T2c_H GRID n=96 concurrency=${CONCURRENCY} topologies=${TOPO_ORDER.join(",")}`);
  await runPool(items, campaign);

  const nRows = writeT2cHRows(items);
  campaign.finishedAt = nowIso();
  const finalCounts = countsFrom(items, campaign);
  campaign.counts = {
    completed: finalCounts.completed,
    failed: finalCounts.failed,
    skipped: finalCounts.skipped,
    remaining: finalCounts.remaining,
    attempted: finalCounts.attempted,
  };
  writeCampaign(campaign);
  writeStatus({
    phase: "grid finished",
    keyFound: true,
    campaign,
    note: `T2c_H_rows.csv data rows=${nRows} (real events only). Did not run parse_phase2.js (avoids rewriting shared CSVs).`,
  });
  appendLog(
    `T2c_H GRID finished completed=${finalCounts.completed} failed=${finalCounts.failed} skipped=${finalCounts.skipped} remaining=${finalCounts.remaining} attempted=${finalCounts.attempted}`
  );
  orch(
    `DONE key=yes completed=${finalCounts.completed} failed=${finalCounts.failed} remaining=${finalCounts.remaining}`
  );
  process.exit(finalCounts.failed ? 1 : 0);
}

main().catch((err) => {
  orch(`FATAL ${err && err.stack ? err.stack : err}`);
  try {
    appendLog(`T2c_H FATAL ${err.message}`);
  } catch {
    /* ignore */
  }
  process.exit(1);
});
