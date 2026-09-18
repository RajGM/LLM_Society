#!/usr/bin/env node
/**
 * Self-check stimuli vs completeness bar (counts only; not ACCEPTANCE.md claims).
 */
const fs = require("fs");
const path = require("path");
const EXP = path.join(__dirname, "..");

function fail(msg) {
  console.error("FAIL:", msg);
  process.exitCode = 1;
}

const articles = JSON.parse(fs.readFileSync(path.join(EXP, "articles", "articles.json"), "utf8")).articles;
const personas = JSON.parse(fs.readFileSync(path.join(EXP, "personas", "expanded_twelve.json"), "utf8")).personas;
const grid = JSON.parse(fs.readFileSync(path.join(EXP, "configs", "grid_full.json"), "utf8"));

console.log(`articles=${articles.length} personas=${personas.length}`);
if (articles.length < 10) fail("need ≥10 articles");
if (personas.length < 10) fail("need ≥10 personas");
for (const a of articles) {
  if (!a.questions || a.questions.length !== 5) fail(`${a.id} needs 5 questions`);
  if (!a.groundTruth || a.groundTruth.length !== 5) fail(`${a.id} needs 5 GT`);
  if (!a.text || a.text.length < 200) fail(`${a.id} text too short`);
}
const types = {};
for (const p of personas) {
  if (!p.systemPrompt || p.systemPrompt.length < 80) fail(`${p.id} prompt short`);
  types[p.debnathType] = (types[p.debnathType] || 0) + 1;
}
console.log("debnathType counts", types);
if ((types.conspiracy_cluster || 0) < 3) fail("need conspiracy variants");
if ((types.climate_action || 0) < 2) fail("need climate-action variants");
if ((types.environmental_concern || 0) < 2) fail("need environmental variants");
if ((types.expert_added || 0) < 2) fail("need expert/journalist for hetero");
if (grid.experimentH.length !== personas.length) fail("H configs != personas");
if (grid.experimentHe.length < 10) fail("He mixes < 10");
if (grid.experimentA.length !== 4) fail("A should be 2×2");
if (grid.articlesAll.length !== articles.length) fail("grid articles mismatch");
if (grid.articlesGraphA.length < 6) fail("A subset < 6");
console.log("H", grid.experimentH.length, "He", grid.experimentHe.length, "A", grid.experimentA.length, "B", grid.experimentB.length);
if (!process.exitCode) console.log("SELF-CHECK OK");
