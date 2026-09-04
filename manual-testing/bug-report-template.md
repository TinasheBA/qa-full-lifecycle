# Bug Report Template

Use one copy of this per defect. Keep IDs sequential (BUG-001, BUG-002, ...).

---

**Bug ID:** `BUG-001`

**Title:** _Short, specific summary of the defect_

**Severity / Priority:** _e.g. Major / High_ · **Environment:** _e.g. Chrome 120, Win 11_

**Affected requirement(s):** _REQ-5.2_

**Steps to reproduce:**
1. _Step 1_
2. _Step 2_
3. _Step 3_

**Expected result:** _What should happen_

**Actual result:** _What actually happens_

**Evidence:** _Screenshot / trace / error message_

**Status:** _New / Open / Fixed / Verified / Closed_

**Notes:** _Any extra context, workaround, or suspected cause_

---

## Worked example

The template above stays blank. This is the one filled-in report the suite refers to.

**Bug ID:** `BUG-001`

**Title:** Sorting by name does not reorder the product list for `problem_user`

**Severity / Priority:** Major / Low · **Environment:** Chromium 131, Windows 11

**Affected requirement(s):** REQ-5.2 (see the note there), TC-15

**Steps to reproduce:**
1. Log in to https://www.saucedemo.com as `problem_user` / `secret_sauce`
2. Note the default product order on the inventory page
3. Set the sort dropdown to "Name (Z to A)"

**Expected result:** The six products reverse, as they do for `standard_user`:

```
Test.allTheThings() T-Shirt (Red), Sauce Labs Onesie, Sauce Labs Fleece Jacket,
Sauce Labs Bolt T-Shirt, Sauce Labs Bike Light, Sauce Labs Backpack
```

**Actual result:** The dropdown selection changes and the list does not move:

```
Sauce Labs Backpack, Sauce Labs Bike Light, Sauce Labs Bolt T-Shirt,
Sauce Labs Fleece Jacket, Sauce Labs Onesie, Test.allTheThings() T-Shirt (Red)
```

**Evidence:** `ui-automation/tests/inventory.spec.ts`, the "Inventory (problem_user)"
block. The same steps run as `standard_user` in the block above it and do reorder,
which is what isolates this to the account rather than to the sort control.

**Status:** Open, will not fix

**Notes:** `problem_user` is one of the accounts SauceDemo ships deliberately broken,
so this is a defect in a test fixture rather than in the flow under test. It is
recorded because a known defect that nobody has written down gets rediscovered, and
it is asserted in TC-15 rather than skipped so that the suite reports it if SauceDemo
ever repairs the account.
