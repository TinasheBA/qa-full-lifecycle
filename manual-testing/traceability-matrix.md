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
| REQ-2.1 Product name/description/price shown | TC-04 | manual only |
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
| REQ-5.1 Sorting controls available | TC-14 | manual only |
| REQ-5.2 Sorting does not reorder (known flaw) | BUG-001 | not automated — accepted demo defect, see `bug-report-template.md` |

## Coverage

- **16 of 16** requirements are mapped to a test case.
- **12 of 16** have a full automated regression check; **1** (REQ-4.2) is partially
  automated; **3** (REQ-2.1, REQ-5.1, REQ-5.2) are manual only.

The manual-only rows are a known backlog. Automating REQ-5.2 would encode an accepted
demo defect as expected behaviour, so it stays manual. REQ-2.1 and REQ-5.1 are next in
line for automation.
