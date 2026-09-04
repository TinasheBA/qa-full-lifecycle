# Traceability Matrix — SauceDemo

Maps each requirement to its test case(s), and records which of those have an automated
regression check behind them. The two are deliberately separate columns: a test case
existing on paper and a test case running on every push are different guarantees, and
reporting them as a single number hides which requirements are actually protected.

| Requirement | Test Case(s) | Automated check |
|-------------|--------------|-----------------|
| REQ-1.1 Valid login | TC-01 | `ui-automation/tests/login.spec.ts` — valid user logs in |
| REQ-1.2 Invalid credentials rejected | TC-02 | `ui-automation/tests/login.spec.ts` — invalid credentials rejected |
| REQ-1.3 Locked-out user blocked | TC-03 | `ui-automation/tests/login.spec.ts` — locked-out user blocked |
| REQ-2.1 Product name/description/price shown | TC-04 | `ui-automation/tests/inventory.spec.ts` — each product row shows a name, description and price |
| REQ-2.2 Add to cart updates badge | TC-05 | `ui-automation/tests/cart.spec.ts` — adding an item updates the badge |
| REQ-2.3 Remove control replaces Add | TC-06 | `ui-automation/tests/cart.spec.ts` — swaps in a Remove control |
| REQ-3.1 Cart lists items + quantities | TC-07 | `ui-automation/tests/cart.spec.ts` — cart lists every added item |
| REQ-3.2 Remove from cart | TC-08 | `ui-automation/tests/cart.spec.ts` — empties the cart / decrements the badge |
| REQ-3.3 Checkout reachable from cart | TC-09 | `ui-automation/tests/checkout.spec.ts` — happy path purchase |
| REQ-4.1 Enter name + postal code | TC-10 | `ui-automation/tests/checkout.spec.ts` — happy path purchase |
| REQ-4.2 Missing fields block checkout | TC-11, TC-12, TC-13 | partial — `checkout.spec.ts` covers the empty first name (TC-11); TC-12 and TC-13 are manual only |
| REQ-4.3 Overview shows correct items + totals | TC-10 | `ui-automation/tests/checkout.spec.ts` — asserts the item is listed and subtotal + tax == total |
| REQ-4.4 Success confirmation | TC-10 | `ui-automation/tests/checkout.spec.ts` — "Thank you for your order!" |
| REQ-4.5 Cart cleared after purchase | TC-10 | `ui-automation/tests/checkout.spec.ts` — badge gone after Finish |
| REQ-5.1 Sorting controls available | TC-14 | `ui-automation/tests/inventory.spec.ts` — sorting by name reorders in both directions |
| REQ-5.2 Sorting by name reorders the list | TC-14 | `ui-automation/tests/inventory.spec.ts` — same test; asserts both orderings |
| BUG-001 `problem_user` does not reorder | TC-15 | `ui-automation/tests/inventory.spec.ts` — "Inventory (problem_user)" |

## Coverage

- **16 of 16** requirements are mapped to a test case.
- **15 of 16** have a full automated regression check; **1** (REQ-4.2) is partially
  automated. No requirement is manual only.
- BUG-001 is listed as a row of its own because it is a recorded defect rather than a
  requirement, and it now has a test that fails if the defect is ever fixed.

REQ-4.2 stays partial on purpose. The empty first name is automated; the last name and
postal code branches are the same validator behind two more field names, and asserting
all three would be three tests proving one thing. They stay as manual cases TC-12 and
TC-13 rather than being deleted, because the requirement does cover all three fields.
