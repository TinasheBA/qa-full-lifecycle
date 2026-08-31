# qa-full-lifecycle

> A single repository that walks a QA engineer through the whole testing lifecycle:
> manual, SQL, API, UI automation, performance, accessibility, all wired together by CI.

The idea is to not just claim you can test, but to show it. Each folder is a
self-contained discipline that builds toward a real, runnable suite against two widely
known demo applications:

- [SauceDemo](https://www.saucedemo.com/): e-commerce UI
- [AutomationExercise](https://www.automationexercise.com/): API + UI shop

## What's inside

| Folder | Discipline | Tooling | Runs in CI |
|--------|-----------|---------|-----------|
| `manual-testing/` | Requirements → test cases → bug reports | Markdown | no (docs) |
| `sql-validation/` | Data-rule checks against a demo schema | SQLite + Python | yes |
| `api-testing/` | Contract & workflow API tests | Pytest + requests | yes |
| `ui-automation/` | POM, cross-browser UI tests | Playwright + TypeScript | yes |
| `performance/` | Load & smoke performance tests | k6 | yes (smoke) |
| `accessibility/` | WCAG scans on key flows | axe-core + Playwright | yes |
| `.github/workflows/` | CI gating of every runnable suite | GitHub Actions | — |

Reports from every runnable suite are uploaded as CI artifacts, so each discipline
leaves an auditable result behind.

## Quick start

```bash
# API tests
cd api-testing
pip install -r requirements.txt
pytest

# UI + accessibility
cd ui-automation
npm install
npm run test:e2e

# SQL validation
cd sql-validation
pip install -r requirements.txt
python validate.py
```

## Structure

```
qa-full-lifecycle/
├── manual-testing/     test cases, bug reports, traceability
├── sql-validation/     SQLite schema + data-rule checks
├── api-testing/        Pytest + requests
├── ui-automation/      Playwright + TS (POM, cross-browser)
├── performance/        k6 load/smoke scripts
├── accessibility/      axe-core scans
├── reports/            local artifacts
└── .github/workflows/  CI
```

## Status

- [x] Manual testing pack (requirements, cases, bug reports, traceability)
- [x] SQL validation suite (validated locally; catches 4 planted defects)
- [x] API test suite (9 tests, validated live)
- [x] UI automation suite (POM; 15/15 on chromium, firefox and webkit)
- [x] Performance smoke + load scripts (validated against a local k6)
- [x] Accessibility scans (baseline committed; fails on new violations)
- [ ] CI workflow (committed, but first run in GitHub Actions pending)
- [ ] Push to GitHub + set metadata
