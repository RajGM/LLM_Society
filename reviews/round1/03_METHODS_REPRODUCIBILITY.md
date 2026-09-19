# Round 1 review: methods and reproducibility

## Scope and verdict

I audited the final methods chapter and reproducibility appendix against the
Phase 2 configuration generator, all 288 T2 configuration files, engine source,
the canonical parser, merged persona/article libraries, selected raw run
metadata and node histories, and the D-net comparison code and outputs.

The arithmetic claim is correct: the repository defines 288 T2 configurations
and 1,728 configuration--article cells:

- H: 8 topologies × 12 personas × 2 scoring modes = 192 configurations;
- He: 8 topologies × 6 mix labels × 2 modes = 96 configurations;
- 288 configurations × 6 articles = 1,728 cells.

The canonical parser selects one completed, positive-call directory per T2
configuration, so the **analysis population is N=1 per configuration**. The
model label, six article IDs, 17-record merged persona library, 24-record merged
article library, eight topology labels, eight configured ticks, and
`maxHops: 8` are also correctly reported.

The methods are nevertheless not reproducible as currently written. There are
four result-threatening discrepancies: extensive unreported API failure,
incorrect action parameters for the ring, non-realisation of five of six
declared He mixes on three topology families, and D-net validation pooling
duplicate executions. There are also implementation/method mismatches in ER
seeding, trust direction, and the effective hop horizon.

## Critical findings

### 1. “Complete” does not mean successfully scored; API failure is extensive and omitted

`src/llmClient.js:184-220` has no retry or backoff. HTTP errors reject the call.
`src/SimulationNode.js:207-214` catches rewrite failures and silently uses the
unchanged input while retaining the action label `reinterpret`.
`src/SimulationNode.js:285-328` catches auditor failures and leaves the event's
`misinfoIndex` null. The simulation still reaches `status: complete`.
`thesisExperiment/scripts/parse_phase2.js:194-237` accepts any complete run with
`llmUsage.calls > 0`, regardless of `llmUsage.errors`.

Reapplying the parser's selection rule to the raw T2 directories gives:

- 122 of 288 selected configurations have recorded API errors;
- 63,534 recorded failed HTTP calls versus 205,115 successful calls;
- all four slices are affected: 47/96 T2c_H, 37/96 T2d_H, 17/48 T2c_He,
  and 21/48 T2d_He;
- 35,620 of 128,125 forward/reinterpret events with output text (27.8%) remain
  unscored in the selected runs.

The raw logs identify HTTP 429 rate limiting, and selected metadata contain up
to 1,968 errors in one configuration. These are not merely “dead cascades.”
They are informative, event-level scoring omissions caused by API behaviour.
The chapter reports 0 missing *cells* but does not report missing scores within
cells. Live means therefore use partially observed event sets whose missingness
depends on call load, topology, mode, and concurrency.

The methods must report the counts above, distinguish cell completeness from
event scoring completeness, explain rewrite fallback and auditor omission, and
either justify the resulting estimand or rebuild from error-free/retried runs.
At minimum, `llmUsage.errors == 0` and expected audit coverage need to be part
of run acceptance.

### 2. The ring uses the linear-chain action regime

The final methods state that only the linear chain uses
forward/reinterpret/drop probabilities 0.10/0.85/0.05 and threshold 0.08, with
all other topologies using 0.35/0.50/0.15 and threshold 0.15
(`chapters/04_methods.tex:176-189`; `chapters/09_appendices.tex:52-58`).

This is false. `thesisExperiment/scripts/build_phase2.js:101-106` marks both
`linear_chain` and `ring` as `chain: true`, and `build_phase2.js:256-260`
therefore assigns `CHAIN_NODE_PARAMS` to both. Every ring config, for example
`T2c_H_ring_climate_scientist.json:36-47`, uses 0.10/0.85/0.05 and 0.08.

This changes the interpretation of ring-versus-other-topology contrasts because
ring varies both graph structure and behavioural parameters. Correct both the
methods and any claim treating topology as the only varied dimension.

### 3. Five declared He mixes are not realised on echo, polarised, or hierarchical graphs

The appendix presents each He condition as a fixed ordered list of eight
personas (`chapters/09_appendices.tex:173-202`). That is true for linear, ring,
ER, small-world, and scale-free configs. For echo chamber, polarised, and
hierarchical configs, `defaultPersonaAssignment` is `by_cluster`.
`src/Simulation.js:650-678` filters two global cluster pools against the mix
file and assigns `pool[i % pool.length]`, rather than assigning the declared
eight-seat order.

Only `mix_02` happens to realise its declared order. For the other five labels,
the realised graphs contain only four or five unique personas, with repeats.
For example, the realised `mix_00` sequence on all three affected topology
families is:

`conspiracy_believer, climate_justice_youth, conspiracy_depopulation,
environmental_concern`, repeated twice.

Thus 36 He configurations (3 topologies × 6 labels × 2 modes), or 216 article
cells, do not generally instantiate the inventory shown in the appendix.
The final chapter partially notes cluster assignment and filtering
(`chapters/04_methods.tex:100-104`) but still defines He as six fixed ordered
mixes and does not disclose the realised repetitions.

There is an additional polarised mismatch. Persona assignment alternates by
node index (`i % 2`), while `SocietyGraph.buildPolarized` defines graph groups
as nodes 0--3 and 4--7 (`src/SocietyGraph.js:311-320`). Therefore the declared
persona clusters do not align with the two polarised graph halves.

Report realised node assignments by topology and mix, and do not interpret the
affected labels as the stated eight-person compositions.

### 4. D-net validation pools duplicate executions and API-damaged runs

The appendix defines four D-net configs and eight article cells
(`chapters/09_appendices.tex:47-49`). However,
`thesisExperiment/scripts/compare_phase2.js:484-500` collects **every**
non-probe D-net/custom run directory. It does not select one run per
configuration and does not require complete status, positive usage, or zero
errors. The checked `debnath_compare.json` consequently reports 8 run
directories and 16 simulated cascades, not four configs/eight cells.

The raw archive contains two positive-call executions for each D-net config.
All four latest executions also contain errors:

- continuous H: 225 errors and 225 unscored auditable events;
- continuous He: 942 errors and 942 unscored auditable events;
- dual H: 582 errors and 323 unscored auditable events;
- dual He: 1,950 errors and 1,012 unscored auditable events.

The reported 16-cascade structural averages, KS/JS values, and DTFS therefore
pool reruns and API-damaged outputs. This contradicts an unqualified N=1 claim
and differs from the T2 parser's selection policy. D-net comparison must define
and enforce a run-selection rule before its validation statistics are
reproducible.

## Major method/source mismatches

### 5. N=1 is an analysis rule, not an execution fact or enforced parameter

`grid_phase2.json` records `nReplicates: 1`, but no runner consumes that field.
There are 371 raw T2 run directories for 288 names: 77 names have multiple
directories, with 83 extra executions. Therefore “Each configuration was
executed once” (`chapters/04_methods.tex:34`) is false. The defensible statement
is: the parser retained one run per configuration, selected as the most recently
modified complete directory with at least one successful call.

The selection is by filesystem modification time, not timestamp, manifest
entry, config hash, or explicit run ID (`parse_phase2.js:201-237`). Copying the
archive can change mtimes and hence selection. Publish an immutable selected-run
manifest and describe N=1 as the retained analytical replicate.

### 6. ER does not enforce `minSeedOutDegree` or use `graphRandomSeed`

`Simulation._buildGraph` passes an options object containing seeded RNG and the
minimum seed out-degree (`src/Simulation.js:548-559`), but
`SocietyGraph.buildRandomER` accepts only three arguments and uses
`Math.random()` directly (`src/SocietyGraph.js:84-97`). The appendix's claim
that an ER guard adds seed edges (`chapters/09_appendices.tex:103-104`) is
incorrect. The final methods more cautiously say that the option is merely
present in config, but reproduction requires stating that it is ignored.

ER edge trust is also sampled uniformly as `0.3 + Math.random() * 0.5`; this
executed parameter is absent from the topology table.

### 7. Trust lookup and evolution use the receiver's reverse relation

Edges are stored as outgoing `state.relations[target]` on the source node
(`src/SocietyGraph.js:32-44`). On receipt, however, the node computes trust as
its own `state.relations[msg.sourceNodeId]`, defaulting to 0.5 when no reverse
edge exists (`src/SimulationNode.js:138-150`). Consequently:

- on a one-way edge A→B, B usually evaluates A with default trust 0.5 rather
  than the trust stored on A→B;
- where B→A also exists, B uses the independently generated reverse-edge trust;
- post-hoc trust updates and edge deletion alter B→A, not necessarily the edge
  that carried A→B (`SimulationNode.js:302-318`).

The configured `relationEvolution` Boolean is never checked; `trustDelta`
alone activates this code. The chapter correctly says audit occurs after all
propagation, so updates cannot affect that run, but “stored source trust” is
insufficient and potentially misleading. Reproduction needs the actual
direction/default semantics and the fact that `relationEvolution` is inert.

### 8. Eight configured hops yield no recorded hop-8 events

The loop processes ticks 1 through 8 and delivers tick-8 outgoing messages only
after processing (`src/Simulation.js:259-299`). Those messages can have
`hops: 8`, but there is no tick 9 in which to process or record them. Across
all 288 parser-selected T2 runs, the maximum recorded event hop is 7
(30,143 hop-7 events; zero hop-8 events). The four latest D-net runs likewise
max out at hop 7.

The accurate description is eight processing ticks, with audited input-event
hops 0--7. `maxHops: 8` is configured but does not bind under this tick budget.
Claims of an observed eight-hop horizon should be corrected or explicitly
define the final unprocessed delivery as the eighth traversal.

### 9. Inbox overflow is silent and unmeasured

The four-message cap is applied per article at delivery
(`src/SimulationNode.js:43-51`). Excess messages are silently discarded, with
no event, reason, or counter. This is important in dense/cyclic graphs and is
not stated. The methods should distinguish sampled `drop` actions from
unrecorded capacity loss.

### 10. “Drip seed” is misleading

Each article is injected once into `node_0` at tick zero; articles are then run
sequentially (`src/Simulation.js:179-205,235-258`). Nothing is dripped over
multiple ticks. Use “single-node, single-time seed.” The seed's `ORIGIN` has no
relation entry, so its effective trust is the hard-coded default 0.5.

## Prompts, model, and API details missing for replay

### 11. The model is an unpinned alias and request metadata are not archived

All 288 selected T2 metadata files report `gpt-4o-mini`, confirming the stated
label. But `config/models.js:8-14` sends the mutable alias `gpt-4o-mini`, not a
dated snapshot. No OpenAI response ID, `system_fingerprint`, service tier, or
model snapshot is stored. Exact replay is therefore impossible even apart from
randomness.

`src/llmClient.js:125-136` also fixes `temperature: 0.7` and
`max_tokens: 700` for both rewriting and judging. It uses the Chat Completions
endpoint, supplies no API `seed`, no JSON response format/schema, no
`top_p`/penalty values, and has a 120-second socket timeout. These consequential
settings are absent from the methods and appendix.

The campaign runner normally uses concurrency 2 and has process-level stall and
hard timeouts (`run_phase2.js:310-385`). API requests have no retry. These
details are necessary to explain and reproduce the observed rate-limit
missingness.

### 12. Appendix prompt listings are not byte-exact

The rewrite template is substantively accurate. The auditor listings omit the
final user-prompt sentinels:

- `IFD_SCORE_QUERY: Return only the JSON with values 1, 0, or -1.`
- `CONTINUOUS_SCORE_QUERY: Return only the JSON with float scores 0.0 to 1.0.`

They also abbreviate continuous prompt wording. Since the appendix labels these
as templates rather than transcripts this is not a scoring contradiction, but
reproduction requires either exact strings from `src/Auditor.js:42-99` or a
source revision that fixes them.

Malformed auditor JSON defaults every item to fully correct
(`src/Auditor.js:61-76,100-108`), as the appendix correctly discloses.
However, returned array length is not validated against five questions, and
non-numeric continuous values can become `NaN` without entering the parse-error
fallback. These validation behaviours and their incidence are not reported.

## Persona, article, topology, and schema qualifications

### 13. Persona/article counts are correct, but immutable stimulus provenance is incomplete

`personas/merged.json` contains 17 unique profiles and
`articles/merged.json` contains 24 unique articles; all six campaign articles
exist and each has five questions and five Boolean answers. The 12 H IDs and
six declared He inventories match `grid_phase2.json`.

For independent reconstruction, however, the article records provide prose
source notes/URLs but no retrieval dates, archived source snapshots, content
hashes, or derivation procedure for the synthetic summaries and question/answer
pairs. Persona prompts similarly encode quantitative and empirical claims
without a field-level extraction/coding protocol. The checked-in JSON is thus
the executable stimulus, not a reproducible derivation from the cited
literature. State this boundary and publish hashes for the exact input files.

### 14. Topology details needing correction or completion

- Small-world and scale-free construction use unseeded `Math.random`, as the
  final methods correctly state.
- Echo and polarised generation consume a newly reset seed-42 RNG in every
  config. This induces shared random draws across conditions and should be
  reported as blocking/coupling, not independent graph replication.
- Small-world starts with four directed neighbours per node and rewires only
  forward-side edges; this is correctly described in the appendix.
- Scale-free uses a directed complete seed and adds both directions for each
  selected attachment; this is correctly described.
- Homophily trust is exactly
  `clip(baseTrust - 0.2 + 0.5 * Jaccard(tags), 0.05, 0.95)`, except identical
  persona IDs return unadjusted base trust. Give the formula if realised trusts
  are to be regenerated rather than read from `graph_topology.json`.
- `graph_topology.json` is written before propagation/audit and is an initial
  graph snapshot. Node files contain any later relation changes. The appendix
  should make this temporal distinction explicit.

### 15. Raw schema description omits failure semantics and provenance controls

The file inventory is broadly accurate. To reproduce the actual harvest it
must additionally document:

- `llmUsage.calls` counts successful HTTP responses, while `errors` counts HTTP
  status failures only; network/timeout/JSON failures are not necessarily
  included;
- a complete status does not imply zero errors or complete event auditing;
- an audit failure leaves `misinfoIndex`/`ifd` null;
- a rewrite failure produces unchanged text under a `reinterpret` action;
- the parser selects by directory mtime and ignores error count;
- no code commit SHA, dirty-tree state, Node.js version, selected-run manifest,
  config/input hashes, OpenAI request IDs, or model fingerprint is recorded.

The repository also has no dependency lockfile and `package.json` declares no
Node engine. Even though the core campaign uses built-in modules, runtime
version and source commit remain necessary provenance.

## Competing methods documents

`thesisExperiment/analysis/methods.md` is stale and materially conflicts with
the executed Phase 2 campaign: it describes 12 articles in H/He, 12
heterogeneous chains, and a much smaller/proposed graph experiment. The
standalone `latex_phase2/sections/02_methods.tex` also says every cell has
threshold 0.15 and 0.35/0.50/0.15 actions and claims ER's seed-degree guard is
effective. These files need an explicit “superseded” marker or removal from the
reproduction path. Otherwise the repository contains multiple incompatible
method specifications.

## Minimum reproducibility corrections

1. Publish an immutable manifest mapping every reported T2 and D-net cell to
   one raw directory, plus code/config/persona/article hashes.
2. Report API errors and per-cell audit coverage; do not equate complete status
   with complete scoring.
3. Correct the ring parameters, realised He assignments, ER guard/seed claim,
   trust-direction semantics, and effective hop range.
4. Recompute D-net validation from a declared run set rather than all matching
   directories.
5. Record runtime, source commit, exact OpenAI request parameters, dated model
   snapshot/fingerprint where available, retry policy, and concurrency.
6. Treat fresh execution as protocol replication, not exact reproduction; the
   archived realised graphs and histories are the only exact record of this
   campaign.

