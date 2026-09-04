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
  test("each product row shows a name, description and price", async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();

    await inventory.expectProductDetails("Sauce Labs Backpack");
    await inventory.expectProductDetails("Sauce Labs Fleece Jacket");
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
 * accounts: the sort control changes its selection but the list never reorders.
 * The assertion is that the list is unchanged, so this test starts failing the
 * day SauceDemo fixes the account, which is when the bug report needs revisiting.
 */
test.describe("Inventory (problem_user)", () => {
  test.use(asUser("problem_user"));

  test("sorting by name does not reorder the products", async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();

    await inventory.expectProductOrder(BY_NAME_ASC);
    await inventory.sortBy("za");
    await inventory.expectProductOrder(BY_NAME_ASC);
  });
});
