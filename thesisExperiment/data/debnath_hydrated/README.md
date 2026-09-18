# Debnath hydrated / ID sample

This folder is for tweet-ID samples and (if a Twitter/X bearer exists) hydrated JSON.

- **Do not** store the full OSF ~662MB `dataset.csv`.
- **Do not** invent tweets when hydration is impossible.
- **Do not** keep tweet text / user names / locations / profile images (OSF CSV is not IDs-only).
- CSV/TSV/ZIP dumps are gitignored (see repo `.gitignore`).

Bearer token present this run: no.
OSF: `dataset.csv` is 661,867,256 bytes. A 5k-line peek showed text + user columns; raw rows deleted. `tweet_id` is scientific notation — 0 hydratable IDs.
Hydration: skipped (no bearer). Tweets not invented.

The graph used for D-net is `../derived/debnath_hashtag_cascade.json` (documented hashtag co-occurrence; **not** a retweet cascade).
