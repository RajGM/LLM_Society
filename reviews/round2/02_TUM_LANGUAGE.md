# Round 2 — TUM language verification

## Verdict

**PASS** (after critical/major prose repairs in this pass).

The post-round-1 manuscript already used British English, hedged N=1 claims,
and answered the four research questions in a consistent sequence. Remaining
defects in the requested scope were register, RQ-heading alignment, leftover
promotional wording, one grade-meta sentence, and a few sprawling or
defensive constructions. Those items were repaired in source. Residual issues
are moderate or minor and do not reverse the language verdict.

This pass does **not** certify official TUM template compliance, identity
fields, or a grade. Front-matter placeholders remain deferred from round 1.

## Basis and scope

Reviewed against:

- uploaded TUM skill `SKILL_TUM-ACADEMIC_WRITING_042a.md` (byte-identical to
  the round-1 file `SKILL_TUM-ACADEMIC_WRITING_0d10.md`);
- the chair guide *Successfully Writing a BA or MA Thesis*, using the
  recorded extract in `thesisExperiment/thesis_work/drafts/00_TEMPLATE_COMPLIANCE.md`
  (the PDF was not present in this checkout);
- post-round-1 sources: `main.tex` abstract; `chapters/01_introduction.tex`;
  chapter-to-chapter transitions; `chapters/06_discussion.tex`;
  `chapters/08_conclusion.tex`; sentence-length counts on those sections;
  RQ wording in Introduction, Results openings, Discussion, and Conclusion;
  grade/award/hype search across `thesis_final/**/*.tex`.

Numerical values, cell counts, API-error counters, modularity figures, and
D-net comparisons were not rewritten except where a sentence was split or a
heading was aligned. No experiment was rerun.

Severity (same scale as round 1):

- **CRITICAL** — meaning or academic validity of the reviewed prose is
  compromised (wrong RQ, grade/award claim, unhedged causal law).
- **MAJOR** — likely examiner challenge: RQ mismatch, promotional/defensive
  filler, rhetorical-question headings, sprawling multi-claim sentences,
  vague demonstratives in the opening claim.
- **MODERATE** — readability or leftover formula, not a submission-language
  fail.
- **MINOR** — polish.

## Sentence length (post-repair)

Word counts exclude LaTeX macros. Enumerated RQ items and `\textcite`
stripping produce one false long “sentence” in the Introduction and one in
the Discussion; those are ignored.

| Section | n sentences | mean | median | p90 | max | >35 | >45 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Abstract | 20 | 16.4 | 17 | 23 | 32 | 0 | 0 |
| Introduction | 130 | 14.5 | 13 | 22 | 32* | 0* | 0 |
| Discussion | 141 | 19.1 | 19 | 30 | 41 | 2 | 0 |
| Conclusion | 52 | 12.6 | 11 | 22 | 29 | 0 | 0 |

\*True prose maximum in the Introduction is the roadmap sentence (~30 words).
The 39-word detector hit was the RQ2 item glued to the preceding sentence.

The longest genuine Discussion sentence is the collapsed H/He numerical
list (41 words). It reports four means in one comparison and is acceptable.
The 50-word D-net four-contrast sentence was split in this pass.

Chair-guide and TUM-skill “read aloud” rule: abstract, introduction, and
conclusion now sit in a short-to-medium band. Discussion remains denser, as
expected for evidence paragraphs that must carry denominators.

## RQ alignment

Introduction RQs (unchanged wording; already narrowed in round 1):

1. **RQ1** — sensitivity of claim-recoverability levels and network-condition
   orderings to continuous vs dual-discrete auditor regimes.
2. **RQ2** — variation of live-cell mean MI and within-window \(k^{*}\)
   across named persona families and heterogeneous compositions.
3. **RQ3** — differences among eight **bundled network conditions** in
   same-regime H/He contrasts, live-cell mean MI, and scorable-cell survival.
4. **RQ4** — what the 63-node constructed hashtag-graph stress test can
   establish about recurring composition patterns, and where it fails.

| Surface | Before this pass | After this pass |
|---|---|---|
| Abstract | Primary measurement audit; secondary composition, bundled networks, D-net stress test; no firestorm test | Unchanged; aligned |
| Introduction aim / roadmap | Measurement first; RQ1–RQ4 order | Unchanged; aligned |
| Results opening | RQ1→RQ2→RQ3→RQ4; D-net as recurrence not identified effect | Unchanged; aligned |
| Discussion headings | RQ1 question OK; RQ2 “role of identity”; **RQ3 causal “topology affect”**; duplicate measurement section between RQ3 and RQ4; **RQ4 “generalise”** | Declarative RQ1–RQ4 headings match the Introduction; duplicate section merged into RQ1; order is RQ1, RQ2, RQ3, RQ4 |
| Conclusion answers | RQ1 measurement; RQ2 named composition; RQ3 bundled conditions and survival; RQ4 stress test | Unchanged; aligned |

No remaining heading asks a causal topology question or treats D-net as
out-of-sample generalisation.

## Grade / award hype

| Check | Result |
|---|---|
| “award paper”, Outstanding Paper, CIKM main-track prestige | **Absent** from thesis `.tex` |
| Grade guarantee / `thesisGrade` / “1.0” as an evaluation claim | **Removed** from Conclusion (`This revision does not assign or guarantee a grade`) |
| “honest”, “transparent measurement”, “useful stress test”, “defensible result”, “survives” as promotional verbs | **Removed or replaced** in the reviewed sections |
| Self-evaluative contribution list | Conclusion already used the round-1 non-hype list |

The only remaining “award” string is the auditor “awards categorical
penalties,” which is a scoring verb, not a prize claim.

## Findings repaired in this pass

### L2-01 MAJOR — Conclusion contained revision-meta grade language

- **Location:** `08_conclusion.tex` (former closing sentence).
- **Issue:** “This revision does not assign or guarantee a grade” is
  process commentary. The chair guide treats the submitted text as the
  academic argument; TUM skill §8 forbids informal/meta register. Round 1
  TUM-23 already forbade pipeline-status sentences in thesis prose.
- **Fix:** Deleted. The Outlook already states the bounded use of the
  testbed. No grade is claimed or disclaimed in the manuscript body.

### L2-02 MAJOR — Discussion RQ headings did not match the stated RQs

- **Location:** `06_discussion.tex` former RQ3/RQ4 headings.
- **Issue:** RQ3 asked how “network topology affect[s] misinformation
  propagation,” which is causal and conflicts with the Introduction’s
  bundled-condition wording. RQ4 asked whether D-net “generalise[s]”
  small-grid findings, which overstates a constructed-graph stress test.
  TUM skill §8 forbids rhetorical questions; genre allows RQs in
  Chapter 1, not restated as causal questions in Discussion.
- **Fix:** Declarative headings: RQ1 auditor-regime sensitivity; RQ2 named
  compositions; RQ3 bundled network conditions, live-cell mean MI, and
  cascade survival; RQ4 constructed hashtag-graph stress test.

### L2-03 MAJOR — Discussion interrupted RQ order with a duplicate measurement section

- **Location:** former `06_discussion.tex` “Measurement implications across
  RQ2 and RQ3.”
- **Issue:** The chair guide requires a logical path from question to
  answer. Inserting a second RQ1 block between RQ3 and RQ4 forced the
  reader to reconstruct the sequence. Round 1 NAR-2.4 had already required
  RQ1–RQ4 order.
- **Fix:** Unique numbers (topology-mean gaps 0.8201 / 1.0450; paired
  medians 0.8125 \(n=398\) and 0.9778 \(n=198\); He \(k^{*}\) 32.1% vs
  7.6%; Spearman \(\rho=0.095/0.167\)) moved into RQ1 Evidence. Interpretation
  and Implication paragraphs retained. Duplicate section deleted.

### L2-04 MAJOR — RQ3 evidence opened with an identified topology effect

- **Location:** `06_discussion.tex` RQ3 Evidence.
- **Issue:** “Topology changed the live-cell scores…” treats the eight
  generators as a causal factor. Methods already records bundled action
  policy, assignment, and survival.
- **Fix:** “The eight bundled network conditions differed in live-cell
  scores, … No condition occupied the highest or lowest position
  consistently….” All subsequent means, dead rates, and \(k^{*}\) comments
  retained.

### L2-05 MAJOR — Introduction opening used a vague demonstrative and an uncited consequence claim

- **Location:** `01_introduction.tex` Problem and motivation.
- **Issue:** “This process matters when…” left “this” without a noun and
  asserted consequence without a citation (TUM skill §§3, 8, 10; chair-guide
  paraphrase/citation rule; leftover round-1 LANG item 3 and TUM-14). The
  next sentence then repeated weather-control/elite-manipulation already
  cited from Debnath.
- **Fix:** “Such semantic transformation occurs when communicators attach a
  scientific proposal to an established conspiracy narrative.” The Debnath
  sentence is unchanged. The redundant “policy-relevant question” sentence
  was removed; the travel-versus-transformation problem statement remains.

### L2-06 MAJOR — Introduction gap paragraph remained nominalised and vague

- **Location:** `01_introduction.tex` Research gap.
- **Issue:** “The gap addressed here lies at their intersection. It
  concerns how to…” (leftover round-1 LANG item 4).
- **Fix:** “This thesis addresses how researchers can design and audit
  synthetic semantic propagation without treating simulation output as
  observed social behaviour.”

### L2-07 MAJOR — Vague actor on the dead-cell exclusion rule

- **Location:** `01_introduction.tex` Aim.
- **Issue:** “It excludes those cells…” after a sentence about \(k^{*}\).
- **Fix:** Combined with the hatch sentence: the analysis retains 292
  hatched-dead cells and excludes them from live-cell means without recoding
  them as zero.

### L2-08 MAJOR — Promotional or defensive wording in intro, theory close, discussion, results

| Location | Before | After |
|---|---|---|
| Intro contributions | “transparent measurement” | “measurement reporting” |
| Theory closing | “This limitation does not remove the theoretical contribution. It clarifies it.” + “tests which findings persist” | Direct contribution statement; “examines which findings persist” |
| Discussion validity | “These limitations do not make the campaign uninformative. They narrow the appropriate claim.” | “These limitations restrict the claim to the documented prompts, graph protocols, and auditor scores.” |
| Discussion D-net | “useful stress test”; “survives a change in graph size” | Holds topology fixed / “recurs after a change” |
| Results mix paragraph | “its MPR is higher”; “The defensible result is therefore compositional” | live-cell mean MI; descriptive mix ordering only |
| Results D-net close | “The application supports three bounded conclusions”; rhetorical “Do the small-topology findings hold?”; “The valence result” | Observational handover to Chapter 6; “Recurrence of composition patterns…”; “article-specific scores” |

All listed numerical contrasts were kept.

### L2-09 MAJOR — Sprawling D-net evidence sentence

- **Location:** `06_discussion.tex` RQ4 Evidence.
- **Issue:** One 50-word sentence listed four article–instrument contrasts
  (TUM skill §7).
- **Fix:** Split into a directional sentence plus two instrument-specific
  sentences. Values unchanged: continuous 1.7349 vs 0.9983 and 3.3378 vs
  2.5068; dual-discrete 4.2537 vs 2.6880 and 3.7303 vs 1.5297.

## Remaining issues (not repaired)

### L2-10 MODERATE — Repeated limitation formula

Introduction, Theory, and Discussion still use short “It does not…”
sentences to bound claims. Round 1 LANG-4 retained these where they prevent
overclaim. They are formulaic but functionally hedging (TUM skill §9).
Further variation would be polish, not a language fail.

### L2-11 MODERATE — Discussion opening restates “this distinction”

`06_discussion.tex` lines 4–8 repeat “distinction” across two sentences and
pack \(N=1\), eight ticks, and 292/1,728 into one clause. Readable; not
ambiguous.

### L2-12 MODERATE — Results still contains design-audit commentary

The Pfeffer mapping table and surrounding caveats remain in Results. The
closing subsection now hands interpretation to Discussion, but a full move
of the mapping table was out of this language-only pass.

### L2-13 MINOR — Double spaces and stock transitions

Discussion source still uses two spaces after periods in older paragraphs.
“Consequently,” “Likewise,” and “In particular” remain where the logical
relation is real. TUM skill permits those transitions; it forbids fake ones.

### L2-14 MINOR — Abstract “It classified”

“It” refers to “The canonical Phase 2 analysis” in the previous sentence.
Acceptable under old–new flow.

### L2-15 Deferred — not language

Unofficial cover, empty identity fields, statutory declaration placeholder,
unresolved contribution split, missing German abstract confirmation, and
absent public archive. These are TUM *compliance* blockers from round 1,
not English-prose failures.

## TUM skill checklist (reviewed sections)

| Rule | Status |
|---|---|
| Introduction has a purpose statement | Pass (measurement-sensitivity audit) |
| Conclusion answers the central questions | Pass (RQ1–RQ4 paragraphs) |
| Topic sentences / old–new flow in abstract, intro, discussion, conclusion | Pass, with L2-10/L2-11 residual formula |
| No single-sentence paragraphs in those sections except short transitions | Pass |
| No sentence-initial And/But/So/Also/Especially | Pass |
| No contractions; no reader “you”; no audience “we” | Pass |
| No rhetorical questions outside the Chapter 1 RQ list | Pass after L2-02 / results heading repair |
| No `really` / `actually` / `basically`; no `get`-passive | Pass |
| `cannot` one word; decimal points; thousands separators in reported counts | Pass |
| Hedging matches N=1 / two-instrument / constructed-graph evidence | Pass |
| Active voice default; methods-style passive only where the actor is already the analysis | Pass in reviewed sections |
| British English | Pass (`behaviour`, `polarised`, `generalisation`, `babel`/`csquotes` british) |
| Sources cited for Debnath/Pfeffer/Maurya motivation sentences | Pass after L2-05 |

## Chair-guide checklist (language-relevant)

| Rule | Status |
|---|---|
| Purpose in introduction; RQ answers in conclusion | Pass |
| Familiar but non-expert reader; prior work fenced from thesis layer | Pass |
| Hedge to one-run computational evidence; no significance/causal laws | Pass |
| No `you`; `we` not used to include the audience | Pass |
| APA/author–date already selected in round 1 (`biblatex-apa`) | Out of this pass; unchanged |
| ≥60 pages including front matter and references | Unchanged from round-1 116-page PDF pending rebuild |
| Official template / declaration / identity | Deferred (not language) |

## Files touched

- `thesisExperiment/thesis_final/main.tex` — not edited (abstract already aligned).
- `thesisExperiment/thesis_final/chapters/01_introduction.tex`
- `thesisExperiment/thesis_final/chapters/03_theory.tex` (chapter-close transition)
- `thesisExperiment/thesis_final/chapters/05_results.tex` (RQ4 heading, mix
  wording, Results→Discussion handover)
- `thesisExperiment/thesis_final/chapters/06_discussion.tex`
- `thesisExperiment/thesis_final/chapters/08_conclusion.tex`

## Rebuild

See `thesisExperiment/thesis_final/THESIS_LOG.md` for the post-edit
`latexmk` record.
