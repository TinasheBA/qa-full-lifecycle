import { Locator, Page, expect } from "@playwright/test";

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  private get error(): Locator {
    return this.page.getByTestId("error");
  }

  async fillInfo(first: string, last: string, zip: string) {
    await this.page.getByTestId("firstName").fill(first);
    await this.page.getByTestId("lastName").fill(last);
    await this.page.getByTestId("postalCode").fill(zip);
  }

  async continue() {
    await this.page.getByTestId("continue").click();
  }

  async expectOverviewItem(product: string) {
    await expect(
      this.page.getByTestId("inventory-item").filter({ hasText: product })
    ).toBeVisible();
  }

  /**
   * REQ-4.3 / TC-10: the overview totals have to be internally consistent.
   * Asserted as subtotal + tax == total rather than against hard-coded amounts,
   * so the check survives the demo app repricing its catalogue.
   *
   * The three amounts are read with textContent() because the assertion is
   * arithmetic over the parsed numbers, which no single web-first assertion
   * expresses. To keep that read off the render race, each label is first
   * asserted to hold a settled currency amount with an auto-retrying
   * assertion; only then are the values read.
   */
  async expectOverviewTotalsAddUp() {
    const labels = {
      subtotal: this.page.getByTestId("subtotal-label"),
      tax: this.page.getByTestId("tax-label"),
      total: this.page.getByTestId("total-label"),
    };

    for (const label of Object.values(labels)) {
      await expect(label).toHaveText(/\$\d+\.\d{2}/);
    }

    const money = async (label: Locator) => {
      const raw = (await label.textContent()) ?? "";
      const parsed = Number(raw.replace(/[^0-9.]/g, ""));
      expect(Number.isNaN(parsed), `could not parse a number out of "${raw}"`).toBe(false);
      return parsed;
    };

    const subtotal = await money(labels.subtotal);
    const tax = await money(labels.tax);
    const total = await money(labels.total);

    expect(
      subtotal + tax,
      `overview totals do not add up: subtotal ${subtotal} + tax ${tax} != total ${total}`
    ).toBeCloseTo(total, 2);
  }

  async finish() {
    await this.page.getByTestId("finish").click();
  }

  async expectSuccess() {
    await expect(this.page.getByTestId("complete-header")).toHaveText("Thank you for your order!");
  }

  /** REQ-4.5 / TC-10: the cart is emptied by a completed purchase. */
  async expectCartCleared() {
    await expect(this.page.getByTestId("shopping-cart-badge")).toHaveCount(0);
  }

  /** See LoginPage.expectError for why this is an assertion, not a getter. */
  async expectError(message: string | RegExp) {
    await expect(this.error).toContainText(message);
  }
}
