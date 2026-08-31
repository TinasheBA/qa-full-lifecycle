import { Page, expect } from "@playwright/test";

export class InventoryPage {
  constructor(private readonly page: Page) {}

  private cartBadge = this.page.locator(".shopping_cart_badge");
  private cartLink = this.page.locator(".shopping_cart_link");

  async addToCart(product: string) {
    await this.page
      .locator(".inventory_item", { hasText: product })
      .getByRole("button", { name: /add to cart/i })
      .click();
  }

  async expectCartCount(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async openCart() {
    await this.cartLink.click();
  }
}
