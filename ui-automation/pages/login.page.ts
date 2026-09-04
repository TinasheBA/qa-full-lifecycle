import { Locator, Page, expect } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  private get error(): Locator {
    return this.page.getByTestId("error");
  }

  async goto() {
    await this.page.goto("/");
  }

  async login(username: string, password: string) {
    await this.page.getByTestId("username").fill(username);
    await this.page.getByTestId("password").fill(password);
    await this.page.getByTestId("login-button").click();
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  /**
   * Assert on the login error banner.
   *
   * This is an auto-retrying assertion on the locator rather than a one-shot
   * read of textContent(). The banner is rendered client-side after the click,
   * so reading its text once races the render: the read can land before the
   * element exists and return an empty string.
   */
  async expectError(message: string | RegExp) {
    await expect(this.error).toContainText(message);
  }
}
