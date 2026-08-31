import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

// Accessibility scan strategy
// ---------------------------
// These demo apps (SauceDemo, AutomationExercise) ship with KNOWN, pre-existing
// WCAG violations we don't control. Failing CI forever on third-party code is not
// useful, but neither is ignoring the scans entirely. So we:
//   1. Commit the current violation set per page in baseline.json.
//   2. Record every scan to reports/a11y-<page>.json (CI artifact).
//   3. FAIL when a scan reports a violation rule that is NOT already in the
//      baseline for that page. A new rule id means the app regressed.
// This gives the suite something real to gate on: any NEW accessibility defect
// turns the pipeline red, while the known, pre-existing ones stay recorded.

const baselinePath = path.resolve(process.cwd(), "baseline.json");
const baseline: Record<string, string[]> = JSON.parse(
  readFileSync(baselinePath, "utf8")
);

async function scan(page: import("@playwright/test").Page, name: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  await mkdir("reports", { recursive: true });
  await writeFile(
    `reports/a11y-${name}.json`,
    JSON.stringify(
      {
        page: name,
        scannedAt: new Date().toISOString(),
        totalViolations: results.violations.length,
        seriousOrCritical: results.violations.filter((v) =>
          ["serious", "critical"].includes(v.impact ?? "")
        ).length,
        violations: results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.length,
        })),
      },
      null,
      2
    )
  );

  return results;
}

function assertNoNewViolations(name: string, violations: { id: string }[]) {
  const allowed = baseline[name] ?? [];
  const found = violations.map((v) => v.id);
  const newViolations = found.filter((id) => !allowed.includes(id));
  expect(
    newViolations,
    `New a11y violations on ${name}: ${newViolations.join(", ")}. ` +
      `If the app genuinely improved, remove these ids from accessibility/baseline.json.`
  ).toEqual([]);
}

test("SauceDemo login page a11y", async ({ page }) => {
  await page.goto("https://www.saucedemo.com");
  const results = await scan(page, "saucedemo-login");
  assertNoNewViolations("saucedemo-login", results.violations);
});

test("SauceDemo inventory page a11y", async ({ page }) => {
  await page.goto("https://www.saucedemo.com");
  await page.getByPlaceholder("Username").fill("standard_user");
  await page.getByPlaceholder("Password").fill("secret_sauce");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/inventory\.html/);
  const results = await scan(page, "saucedemo-inventory");
  assertNoNewViolations("saucedemo-inventory", results.violations);
});

test("AutomationExercise home page a11y", async ({ page }) => {
  await page.goto("https://www.automationexercise.com");
  const results = await scan(page, "automationexercise-home");
  assertNoNewViolations("automationexercise-home", results.violations);
});
