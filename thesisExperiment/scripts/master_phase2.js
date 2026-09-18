#!/usr/bin/env node
/**
 * Master Phase 2 orchestrator.
 *
 *   node thesisExperiment/scripts/master_phase2.js
 *   node thesisExperiment/scripts/master_phase2.js --wait-key --poll-sec 30
 *
 * Never invents MI/MPR. Never dry-run. Isolation: runs_phase2 / results_phase2 only.
 * Skips completed cells. Does not kill other node processes.
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { findKey, writeWorkspaceEnv, writeKeyReady } = require("./check_openai_key");

const ROOT = path.join(__dirname, "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const RUNS = path.join(EXP, "runs_phase2");
const RESULTS = path.join(EXP, "results_phase2");
const STATUS = path.join(RUNS, "_status", "MASTER.md");
const BLOCKER = path.join(RUNS, "_blockers", "NEED_OPENAI_API_KEY.md");
const LOG_MD = path.join(EXP, "LOG.md");
const CFG_DIR = path.join(EXP, "configs", "phase2");

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

function parseArgs(argv) {
  const pollIdx = argv.indexOf("--poll-sec");
  const maxIdx = argv.indexOf("--max-wait-sec");
  const concIdx = argv.indexOf("--concurrency");
  return {
    waitKey: argv.includes("--wait-key"),
    pollSec: Math.max(5, Number(pollIdx !== -1 ? argv[pollIdx + 1] : 30) || 30),
    maxWaitSec: Number(maxIdx !== -1 ? argv[maxIdx + 1] : 0) || 0,
    concurrency: Math.max(1, Number(concIdx !== -1 ? argv[concIdx + 1] : 4) || 4),
    skipProbe: argv.includes("--skip-probe"),
  };
}

function appendLog(text) {
  fs.appendFileSync(LOG_MD, `\n## ${new Date().toISOString()}\n\n${text.trim()}\n\n---\n`);
}

function writeStatus(md) {
  fs.mkdirSync(path.dirname(STATUS), { recursive: true });
  fs.writeFileSync(STATUS, md.endsWith("\n") ? md : md + "\n");
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function isComplete(experimentName, expectedCfg) {
  if (!fs.existsSync(RUNS)) return false;
  const dirs = fs
    .readdirSync(RUNS)
    .filter((d) => d.startsWith(experimentName + "_") && fs.existsSync(path.join(RUNS, d, "metadata.json")))
    .map((d) => ({ d, t: fs.statSync(path.join(RUNS, d)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  if (!dirs.length) return false;
  try {
    const meta = readJSON(path.join(RUNS, dirs[0].d, "metadata.json"));
    const okStatus = meta.status === "completed" || meta.status === "complete";
    if (!okStatus) return false;
    const usage = (meta.llmUsage && meta.llmUsage.calls) || 0;
    if (usage <= 0) return false;
    if (expectedCfg) {
      const got = ((meta.config && meta.config.seedArticles) || []).join("|");
      const want = (expectedCfg.seedArticles || []).join("|");
      if (want && got !== want) return false;
      if (expectedCfg.miScoringMode && meta.config && meta.config.miScoringMode !== expectedCfg.miScoringMode) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function latestRunDir(experimentName) {
  if (!fs.existsSync(RUNS)) return null;
  const dirs = fs
    .readdirSync(RUNS)
    .filter((d) => d.startsWith(experimentName + "_") && fs.existsSync(path.join(RUNS, d, "metadata.json")))
    .map((d) => ({ d, t: fs.statSync(path.join(RUNS, d)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return dirs.length ? dirs[0].d : null;
}

function inventory() {
  const configs = fs
    .readdirSync(CFG_DIR)
    .filter((f) => /^T2[cd]_/.test(f) && f.endsWith(".json") && !f.startsWith("_"))
    .sort();
  const bySlice = {};
  for (const s of SLICES) bySlice[s] = { configs: 0, complete: 0, failed: 0, remaining: 0, names: [] };
  for (const f of configs) {
    const slice = SLICES.find((s) => f.startsWith(s + "_"));
    if (!slice) continue;
    const cfg = readJSON(path.join(CFG_DIR, f));
    const name = cfg.experimentName || f.replace(/\.json$/, "");
    bySlice[slice].configs += 1;
    bySlice[slice].names.push(name);
    if (isComplete(name, cfg)) bySlice[slice].complete += 1;
    else bySlice[slice].remaining += 1;
  }
  const dnet = DNET.map((name) => {
    const file = path.join(CFG_DIR, `${name}.json`);
    const cfg = fs.existsSync(file) ? readJSON(file) : null;
    return { name, complete: cfg ? isComplete(name, cfg) : false, runDir: latestRunDir(name) };
  });
  const probes = {};
  for (const mode of ["continuous", "dual"]) {
    const d = latestRunDir(`probe_p2_${mode}`);
    let usage = 0;
    let dualFields = { discrete: false, continuous: false };
    if (d) {
      try {
        const meta = readJSON(path.join(RUNS, d, "metadata.json"));
        usage = (meta.llmUsage && meta.llmUsage.calls) || 0;
        const nodesDir = path.join(RUNS, d, "nodes");
        if (fs.existsSync(nodesDir)) {
          for (const nf of fs.readdirSync(nodesDir).filter((x) => x.endsWith(".json"))) {
            const st = readJSON(path.join(nodesDir, nf));
            for (const ev of st.history || []) {
              if (ev.ifd && ev.ifd.dual && ev.ifd.dual.discrete) dualFields.discrete = true;
              if (ev.ifd && ev.ifd.dual && ev.ifd.dual.continuous) dualFields.continuous = true;
            }
          }
        }
      } catch {
        /* ignore */
      }
    }
    probes[mode] = { runDir: d, usage, dualFields };
  }
  let simPending = true;
  const comparePath = path.join(RESULTS, "debnath_compare.json");
  if (fs.existsSync(comparePath)) {
    try {
      simPending = !!readJSON(comparePath).simPending;
    } catch {
      /* ignore */
    }
  }
  return { bySlice, dnet, probes, simPending };
}

function formatMaster(inv, extra) {
  const now = new Date().toISOString();
  const sliceLines = SLICES.map((s) => {
    const r = inv.bySlice[s];
    const cells = r.configs * 6;
    return `| ${s} | ${r.configs} | ${cells} | ${r.complete} | ${r.remaining} | ${r.complete * 6}/${cells} configs×6 |`;
  });
  const totCfg = SLICES.reduce((a, s) => a + inv.bySlice[s].configs, 0);
  const totComplete = SLICES.reduce((a, s) => a + inv.bySlice[s].complete, 0);
  const dnetLine = inv.dnet
    .map((d) => `- \`${d.name}\`: ${d.complete ? "complete" : "not complete"} (${d.runDir || "no run dir"})`)
    .join("\n");
  return `# Phase 2 MASTER status

**Updated.** ${now}
**OPENAI_API_KEY found.** ${extra.keyYes ? `yes (length=${extra.keyLength})` : "no"}
**Dry-run.** no. **MI invented.** no.
**Isolation.** \`runs_phase2/\` + \`results_phase2/\` only. Did not write Phase 1 \`runs/\` or \`results/tables/\`.

## Probe

| mode | runDir | LLM usage | dual discrete field | dual continuous field |
| --- | --- | ---: | --- | --- |
| continuous | ${inv.probes.continuous.runDir || "—"} | ${inv.probes.continuous.usage} | n/a | ${inv.probes.continuous.usage > 0 ? "headline" : "not observed"} |
| dual | ${inv.probes.dual.runDir || "—"} | ${inv.probes.dual.usage} | ${inv.probes.dual.dualFields.discrete ? "yes" : "no"} | ${inv.probes.dual.dualFields.continuous ? "yes" : "no"} |

## Grid (288 configs / 1728 cells)

| slice | configs | cells | configs complete | configs remaining | cells note |
| --- | ---: | ---: | ---: | ---: | --- |
${sliceLines.join("\n")}
| **grid** | **${totCfg}** | **${totCfg * 6}** | **${totComplete}** | **${totCfg - totComplete}** | skip-complete on disk |

## D-net

${dnetLine}

Dnet complete: **${inv.dnet.filter((d) => d.complete).length}/4**

## Compare

\`simPending\` = **${inv.simPending}** (\`results_phase2/debnath_compare.json\`)

## Notes

${extra.notes || "- orchestrator running"}

Sibling slice agents may also write \`runs_phase2\`. This master skips completed cells and does not kill other node processes.
`;
}

function runNode(args, logName, opts = {}) {
  const logDir = path.join(RESULTS, "logs");
  fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, `${logName}.log`);
  const log = fs.createWriteStream(logPath, { flags: "a" });
  log.write(`\n=== ${new Date().toISOString()}  node ${args.join(" ")}\n`);
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let stdout = "";
    child.stdout.on("data", (b) => {
      const s = b.toString("utf8");
      stdout += s;
      process.stdout.write(s);
      log.write(s);
    });
    child.stderr.on("data", (b) => {
      const s = b.toString("utf8");
      stdout += s;
      process.stderr.write(s);
      log.write(s);
    });
    const timer =
      opts.hardMs != null
        ? setTimeout(() => {
            try {
              child.kill("SIGTERM");
            } catch {
              /* ignore */
            }
          }, opts.hardMs)
        : null;
    child.on("close", (status) => {
      if (timer) clearTimeout(timer);
      log.end();
      resolve({ status, stdout, logPath });
    });
    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      log.end();
      resolve({ status: 1, stdout: String(err), logPath });
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function ensureKey(writeEnv) {
  const found = findKey();
  if (!found.ok) return { yes: false, length: 0 };
  if (writeEnv && found.ok.value) {
    const envPath = path.join(ROOT, ".env");
    if (!fs.existsSync(envPath)) writeWorkspaceEnv(found.ok.value);
    writeKeyReady(found.ok.length);
    if (!process.env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = found.ok.value;
  }
  return { yes: true, length: found.ok.length, source: found.ok.source };
}

function writeBlocker(polls) {
  fs.mkdirSync(path.dirname(BLOCKER), { recursive: true });
  fs.writeFileSync(
    BLOCKER,
    `# Blocker: OPENAI_API_KEY missing

**Time:** ${new Date().toISOString()}
**Polls:** ${polls}

Phase 2 LLM grid cannot run without a real key (length > 20, not a placeholder).
Did **not** invent a key. Did **not** dry-run. Did **not** invent MI/MPR.

Requested via \`cursor-cloud-request-environment-setup-actions\` (\`add_secrets\` / \`OPENAI_API_KEY\`).

## Exact user action

1. Copy \`OPENAI_API_KEY\` into gitignored \`/workspace/.env\` (mode 600).
2. Or add it to the Cloud Agent environment secrets.

The orchestrator keeps polling. The moment \`.env\` appears it will write \`KEY_READY.md\` (length only) and launch probes + the 288-config grid + 4 Dnet cells.
`
  );
}

async function waitForKey(args) {
  const started = Date.now();
  let polls = 0;
  while (true) {
    const key = ensureKey(true);
    polls += 1;
    if (key.yes) return { ...key, polls };
    writeBlocker(polls);
    const inv = inventory();
    writeStatus(
      formatMaster(inv, {
        keyYes: false,
        keyLength: 0,
        notes: `- waiting for OPENAI_API_KEY (poll ${polls}, every ${args.pollSec}s). Non-LLM work already done (polarized minSeedOutDegree, parse hatch, empirical compare).`,
      })
    );
    if (args.maxWaitSec > 0 && (Date.now() - started) / 1000 >= args.maxWaitSec) {
      return { yes: false, length: 0, polls };
    }
    await sleep(args.pollSec * 1000);
  }
}

async function verifyDualProbe() {
  const d = latestRunDir("probe_p2_dual");
  if (!d) return { ok: false, reason: "no dual probe run dir" };
  const meta = readJSON(path.join(RUNS, d, "metadata.json"));
  const usage = (meta.llmUsage && meta.llmUsage.calls) || 0;
  let discrete = false;
  let continuous = false;
  const nodesDir = path.join(RUNS, d, "nodes");
  if (fs.existsSync(nodesDir)) {
    for (const nf of fs.readdirSync(nodesDir).filter((x) => x.endsWith(".json"))) {
      const st = readJSON(path.join(nodesDir, nf));
      for (const ev of st.history || []) {
        if (ev.ifd && ev.ifd.dual && ev.ifd.dual.discrete) discrete = true;
        if (ev.ifd && ev.ifd.dual && ev.ifd.dual.continuous) continuous = true;
      }
    }
  }
  return { ok: usage > 0 && discrete && continuous, usage, discrete, continuous, runDir: d };
}

async function launchGrid(concurrency) {
  const workers = [];
  for (const slice of SLICES) {
    const remaining = fs
      .readdirSync(CFG_DIR)
      .filter((f) => f.startsWith(slice + "_") && f.endsWith(".json"))
      .filter((f) => {
        const cfg = readJSON(path.join(CFG_DIR, f));
        return !isComplete(cfg.experimentName, cfg);
      }).length;
    if (!remaining) {
      appendLog(`MASTER skip slice ${slice} — all complete on disk`);
      continue;
    }
    workers.push(
      runNode(
        [
          "thesisExperiment/scripts/run_phase2.js",
          "--skip-probe",
          "--no-parse",
          "--phase",
          "all",
          "--slice",
          slice,
          "--concurrency",
          String(concurrency),
          "--manifest",
          `thesisExperiment/results_phase2/manifest_${slice}.json`,
        ],
        `master_${slice}`,
        { hardMs: 12 * 60 * 60 * 1000 }
      ).then((r) => {
        appendLog(`MASTER slice ${slice} exit=${r.status}`);
        return { slice, ...r };
      })
    );
  }
  workers.push(
    runNode(
      ["thesisExperiment/scripts/run_dnet.js", "--skip-probe", "--concurrency", "2"],
      "master_dnet",
      { hardMs: 12 * 60 * 60 * 1000 }
    ).then((r) => {
      appendLog(`MASTER dnet exit=${r.status}`);
      return { slice: "dnet", ...r };
    })
  );
  return Promise.all(workers);
}

async function parseAndCompare() {
  const parse = await runNode(["thesisExperiment/scripts/parse_phase2.js"], "master_parse");
  appendLog(`MASTER parse_phase2 exit=${parse.status}`);
  const cmp = await runNode(["thesisExperiment/scripts/compare_phase2.js"], "master_compare");
  appendLog(`MASTER compare_phase2 exit=${cmp.status}`);
  return { parse, cmp };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  fs.mkdirSync(path.join(RUNS, "_status"), { recursive: true });
  fs.mkdirSync(path.join(RESULTS, "logs"), { recursive: true });

  let key = ensureKey(true);
  writeStatus(
    formatMaster(inventory(), {
      keyYes: key.yes,
      keyLength: key.length || 0,
      notes: "- MASTER start. Polarized hardened (seeded RNG + minSeedOutDegree=2).",
    })
  );

  if (!key.yes) {
    appendLog("MASTER key missing — waiting (non-LLM work already applied).");
    if (args.waitKey) {
      key = await waitForKey(args);
    }
  }

  if (!key.yes) {
    writeBlocker(0);
    writeStatus(
      formatMaster(inventory(), {
        keyYes: false,
        keyLength: 0,
        notes: "- BLOCKED: OPENAI_API_KEY still missing. Watcher/process remains ready.",
      })
    );
    process.exit(2);
  }

  appendLog(`MASTER key ready length=${key.length} source=${key.source || "unknown"} (value not logged)`);
  writeStatus(
    formatMaster(inventory(), {
      keyYes: true,
      keyLength: key.length,
      notes: "- key loaded; launching probes.",
    })
  );

  if (!args.skipProbe) {
    const probe = await runNode(
      ["thesisExperiment/scripts/run_phase2.js", "--probe-only"],
      "master_probe",
      { hardMs: 10 * 60 * 1000 }
    );
    appendLog(`MASTER probe-only exit=${probe.status}`);
    const cont = latestRunDir("probe_p2_continuous");
    let contUsage = 0;
    if (cont) {
      try {
        contUsage = (readJSON(path.join(RUNS, cont, "metadata.json")).llmUsage || {}).calls || 0;
      } catch {
        /* ignore */
      }
    }
    const dual = await verifyDualProbe();
    if (probe.status !== 0 || contUsage <= 0 || !dual.ok) {
      appendLog(
        `MASTER probe failed contUsage=${contUsage} dualUsage=${dual.usage} discrete=${dual.discrete} continuous=${dual.continuous}`
      );
      writeStatus(
        formatMaster(inventory(), {
          keyYes: true,
          keyLength: key.length,
          notes: `- probe failed; refusing to invent MI. contUsage=${contUsage} dual.ok=${dual.ok}`,
        })
      );
      process.exit(2);
    }
  }

  writeStatus(
    formatMaster(inventory(), {
      keyYes: true,
      keyLength: key.length,
      notes: "- probes passed; launching 4 slices + Dnet in parallel (skip complete).",
    })
  );

  await launchGrid(args.concurrency);
  await parseAndCompare();

  let inv = inventory();
  const leftover = SLICES.reduce((a, s) => a + inv.bySlice[s].remaining, 0);
  const dnetLeft = inv.dnet.filter((d) => !d.complete).length;
  if (leftover || dnetLeft) {
    appendLog(`MASTER retry remaining configs=${leftover} dnet=${dnetLeft}`);
    await launchGrid(args.concurrency);
    await parseAndCompare();
    inv = inventory();
  }

  writeStatus(
    formatMaster(inv, {
      keyYes: true,
      keyLength: key.length,
      notes: `- finished pass. remaining configs=${SLICES.reduce((a, s) => a + inv.bySlice[s].remaining, 0)} dnet incomplete=${inv.dnet.filter((d) => !d.complete).length} simPending=${inv.simPending}`,
    })
  );
  const remaining = SLICES.reduce((a, s) => a + inv.bySlice[s].remaining, 0);
  const dnetIncomplete = inv.dnet.filter((d) => !d.complete).length;
  process.exit(remaining || dnetIncomplete || inv.simPending ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  appendLog(`FATAL_MASTER ${err.message}`);
  process.exit(1);
});
