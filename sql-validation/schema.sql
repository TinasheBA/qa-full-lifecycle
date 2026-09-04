-- Demo order-management schema + seed data for SQL validation.
-- SQLite-compatible.

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id        INTEGER PRIMARY KEY,
    name      TEXT NOT NULL,
    email     TEXT NOT NULL
);

CREATE TABLE products (
    id       INTEGER PRIMARY KEY,
    name     TEXT NOT NULL,
    price    REAL NOT NULL,
    stock    INTEGER NOT NULL
);

CREATE TABLE orders (
    id         INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    status     TEXT NOT NULL,
    total      REAL NOT NULL
);

CREATE TABLE order_items (
    id          INTEGER PRIMARY KEY,
    order_id    INTEGER NOT NULL REFERENCES orders(id),
    product_id  INTEGER NOT NULL REFERENCES products(id),
    quantity    INTEGER NOT NULL,
    unit_price  REAL NOT NULL
);

-- Seed data ----------------------------------------------------------------

INSERT INTO customers (id, name, email) VALUES
    (1, 'Alice M.', 'alice@example.com'),
    (2, 'Bob T.',    'bob@example.com'),
    (3, 'Carol D.',  'carol@example.com');

INSERT INTO products (id, name, price, stock) VALUES
    (1, 'Widget A', 10.00, 100),
    (2, 'Widget B', 25.50, 40),
    (3, 'Widget C',  5.99, 200);

INSERT INTO orders (id, customer_id, status, total) VALUES
    (1, 1, 'shipped', 20.00),
    (2, 2, 'pending', 25.50),
    (3, 3, 'shipped', 11.98);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 1, 2, 10.00),
    (2, 2, 2, 1, 25.50),
    (3, 3, 3, 2, 5.99);

-- Deliberately planted defects to make the validator earn its keep ---------
-- FKs are toggled off so we can insert the orphan/bad rows the way a messy
-- legacy DB actually ends up with them (FK violations don't get blocked in
-- every engine/import path, and this is exactly the kind of rot data QA exists
-- to catch).

-- 1. A product with a negative price.
INSERT INTO products (id, name, price, stock) VALUES (4, 'Broken Item', -5.00, 1);

-- 2-5. Orphans + a bad total, inserted with FK enforcement relaxed.
PRAGMA foreign_keys = OFF;

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (4, 999, 1, 1, 10.00);
INSERT INTO orders (id, customer_id, status, total) VALUES (4, 999, 'pending', 0.00);
INSERT INTO orders (id, customer_id, status, total) VALUES (5, 1, 'pending', 999.99);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (5, 5, 3, 1, 5.99);

PRAGMA foreign_keys = ON;

-- 6. A phantom order: a real customer, a non-zero total, and no line items at all.
--    This one is FK-legal, so nothing structural stops it. It exists to keep
--    rule_totals_balance honest: the naive version of that rule aggregates NULL
--    for an order with no items and drops the row instead of flagging it.
INSERT INTO orders (id, customer_id, status, total) VALUES (6, 2, 'pending', 50.00);

-- 7. A customer with a blank name and email. Both columns are NOT NULL, which
--    stops a NULL but does nothing about an empty string, so this is the shape
--    the defect actually takes in this schema. Without it rule_required_fields
--    is the one rule with nothing to catch, and a rule that never fires is a
--    rule nobody has tested.
INSERT INTO customers (id, name, email) VALUES (4, '', '');
