import { Page, expect } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  async expectItem(product: string) {
    await expect(this.page.locator(".cart_item", { hasText: product })).toBeVisible();
  }

  async checkout() {
    await this.page.getByRole("button", { name: "Checkout" }).click();
  }
}
