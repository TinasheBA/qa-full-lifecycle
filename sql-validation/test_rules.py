"""Tests for the validation rules themselves.

The rest of this folder checks the data. This file checks the checker, which is
the part with no other safety net: a rule whose SQL is subtly wrong does not
raise, it silently returns no findings, reports CLEAN, and the suite goes green
over dirty data. That is what happened to rule_totals_balance, and it is why
that rule carries the COALESCE comment it does.

Every rule gets two kinds of test. One proves it stays silent on data that
satisfies it, so it cannot pass by flagging everything. One proves it fires on a
row that violates it, so it cannot pass by flagging nothing.

The table definitions come from schema.sql rather than being retyped, so these
tests cannot drift from the schema. Only the rows are local.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest

from rules import (
    ALL_RULES,
    rule_no_negative_prices,
    rule_no_orphan_order_items,
    rule_no_orphan_orders,
    rule_required_fields,
    rule_totals_balance,
)

# Everything above the seed-data marker: the drops and the four CREATE TABLEs.
SCHEMA_DDL = (
    Path(__file__).parent.joinpath("schema.sql").read_text(encoding="utf-8").split("-- Seed data")[0]
)

# A minimal dataset that violates none of the rules. Each test starts here and
# adds one bad row, so a finding can only have come from that row.
CLEAN_ROWS = """
INSERT INTO customers (id, name, email) VALUES (1, 'Alice M.', 'alice@example.com');
INSERT INTO products  (id, name, price, stock) VALUES (1, 'Widget A', 10.00, 100);
INSERT INTO orders    (id, customer_id, status, total) VALUES (1, 1, 'shipped', 20.00);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
     VALUES (1, 1, 1, 2, 10.00);
"""


@pytest.fixture
def conn():
    """In-memory database holding the real schema and clean rows.

    schema.sql switches foreign keys on, so the fixture switches them back off
    after building the tables. The orphan tests need to insert the rows a messy
    import really produces, which is exactly what the constraint would block.
    """
    connection = sqlite3.connect(":memory:")
    connection.executescript(SCHEMA_DDL + CLEAN_ROWS)
    connection.execute("PRAGMA foreign_keys = OFF")
    yield connection
    connection.close()


@pytest.mark.parametrize("rule", ALL_RULES, ids=lambda rule: rule.__name__)
def test_rule_is_silent_on_clean_data(conn, rule):
    assert rule(conn).findings == []


def test_negative_product_price_is_caught(conn):
    conn.execute("INSERT INTO products (id, name, price, stock) VALUES (2, 'Bad', -1.00, 1)")
    assert rule_no_negative_prices(conn).findings == ["products#2"]


def test_negative_unit_price_is_caught(conn):
    """The rule covers order_items as well as products, so both branches need proving."""
    conn.execute(
        "INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)"
        " VALUES (2, 1, 1, 1, -5.00)"
    )
    assert rule_no_negative_prices(conn).findings == ["order_items#2"]


def test_orphan_order_item_is_caught(conn):
    conn.execute(
        "INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)"
        " VALUES (2, 999, 1, 1, 10.00)"
    )
    assert rule_no_orphan_order_items(conn).findings == ["order_items#2"]


def test_orphan_order_is_caught(conn):
    conn.execute("INSERT INTO orders (id, customer_id, status, total) VALUES (2, 999, 'pending', 0.00)")
    assert rule_no_orphan_orders(conn).findings == ["orders#2"]


def test_mismatched_total_is_caught(conn):
    conn.execute("INSERT INTO orders (id, customer_id, status, total) VALUES (2, 1, 'pending', 99.99)")
    conn.execute(
        "INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)"
        " VALUES (2, 2, 1, 1, 10.00)"
    )
    assert rule_totals_balance(conn).findings == ["orders#2"]


def test_order_with_no_line_items_is_caught(conn):
    """Regression test for the COALESCE in rule_totals_balance.

    Without the COALESCE in the HAVING clause, an order with no line items
    aggregates to NULL, ABS(total - NULL) is NULL, NULL is not greater than
    0.001, and the row is dropped: the one rule written to catch a phantom total
    misses the clearest example of one. Remove that COALESCE and this test fails
    while every other test in this file still passes.
    """
    conn.execute("INSERT INTO orders (id, customer_id, status, total) VALUES (2, 1, 'pending', 50.00)")
    assert rule_totals_balance(conn).findings == ["orders#2"]


def test_order_with_no_line_items_and_zero_total_is_not_caught(conn):
    """The mirror of the test above: nothing ordered and nothing charged balances."""
    conn.execute("INSERT INTO orders (id, customer_id, status, total) VALUES (2, 1, 'pending', 0.00)")
    assert rule_totals_balance(conn).findings == []


@pytest.mark.parametrize(
    "name,email",
    [("", "carol@example.com"), ("Carol D.", ""), ("   ", "carol@example.com")],
    ids=["blank-name", "blank-email", "whitespace-only-name"],
)
def test_missing_required_field_is_caught(conn, name, email):
    conn.execute("INSERT INTO customers (id, name, email) VALUES (2, ?, ?)", (name, email))
    assert rule_required_fields(conn).findings == ["customers#2"]
