#!/usr/bin/env python3
"""Forensic audit of Phase 2 API failures and outcome-relevant fallbacks."""
from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNS = ROOT / "runs_phase2"
RESULTS = ROOT / "results_phase2"
OUT = ROOT / "analysis_full"
TABLES = OUT / "tables"
CANONICAL = RESULTS / "tables" / "all_rows.csv"

ARTICLE_IDS = [
    "scopex_2017",
    "chemtrails_gates_2018_2021",
    "sai_geoengineering",
    "paris_agreement",
    "climate_consensus",
    "polar_bears",
]
SLICES = ["T2c_H", "T2c_He", "T2d_H", "T2d_He"]


def load_json(path: Path):
    return json.loads(path.read_text())


def as_int(value) -> int:
    try:
        return int(value or 0)
    except (TypeError, ValueError):
        return 0


def mean(values):
    vals = [float(v) for v in values if v is not None]
    return sum(vals) / len(vals) if vals else None


def iso_from_dir(run_dir: str) -> str | None:
    match = re.search(r"_(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})-(\d{2})$", run_dir)
    return f"{match.group(1)}T{match.group(2)}:{match.group(3)}:{match.group(4)}Z" if match else None


def hour_from_dir(run_dir: str) -> str | None:
    stamp = iso_from_dir(run_dir)
    return stamp[:13] + ":00Z" if stamp else None


def events_for_run(run_dir: Path):
    events = []
    for node_path in sorted((run_dir / "nodes").glob("*.json")):
        node = load_json(node_path)
        for index, event in enumerate(node.get("history") or []):
            rec = dict(event)
            rec["_nodeId"] = node.get("nodeId") or node_path.stem
            rec["_personaId"] = node.get("personaId")
            rec["_eventIndex"] = index
            events.append(rec)
    return events


def eligible(event) -> bool:
    return (
        event.get("contentOut") is not None
        and event.get("action") in {"reinterpret", "forward"}
    )


def identity_fallback(event) -> bool:
    return (
        event.get("action") == "reinterpret"
        and event.get("contentOut") is not None
        and event.get("contentOut") == event.get("contentIn")
    )


def kstar(events):
    by_tick = defaultdict(list)
    for event in events:
        if event.get("misinfoIndex") is not None:
            tick = event.get("tick", event.get("hops"))
            by_tick[int(tick)].append(float(event["misinfoIndex"]))
    series = [(tick, mean(values)) for tick, values in sorted(by_tick.items())]
    for index, (tick, value) in enumerate(series):
        if value > 3 and all(later > 3 for _, later in series[index:]):
            return tick
    return None


def cell_metrics(events):
    scored = [event for event in events if event.get("misinfoIndex") is not None]
    by_node = defaultdict(list)
    for event in scored:
        by_node[event["_nodeId"]].append(float(event["misinfoIndex"]))
    return {
        "nEvents": len(events),
        "nEligible": sum(eligible(event) for event in events),
        "nScored": len(scored),
        "dead": len(scored) <= 1,
        "meanMI": mean([event["misinfoIndex"] for event in scored]),
        "meanNodeMPR": mean([mean(values) for values in by_node.values()]),
        "kStar": kstar(scored),
    }


def selected_log_section(experiment_name: str, run_dir: str) -> str | None:
    path = RESULTS / "logs" / f"{experiment_name}.log"
    if not path.exists():
        return None
    text = path.read_text(errors="replace")
    marker = f"[Simulation] Experiment: {run_dir}"
    pos = text.find(marker)
    if pos < 0:
        return None
    next_pos = text.find("\n=== ", pos)
    return text[pos:] if next_pos < 0 else text[pos:next_pos]


def classify_logs(section: str | None):
    out = Counter()
    if section is None:
        out["missing_log_section"] = 1
        return out
    for line in section.splitlines():
        if "LLM error during reinterpret:" in line:
            out["rewrite_caught_failures"] += 1
        elif "Auditor error for " in line:
            out["auditor_caught_failed_events"] += 1
        elif "Auditor IFD parse error:" in line:
            out["discrete_parse_fallbacks"] += 1
        elif "Auditor continuous parse error:" in line:
            out["continuous_parse_fallbacks"] += 1
        elif "FrameAuditor error:" in line:
            out["frame_auditor_failures"] += 1
        if "HTTP " in line:
            match = re.search(r"HTTP (\d{3})", line)
            out[f"logged_http_{match.group(1) if match else 'unknown'}"] += 1
        if "LLM HTTP timeout" in line:
            out["logged_timeouts"] += 1
        if re.search(r"\b(?:ECONN\w*|socket hang up|network error)\b", line, re.I):
            out["logged_transport_errors"] += 1
    return out


def score_schema_counts(event):
    out = Counter()
    ifd = event.get("ifd")
    if not isinstance(ifd, dict):
        return out
    mode = ifd.get("mode")
    scores = ifd.get("scores")
    if mode in {"continuous", "discrete"} and not isinstance(scores, list):
        out["scored_missing_scores_array"] += 1
    if isinstance(scores, list):
        if len(scores) != 5:
            out["scored_nonfive_scores"] += 1
        if any(value is None for value in scores):
            out["scored_null_score_values"] += 1
    dual = ifd.get("dual")
    if mode == "dual":
        if not isinstance(dual, dict):
            out["dual_missing_sidecar"] += 1
        else:
            for side in ("discrete", "continuous"):
                side_scores = (dual.get(side) or {}).get("scores")
                if not isinstance(side_scores, list):
                    out[f"dual_{side}_missing_scores_array"] += 1
                else:
                    if len(side_scores) != 5:
                        out[f"dual_{side}_nonfive_scores"] += 1
                    if any(value is None for value in side_scores):
                        out[f"dual_{side}_null_score_values"] += 1
    return out


def csv_write(path: Path, rows):
    rows = list(rows)
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("")
        return
    fields = []
    for row in rows:
        for key in row:
            if key not in fields:
                fields.append(key)
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def aggregate(rows, keys):
    grouped = defaultdict(list)
    for row in rows:
        grouped[tuple(row.get(key) for key in keys)].append(row)
    result = []
    sum_fields = [
        "runs", "llm_calls", "http_errors", "expected_attempts",
        "reinterpret_events", "identity_rewrite_fallbacks",
        "audit_eligible_events", "scored_events", "unscored_eligible_events",
        "rewrite_caught_failures",
        "auditor_caught_failed_events", "parse_fallbacks", "aborted_selected_runs",
    ]
    for group, members in sorted(grouped.items(), key=lambda item: str(item[0])):
        rec = dict(zip(keys, group))
        for field in sum_fields:
            rec[field] = sum(as_int(member.get(field)) for member in members)
        rec["runs_with_http_errors"] = sum(as_int(member.get("http_errors")) > 0 for member in members)
        attempts = rec["llm_calls"] + rec["http_errors"]
        rec["http_error_rate"] = rec["http_errors"] / attempts if attempts else None
        rec["audit_success_rate_events"] = (
            rec["scored_events"] / rec["audit_eligible_events"]
            if rec["audit_eligible_events"] else None
        )
        result.append(rec)
    return result


def headline(rows, field="meanMI", dead_field="dead"):
    live = [row for row in rows if row.get(dead_field) is False and row.get(field) is not None]
    return mean([row[field] for row in live]), len(live)


def sensitivity_summary(cells):
    methods = {}
    for slice_name in SLICES:
        source = [cell for cell in cells if cell["slice"] == slice_name]
        canonical, canonical_n = headline(source)
        corrected, corrected_n = headline(source, "corrected_meanMI", "corrected_dead")
        clean_runs = [cell for cell in source if cell["run_http_errors"] == 0]
        clean, clean_n = headline(clean_runs)
        unaffected = [
            cell for cell in source
            if cell["raw_matches_canonical"]
            and cell["identity_rewrite_fallbacks"] == 0
            and cell["unscored_eligible_events"] == 0
        ]
        unaffected_mean, unaffected_n = headline(unaffected)
        methods[slice_name] = {
            "canonical_live_cell_mean": canonical,
            "canonical_live_cells": canonical_n,
            "identity_candidate_events_excluded_mean": corrected,
            "identity_candidate_events_excluded_live_cells": corrected_n,
            "zero_http_error_runs_only_mean": clean,
            "zero_http_error_runs_only_live_cells": clean_n,
            "unaffected_cells_only_mean": unaffected_mean,
            "unaffected_cells_only_live_cells": unaffected_n,
        }
    for method, h_key, he_key in (
        ("canonical", "canonical_live_cell_mean", "canonical_live_cell_mean"),
        ("identity_candidate_events_excluded", "identity_candidate_events_excluded_mean", "identity_candidate_events_excluded_mean"),
        ("zero_http_error_runs_only", "zero_http_error_runs_only_mean", "zero_http_error_runs_only_mean"),
        ("unaffected_cells_only", "unaffected_cells_only_mean", "unaffected_cells_only_mean"),
    ):
        for mode in ("T2c", "T2d"):
            h = methods[f"{mode}_H"][h_key]
            he = methods[f"{mode}_He"][he_key]
            methods[f"{method}_{mode}_He_minus_H"] = None if h is None or he is None else he - h
    return methods


def main():
    TABLES.mkdir(parents=True, exist_ok=True)
    canonical_rows = list(csv.DictReader(CANONICAL.open()))
    thesis_rows = [row for row in canonical_rows if row.get("slice") in SLICES]
    canonical_cells = {
        (row["runDir"], row["articleId"]): row
        for row in thesis_rows
    }
    selected = {}
    for row in thesis_rows:
        selected[row["runDir"]] = row
    assert len(selected) == 288, f"expected 288 selected thesis runs, got {len(selected)}"

    run_rows = []
    cell_rows = []
    global_schema = Counter()
    global_logs = Counter()
    identity_candidate_scores = []
    for run_name, canonical in sorted(selected.items()):
        run_dir = RUNS / run_name
        meta = load_json(run_dir / "metadata.json")
        state = load_json(run_dir / "state.json")
        events = events_for_run(run_dir)
        config = meta.get("config") or {}
        mode = config.get("miScoringMode") or canonical.get("miScoringMode")
        factor = 2 if mode == "dual" else 1
        usage = meta.get("llmUsage") or {}
        calls = as_int(usage.get("calls"))
        errors = as_int(usage.get("errors"))
        reinterprets = [event for event in events if event.get("action") == "reinterpret"]
        identities = [event for event in events if identity_fallback(event)]
        identity_candidate_scores.extend(
            float(event["misinfoIndex"])
            for event in identities
            if event.get("misinfoIndex") is not None
        )
        eligible_events = [event for event in events if eligible(event)]
        scored_events = [event for event in eligible_events if event.get("misinfoIndex") is not None]
        unscored_events = [event for event in eligible_events if event.get("misinfoIndex") is None]
        expected_attempts = len(reinterprets) + factor * len(eligible_events)
        log_counts = classify_logs(selected_log_section(canonical["experimentName"], run_name))
        global_logs.update(log_counts)
        schema = Counter()
        for event in scored_events:
            schema.update(score_schema_counts(event))
        global_schema.update(schema)
        raw_state_drift = int(
            str(meta.get("status")).lower() not in {"complete", "completed"}
            or str(state.get("status")).lower() != "complete"
        )
        row = {
            "runDir": run_name,
            "experimentName": canonical["experimentName"],
            "slice": canonical["slice"],
            "arm": canonical["arm"],
            "topology": canonical["topology"],
            "rest": canonical["rest"],
            "scoringMode": mode,
            "startHourUtc": hour_from_dir(run_name),
            "status": meta.get("status"),
            "stateStatus": state.get("status"),
            "runs": 1,
            "llm_calls": calls,
            "http_errors": errors,
            "expected_attempts": expected_attempts,
            "attempt_accounting_delta": expected_attempts - calls - errors,
            "reinterpret_events": len(reinterprets),
            "identity_rewrite_fallbacks": len(identities),
            "audit_eligible_events": len(eligible_events),
            "scored_events": len(scored_events),
            "unscored_eligible_events": len(unscored_events),
            "auditor_request_failures_derived": None,
            "rewrite_caught_failures": log_counts["rewrite_caught_failures"],
            "auditor_caught_failed_events": log_counts["auditor_caught_failed_events"],
            "logged_http_429": log_counts["logged_http_429"],
            "logged_other_http": sum(
                value for key, value in log_counts.items()
                if key.startswith("logged_http_") and key != "logged_http_429"
            ),
            "logged_timeouts": log_counts["logged_timeouts"],
            "logged_transport_errors": log_counts["logged_transport_errors"],
            "parse_fallbacks": log_counts["discrete_parse_fallbacks"] + log_counts["continuous_parse_fallbacks"],
            "schema_anomalies": sum(schema.values()),
            "aborted_selected_runs": 0 if canonical["status"].lower() in {"complete", "completed"} else 1,
            "raw_archive_state_drift": raw_state_drift,
            "log_section_found": int(not log_counts["missing_log_section"]),
        }
        run_rows.append(row)

        for article_id in ARTICLE_IDS:
            article_events = [event for event in events if event.get("articleId") == article_id]
            baseline = cell_metrics(article_events)
            fallback_events = [event for event in article_events if identity_fallback(event)]
            unscored = [event for event in article_events if eligible(event) and event.get("misinfoIndex") is None]
            corrected_events = [event for event in article_events if not identity_fallback(event)]
            corrected = cell_metrics(corrected_events)
            canon = canonical_cells[(run_name, article_id)]
            canonical_mean = float(canon["meanMI"]) if canon.get("meanMI") else None
            raw_matches_canonical = (
                int(canon["nEvents"]) == baseline["nEvents"]
                and int(canon["nScored"]) == baseline["nScored"]
                and (
                    (canonical_mean is None and baseline["meanMI"] is None)
                    or (
                        canonical_mean is not None
                        and baseline["meanMI"] is not None
                        and abs(canonical_mean - baseline["meanMI"]) <= 0.000051
                    )
                )
            )
            cell_rows.append({
                "runDir": run_name,
                "experimentName": canonical["experimentName"],
                "slice": canonical["slice"],
                "arm": canonical["arm"],
                "topology": canonical["topology"],
                "rest": canonical["rest"],
                "scoringMode": mode,
                "articleId": article_id,
                "run_http_errors": errors,
                "nEvents": int(canon["nEvents"]),
                "nEligible_raw": baseline["nEligible"],
                "nScored": int(canon["nScored"]),
                "dead": canon["dead"].lower() == "true",
                "meanMI": canonical_mean,
                "meanNodeMPR": float(canon["meanNodeMPR"]) if canon.get("meanNodeMPR") else None,
                "kStar": (
                    float(canon["kStarContinuous"] or canon["kStarDiscrete"])
                    if (canon.get("kStarContinuous") or canon.get("kStarDiscrete")) else None
                ),
                "raw_matches_canonical": raw_matches_canonical,
                "identity_rewrite_fallbacks": len(fallback_events),
                "identity_fallbacks_scored": sum(event.get("misinfoIndex") is not None for event in fallback_events),
                "unscored_eligible_events": len(unscored),
                "corrected_nScored": corrected["nScored"] if raw_matches_canonical else None,
                "corrected_dead": corrected["dead"] if raw_matches_canonical else None,
                "corrected_meanMI": corrected["meanMI"] if raw_matches_canonical else None,
                "corrected_meanNodeMPR": corrected["meanNodeMPR"] if raw_matches_canonical else None,
                "corrected_kStar": corrected["kStar"] if raw_matches_canonical else None,
                "delta_meanMI": (
                    None if not raw_matches_canonical or canonical_mean is None or corrected["meanMI"] is None
                    else corrected["meanMI"] - canonical_mean
                ),
            })

    reruns = []
    selected_names = {row["experimentName"]: row["runDir"] for row in run_rows}
    for name, chosen in sorted(selected_names.items()):
        candidates = []
        for path in RUNS.glob(f"{name}_20??-??-??_??-??-??"):
            meta_path = path / "metadata.json"
            if not meta_path.exists():
                continue
            meta = load_json(meta_path)
            usage = meta.get("llmUsage") or {}
            status = str(meta.get("status") or "").lower()
            calls = as_int(usage.get("calls"))
            errors = as_int(usage.get("errors"))
            complete = status in {"complete", "completed"} and calls > 0
            candidates.append({
                "runDir": path.name,
                "selected": path.name == chosen,
                "status": status,
                "calls": calls,
                "errors": errors,
                "cleanComplete": complete and errors == 0,
            })
        clean = [
            candidate for candidate in candidates
            if candidate["cleanComplete"] and not candidate["selected"]
        ]
        reruns.append({
            "experimentName": name,
            "selectedRunDir": chosen,
            "nRunDirectories": len(candidates),
            "nCompleteRuns": sum(
                candidate["status"] in {"complete", "completed"} and candidate["calls"] > 0
                for candidate in candidates
            ),
            "nCleanCompleteRuns": len(clean),
            "cleanReplacementRunDirs": ";".join(candidate["runDir"] for candidate in clean),
            "hasCleanReplacement": bool(clean),
        })

    by_slice = aggregate(run_rows, ["slice"])
    by_topology = aggregate(run_rows, ["slice", "topology"])
    by_mode = aggregate(run_rows, ["scoringMode"])
    by_time = aggregate(run_rows, ["startHourUtc"])
    sensitivity = sensitivity_summary(cell_rows)

    csv_write(TABLES / "api_error_by_run.csv", run_rows)
    csv_write(TABLES / "api_error_by_slice.csv", by_slice)
    csv_write(TABLES / "api_error_by_topology.csv", by_topology)
    csv_write(TABLES / "api_error_by_time.csv", by_time)
    csv_write(TABLES / "api_error_cells_sensitivity.csv", cell_rows)
    csv_write(TABLES / "api_error_rerun_replacements.csv", reruns)

    total = aggregate(run_rows, [])[0]
    total["raw_archive_state_drift"] = sum(row["raw_archive_state_drift"] for row in run_rows)
    total["canonical_cells_without_matching_raw_state"] = sum(
        not cell["raw_matches_canonical"] for cell in cell_rows
    )
    total["logged_http_429"] = sum(row["logged_http_429"] for row in run_rows)
    total["logged_other_http"] = sum(row["logged_other_http"] for row in run_rows)
    total["logged_timeouts"] = sum(row["logged_timeouts"] for row in run_rows)
    total["logged_transport_errors"] = sum(row["logged_transport_errors"] for row in run_rows)
    total["http_counter_without_caught_http_line"] = (
        total["http_errors"] - total["logged_http_429"] - total["logged_other_http"]
    )
    audit = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "scope": {
            "canonicalSource": str(CANONICAL.relative_to(ROOT.parent)),
            "selectedRuns": len(run_rows),
            "selectedCells": len(cell_rows),
            "selection": "exact runDir values in canonical all_rows.csv for the four thesis slices",
        },
        "totals": total,
        "counterInterpretation": {
            "llmUsage.calls": "successful provider responses recorded by recordUsage",
            "llmUsage.errors": "individual parseable HTTP responses with status >=400; no client retry loop",
            "uniqueRequestIdsAvailable": False,
            "providerRequestDeduplicationProvable": False,
            "attemptAccountingIdentity": "not exact: final node states and metadata counters are not an atomic request ledger",
            "attemptAccountingDelta": sum(row["attempt_accounting_delta"] for row in run_rows),
        },
        "logTaxonomy": dict(sorted(global_logs.items())),
        "schemaTaxonomy": dict(sorted(global_schema.items())),
        "breakdowns": {
            "bySlice": by_slice,
            "byScoringMode": by_mode,
            "byStartHourUtc": by_time,
        },
        "fallbackSemantics": {
            "rewriteFailure": "contentOut receives contentIn unchanged; action remains reinterpret",
            "auditorRequestFailure": "misinfoIndex and ifd remain null",
            "auditorParseFailureDiscrete": "five all-correct +1 scores, MI=0",
            "auditorParseFailureContinuous": "five all-correct 1.0 scores, MI=0",
            "observedParseFallbackWarnings": total["parse_fallbacks"],
            "identityRewriteCandidates": total["identity_rewrite_fallbacks"],
            "identityCandidatesInZeroErrorRuns": sum(
                row["identity_rewrite_fallbacks"] for row in run_rows if row["http_errors"] == 0
            ),
            "scoredIdentityCandidates": len(identity_candidate_scores),
            "scoredIdentityCandidatesWithMI0": sum(value == 0 for value in identity_candidate_scores),
            "meanMIOfScoredIdentityCandidates": mean(identity_candidate_scores),
            "caughtRewriteFailureLines": total["rewrite_caught_failures"],
            "unscoredEligibleEvents": total["unscored_eligible_events"],
        },
        "sensitivity": sensitivity,
        "reruns": {
            "experimentNamesWithMultipleDirectories": sum(row["nRunDirectories"] > 1 for row in reruns),
            "experimentNamesWithCleanCompleteReplacement": sum(row["hasCleanReplacement"] for row in reruns),
            "affectedExperimentNamesWithCleanCompleteReplacement": sum(
                row["hasCleanReplacement"]
                and next(run["http_errors"] for run in run_rows if run["experimentName"] == row["experimentName"]) > 0
                for row in reruns
            ),
            "detailsCsv": "tables/api_error_rerun_replacements.csv",
        },
        "limitations": [
            "No request IDs or raw responses were archived, so provider-side uniqueness and hidden dual Promise sibling status codes cannot be proved.",
            "Rewrite failures were not tagged in node events. contentOut==contentIn is only a conservative candidate marker: 211 such events occur in zero-error runs, so exact event linkage is impossible.",
            "The direct-fallback sensitivity excludes every identity candidate and therefore also excludes those 211 demonstrably non-HTTP-error exact outputs.",
            "Auditor parse warnings are available only in logs; raw malformed responses were not retained.",
            "Failed auditor calls already produce null MI and are excluded by the canonical parser, but they alter complete-case composition and dead-cell status.",
            "Two canonical run directories now have running/in-progress metadata and 12 canonical cells no longer match raw node state; their canonical table values are retained, but event-level sensitivity is unavailable for those cells.",
        ],
    }
    (OUT / "api_error_audit.json").write_text(json.dumps(audit, indent=2, allow_nan=False) + "\n")


if __name__ == "__main__":
    main()
