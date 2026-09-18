#!/usr/bin/env node
/**
 * Phase 2 Debnath reconstruct.
 *
 * Tries, in order:
 *   1. Mendeley 10.17632/546hsym93p.1 tweet IDs
 *   2. OSF osf.io/75ye3 dataset.csv (full file is ~662MB — sample first 5k lines)
 *   3. Twitter/X hydration if a bearer token is present in the environment
 *   4. Documented hashtag co-occurrence graph fallback (NOT a retweet cascade)
 *
 * Writes:
 *   thesisExperiment/data/debnath_hydrated/
 *   thesisExperiment/data/derived/debnath_hashtag_cascade.json
 *   thesisExperiment/data/derived/debnath_reconstruct_report.md
 *   thesisExperiment/configs/phase2/Dnet_*.json
 *
 * Does NOT overwrite thesisExperiment/runs/ or thesisExperiment/results/tables/.
 * Does NOT invent tweets. Does not print secrets. Does not commit .env.
 *
 *   node thesisExperiment/scripts/reconstruct_debnath.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const ROOT = path.join(__dirname, "..", "..");
const EXP = path.join(ROOT, "thesisExperiment");
const RAW = path.join(EXP, "data", "raw");
const HYDRATED = path.join(EXP, "data", "debnath_hydrated");
const DERIVED = path.join(EXP, "data", "derived");
const GEOENG = path.join(EXP, "data", "debnath_geoeng");
const CFG_DIR = path.join(EXP, "configs", "phase2");
const LOG_MD = path.join(EXP, "LOG.md");

const OSF_SAMPLE_LINES = 5000;
const LLM_SUBSAMPLE_MIN = 50;
const LLM_SUBSAMPLE_MAX = 80;
const LLM_SUBSAMPLE_IF_OVER = 200;

const UA = "SocietySimulation-thesisExperiment/1.0 (academic; TUM thesis Debnath reconstruct)";

for (const d of [HYDRATED, DERIVED, CFG_DIR]) fs.mkdirSync(d, { recursive: true });

// ── Env (presence only; never print values) ──────────────────────────────────

function envPresent(name) {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0 && !/^your[-_]?key$/i.test(v.trim());
}

function loadDotEnvPresence() {
  const envPath = path.join(ROOT, ".env");
  const present = {};
  if (!fs.existsSync(envPath)) return present;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const eq = t.indexOf("=");
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (v) present[k] = true;
    if (!process.env[k] && v) process.env[k] = v;
  }
  return present;
}

function detectTwitterBearer() {
  const names = [
    "TWITTER_BEARER_TOKEN",
    "TWITTER_BEARER",
    "X_BEARER_TOKEN",
    "TWITTER_API_BEARER",
    "X_API_BEARER",
    "X_BEARER",
  ];
  for (const n of names) {
    if (envPresent(n)) return { present: true, envName: n };
  }
  return { present: false, envName: null };
}

function detectOpenAi() {
  return envPresent("OPENAI_API_KEY");
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

function fetchResponse(url, { headers = {}, timeoutMs = 45000, maxRedirects = 6 } = {}, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > maxRedirects) return reject(new Error(`Too many redirects: ${url}`));
    const lib = url.startsWith("http://") ? http : https;
    const req = lib.get(url, { headers: { "User-Agent": UA, Accept: "*/*", ...headers } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = new URL(res.headers.location, url).toString();
        res.resume();
        return fetchResponse(next, { headers, timeoutMs, maxRedirects }, redirects + 1).then(resolve, reject);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          buf: Buffer.concat(chunks),
          contentType: res.headers["content-type"] || "",
          headers: res.headers,
          finalUrl: url,
        });
      });
    });
    req.on("error", reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`Timeout: ${url}`)));
  });
}

async function fetchJson(url, opts = {}) {
  const r = await fetchResponse(url, opts);
  const text = r.buf.toString("utf8");
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { ...r, text, json };
}

/**
 * Stream a remote file and keep only the first maxLines (plus header).
 * Aborts the socket once the sample is complete so a 662MB CSV is not stored.
 */
function streamFirstLines(url, destPath, maxLines, { timeoutMs = 90000, maxRedirects = 6 } = {}, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > maxRedirects) return reject(new Error(`Too many redirects: ${url}`));
    const lib = url.startsWith("http://") ? http : https;
    const req = lib.get(url, { headers: { "User-Agent": UA, Accept: "*/*" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = new URL(res.headers.location, url).toString();
        res.resume();
        return streamFirstLines(next, destPath, maxLines, { timeoutMs, maxRedirects }, redirects + 1).then(resolve, reject);
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return resolve({
          ok: false,
          status: res.statusCode,
          contentType: res.headers["content-type"] || "",
          lines: 0,
          bytes: 0,
          dest: destPath,
          finalUrl: url,
        });
      }
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      const out = fs.createWriteStream(destPath);
      let buf = "";
      let lines = 0;
      let bytes = 0;
      let stopped = false;
      const finish = (reason, sampled) => {
        if (stopped) return;
        stopped = true;
        try {
          res.destroy();
        } catch (_) {
          /* ignore */
        }
        out.end(() => {
          resolve({
            ok: true,
            status: res.statusCode,
            contentType: res.headers["content-type"] || "",
            lines,
            bytes,
            dest: destPath,
            finalUrl: url,
            sampled,
            stopReason: reason,
          });
        });
      };
      const stop = (reason) => finish(reason, true);
      res.on("data", (chunk) => {
        if (stopped) return;
        bytes += chunk.length;
        buf += chunk.toString("utf8");
        let idx;
        while (lines < maxLines && (idx = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, idx + 1);
          buf = buf.slice(idx + 1);
          out.write(line);
          lines += 1;
        }
        if (lines >= maxLines) stop("max_lines");
      });
      res.on("end", () => {
        if (stopped) return;
        if (buf.length) {
          out.write(buf);
          if (buf.trim()) lines += 1;
        }
        finish("eof", lines >= maxLines);
      });
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`Timeout streaming: ${url}`)));
  });
}

function looksLikeHtml(contentType, sample) {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("text/html")) return true;
  const s = String(sample || "").slice(0, 200).toLowerCase();
  return s.includes("<!doctype") || s.includes("<html");
}

function firstCsvFieldPair(line) {
  // Row index, tweet_id — do not parse remaining columns (they may contain tweet text / PII).
  const m = String(line || "").match(/^[^,]*,([^,]*)/);
  return m ? m[1].replace(/"/g, "").trim() : "";
}

function classifyTweetIdToken(tok) {
  if (!tok) return "empty";
  if (/e\+\d+$/i.test(tok) || /e-\d+$/i.test(tok)) return "scientific_notation";
  if (/^\d{8,}$/.test(tok)) return "ok_digits";
  return "other";
}

// ── Source attempts ──────────────────────────────────────────────────────────

async function tryMendeley(attempts) {
  const urls = [
    "https://data.mendeley.com/public-api/datasets/546hsym93p/files",
    "https://data.mendeley.com/public-api/datasets/546hsym93p/files?folder_id=root",
    "https://api.elsevier.com/content/datasets/doi/10.17632/546hsym93p.1",
  ];
  const landing = path.join(RAW, "mendeley_546hsym93p_landing.html");
  const outJson = path.join(HYDRATED, "mendeley_files_api.json");
  let last = { ok: false, source: "mendeley", note: "no response" };
  for (const url of urls) {
    try {
      const r = await fetchJson(url, { timeoutMs: 30000 });
      fs.writeFileSync(outJson, r.text.slice(0, 200000));
      const apiError = r.json && (r.json.error || r.json.message);
      const rec = {
        ok: r.status >= 200 && r.status < 300 && !!r.json && !apiError && r.buf.length > 50,
        status: r.status,
        url,
        bytes: r.buf.length,
        dest: path.relative(ROOT, outJson),
        note: apiError ? `API body error ${apiError}` : r.buf.length <= 50 ? "empty/short listing" : null,
      };
      attempts.push({ step: "mendeley_files_api", ...rec });
      if (rec.ok) {
        return { ...rec, json: r.json, landingExists: fs.existsSync(landing) };
      }
      last = rec;
    } catch (err) {
      last = { ok: false, url, error: err.message };
      attempts.push({ step: "mendeley_files_api", ...last });
    }
  }
  attempts.push({
    step: "mendeley_landing",
    ok: fs.existsSync(landing),
    dest: fs.existsSync(landing) ? path.relative(ROOT, landing) : null,
    note: "Landing page only; tweet-ID dump not retrieved.",
  });
  return { ok: false, ...last, landingExists: fs.existsSync(landing) };
}

async function tryOsf(attempts) {
  const guidUrl = "https://api.osf.io/v2/guids/75ye3/";
  const nodeFiles = "https://api.osf.io/v2/nodes/75ye3/files/osfstorage/";
  const downloadGuesses = [
    "https://osf.io/75ye3/download",
    "https://files.osf.io/v1/resources/75ye3/providers/osfstorage/",
  ];
  let downloadUrl = null;
  let guidMeta = null;
  try {
    const g = await fetchJson(guidUrl, { timeoutMs: 30000 });
    fs.writeFileSync(path.join(HYDRATED, "osf_75ye3_guid.json"), g.text.slice(0, 200000));
    attempts.push({ step: "osf_guid", ok: g.status === 200, status: g.status, bytes: g.buf.length });
    guidMeta = g.json;
    const attrs = g.json && g.json.data && g.json.data.attributes;
    const links = g.json && g.json.data && g.json.data.links;
    if (links && links.download) downloadUrl = links.download;
    else if (attrs && attrs.guid) downloadUrl = `https://osf.io/${attrs.guid}/download`;
    const referent = g.json && (g.json.data.relationships || {});
    if (!downloadUrl && g.json && g.json.data && g.json.data.id) {
      downloadUrl = `https://osf.io/${g.json.data.id}/download`;
    }
  } catch (err) {
    attempts.push({ step: "osf_guid", ok: false, error: err.message });
  }
  try {
    const n = await fetchJson(nodeFiles, { timeoutMs: 30000 });
    fs.writeFileSync(path.join(HYDRATED, "osf_75ye3_files.json"), n.text.slice(0, 200000));
    attempts.push({ step: "osf_node_files", ok: n.status === 200, status: n.status, bytes: n.buf.length });
    const files = n.json && n.json.data;
    if (Array.isArray(files)) {
      const csv = files.find((f) => {
        const name = (f.attributes && f.attributes.name) || "";
        return /dataset\.csv/i.test(name) || /\.csv$/i.test(name);
      });
      if (csv && csv.links && csv.links.download) downloadUrl = csv.links.download;
    }
  } catch (err) {
    attempts.push({ step: "osf_node_files", ok: false, error: err.message });
  }

  const urlsToTry = [downloadUrl, ...downloadGuesses].filter(Boolean);
  const idOnlyPath = path.join(HYDRATED, "osf_tweet_id_tokens_5k.txt");
  for (const url of urlsToTry) {
    try {
      const streamed = await streamFirstLines(url, path.join(HYDRATED, "_osf_raw_tmp.csv"), OSF_SAMPLE_LINES, {
        timeoutMs: 90000,
      });
      const tmp = path.join(HYDRATED, "_osf_raw_tmp.csv");
      const head = fs.existsSync(tmp) ? fs.readFileSync(tmp, "utf8").slice(0, 800) : "";
      const html = looksLikeHtml(streamed.contentType, head);
      const headerLine = head.split(/\r?\n/)[0] || "";
      const looksCsv = /tweet_id/i.test(headerLine) && !/^\s*[\[{]/.test(String(head).trim());
      const hasPiiColumns = /(?:^|,)(text|user_name|user_description|user_location|user_profile_image_url|sourcetweet_text)(?:,|$)/i.test(
        headerLine
      );
      const counts = { lines: 0, ok_digits: 0, scientific_notation: 0, other: 0, empty: 0 };
      const usableIds = [];
      if (streamed.ok && !html && looksCsv && fs.existsSync(tmp)) {
        const raw = fs.readFileSync(tmp, "utf8");
        const lines = raw.split(/\r?\n/);
        const outIds = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          if (i === 0 && /tweet_id/i.test(line)) continue;
          counts.lines += 1;
          const tok = firstCsvFieldPair(line) || line.split(/[,;\t]/)[0].replace(/"/g, "").trim();
          const kind = classifyTweetIdToken(tok);
          counts[kind] = (counts[kind] || 0) + 1;
          if (kind === "ok_digits") {
            usableIds.push(tok);
            outIds.push(tok);
          } else if (kind === "scientific_notation") {
            outIds.push(tok);
          }
        }
        fs.writeFileSync(idOnlyPath, outIds.slice(0, OSF_SAMPLE_LINES).join("\n") + "\n");
      }
      // Always drop the raw CSV: OSF file includes tweet text and user fields.
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      const csvOk = streamed.ok && !html && looksCsv && counts.lines > 0;
      if (csvOk) {
        const idJson = path.join(HYDRATED, "osf_id_sample.json");
        fs.writeFileSync(
          idJson,
          JSON.stringify(
            {
              source: "OSF osf.io/75ye3 dataset.csv SAMPLE — first 5k lines only, not the ~662MB dump",
              warning:
                "The OSF CSV is NOT tweet-IDs-only: it has text, user_name, user_description, location, profile image. Raw rows were discarded. tweet_id values in this sample are mostly Excel scientific notation (precision lost) and cannot be hydrated.",
              nLinesKept: counts.lines,
              nIdsScientificNotation: counts.scientific_notation,
              nIdsUsableDigits: counts.ok_digits,
              headerColumnsOnly: headerLine
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean),
              hasPiiColumns,
              usableDigitIds: usableIds.slice(0, 50),
              exampleScientificToken: "1.00048E+18",
            },
            null,
            2
          )
        );
      }
      attempts.push({
        step: "osf_dataset_sample",
        ok: csvOk,
        status: streamed.status,
        url,
        lines: counts.lines,
        bytes: streamed.bytes,
        contentType: streamed.contentType,
        html,
        looksCsv,
        sampled: streamed.sampled,
        stopReason: streamed.stopReason,
        piiDiscarded: hasPiiColumns,
        nIdsScientificNotation: counts.scientific_notation,
        nIdsUsableDigits: counts.ok_digits,
        note: looksCsv ? null : "response was not dataset.csv (HTML/JSON listing)",
      });
      if (csvOk) {
        return {
          ok: true,
          samplePath: idOnlyPath,
          ids: usableIds,
          lines: counts.lines,
          downloadUrl: url,
          guidMeta: guidMeta ? "saved" : null,
          piiDiscarded: hasPiiColumns,
          nScientific: counts.scientific_notation,
        };
      }
    } catch (err) {
      const tmp = path.join(HYDRATED, "_osf_raw_tmp.csv");
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      attempts.push({ step: "osf_dataset_sample", ok: false, url, error: err.message });
    }
  }
  attempts.push({
    step: "osf_landing_cached",
    ok: fs.existsSync(path.join(RAW, "osf_75ye3_landing.html")),
    note: "SPA landing HTML only; 662MB dataset.csv not stored.",
  });
  return { ok: false, ids: [], samplePath: null };
}

async function hydrateTweets(ids, bearer, attempts) {
  if (!bearer.present) {
    attempts.push({
      step: "twitter_hydrate",
      ok: false,
      skipped: true,
      reason: "no_bearer_token",
      note: "No Twitter/X bearer in env. Not inventing tweets.",
    });
    return { ok: false, tweets: [], users: [] };
  }
  const unique = [...new Set(ids)].slice(0, 100); // one lookup batch; do not hammer API
  if (!unique.length) {
    attempts.push({ step: "twitter_hydrate", ok: false, skipped: true, reason: "no_ids" });
    return { ok: false, tweets: [], users: [] };
  }
  const token = process.env[bearer.envName];
  const url =
    "https://api.twitter.com/2/tweets?ids=" +
    unique.join(",") +
    "&tweet.fields=created_at,author_id,conversation_id,public_metrics,referenced_tweets" +
    "&expansions=author_id,referenced_tweets.id" +
    "&user.fields=description,public_metrics,verified,username";
  try {
    const r = await fetchJson(url, {
      timeoutMs: 45000,
      headers: { Authorization: `Bearer ${token}` },
    });
    const outPath = path.join(HYDRATED, "hydrated_tweets.json");
    fs.writeFileSync(outPath, r.text);
    const nTweets = r.json && Array.isArray(r.json.data) ? r.json.data.length : 0;
    const nUsers =
      r.json && r.json.includes && Array.isArray(r.json.includes.users) ? r.json.includes.users.length : 0;
    attempts.push({
      step: "twitter_hydrate",
      ok: r.status === 200 && nTweets > 0,
      status: r.status,
      nIdsRequested: unique.length,
      nTweets,
      nUsers,
      envName: bearer.envName,
    });
    return {
      ok: r.status === 200 && nTweets > 0,
      tweets: (r.json && r.json.data) || [],
      users: (r.json && r.json.includes && r.json.includes.users) || [],
    };
  } catch (err) {
    attempts.push({ step: "twitter_hydrate", ok: false, error: err.message, envName: bearer.envName });
    return { ok: false, tweets: [], users: [] };
  }
}

function cascadeFromHydrated(tweets, users) {
  const byId = Object.fromEntries(users.map((u) => [String(u.id), u]));
  const user_profiles = {};
  const retweets = [];
  let seed = null;
  for (const t of tweets) {
    const uid = String(t.author_id || "");
    if (!uid) continue;
    const u = byId[uid] || {};
    user_profiles[uid] = {
      followers: (u.public_metrics && u.public_metrics.followers_count) || 0,
      verified: !!u.verified,
      description: u.description || "",
      username: u.username || "",
    };
    const refs = t.referenced_tweets || [];
    const rt = refs.find((x) => x.type === "retweeted" || x.type === "quoted" || x.type === "replied_to");
    if (rt && rt.id) {
      const parent = tweets.find((p) => String(p.id) === String(rt.id));
      const from = parent ? String(parent.author_id) : null;
      if (from && from !== uid) {
        retweets.push({
          user_id: uid,
          retweeted_from: from,
          timestamp: t.created_at || null,
          tweet_id: t.id,
        });
      }
    } else if (!seed) {
      seed = uid;
    }
  }
  if (!seed) {
    const ids = Object.keys(user_profiles);
    seed = ids[0] || "unknown";
  }
  return {
    news_id: "debnath_hydrated_sample",
    label: "unknown",
    source: "Twitter/X API hydration of Debnath tweet-ID sample",
    seed_user: seed,
    tweet_ids: tweets.map((t) => t.id),
    retweets,
    user_profiles,
    _hydration: { nTweets: tweets.length, nUsers: users.length },
  };
}

// ── Documented hashtag co-occurrence fallback ────────────────────────────────
// Evidence: Debnath, Reiner, Sovacool et al., iScience 26, 106166 (2023), PMC10040962.
// Hashtag regex from Ramit1201/geoeng hashtag_ext: #[a-zA-Z0-9_-]+
// This is a USER graph whose membership is keyed by published hashtags, not
// a reconstruction of 814,924 retweet chains.

/**
 * Published hashtags + cluster membership.
 * `accounts` = how many FakeNewsNet user nodes to instantiate for that tag
 * (hubs get more; periphery gets one). Total target 40–80.
 */
const HASHTAG_SPEC = [
  // Chemtrails / conspiracy cluster — Table 1; Figure 2/3; 2018–2021 broadening
  { tag: "chemtrails", cluster: "chemtrails", centrality: "high", accounts: 4, followers: [85000, 18000, 12000, 420] },
  { tag: "geoengineering", cluster: "chemtrails", centrality: "high", accounts: 2, followers: [22000, 3500] },
  { tag: "haarp", cluster: "chemtrails", centrality: "high", accounts: 2, followers: [16000, 2100] },
  { tag: "srm", cluster: "chemtrails", centrality: "mid", accounts: 2, followers: [6400, 880] },
  { tag: "sag", cluster: "chemtrails", centrality: "mid", accounts: 1, followers: [4100] },
  { tag: "weathermodification", cluster: "chemtrails", centrality: "mid", accounts: 2, followers: [7800, 960] },
  { tag: "nexrad", cluster: "chemtrails", centrality: "mid", accounts: 1, followers: [1900] },
  { tag: "weatherwarfare", cluster: "chemtrails", centrality: "mid", accounts: 1, followers: [2400] },
  { tag: "stopspraying", cluster: "chemtrails", centrality: "mid", accounts: 2, followers: [9100, 670] },
  { tag: "nwo", cluster: "chemtrails", centrality: "mid", accounts: 2, followers: [11000, 540] },
  { tag: "illuminati", cluster: "chemtrails", centrality: "low", accounts: 1, followers: [3200] },
  { tag: "gmo", cluster: "chemtrails", centrality: "low", accounts: 1, followers: [2700] },
  { tag: "depopulation", cluster: "chemtrails", centrality: "mid", accounts: 1, followers: [5600] },
  { tag: "monsanto", cluster: "chemtrails", centrality: "low", accounts: 1, followers: [1500] },
  { tag: "deepstate", cluster: "chemtrails", centrality: "mid", accounts: 1, followers: [14000] },
  { tag: "maga", cluster: "chemtrails", centrality: "mid", accounts: 1, followers: [19000] },
  { tag: "greatawakening", cluster: "chemtrails", centrality: "low", accounts: 1, followers: [4800] },
  // Climate-action / justice / SG-governance — Sweden SCoPEx, p0175, p0210
  { tag: "climateaction", cluster: "climate_action", centrality: "high", accounts: 2, followers: [31000, 4200] },
  { tag: "climatejustice", cluster: "climate_action", centrality: "high", accounts: 2, followers: [24000, 2800] },
  { tag: "climate", cluster: "climate_action", centrality: "mid", accounts: 1, followers: [9000] },
  { tag: "fridaysforfuture", cluster: "climate_action", centrality: "mid", accounts: 1, followers: [17000] },
  { tag: "cop26", cluster: "climate_action", centrality: "mid", accounts: 1, followers: [7200] },
  { tag: "ipcc", cluster: "climate_action", centrality: "mid", accounts: 1, followers: [11000] },
  { tag: "wedonotconsent", cluster: "climate_action", centrality: "high", accounts: 2, followers: [8600, 1100] },
  { tag: "sweden", cluster: "climate_action", centrality: "high", accounts: 2, followers: [5400, 760] },
  { tag: "scopex", cluster: "climate_action", centrality: "high", accounts: 2, followers: [4800, 620] },
  { tag: "actonclimate", cluster: "climate_action", centrality: "mid", accounts: 1, followers: [3900] },
  { tag: "netzero", cluster: "climate_action", centrality: "low", accounts: 1, followers: [2600] },
  // Environmental concern after chemtrails filter — Figure 4 / p0160
  { tag: "ozone", cluster: "environmental", centrality: "high", accounts: 2, followers: [7200, 980] },
  { tag: "biodiversity", cluster: "environmental", centrality: "high", accounts: 2, followers: [6100, 840] },
  { tag: "airpollution", cluster: "environmental", centrality: "mid", accounts: 2, followers: [4500, 510] },
  { tag: "foodsecurity", cluster: "environmental", centrality: "mid", accounts: 1, followers: [2300] },
  { tag: "ecology", cluster: "environmental", centrality: "mid", accounts: 1, followers: [1800] },
  { tag: "environment", cluster: "environmental", centrality: "mid", accounts: 1, followers: [3400] },
  { tag: "publichealth", cluster: "environmental", centrality: "mid", accounts: 2, followers: [5200, 430] },
  { tag: "stratosphere", cluster: "environmental", centrality: "mid", accounts: 1, followers: [1600] },
  { tag: "sai", cluster: "environmental", centrality: "mid", accounts: 1, followers: [2100] },
  { tag: "mitigation", cluster: "environmental", centrality: "low", accounts: 1, followers: [1400] },
  // Geospecific hashtags used for country co-occurrence nets — Figure 5/6
  { tag: "usa", cluster: "geo", centrality: "mid", accounts: 1, followers: [3300] },
  { tag: "uk", cluster: "geo", centrality: "mid", accounts: 1, followers: [2900] },
  { tag: "india", cluster: "geo", centrality: "mid", accounts: 1, followers: [2500] },
  // 2018–2021 climate-action piggyback (conspiracy using action hashtags) — Figure 3
  { tag: "climateaction_piggyback", cluster: "piggyback", centrality: "mid", accounts: 2, followers: [6700, 390], displayTag: "climateaction" },
];

/** Documented co-occurrence / same-cluster pairs (undirected intent; we emit directed edges). */
const DOCUMENTED_PAIRS = [
  // Table 1 toxic tweets: chemtrails + haarp + geoengineering + srm/sag/nexrad/nwo
  ["chemtrails", "haarp", "table1"],
  ["chemtrails", "geoengineering", "table1"],
  ["chemtrails", "srm", "table1"],
  ["chemtrails", "sag", "table1"],
  ["chemtrails", "nexrad", "table1"],
  ["chemtrails", "nwo", "table1"],
  ["chemtrails", "illuminati", "table1"],
  ["chemtrails", "gmo", "table1"],
  ["geoengineering", "haarp", "table1"],
  ["geoengineering", "srm", "table1"],
  ["haarp", "weathermodification", "fig3_2009_2012_neighbours"],
  ["haarp", "nexrad", "table1"],
  ["haarp", "weatherwarfare", "table1"],
  ["nwo", "illuminati", "table1"],
  ["nwo", "deepstate", "fig6_usa_trump_deepstate"],
  ["maga", "deepstate", "fig6_usa_trump_deepstate"],
  ["maga", "greatawakening", "p0215_usa"],
  ["depopulation", "chemtrails", "fig3_2018_2021"],
  ["stopspraying", "chemtrails", "fig3_2018_2021"],
  ["monsanto", "gmo", "table1"],
  // Climate action / Sweden SCoPEx
  ["climateaction", "climatejustice", "p0160_nonconspiracy"],
  ["climateaction", "sweden", "p0175_sweden_climate_action"],
  ["sweden", "scopex", "p0175_sweden_scopex"],
  ["sweden", "wedonotconsent", "p0175_home_etc"],
  ["scopex", "wedonotconsent", "p0175_scopex_protests"],
  ["climateaction", "fridaysforfuture", "climate_action_cluster"],
  ["climateaction", "cop26", "governance_events"],
  ["ipcc", "climate", "governance_events"],
  ["actonclimate", "geoengineering", "table1_uk_actonclimate"],
  ["netzero", "climateaction", "governance_events"],
  // Figure 4 environmental terms after chemtrails filter
  ["ozone", "stratosphere", "fig4"],
  ["ozone", "sai", "fig4"],
  ["biodiversity", "ecology", "fig4"],
  ["biodiversity", "foodsecurity", "fig4"],
  ["airpollution", "publichealth", "fig4_p0160"],
  ["environment", "ozone", "fig4"],
  ["mitigation", "climateaction", "fig4"],
  ["sai", "srm", "sg_governance_bridge"],
  // p0210 UK: conspiracy hashtags moderate influence (0.1–0.3) on public health,
  // climate justice, SG governance
  ["chemtrails", "publichealth", "p0210_uk_moderate_influence"],
  ["chemtrails", "climatejustice", "p0210_uk_moderate_influence"],
  ["chemtrails", "climateaction", "p0210_uk_sg_governance"],
  ["haarp", "ozone", "p0210_uk_moderate_influence"],
  // Geospecific co-occurrence (Figure 5/6)
  ["usa", "chemtrails", "fig5_usa"],
  ["uk", "chemtrails", "fig5_uk"],
  ["india", "weatherwarfare", "fig6d_india"],
  ["india", "chemtrails", "fig5_india"],
  ["sweden", "chemtrails", "fig5c_sweden_us_scopex"],
  // Piggyback bridges — 2018–2021 climate-action wording + spraying
  ["climateaction_piggyback", "chemtrails", "fig3_2018_2021_piggyback"],
  ["climateaction_piggyback", "climateaction", "fig3_2018_2021_piggyback"],
  ["climateaction_piggyback", "stopspraying", "fig3_2018_2021_piggyback"],
];

function clusterBio(cluster, tag, role) {
  const bios = {
    chemtrails: {
      hub: `High-follower #${tag} amplifier in Debnath chemtrails conspiracy cluster. Keywords: chemtrails spraying HAARP geoengineering weather modification NWO conspiracy. Looking up. Stop spraying.`,
      amp: `Chemtrails / geoengineering conspiracy account. Keywords: chemtrails spraying geoengineering HAARP #${tag}.`,
      peri: `Ordinary skywatcher. Keywords: chemtrails geoengineering climate. First-person sky reports, not a hub.`,
    },
    climate_action: {
      hub: `Climate action / justice advocate. Keywords: climate action climate justice mitigation equity progressive environment. Not a chemtrails believer. #${tag}`,
      amp: `Climate policy communicator. Keywords: climate justice climate action mitigation #${tag}.`,
      peri: `Local climate volunteer. Keywords: climate environment justice #${tag}.`,
    },
    environmental: {
      hub: `Environmental science / ecology concern. Keywords: climate environment ozone biodiversity ecology science research #${tag}.`,
      amp: `Air quality and ecosystems. Keywords: environment ozone air pollution public health science #${tag}.`,
      peri: `Concerned reader. Keywords: environment biodiversity food security #${tag}.`,
    },
    geo: {
      hub: `Geospecific #${tag} discussion of solar geoengineering. Keywords: climate geoengineering #${tag}.`,
      amp: `Country-tag account #${tag}. Keywords: climate environment #${tag}.`,
      peri: `Geotagged lurker #${tag}. Keywords: climate #${tag}.`,
    },
    piggyback: {
      hub: `Climate-action piggyback (Debnath 2018–2021). Keywords: climate action climate justice chemtrails spraying geoengineering stop spraying. Copies justice hashtags into conspiracy.`,
      amp: `Stop-spraying plus climate hashtags. Keywords: climateaction chemtrails geoengineering.`,
      peri: `Piggyback periphery. Keywords: climateaction chemtrails.`,
    },
  };
  const pack = bios[cluster] || bios.chemtrails;
  return pack[role] || pack.amp;
}

function intendedBp(cluster, tag, role, followers) {
  if (cluster === "piggyback") return "conspiracy_climate_piggyback";
  if (cluster === "climate_action") {
    if (tag === "ipcc") return "climate_scientist";
    return "climate_action_advocate";
  }
  if (cluster === "environmental") {
    if (tag === "ozone" || tag === "stratosphere" || tag === "sai") return "ozone_stratosphere_specialist";
    if (tag === "biodiversity" || tag === "foodsecurity") return "biodiversity_food_security";
    if (tag === "mitigation") return "mitigation_first_policy";
    return "environmental_concern";
  }
  if (cluster === "geo") return "climate_action_advocate";
  // chemtrails cluster
  if (/haarp|weather|nexrad/.test(tag)) return "conspiracy_haarp_weather";
  if (tag === "depopulation") return "conspiracy_depopulation";
  if (role === "peri" || followers < 1000) return "conspiracy_peripheral_skywatcher";
  if (tag === "maga" || tag === "deepstate" || tag === "greatawakening" || tag === "nwo") {
    return "conspiracy_believer";
  }
  return "conspiracy_believer";
}

function mapBpKeywords(description, fallback) {
  const bio = (description || "").toLowerCase();
  const rules = [
    [/piggyback|copies justice|climateaction chemtrails|climate action climate justice chemtrails/, "conspiracy_climate_piggyback"],
    [/haarp|weather warfare|weathermodification|nexrad/, "conspiracy_haarp_weather"],
    [/depopulation|population control/, "conspiracy_depopulation"],
    [/skywatcher|ordinary sky|first-person sky/, "conspiracy_peripheral_skywatcher"],
    [/chemtrails|spraying|nwo|illuminati/, "conspiracy_believer"],
    [/ozone|stratosphere/, "ozone_stratosphere_specialist"],
    [/biodiversity|food security/, "biodiversity_food_security"],
    [/mitigation/, "mitigation_first_policy"],
    [/journalist|reporter|news/, "science_journalist"],
    [/phd|professor|scientist|research/, "climate_scientist"],
    [/climate action|climate justice|progressive|equity/, "climate_action_advocate"],
    [/environment|ecology|air pollution|public health/, "environmental_concern"],
  ];
  for (const [re, id] of rules) {
    if (re.test(bio)) return id;
  }
  return fallback || "conspiracy_believer";
}

function buildHashtagCascade() {
  const users = [];
  const byTag = {};
  const seedUser = "chemtrails_hub";

  for (const spec of HASHTAG_SPEC) {
    byTag[spec.tag] = [];
    for (let i = 0; i < spec.accounts; i++) {
      const followers = spec.followers[i] != null ? spec.followers[i] : 200;
      const role = i === 0 && spec.centrality === "high" ? "hub" : followers < 1000 ? "peri" : "amp";
      const id =
        spec.tag === "chemtrails" && i === 0
          ? seedUser
          : `${spec.tag}_${role}${i === 0 ? "" : `_${i}`}`;
      const display = spec.displayTag || spec.tag;
      users.push({
        id,
        tag: spec.tag,
        displayTag: display,
        cluster: spec.cluster,
        centrality: spec.centrality,
        role,
        followers,
        verified: false,
        description: clusterBio(spec.cluster, display, role),
        intendedBp: intendedBp(spec.cluster, spec.tag, role, followers),
      });
      byTag[spec.tag].push(id);
    }
  }

  // Expert add-ons so mixed Debnath BPs can map journalist / scientist
  users.push({
    id: "science_journalist_hub",
    tag: "climatenews",
    displayTag: "climatenews",
    cluster: "expert",
    centrality: "mid",
    role: "hub",
    followers: 28000,
    verified: true,
    description:
      "Science journalist covering climate and geoengineering. Keywords: journalist reporter science research climate news editor.",
    intendedBp: "science_journalist",
  });
  users.push({
    id: "climate_scientist_hub",
    tag: "climatescience",
    displayTag: "climatescience",
    cluster: "expert",
    centrality: "mid",
    role: "hub",
    followers: 9400,
    verified: false,
    description:
      "Climate science research PhD / academic. Keywords: science research phd professor academic climate environment geoengineering SAI.",
    intendedBp: "climate_scientist",
  });
  byTag.climatenews = ["science_journalist_hub"];
  byTag.climatescience = ["climate_scientist_hub"];

  function identityFromCluster(cluster) {
    if (cluster === "chemtrails" || cluster === "piggyback") return "conspiracy";
    if (cluster === "climate_action" || cluster === "geo") return "climate_action";
    if (cluster === "environmental") return "environmental_concern";
    return "other";
  }
  function toxFromIdentity(identity) {
    if (identity === "conspiracy") return 0.17;
    if (identity === "environmental_concern") return 0.08;
    if (identity === "climate_action") return 0.05;
    return 0.04;
  }

  const user_profiles = {};
  const identityMix = { conspiracy: 0, climate_action: 0, environmental_concern: 0, other: 0 };
  for (const u of users) {
    const identity = identityFromCluster(u.cluster);
    identityMix[identity] = (identityMix[identity] || 0) + 1;
    u.identity = identity;
    u.toxicityPrior = toxFromIdentity(identity);
    user_profiles[u.id] = {
      followers: u.followers,
      verified: u.verified,
      description: u.description,
      hashtag: `#${u.displayTag}`,
      cluster: u.cluster,
      identity,
      toxicityPrior: u.toxicityPrior,
      centrality: u.centrality,
      role: u.role,
      intended_debnath_bp: u.intendedBp,
    };
  }

  const edgeSet = new Set();
  const retweets = [];

  function addEdge(from, to, evidence, trustHint) {
    if (!from || !to || from === to) return;
    const key = `${from}->${to}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    retweets.push({
      user_id: to,
      retweeted_from: from,
      timestamp: null,
      edge_type: "hashtag_cooccurrence",
      evidence,
      _trustHint: trustHint,
      _timestampSynthetic: true,
    });
  }

  function trustFor(a, b) {
    if (a.cluster === b.cluster) return a.cluster === "chemtrails" ? 0.82 : 0.74;
    if (a.cluster === "piggyback" || b.cluster === "piggyback") return 0.55;
    return 0.32;
  }

  // Documented pairs: hub-to-hub plus same-tag hub→amp
  for (const [a, b, evidence] of DOCUMENTED_PAIRS) {
    const A = byTag[a] || [];
    const B = byTag[b] || [];
    if (!A.length || !B.length) continue;
    const ua = users.find((u) => u.id === A[0]);
    const ub = users.find((u) => u.id === B[0]);
    addEdge(A[0], B[0], evidence, trustFor(ua, ub));
    addEdge(B[0], A[0], evidence, trustFor(ub, ua));
    if (A[1]) addEdge(A[0], A[1], `same_hashtag_#${a}`, 0.8);
    if (B[1]) addEdge(B[0], B[1], `same_hashtag_#${b}`, 0.8);
  }

  // Same-cluster extra edges (not a complete graph): each node → 2 others in cluster
  const byCluster = {};
  for (const u of users) {
    (byCluster[u.cluster] = byCluster[u.cluster] || []).push(u);
  }
  for (const list of Object.values(byCluster)) {
    for (let i = 0; i < list.length; i++) {
      const nLink = Math.min(2, list.length - 1);
      for (let k = 1; k <= nLink; k++) {
        const j = (i + k) % list.length;
        addEdge(list[i].id, list[j].id, `same_cluster_${list[i].cluster}`, trustFor(list[i], list[j]));
      }
    }
  }

  // Chemtrails hub radiates to remaining chemtrails accounts (high-centrality amplifier)
  const chem = byCluster.chemtrails || [];
  for (const u of chem) {
    if (u.id !== seedUser) addEdge(seedUser, u.id, "chemtrails_hub_outstar", 0.85);
  }

  // Expert nodes attach to environmental + climate-action hubs (not conspiracy)
  addEdge("climate_scientist_hub", byTag.ozone[0], "expert_ozone", 0.7);
  addEdge("climate_scientist_hub", byTag.sai[0], "expert_sai", 0.7);
  addEdge("science_journalist_hub", byTag.climateaction[0], "journalist_action", 0.65);
  addEdge("science_journalist_hub", "climate_scientist_hub", "journalist_science", 0.72);

  // Guarantee every user appears in at least one edge
  const seen = new Set();
  for (const rt of retweets) {
    seen.add(rt.user_id);
    seen.add(rt.retweeted_from);
  }
  for (const u of users) {
    if (!seen.has(u.id)) addEdge(seedUser, u.id, "orphan_attach_to_seed", 0.35);
  }

  const graph_topology = {
    nodes: users.map((u) => ({
      nodeId: u.id,
      personaId: u.intendedBp,
      identity: u.identity,
      hashtag: `#${u.displayTag}`,
      toxicityPrior: u.toxicityPrior,
    })),
    edges: retweets.map((rt) => ({
      from: rt.retweeted_from,
      to: rt.user_id,
      trust: rt._trustHint != null ? rt._trustHint : 0.6,
      weight: 1,
      kind: "hashtag_cooccurrence",
    })),
  };
  const seenCooc = new Set();
  const cooccurrence = [];
  for (const rt of retweets) {
    const a = rt.retweeted_from;
    const b = rt.user_id;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seenCooc.has(key)) continue;
    seenCooc.add(key);
    cooccurrence.push({ source: a, target: b, weight: 1, evidence: rt.evidence });
  }

  return {
    schema: "thesisExperiment.debnath_hashtag_cascade.v1",
    kind: "hashtag_cooccurrence",
    notARetweetCascade: true,
    generatedFallback: false,
    reconstructOutput: true,
    temporalAvailable: false,
    empiricalMPR: false,
    _comment:
      "NOT a retweet cascade and NOT hydrated Debnath tweets. FakeNewsNet-shaped JSON so RealGraphImporter can read a documented hashtag co-occurrence / same-cluster graph (Debnath et al. 2023). Edges reuse the importer's retweets[] field only as a directed-edge container.",
    news_id: "debnath_hashtag_cooccurrence_fallback",
    label: "empirical_hashtag_fallback",
    article_text:
      "Importer placeholder only — not tweet text. Simulation seeds are thesis articles scopex_2017 and chemtrails_gates_2018_2021. Debnath 814,924 tweets were not hydrated.",
    seed_user: seedUser,
    seed_hashtag: "#chemtrails",
    edge_semantics: "hashtag_cooccurrence_same_cluster",
    source:
      "Debnath et al. iScience 2023 (PMC10040962) Table 1, Figures 3–6, p0160/p0175/p0210; GitHub Ramit1201/geoeng hashtag_ext",
    toxicity: {
      mean: 0.17,
      severeMean: 0.12,
      source: "Debnath 2023 Table 1 paper-quoted; not tweet-level Perspective scores",
    },
    identityMix,
    hashtags: HASHTAG_SPEC.map((s) => ({
      id: s.tag,
      tag: `#${s.displayTag || s.tag}`,
      cluster: s.cluster,
      identity: identityFromCluster(s.cluster),
      toxicityPrior: toxFromIdentity(identityFromCluster(s.cluster)),
    })),
    tweet_ids: [],
    retweets,
    cooccurrence,
    user_profiles,
    graph_topology,
    honesty: {
      empiricalMPR: false,
      simulatedMIIsNotTwitterMI: true,
      hashtagCooccurrenceIsNotRetweetCascade: true,
      hydratedTweets: false,
      timestampsSynthetic: true,
      notes: [
        "Debnath has NO empirical MPR. Do not claim simulated MI equals Twitter MI.",
        "Hashtag co-occurrence is a structural/hashtag fallback, not a hydrated retweet cascade.",
        "814k tweet IDs were not hydrated; BPs are theory-faithful reductions, not HDBSCAN centroids.",
        "8 hops/ticks is logged cost compression vs CIKM 30, not a Debnath hop protocol.",
      ],
    },
    _meta: {
      nUsers: users.length,
      nEdges: retweets.length,
      clusters: Object.fromEntries(Object.entries(byCluster).map(([k, v]) => [k, v.length])),
      documentedPairs: DOCUMENTED_PAIRS.length,
      deterministic: true,
    },
  };
}

function subsampleCascade(cascade, target) {
  const profiles = cascade.user_profiles || {};
  const seed = String(cascade.seed_user);
  const adj = {};
  for (const rt of cascade.retweets || []) {
    const a = String(rt.retweeted_from);
    const b = String(rt.user_id);
    if (!a || !b) continue;
    (adj[a] = adj[a] || []).push(b);
    (adj[b] = adj[b] || []).push(a);
  }
  const score = (id) => (profiles[id] && profiles[id].followers) || 0;
  const keep = new Set([seed]);
  const q = [seed];
  while (q.length && keep.size < target) {
    const cur = q.shift();
    const nbrs = (adj[cur] || []).slice().sort((a, b) => score(b) - score(a));
    for (const n of nbrs) {
      if (keep.size >= target) break;
      if (!keep.has(n)) {
        keep.add(n);
        q.push(n);
      }
    }
  }
  const ids = Object.keys(profiles).sort((a, b) => score(b) - score(a));
  for (const id of ids) {
    if (keep.size >= target) break;
    keep.add(id);
  }
  const retweets = (cascade.retweets || []).filter(
    (rt) => keep.has(String(rt.user_id)) && keep.has(String(rt.retweeted_from))
  );
  const user_profiles = {};
  for (const id of keep) {
    if (profiles[id]) user_profiles[id] = profiles[id];
  }
  return {
    ...cascade,
    news_id: (cascade.news_id || "debnath") + "_llm_subsample",
    seed_user: seed,
    retweets,
    user_profiles,
    _subsample: { kept: keep.size, from: Object.keys(profiles).length, target },
  };
}

function resolvePersonasPath(kind) {
  const homo = path.join(EXP, "personas", "phase2", "homogeneous_conspiracy.json");
  const mixed = path.join(EXP, "personas", "phase2", "mixed_graph.json");
  const phase2Dir = path.join(EXP, "personas", "phase2");
  const expanded = path.join(EXP, "personas", "expanded_twelve.json");
  if (kind === "homo" && fs.existsSync(homo)) {
    return { rel: "thesisExperiment/personas/phase2/homogeneous_conspiracy.json", abs: homo };
  }
  if (kind === "mixed" && fs.existsSync(mixed)) {
    return { rel: "thesisExperiment/personas/phase2/mixed_graph.json", abs: mixed };
  }
  if (fs.existsSync(phase2Dir) && kind === "mixed") {
    const merged = path.join(EXP, "personas", "merged.json");
    if (fs.existsSync(merged)) return { rel: "thesisExperiment/personas/merged.json", abs: merged };
  }
  return { rel: "thesisExperiment/personas/expanded_twelve.json", abs: expanded };
}

function personaIdsIn(file) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return new Set((data.personas || []).map((p) => p.id));
}

function coercePersona(id, allowed) {
  if (allowed.has(id)) return id;
  const fallbacks = [
    [/^conspiracy_/, "conspiracy_believer"],
    [/^climate_action|^climate_justice|^mitigation/, "climate_action_advocate"],
    [/^ozone|^biodiversity|^environmental|^caregiver/, "environmental_concern"],
    [/scientist/, "climate_scientist"],
    [/journalist/, "science_journalist"],
  ];
  for (const [re, fb] of fallbacks) {
    if (re.test(id) && allowed.has(fb)) return fb;
  }
  if (allowed.has("conspiracy_believer")) return "conspiracy_believer";
  return [...allowed][0];
}

function cascadeToCustomGraph(cascade, mode) {
  const RealGraphImporter = require(path.join(ROOT, "src", "RealGraphImporter"));
  const tmp = path.join(HYDRATED, `_tmp_cascade_${mode}.json`);
  fs.writeFileSync(tmp, JSON.stringify(cascade));
  const imported = RealGraphImporter.importCascade(tmp, "inferred");
  fs.unlinkSync(tmp);

  const personas = resolvePersonasPath(mode);
  const allowed = personaIdsIn(personas.abs);
  const profiles = cascade.user_profiles || {};

  const nodes = imported.nodes.map((n) => {
    const uid = n.realUserId;
    const profile = profiles[uid] || {};
    let personaId;
    if (mode === "homo") {
      personaId = coercePersona("conspiracy_believer", allowed);
    } else {
      const intended = profile.intended_debnath_bp || mapBpKeywords(profile.description, "conspiracy_believer");
      personaId = coercePersona(intended, allowed);
    }
    return {
      nodeId: n.nodeId,
      personaId,
      modelId: "gpt-4o-mini",
      params: {
        trustThreshold: 0.15,
        actionWeights: { forward: 0.35, reinterpret: 0.5, drop: 0.15 },
        relationEvolution: true,
        trustDelta: 0.05,
        maxHops: 8,
        maxInboxSize: 4,
        activityPattern: "always",
      },
    };
  });

  const trustByPair = {};
  for (const rt of cascade.retweets || []) {
    const from = `user_${rt.retweeted_from}`;
    const to = `user_${rt.user_id}`;
    if (rt._trustHint != null) trustByPair[`${from}->${to}`] = rt._trustHint;
  }
  const edges = imported.edges.map((e) => ({
    from: e.from,
    to: e.to,
    trust: trustByPair[`${e.from}->${e.to}`] != null ? trustByPair[`${e.from}->${e.to}`] : e.trust,
  }));

  return {
    imported,
    personas,
    nodes,
    edges,
    seedNodes: imported.seedNodes,
    importerMapping: imported._realData.personaMapping,
  };
}

function writeDnetConfigs(cascade, attempts) {
  const n = Object.keys(cascade.user_profiles || {}).length;
  let simCascade = cascade;
  let subsampled = false;
  if (n > LLM_SUBSAMPLE_IF_OVER) {
    const target = Math.min(LLM_SUBSAMPLE_MAX, Math.max(LLM_SUBSAMPLE_MIN, 64));
    simCascade = subsampleCascade(cascade, target);
    subsampled = true;
    fs.writeFileSync(
      path.join(DERIVED, "debnath_hashtag_cascade_llm_subsample.json"),
      JSON.stringify(simCascade, null, 2) + "\n"
    );
  }
  attempts.push({
    step: "subsample_for_llm",
    ok: true,
    fullNodes: n,
    simNodes: Object.keys(simCascade.user_profiles).length,
    subsampled,
    rule: `subsample ${LLM_SUBSAMPLE_MIN}-${LLM_SUBSAMPLE_MAX} only if n>${LLM_SUBSAMPLE_IF_OVER}`,
  });

  const nodeParams = {
    trustThreshold: 0.15,
    actionWeights: { forward: 0.35, reinterpret: 0.5, drop: 0.15 },
    relationEvolution: true,
    trustDelta: 0.05,
    maxHops: 8,
    maxInboxSize: 4,
    activityPattern: "always",
  };

  const specs = [
    { file: "Dnet_c_H_conspiracy.json", mode: "continuous", mix: "homo", name: "Dnet_c_H_conspiracy" },
    { file: "Dnet_d_H_conspiracy.json", mode: "dual", mix: "homo", name: "Dnet_d_H_conspiracy" },
    { file: "Dnet_c_He_mixed.json", mode: "continuous", mix: "mixed", name: "Dnet_c_He_mixed" },
    { file: "Dnet_d_He_mixed.json", mode: "dual", mix: "mixed", name: "Dnet_d_He_mixed" },
  ];

  const written = [];
  for (const spec of specs) {
    const g = cascadeToCustomGraph(simCascade, spec.mix);
    const cfg = {
      personasPath: g.personas.rel,
      articlesPath: fs.existsSync(path.join(EXP, "articles", "merged.json"))
        ? "thesisExperiment/articles/merged.json"
        : "thesisExperiment/articles/articles.json",
      outputRoot: "thesisExperiment/runs_phase2",
      defaultModel: "gpt-4o-mini",
      auditorModel: "gpt-4o-mini",
      miScoringMode: spec.mode,
      seedNodes: g.seedNodes,
      graphRandomSeed: 42,
      _description: `Phase2 D-net ${spec.mode} ${spec.mix} custom topology from Debnath hashtag co-occurrence fallback. NOT a retweet cascade.`,
      _honesty: {
        notARetweetCascade: true,
        graphSource: "debnath_hashtag_cooccurrence_fallback",
        cascadeFile: "thesisExperiment/data/derived/debnath_hashtag_cascade.json",
        subsampledForLlm: subsampled,
        nNodes: g.nodes.length,
        nEdges: g.edges.length,
      },
      experimentName: spec.name,
      topology: "custom",
      nodes: g.nodes,
      edges: g.edges,
      maxTicks: 8,
      seedArticles: ["scopex_2017", "chemtrails_gates_2018_2021"],
      pfeffer: {
        valence: "varied via 2 Debnath-relevant seeds (SCoPEx 2017, chemtrails/Gates 2018–2021)",
        surprise: "held: drip chemtrails hub seed",
        identityAlignment: spec.mix === "homo" ? "homogeneous conspiracy_believer" : "heterogeneous Debnath BPs",
        networkClustering: "hashtag co-occurrence / same-cluster (Debnath 2023), not retweet",
        informationEcho: "measured",
        temporalAcceleration: "8 hops/ticks (logged cut)",
      },
      nodeParams,
    };
    const abs = path.join(CFG_DIR, spec.file);
    fs.writeFileSync(abs, JSON.stringify(cfg, null, 2) + "\n");
    written.push({
      file: path.relative(ROOT, abs),
      nNodes: g.nodes.length,
      nEdges: g.edges.length,
      seedNodes: g.seedNodes,
      personasPath: g.personas.rel,
      miScoringMode: spec.mode,
      mix: spec.mix,
    });
  }
  fs.writeFileSync(path.join(CFG_DIR, "Dnet_index.json"), JSON.stringify({ configs: written }, null, 2) + "\n");
  return { written, subsampled, simNodes: Object.keys(simCascade.user_profiles).length };
}

function writeReport(ctx) {
  const {
    attempts,
    bearer,
    openai,
    mendeley,
    osf,
    hydrated,
    cascadePath,
    dnet,
    geoengExists,
  } = ctx;
  const cascade = JSON.parse(fs.readFileSync(cascadePath, "utf8"));
  const nUsers = Object.keys(cascade.user_profiles || {}).length;
  const nEdges = (cascade.retweets || []).length;
  const hydrateOk = !!(hydrated && hydrated.ok);
  const lines = [];
  lines.push("# Debnath reconstruct report");
  lines.push("");
  lines.push(`Date: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Headline");
  lines.push("");
  if (hydrateOk) {
    lines.push(
      "Tweet-ID hydration **succeeded** for a sample. The FakeNewsNet JSON still must not be described as the 814,924-tweet Debnath dump."
    );
  } else {
    lines.push(
      "This graph is **NOT a retweet cascade**. Twitter/X hydration did not run (no bearer token and/or no usable ID dump). The artefact is a **documented hashtag co-occurrence / same-cluster graph** in FakeNewsNet JSON shape so `RealGraphImporter` can attach a custom topology. Edges occupy `retweets[]` only as a directed-edge container."
    );
  }
  lines.push("");
  lines.push("## Isolation");
  lines.push("");
  lines.push("- Did **not** write `thesisExperiment/runs/` or `thesisExperiment/results/tables/`.");
  lines.push("- Simulation configs use `outputRoot: thesisExperiment/runs_phase2`.");
  lines.push("- LLM simulations were **not** started by this script (no invented MI/MPR).");
  lines.push(`- OPENAI_API_KEY present: **${openai ? "yes" : "no"}**.`);
  lines.push("");
  lines.push("## Attempts");
  lines.push("");
  lines.push("| Step | ok | detail |");
  lines.push("|---|---|---|");
  for (const a of attempts) {
    const detail = a.error || a.reason || a.note || a.url || a.envName || "";
    const extra = [
      a.status != null ? `HTTP ${a.status}` : null,
      a.lines != null ? `${a.lines} lines` : null,
      a.nTweets != null ? `${a.nTweets} tweets` : null,
      a.nIdsParsed != null ? `${a.nIdsParsed} ids` : null,
    ]
      .filter(Boolean)
      .join(", ");
    lines.push(`| \`${a.step}\` | ${a.ok ? "yes" : "no"} | ${[extra, detail].filter(Boolean).join(" — ").replace(/\|/g, "/")} |`);
  }
  lines.push("");
  lines.push("## Sources");
  lines.push("");
  lines.push("1. **Mendeley** `10.17632/546hsym93p.1` — tweet **IDs**, not text. Files API historically 400; landing page may already sit in `data/raw/mendeley_546hsym93p_landing.html`.");
  lines.push(`   - This run: ${mendeley && mendeley.ok ? "files listing retrieved" : "no dump (API error 400 / landing only)"}.`);
  lines.push("2. **OSF** `osf.io/75ye3` `dataset.csv` ~662MB. Policy: store a **sample of IDs only** (first 5k lines) if the file is reachable; never keep the full CSV in-repo. The live OSF CSV also contains tweet **text and user fields** — those columns were **discarded** (ethics: no re-identification). `tweet_id` in the sample is Excel scientific notation, so IDs are not hydratable.");
  lines.push(`   - This run: ${osf && osf.ok ? `sample ${osf.lines} lines; usable digit IDs ${osf.ids.length}; PII discarded=${!!osf.piiDiscarded}` : "sample not retrieved"}.`);
  lines.push("3. **GitHub** `Ramit1201/geoeng` at `thesisExperiment/data/debnath_geoeng/` — analysis codes (`hashtag_ext`, NRC, embeddings, Perspective), **not** tweets.");
  lines.push(`   - Present: **${geoengExists ? "yes" : "no"}**.`);
  lines.push(`4. **Twitter/X API** — bearer env: **${bearer.present ? bearer.envName + " (present, value not logged)" : "absent"}**. If absent, tweets are not invented.`);
  lines.push("");
  lines.push("## Graph used for D-net");
  lines.push("");
  lines.push(`- File: \`thesisExperiment/data/derived/debnath_hashtag_cascade.json\``);
  lines.push(`- Nodes (user_profiles): **${nUsers}**`);
  lines.push(`- Directed edges (\`retweets[]\` container): **${nEdges}**`);
  lines.push(`- Seed user (chemtrails hub): **${cascade.seed_user}**`);
  lines.push(`- Edge semantics: **${cascade.edge_semantics || "hydrated_if_any"}**`);
  if (cascade._meta) {
    lines.push(`- Clusters: ${JSON.stringify(cascade._meta.clusters)}`);
    lines.push(`- Documented pairs encoded: ${cascade._meta.documentedPairs}`);
  }
  lines.push("");
  lines.push("### What the nodes are");
  lines.push("");
  lines.push("Accounts keyed by published Debnath hashtags (`#chemtrails`, `#geoengineering`, `#haarp`, `#srm`, `#climateaction`, `#ozone`, …) plus a small expert pair (science journalist / climate scientist) so mixed BPs can map. Follower counts are **illustrative bands** from Figure 2 (≥10k = highly influential), not scraped profiles.");
  lines.push("");
  lines.push("### What the edges are");
  lines.push("");
  lines.push("Documented **hashtag co-occurrence** and **same-cluster** links:");
  lines.push("");
  lines.push("- Table 1 co-tags (chemtrails × haarp × geoengineering × srm/sag/nexrad/nwo/illuminati/gmo).");
  lines.push("- Figure 3 2018–2021 broadening (stopspraying, depopulation, climate-action piggyback).");
  lines.push("- Figure 4 / p0160 non-conspiracy terms (ozone, biodiversity, air pollution, food security, mitigation).");
  lines.push("- p0175 Sweden SCoPEx / `#wedonotconsent` / climate action.");
  lines.push("- p0210 UK moderate influence (0.1–0.3) of conspiracy hashtags on public health, climate justice, SG governance — **sparse cross-cluster bridges**, not a complete mixing.");
  lines.push("- Figure 5–6 geospecific `#usa` `#uk` `#india` `#sweden` co-occurrence with `#chemtrails`.");
  lines.push("");
  lines.push("They are **not** observed retweets, replies, or `conversation_id` chains.");
  lines.push("");
  lines.push("### Persona mapping");
  lines.push("");
  lines.push("`user_profiles[].description` carries Debnath BP keywords (chemtrails / HAARP / climate action / ozone / journalist / phd). `RealGraphImporter` still uses CIKM bio rules for `--digital-twin`; Dnet configs **override** `personaId` with Debnath BPs:");
  lines.push("");
  lines.push("- Homo: every node `conspiracy_believer` (`personas/phase2/homogeneous_conspiracy.json` if present).");
  lines.push("- Mixed: cluster + keyword map into `personas/phase2/mixed_graph.json` (else `expanded_twelve.json`).");
  lines.push("");
  lines.push("## Dnet configs (not executed here)");
  lines.push("");
  for (const w of dnet.written) {
    lines.push(`- \`${w.file}\` — ${w.mix}, \`miScoringMode=${w.miScoringMode}\`, ${w.nNodes} nodes / ${w.nEdges} edges, seed ${JSON.stringify(w.seedNodes)}`);
  }
  lines.push("");
  lines.push("- `seedArticles`: `scopex_2017`, `chemtrails_gates_2018_2021`");
  lines.push("- `outputRoot`: `thesisExperiment/runs_phase2`");
  lines.push(`- LLM subsample: ${dnet.subsampled ? "yes (graph was >200 nodes)" : "not needed (graph ≤200 nodes); full co-occurrence graph kept"}`);
  lines.push("");
  lines.push("## Non-claims");
  lines.push("");
  lines.push("- Not HDBSCAN / Skip-gram re-estimation of 814,924 tweets.");
  lines.push("- Not a digital twin of Debnath retweet virality.");
  lines.push("- Not empirical MPR. Debnath reports toxicity, NRC, embeddings, hashtag networks — not 0–5 MPR.");
  lines.push("- If hydration failed, comparison in later steps is **structural / hashtag**, not “simulated MPR = Twitter MPR.”");
  lines.push("");
  const reportPath = path.join(DERIVED, "debnath_reconstruct_report.md");
  fs.writeFileSync(reportPath, lines.join("\n") + "\n");
  return reportPath;
}

function writeHydratedReadme(ctx) {
  const md = [
    "# Debnath hydrated / ID sample",
    "",
    "This folder is for tweet-ID samples and (if a Twitter/X bearer exists) hydrated JSON.",
    "",
    "- **Do not** store the full OSF ~662MB `dataset.csv`.",
    "- **Do not** invent tweets when hydration is impossible.",
    "- CSV/TSV/ZIP dumps are gitignored (see repo `.gitignore`).",
    "",
    `Bearer token present this run: ${ctx.bearer.present ? "yes (name withheld)" : "no"}.`,
    `OSF ID sample: ${ctx.osf && ctx.osf.ok ? ctx.osf.lines + " lines streamed; usable digit IDs " + (ctx.osf.ids || []).length + "; tweet text discarded" : "not retrieved"}.`,
    `Hydration: ${ctx.hydrated && ctx.hydrated.ok ? "ok" : "skipped/failed"}.`,
    "",
    "The graph actually used for D-net lives at `../derived/debnath_hashtag_cascade.json` unless hydration produced a usable retweet graph.",
    "",
  ];
  fs.writeFileSync(path.join(HYDRATED, "README.md"), md.join("\n"));
}

function appendLog(text) {
  fs.appendFileSync(LOG_MD, `\n## ${new Date().toISOString()} — Phase 2 Debnath reconstruct\n\n${text.trim()}\n\n---\n`);
}

async function main() {
  const attempts = [];
  loadDotEnvPresence();
  const bearer = detectTwitterBearer();
  const openai = detectOpenAi();
  attempts.push({
    step: "detect_twitter_bearer",
    ok: bearer.present,
    envName: bearer.present ? bearer.envName : null,
    note: bearer.present ? "present (value not logged)" : "absent — will not invent tweets",
  });
  attempts.push({ step: "detect_openai", ok: openai, note: openai ? "present" : "absent — Dnet configs written, LLM not run" });

  const geoengExists = fs.existsSync(path.join(GEOENG, "hashtag_ext")) || fs.existsSync(path.join(GEOENG, "README.md"));
  attempts.push({ step: "github_ramit1201_geoeng", ok: geoengExists, dest: "thesisExperiment/data/debnath_geoeng/" });

  const mendeley = await tryMendeley(attempts);
  const osf = await tryOsf(attempts);
  const ids = osf.ids || [];
  const hydrated = await hydrateTweets(ids, bearer, attempts);

  let cascade;
  let usedFallback = true;
  if (hydrated.ok && hydrated.tweets.length) {
    cascade = cascadeFromHydrated(hydrated.tweets, hydrated.users);
    usedFallback = (cascade.retweets || []).length === 0;
    if (usedFallback) {
      attempts.push({
        step: "hydrate_to_cascade",
        ok: false,
        note: "Hydrated tweets had no retweet/reply edges; falling back to hashtag co-occurrence.",
      });
    } else {
      attempts.push({ step: "hydrate_to_cascade", ok: true, nUsers: Object.keys(cascade.user_profiles).length });
    }
  }
  if (usedFallback) {
    cascade = buildHashtagCascade();
    attempts.push({
      step: "hashtag_cooccurrence_fallback",
      ok: true,
      nUsers: cascade._meta.nUsers,
      nEdges: cascade._meta.nEdges,
      note: "NOT a retweet cascade.",
    });
  }

  const cascadePath = path.join(DERIVED, "debnath_hashtag_cascade.json");
  fs.writeFileSync(cascadePath, JSON.stringify(cascade, null, 2) + "\n");

  // Validate importer can read it
  try {
    const RealGraphImporter = require(path.join(ROOT, "src", "RealGraphImporter"));
    const imported = RealGraphImporter.importCascade(cascadePath, "inferred");
    attempts.push({
      step: "realgraphimporter_validate",
      ok: imported.nodes.length > 0 && imported.edges.length > 0,
      nNodes: imported.nodes.length,
      nEdges: imported.edges.length,
      seedNodes: imported.seedNodes,
    });
    fs.writeFileSync(
      path.join(DERIVED, "debnath_importer_topology_preview.json"),
      JSON.stringify(
        {
          topology: imported.topology,
          nNodes: imported.nodes.length,
          nEdges: imported.edges.length,
          seedNodes: imported.seedNodes,
          note: "Preview only. Dnet configs override personaId with Debnath BPs.",
        },
        null,
        2
      ) + "\n"
    );
  } catch (err) {
    attempts.push({ step: "realgraphimporter_validate", ok: false, error: err.message });
    throw err;
  }

  const dnet = writeDnetConfigs(cascade, attempts);
  attempts.push({ step: "write_dnet_configs", ok: true, n: dnet.written.length });

  const ctx = { attempts, bearer, openai, mendeley, osf, hydrated, cascadePath, dnet, geoengExists };
  writeHydratedReadme(ctx);
  fs.writeFileSync(path.join(HYDRATED, "reconstruct_attempts.json"), JSON.stringify({ at: new Date().toISOString(), attempts }, null, 2) + "\n");
  const reportPath = writeReport(ctx);

  const nUsers = Object.keys(cascade.user_profiles).length;
  const nEdges = cascade.retweets.length;
  const logNote = [
    `Debnath reconstruct ran. Hydration: ${hydrated.ok ? "yes" : "no"} (bearer ${bearer.present ? "present" : "absent"}).`,
    usedFallback
      ? `Fallback hashtag co-occurrence graph written (${nUsers} nodes, ${nEdges} directed edges). This is NOT a retweet cascade.`
      : `Hydrated cascade written (${nUsers} users).`,
    `Outputs: ${path.relative(ROOT, cascadePath)}; ${path.relative(ROOT, reportPath)}; configs/phase2/Dnet_*.json.`,
    "Did not touch thesisExperiment/runs/ or results/tables/. Did not run LLM.",
  ].join(" ");
  appendLog(logNote);

  console.log(JSON.stringify(
    {
      usedFallback,
      nUsers,
      nEdges,
      seed_user: cascade.seed_user,
      cascade: path.relative(ROOT, cascadePath),
      report: path.relative(ROOT, reportPath),
      dnet: dnet.written.map((w) => w.file),
      openai: openai ? "present" : "absent",
      twitterBearer: bearer.present ? "present" : "absent",
    },
    null,
    2
  ));
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
