import { test } from "@playwright/test";
import { asUser } from "../auth";
import { InventoryPage } from "../pages/inventory.page";

const BY_NAME_ASC = [
  "Sauce Labs Backpack",
  "Sauce Labs Bike Light",
  "Sauce Labs Bolt T-Shirt",
  "Sauce Labs Fleece Jacket",
  "Sauce Labs Onesie",
  "Test.allTheThings() T-Shirt (Red)",
];
const BY_NAME_DESC = [...BY_NAME_ASC].reverse();

test.describe("Inventory", () => {
  test.use(asUser("standard_user"));

  // TC-04 (REQ-2.1)
  //
  // Every row, not a sample of two. REQ-2.1 is about the whole listing, and
  // spot-checking the first and fourth products left a missing price on any of
  // the other four passing. The count assertion comes first so a product
  // disappearing from the catalogue fails here rather than quietly shrinking
  // what the loop below covers.
  test("each product row shows a name, description and price", async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();

    await inventory.expectProductCount(BY_NAME_ASC.length);

    for (const product of BY_NAME_ASC) {
      await inventory.expectProductDetails(product);
    }
  });

  // TC-14 (REQ-5.1, REQ-5.2)
  test("sorting by name reorders the products in both directions", async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();

    await inventory.expectProductOrder(BY_NAME_ASC);

    await inventory.sortBy("za");
    await inventory.expectProductOrder(BY_NAME_DESC);

    await inventory.sortBy("az");
    await inventory.expectProductOrder(BY_NAME_ASC);
  });
});

/**
 * TC-15 (BUG-001). `problem_user` is one of SauceDemo's deliberately broken
 * accounts: choosing "Name (Z to A)" leaves the dropdown on "Name (A to Z)" and
 * the list in its original order. The control rejects the selection outright.
 *
 * Both of those are asserted, because an unchanged order on its own does not
 * identify the defect. A sort that applied and was then ignored by the list
 * produces the same unchanged order, and that would be a different bug. Pinning
 * the reverted selection as well is what makes this test evidence for BUG-001
 * specifically rather than for "sorting looks broken somehow".
 *
 * BUG-001 originally recorded the selection as changing while the list stayed
 * put. Asserting that turned out to fail: the selection reverts too. The report
 * has been corrected against this run, which is the point of asserting a defect
 * rather than writing it down once and trusting the note.
 *
 * Both assertions invert the day SauceDemo fixes the account, so the suite
 * reports it and the bug report gets revisited.
 */
test.describe("Inventory (problem_user)", () => {
  test.use(asUser("problem_user"));

  test("the sort control reverts and the products do not reorder", async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();

    await inventory.expectSortSelection("az");
    await inventory.expectProductOrder(BY_NAME_ASC);

    await inventory.sortBy("za");

    // Still "az": the control did not keep the selection it was given.
    await inventory.expectSortSelection("az");
    await inventory.expectProductOrder(BY_NAME_ASC);
  });
});
