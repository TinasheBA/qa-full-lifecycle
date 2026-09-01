import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { InventoryPage } from "../pages/inventory.page";
import { CartPage } from "../pages/cart.page";

const PRODUCT = "Sauce Labs Backpack";
const SECOND_PRODUCT = "Sauce Labs Bike Light";

test.describe("Cart", () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login("standard_user", "secret_sauce");
    await login.expectLoggedIn();
  });

  // TC-05 (REQ-2.2) + TC-06 (REQ-2.3)
  test("adding an item updates the badge and swaps in a Remove control", async ({ page }) => {
    const inventory = new InventoryPage(page);

    await inventory.expectCartEmpty();
    await inventory.addToCart(PRODUCT);

    await inventory.expectCartCount(1);
    await inventory.expectRemoveControl(PRODUCT);

    // The inventory row's own Remove control has to undo the add too.
    await inventory.removeFromCart(PRODUCT);
    await inventory.expectCartEmpty();
  });

  // TC-07 (REQ-3.1)
  test("cart lists every added item with quantity 1", async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);

    await inventory.addToCart(PRODUCT);
    await inventory.addToCart(SECOND_PRODUCT);
    await inventory.expectCartCount(2);
    await inventory.openCart();

    await cart.expectItemCount(2);
    await cart.expectItem(PRODUCT);
    await cart.expectItem(SECOND_PRODUCT);
    await cart.expectItemQuantity(PRODUCT, 1);
    await cart.expectItemQuantity(SECOND_PRODUCT, 1);
  });

  // TC-08 (REQ-3.2)
  test("removing the only item empties the cart and clears the badge", async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);

    await inventory.addToCart(PRODUCT);
    await inventory.expectCartCount(1);
    await inventory.openCart();

    await cart.expectItem(PRODUCT);
    await cart.removeItem(PRODUCT);

    await cart.expectEmpty();
  });

  // TC-08 (REQ-3.2), the decrement case rather than the empty case
  test("removing one of two items decrements the badge", async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);

    await inventory.addToCart(PRODUCT);
    await inventory.addToCart(SECOND_PRODUCT);
    await inventory.expectCartCount(2);
    await inventory.openCart();

    await cart.removeItem(PRODUCT);

    await cart.expectItemCount(1);
    await cart.expectItem(SECOND_PRODUCT);
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
  });
});
