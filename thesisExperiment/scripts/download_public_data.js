#!/usr/bin/env node
/**
 * Download public seed sources into thesisExperiment/data/.
 * Small slices only — no 814k tweet dump.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const ROOT = path.join(__dirname, "..");
const RAW = path.join(ROOT, "data", "raw");
const DEBNATH = path.join(ROOT, "data", "debnath_geoeng");
const DERIVED = path.join(ROOT, "data", "derived");

for (const d of [RAW, DEBNATH, DERIVED]) fs.mkdirSync(d, { recursive: true });

const DOWNLOADS = [
  {
    name: "wikipedia_chemtrail_conspiracy.json",
    dest: path.join(RAW, "wikipedia_chemtrail_conspiracy.json"),
    url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&format=json&titles=Chemtrail_conspiracy_theory",
  },
  {
    name: "wikipedia_stratospheric_aerosol_injection.json",
    dest: path.join(RAW, "wikipedia_stratospheric_aerosol_injection.json"),
    url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&format=json&titles=Stratospheric_aerosol_injection",
  },
  {
    name: "harvard_keutsch_scopex.html",
    dest: path.join(RAW, "harvard_keutsch_scopex.html"),
    url: "https://www.keutschgroup.com/scopex",
  },
  {
    name: "harvard_salata_scopex_update_2024.html",
    dest: path.join(RAW, "harvard_salata_scopex_update_2024.html"),
    url: "https://salatainstitute.harvard.edu/an-update-on-scopex/",
  },
  {
    name: "agu_2017_scopex_ads.json",
    dest: path.join(RAW, "agu_2017_scopex_ads.json"),
    url: "https://api.adsabs.harvard.edu/v1/search/query?q=SCoPEx%20Keutsch%202017&fl=title,author,year,abstract,bibcode,pubdate&rows=5",
    optional: true,
  },
  {
    name: "debnath_iscience_2023.html",
    dest: path.join(RAW, "debnath_iscience_2023.html"),
    url: "https://www.cell.com/iscience/fulltext/S2589-0042(23)00243-7",
  },
  {
    name: "debnath_iscience_2023.pdf",
    dest: path.join(RAW, "debnath_iscience_2023.pdf"),
    url: "https://www.cell.com/iscience/pdf/S2589-0042(23)00243-7.pdf",
  },
  {
    name: "mendeley_546hsym93p_landing.html",
    dest: path.join(RAW, "mendeley_546hsym93p_landing.html"),
    url: "https://data.mendeley.com/datasets/546hsym93p/1",
  },
  {
    name: "climatefever_hf_rows_0_40.json",
    dest: path.join(RAW, "climatefever_hf_rows_0_40.json"),
    url: "https://datasets-server.huggingface.co/rows?dataset=tdiggelm/climate_fever&config=default&split=test&offset=0&length=40",
  },
  {
    name: "climatefever_hf_search_geoengineering.json",
    dest: path.join(RAW, "climatefever_hf_search_geoengineering.json"),
    url: "https://datasets-server.huggingface.co/search?dataset=tdiggelm/climate_fever&config=default&split=test&query=geoengineering",
  },
  {
    name: "climatefever_hf_search_chemtrail.json",
    dest: path.join(RAW, "climatefever_hf_search_chemtrail.json"),
    url: "https://datasets-server.huggingface.co/search?dataset=tdiggelm/climate_fever&config=default&split=test&query=chemtrail",
  },
  {
    name: "debnath_github_README.md",
    dest: path.join(DEBNATH, "README.md"),
    url: "https://raw.githubusercontent.com/Ramit1201/geoeng/main/README.md",
  },
  {
    name: "debnath_github_hashtag_ext",
    dest: path.join(DEBNATH, "hashtag_ext"),
    url: "https://raw.githubusercontent.com/Ramit1201/geoeng/main/hashtag_ext",
  },
  {
    name: "debnath_github_NRClex",
    dest: path.join(DEBNATH, "NRClex"),
    url: "https://raw.githubusercontent.com/Ramit1201/geoeng/main/NRClex",
  },
  {
    name: "debnath_github_embeddings",
    dest: path.join(DEBNATH, "embeddings"),
    url: "https://raw.githubusercontent.com/Ramit1201/geoeng/main/embeddings",
  },
  {
    name: "debnath_github_Perspective",
    dest: path.join(DEBNATH, "Perspective"),
    url: "https://raw.githubusercontent.com/Ramit1201/geoeng/main/Perspective",
  },
  {
    name: "wikipedia_paris_agreement.json",
    dest: path.join(RAW, "wikipedia_paris_agreement.json"),
    url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=4000&format=json&titles=Paris_Agreement",
  },
  {
    name: "wikipedia_scientific_consensus_climate.json",
    dest: path.join(RAW, "wikipedia_scientific_consensus_climate.json"),
    url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=4000&format=json&titles=Scientific_consensus_on_climate_change",
  },
  {
    name: "wikipedia_sea_level_rise.json",
    dest: path.join(RAW, "wikipedia_sea_level_rise.json"),
    url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=4000&format=json&titles=Sea_level_rise",
  },
  {
    name: "wikipedia_polar_bear.json",
    dest: path.join(RAW, "wikipedia_polar_bear.json"),
    url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=3000&format=json&titles=Polar_bear",
  },
  {
    name: "wikipedia_retreat_of_glaciers.json",
    dest: path.join(RAW, "wikipedia_retreat_of_glaciers.json"),
    url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=4000&format=json&titles=Retreat_of_glaciers_since_1850",
  },
  {
    name: "osf_75ye3_landing.html",
    dest: path.join(RAW, "osf_75ye3_landing.html"),
    url: "https://osf.io/75ye3/",
    optional: true,
  },
]

function fetchBuffer(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 6) return reject(new Error(`Too many redirects: ${url}`));
    const lib = url.startsWith("http://") ? http : https;
    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent": "SocietySimulation-thesisExperiment/1.0 (academic; TUM thesis data gather)",
          Accept: "*/*",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).toString();
          res.resume();
          return fetchBuffer(next, redirects + 1).then(resolve, reject);
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          resolve({ status: res.statusCode, buf, contentType: res.headers["content-type"] || "" });
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(45000, () => {
      req.destroy(new Error(`Timeout: ${url}`));
    });
  });
}

async function downloadOne(item) {
  try {
    const { status, buf } = await fetchBuffer(item.url);
    if (status < 200 || status >= 300) {
      const msg = `${item.name}: HTTP ${status}`;
      if (item.optional) {
        console.warn(`[skip optional] ${msg}`);
        return { name: item.name, ok: false, optional: true, status };
      }
      console.warn(`[fail] ${msg}`);
      return { name: item.name, ok: false, status };
    }
    fs.writeFileSync(item.dest, buf);
    console.log(`[ok] ${item.name}  ${buf.length} bytes  HTTP ${status}`);
    return { name: item.name, ok: true, status, bytes: buf.length, dest: path.relative(ROOT, item.dest) };
  } catch (err) {
    if (item.optional) {
      console.warn(`[skip optional] ${item.name}: ${err.message}`);
      return { name: item.name, ok: false, optional: true, error: err.message };
    }
    console.warn(`[fail] ${item.name}: ${err.message}`);
    return { name: item.name, ok: false, error: err.message };
  }
}

function extractWikiText(jsonPath) {
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const pages = data.query && data.query.pages ? Object.values(data.query.pages) : [];
    return pages.map((p) => ({ title: p.title, missing: !!p.missing, extract: p.extract || "" }));
  } catch {
    return [];
  }
}

function extractClimateFever(jsonPath) {
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const labels = ["SUPPORTS", "REFUTES", "NOT_ENOUGH_INFO", "DISPUTED"];
    const rows = data.rows || [];
    return rows.map((r) => {
      const row = r.row || {};
      return {
        claim_id: row.claim_id,
        claim: row.claim,
        claim_label: labels[row.claim_label] || row.claim_label,
        evidence_articles: (row.evidences || []).map((e) => e.article).filter(Boolean),
      };
    });
  } catch {
    return [];
  }
}

async function main() {
  const manifest = { downloadedAt: new Date().toISOString(), items: [] };
  for (const item of DOWNLOADS) {
    manifest.items.push(await downloadOne(item));
  }

  const wikiChem = path.join(RAW, "wikipedia_chemtrail_conspiracy.json");
  const wikiSai = path.join(RAW, "wikipedia_stratospheric_aerosol_injection.json");
  if (fs.existsSync(wikiChem)) {
    fs.writeFileSync(
      path.join(DERIVED, "wikipedia_chemtrail_extract.json"),
      JSON.stringify(extractWikiText(wikiChem), null, 2)
    );
  }
  if (fs.existsSync(wikiSai)) {
    fs.writeFileSync(
      path.join(DERIVED, "wikipedia_sai_extract.json"),
      JSON.stringify(extractWikiText(wikiSai), null, 2)
    );
  }

  const cfPaths = [
    path.join(RAW, "climatefever_hf_rows_0_40.json"),
    path.join(RAW, "climatefever_hf_search_geoengineering.json"),
    path.join(RAW, "climatefever_hf_search_chemtrail.json"),
  ];
  const claims = [];
  const seen = new Set();
  for (const p of cfPaths) {
    if (!fs.existsSync(p)) continue;
    for (const c of extractClimateFever(p)) {
      const key = String(c.claim_id);
      if (seen.has(key)) continue;
      seen.add(key);
      claims.push(c);
    }
  }
  fs.writeFileSync(
    path.join(DERIVED, "climatefever_slice.json"),
    JSON.stringify({ source: "tdiggelm/climate_fever via HuggingFace datasets-server", n: claims.length, claims }, null, 2)
  );

  fs.writeFileSync(path.join(RAW, "download_manifest.json"), JSON.stringify(manifest, null, 2));
  const ok = manifest.items.filter((i) => i.ok).length;
  const fail = manifest.items.filter((i) => !i.ok && !i.optional).length;
  console.log(`\nDone. ${ok} ok, ${fail} failed (non-optional). Manifest: data/raw/download_manifest.json`);
  console.log(`ClimateFEVER slice claims: ${claims.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
