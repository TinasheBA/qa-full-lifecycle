# Accessibility Testing - axe-core + Playwright

Accessibility (a11y) testing with [axe-core](https://www.deque.com/axe/) wired into
Playwright, scanning SauceDemo (after login) and AutomationExercise.

Runs WCAG 2.1 scans on key flows.

## Files

| File | Purpose |
|------|---------|
| `package.json` | Deps + scripts |
| `playwright-a11y.config.ts` | a11y-specific config (chromium only) |
| `baseline.json` | Committed per-page baseline: known rule ids and their node caps |
| `tests/a11y.spec.ts` | Scans both apps, fails on new violations or node growth, writes reports |
| `tsconfig.json` | TS config |

## Run

```bash
npm install          # project deps
npx playwright install chromium
npm run test:a11y
```

## What's checked

- SauceDemo login + inventory page after login
- AutomationExercise home page

Every scan writes a `reports/a11y-<page>.json` artifact with the full WCAG 2.1 AA
violation set.

## How it fails

These demo apps ship with known, pre-existing accessibility defects (AutomationExercise
has hundreds). Because those aren't ours to fix, the suite does not fail on the known
set. Instead:

1. `baseline.json` records, per page, the violation rule ids already present and how
   many nodes each is allowed to affect.
2. A scan fails if it finds a violation rule **not** in that page's baseline. A new
   rule id means the app regressed on accessibility.
3. A scan also fails if a **baselined** rule affects more nodes than its cap. Rule ids
   alone are a coarse gate, because a page going from one bad contrast pair to fifty is a
   real regression that never introduces a new rule id.
4. Caps are opt-in. `null` means "this rule is known, don't gate its count", used for
   `color-contrast` on the AutomationExercise home page where the count tracks rotating
   marketing content rather than anything the app did wrong. Capping it there would make
   the suite flaky without telling us anything.
5. If the apps genuinely fix a rule, the run logs which baselined rules stopped firing,
   so the baseline gets tightened rather than left to rot. It logs instead of failing,
   because an app fixing its own bugs should not break our build.

Every scan writes the full violation set to `reports/a11y-<page>.json`, uploaded as a
CI artifact. Open it to see the findings.
