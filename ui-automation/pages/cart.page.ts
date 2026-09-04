import { Locator, Page, expect } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  // Cart rows carry the same `inventory-item` test id as the inventory rows.
  private item(product: string): Locator {
    return this.page.getByTestId("inventory-item").filter({ hasText: product });
  }

  async goto() {
    await this.page.goto("/cart.html");
  }

  async expectItem(product: string) {
    await expect(this.item(product)).toBeVisible();
  }

  async expectItemQuantity(product: string, quantity: number) {
    await expect(this.item(product).getByTestId("item-quantity")).toHaveText(String(quantity));
  }

  async expectItemCount(count: number) {
    await expect(this.page.getByTestId("inventory-item")).toHaveCount(count);
  }

  async expectCartCount(count: number) {
    await expect(this.page.getByTestId("shopping-cart-badge")).toHaveText(String(count));
  }

  async removeItem(product: string) {
    await this.item(product).getByRole("button", { name: /^remove$/i }).click();
  }

  async expectEmpty() {
    await expect(this.page.getByTestId("inventory-item")).toHaveCount(0);
    await expect(this.page.getByTestId("shopping-cart-badge")).toHaveCount(0);
  }

  async checkout() {
    await this.page.getByTestId("checkout").click();
  }
}
