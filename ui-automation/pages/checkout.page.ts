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
   * REQ-4.3 / TC-10: the overview totals have to be right, not merely tidy.
   *
   * Two separate claims, because either one alone can hold while the page is
   * wrong. The subtotal must equal the prices of the items actually listed on
   * this step, which anchors the figures to the order. And subtotal + tax must
   * equal the total, which catches the arithmetic. Asserted against the page's
   * own prices rather than hard-coded amounts, so the check survives the demo
   * app repricing its catalogue.
   *
   * Internal consistency on its own proves very little: carry the wrong item's
   * price into checkout, or halve the subtotal, and subtotal + tax == total is
   * still satisfied by a figure the customer would be charged incorrectly.
   *
   * The amounts are read with textContent() because the assertions are
   * arithmetic over the parsed numbers, which no single web-first assertion
   * expresses. To keep those reads off the render race, each element is first
   * asserted to hold a settled currency amount with an auto-retrying assertion;
   * only then are the values read.
   */
  async expectOverviewTotalsAddUp() {
    const itemPrices = this.page.getByTestId("inventory-item-price");
    const labels = {
      subtotal: this.page.getByTestId("subtotal-label"),
      tax: this.page.getByTestId("tax-label"),
      total: this.page.getByTestId("total-label"),
    };

    await expect(itemPrices.first()).toHaveText(/^\$\d+\.\d{2}$/);
    for (const label of Object.values(labels)) {
      await expect(label).toHaveText(/\$\d+\.\d{2}/);
    }

    const parseMoney = (raw: string) => {
      const parsed = Number(raw.replace(/[^0-9.]/g, ""));
      expect(Number.isNaN(parsed), `could not parse a number out of "${raw}"`).toBe(false);
      return parsed;
    };

    const money = async (label: Locator) => parseMoney((await label.textContent()) ?? "");

    const subtotal = await money(labels.subtotal);
    const tax = await money(labels.tax);
    const total = await money(labels.total);

    const itemsSum = (await itemPrices.allTextContents())
      .map(parseMoney)
      .reduce((sum, price) => sum + price, 0);

    expect(
      itemsSum,
      `subtotal ${subtotal} does not match the items listed on the overview, which come to ${itemsSum}`
    ).toBeCloseTo(subtotal, 2);

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
