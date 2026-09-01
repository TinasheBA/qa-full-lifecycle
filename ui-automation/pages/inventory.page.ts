import { Page, expect } from "@playwright/test";

export class InventoryPage {
  constructor(private readonly page: Page) {}

  private item(product: string) {
    return this.page.locator(".inventory_item", { hasText: product });
  }

  private get cartBadge() {
    return this.page.locator(".shopping_cart_badge");
  }

  private get cartLink() {
    return this.page.locator(".shopping_cart_link");
  }

  async addToCart(product: string) {
    await this.item(product)
      .getByRole("button", { name: /add to cart/i })
      .click();
  }

  async removeFromCart(product: string) {
    await this.item(product)
      .getByRole("button", { name: /^remove$/i })
      .click();
  }

  async expectCartCount(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async expectCartEmpty() {
    // SauceDemo removes the badge element entirely rather than showing a zero.
    await expect(this.cartBadge).toHaveCount(0);
  }

  /**
   * REQ-2.3 / TC-06: once an item is in the cart its row offers Remove and no
   * longer offers Add to cart, which is how the app prevents a duplicate add.
   */
  async expectRemoveControl(product: string) {
    await expect(this.item(product).getByRole("button", { name: /^remove$/i })).toBeVisible();
    await expect(this.item(product).getByRole("button", { name: /add to cart/i })).toHaveCount(0);
  }

  async openCart() {
    await this.cartLink.click();
  }
}
