# Methods: hop budget (paste-ready)

**Sources (do not invent a nicer rationale).** `thesisExperiment/LOG.md` (kickoff scale decision + wrap cuts); `thesisExperiment/results/findings.md`; `thesisExperiment/scripts/build_stimuli.js` (`CHAIN_NODE_PARAMS.maxHops`, `GRAPH_NODE_PARAMS.maxHops`, `maxTicks`, `grid.hops`); Maurya et al. LASS@CIKM 2025 (`discovery/01_literature/_extract/cikm_paper.txt`; note `cikm_hops.md`); Debnath et al. iScience 2023 (`debnath_hops.md`).  
**Date.** 18 September 2026.

Paste the next section into Methods / experimental design. Keep the examiner list out of Results.

---

## Paste into Methods

The prior LASS@CIKM study (Maurya et al., 2025) used **linear branches of fixed length \(K=30\)**: a neutral seed at Node0 and 30 successive persona rewrites, with the auditor applied after each hop. Homogeneous cells were a 21-persona × 10-domain × 30-hop matrix. That length is a **fixed experimental horizon**, not a quantity derived from cascade theory, a half-life formula, or Twitter depth. Its reported function is to let early drift be followed by a **long remainder**: on high-MPR homogeneous trajectories the paper describes a rapid inflection **between roughly nodes 5–9**, after which MI jumps and **stays on a high plateau for the rest of the 30-step chain**, with propaganda-tier escalation often by about the tenth node. Those 5–9 / plateau statements are **prior results on that crime/news grid**. They are not findings of this climate campaign and must not be copied into Results.

This campaign used **eight hops and eight ticks**, not 30. In `build_stimuli.js`, both chain and graph node parameters set `maxHops: 8`; linear-chain cells use `topologyParams.numNodes: 8` and `maxTicks: 8`; the campaign grid records `hops: 8`. Homogeneous Experiment H (12 personas × 12 articles) and heterogeneous Experiment He (12 mixes × 12 articles) are 8-node `linear_chain` runs with that budget. Graph cells (A, B, D) use the same `maxHops: 8` / `maxTicks: 8`. The engine still treats **hop and tick as different clocks** (path length vs simulation step; messages with `hops > maxHops` are not forwarded). Matching them at 8 does not make them identical, and hop-compressed ticks are not CIKM node indices.

The logged reason for eight is **cost and wall-clock truncation**, not a scientific target. The campaign log records a scale decision “cost/time, not faking cells”: hops/ticks for chains **8, cut from 12**, and wrap-up cuts “hops 8 not 12/30.” Homogeneous configs label temporal acceleration as “8 hops / 8 ticks (cut from 12 for cost; logged).” Findings describe the same cut as logged compression versus **30-hop CIKM** and the proposal’s longer clocks (≈15-tick examples; echo modularity at \(t=\{10,30,50\}\)). No log entry, config comment, or stimulus builder derives 8 from Debnath, from CIKM’s 5–9 window, or from a firestorm duration. The 12-hop figure that was cut is also undocumented as theory; it was an unaffordable intermediate budget.

Because CIKM’s reported inflection often **begins** inside hops 5–9, an 8-hop climate chain can still **observe an onset of \(k^*\)** (first hop/tick where network-mean MI \(> 3\) and later scored points do not return to \(\le 3\)). That overlap is a **post-hoc coverage argument**, not why the budget was chosen. Eight hops **cannot** support CIKM’s 30-hop dynamics: not the completed 5–9 band (node 9 is at or beyond the chain end, depending on 0- vs 1-based indexing), not “propaganda by the tenth node,” and not a plateau “for the remainder of the 30-step chain.” A last-hop crossing is a **right-censored terminal spike**, not a 30-hop irreversible plateau.

Eight hops is **not** a Debnath replication of hop length. Debnath, Reiner, Sovacool et al. (iScience 2023) do not specify simulation hop depth, retweet-cascade depth, or 8-step agent chains. Their network object is **hashtag co-occurrence** with eigenvector centrality, not a user-to-user diffusion tree. The only Debnath “eight” in STAR Methods is a **word2vec skip-gram context window of eight words**. Phase III cascade reconstruction via `conversation_id` was a **proposal** for this thesis and was not run. Simulator hop index is not Twitter depth.

Pfeffer temporal acceleration is therefore **held** at this compressed clock. Report \(k^*\) with censoring (`lastTick` / last hop, points after first cross). Do not equate 8 LLM rewrites with empirical firestorm duration.

---

## What the examiner will attack

1. **“You replicated CIKM / LASS.”** Prior work is \(K=30\), gpt-4o, \(m=10\) QA, 21×10 news domains. This run is 8 hops, `gpt-4o-mini`, 5 QA, climate articles. Cite Maurya et al. as **prior method**; do not put Young Parent, crime0, ≈85% hetero propaganda, or “nodes 5–9 then plateau” in climate Results.

2. **“Why 8, if not theory?”** Answer from the log: **cut from 12 for cost/time**, and vs 30. Do not retrofit “we stopped at 8 because CIKM inflects at 5–9.” That overlap is a limitation hedge, not a design justification.

3. **“8 hops = Debnath cascade protocol.”** False. Debnath’s eight is an NLP window. Equating MI hops with Twitter depth without validation is a listed examiner risk. Phase III was omitted.

4. **Irreversibility theatre.** A network-mean MI \(> 3\) at hop/tick 7 or 8 is **right-censored**. CIKM used hops 10–30 to argue the plateau stayed high. This series cannot. Heterogeneous hop-MI in the accepted grid is still **rising at hop 7**; several He tips sit on the last index. Call those censored, not textbook \(k^*\).

5. **Truncation bias on \(k^*\).** Too-short series can push \(k^*\) to **none** (no time to stay above 3) **or** to **early lock-in** (no later points that could recover). Disclose both. Hop \(\neq\) tick; do not treat 8 always-on ticks as 30 rewrite nodes.

6. **Proposal clocks not delivered.** Echo modularity is at **8 ticks**, not \(t=\{10,30,50\}\). 8 hops/ticks are not Pfeffer’s multi-week firestorm clock.

**Allowed one-liner.** *CIKM used fixed 30-hop branches; this climate campaign used 8 hops/ticks as a logged cost cut from 12 (and versus 30), which may still catch a \(k^*\) onset in the early 5–9 window but cannot claim 30-hop plateaus, Debnath hop depth, or a CIKM replication.*
