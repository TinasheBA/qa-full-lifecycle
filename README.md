# qa-full-lifecycle

[![CI](https://github.com/TinasheBA/qa-full-lifecycle/actions/workflows/ci.yml/badge.svg)](https://github.com/TinasheBA/qa-full-lifecycle/actions/workflows/ci.yml)

> A single repository that walks a QA engineer through the whole testing lifecycle:
> manual, SQL, API, UI automation, performance, accessibility, all wired together by CI.

Anyone can say they can test. The point of this repo is to show it. Each folder is a
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

CI also runs on a nightly schedule, not only on push. Every suite except the SQL one
reads a live third-party demo site, so a badge refreshed only on commit tells you the
suite passed whenever the last commit landed. The nightly run makes the badge mean
that it passes now, and it surfaces a demo site changing underneath the suite on the
day it happens.

## Quick start

```bash
# API tests
cd api-testing
pip install -r requirements.txt
pytest

# UI automation
cd ui-automation
npm ci
npm run typecheck && npm run lint   # tsc --noEmit, plus no-floating-promises
npm run test:e2e

# Accessibility scans
cd accessibility
npm ci
npm run test:a11y

# SQL validation (standard library only, no install needed)
cd sql-validation
python validate.py

# ...and the tests for the validation rules themselves
pip install -r requirements-dev.txt
pytest test_rules.py
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
- [x] Tests for the validation rules themselves (15 cases: every rule is proved to stay
      silent on clean data and to fire on the defect it exists to catch)
- [x] API test suite (6 tests over 3 endpoints; every request has a timeout)
- [x] UI automation suite (POM; 12 tests in 4 spec files across chromium, firefox and
      webkit = 36 runs, gated by `tsc --noEmit` and `no-floating-promises`)
- [x] Performance smoke + load scripts (smoke gates CI, load is a local-only run; both
      put a threshold on the checks metric so a failing check fails the run)
- [x] Accessibility scans (baseline gates both new rule ids and node-count growth)
- [x] CI workflow (five jobs, each uploading its report as an artifact even on failure,
      on push, on pull request and nightly)

## How this repo got here

Two pull requests are worth reading if you want the working method rather than the
result. [PR #1](https://github.com/TinasheBA/qa-full-lifecycle/pull/1) is where CI moved
from gating on defect count to gating on drift, and where a validation rule that silently
missed the defect it was written for got fixed.
[PR #2](https://github.com/TinasheBA/qa-full-lifecycle/pull/2) closed a set of gaps found
by reviewing this repo against my own
[Playwright review skill](https://github.com/TinasheBA/qa-playwright-skills): one-shot
assertions that raced the render, structural CSS locators, k6 checks that could not fail
the run, a requirement that documented the wrong behaviour, and an accessibility scan
that sometimes read a half-built page.

## Coverage

`manual-testing/traceability-matrix.md` is the source of truth. 16 of 16 requirements
are mapped to a test case; 15 have a full automated regression check and 1 (REQ-4.2) is
partially automated. The matrix gives the reason for the partial row.

The two numbers are kept apart on purpose. "Every requirement has a test case" and
"every requirement is guarded on every push" are different claims, and reporting them
as one number hides which requirements are actually protected.
