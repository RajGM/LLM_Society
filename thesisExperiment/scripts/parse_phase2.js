#!/usr/bin/env node
/**
 * Parse thesisExperiment/runs_phase2 into results_phase2 tables.
 * Separates discrete (dual top-level), continuous-only, and dual sidecar continuous.
 */
const fs = require("fs");
const path = require("path");

const EXP = path.join(__dirname, "..");
const RUNS = path.join(EXP, "runs_phase2");
const OUT = path.join(EXP, "results_phase2");
fs.mkdirSync(path.join(OUT, "tables"), { recursive: true });

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function round4(x) {
  if (x == null || Number.isNaN(x)) return null;
  return Math.round(x * 10000) / 10000;
}

function parseName(experimentName) {
  // T2c_H_linear_chain_conspiracy_believer
  // T2d_He_scale_free_mix_00
  const m = experimentName.match(/^(T2c|T2d)_(H|He)_([a-z_]+?)_(.+)$/);
  if (!m) return { prefix: null, arm: null, topology: null, rest: experimentName };
  return { prefix: m[1], arm: m[2], topology: m[3], rest: m[4], mode: m[1] === "T2c" ? "continuous" : "dual" };
}

function collectEvents(runDir, articleId) {
  const nodesDir = path.join(runDir, "nodes");
  const events = [];
  if (!fs.existsSync(nodesDir)) return events;
  for (const f of fs.readdirSync(nodesDir).filter((x) => x.endsWith(".json"))) {
    const state = readJSON(path.join(nodesDir, f));
    for (const ev of state.history || []) {
      if (ev.articleId !== articleId) continue;
      events.push({ ...ev, nodeId: state.nodeId || f.replace(/\.json$/, ""), personaId: state.personaId });
    }
  }
  return events;
}

function kStar(events, miOf) {
  const byTick = {};
  for (const ev of events) {
    if (miOf(ev) == null) continue;
    const t = ev.tick != null ? ev.tick : ev.hops;
    if (!byTick[t]) byTick[t] = [];
    byTick[t].push(miOf(ev));
  }
  const ticks = Object.keys(byTick)
    .map(Number)
    .sort((a, b) => a - b);
  const series = ticks.map((t) => ({
    t,
    mean: byTick[t].reduce((s, v) => s + v, 0) / byTick[t].length,
  }));
  let k = null;
  for (let i = 0; i < series.length; i++) {
    if (series[i].mean > 3) {
      const rest = series.slice(i);
      if (rest.every((x) => x.mean > 3)) {
        k = series[i].t;
        break;
      }
    }
  }
  return { k, lastMean: series.length ? series[series.length - 1].mean : null, nTicks: series.length };
}

function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

function rowFromRun(runDir, meta, articleId) {
  const events = collectEvents(runDir, articleId);
  const scored = events.filter((e) => e.misinfoIndex != null);
  const usagePath = path.join(runDir, "metadata.json");
  const usage = (meta && meta.llmUsage) || null;
  const parsed = parseName(meta.experimentName || (meta.config && meta.config.experimentName) || path.basename(runDir));
  const mode = (meta.config && meta.config.miScoringMode) || parsed.mode;

  const discMI = (e) =>
    e.ifd && e.ifd.dual && e.ifd.dual.discrete ? e.ifd.dual.discrete.mi : mode === "discrete" || mode === "dual" ? e.misinfoIndex : null;
  const contMI = (e) => {
    if (e.ifd && e.ifd.dual && e.ifd.dual.continuous) return e.ifd.dual.continuous.mi;
    if (mode === "continuous") return e.misinfoIndex;
    return null;
  };
  const gaps = scored
    .map((e) => (e.ifd && e.ifd.dual && e.ifd.dual.gap != null ? e.ifd.dual.gap : null))
    .filter((x) => x != null);
  const agreements = scored
    .map((e) => (e.ifd && e.ifd.dual && e.ifd.dual.agreement != null ? e.ifd.dual.agreement : null))
    .filter((x) => x != null);

  const ksDisc = kStar(events, discMI);
  const ksCont = kStar(events, contMI);
  const dead = scored.length <= 1;

  const nodeMpr = {};
  for (const e of scored) {
    if (!nodeMpr[e.nodeId]) nodeMpr[e.nodeId] = [];
    nodeMpr[e.nodeId].push(e.misinfoIndex);
  }
  const meanNodeMPR = mean(Object.values(nodeMpr).map((xs) => mean(xs)));

  return {
    runDir: path.basename(runDir),
    experimentName: meta.experimentName || (meta.config && meta.config.experimentName),
    arm: parsed.arm,
    topology: parsed.topology || (meta.config && meta.config.topology),
    rest: parsed.rest,
    miScoringMode: mode,
    articleId,
    nEvents: events.length,
    nScored: scored.length,
    dead,
    meanMI: round4(mean(scored.map((e) => e.misinfoIndex))),
    meanNodeMPR: round4(meanNodeMPR),
    maxMI: scored.length ? Math.max(...scored.map((e) => e.misinfoIndex)) : null,
    meanDiscreteMI: round4(mean(scored.map(discMI).filter((x) => x != null))),
    meanContinuousMI: round4(mean(scored.map(contMI).filter((x) => x != null))),
    meanDualGap: round4(mean(gaps)),
    meanAgreement: round4(mean(agreements)),
    kStarDiscrete: ksDisc.k,
    kStarContinuous: ksCont.k,
    kStarCensoredDiscrete: ksDisc.k != null && ksDisc.k === Math.max(...(events.map((e) => e.tick || e.hops || 0))),
    llmCalls: usage && usage.calls,
    status: meta.status,
  };
}

function toCsv(rows) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(",")];
  for (const r of rows) {
    lines.push(
      keys
        .map((k) => {
          const v = r[k];
          if (v == null) return "";
          const s = String(v);
          return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    );
  }
  return lines.join("\n") + "\n";
}

function main() {
  const rows = [];
  if (!fs.existsSync(RUNS)) {
    console.warn("No runs_phase2 yet");
    writeJSONEmpty();
    return;
  }
  const dirs = fs.readdirSync(RUNS).filter((d) => fs.existsSync(path.join(RUNS, d, "metadata.json")));
  for (const d of dirs) {
    const runDir = path.join(RUNS, d);
    let meta;
    try {
      meta = readJSON(path.join(runDir, "metadata.json"));
    } catch {
      continue;
    }
    const articles = (meta.config && meta.config.seedArticles) || [];
    const resultFiles = fs.readdirSync(runDir).filter((f) => f.startsWith("results_") && f.endsWith(".json"));
    const articleIds = articles.length
      ? articles
      : resultFiles.map((f) => f.replace(/^results_/, "").replace(/\.json$/, ""));
    for (const articleId of articleIds) {
      rows.push(rowFromRun(runDir, meta, articleId));
    }
  }

  const th = rows.filter((r) => r.arm === "H" && !String(r.experimentName).startsWith("probe"));
  const the = rows.filter((r) => r.arm === "He");
  const cont = rows.filter((r) => r.miScoringMode === "continuous");
  const dual = rows.filter((r) => r.miScoringMode === "dual");
  const dead = rows.filter((r) => r.dead);

  fs.writeFileSync(path.join(OUT, "tables", "TH_rows.csv"), toCsv(th));
  fs.writeFileSync(path.join(OUT, "tables", "THe_rows.csv"), toCsv(the));
  fs.writeFileSync(path.join(OUT, "tables", "continuous.csv"), toCsv(cont));
  fs.writeFileSync(path.join(OUT, "tables", "dual_discrete.csv"), toCsv(dual));
  fs.writeFileSync(path.join(OUT, "tables", "dual_gap.csv"), toCsv(dual.map((r) => ({
    experimentName: r.experimentName,
    articleId: r.articleId,
    topology: r.topology,
    meanDualGap: r.meanDualGap,
    meanAgreement: r.meanAgreement,
    meanDiscreteMI: r.meanDiscreteMI,
    meanContinuousMI: r.meanContinuousMI,
  }))));
  fs.writeFileSync(path.join(OUT, "tables", "dead_cells.csv"), toCsv(dead));
  fs.writeFileSync(path.join(OUT, "tables", "all_rows.csv"), toCsv(rows));

  const summary = {
    generatedAt: new Date().toISOString(),
    nRows: rows.length,
    nTH: th.length,
    nTHe: the.length,
    nContinuous: cont.length,
    nDual: dual.length,
    nDead: dead.length,
    deadNote: "dead = nScored <= 1; hatch these; do not read as mix immunises",
    meanMPR_TH_continuous: round4(mean(cont.filter((r) => r.arm === "H" && !r.dead).map((r) => r.meanMI).filter((x) => x != null))),
    meanMPR_TH_dualHeadline: round4(mean(dual.filter((r) => r.arm === "H" && !r.dead).map((r) => r.meanMI).filter((x) => x != null))),
    thesisGrade: false,
    isolation: "results_phase2 only",
  };
  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(`Phase2 parse: ${rows.length} rows, dead=${dead.length} → ${OUT}/tables`);
}

function writeJSONEmpty() {
  fs.writeFileSync(
    path.join(OUT, "summary.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), nRows: 0, note: "no runs_phase2" }, null, 2)
  );
}

main();
