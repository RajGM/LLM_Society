const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "results", "campaign_manifest.json");
const j = JSON.parse(fs.readFileSync(p, "utf8"));
function red(s) {
  return (s || "")
    .replace(/= [^\n]+/g, "= [REDACTED]")
    .replace(/\("[^"]{6,}"/g, "(\"[REDACTED]\"");
}
if (j.probe) j.probe.stderrTail = red(j.probe.stderrTail);
for (const r of j.runs || []) r.stderrTail = red(r.stderrTail);
fs.writeFileSync(p, JSON.stringify(j, null, 2));
console.log("redacted campaign_manifest.json");
