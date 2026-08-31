import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

test.describe("Login", () => {
  test("valid user logs in", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login("standard_user", "secret_sauce");
    await login.expectLoggedIn();
  });

  test("invalid credentials rejected", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login("standard_user", "wrong");
    expect(await login.errorText()).toContain("Username and password do not match");
  });

  test("locked-out user blocked", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login("locked_out_user", "secret_sauce");
    expect(await login.errorText()).toContain("locked out");
  });
});
