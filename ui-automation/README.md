# UI Automation - Playwright + TypeScript

UI automation with the Page Object Model (POM) against SauceDemo, running cross-browser
(Chromium, Firefox, WebKit) and wired into CI.

## Files

| File | Purpose |
|------|---------|
| `package.json` | Deps + scripts |
| `playwright.config.ts` | Projects, browsers, reporters, CI config |
| `auth.ts` | Pre-authenticated storage state for specs that are not testing login |
| `pages/` | Page objects (login, inventory, cart, checkout) |
| `tests/` | Specs that use the page objects |
| `eslint.config.mjs` | Lint config; `no-floating-promises` is the rule that earns it |
| `tsconfig.json` | TS config for tests |

## Run

```bash
npm ci
npx playwright install --with-deps   # first time, downloads browsers
npm run typecheck                    # tsc --noEmit
npm run lint                         # catches a forgotten await on a click or expect
npm run test:e2e
```

## Scripts

```json
"test:e2e": "playwright test",
"test:e2e:headed": "playwright test --headed",
"test:e2e:report": "playwright show-report",
"typecheck": "tsc --noEmit",
"lint": "eslint ."
```

CI runs `typecheck` and `lint` before the browsers start. A missing `await` on a click or
an `expect` is the most common Playwright bug, and it is not a type error, so lint is the
only thing that catches it mechanically rather than by eye.

## Locators and assertions

Two rules the specs hold to, because breaking either is how a suite starts passing for
the wrong reason.

Assertions on anything the UI has to catch up to use the auto-retrying `expect(locator)`
form. Reading `textContent()` and asserting on the string samples once and races the
render. The one place a value is read directly is the checkout totals, where the
assertion is arithmetic over three parsed numbers; there the three labels are first
asserted to hold a settled currency amount, so the read is not the racing part.

Locators are test-id and role based. SauceDemo marks its elements with `data-test`, so
`playwright.config.ts` sets `testIdAttribute: "data-test"` and the page objects use
`getByTestId`. Controls inside a row are found by role within the row, which keeps them
readable and avoids depending on the per-product id suffixes.

## Coverage

12 tests in 4 spec files, each run on chromium, firefox and webkit (36 runs). They mirror
the manual test pack (`../manual-testing/test-cases.md`):

| Spec | Test cases |
|------|-----------|
| `tests/login.spec.ts` | TC-01 valid login, TC-02 invalid credentials, TC-03 locked-out user |
| `tests/inventory.spec.ts` | TC-04 product details shown, TC-14 sorting reorders both ways, TC-15 sorting does not reorder for `problem_user` (BUG-001) |
| `tests/cart.spec.ts` | TC-05 add updates badge, TC-06 Remove replaces Add, TC-07 cart lists items, TC-08 remove (empty + decrement cases) |
| `tests/checkout.spec.ts` | TC-10 happy path (including the overview totals and the cart clearing), TC-11 empty first name |

TC-12 and TC-13 are manual only: they are the same checkout validator behind two more
field names, and TC-11 already covers it. See
`../manual-testing/traceability-matrix.md` for the requirement-by-requirement position.

Only `login.spec.ts` drives the login form. The rest plant SauceDemo's session cookie via
`auth.ts`, which is the whole of its session state, so those specs start on the page they
are actually about instead of depending on a form they are not testing. The suite runs in
about 17 seconds as a result.

The overview totals are asserted as `subtotal + tax == total` rather than against
hard-coded amounts, so the check survives the demo app repricing its catalogue but still
fails if the arithmetic breaks.
