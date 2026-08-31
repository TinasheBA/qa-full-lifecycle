import { Page, expect } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/");
  }

  async login(username: string, password: string) {
    await this.page.getByPlaceholder("Username").fill(username);
    await this.page.getByPlaceholder("Password").fill(password);
    await this.page.getByRole("button", { name: "Login" }).click();
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  async errorText(): Promise<string> {
    return (await this.page.locator('[data-test="error"]').textContent()) ?? "";
  }
}
