#!/usr/bin/env node
/**
 * Phase 2 continuation master: inventory + gap-fill only.
 * Does not start a second full overlapping grid while slice workers are healthy.
 * Never prints OPENAI_API_KEY. Never dry-run. Never invents MI.
 */
const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");

const ROOT = path.join(__dirname, "..", "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const CFG_DIR = path.join(EXP, "configs", "phase2");
const RUNS = path.join(EXP, "runs_phase2");
const RESULTS = path.join(EXP, "results_phase2");
const STATUS = path.join(RUNS, "_status", "MASTER.md");
const SNAP = path.join(RUNS, "_status", "MASTER_snap.json");
const DONE = path.join(RUNS, "_status", "MASTER_DONE.json");
const LOG_MD = path.join(EXP, "LOG.md");

const TOPOLOGIES = [
  "linear_chain",
  "ring",
  "random_er",
  "small_world",
  "scale_free",
  "echo_chamber",
  "polarized",
  "hierarchical",
];
const SLICES = ["T2c_H", "T2d_H", "T2c_He", "T2d_He"];
const DNET = ["Dnet_c_H_conspiracy", "Dnet_c_He_mixed", "Dnet_d_H_conspiracy", "Dnet_d_He_mixed"];
function lineCoversSlice(line, slice) {
  const sliceFlag = new RegExp(`--slice\\s+${slice}(?:\\s|$)`);
  if (line.includes("run_phase2.js") && sliceFlag.test(line)) return true;
  if (slice === "T2c_H" && /run_t2c_h\.js/.test(line) && !/run_t2c_he\.js/.test(line)) return true;
  if (slice === "T2d_H" && /run_t2d_h\.js/.test(line) && !/run_t2d_he\.js/.test(line)) return true;
  if (slice === "T2c_He" && (/run_t2c_he\.js/.test(line) || /watch_t2c_he\.js/.test(line))) return true;
  if (slice === "T2d_He" && /run_t2d_he\.js/.test(line)) return true;
  return false;
}

function nowIso() {
  return new Date().toISOString();
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJSON(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

function appendLog(text) {
  fs.appendFileSync(LOG_MD, `\n## ${nowIso()}\n\n${text.trim()}\n\n---\n`);
}

function keyLength() {
  const v = process.env.OPENAI_API_KEY || "";
  if (v && v.length > 20 && !/your-key|changeme|placeholder/i.test(v)) return v.length;
  try {
    const envPath = path.join(ROOT, ".env");
    if (!fs.existsSync(envPath)) return 0;
    const raw = fs.readFileSync(envPath, "utf8");
    const m = raw.match(/^\s*OPENAI_API_KEY\s*=\s*(?:["']?)(.+?)(?:["']?)\s*$/m);
    if (!m) return 0;
    const val = m[1].trim();
    if (!val || /your-key|changeme|placeholder/i.test(val)) return 0;
    if (!process.env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = val;
    return val.length;
  } catch {
    return 0;
  }
}

function pgrep(pattern) {
  try {
    const out = execSync(`pgrep -af ${JSON.stringify(pattern)}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.includes("_continue_master") && !l.includes("pgrep"));
  } catch {
    return [];
  }
}

function latestRunDir(experimentName) {
  if (!fs.existsSync(RUNS)) return null;
  const dirs = fs
    .readdirSync(RUNS)
    .filter((d) => d.startsWith(experimentName + "_") && fs.existsSync(path.join(RUNS, d, "metadata.json")))
    .map((d) => {
      const p = path.join(RUNS, d);
      return { d, t: fs.statSync(p).mtimeMs, p };
    })
    .sort((a, b) => b.t - a.t);
  return dirs.length ? dirs[0] : null;
}

function usageCalls(meta) {
  return (meta && meta.llmUsage && meta.llmUsage.calls) || 0;
}

function classifyRun(experimentName, expectedCfg, liveCmdlines) {
  const latest = latestRunDir(experimentName);
  const cfgRel = `thesisExperiment/configs/phase2/${experimentName}.json`;
  const live = liveCmdlines.some((l) => l.includes(cfgRel) || l.includes(`${experimentName}.json`));
  if (!latest) {
    return { state: live ? "in_progress" : "not_started", runDir: null, usage: 0, status: null };
  }
  let meta = null;
  try {
    meta = readJSON(path.join(latest.p, "metadata.json"));
  } catch {
    return { state: live ? "in_progress" : "stale", runDir: latest.d, usage: 0, status: null };
  }
  const status = meta.status || null;
  const usage = usageCalls(meta);
  const okStatus = status === "completed" || status === "complete";
  let seedOk = true;
  let modeOk = true;
  if (expectedCfg) {
    const got = ((meta.config && meta.config.seedArticles) || []).join("|");
    const want = (expectedCfg.seedArticles || []).join("|");
    if (want && got !== want) seedOk = false;
    if (expectedCfg.miScoringMode && meta.config && meta.config.miScoringMode !== expectedCfg.miScoringMode) {
      modeOk = false;
    }
  }
  if (okStatus && usage > 0 && seedOk && modeOk) {
    return { state: "complete", runDir: latest.d, usage, status };
  }
  if (status === "failed") {
    return { state: "incomplete", runDir: latest.d, usage, status };
  }
  if (live) return { state: "in_progress", runDir: latest.d, usage, status };
  const ageMs = Date.now() - latest.t;
  if (!okStatus && ageMs < 40 * 60 * 1000) {
    return { state: "in_progress", runDir: latest.d, usage, status };
  }
  return { state: "incomplete", runDir: latest.d, usage, status };
}

function topologyOfName(name) {
  return TOPOLOGIES.find((t) => name.includes(`_${t}_`)) || null;
}

function sliceOfName(name) {
  return SLICES.find((s) => name.startsWith(s + "_")) || null;
}

function inventory() {
  const live = pgrep("index.js --config thesisExperiment/configs/phase2");
  const runnerLines = pgrep("node");
  const bySlice = {};
  for (const s of SLICES) {
    bySlice[s] = {
      configs: 0,
      complete: 0,
      in_progress: 0,
      incomplete: 0,
      not_started: 0,
      byTopo: {},
    };
    for (const t of TOPOLOGIES) {
      bySlice[s].byTopo[t] = { configs: 0, complete: 0, in_progress: 0, incomplete: 0, not_started: 0 };
    }
  }
  const files = fs.readdirSync(CFG_DIR).filter((f) => /^T2[cd]_/.test(f) && f.endsWith(".json") && !f.startsWith("_"));
  for (const f of files) {
    const cfg = readJSON(path.join(CFG_DIR, f));
    const name = cfg.experimentName || f.replace(/\.json$/, "");
    const slice = sliceOfName(name);
    const topo = topologyOfName(name);
    if (!slice || !topo) continue;
    const row = classifyRun(name, cfg, live);
    bySlice[slice].configs += 1;
    bySlice[slice][row.state === "stale" ? "incomplete" : row.state] += 1;
    bySlice[slice].byTopo[topo].configs += 1;
    bySlice[slice].byTopo[topo][row.state === "stale" ? "incomplete" : row.state] += 1;
  }
  const dnet = DNET.map((name) => {
    const file = path.join(CFG_DIR, `${name}.json`);
    const cfg = fs.existsSync(file) ? readJSON(file) : null;
    const row = classifyRun(name, cfg, live);
    return { name, ...row };
  });
  const workers = {};
  for (const s of SLICES) {
    const lines = runnerLines.filter((l) => lineCoversSlice(l, s));
    workers[s] = lines.length ? [{ pat: s, lines }] : [];
  }
  workers.dnet = runnerLines.filter((l) => l.includes("run_dnet.js") || l.includes("_dnet_supervise"));
  workers.master = runnerLines.filter((l) => l.includes("master_phase2.js") && !l.includes("_continue"));
  let simPending = true;
  const comparePath = path.join(RESULTS, "debnath_compare.json");
  if (fs.existsSync(comparePath)) {
    try {
      simPending = !!readJSON(comparePath).simPending;
    } catch {
      /* ignore */
    }
  }
  return { at: nowIso(), bySlice, dnet, workers, simPending, liveIndex: live.length, keyLength: keyLength() };
}

function formatMaster(inv, notes) {
  const totC = SLICES.reduce((a, s) => a + inv.bySlice[s].complete, 0);
  const totCfg = SLICES.reduce((a, s) => a + inv.bySlice[s].configs, 0);
  const totProg = SLICES.reduce((a, s) => a + inv.bySlice[s].in_progress, 0);
  const sliceLines = SLICES.map((s) => {
    const r = inv.bySlice[s];
    return `| ${s} | ${r.configs} | ${r.complete} | ${r.in_progress} | ${r.incomplete} | ${r.not_started} | ${r.complete * 6}/${r.configs * 6} |`;
  });
  const topoHeader = `| topology | ${SLICES.map((s) => `${s} done/n`).join(" | ")} |`;
  const topoSep = `| --- | ${SLICES.map(() => "---:").join(" | ")} |`;
  const topoLines = TOPOLOGIES.map((t) => {
    const cells = SLICES.map((s) => {
      const r = inv.bySlice[s].byTopo[t];
      return `${r.complete}/${r.configs}`;
    });
    return `| ${t} | ${cells.join(" | ")} |`;
  });
  const dnetLine = inv.dnet
    .map((d) => `- \`${d.name}\`: ${d.state} usage=${d.usage} (${d.runDir || "no run dir"})`)
    .join("\n");
  const workerLine = SLICES.map((s) => {
    const alive = (inv.workers[s] || []).length;
    return `${s}=${alive ? "alive" : "none"}`;
  }).join(" ");
  return `# Phase 2 MASTER status

**Updated.** ${inv.at}
**OPENAI_API_KEY found.** ${inv.keyLength > 20 ? `yes (length=${inv.keyLength})` : "no"}
**Dry-run.** no. **MI invented.** no.
**Isolation.** \`runs_phase2/\` + \`results_phase2/\` only. Did not write Phase 1 \`runs/\` or \`results/tables/\`.

## Grid (288 configs / 1728 cells)

| slice | configs | complete | in_progress | incomplete | not_started | cells (×6) |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${sliceLines.join("\n")}
| **grid** | **${totCfg}** | **${totC}** | **${totProg}** |  |  | **${totC * 6}/${totCfg * 6}** |

## Per topology (complete/n)

${topoHeader}
${topoSep}
${topoLines.join("\n")}

## D-net

${dnetLine}

Dnet complete: **${inv.dnet.filter((d) => d.state === "complete").length}/4**
live index.js: ${inv.liveIndex}

## Compare

\`simPending\` = **${inv.simPending}**

## Workers

${workerLine} dnet=${inv.workers.dnet.length ? "alive" : "none"} master_phase2=${inv.workers.master.length ? "alive" : "none"}

## Notes

${notes || "- continuation master watching; gap-fill only"}

Sibling slice agents may also write \`runs_phase2\`. This master skips completed cells and does not kill other node processes.
`;
}

function sliceWorkerHealthy(inv, slice) {
  return (inv.workers[slice] || []).length > 0;
}

function topologyStarted(inv, slice, topo) {
  const r = inv.bySlice[slice].byTopo[topo];
  return r.complete + r.in_progress + r.incomplete > 0;
}

function topologyFinished(inv, slice, topo) {
  const r = inv.bySlice[slice].byTopo[topo];
  return r.configs > 0 && r.complete === r.configs;
}

function nextUnfinished(inv, slice) {
  for (const t of TOPOLOGIES) {
    if (!topologyFinished(inv, slice, t)) return t;
  }
  return null;
}

function launchedPidPath(slice, topo) {
  return path.join(RESULTS, "logs", `_gap_${slice}_${topo}.pid`);
}

function gapLaunchActive(slice, topo) {
  const p = launchedPidPath(slice, topo);
  if (!fs.existsSync(p)) return false;
  try {
    const pid = Number(fs.readFileSync(p, "utf8").trim());
    if (!pid) return false;
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function launchTopo(slice, topo) {
  if (gapLaunchActive(slice, topo)) return { skipped: true, reason: "gap worker already pid-alive" };
  const manifest = path.join(RESULTS, `manifest_${slice}_${topo}.json`);
  const logPath = path.join(RESULTS, "logs", `gap_${slice}_${topo}.log`);
  const args = [
    path.join(EXP, "scripts", "run_phase2.js"),
    "--skip-probe",
    "--no-parse",
    "--phase",
    "all",
    "--slice",
    slice,
    "--topology",
    topo,
    "--concurrency",
    "4",
    "--manifest",
    path.relative(ROOT, manifest),
  ];
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const log = fs.openSync(logPath, "a");
  const child = spawn(process.execPath, args, {
    cwd: ROOT,
    env: process.env,
    stdio: ["ignore", log, log],
    detached: true,
  });
  child.unref();
  fs.writeFileSync(launchedPidPath(slice, topo), String(child.pid));
  appendLog(`CONTINUE_MASTER gap-launch slice=${slice} topology=${topo} pid=${child.pid} concurrency=4`);
  return { launched: true, pid: child.pid, slice, topo };
}

function launchDnet() {
  const live = pgrep("run_dnet.js");
  if (live.length) return { skipped: true, reason: "run_dnet already alive" };
  const logPath = path.join(RESULTS, "logs", "gap_dnet.log");
  const log = fs.openSync(logPath, "a");
  const child = spawn(process.execPath, [path.join(EXP, "scripts", "run_dnet.js"), "--skip-probe", "--concurrency", "2"], {
    cwd: ROOT,
    env: process.env,
    stdio: ["ignore", log, log],
    detached: true,
  });
  child.unref();
  appendLog(`CONTINUE_MASTER relaunch run_dnet.js pid=${child.pid}`);
  return { launched: true, pid: child.pid };
}

function runNode(args, logName) {
  const logPath = path.join(RESULTS, "logs", `${logName}.log`);
  const log = fs.createWriteStream(logPath, { flags: "a" });
  log.write(`\n=== ${nowIso()}  node ${args.join(" ")}\n`);
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    child.stdout.on("data", (b) => {
      const s = b.toString("utf8");
      process.stdout.write(s);
      log.write(s);
    });
    child.stderr.on("data", (b) => {
      const s = b.toString("utf8");
      process.stderr.write(s);
      log.write(s);
    });
    child.on("close", (status) => {
      log.end();
      resolve({ status });
    });
    child.on("error", (err) => {
      log.end();
      resolve({ status: 1, error: String(err) });
    });
  });
}

function sliceHasFullGridWorker(inv, slice) {
  const lines = ((inv.workers[slice] || [])[0] || {}).lines || [];
  const sliceFlag = new RegExp(`--slice\\s+${slice}(?:\\s|$)`);
  return lines.some((l) => l.includes("run_phase2.js") && sliceFlag.test(l) && !l.includes("--topology"));
}

function fillGaps(inv) {
  const actions = [];
  for (const slice of SLICES) {
    const next = nextUnfinished(inv, slice);
    if (!next) continue;
    const healthy = sliceWorkerHealthy(inv, slice);
    const fullGrid = sliceHasFullGridWorker(inv, slice);
    const finishedPrev = TOPOLOGIES.slice(0, TOPOLOGIES.indexOf(next)).every((t) => topologyFinished(inv, slice, t));
    const nextStarted = topologyStarted(inv, slice, next);
    if (fullGrid) continue;
    if (healthy && (nextStarted || !finishedPrev)) continue;
    if (!healthy || (finishedPrev && !nextStarted)) {
      actions.push(launchTopo(slice, next));
    }
  }
  const dnetLeft = inv.dnet.filter((d) => d.state !== "complete");
  const dnetLive = inv.dnet.some((d) => d.state === "in_progress") || (inv.workers.dnet || []).length > 0;
  if (dnetLeft.length && !dnetLive) {
    actions.push(launchDnet());
  }
  return actions;
}

function gridDone(inv) {
  return SLICES.every((s) => inv.bySlice[s].complete === inv.bySlice[s].configs);
}

function dnetDone(inv) {
  return inv.dnet.every((d) => d.state === "complete");
}

async function finishPipeline() {
  const parse = await runNode(["thesisExperiment/scripts/parse_phase2.js"], "continue_parse");
  appendLog(`CONTINUE_MASTER parse_phase2 exit=${parse.status}`);
  const cmp = await runNode(["thesisExperiment/scripts/compare_phase2.js"], "continue_compare");
  appendLog(`CONTINUE_MASTER compare_phase2 exit=${cmp.status}`);
  return { parse, cmp };
}

async function main() {
  const once = process.argv.includes("--once");
  const intervalMs = 150000;
  let lastComplete = -1;
  for (;;) {
    const inv = inventory();
    const totC = SLICES.reduce((a, s) => a + inv.bySlice[s].complete, 0);
    const actions = fillGaps(inv);
    const notes = [
      `- continuation master loop. complete=${totC}/288 in_progress=${SLICES.reduce((a, s) => a + inv.bySlice[s].in_progress, 0)}`,
      `- gap actions this tick: ${actions.length ? JSON.stringify(actions) : "none (workers healthy or no gap)"}`,
      "- no overlapping full grid. no dry-run. no invented MI.",
    ].join("\n");
    fs.mkdirSync(path.dirname(STATUS), { recursive: true });
    fs.writeFileSync(STATUS, formatMaster(inv, notes));
    writeJSON(SNAP, { ...inv, actions });
    if (totC !== lastComplete) {
      appendLog(`CONTINUE_MASTER progress complete=${totC}/288 dnet=${inv.dnet.filter((d) => d.state === "complete").length}/4`);
      lastComplete = totC;
    }
    console.log(
      `${inv.at} complete=${totC}/288 dnet=${inv.dnet.filter((d) => d.state === "complete").length}/4 simPending=${inv.simPending} actions=${actions.length}`
    );
    if (gridDone(inv) && dnetDone(inv)) {
      const pipe = await finishPipeline();
      const after = inventory();
      fs.writeFileSync(
        STATUS,
        formatMaster(after, `- parse+compare done. parse=${pipe.parse.status} compare=${pipe.cmp.status} simPending=${after.simPending}`)
      );
      writeJSON(DONE, {
        at: nowIso(),
        complete: totC,
        dnet: after.dnet.map((d) => ({ name: d.name, state: d.state, usage: d.usage })),
        simPending: after.simPending,
        parse: pipe.parse.status,
        compare: pipe.cmp.status,
      });
      appendLog(`CONTINUE_MASTER DONE simPending=${after.simPending}`);
      process.exit(after.simPending ? 1 : 0);
    }
    if (once) process.exit(0);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  appendLog(`FATAL_CONTINUE_MASTER ${err && err.message ? err.message : err}`);
  process.exit(1);
});
