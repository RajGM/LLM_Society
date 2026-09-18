# Minimum experiment graph (six factors, not a CIKM reprint)

**Goal.** Smallest run set that can **test** H1–H6 (Pfeffer knobs), H7 (climate vs commercial), and H8 (correction), using only knobs already in this repo.

**Non-goals.** Do not reprint Maurya et al. LASS@CIKM 2025 (linear 30-hop branches, 21 archetypes, 10 general-news domains, Young Parent / crime0 headlines). Do not download or cluster 814k tweets. Do not edit `src/` or overwrite executor `articles/` / `personas/` from this folder.

Pilot `grid.json` is a **subset** of this design (H1, H3, H4, H8). It is **not** sufficient for H2, H5, H6, H7.

---

## 1. What would make this a CIKM reprint

Any primary thesis grid that is **all** of:

- `topology: "linear_chain"`
- CIKM persona file `personas/personas.json` (Young Parent, religious leader, …)
- CIKM article file `articles/articles.json` domains crime/education/technology/politics/healthcare as the **only** seeds
- \(K \approx 30\) hops, homogeneous vs heterogeneous **branches**, MPR heatmaps as the contribution

Reuse of the **auditor** and of **one** commercial seed for H7 is method transfer, not a reprint — if climate Debnath BPs and networked topologies remain the main object (`01_literature/do_not_reprint.md`).

---

## 2. Floor that still has a “graph”

| Constraint | Floor | Why not smaller |
|---|---|---|
| Nodes | **8** | BA `m=2` needs \(n > m\); two echo chambers need \(\ge 4+4\) to have intra-edges. `numNodes: 5` is the engine default linear chain — CIKM-shaped. |
| Tick budget | **6** always-on for the core; **one** longer/slow cell for H6 | 6 is hop-compressed vs the proposal; it can detect \(k^*\) but right-censors irreversibility (`kstar_definition.md` §7). H6 is untestable if every cell is 6/always. |
| `maxHops` | **6** on the core (matched to ticks) | Unmatched hops vs ticks confound H6. |
| `maxInboxSize` | **4** | Already in campaign; denser shock (H2) will hit it — document, do not raise unless shock dies. |
| Replicates | **N = 1** for a minimum *design*; N\(\ge 3\) for claims | Design completeness \(\neq\) statistical power. |
| Model | `gpt-4o-mini` | Matches campaign; gpt-4o is optional ablation, not required to *test* the factors. |
| Auditor | discrete, \(m=5\) | Already on all climate articles. |

Seeds stay **Debnath-grounded** for the core: `scopex_2017`, `chemtrails_gates_2018_2021`.

---

## 3. Design principle: saturated core + one-at-a-time add-ons

A \(2^6\) factorial is 64 cells. The minimum that still **identifies** each factor:

1. **Saturated core** for the three factors the campaign already crosses (valence × identity × clustering).
2. **One matched add-on per held factor** (surprise, echo sweep, temporal), cloned from a single baseline cell so the contrast is not aliased.
3. **Two satellites** for H7 and H8 (H8 already in `grid.json`).

Baseline clone source: **`A_sf_hom` × chemtrails** (highest expected firestorm; if *this* cell never tips, add-ons cannot show “more firestorm”).

---

## 4. Core (8 article-runs, 4 configs) — H1, H3, H4

Existing files; do not replace:

| Config | Topology | Mix | Seeds (sequential) | Tests |
|---|---|---|---|---|
| `configs/A_sf_hom.json` | `scale_free` `m=2` | homogeneous conspiracy | SCoPEx, chemtrails | valence × hubs × aligned identity |
| `configs/A_sf_mix.json` | `scale_free` `m=2` | mixed 3 BPs | same | identity buffering on hubs |
| `configs/A_er_hom.json` | `random_er` `p=0.42` `minSeedOutDegree=2` | homogeneous | same | valence × random |
| `configs/A_er_mix.json` | `random_er` same | mixed 3 BPs | same | open mixing |

`graphRandomSeed: 42`, 8 nodes, 6 ticks, drip `seedNodes: ["node_0"]`.

**Why 2×2×2 cannot be cut further.** Dropping ER loses H4. Dropping mix loses H3. Dropping SCoPEx loses H1. Dropping chemtrails leaves only the low-valence arm (often no \(k^*\)).

**Why this is not a CIKM reprint.** Networked BA/ER, Debnath BPs, geoengineering seeds, \(k^*\) on **network-mean** MI.

---

## 5. Add-on cells (3 configs, 3 article-runs) — H2, H5, H6

Clone **only** from `A_sf_hom` + `chemtrails_gates_2018_2021` unless noted. One article each.

| Cell (logical name) | Change vs baseline | Tests | Engine keys |
|---|---|---|---|
| **S_shock** | `seedNodes` = all eight node ids; keep 6 ticks | H2 surprise | `seedNodes` |
| **T_slow** | `activityPattern: "weekly"`, `maxTicks: 15`, `maxHops: 6` held | H6 temporal | `nodeParams.activityPattern`, `maxTicks` |
| **D_echo** | `topology: "echo_chamber"` as in `configs/D_echo_mix.json` / `configs/full/D_echo_mix.json`, mixed BPs, chemtrails, `minSeedOutDegree: 2`, `graphRandomSeed: 42` | H5 echo **sweep** | `topology`, `intraTrust` / `interTrust`, `by_cluster` |

Compare D_echo to **`A_er_mix` chemtrails** (open graph, same mix family), not to homogeneous SF (would alias identity + clustering + echo).

If T_slow with weekly yields \(< 2\) active weeks of scored events, the manipulation failed — extend `maxTicks` to 15 is already the floor (`tick % 7 === 1` ⇒ ticks 1, 8, 15).

Do **not** add small-world, polarized, hierarchical, bots, or `enableNetworkEvolution` to the minimum. Those are optional elaborations.

---

## 6. Satellites — H7, H8

### H7 (2 article-runs)

Same society as `A_sf_hom` and `A_sf_mix` (topology, BPs, ticks, drip). Change only:

```
"articlesPath": "articles/articles.json",
"seedArticles": ["crime_0"]
```

(`politics_0` is an allowed substitute; pick **one** commercial/general seed and freeze it.)

Keep Debnath `personasPath`. This is domain transfer of **BPs**, not a CIKM persona reprint.

Two cells (hom + mix) are the floor: otherwise H7 is aliased with H3.

### H8 (2 article-runs, already in grid)

`configs/B_sf_mix_n1.json` (`interventions[0].tick: 1`) and `B_sf_mix_n3.json` (`tick: 3`). Chemtrails, scale-free, mixed. `n=5` is not required for a minimum test of monotonicity between 1 and 3.

---

## 7. Cell count

| Block | Configs | Article-runs |
|---|---|---|
| Core A | 4 | 8 |
| S_shock, T_slow, D_echo | 3 | 3 |
| H7 commercial | 2 (or 2 overlays) | 2 |
| H8 B | 2 | 2 |
| **Total** | **11** | **15** |

Pilot `grid.json`: 4 A + 2 B + 1 D = 7 configs, 8 A-runs + 2 B + 1 D = 11 article-runs, of which D was unusable and S/T/H7 absent.

No further cut preserves all six factor tests. Cutting S_shock **or** T_slow leaves a held factor. Cutting D leaves echo unmanipulated (measurement-only). Cutting commercial leaves H7 as rhetoric.

---

## 8. Graph drawing (what is wired)

```
node_0 (seed in drip cells)
   │
   ├─ scale-free BA m=2     ── 8 nodes, homophily trust from persona tags
   ├─ ER p=0.42 + min out-degree 2
   └─ echo 2 chambers (D only): intra 0.75 / 0.85 trust, inter 0.08 / 0.15 trust
```

Not drawn: 30-node chain. Not drawn: 21 CIKM personas.

Shock cell: edges unchanged; **origin** fans out to all eight inboxes at tick 0.

---

## 9. Factors covered vs held

| Factor | Core | Add-on | Status if only `grid.json` is run |
|---|---|---|---|
| Valence | 2 seeds | — | Tested |
| Surprise | drip held | S_shock | **Untested** |
| Identity | hom vs mix | — | Tested |
| Clustering | SF vs ER | — | Tested |
| Echo | measured on A | D_echo sweep | **Not manipulated** (D failed) |
| Temporal | 6/always held | T_slow | **Untested** |
| Domain | climate only | H7 crime_0 | **Untested** |
| Correction | — | B n=1,3 | Tested |

---

## 10. Analysis units (do not mix)

- **U2 network-mean** for \(k^*\) (H1–H7 primary).
- **U1 event/hop** for H8 before/after and for dilution checks on H3 (conspiracy vs other MPR).
- Dead cells out. Do not recode \(k^*=\) none as 0.

---

## 11. Explicitly out of minimum scope

- Human–auditor agreement study (validity, not a factor test).
- ClimateFEVER full pipeline (proposal Phase III).
- Bridge-agent injection at \(k^*-1, k^*, k^*+1\).
- `enableFrameAnalysis` (optional H1 manipulation check; doubles audit cost).
- Ext. 3 emergent echo (`enableNetworkEvolution`).
- gpt-4o ablation.

Those can wait. H2 and H6 cannot, if the thesis claims “all six factors” as generative parameters rather than as a mapping table.
