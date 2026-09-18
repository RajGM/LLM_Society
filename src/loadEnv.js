/**
 * Zero-dependency .env loader.
 * Reads .env from the project root and injects into process.env.
 * Existing environment variables take precedence (real env always wins over .env).
 * Call once at the very top of index.js before any other require().
 */
const fs   = require("fs");
const path = require("path");

// Known placeholder patterns — these are NOT real API keys
const MOCK_PATTERNS = [
  /mock/i,
  /replace/i,
  /your[_-]?key/i,
  /placeholder/i,
  /example/i,
];

function isMockKey(value) {
  return MOCK_PATTERNS.some((re) => re.test(value));
}

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  const loaded = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key   = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, ""); // strip optional quotes

    if (!key) continue;

    // Real env vars always win
    if (process.env[key] !== undefined) continue;

    process.env[key] = value;
    loaded.push({ key, value });
  }

  if (loaded.length === 0) return;

  // Report what was loaded and flag mock keys
  console.log("[env] Loaded from .env:");
  for (const { key, value } of loaded) {
    if (isMockKey(value)) {
      console.warn(`[env]   ${key} = ${value}`);
      console.warn(`[env]   ^ this looks like a placeholder — replace it with a real key`);
    } else {
      const masked = value.slice(0, 8) + "..." + value.slice(-4);
      console.log(`[env]   ${key} = ${masked}`);
    }
  }
}

module.exports = { loadEnv, isMockKey };
