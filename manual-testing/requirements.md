# Requirements — SauceDemo Checkout Flow

> Source requirement map. This is the "spec" we test against. Each requirement gets a
> stable ID so it can be traced to test cases and automated checks.

## Context

**System under test:** SauceDemo — a demo e-commerce web application with a login page
and a product inventory.

**Base URL:** `https://www.saucedemo.com/`

**Test users** (provided by the app):
- Standard user: `standard_user` / `secret_sauce`
- Locked out user: `locked_out_user` / `secret_sauce`

## Requirements

### REQ-1 — Login
- 1.1 A valid user can log in and land on the product inventory page.
- 1.2 An invalid credential shows a clear error message and does **not** log in.
- 1.3 A locked-out user cannot log in and sees a message explaining they are locked out.

### REQ-2 — Browse inventory
- 2.1 The inventory page lists products with a name, description, and price.
- 2.2 A product can be added to the cart; the cart badge count updates.
- 2.3 A product already in the cart shows a "Remove" control instead of "Add to cart".

### REQ-3 — Cart
- 3.1 The cart page lists the added items with correct quantities and prices.
- 3.2 A user can remove an item from the cart and the count updates.
- 3.3 "Checkout" is reachable from the cart.

### REQ-4 — Checkout
- 4.1 A user can enter first name, last name, and postal code.
- 4.2 Missing first-name/last-name/postal-code fields block checkout with an error.
- 4.3 The overview step shows the correct items and totals.
- 4.4 Completing a purchase shows a success confirmation ("Thank you for your order!").
- 4.5 The cart is cleared after a successful purchase.

### REQ-5 — Sorting
- 5.1 Sorting by Name (A→Z) and (Z→A) is available.
- 5.2 Sorting by Name reorders the product list accordingly.

  This requirement previously recorded the opposite, that sorting does not reorder,
  as accepted behaviour. That was wrong: sorting works correctly for `standard_user`,
  which is the account the whole suite runs as. The account that fails to reorder is
  `problem_user`, one of SauceDemo's deliberately broken logins, so the flaw belongs
  to that fixture rather than to the sort feature. BUG-001 now records it against
  `problem_user` and TC-15 covers it.

## Out of scope

- Payment processing (stubbed in the demo).
- Refund / cancellation flows.
- Real email confirmations.
