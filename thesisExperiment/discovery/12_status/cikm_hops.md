# CIKM / LASS hop budget vs thesisExperiment 8-hop chains

**Sources.** CIKM/LASS paper PDF: `Paper/Arvix_Submission_Simulating_Misinformation_Propagation_in_Social_Networks_using_Large_Language_Models (1).pdf` (text extract: `thesisExperiment/discovery/01_literature/_extract/cikm_paper.txt`). Thesis chain grids: Exp **H** / **He**, `linear_chain`, `numNodes=8` / `maxTicks=8`, tables `results/tables/H_rows.csv`, `He_rows.csv`, hop series in `results/summary.json`.

**Scope of this note.** Chain length, rationale for \(K=30\), claimed nodes 5–9 inflection, homogeneous vs heterogeneous protocol, and whether thesis **8 hops** captured or truncated those dynamics. No new runs.

---

## What CIKM / LASS used

| Item | CIKM claim |
|---|---|
| Topology | Linear **branches** (chains), not a social graph |
| Length | Fixed \(K = 30\) rewrite nodes per branch; original article at neutral **Node0**; auditor after each rewrite |
| Grid (homo) | 21 personas × 10 domains × 30 hops |
| Model / auditor | gpt-4o; \(m=10\) QA items |

### Why \(K=30\)?

The paper does **not** derive 30 from a theory, half-life formula, or human cascade clock. It is a **fixed experimental length**:

- Methodology: “\(B\) independent branches, each of fixed length \(K=30\).”
- Limitations (§4.3): simulation used “fixed 30-hop branches without a realistic social graph”; future work may expand “node depth (\(>30\)).”

**Functional role of 30 in the reported results:** long enough that, after an early jump, MI can be shown to **stay elevated for the remainder of the chain** (plateau / irreversibility), not only to tip once. That plateau argument needs hops **after** the early window (roughly nodes 10–30).

### Inflection at nodes 5–9 (claimed where?)

**Claimed**, for **homogeneous** high-MPR trajectories (Fig. 4 top, top-10 agent–domain pairs; `education1` excluded as outlier):

> Many branches start with low or moderate node-level misinformation (green/yellow cells in nodes 1–4) but undergo a **rapid inflection between roughly nodes 5–9**, after which MI values jump and **remain at a high plateau** for the remainder of the 30-step chain.

Related timing language (same section): drift to “lie” can start at the **first** node; escalation to “propaganda” and beyond often by about the **tenth** node.

**Not universal:** bottom-10 (resistant) homogeneous pairs show **no** irreversible tipping; MI stays low with rare dissipating spikes. Heterogeneous results emphasize near-ubiquitous late propaganda (~85% of branch–domain pairs), not the same “nodes 5–9 then plateau” framing.

Treat “nodes 5–9” as a **CIKM observation on long high-MPR homo chains**, not a climate-campaign finding and not a law for every cell.

### Homogeneous vs heterogeneous protocol (CIKM)

| Arm | Protocol |
|---|---|
| **Homogeneous** | All 30 nodes in a branch share the **same** persona prompt → isolates persona-specific compounding |
| **Heterogeneous** | Personas **randomly assigned** along the branch, **at most 2 repetitions** per branch → models mixed audiences |

Reported pattern (prior only): identity/ideology personas accelerate drift on homo chains; experts stabilize; **mixed** branches often escalate early distortions to propaganda more broadly than the average homo cell.

---

## What thesisExperiment ran (8 hops)

| Arm | Design | Hop budget |
|---|---|---|
| **H** | 12 personas × 12 climate articles × homogeneous `linear_chain` | **8** nodes / 8 ticks (`gpt-4o-mini`, 5 QA) |
| **He** | 12 mixes × 12 articles; **8 unique** personas, **no within-chain repeats** | **8** |

Logged as hop compression vs CIKM 30 (and vs proposal longer clocks). Not a 21×10×30 reprint.

---

## Did 8 hops capture CIKM inflections or truncate them?

**Index note.** CIKM discusses rewrite **nodes 1–30**. Thesis `hopMI` series are hops **0–7** (eight rewrite scores). The CIKM window “roughly 5–9” only **partially overlaps** an 8-hop budget (thesis can observe roughly hops/nodes 5–7/8; **not** node 9, and **not** the post-tip plateau through 30).

| CIKM temporal claim | Visible under 8 hops? |
|---|---|
| Early mild MI (nodes ~1–4) | Yes (budget covers early hops) |
| Rapid inflection **onset** (~5–9) | **Partial** — only the early half of that band |
| Escalation to propaganda by ~**node 10** | **No** — hop 10 is outside the run |
| High **plateau for remainder of 30** | **No** — that is the main truncation; 8 hops cannot show “stayed red through 30” |
| Resistant flat trajectories | Possible in principle within 8 hops; cannot contrast with a long plateau |

### Evidence from accepted H / He hop series (`summary.json`)

Aggregate mean MI by hop (cells with `hopMI`):

| Hop | H mean MI | He mean MI |
|---|---|---|
| 0 | 1.25 | 1.42 |
| 4 | 1.73 | 1.96 |
| 5 | 1.77 | 2.33 |
| 7 | 1.77 | 2.61 |

- **H:** nearly flat after hop 4 (hop4→hop7 Δ ≈ +0.04). Few cells show a sharp late jump; most never hit irreversible propaganda (`kStar_hop` null on 119/144).
- **He:** still **rising** at the chain end (hop4→hop7 Δ ≈ +0.65). Nineteen tips fall in hops 5–7; **nine** tip at hop **7** (last index) — classic **right-censoring**: cannot tell whether MI would plateau, climb further, or recover past hop 8.

**Verdict.** Eight hops can catch **early** rise and a **slice** of the CIKM 5–9 onset band. They **truncate** the CIKM story that needs nodes ~10–30: completed inflection, propaganda-by-tenth-node, and irreversible plateau. Do **not** cite “inflection between nodes 5–9 then plateau” as a thesisExperiment result on these chains; at best report hop-resolved MI under an 8-step budget and mark end-of-chain tips as censored.

---

## Examiner one-liner

CIKM fixed \(K=30\) to watch early jumps **and** long plateaus; thesis 8-hop H/He cover only part of the claimed 5–9 onset and **cut off** the post-inflection plateau CIKM used as irreversibility evidence.
