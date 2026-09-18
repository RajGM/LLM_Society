#!/usr/bin/env node
/**
 * Isolated D-net runner (does not wait on T-H / T-He).
 *
 *   node thesisExperiment/scripts/run_dnet.js
 *   node thesisExperiment/scripts/run_dnet.js --probe-only
 *   node thesisExperiment/scripts/run_dnet.js --concurrency 2
 *
 * Probe: tiny custom-graph cell.
 * Then all configs/phase2/Dnet_*.json (not _probe). Real API, no dry-run.
 * Writes only runs_phase2 / results_phase2. Refuses invented MI/MPR.
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const CFG_DIR = path.join(EXP, "configs", "phase2");
const LOG_MD = path.join(EXP, "LOG.md");
const LOG_DIR = path.join(EXP, "results_phase2", "logs");
const MANIFEST = path.join(EXP, "results_phase2", "dnet_manifest.json");
const RUNS = path.join(EXP, "runs_phase2");
const INDEX = path.join(CFG_DIR, "Dnet_index.json");
const PROBE_REL = "thesisExperiment/configs/phase2/_probe_dnet_custom.json";

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(RUNS, { recursive: true });

function parseArgs(argv) {
  const concIdx = argv.indexOf("--concurrency");
  return {
    probeOnly: argv.includes("--probe-only"),
    skipProbe: argv.includes("--skip-probe"),
    concurrency: Math.max(1, Number(concIdx !== -1 ? argv[concIdx + 1] : 2) || 2),
    force: argv.includes("--force"),
  };
}

function appendLog(text) {
  const stamp = new Date().toISOString();
  fs.appendFileSync(LOG_MD, `\n## ${stamp}\n\n${text.trim()}\n\n---\n`);
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
    if (expectedCfg.miScoringMode && meta.config && meta.config.miScoringMode !== expectedCfg.miScoringMode) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function readManifest() {
  if (!fs.existsSync(MANIFEST)) {
    return {
      startedAt: new Date().toISOString(),
      mode: "real",
      model: "gpt-4o-mini",
      probe: null,
      runs: [],
    };
  }
  return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
}

function writeManifest(campaign) {
  fs.writeFileSync(MANIFEST, JSON.stringify(campaign, null, 2));
}

function extractUsage(stdout) {
  const m = (stdout || "").match(/LLM usage: ([^\n]+)/);
  return m ? m[1].trim() : null;
}

function listDnetConfigs() {
  const fromIndex = [];
  if (fs.existsSync(INDEX)) {
    try {
      const idx = JSON.parse(fs.readFileSync(INDEX, "utf8"));
      for (const row of idx.configs || []) {
        if (row.file && fs.existsSync(path.join(ROOT, row.file))) fromIndex.push(row.file.replace(/\\/g, "/"));
      }
    } catch {
      /* fall through to glob */
    }
  }
  if (fromIndex.length) return fromIndex;
  return fs
    .readdirSync(CFG_DIR)
    .filter((f) => /^Dnet_/.test(f) && f.endsWith(".json") && f !== "Dnet_index.json")
    .sort()
    .map((f) => `thesisExperiment/configs/phase2/${f}`);
}

function runCli(configRel, logName, { stallMs, hardMs }) {
  const args = ["index.js", "--config", configRel];
  console.log(`\n$ node ${args.join(" ")}`);
  const logPath = path.join(LOG_DIR, `${logName || "dnet"}.log`);
  const log = fs.createWriteStream(logPath, { flags: "a" });
  log.write(`\n=== ${new Date().toISOString()}  node ${args.join(" ")}\n`);

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

function probeFailedFrom(result) {
  const blob = `${result.stderr || ""}\n${result.stdout || ""}`;
  if (result.status !== 0 || result.signal != null) return true;
  const openaiAuthFail =
    /OPENAI_API_KEY looks like a placeholder|Env var OPENAI_API_KEY not set|HTTP 401:|HTTP 403:|not set/i.test(blob);
  const llmError = /LLM error during/i.test(blob);
  const done = /\[Simulation\] Done/.test(blob);
  return openaiAuthFail || llmError || !done;
}

async function runOne(rel, timeouts) {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
  const result = await runCli(rel, cfg.experimentName, timeouts);
  return {
    config: rel,
    experimentName: cfg.experimentName,
    status: result.status,
    signal: result.signal,
    killedFor: result.killedFor,
    elapsedMs: result.elapsedMs,
    runDir: latestRunDir(cfg.experimentName),
    error: result.error,
    usageLine: extractUsage(result.stdout),
    logPath: result.logPath,
    done: /\[Simulation\] Done/.test(result.stdout || ""),
    failed: probeFailedFrom(result),
    miScoringMode: cfg.miScoringMode,
  };
}

async function runPool(rels, concurrency, timeouts, campaign, force) {
  const queue = [...rels];
  const workers = [];
  const runNext = async () => {
    while (queue.length) {
      const rel = queue.shift();
      const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
      if (!force && isComplete(cfg.experimentName, cfg)) {
        const skip = {
          config: rel,
          experimentName: cfg.experimentName,
          status: 0,
          skipped: true,
          runDir: latestRunDir(cfg.experimentName),
        };
        campaign.runs.push(skip);
        writeManifest(campaign);
        appendLog(`SKIP complete ${cfg.experimentName} (${skip.runDir})`);
        console.log(`SKIP complete ${cfg.experimentName}`);
        continue;
      }
      appendLog(`START ${cfg.experimentName} config=${rel}`);
      const row = await runOne(rel, timeouts);
      campaign.runs.push(row);
      writeManifest(campaign);
      appendLog(
        `END ${row.experimentName} status=${row.status} elapsedMs=${row.elapsedMs} runDir=${row.runDir} usage=${row.usageLine || "n/a"} killedFor=${row.killedFor || "none"} done=${row.done} failed=${row.failed}`
      );
    }
  };
  for (let i = 0; i < concurrency; i++) workers.push(runNext());
  await Promise.all(workers);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const campaign = readManifest();
  campaign.lastCommand = process.argv.slice(2).join(" ");
  campaign.mode = "real";
  writeManifest(campaign);

  if (!args.skipProbe) {
    console.log("=== Dnet tiny custom-graph probe ===");
    const probe = await runCli(PROBE_REL, "probe_dnet_custom", {
      stallMs: 10 * 60 * 1000,
      hardMs: 6 * 60 * 1000,
    });
    const failed = probeFailedFrom(probe);
    campaign.probe = {
      status: probe.status,
      elapsedMs: probe.elapsedMs,
      failed,
      usageLine: extractUsage(probe.stdout),
      at: new Date().toISOString(),
      runDir: latestRunDir("probe_dnet_custom"),
    };
    writeManifest(campaign);
    appendLog(
      `PROBE_DNET custom status=${probe.status} failed=${failed} elapsedMs=${probe.elapsedMs} usage=${campaign.probe.usageLine || "n/a"}`
    );
    console.log(`Probe exit=${probe.status} failed=${failed}`);
    if (failed) {
      appendLog("ABORT_DNET real_api_unavailable — refusing to invent D-net MI/MPR.");
      campaign.aborted = "real_api_unavailable";
      writeManifest(campaign);
      process.exit(2);
    }
  }

  if (args.probeOnly) {
    process.exit(0);
  }

  const rels = listDnetConfigs();
  if (!rels.length) {
    appendLog("ABORT_DNET no Dnet_ configs found");
    campaign.aborted = "no_dnet_configs";
    writeManifest(campaign);
    process.exit(2);
  }

  appendLog(`PHASE_DNET n=${rels.length} concurrency=${args.concurrency}`);
  // 63-node custom graph × 2 articles × 8 ticks; dual has extra auditor calls.
  const timeouts = { stallMs: 45 * 60 * 1000, hardMs: 150 * 60 * 1000 };
  await runPool(rels, args.concurrency, timeouts, campaign, args.force);

  campaign.finishedAt = new Date().toISOString();
  writeManifest(campaign);
  appendLog(`CAMPAIGN_DNET finished n=${campaign.runs.length}`);
  const failed = campaign.runs.filter((r) => !r.skipped && (r.status !== 0 || r.failed)).length;
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  appendLog(`FATAL_DNET ${err.message}`);
  process.exit(1);
});
