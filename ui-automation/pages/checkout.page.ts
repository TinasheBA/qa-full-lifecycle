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

  async finish() {
    await this.page.getByRole("button", { name: "Finish" }).click();
  }

  async expectSuccess() {
    await expect(this.page.getByText("Thank you for your order!")).toBeVisible();
  }

  async errorText(): Promise<string> {
    return (await this.page.locator('[data-test="error"]').textContent()) ?? "";
  }
}
