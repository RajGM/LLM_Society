# Debnath hydrated / ID sample

This folder is for tweet-ID samples and (if a Twitter/X bearer exists) hydrated JSON.

- **Do not** store the full OSF ~662MB `dataset.csv`.
- **Do not** invent tweets when hydration is impossible.
- CSV/TSV/ZIP dumps are gitignored (see repo `.gitignore`).

Bearer token present this run: no.
OSF ID sample: 5000 records streamed; usable digit IDs 0; tweet text discarded after hashtag extraction.
Hydration: failed/skipped.

The graph actually used for D-net lives at `../derived/debnath_hashtag_cascade.json`. Method: `../../analysis_phase2/HYDRATION.md`.
