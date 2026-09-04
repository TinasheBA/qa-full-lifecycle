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
//   4. FAIL when a baselined rule affects MORE nodes than the baseline allows.
//      Rule ids alone are a coarse gate: a page going from one bad contrast pair
//      to fifty is a real regression that never introduces a new rule id.
//
// Node caps are opt-in per rule, because they are only meaningful where the count
// is stable. `null` means "this rule is known, don't cap its count", used on the
// AutomationExercise home page for color-contrast, whose count tracks rotating
// marketing content rather than anything the app did wrong.
//
// Every scan waits for a real element on the page first. This matters more than it
// looks: page.goto() resolves on `load`, and the AutomationExercise home page builds
// its content after that, so axe would sometimes scan a half-built DOM. That does not
// fail loudly, it produces a different and much smaller violation set (three
// color-contrast nodes instead of forty-one, plus rule ids the full page never
// reports), which the baseline gate then reports as a regression. Waiting for the
// product grid makes the scan deterministic: five consecutive runs return an
// identical violation set, where before roughly one run in five differed.

type PageBaseline = Record<string, number | null>;

// Resolved from this file, not from process.cwd(), so the suite runs from any
// directory rather than only from accessibility/.
const baselinePath = path.resolve(__dirname, "..", "baseline.json");
const rawBaseline = JSON.parse(readFileSync(baselinePath, "utf8")) as Record<string, unknown>;
const baseline: Record<string, PageBaseline> = Object.fromEntries(
  Object.entries(rawBaseline).filter(([key]) => !key.startsWith("_"))
) as Record<string, PageBaseline>;

type Violation = { id: string; nodes: unknown[] };

async function scan(page: import("@playwright/test").Page, name: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const reportDir = path.resolve(__dirname, "..", "reports");
  await mkdir(reportDir, { recursive: true });
  await writeFile(
    path.join(reportDir, `a11y-${name}.json`),
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

function assertWithinBaseline(name: string, violations: Violation[]) {
  const allowed = baseline[name] ?? {};

  const newRules = violations.map((v) => v.id).filter((id) => !(id in allowed));
  expect(
    newRules,
    `New a11y violation rules on ${name}: ${newRules.join(", ")}. ` +
      `If the app genuinely changed, update accessibility/baseline.json.`
  ).toEqual([]);

  const grown = violations
    .filter((v) => {
      const cap = allowed[v.id];
      return typeof cap === "number" && v.nodes.length > cap;
    })
    .map((v) => `${v.id} (${v.nodes.length} nodes, baseline allows ${allowed[v.id]})`);
  expect(
    grown,
    `Known a11y rules now affect more nodes on ${name}: ${grown.join(", ")}. ` +
      `Investigate before raising the cap in accessibility/baseline.json.`
  ).toEqual([]);

  const resolved = Object.keys(allowed).filter(
    (id) => !violations.some((v) => v.id === id)
  );
  if (resolved.length > 0) {
    // Not a failure, since an app fixing its own a11y bugs shouldn't break our
    // build, but it belongs in the log so the baseline gets tightened rather than
    // left to rot.
    console.log(
      `[a11y] ${name}: baselined rule(s) no longer firing: ${resolved.join(", ")}. ` +
        `Consider removing them from baseline.json.`
    );
  }
}

test("SauceDemo login page a11y", async ({ page }) => {
  await page.goto("https://www.saucedemo.com");
  await expect(page.getByTestId("login-button")).toBeVisible();
  const results = await scan(page, "saucedemo-login");
  assertWithinBaseline("saucedemo-login", results.violations);
});

test("SauceDemo inventory page a11y", async ({ page }) => {
  await page.goto("https://www.saucedemo.com");
  await page.getByPlaceholder("Username").fill("standard_user");
  await page.getByPlaceholder("Password").fill("secret_sauce");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.getByTestId("inventory-list")).toBeVisible();
  const results = await scan(page, "saucedemo-inventory");
  assertWithinBaseline("saucedemo-inventory", results.violations);
});

test("AutomationExercise home page a11y", async ({ page }) => {
  await page.goto("https://www.automationexercise.com");
  // The product grid is the last thing this page builds, so its first tile being
  // visible is the signal that there is a whole page here to scan.
  await expect(page.locator(".features_items .product-image-wrapper").first()).toBeVisible();
  const results = await scan(page, "automationexercise-home");
  assertWithinBaseline("automationexercise-home", results.violations);
});
