/**
 * OSF hashtag-only sampling for Debnath reconstruct.
 *
 * Streams dataset.csv, extracts hashtags from column `text`, discards tweet
 * text and user fields. Does not invent tweet IDs. Does not print secrets.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const GEOENG_HASHTAG_RE = /#[a-zA-Z0-9_\-\u30fc.]+/g;

function classifyTweetIdToken(tok) {
  if (!tok) return "empty";
  if (/e\+\d+$/i.test(tok) || /e-\d+$/i.test(tok)) return "scientific_notation";
  if (/^\d{8,}$/.test(tok)) return "ok_digits";
  return "other";
}

function looksLikeHtml(contentType, sample) {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("text/html")) return true;
  const s = String(sample || "")
    .slice(0, 200)
    .toLowerCase();
  return s.includes("<!doctype") || s.includes("<html");
}

function parseCsvRecord(line) {
  const fields = [];
  let field = "";
  let inQuotes = false;
  const s = String(line || "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      fields.push(field);
      field = "";
    } else {
      field += c;
    }
  }
  fields.push(field);
  return fields;
}

function normalizeHashtagToken(raw) {
  return String(raw || "")
    .replace(/^#/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function extractHashtagsFromText(text) {
  const out = [];
  const seen = new Set();
  const s = String(text || "");
  GEOENG_HASHTAG_RE.lastIndex = 0;
  let m;
  while ((m = GEOENG_HASHTAG_RE.exec(s))) {
    const n = normalizeHashtagToken(m[0]);
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

function pairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function documentedTagSet(hashtagSpec) {
  const s = new Set();
  for (const spec of hashtagSpec || []) {
    s.add(normalizeHashtagToken(spec.tag));
    if (spec.displayTag) s.add(normalizeHashtagToken(spec.displayTag));
  }
  s.add("climatenews");
  s.add("climatescience");
  return s;
}

function emptyHashtagStats() {
  return {
    nRecords: 0,
    nRecordsWithText: 0,
    nRecordsWithHashtag: 0,
    nHashtagTokens: 0,
    nDistinctHashtags: 0,
    nTweetsWithTwoPlusDocumented: 0,
    tagCounts: {},
    documentedTagCounts: {},
    documentedPairCounts: {},
    topHashtags: [],
    documentedPairsObserved: [],
    headerColumnsOnly: [],
    textColumnIndex: -1,
    hasPiiColumns: false,
  };
}

function streamOsfIdAndHashtags(
  url,
  maxRecords,
  { timeoutMs = 90000, maxRedirects = 6, userAgent, hashtagSpec } = {},
  redirects = 0
) {
  return new Promise((resolve, reject) => {
    if (redirects > maxRedirects) return reject(new Error(`Too many redirects: ${url}`));
    const lib = url.startsWith("http://") ? http : https;
    const req = lib.get(url, { headers: { "User-Agent": userAgent || "SocietySimulation", Accept: "*/*" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = new URL(res.headers.location, url).toString();
        res.resume();
        return streamOsfIdAndHashtags(
          next,
          maxRecords,
          { timeoutMs, maxRedirects, userAgent, hashtagSpec },
          redirects + 1
        ).then(resolve, reject);
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return resolve({
          ok: false,
          status: res.statusCode,
          contentType: res.headers["content-type"] || "",
          bytes: 0,
          lines: 0,
          records: 0,
          html: false,
          looksCsv: false,
          sampled: false,
          stopReason: `http_${res.statusCode}`,
          finalUrl: url,
          idCounts: { lines: 0, ok_digits: 0, scientific_notation: 0, other: 0, empty: 0 },
          usableIds: [],
          idTokens: [],
          hashtags: emptyHashtagStats(),
        });
      }

      const documented = documentedTagSet(hashtagSpec);
      const idCounts = { lines: 0, ok_digits: 0, scientific_notation: 0, other: 0, empty: 0 };
      const usableIds = [];
      const idTokens = [];
      const hashtags = emptyHashtagStats();
      const tagCounts = Object.create(null);
      const documentedTagCounts = Object.create(null);
      const documentedPairCounts = Object.create(null);

      let buf = "";
      let inQuotes = false;
      let bytes = 0;
      let physicalLines = 0;
      let headerParsed = false;
      let headerLine = "";
      let textCol = -1;
      let tweetIdCol = 0;
      let stopped = false;
      let firstChunk = "";
      const contentType = res.headers["content-type"] || "";

      const finish = (reason, sampled) => {
        if (stopped) return;
        stopped = true;
        try {
          res.destroy();
        } catch (_) {
          /* ignore */
        }
        const top = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 40)
          .map(([tag, n]) => ({ tag, n }));
        const documentedPairsObserved = Object.entries(documentedPairCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([pair, n]) => {
            const [a, b] = pair.split("|");
            return { a, b, n };
          });
        hashtags.tagCounts = tagCounts;
        hashtags.documentedTagCounts = documentedTagCounts;
        hashtags.documentedPairCounts = documentedPairCounts;
        hashtags.topHashtags = top;
        hashtags.documentedPairsObserved = documentedPairsObserved;
        hashtags.nDistinctHashtags = Object.keys(tagCounts).length;
        hashtags.textColumnIndex = textCol;
        resolve({
          ok: true,
          status: res.statusCode,
          contentType,
          bytes,
          lines: physicalLines,
          records: hashtags.nRecords,
          html: looksLikeHtml(contentType, firstChunk),
          looksCsv: /tweet_id/i.test(headerLine) && !/^\s*[\[{]/.test(String(firstChunk).trim()),
          sampled,
          stopReason: reason,
          finalUrl: url,
          headerLine,
          idCounts,
          usableIds,
          idTokens: idTokens.slice(0, maxRecords),
          hashtags,
        });
      };

      const consumeRecord = (raw) => {
        if (stopped) return;
        const line = String(raw || "").replace(/^\uFEFF/, "");
        if (!line.trim()) return;
        if (!headerParsed) {
          headerParsed = true;
          headerLine = line;
          const cols = parseCsvRecord(line).map((c) => c.trim());
          hashtags.headerColumnsOnly = cols.filter(Boolean);
          tweetIdCol = cols.findIndex((c) => /^tweet_id$/i.test(c));
          if (tweetIdCol < 0) tweetIdCol = 0;
          textCol = cols.findIndex((c) => /^text$/i.test(c));
          hashtags.hasPiiColumns =
            /(?:^|,)(text|user_name|user_description|user_location|user_profile_image_url|sourcetweet_text)(?:,|$)/i.test(
              cols.join(",")
            );
          if (looksLikeHtml(contentType, line)) finish("html", false);
          return;
        }
        const fields = parseCsvRecord(line);
        const tok = (fields[tweetIdCol] || "").replace(/"/g, "").trim();
        idCounts.lines += 1;
        const kind = classifyTweetIdToken(tok);
        idCounts[kind] = (idCounts[kind] || 0) + 1;
        if (kind === "ok_digits") {
          usableIds.push(tok);
          idTokens.push(tok);
        } else if (kind === "scientific_notation") {
          idTokens.push(tok);
        }
        hashtags.nRecords += 1;
        const text = textCol >= 0 ? fields[textCol] || "" : "";
        if (text) hashtags.nRecordsWithText += 1;
        const tags = extractHashtagsFromText(text);
        if (tags.length) {
          hashtags.nRecordsWithHashtag += 1;
          hashtags.nHashtagTokens += tags.length;
          for (const t of tags) {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
            if (documented.has(t)) documentedTagCounts[t] = (documentedTagCounts[t] || 0) + 1;
          }
          const docTags = tags.filter((t) => documented.has(t));
          if (docTags.length >= 2) {
            hashtags.nTweetsWithTwoPlusDocumented += 1;
            for (let i = 0; i < docTags.length; i++) {
              for (let j = i + 1; j < docTags.length; j++) {
                const k = pairKey(docTags[i], docTags[j]);
                documentedPairCounts[k] = (documentedPairCounts[k] || 0) + 1;
              }
            }
          }
        }
        if (hashtags.nRecords >= maxRecords) finish("max_records", true);
      };

      res.on("data", (chunk) => {
        if (stopped) return;
        bytes += chunk.length;
        const str = chunk.toString("utf8");
        if (!firstChunk) firstChunk = str.slice(0, 800);
        buf += str;
        let i = 0;
        let start = 0;
        while (i < buf.length && !stopped) {
          const c = buf[i];
          if (c === '"') {
            if (inQuotes && buf[i + 1] === '"') {
              i += 2;
              continue;
            }
            inQuotes = !inQuotes;
            i++;
            continue;
          }
          if ((c === "\n" || c === "\r") && !inQuotes) {
            if (c === "\r" && buf[i + 1] === "\n") {
              consumeRecord(buf.slice(start, i));
              physicalLines += 1;
              i += 1;
              start = i + 1;
            } else {
              consumeRecord(buf.slice(start, i));
              physicalLines += 1;
              start = i + 1;
            }
          }
          i++;
        }
        buf = buf.slice(start);
      });
      res.on("end", () => {
        if (stopped) return;
        if (buf.trim()) {
          physicalLines += 1;
          consumeRecord(buf);
        }
        finish("eof", hashtags.nRecords >= maxRecords);
      });
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`Timeout streaming: ${url}`)));
  });
}

function topologyFingerprint(cascade) {
  const nodes = Object.keys(cascade.user_profiles || {}).sort();
  const edges = (cascade.retweets || []).map((rt) => `${rt.retweeted_from}->${rt.user_id}`).sort();
  return JSON.stringify({ nodes, edges });
}

function userHashtagSlug(cascade, userId) {
  const p = (cascade.user_profiles || {})[userId];
  if (!p) return "";
  return normalizeHashtagToken(p.hashtag || "");
}

function annotateCascadeWithOsfHashtags(cascade, osfHashtags) {
  const pairCounts = (osfHashtags && osfHashtags.documentedPairCounts) || {};
  const tagCounts = (osfHashtags && osfHashtags.documentedTagCounts) || {};
  let nEdgesWithOsf = 0;
  let nCoocWithOsf = 0;
  for (const rt of cascade.retweets || []) {
    const a = userHashtagSlug(cascade, rt.retweeted_from);
    const b = userHashtagSlug(cascade, rt.user_id);
    if (!a || !b || a === b) {
      rt.osfSampleCount = 0;
      continue;
    }
    const n = pairCounts[pairKey(a, b)] || 0;
    rt.osfSampleCount = n;
    if (n > 0) nEdgesWithOsf += 1;
  }
  for (const c of cascade.cooccurrence || []) {
    const a = userHashtagSlug(cascade, c.source);
    const b = userHashtagSlug(cascade, c.target);
    if (!a || !b || a === b) {
      c.osfSampleCount = 0;
      continue;
    }
    const n = pairCounts[pairKey(a, b)] || 0;
    c.osfSampleCount = n;
    if (n > 0) nCoocWithOsf += 1;
  }
  cascade.honesty = cascade.honesty || {};
  cascade.honesty.notes = Array.isArray(cascade.honesty.notes) ? cascade.honesty.notes.slice() : [];
  const skipNote =
    "Debnath's “eight” is a skip-gram context window of eight words (p_together), not hop depth.";
  if (!cascade.honesty.notes.includes(skipNote)) cascade.honesty.notes.push(skipNote);
  cascade._meta = cascade._meta || {};
  cascade._meta.osfHashtagSample = {
    nRecords: osfHashtags ? osfHashtags.nRecords : 0,
    nRecordsWithHashtag: osfHashtags ? osfHashtags.nRecordsWithHashtag : 0,
    nDistinctHashtags: osfHashtags ? osfHashtags.nDistinctHashtags : 0,
    nTweetsWithTwoPlusDocumented: osfHashtags ? osfHashtags.nTweetsWithTwoPlusDocumented : 0,
    nDocumentedPairsObserved: osfHashtags && osfHashtags.documentedPairsObserved
      ? osfHashtags.documentedPairsObserved.length
      : 0,
    nDirectedEdgesWithOsfCount: nEdgesWithOsf,
    nUndirectedCoocWithOsfCount: nCoocWithOsf,
    documentedTagCounts: tagCounts,
    topologyUnchanged: true,
    note:
      "OSF 5k-record prefix: hashtags extracted, tweet text discarded. Counts annotate documented edges; they do not add/remove nodes or edges. Prefix is not Debnath's full 814,924-tweet co-occurrence network.",
  };
  return cascade;
}

function writeOsfHashtagSample(osfHashtags, dest, osf) {
  const compact = {
    source: "OSF osf.io/75ye3 dataset.csv — first 5k CSV records (not the ~662MB dump)",
    method:
      "Ramit1201/geoeng hashtag_ext regex #[a-zA-Z0-9_-]+ on column `text` only. Tweet text, user fields, and profile URLs discarded. No tweet IDs invented.",
    notARetweetCascade: true,
    nRecords: osfHashtags.nRecords,
    nIdsScientificNotation: osf && osf.nScientific != null ? osf.nScientific : null,
    nIdsUsableDigits: osf && Array.isArray(osf.ids) ? osf.ids.length : 0,
    nRecordsWithText: osfHashtags.nRecordsWithText,
    nRecordsWithHashtag: osfHashtags.nRecordsWithHashtag,
    nHashtagTokens: osfHashtags.nHashtagTokens,
    nDistinctHashtags: osfHashtags.nDistinctHashtags,
    nTweetsWithTwoPlusDocumented: osfHashtags.nTweetsWithTwoPlusDocumented,
    documentedTagCounts: osfHashtags.documentedTagCounts,
    documentedPairsObserved: osfHashtags.documentedPairsObserved,
    topHashtags: osfHashtags.topHashtags,
    headerColumnsOnly: osfHashtags.headerColumnsOnly,
    piiDiscarded: osfHashtags.hasPiiColumns,
    limitations: [
      "Sample is the file prefix, not a random or period-stratified draw of 814,924 tweets.",
      "tweet_id Excel scientific notation → duplicate collapsed IDs; tweets are not uniquely countable.",
      "Hashtag co-occurrence here is within-tweet #ngram pairs (Debnath STAR Methods), not retweets.",
      "Do not treat topHashtags as HDBSCAN clusters or as new graph nodes.",
    ],
  };
  fs.writeFileSync(dest, JSON.stringify(compact, null, 2) + "\n");
  return dest;
}

function writeHydrationMd(ctx) {
  const cascade = JSON.parse(fs.readFileSync(ctx.cascadePath, "utf8"));
  const nUsers = Object.keys(cascade.user_profiles || {}).length;
  const nEdges = (cascade.retweets || []).length;
  const h = (ctx.osf && ctx.osf.hashtags) || emptyHashtagStats();
  const osfMeta = (cascade._meta && cascade._meta.osfHashtagSample) || {};
  const lines = [
    "# Debnath tweet hydration — hashtag path",
    "",
    "Status: **hydration failed**. Empirical graph: **hashtag co-occurrence fallback**.",
    "",
    "This note records what reconstruct could and could not do. It does not invent tweet IDs. It does not print secrets.",
    "",
    "## What we tried",
    "",
    "1. **Mendeley** `10.17632/546hsym93p.1` — tweet-ID dump (not text). Files API returns HTTP 200 with body error 400 / Elsevier 404. Landing HTML only.",
    "2. **OSF** `osf.io/75ye3` `dataset.csv` (~662 MB). Streamed the first 5k **CSV records** from the `files.osf.io` object URL. Parsed `tweet_id` and extracted hashtags from column `text`. Discarded tweet text, user names, bios, locations, profile image URLs.",
    `3. **Twitter/X hydration** — bearer ${ctx.bearer && ctx.bearer.present ? "present (name withheld)" : "**absent**"}. Usable digit IDs from OSF: **${(ctx.osf && ctx.osf.ids && ctx.osf.ids.length) || 0}**. Hydration ${ctx.hydrated && ctx.hydrated.ok ? "ran" : "**did not run**"}. Tweets were not invented.`,
    `4. **GitHub** \`Ramit1201/geoeng\` at \`thesisExperiment/data/debnath_geoeng/\` — ${ctx.geoengExists ? "present" : "missing"}. Codes (\`hashtag_ext\`, skip-gram embeddings, NRC, Perspective), **not** tweets.`,
    "5. **PMC HTML** of Debnath et al. 2023 — published Table 1 / Figures 3–6 hashtags already encoded in `HASHTAG_SPEC` / `DOCUMENTED_PAIRS`.",
    "",
    "## Why hydration failed",
    "",
    "- OSF `tweet_id` is Excel **scientific notation** (e.g. `1.00048E+18`). Low digits are gone. Tokens do not round-trip to Twitter snowflake IDs. **0 hydratable IDs** in the sample.",
    "- No Twitter/X bearer in the environment. Reconstruct refuses to call the API without one, and refuses to fabricate IDs to hydrate random tweets.",
    "- Mendeley ID dump was not retrieved. Even if it were, hydration would still need a bearer.",
    "",
    "## Hashtag method (empirical graph)",
    "",
    "Debnath’s own hashtag path (STAR Methods; Ramit1201/geoeng `hashtag_ext`):",
    "",
    "- Extract `#ngram`s with `#[a-zA-Z0-9_-]+` (lowercase, strip punctuation).",
    "- **Co-occurrence** = two hashtags in the **same tweet** (`freq`). In their Gephi nets, nodes are hashtags; edges are undirected and weighted by frequency. Country tags (`#usa`, `#uk`, `#india`, `#sweden`) locate those nets.",
    "- They filtered retweets **before skip-gram**, not as a FakeNewsNet retweet cascade.",
    "",
    "This repo’s artefact is a **user graph keyed by those published hashtags** (hub / amplifier / periphery accounts per tag) so `RealGraphImporter` can read FakeNewsNet-shaped JSON. Edges reuse `retweets[]` only as a directed-edge container. `notARetweetCascade: true`.",
    "",
    "| Field | Value |",
    "|---|---|",
    "| File | `thesisExperiment/data/derived/debnath_hashtag_cascade.json` |",
    `| Nodes (users keyed by hashtags) | **${nUsers}** |`,
    `| Directed edges | **${nEdges}** |`,
    "| `notARetweetCascade` | **true** |",
    "| `kind` | `hashtag_cooccurrence` |",
    "| Seed | `chemtrails_hub` / `#chemtrails` |",
    `| Topology changed this run | **${ctx.topologyChanged ? "yes" : "no"}** |`,
    "",
    "OSF prefix hashtags **annotate** documented edges (`osfSampleCount`) and are stored as aggregates in `thesisExperiment/data/derived/debnath_osf_hashtag_sample.json`. They do **not** add nodes, do **not** invent users, and do **not** replace Debnath’s published co-occurrence networks with a 5k-record file prefix.",
    "",
    "### OSF hashtag sample (this run)",
    "",
    `- Records: **${h.nRecords || 0}**; scientific-notation \`tweet_id\` tokens: **${(ctx.osf && ctx.osf.nScientific) || 0}**; usable digit IDs: **${(ctx.osf && ctx.osf.ids && ctx.osf.ids.length) || 0}**; with text: **${h.nRecordsWithText || 0}**; with ≥1 hashtag: **${h.nRecordsWithHashtag || 0}**.`,
    `- Distinct hashtags: **${h.nDistinctHashtags || 0}**. Tweets with ≥2 documented tags: **${h.nTweetsWithTwoPlusDocumented || 0}**.`,
    `- Documented tag-pairs observed: **${(h.documentedPairsObserved || []).length}**. Directed edges with OSF count > 0: **${osfMeta.nDirectedEdgesWithOsfCount || 0}**.`,
    "- PII: tweet text and user fields discarded after extraction.",
    "",
    "## Debnath’s “eight” is not our 8 hops",
    "",
    "From Debnath et al. 2023 STAR Methods (word embeddings): they use word2vec skip-gram and **define a context window of eight** — a batch of eight **words** in an individual tweet — to estimate the conditional probability `p_together` of neighbouring words with “chemtrails”. Their public R (`thesisExperiment/data/debnath_geoeng/embeddings`) uses `unnest_tokens(..., n = 10)` n-grams as an implementation detail; the **paper** says eight.",
    "",
    "This experiment’s **8 hops / 8 ticks** is a logged cost compression versus CIKM K=30. It is **not** Debnath’s skip-gram window and **not** a Debnath hop protocol.",
    "",
    "## compare_phase2.js",
    "",
    ctx.topologyChanged
      ? "Empirical topology **changed**. Re-run `node thesisExperiment/scripts/compare_phase2.js`."
      : "Empirical topology **unchanged** (same node set and `from→to` endpoints). `compare_phase2.js` was **not** re-run solely because OSF counts were attached. Do not wipe `simPending=false`.",
    "",
    "Dnet configs (`thesisExperiment/configs/phase2/Dnet_*.json`) were " +
      (ctx.dnet && ctx.dnet.skipped ? "**not rewritten** (topology match)." : "rewritten from the cascade."),
    "",
    "## What remains impossible",
    "",
    "- Recovering the 814,924 tweet IDs or hydrating them without a bearer and a non-scientific-notation ID list.",
    "- Reconstructing retweet / reply / `conversation_id` cascades from this OSF file prefix.",
    "- Re-running HDBSCAN or skip-gram on 814k tweets (no corpus; codes without data).",
    "- Equating simulated MI (LLM auditor) with Twitter MI, or claiming empirical MPR (Debnath did not report 0–5 MPR).",
    "- Treating follower counts on fallback nodes as scraped profiles (they are Figure 2 illustrative bands).",
    "",
    "## Isolation",
    "",
    "- Did not write `thesisExperiment/runs/` or `thesisExperiment/results/tables/` (Phase 1).",
    "- Did not invent tweets, tweet IDs, or API keys. Did not print secrets.",
    "",
    "## Attempts (this run)",
    "",
    "| Step | ok | detail |",
    "|---|---|---|",
  ];
  for (const a of ctx.attempts || []) {
    const detail = a.error || a.reason || a.note || a.url || "";
    lines.push(`| \`${a.step}\` | ${a.ok ? "yes" : "no"} | ${String(detail).replace(/\|/g, "/").slice(0, 180)} |`);
  }
  lines.push("");
  const dir = path.join(ctx.expDir, "analysis_phase2");
  fs.mkdirSync(dir, { recursive: true });
  const hydrationPath = path.join(dir, "HYDRATION.md");
  fs.writeFileSync(hydrationPath, lines.join("\n") + "\n");
  const derivedPtr = path.join(ctx.derivedDir, "HYDRATION.md");
  fs.writeFileSync(
    derivedPtr,
    [
      "# Debnath hydration",
      "",
      "Canonical note: [`thesisExperiment/analysis_phase2/HYDRATION.md`](../../analysis_phase2/HYDRATION.md).",
      "",
      `- Hydration **failed** (Excel \`tweet_id\` + no Twitter/X bearer; IDs not invented).`,
      `- Empirical graph: \`debnath_hashtag_cascade.json\` — **${nUsers}** nodes, **${nEdges}** edges, \`notARetweetCascade: true\`.`,
      "- Debnath’s “eight” is a **skip-gram word window**, not this experiment’s 8 hops/ticks.",
      "",
    ].join("\n")
  );
  return hydrationPath;
}

module.exports = {
  classifyTweetIdToken,
  parseCsvRecord,
  extractHashtagsFromText,
  normalizeHashtagToken,
  streamOsfIdAndHashtags,
  topologyFingerprint,
  annotateCascadeWithOsfHashtags,
  writeOsfHashtagSample,
  writeHydrationMd,
  emptyHashtagStats,
};
