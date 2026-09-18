# Pfeffer six-factor mapping (operationalised)

Thesis framing (Pfeffer / Debnath climate-firestorm). Each factor has a **config knob** and a status: swept / held / measured.

| Factor | Meaning | Engine knob | Full campaign (18 Sep 2026) | Status |
|---|---|---|---|---|
| **Valence** | Emotional charge | Persona `emotionalTone` + article wording | 12-article set (factual SCoPEx/Paris/consensus vs high-arousal chemtrails). Conspiracy personas `alarming`; climate-action `urgent`; environmental `cautious`; experts `neutral`. FrameAuditor off (cost). | **Varied** (articles + tones). |
| **Surprise** | Volume shock vs drip | `seedNodes`; reinterpret weight | **Held drip:** seed `node_0` only. Chains use high reinterpret (0.85) so frames overwrite along the path; graphs keep 0.50. No all-node volume-shock cell (cost). Exp B correction is a mid-cascade shock. | **Held** (drip). B injects a correction shock. |
| **Identity alignment** | Message–identity fit | Personas + `_homophilyTrust` | Swept: 12 homogeneous personas (H); 12 heterogeneous mixes (He); graph hom conspiracy vs mixed-8BP (A). | **Swept**. |
| **Network clustering** | Hubs vs random vs bubbles | `topology` | Linear chain (H/He); scale-free BA m=2 vs ER p=0.42, `graphRandomSeed=42`, `minSeedOutDegree=2` (A); echo chamber 2 chambers (D). | **Swept**. |
| **Information echo** | Closed-group repetition | `relationEvolution`, trust, modularity | Trust evolves (`trustDelta=0.05`). **Measured:** edge homophily, conspiracy-cut modularity, PI, Gini, hop-wise MI. D cell **sweeps** high intra / low inter trust. Echo RNG is seeded; min seed out-degree avoids isolation. | **Measured** on graphs; **swept** in D. |
| **Temporal acceleration** | Runaway speed | `maxTicks`, `maxHops`, `activityPattern`, `maxInboxSize` | Always-on, **8 ticks / 8 hops** (cut from 12-hop CIKM clone and from a 15-tick proposal). Inbox cap 4. | **Held** (documented compression). |

## Experiment A (full)

2 × 2 × 6-article subset, N=1, 8 nodes, 8 ticks, `gpt-4o-mini`:

| Cell | Topology | BP mix | Config |
|---|---|---|---|
| A_sf_hom | scale-free | homogeneous conspiracy | `configs/full/A_sf_hom.json` |
| A_sf_mix | scale-free | mixed 8 of 12 BPs | `configs/full/A_sf_mix.json` |
| A_er_hom | random ER (seeded) | homogeneous conspiracy | `configs/full/A_er_hom.json` |
| A_er_mix | random ER (seeded) | mixed 8 of 12 BPs | `configs/full/A_er_mix.json` |

Articles in A (cost subset of 12): `scopex_2017`, `chemtrails_gates_2018_2021`, `sai_geoengineering`, `paris_agreement`, `climate_consensus`, `polar_bears`.

**k\***: first tick where **network-mean MI > 3** and mean MI stays > 3 on later ticks with data.

## Experiment B

`n ∈ {1,3,5}` chemtrails exposures then `fact_checker_injection`. Topology: scale-free × mixed-8BP.

## ER / echo cascade-death fix

Unseeded `Math.random()` ER/echo graphs can isolate `node_0`. Engine: `graphRandomSeed`, homophily-weighted trust, **`minSeedOutDegree`** for ER and echo chamber.
