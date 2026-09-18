# Replication of CIKM — climate-domain homo vs hetero

**Question.** What would count as a **successful** climate-domain conceptual replication of the CIKM homogeneous vs heterogeneous result (identity-aligned / single-persona chains distort more than mixed chains with experts), vs a **failed** replication?

**Context.** CIKM setup (repo README): linear chains; homogeneous vs heterogeneous persona mixes; MPR/MI heatmaps; crime/news-style articles; identity personas (e.g. Young Parent) vs experts. This thesis pivots to **climate / geoengineering / Debnath BPs** — so success is **pattern replication under domain shift**, not a crime_0 reprint.

**Current data.** Pilot is **not** a CIKM replication attempt: 8-node graphs (not chains), 3 BPs (no expert roster), 2 articles, gpt-4o-mini, N=1. Do not treat pilot mix-buffering as replication evidence.

---

## Target scientific claim (climate-translated)

> Under the same articles and hop budget, **homogeneous identity/conspiracy-aligned chains** produce higher distortion (MPR / irreversible propaganda) than **heterogeneous chains that include domain experts / non-aligned personas**, mirroring CIKM’s homo > hetero severity pattern.

Optional secondary claim (Debnath-flavoured, not CIKM-native): conspiracy-homogeneous > mixed three-BP graphs on network k\*. Keep these claims **separate** in reporting.

---

## Minimum design to even be eligible

| Requirement | Pass bar |
|---|---|
| Protocol | **Linear chains** (CIKM-comparable), logged hop length (LOG target 8). Graph Exp A is extra, not a substitute. |
| Homogeneous arm | Single-persona chains across identity/conspiracy (and, if claimed, expert-only homogeneous as control). |
| Heterogeneous arm | Mixes that include **≥1 expert / factual steward** persona (climate scientist, journalist, environmental specialist with accuracy instruction) + identity/conspiracy — not only three activist BPs. |
| Articles | **≥10** climate-domain items with 5-item auditors each (LOG ≥12 preferred). |
| Grid | Persona×article (homo) and mix×article (hetero) heatmaps — user “10×10” class. |
| Model | Document `gpt-4o-mini`; if claiming CIKM-strength, run **ablation** on ≥2 articles with gpt-4o. |
| Replicates | N≥1 labeled; for “success” language need **sign-stable** pattern across articles (ideally N≥3 on a subset). |
| Validity | No dry-run zeros; dead cascades excluded; real LLM calls logged. |

Pilot **fails eligibility**. Large run without experts / without heatmaps / with <10 articles also fails eligibility.

---

## Successful replication (climate)

All of the following must hold on **valid** cells only:

1. **Direction.** Median (or mean) chain MPR: homogeneous identity/conspiracy **>** heterogeneous (with experts) on a clear majority of articles (pre-register: ≥70% of articles, or Wilcoxon signed-rank p-style descriptive consistency if N articles ≥10).
2. **Experts matter.** Expert nodes in hetero chains sit in factual-error / low-lie band more often than identity nodes on the same article; removing experts from the mix (ablation) shrinks the homo–hetero gap.
3. **Not only network-mean dilution.** Report **node-type-conditioned** MPR (conspiracy vs expert vs other). A “hetero win” that is only fewer conspiracy seats does **not** count unless per-type gap persists.
4. **Heatmaps exist.** Homo persona×article and hetero mix×article MPR heatmaps show the pattern visually (high band on identity/conspiracy rows; cooler expert-inclusive mixes).
5. **Irreversibility (optional but strong).** Homogeneous chains more often hit sustained MI>3 (k\* or hop-analogue) than hetero on the same seeds.
6. **Domain honesty.** Text states: conceptual replication in climate domain with Debnath-informed personas; **not** a CIKM crime-news reprint; model = mini unless ablated.

### Success phrasing allowed

- “Climate-domain chains reproduce the CIKM-style ordering: homogeneous identity/conspiracy distort more than expert-inclusive heterogeneous mixes.”

### Success phrasing forbidden even if numbers look good

- “We replicated CIKM Outstanding Paper results.”
- “Debnath 814k confirmed.”
- “Pfeffer valence proven.”

---

## Failed replication (climate)

Any of the following = **failed** (or inconclusive — but thesis must say failed/inconclusive, not soft success):

| Failure mode | What you will see |
|---|---|
| **Null / reverse** | Hetero MPR ≥ homo on most articles; or gaps < noise with no article-level consistency. |
| **Obedience artifact only** | Homo high MPR solely where system prompts order inversion; experts unused; no CIKM-like identity-without-expert contrast. |
| **Dilution pseudo-success** | Network/chain mean lower in hetero only because conspiracy fraction dropped; per-conspiracy-node MPR unchanged. |
| **Dead grid** | Many articles/personas with 0–1 events → fake lows in hetero (or homo). |
| **Wrong object** | Only BA/ER graph 2×2 (pilot-style) completed; no chain heatmaps — **not a CIKM-pattern test**. |
| **Model mismatch unaddressed** | Strong claims while only mini ran and known CIKM figures used gpt-4o-class setups. |
| **Article starvation** | <10 articles → cannot claim domain-general ordering. |
| **All k\*=none** | No sustained propaganda anywhere — engine under-powered or ticks too short; cannot confirm homo severity advantage. |
| **All saturated MI=5** | Auditor/prompt collapse; ordering meaningless. |

### Failed phrasing required

- “Did **not** reproduce CIKM homo>hetero ordering under climate personas/articles.”
- or “Inconclusive: grid invalid (cascade death / dilution / N articles).”

---

## Mapping pilot → replication status

| Pilot observation | Replication value |
|---|---|
| Hom SF chemtrails k\*=1; mix SF no network k\* | **Suggestive only**; graph means + no experts + 2 articles. |
| Mix “buffered” network MI | Likely **dilution confound** — not CIKM success. |
| Conspiracy nodes MPR≈3.6 vs others ≈2.2–2.5 | Prompt compliance, weak hetero signal. |
| ER-mix chemtrails death | Contamination risk for any future aggregate. |

**Pilot replication verdict: NOT TESTED.**

---

## Acceptance snippet for executor (copy into ACCEPTANCE later)

```
CIKM-climate replication = PASS only if:
  - chain homo vs hetero heatmaps exist
  - ≥10 articles scored with real LLM
  - hetero includes expert-class personas
  - homo MPR > hetero on ≥70% articles (valid cells)
  - per-type MPR shows experts lower than identity on shared articles
  - dead cells <10% of grid
else FAIL or INCONCLUSIVE (no soft PASS).
```
