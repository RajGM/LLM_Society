#!/usr/bin/env node
/**
 * T2c_He supervisor: refresh status from disk, resume leftover configs
 * only when no other T2c_He orchestrator is running. No dry-run. No invented MI.
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const CFG_DIR = path.join(EXP, "configs", "phase2");
const RUNS = path.join(EXP, "runs_phase2");
const STATUS = path.join(EXP, "runs_phase2", "_status", "T2c_He.md");
const WATCH_MANIFEST = path.join(EXP, "results_phase2", "manifest_T2c_He_watch.json");
const LOG_MD = path.join(EXP, "LOG.md");

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

function nowIso() {
  return new Date().toISOString();
}

function appendLog(text) {
  fs.appendFileSync(LOG_MD, `\n## ${nowIso()}\n\n${text.trim()}\n\n---\n`);
}

function listConfigs() {
  return fs
    .readdirSync(CFG_DIR)
    .filter((f) => f.startsWith("T2c_He_") && f.endsWith(".json"))
    .sort();
}

function readCfg(name) {
  return JSON.parse(fs.readFileSync(path.join(CFG_DIR, name), "utf8"));
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

function readMeta(dir) {
  if (!dir) return null;
  const p = path.join(RUNS, dir, "metadata.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function liveCmdlines() {
  const out = [];
  if (!fs.existsSync("/proc")) return out;
  for (const ent of fs.readdirSync("/proc")) {
    if (!/^\d+$/.test(ent)) continue;
    try {
      const cmd = fs.readFileSync(path.join("/proc", ent, "cmdline"), "utf8").replace(/\0/g, " ");
      if (cmd) out.push({ pid: Number(ent), cmd });
    } catch {
      /* vanished */
    }
  }
  return out;
}

function classifyRow(cfg, live) {
  const dir = latestRunDir(cfg.experimentName);
  const meta = readMeta(dir);
  const inFlight = live.some((p) => {
    if (!p.cmd.includes("index.js") || !p.cmd.includes("--config")) return false;
    return p.cmd.includes(`${cfg.experimentName}.json`) || p.cmd.includes(`T2c_He_${cfg.topology}_`);
  }) && live.some((p) => p.cmd.includes(`${cfg.experimentName}.json`));
  const okStatus = meta && (meta.status === "completed" || meta.status === "complete");
  const mode = meta && meta.config && meta.config.miScoringMode;
  const complete = Boolean(okStatus && mode === "continuous");
  const usage = (meta && meta.llmUsage) || null;
  return { dir, meta, inFlight, complete, failed: Boolean(dir && meta && !complete && !inFlight && meta.status && meta.status !== "running"), usage };
}

function inventory() {
  const live = liveCmdlines();
  const configs = listConfigs().map((f) => {
    const cfg = readCfg(f);
    return { file: f, ...cfg, ...classifyRow(cfg, live) };
  });
  const byT = {};
  for (const t of TOPOLOGIES) byT[t] = { configs: 0, completed: 0, failed: 0, skipped: 0, pending: 0, inflight: 0 };
  let completed = 0;
  let failed = 0;
  let pending = 0;
  let inflight = 0;
  let llmCalls = 0;
  let estUsd = 0;
  for (const row of configs) {
    const t = row.topology;
    if (!byT[t]) byT[t] = { configs: 0, completed: 0, failed: 0, skipped: 0, pending: 0, inflight: 0 };
    byT[t].configs += 1;
    if (row.complete) {
      completed += 1;
      byT[t].completed += 1;
    } else if (row.inFlight) {
      inflight += 1;
      pending += 1;
      byT[t].inflight += 1;
      byT[t].pending += 1;
    } else if (row.failed) {
      failed += 1;
      byT[t].failed += 1;
    } else {
      pending += 1;
      byT[t].pending += 1;
    }
    if (row.usage) {
      llmCalls += Number(row.usage.calls || 0);
      estUsd += Number(row.usage.estimatedUsd || 0);
    }
  }
  const probeDir = latestRunDir("probe_T2c_He");
  const probeMeta = readMeta(probeDir);
  const probeUsage = probeMeta && probeMeta.llmUsage ? probeMeta.llmUsage : null;
  if (probeUsage) {
    llmCalls += Number(probeUsage.calls || 0);
    estUsd += Number(probeUsage.estimatedUsd || 0);
  }
  const orchestrators = live.filter((p) => {
    const cmd = p.cmd;
    if (cmd.includes("watch_t2c_he.js")) return false;
    const phase2 =
      cmd.includes("thesisExperiment/scripts/run_phase2.js") &&
      cmd.includes("--slice") &&
      cmd.includes("T2c_He");
    const dedicated = /(?:^|\s)(?:node\s+)?(?:\/\S+\/)?(?:thesisExperiment\/scripts\/)?run_t2c_he\.js(?:\s|$)/.test(
      cmd
    );
    return phase2 || dedicated;
  });
  return {
    configs,
    counts: {
      configs: configs.length,
      completed,
      failed,
      skipped: 0,
      pending,
      inflight,
      not_started: configs.filter((r) => !r.complete && !r.inFlight && !r.failed && !r.dir).length,
      llmCalls,
      estUsd: Math.round(estUsd * 10000) / 10000,
    },
    byT,
    probe: probeMeta
      ? {
          experimentName: "probe_T2c_He",
          status: probeMeta.status,
          failed: !probeUsage || !probeUsage.calls,
          usageCalls: probeUsage ? probeUsage.calls : 0,
          usageLine: probeUsage
            ? `${probeUsage.calls} calls, ${probeUsage.promptTokens} prompt / ${probeUsage.completionTokens} completion tokens ~$${probeUsage.estimatedUsd}`
            : "n/a",
        }
      : null,
    orchestrators,
    keyLength: (() => {
      try {
        const text = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
        for (const raw of text.split(/\r?\n/)) {
          const line = raw.trim();
          if (!line || line.startsWith("#")) continue;
          const eq = line.indexOf("=");
          if (eq === -1) continue;
          if (line.slice(0, eq).trim() !== "OPENAI_API_KEY") continue;
          return line.slice(eq + 1).trim().replace(/^["']|["']+$/g, "").length;
        }
      } catch {
        /* ignore */
      }
      return 0;
    })(),
  };
}

function writeStatus(inv, extra) {
  const c = inv.counts;
  const lines = [
    `# T2c_He status (continuous heterogeneous, all 8 topologies)`,
    ``,
    `**Updated:** ${nowIso()}`,
    `**OPENAI_API_KEY present:** yes (length=${inv.keyLength}; value not logged)`,
    `**Dry-run:** no`,
    `**MI/MPR invented:** no`,
    `**Continuous:** headline MI/MPR is float ~0–5 (\`src/Auditor.js\` \`miScoringMode: continuous\`)`,
    `**Concurrency:** 4`,
    `**Isolation:** \`thesisExperiment/runs_phase2\` only (not Phase 1 \`runs/\` or \`results/tables/\`)`,
    ``,
    extra ? extra.trim() + "\n" : "",
    `## Counts (configs; each seeds 6 core articles)`,
    ``,
    `| Count | n |`,
    `| --- | ---: |`,
    `| configs | ${c.configs} |`,
    `| completed | ${c.completed} |`,
    `| failed | ${c.failed} |`,
    `| skipped (already complete continuous) | ${c.skipped} |`,
    `| in-flight | ${c.inflight} |`,
    `| pending / not_started | ${c.pending} |`,
    `| LLM calls (this slice + probe) | ${c.llmCalls} |`,
    `| Est. USD | $${c.estUsd} |`,
    ``,
    `## By topology`,
    ``,
    `| topology | configs | completed | failed | skipped | pending | in-flight |`,
    `| --- | ---: | ---: | ---: | ---: | ---: | ---: |`,
  ];
  for (const t of TOPOLOGIES) {
    const r = inv.byT[t] || { configs: 0, completed: 0, failed: 0, skipped: 0, pending: 0, inflight: 0 };
    lines.push(`| ${t} | ${r.configs} | ${r.completed} | ${r.failed} | ${r.skipped} | ${r.pending} | ${r.inflight} |`);
  }
  if (inv.probe) {
    lines.push(``);
    lines.push(`## Probe (continuous)`);
    lines.push(``);
    lines.push(`- experiment: \`${inv.probe.experimentName}\``);
    lines.push(`- status: ${inv.probe.status}`);
    lines.push(`- failed: ${inv.probe.failed}`);
    lines.push(`- usage: ${inv.probe.usageLine || "n/a"}`);
    lines.push(`- usageCalls: ${inv.probe.usageCalls ?? "n/a"}`);
  }
  lines.push(``);
  lines.push(`## Isolation`);
  lines.push(``);
  lines.push(
    `Did not write \`thesisExperiment/runs/\` or \`thesisExperiment/results/tables/\`. Manifest: \`thesisExperiment/results_phase2/manifest_T2c_He.json\`. Did not run \`T2c_H_\`, \`T2d_H_\`, or \`T2d_He_\` configs. Did not git commit.`
  );
  lines.push(``);
  fs.writeFileSync(STATUS, lines.join("\n"));
  const slim = {
    updatedAt: nowIso(),
    slice: "T2c_He",
    mode: "real",
    keyLength: inv.keyLength,
    counts: inv.counts,
    byTopology: inv.byT,
    probe: inv.probe,
    orchestrators: inv.orchestrators.map((p) => ({ pid: p.pid, cmd: p.cmd.replace(/OPENAI_API_KEY=\S+/g, "OPENAI_API_KEY=[redacted]") })),
  };
  fs.writeFileSync(WATCH_MANIFEST, JSON.stringify(slim, null, 2));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function spawnRunner() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["thesisExperiment/scripts/run_t2c_he.js"], {
      cwd: ROOT,
      stdio: "inherit",
      env: {
        ...process.env,
        T2C_HE_POLL_MS: "2000",
        T2C_HE_POLL_MAX_MS: "90000",
        T2C_HE_CONCURRENCY: "4",
      },
    });
    child.on("close", (code) => resolve(code));
    child.on("error", () => resolve(1));
  });
}

async function main() {
  const once = process.argv.includes("--once");
  let launched = false;
  while (true) {
    const inv = inventory();
    const orch = inv.orchestrators.length > 0;
    const leftover = inv.counts.completed < 48 || inv.counts.failed > 0 || inv.counts.pending > 0;
    const extra = [
      `**Phase:** ${inv.counts.completed === 48 && inv.counts.failed === 0 ? "finished" : orch ? "grid (sibling T2c_He orchestrator live; concurrency 4; skip completed)" : leftover ? "grid resume pending" : "finished"}.`,
      ``,
      `Orchestrators: ${orch ? inv.orchestrators.map((p) => `pid ${p.pid}`).join(", ") : "none"}.`,
    ].join("\n");
    writeStatus(inv, extra);
    console.log(
      `[watch_t2c_he] completed=${inv.counts.completed} failed=${inv.counts.failed} pending=${inv.counts.pending} inflight=${inv.counts.inflight} orch=${orch} llmCalls=${inv.counts.llmCalls}`
    );

    if (inv.counts.completed === 48 && inv.counts.failed === 0 && inv.counts.pending === 0) {
      appendLog(
        `T2c_He finished completed=${inv.counts.completed} failed=${inv.counts.failed} skipped=${inv.counts.skipped} pending=${inv.counts.pending} llmCalls=${inv.counts.llmCalls} estUsd=${inv.counts.estUsd}`
      );
      process.exit(0);
    }

    if (once) process.exit(0);

    if (!orch && leftover && !launched) {
      appendLog(`T2c_He supervisor launching run_t2c_he.js for leftover pending=${inv.counts.pending} failed=${inv.counts.failed}`);
      launched = true;
      const code = await spawnRunner();
      launched = false;
      appendLog(`T2c_He run_t2c_he.js exit=${code}`);
      continue;
    }

    await sleep(20000);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
