import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "https://www.saucedemo.com",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
