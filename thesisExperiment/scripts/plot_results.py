"""Thesis-sized plots from thesisExperiment/results/summary.json + heatmaps.json."""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SUMMARY = ROOT / "results" / "summary.json"
HEAT = ROOT / "results" / "heatmaps.json"
OUT = ROOT / "results" / "figures"
OUT.mkdir(parents=True, exist_ok=True)

CAPTIONS = {}


def save(fig, name: str, caption: str) -> None:
    path = OUT / name
    fig.tight_layout()
    fig.savefig(path, dpi=160, bbox_inches="tight")
    plt.close(fig)
    CAPTIONS[name] = caption
    print(f"Wrote {path}")


def methods_diagram() -> None:
    fig, ax = plt.subplots(figsize=(11, 3.2))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 3)
    ax.axis("off")
    boxes = [
        (0.2, 1.2, "Seed article\n(climate / geoeng\n+ 5 GT questions)"),
        (2.6, 1.2, "Node rewrite\n(persona prompt\ngpt-4o-mini)"),
        (5.0, 1.2, "Forward to next\n(chain) or neighbours\n(SF / ER / echo)"),
        (7.4, 1.2, "Auditor IFD\n5 items: +1/0/−1\nMI & MPR"),
        (9.6, 1.2, "k* if mean MI>3\nand no recovery"),
    ]
    for x, y, t in boxes:
        ax.add_patch(plt.Rectangle((x, y), 2.1, 1.4, fill=True, facecolor="#eef3f8", edgecolor="#333"))
        ax.text(x + 1.05, y + 0.7, t, ha="center", va="center", fontsize=8)
    for x in (2.3, 4.7, 7.1, 9.5):
        ax.annotate("", xy=(x + 0.28, 1.9), xytext=(x - 0.05, 1.9), arrowprops=dict(arrowstyle="->"))
    ax.set_title("Climate campaign loop (not CIKM crime heatmap)")
    save(
        fig,
        "00_methods_chain_auditor.png",
        "Figure 0. Methods schematic for the climate-firestorm campaign: a ground-truth article is rewritten by a persona-conditioned gpt-4o-mini node, forwarded along a linear chain or graph, then scored by the discrete IFD auditor (five yes/no items). Network k* is the first irreversible crossing of mean MI>3.",
    )


def heatmap(ax, spec, title, cmap="magma", vmin=0, vmax=5):
    mat = np.array(spec.get("matrix") or [], dtype=float)
    if mat.size == 0:
        ax.set_title(title + " (empty)")
        return
    mat = np.ma.masked_invalid(mat)
    im = ax.imshow(mat, aspect="auto", cmap=cmap, vmin=vmin, vmax=vmax)
    ax.set_xticks(range(len(spec["cols"])))
    ax.set_xticklabels(spec["cols"], rotation=55, ha="right", fontsize=7)
    ax.set_yticks(range(len(spec["rows"])))
    ylabels = [str(y).replace("homogeneous:", "").replace("heterogeneous:", "") for y in spec["rows"]]
    ax.set_yticklabels(ylabels, fontsize=7)
    ax.set_title(title, fontsize=10)
    fig = ax.figure
    fig.colorbar(im, ax=ax, fraction=0.03)


def main() -> None:
    methods_diagram()
    if not SUMMARY.exists():
        raise SystemExit("No summary.json — run parse_results.js first")
    data = json.loads(SUMMARY.read_text(encoding="utf-8"))
    heat = json.loads(HEAT.read_text(encoding="utf-8")) if HEAT.exists() else {}
    rows = data.get("rows") or []

    # Fig 01 H MPR heatmap
    fig, ax = plt.subplots(figsize=(12, 7))
    heatmap(ax, heat.get("H_meanMPR") or {}, "Exp H: mean node MPR (persona × article)", vmax=5)
    save(
        fig,
        "01_H_heatmap_mpr.png",
        "Figure 1. Homogeneous linear-chain mean node MPR by persona (rows) and article (columns). MI/MPR on the 0–5 IFD scale; values near 5 indicate answers that systematically contradict ground truth.",
    )

    fig, ax = plt.subplots(figsize=(12, 7))
    heatmap(ax, heat.get("H_maxMI") or {}, "Exp H: max event MI (persona × article)", vmax=5)
    save(
        fig,
        "02_H_heatmap_maxmi.png",
        "Figure 2. Homogeneous chains: maximum event misinformation index (MI) per persona × article cell.",
    )

    fig, ax = plt.subplots(figsize=(12, 7))
    heatmap(ax, heat.get("H_kStar") or {}, "Exp H: k* hop/tick (grey-ish 0 = none)", cmap="coolwarm", vmin=0, vmax=8)
    save(
        fig,
        "03_H_heatmap_kstar.png",
        "Figure 3. Homogeneous chains: k* (first irreversible network-mean MI>3). Empty/NaN cells did not cross propaganda without recovery.",
    )

    fig, ax = plt.subplots(figsize=(12, 7))
    heatmap(ax, heat.get("He_meanMPR") or {}, "Exp He: mean node MPR (mix × article)", vmax=5)
    save(
        fig,
        "04_He_heatmap_mpr.png",
        "Figure 4. Heterogeneous linear chains: mean node MPR by mix identifier and article.",
    )

    fig, ax = plt.subplots(figsize=(12, 7))
    heatmap(ax, heat.get("He_maxMI") or {}, "Exp He: max event MI (mix × article)", vmax=5)
    save(
        fig,
        "05_He_heatmap_maxmi.png",
        "Figure 5. Heterogeneous chains: maximum event MI by mix × article.",
    )

    a_rows = [r for r in rows if r.get("experiment") == "A"]
    if a_rows:
        fig, ax = plt.subplots(figsize=(11, 5.5))
        labels = [f"{r['experimentName']}\n{r['articleId']}" for r in a_rows]
        x = np.arange(len(a_rows))
        ax.bar(x - 0.2, [r.get("maxEventMI") or 0 for r in a_rows], 0.4, label="max event MI")
        ax.bar(x + 0.2, [r.get("meanNodeMPR") or 0 for r in a_rows], 0.4, label="mean MPR")
        ax.axhline(3, color="#b00020", ls="--", lw=0.8, label="MI=3 propaganda")
        ax.set_xticks(x)
        ax.set_xticklabels(labels, rotation=40, ha="right", fontsize=7)
        ax.set_ylabel("MI / MPR")
        ax.set_title("Exp A: topology × mix × article")
        ax.legend(fontsize=8)
        save(
            fig,
            "06_A_mi_mpr_topology.png",
            "Figure 6. Proposal Experiment A: max event MI and mean node MPR across scale-free vs ER and homogeneous conspiracy vs mixed BPs, on the 6-article graph subset.",
        )

        fig, ax = plt.subplots(figsize=(11, 4.8))
        kplot = [r.get("kStar_network") if r.get("kStar_network") is not None else 0 for r in a_rows]
        colors = ["#1f77b4" if r.get("kStar_network") is not None else "#cccccc" for r in a_rows]
        ax.bar(x, kplot, color=colors)
        ax.set_xticks(x)
        ax.set_xticklabels(labels, rotation=40, ha="right", fontsize=7)
        ax.set_ylabel("k* tick (0 = none)")
        ax.set_title("Exp A: k* (grey = no irreversible network propaganda)")
        save(
            fig,
            "07_A_kstar.png",
            "Figure 7. Experiment A k*: first tick where network-mean MI>3 and does not recover. Grey bars: no irreversible crossing.",
        )

        fig, ax = plt.subplots(figsize=(10, 5))
        heatmap(ax, heat.get("A_meanMPR") or {}, "Exp A: mean MPR (cell × article)", vmax=5)
        save(
            fig,
            "08_A_heatmap_mpr.png",
            "Figure 8. Experiment A mean node MPR heatmap (graph cell × article).",
        )

    b_rows = [r for r in rows if r.get("bRecovery")]
    if b_rows:
        fig, ax = plt.subplots(figsize=(8, 4.6))
        xb = np.arange(len(b_rows))
        before = np.array([((r.get("bRecovery") or {}).get("beforeMean") or 0) for r in b_rows], dtype=float)
        after = np.array([((r.get("bRecovery") or {}).get("afterMean") or 0) for r in b_rows], dtype=float)
        ax.bar(xb - 0.2, before, 0.4, label="mean MI before fact-check")
        ax.bar(xb + 0.2, after, 0.4, label="mean MI after fact-check")
        ax.axhline(3, color="#b00020", ls="--", lw=0.8)
        ax.set_xticks(xb)
        ax.set_xticklabels([r.get("experimentName") for r in b_rows], rotation=15)
        ax.set_ylabel("mean event MI")
        ax.set_title("Exp B: MI before vs after fact_checker_injection")
        ax.legend(fontsize=8)
        save(
            fig,
            "09_B_before_after.png",
            "Figure 9. Experiment B: mean event MI before vs after fact-check injection at n∈{1,3,5}. Late-tick cascade volume can confound a naive before/after mean.",
        )

    echo_rows = [r for r in rows if r.get("topology") != "linear_chain"]
    if echo_rows:
        fig, ax = plt.subplots(figsize=(11, 5))
        xe = np.arange(len(echo_rows))
        ax.bar(xe - 0.2, [(r.get("echo") or {}).get("edgeHomophily") or 0 for r in echo_rows], 0.4, label="edge homophily")
        ax.bar(
            xe + 0.2,
            [(r.get("echo") or {}).get("modularityConspiracy") or 0 for r in echo_rows],
            0.4,
            label="conspiracy-cut modularity",
        )
        ax.set_xticks(xe)
        ax.set_xticklabels([f"{r['experimentName']}\n{r['articleId']}" for r in echo_rows], rotation=40, ha="right", fontsize=6)
        ax.set_title("Pfeffer information echo: homophily and modularity")
        ax.legend(fontsize=8)
        save(
            fig,
            "10_echo_modularity.png",
            "Figure 10. Operationalised Pfeffer information-echo: edge homophily and conspiracy-cut modularity on graph experiments (A/B/D).",
        )

    # hop curves for H
    h_rows = [r for r in rows if r.get("experiment") == "H" and r.get("hopMI")]
    if h_rows:
        fig, ax = plt.subplots(figsize=(9, 5))
        by_persona = {}
        for r in h_rows:
            pid = str(r.get("bpMix") or "").replace("homogeneous:", "")
            for pt in r["hopMI"]:
                by_persona.setdefault(pid, {}).setdefault(pt["hop"], []).append(pt["meanMI"])
        for pid, hops in sorted(by_persona.items()):
            xs = sorted(hops)
            ys = [float(np.mean(hops[h])) for h in xs]
            ax.plot(xs, ys, marker="o", linewidth=1, label=pid, markersize=3)
        ax.axhline(3, color="#b00020", ls="--", lw=0.8)
        ax.set_xlabel("hop")
        ax.set_ylabel("mean MI")
        ax.set_title("Exp H: hop-wise mean MI (average over articles)")
        ax.legend(fontsize=6, ncol=2, loc="upper left")
        save(
            fig,
            "11_H_hop_mi.png",
            "Figure 11. Homogeneous chains: mean MI versus hop, averaged across articles, by persona. The dashed line is the propaganda threshold (MI>3).",
        )

    he_rows = [r for r in rows if r.get("experiment") == "He" and r.get("hopMI")]
    if he_rows:
        fig, ax = plt.subplots(figsize=(9, 5))
        acc = {}
        for r in he_rows:
            for pt in r["hopMI"]:
                acc.setdefault(pt["hop"], []).append(pt["meanMI"])
        xs = sorted(acc)
        ys = [float(np.mean(acc[h])) for h in xs]
        ysd = [float(np.std(acc[h])) for h in xs]
        ax.plot(xs, ys, marker="o", label="He mean MI")
        ax.fill_between(xs, np.array(ys) - np.array(ysd), np.array(ys) + np.array(ysd), alpha=0.2)
        hacc = {}
        for r in h_rows:
            for pt in r.get("hopMI") or []:
                hacc.setdefault(pt["hop"], []).append(pt["meanMI"])
        if hacc:
            hxs = sorted(hacc)
            hys = [float(np.mean(hacc[h])) for h in hxs]
            ax.plot(hxs, hys, marker="s", label="H mean MI")
        ax.axhline(3, color="#b00020", ls="--", lw=0.8)
        ax.set_xlabel("hop")
        ax.set_ylabel("mean MI")
        ax.set_title("H vs He: hop-wise mean MI")
        ax.legend()
        save(
            fig,
            "12_H_vs_He_hop_mi.png",
            "Figure 12. Mean hop-wise MI for homogeneous (H) versus heterogeneous (He) chains, pooled over personas/mixes and articles. Shaded region is ±1 SD across He cells.",
        )

    # usage
    usage = data.get("llmUsage") or []
    if usage:
        fig, ax = plt.subplots(figsize=(10, 4.5))
        names = [u.get("experimentName") for u in usage]
        calls = [u.get("calls") or 0 for u in usage]
        ax.bar(range(len(names)), calls)
        ax.set_xticks(range(len(names)))
        ax.set_xticklabels(names, rotation=55, ha="right", fontsize=6)
        ax.set_ylabel("LLM calls")
        ax.set_title(f"API volume (total calls={data.get('llmUsageTotals', {}).get('calls')}, est USD={data.get('llmUsageTotals', {}).get('estimatedUsd')})")
        save(
            fig,
            "13_llm_calls.png",
            "Figure 13. gpt-4o-mini call counts per run. Cost is a list-price heuristic from returned usage, not an invoice.",
        )

    # Exp C distortion stacked (keyword heuristic)
    dist_types = [
        "spraying_chemtrails",
        "weather_haarp",
        "weaponization",
        "depopulation",
        "climate_justice_hijack",
        "antivax_spillover",
    ]
    dist_rows = [r for r in rows if (r.get("distortionHeuristic") or {}).get("nTexts")]
    if dist_rows:
        fig, ax = plt.subplots(figsize=(11, 5))
        labels = [f"{r['experimentName'][:18]}\n{r['articleId'][:16]}" for r in dist_rows[:24]]
        x = np.arange(len(labels))
        bottom = np.zeros(len(labels))
        for t in dist_types:
            vals = np.array([((r.get("distortionHeuristic") or {}).get("counts") or {}).get(t, 0) for r in dist_rows[:24]], dtype=float)
            ax.bar(x, vals, bottom=bottom, label=t)
            bottom = bottom + vals
        ax.set_xticks(x)
        ax.set_xticklabels(labels, rotation=40, ha="right", fontsize=6)
        ax.set_ylabel("keyword hits")
        ax.set_title("Exp C heuristic distortion markers (not a trained classifier)")
        ax.legend(fontsize=7, ncol=2)
        save(
            fig,
            "14_C_distortion_stack.png",
            "Figure 14. Experiment C: keyword hits for six Debnath-linked distortion types on rewrite text. Heuristic only; not a trained classifier and not HDBSCAN labels.",
        )

    # A tick trajectories
    if a_rows:
        fig, ax = plt.subplots(figsize=(9, 5))
        for r in a_rows:
            series = r.get("networkMIOverTime") or []
            if not series:
                continue
            xs = [p.get("tick") for p in series]
            ys = [p.get("meanMI") or 0 for p in series]
            ax.plot(xs, ys, marker="o", markersize=3, linewidth=1, label=f"{r['experimentName']}:{r['articleId'][:12]}")
        ax.axhline(3, color="#b00020", ls="--", lw=0.8)
        ax.set_xlabel("tick")
        ax.set_ylabel("network-mean MI")
        ax.set_title("Exp A: MI trajectories")
        ax.legend(fontsize=5, ncol=2)
        save(
            fig,
            "15_A_mi_trajectories.png",
            "Figure 15. Experiment A network-mean MI over ticks by cell×article. Dashed line: propaganda threshold MI>3 used for k*.",
        )
    cap_path = OUT / "captions.json"
    cap_path.write_text(json.dumps(CAPTIONS, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {cap_path} ({len(CAPTIONS)} figures)")


if __name__ == "__main__":
    main()
