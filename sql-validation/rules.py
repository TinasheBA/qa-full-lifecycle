"""Validation rules for the order-management schema.

Each rule is a plain function that returns (name, passed: bool, message: str).
Collect all rules in ALL_RULES so validate.py can run and report them uniformly.
"""

import sqlite3
from typing import List, Tuple

Rule = Tuple[str, bool, str]


def rule_no_negative_prices(conn: sqlite3.Connection) -> Rule:
    cur = conn.execute(
        """
        SELECT 'products' AS source, id
        FROM products WHERE price < 0
        UNION ALL
        SELECT 'order_items', id
        FROM order_items WHERE unit_price < 0
        """
    )
    rows = cur.fetchall()
    if not rows:
        return ("no_negative_prices", True, "No negative prices found.")
    return (
        "no_negative_prices",
        False,
        f"Negative prices on: {', '.join(f'{s}#{i}' for s, i in rows)}",
    )


def rule_no_orphan_order_items(conn: sqlite3.Connection) -> Rule:
    cur = conn.execute(
        """
        SELECT oi.id
        FROM order_items oi
        LEFT JOIN orders o ON o.id = oi.order_id
        WHERE o.id IS NULL
        """
    )
    ids = [r[0] for r in cur.fetchall()]
    if not ids:
        return ("no_orphan_order_items", True, "No orphan order items.")
    return ("no_orphan_order_items", False, f"Orphan order_items: {ids}")


def rule_no_orphan_orders(conn: sqlite3.Connection) -> Rule:
    cur = conn.execute(
        """
        SELECT o.id
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        WHERE c.id IS NULL
        """
    )
    ids = [r[0] for r in cur.fetchall()]
    if not ids:
        return ("no_orphan_orders", True, "No orphan orders.")
    return ("no_orphan_orders", False, f"Orphan orders: {ids}")


def rule_totals_balance(conn: sqlite3.Connection) -> Rule:
    cur = conn.execute(
        """
        SELECT o.id, o.total, COALESCE(SUM(oi.quantity * oi.unit_price), 0)
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        GROUP BY o.id, o.total
        HAVING ABS(o.total - SUM(oi.quantity * oi.unit_price)) > 0.001
        """
    )
    rows = cur.fetchall()
    if not rows:
        return ("totals_balance", True, "All order totals balance against line items.")
    bad = ", ".join(
        f"order {o}: stored {t} vs itemised {s}" for o, t, s in rows
    )
    return ("totals_balance", False, f"Totals mismatch on {bad}")


def rule_required_fields(conn: sqlite3.Connection) -> Rule:
    # Demonstrates the "missing required fields" rule with the customers table.
    cur = conn.execute(
        """
        SELECT id
        FROM customers
        WHERE name IS NULL OR trim(name) = ''
           OR email IS NULL OR trim(email) = ''
        """
    )
    ids = [r[0] for r in cur.fetchall()]
    if not ids:
        return ("required_fields", True, "All customers have name and email.")
    return ("required_fields", False, f"Customers missing required fields: {ids}")


ALL_RULES: List[Rule] = [
    rule_no_negative_prices,
    rule_no_orphan_order_items,
    rule_no_orphan_orders,
    rule_totals_balance,
    rule_required_fields,
]
