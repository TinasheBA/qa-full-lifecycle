import { Locator, Page, expect } from "@playwright/test";

export type SortOption = "az" | "za" | "lohi" | "hilo";

export class InventoryPage {
  constructor(private readonly page: Page) {}

  private item(product: string): Locator {
    return this.page.getByTestId("inventory-item").filter({ hasText: product });
  }

  private get cartBadge(): Locator {
    return this.page.getByTestId("shopping-cart-badge");
  }

  async goto() {
    await this.page.goto("/inventory.html");
  }

  async addToCart(product: string) {
    await this.item(product).getByRole("button", { name: /add to cart/i }).click();
  }

  async removeFromCart(product: string) {
    await this.item(product).getByRole("button", { name: /^remove$/i }).click();
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

  /** REQ-2.1 / TC-04: every product row shows a name, a description and a price. */
  async expectProductDetails(product: string) {
    const row = this.item(product);
    await expect(row.getByTestId("inventory-item-name")).toHaveText(product);
    await expect(row.getByTestId("inventory-item-desc")).not.toBeEmpty();
    await expect(row.getByTestId("inventory-item-price")).toHaveText(/^\$\d+\.\d{2}$/);
  }

  async sortBy(option: SortOption) {
    await this.page.getByTestId("product-sort-container").selectOption(option);
  }

  async expectProductOrder(names: string[]) {
    await expect(this.page.getByTestId("inventory-item-name")).toHaveText(names);
  }

  async openCart() {
    await this.page.getByTestId("shopping-cart-link").click();
  }
}
