import { test } from "@playwright/test";
import { asUser } from "../auth";
import { InventoryPage } from "../pages/inventory.page";
import { CartPage } from "../pages/cart.page";
import { CheckoutPage } from "../pages/checkout.page";

const PRODUCT = "Sauce Labs Backpack";

test.describe("Checkout flow", () => {
  test.use(asUser("standard_user"));

  test("happy path purchase", async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await inventory.goto();
    await inventory.addToCart(PRODUCT);
    await inventory.expectCartCount(1);
    await inventory.openCart();

    await cart.expectItem(PRODUCT);
    await cart.checkout();

    await checkout.fillInfo("Tinashe", "Maphela", "2001");
    await checkout.continue();

    // REQ-4.3: the overview step has to show the right item and totals that add up.
    await checkout.expectOverviewItem(PRODUCT);
    await checkout.expectOverviewTotalsAddUp();

    await checkout.finish();
    await checkout.expectSuccess();

    // REQ-4.5: a completed purchase empties the cart.
    await checkout.expectCartCleared();
  });

  test("empty first name blocks checkout", async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await inventory.goto();
    await inventory.addToCart(PRODUCT);
    await inventory.openCart();
    await cart.checkout();

    await checkout.fillInfo("", "Maphela", "2001");
    await checkout.continue();
    await checkout.expectError("First Name is required");
  });
});
