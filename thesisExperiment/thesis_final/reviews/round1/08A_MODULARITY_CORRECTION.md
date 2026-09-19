# Round 1 correction: modularity

## Correction

The previously reported values \(Q=0.4039\) (mixed conspiracy cut) and
\(Q=0.4566\) (homogeneous labels) were produced by a non-standard
implementation and are withdrawn. The canonical thesis convention is now
unweighted Newman--Girvan modularity on the 171 unique unordered node pairs.
The 228 stored arcs are collapsed before calculation because their directions
are importer/design encoding, not observed Twitter direction.

For an undirected partition,

\[
Q=\sum_c\left[\frac{l_c}{m}
 -\left(\frac{d_c}{2m}\right)^2\right],
\]

where \(m=171\), \(l_c\) is the number of unique pairs internal to community
\(c\), and \(d_c\) is the sum of unique-pair degrees in that community. If all
nodes have one label, \(l_1=m\) and \(d_1=2m\), hence
\(Q=1-1=0\).

The old functions in `scripts/pfeffer_debnath_vs_sim.js` and
`scripts/compare_phase2.js` iterated only over observed arcs while applying a
pairwise null-model term, then divided by \(2m\). They did not sum the
null-model contribution over all node pairs. The impossible nonzero
one-community result exposed the error.

## Canonical replacement values

All headline values below use the unique-undirected convention.

- Six assigned graph-cluster labels (`chemtrails`, `piggyback`,
  `climate_action`, `environmental`, `geo`, `expert`):
  \(Q=0.548852638419\), reported as **0.5489**.
- Four assigned discourse-identity labels:
  \(Q=0.532249239082\), reported as **0.5322**.
- Four reconstruction intended-BP-family labels:
  \(Q=0.490766389658\), reported as **0.4908**.
- Four mixed D-net BP-family labels:
  \(Q=0.490766389658\), reported as **0.4908**.
- Assigned-label conspiracy versus non-conspiracy cut:
  \(Q=0.429670667898\), reported as **0.4297**.
- Mixed D-net conspiracy versus non-conspiracy cut:
  \(Q=0.429670667898\), reported as **0.4297**.
- Homogeneous D-net one-community labels:
  \(Q=0.000000000000\), reported as **0**.

As a sensitivity check only, standard directed modularity on the 228 stored
arcs gives **0.394121268082** for the mixed conspiracy cut and **0** for the
homogeneous partition. This is not the thesis headline because stored arc
direction has no empirical meaning.

## Distinctions that must be preserved

- **Clustering** (global transitivity 0.3146; mean local clustering 0.5153)
  measures closure in the fixed edge set and does not use labels.
- **Graph-community modularity** here means modularity of the six assigned
  reconstruction cluster labels. It is not a community-detection result.
- **Identity-label modularity** measures a declared discourse, BP-family, or
  binary conspiracy partition. Different partitions legitimately give
  different values on the same edge set.
- **Homophily** is the share of edges whose endpoint labels match. It can be
  1 for homogeneous labels while modularity is 0: homophily has no
  degree-preserving null-model subtraction.

## Corrected source chain

The corrected implementation is in both analysis scripts. Their generated
JSON/Markdown outputs, `analysis_full/PFEFFER_DEBNATH_VS_SIM.md`, the Phase 2
LaTeX section, `AGENT_HANDOFF.md`, and the canonical thesis results chapter
now use the replacement values. Raw run directories were not modified.
