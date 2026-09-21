/* Build the fixed retained-run manifest from the canonical all_rows.csv.
 * Read-only for research data. Writes only
 *   thesisExperiment/results_phase2/retained_runs_manifest.json
 * Run from anywhere:  node thesisExperiment/results_phase2/tables_reconciled/build_manifest.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../../..');
const RUNS = path.join(ROOT, 'thesisExperiment/runs_phase2');
const csvPath = path.join(ROOT, 'thesisExperiment/results_phase2/tables/all_rows.csv');
const parserPath = path.join(ROOT, 'thesisExperiment/scripts/parse_phase2.js');
const outPath = path.join(ROOT, 'thesisExperiment/results_phase2/retained_runs_manifest.json');

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }).trim();

function parseCSV(text) {
  const records = []; let row = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { value += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(value); value = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(value); if (row.some(Boolean)) records.push(row); row = []; value = ''; }
    else value += c;
  }
  if (value || row.length) { row.push(value); records.push(row); }
  const header = records.shift();
  return records.map((r) => Object.fromEntries(header.map((k, i) => [k, r[i] ?? ''])));
}

// Read-only evaluation of the parser's own selectCompletedRuns() (never main()).
const parserSource = fs.readFileSync(parserPath, 'utf8');
const cut = parserSource.indexOf('\nfunction main(');
if (cut < 0) throw new Error('parser boundary changed');
const prefix = parserSource.slice(0, cut).replace(/fs\.mkdirSync\(path\.join\(OUT, "tables"\), \{ recursive: true \}\);/, '');
const rofs = Object.freeze({ readFileSync: fs.readFileSync.bind(fs), existsSync: fs.existsSync.bind(fs), readdirSync: fs.readdirSync.bind(fs), statSync: fs.statSync.bind(fs) });
const sandbox = { require: (n) => (n === 'fs' ? rofs : n === 'path' ? path : (() => { throw new Error(n); })()), __dirname: path.dirname(parserPath), console };
vm.runInNewContext(prefix + '\nglobalThis.__sel = selectCompletedRuns; globalThis.__nameOf = experimentNameOf;', sandbox);
const todayPick = new Map(sandbox.__sel().selected.map((s) => [s.name, s.d]));

// Git tree ids of every nodes/ directory at HEAD (one call).
const headCommit = git('rev-parse', 'HEAD');
const nodesTree = new Map();
for (const line of git('ls-tree', '-d', '-r', '-t', 'HEAD', 'thesisExperiment/runs_phase2').split('\n')) {
  const m = line.match(/^\d+ tree ([0-9a-f]{40})\tthesisExperiment\/runs_phase2\/([^/]+)\/nodes$/);
  if (m) nodesTree.set(m[2], m[1]);
}

const csvBuf = fs.readFileSync(csvPath);
const rows = parseCSV(csvBuf.toString('utf8').replace(/^﻿/, ''));

// All run directories grouped by experiment name (for the duplicate listing).
const allDirs = new Map();
for (const d of fs.readdirSync(RUNS)) {
  const mp = path.join(RUNS, d, 'metadata.json');
  if (!fs.existsSync(mp)) continue;
  let meta; try { meta = JSON.parse(fs.readFileSync(mp, 'utf8')); } catch { continue; }
  const name = sandbox.__nameOf(meta, d);
  if (!allDirs.has(name)) allDirs.set(name, []);
  allDirs.get(name).push({ runDir: d, metadataStatus: meta.status ?? null, llmCalls: (meta.llmUsage && meta.llmUsage.calls) || 0 });
}

const AFFECTED = {
  'T2d_H_polarized_ozone_stratosphere_specialist': {
    articleId: 'polar_bears', csvLine: 1155,
    canonical: { nEvents: 139, nScored: 122, meanMI: 1.4836, meanNodeMPR: 1.4752, maxMI: 3, meanDiscreteMI: 1.4836, meanContinuousMI: 0.0697, meanDualGap: 1.4303, meanAgreement: 0.2517 },
    reparseFromArchivedNodes: { nEvents: 139, nScored: 37, meanMI: 1.5405, meanNodeMPR: 1.5208, maxMI: 3, meanDiscreteMI: 1.5405, meanContinuousMI: 0.0946, meanDualGap: 1.4459, meanAgreement: 0.3345 },
    corroboratingAggregate: 'results_polar_bears.json (ifdDualMetrics.eventCount 122, meanDiscreteMI 1.48360655..., meanContinuousMI 0.06967213..., meanGap 1.43032786..., meanAgreement 0.25168367...; nodeSummaries mpr mean 1.47519...; eventCount sum 139); run log line "LLM usage: 1725 calls" / "Done. Results in: ...04-49-20"',
  },
  'T2d_H_scale_free_biodiversity_food_security': {
    articleId: 'polar_bears', csvLine: 1311,
    canonical: { nEvents: 176, nScored: 153, meanMI: 1.0784, meanNodeMPR: 1.075, maxMI: 2, meanDiscreteMI: 1.0784, meanContinuousMI: 0, meanDualGap: 1.0784, meanAgreement: null },
    reparseFromArchivedNodes: { nEvents: 176, nScored: 18, meanMI: 0.8333, meanNodeMPR: 0.8333, maxMI: 2, meanDiscreteMI: 0.8333, meanContinuousMI: 0, meanDualGap: 0.8333, meanAgreement: null },
    corroboratingAggregate: 'results_polar_bears.json (ifdDualMetrics.eventCount 153, meanDiscreteMI 1.07843137..., meanContinuousMI 0, meanGap 1.07843137..., meanAgreement null; nodeSummaries mpr mean 1.07502...; eventCount sum 176); run log line "LLM usage: 2374 calls" / "Done. Results in: ...04-43-08"',
  },
};
const NOTE = 'The archived nodes/*.json for this runDir are the 05:10:14 UTC mid-run snapshot (commit 2a774f5): metadata.json reads status "running", llmUsage.calls 0, and the polar_bears audit is incomplete. The canonical CSV row (commit 6efcca1, 05:15:17 UTC) was parsed from the completed working tree on the run machine, which was never committed. The completed per-event scores are not recoverable; the run summary results_polar_bears.json and the run log corroborate the canonical aggregates. All five other article cells of this run reproduce exactly from the archived node files.';

const entries = [];
const seen = new Map();
for (const r of rows) {
  if (!seen.has(r.experimentName)) {
    seen.set(r.experimentName, entries.length);
    const runDir = r.runDir;
    const meta = JSON.parse(fs.readFileSync(path.join(RUNS, runDir, 'metadata.json'), 'utf8'));
    const e = {
      experimentName: r.experimentName,
      runDir,
      slice: r.slice || null, arm: r.arm || null, topology: r.topology || null, rest: r.rest || null, miScoringMode: r.miScoringMode || null,
      articleIds: [],
      csvStatus: r.status || null,
      csvLlmCalls: r.llmCalls === '' ? null : Number(r.llmCalls),
      metadataStatusAtHead: meta.status ?? null,
      llmCallsAtHead: (meta.llmUsage && meta.llmUsage.calls) || 0,
      nodesGitTreeAtHead: nodesTree.get(runDir) || null,
      otherRunDirsForSameExperiment: (allDirs.get(r.experimentName) || []).filter((x) => x.runDir !== runDir),
      mtimeSelectionTodayWouldPick: todayPick.get(r.experimentName) || null,
    };
    e.mtimeSelectionTodayMatchesCanonical = e.mtimeSelectionTodayWouldPick === runDir;
    if (AFFECTED[r.experimentName]) e.note = NOTE;
    if (AFFECTED[r.experimentName]) e.affectedCell = AFFECTED[r.experimentName];
    entries.push(e);
  }
  const e = entries[seen.get(r.experimentName)];
  if (e.runDir !== r.runDir) throw new Error(`runDir not unique for ${r.experimentName}`);
  e.articleIds.push(r.articleId);
}

const manifest = {
  title: 'Fixed retained-run manifest for the Phase 2 canonical tables',
  generatedAt: new Date().toISOString(),
  generatedBy: 'thesisExperiment/results_phase2/tables_reconciled/build_manifest.js (read-only over research data)',
  purpose: 'Replaces directory-mtime selection (parse_phase2.js selectCompletedRuns) with an explicit list of the run directories that produced the canonical all_rows.csv, so that a reparse selects the same run IDs after any copy or checkout. Each entry lists the article cells in canonical row order.',
  selectionRule: 'runDir column of the canonical all_rows.csv, taken literally per experimentName; no mtime, status or llmCalls heuristics.',
  canonicalCsv: { path: 'thesisExperiment/results_phase2/tables/all_rows.csv', sha256: sha256(csvBuf), gitBlob: git('rev-parse', 'HEAD:thesisExperiment/results_phase2/tables/all_rows.csv'), producedInCommit: '6efcca1b077139ddfb66b30c8ddc1f17c72b064b (2026-09-19 05:15:17 UTC)' },
  parser: { path: 'thesisExperiment/scripts/parse_phase2.js', sha256: sha256(parserSource) },
  repositoryHead: headCommit,
  counts: {
    experiments: entries.length,
    rows: rows.length,
    entriesWhereMtimeSelectionTodayDiffers: entries.filter((e) => !e.mtimeSelectionTodayMatchesCanonical).length,
    entriesWithMetadataNotCompleteAtHead: entries.filter((e) => !/^complete/.test(String(e.metadataStatusAtHead))).map((e) => e.runDir),
  },
  knownDiscrepancies: Object.entries(AFFECTED).map(([experimentName, a]) => ({ experimentName, runDir: entries[seen.get(experimentName)].runDir, ...a })),
  entries,
};
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ out: outPath, experiments: entries.length, rows: rows.length, mtimeDiffers: manifest.counts.entriesWhereMtimeSelectionTodayDiffers, notComplete: manifest.counts.entriesWithMetadataNotCompleteAtHead, sha256: sha256(fs.readFileSync(outPath)) }, null, 2));
