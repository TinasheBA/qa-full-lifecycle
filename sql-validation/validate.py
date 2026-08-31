"""Entry point: build the SQLite DB from schema.sql, run every validation rule,
print a report, and exit non-zero if any rule fails (CI-friendly)."""

import sqlite3
import sys
from pathlib import Path

from rules import ALL_RULES

BASE = Path(__file__).parent
DB_PATH = BASE / "demo.db"


def build_db(conn: sqlite3.Connection) -> None:
    schema = (BASE / "schema.sql").read_text(encoding="utf-8")
    conn.executescript(schema)


def main() -> int:
    conn = sqlite3.connect(DB_PATH)
    try:
        build_db(conn)
        results = [rule(conn) for rule in ALL_RULES]
    finally:
        conn.close()

    failed = 0
    print("SQL validation report")
    print("=" * 40)
    for name, passed, message in results:
        mark = "PASS" if passed else "FAIL"
        print(f"[{mark}] {name}")
        print(f"       {message}")
        if not passed:
            failed += 1

    print("=" * 40)
    print(f"Passed {len(results) - failed}/{len(results)} rules.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
