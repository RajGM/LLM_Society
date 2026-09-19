#!/usr/bin/env node
/**
 * Supervise Phase 2 D-net 4-cell campaign. Never prints API key.
 * Isolation: runs_phase2 / results_phase2 only.
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = "/workspace";
const EXP = path.join(ROOT, "thesisExperiment");
const RUNS = path.join(EXP, "runs_phase2");
const RESULTS = path.join(EXP, "results_phase2");
const STATUS = path.join(RUNS, "_status", "dnet.md");
const CFG_DIR = path.join(EXP, "configs", "phase2");
const { isMockKey } = require(path.join(ROOT, "src", "loadEnv"));

const CELLS = [
  { short: "Dnet_c_H", file: "Dnet_c_H_conspiracy.json", name: "Dnet_c_H_conspiracy", mi: "continuous" },
  { short: "Dnet_c_He", file: "Dnet_c_He_mixed.json", name: "Dnet_c_He_mixed", mi: "continuous" },
  { short: "Dnet_d_H", file: "Dnet_d_H_conspiracy.json", name: "Dnet_d_H_conspiracy", mi: "dual" },
  { short: "Dnet_d_He", file: "Dnet_d_He_mixed.json", name: "Dnet_d_He_mixed", mi: "dual" },
];

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

function loadKeySilent() {
  if (!process.env.OPENAI_API_KEY) {
    const v = readEnvFile(path.join(ROOT, ".env")).OPENAI_API_KEY;
    if (v) process.env.OPENAI_API_KEY = v;
  }
  const v = process.env.OPENAI_API_KEY || "";
  const length = v.length;
  const ok = length > 20 && !isMockKey(v);
  return { ok, length };
}

function latestDirs(experimentName) {
  if (!fs.existsSync(RUNS)) return [];
  return fs
    .readdirSync(RUNS)
    .filter((d) => d.startsWith(experimentName + "_") && fs.existsSync(path.join(RUNS, d, "metadata.json")))
    .map((d) => {
      const dir = path.join(RUNS, d);
      let meta = {};
      try {
        meta = JSON.parse(fs.readFileSync(path.join(dir, "metadata.json"), "utf8"));
      } catch {
        /* ignore */
      }
      return { d, dir, meta, t: fs.statSync(dir).mtimeMs };
    })
    .sort((a, b) => b.t - a.t);
}

function cellState(cell) {
  const cfg = JSON.parse(fs.readFileSync(path.join(CFG_DIR, cell.file), "utf8"));
  const dirs = latestDirs(cell.name);
  if (!dirs.length) return { ...cell, state: "not_started", runDir: null, usage: 0, cfg };
  const latest = dirs[0];
  const meta = latest.meta || {};
  const okStatus = meta.status === "completed" || meta.status === "complete";
  const usage = (meta.llmUsage && meta.llmUsage.calls) || 0;
  const got = ((meta.config && meta.config.seedArticles) || []).join("|");
  const want = (cfg.seedArticles || []).join("|");
  const modeOk = !cfg.miScoringMode || (meta.config && meta.config.miScoringMode === cfg.miScoringMode);
  if (okStatus && usage > 0 && (!want || got === want) && modeOk) {
    return { ...cell, state: "completed", runDir: latest.d, usage, cfg, status: meta.status };
  }
  if (meta.status === "running" || (meta.status && /run|progress/i.test(String(meta.status)))) {
    return { ...cell, state: "running", runDir: latest.d, usage, cfg, status: meta.status };
  }
  if (meta.status === "failed" || meta.status === "error") {
    return { ...cell, state: "failed", runDir: latest.d, usage, cfg, status: meta.status };
  }
  return { ...cell, state: "running", runDir: latest.d, usage, cfg, status: meta.status || "unknown" };
}

function dnetIndexJsAlive() {
  try {
    const out = require("child_process").execSync("ps -eo pid,args", { encoding: "utf8" });
    return out
      .split("\n")
      .filter((l) => /index\.js --config thesisExperiment\/configs\/phase2\/Dnet_/.test(l))
      .map((l) => l.trim());
  } catch {
    return [];
  }
}

function runDnetAlive() {
  try {
    const out = require("child_process").execSync("ps -eo pid,args", { encoding: "utf8" });
    return out.split("\n").filter((l) => /run_dnet\.js/.test(l) && !/supervise/.test(l));
  } catch {
    return [];
  }
}

function writeStatus(rows, extra) {
  const key = extra.key;
  const counts = { completed: 0, skipped: 0, failed: 0, running: 0, not_started: 0 };
  for (const r of rows) counts[r.state] = (counts[r.state] || 0) + 1;
  const now = new Date().toISOString();
  const table = [
    "| Cell | config | `miScoringMode` | state | runDir | llm_calls |",
    "| --- | --- | --- | --- | --- | ---: |",
    ...rows.map(
      (r) =>
        `| ${r.short} | \`${r.file}\` | ${r.mi} | ${r.state} | ${r.runDir || "—"} | ${r.usage || 0} |`
    ),
  ].join("\n");
  const cmp = extra.compare || {};
  const md = `# Phase 2 D-net (Debnath custom graph) status

**Generated.** ${now}
**Key present.** **${key.ok ? "yes" : "no"}** (length=${key.length})
**Dry-run.** no
**MI/MPR invented.** no
**Tweet hydration invented.** no
**Git commit.** none

Independent of the 8-topology grid. Isolation: \`runs_phase2/\`, \`results_phase2/\` only. Did not write \`thesisExperiment/runs/\` or \`thesisExperiment/results/tables/\`.

## Key (no values logged)

Loaded dotenv from \`/workspace/.env\`. Length only.

## 4-cell counts

${table}

| | completed | skipped | failed | running | not_started |
| --- | ---: | ---: | ---: | ---: | ---: |
| four cells | ${counts.completed} | ${counts.skipped} | ${counts.failed} | ${counts.running} | ${counts.not_started} |

**Key: ${key.ok ? "yes" : "no"} (length=${key.length}).** **4-cell: ${counts.completed}/4 finished.** Dual and continuous both required to actually run.

## Compare

- **simPending = ${cmp.simPending == null ? "not yet run" : cmp.simPending}**
- nSimRuns = ${cmp.nSimRuns == null ? "—" : cmp.nSimRuns}
- Pfeffer seven factors; cross-media held

${extra.notes || ""}
`;
  fs.mkdirSync(path.dirname(STATUS), { recursive: true });
  fs.writeFileSync(STATUS, md);
  return { counts, md };
}

function spawnLogged(args, logName) {
  const logPath = path.join(RESULTS, "logs", `${logName}.log`);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const log = fs.createWriteStream(logPath, { flags: "a" });
  log.write(`\n=== ${new Date().toISOString()}  node ${args.join(" ")}\n`);
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    const redact = (s) => s.replace(/OPENAI_API_KEY\s*=\s*\S+/g, "OPENAI_API_KEY = [redacted]");
    child.stdout.on("data", (b) => {
      const s = redact(b.toString("utf8"));
      process.stdout.write(s);
      log.write(s);
    });
    child.stderr.on("data", (b) => {
      const s = redact(b.toString("utf8"));
      process.stderr.write(s);
      log.write(s);
    });
    child.on("close", (status) => {
      log.end();
      resolve({ status, logPath });
    });
    child.on("error", (err) => {
      log.write(String(err));
      log.end();
      resolve({ status: 1, logPath });
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function readCompare() {
  const p = path.join(RESULTS, "debnath_compare.json");
  if (!fs.existsSync(p)) return {};
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    return { simPending: j.simPending, nSimRuns: j.nSimRuns };
  } catch {
    return {};
  }
}

async function main() {
  const key = loadKeySilent();
  console.log(JSON.stringify({ event: "start", key_ok: key.ok, key_length: key.length, at: new Date().toISOString() }));
  if (!key.ok) {
    writeStatus(CELLS.map((c) => ({ ...c, state: "not_started", usage: 0 })), {
      key,
      notes: "Key missing or placeholder. Did not invent MI. Did not dry-run.",
    });
    process.exit(2);
  }

  let launched = false;
  const deadline = Date.now() + 8 * 60 * 60 * 1000;

  while (Date.now() < deadline) {
    const rows = CELLS.map(cellState);
    const done = rows.filter((r) => r.state === "completed").length;
    const running = rows.filter((r) => r.state === "running").length;
    const failed = rows.filter((r) => r.state === "failed").length;
    const notStarted = rows.filter((r) => r.state === "not_started").length;
    const aliveIdx = dnetIndexJsAlive();
    const aliveRunner = runDnetAlive();
    writeStatus(rows, {
      key,
      compare: readCompare(),
      notes: `- supervise: index.js Dnet pids=${aliveIdx.length} run_dnet=${aliveRunner.length} launchedOwn=${launched}`,
    });
    console.log(
      JSON.stringify({
        at: new Date().toISOString(),
        done,
        running,
        failed,
        notStarted,
        aliveIdx: aliveIdx.length,
        aliveRunner: aliveRunner.length,
        cells: rows.map((r) => ({ short: r.short, state: r.state, usage: r.usage, runDir: r.runDir })),
      })
    );

    if (done === 4) break;

    const needLaunch =
      !aliveRunner.length &&
      !aliveIdx.length &&
      (notStarted > 0 || failed > 0 || (running === 0 && done < 4));

    if (needLaunch) {
      console.log(JSON.stringify({ event: "launch_run_dnet", skipProbe: true }));
      launched = true;
      const r = await spawnLogged(
        ["thesisExperiment/scripts/run_dnet.js", "--skip-probe", "--concurrency", "2"],
        "dnet_worker_run"
      );
      console.log(JSON.stringify({ event: "run_dnet_exit", status: r.status }));
      continue;
    }

    await sleep(30000);
  }

  const rows = CELLS.map(cellState);
  const done = rows.filter((r) => r.state === "completed").length;
  console.log(JSON.stringify({ event: "compare_start", done }));
  const cmpRun = await spawnLogged(["thesisExperiment/scripts/compare_phase2.js"], "dnet_worker_compare");
  const compare = readCompare();
  writeStatus(rows, {
    key,
    compare,
    notes: `- compare_phase2.js exit=${cmpRun.status}\n- Dual and continuous both required. No dry-run. No invented MI. No tweet invention. No Phase 1 overwrite. No git commit.`,
  });
  console.log(JSON.stringify({ event: "done", key_ok: key.ok, key_length: key.length, done, compare, compareStatus: cmpRun.status }));
  process.exit(done === 4 && compare.simPending === false ? 0 : 1);
}

main().catch((err) => {
  console.error(String(err && err.message ? err.message : err));
  process.exit(1);
});
