# SQL Validation - SQLite + Python

Data testing: validating business rules against a relational schema. It catches
data-quality defects before they reach users, the kind of check that sets QA engineers
apart because most can't do it.

## What this does

A small order-management schema (SQLite) validated by Python and plain `sqlite3`.
The validator runs a set of named rules and reports pass/fail per rule, with a non-zero
exit code if any rule fails. CI-friendly.

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | Creates the demo schema + seed data |
| `rules.py` | The validation rules (SQL against the schema) |
| `validate.py` | Entry point: builds DB, runs rules, prints report, sets exit code |

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
