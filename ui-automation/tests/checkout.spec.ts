import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { InventoryPage } from "../pages/inventory.page";
import { CartPage } from "../pages/cart.page";
import { CheckoutPage } from "../pages/checkout.page";

test.describe("Checkout flow", () => {
  test("happy path purchase", async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await login.goto();
    await login.login("standard_user", "secret_sauce");
    await login.expectLoggedIn();

    await inventory.addToCart("Sauce Labs Backpack");
    await inventory.expectCartCount(1);
    await inventory.openCart();

    await cart.expectItem("Sauce Labs Backpack");
    await cart.checkout();

    await checkout.fillInfo("Tinashe", "Maphela", "2001");
    await checkout.continue();
    await checkout.finish();
    await checkout.expectSuccess();
  });

  test("empty first name blocks checkout", async ({ page }) => {
    const login = new LoginPage(page);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await login.goto();
    await login.login("standard_user", "secret_sauce");
    await inventory.addToCart("Sauce Labs Backpack");
    await inventory.openCart();
    await cart.checkout();

    await checkout.fillInfo("", "Maphela", "2001");
    await checkout.continue();
    expect(await checkout.errorText()).toContain("First Name is required");
  });
});
