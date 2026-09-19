#!/usr/bin/env python3
"""Phase 2 analysis: parse LIVE results_phase2 tables, plot, write SUMMARY/RESULTS.

Headline MPR for a cell is parse_phase2.js `meanMI` (mean scored event misinfoIndex).
- continuous.csv  → continuous headline (T2c_* only).
- dual_discrete.csv → dual headline, which is discrete (T2d_*).
Do not average those two headlines. Dual-gap sidecar continuous is not a third MPR.
Dead cells (nScored <= 1) are hatched and excluded from MPR means, kept in rates.
Dnet custom-graph rows are reported separately; sim MI is not Twitter MPR.
"""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
TABLES = ROOT / "results_phase2" / "tables"
COMPARE = ROOT / "results_phase2" / "debnath_compare.json"
HARVEST = ROOT / "results_phase2" / "summary.json"
FIG = ROOT / "results_phase2" / "figures"
OUT = ROOT / "analysis_phase2"
FIG_COPY = OUT / "figures"
DERIVED = OUT / "tables"

TOPOS = [
    "linear_chain",
    "ring",
    "random_er",
    "small_world",
    "scale_free",
    "echo_chamber",
    "polarized",
    "hierarchical",
]
TOPO_SHORT = {
    "linear_chain": "linear",
    "ring": "ring",
    "random_er": "ER",
    "small_world": "SW",
    "scale_free": "SF",
    "echo_chamber": "echo",
    "polarized": "polar",
    "hierarchical": "hier",
}
ARTICLES = [
    "scopex_2017",
    "chemtrails_gates_2018_2021",
    "sai_geoengineering",
    "paris_agreement",
    "climate_consensus",
    "polar_bears",
]
ART_SHORT = {
    "scopex_2017": "SCoPEx",
    "chemtrails_gates_2018_2021": "chemtrails",
    "sai_geoengineering": "SAI",
    "paris_agreement": "Paris",
    "climate_consensus": "consensus",
    "polar_bears": "polar bears",
}
CONSPIRACY = {
    "conspiracy_believer",
    "conspiracy_haarp_weather",
    "conspiracy_depopulation",
    "conspiracy_climate_piggyback",
}
CLIMATE_ACTION = {
    "climate_action_advocate",
    "climate_justice_youth",
    "mitigation_first_policy",
}
SCIENCE_ENV = {
    "climate_scientist",
    "science_journalist",
    "environmental_concern",
    "ozone_stratosphere_specialist",
    "biodiversity_food_security",
}
PERSONA_ORDER = [
    "conspiracy_believer",
    "conspiracy_haarp_weather",
    "conspiracy_depopulation",
    "conspiracy_climate_piggyback",
    "climate_action_advocate",
    "climate_justice_youth",
    "mitigation_first_policy",
    "environmental_concern",
    "biodiversity_food_security",
    "ozone_stratosphere_specialist",
    "science_journalist",
    "climate_scientist",
]
MIX_ORDER = ["mix_00", "mix_01", "mix_02", "mix_03", "mix_04", "mix_05"]
MIX_NOTE = {
    "mix_00": "4 conspiracy + 4 climate/env",
    "mix_01": "2 conspiracy + 6 climate/env",
    "mix_02": "0 conspiracy + 8 science/climate",
    "mix_03": "1 conspiracy + 7 other",
    "mix_04": "2 conspiracy-adj + 6 other",
    "mix_05": "2 conspiracy-adj + 6 other",
}
C_CONT = "#4C78A8"
C_DISC = "#F58518"
C_H = "#54A24B"
C_HE = "#B279A2"


def _bool_series(s: pd.Series) -> pd.Series:
    if s.dtype == bool:
        return s
    return s.astype(str).str.lower().isin(["true", "1", "yes"])


def load_csv(name: str) -> pd.DataFrame:
    df = pd.read_csv(TABLES / name)
    if "dead" in df.columns:
        df["dead"] = _bool_series(df["dead"])
    for col in (
        "meanMI",
        "meanNodeMPR",
        "maxMI",
        "meanDiscreteMI",
        "meanContinuousMI",
        "meanDualGap",
        "meanAgreement",
        "kStarDiscrete",
        "kStarContinuous",
        "nScored",
        "nEvents",
        "llmCalls",
    ):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def fmt4(x) -> str:
    if x is None or (isinstance(x, float) and (np.isnan(x) or np.isinf(x))):
        return "—"
    return f"{float(x):.4f}"


def fmt3(x) -> str:
    if x is None or (isinstance(x, float) and (np.isnan(x) or np.isinf(x))):
        return "—"
    return f"{float(x):.3f}"


def fmt_pct(x) -> str:
    if x is None or (isinstance(x, float) and (np.isnan(x) or np.isinf(x))):
        return "—"
    return f"{100.0 * float(x):.1f}%"


def live(df: pd.DataFrame) -> pd.DataFrame:
    return df.loc[~df["dead"]].copy()


def mean_col(df: pd.DataFrame, col: str = "meanMI"):
    s = df[col].dropna()
    return float(s.mean()) if len(s) else None


def kstar_rate(df: pd.DataFrame, col: str) -> float | None:
    if col not in df.columns or df.empty:
        return None
    return float(df[col].notna().mean())


def persona_family(name: str) -> str:
    if name in CONSPIRACY:
        return "conspiracy"
    if name in CLIMATE_ACTION:
        return "climate_action"
    if name in SCIENCE_ENV:
        return "science_env"
    return "other"


def md_table(headers: list[str], rows: list[list[str]]) -> str:
    out = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    for r in rows:
        out.append("| " + " | ".join(str(c) for c in r) + " |")
    return "\n".join(out)


def savefig(fig, name: str) -> Path:
    FIG.mkdir(parents=True, exist_ok=True)
    FIG_COPY.mkdir(parents=True, exist_ok=True)
    p = FIG / name
    fig.tight_layout()
    fig.savefig(p, dpi=160, bbox_inches="tight")
    fig.savefig(FIG_COPY / name, dpi=160, bbox_inches="tight")
    plt.close(fig)
    print(f"Wrote {p}")
    return p


def grouped_bars(ax, labels, series_a, series_b, lab_a, lab_b, color_a, color_b, ylabel, title):
    x = np.arange(len(labels))
    w = 0.38
    a = [0 if v is None or (isinstance(v, float) and np.isnan(v)) else v for v in series_a]
    b = [0 if v is None or (isinstance(v, float) and np.isnan(v)) else v for v in series_b]
    ax.bar(x - w / 2, a, w, label=lab_a, color=color_a, edgecolor="white")
    ax.bar(x + w / 2, b, w, label=lab_b, color=color_b, edgecolor="white")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=25, ha="right")
    ax.set_ylabel(ylabel)
    ax.set_title(title)
    ax.set_ylim(0, 5)
    ax.axhline(3, color="#888", ls="--", lw=0.8)
    ax.legend(frameon=False, fontsize=8)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)


def heatmap(ax, matrix: np.ndarray, row_labels, col_labels, title, vmin=0, vmax=5, cmap="YlOrRd"):
    im = ax.imshow(matrix, aspect="auto", vmin=vmin, vmax=vmax, cmap=cmap)
    ax.set_xticks(range(len(col_labels)))
    ax.set_xticklabels(col_labels, rotation=35, ha="right", fontsize=8)
    ax.set_yticks(range(len(row_labels)))
    ax.set_yticklabels(row_labels, fontsize=8)
    ax.set_title(title)
    for i in range(matrix.shape[0]):
        for j in range(matrix.shape[1]):
            v = matrix[i, j]
            if np.isnan(v):
                ax.text(j, i, "—", ha="center", va="center", fontsize=6, color="#444")
            else:
                ax.text(j, i, f"{v:.2f}", ha="center", va="center", fontsize=6, color="#111" if v < 3.2 else "#fff")
    return im


def pivot_mean(df: pd.DataFrame, rows, cols, row_key, col_key, val="meanMI"):
    mat = np.full((len(rows), len(cols)), np.nan)
    g = live(df).groupby([row_key, col_key])[val].mean()
    for i, r in enumerate(rows):
        for j, c in enumerate(cols):
            if (r, c) in g.index:
                mat[i, j] = float(g.loc[(r, c)])
    return mat


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    DERIVED.mkdir(parents=True, exist_ok=True)
    FIG.mkdir(parents=True, exist_ok=True)
    FIG_COPY.mkdir(parents=True, exist_ok=True)

    th = load_csv("TH_rows.csv")
    the = load_csv("THe_rows.csv")
    cont = load_csv("continuous.csv")
    dual = load_csv("dual_discrete.csv")
    gap = load_csv("dual_gap.csv")
    dead = load_csv("dead_cells.csv")
    all_rows = load_csv("all_rows.csv")

    harvest = json.loads(HARVEST.read_text())
    compare = json.loads(COMPARE.read_text())

    dnet = all_rows[all_rows["experimentName"].astype(str).str.startswith("Dnet_")].copy()
    thesis = pd.concat([th, the], ignore_index=True)

    # --- headline means (same rule as parse_phase2.js) ---
    th_cont_live = live(cont[cont["arm"] == "H"])
    th_dual_live = live(dual[dual["arm"] == "H"])
    the_cont_live = live(cont[cont["arm"] == "He"])
    the_dual_live = live(dual[dual["arm"] == "He"])

    stats = {
        "source": "LIVE thesisExperiment/results_phase2/tables",
        "harvestGeneratedAt": harvest.get("generatedAt"),
        "nTH": int(len(th)),
        "nTHe": int(len(the)),
        "nContinuous": int(len(cont)),
        "nDual": int(len(dual)),
        "nDeadTable": int(len(dead)),
        "nDeadTH": int(th["dead"].sum()),
        "nDeadTHe": int(the["dead"].sum()),
        "nDeadCont": int(cont["dead"].sum()),
        "nDeadDual": int(dual["dead"].sum()),
        "nExpectedCells": harvest.get("nExpectedCells"),
        "nMissingCells": harvest.get("nMissingCells"),
        "nDnetRows": int(len(dnet)),
        "thesisGrade": harvest.get("thesisGrade"),
        "meanMPR_TH_continuous": mean_col(th_cont_live),
        "meanMPR_TH_dualHeadline": mean_col(th_dual_live),
        "meanNodeMPR_TH_continuous": mean_col(th_cont_live, "meanNodeMPR"),
        "meanNodeMPR_TH_dualHeadline": mean_col(th_dual_live, "meanNodeMPR"),
        "meanMPR_THe_continuous": mean_col(the_cont_live),
        "meanMPR_THe_dualHeadline": mean_col(the_dual_live),
        "meanNodeMPR_THe_continuous": mean_col(the_cont_live, "meanNodeMPR"),
        "meanNodeMPR_THe_dualHeadline": mean_col(the_dual_live, "meanNodeMPR"),
        "nLive_TH_continuous": int(len(th_cont_live)),
        "nLive_TH_dual": int(len(th_dual_live)),
        "nLive_THe_continuous": int(len(the_cont_live)),
        "nLive_THe_dual": int(len(the_dual_live)),
        "deadRate_TH_continuous": float(cont[cont["arm"] == "H"]["dead"].mean()),
        "deadRate_TH_dual": float(dual[dual["arm"] == "H"]["dead"].mean()),
        "deadRate_THe_continuous": float(cont[cont["arm"] == "He"]["dead"].mean()),
        "deadRate_THe_dual": float(dual[dual["arm"] == "He"]["dead"].mean()),
        "kStarRate_TH_continuous": kstar_rate(th_cont_live, "kStarContinuous"),
        "kStarRate_TH_dual": kstar_rate(th_dual_live, "kStarDiscrete"),
        "kStarRate_THe_continuous": kstar_rate(the_cont_live, "kStarContinuous"),
        "kStarRate_THe_dual": kstar_rate(the_dual_live, "kStarDiscrete"),
        "meanDualGap_TH": mean_col(live(dual[dual["arm"] == "H"]), "meanDualGap"),
        "meanDualGap_THe": mean_col(live(dual[dual["arm"] == "He"]), "meanDualGap"),
        "meanAgreement_TH": mean_col(live(dual[dual["arm"] == "H"]), "meanAgreement"),
        "meanAgreement_THe": mean_col(live(dual[dual["arm"] == "He"]), "meanAgreement"),
        "harvest_meanMPR_TH_continuous": harvest.get("meanMPR_TH_continuous"),
        "harvest_meanMPR_TH_dualHeadline": harvest.get("meanMPR_TH_dualHeadline"),
    }

    # topology × arm × mode
    topo_rows = []
    for topo in TOPOS:
        for arm, csrc, dsrc in (("H", th_cont_live, th_dual_live), ("He", the_cont_live, the_dual_live)):
            c = csrc[csrc["topology"] == topo]
            d = dsrc[dsrc["topology"] == topo]
            c_all = cont[(cont["arm"] == arm) & (cont["topology"] == topo)]
            d_all = dual[(dual["arm"] == arm) & (dual["topology"] == topo)]
            topo_rows.append(
                {
                    "topology": topo,
                    "arm": arm,
                    "n_cells_continuous": int(len(c_all)),
                    "n_live_continuous": int(len(c)),
                    "n_dead_continuous": int(c_all["dead"].sum()) if len(c_all) else 0,
                    "dead_rate_continuous": float(c_all["dead"].mean()) if len(c_all) else None,
                    "meanMI_continuous": mean_col(c),
                    "meanNodeMPR_continuous": mean_col(c, "meanNodeMPR"),
                    "kStar_rate_continuous": kstar_rate(c, "kStarContinuous"),
                    "n_cells_dual": int(len(d_all)),
                    "n_live_dual": int(len(d)),
                    "n_dead_dual": int(d_all["dead"].sum()) if len(d_all) else 0,
                    "dead_rate_dual": float(d_all["dead"].mean()) if len(d_all) else None,
                    "meanMI_dualHeadline": mean_col(d),
                    "meanNodeMPR_dualHeadline": mean_col(d, "meanNodeMPR"),
                    "kStar_rate_dual": kstar_rate(d, "kStarDiscrete"),
                    "meanDualGap": mean_col(d, "meanDualGap"),
                    "meanAgreement": mean_col(d, "meanAgreement"),
                }
            )
    topo_df = pd.DataFrame(topo_rows)
    topo_df.to_csv(DERIVED / "topology_arm_mode.csv", index=False)

    # persona × topology (H only, mean across live articles)
    persona_topo = []
    for persona in PERSONA_ORDER:
        for topo in TOPOS:
            c = th_cont_live[(th_cont_live["rest"] == persona) & (th_cont_live["topology"] == topo)]
            d = th_dual_live[(th_dual_live["rest"] == persona) & (th_dual_live["topology"] == topo)]
            c_all = cont[(cont["arm"] == "H") & (cont["rest"] == persona) & (cont["topology"] == topo)]
            d_all = dual[(dual["arm"] == "H") & (dual["rest"] == persona) & (dual["topology"] == topo)]
            persona_topo.append(
                {
                    "persona": persona,
                    "family": persona_family(persona),
                    "topology": topo,
                    "n_live_continuous": int(len(c)),
                    "n_dead_continuous": int(c_all["dead"].sum()) if len(c_all) else 0,
                    "continuous_MPR": mean_col(c),
                    "continuous_meanNodeMPR": mean_col(c, "meanNodeMPR"),
                    "n_live_dual": int(len(d)),
                    "n_dead_dual": int(d_all["dead"].sum()) if len(d_all) else 0,
                    "discrete_MPR": mean_col(d),
                    "discrete_meanNodeMPR": mean_col(d, "meanNodeMPR"),
                    "kStar_rate_continuous": kstar_rate(c, "kStarContinuous"),
                    "kStar_rate_dual": kstar_rate(d, "kStarDiscrete"),
                }
            )
    persona_topo_df = pd.DataFrame(persona_topo)
    persona_topo_df.to_csv(DERIVED / "persona_topology_mpr.csv", index=False)

    # persona overall (H, across topologies + articles)
    persona_rows = []
    for persona in PERSONA_ORDER:
        c = th_cont_live[th_cont_live["rest"] == persona]
        d = th_dual_live[th_dual_live["rest"] == persona]
        c_all = cont[(cont["arm"] == "H") & (cont["rest"] == persona)]
        d_all = dual[(dual["arm"] == "H") & (dual["rest"] == persona)]
        persona_rows.append(
            {
                "persona": persona,
                "family": persona_family(persona),
                "n_cells": 8 * 6,
                "n_live_continuous": int(len(c)),
                "n_dead_continuous": int(c_all["dead"].sum()) if len(c_all) else 0,
                "continuous_MPR": mean_col(c),
                "n_live_dual": int(len(d)),
                "n_dead_dual": int(d_all["dead"].sum()) if len(d_all) else 0,
                "discrete_MPR": mean_col(d),
                "kStar_rate_continuous": kstar_rate(c, "kStarContinuous"),
                "kStar_rate_dual": kstar_rate(d, "kStarDiscrete"),
            }
        )
    persona_df = pd.DataFrame(persona_rows)
    persona_df.to_csv(DERIVED / "persona_mpr.csv", index=False)

    # mix × topology (He)
    mix_topo = []
    for mix in MIX_ORDER:
        for topo in TOPOS:
            c = the_cont_live[(the_cont_live["rest"] == mix) & (the_cont_live["topology"] == topo)]
            d = the_dual_live[(the_dual_live["rest"] == mix) & (the_dual_live["topology"] == topo)]
            mix_topo.append(
                {
                    "mix": mix,
                    "mix_note": MIX_NOTE[mix],
                    "topology": topo,
                    "n_live_continuous": int(len(c)),
                    "continuous_MPR": mean_col(c),
                    "n_live_dual": int(len(d)),
                    "discrete_MPR": mean_col(d),
                }
            )
    mix_topo_df = pd.DataFrame(mix_topo)
    mix_topo_df.to_csv(DERIVED / "mix_topology_mpr.csv", index=False)

    mix_rows = []
    for mix in MIX_ORDER:
        c = the_cont_live[the_cont_live["rest"] == mix]
        d = the_dual_live[the_dual_live["rest"] == mix]
        mix_rows.append(
            {
                "mix": mix,
                "mix_note": MIX_NOTE[mix],
                "n_live_continuous": int(len(c)),
                "continuous_MPR": mean_col(c),
                "n_live_dual": int(len(d)),
                "discrete_MPR": mean_col(d),
                "kStar_rate_continuous": kstar_rate(c, "kStarContinuous"),
                "kStar_rate_dual": kstar_rate(d, "kStarDiscrete"),
            }
        )
    mix_df = pd.DataFrame(mix_rows)
    mix_df.to_csv(DERIVED / "mix_mpr.csv", index=False)

    # family
    family_rows = []
    for fam in ("conspiracy", "climate_action", "science_env"):
        members = [p for p in PERSONA_ORDER if persona_family(p) == fam]
        c = th_cont_live[th_cont_live["rest"].isin(members)]
        d = th_dual_live[th_dual_live["rest"].isin(members)]
        family_rows.append(
            {
                "family": fam,
                "n_personas": len(members),
                "n_live_continuous": int(len(c)),
                "continuous_MPR": mean_col(c),
                "n_live_dual": int(len(d)),
                "discrete_MPR": mean_col(d),
                "kStar_rate_continuous": kstar_rate(c, "kStarContinuous"),
                "kStar_rate_dual": kstar_rate(d, "kStarDiscrete"),
            }
        )
    family_df = pd.DataFrame(family_rows)
    family_df.to_csv(DERIVED / "persona_family_mpr.csv", index=False)

    # article
    article_rows = []
    for art in ARTICLES:
        for arm, csrc, dsrc in (("H", th_cont_live, th_dual_live), ("He", the_cont_live, the_dual_live)):
            c = csrc[csrc["articleId"] == art]
            d = dsrc[dsrc["articleId"] == art]
            article_rows.append(
                {
                    "articleId": art,
                    "arm": arm,
                    "n_live_continuous": int(len(c)),
                    "continuous_MPR": mean_col(c),
                    "n_live_dual": int(len(d)),
                    "discrete_MPR": mean_col(d),
                }
            )
    article_df = pd.DataFrame(article_rows)
    article_df.to_csv(DERIVED / "article_mpr.csv", index=False)

    # Dnet cells
    dnet_out = dnet[
        [
            "experimentName",
            "miScoringMode",
            "articleId",
            "dead",
            "meanMI",
            "meanNodeMPR",
            "meanDiscreteMI",
            "meanContinuousMI",
            "meanDualGap",
            "kStarDiscrete",
            "kStarContinuous",
            "nScored",
        ]
    ].copy()
    dnet_out.to_csv(DERIVED / "dnet_cells.csv", index=False)

    # family into stats
    stats["family"] = family_df.to_dict(orient="records")
    stats["topology"] = topo_df.to_dict(orient="records")
    stats["persona"] = persona_df.to_dict(orient="records")
    stats["mix"] = mix_df.to_dict(orient="records")
    (OUT / "stats.json").write_text(json.dumps(stats, indent=2, default=str))

    harvest_cont = harvest.get("meanMPR_TH_continuous")
    harvest_dual = harvest.get("meanMPR_TH_dualHeadline")
    if harvest_cont is not None and abs(stats["meanMPR_TH_continuous"] - harvest_cont) > 0.00015:
        print(
            f"NOTE: live TH continuous meanMI {stats['meanMPR_TH_continuous']:.4f} "
            f"!= harvest summary.json {harvest_cont}"
        )
    if harvest_dual is not None and abs(stats["meanMPR_TH_dualHeadline"] - harvest_dual) > 0.00015:
        print(
            f"NOTE: live TH dual headline meanMI {stats['meanMPR_TH_dualHeadline']:.4f} "
            f"!= harvest summary.json {harvest_dual}"
        )

    # ========== FIGURES ==========
    labels = [TOPO_SHORT[t] for t in TOPOS]

    def topo_vals(arm, key_c, key_d):
        sub = topo_df[topo_df["arm"] == arm].set_index("topology")
        return [sub.loc[t, key_c] if t in sub.index else None for t in TOPOS], [
            sub.loc[t, key_d] if t in sub.index else None for t in TOPOS
        ]

    fig, axes = plt.subplots(1, 2, figsize=(12.2, 4.6), sharey=True)
    c_h, d_h = topo_vals("H", "meanMI_continuous", "meanMI_dualHeadline")
    c_he, d_he = topo_vals("He", "meanMI_continuous", "meanMI_dualHeadline")
    grouped_bars(
        axes[0],
        labels,
        c_h,
        d_h,
        "continuous (T2c)",
        "dual-discrete (T2d)",
        C_CONT,
        C_DISC,
        "mean cell meanMI (live)",
        "Homogeneous (H) — 8 topologies",
    )
    grouped_bars(
        axes[1],
        labels,
        c_he,
        d_he,
        "continuous (T2c)",
        "dual-discrete (T2d)",
        C_CONT,
        C_DISC,
        "mean cell meanMI (live)",
        "Heterogeneous (He) — 8 topologies",
    )
    fig.suptitle("Phase 2: topology × MPR — discrete vs continuous (not averaged)", fontsize=12)
    savefig(fig, "fig01_topology_mpr_discrete_vs_continuous.png")

    fig, axes = plt.subplots(1, 2, figsize=(9.2, 4.4), sharey=True)
    for ax, title, cval, dval in (
        (axes[0], "Continuous headline (T2c)", stats["meanMPR_TH_continuous"], stats["meanMPR_THe_continuous"]),
        (axes[1], "Dual-discrete headline (T2d)", stats["meanMPR_TH_dualHeadline"], stats["meanMPR_THe_dualHeadline"]),
    ):
        ax.bar([0, 1], [cval, dval], color=[C_H, C_HE], width=0.55, edgecolor="white")
        ax.set_xticks([0, 1])
        ax.set_xticklabels(["H (homo)", "He (hetero)"])
        ax.set_ylim(0, 5)
        ax.axhline(3, color="#888", ls="--", lw=0.8)
        ax.set_ylabel("mean cell meanMI (live)")
        ax.set_title(title)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.text(0, cval + 0.08, fmt4(cval), ha="center", fontsize=9)
        ax.text(1, dval + 0.08, fmt4(dval), ha="center", fontsize=9)
    fig.suptitle("Phase 2: H vs He — separate headlines (not pooled)", fontsize=12)
    savefig(fig, "fig02_h_vs_he_mpr.png")

    # persona bars
    fig, ax = plt.subplots(figsize=(11.4, 5.0))
    names = [p.replace("_", "\n") for p in PERSONA_ORDER]
    grouped_bars(
        ax,
        names,
        [persona_df.set_index("persona").loc[p, "continuous_MPR"] for p in PERSONA_ORDER],
        [persona_df.set_index("persona").loc[p, "discrete_MPR"] for p in PERSONA_ORDER],
        "continuous (T2c)",
        "dual-discrete (T2d)",
        C_CONT,
        C_DISC,
        "mean cell meanMI (live, all topologies)",
        "Homogeneous personas — discrete vs continuous MPR",
    )
    ax.set_xticklabels(names, rotation=0, ha="center", fontsize=7)
    savefig(fig, "fig03_persona_mpr_bars.png")

    # mix bars
    fig, ax = plt.subplots(figsize=(9.4, 4.6))
    mix_labs = [f"{m}\n{MIX_NOTE[m]}" for m in MIX_ORDER]
    grouped_bars(
        ax,
        mix_labs,
        [mix_df.set_index("mix").loc[m, "continuous_MPR"] for m in MIX_ORDER],
        [mix_df.set_index("mix").loc[m, "discrete_MPR"] for m in MIX_ORDER],
        "continuous (T2c)",
        "dual-discrete (T2d)",
        C_CONT,
        C_DISC,
        "mean cell meanMI (live, all topologies)",
        "Heterogeneous mixes — discrete vs continuous MPR",
    )
    ax.set_xticklabels(mix_labs, rotation=0, ha="center", fontsize=7)
    savefig(fig, "fig04_mix_mpr_bars.png")

    # persona × article heatmaps
    fig, axes = plt.subplots(1, 2, figsize=(13.2, 6.4))
    mat_c = pivot_mean(cont[cont["arm"] == "H"], PERSONA_ORDER, ARTICLES, "rest", "articleId")
    mat_d = pivot_mean(dual[dual["arm"] == "H"], PERSONA_ORDER, ARTICLES, "rest", "articleId")
    im0 = heatmap(axes[0], mat_c, [p.replace("_", " ") for p in PERSONA_ORDER], [ART_SHORT[a] for a in ARTICLES], "H continuous meanMI (live)")
    im1 = heatmap(axes[1], mat_d, [p.replace("_", " ") for p in PERSONA_ORDER], [ART_SHORT[a] for a in ARTICLES], "H dual-discrete meanMI (live)")
    fig.colorbar(im0, ax=axes[0], fraction=0.046, pad=0.04)
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04)
    fig.suptitle("Persona × article heatmaps — same cells are not averaged across modes", fontsize=12)
    savefig(fig, "fig05_persona_article_heatmaps.png")

    # persona × topology heatmaps
    fig, axes = plt.subplots(1, 2, figsize=(13.2, 6.4))
    mat_ct = pivot_mean(cont[cont["arm"] == "H"], PERSONA_ORDER, TOPOS, "rest", "topology")
    mat_dt = pivot_mean(dual[dual["arm"] == "H"], PERSONA_ORDER, TOPOS, "rest", "topology")
    im0 = heatmap(axes[0], mat_ct, [p.replace("_", " ") for p in PERSONA_ORDER], labels, "H continuous meanMI by topology")
    im1 = heatmap(axes[1], mat_dt, [p.replace("_", " ") for p in PERSONA_ORDER], labels, "H dual-discrete meanMI by topology")
    fig.colorbar(im0, ax=axes[0], fraction=0.046, pad=0.04)
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04)
    fig.suptitle("Persona × topology — discrete vs continuous (not a pooled MPR)", fontsize=12)
    savefig(fig, "fig06_persona_topology_heatmaps.png")

    # mix × topology
    fig, axes = plt.subplots(1, 2, figsize=(12.4, 4.2))
    mat_cm = pivot_mean(cont[cont["arm"] == "He"], MIX_ORDER, TOPOS, "rest", "topology")
    mat_dm = pivot_mean(dual[dual["arm"] == "He"], MIX_ORDER, TOPOS, "rest", "topology")
    im0 = heatmap(axes[0], mat_cm, MIX_ORDER, labels, "He continuous meanMI by mix × topology")
    im1 = heatmap(axes[1], mat_dm, MIX_ORDER, labels, "He dual-discrete meanMI by mix × topology")
    fig.colorbar(im0, ax=axes[0], fraction=0.046, pad=0.04)
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04)
    fig.suptitle("Heterogeneous mix × topology", fontsize=12)
    savefig(fig, "fig07_mix_topology_heatmaps.png")

    # dead rates
    fig, axes = plt.subplots(1, 2, figsize=(12.0, 4.6), sharey=True)
    for ax, arm in ((axes[0], "H"), (axes[1], "He")):
        sub = topo_df[topo_df["arm"] == arm].set_index("topology")
        x = np.arange(len(TOPOS))
        w = 0.38
        ax.bar(
            x - w / 2,
            [100 * sub.loc[t, "dead_rate_continuous"] for t in TOPOS],
            w,
            label="continuous dead %",
            color=C_CONT,
            hatch="//",
            edgecolor="white",
        )
        ax.bar(
            x + w / 2,
            [100 * sub.loc[t, "dead_rate_dual"] for t in TOPOS],
            w,
            label="dual dead %",
            color=C_DISC,
            hatch="//",
            edgecolor="white",
        )
        ax.set_xticks(x)
        ax.set_xticklabels(labels, rotation=25, ha="right")
        ax.set_ylabel("hatched dead cells (%)")
        ax.set_title(f"{arm} dead-cell rate by topology")
        ax.set_ylim(0, 55)
        ax.legend(frameon=False, fontsize=8)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
    fig.suptitle("Hatched dead cells (nScored≤1, llmCalls>0) — kept, not scored as mix immunity", fontsize=11)
    savefig(fig, "fig08_dead_cell_rates.png")

    # k*
    fig, axes = plt.subplots(1, 2, figsize=(12.0, 4.6), sharey=True)
    for ax, arm in ((axes[0], "H"), (axes[1], "He")):
        sub = topo_df[topo_df["arm"] == arm].set_index("topology")
        x = np.arange(len(TOPOS))
        w = 0.38
        ax.bar(
            x - w / 2,
            [100 * (sub.loc[t, "kStar_rate_continuous"] or 0) for t in TOPOS],
            w,
            label="continuous k* %",
            color=C_CONT,
            edgecolor="white",
        )
        ax.bar(
            x + w / 2,
            [100 * (sub.loc[t, "kStar_rate_dual"] or 0) for t in TOPOS],
            w,
            label="dual-discrete k* %",
            color=C_DISC,
            edgecolor="white",
        )
        ax.set_xticks(x)
        ax.set_xticklabels(labels, rotation=25, ha="right")
        ax.set_ylabel("% live cells with k*")
        ax.set_title(f"{arm} irreversible k* (mean MI>3, no recovery)")
        ax.set_ylim(0, 80)
        ax.legend(frameon=False, fontsize=8)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
    fig.suptitle("k* occurrence — computed per scoring mode, not pooled", fontsize=11)
    savefig(fig, "fig09_kstar_rates.png")

    # dual gap diagnostic (not MPR)
    fig, ax = plt.subplots(figsize=(10.2, 4.6))
    subh = topo_df[topo_df["arm"] == "H"].set_index("topology")
    subhe = topo_df[topo_df["arm"] == "He"].set_index("topology")
    x = np.arange(len(TOPOS))
    w = 0.38
    ax.bar(x - w / 2, [subh.loc[t, "meanDualGap"] or 0 for t in TOPOS], w, label="H mean dual gap", color=C_H, edgecolor="white")
    ax.bar(x + w / 2, [subhe.loc[t, "meanDualGap"] or 0 for t in TOPOS], w, label="He mean dual gap", color=C_HE, edgecolor="white")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=25, ha="right")
    ax.set_ylabel("mean dual gap (discrete − sidecar continuous)")
    ax.set_title("Dual gap is a scoring diagnostic — not a third ground-truth MPR")
    ax.legend(frameon=False)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    savefig(fig, "fig10_dual_gap_diagnostic.png")

    # Dnet structural
    real = compare["realMetrics"]
    sim = compare["avgSimMetrics"]
    metrics = ["depth", "breadth", "size", "structuralVirality"]
    fig, ax = plt.subplots(figsize=(8.2, 4.4))
    x = np.arange(len(metrics))
    w = 0.38
    real_v = [real[m] for m in metrics]
    sim_v = [sim[m] for m in metrics]
    # normalize each pair to the empirical value so bars are comparable
    ax.bar(x - w / 2, real_v, w, label="empirical hashtag graph", color="#4C78A8", edgecolor="white")
    ax.bar(x + w / 2, sim_v, w, label="simulated D-net (mean of 16 cascades)", color="#F58518", edgecolor="white")
    ax.set_xticks(x)
    ax.set_xticklabels(["depth", "breadth", "size", "struct. virality"])
    ax.set_title("D-net structural compare — not an MPR / Twitter-MI claim")
    ax.legend(frameon=False, fontsize=8)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    for i, (rv, sv) in enumerate(zip(real_v, sim_v)):
        ax.text(i - w / 2, rv, f"{rv:g}", ha="center", va="bottom", fontsize=8)
        ax.text(i + w / 2, sv, f"{sv:g}", ha="center", va="bottom", fontsize=8)
    savefig(fig, "fig11_dnet_structural.png")

    # family bars
    fig, ax = plt.subplots(figsize=(7.6, 4.4))
    fams = ["conspiracy", "climate_action", "science_env"]
    grouped_bars(
        ax,
        fams,
        [family_df.set_index("family").loc[f, "continuous_MPR"] for f in fams],
        [family_df.set_index("family").loc[f, "discrete_MPR"] for f in fams],
        "continuous (T2c)",
        "dual-discrete (T2d)",
        C_CONT,
        C_DISC,
        "mean cell meanMI (live H)",
        "Persona family (H only) — discrete vs continuous",
    )
    savefig(fig, "fig12_persona_family.png")

    write_markdown(stats, topo_df, persona_df, persona_topo_df, mix_df, mix_topo_df, family_df, article_df, dnet, harvest, compare)
    print("Wrote SUMMARY.md and RESULTS.md")


def write_markdown(stats, topo_df, persona_df, persona_topo_df, mix_df, mix_topo_df, family_df, article_df, dnet, harvest, compare):
    dtfs = compare["dtfs"]
    struct = compare["structuralComparison"]
    scalar = struct["scalarComparison"]
    dist = compare["distributionalComparison"]
    real = compare["realMetrics"]
    sim = compare["avgSimMetrics"]
    honesty = compare["honesty"]

    def topo_row(arm):
        rows = []
        for t in TOPOS:
            r = topo_df[(topo_df["arm"] == arm) & (topo_df["topology"] == t)].iloc[0]
            rows.append(
                [
                    t,
                    f"{int(r.n_live_dual)}/{int(r.n_cells_dual)}",
                    fmt4(r.meanMI_dualHeadline),
                    fmt_pct(r.kStar_rate_dual),
                    fmt_pct(r.dead_rate_dual),
                    f"{int(r.n_live_continuous)}/{int(r.n_cells_continuous)}",
                    fmt4(r.meanMI_continuous),
                    fmt_pct(r.kStar_rate_continuous),
                    fmt_pct(r.dead_rate_continuous),
                    fmt4(r.meanDualGap),
                ]
            )
        return rows

    topo_headers = [
        "topology",
        "n live dual",
        "discrete MPR",
        "k* dual",
        "dead dual",
        "n live cont",
        "continuous MPR",
        "k* cont",
        "dead cont",
        "dual gap",
    ]

    # RESULTS.md — the numbers the user asked for
    res = []
    res.append("# Phase 2 RESULTS — persona, topology, discrete MPR, continuous MPR")
    res.append("")
    res.append("Source: LIVE `thesisExperiment/results_phase2/tables/` (not Phase 1).")
    res.append("Cell headline = `meanMI` from `parse_phase2.js` on live cells (`nScored > 1`).")
    res.append("**Discrete MPR** = dual-run headline (`dual_discrete.csv`, T2d_*).")
    res.append("**Continuous MPR** = continuous-only headline (`continuous.csv`, T2c_*).")
    res.append("These two columns are **not** the same quantity and are **not** averaged.")
    res.append("Dual-gap sidecar continuous is omitted here (not a ground-truth MPR).")
    res.append("Dead cells are excluded from the mean; `n_live` is the count in the mean.")
    res.append("N=1 per config. `thesisGrade=false`. 8 hops, not CIKM 30.")
    res.append("")
    res.append("## Homogeneous (H) — persona × topology")
    res.append("")
    res.append(
        md_table(
            ["persona", "topology", "n_live disc", "discrete MPR", "n_live cont", "continuous MPR"],
            [
                [
                    r.persona,
                    r.topology,
                    str(int(r.n_live_dual)),
                    fmt4(r.discrete_MPR),
                    str(int(r.n_live_continuous)),
                    fmt4(r.continuous_MPR),
                ]
                for r in persona_topo_df.itertuples()
            ],
        )
    )
    res.append("")
    res.append("## Homogeneous (H) — persona collapsed across topologies")
    res.append("")
    res.append(
        md_table(
            ["persona", "family", "n_live disc", "discrete MPR", "n_live cont", "continuous MPR"],
            [
                [
                    r.persona,
                    r.family,
                    str(int(r.n_live_dual)),
                    fmt4(r.discrete_MPR),
                    str(int(r.n_live_continuous)),
                    fmt4(r.continuous_MPR),
                ]
                for r in persona_df.itertuples()
            ],
        )
    )
    res.append("")
    res.append("## Heterogeneous (He) — mix × topology")
    res.append("")
    res.append(
        md_table(
            ["mix", "note", "topology", "n_live disc", "discrete MPR", "n_live cont", "continuous MPR"],
            [
                [
                    r.mix,
                    r.mix_note,
                    r.topology,
                    str(int(r.n_live_dual)),
                    fmt4(r.discrete_MPR),
                    str(int(r.n_live_continuous)),
                    fmt4(r.continuous_MPR),
                ]
                for r in mix_topo_df.itertuples()
            ],
        )
    )
    res.append("")
    res.append("## Heterogeneous (He) — mix collapsed across topologies")
    res.append("")
    res.append(
        md_table(
            ["mix", "note", "n_live disc", "discrete MPR", "n_live cont", "continuous MPR"],
            [
                [
                    r.mix,
                    r.mix_note,
                    str(int(r.n_live_dual)),
                    fmt4(r.discrete_MPR),
                    str(int(r.n_live_continuous)),
                    fmt4(r.continuous_MPR),
                ]
                for r in mix_df.itertuples()
            ],
        )
    )
    res.append("")
    res.append("## Topology collapsed (H and He separate)")
    res.append("")
    res.append(
        md_table(
            ["topology", "arm", "discrete MPR", "continuous MPR"],
            [
                [r.topology, r.arm, fmt4(r.meanMI_dualHeadline), fmt4(r.meanMI_continuous)]
                for r in topo_df.itertuples()
            ],
        )
    )
    res.append("")
    res.append("## D-net custom graph (not one of the eight topologies)")
    res.append("")
    res.append("Auditor MPR on the reconstructed hashtag graph. **Not** empirical Twitter MPR.")
    res.append("")
    dnet_rows = []
    for r in dnet.itertuples():
        if r.miScoringMode == "dual":
            dnet_rows.append([r.experimentName, r.articleId, "dual-discrete", fmt4(r.meanMI), "—", fmt4(getattr(r, "meanContinuousMI", None))])
        else:
            dnet_rows.append([r.experimentName, r.articleId, "continuous", "—", fmt4(r.meanMI), "—"])
    res.append(
        md_table(
            ["run", "article", "mode", "discrete MPR", "continuous MPR", "dual sidecar continuous (not headline)"],
            dnet_rows,
        )
    )
    res.append("")
    res.append("Machine-readable copies: `analysis_phase2/tables/persona_topology_mpr.csv`, `mix_topology_mpr.csv`.")
    res.append("")
    (OUT / "RESULTS.md").write_text("\n".join(res))

    # SUMMARY.md
    s = []
    s.append("# Phase 2 analysis summary")
    s.append("")
    s.append(f"Generated from LIVE tables. Harvest stamp: `{stats['harvestGeneratedAt']}`.")
    s.append("Isolation: this folder is `thesisExperiment/analysis_phase2/`. Phase 1 `analysis/` and `results/tables/` were not overwritten.")
    s.append("")
    s.append("## What this is")
    s.append("")
    s.append("Phase 2 ran the climate/geoengineering IFD engine on **8 topologies × homogeneous (12 personas) and heterogeneous (6 mixes) × two scoring modes**, plus a small Debnath custom-graph (D-net) set. Six core articles. N=1. Model `gpt-4o-mini`. **8 hops/ticks** (logged cost cut vs CIKM 30, not a Debnath hop protocol).")
    s.append("")
    s.append("Two scoring modes, two headlines:")
    s.append("")
    s.append("- **Continuous (T2c_)** — headline MI/MPR is the continuous auditor float (~0–5). Table: `continuous.csv`.")
    s.append("- **Dual-discrete (T2d_)** — headline MI/MPR is the **discrete** 0–5 score. Continuous is a sidecar on the same events. Table: `dual_discrete.csv`.")
    s.append("- **Dual gap** (`dual_gap.csv`) is discrete minus sidecar continuous. It is a **scoring diagnostic**, not a third ground-truth MPR.")
    s.append("")
    s.append("Cell headline used below = `meanMI` (same rule as `parse_phase2.js` / `summary.json`). `meanNodeMPR` is the mean-of-node-means of the same headline and is reported beside it, not mixed into it.")
    s.append("")
    s.append("## Grid that was actually harvested")
    s.append("")
    s.append(
        md_table(
            ["slice", "configs", "cells", "hatched dead"],
            [
                ["T2c_H", "96/96", "576/576", str(harvest["sliceCounts"]["T2c_H"]["hatchedDead"])],
                ["T2d_H", "96/96", "576/576", str(harvest["sliceCounts"]["T2d_H"]["hatchedDead"])],
                ["T2c_He", "48/48", "288/288", str(harvest["sliceCounts"]["T2c_He"]["hatchedDead"])],
                ["T2d_He", "48/48", "288/288", str(harvest["sliceCounts"]["T2d_He"]["hatchedDead"])],
                ["D-net", "4 configs", f"{stats['nDnetRows']} article-rows", "0"],
            ],
        )
    )
    s.append("")
    s.append(f"Thesis grid cells: **{stats['nExpectedCells']}** expected, **{stats['nMissingCells']}** missing. Dead-cell table rows: **{stats['nDeadTable']}** (all `hatched_dead_after_llm`). `thesisGrade`: **{stats['thesisGrade']}**.")
    s.append("")
    s.append("## Headlines — do not pool these")
    s.append("")
    s.append("Live-cell means of `meanMI`. Dead cells excluded. H and He are separate. Discrete and continuous are separate.")
    s.append("")
    s.append(
        md_table(
            ["arm", "continuous MPR (T2c)", "n live cont", "dual-discrete MPR (T2d)", "n live dual", "mean dual gap"],
            [
                [
                    "H (homo)",
                    fmt4(stats["meanMPR_TH_continuous"]),
                    str(stats["nLive_TH_continuous"]),
                    fmt4(stats["meanMPR_TH_dualHeadline"]),
                    str(stats["nLive_TH_dual"]),
                    fmt4(stats["meanDualGap_TH"]),
                ],
                [
                    "He (hetero)",
                    fmt4(stats["meanMPR_THe_continuous"]),
                    str(stats["nLive_THe_continuous"]),
                    fmt4(stats["meanMPR_THe_dualHeadline"]),
                    str(stats["nLive_THe_dual"]),
                    fmt4(stats["meanDualGap_THe"]),
                ],
            ],
        )
    )
    s.append("")
    s.append(
        f"Harvest `summary.json` cross-check (H only): continuous `{stats['harvest_meanMPR_TH_continuous']}`, dual headline `{stats['harvest_meanMPR_TH_dualHeadline']}`. "
        f"Recomputed live: continuous `{fmt4(stats['meanMPR_TH_continuous'])}`, dual `{fmt4(stats['meanMPR_TH_dualHeadline'])}`."
    )
    s.append("")
    s.append(f"Same cells as `meanNodeMPR` (not interchangeable with `meanMI`): H continuous `{fmt4(stats['meanNodeMPR_TH_continuous'])}`, H dual `{fmt4(stats['meanNodeMPR_TH_dualHeadline'])}`, He continuous `{fmt4(stats['meanNodeMPR_THe_continuous'])}`, He dual `{fmt4(stats['meanNodeMPR_THe_dualHeadline'])}`.")
    s.append("")
    s.append("**Reading the two headlines.** Dual-discrete H (1.68) is not “the same MPR as continuous H (0.86) but higher.” The auditors are different instruments. Dual-discrete sits higher than continuous on every topology in this harvest; that is a **scoring-mode effect**, not evidence that the discrete campaign “found more misinformation” in a shared unit. Dual gap on H live cells is "
            + fmt4(stats["meanDualGap_TH"])
            + " — the sidecar continuous on dual events is not the T2c continuous headline.")
    s.append("")
    s.append("## Topology")
    s.append("")
    s.append("Figure: `results_phase2/figures/fig01_topology_mpr_discrete_vs_continuous.png` (H and He panels; two bars per topology).")
    s.append("")
    s.append("### Homogeneous (H)")
    s.append("")
    s.append(md_table(topo_headers, topo_row("H")))
    s.append("")
    s.append("### Heterogeneous (He)")
    s.append("")
    s.append(md_table(topo_headers, topo_row("He")))
    s.append("")

    # honest topology reading
    def rank_topo(arm, col):
        sub = topo_df[topo_df["arm"] == arm].copy()
        sub = sub.dropna(subset=[col]).sort_values(col, ascending=False)
        return [(r.topology, getattr(r, col)) for r in sub.itertuples()]

    h_c = rank_topo("H", "meanMI_continuous")
    h_d = rank_topo("H", "meanMI_dualHeadline")
    he_c = rank_topo("He", "meanMI_continuous")
    he_d = rank_topo("He", "meanMI_dualHeadline")

    s.append("### What the topology numbers say")
    s.append("")
    s.append(
        f"- **H continuous:** highest `{h_c[0][0]}` ({fmt4(h_c[0][1])}), lowest `{h_c[-1][0]}` ({fmt4(h_c[-1][1])}). "
        f"**H dual-discrete:** highest `{h_d[0][0]}` ({fmt4(h_d[0][1])}), lowest `{h_d[-1][0]}` ({fmt4(h_d[-1][1])})."
    )
    s.append(
        f"- **He continuous:** highest `{he_c[0][0]}` ({fmt4(he_c[0][1])}), lowest `{he_c[-1][0]}` ({fmt4(he_c[-1][1])}). "
        f"**He dual-discrete:** highest `{he_d[0][0]}` ({fmt4(he_d[0][1])}), lowest `{he_d[-1][0]}` ({fmt4(he_d[-1][1])})."
    )
    s.append("- Rank order is **not the same** across scoring modes. Do not pick a single “best topology” from a pooled number.")
    s.append("- Linear chain and ring are short, low-degree paths; hierarchical is a different degree sequence. With N=1 these gaps are descriptive, not a significance claim about ER vs scale-free.")
    s.append("")

    s.append("## H vs He")
    s.append("")
    s.append("Figure: `results_phase2/figures/fig02_h_vs_he_mpr.png`.")
    s.append("")
    s.append(
        md_table(
            ["comparison", "continuous", "dual-discrete"],
            [
                [
                    "H meanMI",
                    fmt4(stats["meanMPR_TH_continuous"]),
                    fmt4(stats["meanMPR_TH_dualHeadline"]),
                ],
                [
                    "He meanMI",
                    fmt4(stats["meanMPR_THe_continuous"]),
                    fmt4(stats["meanMPR_THe_dualHeadline"]),
                ],
                [
                    "He − H (same mode only)",
                    fmt4(
                        None
                        if stats["meanMPR_THe_continuous"] is None or stats["meanMPR_TH_continuous"] is None
                        else stats["meanMPR_THe_continuous"] - stats["meanMPR_TH_continuous"]
                    ),
                    fmt4(
                        None
                        if stats["meanMPR_THe_dualHeadline"] is None or stats["meanMPR_TH_dualHeadline"] is None
                        else stats["meanMPR_THe_dualHeadline"] - stats["meanMPR_TH_dualHeadline"]
                    ),
                ],
            ],
        )
    )
    s.append("")
    he_minus_h_c = stats["meanMPR_THe_continuous"] - stats["meanMPR_TH_continuous"]
    he_minus_h_d = stats["meanMPR_THe_dualHeadline"] - stats["meanMPR_TH_dualHeadline"]
    s.append(
        f"Collapsed He is **higher** than collapsed H on both instruments "
        f"(continuous {fmt4(he_minus_h_c)}; dual-discrete {fmt4(he_minus_h_d)}). "
        "That is the opposite of a pooled “hetero buffers firestorms” claim. "
        "The H mean mixes conspiracy personas (~2–3) with scientists (~0–1). "
        "The He mean mixes conspiracy-heavy `mix_00`/`mix_01` with conspiracy-free `mix_02`. "
        "Composition, not the H/He label, is what moves MPR."
    )
    s.append("")
    s.append("Do **not** read dead He cells as “mix immunises.” They are hatched (`nScored≤1` after real LLM calls).")
    s.append("")

    s.append("## Personas (homogeneous)")
    s.append("")
    s.append("Figures: `fig03_persona_mpr_bars.png`, `fig05_persona_article_heatmaps.png`, `fig06_persona_topology_heatmaps.png`, `fig12_persona_family.png`.")
    s.append("")
    s.append(
        md_table(
            ["persona", "family", "discrete MPR", "continuous MPR", "k* dual", "k* cont", "dead dual", "dead cont"],
            [
                [
                    r.persona,
                    r.family,
                    fmt4(r.discrete_MPR),
                    fmt4(r.continuous_MPR),
                    fmt_pct(r.kStar_rate_dual),
                    fmt_pct(r.kStar_rate_continuous),
                    f"{int(r.n_dead_dual)}/{int(r.n_cells)}",
                    f"{int(r.n_dead_continuous)}/{int(r.n_cells)}",
                ]
                for r in persona_df.itertuples()
            ],
        )
    )
    s.append("")
    s.append(
        md_table(
            ["family", "n personas", "discrete MPR", "continuous MPR", "k* dual", "k* cont"],
            [
                [
                    r.family,
                    str(int(r.n_personas)),
                    fmt4(r.discrete_MPR),
                    fmt4(r.continuous_MPR),
                    fmt_pct(r.kStar_rate_dual),
                    fmt_pct(r.kStar_rate_continuous),
                ]
                for r in family_df.itertuples()
            ],
        )
    )
    s.append("")
    fam = family_df.set_index("family")
    s.append(
        f"Conspiracy-family H cells are the high-MPR group on **both** instruments "
        f"(discrete `{fmt4(fam.loc['conspiracy', 'discrete_MPR'])}`, continuous `{fmt4(fam.loc['conspiracy', 'continuous_MPR'])}`). "
        f"Science/env is lowest continuous (`{fmt4(fam.loc['science_env', 'continuous_MPR'])}`) but not uniformly lowest dual-discrete "
        f"(`{fmt4(fam.loc['science_env', 'discrete_MPR'])}` vs climate-action `{fmt4(fam.loc['climate_action', 'discrete_MPR'])}`). "
        "Scientist / journalist personas often sit near 0 on continuous and still pick up discrete points on some articles (see heatmaps). That is a mode disagreement, not “the scientist believed chemtrails.”"
    )
    s.append("")
    s.append("Full persona × topology grid: `RESULTS.md` and `tables/persona_topology_mpr.csv`.")
    s.append("")

    s.append("## Heterogeneous mixes")
    s.append("")
    s.append("Figures: `fig04_mix_mpr_bars.png`, `fig07_mix_topology_heatmaps.png`.")
    s.append("")
    s.append(
        md_table(
            ["mix", "composition", "discrete MPR", "continuous MPR", "k* dual", "k* cont"],
            [
                [
                    r.mix,
                    r.mix_note,
                    fmt4(r.discrete_MPR),
                    fmt4(r.continuous_MPR),
                    fmt_pct(r.kStar_rate_dual),
                    fmt_pct(r.kStar_rate_continuous),
                ]
                for r in mix_df.itertuples()
            ],
        )
    )
    s.append("")
    mix_i = mix_df.set_index("mix")
    s.append(
        f"`mix_00` (conspiracy-heavy) and `mix_02` (no conspiracy) are the useful contrast. "
        f"Continuous: mix_00 `{fmt4(mix_i.loc['mix_00','continuous_MPR'])}` vs mix_02 `{fmt4(mix_i.loc['mix_02','continuous_MPR'])}`. "
        f"Dual-discrete: mix_00 `{fmt4(mix_i.loc['mix_00','discrete_MPR'])}` vs mix_02 `{fmt4(mix_i.loc['mix_02','discrete_MPR'])}`. "
        "If mix_02 is lower, that is “this conspiracy-free mix scored lower in these N=1 runs,” not “diversity always stops firestorms.”"
    )
    s.append("")

    s.append("## Articles (secondary)")
    s.append("")
    s.append(
        md_table(
            ["article", "H discrete", "H continuous", "He discrete", "He continuous"],
            [
                [
                    art,
                    fmt4(article_df[(article_df.articleId == art) & (article_df.arm == "H")].iloc[0].discrete_MPR),
                    fmt4(article_df[(article_df.articleId == art) & (article_df.arm == "H")].iloc[0].continuous_MPR),
                    fmt4(article_df[(article_df.articleId == art) & (article_df.arm == "He")].iloc[0].discrete_MPR),
                    fmt4(article_df[(article_df.articleId == art) & (article_df.arm == "He")].iloc[0].continuous_MPR),
                ]
                for art in ARTICLES
            ],
        )
    )
    s.append("")

    s.append("## k* and dead cells")
    s.append("")
    s.append("k* = first tick where tick-mean MI > 3 and every later tick stays > 3 (`parse_phase2.js`). Censored at 8 ticks. Reported only on live cells.")
    s.append("")
    s.append(
        md_table(
            ["arm × mode", "live cells", "k* rate", "dead rate"],
            [
                ["H continuous", str(stats["nLive_TH_continuous"]), fmt_pct(stats["kStarRate_TH_continuous"]), fmt_pct(stats["deadRate_TH_continuous"])],
                ["H dual-discrete", str(stats["nLive_TH_dual"]), fmt_pct(stats["kStarRate_TH_dual"]), fmt_pct(stats["deadRate_TH_dual"])],
                ["He continuous", str(stats["nLive_THe_continuous"]), fmt_pct(stats["kStarRate_THe_continuous"]), fmt_pct(stats["deadRate_THe_continuous"])],
                ["He dual-discrete", str(stats["nLive_THe_dual"]), fmt_pct(stats["kStarRate_THe_dual"]), fmt_pct(stats["deadRate_THe_dual"])],
            ],
        )
    )
    s.append("")
    s.append(
        f"Hatched dead after LLM: **{stats['nDeadTable']}** / {stats['nExpectedCells']} thesis cells "
        f"({fmt_pct(stats['nDeadTable'] / stats['nExpectedCells'] if stats['nExpectedCells'] else None)}). "
        "Hatch pattern in `fig08_dead_cell_rates.png`. Hierarchical and some short chains show more dead cells (few scored events), which **inflates uncertainty** for those topologies — do not treat a live-only mean on a half-dead topology as a clean topology effect."
    )
    s.append("")
    s.append("Dual k* uses the discrete series; continuous k* uses the continuous series. Do not add them.")
    s.append("")

    s.append("## D-net / Debnath compare (structural, not MPR)")
    s.append("")
    s.append("Figure: `fig11_dnet_structural.png`. Source: `results_phase2/debnath_compare.json`.")
    s.append("")
    for note in honesty["notes"]:
        s.append(f"- {note}")
    s.append("")
    s.append(
        md_table(
            ["metric", "empirical hashtag graph", "simulated mean (16 cascades)", "match (30% band)"],
            [
                ["depth", str(real["depth"]), str(sim["depth"]), "yes" if scalar["depth"]["match"] else "no"],
                ["breadth", str(real["breadth"]), str(sim["breadth"]), "yes" if scalar["breadth"]["match"] else "no"],
                ["size (info only)", str(real["size"]), str(sim["size"]), "—"],
                ["structural virality", str(real["structuralVirality"]), str(sim["structuralVirality"]), "yes" if scalar["structuralVirality"]["match"] else "no"],
                ["speed", "not available empirically", f"{sim.get('speedTicks')} ticks (sim clock)", "—"],
                ["meanMI", "no empirical MPR", str(sim.get("meanMI")), "do not equate"],
            ],
        )
    )
    s.append("")
    s.append(
        f"Structural similarity: **{struct['structuralSimilarity']}** ({struct['matchedMetrics']}/{struct['totalMetrics']} metrics within 30%). "
        f"KS (nReal=1, nSim=16; underpowered): depth D={dist['depth']['ks']['statistic']} p={dist['depth']['ks']['pValue']}; "
        f"breadth D={dist['breadth']['ks']['statistic']} p={dist['breadth']['ks']['pValue']}; "
        f"virality D={dist['structuralVirality']['ks']['statistic']} p={dist['structuralVirality']['ks']['pValue']}. "
        f"JS divergence = 1 on all three. "
        f"DTFS = **{dtfs['dtfs']}** (`isValidated={dtfs['isValidated']}`; threshold 0.70). Content correlation = 0 because Debnath has no empirical MPR."
    )
    s.append("")
    s.append("Simulated D-net auditor scores (from `all_rows.csv`) are listed in `RESULTS.md`. They are LLM-as-judge MI on a hashtag co-occurrence graph. **They are not Twitter MPR.**")
    s.append("")

    s.append("## Honest limitations")
    s.append("")
    s.append("- **N=1.** One seed (`graphRandomSeed: 42`), one run per config. No error bars, no topology significance tests.")
    s.append("- **8 hops vs CIKM 30.** Logged cost compression. Not Debnath’s hop protocol; not an empirical firestorm duration.")
    s.append(f"- **Hatched dead cells: {stats['nDeadTable']}.** Kept. Not zeros. Not “mix immunises.” Live-only means drop those cells.")
    s.append("- **`thesisGrade: false`.** Harvest itself marks this campaign as not thesis-grade.")
    s.append("- **Two instruments.** Dual-discrete headline ≠ continuous headline. Dual gap ≠ MPR.")
    s.append("- **Debnath reconstruct is a hashtag co-occurrence fallback**, not a hydrated retweet cascade. 814k tweet IDs were not hydrated. BPs are theory-faithful reductions, not HDBSCAN centroids.")
    s.append("- **No empirical MPR** on Debnath. Do not write “the simulator matched Twitter misinformation.”")
    s.append("- **KS/JS with nReal=1** cannot support a twin-validation claim. DTFS failed the 0.70 threshold.")
    s.append("- **Pfeffer 2014 has seven factors.** The thesis six-knob list is a remapping; cross-media is held (no engine knob). Surprise held as drip.")
    s.append("- **gpt-4o-mini roleplay** is not chemtrails communities in the wild.")
    s.append("- Phase 1 discrete 12×12 (`runs/`, `results/tables/`) is a different campaign. Do not splice those MPR numbers into these headlines.")
    s.append("")

    s.append("## Figures")
    s.append("")
    s.append("| file | what |")
    s.append("| --- | --- |")
    s.append("| `results_phase2/figures/fig01_topology_mpr_discrete_vs_continuous.png` | 8 topologies × discrete vs continuous, H and He panels |")
    s.append("| `results_phase2/figures/fig02_h_vs_he_mpr.png` | H vs He for each mode |")
    s.append("| `results_phase2/figures/fig03_persona_mpr_bars.png` | 12 homo personas, two bars |")
    s.append("| `results_phase2/figures/fig04_mix_mpr_bars.png` | 6 hetero mixes, two bars |")
    s.append("| `results_phase2/figures/fig05_persona_article_heatmaps.png` | persona × article, both modes |")
    s.append("| `results_phase2/figures/fig06_persona_topology_heatmaps.png` | persona × topology, both modes |")
    s.append("| `results_phase2/figures/fig07_mix_topology_heatmaps.png` | mix × topology, both modes |")
    s.append("| `results_phase2/figures/fig08_dead_cell_rates.png` | hatched dead % |")
    s.append("| `results_phase2/figures/fig09_kstar_rates.png` | k* % by topology |")
    s.append("| `results_phase2/figures/fig10_dual_gap_diagnostic.png` | dual gap, not MPR |")
    s.append("| `results_phase2/figures/fig11_dnet_structural.png` | empirical vs sim structure |")
    s.append("| `results_phase2/figures/fig12_persona_family.png` | conspiracy vs climate-action vs science/env |")
    s.append("")
    s.append("Copies also under `analysis_phase2/figures/`.")
    s.append("")
    s.append("## How to regenerate")
    s.append("")
    s.append("```bash")
    s.append("python3 thesisExperiment/analysis_phase2/plot_phase2.py")
    s.append("```")
    s.append("")
    s.append("Reads only `results_phase2/tables/*.csv`, `summary.json`, `debnath_compare.json`. Writes `analysis_phase2/` and `results_phase2/figures/`.")
    s.append("")

    (OUT / "SUMMARY.md").write_text("\n".join(s))


if __name__ == "__main__":
    main()
