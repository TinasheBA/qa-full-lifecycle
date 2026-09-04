import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  // No retries. A baseline gate asserts a deterministic scan result, so a run
  // that only passes on the second attempt is information, not noise.
  retries: 0,
  reporter: [["list"]],
  use: {
    testIdAttribute: "data-test",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
