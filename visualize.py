#!/usr/bin/env python3
"""
visualize.py  —  Generate images from a Society Simulation experiment run.

Usage:
    python visualize.py experiments/exp_2026-05-20_16-58-40
    python visualize.py experiments/exp_2026-05-20_16-58-40 --out-dir my_plots
    python visualize.py --latest          # auto-pick the most recent experiment

Outputs (written to <experiment_dir>/plots/ by default):
    01_graph_topology.png     — directed graph, nodes coloured by persona category
    02_mpr_heatmap.png        — nodes × articles MPR with severity colour scale
    03_action_distribution.png— stacked bar chart of forward/reinterpret/drop/dump
    04_propagation_wave.png   — messages-per-tick per article (how far info travelled)
    05_mi_trajectory.png      — MI value per tick per node per article (line chart)
    06_trust_evolution.png    — initial vs final trust scores on every edge
    dashboard.png             — all panels in a single figure

Requirements:
    pip install matplotlib networkx seaborn numpy
"""

import json
import sys
import os
import argparse
from pathlib import Path
from collections import defaultdict

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.gridspec as gridspec
from matplotlib.colors import LinearSegmentedColormap
import networkx as nx
import numpy as np

try:
    import seaborn as sns
    HAS_SEABORN = True
except ImportError:
    HAS_SEABORN = False

# ── Colour palette ────────────────────────────────────────────────────────────

SEVERITY_COLORS = {
    "factual_error": "#2ecc71",   # green
    "lie":           "#e67e22",   # orange
    "propaganda":    "#e74c3c",   # red
}

SEVERITY_CMAP = LinearSegmentedColormap.from_list(
    "severity", ["#2ecc71", "#e67e22", "#e74c3c"], N=256
)

ACTION_COLORS = {
    "reinterpreted": "#e67e22",
    "forwarded":     "#3498db",
    "dropped":       "#e74c3c",
    "dumped":        "#95a5a6",
}

# Persona tag → colour
TAG_COLORS = {
    "ideology":        "#9b59b6",
    "political":       "#8e44ad",
    "media":           "#2980b9",
    "expert":          "#27ae60",
    "social-media":    "#e91e63",
    "advocacy":        "#00bcd4",
    "intentional":     "#ff9800",
    "education":       "#f1c40f",
    "community":       "#795548",
    "neutral":         "#7f8c8d",
    "cognitive":       "#b0bec5",
    "consumer":        "#ff5722",
    "entrepreneurship":"#ff6f00",
    "environment":     "#1b5e20",
    "family":          "#ad1457",
    "religion":        "#4a148c",
    "opinion":         "#0277bd",
}

PLOT_STYLE = {
    "figure.facecolor":  "#1a1a2e",
    "axes.facecolor":    "#16213e",
    "axes.edgecolor":    "#e0e0e0",
    "axes.labelcolor":   "#e0e0e0",
    "xtick.color":       "#e0e0e0",
    "ytick.color":       "#e0e0e0",
    "text.color":        "#e0e0e0",
    "grid.color":        "#2d2d5e",
    "grid.alpha":        0.4,
}

# ── Data loading ──────────────────────────────────────────────────────────────

def load_experiment(exp_dir: Path):
    meta      = json.loads((exp_dir / "metadata.json").read_text())
    topology  = json.loads((exp_dir / "graph_topology.json").read_text())
    personas  = json.loads((Path("personas/personas.json")).read_text())["personas"]
    persona_map = {p["id"]: p for p in personas}

    nodes_data = {}
    nodes_dir = exp_dir / "nodes"
    if nodes_dir.exists():
        for f in nodes_dir.glob("*.json"):
            nd = json.loads(f.read_text())
            nodes_data[nd["nodeId"]] = nd

    return meta, topology, persona_map, nodes_data


def persona_tag_color(persona_id, persona_map):
    p = persona_map.get(persona_id, {})
    tags = p.get("tags", ["neutral"])
    for tag in tags:
        if tag in TAG_COLORS:
            return TAG_COLORS[tag]
    return TAG_COLORS["neutral"]


def short_name(persona_id, persona_map):
    p = persona_map.get(persona_id, {})
    name = p.get("name", persona_id)
    # Keep first 22 chars to fit on graph
    return name[:22] + ("…" if len(name) > 22 else "")

# ── Plot 1: Graph topology ────────────────────────────────────────────────────

def plot_graph(topology, persona_map, nodes_data, meta, ax):
    G = nx.DiGraph()
    for n in topology["nodes"]:
        G.add_node(n["nodeId"], personaId=n["personaId"])
    for e in topology["edges"]:
        G.add_edge(e["from"], e["to"], trust=e["trust"])

    # Layout
    topo = meta["config"].get("topology", "custom")
    if topo == "linear_chain":
        pos = {nid: (i, 0) for i, nid in enumerate(list(G.nodes))}
    elif topo == "ring":
        pos = nx.circular_layout(G)
    else:
        pos = nx.spring_layout(G, seed=42, k=2)

    node_ids   = list(G.nodes)
    node_colors = [persona_tag_color(G.nodes[n]["personaId"], persona_map) for n in node_ids]

    # Node size ∝ total received messages
    sizes = []
    for n in node_ids:
        nd = nodes_data.get(n, {})
        total = nd.get("stats", {}).get("received", 0)
        sizes.append(max(800, 400 + total * 300))

    # Edge trust → width + colour
    edge_trusts = [G[u][v]["trust"] for u, v in G.edges()]
    edge_widths = [max(1.0, t * 4) for t in edge_trusts]
    edge_colors = [plt.cm.RdYlGn(t) for t in edge_trusts]

    nx.draw_networkx_nodes(G, pos, nodelist=node_ids, node_color=node_colors,
                           node_size=sizes, ax=ax, alpha=0.92, linewidths=1.5,
                           edgecolors="#ffffff")
    nx.draw_networkx_edges(G, pos, width=edge_widths, edge_color=edge_colors,
                           arrows=True, arrowsize=20, ax=ax,
                           connectionstyle="arc3,rad=0.08", alpha=0.85,
                           min_source_margin=18, min_target_margin=18)

    labels = {n: f"{n}\n{short_name(G.nodes[n]['personaId'], persona_map)}" for n in node_ids}
    nx.draw_networkx_labels(G, pos, labels=labels, font_size=7,
                            font_color="#ffffff", ax=ax)

    # Edge trust labels
    edge_labels = {(u, v): f"{G[u][v]['trust']:.2f}" for u, v in G.edges()}
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels,
                                 font_size=7, font_color="#f0e68c", ax=ax,
                                 bbox=dict(boxstyle="round,pad=0.2",
                                           fc="#1a1a2e", alpha=0.6))

    # Read final trust from node files for evolution annotation
    evolved = []
    for e in topology["edges"]:
        nd = nodes_data.get(e["from"], {})
        final_trust = nd.get("relations", {}).get(e["to"])
        if final_trust is not None and abs(final_trust - e["trust"]) > 0.001:
            evolved.append((e["from"], e["to"], e["trust"], final_trust))
    if evolved:
        info = "\n".join([f"{f}→{t}: {i:.2f}→{fi:.2f}" for f,t,i,fi in evolved])
        ax.text(0.01, 0.01, f"Trust evolved:\n{info}", transform=ax.transAxes,
                fontsize=7, color="#f0e68c", va="bottom",
                bbox=dict(boxstyle="round", fc="#1a1a2e", alpha=0.7))

    # Legend: persona categories present
    seen_tags = set()
    legend_handles = []
    for n in node_ids:
        pid = G.nodes[n]["personaId"]
        p = persona_map.get(pid, {})
        for tag in p.get("tags", ["neutral"]):
            if tag in TAG_COLORS and tag not in seen_tags:
                seen_tags.add(tag)
                legend_handles.append(
                    mpatches.Patch(color=TAG_COLORS[tag], label=tag))
    ax.legend(handles=legend_handles, loc="upper right", fontsize=7,
              facecolor="#1a1a2e", edgecolor="#555", labelcolor="#e0e0e0",
              title="Persona category", title_fontsize=7)

    ax.set_title("Graph Topology  (node size = messages received, edge = trust score)",
                 fontsize=10, pad=10)
    ax.axis("off")

# ── Plot 2: MPR heatmap ───────────────────────────────────────────────────────

def plot_mpr_heatmap(meta, persona_map, ax):
    results = meta.get("results", {})
    if not results:
        ax.text(0.5, 0.5, "No results", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0")
        return

    article_ids = list(results.keys())
    # Collect all node ids in order
    first = next(iter(results.values()))
    node_ids = list(first["nodeSummaries"].keys())

    mpr_matrix = np.zeros((len(node_ids), len(article_ids)))
    for j, art_id in enumerate(article_ids):
        summaries = results[art_id]["nodeSummaries"]
        for i, nid in enumerate(node_ids):
            mpr_matrix[i, j] = summaries.get(nid, {}).get("mpr", 0.0)

    # Clamp to [0, 10] for colour scaling
    vmax = max(10.0, float(mpr_matrix.max()) + 0.1)

    im = ax.imshow(mpr_matrix, cmap=SEVERITY_CMAP, vmin=0, vmax=vmax,
                   aspect="auto", interpolation="nearest")

    # Cell text
    for i in range(len(node_ids)):
        for j in range(len(article_ids)):
            val = mpr_matrix[i, j]
            ax.text(j, i, f"{val:.2f}", ha="center", va="center",
                    fontsize=9, fontweight="bold",
                    color="white" if val > vmax * 0.4 else "#1a1a2e")

    ax.set_xticks(range(len(article_ids)))
    ax.set_xticklabels(article_ids, rotation=25, ha="right", fontsize=8)
    ax.set_yticks(range(len(node_ids)))
    ylabels = [f"{nid}\n({short_name(results[article_ids[0]]['nodeSummaries'].get(nid,{}).get('personaId','?'), persona_map)})"
               for nid in node_ids]
    ax.set_yticklabels(ylabels, fontsize=7)

    cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label("MPR", fontsize=8, color="#e0e0e0")
    cbar.ax.yaxis.set_tick_params(color="#e0e0e0")
    plt.setp(cbar.ax.yaxis.get_ticklabels(), color="#e0e0e0")

    # Draw severity tier boundaries
    ax.axhline(-0.5, color="#555", lw=0.5)
    for boundary_val, label, color in [(1, "lie", "#e67e22"), (3, "propaganda", "#e74c3c")]:
        ax.axvline(-0.5, color=color, lw=1, linestyle="--", alpha=0.5)

    # Legend patches
    patches = [mpatches.Patch(color=c, label=l)
               for l, c in SEVERITY_COLORS.items()]
    ax.legend(handles=patches, loc="lower right", fontsize=7,
              facecolor="#1a1a2e", edgecolor="#555", labelcolor="#e0e0e0")

    ax.set_title("Misinformation Propagation Rate  (MPR)  —  Nodes × Articles",
                 fontsize=10, pad=8)

# ── Plot 3: Action distribution ───────────────────────────────────────────────

def plot_action_distribution(nodes_data, ax):
    if not nodes_data:
        ax.text(0.5, 0.5, "No node data", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0")
        return

    node_ids  = sorted(nodes_data.keys())
    actions   = ["reinterpreted", "forwarded", "dropped", "dumped"]
    data      = {a: [] for a in actions}

    for nid in node_ids:
        stats = nodes_data[nid].get("stats", {})
        for a in actions:
            data[a].append(stats.get(a, 0))

    x = np.arange(len(node_ids))
    bottom = np.zeros(len(node_ids))

    for action in actions:
        vals = np.array(data[action], dtype=float)
        bars = ax.bar(x, vals, bottom=bottom, label=action.capitalize(),
                      color=ACTION_COLORS[action], alpha=0.88, width=0.6,
                      edgecolor="#ffffff", linewidth=0.4)
        # Label non-zero segments
        for bar, val, bot in zip(bars, vals, bottom):
            if val > 0:
                ax.text(bar.get_x() + bar.get_width() / 2,
                        bot + val / 2, str(int(val)),
                        ha="center", va="center", fontsize=8,
                        color="white", fontweight="bold")
        bottom += vals

    ax.set_xticks(x)
    ax.set_xticklabels(node_ids, rotation=20, ha="right", fontsize=8)
    ax.set_ylabel("Message count", fontsize=9)
    ax.set_title("Action Distribution per Node  (across all articles)", fontsize=10, pad=8)
    ax.legend(fontsize=8, facecolor="#1a1a2e", edgecolor="#555",
              labelcolor="#e0e0e0", loc="upper right")
    ax.grid(axis="y", alpha=0.3)
    ax.set_axisbelow(True)

# ── Plot 4: Propagation wave ──────────────────────────────────────────────────

def plot_propagation_wave(meta, ax):
    results = meta.get("results", {})
    if not results:
        ax.text(0.5, 0.5, "No results", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0")
        return

    colors = plt.cm.tab10(np.linspace(0, 1, len(results)))
    for (art_id, result), color in zip(results.items(), colors):
        ticks  = [t["tick"] for t in result["tickResults"]]
        counts = [t["messagesGenerated"] for t in result["tickResults"]]
        ax.plot(ticks, counts, marker="o", label=art_id, color=color,
                linewidth=2, markersize=6)
        ax.fill_between(ticks, counts, alpha=0.15, color=color)

    ax.set_xlabel("Tick", fontsize=9)
    ax.set_ylabel("Messages generated", fontsize=9)
    ax.set_title("Propagation Wave  —  Messages per Tick per Article", fontsize=10, pad=8)
    ax.legend(fontsize=8, facecolor="#1a1a2e", edgecolor="#555",
              labelcolor="#e0e0e0")
    ax.grid(True, alpha=0.3)
    ax.set_axisbelow(True)
    ax.xaxis.set_major_locator(plt.MaxNLocator(integer=True))

# ── Plot 5: MI trajectory per node ────────────────────────────────────────────

def plot_mi_trajectory(nodes_data, meta, ax):
    results = meta.get("results", {})
    article_ids = list(results.keys())
    node_ids    = sorted(nodes_data.keys())

    if not node_ids or not article_ids:
        ax.text(0.5, 0.5, "No data", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0")
        return

    # Build tick→MI series per (node, article)
    art_colors  = plt.cm.tab10(np.linspace(0, 1, len(article_ids)))
    node_styles = ["-", "--", "-.", ":", (0,(3,1,1,1))]

    plotted = False
    for j, (art_id, color) in enumerate(zip(article_ids, art_colors)):
        for i, nid in enumerate(node_ids):
            history = nodes_data[nid].get("history", [])
            art_events = [(e["tick"], e["misinfoIndex"])
                          for e in history
                          if e["articleId"] == art_id and e["misinfoIndex"] is not None]
            if not art_events:
                continue
            ticks, mis = zip(*sorted(art_events))
            ls = node_styles[i % len(node_styles)]
            ax.plot(ticks, mis, marker="o", linestyle=ls, color=color,
                    linewidth=1.8, markersize=5, alpha=0.85,
                    label=f"{nid} / {art_id}")
            plotted = True

    # Severity tier bands
    ax.axhspan(0, 1, alpha=0.06, color="#2ecc71", label="_fe band")
    ax.axhspan(1, 3, alpha=0.06, color="#e67e22", label="_lie band")
    ax.axhspan(3, 10, alpha=0.06, color="#e74c3c", label="_prop band")
    ax.axhline(1, color="#2ecc71", linewidth=0.7, linestyle="--", alpha=0.5)
    ax.axhline(3, color="#e74c3c", linewidth=0.7, linestyle="--", alpha=0.5)
    ax.text(0.01, 1.05, "lie threshold", transform=ax.get_yaxis_transform(),
            fontsize=7, color="#e67e22", va="bottom")
    ax.text(0.01, 3.05, "propaganda threshold", transform=ax.get_yaxis_transform(),
            fontsize=7, color="#e74c3c", va="bottom")

    if not plotted:
        ax.text(0.5, 0.5, "All MI = 0  (dry-run or perfect fidelity)",
                ha="center", va="center", transform=ax.transAxes, color="#aaa", fontsize=9)

    ax.set_xlabel("Tick", fontsize=9)
    ax.set_ylabel("Misinformation Index (MI)", fontsize=9)
    ax.set_title("MI Trajectory per Node  (per article)", fontsize=10, pad=8)
    ax.set_ylim(bottom=-0.2)
    ax.xaxis.set_major_locator(plt.MaxNLocator(integer=True))
    ax.grid(True, alpha=0.3)
    ax.set_axisbelow(True)
    if plotted:
        ax.legend(fontsize=7, facecolor="#1a1a2e", edgecolor="#555",
                  labelcolor="#e0e0e0", loc="upper left",
                  ncol=max(1, len(article_ids)))

# ── Plot 6: Trust evolution ───────────────────────────────────────────────────

def plot_trust_evolution(topology, nodes_data, ax):
    edges = topology.get("edges", [])
    if not edges:
        ax.text(0.5, 0.5, "No edges", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0")
        return

    labels        = []
    initial_trust = []
    final_trust   = []

    for e in edges:
        frm, to = e["from"], e["to"]
        initial = e["trust"]
        nd = nodes_data.get(frm, {})
        final = nd.get("relations", {}).get(to, initial)
        labels.append(f"{frm}→{to}")
        initial_trust.append(initial)
        final_trust.append(final)

    x = np.arange(len(labels))
    w = 0.35

    bars1 = ax.bar(x - w/2, initial_trust, w, label="Initial trust",
                   color="#3498db", alpha=0.85, edgecolor="#fff", linewidth=0.4)
    bars2 = ax.bar(x + w/2, final_trust, w, label="Final trust",
                   color="#e67e22", alpha=0.85, edgecolor="#fff", linewidth=0.4)

    for bar in bars1:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f"{bar.get_height():.2f}", ha="center", va="bottom",
                fontsize=8, color="#e0e0e0")
    for bar in bars2:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                f"{bar.get_height():.2f}", ha="center", va="bottom",
                fontsize=8, color="#e0e0e0")

    # Delta annotation
    for i, (ini, fin) in enumerate(zip(initial_trust, final_trust)):
        delta = fin - ini
        if abs(delta) > 0.001:
            color = "#2ecc71" if delta > 0 else "#e74c3c"
            ax.annotate(f"Δ{delta:+.2f}", xy=(i, max(ini, fin) + 0.05),
                        ha="center", fontsize=7, color=color, fontweight="bold")

    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=20, ha="right", fontsize=8)
    ax.set_ylim(0, 1.15)
    ax.set_ylabel("Trust score", fontsize=9)
    ax.set_title("Trust Evolution per Edge  (initial vs final)", fontsize=10, pad=8)
    ax.legend(fontsize=8, facecolor="#1a1a2e", edgecolor="#555", labelcolor="#e0e0e0")
    ax.grid(axis="y", alpha=0.3)
    ax.set_axisbelow(True)

# ── Experiment info banner ────────────────────────────────────────────────────

def make_banner(meta, ax):
    ax.axis("off")
    cfg = meta["config"]
    lines = [
        f"Experiment ID : {meta['experimentId']}",
        f"Status        : {meta['status']}   |   Timestamp: {meta['timestamp'][:19].replace('T',' ')}",
        f"Topology      : {cfg['topology']}   |   Ticks: {cfg['maxTicks']}   |   Model: {cfg['defaultModel']}",
        f"Seed articles : {', '.join(cfg['seedArticles'])}   |   Seed nodes: {', '.join(cfg['seedNodes'])}",
        f"Action weights: forward={cfg['nodeParams']['actionWeights']['forward']}  "
        f"reinterpret={cfg['nodeParams']['actionWeights']['reinterpret']}  "
        f"drop={cfg['nodeParams']['actionWeights']['drop']}",
        f"Trust threshold: {cfg['nodeParams']['trustThreshold']}   |   "
        f"Trust delta: {cfg['nodeParams']['trustDelta']}   |   "
        f"Max hops: {cfg['nodeParams']['maxHops']}   |   "
        f"Relation evolution: {cfg['nodeParams']['relationEvolution']}",
    ]
    text = "\n".join(lines)
    ax.text(0.01, 0.5, text, transform=ax.transAxes, fontsize=9,
            va="center", ha="left", color="#e0e0e0",
            fontfamily="monospace",
            bbox=dict(boxstyle="round,pad=0.6", fc="#0f3460", ec="#e0e0e0", alpha=0.9))
    ax.set_title("Society Simulation — Experiment Summary", fontsize=12,
                 fontweight="bold", color="#e0e0e0", pad=6)

# ── Individual savers ─────────────────────────────────────────────────────────

def save_individual(fn, plot_fn, *args, out_dir):
    with plt.style.context(PLOT_STYLE):
        fig, ax = plt.subplots(figsize=(12, 6), facecolor="#1a1a2e")
        ax.set_facecolor("#16213e")
        plot_fn(*args, ax=ax)
        fig.tight_layout()
        path = out_dir / fn
        fig.savefig(path, dpi=150, bbox_inches="tight",
                    facecolor=fig.get_facecolor())
        plt.close(fig)
        print(f"  Saved: {path}")

# ── Dashboard ─────────────────────────────────────────────────────────────────

def build_dashboard(meta, topology, persona_map, nodes_data, out_dir):
    with plt.style.context(PLOT_STYLE):
        fig = plt.figure(figsize=(22, 20), facecolor="#1a1a2e")
        gs = gridspec.GridSpec(
            4, 2,
            figure=fig,
            hspace=0.48,
            wspace=0.32,
            height_ratios=[0.6, 1.8, 1.4, 1.4],
        )

        # Row 0 — banner (spans both columns)
        ax_banner = fig.add_subplot(gs[0, :])
        ax_banner.set_facecolor("#16213e")
        make_banner(meta, ax_banner)

        # Row 1 — graph topology (left) + MPR heatmap (right)
        ax_graph = fig.add_subplot(gs[1, 0])
        ax_graph.set_facecolor("#16213e")
        plot_graph(topology, persona_map, nodes_data, meta, ax_graph)

        ax_mpr = fig.add_subplot(gs[1, 1])
        ax_mpr.set_facecolor("#16213e")
        plot_mpr_heatmap(meta, persona_map, ax_mpr)

        # Row 2 — action distribution (left) + propagation wave (right)
        ax_act = fig.add_subplot(gs[2, 0])
        ax_act.set_facecolor("#16213e")
        plot_action_distribution(nodes_data, ax_act)

        ax_wave = fig.add_subplot(gs[2, 1])
        ax_wave.set_facecolor("#16213e")
        plot_propagation_wave(meta, ax_wave)

        # Row 3 — MI trajectory (left) + trust evolution (right)
        ax_mi = fig.add_subplot(gs[3, 0])
        ax_mi.set_facecolor("#16213e")
        plot_mi_trajectory(nodes_data, meta, ax_mi)

        ax_trust = fig.add_subplot(gs[3, 1])
        ax_trust.set_facecolor("#16213e")
        plot_trust_evolution(topology, nodes_data, ax_trust)

        out_path = out_dir / "dashboard.png"
        fig.savefig(out_path, dpi=150, bbox_inches="tight",
                    facecolor=fig.get_facecolor())
        plt.close(fig)
        print(f"  Saved: {out_path}")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Visualize a Society Simulation run")
    parser.add_argument("exp_dir", nargs="?", help="Path to experiment directory")
    parser.add_argument("--latest", action="store_true",
                        help="Auto-pick the most recent experiment folder")
    parser.add_argument("--out-dir", default=None,
                        help="Output directory for plots (default: <exp_dir>/plots)")
    args = parser.parse_args()

    # Resolve experiment directory
    if args.latest or args.exp_dir is None:
        experiments_root = Path("experiments")
        if not experiments_root.exists():
            print("No experiments/ folder found. Run a simulation first.")
            sys.exit(1)
        dirs = sorted(experiments_root.iterdir())
        if not dirs:
            print("No experiment runs found inside experiments/.")
            sys.exit(1)
        exp_dir = dirs[-1]
        print(f"Using latest experiment: {exp_dir}")
    else:
        exp_dir = Path(args.exp_dir)

    if not exp_dir.exists():
        print(f"Experiment directory not found: {exp_dir}")
        sys.exit(1)

    out_dir = Path(args.out_dir) if args.out_dir else exp_dir / "plots"
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nLoading experiment from: {exp_dir}")
    meta, topology, persona_map, nodes_data = load_experiment(exp_dir)
    print(f"  Nodes: {len(topology['nodes'])}  |  Edges: {len(topology['edges'])}")
    print(f"  Articles: {list(meta.get('results', {}).keys())}")
    print(f"\nGenerating plots -> {out_dir}\n")

    # Individual plots
    save_individual("01_graph_topology.png", plot_graph,
                    topology, persona_map, nodes_data, meta, out_dir=out_dir)
    save_individual("02_mpr_heatmap.png", plot_mpr_heatmap,
                    meta, persona_map, out_dir=out_dir)
    save_individual("03_action_distribution.png", plot_action_distribution,
                    nodes_data, out_dir=out_dir)
    save_individual("04_propagation_wave.png", plot_propagation_wave,
                    meta, out_dir=out_dir)
    save_individual("05_mi_trajectory.png", plot_mi_trajectory,
                    nodes_data, meta, out_dir=out_dir)
    save_individual("06_trust_evolution.png", plot_trust_evolution,
                    topology, nodes_data, out_dir=out_dir)

    # Dashboard
    print("  Building dashboard…")
    build_dashboard(meta, topology, persona_map, nodes_data, out_dir)

    print(f"\nDone. All images in: {out_dir.resolve()}")


if __name__ == "__main__":
    main()
