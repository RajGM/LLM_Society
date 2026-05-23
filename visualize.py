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
    "bot":             "#ff0000",
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

    colors = plt.cm.tab10(np.linspace(0, 1, max(len(results), 1)))
    plotted = False
    for (art_id, result), color in zip(results.items(), colors):
        # Prefer pre-computed tickResults; fall back to counting events from nodeSummaries
        tick_results = result.get("tickResults")
        if tick_results:
            ticks  = [t["tick"] for t in tick_results]
            counts = [t["messagesGenerated"] for t in tick_results]
        else:
            # Reconstruct from nodeSummaries stats (total forwarded+reinterpreted as proxy)
            ns = result.get("nodeSummaries", {})
            if not ns:
                continue
            total = sum(
                v.get("stats", {}).get("forwarded", 0) +
                v.get("stats", {}).get("reinterpreted", 0)
                for v in ns.values()
            )
            ticks  = [1]
            counts = [total]
        ax.plot(ticks, counts, marker="o", label=art_id, color=color,
                linewidth=2, markersize=6)
        ax.fill_between(ticks, counts, alpha=0.15, color=color)
        plotted = True

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

# ── Plot 7: Network evolution ─────────────────────────────────────────────────

def plot_network_evolution(meta, topology, persona_map, ax):
    """Bar chart of networkEvolution metrics per article (edges added/removed,
    modularity Q, homophily index). Falls back gracefully when extension not run."""
    results = meta.get("results", {})

    articles       = []
    edges_added    = []
    edges_removed  = []
    modularity_q   = []
    homophily_idx  = []

    for art_id, res in results.items():
        ne = res.get("networkEvolution") if res else None
        if ne is None:
            continue
        articles.append(art_id)
        edges_added.append(ne.get("edgesAdded", 0))
        edges_removed.append(ne.get("edgesRemoved", 0))
        modularity_q.append(ne.get("modularityQ") or 0)
        homophily_idx.append(ne.get("homophilyIndex") or 0)

    if not articles:
        # Extension not enabled — show summary graph metrics from topology instead
        num_nodes = len(topology.get("nodes", []))
        num_edges = len(topology.get("edges", []))
        ax.text(
            0.5, 0.5,
            f"Network Evolution extension not enabled.\n"
            f"Static graph: {num_nodes} nodes, {num_edges} edges.",
            ha="center", va="center", transform=ax.transAxes,
            color="#e0e0e0", fontsize=10,
        )
        ax.set_title("Network Evolution (Extension 3)", fontsize=10, pad=8)
        return

    x = np.arange(len(articles))
    w = 0.2
    ax.bar(x - w*1.5, edges_added,   w, label="+Edges added",  color="#2ecc71", alpha=0.85)
    ax.bar(x - w*0.5, edges_removed, w, label="-Edges removed", color="#e74c3c", alpha=0.85)
    ax.bar(x + w*0.5, modularity_q,  w, label="Modularity Q",   color="#3498db", alpha=0.85)
    ax.bar(x + w*1.5, homophily_idx, w, label="Homophily idx",  color="#9b59b6", alpha=0.85)

    ax.set_xticks(x)
    ax.set_xticklabels(articles, rotation=15, ha="right", fontsize=8)
    ax.set_ylabel("Value", fontsize=9)
    ax.set_title("Network Co-evolution Metrics (Extension 3)", fontsize=10, pad=8)
    ax.legend(fontsize=7, facecolor="#1a1a2e", edgecolor="#555", labelcolor="#e0e0e0")
    ax.grid(axis="y", alpha=0.3)
    ax.set_axisbelow(True)

# ── Plot 8: Opinion dynamics ──────────────────────────────────────────────────

def plot_opinion_dynamics(exp_dir, meta, ax):
    """Line chart of DeGroot trajectory per node (first article found).
    Falls back if opinion dynamics extension not enabled."""
    results = meta.get("results", {})
    article_ids = list(results.keys())

    od_data = None
    od_article = None
    for art_id in article_ids:
        fp = exp_dir / f"opinion_dynamics_{art_id}.json"
        if fp.exists():
            with open(fp) as f:
                od_data = json.load(f)
            od_article = art_id
            break

    if od_data is None:
        ax.text(
            0.5, 0.5,
            "Opinion Dynamics extension not enabled.\n"
            "(enableOpinionDynamics: true + enableBeliefs: true)",
            ha="center", va="center", transform=ax.transAxes,
            color="#e0e0e0", fontsize=10,
        )
        ax.set_title("Opinion Dynamics (Extension 8)", fontsize=10, pad=8)
        return

    # Plot DeGroot convergence trajectory
    traj = od_data.get("degroot", {}).get("trajectory", [])
    if not traj:
        ax.text(0.5, 0.5, "No trajectory data", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0")
        ax.set_title("Opinion Dynamics — DeGroot", fontsize=10, pad=8)
        return

    node_ids = list(traj[0].keys()) if traj else []
    colors   = plt.cm.tab10(np.linspace(0, 1, max(len(node_ids), 1)))

    for node_id, col in zip(node_ids, colors):
        vals = [step.get(node_id, 0.5) for step in traj]
        ax.plot(vals, label=node_id, color=col, linewidth=1.5, marker="o", markersize=3)

    conv_type = od_data.get("degroot", {}).get("convergenceType", "unknown")
    ax.set_xlabel("Iteration", fontsize=9)
    ax.set_ylabel("Opinion (confidence)", fontsize=9)
    ax.set_title(
        f"Opinion Dynamics — DeGroot  [{od_article}]  "
        f"convergence: {conv_type}",
        fontsize=10, pad=8,
    )
    ax.set_ylim(-0.05, 1.05)
    ax.legend(fontsize=7, facecolor="#1a1a2e", edgecolor="#555", labelcolor="#e0e0e0",
              ncol=max(1, len(node_ids) // 5))
    ax.grid(True, alpha=0.3)
    ax.set_axisbelow(True)

# ── Plot 9: Institutional trust ───────────────────────────────────────────────

def plot_institutional_trust(exp_dir, ax):
    """Grouped bar chart of institutional trust per node.
    Falls back if extension not enabled."""
    fp = exp_dir / "institutional_trust.json"
    if not fp.exists():
        ax.text(
            0.5, 0.5,
            "Institutional Trust extension not enabled.\n"
            "(enableInstitutionalTrust: true)",
            ha="center", va="center", transform=ax.transAxes,
            color="#e0e0e0", fontsize=10,
        )
        ax.set_title("Institutional Trust (Extension 9)", fontsize=10, pad=8)
        return

    with open(fp) as f:
        trust_data = json.load(f)

    nodes_dict = trust_data.get("nodes", {})
    if not nodes_dict:
        ax.text(0.5, 0.5, "No institutional trust data", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0")
        return

    institutions = ["media", "science", "government", "corporate"]
    inst_colors  = {"media": "#2980b9", "science": "#27ae60",
                    "government": "#8e44ad", "corporate": "#e67e22"}
    node_ids     = list(nodes_dict.keys())

    x = np.arange(len(node_ids))
    n = len(institutions)
    w = 0.7 / n

    for i, inst in enumerate(institutions):
        vals = [nodes_dict[nid].get(inst, 0.5) for nid in node_ids]
        offset = (i - n / 2 + 0.5) * w
        bars = ax.bar(x + offset, vals, w, label=inst.capitalize(),
                      color=inst_colors[inst], alpha=0.85, edgecolor="#fff", linewidth=0.3)

    ax.set_xticks(x)
    ax.set_xticklabels(node_ids, rotation=15, ha="right", fontsize=8)
    ax.set_ylim(0, 1.1)
    ax.set_ylabel("Trust score", fontsize=9)
    ax.set_title("Institutional Trust per Node (Extension 9)", fontsize=10, pad=8)
    ax.axhline(0.5, color="#aaa", linestyle="--", linewidth=0.7, alpha=0.6)
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

# ── Plot 10: Bot impact dashboard ────────────────────────────────────────────
# Expects a bot_resilience summary.json in the experiment directory.
# Falls back gracefully if the file is absent or no bot runs were recorded.

def plot_bot_impact(exp_dir, ax=None):
    summary_path = Path(exp_dir) / "summary.json"

    # Try sibling bot_resilience directory if not directly in exp_dir
    if not summary_path.exists():
        root = Path(exp_dir).parent
        candidates = sorted(root.glob("bot_resilience_*"))
        if candidates:
            summary_path = candidates[-1] / "summary.json"

    if not summary_path.exists():
        if ax is not None:
            ax.text(0.5, 0.5, "No bot resilience data found.\nRun --bot-resilience first.",
                    ha="center", va="center", transform=ax.transAxes,
                    fontsize=10, color="#e0e0e0")
            ax.set_title("Bot Impact (no data)", fontsize=10, color="#e0e0e0")
        return

    with open(summary_path) as f:
        summary = json.load(f)

    injection = summary.get("injection", [])
    removal   = summary.get("removal", [])

    if ax is None:
        fig, axes = plt.subplots(2, 2, figsize=(14, 10), facecolor="#1a1a2e")
        axes = axes.flatten()
        standalone = True
    else:
        # Split the single ax into a 2×2 inset grid
        from mpl_toolkits.axes_grid1.inset_locator import InsetPosition
        pos = ax.get_position()
        ax.set_visible(False)
        fig = ax.get_figure()
        axes = []
        for row in range(2):
            for col in range(2):
                new_ax = fig.add_axes([
                    pos.x0 + col * pos.width / 2,
                    pos.y0 + (1 - row) * pos.height / 2 - pos.height / 2,
                    pos.width / 2 * 0.9,
                    pos.height / 2 * 0.85,
                ])
                new_ax.set_facecolor("#16213e")
                axes.append(new_ax)
        standalone = False

    BG = "#16213e"
    for a in axes:
        a.set_facecolor(BG)

    # Panel A — cascade contamination by bot type (bar chart)
    ax_a = axes[0]
    if injection:
        bot_types = sorted({r["botType"] for r in injection})
        for bt in bot_types:
            rows = [r for r in injection if r["botType"] == bt]
            densities = [r["density"] for r in rows]
            contams   = [r.get("cascadeContamination") or 0 for r in rows]
            ax_a.plot(densities, contams, marker="o", label=bt)
        ax_a.set_xlabel("Bot density", color="#e0e0e0", fontsize=8)
        ax_a.set_ylabel("Cascade contamination", color="#e0e0e0", fontsize=8)
        ax_a.set_title("A — Contamination vs Density", color="#e0e0e0", fontsize=9)
        ax_a.legend(fontsize=7, facecolor="#0f3460", labelcolor="#e0e0e0")
    else:
        ax_a.text(0.5, 0.5, "No injection data", ha="center", va="center",
                  transform=ax_a.transAxes, color="#e0e0e0", fontsize=9)
        ax_a.set_title("A — Contamination vs Density", color="#e0e0e0", fontsize=9)

    # Panel B — bot reach fraction by placement strategy (grouped bar)
    ax_b = axes[1]
    if injection:
        placements = sorted({r["placement"] for r in injection})
        x = np.arange(len(placements))
        reach_vals = [
            np.mean([r.get("botReachFraction") or 0
                     for r in injection if r["placement"] == p])
            for p in placements
        ]
        bars = ax_b.bar(x, reach_vals, color="#e91e63", alpha=0.8)
        ax_b.set_xticks(x)
        ax_b.set_xticklabels(placements, rotation=30, ha="right", fontsize=7)
        ax_b.set_ylabel("Mean bot reach fraction", color="#e0e0e0", fontsize=8)
        ax_b.set_title("B — Reach by Placement", color="#e0e0e0", fontsize=9)
    else:
        ax_b.text(0.5, 0.5, "No injection data", ha="center", va="center",
                  transform=ax_b.transAxes, color="#e0e0e0", fontsize=9)
        ax_b.set_title("B — Reach by Placement", color="#e0e0e0", fontsize=9)

    # Panel C — bot causal MI contribution by bot type
    ax_c = axes[2]
    if injection:
        bot_types2 = sorted({r["botType"] for r in injection})
        contrib_vals = [
            np.mean([r.get("botCausalContribution") or 0
                     for r in injection if r["botType"] == bt])
            for bt in bot_types2
        ]
        colors = [TAG_COLORS.get("bot", "#ff0000")] * len(bot_types2)
        ax_c.barh(bot_types2, contrib_vals, color=colors, alpha=0.8)
        ax_c.set_xlabel("Mean causal MI contribution", color="#e0e0e0", fontsize=8)
        ax_c.set_title("C — Causal MI by Bot Type", color="#e0e0e0", fontsize=9)
    else:
        ax_c.text(0.5, 0.5, "No injection data", ha="center", va="center",
                  transform=ax_c.transAxes, color="#e0e0e0", fontsize=9)
        ax_c.set_title("C — Causal MI by Bot Type", color="#e0e0e0", fontsize=9)

    # Panel D — removal strategy effectiveness (contamination after removal)
    ax_d = axes[3]
    if removal:
        rem_labels = [r["removal"] for r in removal]
        rem_contam = [r.get("cascadeContamination") or 0 for r in removal]
        x4 = np.arange(len(rem_labels))
        ax_d.bar(x4, rem_contam, color="#27ae60", alpha=0.8)
        ax_d.set_xticks(x4)
        ax_d.set_xticklabels(rem_labels, rotation=30, ha="right", fontsize=7)
        ax_d.set_ylabel("Cascade contamination", color="#e0e0e0", fontsize=8)
        ax_d.set_title("D — Removal Strategy Effectiveness", color="#e0e0e0", fontsize=9)
    else:
        ax_d.text(0.5, 0.5, "No removal data", ha="center", va="center",
                  transform=ax_d.transAxes, color="#e0e0e0", fontsize=9)
        ax_d.set_title("D — Removal Strategy Effectiveness", color="#e0e0e0", fontsize=9)

    for a in axes:
        for spine in a.spines.values():
            spine.set_edgecolor("#e0e0e0")
        a.tick_params(colors="#e0e0e0", labelsize=7)

    if standalone:
        plt.tight_layout()

# ── Plot 16: Cascade structure comparison ─────────────────────────────────────

def plot_cascade_comparison(exp_dir: Path, ax=None):
    """Real vs simulated cascade structure side-by-side bar chart."""
    report_path = exp_dir / "validation_report.json"
    standalone  = ax is None
    if standalone:
        fig, ax = plt.subplots(figsize=(10, 5), facecolor="#1a1a2e")
        ax.set_facecolor("#16213e")

    if not report_path.exists():
        ax.text(0.5, 0.5, "No validation_report.json", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Cascade Structure: Real vs Simulated", color="#e0e0e0", fontsize=10)
        return

    report      = json.loads(report_path.read_text())
    real_m      = report.get("realMetrics", {})
    sim_m       = report.get("simulatedMetrics", {})
    scalar_cmp  = report.get("structuralComparison", {}).get("scalarComparison", {})
    dtfs        = report.get("dtfs", {})

    metrics = ["depth", "breadth", "structuralVirality"]
    labels  = ["Depth", "Breadth", "Struct. Virality"]
    real_vals = [real_m.get(m, 0) for m in metrics]
    sim_vals  = [sim_m.get(m, 0)  for m in metrics]

    x      = np.arange(len(labels))
    width  = 0.35
    bars1  = ax.bar(x - width/2, real_vals, width, label="Real",      color="#3498db", alpha=0.85)
    bars2  = ax.bar(x + width/2, sim_vals,  width, label="Simulated", color="#e67e22", alpha=0.85)

    # Annotate with match/mismatch
    for i, key in enumerate(metrics):
        m = scalar_cmp.get(key, {})
        if m.get("match"):
            ax.annotate("✓", xy=(x[i], max(real_vals[i], sim_vals[i]) + 0.1),
                        ha="center", color="#27ae60", fontsize=10)
        elif m:
            ax.annotate("✗", xy=(x[i], max(real_vals[i], sim_vals[i]) + 0.1),
                        ha="center", color="#e74c3c", fontsize=10)

    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=9)
    ax.set_ylabel("Value", color="#e0e0e0", fontsize=9)
    ax.legend(fontsize=8, facecolor="#16213e", labelcolor="#e0e0e0")
    ax.set_title(
        f"Cascade Structure: Real vs Simulated  "
        f"[DTFS={dtfs.get('dtfs', '?')}  "
        f"{'✓ Validated' if dtfs.get('isValidated') else '✗'}]",
        color="#e0e0e0", fontsize=9
    )
    ax.grid(True, axis="y", alpha=0.3)
    for spine in ax.spines.values():
        spine.set_edgecolor("#e0e0e0")
    ax.tick_params(colors="#e0e0e0", labelsize=8)

    if standalone:
        plt.tight_layout()


# ── Plot 17: Distributional match ──────────────────────────────────────────────

def plot_distribution_match(exp_dir: Path, ax=None):
    """4-panel: depth/breadth/SV/size distributions real vs simulated (batch results)."""
    summary_path = exp_dir / "batch_summary.json"
    report_path  = exp_dir / "validation_report.json"
    standalone   = ax is None
    if standalone:
        fig, axes = plt.subplots(2, 2, figsize=(12, 8), facecolor="#1a1a2e")
        for a in axes.flat:
            a.set_facecolor("#16213e")
        ax = axes
    else:
        # Single-panel fallback if not standalone — show KS/JSD summary
        data = None
        if summary_path.exists():
            data = json.loads(summary_path.read_text())
        elif report_path.exists():
            data = json.loads(report_path.read_text())
        if data is None:
            ax.text(0.5, 0.5, "No batch_summary.json or validation_report.json",
                    ha="center", va="center", transform=ax.transAxes, color="#e0e0e0", fontsize=9)
            ax.set_title("Distribution Match", color="#e0e0e0", fontsize=10)
            return
        # Compact bar chart of KS statistics
        dist_cmp = data.get("distributionalComparison", {})
        keys  = [k for k in dist_cmp if not k.startswith("_")]
        if not keys:
            ax.text(0.5, 0.5, "No distributional comparison data",
                    ha="center", va="center", transform=ax.transAxes, color="#e0e0e0", fontsize=9)
            ax.set_title("Distribution Match", color="#e0e0e0", fontsize=10)
            return
        ks_stats = [dist_cmp[k].get("ks", {}).get("statistic", 0) for k in keys]
        colors   = ["#27ae60" if dist_cmp[k].get("distributionsMatch") else "#e74c3c" for k in keys]
        ax.bar(keys, ks_stats, color=colors, alpha=0.85)
        ax.axhline(y=0.1, color="#e0e0e0", linestyle="--", linewidth=1, alpha=0.5, label="KS=0.10")
        ax.set_ylabel("KS statistic (lower=better)", color="#e0e0e0", fontsize=9)
        ax.set_title("Distributional Match (KS statistics)", color="#e0e0e0", fontsize=10)
        ax.legend(fontsize=7, facecolor="#16213e", labelcolor="#e0e0e0")
        ax.tick_params(colors="#e0e0e0", labelsize=8)
        for spine in ax.spines.values():
            spine.set_edgecolor("#e0e0e0")
        return

    if not summary_path.exists():
        for a in axes.flat:
            a.text(0.5, 0.5, "No batch_summary.json\n(run --validate-batch first)",
                   ha="center", va="center", transform=a.transAxes, color="#e0e0e0", fontsize=9)
        axes[0, 0].set_title("Distribution Match", color="#e0e0e0", fontsize=10)
        if standalone:
            plt.tight_layout()
        return

    summary     = json.loads(summary_path.read_text())
    per_cascade = summary.get("perCascadeResults", [])
    dist_cmp    = summary.get("distributionalComparison", {})

    METRICS = [
        ("depth",              "Cascade Depth",              axes[0, 0]),
        ("breadth",            "Cascade Breadth",            axes[0, 1]),
        ("structuralVirality", "Structural Virality",        axes[1, 0]),
        ("structuralSimilarity", "Struct. Similarity Score", axes[1, 1]),
    ]

    for key, title, panel in METRICS:
        real_vals = [r.get("realMetrics", {}).get(key, 0) for r in per_cascade if "realMetrics" in r]
        sim_vals  = [r.get("simulatedMetrics", {}).get(key, 0) for r in per_cascade if "simulatedMetrics" in r]

        if key == "structuralSimilarity":
            vals = [r.get("structuralSimilarity", 0) for r in per_cascade if "structuralSimilarity" in r]
            panel.hist(vals, bins=10, color="#9b59b6", alpha=0.8, edgecolor="#e0e0e0", linewidth=0.4)
            panel.axvline(np.mean(vals) if vals else 0, color="#e74c3c", linestyle="--",
                          label=f"Mean={np.mean(vals):.2f}" if vals else "")
            panel.set_xlabel("Structural Similarity", color="#e0e0e0", fontsize=8)
            panel.set_ylabel("Count", color="#e0e0e0", fontsize=8)
            panel.legend(fontsize=7, facecolor="#16213e", labelcolor="#e0e0e0")
        else:
            metric_stats = dist_cmp.get(key, {})
            ks  = metric_stats.get("ks", {})
            jsd = metric_stats.get("jsDivergence", "?")

            bins = np.linspace(
                min(real_vals + sim_vals + [0]),
                max(real_vals + sim_vals + [1]) + 0.01,
                15
            )
            panel.hist(real_vals, bins=bins, alpha=0.6, color="#3498db", label="Real",     edgecolor="none")
            panel.hist(sim_vals,  bins=bins, alpha=0.6, color="#e67e22", label="Simulated", edgecolor="none")
            panel.set_xlabel(title, color="#e0e0e0", fontsize=8)
            panel.set_ylabel("Count", color="#e0e0e0", fontsize=8)
            panel.legend(fontsize=7, facecolor="#16213e", labelcolor="#e0e0e0")
            panel.set_title(
                f"{title}  KS={ks.get('statistic', '?'):.3f}  JSD={float(jsd):.3f}",
                color="#e0e0e0", fontsize=8
            )

        panel.grid(True, alpha=0.3)
        for spine in panel.spines.values():
            spine.set_edgecolor("#e0e0e0")
        panel.tick_params(colors="#e0e0e0", labelsize=7)

    if standalone:
        plt.tight_layout()


# ── Plot 18: Content drift comparison ──────────────────────────────────────────

def plot_content_drift(exp_dir: Path, ax=None):
    """Sentiment trajectory: real vs simulated at each cascade depth."""
    report_path = exp_dir / "validation_report.json"
    standalone  = ax is None
    if standalone:
        fig, ax = plt.subplots(figsize=(10, 4), facecolor="#1a1a2e")
        ax.set_facecolor("#16213e")

    if not report_path.exists():
        ax.text(0.5, 0.5, "No validation_report.json", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Content Drift: Sentiment by Cascade Depth", color="#e0e0e0", fontsize=10)
        return

    report   = json.loads(report_path.read_text())
    drift    = report.get("contentDrift", {})
    sim_d    = drift.get("simulated", {})
    real_d   = drift.get("real")
    cmp_d    = drift.get("comparison", {})

    sim_traj  = sim_d.get("sentimentTrajectory", [])
    real_traj = real_d.get("sentimentTrajectory", []) if real_d else []

    if sim_traj:
        depths  = [p["depth"] for p in sim_traj]
        means   = [p["mean"]  for p in sim_traj]
        stds    = [p["std"]   for p in sim_traj]
        ax.plot(depths, means, color="#e67e22", linewidth=2, marker="o", markersize=5, label="Simulated sentiment")
        ax.fill_between(depths,
                         [m - s for m, s in zip(means, stds)],
                         [m + s for m, s in zip(means, stds)],
                         alpha=0.2, color="#e67e22")

    if real_traj:
        r_depths = [p["depth"] for p in real_traj]
        r_means  = [p["mean"]  for p in real_traj]
        ax.plot(r_depths, r_means, color="#3498db", linewidth=2, marker="s", markersize=5,
                linestyle="--", label="Real sentiment")

    ax.axhline(y=0, color="#e0e0e0", linestyle=":", linewidth=0.8, alpha=0.5)

    corr = cmp_d.get("contentCorrelation", "N/A")
    label = cmp_d.get("matchLabel", "")
    title_suffix = f"  ρ={corr}  {label}" if cmp_d.get("available") else "  (no real text)"

    ax.set_xlabel("Cascade Depth", color="#e0e0e0", fontsize=9)
    ax.set_ylabel("Mean Sentiment", color="#e0e0e0", fontsize=9)
    ax.legend(fontsize=7, facecolor="#16213e", labelcolor="#e0e0e0")
    ax.set_title(f"Content Drift: Sentiment by Depth{title_suffix}", color="#e0e0e0", fontsize=9)
    ax.grid(True, alpha=0.3)
    for spine in ax.spines.values():
        spine.set_edgecolor("#e0e0e0")
    ax.tick_params(colors="#e0e0e0", labelsize=8)

    # Annotate reinterpret rate
    ri = sim_d.get("reinterpretRate")
    if ri is not None:
        ax.annotate(f"Reinterpret rate: {ri:.1%}", xy=(0.02, 0.92),
                    xycoords="axes fraction", color="#e0e0e0", fontsize=7)

    if standalone:
        plt.tight_layout()


# ── Plot 19: Sensitivity analysis ──────────────────────────────────────────────

def plot_sensitivity_analysis(exp_dir: Path, ax=None):
    """Bar chart: structural similarity ± std per persona inference strategy."""
    sens_path  = exp_dir / "sensitivity_report.json"
    standalone = ax is None
    if standalone:
        fig, ax = plt.subplots(figsize=(8, 5), facecolor="#1a1a2e")
        ax.set_facecolor("#16213e")

    if not sens_path.exists():
        ax.text(0.5, 0.5, "No sensitivity_report.json\n(run --validate-sensitivity first)",
                ha="center", va="center", transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Sensitivity: Persona Inference Strategy", color="#e0e0e0", fontsize=10)
        return

    report  = json.loads(sens_path.read_text())
    results = [r for r in report.get("results", []) if "error" not in r]
    if not results:
        ax.text(0.5, 0.5, "No results in sensitivity report", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Sensitivity Analysis", color="#e0e0e0", fontsize=10)
        return

    labels   = [r["strategy"] for r in results]
    sim_vals = [r.get("avgStructuralSimilarity", 0) * 100 for r in results]
    std_vals = [r.get("stdStructuralSimilarity",  0) * 100 for r in results]
    best     = report.get("bestStrategy")

    colors = ["#27ae60" if r["strategy"] == best else "#3498db" for r in results]
    x      = np.arange(len(labels))

    ax.bar(x, sim_vals, color=colors, alpha=0.85, yerr=std_vals,
           error_kw={"ecolor": "#e0e0e0", "capsize": 4})
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=15, ha="right", fontsize=8)
    ax.set_ylabel("Structural Similarity (%)", color="#e0e0e0", fontsize=9)
    ax.set_ylim(0, 110)

    dtfs_range = report.get("dtfsRange", 0) * 100
    sensitivity_label = "HIGH sensitivity" if report.get("highSensitivity") else "LOW sensitivity"
    ax.set_title(
        f"Persona Inference Sensitivity  [{sensitivity_label}  ΔDTFS={dtfs_range:.1f}%]",
        color="#e0e0e0", fontsize=9
    )

    # Annotate best
    if best in labels:
        best_idx = labels.index(best)
        ax.annotate("best", xy=(best_idx, sim_vals[best_idx] + 3),
                    ha="center", color="#27ae60", fontsize=8)

    ax.grid(True, axis="y", alpha=0.3)
    for spine in ax.spines.values():
        spine.set_edgecolor("#e0e0e0")
    ax.tick_params(colors="#e0e0e0", labelsize=7)

    if standalone:
        plt.tight_layout()


# ── Plot 11: Polarization trajectory ──────────────────────────────────────────

def plot_polarization_trajectory(exp_dir: Path, ax=None):
    """PI over cycles with a vertical marker at the detected phase transition."""
    summary_path = exp_dir / "polarization_summary.json"
    standalone = ax is None
    if standalone:
        fig, ax = plt.subplots(figsize=(10, 4), facecolor="#1a1a2e")
        ax.set_facecolor("#16213e")

    if not summary_path.exists():
        ax.text(0.5, 0.5, "No polarization_summary.json", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Polarization Index Trajectory", color="#e0e0e0", fontsize=10)
        return

    summary = json.loads(summary_path.read_text())
    traj    = summary.get("piTrajectory", [])
    if not traj:
        ax.text(0.5, 0.5, "Empty PI trajectory", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Polarization Index Trajectory", color="#e0e0e0", fontsize=10)
        return

    cycles = list(range(1, len(traj) + 1))
    ax.plot(cycles, traj, color="#9b59b6", linewidth=2.0, marker="o", markersize=5, label="PI")

    transitions = summary.get("transitions", {})
    tc = transitions.get("transitionCycle")
    if tc and transitions.get("isSignificant"):
        ax.axvline(x=tc, color="#e74c3c", linestyle="--", linewidth=1.5,
                   label=f"Phase transition (c={tc})")
        ax.annotate(
            f"ΔPI={transitions['jumpMagnitude']:.3f}",
            xy=(tc, traj[min(tc - 1, len(traj) - 1)]),
            xytext=(tc + 0.3, traj[min(tc - 1, len(traj) - 1)] + 0.05),
            color="#e74c3c", fontsize=7,
        )

    ax.set_xlabel("Cycle", color="#e0e0e0", fontsize=9)
    ax.set_ylabel("Polarization Index", color="#e0e0e0", fontsize=9)
    ax.set_ylim(0, 1)
    ax.set_xticks(cycles)
    ax.legend(fontsize=7, facecolor="#16213e", labelcolor="#e0e0e0")
    ax.set_title("Polarization Index Trajectory", color="#e0e0e0", fontsize=10)
    ax.grid(True, alpha=0.3)
    for spine in ax.spines.values():
        spine.set_edgecolor("#e0e0e0")

    if standalone:
        plt.tight_layout()


# ── Plot 12: Opinion distribution evolution ────────────────────────────────────

def plot_opinion_evolution(exp_dir: Path, ax=None):
    """Stacked histogram of belief confidence at key cycle snapshots."""
    summary_path = exp_dir / "polarization_summary.json"
    standalone = ax is None
    if standalone:
        fig, ax = plt.subplots(figsize=(10, 4), facecolor="#1a1a2e")
        ax.set_facecolor("#16213e")

    if not summary_path.exists():
        ax.text(0.5, 0.5, "No polarization_summary.json", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Opinion Distribution Evolution", color="#e0e0e0", fontsize=10)
        return

    summary   = json.loads(summary_path.read_text())
    snapshots = summary.get("snapshots", [])
    if not snapshots:
        ax.text(0.5, 0.5, "No snapshots in summary", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Opinion Distribution Evolution", color="#e0e0e0", fontsize=10)
        return

    # Pick up to 4 evenly-spaced snapshots
    indices = sorted(set([
        0,
        len(snapshots) // 3,
        2 * len(snapshots) // 3,
        len(snapshots) - 1,
    ]))
    palette = ["#3498db", "#e67e22", "#9b59b6", "#e74c3c"]
    bins_x  = [i / 10 for i in range(11)]

    for color_idx, snap_idx in enumerate(indices):
        snap = snapshots[snap_idx]
        hist = snap.get("clusters", {}).get("histogram", [])
        if not hist:
            continue
        cycle = snap.get("cycle", snap_idx + 1)
        centers = [(i + 0.5) / 10 for i in range(len(hist))]
        ax.plot(centers, hist, color=palette[color_idx % len(palette)],
                linewidth=1.5, marker=".", markersize=4, label=f"Cycle {cycle}")

    ax.set_xlabel("Belief Confidence", color="#e0e0e0", fontsize=9)
    ax.set_ylabel("Node Count", color="#e0e0e0", fontsize=9)
    ax.legend(fontsize=7, facecolor="#16213e", labelcolor="#e0e0e0")
    ax.set_title("Opinion Distribution Evolution", color="#e0e0e0", fontsize=10)
    ax.grid(True, alpha=0.3)
    for spine in ax.spines.values():
        spine.set_edgecolor("#e0e0e0")

    if standalone:
        plt.tight_layout()


# ── Plot 13: Trust network evolution (4 sub-panels) ───────────────────────────

def plot_trust_network_evolution(exp_dir: Path, ax=None):
    """4-panel trust network snapshots at selected cycles.
    Shows edges coloured by trust (green=high, red=low)."""
    summary_path = exp_dir / "polarization_summary.json"
    standalone = ax is None
    if standalone:
        fig, ax = plt.subplots(figsize=(12, 5), facecolor="#1a1a2e")
        ax.set_facecolor("#16213e")

    if not summary_path.exists():
        ax.text(0.5, 0.5, "No polarization_summary.json", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Trust Network Evolution", color="#e0e0e0", fontsize=10)
        return

    summary   = json.loads(summary_path.read_text())
    snapshots = summary.get("snapshots", [])

    if not snapshots:
        ax.text(0.5, 0.5, "No snapshots", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Trust Network Evolution", color="#e0e0e0", fontsize=10)
        return

    # Show trust mean/variance evolution as a compact line chart
    cycles     = [s.get("cycle", i + 1) for i, s in enumerate(snapshots)]
    means      = [s.get("trustStats", {}).get("mean", 0)     for s in snapshots]
    variances  = [s.get("trustStats", {}).get("variance", 0) for s in snapshots]
    broken_frac = [s.get("trustStats", {}).get("fractionBroken", 0) for s in snapshots]

    ax.plot(cycles, means,       color="#27ae60", linewidth=2, marker="o", markersize=4, label="Mean trust")
    ax.plot(cycles, variances,   color="#e67e22", linewidth=1.5, linestyle="--", marker="s", markersize=3, label="Variance")
    ax.plot(cycles, broken_frac, color="#e74c3c", linewidth=1.5, linestyle=":", marker="^", markersize=3, label="Broken edges (<0.2)")

    ax.set_xlabel("Cycle", color="#e0e0e0", fontsize=9)
    ax.set_ylabel("Trust metric", color="#e0e0e0", fontsize=9)
    ax.set_ylim(0, 1)
    ax.set_xticks(cycles)
    ax.legend(fontsize=7, facecolor="#16213e", labelcolor="#e0e0e0")
    ax.set_title("Trust Network Evolution", color="#e0e0e0", fontsize=10)
    ax.grid(True, alpha=0.3)
    for spine in ax.spines.values():
        spine.set_edgecolor("#e0e0e0")

    if standalone:
        plt.tight_layout()


# ── Plot 14: Phase diagram (ideology × expert → final PI) ─────────────────────

def plot_phase_diagram(exp_dir: Path, ax=None):
    """Contour/heat map of final PI as a function of ideology and expert fractions."""
    pd_path  = exp_dir / "phase_diagram.json"
    standalone = ax is None
    if standalone:
        fig, ax = plt.subplots(figsize=(7, 6), facecolor="#1a1a2e")
        ax.set_facecolor("#16213e")

    if not pd_path.exists():
        ax.text(0.5, 0.5, "No phase_diagram.json", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Phase Diagram (ideology × expert → PI)", color="#e0e0e0", fontsize=10)
        return

    pd = json.loads(pd_path.read_text())
    results = pd.get("results", [])
    if not results:
        ax.text(0.5, 0.5, "No data points", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Phase Diagram", color="#e0e0e0", fontsize=10)
        return

    ideology_vals = sorted(set(r["ideologyFrac"] for r in results))
    expert_vals   = sorted(set(r["expertFrac"]   for r in results))

    grid = np.full((len(expert_vals), len(ideology_vals)), np.nan)
    for r in results:
        xi = ideology_vals.index(r["ideologyFrac"])
        yi = expert_vals.index(r["expertFrac"])
        grid[yi, xi] = r["finalPI"]

    cmap = LinearSegmentedColormap.from_list("polar", ["#2ecc71", "#e67e22", "#e74c3c"], N=256)
    im   = ax.imshow(grid, origin="lower", aspect="auto", cmap=cmap, vmin=0, vmax=1,
                     extent=[0, len(ideology_vals), 0, len(expert_vals)])

    ax.set_xticks(np.arange(len(ideology_vals)) + 0.5)
    ax.set_xticklabels([f"{v:.1f}" for v in ideology_vals], rotation=45, fontsize=7)
    ax.set_yticks(np.arange(len(expert_vals)) + 0.5)
    ax.set_yticklabels([f"{v:.1f}" for v in expert_vals], fontsize=7)
    ax.set_xlabel("Ideology fraction", color="#e0e0e0", fontsize=9)
    ax.set_ylabel("Expert fraction", color="#e0e0e0", fontsize=9)
    ax.set_title("Phase Diagram (ideology × expert → PI)", color="#e0e0e0", fontsize=10)

    cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label("Final PI", color="#e0e0e0", fontsize=8)
    cbar.ax.yaxis.set_tick_params(color="#e0e0e0")
    plt.setp(cbar.ax.yaxis.get_ticklabels(), color="#e0e0e0", fontsize=7)

    for spine in ax.spines.values():
        spine.set_edgecolor("#e0e0e0")

    if standalone:
        plt.tight_layout()


# ── Plot 15: Intervention timing ───────────────────────────────────────────────

def plot_intervention_window(exp_dir: Path, ax=None):
    """Final PI vs expert-bridge injection cycle (lower = better intervention)."""
    int_path  = exp_dir / "intervention_results.json"
    standalone = ax is None
    if standalone:
        fig, ax = plt.subplots(figsize=(8, 4), facecolor="#1a1a2e")
        ax.set_facecolor("#16213e")

    if not int_path.exists():
        ax.text(0.5, 0.5, "No intervention_results.json", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Intervention Timing Effectiveness", color="#e0e0e0", fontsize=10)
        return

    data    = json.loads(int_path.read_text())
    results = data.get("results", [])
    if not results:
        ax.text(0.5, 0.5, "No results", ha="center", va="center",
                transform=ax.transAxes, color="#e0e0e0", fontsize=9)
        ax.set_title("Intervention Timing Effectiveness", color="#e0e0e0", fontsize=10)
        return

    labels    = [r.get("label", str(r.get("interventionCycle"))) for r in results]
    final_pis = [r.get("finalPI", 0) for r in results]

    # Colour baseline differently
    colors = ["#7f8c8d" if r.get("interventionCycle") is None else "#27ae60" for r in results]

    x = np.arange(len(labels))
    ax.bar(x, final_pis, color=colors, alpha=0.85)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=30, ha="right", fontsize=7)
    ax.set_ylabel("Final Polarization Index", color="#e0e0e0", fontsize=9)
    ax.set_ylim(0, 1)
    ax.set_title("Intervention Timing Effectiveness", color="#e0e0e0", fontsize=10)
    ax.grid(True, axis="y", alpha=0.3)
    for spine in ax.spines.values():
        spine.set_edgecolor("#e0e0e0")
    ax.tick_params(colors="#e0e0e0", labelsize=7)

    if standalone:
        plt.tight_layout()


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

def build_dashboard(meta, topology, persona_map, nodes_data, exp_dir, out_dir):
    with plt.style.context(PLOT_STYLE):
        fig = plt.figure(figsize=(22, 34), facecolor="#1a1a2e")
        gs = gridspec.GridSpec(
            7, 2,
            figure=fig,
            hspace=0.50,
            wspace=0.32,
            height_ratios=[0.5, 1.7, 1.3, 1.3, 1.3, 1.3, 1.3],
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

        # Row 4 — network evolution (left) + opinion dynamics (right)
        ax_ne = fig.add_subplot(gs[4, 0])
        ax_ne.set_facecolor("#16213e")
        plot_network_evolution(meta, topology, persona_map, ax_ne)

        ax_od = fig.add_subplot(gs[4, 1])
        ax_od.set_facecolor("#16213e")
        plot_opinion_dynamics(exp_dir, meta, ax_od)

        # Row 5 — institutional trust (left) + empty / future (right)
        ax_it = fig.add_subplot(gs[5, 0])
        ax_it.set_facecolor("#16213e")
        plot_institutional_trust(exp_dir, ax_it)

        ax_bot = fig.add_subplot(gs[5, 1])
        ax_bot.set_facecolor("#16213e")
        plot_bot_impact(exp_dir, ax_bot)

        # Row 6 — IFD decomposition (left) + IFD simplex (right)
        ax_ifd = fig.add_subplot(gs[6, 0])
        ax_ifd.set_facecolor("#16213e")
        plot_ifd_decomposition(exp_dir, ax_ifd)

        ax_simplex = fig.add_subplot(gs[6, 1])
        ax_simplex.set_facecolor("#16213e")
        plot_ifd_simplex(exp_dir, ax_simplex)

        out_path = out_dir / "dashboard.png"
        fig.savefig(out_path, dpi=150, bbox_inches="tight",
                    facecolor=fig.get_facecolor())
        plt.close(fig)
        print(f"  Saved: {out_path}")

# ── Plot 20: IFD decomposition stacked area ───────────────────────────────────

def plot_ifd_decomposition(exp_dir: Path, ax=None):
    """Stacked-area chart of mean CR / MR / IR over ticks + CMS secondary line."""
    standalone = ax is None
    if standalone:
        with plt.style.context(PLOT_STYLE):
            fig, ax = plt.subplots(figsize=(10, 5), facecolor="#1a1a2e")

    results_files = sorted(Path(exp_dir).glob("results_*.json"))
    if not results_files:
        ax.text(0.5, 0.5, "No results data found", ha="center", va="center",
                transform=ax.transAxes, color="#888", fontsize=10)
        if standalone:
            plt.tight_layout()
        return

    # Use first article's IFD trajectory
    data = json.loads(results_files[0].read_text(encoding="utf-8"))
    trajectory = data.get("metrics", {}).get("ifdOverTime", [])

    if not trajectory:
        ax.text(0.5, 0.5, "IFD data not present\n(run includes pre-IFD results)",
                ha="center", va="center", transform=ax.transAxes, color="#888", fontsize=9)
        if standalone:
            plt.tight_layout()
        return

    ticks   = [t["tick"]   for t in trajectory]
    cr_vals = [t["meanCR"] for t in trajectory]
    mr_vals = [t["meanMR"] for t in trajectory]
    ir_vals = [t["meanIR"] for t in trajectory]
    cms_vals = [t.get("meanCMS", 0) for t in trajectory]

    ax.set_facecolor("#16213e")
    ax.stackplot(
        ticks, cr_vals, mr_vals, ir_vals,
        labels=["Correct (CR)", "Missing (MR)", "Incorrect (IR)"],
        colors=["#27ae60", "#f39c12", "#e74c3c"],
        alpha=0.82,
    )

    # CMS on secondary axis — ratio of incorrect to correct
    ax2 = ax.twinx()
    ax2.set_facecolor("#16213e")
    ax2.plot(ticks, cms_vals, color="#9b59b6", lw=2, linestyle="--",
             label="CMS (distortion ratio)")
    ax2.set_ylabel("CMS", color="#9b59b6", fontsize=9)
    ax2.tick_params(colors="#9b59b6", labelsize=8)
    ax2.set_ylim(bottom=0)

    ax.set_xlabel("Tick", color="#e0e0e0", fontsize=9)
    ax.set_ylabel("Proportion of information", color="#e0e0e0", fontsize=9)
    ax.set_ylim(0, 1)
    ax.set_xlim(min(ticks), max(ticks))

    article_id = results_files[0].stem.replace("results_", "")
    ax.set_title(f"Information Fidelity Decomposition — {article_id}",
                 color="#e0e0e0", fontsize=10)

    lines1, labels1 = ax.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax.legend(lines1 + lines2, labels1 + labels2,
              loc="lower left", fontsize=7,
              facecolor="#16213e", edgecolor="#444", labelcolor="#e0e0e0")

    ax.tick_params(colors="#e0e0e0", labelsize=8)
    for spine in ax.spines.values():
        spine.set_edgecolor("#444")

    if standalone:
        plt.tight_layout()


# ── Plot 21: IFD ternary simplex ──────────────────────────────────────────────

def _ternary_coords(cr, mr, ir):
    """Project (CR, MR, IR) on the 2-simplex to 2-D Cartesian.
    Vertices: CR=1 at top (0.5, √3/2), MR=1 bottom-left (0,0), IR=1 bottom-right (1,0).
    """
    import numpy as np
    total = cr + mr + ir
    if total == 0:
        return 0.5, np.sqrt(3) / 6   # centroid
    cr, mr, ir = cr / total, mr / total, ir / total
    x = 0.5 * cr + ir
    y = (np.sqrt(3) / 2) * cr
    return x, y


def plot_ifd_simplex(exp_dir: Path, ax=None):
    """Ternary simplex: per-tick fidelity trajectory + per-persona scatter."""
    import numpy as np

    standalone = ax is None
    if standalone:
        with plt.style.context(PLOT_STYLE):
            fig, ax = plt.subplots(figsize=(7, 7), facecolor="#1a1a2e")

    results_files = sorted(Path(exp_dir).glob("results_*.json"))
    if not results_files:
        ax.text(0.5, 0.5, "No results data found", ha="center", va="center",
                transform=ax.transAxes, color="#888", fontsize=10)
        if standalone:
            plt.tight_layout()
        return

    data = json.loads(results_files[0].read_text(encoding="utf-8"))
    trajectory  = data.get("metrics", {}).get("ifdOverTime", [])
    persona_ifd = data.get("metrics", {}).get("personaIFD", [])

    if not trajectory and not persona_ifd:
        ax.text(0.5, 0.5, "IFD data not present\n(run includes pre-IFD results)",
                ha="center", va="center", transform=ax.transAxes, color="#888", fontsize=9)
        if standalone:
            plt.tight_layout()
        return

    ax.set_facecolor("#16213e")
    ax.set_aspect("equal")
    ax.axis("off")

    # Draw simplex triangle
    h = np.sqrt(3) / 2
    triangle = plt.Polygon(
        [[0.5, h], [0, 0], [1, 0]],
        fill=False, edgecolor="#e0e0e0", linewidth=1.5, zorder=2,
    )
    ax.add_patch(triangle)

    # Draw faint gridlines at 1/3 and 2/3 from each vertex
    for alpha in [1/3, 2/3]:
        # Lines parallel to each edge at given fraction
        p1 = np.array(_ternary_coords(alpha, 1 - alpha, 0))
        p2 = np.array(_ternary_coords(alpha, 0, 1 - alpha))
        ax.plot(*zip(p1, p2), color="#444", lw=0.6, zorder=1)
        p3 = np.array(_ternary_coords(1 - alpha, alpha, 0))
        p4 = np.array(_ternary_coords(0, alpha, 1 - alpha))
        ax.plot(*zip(p3, p4), color="#444", lw=0.6, zorder=1)
        p5 = np.array(_ternary_coords(1 - alpha, 0, alpha))
        p6 = np.array(_ternary_coords(0, 1 - alpha, alpha))
        ax.plot(*zip(p5, p6), color="#444", lw=0.6, zorder=1)

    # Vertex labels
    ax.text(0.5,  h + 0.07, "CORRECT\n(CR = 1)", ha="center", va="bottom",
            color="#27ae60", fontsize=9, fontweight="bold")
    ax.text(-0.06, -0.06, "MISSING\n(MR = 1)", ha="center", va="top",
            color="#f39c12", fontsize=9, fontweight="bold")
    ax.text(1.06, -0.06, "INCORRECT\n(IR = 1)", ha="center", va="top",
            color="#e74c3c", fontsize=9, fontweight="bold")

    # Region label at centroid
    cx, cy = _ternary_coords(1/3, 1/3, 1/3)
    ax.text(cx, cy, "chaos\n(max entropy)", ha="center", va="center",
            color="#666", fontsize=7, alpha=0.7)

    # Per-tick trajectory
    if trajectory:
        xs = [_ternary_coords(t["meanCR"], t["meanMR"], t["meanIR"])[0] for t in trajectory]
        ys = [_ternary_coords(t["meanCR"], t["meanMR"], t["meanIR"])[1] for t in trajectory]
        cmap = plt.cm.plasma
        n = len(xs)
        for i in range(n - 1):
            frac = i / max(n - 2, 1)
            ax.annotate("", xy=(xs[i + 1], ys[i + 1]), xytext=(xs[i], ys[i]),
                        arrowprops=dict(arrowstyle="->", color=cmap(frac), lw=1.4))
        sc = ax.scatter(xs, ys, c=range(n), cmap="plasma", s=40, zorder=5, linewidths=0)
        # Label first and last
        ax.text(xs[0],  ys[0]  + 0.025, f"t={trajectory[0]['tick']}",  color="#ccc", fontsize=7, ha="center")
        ax.text(xs[-1], ys[-1] + 0.025, f"t={trajectory[-1]['tick']}", color="#ccc", fontsize=7, ha="center")

        # Colorbar for ticks
        plt.colorbar(sc, ax=ax, label="Tick", shrink=0.4, pad=0.02,
                     location="right").ax.tick_params(colors="#e0e0e0", labelsize=7)

    # Per-persona scatter
    persona_colors = {
        "politically_biased_left":  "#3498db",
        "politically_biased_right": "#e74c3c",
        "sensationalist_news":      "#e67e22",
        "neutral_news":             "#2ecc71",
        "investigative_journalist": "#1abc9c",
        "medical_expert":           "#9b59b6",
        "tech_expert":              "#34495e",
    }
    for p in persona_ifd[:12]:   # cap at 12 personas
        pid = p["personaId"]
        if p["meanCR"] is None:
            continue
        px, py = _ternary_coords(p["meanCR"], p["meanMR"], p["meanIR"])
        color = persona_colors.get(pid, "#aaa")
        ax.scatter(px, py, color=color, s=70, marker="D", zorder=6,
                   edgecolors="#fff", linewidths=0.5)
        short = pid.replace("politically_biased_", "").replace("_", " ")[:12]
        ax.text(px, py - 0.04, short, ha="center", va="top",
                color=color, fontsize=6, alpha=0.9)

    article_id = results_files[0].stem.replace("results_", "")
    ax.set_title(f"Fidelity Simplex — {article_id}", color="#e0e0e0", fontsize=10, pad=12)
    ax.set_xlim(-0.18, 1.18)
    ax.set_ylim(-0.18, h + 0.22)

    if standalone:
        plt.tight_layout()


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
    save_individual("07_network_evolution.png", plot_network_evolution,
                    meta, topology, persona_map, out_dir=out_dir)
    save_individual("08_opinion_dynamics.png", plot_opinion_dynamics,
                    exp_dir, meta, out_dir=out_dir)
    save_individual("09_institutional_trust.png", plot_institutional_trust,
                    exp_dir, out_dir=out_dir)
    save_individual("10_bot_impact.png", plot_bot_impact,
                    exp_dir, out_dir=out_dir)
    save_individual("16_cascade_comparison.png", plot_cascade_comparison,
                    exp_dir, out_dir=out_dir)
    save_individual("17_distribution_match.png", plot_distribution_match,
                    exp_dir, out_dir=out_dir)
    save_individual("18_content_drift.png", plot_content_drift,
                    exp_dir, out_dir=out_dir)
    save_individual("19_sensitivity_analysis.png", plot_sensitivity_analysis,
                    exp_dir, out_dir=out_dir)
    save_individual("11_polarization_trajectory.png", plot_polarization_trajectory,
                    exp_dir, out_dir=out_dir)
    save_individual("12_opinion_evolution.png", plot_opinion_evolution,
                    exp_dir, out_dir=out_dir)
    save_individual("13_trust_network_evolution.png", plot_trust_network_evolution,
                    exp_dir, out_dir=out_dir)
    save_individual("14_phase_diagram.png", plot_phase_diagram,
                    exp_dir, out_dir=out_dir)
    save_individual("15_intervention_window.png", plot_intervention_window,
                    exp_dir, out_dir=out_dir)
    save_individual("20_ifd_decomposition.png", plot_ifd_decomposition,
                    exp_dir, out_dir=out_dir)
    save_individual("21_ifd_simplex.png", plot_ifd_simplex,
                    exp_dir, out_dir=out_dir)

    # Dashboard
    print("  Building dashboard…")
    build_dashboard(meta, topology, persona_map, nodes_data, exp_dir, out_dir)

    print(f"\nDone. All images in: {out_dir.resolve()}")


if __name__ == "__main__":
    main()
