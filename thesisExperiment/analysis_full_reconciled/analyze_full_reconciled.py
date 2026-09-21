#!/usr/bin/env python3
"""Phase 2 FULL analysis — live tables only.

Writes thesisExperiment/analysis_full_reconciled/ (does not overwrite analysis/, analysis_phase2/ or analysis_full/).

Hard rules
----------
* Source of MI/MPR/k*/dead/IFD-adjacent fields: results_phase2/tables_reconciled/ only.
* Do not invent MI. Dead cells (nScored<=1) are kept and hatched; excluded from means.
* Discrete (T2d headline) != continuous (T2c headline). Do not average them.
* Dual gap is a scoring diagnostic, not a third MPR.
* N=1 seed. 8 hops vs CIKM 30. Exploratory rank tests are not replicate inference.
* Pooling concatenates cells; it is not a physical super-graph.
* D-net (63-node custom graph) is reported separately.
* Never print .env.
"""
from __future__ import annotations

import json
import os
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.colors import LinearSegmentedColormap
from scipy import stats

ROOT = Path(__file__).resolve().parents[1]
TABLES = ROOT / "results_phase2" / "tables_reconciled"
COMPARE = ROOT / "results_phase2" / "debnath_compare.json"
HARVEST = ROOT / "results_phase2" / "summary.json"
OUT = Path(os.environ.get("THESIS_ANALYSIS_OUTPUT_DIR", str(ROOT / "analysis_full_reconciled"))).resolve()
FIG = OUT / "figures"
DERIVED = OUT / "tables"
NOTES = OUT / "notes"

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
CONSPIRACY_HEAVY_MIXES = {"mix_00", "mix_01"}
CONSPIRACY_FREE_MIXES = {"mix_02"}

C_CONT = "#4C78A8"
C_DISC = "#F58518"
C_H = "#54A24B"
C_HE = "#B279A2"
C_CROSS_A = "#E45756"
C_CROSS_B = "#72B7B2"
SEVERITY_CMAP = LinearSegmentedColormap.from_list(
    "severity", ["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c"], N=256
)
PROPAGANDA_LINE = 3.0
N_HOPS = 8
CIKM_HOPS = 30
DNET_N_NODES = 63  # reconstructed hashtag graph size; not an MI value


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


def md_table(headers: list[str], rows: list[list[str]]) -> str:
    out = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    for r in rows:
        out.append("| " + " | ".join(str(c) for c in r) + " |")
    return "\n".join(out)


def live(df: pd.DataFrame) -> pd.DataFrame:
    return df.loc[~df["dead"]].copy()


def mean_col(df: pd.DataFrame, col: str = "meanMI"):
    if df is None or df.empty or col not in df.columns:
        return None
    s = df[col].dropna()
    return float(s.mean()) if len(s) else None


def median_col(df: pd.DataFrame, col: str = "meanMI"):
    if df is None or df.empty or col not in df.columns:
        return None
    s = df[col].dropna()
    return float(s.median()) if len(s) else None


def kstar_rate(df: pd.DataFrame, col: str):
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


def mix_family(name: str) -> str:
    if name in CONSPIRACY_HEAVY_MIXES:
        return "conspiracy_heavy"
    if name in CONSPIRACY_FREE_MIXES:
        return "conspiracy_free"
    return "conspiracy_adj_or_sparse"


def kstar_col(mode: str) -> str:
    return "kStarContinuous" if mode == "continuous" else "kStarDiscrete"


def savefig(fig, name: str) -> Path:
    FIG.mkdir(parents=True, exist_ok=True)
    p = FIG / name
    fig.tight_layout()
    fig.savefig(p, dpi=160, bbox_inches="tight")
    plt.close(fig)
    print(f"Wrote {p}")
    return p


def grouped_bars(ax, labels, series_a, series_b, lab_a, lab_b, color_a, color_b, ylabel, title, ymax=5):
    x = np.arange(len(labels))
    w = 0.38
    a = [np.nan if v is None or (isinstance(v, float) and np.isnan(v)) else v for v in series_a]
    b = [np.nan if v is None or (isinstance(v, float) and np.isnan(v)) else v for v in series_b]
    ax.bar(x - w / 2, a, w, label=lab_a, color=color_a, edgecolor="white")
    ax.bar(x + w / 2, b, w, label=lab_b, color=color_b, edgecolor="white")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=25, ha="right")
    ax.set_ylabel(ylabel)
    ax.set_title(title)
    ax.set_ylim(0, ymax)
    if ymax >= 3:
        ax.axhline(PROPAGANDA_LINE, color="#888", ls="--", lw=0.8)
    ax.legend(frameon=False, fontsize=8)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)


def heatmap(ax, matrix: np.ndarray, row_labels, col_labels, title, vmin=0, vmax=5, cmap=None, ndigits=2):
    cmap = cmap or SEVERITY_CMAP
    masked = np.ma.masked_invalid(matrix)
    cmap_obj = plt.get_cmap(cmap).copy() if isinstance(cmap, str) else cmap.copy()
    cmap_obj.set_bad("#d9d9d9")
    im = ax.imshow(masked, aspect="auto", vmin=vmin, vmax=vmax, cmap=cmap_obj)
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
                txt = f"{v:.{ndigits}f}"
                ax.text(j, i, txt, ha="center", va="center", fontsize=6, color="#111" if v < (vmin + 0.65 * (vmax - vmin)) else "#fff")
    return im


def pivot_mean(df: pd.DataFrame, rows, cols, row_key, col_key, val="meanMI"):
    mat = np.full((len(rows), len(cols)), np.nan)
    src = live(df)
    if src.empty:
        return mat
    g = src.groupby([row_key, col_key])[val].mean()
    for i, r in enumerate(rows):
        for j, c in enumerate(cols):
            if (r, c) in g.index:
                mat[i, j] = float(g.loc[(r, c)])
    return mat


def exploratory_wilcoxon(a, b, label: str) -> dict:
    """Paired Wilcoxon on equal-length vectors. Not a campaign-replicate test."""
    aa = np.asarray(a, dtype=float)
    bb = np.asarray(b, dtype=float)
    mask = np.isfinite(aa) & np.isfinite(bb)
    aa, bb = aa[mask], bb[mask]
    n = int(len(aa))
    out = {
        "test": "wilcoxon_signed_rank",
        "label": label,
        "n": n,
        "note": "Exploratory. Vectors are topology (or cell) means from N=1 seed, not independent replicates. Do not treat p as a firestorm effect-size test.",
    }
    if n < 6:
        out["skipped"] = "n<6"
        return out
    diff = bb - aa
    if np.allclose(diff, 0):
        out["skipped"] = "all paired deltas are 0"
        return out
    try:
        res = stats.wilcoxon(aa, bb, zero_method="wilcox", alternative="two-sided")
        out["statistic"] = float(res.statistic)
        out["p"] = float(res.pvalue)
        out["median_delta_b_minus_a"] = float(np.median(diff))
        out["n_pos"] = int((diff > 0).sum())
        out["n_neg"] = int((diff < 0).sum())
    except ValueError as e:
        out["skipped"] = str(e)
    return out


def exploratory_spearman(a, b, label: str) -> dict:
    aa = np.asarray(a, dtype=float)
    bb = np.asarray(b, dtype=float)
    mask = np.isfinite(aa) & np.isfinite(bb)
    aa, bb = aa[mask], bb[mask]
    out = {
        "test": "spearmanr",
        "label": label,
        "n": int(len(aa)),
        "note": "Exploratory rank correlation of topology means. N=1 seed.",
    }
    if len(aa) < 5:
        out["skipped"] = "n<5"
        return out
    res = stats.spearmanr(aa, bb)
    out["rho"] = float(res.correlation)
    out["p"] = float(res.pvalue)
    return out


def exploratory_mannwhitney(a, b, label: str) -> dict:
    aa = np.asarray(pd.Series(a).dropna(), dtype=float)
    bb = np.asarray(pd.Series(b).dropna(), dtype=float)
    out = {
        "test": "mannwhitneyu",
        "label": label,
        "n_a": int(len(aa)),
        "n_b": int(len(bb)),
        "note": "Exploratory on pooled live cells. Cells share one seed and are nested in topologies; not i.i.d. replicates.",
    }
    if len(aa) < 5 or len(bb) < 5:
        out["skipped"] = "too few"
        return out
    res = stats.mannwhitneyu(aa, bb, alternative="two-sided")
    out["statistic"] = float(res.statistic)
    out["p"] = float(res.pvalue)
    out["median_a"] = float(np.median(aa))
    out["median_b"] = float(np.median(bb))
    return out


def topo_means(df: pd.DataFrame, col="meanMI") -> list:
    g = live(df).groupby("topology")[col].mean()
    return [float(g.loc[t]) if t in g.index else np.nan for t in TOPOS]


def write_csv(df: pd.DataFrame, name: str) -> Path:
    DERIVED.mkdir(parents=True, exist_ok=True)
    p = DERIVED / name
    df.to_csv(p, index=False)
    return p


def methods_figure() -> None:
    fig, ax = plt.subplots(figsize=(11.4, 3.4))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 3.2)
    ax.axis("off")
    boxes = [
        (0.15, 1.15, "Seed article\n(6 climate / geoeng\n+ 5 GT questions)"),
        (2.45, 1.15, "Node rewrite\n12 homo BPs or\n6 hetero mixes"),
        (4.75, 1.15, "8 topologies\n8 hops/ticks\n(not CIKM 30)"),
        (7.05, 1.15, "Auditor IFD\nT2c continuous\nT2d dual-discrete"),
        (9.4, 1.15, "k* if mean MI>3\nand no recovery\nN=1, hatch dead"),
    ]
    for x, y, t in boxes:
        ax.add_patch(plt.Rectangle((x, y), 2.15, 1.55, fill=True, facecolor="#eef3f8", edgecolor="#333"))
        ax.text(x + 1.07, y + 0.78, t, ha="center", va="center", fontsize=8)
    for x in (2.3, 4.6, 6.9, 9.2):
        ax.annotate("", xy=(x + 0.15, 1.9), xytext=(x - 0.12, 1.9), arrowprops=dict(arrowstyle="->"))
    ax.set_title("Phase 2 climate-firestorm loop (CIKM grammar: MI/MPR/severity; new grid)")
    savefig(fig, "fig00_methods.png")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    FIG.mkdir(parents=True, exist_ok=True)
    DERIVED.mkdir(parents=True, exist_ok=True)
    NOTES.mkdir(parents=True, exist_ok=True)

    th = load_csv("TH_rows.csv")
    the = load_csv("THe_rows.csv")
    cont = load_csv("continuous.csv")
    dual = load_csv("dual_discrete.csv")
    gap = load_csv("dual_gap.csv")
    dead = load_csv("dead_cells.csv")
    all_rows = load_csv("all_rows.csv")

    harvest = json.loads(HARVEST.read_text()) if HARVEST.exists() else {}
    compare = json.loads(COMPARE.read_text()) if COMPARE.exists() else {}

    dnet = all_rows[all_rows["experimentName"].astype(str).str.startswith("Dnet_")].copy()
    thesis = pd.concat([th, the], ignore_index=True)
    assert set(cont["slice"].dropna().unique()) <= {"T2c_H", "T2c_He"}
    assert set(dual["slice"].dropna().unique()) <= {"T2d_H", "T2d_He"}

    th_cont = cont[cont["arm"] == "H"].copy()
    th_dual = dual[dual["arm"] == "H"].copy()
    the_cont = cont[cont["arm"] == "He"].copy()
    the_dual = dual[dual["arm"] == "He"].copy()
    th_cont_live, th_dual_live = live(th_cont), live(th_dual)
    the_cont_live, the_dual_live = live(the_cont), live(the_dual)

    n_dead_table = int(len(dead))
    n_dead_thesis = int(thesis["dead"].sum())
    n_expected = int(harvest.get("nExpectedCells") or 1728)

    # ---------- topology × arm × mode (building block) ----------
    topo_rows = []
    for topo in TOPOS:
        for arm, csrc, dsrc, call, dall in (
            ("H", th_cont_live, th_dual_live, th_cont, th_dual),
            ("He", the_cont_live, the_dual_live, the_cont, the_dual),
        ):
            c = csrc[csrc["topology"] == topo]
            d = dsrc[dsrc["topology"] == topo]
            c_all = call[call["topology"] == topo]
            d_all = dall[dall["topology"] == topo]
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
                    "maxMI_continuous": mean_col(c, "maxMI"),
                    "kStar_rate_continuous": kstar_rate(c, "kStarContinuous"),
                    "n_cells_dual": int(len(d_all)),
                    "n_live_dual": int(len(d)),
                    "n_dead_dual": int(d_all["dead"].sum()) if len(d_all) else 0,
                    "dead_rate_dual": float(d_all["dead"].mean()) if len(d_all) else None,
                    "meanMI_dualHeadline": mean_col(d),
                    "meanNodeMPR_dualHeadline": mean_col(d, "meanNodeMPR"),
                    "maxMI_dualHeadline": mean_col(d, "maxMI"),
                    "kStar_rate_dual": kstar_rate(d, "kStarDiscrete"),
                    "meanDualGap": mean_col(d, "meanDualGap"),
                    "meanAgreement": mean_col(d, "meanAgreement"),
                }
            )
    topo_df = pd.DataFrame(topo_rows)
    write_csv(topo_df, "topology_arm_mode.csv")

    def topo_val(arm, col):
        sub = topo_df[topo_df["arm"] == arm].set_index("topology")
        return [sub.loc[t, col] if t in sub.index else None for t in TOPOS]

    # ---------- Comparison 1: same topo, H vs He, SAME mode ----------
    c1_rows = []
    for topo in TOPOS:
        h = topo_df[(topo_df.arm == "H") & (topo_df.topology == topo)].iloc[0]
        he = topo_df[(topo_df.arm == "He") & (topo_df.topology == topo)].iloc[0]
        c1_rows.append(
            {
                "topology": topo,
                "n_live_T2c_H": int(h.n_live_continuous),
                "n_live_T2c_He": int(he.n_live_continuous),
                "meanMI_T2c_H": h.meanMI_continuous,
                "meanMI_T2c_He": he.meanMI_continuous,
                "delta_He_minus_H_T2c": (None if pd.isna(he.meanMI_continuous) or pd.isna(h.meanMI_continuous) else he.meanMI_continuous - h.meanMI_continuous),
                "meanNodeMPR_T2c_H": h.meanNodeMPR_continuous,
                "meanNodeMPR_T2c_He": he.meanNodeMPR_continuous,
                "kStar_T2c_H": h.kStar_rate_continuous,
                "kStar_T2c_He": he.kStar_rate_continuous,
                "dead_rate_T2c_H": h.dead_rate_continuous,
                "dead_rate_T2c_He": he.dead_rate_continuous,
                "n_live_T2d_H": int(h.n_live_dual),
                "n_live_T2d_He": int(he.n_live_dual),
                "meanMI_T2d_H": h.meanMI_dualHeadline,
                "meanMI_T2d_He": he.meanMI_dualHeadline,
                "delta_He_minus_H_T2d": (None if pd.isna(he.meanMI_dualHeadline) or pd.isna(h.meanMI_dualHeadline) else he.meanMI_dualHeadline - h.meanMI_dualHeadline),
                "meanNodeMPR_T2d_H": h.meanNodeMPR_dualHeadline,
                "meanNodeMPR_T2d_He": he.meanNodeMPR_dualHeadline,
                "kStar_T2d_H": h.kStar_rate_dual,
                "kStar_T2d_He": he.kStar_rate_dual,
                "dead_rate_T2d_H": h.dead_rate_dual,
                "dead_rate_T2d_He": he.dead_rate_dual,
            }
        )
    c1 = pd.DataFrame(c1_rows)
    write_csv(c1, "c1_same_mode_h_vs_he_by_topology.csv")

    c1_art_rows = []
    for topo in TOPOS:
        for art in ARTICLES:
            for mode, hdf, hedf, kcol in (
                ("continuous", th_cont_live, the_cont_live, "kStarContinuous"),
                ("dual-discrete", th_dual_live, the_dual_live, "kStarDiscrete"),
            ):
                h = hdf[(hdf.topology == topo) & (hdf.articleId == art)]
                he = hedf[(hedf.topology == topo) & (hedf.articleId == art)]
                hm, hem = mean_col(h), mean_col(he)
                c1_art_rows.append(
                    {
                        "topology": topo,
                        "articleId": art,
                        "mode": mode,
                        "n_live_H": int(len(h)),
                        "n_live_He": int(len(he)),
                        "meanMI_H": hm,
                        "meanMI_He": hem,
                        "delta_He_minus_H": None if hm is None or hem is None else hem - hm,
                        "kStar_H": kstar_rate(h, kcol),
                        "kStar_He": kstar_rate(he, kcol),
                    }
                )
    c1_art = pd.DataFrame(c1_art_rows)
    write_csv(c1_art, "c1_same_mode_h_vs_he_by_topology_article.csv")

    # ---------- Comparison 2: same topo, H vs H, DIFFERENT MPR ----------
    c2_rows = []
    for topo in TOPOS:
        h = topo_df[(topo_df.arm == "H") & (topo_df.topology == topo)].iloc[0]
        dc, dd = h.meanMI_continuous, h.meanMI_dualHeadline
        c2_rows.append(
            {
                "topology": topo,
                "n_live_T2c_H": int(h.n_live_continuous),
                "n_live_T2d_H": int(h.n_live_dual),
                "meanMI_T2c_H_continuous": dc,
                "meanMI_T2d_H_dualDiscrete": dd,
                "delta_dual_minus_continuous": None if pd.isna(dc) or pd.isna(dd) else dd - dc,
                "meanNodeMPR_T2c": h.meanNodeMPR_continuous,
                "meanNodeMPR_T2d": h.meanNodeMPR_dualHeadline,
                "kStar_T2c": h.kStar_rate_continuous,
                "kStar_T2d": h.kStar_rate_dual,
                "dead_rate_T2c": h.dead_rate_continuous,
                "dead_rate_T2d": h.dead_rate_dual,
                "meanDualGap_T2d": h.meanDualGap,
                "meanAgreement_T2d": h.meanAgreement,
            }
        )
    c2 = pd.DataFrame(c2_rows)
    write_csv(c2, "c2_homo_t2c_vs_t2d_by_topology.csv")

    a = th_cont_live[["topology", "rest", "articleId", "meanMI", "meanNodeMPR", "maxMI", "kStarContinuous", "nScored"]].rename(
        columns={"meanMI": "meanMI_T2c", "meanNodeMPR": "mpr_T2c", "maxMI": "maxMI_T2c", "kStarContinuous": "kStar_T2c", "nScored": "nScored_T2c"}
    )
    b = th_dual_live[["topology", "rest", "articleId", "meanMI", "meanNodeMPR", "maxMI", "kStarDiscrete", "meanDualGap", "meanAgreement", "nScored"]].rename(
        columns={"meanMI": "meanMI_T2d", "meanNodeMPR": "mpr_T2d", "maxMI": "maxMI_T2d", "kStarDiscrete": "kStar_T2d", "nScored": "nScored_T2d"}
    )
    c2_pairs = a.merge(b, on=["topology", "rest", "articleId"], how="inner")
    c2_pairs["delta_T2d_minus_T2c"] = c2_pairs["meanMI_T2d"] - c2_pairs["meanMI_T2c"]
    write_csv(c2_pairs, "c2_homo_t2c_vs_t2d_paired_live_cells.csv")
    j2 = th_cont.merge(th_dual, on=["topology", "rest", "articleId"], how="outer", suffixes=("_c", "_d"))
    n_c2_live_both = int((~j2["dead_c"] & ~j2["dead_d"]).sum())
    n_c2_dead_c_only = int((j2["dead_c"] & ~j2["dead_d"]).sum())
    n_c2_dead_d_only = int((~j2["dead_c"] & j2["dead_d"]).sum())
    n_c2_dead_both = int((j2["dead_c"] & j2["dead_d"]).sum())

    # ---------- Comparison 3: same topo, He vs He, DIFFERENT MPR ----------
    c3_rows = []
    for topo in TOPOS:
        r = topo_df[(topo_df.arm == "He") & (topo_df.topology == topo)].iloc[0]
        dc, dd = r.meanMI_continuous, r.meanMI_dualHeadline
        c3_rows.append(
            {
                "topology": topo,
                "n_live_T2c_He": int(r.n_live_continuous),
                "n_live_T2d_He": int(r.n_live_dual),
                "meanMI_T2c_He_continuous": dc,
                "meanMI_T2d_He_dualDiscrete": dd,
                "delta_dual_minus_continuous": None if pd.isna(dc) or pd.isna(dd) else dd - dc,
                "meanNodeMPR_T2c": r.meanNodeMPR_continuous,
                "meanNodeMPR_T2d": r.meanNodeMPR_dualHeadline,
                "kStar_T2c": r.kStar_rate_continuous,
                "kStar_T2d": r.kStar_rate_dual,
                "dead_rate_T2c": r.dead_rate_continuous,
                "dead_rate_T2d": r.dead_rate_dual,
                "meanDualGap_T2d": r.meanDualGap,
                "meanAgreement_T2d": r.meanAgreement,
            }
        )
    c3 = pd.DataFrame(c3_rows)
    write_csv(c3, "c3_hetero_t2c_vs_t2d_by_topology.csv")

    a3 = the_cont_live[["topology", "rest", "articleId", "meanMI", "meanNodeMPR", "maxMI", "kStarContinuous", "nScored"]].rename(
        columns={"meanMI": "meanMI_T2c", "meanNodeMPR": "mpr_T2c", "maxMI": "maxMI_T2c", "kStarContinuous": "kStar_T2c", "nScored": "nScored_T2c"}
    )
    b3 = the_dual_live[["topology", "rest", "articleId", "meanMI", "meanNodeMPR", "maxMI", "kStarDiscrete", "meanDualGap", "meanAgreement", "nScored"]].rename(
        columns={"meanMI": "meanMI_T2d", "meanNodeMPR": "mpr_T2d", "maxMI": "maxMI_T2d", "kStarDiscrete": "kStar_T2d", "nScored": "nScored_T2d"}
    )
    c3_pairs = a3.merge(b3, on=["topology", "rest", "articleId"], how="inner")
    c3_pairs["delta_T2d_minus_T2c"] = c3_pairs["meanMI_T2d"] - c3_pairs["meanMI_T2c"]
    write_csv(c3_pairs, "c3_hetero_t2c_vs_t2d_paired_live_cells.csv")
    j3 = the_cont.merge(the_dual, on=["topology", "rest", "articleId"], how="outer", suffixes=("_c", "_d"))
    n_c3_live_both = int((~j3["dead_c"] & ~j3["dead_d"]).sum())
    n_c3_dead_c_only = int((j3["dead_c"] & ~j3["dead_d"]).sum())
    n_c3_dead_d_only = int((~j3["dead_c"] & j3["dead_d"]).sum())
    n_c3_dead_both = int((j3["dead_c"] & j3["dead_d"]).sum())

    # ---------- Comparison 4: CROSS-MODE (two factors) — not a pooled mean ----------
    c4_rows = []
    for topo in TOPOS:
        h = topo_df[(topo_df.arm == "H") & (topo_df.topology == topo)].iloc[0]
        he = topo_df[(topo_df.arm == "He") & (topo_df.topology == topo)].iloc[0]
        a_h, b_he = h.meanMI_continuous, he.meanMI_dualHeadline  # T2c_H vs T2d_He
        a_d, b_c = h.meanMI_dualHeadline, he.meanMI_continuous  # T2d_H vs T2c_He
        c4_rows.append(
            {
                "topology": topo,
                "label": "CROSS-MODE two factors (identity AND scoring mode)",
                "meanMI_T2c_H": a_h,
                "meanMI_T2d_He": b_he,
                "delta_T2d_He_minus_T2c_H": None if pd.isna(a_h) or pd.isna(b_he) else b_he - a_h,
                "n_live_T2c_H": int(h.n_live_continuous),
                "n_live_T2d_He": int(he.n_live_dual),
                "meanMI_T2d_H": a_d,
                "meanMI_T2c_He": b_c,
                "delta_T2c_He_minus_T2d_H": None if pd.isna(a_d) or pd.isna(b_c) else b_c - a_d,
                "n_live_T2d_H": int(h.n_live_dual),
                "n_live_T2c_He": int(he.n_live_continuous),
                "do_not_pool_into_one_mean": True,
            }
        )
    c4 = pd.DataFrame(c4_rows)
    write_csv(c4, "c4_cross_mode_by_topology.csv")

    # ---------- Comparison 5: pooled cells (NOT a super-graph) + Dnet separately ----------
    def pooled_block(df, name, kcol):
        lv = live(df)
        return {
            "pool": name,
            "pooling_unit": "live article-cells concatenated across topologies; not a physical super-graph",
            "n_cells_incl_dead": int(len(df)),
            "n_live": int(len(lv)),
            "n_dead": int(df["dead"].sum()),
            "dead_rate": float(df["dead"].mean()) if len(df) else None,
            "meanMI": mean_col(lv),
            "medianMI": median_col(lv),
            "meanNodeMPR": mean_col(lv, "meanNodeMPR"),
            "mean_maxMI": mean_col(lv, "maxMI"),
            "kStar_rate": kstar_rate(lv, kcol),
            "meanDualGap": mean_col(lv, "meanDualGap") if "meanDualGap" in lv.columns else None,
            "meanAgreement": mean_col(lv, "meanAgreement") if "meanAgreement" in lv.columns else None,
        }

    pooled_rows = [
        pooled_block(th_cont, "T2c_H_all_topologies", "kStarContinuous"),
        pooled_block(the_cont, "T2c_He_all_topologies", "kStarContinuous"),
        pooled_block(th_dual, "T2d_H_all_topologies", "kStarDiscrete"),
        pooled_block(the_dual, "T2d_He_all_topologies", "kStarDiscrete"),
        pooled_block(th_cont[th_cont["rest"].isin(CONSPIRACY)], "T2c_H_conspiracy_family", "kStarContinuous"),
        pooled_block(th_cont[th_cont["rest"].isin(SCIENCE_ENV)], "T2c_H_science_env_family", "kStarContinuous"),
        pooled_block(th_cont[th_cont["rest"].isin(CLIMATE_ACTION)], "T2c_H_climate_action_family", "kStarContinuous"),
        pooled_block(th_dual[th_dual["rest"].isin(CONSPIRACY)], "T2d_H_conspiracy_family", "kStarDiscrete"),
        pooled_block(th_dual[th_dual["rest"].isin(SCIENCE_ENV)], "T2d_H_science_env_family", "kStarDiscrete"),
        pooled_block(th_dual[th_dual["rest"].isin(CLIMATE_ACTION)], "T2d_H_climate_action_family", "kStarDiscrete"),
        pooled_block(the_cont[the_cont["rest"].isin(CONSPIRACY_HEAVY_MIXES)], "T2c_He_conspiracy_heavy_mix00_01", "kStarContinuous"),
        pooled_block(the_cont[the_cont["rest"].isin(CONSPIRACY_FREE_MIXES)], "T2c_He_conspiracy_free_mix02", "kStarContinuous"),
        pooled_block(the_dual[the_dual["rest"].isin(CONSPIRACY_HEAVY_MIXES)], "T2d_He_conspiracy_heavy_mix00_01", "kStarDiscrete"),
        pooled_block(the_dual[the_dual["rest"].isin(CONSPIRACY_FREE_MIXES)], "T2d_He_conspiracy_free_mix02", "kStarDiscrete"),
    ]
    pooled = pd.DataFrame(pooled_rows)
    write_csv(pooled, "c5_pooled_cells.csv")

    # topology-equal (mean of 8 topology means) vs cell-weighted pool
    def topo_equal(arm, col):
        vals = [v for v in topo_val(arm, col) if v is not None and not (isinstance(v, float) and np.isnan(v))]
        return float(np.mean(vals)) if vals else None

    pooled_meta = pd.DataFrame(
        [
            {
                "contrast": "T2c H vs He",
                "cell_pooled_H": pooled.set_index("pool").loc["T2c_H_all_topologies", "meanMI"],
                "cell_pooled_He": pooled.set_index("pool").loc["T2c_He_all_topologies", "meanMI"],
                "cell_pooled_He_minus_H": pooled.set_index("pool").loc["T2c_He_all_topologies", "meanMI"]
                - pooled.set_index("pool").loc["T2c_H_all_topologies", "meanMI"],
                "topo_equal_H": topo_equal("H", "meanMI_continuous"),
                "topo_equal_He": topo_equal("He", "meanMI_continuous"),
                "topo_equal_He_minus_H": topo_equal("He", "meanMI_continuous") - topo_equal("H", "meanMI_continuous"),
            },
            {
                "contrast": "T2d H vs He",
                "cell_pooled_H": pooled.set_index("pool").loc["T2d_H_all_topologies", "meanMI"],
                "cell_pooled_He": pooled.set_index("pool").loc["T2d_He_all_topologies", "meanMI"],
                "cell_pooled_He_minus_H": pooled.set_index("pool").loc["T2d_He_all_topologies", "meanMI"]
                - pooled.set_index("pool").loc["T2d_H_all_topologies", "meanMI"],
                "topo_equal_H": topo_equal("H", "meanMI_dualHeadline"),
                "topo_equal_He": topo_equal("He", "meanMI_dualHeadline"),
                "topo_equal_He_minus_H": topo_equal("He", "meanMI_dualHeadline") - topo_equal("H", "meanMI_dualHeadline"),
            },
        ]
    )
    write_csv(pooled_meta, "c5_pooled_vs_topology_equal.csv")

    dnet_out = dnet[
        [
            "experimentName",
            "miScoringMode",
            "articleId",
            "dead",
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
        ]
    ].copy()
    dnet_out["graph"] = "Dnet_63_node_custom_hashtag_graph"
    dnet_out["not_twitter_mpr"] = True
    write_csv(dnet_out, "c5_dnet_cells.csv")

    # persona / mix / article companions (paper grammar)
    persona_topo = []
    for persona in PERSONA_ORDER:
        for topo in TOPOS:
            c = th_cont_live[(th_cont_live["rest"] == persona) & (th_cont_live["topology"] == topo)]
            d = th_dual_live[(th_dual_live["rest"] == persona) & (th_dual_live["topology"] == topo)]
            persona_topo.append(
                {
                    "persona": persona,
                    "family": persona_family(persona),
                    "topology": topo,
                    "n_live_continuous": int(len(c)),
                    "continuous_MPR": mean_col(c),
                    "n_live_dual": int(len(d)),
                    "discrete_MPR": mean_col(d),
                    "kStar_rate_continuous": kstar_rate(c, "kStarContinuous"),
                    "kStar_rate_dual": kstar_rate(d, "kStarDiscrete"),
                }
            )
    persona_topo_df = pd.DataFrame(persona_topo)
    write_csv(persona_topo_df, "persona_topology_mpr.csv")

    persona_rows = []
    for persona in PERSONA_ORDER:
        c = th_cont_live[th_cont_live["rest"] == persona]
        d = th_dual_live[th_dual_live["rest"] == persona]
        c_all = th_cont[th_cont["rest"] == persona]
        d_all = th_dual[th_dual["rest"] == persona]
        persona_rows.append(
            {
                "persona": persona,
                "family": persona_family(persona),
                "n_cells": 8 * 6,
                "n_live_continuous": int(len(c)),
                "n_dead_continuous": int(c_all["dead"].sum()),
                "continuous_MPR": mean_col(c),
                "n_live_dual": int(len(d)),
                "n_dead_dual": int(d_all["dead"].sum()),
                "discrete_MPR": mean_col(d),
                "kStar_rate_continuous": kstar_rate(c, "kStarContinuous"),
                "kStar_rate_dual": kstar_rate(d, "kStarDiscrete"),
            }
        )
    persona_df = pd.DataFrame(persona_rows)
    write_csv(persona_df, "persona_mpr.csv")

    mix_topo = []
    for mix in MIX_ORDER:
        for topo in TOPOS:
            c = the_cont_live[(the_cont_live["rest"] == mix) & (the_cont_live["topology"] == topo)]
            d = the_dual_live[(the_dual_live["rest"] == mix) & (the_dual_live["topology"] == topo)]
            mix_topo.append(
                {
                    "mix": mix,
                    "mix_note": MIX_NOTE[mix],
                    "mix_family": mix_family(mix),
                    "topology": topo,
                    "n_live_continuous": int(len(c)),
                    "continuous_MPR": mean_col(c),
                    "n_live_dual": int(len(d)),
                    "discrete_MPR": mean_col(d),
                    "kStar_rate_continuous": kstar_rate(c, "kStarContinuous"),
                    "kStar_rate_dual": kstar_rate(d, "kStarDiscrete"),
                }
            )
    mix_topo_df = pd.DataFrame(mix_topo)
    write_csv(mix_topo_df, "mix_topology_mpr.csv")

    mix_rows = []
    for mix in MIX_ORDER:
        c = the_cont_live[the_cont_live["rest"] == mix]
        d = the_dual_live[the_dual_live["rest"] == mix]
        mix_rows.append(
            {
                "mix": mix,
                "mix_note": MIX_NOTE[mix],
                "mix_family": mix_family(mix),
                "n_live_continuous": int(len(c)),
                "continuous_MPR": mean_col(c),
                "n_live_dual": int(len(d)),
                "discrete_MPR": mean_col(d),
                "kStar_rate_continuous": kstar_rate(c, "kStarContinuous"),
                "kStar_rate_dual": kstar_rate(d, "kStarDiscrete"),
            }
        )
    mix_df = pd.DataFrame(mix_rows)
    write_csv(mix_df, "mix_mpr.csv")

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
                    "kStar_continuous": kstar_rate(c, "kStarContinuous"),
                    "kStar_dual": kstar_rate(d, "kStarDiscrete"),
                }
            )
    article_df = pd.DataFrame(article_rows)
    write_csv(article_df, "article_mpr.csv")

    family_rows = []
    for fam, members in (("conspiracy", CONSPIRACY), ("climate_action", CLIMATE_ACTION), ("science_env", SCIENCE_ENV)):
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
    write_csv(family_df, "persona_family_mpr.csv")

    ifd_rows = []
    for topo in TOPOS:
        for arm, src in (("H", th_dual_live), ("He", the_dual_live)):
            d = src[src["topology"] == topo]
            ifd_rows.append(
                {
                    "topology": topo,
                    "arm": arm,
                    "n_live_dual": int(len(d)),
                    "meanAgreement": mean_col(d, "meanAgreement"),
                    "meanDualGap": mean_col(d, "meanDualGap"),
                    "meanDiscreteMI": mean_col(d, "meanDiscreteMI"),
                    "meanContinuousSidecar": mean_col(d, "meanContinuousMI"),
                    "note": "IFD CR/MR/IR not in live tables; agreement + dual gap only. Dual gap is not MPR.",
                }
            )
    ifd_df = pd.DataFrame(ifd_rows)
    write_csv(ifd_df, "ifd_dual_agreement_gap.csv")

    # ---------- scipy (exploratory) ----------
    tests = {
        "c1_wilcoxon_T2c_He_vs_H_topo8": exploratory_wilcoxon(topo_val("H", "meanMI_continuous"), topo_val("He", "meanMI_continuous"), "C1 T2c He vs H, 8 topology means"),
        "c1_wilcoxon_T2d_He_vs_H_topo8": exploratory_wilcoxon(topo_val("H", "meanMI_dualHeadline"), topo_val("He", "meanMI_dualHeadline"), "C1 T2d He vs H, 8 topology means"),
        "c2_wilcoxon_T2d_vs_T2c_H_topo8": exploratory_wilcoxon(topo_val("H", "meanMI_continuous"), topo_val("H", "meanMI_dualHeadline"), "C2 H dual-discrete vs continuous, 8 topology means"),
        "c3_wilcoxon_T2d_vs_T2c_He_topo8": exploratory_wilcoxon(topo_val("He", "meanMI_continuous"), topo_val("He", "meanMI_dualHeadline"), "C3 He dual-discrete vs continuous, 8 topology means"),
        "c2_spearman_H_topo_cont_vs_disc": exploratory_spearman(topo_val("H", "meanMI_continuous"), topo_val("H", "meanMI_dualHeadline"), "C2 H topology-mean rank, continuous vs discrete"),
        "c3_spearman_He_topo_cont_vs_disc": exploratory_spearman(topo_val("He", "meanMI_continuous"), topo_val("He", "meanMI_dualHeadline"), "C3 He topology-mean rank, continuous vs discrete"),
        "c5_mw_T2c_H_vs_He_cells": exploratory_mannwhitney(th_cont_live["meanMI"], the_cont_live["meanMI"], "C5 pooled live cells T2c H vs He"),
        "c5_mw_T2d_H_vs_He_cells": exploratory_mannwhitney(th_dual_live["meanMI"], the_dual_live["meanMI"], "C5 pooled live cells T2d H vs He"),
        "c5_mw_T2c_conspiracy_vs_science": exploratory_mannwhitney(
            th_cont_live[th_cont_live.rest.isin(CONSPIRACY)]["meanMI"],
            th_cont_live[th_cont_live.rest.isin(SCIENCE_ENV)]["meanMI"],
            "C5 pooled H continuous conspiracy vs science_env cells",
        ),
        "c5_mw_T2d_conspiracy_vs_science": exploratory_mannwhitney(
            th_dual_live[th_dual_live.rest.isin(CONSPIRACY)]["meanMI"],
            th_dual_live[th_dual_live.rest.isin(SCIENCE_ENV)]["meanMI"],
            "C5 pooled H dual conspiracy vs science_env cells",
        ),
        "c5_mw_T2c_mix00_vs_mix02": exploratory_mannwhitney(
            the_cont_live[the_cont_live.rest == "mix_00"]["meanMI"],
            the_cont_live[the_cont_live.rest == "mix_02"]["meanMI"],
            "C5 pooled He continuous mix_00 vs mix_02",
        ),
        "c5_mw_T2d_mix00_vs_mix02": exploratory_mannwhitney(
            the_dual_live[the_dual_live.rest == "mix_00"]["meanMI"],
            the_dual_live[the_dual_live.rest == "mix_02"]["meanMI"],
            "C5 pooled He dual mix_00 vs mix_02",
        ),
    }
    if len(c2_pairs):
        tests["c2_wilcoxon_paired_live_cells"] = exploratory_wilcoxon(c2_pairs["meanMI_T2c"], c2_pairs["meanMI_T2d"], "C2 paired live H cells T2c vs T2d")
    if len(c3_pairs):
        tests["c3_wilcoxon_paired_live_cells"] = exploratory_wilcoxon(c3_pairs["meanMI_T2c"], c3_pairs["meanMI_T2d"], "C3 paired live He cells T2c vs T2d")
    (OUT / "exploratory_tests.json").write_text(json.dumps(tests, indent=2, default=str))

    # ---------- headline numbers ----------
    pidx = pooled.set_index("pool")
    c1_t2c_n_he_gt = int((c1["delta_He_minus_H_T2c"] > 0).sum())
    c1_t2d_n_he_gt = int((c1["delta_He_minus_H_T2d"] > 0).sum())
    c2_n_disc_gt = int((c2["delta_dual_minus_continuous"] > 0).sum())
    c3_n_disc_gt = int((c3["delta_dual_minus_continuous"] > 0).sum())

    def dnet_mi(name, article, mode):
        sub = dnet[(dnet.experimentName == name) & (dnet.articleId == article) & (dnet.miScoringMode == mode)]
        return None if sub.empty else float(sub.iloc[0].meanMI)

    key = {
        "source": "LIVE thesisExperiment/results_phase2/tables_reconciled",
        "paper_folder": "/workspace/Paper/ was absent; style from Phase 1 plot_results.py + heatmap_spec.md + figure_plan.md (CIKM grammar, climate grid)",
        "n_hops": N_HOPS,
        "cikm_hops": CIKM_HOPS,
        "N_replicates": 1,
        "thesisGrade": harvest.get("thesisGrade"),
        "nExpectedCells": n_expected,
        "nDead_live_tables": n_dead_table,
        "nDead_TH_plus_THe": n_dead_thesis,
        "brief_said_290_hatched_dead": 290,
        "hatched_dead_kept": True,
        "nDnetRows": int(len(dnet)),
        "dnet_n_nodes": DNET_N_NODES,
        "pooling_is_physical_supergraph": False,
        "meanMI_T2c_H": mean_col(th_cont_live),
        "meanMI_T2c_He": mean_col(the_cont_live),
        "meanMI_T2d_H": mean_col(th_dual_live),
        "meanMI_T2d_He": mean_col(the_dual_live),
        "meanNodeMPR_T2c_H": mean_col(th_cont_live, "meanNodeMPR"),
        "meanNodeMPR_T2c_He": mean_col(the_cont_live, "meanNodeMPR"),
        "meanNodeMPR_T2d_H": mean_col(th_dual_live, "meanNodeMPR"),
        "meanNodeMPR_T2d_He": mean_col(the_dual_live, "meanNodeMPR"),
        "nLive_T2c_H": int(len(th_cont_live)),
        "nLive_T2c_He": int(len(the_cont_live)),
        "nLive_T2d_H": int(len(th_dual_live)),
        "nLive_T2d_He": int(len(the_dual_live)),
        "kStar_T2c_H": kstar_rate(th_cont_live, "kStarContinuous"),
        "kStar_T2c_He": kstar_rate(the_cont_live, "kStarContinuous"),
        "kStar_T2d_H": kstar_rate(th_dual_live, "kStarDiscrete"),
        "kStar_T2d_He": kstar_rate(the_dual_live, "kStarDiscrete"),
        "deadRate_T2c_H": float(th_cont["dead"].mean()),
        "deadRate_T2c_He": float(the_cont["dead"].mean()),
        "deadRate_T2d_H": float(th_dual["dead"].mean()),
        "deadRate_T2d_He": float(the_dual["dead"].mean()),
        "meanDualGap_H": mean_col(th_dual_live, "meanDualGap"),
        "meanDualGap_He": mean_col(the_dual_live, "meanDualGap"),
        "meanAgreement_H": mean_col(th_dual_live, "meanAgreement"),
        "meanAgreement_He": mean_col(the_dual_live, "meanAgreement"),
        "c1_T2c_He_minus_H_cell_pool": mean_col(the_cont_live) - mean_col(th_cont_live),
        "c1_T2d_He_minus_H_cell_pool": mean_col(the_dual_live) - mean_col(th_dual_live),
        "c1_T2c_n_topologies_He_gt_H": c1_t2c_n_he_gt,
        "c1_T2d_n_topologies_He_gt_H": c1_t2d_n_he_gt,
        "c1_T2c_mean_topo_delta": float(np.nanmean(c1["delta_He_minus_H_T2c"].astype(float))),
        "c1_T2d_mean_topo_delta": float(np.nanmean(c1["delta_He_minus_H_T2d"].astype(float))),
        "c2_n_topologies_discrete_gt_continuous": c2_n_disc_gt,
        "c2_mean_topo_delta_dual_minus_cont": float(np.nanmean(c2["delta_dual_minus_continuous"].astype(float))),
        "c2_n_paired_live_cells": n_c2_live_both,
        "c2_n_dead_continuous_only": n_c2_dead_c_only,
        "c2_n_dead_dual_only": n_c2_dead_d_only,
        "c2_n_dead_both": n_c2_dead_both,
        "c2_paired_median_delta": float(c2_pairs["delta_T2d_minus_T2c"].median()) if len(c2_pairs) else None,
        "c3_n_topologies_discrete_gt_continuous": c3_n_disc_gt,
        "c3_mean_topo_delta_dual_minus_cont": float(np.nanmean(c3["delta_dual_minus_continuous"].astype(float))),
        "c3_n_paired_live_cells": n_c3_live_both,
        "c3_n_dead_continuous_only": n_c3_dead_c_only,
        "c3_n_dead_dual_only": n_c3_dead_d_only,
        "c3_n_dead_both": n_c3_dead_both,
        "c3_paired_median_delta": float(c3_pairs["delta_T2d_minus_T2c"].median()) if len(c3_pairs) else None,
        "c4_mean_topo_delta_T2dHe_minus_T2cH": float(np.nanmean(c4["delta_T2d_He_minus_T2c_H"].astype(float))),
        "c4_mean_topo_delta_T2cHe_minus_T2dH": float(np.nanmean(c4["delta_T2c_He_minus_T2d_H"].astype(float))),
        "c5_T2c_conspiracy_MPR": float(pidx.loc["T2c_H_conspiracy_family", "meanMI"]),
        "c5_T2c_science_MPR": float(pidx.loc["T2c_H_science_env_family", "meanMI"]),
        "c5_T2c_climate_action_MPR": float(pidx.loc["T2c_H_climate_action_family", "meanMI"]),
        "c5_T2d_conspiracy_MPR": float(pidx.loc["T2d_H_conspiracy_family", "meanMI"]),
        "c5_T2d_science_MPR": float(pidx.loc["T2d_H_science_env_family", "meanMI"]),
        "c5_T2d_climate_action_MPR": float(pidx.loc["T2d_H_climate_action_family", "meanMI"]),
        "c5_T2c_mix00": float(pidx.loc["T2c_He_conspiracy_heavy_mix00_01", "meanMI"]),
        "c5_T2c_mix02": float(pidx.loc["T2c_He_conspiracy_free_mix02", "meanMI"]),
        "c5_T2d_mix00": float(pidx.loc["T2d_He_conspiracy_heavy_mix00_01", "meanMI"]),
        "c5_T2d_mix02": float(pidx.loc["T2d_He_conspiracy_free_mix02", "meanMI"]),
        "mix00_only_T2c": mean_col(the_cont_live[the_cont_live.rest == "mix_00"]),
        "mix02_only_T2c": mean_col(the_cont_live[the_cont_live.rest == "mix_02"]),
        "mix00_only_T2d": mean_col(the_dual_live[the_dual_live.rest == "mix_00"]),
        "mix02_only_T2d": mean_col(the_dual_live[the_dual_live.rest == "mix_02"]),
        "dnet_c_H_scopex": dnet_mi("Dnet_c_H_conspiracy", "scopex_2017", "continuous"),
        "dnet_c_H_chemtrails": dnet_mi("Dnet_c_H_conspiracy", "chemtrails_gates_2018_2021", "continuous"),
        "dnet_c_He_scopex": dnet_mi("Dnet_c_He_mixed", "scopex_2017", "continuous"),
        "dnet_c_He_chemtrails": dnet_mi("Dnet_c_He_mixed", "chemtrails_gates_2018_2021", "continuous"),
        "dnet_d_H_scopex": dnet_mi("Dnet_d_H_conspiracy", "scopex_2017", "dual"),
        "dnet_d_H_chemtrails": dnet_mi("Dnet_d_H_conspiracy", "chemtrails_gates_2018_2021", "dual"),
        "dnet_d_He_scopex": dnet_mi("Dnet_d_He_mixed", "scopex_2017", "dual"),
        "dnet_d_He_chemtrails": dnet_mi("Dnet_d_He_mixed", "chemtrails_gates_2018_2021", "dual"),
        "ifd_fields_in_tables": ["meanAgreement", "meanDualGap", "meanDiscreteMI", "meanContinuousMI"],
        "ifd_fields_absent": ["meanCR", "meanMR", "meanIR", "hopMI"],
        "tests": tests,
    }
    (OUT / "key_numbers.json").write_text(json.dumps(key, indent=2, default=str))

    # ========== FIGURES ==========
    labels = [TOPO_SHORT[t] for t in TOPOS]
    methods_figure()

    fig, axes = plt.subplots(1, 2, figsize=(12.2, 4.6), sharey=True)
    grouped_bars(axes[0], labels, topo_val("H", "meanMI_continuous"), topo_val("He", "meanMI_continuous"), "T2c_H", "T2c_He", C_H, C_HE, "mean cell meanMI (live)", "Continuous (T2c) — same mode")
    grouped_bars(axes[1], labels, topo_val("H", "meanMI_dualHeadline"), topo_val("He", "meanMI_dualHeadline"), "T2d_H", "T2d_He", C_H, C_HE, "mean cell meanMI (live)", "Dual-discrete (T2d) — same mode")
    fig.suptitle("C1: same topology, homo vs hetero, SAME MPR mode (not pooled across modes)", fontsize=12)
    savefig(fig, "fig01_c1_h_vs_he_same_mode.png")

    fig, axes = plt.subplots(1, 2, figsize=(12.0, 4.4), sharey=True)
    x = np.arange(len(TOPOS))
    axes[0].bar(x, c1["delta_He_minus_H_T2c"], color=C_CONT, edgecolor="white")
    axes[1].bar(x, c1["delta_He_minus_H_T2d"], color=C_DISC, edgecolor="white")
    for ax, title in ((axes[0], "T2c: He − H"), (axes[1], "T2d: He − H")):
        ax.axhline(0, color="#333", lw=0.8)
        ax.set_xticks(x)
        ax.set_xticklabels(labels, rotation=25, ha="right")
        ax.set_ylabel("Δ meanMI (He − H)")
        ax.set_title(title)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
    fig.suptitle("C1 deltas — positive means hetero higher on that topology (same instrument)", fontsize=12)
    savefig(fig, "fig02_c1_delta_he_minus_h.png")

    fig, axes = plt.subplots(1, 2, figsize=(12.2, 4.6), sharey=True)
    grouped_bars(axes[0], labels, topo_val("H", "meanMI_continuous"), topo_val("H", "meanMI_dualHeadline"), "T2c_H continuous", "T2d_H dual-discrete", C_CONT, C_DISC, "mean cell meanMI (live)", "Homogeneous — different MPR instruments")
    grouped_bars(axes[1], labels, topo_val("He", "meanMI_continuous"), topo_val("He", "meanMI_dualHeadline"), "T2c_He continuous", "T2d_He dual-discrete", C_CONT, C_DISC, "mean cell meanMI (live)", "Heterogeneous — different MPR instruments")
    fig.suptitle("C2/C3: same topology, same arm, DIFFERENT MPR (T2c vs T2d) — not averaged", fontsize=12)
    savefig(fig, "fig03_c2_c3_same_arm_different_mpr.png")

    fig, axes = plt.subplots(1, 2, figsize=(10.6, 4.8), sharex=True, sharey=True)
    if len(c2_pairs):
        axes[0].scatter(c2_pairs["meanMI_T2c"], c2_pairs["meanMI_T2d"], s=12, alpha=0.45, c=C_H, edgecolors="none")
    if len(c3_pairs):
        axes[1].scatter(c3_pairs["meanMI_T2c"], c3_pairs["meanMI_T2d"], s=12, alpha=0.45, c=C_HE, edgecolors="none")
    for ax, title in ((axes[0], f"C2 H paired live cells n={n_c2_live_both}"), (axes[1], f"C3 He paired live cells n={n_c3_live_both}")):
        ax.plot([0, 5], [0, 5], ls="--", color="#888", lw=0.8)
        ax.set_xlim(0, 5)
        ax.set_ylim(0, 5)
        ax.set_xlabel("T2c continuous meanMI")
        ax.set_ylabel("T2d dual-discrete meanMI")
        ax.set_title(title)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
    fig.suptitle("Paired live cells: dual-discrete vs continuous (different instruments; y=x is not a target)", fontsize=11)
    savefig(fig, "fig04_c2_c3_paired_scatter.png")

    fig, axes = plt.subplots(1, 2, figsize=(12.2, 4.6), sharey=True)
    grouped_bars(
        axes[0],
        labels,
        c4["meanMI_T2c_H"],
        c4["meanMI_T2d_He"],
        "T2c_H (homo, continuous)",
        "T2d_He (hetero, dual-discrete)",
        C_CROSS_A,
        C_CROSS_B,
        "mean cell meanMI (live)",
        "CROSS-MODE: T2c_H vs T2d_He",
    )
    grouped_bars(
        axes[1],
        labels,
        c4["meanMI_T2d_H"],
        c4["meanMI_T2c_He"],
        "T2d_H (homo, dual-discrete)",
        "T2c_He (hetero, continuous)",
        C_DISC,
        C_CONT,
        "mean cell meanMI (live)",
        "CROSS-MODE: T2d_H vs T2c_He",
    )
    fig.suptitle("C4: two factors change (identity AND scoring mode) — not a pooled mean, not a third MPR", fontsize=11)
    savefig(fig, "fig05_c4_cross_mode.png")

    fig, axes = plt.subplots(1, 2, figsize=(9.4, 4.4), sharey=True)
    for ax, title, hval, heval in (
        (axes[0], "Pooled live cells — continuous (T2c)", key["meanMI_T2c_H"], key["meanMI_T2c_He"]),
        (axes[1], "Pooled live cells — dual-discrete (T2d)", key["meanMI_T2d_H"], key["meanMI_T2d_He"]),
    ):
        ax.bar([0, 1], [hval, heval], color=[C_H, C_HE], width=0.55, edgecolor="white")
        ax.set_xticks([0, 1])
        ax.set_xticklabels(["H pooled", "He pooled"])
        ax.set_ylim(0, 5)
        ax.axhline(3, color="#888", ls="--", lw=0.8)
        ax.set_ylabel("mean cell meanMI")
        ax.set_title(title)
        ax.text(0, hval + 0.08, fmt4(hval), ha="center", fontsize=9)
        ax.text(1, heval + 0.08, fmt4(heval), ha="center", fontsize=9)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
    fig.suptitle("C5: cell-pooled across 8 topologies (concatenation, not a super-graph)", fontsize=12)
    savefig(fig, "fig06_c5_pooled_h_vs_he.png")

    fig, axes = plt.subplots(1, 2, figsize=(11.2, 4.6), sharey=True)
    fams = ["conspiracy", "climate_action", "science_env"]
    grouped_bars(
        axes[0],
        fams,
        [family_df.set_index("family").loc[f, "continuous_MPR"] for f in fams],
        [family_df.set_index("family").loc[f, "discrete_MPR"] for f in fams],
        "T2c continuous",
        "T2d dual-discrete",
        C_CONT,
        C_DISC,
        "mean cell meanMI (live H, pooled topos)",
        "H persona family",
    )
    mix_labs = ["mix_00\n4 cons.", "mix_01\n2 cons.", "mix_02\n0 cons.", "mix_03\n1 cons.", "mix_04\nadj.", "mix_05\nadj."]
    grouped_bars(
        axes[1],
        mix_labs,
        [mix_df.set_index("mix").loc[m, "continuous_MPR"] for m in MIX_ORDER],
        [mix_df.set_index("mix").loc[m, "discrete_MPR"] for m in MIX_ORDER],
        "T2c continuous",
        "T2d dual-discrete",
        C_CONT,
        C_DISC,
        "mean cell meanMI (live He, pooled topos)",
        "He mix composition",
    )
    axes[1].set_xticklabels(mix_labs, rotation=0, ha="center", fontsize=7)
    fig.suptitle("C5: conspiracy-composition still separates on the pooled cell set", fontsize=12)
    savefig(fig, "fig07_c5_conspiracy_composition.png")

    # Dnet
    fig, axes = plt.subplots(1, 2, figsize=(10.8, 4.4), sharey=True)
    art_l = ["SCoPEx", "chemtrails"]
    x = np.arange(2)
    w = 0.38
    c_h = [key["dnet_c_H_scopex"], key["dnet_c_H_chemtrails"]]
    c_he = [key["dnet_c_He_scopex"], key["dnet_c_He_chemtrails"]]
    d_h = [key["dnet_d_H_scopex"], key["dnet_d_H_chemtrails"]]
    d_he = [key["dnet_d_He_scopex"], key["dnet_d_He_chemtrails"]]
    axes[0].bar(x - w / 2, c_h, w, label="Dnet H conspiracy", color=C_H, edgecolor="white")
    axes[0].bar(x + w / 2, c_he, w, label="Dnet He mixed", color=C_HE, edgecolor="white")
    axes[1].bar(x - w / 2, d_h, w, label="Dnet H conspiracy", color=C_H, edgecolor="white")
    axes[1].bar(x + w / 2, d_he, w, label="Dnet He mixed", color=C_HE, edgecolor="white")
    for ax, title in ((axes[0], "D-net continuous (T2c)"), (axes[1], "D-net dual-discrete (T2d)")):
        ax.set_xticks(x)
        ax.set_xticklabels(art_l)
        ax.set_ylim(0, 5)
        ax.axhline(3, color="#888", ls="--", lw=0.8)
        ax.set_ylabel("cell meanMI (auditor)")
        ax.set_title(title)
        ax.legend(frameon=False, fontsize=8)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
    fig.suptitle("C5 D-net 63-node custom graph — auditor MI, not Twitter MPR; not pooled into 8-topo means", fontsize=11)
    savefig(fig, "fig08_c5_dnet.png")

    if compare:
        real = compare.get("realMetrics") or {}
        sim = compare.get("avgSimMetrics") or {}
        metrics = ["depth", "breadth", "size", "structuralVirality"]
        fig, ax = plt.subplots(figsize=(8.2, 4.4))
        x = np.arange(len(metrics))
        w = 0.38
        ax.bar(x - w / 2, [real.get(m) for m in metrics], w, label="empirical hashtag graph", color=C_CONT, edgecolor="white")
        ax.bar(x + w / 2, [sim.get(m) for m in metrics], w, label="simulated D-net (mean of cascades)", color=C_DISC, edgecolor="white")
        ax.set_xticks(x)
        ax.set_xticklabels(["depth", "breadth", "size", "struct. virality"])
        ax.set_title("D-net structural compare — not an MPR / Twitter-MI claim")
        ax.legend(frameon=False, fontsize=8)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        savefig(fig, "fig09_dnet_structural.png")

    # paper-style heatmaps
    fig, axes = plt.subplots(1, 2, figsize=(13.2, 6.6))
    mat_c = pivot_mean(th_cont, PERSONA_ORDER, ARTICLES, "rest", "articleId")
    mat_d = pivot_mean(th_dual, PERSONA_ORDER, ARTICLES, "rest", "articleId")
    im0 = heatmap(axes[0], mat_c, [p.replace("_", " ") for p in PERSONA_ORDER], [ART_SHORT[a] for a in ARTICLES], "H T2c continuous meanMI (live; — = all-dead)")
    im1 = heatmap(axes[1], mat_d, [p.replace("_", " ") for p in PERSONA_ORDER], [ART_SHORT[a] for a in ARTICLES], "H T2d dual-discrete meanMI (live)")
    fig.colorbar(im0, ax=axes[0], fraction=0.046, pad=0.04)
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04)
    fig.suptitle("Paper grammar H1: persona × article MPR — modes not averaged", fontsize=12)
    savefig(fig, "fig10_h_persona_article_mpr.png")

    fig, axes = plt.subplots(1, 2, figsize=(13.2, 6.6))
    mat_c = pivot_mean(th_cont, PERSONA_ORDER, ARTICLES, "rest", "articleId", val="maxMI")
    mat_d = pivot_mean(th_dual, PERSONA_ORDER, ARTICLES, "rest", "articleId", val="maxMI")
    im0 = heatmap(axes[0], mat_c, [p.replace("_", " ") for p in PERSONA_ORDER], [ART_SHORT[a] for a in ARTICLES], "H T2c max event MI")
    im1 = heatmap(axes[1], mat_d, [p.replace("_", " ") for p in PERSONA_ORDER], [ART_SHORT[a] for a in ARTICLES], "H T2d max event MI")
    fig.colorbar(im0, ax=axes[0], fraction=0.046, pad=0.04)
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04)
    fig.suptitle("Paper grammar: persona × article max event MI", fontsize=12)
    savefig(fig, "fig11_h_persona_article_maxmi.png")

    fig, axes = plt.subplots(1, 2, figsize=(13.2, 6.6))
    mat_c = pivot_mean(th_cont, PERSONA_ORDER, ARTICLES, "rest", "articleId", val="kStarContinuous")
    mat_d = pivot_mean(th_dual, PERSONA_ORDER, ARTICLES, "rest", "articleId", val="kStarDiscrete")
    im0 = heatmap(axes[0], mat_c, [p.replace("_", " ") for p in PERSONA_ORDER], [ART_SHORT[a] for a in ARTICLES], "H T2c k* tick (— = none, not 0)", vmin=1, vmax=8, cmap="viridis", ndigits=0)
    im1 = heatmap(axes[1], mat_d, [p.replace("_", " ") for p in PERSONA_ORDER], [ART_SHORT[a] for a in ARTICLES], "H T2d k* tick (— = none, not 0)", vmin=1, vmax=8, cmap="viridis", ndigits=0)
    fig.colorbar(im0, ax=axes[0], fraction=0.046, pad=0.04)
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04)
    fig.suptitle("Paper grammar: k* (first irreversible mean MI>3). Grey — is no k*, not tick 0", fontsize=12)
    savefig(fig, "fig12_h_persona_article_kstar.png")

    fig, axes = plt.subplots(1, 2, figsize=(12.6, 4.4))
    mat_c = pivot_mean(the_cont, MIX_ORDER, ARTICLES, "rest", "articleId")
    mat_d = pivot_mean(the_dual, MIX_ORDER, ARTICLES, "rest", "articleId")
    im0 = heatmap(axes[0], mat_c, MIX_ORDER, [ART_SHORT[a] for a in ARTICLES], "He T2c mix × article meanMI")
    im1 = heatmap(axes[1], mat_d, MIX_ORDER, [ART_SHORT[a] for a in ARTICLES], "He T2d mix × article meanMI")
    fig.colorbar(im0, ax=axes[0], fraction=0.046, pad=0.04)
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04)
    fig.suptitle("Paper grammar H2b: heterogeneous mix × article (composition, not a single He mean)", fontsize=12)
    savefig(fig, "fig13_he_mix_article_mpr.png")

    fig, axes = plt.subplots(1, 2, figsize=(12.6, 4.4))
    mat_c = pivot_mean(the_cont, MIX_ORDER, ARTICLES, "rest", "articleId", val="maxMI")
    mat_d = pivot_mean(the_dual, MIX_ORDER, ARTICLES, "rest", "articleId", val="maxMI")
    im0 = heatmap(axes[0], mat_c, MIX_ORDER, [ART_SHORT[a] for a in ARTICLES], "He T2c max event MI")
    im1 = heatmap(axes[1], mat_d, MIX_ORDER, [ART_SHORT[a] for a in ARTICLES], "He T2d max event MI")
    fig.colorbar(im0, ax=axes[0], fraction=0.046, pad=0.04)
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04)
    fig.suptitle("Paper grammar: heterogeneous mix × article max event MI", fontsize=12)
    savefig(fig, "fig14_he_mix_article_maxmi.png")

    fig, axes = plt.subplots(1, 2, figsize=(13.2, 6.6))
    mat_c = pivot_mean(th_cont, PERSONA_ORDER, TOPOS, "rest", "topology")
    mat_d = pivot_mean(th_dual, PERSONA_ORDER, TOPOS, "rest", "topology")
    im0 = heatmap(axes[0], mat_c, [p.replace("_", " ") for p in PERSONA_ORDER], labels, "H T2c persona × topology")
    im1 = heatmap(axes[1], mat_d, [p.replace("_", " ") for p in PERSONA_ORDER], labels, "H T2d persona × topology")
    fig.colorbar(im0, ax=axes[0], fraction=0.046, pad=0.04)
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04)
    fig.suptitle("Persona × topology — 8 topologies, modes not averaged", fontsize=12)
    savefig(fig, "fig15_persona_topology_mpr.png")

    fig, axes = plt.subplots(1, 2, figsize=(12.6, 4.4))
    mat_c = pivot_mean(the_cont, MIX_ORDER, TOPOS, "rest", "topology")
    mat_d = pivot_mean(the_dual, MIX_ORDER, TOPOS, "rest", "topology")
    im0 = heatmap(axes[0], mat_c, MIX_ORDER, labels, "He T2c mix × topology")
    im1 = heatmap(axes[1], mat_d, MIX_ORDER, labels, "He T2d mix × topology")
    fig.colorbar(im0, ax=axes[0], fraction=0.046, pad=0.04)
    fig.colorbar(im1, ax=axes[1], fraction=0.046, pad=0.04)
    fig.suptitle("Mix × topology", fontsize=12)
    savefig(fig, "fig16_mix_topology_mpr.png")

    # topology × article (H and He, one mode each page-like 2x2)
    fig, axes = plt.subplots(2, 2, figsize=(12.4, 8.2))
    specs = [
        (axes[0, 0], th_cont, "H T2c topology × article"),
        (axes[0, 1], th_dual, "H T2d topology × article"),
        (axes[1, 0], the_cont, "He T2c topology × article"),
        (axes[1, 1], the_dual, "He T2d topology × article"),
    ]
    for ax, src, title in specs:
        mat = pivot_mean(src, TOPOS, ARTICLES, "topology", "articleId")
        im = heatmap(ax, mat, labels, [ART_SHORT[a] for a in ARTICLES], title)
        fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    fig.suptitle("Topology × article meanMI (paper Exp A grammar, 8 topologies)", fontsize=12)
    savefig(fig, "fig17_topology_article_mpr.png")

    fig, axes = plt.subplots(1, 2, figsize=(12.0, 4.6), sharey=True)
    for ax, arm in ((axes[0], "H"), (axes[1], "He")):
        sub = topo_df[topo_df["arm"] == arm].set_index("topology")
        x = np.arange(len(TOPOS))
        w = 0.38
        ax.bar(x - w / 2, [100 * sub.loc[t, "dead_rate_continuous"] for t in TOPOS], w, label="T2c dead %", color=C_CONT, hatch="//", edgecolor="white")
        ax.bar(x + w / 2, [100 * sub.loc[t, "dead_rate_dual"] for t in TOPOS], w, label="T2d dead %", color=C_DISC, hatch="//", edgecolor="white")
        ax.set_xticks(x)
        ax.set_xticklabels(labels, rotation=25, ha="right")
        ax.set_ylabel("hatched dead cells (%)")
        ax.set_title(f"{arm} dead-cell rate")
        ax.set_ylim(0, 55)
        ax.legend(frameon=False, fontsize=8)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
    fig.suptitle(f"Hatched dead kept (live tables n={n_dead_table}; not zeros; not mix immunity)", fontsize=11)
    savefig(fig, "fig18_dead_rates.png")

    fig, axes = plt.subplots(1, 2, figsize=(12.0, 4.6), sharey=True)
    for ax, arm in ((axes[0], "H"), (axes[1], "He")):
        sub = topo_df[topo_df["arm"] == arm].set_index("topology")
        x = np.arange(len(TOPOS))
        w = 0.38
        ax.bar(x - w / 2, [100 * (sub.loc[t, "kStar_rate_continuous"] or 0) for t in TOPOS], w, label="T2c k* %", color=C_CONT, edgecolor="white")
        ax.bar(x + w / 2, [100 * (sub.loc[t, "kStar_rate_dual"] or 0) for t in TOPOS], w, label="T2d k* %", color=C_DISC, edgecolor="white")
        ax.set_xticks(x)
        ax.set_xticklabels(labels, rotation=25, ha="right")
        ax.set_ylabel("% live cells with k*")
        ax.set_title(f"{arm} irreversible k*")
        ax.set_ylim(0, 80)
        ax.legend(frameon=False, fontsize=8)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
    fig.suptitle("k* by topology — per scoring mode, not pooled", fontsize=11)
    savefig(fig, "fig19_kstar_rates.png")

    fig, axes = plt.subplots(1, 2, figsize=(12.0, 4.6))
    subh = topo_df[topo_df["arm"] == "H"].set_index("topology")
    subhe = topo_df[topo_df["arm"] == "He"].set_index("topology")
    x = np.arange(len(TOPOS))
    w = 0.38
    axes[0].bar(x - w / 2, [subh.loc[t, "meanDualGap"] or 0 for t in TOPOS], w, label="H", color=C_H, edgecolor="white")
    axes[0].bar(x + w / 2, [subhe.loc[t, "meanDualGap"] or 0 for t in TOPOS], w, label="He", color=C_HE, edgecolor="white")
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(labels, rotation=25, ha="right")
    axes[0].set_ylabel("mean dual gap (discrete − sidecar continuous)")
    axes[0].set_title("Dual gap — scoring diagnostic, not MPR")
    axes[0].legend(frameon=False, fontsize=8)
    axes[0].spines["top"].set_visible(False)
    axes[0].spines["right"].set_visible(False)
    axes[1].bar(x - w / 2, [subh.loc[t, "meanAgreement"] or 0 for t in TOPOS], w, label="H", color=C_H, edgecolor="white")
    axes[1].bar(x + w / 2, [subhe.loc[t, "meanAgreement"] or 0 for t in TOPOS], w, label="He", color=C_HE, edgecolor="white")
    axes[1].set_xticks(x)
    axes[1].set_xticklabels(labels, rotation=25, ha="right")
    axes[1].set_ylabel("mean dual agreement")
    axes[1].set_title("IFD-adjacent: dual agreement (CR/MR/IR not in tables)")
    axes[1].legend(frameon=False, fontsize=8)
    axes[1].spines["top"].set_visible(False)
    axes[1].spines["right"].set_visible(False)
    fig.suptitle("IFD fields that exist in live tables", fontsize=12)
    savefig(fig, "fig20_ifd_dual_gap_agreement.png")

    fig, ax = plt.subplots(figsize=(10.2, 4.6))
    grouped_bars(
        ax,
        [ART_SHORT[a] for a in ARTICLES],
        [article_df[(article_df.articleId == a) & (article_df.arm == "H")].iloc[0].continuous_MPR for a in ARTICLES],
        [article_df[(article_df.articleId == a) & (article_df.arm == "H")].iloc[0].discrete_MPR for a in ARTICLES],
        "H T2c",
        "H T2d",
        C_CONT,
        C_DISC,
        "mean cell meanMI (live, all topologies)",
        "H article valence — modes not averaged",
    )
    savefig(fig, "fig21_article_valence_h.png")

    fig, ax = plt.subplots(figsize=(10.2, 4.6))
    grouped_bars(
        ax,
        [ART_SHORT[a] for a in ARTICLES],
        [article_df[(article_df.articleId == a) & (article_df.arm == "He")].iloc[0].continuous_MPR for a in ARTICLES],
        [article_df[(article_df.articleId == a) & (article_df.arm == "He")].iloc[0].discrete_MPR for a in ARTICLES],
        "He T2c",
        "He T2d",
        C_CONT,
        C_DISC,
        "mean cell meanMI (live, all topologies)",
        "He article valence — modes not averaged",
    )
    savefig(fig, "fig22_article_valence_he.png")

    write_markdown(key, c1, c2, c3, c4, pooled, pooled_meta, topo_df, persona_df, mix_df, family_df, article_df, dnet, harvest, compare, tests)
    print("Wrote README.md, COMPARISONS.md, notes/")


def _test_line(t: dict) -> str:
    if not t:
        return "—"
    if t.get("skipped"):
        return f"skipped ({t['skipped']})"
    if t.get("test") == "wilcoxon_signed_rank":
        return f"W={t.get('statistic'):.3g}, p={t.get('p'):.4g}, median Δ={fmt4(t.get('median_delta_b_minus_a'))}, n={t.get('n')} (n+={t.get('n_pos')}, n-={t.get('n_neg')})"
    if t.get("test") == "spearmanr":
        return f"ρ={t.get('rho'):.3f}, p={t.get('p'):.4g}, n={t.get('n')}"
    if t.get("test") == "mannwhitneyu":
        return f"U={t.get('statistic'):.3g}, p={t.get('p'):.4g}, median_a={fmt4(t.get('median_a'))}, median_b={fmt4(t.get('median_b'))}, n={t.get('n_a')}/{t.get('n_b')}"
    return json.dumps({k: t[k] for k in t if k != "note"})


def write_markdown(key, c1, c2, c3, c4, pooled, pooled_meta, topo_df, persona_df, mix_df, family_df, article_df, dnet, harvest, compare, tests):
    fig_list = sorted(p.name for p in FIG.glob("*.png"))

    readme = []
    readme.append("# Phase 2 full analysis (`analysis_full_reconciled/`)")
    readme.append("")
    readme.append("Isolated folder for the **full Phase 2 harvest**. Does not overwrite Phase 1 `thesisExperiment/analysis/` or `analysis_phase2/`.")
    readme.append("")
    readme.append("## Source")
    readme.append("")
    readme.append("Live tables only: `thesisExperiment/results_phase2/tables_reconciled/`.")
    readme.append("`/workspace/Paper/` was **not present** in this environment. Visual grammar follows the previous campaign’s CIKM-style pack:")
    readme.append("`discovery/04_stats/heatmap_spec.md`, `discovery/08_figures/figure_plan.md`, `scripts/plot_results.py` (persona/mix × article heatmaps, k* as absence not zero, homo vs hetero, topology facets).")
    readme.append("Structural D-net numbers (depth/breadth) come from `results_phase2/debnath_compare.json` when present; **all MI/MPR/k*/dead/IFD-adjacent numbers come from the CSVs.**")
    readme.append("")
    readme.append("## Hard rules (honoured)")
    readme.append("")
    readme.append("- Do not invent MI. Dead cells stay in the ledger; they are **excluded from means**, not coded as 0.")
    readme.append("- Discrete (T2d headline) ≠ continuous (T2c headline). Never averaged into one headline MPR.")
    readme.append("- Dual gap is **not** a third MPR.")
    readme.append(f"- N=1 replicate. **{N_HOPS} hops** vs CIKM {CIKM_HOPS}.")
    readme.append(f"- Hatched-dead kept. Live `dead_cells.csv` has **{key['nDead_live_tables']}** rows (brief said 290; TH+THe dead flags = {key['nDead_TH_plus_THe']}).")
    readme.append("- Pooling concatenates article-cells across topologies. **Not** a physical super-graph.")
    readme.append(f"- D-net is a **{DNET_N_NODES}-node** custom hashtag graph, reported separately. Auditor MI ≠ Twitter MPR.")
    readme.append("- Never print `.env`.")
    readme.append("- Exploratory SciPy tests treat topology means or pooled cells as vectors. They are **not** campaign-replicate inference.")
    readme.append("")
    readme.append("## Metrics present in live tables")
    readme.append("")
    readme.append("| metric | table field | notes |")
    readme.append("| --- | --- | --- |")
    readme.append("| meanMI (cell headline) | `meanMI` | parse_phase2.js scored-event mean |")
    readme.append("| MPR | `meanNodeMPR` | mean-of-node-means; reported beside meanMI, not mixed into it |")
    readme.append("| k* | `kStarContinuous` (T2c) / `kStarDiscrete` (T2d) | first irreversible mean MI>3; null = none |")
    readme.append("| dead | `dead` / `hatchStatus` | nScored≤1 after LLM; hatched |")
    readme.append("| IFD-adjacent | `meanAgreement`, `meanDualGap` | CR/MR/IR **not** in tables — not invented |")
    readme.append("| hop-wise MI | — | **absent** from live tables; hop figures omitted |")
    readme.append("")
    readme.append("## How to regenerate")
    readme.append("")
    readme.append("```bash")
    readme.append("python3 thesisExperiment/analysis_full_reconciled/analyze_full_reconciled.py")
    readme.append("```")
    readme.append("")
    readme.append("Writes `tables/`, `figures/`, `COMPARISONS.md`, `key_numbers.json`, `notes/`.")
    readme.append("")
    readme.append("## Figure list")
    readme.append("")
    readme.append("| file | what |")
    readme.append("| --- | --- |")
    captions = {
        "fig00_methods.png": "Methods schematic (8 hops, two IFD instruments)",
        "fig01_c1_h_vs_he_same_mode.png": "C1 same-mode H vs He by topology",
        "fig02_c1_delta_he_minus_h.png": "C1 Δ(He−H) by topology",
        "fig03_c2_c3_same_arm_different_mpr.png": "C2/C3 T2c vs T2d within H and within He",
        "fig04_c2_c3_paired_scatter.png": "Paired live cells T2c vs T2d",
        "fig05_c4_cross_mode.png": "C4 cross-mode two-factor table (not pooled)",
        "fig06_c5_pooled_h_vs_he.png": "C5 cell-pooled H vs He",
        "fig07_c5_conspiracy_composition.png": "C5 family and mix composition",
        "fig08_c5_dnet.png": "C5 D-net 63-node auditor MI",
        "fig09_dnet_structural.png": "D-net structural compare (not MPR)",
        "fig10_h_persona_article_mpr.png": "H persona × article MPR heatmaps",
        "fig11_h_persona_article_maxmi.png": "H persona × article max MI",
        "fig12_h_persona_article_kstar.png": "H persona × article k*",
        "fig13_he_mix_article_mpr.png": "He mix × article MPR",
        "fig14_he_mix_article_maxmi.png": "He mix × article max MI",
        "fig15_persona_topology_mpr.png": "H persona × topology",
        "fig16_mix_topology_mpr.png": "He mix × topology",
        "fig17_topology_article_mpr.png": "Topology × article, all arms/modes",
        "fig18_dead_rates.png": "Hatched dead rates",
        "fig19_kstar_rates.png": "k* rates",
        "fig20_ifd_dual_gap_agreement.png": "Dual gap + agreement (not MPR)",
        "fig21_article_valence_h.png": "H article valence",
        "fig22_article_valence_he.png": "He article valence",
    }
    for f in fig_list:
        readme.append(f"| `figures/{f}` | {captions.get(f, '')} |")
    readme.append("")
    readme.append("## Numbered findings")
    readme.append("")
    readme.append("See `COMPARISONS.md`.")
    readme.append("")
    (OUT / "README_analysis.md").write_text("\n".join(readme))
    (FIG / "captions.md").write_text("\n".join(["# Figure captions", ""] + [f"### `{k}`\n\n{v}\n" for k, v in captions.items() if k in fig_list]))

    # COMPARISONS.md
    c = []
    c.append("# Phase 2 full comparisons — numbered findings")
    c.append("")
    c.append("Live tables only. N=1. 8 hops vs CIKM 30. Discrete ≠ continuous. Dual gap ≠ MPR. Dead cells hatched and kept.")
    c.append("Exploratory SciPy lines are **not** replicate inference.")
    c.append("")
    c.append("## Harvest snapshot")
    c.append("")
    c.append(
        md_table(
            ["slice", "n cells", "n live", "meanMI", "meanNodeMPR", "k* rate", "dead rate"],
            [
                ["T2c_H", "576", str(key["nLive_T2c_H"]), fmt4(key["meanMI_T2c_H"]), fmt4(key["meanNodeMPR_T2c_H"]), fmt_pct(key["kStar_T2c_H"]), fmt_pct(key["deadRate_T2c_H"])],
                ["T2c_He", "288", str(key["nLive_T2c_He"]), fmt4(key["meanMI_T2c_He"]), fmt4(key["meanNodeMPR_T2c_He"]), fmt_pct(key["kStar_T2c_He"]), fmt_pct(key["deadRate_T2c_He"])],
                ["T2d_H", "576", str(key["nLive_T2d_H"]), fmt4(key["meanMI_T2d_H"]), fmt4(key["meanNodeMPR_T2d_H"]), fmt_pct(key["kStar_T2d_H"]), fmt_pct(key["deadRate_T2d_H"])],
                ["T2d_He", "288", str(key["nLive_T2d_He"]), fmt4(key["meanMI_T2d_He"]), fmt4(key["meanNodeMPR_T2d_He"]), fmt_pct(key["kStar_T2d_He"]), fmt_pct(key["deadRate_T2d_He"])],
            ],
        )
    )
    c.append("")
    c.append(f"Hatched-dead rows in `dead_cells.csv`: **{key['nDead_live_tables']}** (brief 290). All kept.")
    c.append("")

    c.append("## 1. Same topology, homo vs hetero, SAME MPR mode")
    c.append("")
    c.append("Pairs: `T2c_H` vs `T2c_He`; `T2d_H` vs `T2d_He`. CSV: `tables/c1_same_mode_h_vs_he_by_topology.csv`.")
    c.append("Figures: `fig01_c1_h_vs_he_same_mode.png`, `fig02_c1_delta_he_minus_h.png`.")
    c.append("")
    c.append(
        md_table(
            ["topology", "T2c H", "T2c He", "Δ He−H", "T2d H", "T2d He", "Δ He−H"],
            [
                [
                    r.topology,
                    fmt4(r.meanMI_T2c_H),
                    fmt4(r.meanMI_T2c_He),
                    fmt4(r.delta_He_minus_H_T2c),
                    fmt4(r.meanMI_T2d_H),
                    fmt4(r.meanMI_T2d_He),
                    fmt4(r.delta_He_minus_H_T2d),
                ]
                for r in c1.itertuples()
            ],
        )
    )
    c.append("")
    c.append(f"**1.1** Cell-pooled same-mode Δ(He−H): continuous **{fmt4(key['c1_T2c_He_minus_H_cell_pool'])}** (H {fmt4(key['meanMI_T2c_H'])} vs He {fmt4(key['meanMI_T2c_He'])}); dual-discrete **{fmt4(key['c1_T2d_He_minus_H_cell_pool'])}** (H {fmt4(key['meanMI_T2d_H'])} vs He {fmt4(key['meanMI_T2d_He'])}). Collapsed He is higher on both instruments.")
    c1_t2c_he_gt = ", ".join(c1.loc[c1["delta_He_minus_H_T2c"] > 0, "topology"].tolist()) or "none"
    c1_t2c_h_gt = ", ".join(c1.loc[c1["delta_He_minus_H_T2c"] < 0, "topology"].tolist()) or "none"
    c.append(f"**1.2** Topology-mean Δ(He−H) averaged over 8 topologies: T2c **{fmt4(key['c1_T2c_mean_topo_delta'])}**; T2d **{fmt4(key['c1_T2d_mean_topo_delta'])}**. He>H on **{key['c1_T2c_n_topologies_He_gt_H']}/8** topologies (continuous) and **{key['c1_T2d_n_topologies_He_gt_H']}/8** (dual-discrete). Continuous He>H is **not uniform**: He higher on {c1_t2c_he_gt}; H higher on {c1_t2c_h_gt}. Dual-discrete He>H on every topology. Exploratory Wilcoxon median Δ on T2c is near 0 because the four negative path-graph deltas cancel the four large echo/polar/hier positives — cell-pooled and topo-equal means stay positive because the positive gaps are larger.")
    c.append("**1.3** That is **not** “hetero buffers firestorms.” Collapsed H mixes conspiracy BPs with scientists; collapsed He mixes conspiracy-heavy `mix_00`/`mix_01` with conspiracy-free `mix_02`. See §5.")
    c.append(f"**1.4** Exploratory Wilcoxon on 8 topology means: T2c {_test_line(tests['c1_wilcoxon_T2c_He_vs_H_topo8'])}; T2d {_test_line(tests['c1_wilcoxon_T2d_He_vs_H_topo8'])}. N=1 seed.")
    c.append("**1.5** Dead He cells are hatched (`nScored≤1` after LLM), not evidence that mix immunises.")
    c.append("")
    (NOTES / "01_same_mode_h_vs_he.md").write_text("\n".join(c[-12:]) + "\n")

    c.append("## 2. Same topology, homo vs homo, DIFFERENT MPR (`T2c_H` vs `T2d_H`)")
    c.append("")
    c.append("CSV: `tables/c2_homo_t2c_vs_t2d_by_topology.csv`, paired live cells `c2_homo_t2c_vs_t2d_paired_live_cells.csv`.")
    c.append("")
    c.append(
        md_table(
            ["topology", "T2c H cont", "T2d H disc", "Δ disc−cont", "n live T2c", "n live T2d", "dual gap"],
            [
                [r.topology, fmt4(r.meanMI_T2c_H_continuous), fmt4(r.meanMI_T2d_H_dualDiscrete), fmt4(r.delta_dual_minus_continuous), str(int(r.n_live_T2c_H)), str(int(r.n_live_T2d_H)), fmt4(r.meanDualGap_T2d)]
                for r in c2.itertuples()
            ],
        )
    )
    c.append("")
    c.append(f"**2.1** Dual-discrete sits above continuous on **{key['c2_n_topologies_discrete_gt_continuous']}/8** H topologies. Mean topology Δ(disc−cont) = **{fmt4(key['c2_mean_topo_delta_dual_minus_cont'])}**.")
    c.append("**2.2** This is a **scoring-mode / instrument** difference, not evidence that the dual campaign “found more misinformation” in a shared unit. Dual ≠ continuous. Do not average the two headlines.")
    c.append(f"**2.3** Paired live cells (same topology × persona × article, both live): n={key['c2_n_paired_live_cells']}; median Δ(T2d−T2c)={fmt4(key['c2_paired_median_delta'])}. Dead on one side only: T2c {key['c2_n_dead_continuous_only']}, T2d {key['c2_n_dead_dual_only']}; both dead {key['c2_n_dead_both']}. Dead cells were not filled with 0.")
    c.append(f"**2.4** Dual gap on H live cells (discrete − sidecar continuous on the **same** dual events) = **{fmt4(key['meanDualGap_H'])}**. That sidecar is not the T2c headline. Dual gap is not a third MPR.")
    c.append(f"**2.5** Exploratory Wilcoxon (8 topo means): {_test_line(tests['c2_wilcoxon_T2d_vs_T2c_H_topo8'])}. Spearman rank of topology means: {_test_line(tests['c2_spearman_H_topo_cont_vs_disc'])}.")
    c.append("")

    c.append("## 3. Same topology, hetero vs hetero, DIFFERENT MPR (`T2c_He` vs `T2d_He`)")
    c.append("")
    c.append("CSV: `tables/c3_hetero_t2c_vs_t2d_by_topology.csv`.")
    c.append("")
    c.append(
        md_table(
            ["topology", "T2c He cont", "T2d He disc", "Δ disc−cont", "n live T2c", "n live T2d", "dual gap"],
            [
                [r.topology, fmt4(r.meanMI_T2c_He_continuous), fmt4(r.meanMI_T2d_He_dualDiscrete), fmt4(r.delta_dual_minus_continuous), str(int(r.n_live_T2c_He)), str(int(r.n_live_T2d_He)), fmt4(r.meanDualGap_T2d)]
                for r in c3.itertuples()
            ],
        )
    )
    c.append("")
    c.append(f"**3.1** Dual-discrete sits above continuous on **{key['c3_n_topologies_discrete_gt_continuous']}/8** He topologies. Mean topology Δ(disc−cont) = **{fmt4(key['c3_mean_topo_delta_dual_minus_cont'])}**.")
    c.append(f"**3.2** Paired live He cells n={key['c3_n_paired_live_cells']}; median Δ={fmt4(key['c3_paired_median_delta'])}. Same-instrument warning as §2: do not pool T2c and T2d.")
    c.append(f"**3.3** Dual gap He live = **{fmt4(key['meanDualGap_He'])}**; agreement = **{fmt4(key['meanAgreement_He'])}**. IFD CR/MR/IR are not in the live tables.")
    c.append(f"**3.4** Exploratory Wilcoxon (8 topo means): {_test_line(tests['c3_wilcoxon_T2d_vs_T2c_He_topo8'])}. Spearman: {_test_line(tests['c3_spearman_He_topo_cont_vs_disc'])}.")
    c.append("")

    c.append("## 4. Cross-mode: homo vs hetero AND different MPR")
    c.append("")
    c.append("Pairs: `T2c_H` vs `T2d_He`; `T2d_H` vs `T2c_He`. **Separate labelled table. Not a pooled mean. Not a third MPR.**")
    c.append("CSV: `tables/c4_cross_mode_by_topology.csv`. Figure: `fig05_c4_cross_mode.png`.")
    c.append("")
    c.append(
        md_table(
            ["topology", "T2c_H", "T2d_He", "Δ T2d_He−T2c_H", "T2d_H", "T2c_He", "Δ T2c_He−T2d_H"],
            [
                [
                    r.topology,
                    fmt4(r.meanMI_T2c_H),
                    fmt4(r.meanMI_T2d_He),
                    fmt4(r.delta_T2d_He_minus_T2c_H),
                    fmt4(r.meanMI_T2d_H),
                    fmt4(r.meanMI_T2c_He),
                    fmt4(r.delta_T2c_He_minus_T2d_H),
                ]
                for r in c4.itertuples()
            ],
        )
    )
    c.append("")
    c.append(f"**4.1** Mean topology Δ(T2d_He − T2c_H) = **{fmt4(key['c4_mean_topo_delta_T2dHe_minus_T2cH'])}**. This mixes a higher-scoring instrument (dual-discrete) with the He composition mix. Do not read it as an identity effect.")
    c.append(f"**4.2** Mean topology Δ(T2c_He − T2d_H) = **{fmt4(key['c4_mean_topo_delta_T2cHe_minus_T2dH'])}**. Signs can reverse because the scoring-mode gap is large. That reversal is why C4 must stay unpooled.")
    c.append("**4.3** No C4 headline is formed by averaging the two cross-mode deltas or by averaging discrete with continuous.")
    c.append("")

    c.append("## 5. Pooled cells (concatenation) and D-net 63-node graph")
    c.append("")
    c.append("Pooling = concatenate live article-cells across the eight 8-node topologies. **This is not a physical super-graph.** D-net is a separate 63-node custom graph.")
    c.append("CSV: `tables/c5_pooled_cells.csv`, `c5_pooled_vs_topology_equal.csv`, `c5_dnet_cells.csv`.")
    c.append("")
    c.append(
        md_table(
            ["pool", "n live", "meanMI", "meanNodeMPR", "k* rate"],
            [
                [r.pool, str(int(r.n_live)), fmt4(r.meanMI), fmt4(r.meanNodeMPR), fmt_pct(r.kStar_rate)]
                for r in pooled.itertuples()
            ],
        )
    )
    c.append("")
    c.append(
        md_table(
            ["contrast", "cell-pooled H", "cell-pooled He", "Δ He−H", "topo-equal H", "topo-equal He", "Δ He−H"],
            [
                [r.contrast, fmt4(r.cell_pooled_H), fmt4(r.cell_pooled_He), fmt4(r.cell_pooled_He_minus_H), fmt4(r.topo_equal_H), fmt4(r.topo_equal_He), fmt4(r.topo_equal_He_minus_H)]
                for r in pooled_meta.itertuples()
            ],
        )
    )
    c.append("")
    c.append(f"**5.1 H vs He on the pooled cell set.** Same pattern as C1: He > H on both instruments (continuous Δ={fmt4(key['c1_T2c_He_minus_H_cell_pool'])}; dual-discrete Δ={fmt4(key['c1_T2d_He_minus_H_cell_pool'])}). Topology-equal weighting does not flip the sign (see table). Exploratory MW: T2c {_test_line(tests['c5_mw_T2c_H_vs_He_cells'])}; T2d {_test_line(tests['c5_mw_T2d_H_vs_He_cells'])}.")
    c.append(f"**5.2 Conspiracy-composition still holds on the pooled H cells.** T2c family meanMI: conspiracy **{fmt4(key['c5_T2c_conspiracy_MPR'])}**, climate_action **{fmt4(key['c5_T2c_climate_action_MPR'])}**, science_env **{fmt4(key['c5_T2c_science_MPR'])}**. T2d: conspiracy **{fmt4(key['c5_T2d_conspiracy_MPR'])}**, climate_action **{fmt4(key['c5_T2d_climate_action_MPR'])}**, science_env **{fmt4(key['c5_T2d_science_MPR'])}**. Conspiracy remains the high group on both instruments.")
    c.append(f"**5.3 Mix composition still holds on pooled He cells.** mix_00 (4 conspiracy) T2c **{fmt4(key['mix00_only_T2c'])}** vs mix_02 (0 conspiracy) **{fmt4(key['mix02_only_T2c'])}**; T2d mix_00 **{fmt4(key['mix00_only_T2d'])}** vs mix_02 **{fmt4(key['mix02_only_T2d'])}**. mix_02 is lower on both instruments in these N=1 runs — not a law that “diversity always stops firestorms.”")
    c.append("**5.4** Collapsed He>H is therefore **compatible** with conspiracy composition: the H mean is pulled down by scientist personas; the He mean is pulled up by conspiracy-heavy mixes. Restricting H to conspiracy family reverses the naive H/He story (conspiracy H >> overall He).")
    c.append("")
    c.append("### D-net (63-node custom graph) — not pooled into the eight topologies")
    c.append("")
    c.append("Auditor MI on the reconstructed hashtag graph. **Not empirical Twitter MPR.**")
    c.append("")
    dnet_rows = []
    for r in dnet.itertuples():
        if r.miScoringMode == "dual":
            dnet_rows.append([r.experimentName, r.articleId, "dual-discrete", fmt4(r.meanMI), "—", fmt4(getattr(r, "meanContinuousMI", None)), "yes" if pd.notna(r.kStarDiscrete) else "none"])
        else:
            dnet_rows.append([r.experimentName, r.articleId, "continuous", "—", fmt4(r.meanMI), "—", "yes" if pd.notna(r.kStarContinuous) else "none"])
    c.append(md_table(["run", "article", "mode", "discrete MPR", "continuous MPR", "dual sidecar cont (not headline)", "k*"], dnet_rows))
    c.append("")
    c.append(f"**5.5 D-net H vs He (conspiracy-homogeneous vs mixed), continuous:** SCoPEx H {fmt4(key['dnet_c_H_scopex'])} vs He {fmt4(key['dnet_c_He_scopex'])}; chemtrails H {fmt4(key['dnet_c_H_chemtrails'])} vs He {fmt4(key['dnet_c_He_chemtrails'])}. Dual-discrete: SCoPEx H {fmt4(key['dnet_d_H_scopex'])} vs He {fmt4(key['dnet_d_He_scopex'])}; chemtrails H {fmt4(key['dnet_d_H_chemtrails'])} vs He {fmt4(key['dnet_d_He_chemtrails'])}.")
    c.append("**5.6** On D-net, **H (conspiracy) > He (mixed)** on both instruments and both seeds. That matches composition (D-net H is conspiracy-only) and **does not match** the naive 8-topology collapsed He>H, which mixed scientists into H. Composition holds; the H/He label does not travel unchanged onto the 63-node graph.")
    if compare:
        honesty = (compare.get("honesty") or {}).get("notes") or []
        for note in honesty:
            c.append(f"- {note}")
        struct = compare.get("structuralComparison") or {}
        dtfs = compare.get("dtfs") or {}
        c.append(f"- Structural similarity (compare json, not MI): {struct.get('structuralSimilarity')}; DTFS={dtfs.get('dtfs')} isValidated={dtfs.get('isValidated')}.")
    c.append("")

    c.append("## Paper-style metric notes")
    c.append("")
    c.append(
        md_table(
            ["persona", "family", "discrete MPR", "continuous MPR", "k* dual", "k* cont"],
            [
                [r.persona, r.family, fmt4(r.discrete_MPR), fmt4(r.continuous_MPR), fmt_pct(r.kStar_rate_dual), fmt_pct(r.kStar_rate_continuous)]
                for r in persona_df.itertuples()
            ],
        )
    )
    c.append("")
    c.append(
        md_table(
            ["mix", "composition", "discrete MPR", "continuous MPR", "k* dual", "k* cont"],
            [
                [r.mix, r.mix_note, fmt4(r.discrete_MPR), fmt4(r.continuous_MPR), fmt_pct(r.kStar_rate_dual), fmt_pct(r.kStar_rate_continuous)]
                for r in mix_df.itertuples()
            ],
        )
    )
    c.append("")
    c.append("**P.1** Heatmaps use live-cell means; all-dead persona×article (or mix×article) cells are **—**, not 0.00.")
    c.append("**P.2** k* heatmaps use grey **—** when the network never stayed above MI>3; that is not k*=0.")
    c.append(f"**P.3** Dual agreement (IFD-adjacent) H={fmt4(key['meanAgreement_H'])}, He={fmt4(key['meanAgreement_He'])}. Hop-wise MI, CR, MR, IR are **not in live tables** and were not invented.")
    c.append("")
    c.append("## Limitations (required)")
    c.append("")
    c.append("- N=1 (`graphRandomSeed` 42). No error bars on heatmap cells.")
    c.append("- 8 hops is logged cost compression vs CIKM 30, not a Debnath hop protocol.")
    c.append(f"- {key['nDead_live_tables']} hatched-dead cells kept; live-only means drop them.")
    c.append("- `thesisGrade` is false on the harvest.")
    c.append("- gpt-4o-mini roleplay is not chemtrails communities in the wild.")
    c.append("- D-net is a hashtag co-occurrence fallback, not a hydrated retweet cascade.")
    c.append("")
    (OUT / "COMPARISONS.md").write_text("\n".join(c))

    (NOTES / "02_homo_different_mpr.md").write_text(
        f"T2c_H vs T2d_H. Mean topo Δ(disc−cont)={fmt4(key['c2_mean_topo_delta_dual_minus_cont'])}; {key['c2_n_topologies_discrete_gt_continuous']}/8 topologies discrete>continuous. Dual gap H={fmt4(key['meanDualGap_H'])} is not MPR.\n"
    )
    (NOTES / "03_hetero_different_mpr.md").write_text(
        f"T2c_He vs T2d_He. Mean topo Δ={fmt4(key['c3_mean_topo_delta_dual_minus_cont'])}; {key['c3_n_topologies_discrete_gt_continuous']}/8. Dual gap He={fmt4(key['meanDualGap_He'])}.\n"
    )
    (NOTES / "04_cross_mode.md").write_text(
        f"CROSS-MODE table only. Mean Δ(T2d_He−T2c_H)={fmt4(key['c4_mean_topo_delta_T2dHe_minus_T2cH'])}; mean Δ(T2c_He−T2d_H)={fmt4(key['c4_mean_topo_delta_T2cHe_minus_T2dH'])}. Do not pool.\n"
    )
    (NOTES / "05_pooled_and_dnet.md").write_text(
        f"Pooling concatenates cells, not a super-graph. Pooled He>H (T2c Δ={fmt4(key['c1_T2c_He_minus_H_cell_pool'])}; T2d Δ={fmt4(key['c1_T2d_He_minus_H_cell_pool'])}) but conspiracy family still high and mix_02 still low. D-net 63-node: H conspiracy > He mixed on both seeds/modes.\n"
    )


if __name__ == "__main__":
    main()
