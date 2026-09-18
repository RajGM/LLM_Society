#!/usr/bin/env node
/**
 * Run thesis Experiment A (then B, then optional extra) via the existing CLI.
 * Usage:
 *   node thesisExperiment/scripts/run_campaign.js --dry-run
 *   node thesisExperiment/scripts/run_campaign.js --probe-only
 *   node thesisExperiment/scripts/run_campaign.js --real
 *   node thesisExperiment/scripts/run_campaign.js --real --skip-b
 *   node thesisExperiment/scripts/run_campaign.js --real --skip-extra
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const GRID = JSON.parse(fs.readFileSync(path.join(EXP, "configs", "grid.json"), "utf8"));
const LOG_DIR = path.join(EXP, "results", "logs");
fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(path.join(EXP, "results"), { recursive: true });

function parseArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run"),
    real: argv.includes("--real"),
    probeOnly: argv.includes("--probe-only"),
    includeB: !argv.includes("--skip-b"),
    includeExtra: !argv.includes("--skip-extra"),
  };
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

function runCli(configRel, extraArgs, timeoutMs, logName) {
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
    const onOut = (buf) => {
      const s = buf.toString("utf8");
      stdout += s;
      process.stdout.write(s);
      log.write(s);
    };
    const onErr = (buf) => {
      const s = buf.toString("utf8");
      stderr += s;
      process.stderr.write(s);
      log.write(s);
    };
    child.stdout.on("data", onOut);
    child.stderr.on("data", onErr);

    const killer = setTimeout(() => {
      console.warn(`\n[campaign] timeout ${timeoutMs}ms — killing ${configRel}`);
      child.kill("SIGTERM");
      setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch {
          /* ignore */
        }
      }, 5000);
    }, timeoutMs);

    child.on("close", (status, signal) => {
      clearTimeout(killer);
      log.end();
      resolve({
        args,
        status,
        signal,
        error: null,
        stdout,
        stderr,
        elapsedMs: Date.now() - started,
        logPath: path.relative(ROOT, logPath),
      });
    });
    child.on("error", (err) => {
      clearTimeout(killer);
      log.end();
      resolve({
        args,
        status: 1,
        signal: null,
        error: err.message,
        stdout,
        stderr,
        elapsedMs: Date.now() - started,
        logPath: path.relative(ROOT, logPath),
      });
    });
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
    personasPath: "thesisExperiment/personas/homogeneous_conspiracy.json",
    articlesPath: "thesisExperiment/articles/articles.json",
    outputRoot: "thesisExperiment/runs",
    topology: "linear_chain",
    topologyParams: { numNodes: 2 },
    maxTicks: 1,
    defaultModel: "gpt-4o-mini",
    auditorModel: "gpt-4o-mini",
    seedArticles: ["scopex_2017"],
    seedNodes: ["node_0"],
    nodeParams: { maxHops: 1, maxInboxSize: 4, actionWeights: { forward: 0.2, reinterpret: 0.8, drop: 0.0 } },
  };
  const tmp = path.join(EXP, "configs", "_probe_api.json");
  fs.writeFileSync(tmp, JSON.stringify(probeConfig, null, 2));
  return runCli(path.relative(ROOT, tmp).replace(/\\/g, "/"), [], 120000, "probe_api");
}

function extractUsage(stdout) {
  const m = (stdout || "").match(/LLM usage: ([^\n]+)/);
  return m ? m[1].trim() : null;
}

async function runOne(rel, extra, timeoutMs) {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
  const result = await runCli(rel, extra, timeoutMs, cfg.experimentName);
  const runDir = latestRunDir(cfg.experimentName);
  return {
    config: rel,
    experimentName: cfg.experimentName,
    status: result.status,
    signal: result.signal,
    elapsedMs: result.elapsedMs,
    runDir,
    error: result.error,
    usageLine: extractUsage(result.stdout),
    logPath: result.logPath,
    stderrTail: (result.stderr || "").split(/\r?\n/).slice(-8).join("\n"),
    stdoutTail: (result.stdout || "").split(/\r?\n/).slice(-10).join("\n"),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.dryRun && !args.real && !args.probeOnly) {
    console.error("Pass --dry-run, --real, or --probe-only");
    process.exit(1);
  }

  const campaign = {
    startedAt: new Date().toISOString(),
    mode: args.probeOnly ? "probe" : args.real ? "real" : "dry-run",
    model: "gpt-4o-mini",
    probe: null,
    runs: [],
  };

  console.log("=== API probe (one real call, no --dry-run) ===");
  const probe = await probeRealApi();
  const probeFailed = probeFailedFrom(probe);
  campaign.probe = {
    status: probe.status,
    elapsedMs: probe.elapsedMs,
    failed: probeFailed,
    usageLine: extractUsage(probe.stdout),
    stderrTail: (probe.stderr || "").split(/\r?\n/).slice(-12).join("\n"),
    stdoutTail: (probe.stdout || "").split(/\r?\n/).slice(-12).join("\n"),
  };
  console.log(`Probe exit=${probe.status} failed=${probeFailed} elapsed=${probe.elapsedMs}ms`);

  fs.writeFileSync(path.join(EXP, "results", "campaign_manifest.json"), JSON.stringify(campaign, null, 2));

  if (args.probeOnly) {
    process.exit(probeFailed ? 2 : 0);
  }

  if (args.real && probeFailed) {
    console.warn("Real API probe failed. Refusing to invent LLM results. Use --dry-run for plumbing.");
    campaign.aborted = "real_api_unavailable";
    campaign.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(EXP, "results", "campaign_manifest.json"), JSON.stringify(campaign, null, 2));
    process.exit(2);
  }

  const extra = args.dryRun ? ["--dry-run"] : [];
  const timeoutA = 22 * 60 * 1000;

  for (const rel of GRID.experimentA) {
    const row = await runOne(rel, extra, timeoutA);
    campaign.runs.push(row);
    fs.writeFileSync(path.join(EXP, "results", "campaign_manifest.json"), JSON.stringify(campaign, null, 2));
    if (row.status !== 0) {
      console.warn(`Run failed: ${rel} exit=${row.status} signal=${row.signal}`);
    }
  }

  if (args.includeB) {
    for (const rel of GRID.experimentB || []) {
      const row = await runOne(rel, extra, timeoutA);
      campaign.runs.push(row);
      fs.writeFileSync(path.join(EXP, "results", "campaign_manifest.json"), JSON.stringify(campaign, null, 2));
    }
  }

  const aFailed = campaign.runs.filter((r) => r.experimentName.startsWith("A_") && r.status !== 0).length;
  if (args.includeExtra && aFailed === 0 && GRID.experimentExtra) {
    for (const rel of GRID.experimentExtra) {
      const row = await runOne(rel, extra, timeoutA);
      campaign.runs.push(row);
      fs.writeFileSync(path.join(EXP, "results", "campaign_manifest.json"), JSON.stringify(campaign, null, 2));
    }
  } else if (args.includeExtra && aFailed > 0) {
    console.warn("Skipping extra cells because an Experiment A cell failed.");
  }

  campaign.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(EXP, "results", "campaign_manifest.json"), JSON.stringify(campaign, null, 2));
  console.log(`\nManifest written: thesisExperiment/results/campaign_manifest.json`);
  const failed = campaign.runs.filter((r) => r.status !== 0).length;
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
