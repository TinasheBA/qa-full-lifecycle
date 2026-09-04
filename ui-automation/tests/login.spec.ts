import { test } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

// The only spec that drives the login form, so the only one that starts logged
// out. Everything else plants the session cookie: see ../auth.ts.
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
    await login.expectError("Username and password do not match");
  });

  test("locked-out user blocked", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login("locked_out_user", "secret_sauce");
    await login.expectError("locked out");
  });
});
