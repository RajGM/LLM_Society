const fs = require("fs");
const path = require("path");

function readJSON(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function writeJSON(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Atomic read-modify-write to avoid partial writes
function updateJSON(filePath, updaterFn) {
  const data = readJSON(filePath);
  const updated = updaterFn(data);
  writeJSON(filePath, updated);
  return updated;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

module.exports = { readJSON, writeJSON, updateJSON, ensureDir, fileExists };
