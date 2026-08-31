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

Mirrors the manual test pack (`../manual-testing/test-cases.md`):
- Happy-path login + checkout (TC-01, TC-10)
- Negative login (TC-02, TC-03)
- Add/remove item + cart (TC-05, TC-08)
