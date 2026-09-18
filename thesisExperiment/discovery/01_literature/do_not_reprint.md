# Do not reprint — CIKM / LASS 2025 sentences & claims

**Purpose:** Prevent the TUM thesis from presenting **Maurya et al. (LASS@CIKM 2025)** results as new thesis findings. Cite them as **prior work**. Climate-firestorm pilot results are separate and must be labeled as such.

**Source of record:**  
`Paper/Arvix_Submission_Simulating_Misinformation_Propagation_in_Social_Networks_using_Large_Language_Models (1).pdf`  
arXiv:2511.10384 · https://doi.org/10.48550/arXiv.2511.10384

Quotations below are **near-verbatim** from the PDF extract / arXiv HTML (minor PDF hyphenation cleaned). Use them as a **red list**: if a Results/Discussion sentence matches these claims about the *crime/marketing/education linear-chain study*, rewrite as citation to prior work.

---

## A. Global “do not present as thesis Results”

### Framework & metrics (cite as prior method — OK to reuse instrument)

> “we introduce an auditor–node framework to simulate and analyze how misinformation evolves as it circulates through networks of such agents.”

> “We formalize a misinformation index (MI) and a misinformation propagation rate (MPR) to quantify factual degradation across homogeneous and heterogeneous branches of up to 30 sequential rewrites.”

> “Factual error: |MPR| ≤ 1” / “Lie: 1 < |MPR| ≤ 3” / “Propaganda: |MPR| > 3”

**Allowed:** “Following Maurya et al. (2025), we use MI/MPR and the same severity bins…”  
**Forbidden:** Implying the thesis *introduced* MI/MPR or the three-tier taxonomy.

---

### Homogeneous-branch headline findings (PRIOR ONLY)

> “Experiments with 21 personas across 10 domains reveal that identity- and ideology-based personas (e.g., religious leaders, lifestyle influencers, politically aligned individuals) act as misinformation accelerators, especially in politics, marketing, and technology.”

> “By contrast, expert-driven personas (e.g., medical professionals, investigative journalists) preserve factual stability.”

> “Aggregated across all 210 agent-domain pairs, the overall distribution has frequency of (error, lie, propaganda) = (47, 97, 66).”

> “The most extreme propagator turns out to be Parent (Young Parent) with an average MPR of 5.48.”

> “The most vulnerable is crime0 with an average MPR of 4.2, where 16 of the 21 agents reached ‘propaganda’ level…”

> “A peculiar anomaly is education1 with 20 agents remaining in the ‘error’ tier… It is the only domain with average MPR below 1.”

**Forbidden in thesis Results:** Young Parent MPR 5.48; crime0 MPR 4.2; (47, 97, 66) tier counts; education1 anomaly — unless clearly attributed to CIKM and not the climate campaign.

---

### Heterogeneous-branch headline findings (PRIOR ONLY)

> “heterogeneous branches produced propaganda-tier outcomes in the overwhelming majority of trials (≈85% of all branch–domain pairs)”

> “179 cases (85.2%) reached the propaganda tier, with only 18 cases (8.6%) confined to lies and 13 cases (6.2%) to error.”

> “once early distortions emerge, heterogeneous persona interactions rapidly escalate misinformation to propaganda-level distortion.”

**Forbidden:** “In our experiments, ~85% of heterogeneous branches reached propaganda” — unless the climate grid independently reproduces that statistic (it has not at N=1 / 8 nodes).

---

### Trajectory / tipping language tied to 30-hop chains (PRIOR ONLY)

> “drift to a ‘lie’ level of misinformation could start as early as the first node and then escalate to the ‘propaganda’ tier and beyond by the tenth node”

> “Many branches start with low or moderate node-level misinformation… but undergo a rapid inflection between roughly nodes 5–9, after which MI values jump and remain at a high plateau… for the remainder of the 30-step chain.”

**Allowed:** Cite as *prior* evidence that early inflection is common on long linear chains.  
**Forbidden:** Presenting “nodes 5–9 inflection” as a finding of the climate 6-tick pilot without recomputation.

---

### Discussion summary sentences (PRIOR ONLY)

> “This paper introduced an interpretable auditor–node framework that combines persona-conditioned LLM agents with a QA-based auditor…”

> “When branches are heterogeneously composed… nearly ubiquitous escalation occurs… (≈85% of all branch–domain pairs)”

> “These empirical patterns validate our core claim that LLM personas can both emulate human-like motivated reasoning and serve as a practical substrate for controlled social-simulation experiments.”

**Forbidden:** Opening the thesis Results chapter with “This thesis introduces an auditor–node framework…” if the only evidence is the CIKM study.

---

## B. Domains & personas that are CIKM-only (do not mix into climate Results)

Do **not** report as thesis climate-campaign outcomes:

| CIKM artifact | Why it is PRIOR |
|---------------|-----------------|
| Domains `crime0`, `marketing0`, `education0/1/2`, `healthcare0`, `politics0/1`, `sports0`, `technology0` | General news corpus in CIKM Appendix |
| Personas Young Parent, Conservative Religious Leader, Lifestyle Influencer, etc. (21 archetypes) | CIKM persona set |
| \(K=30\) linear branches; Node0 → NodeX chain | CIKM topology |
| gpt-4o, \(m=10\) auditor questions per domain | CIKM experimental config |

Thesis climate cells use Debnath-grounded BPs, SCoPEx / chemtrails seeds, SF/ER graphs — **different experiment**.

---

## C. Limitations already admitted in CIKM (do not claim the thesis fixed them unless it did)

From CIKM §4.3 — if still true of the thesis system, say so; if fixed, show evidence:

> “we used only 10 news articles and fixed 30-hop branches without a realistic social graph”

> “we assumed a ‘perfect’ fact-checking auditor”

> “we ignored temporal dynamics… which our static model cannot capture”

> “we measured misinformation only in categorical bins”

**Thesis progress (only claim if implemented):** networked topologies; climate domain; compressed ticks with activity; optional IFD continuous scoring in the broader repo — verify before writing.

---

## D. Safe citation templates

**Prior work:**  
“Maurya et al. (2025) showed on linear persona chains over ten general-news domains that heterogeneous branches reached propaganda-tier MPR in approximately 85% of branch–domain pairs.”

**Thesis contribution:**  
“Building on that auditor–node instrument, this thesis asks whether networked agents with Debnath-grounded belief profiles exhibit firestorm tipping (\(k^*\)) on geoengineering seeds under an operationalisation of Pfeffer et al.’s factors.”

**Pilot caveat:**  
“The climate campaign reported here is an N=1 gpt-4o-mini pilot and is not a reprint of the CIKM 21×10×30 grid.”

---

## E. Quick self-check before submitting Results

- [ ] No Young Parent / crime0 / education1 numbers without “(Maurya et al., 2025)”  
- [ ] No “85% heterogeneous propaganda” as a *thesis* result  
- [ ] No “we introduce MI/MPR” without acknowledging CIKM  
- [ ] Climate seeds (SCoPEx, chemtrails–Gates) never described as part of the CIKM 10 domains  
- [ ] Pfeffer six-knob table not attributed as Pfeffer’s original wording (see `related_work.md`)

---

*If in doubt: put the sentence in Related Work / Prior Work, not in Results.*
