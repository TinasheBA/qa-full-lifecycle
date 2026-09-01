# qa-full-lifecycle

[![CI](https://github.com/TinasheBA/qa-full-lifecycle/actions/workflows/ci.yml/badge.svg)](https://github.com/TinasheBA/qa-full-lifecycle/actions/workflows/ci.yml)

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

Every one of those five jobs uploads its report as a CI artifact with `if: always()`,
so a red run still leaves the evidence behind, which is when you most need it.

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

# SQL validation (standard library only, no install needed)
cd sql-validation
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
- [x] SQL validation suite (5 rules over deliberately dirty seed data, gated on drift
      from a committed baseline rather than on defect count)
- [x] API test suite (11 tests over 3 endpoints; every request has a timeout)
- [x] UI automation suite (POM; 9 specs across chromium, firefox and webkit = 27 runs)
- [x] Performance smoke + load scripts (smoke gates CI, load is a local-only run)
- [x] Accessibility scans (baseline gates both new rule ids and node-count growth)
- [x] CI workflow (five jobs, each uploading its report as an artifact even on failure)

## Coverage

`manual-testing/traceability-matrix.md` is the source of truth. 16 of 16 requirements
are mapped to a test case; 12 have a full automated regression check, 1 is partially
automated, 3 are manual only. The manual-only rows are listed there with the reason.

The two numbers are kept apart on purpose. "Every requirement has a test case" and
"every requirement is guarded on every push" are different claims, and reporting them
as one number hides which requirements are actually protected.
