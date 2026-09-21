/* Regenerate the Phase 2 table set from the fixed retained-run manifest.
 * Uses the original parser's rowFromRun/toCsv source (parse_phase2.js) evaluated in a VM
 * with a read-only fs facade; main() and the parser's directory-creation statement are never run.
 * Writes only into thesisExperiment/results_phase2/tables_reconciled/.
 * Run:  node thesisExperiment/results_phase2/tables_reconciled/regenerate_reconciled.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '../../..');
const RUNS = path.join(ROOT, 'thesisExperiment/runs_phase2');
const OUT = path.resolve(process.env.RECONCILED_OUTPUT_DIR || __dirname);
fs.mkdirSync(OUT, { recursive: true });
const manifestPath = path.join(ROOT, 'thesisExperiment/results_phase2/retained_runs_manifest.json');
const parserPath = path.join(ROOT, 'thesisExperiment/scripts/parse_phase2.js');
const canonicalPath = path.join(ROOT, 'thesisExperiment/results_phase2/tables/all_rows.csv');

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const parserSource = fs.readFileSync(parserPath, 'utf8');
const cut = parserSource.indexOf('\nfunction experimentNameOf(');
if (cut < 0) throw new Error('parser boundary changed; inspect before running');
const prefix = parserSource.slice(0, cut).replace(/fs\.mkdirSync\(path\.join\(OUT, "tables"\), \{ recursive: true \}\);/, '');
if (/mkdirSync|writeFileSync/.test(prefix)) throw new Error('parser prefix still contains a write');
const rofs = Object.freeze({ readFileSync: fs.readFileSync.bind(fs), existsSync: fs.existsSync.bind(fs), readdirSync: fs.readdirSync.bind(fs) });
const sandbox = { require: (n) => (n === 'fs' ? rofs : n === 'path' ? path : (() => { throw new Error(n); })()), __dirname: path.dirname(parserPath) };
vm.runInNewContext(prefix + '\nglobalThis.__row = rowFromRun; globalThis.__csv = toCsv;', sandbox);

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const rows = [];
for (const e of manifest.entries) {
  const dir = path.join(RUNS, e.runDir);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf8'));
  for (const articleId of e.articleIds) rows.push(sandbox.__row(dir, meta, articleId));
}

// Same derived tables and filters as parse_phase2.js main().
const th = rows.filter((r) => r.arm === 'H' && !String(r.experimentName).startsWith('probe'));
const the = rows.filter((r) => r.arm === 'He');
const thesisRows = rows.filter((r) => r.arm === 'H' || r.arm === 'He');
const cont = rows.filter((r) => r.miScoringMode === 'continuous' && (r.arm === 'H' || r.arm === 'He'));
const dual = rows.filter((r) => r.miScoringMode === 'dual' && (r.arm === 'H' || r.arm === 'He'));
const dead = thesisRows.filter((r) => r.dead);
const tables = {
  'all_rows.csv': rows,
  'TH_rows.csv': th,
  'THe_rows.csv': the,
  'continuous.csv': cont,
  'dual_discrete.csv': dual,
  'dual_gap.csv': dual.map((r) => ({ experimentName: r.experimentName, articleId: r.articleId, topology: r.topology, meanDualGap: r.meanDualGap, meanAgreement: r.meanAgreement, meanDiscreteMI: r.meanDiscreteMI, meanContinuousMI: r.meanContinuousMI })),
  'dead_cells.csv': dead,
};
const hashes = {};
for (const [name, tr] of Object.entries(tables)) {
  const text = sandbox.__csv(tr);
  fs.writeFileSync(path.join(OUT, name), text);
  hashes[name] = sha256(Buffer.from(text, 'utf8'));
}

// Line-by-line comparison with the canonical all_rows.csv (same row order by construction).
// The working-tree canonical CSV may be a CRLF checkout; the parser writes LF. Compare line-ending-neutrally.
const canonLines = fs.readFileSync(canonicalPath, 'utf8').replace(/^﻿/, '').split(/\r?\n/);
const newLines = sandbox.__csv(rows).split('\n');
const header = canonLines[0].split(',');
if (newLines[0] !== canonLines[0]) throw new Error('header mismatch');
const diffs = [];
for (let i = 1; i < Math.max(canonLines.length, newLines.length); i++) {
  if (canonLines[i] === newLines[i]) continue;
  const a = (canonLines[i] || '').split(','), b = (newLines[i] || '').split(',');
  const fields = {};
  header.forEach((k, j) => { if (a[j] !== b[j]) fields[k] = { canonical: a[j] ?? null, reconciled: b[j] ?? null }; });
  diffs.push({ csvLine: i + 1, runDir: a[0], experimentName: a[1], articleId: a[7], fields });
}
const METRICS = ['nEvents', 'nScored', 'dead', 'meanMI', 'meanNodeMPR', 'maxMI', 'meanDiscreteMI', 'meanContinuousMI', 'meanDualGap', 'meanAgreement', 'kStarDiscrete', 'kStarContinuous', 'kStarCensoredDiscrete'];
const metricDiffs = diffs.filter((d) => Object.keys(d.fields).some((k) => METRICS.includes(k)));
const nonMetricOnly = diffs.filter((d) => !Object.keys(d.fields).some((k) => METRICS.includes(k)));

const report = {
  generatedAt: new Date().toISOString(),
  method: 'parse_phase2.js source through rowFromRun/toCsv evaluated in a VM with a read-only fs facade; run directories fixed by retained_runs_manifest.json; main() never evaluated; row order identical to canonical all_rows.csv.',
  parserSha256: sha256(parserSource),
  manifestSha256: sha256(fs.readFileSync(manifestPath)),
  canonicalAllRowsSha256: sha256(fs.readFileSync(canonicalPath)),
  rows: rows.length,
  tableSha256: hashes,
  rowsDifferingOnMetricFields: metricDiffs.length,
  rowsDifferingOnStatusOrLlmCallsOnly: nonMetricOnly.length,
  metricDifferences: metricDiffs,
  statusOrLlmCallsOnlyDifferences: nonMetricOnly,
};
fs.writeFileSync(path.join(OUT, 'reconciliation_diff.json'), JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(path.join(OUT, 'SHA256SUMS.txt'), Object.entries(hashes).map(([n, h]) => `${h}  ${n}`).join('\n') + '\n');
console.log(JSON.stringify({ rows: rows.length, metricDiffRows: metricDiffs.length, nonMetricDiffRows: nonMetricOnly.length, hashes, metricDiffs }, null, 2));
