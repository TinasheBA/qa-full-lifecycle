"""Entry point: build the SQLite DB from schema.sql, run every validation rule,
compare what the rules found against expected-defects.json, write the report to
reports/, and exit non-zero on drift.

Exit code is driven by drift, not by defect count. The seed data is deliberately
dirty, so gating on "did any rule fail" would pin CI to red permanently. What CI
should care about is whether the data changed underneath the rules:

  NEW      a finding that is not in the baseline  -> the data regressed
  RESOLVED a baselined finding that has gone away -> the baseline is stale
  UNTRACKED a rule with no baseline entry at all  -> someone added a rule and
                                                     forgot to baseline it

Any of those exits 1. Everything matching the baseline exits 0.
"""

from __future__ import annotations

import json
import sqlite3
import sys
from pathlib import Path
from typing import Dict, List

from rules import ALL_RULES, RuleResult

BASE = Path(__file__).parent
DB_PATH = BASE / "demo.db"
EXPECTED_PATH = BASE / "expected-defects.json"
REPORT_DIR = BASE / "reports"


def build_db(conn: sqlite3.Connection) -> None:
    schema = (BASE / "schema.sql").read_text(encoding="utf-8")
    conn.executescript(schema)


def load_expected() -> Dict[str, List[str]]:
    return json.loads(EXPECTED_PATH.read_text(encoding="utf-8"))


def classify(result: RuleResult, expected: Dict[str, List[str]]) -> dict:
    """Compare one rule's findings against its baseline entry."""
    if result.name not in expected:
        return {
            "rule": result.name,
            "status": "UNTRACKED",
            "found": result.findings,
            "expected": [],
            "new": result.findings,
            "resolved": [],
            "detail": result.detail,
        }

    baseline = expected[result.name]
    new = sorted(set(result.findings) - set(baseline))
    resolved = sorted(set(baseline) - set(result.findings))
    if new:
        status = "NEW"
    elif resolved:
        status = "RESOLVED"
    elif result.findings:
        status = "KNOWN"
    else:
        status = "CLEAN"
    return {
        "rule": result.name,
        "status": status,
        "found": sorted(result.findings),
        "expected": sorted(baseline),
        "new": new,
        "resolved": resolved,
        "detail": result.detail,
    }


DRIFT_STATUSES = {"NEW", "RESOLVED", "UNTRACKED"}


def render(rows: List[dict]) -> str:
    lines = ["SQL validation report", "=" * 62]
    for row in rows:
        lines.append(f"[{row['status']:<9}] {row['rule']}")
        lines.append(f"             {row['detail']}")
        if row["new"]:
            lines.append(f"             NEW, not in baseline: {', '.join(row['new'])}")
        if row["resolved"]:
            lines.append(
                f"             baseline expected but not found: {', '.join(row['resolved'])}"
            )
        if row["status"] == "UNTRACKED":
            lines.append(
                "             no entry in expected-defects.json; add one to baseline this rule"
            )
    drift = [r for r in rows if r["status"] in DRIFT_STATUSES]
    matched = sum(len(set(r["found"]) & set(r["expected"])) for r in rows)
    unexpected = sum(len(r["new"]) + len(r["resolved"]) for r in rows)
    lines.append("=" * 62)
    lines.append(
        f"{len(rows)} rules run, {matched} known defect(s) matched the baseline, "
        f"{unexpected} unexpected finding(s) across {len(drift)} drifted rule(s)."
    )
    lines.append(
        "PASS: data matches the baseline." if not drift else "FAIL: see drift above."
    )
    return "\n".join(lines)


def main() -> int:
    conn = sqlite3.connect(DB_PATH)
    try:
        build_db(conn)
        results = [rule(conn) for rule in ALL_RULES]
    finally:
        conn.close()

    expected = load_expected()
    rows = [classify(result, expected) for result in results]
    report = render(rows)
    print(report)

    REPORT_DIR.mkdir(exist_ok=True)
    (REPORT_DIR / "sql-validation.txt").write_text(report + "\n", encoding="utf-8")
    (REPORT_DIR / "sql-validation.json").write_text(
        json.dumps({"rules": rows}, indent=2) + "\n", encoding="utf-8"
    )

    return 1 if any(row["status"] in DRIFT_STATUSES for row in rows) else 0


if __name__ == "__main__":
    sys.exit(main())
