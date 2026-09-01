"""Validation rules for the order-management schema.

Each rule returns a RuleResult carrying the rule's name and the stable identifier
of every row that violates it (e.g. "products#4"). validate.py compares those
identifiers against expected-defects.json.

That indirection is the point: this suite ships deliberately broken seed data so
the rules have something to catch, which means "a rule found something" cannot be
the CI failure signal, because it would be red on every run. Drift is the signal
instead. A finding that is not in the baseline means the data regressed; a
baselined finding that disappears means the baseline is stale. Either way a human
needs to look.
"""

from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from typing import Callable, List


@dataclass(frozen=True)
class RuleResult:
    name: str
    findings: List[str]
    detail: str


Rule = Callable[[sqlite3.Connection], RuleResult]


def rule_no_negative_prices(conn: sqlite3.Connection) -> RuleResult:
    rows = conn.execute(
        """
        SELECT 'products' AS source, id
        FROM products WHERE price < 0
        UNION ALL
        SELECT 'order_items', id
        FROM order_items WHERE unit_price < 0
        """
    ).fetchall()
    findings = [f"{source}#{row_id}" for source, row_id in rows]
    detail = (
        "No negative prices found."
        if not findings
        else f"Negative prices on: {', '.join(findings)}"
    )
    return RuleResult("no_negative_prices", findings, detail)


def rule_no_orphan_order_items(conn: sqlite3.Connection) -> RuleResult:
    rows = conn.execute(
        """
        SELECT oi.id
        FROM order_items oi
        LEFT JOIN orders o ON o.id = oi.order_id
        WHERE o.id IS NULL
        """
    ).fetchall()
    findings = [f"order_items#{row[0]}" for row in rows]
    detail = (
        "No orphan order items."
        if not findings
        else f"Order items pointing at a missing order: {', '.join(findings)}"
    )
    return RuleResult("no_orphan_order_items", findings, detail)


def rule_no_orphan_orders(conn: sqlite3.Connection) -> RuleResult:
    rows = conn.execute(
        """
        SELECT o.id
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        WHERE c.id IS NULL
        """
    ).fetchall()
    findings = [f"orders#{row[0]}" for row in rows]
    detail = (
        "No orphan orders."
        if not findings
        else f"Orders pointing at a missing customer: {', '.join(findings)}"
    )
    return RuleResult("no_orphan_orders", findings, detail)


def rule_totals_balance(conn: sqlite3.Connection) -> RuleResult:
    # The COALESCE has to be inside the HAVING as well as the SELECT. Without it,
    # an order with no line items aggregates to NULL, `ABS(total - NULL)` is NULL,
    # NULL is not > 0.001, and the row is silently dropped, so an order carrying a
    # total with nothing to justify it would pass the one rule written to catch
    # exactly that. See orders#6 in schema.sql.
    rows = conn.execute(
        """
        SELECT o.id, o.total, COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS itemised
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        GROUP BY o.id, o.total
        HAVING ABS(o.total - COALESCE(SUM(oi.quantity * oi.unit_price), 0)) > 0.001
        ORDER BY o.id
        """
    ).fetchall()
    findings = [f"orders#{row[0]}" for row in rows]
    detail = (
        "All order totals balance against their line items."
        if not findings
        else "Totals mismatch on "
        + ", ".join(
            f"orders#{oid} (stored {total:.2f} vs itemised {itemised:.2f})"
            for oid, total, itemised in rows
        )
    )
    return RuleResult("totals_balance", findings, detail)


def rule_required_fields(conn: sqlite3.Connection) -> RuleResult:
    rows = conn.execute(
        """
        SELECT id
        FROM customers
        WHERE name IS NULL OR trim(name) = ''
           OR email IS NULL OR trim(email) = ''
        """
    ).fetchall()
    findings = [f"customers#{row[0]}" for row in rows]
    detail = (
        "All customers have a name and an email."
        if not findings
        else f"Customers missing required fields: {', '.join(findings)}"
    )
    return RuleResult("required_fields", findings, detail)


ALL_RULES: List[Rule] = [
    rule_no_negative_prices,
    rule_no_orphan_order_items,
    rule_no_orphan_orders,
    rule_totals_balance,
    rule_required_fields,
]
