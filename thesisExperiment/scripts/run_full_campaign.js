#!/usr/bin/env node
/**
 * Full thesis campaign: probe, H, He, A, B, D.
 *   node thesisExperiment/scripts/run_full_campaign.js --probe-only
 *   node thesisExperiment/scripts/run_full_campaign.js --phase H
 *   node thesisExperiment/scripts/run_full_campaign.js --phase all --concurrency 2
 *
 * Real LLM only. Refuses if probe fails. Does not print API keys.
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const GRID = JSON.parse(fs.readFileSync(path.join(EXP, "configs", "grid_full.json"), "utf8"));
const LOG_MD = path.join(EXP, "LOG.md");
const LOG_DIR = path.join(EXP, "results", "logs");
const MANIFEST = path.join(EXP, "results", "full_campaign_manifest.json");

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(path.join(EXP, "results"), { recursive: true });

function parseArgs(argv) {
  const phaseIdx = argv.indexOf("--phase");
  const concIdx = argv.indexOf("--concurrency");
  return {
    probeOnly: argv.includes("--probe-only"),
    phase: phaseIdx !== -1 ? argv[phaseIdx + 1] : "all",
    concurrency: Math.max(1, Number(concIdx !== -1 ? argv[concIdx + 1] : 2) || 2),
    force: argv.includes("--force"),
  };
}

function appendLog(text) {
  const stamp = new Date().toISOString();
  const block = `\n## ${stamp}\n\n${text.trim()}\n\n---\n`;
  fs.appendFileSync(LOG_MD, block);
}

function latestRunDir(experimentName) {
  const runsRoot = path.join(EXP, "runs");
  if (!fs.existsSync(runsRoot)) return null;
  const dirs = fs
    .readdirSync(runsRoot)
    .filter((d) => d.startsWith(experimentName + "_"))
    .map((d) => ({ d, t: fs.statSync(path.join(runsRoot, d)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return dirs.length ? dirs[0].d : null;
}

function isComplete(experimentName, expectedCfg) {
  const d = latestRunDir(experimentName);
  if (!d) return false;
  const metaPath = path.join(EXP, "runs", d, "metadata.json");
  if (!fs.existsSync(metaPath)) return false;
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    const okStatus = meta.status === "completed" || meta.status === "complete";
    if (!okStatus) return false;
    if (!expectedCfg) return true;
    const got = ((meta.config && meta.config.seedArticles) || []).join("|");
    const want = (expectedCfg.seedArticles || []).join("|");
    if (want && got !== want) return false;
    const ticks = meta.config && meta.config.maxTicks;
    if (expectedCfg.maxTicks && ticks !== expectedCfg.maxTicks) return false;
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

function runCli(configRel, extraArgs, logName, { stallMs, hardMs }) {
  const args = ["index.js", "--config", configRel, ...extraArgs];
  console.log(`\n$ node ${args.join(" ")}`);
  const logPath = path.join(LOG_DIR, `${logName || "run"}.log`);
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
        console.warn(`\n[campaign] stall ${stallMs}ms — killing ${configRel}`);
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
      console.warn(`\n[campaign] hard timeout ${hardMs}ms — killing ${configRel}`);
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
    /OPENAI_API_KEY looks like a placeholder|Env var OPENAI_API_KEY not set|HTTP 401:|HTTP 403:/i.test(blob);
  const done = /\[Simulation\] Done/.test(blob);
  return openaiAuthFail || !done;
}

async function probeRealApi() {
  const probeConfig = {
    experimentName: "probe_api",
    personasPath: "thesisExperiment/personas/homo/conspiracy_believer.json",
    articlesPath: "thesisExperiment/articles/articles.json",
    outputRoot: "thesisExperiment/runs",
    topology: "linear_chain",
    topologyParams: { numNodes: 2 },
    maxTicks: 1,
    defaultModel: "gpt-4o-mini",
    auditorModel: "gpt-4o-mini",
    seedArticles: ["scopex_2017"],
    seedNodes: ["node_0"],
    nodeParams: {
      maxHops: 1,
      maxInboxSize: 4,
      actionWeights: { forward: 0.2, reinterpret: 0.8, drop: 0.0 },
    },
  };
  const tmp = path.join(EXP, "configs", "_probe_api.json");
  fs.writeFileSync(tmp, JSON.stringify(probeConfig, null, 2));
  return runCli(path.relative(ROOT, tmp).replace(/\\/g, "/"), [], "probe_api", {
    stallMs: 10 * 60 * 1000,
    hardMs: 3 * 60 * 1000,
  });
}

async function runOne(rel, timeouts) {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
  const result = await runCli(rel, [], cfg.experimentName, timeouts);
  const runDir = latestRunDir(cfg.experimentName);
  return {
    config: rel,
    experimentName: cfg.experimentName,
    status: result.status,
    signal: result.signal,
    killedFor: result.killedFor,
    elapsedMs: result.elapsedMs,
    runDir,
    error: result.error,
    usageLine: extractUsage(result.stdout),
    logPath: result.logPath,
    done: /\[Simulation\] Done/.test(result.stdout || ""),
    stderrTail: (result.stderr || "").split(/\r?\n/).slice(-8).join("\n"),
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
        console.log(`[campaign] skip complete ${cfg.experimentName}`);
        continue;
      }
      appendLog(`START ${cfg.experimentName} config=${rel}`);
      const row = await runOne(rel, timeouts);
      campaign.runs.push(row);
      writeManifest(campaign);
      appendLog(
        `END ${row.experimentName} status=${row.status} elapsedMs=${row.elapsedMs} runDir=${row.runDir} usage=${row.usageLine || "n/a"} killedFor=${row.killedFor || "none"} done=${row.done}`
      );
      if (row.status !== 0) {
        console.warn(`[campaign] failed ${rel} exit=${row.status} ${row.killedFor || ""}`);
      }
    }
  };
  for (let i = 0; i < concurrency; i++) workers.push(runNext());
  await Promise.all(workers);
}

function parseAfter(label) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["thesisExperiment/scripts/parse_results.js"], {
      cwd: ROOT,
      stdio: "inherit",
    });
    child.on("close", (code) => {
      appendLog(`PARSE after ${label} exit=${code}`);
      resolve(code);
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const campaign = readManifest();
  campaign.lastCommand = process.argv.slice(2).join(" ");

  console.log("=== API probe (real gpt-4o-mini, no dry-run) ===");
  const probe = await probeRealApi();
  const probeFailed = probeFailedFrom(probe);
  campaign.probe = {
    status: probe.status,
    elapsedMs: probe.elapsedMs,
    failed: probeFailed,
    usageLine: extractUsage(probe.stdout),
    at: new Date().toISOString(),
  };
  writeManifest(campaign);
  appendLog(`PROBE status=${probe.status} failed=${probeFailed} elapsedMs=${probe.elapsedMs} usage=${campaign.probe.usageLine || "n/a"}`);
  console.log(`Probe exit=${probe.status} failed=${probeFailed} elapsed=${probe.elapsedMs}ms`);

  if (args.probeOnly) process.exit(probeFailed ? 2 : 0);
  if (probeFailed) {
    appendLog("ABORT real_api_unavailable — refusing to invent results.");
    campaign.aborted = "real_api_unavailable";
    writeManifest(campaign);
    process.exit(2);
  }

  const chainTO = { stallMs: 25 * 60 * 1000, hardMs: 45 * 60 * 1000 };
  const graphTO = { stallMs: 25 * 60 * 1000, hardMs: 70 * 60 * 1000 };

  const want = args.phase;
  const runPhase = async (name, rels, conc, to) => {
    if (want !== "all" && want !== name) return;
    appendLog(`PHASE ${name} n=${rels.length} concurrency=${conc}`);
    await runPool(rels, conc, to, campaign, args.force);
    await parseAfter(name);
  };

  await runPhase("H", GRID.experimentH, args.concurrency, chainTO);
  await runPhase("He", GRID.experimentHe, args.concurrency, chainTO);
  await runPhase("A", GRID.experimentA, Math.min(2, args.concurrency), graphTO);
  await runPhase("B", GRID.experimentB, 1, graphTO);
  await runPhase("D", GRID.experimentD, 1, graphTO);

  campaign.finishedAt = new Date().toISOString();
  writeManifest(campaign);
  appendLog(`CAMPAIGN command finished phase=${want}`);
  const failed = campaign.runs.filter((r) => r.status !== 0 && !r.skipped).length;
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  appendLog(`FATAL ${err.message}`);
  process.exit(1);
});
