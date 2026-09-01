import { Page, expect } from "@playwright/test";

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async fillInfo(first: string, last: string, zip: string) {
    await this.page.getByPlaceholder("First Name").fill(first);
    await this.page.getByPlaceholder("Last Name").fill(last);
    await this.page.getByPlaceholder("Zip/Postal Code").fill(zip);
  }

  async continue() {
    await this.page.getByRole("button", { name: "Continue" }).click();
  }

  async expectOverviewItem(product: string) {
    await expect(this.page.locator(".cart_item", { hasText: product })).toBeVisible();
  }

  /**
   * REQ-4.3 / TC-10: the overview totals have to be internally consistent.
   * Asserted as subtotal + tax == total rather than against hard-coded amounts,
   * so the check survives the demo app repricing its catalogue.
   */
  async expectOverviewTotalsAddUp() {
    const money = async (selector: string) => {
      const raw = (await this.page.locator(selector).textContent()) ?? "";
      const parsed = Number(raw.replace(/[^0-9.]/g, ""));
      expect(Number.isNaN(parsed), `could not parse a number out of "${raw}"`).toBe(false);
      return parsed;
    };

    const subtotal = await money(".summary_subtotal_label");
    const tax = await money(".summary_tax_label");
    const total = await money(".summary_total_label");

    expect(
      subtotal + tax,
      `overview totals do not add up: subtotal ${subtotal} + tax ${tax} != total ${total}`
    ).toBeCloseTo(total, 2);
  }

  async finish() {
    await this.page.getByRole("button", { name: "Finish" }).click();
  }

  async expectSuccess() {
    await expect(this.page.getByText("Thank you for your order!")).toBeVisible();
  }

  /** REQ-4.5 / TC-10: the cart is emptied by a completed purchase. */
  async expectCartCleared() {
    await expect(this.page.locator(".shopping_cart_badge")).toHaveCount(0);
  }

  async errorText(): Promise<string> {
    return (await this.page.locator('[data-test="error"]').textContent()) ?? "";
  }
}
