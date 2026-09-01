# UI Automation - Playwright + TypeScript

UI automation with the Page Object Model (POM) against SauceDemo, running cross-browser
(Chromium, Firefox, WebKit) and wired into CI.

## Files

| File | Purpose |
|------|---------|
| `package.json` | Deps + scripts |
| `playwright.config.ts` | Projects, browsers, reporters, CI config |
| `pages/` | Page objects (login, inventory, cart, checkout) |
| `tests/` | Specs that use the page objects |
| `tsconfig.json` | TS config for tests |

## Run

```bash
npm install
npx playwright install --with-deps   # first time, downloads browsers
npm run test:e2e
```

## Scripts

```json
"test:e2e": "playwright test",
"test:e2e:headed": "playwright test --headed",
"test:e2e:report": "playwright show-report"
```

## Coverage

9 specs, each run on chromium, firefox and webkit (27 runs). They mirror the manual test
pack (`../manual-testing/test-cases.md`):

| Spec | Test cases |
|------|-----------|
| `tests/login.spec.ts` | TC-01 valid login, TC-02 invalid credentials, TC-03 locked-out user |
| `tests/cart.spec.ts` | TC-05 add updates badge, TC-06 Remove replaces Add, TC-07 cart lists items, TC-08 remove (empty + decrement cases) |
| `tests/checkout.spec.ts` | TC-10 happy path (including the overview totals and the cart clearing), TC-11 empty first name |

TC-04, TC-12, TC-13 and TC-14 are manual only. See
`../manual-testing/traceability-matrix.md` for the requirement-by-requirement position.

The overview totals are asserted as `subtotal + tax == total` rather than against
hard-coded amounts, so the check survives the demo app repricing its catalogue but still
fails if the arithmetic breaks.
