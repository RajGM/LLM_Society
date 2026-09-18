#!/usr/bin/env node
/**
 * Write analysis/ paste-ready markdown from current summary.json.
 */
const fs = require("fs");
const path = require("path");

const EXP = path.join(__dirname, "..");
const OUT = path.join(EXP, "analysis");
fs.mkdirSync(OUT, { recursive: true });

function loadSummary() {
  const p = path.join(EXP, "results", "summary.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function mean(arr) {
  const xs = arr.filter((x) => x != null && !Number.isNaN(x));
  if (!xs.length) return null;
  return Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 1000) / 1000;
}

function writeMethods() {
  const md = `# Methods paragraph (ready to paste)

This chapter reports a **climate-firestorm** simulation grounded in Pfeffer's six-factor firestorm framing and Debnath et al.'s (iScience 2023) #geoengineering Twitter types, implemented on the existing Society Simulation engine (linear chains plus scale-free and Erdős–Rényi graphs). It is **not** a reprint of the CIKM/LASS crime-news persona grid; Experiments H and He reuse only the **homogeneous vs heterogeneous linear-chain** design (same vs mixed personas along a path).

**Stimuli.** Twelve short climate/geoengineering articles (each with five yes/no ground-truth questions) cover Harvard SCoPEx, chemtrails/Gates discourse, SAI, the cancelled UK SPICE outdoor test, the Paris Agreement, scientific consensus, glaciers, polar bears, CO2 fertilisation, sea-level rise, net zero, and extreme-event attribution. Texts are factual syntheses of public sources (Harvard SCoPEx FAQ, Wikipedia SAI/chemtrails, IPCC-class statements, ClimateFEVER-style claims). They are **not** hydrated Debnath tweets.

**Personas.** Twelve belief profiles expand Debnath's three empirical discourse types — chemtrails conspiracy, climate action/justice, environmental concern (ozone/biodiversity) — into variants (HAARP/weather warfare, depopulation/Gates, climate-action piggyback; youth justice; mitigation-first policy; ozone specialist; food/biodiversity) plus two **added** expert/journalist voices for heterogeneous mix. They are **theory-faithful reductions**, not HDBSCAN centroids: the 814,924-tweet ID dump was not downloaded (~662 MB OSF file; no Twitter hydration).

**Scoring.** After each run, an LLM auditor (\`gpt-4o-mini\`, discrete IFD) scores rewrites against the five GT questions (correct=+1, missing=0, contradict=−1). Misinformation index (MI) aggregates item error; propaganda is operationalised as **MI>3**; k* is the first tick/hop where **network-mean MI>3** and later points with data do not return to ≤3. Distortion types (Experiment C) are a **keyword heuristic** on rewrite text, not a trained classifier.

**Experiment H.** Homogeneous linear chains: each of 12 personas is repeated along 8 nodes; all 12 articles propagate sequentially; action weights favour reinterpretation (0.85) so the chain is CIKM-like rather than a silent forward. Trust threshold is low (0.08) to reduce cascade death.

**Experiment He.** Twelve heterogeneous chains of 8 **unique** personas (no within-chain repeats): mixes 00–05 are sliding windows over the 12 ids; 06–11 are seeded shuffles. Same articles and hop budget as H.

**Experiment A (proposal).** 2 topologies (Barabási–Albert scale-free m=2 vs ER p=0.42 with \`graphRandomSeed=42\` and \`minSeedOutDegree=2\`) × 2 mixes (homogeneous conspiracy vs mixed 8 of 12 BPs) × a **documented 6-article subset**, 8 nodes, 8 ticks, N=1. Graph action weights match the pilot (reinterpret 0.50 / drop 0.15). The 6-article cut is a cost control; H/He still use 12 articles.

**Experiment B.** Scale-free × mixed graph BPs × chemtrails seed; \`fact_checker_injection\` of the original article at tick n∈{1,3,5}.

**Pfeffer operationalisation.** Valence is varied via article set and persona tone; surprise is **held** (drip seed at node_0); identity alignment is **swept** (hom vs mix vs 12 personas); network clustering is **swept** (chain / SF / ER / echo chamber); information echo is **measured** (edge homophily, conspiracy-cut modularity, PI, Gini) and **swept** in the echo cell; temporal acceleration is **held** at 8-tick hop compression (not a 15-tick firestorm).

**Model and N.** All reported cells use real \`gpt-4o-mini\` calls (no dry-run). N=1 unless stated. Cost is a list-price estimate from returned token usage.
`;
  fs.writeFileSync(path.join(OUT, "methods.md"), md);
}

function writeLimitations() {
  const md = `# Limitations (ready to paste)

- **N=1.** Stochastic action sampling (drop/forward/reinterpret) and LLM sampling mean cells are not statistically powered. Treat differences as patterned case studies, not p-values.
- **Model.** \`gpt-4o-mini\` is cheaper and more compliant than human Twitter users; conspiracy personas may still "play along" or, conversely, refuse to invert facts. Results are simulation outputs, not measurements of real chemtrails communities.
- **Debnath gap.** No 814k-tweet clustering. Personas are paper-faithful expansions. Do not claim recovered HDBSCAN centroids or reconstructed cascades.
- **Auditor circularity.** The same model family writes and scores. Discrete IFD on five author-written questions is a **construct**, not independent fact-checking.
- **Hop compression.** 8 hops/ticks are not Pfeffer's multi-week firestorm clock.
- **Graph A article subset.** Six of twelve articles; do not generalise A findings to the four articles that were chain-only.
- **Experiment B confounding.** Most scored events often occur after the injection tick because cascades grow; before/after means are not a clean RCT.
- **Keyword distortion (C).** Counts of "chemtrails" etc. measure lexical markers, not trained discourse labels.
- **Echo cell.** The pilot D run died at tick 1 (seed drop / unseeded RNG). The rerun uses seeded RNG and min seed out-degree; still N=1.
- **No human ratings** in this folder unless the CSV templates are later filled.
`;
  fs.writeFileSync(path.join(OUT, "limitations.md"), md);
}

function writeClaims() {
  const md = `# Examiner-safe claims vs overclaims

## Safe to claim

- The engine can run Debnath-grounded personas on climate/geoengineering seeds and produce IFD MI/MPR along chains and graphs.
- Homogeneous conspiracy-toned chains **can** drive high MI on conspiracy-adjacent seeds in this simulator (report the observed table, N=1).
- Mixed / heterogeneous personas **can** buffer network-mean MI relative to homogeneous conspiracy on the same seed **in these runs** (if the table shows that).
- Pfeffer factors were operationalised as config knobs plus measured echo metrics; valence and identity were varied; surprise was held as drip seeding.
- Fact-check injection is implemented and produces a before/after split; interpretation must note cascade-volume confounding.

## Do not claim

- That results replicate Debnath's 814,924-tweet HDBSCAN or toxicity time series.
- That chemtrails communities in the wild behave like \`gpt-4o-mini\` roleplay.
- That k* is a universal firestorm law, or that ER vs scale-free differences are significant.
- That fact-checks "fail" or "work" as a policy finding from N=1 before/after means.
- That hop-compressed 8-tick runs are empirical firestorm durations.
- That keyword hits are Debnath's six semantic dimensions.
- Causal claims about Bill Gates, HAARP, or real spraying (articles are factual; conspiracy personas are simulated distortion).
`;
  fs.writeFileSync(path.join(OUT, "examiner_safe_claims.md"), md);
}

function writeResults(summary) {
  const rows = (summary && summary.rows) || [];
  const H = rows.filter((r) => r.experiment === "H");
  const He = rows.filter((r) => r.experiment === "He");
  const A = rows.filter((r) => r.experiment === "A");
  const B = rows.filter((r) => r.experiment === "B");
  const D = rows.filter((r) => r.experiment === "D");

  const md = `# Results paragraphs (generated from summary.json)

Generated: ${(summary && summary.generatedAt) || "no summary yet"}.
Validity: ${(summary && summary.validity) || "n/a"}.
Counts: H=${H.length} He=${He.length} A=${A.length} B=${B.length} D=${D.length}.
LLM: ${JSON.stringify((summary && summary.llmUsageTotals) || {})}.

## Experiment H (homogeneous chains)

Across ${H.length} persona×article cells, mean of cell-mean MPR was ${mean(H.map((r) => r.meanNodeMPR))}; mean of max event MI was ${mean(H.map((r) => r.maxEventMI))}. Irreversible network k* occurred in ${H.filter((r) => r.kStar_network != null).length} cells. Conspiracy-cluster personas vs other personas should be compared in \`results/tables/H_rows.csv\` and Figure 1–3; do not average them into a single "the AI believes chemtrails" claim.

## Experiment He (heterogeneous chains)

${He.length} mix×article cells; mean MPR ${mean(He.map((r) => r.meanNodeMPR))}; mean max MI ${mean(He.map((r) => r.maxEventMI))}; k* in ${He.filter((r) => r.kStar_network != null).length} cells. Figure 12 compares hop-wise MI to H. If He mean MI is lower than H conspiracy rows but not lower than H scientist rows, say that — do not say "diversity always stops firestorms."

## Experiment A (graphs)

${A.length} topology×mix×article rows on the 6-article subset. Homogeneous conspiracy vs mixed-8BP and scale-free vs ER are in Figures 6–8. N=1: a dead cascade (few events) is a sampled drop, not a theorem that ER cannot propagate.

## Experiment B (fact-check)

${B.length} rows. Before/after means are in Figure 9 and \`B_before_after.csv\`. If after > before, report confounding by cascade growth rather than "fact-checks backfire" as a causal headline.

## Echo / Pfeffer information echo

Graph rows report edge homophily and conspiracy-cut modularity (Figure 10). Homogeneous graphs have homophily=1 by construction.

## Cost

See Figure 13 and LOG.md. Model: gpt-4o-mini. N=1.

Replace any still-empty heatmaps after the corresponding phase finishes; do not paste zeros from missing cells as findings.
`;
  fs.writeFileSync(path.join(OUT, "results_paragraphs.md"), md);
}

function writeCaptionsPointer() {
  fs.writeFileSync(
    path.join(OUT, "figure_captions.md"),
    "# Figure captions\n\nCanonical captions are generated with the PNGs in `thesisExperiment/results/figures/captions.md` after `plot_results.py`.\n"
  );
}

const summary = loadSummary();
writeMethods();
writeLimitations();
writeClaims();
writeResults(summary);
writeCaptionsPointer();
console.log("Wrote thesisExperiment/analysis/*.md");
