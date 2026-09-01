# SQL Validation - SQLite + Python

Data testing: validating business rules against a relational schema. It catches
data-quality defects before they reach users, the kind of check that sets QA engineers
apart because most can't do it.

## What this does

A small order-management schema (SQLite) validated by Python and plain `sqlite3`.
The validator runs a set of named rules, compares what they found against a committed
baseline, writes the report to `reports/`, and exits non-zero on drift.

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | Creates the demo schema + seed data, including the planted defects |
| `rules.py` | The validation rules (SQL against the schema) |
| `expected-defects.json` | Committed baseline: which findings are known and expected |
| `validate.py` | Entry point: builds DB, runs rules, writes the report, sets exit code |

## Run

Uses only the Python standard library (`sqlite3`, `sys`, `pathlib`). No install needed.

```bash
python validate.py
```

## The schema (business context)

- `customers`: one row per customer
- `orders`: orders placed, with a status and a totals snapshot
- `order_items`: line items on an order
- `products`: sellable products with price and stock

Business rules we validate:

1. **No negative prices** on products or order_items.
2. **No orphan order_items**: every line item points at a real order.
3. **No orphan orders**: every order points at a real customer.
4. **Order totals balance**: the itemised total equals the stored `orders.total`.
5. **No missing required fields**: customers must have a name and email.

## What the exit code means

The seed data is *deliberately dirty*. It plants defects so the rules have something to
catch, which makes "a rule found something" useless as a CI signal: the job would be red
on every run, and a job that is always red gets ignored.

So the gate is drift against `expected-defects.json`, which records the findings we
already know about:

| Status | Meaning | Exit |
|--------|---------|------|
| `CLEAN` | rule found nothing, baseline expects nothing | 0 |
| `KNOWN` | findings match the baseline exactly | 0 |
| `NEW` | a finding that is **not** baselined, so the data regressed | 1 |
| `RESOLVED` | a baselined finding has gone, so the baseline is stale | 1 |
| `UNTRACKED` | a rule with no baseline entry at all | 1 |

`RESOLVED` failing is intentional. A silently disappearing defect means either the data
changed or the rule stopped working, and the second one is the dangerous case: a rule
that quietly stops detecting anything looks identical to a clean database.

`UNTRACKED` exists so that adding a rule without baselining it fails loudly instead of
being ignored.

## The planted defects

| # | Defect | Caught by |
|---|--------|-----------|
| 1 | `products#4` has a negative price | `no_negative_prices` |
| 2 | `order_items#4` points at order 999, which does not exist | `no_orphan_order_items` |
| 3 | `orders#4` points at customer 999, which does not exist | `no_orphan_orders` |
| 4 | `orders#5` stores 999.99 against 5.99 of line items | `totals_balance` |
| 5 | `orders#6` stores 50.00 with no line items at all | `totals_balance` |

Defect 5 is there to keep `totals_balance` honest. The obvious way to write that rule is
`HAVING ABS(o.total - SUM(oi.quantity * oi.unit_price)) > 0.001`, and it is wrong: with
no line items the aggregate is `NULL`, `ABS(total - NULL)` is `NULL`, `NULL` is not
`> 0.001`, and the row is dropped. An order with a stored total and no line items would
pass the one rule meant to catch it. The `COALESCE` has to be inside the `HAVING` as well
as the `SELECT`, and defect 5 is the regression test for that.
