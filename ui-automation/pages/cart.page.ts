import { Page, expect } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  private item(product: string) {
    return this.page.locator(".cart_item", { hasText: product });
  }

  async expectItem(product: string) {
    await expect(this.item(product)).toBeVisible();
  }

  async expectItemQuantity(product: string, quantity: number) {
    await expect(this.item(product).locator(".cart_quantity")).toHaveText(String(quantity));
  }

  async expectItemCount(count: number) {
    await expect(this.page.locator(".cart_item")).toHaveCount(count);
  }

  async removeItem(product: string) {
    await this.item(product)
      .getByRole("button", { name: /^remove$/i })
      .click();
  }

  async expectEmpty() {
    await expect(this.page.locator(".cart_item")).toHaveCount(0);
    await expect(this.page.locator(".shopping_cart_badge")).toHaveCount(0);
  }

  async checkout() {
    await this.page.getByRole("button", { name: "Checkout" }).click();
  }
}
