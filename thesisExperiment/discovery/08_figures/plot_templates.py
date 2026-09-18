"""Thesis figure templates. Read thesisExperiment/results/; never invent numbers.

Usage (repo root):
  .\\.venv\\Scripts\\python.exe thesisExperiment\\discovery\\08_figures\\plot_templates.py
  .\\.venv\\Scripts\\python.exe thesisExperiment\\discovery\\08_figures\\plot_templates.py --empty
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyBboxPatch, Patch

HERE = Path(__file__).resolve().parent
THESIS = HERE.parents[1]
REPO = HERE.parents[2]
RESULTS = THESIS / "results"
RUNS = THESIS / "runs"
ARTICLES = THESIS / "articles" / "articles.json"
OUT = HERE

SEVERITY_BOUNDS = (0.0, 1.0, 3.0, 5.0)
PERSONA_ORDER = [
    "conspiracy_believer",
    "climate_action_advocate",
    "environmental_concern",
]
DISTORTION_TYPES = [
    "spraying_chemtrails",
    "weather_haarp",
    "weaponization",
    "depopulation",
    "climate_justice_hijack",
    "antivax_spillover",
]


def load_json(path: Path):
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def savefig(fig: plt.Figure, name: str) -> Path:
    out = OUT / name
    fig.savefig(out, dpi=150, bbox_inches="tight", facecolor="white", pad_inches=0.25)
    plt.close(fig)
    print(f"wrote {out}")
    return out


def placeholder(ax, title: str, reason: str) -> None:
    ax.set_title(title, loc="left")
    ax.text(
        0.5,
        0.5,
        f"Awaiting executor fill\n{reason}",
        ha="center",
        va="center",
        transform=ax.transAxes,
        fontsize=10,
        color="#555555",
    )
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_linestyle(":")


def banner(fig: plt.Figure, summary: dict | None) -> None:
    if not summary:
        fig.text(0.5, -0.02, "No summary.json — empty template.", fontsize=7, color="#666666", ha="center")
        return
    mode = summary.get("mode") or "unknown"
    validity = summary.get("validity") or ""
    grade = summary.get("thesisGrade")
    note = f"mode={mode}  thesisGrade={grade}  {validity}"
    if mode == "dry-run":
        note = "INVALID FOR THESIS (dry-run MI mocked to 0). " + note
    fig.text(
        0.5,
        -0.04,
        note[:240],
        fontsize=6.5,
        color="#8b0000" if mode == "dry-run" else "#444444",
        ha="center",
    )


def results_article_path(run_dir: str, article_id: str) -> Path:
    return RUNS / run_dir / f"results_{article_id}.json"


def node_mpr_records(rows: list[dict]) -> list[dict]:
    recs = []
    for r in rows:
        run_dir = r.get("runDir")
        article_id = r.get("articleId")
        path = results_article_path(run_dir, article_id) if run_dir and article_id else None
        payload = load_json(path) if path else None
        summaries = (payload or {}).get("nodeSummaries") or {}
        if summaries:
            for node_id, s in summaries.items():
                recs.append(
                    {
                        "runDir": run_dir,
                        "experiment": r.get("experiment"),
                        "experimentName": r.get("experimentName"),
                        "topology": r.get("topology"),
                        "bpMix": r.get("bpMix"),
                        "articleId": article_id,
                        "nodeId": node_id,
                        "personaId": s.get("personaId"),
                        "mpr": s.get("mpr"),
                        "eventCount": s.get("eventCount") or 0,
                        "stats": s.get("stats") or {},
                        "totalEvents": r.get("totalEvents"),
                    }
                )
            continue
        for p in r.get("personasUsed") or ["unknown"]:
            recs.append(
                {
                    "runDir": run_dir,
                    "experiment": r.get("experiment"),
                    "experimentName": r.get("experimentName"),
                    "topology": r.get("topology"),
                    "bpMix": r.get("bpMix"),
                    "articleId": article_id,
                    "nodeId": None,
                    "personaId": p,
                    "mpr": r.get("meanNodeMPR"),
                    "eventCount": r.get("totalEvents") or 0,
                    "stats": {},
                    "totalEvents": r.get("totalEvents"),
                }
            )
    return recs


def failed_cell(row: dict) -> bool:
    events = row.get("totalEvents")
    series = row.get("networkMIOverTime") or []
    return events is not None and events <= 1 and not series


def persona_article_matrix(recs: list[dict], personas: list[str], articles: list[str]):
    mat = np.full((len(personas), len(articles)), np.nan)
    counts = np.zeros_like(mat)
    for rec in recs:
        p = rec.get("personaId")
        a = rec.get("articleId")
        mpr = rec.get("mpr")
        if p not in personas or a not in articles or mpr is None:
            continue
        i, j = personas.index(p), articles.index(a)
        if np.isnan(mat[i, j]):
            mat[i, j] = 0.0
        mat[i, j] += float(mpr)
        counts[i, j] += 1
    with np.errstate(invalid="ignore"):
        mat = np.where(counts > 0, mat / np.maximum(counts, 1), np.nan)
    return mat


def heatmap(ax, mat, row_labels, col_labels, title, vmin=0, vmax=5, cmap="YlOrRd"):
    masked = np.ma.masked_invalid(mat)
    im = ax.imshow(masked, cmap=cmap, vmin=vmin, vmax=vmax, aspect="auto")
    ax.set_xticks(range(len(col_labels)))
    ax.set_xticklabels(col_labels, rotation=25, ha="right")
    ax.set_yticks(range(len(row_labels)))
    ax.set_yticklabels(row_labels)
    ax.set_title(title, loc="left")
    for i in range(mat.shape[0]):
        for j in range(mat.shape[1]):
            if np.isnan(mat[i, j]):
                ax.text(j, i, "—", ha="center", va="center", color="#666666")
            else:
                ax.text(j, i, f"{mat[i, j]:.2f}", ha="center", va="center", fontsize=8)
    return im


def _node_article_matrix(recs: list[dict], articles: list[str]):
    nodes = sorted({x.get("nodeId") for x in recs if x.get("nodeId")})
    mat = np.full((len(nodes), len(articles)), np.nan)
    for rec in recs:
        n, a, mpr = rec.get("nodeId"), rec.get("articleId"), rec.get("mpr")
        if n not in nodes or a not in articles or mpr is None:
            continue
        mat[nodes.index(n), articles.index(a)] = float(mpr)
    return nodes, mat


def fig_f01(summary: dict | None, empty: bool) -> None:
    fig, axes = plt.subplots(2, 2, figsize=(10.8, 7.2), gridspec_kw={"height_ratios": [0.9, 2.2]})
    fig.suptitle("F01  Homogeneous MPR, persona × article (top) and node × article (bottom)", fontsize=11)
    if empty or not summary:
        for ax in axes.ravel():
            placeholder(ax, "homogeneous A", "rows with bpMix=homogeneous-conspiracy")
        banner(fig, summary)
        savefig(fig, "F01_homo_mpr_heatmap.png")
        return
    rows = [r for r in (summary.get("rows") or []) if r.get("experiment") == "A" and r.get("bpMix") == "homogeneous-conspiracy"]
    recs = node_mpr_records(rows)
    articles = sorted({r.get("articleId") for r in rows if r.get("articleId")})
    personas = [p for p in PERSONA_ORDER if any(x.get("personaId") == p for x in recs)]
    if not personas:
        personas = sorted({x.get("personaId") for x in recs if x.get("personaId")})
    if not articles or not personas:
        for ax in axes.ravel():
            placeholder(ax, "homogeneous A", "no persona×article MPR yet")
        banner(fig, summary)
        savefig(fig, "F01_homo_mpr_heatmap.png")
        return
    im = None
    topos = ["scale-free", "random-ER"]
    for col, topo in enumerate(topos):
        sub = [x for x in recs if x.get("topology") == topo]
        ax_p, ax_n = axes[0, col], axes[1, col]
        if not sub:
            placeholder(ax_p, f"{topo} persona×article", "no rows")
            placeholder(ax_n, f"{topo} node×article", "no rows")
            continue
        mat = persona_article_matrix(sub, personas, articles)
        im = heatmap(ax_p, mat, personas, articles, f"{topo} — persona × article")
        ax_p.set_xlabel("article")
        nodes, nmat = _node_article_matrix(sub, articles)
        if nodes:
            im = heatmap(ax_n, nmat, nodes, articles, f"{topo} — node × article (CIKM-style layout)")
            ax_n.set_xlabel("article")
            ax_n.set_ylabel("node")
        else:
            placeholder(ax_n, f"{topo} node×article", "no per-node MPR files")
    if im is not None:
        cbar = fig.colorbar(im, ax=axes.ravel().tolist(), fraction=0.025, pad=0.03)
        cbar.set_label("MPR")
    banner(fig, summary)
    savefig(fig, "F01_homo_mpr_heatmap.png")


def fig_f02(summary: dict | None, empty: bool) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(11.2, 4.6))
    fig.suptitle("F02  Heterogeneous MPR heatmap and node distribution", fontsize=11)
    if empty or not summary:
        placeholder(axes[0], "(a) persona × article", "mixed-3BP Experiment A")
        placeholder(axes[1], "(b) node MPR by persona", "mixed-3BP Experiment A")
        banner(fig, summary)
        savefig(fig, "F02_hetero_mpr_heatmap_dist.png")
        return
    rows = [
        r
        for r in (summary.get("rows") or [])
        if r.get("experiment") == "A" and r.get("bpMix") == "mixed-3BP" and not failed_cell(r)
    ]
    recs = [x for x in node_mpr_records(rows) if x.get("mpr") is not None]
    articles = sorted({r.get("articleId") for r in rows if r.get("articleId")})
    personas = [p for p in PERSONA_ORDER if any(x.get("personaId") == p for x in recs)]
    ax0, ax1 = axes
    if not recs or not articles or not personas:
        placeholder(ax0, "(a) persona × article", "no mixed-BP node MPR")
        placeholder(ax1, "(b) distribution", "no mixed-BP node MPR")
        banner(fig, summary)
        savefig(fig, "F02_hetero_mpr_heatmap_dist.png")
        return
    mat = persona_article_matrix(recs, personas, articles)
    im = heatmap(ax0, mat, personas, articles, "(a) mean node MPR")
    fig.colorbar(im, ax=ax0, fraction=0.046, pad=0.04).set_label("MPR")
    ax0.set_xlabel("article")
    data, labels = [], []
    for p in personas:
        vals = [float(x["mpr"]) for x in recs if x.get("personaId") == p]
        if vals:
            data.append(vals)
            labels.append(p)
    if data:
        ax1.boxplot(data, tick_labels=labels, showmeans=True)
        ax1.axhline(1, color="#888888", ls="--", lw=0.8)
        ax1.axhline(3, color="#b00020", ls="--", lw=0.8)
        ax1.set_ylabel("node MPR")
        ax1.set_title("(b) node-level MPR by persona", loc="left")
        ax1.tick_params(axis="x", rotation=20)
    else:
        placeholder(ax1, "(b) distribution", "no node MPR values")
    n_fail = sum(
        1
        for r in (summary.get("rows") or [])
        if r.get("experiment") == "A" and r.get("bpMix") == "mixed-3BP" and failed_cell(r)
    )
    if n_fail:
        ax1.text(0.02, 0.98, f"{n_fail} mixed A cell(s) excluded (≤1 event)", transform=ax1.transAxes, va="top", fontsize=7)
    banner(fig, summary)
    savefig(fig, "F02_hetero_mpr_heatmap_dist.png")


def fig_f03(summary: dict | None, empty: bool) -> None:
    fig, ax = plt.subplots(figsize=(10.2, 4.8))
    fig.suptitle("F03  k* by topology × mix (null ≠ 0)", fontsize=11)
    if empty or not summary:
        placeholder(ax, "k* map", "rows[].kStar_network for experiment A")
        banner(fig, summary)
        savefig(fig, "F03_kstar_topology_mix.png")
        return
    rows = [r for r in (summary.get("rows") or []) if r.get("experiment") == "A"]
    if not rows:
        placeholder(ax, "k* map", "no Experiment A rows")
        banner(fig, summary)
        savefig(fig, "F03_kstar_topology_mix.png")
        return
    labels = [f"{r.get('topology')}\n{r.get('bpMix')}\n{r.get('articleId')}" for r in rows]
    kstar = [r.get("kStar_network") for r in rows]
    first = [r.get("firstMeanMiOver3") for r in rows]
    x = np.arange(len(rows))
    heights = [k if k is not None else 0 for k in kstar]
    colors = ["#1f77b4" if k is not None else "#d0d0d0" for k in kstar]
    ax.bar(x, heights, color=colors, edgecolor="#333333", linewidth=0.4)
    for i, (k, f0, rec) in enumerate(zip(kstar, first, rows)):
        if k is None:
            tag = "none"
            if f0 is not None and rec.get("networkRecoveredAfterPropaganda"):
                tag = f"cross@{f0} recov."
            elif failed_cell(rec):
                tag = "failed cell"
            ax.text(i, 0.08, tag, ha="center", va="bottom", fontsize=7, rotation=90)
        else:
            ax.text(i, k + 0.08, str(k), ha="center", fontsize=8)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=35, ha="right", fontsize=7)
    ax.set_ylabel("k* tick")
    ax.set_ylim(0, max(6.5, max(heights + [0]) + 1))
    ax.legend(
        handles=[
            Patch(facecolor="#1f77b4", label="irreversible k*"),
            Patch(facecolor="#d0d0d0", label="no k* (not tick 0)"),
        ],
        loc="upper right",
        fontsize=8,
    )
    banner(fig, summary)
    savefig(fig, "F03_kstar_topology_mix.png")


def fig_f04(summary: dict | None, empty: bool) -> None:
    fig, ax = plt.subplots(figsize=(8.6, 4.6))
    fig.suptitle("F04  Network-mean MI trajectories (firestorm vs recovery)", fontsize=11)
    if empty or not summary:
        placeholder(ax, "mean MI vs tick", "networkMIOverTime; select by k* rule")
        banner(fig, summary)
        savefig(fig, "F04_mi_trajectories.png")
        return
    rows = [r for r in (summary.get("rows") or []) if r.get("experiment") == "A"]
    fire = next((r for r in rows if r.get("kStar_network") is not None and r.get("networkMIOverTime")), None)
    recov = next(
        (
            r
            for r in rows
            if r.get("firstMeanMiOver3") is not None
            and r.get("networkRecoveredAfterPropaganda")
            and r.get("networkMIOverTime")
        ),
        None,
    )
    drawn = False
    for series, style, role in (
        (fire, {"color": "#b00020", "marker": "o"}, "irreversible (k* defined)"),
        (recov, {"color": "#1f77b4", "marker": "s", "ls": "--"}, "crossed then recovered"),
    ):
        if not series:
            continue
        pts = series["networkMIOverTime"]
        ax.plot(
            [p["tick"] for p in pts],
            [p["meanMI"] for p in pts],
            label=f"{series.get('experimentName')} / {series.get('articleId')} — {role}",
            **style,
        )
        drawn = True
    ax.axhline(1, color="#888888", ls=":", lw=0.8, label="MI=1")
    ax.axhline(3, color="#b00020", ls=":", lw=0.8, label="MI=3 propaganda")
    ax.set_xlabel("tick")
    ax.set_ylabel("network-mean MI")
    ax.set_ylim(0, 5.2)
    if not drawn:
        placeholder(ax, "mean MI vs tick", "no A cell matched firestorm/recovery rule")
    else:
        ax.legend(fontsize=7, loc="best")
    banner(fig, summary)
    savefig(fig, "F04_mi_trajectories.png")


def fig_f05(summary: dict | None, empty: bool) -> None:
    fig, ax = plt.subplots(figsize=(10.4, 5.2))
    fig.suptitle("F05  Pfeffer six-factor operationalisation", fontsize=11)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis("off")
    factors = [
        ("Valence", "varied", "two seeds; BP tone"),
        ("Surprise", "held", "drip seed at node_0"),
        ("Identity alignment", "varied", "hom vs mixed BPs"),
        ("Network clustering", "varied", "scale-free vs ER"),
        ("Information echo", "measured", "homophily / Q / PI / Gini"),
        ("Temporal acceleration", "held", "hop-compressed ticks"),
    ]
    if summary and not empty:
        varied_l = " ".join(summary.get("pfefferVaried") or []).lower()
        held_l = " ".join(summary.get("pfefferHeld") or []).lower()
        meas_l = " ".join(summary.get("pfefferMeasured") or []).lower()
        remap = []
        aliases = {
            "Valence": "valence",
            "Surprise": "surprise",
            "Identity alignment": "identity",
            "Network clustering": "network",
            "Information echo": "echo",
            "Temporal acceleration": "temporal",
        }
        for name, default, knob in factors:
            alias = aliases[name]
            status = default
            if alias in varied_l:
                status = "varied"
            if alias in held_l:
                status = "held"
            if alias in meas_l:
                status = "measured"
            remap.append((name, status, knob))
        factors = remap
    colours = {"varied": "#c6efce", "held": "#fff2cc", "measured": "#cfe2f3"}
    positions = [(0.4, 4.6), (4.2, 4.6), (8.0, 4.6), (0.4, 1.4), (4.2, 1.4), (8.0, 1.4)]
    for (name, status, knob), (x, y) in zip(factors, positions):
        box = FancyBboxPatch(
            (x, y),
            3.5,
            2.4,
            boxstyle="round,pad=0.05,rounding_size=0.15",
            facecolor=colours.get(status, "#eeeeee"),
            edgecolor="#333333",
        )
        ax.add_patch(box)
        ax.text(x + 1.75, y + 1.7, name, ha="center", va="center", fontsize=10, fontweight="bold")
        ax.text(x + 1.75, y + 1.15, status.upper(), ha="center", va="center", fontsize=9)
        ax.text(x + 1.75, y + 0.55, knob, ha="center", va="center", fontsize=7.5, color="#333333")
    ax.legend(
        handles=[Patch(facecolor=c, edgecolor="#333333", label=s) for s, c in colours.items()],
        loc="upper right",
        fontsize=8,
        title="campaign status",
    )
    ax.text(
        0.4,
        7.4,
        "Source: summary.pfefferVaried / pfefferHeld / pfefferMeasured + pfeffer_mapping.md. No MI values.",
        fontsize=8,
    )
    banner(fig, summary)
    savefig(fig, "F05_pfeffer_schematic.png")


def fig_f06(summary: dict | None, empty: bool) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(11.0, 4.6))
    fig.suptitle("F06  Experiment B before/after fact_checker_injection", fontsize=11)
    ax0, ax1 = axes
    if empty or not summary:
        placeholder(ax0, "mean MI before vs after", "rows[].bRecovery")
        placeholder(ax1, "MI trajectory + split tick", "networkMIOverTime")
        banner(fig, summary)
        savefig(fig, "F06_expB_before_after.png")
        return
    brows = [r for r in (summary.get("rows") or []) if r.get("bRecovery")]
    if not brows:
        placeholder(ax0, "mean MI before vs after", "no bRecovery rows")
        placeholder(ax1, "MI trajectory + split tick", "no Experiment B rows")
        banner(fig, summary)
        savefig(fig, "F06_expB_before_after.png")
        return
    x = np.arange(len(brows))
    width = 0.36
    before = [((r.get("bRecovery") or {}).get("beforeMean")) for r in brows]
    after = [((r.get("bRecovery") or {}).get("afterMean")) for r in brows]
    b_plot = [v if v is not None else 0 for v in before]
    a_plot = [v if v is not None else 0 for v in after]
    ax0.bar(x - width / 2, b_plot, width, label="before", color="#9ecae1")
    ax0.bar(x + width / 2, a_plot, width, label="after", color="#fc9272")
    for i, r in enumerate(brows):
        br = r["bRecovery"]
        if before[i] is None:
            ax0.text(i - width / 2, 0.05, f"n={br.get('nBefore', 0)}\nnull", ha="center", va="bottom", fontsize=7)
        else:
            ax0.text(i - width / 2, b_plot[i], f"n={br.get('nBefore', 0)}", ha="center", va="bottom", fontsize=7)
        ax0.text(i + width / 2, a_plot[i], f"n={br.get('nAfter', 0)}", ha="center", va="bottom", fontsize=7)
    ax0.set_xticks(x)
    ax0.set_xticklabels([f"{r.get('experimentName')}\nsplit={r['bRecovery'].get('splitTick')}" for r in brows], fontsize=8)
    ax0.set_ylabel("mean event MI")
    ax0.axhline(3, color="#b00020", ls="--", lw=0.8)
    ax0.legend(fontsize=8)
    ax0.set_title("(a) split-tick means", loc="left")
    ax0.set_ylim(0, max(5.2, max(b_plot + a_plot + [0]) + 0.8))
    drawn = False
    for r in brows:
        pts = r.get("networkMIOverTime") or []
        if not pts:
            continue
        ax1.plot([p["tick"] for p in pts], [p["meanMI"] for p in pts], marker="o", label=r.get("experimentName"))
        split = (r.get("bRecovery") or {}).get("splitTick")
        if split is not None:
            ax1.axvline(split, color="#555555", ls=":", lw=0.9)
        drawn = True
    ax1.axhline(3, color="#b00020", ls="--", lw=0.8)
    ax1.set_xlabel("tick")
    ax1.set_ylabel("network-mean MI")
    ax1.set_title("(b) trajectory; dotted = injection tick", loc="left")
    if drawn:
        ax1.legend(fontsize=8)
    else:
        placeholder(ax1, "(b) trajectory", "empty networkMIOverTime")
    ax1.text(
        0.02,
        0.02,
        "Caveat: after-mean is confounded by late-tick cascade volume.",
        transform=ax1.transAxes,
        fontsize=7,
        color="#333333",
    )
    banner(fig, summary)
    savefig(fig, "F06_expB_before_after.png")


def fig_f07(summary: dict | None, empty: bool) -> None:
    fig, ax = plt.subplots(figsize=(10.6, 4.8))
    fig.suptitle("F07  Echo / homophily / modularity / PI", fontsize=11)
    if empty or not summary:
        placeholder(ax, "echo metrics", "rows[].echo and rows[].polarization")
        banner(fig, summary)
        savefig(fig, "F07_modularity_echo.png")
        return
    rows = summary.get("rows") or []
    seen = []
    uniq = []
    for r in rows:
        key = (r.get("experimentName"), r.get("runDir"))
        if key in seen:
            continue
        seen.append(key)
        uniq.append(r)
    if not uniq:
        placeholder(ax, "echo metrics", "no rows")
        banner(fig, summary)
        savefig(fig, "F07_modularity_echo.png")
        return
    labels = []
    hom, chom, q, pi = [], [], [], []
    hatch = []
    for r in uniq:
        labels.append(r.get("experimentName") or "")
        e = r.get("echo") or {}
        p = r.get("polarization") or {}
        hom.append(e.get("edgeHomophily"))
        chom.append(e.get("conspiracyHomophily"))
        q.append(e.get("modularityConspiracy"))
        pi.append(p.get("pi"))
        hatch.append(failed_cell(r) or (r.get("totalEvents") or 0) <= 1)
    x = np.arange(len(labels))
    w = 0.2
    def nz(seq):
        return [0 if v is None else v for v in seq]
    ax.bar(x - 1.5 * w, nz(hom), w, label="edge homophily")
    ax.bar(x - 0.5 * w, nz(chom), w, label="conspiracy-cluster homophily")
    ax.bar(x + 0.5 * w, nz(q), w, label="modularity (conspiracy cut)")
    ax.bar(x + 1.5 * w, nz(pi), w, label="PI (null on homogeneous)")
    for i, h in enumerate(hatch):
        if h:
            ax.axvspan(i - 0.45, i + 0.45, color="#eeeeee", zorder=0)
            ax.text(i, ax.get_ylim()[1] if ax.get_ylim()[1] > 1 else 1.05, "unusable", ha="center", fontsize=7, color="#666666")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=30, ha="right", fontsize=8)
    ax.set_ylabel("index")
    ax.legend(fontsize=7, ncol=2)
    banner(fig, summary)
    savefig(fig, "F07_modularity_echo.png")


def fig_f08(summary: dict | None, empty: bool) -> None:
    fig, ax = plt.subplots(figsize=(10.2, 4.8))
    fig.suptitle("F08  Event volume, scale-free vs ER (Experiment A)", fontsize=11)
    if empty or not summary:
        placeholder(ax, "totalEvents", "Experiment A rows")
        banner(fig, summary)
        savefig(fig, "F08_event_volume_sf_er.png")
        return
    rows = [r for r in (summary.get("rows") or []) if r.get("experiment") == "A"]
    if not rows:
        placeholder(ax, "totalEvents", "no Experiment A rows")
        banner(fig, summary)
        savefig(fig, "F08_event_volume_sf_er.png")
        return
    labels = [f"{r.get('topology')}\n{r.get('bpMix')}\n{r.get('articleId')}" for r in rows]
    vals = [r.get("totalEvents") or 0 for r in rows]
    colors = ["#fdae6b" if failed_cell(r) else "#3182bd" for r in rows]
    x = np.arange(len(rows))
    ax.bar(x, vals, color=colors, edgecolor="#333333", linewidth=0.4)
    for i, r in enumerate(rows):
        if failed_cell(r):
            ax.text(i, vals[i] + 1, "seed-drop/\n1 event", ha="center", fontsize=7, color="#b00020")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=35, ha="right", fontsize=7)
    ax.set_ylabel("totalEvents")
    ax.legend(
        handles=[
            Patch(facecolor="#3182bd", label="completed cascade"),
            Patch(facecolor="#fdae6b", label="≤1 event (do not interpret)"),
        ],
        fontsize=8,
    )
    banner(fig, summary)
    savefig(fig, "F08_event_volume_sf_er.png")


def fig_f09(summary: dict | None, empty: bool) -> None:
    fig, ax = plt.subplots(figsize=(11.0, 5.0))
    fig.suptitle("F09  Distortion taxonomy (Experiment C heuristic)", fontsize=11)
    if empty or not summary:
        placeholder(ax, "counts / nTexts", "rows[].distortionHeuristic")
        banner(fig, summary)
        savefig(fig, "F09_distortion_taxonomy.png")
        return
    rows = [r for r in (summary.get("rows") or []) if (r.get("distortionHeuristic") or {}).get("nTexts", 0) > 0]
    if not rows:
        placeholder(ax, "counts / nTexts", "Exp C empty: no rewrite texts tagged yet")
        banner(fig, summary)
        savefig(fig, "F09_distortion_taxonomy.png")
        return
    labels = [f"{r.get('experimentName')}\n{r.get('articleId')}" for r in rows]
    mat = np.zeros((len(DISTORTION_TYPES), len(rows)))
    for j, r in enumerate(rows):
        d = r.get("distortionHeuristic") or {}
        n = d.get("nTexts") or 1
        counts = d.get("counts") or {}
        for i, t in enumerate(DISTORTION_TYPES):
            mat[i, j] = (counts.get(t) or 0) / n
    im = ax.imshow(mat, cmap="Purples", aspect="auto", vmin=0, vmax=1)
    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, rotation=35, ha="right", fontsize=7)
    ax.set_yticks(range(len(DISTORTION_TYPES)))
    ax.set_yticklabels(DISTORTION_TYPES)
    for i in range(mat.shape[0]):
        for j in range(mat.shape[1]):
            ax.text(j, i, f"{mat[i, j]:.2f}", ha="center", va="center", fontsize=7)
    fig.colorbar(im, ax=ax, fraction=0.03).set_label("share of rewrite texts tagged")
    ax.set_title("Keyword overlap; texts may carry multiple tags. Not a trained classifier.", loc="left", fontsize=8)
    banner(fig, summary)
    savefig(fig, "F09_distortion_taxonomy.png")


def _pick_auditor_event(summary: dict) -> dict | None:
    articles = load_json(ARTICLES) or {}
    art_map = {a["id"]: a for a in articles.get("articles") or []}
    candidates = []
    for r in summary.get("rows") or []:
        if r.get("experiment") != "A" or failed_cell(r):
            continue
        run_dir = r.get("runDir")
        nodes_dir = RUNS / run_dir / "nodes" if run_dir else None
        if not nodes_dir or not nodes_dir.is_dir():
            continue
        for node_path in sorted(nodes_dir.glob("node_*.json")):
            state = load_json(node_path)
            if not state:
                continue
            for ev in state.get("history") or []:
                ifd = ev.get("ifd") or {}
                scores = ifd.get("scores")
                art = art_map.get(ev.get("articleId"))
                if not art or not scores or len(scores) != len(art.get("questions") or []):
                    continue
                rec = {
                    "runDir": run_dir,
                    "nodeId": state.get("nodeId"),
                    "personaId": state.get("personaId"),
                    "tick": ev.get("tick"),
                    "articleId": ev.get("articleId"),
                    "action": ev.get("action"),
                    "misinfoIndex": ev.get("misinfoIndex"),
                    "scores": scores,
                    "ifd": ifd,
                    "questions": art["questions"],
                    "groundTruth": art["groundTruth"],
                    "contentOut": (ev.get("contentOut") or "")[:280],
                }
                mi = ev.get("misinfoIndex")
                rank = 0
                if mi is not None and mi > 3 and ev.get("action") == "reinterpret":
                    rank = 3
                elif mi is not None and mi > 3:
                    rank = 2
                elif ev.get("action") == "reinterpret":
                    rank = 1
                candidates.append((rank, rec))
                if len(candidates) >= 40:
                    break
            if len(candidates) >= 40:
                break
        if candidates:
            break
    if not candidates:
        return None
    candidates.sort(key=lambda x: -x[0])
    return candidates[0][1]


def fig_f10(summary: dict | None, empty: bool) -> None:
    fig, ax = plt.subplots(figsize=(11.2, 5.4))
    fig.suptitle("F10  Auditor QA worked example", fontsize=11)
    ax.axis("off")
    if empty or not summary:
        placeholder(ax, "QA table", "articles.json questions + history[].ifd.scores")
        banner(fig, summary)
        savefig(fig, "F10_auditor_qa_example.png")
        return
    ev = _pick_auditor_event(summary)
    if not ev:
        placeholder(ax, "QA table", "no history event with ifd.scores matching article questions")
        banner(fig, summary)
        savefig(fig, "F10_auditor_qa_example.png")
        return
    score_lab = {1: "correct (1)", 0: "missing (0)", -1: "incorrect (−1)"}
    cells = [["#", "question (truncated)", "expected", "auditor"]]
    for i, (q, g, s) in enumerate(zip(ev["questions"], ev["groundTruth"], ev["scores"]), start=1):
        cells.append(
            [
                str(i),
                (q[:88] + "…") if len(q) > 88 else q,
                "Yes" if g else "No",
                score_lab.get(int(s), str(s)),
            ]
        )
    table = ax.table(cellText=cells, loc="upper center", cellLoc="left", colWidths=[0.06, 0.62, 0.12, 0.2])
    table.auto_set_font_size(False)
    table.set_fontsize(7.5)
    table.scale(1, 1.55)
    hdr = (
        f"run={ev['runDir']}  node={ev['nodeId']} ({ev['personaId']})  "
        f"tick={ev['tick']}  article={ev['articleId']}  action={ev['action']}  "
        f"MI={ev['misinfoIndex']}  CR={ev['ifd'].get('cr')} MR={ev['ifd'].get('mr')} IR={ev['ifd'].get('ir')}"
    )
    ax.set_title(hdr, loc="left", fontsize=8)
    ax.text(0.0, 0.08, "Rewrite excerpt: " + ev["contentOut"].replace("\n", " "), fontsize=7, wrap=True, transform=ax.transAxes)
    banner(fig, summary)
    savefig(fig, "F10_auditor_qa_example.png")


def fig_f11(summary: dict | None, empty: bool) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(11.0, 4.6))
    fig.suptitle("F11  Cost and compute", fontsize=11)
    ax0, ax1 = axes
    manifest = load_json(RESULTS / "campaign_manifest.json") or {}
    usage = (summary or {}).get("llmUsage") or []
    if empty or not usage:
        placeholder(ax0, "tokens / USD", "summary.llmUsage")
        placeholder(ax1, "wall-clock", "campaign_manifest.runs[].elapsedMs")
        banner(fig, summary)
        savefig(fig, "F11_cost_compute.png")
        return
    names = [u.get("experimentName") or u.get("runDir") for u in usage]
    x = np.arange(len(usage))
    ax0.bar(x, [u.get("totalTokens") or 0 for u in usage], color="#6baed6")
    ax0.set_xticks(x)
    ax0.set_xticklabels(names, rotation=30, ha="right", fontsize=8)
    ax0.set_ylabel("total tokens")
    ax0.set_title("(a) tokens; USD annotated from usage object", loc="left", fontsize=8)
    for i, u in enumerate(usage):
        usd = u.get("estimatedUsd")
        calls = u.get("calls")
        lab = []
        if calls is not None:
            lab.append(f"{calls} calls")
        if usd is not None:
            lab.append(f"${usd}")
        if lab:
            ax0.text(i, (u.get("totalTokens") or 0), "\n".join(lab), ha="center", va="bottom", fontsize=7)
    runs = manifest.get("runs") or []
    if runs:
        names2 = [r.get("experimentName") for r in runs]
        mins = [(r.get("elapsedMs") or 0) / 60000.0 for r in runs]
        x2 = np.arange(len(runs))
        ax1.bar(x2, mins, color="#9ecae1")
        ax1.set_xticks(x2)
        ax1.set_xticklabels(names2, rotation=30, ha="right", fontsize=8)
        ax1.set_ylabel("elapsed minutes")
        ax1.set_title("(b) wall-clock from campaign_manifest", loc="left", fontsize=8)
    else:
        placeholder(ax1, "wall-clock", "no campaign_manifest.runs")
    banner(fig, summary)
    savefig(fig, "F11_cost_compute.png")


CIKM_TABLE = [
    ["Dimension", "CIKM 2025 paper", "This thesis campaign", "Status"],
    ["Domain / seeds", "crime_0 and other news articles", "SCoPEx / chemtrails–Gates climate seeds", "New domain"],
    ["Personas", "21 roles (e.g. Young Parent)", "Debnath-reduced BPs (3 in pilot)", "New personas"],
    ["Graph", "linear_chain, 5 nodes", "scale-free, seeded ER, optional echo", "New topologies"],
    ["Mix contrast", "homogeneous vs heterogeneous chains", "conspiracy vs mixed 3 BPs", "Idea replicated"],
    ["Auditor / MPR", "5 QA items; discrete MI; severity bands", "Same Auditor.js; climate questions", "Method replicated"],
    ["k*", "not the paper headline DV", "irreversible network-mean MI>3", "New DV"],
    ["Fact-check", "not the crime-news grid", "fact_checker_injection n∈{1,3}", "New"],
    ["Distortion types", "not in CIKM news protocol", "keyword taxonomy on rewrites", "New (heuristic)"],
    ["814k HDBSCAN", "not a CIKM result", "corpus not downloaded", "Not replicated"],
    ["Published figures", "Fig.3 heatmap; Fig.4 MI paths on news", "Analogous layout on climate cells", "Layout only"],
]


def fig_t12(summary: dict | None, empty: bool) -> None:
    fig, ax = plt.subplots(figsize=(12.2, 5.8))
    fig.suptitle("T12  CIKM 2025 vs this campaign (methods, not numbers)", fontsize=11)
    ax.axis("off")
    table = ax.table(cellText=CIKM_TABLE, loc="center", cellLoc="left")
    table.auto_set_font_size(False)
    table.set_fontsize(7)
    table.scale(1, 1.55)
    for (r, c), cell in table.get_celld().items():
        if r == 0:
            cell.set_facecolor("#deebf7")
            cell.set_text_props(fontweight="bold")
        elif c == 3 and r > 0:
            txt = CIKM_TABLE[r][3]
            if txt.startswith("Method") or txt.startswith("Idea"):
                cell.set_facecolor("#e5f5e0")
            elif txt.startswith("New"):
                cell.set_facecolor("#fff5eb")
            elif txt.startswith("Not") or txt.startswith("Layout"):
                cell.set_facecolor("#f0f0f0")
    ax.set_title("No empirical MI/MPR values from either paper are copied here.", loc="left", fontsize=8)
    banner(fig, summary)
    savefig(fig, "T12_cikm_comparison.png")


def fig_f13(summary: dict | None, empty: bool) -> None:
    fig, ax = plt.subplots(figsize=(10.2, 4.6))
    fig.suptitle("F13  Polarisation index and Gini (supporting)", fontsize=11)
    if empty or not summary:
        placeholder(ax, "PI / Gini", "polarization.pi, giniCoefficient")
        banner(fig, summary)
        savefig(fig, "F13_polarization_gini.png")
        return
    rows = summary.get("rows") or []
    labels = [f"{r.get('experimentName')}\n{r.get('articleId')}" for r in rows]
    x = np.arange(len(rows))
    w = 0.35
    pi = [(r.get("polarization") or {}).get("pi") for r in rows]
    gini = [r.get("giniCoefficient") for r in rows]
    ax.bar(x - w / 2, [0 if v is None else v for v in pi], w, label="PI (null if no out-group)")
    ax.bar(x + w / 2, [0 if v is None else v for v in gini], w, label="Gini of node MPR")
    for i, v in enumerate(pi):
        if v is None:
            ax.text(i - w / 2, 0.02, "null", ha="center", fontsize=6, rotation=90)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=35, ha="right", fontsize=7)
    ax.legend(fontsize=8)
    ax.set_ylabel("index")
    banner(fig, summary)
    savefig(fig, "F13_polarization_gini.png")


def fig_t14(summary: dict | None, empty: bool) -> None:
    fig, ax = plt.subplots(figsize=(12.0, 5.4))
    fig.suptitle("T14  Cell validity ledger", fontsize=11)
    ax.axis("off")
    if empty or not summary:
        placeholder(ax, "ledger", "summary.rows status / totalEvents")
        banner(fig, summary)
        savefig(fig, "T14_validity_ledger.png")
        return
    header = ["cell", "article", "events", "k*", "propaganda", "tag"]
    body = [header]
    for r in summary.get("rows") or []:
        tag = "ok"
        if (summary.get("mode") or "") == "dry-run":
            tag = "dry-run-invalid"
        elif failed_cell(r):
            tag = "seed-drop"
        elif r.get("status") != "complete":
            tag = str(r.get("status"))
        k = r.get("kStar_network")
        body.append(
            [
                str(r.get("experimentName")),
                str(r.get("articleId")),
                str(r.get("totalEvents")),
                "none" if k is None else str(k),
                str(r.get("propagandaOccurred")),
                tag,
            ]
        )
    table = ax.table(cellText=body, loc="center", cellLoc="center")
    table.auto_set_font_size(False)
    table.set_fontsize(7)
    table.scale(1, 1.35)
    banner(fig, summary)
    savefig(fig, "T14_validity_ledger.png")


def fig_f15(summary: dict | None, empty: bool) -> None:
    fig, ax = plt.subplots(figsize=(10.4, 4.8))
    fig.suptitle("F15  Action mix by persona (supporting)", fontsize=11)
    if empty or not summary:
        placeholder(ax, "forward / reinterpret / drop", "nodeSummaries.*.stats")
        banner(fig, summary)
        savefig(fig, "F15_action_mix.png")
        return
    recs = node_mpr_records([r for r in (summary.get("rows") or []) if r.get("experiment") == "A" and not failed_cell(r)])
    personas = [p for p in PERSONA_ORDER if any(x.get("personaId") == p for x in recs)]
    keys = ["forwarded", "reinterpreted", "dropped", "dumped"]
    if not recs or not personas:
        placeholder(ax, "action mix", "no nodeSummaries.stats in run results")
        banner(fig, summary)
        savefig(fig, "F15_action_mix.png")
        return
    stacked = {k: [] for k in keys}
    for p in personas:
        bucket = [x.get("stats") or {} for x in recs if x.get("personaId") == p]
        for k in keys:
            stacked[k].append(sum(float(s.get(k) or 0) for s in bucket))
    x = np.arange(len(personas))
    bottom = np.zeros(len(personas))
    colours = ["#3182bd", "#fd8d3c", "#969696", "#d9d9d9"]
    for k, c in zip(keys, colours):
        vals = np.array(stacked[k])
        ax.bar(x, vals, bottom=bottom, label=k, color=c)
        bottom += vals
    ax.set_xticks(x)
    ax.set_xticklabels(personas, rotation=20, ha="right")
    ax.set_ylabel("count (summed over Experiment A nodes)")
    ax.legend(fontsize=8)
    ax.set_title("Configured actionWeights are a prior; this is the realised mix.", loc="left", fontsize=8)
    banner(fig, summary)
    savefig(fig, "F15_action_mix.png")


def main() -> int:
    parser = argparse.ArgumentParser(description="Thesis figure templates for thesisExperiment")
    parser.add_argument("--empty", action="store_true", help="draw axes-only placeholders")
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    summary = None if args.empty else load_json(RESULTS / "summary.json")
    plt.rcParams.update(
        {
            "figure.dpi": 120,
            "savefig.dpi": 150,
            "font.size": 9,
            "axes.titlesize": 10,
            "figure.facecolor": "white",
        }
    )
    fig_f01(summary, args.empty)
    fig_f02(summary, args.empty)
    fig_f03(summary, args.empty)
    fig_f04(summary, args.empty)
    fig_f05(summary, args.empty)
    fig_f06(summary, args.empty)
    fig_f07(summary, args.empty)
    fig_f08(summary, args.empty)
    fig_f09(summary, args.empty)
    fig_f10(summary, args.empty)
    fig_f11(summary, args.empty)
    fig_t12(summary, args.empty)
    fig_f13(summary, args.empty)
    fig_t14(summary, args.empty)
    fig_f15(summary, args.empty)
    index = HERE / "generated_index.txt"
    pngs = sorted(p.name for p in HERE.glob("*.png"))
    index.write_text("\n".join(pngs) + "\n", encoding="utf-8")
    print(f"index {index} ({len(pngs)} png)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
