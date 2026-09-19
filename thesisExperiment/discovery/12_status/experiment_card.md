# Experiment card — thesisExperiment full campaign

**Model:** `gpt-4o-mini` · **Mode:** real LLM (not dry-run) · **N:** 1  
**Sources:** `results/summary.json`, `results/full_campaign_manifest.json`, `results/tables/*.csv`, `configs/full/`, `LOG.md`

| Window | Timestamp (UTC) |
|---|---|
| Started | `2026-09-18T03:49:27.732Z` |
| Finished | `2026-09-18T06:12:45.737Z` |
| Duration | **2 h 23 m 18 s** (8581 s wall) |
| LLM calls | **8723** |
| Est. USD (list) | **$1.0185** (~$1.02) |
| Table rows | **316** (H 144 + He 144 + A 24 + B 3 + D 1) |

---

### H — linear homogeneous
- **Personas:** 12 (4 conspiracy + 3 climate-action + 3 environmental + 2 expert)
- **Articles:** 12 (5 QA / 5 GT each)
- **Topology:** `linear_chain`, **8** nodes, **8** hops / **8** ticks
- **Cells:** **144** (12 × 12); all `status=complete`, `model=gpt-4o-mini`
- **Configs:** `configs/full/H_*.json`

### He — linear heterogeneous
- **Mix rule:** 12 mixes × **8 unique personas/chain** (no within-chain repeats); mixes **00–05** sliding windows over 12 ids; mixes **06–11** seeded shuffles
- **Articles:** 12 · **Hops:** 8 · **Cells:** **144** (12 × 12)
- **Configs:** `configs/full/He_mix_00.json` … `He_mix_11.json`

### A — graphs
- **Topologies:** scale-free (`m=2`) × random-ER (`p=0.42`, `minSeedOutDegree=2`)
- **Mixes:** homogeneous-conspiracy × mixed-8BP
- **Ticks / nodes:** **8** / **8** · **Articles:** **6**/12 `{scopex_2017, chemtrails_gates_2018_2021, sai_geoengineering, paris_agreement, climate_consensus, polar_bears}`
- **Cells:** **24** (2 topo × 2 mix × 6 articles)
- **Dead cells (1 event, MI=0):** **4**/24 — `A_sf_mix`×{scopex, chemtrails, SAI}; `A_er_mix`×polar_bears

### B — fact-checker injection · n ∈ {1, 3, 5}
- **Setup:** scale-free × mixed-8BP × `chemtrails_gates_2018_2021`, 8 nodes, 8 ticks
- **Cells:** 3 (`B_sf_mix_n1` / `n3` / `n5`); injection ticks **1 / 3 / 5**, `correctionStrength=0.9`
- **Before→after mean MI** (`B_before_after.csv`): n1: (empty)→**3.0461**; n3: **2.5714**→**3.2956**; n5: **1.8846**→**2.2596**

### D — echo chamber
- **Topology:** `echo_chamber` (2 chambers; intra/inter edge 0.75/0.08; trust 0.85/0.15; `minSeedOutDegree=2`; `graphRandomSeed=42`)
- **1** live cell × chemtrails × mixed-8BP × 8 nodes × 8 ticks · **184** calls · **151** events · mean MPR **3.3535**
- **Echo metrics:** edgeHomophily **0.44**, modularityConspiracy **0.2948**, PI **3.0181**  
  (Pilot D at 03:15 with 0 LLM calls is **invalid**; not used.)

### Pilot (label — not a chapter)
- **2-article** N=1 real-LLM pilot: `scopex_2017`, `chemtrails_gates_2018_2021`; **3** Debnath BPs; **8** nodes × **6** ticks. Superseded by the full campaign above; do not treat as thesis-scale evidence.
