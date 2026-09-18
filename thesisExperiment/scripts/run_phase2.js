#!/usr/bin/env node
/**
 * Isolated Phase 2 runner.
 *   node thesisExperiment/scripts/run_phase2.js --probe-only
 *   node thesisExperiment/scripts/run_phase2.js --phase TH --concurrency 2
 *   node thesisExperiment/scripts/run_phase2.js --phase all
 *
 * Writes only to runs_phase2 / results_phase2. Refuses dry-run numbers as thesis.
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const GRID = JSON.parse(fs.readFileSync(path.join(EXP, "configs", "grid_phase2.json"), "utf8"));
const LOG_MD = path.join(EXP, "LOG.md");
const LOG_DIR = path.join(EXP, "results_phase2", "logs");
const MANIFEST = path.join(EXP, "results_phase2", "phase2_manifest.json");
const RUNS = path.join(EXP, "runs_phase2");

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(RUNS, { recursive: true });

function parseArgs(argv) {
  const phaseIdx = argv.indexOf("--phase");
  const concIdx = argv.indexOf("--concurrency");
  return {
    probeOnly: argv.includes("--probe-only"),
    phase: phaseIdx !== -1 ? argv[phaseIdx + 1] : "all",
    concurrency: Math.max(1, Number(concIdx !== -1 ? argv[concIdx + 1] : 2) || 2),
    force: argv.includes("--force"),
    allowDry: argv.includes("--allow-dry-plumbing"),
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
    return { startedAt: new Date().toISOString(), mode: "real", model: "gpt-4o-mini", probe: null, runs: [] };
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
  const done = /\[Simulation\] Done/.test(blob);
  return openaiAuthFail || !done;
}

function writeProbeConfig(mode, name) {
  const probeConfig = {
    experimentName: name,
    personasPath: "thesisExperiment/personas/phase2/homo/conspiracy_believer.json",
    articlesPath: "thesisExperiment/articles/merged.json",
    outputRoot: "thesisExperiment/runs_phase2",
    topology: "linear_chain",
    topologyParams: { numNodes: 2 },
    maxTicks: 1,
    defaultModel: "gpt-4o-mini",
    auditorModel: "gpt-4o-mini",
    miScoringMode: mode,
    seedArticles: ["scopex_2017"],
    seedNodes: ["node_0"],
    graphRandomSeed: 42,
    nodeParams: {
      maxHops: 1,
      maxInboxSize: 4,
      actionWeights: { forward: 0.2, reinterpret: 0.8, drop: 0.0 },
    },
  };
  const tmp = path.join(EXP, "configs", "phase2", `_${name}.json`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(probeConfig, null, 2));
  return path.relative(ROOT, tmp).replace(/\\/g, "/");
}

async function runOne(rel, timeouts) {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
  const result = await runCli(rel, [], cfg.experimentName, timeouts);
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
        appendLog(`SKIP complete ${cfg.experimentName}`);
        continue;
      }
      appendLog(`START ${cfg.experimentName} config=${rel}`);
      const row = await runOne(rel, timeouts);
      campaign.runs.push(row);
      writeManifest(campaign);
      appendLog(
        `END ${row.experimentName} status=${row.status} elapsedMs=${row.elapsedMs} runDir=${row.runDir} usage=${row.usageLine || "n/a"} killedFor=${row.killedFor || "none"} done=${row.done}`
      );
    }
  };
  for (let i = 0; i < concurrency; i++) workers.push(runNext());
  await Promise.all(workers);
}

function parseAfter(label) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["thesisExperiment/scripts/parse_phase2.js"], {
      cwd: ROOT,
      stdio: "inherit",
    });
    child.on("close", (code) => {
      appendLog(`PARSE_PHASE2 after ${label} exit=${code}`);
      resolve(code);
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const campaign = readManifest();
  campaign.lastCommand = process.argv.slice(2).join(" ");

  const probes = {};
  for (const mode of ["continuous", "dual"]) {
    console.log(`=== Phase2 probe ${mode} ===`);
    const rel = writeProbeConfig(mode, `probe_p2_${mode}`);
    const probe = await runCli(rel, [], `probe_p2_${mode}`, {
      stallMs: 10 * 60 * 1000,
      hardMs: 4 * 60 * 1000,
    });
    const failed = probeFailedFrom(probe);
    probes[mode] = {
      status: probe.status,
      elapsedMs: probe.elapsedMs,
      failed,
      usageLine: extractUsage(probe.stdout),
      at: new Date().toISOString(),
    };
    appendLog(`PROBE_P2 ${mode} status=${probe.status} failed=${failed} elapsedMs=${probe.elapsedMs} usage=${probes[mode].usageLine || "n/a"}`);
    console.log(`Probe ${mode} exit=${probe.status} failed=${failed}`);
  }
  campaign.probe = probes;
  writeManifest(campaign);

  if (args.probeOnly) {
    process.exit(probes.continuous.failed || probes.dual.failed ? 2 : 0);
  }
  if (probes.continuous.failed || probes.dual.failed) {
    if (!args.allowDry) {
      appendLog("ABORT_P2 real_api_unavailable — refusing to invent Phase 2 MI/MPR.");
      campaign.aborted = "real_api_unavailable";
      writeManifest(campaign);
      process.exit(2);
    }
    console.warn("[phase2] --allow-dry-plumbing: continuing without treating numbers as thesis.");
  }

  const to = { stallMs: 25 * 60 * 1000, hardMs: 70 * 60 * 1000 };
  const want = args.phase;
  const runPhase = async (name, rels, conc) => {
    if (want !== "all" && want !== name) return;
    appendLog(`PHASE_P2 ${name} n=${rels.length} concurrency=${conc}`);
    await runPool(rels, conc, to, campaign, args.force);
    await parseAfter(name);
  };

  await runPhase("TH", GRID.experimentTH, args.concurrency);
  await runPhase("THe", GRID.experimentTHe, args.concurrency);

  campaign.finishedAt = new Date().toISOString();
  writeManifest(campaign);
  appendLog(`CAMPAIGN_P2 finished phase=${want}`);
  const failed = campaign.runs.filter((r) => r.status !== 0 && !r.skipped).length;
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  appendLog(`FATAL_P2 ${err.message}`);
  process.exit(1);
});
