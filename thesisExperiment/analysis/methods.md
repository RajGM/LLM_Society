# Methods paragraph (ready to paste)

This chapter reports a **climate-firestorm** simulation grounded in Pfeffer's six-factor firestorm framing and Debnath et al.'s (iScience 2023) #geoengineering Twitter types, implemented on the existing Society Simulation engine (linear chains plus scale-free and Erdős–Rényi graphs). It is **not** a reprint of the CIKM/LASS crime-news persona grid; Experiments H and He reuse only the **homogeneous vs heterogeneous linear-chain** design (same vs mixed personas along a path).

**Stimuli.** Twelve short climate/geoengineering articles (each with five yes/no ground-truth questions) cover Harvard SCoPEx, chemtrails/Gates discourse, SAI, the cancelled UK SPICE outdoor test, the Paris Agreement, scientific consensus, glaciers, polar bears, CO2 fertilisation, sea-level rise, net zero, and extreme-event attribution. Texts are factual syntheses of public sources (Harvard SCoPEx FAQ, Wikipedia SAI/chemtrails, IPCC-class statements, ClimateFEVER-style claims). They are **not** hydrated Debnath tweets.

**Personas.** Twelve belief profiles expand Debnath's three empirical discourse types — chemtrails conspiracy, climate action/justice, environmental concern (ozone/biodiversity) — into variants (HAARP/weather warfare, depopulation/Gates, climate-action piggyback; youth justice; mitigation-first policy; ozone specialist; food/biodiversity) plus two **added** expert/journalist voices for heterogeneous mix. They are **theory-faithful reductions**, not HDBSCAN centroids: the 814,924-tweet ID dump was not downloaded (~662 MB OSF file; no Twitter hydration).

**Scoring.** After each run, an LLM auditor (`gpt-4o-mini`, discrete IFD) scores rewrites against the five GT questions (correct=+1, missing=0, contradict=−1). Misinformation index (MI) aggregates item error; propaganda is operationalised as **MI>3**; k* is the first tick/hop where **network-mean MI>3** and later points with data do not return to ≤3. Distortion types (Experiment C) are a **keyword heuristic** on rewrite text, not a trained classifier.

**Experiment H.** Homogeneous linear chains: each of 12 personas is repeated along 8 nodes; all 12 articles propagate sequentially; action weights favour reinterpretation (0.85) so the chain is CIKM-like rather than a silent forward. Trust threshold is low (0.08) to reduce cascade death.

**Experiment He.** Twelve heterogeneous chains of 8 **unique** personas (no within-chain repeats): mixes 00–05 are sliding windows over the 12 ids; 06–11 are seeded shuffles. Same articles and hop budget as H.

**Experiment A (proposal).** 2 topologies (Barabási–Albert scale-free m=2 vs ER p=0.42 with `graphRandomSeed=42` and `minSeedOutDegree=2`) × 2 mixes (homogeneous conspiracy vs mixed 8 of 12 BPs) × a **documented 6-article subset**, 8 nodes, 8 ticks, N=1. Graph action weights match the pilot (reinterpret 0.50 / drop 0.15). The 6-article cut is a cost control; H/He still use 12 articles.

**Experiment B.** Scale-free × mixed graph BPs × chemtrails seed; `fact_checker_injection` of the original article at tick n∈{1,3,5}.

**Pfeffer operationalisation.** Valence is varied via article set and persona tone; surprise is **held** (drip seed at node_0); identity alignment is **swept** (hom vs mix vs 12 personas); network clustering is **swept** (chain / SF / ER / echo chamber); information echo is **measured** (edge homophily, conspiracy-cut modularity, PI, Gini) and **swept** in the echo cell; temporal acceleration is **held** at 8-tick hop compression (not a 15-tick firestorm).

**Model and N.** All reported cells use real `gpt-4o-mini` calls (no dry-run). N=1 unless stated. Cost is a list-price estimate from returned token usage.
