# Manual Testing - SauceDemo

The manual end of the lifecycle: turning a product requirement into test cases,
executing them, and reporting defects. These documents are the upstream input that
drives the automated suites elsewhere in this repo.

## Scope

We take SauceDemo (an inventory web app) as the system under test and cover the core
checkout flow.

- Base URL: `https://www.saucedemo.com/`

## Files

| File | Purpose |
|------|---------|
| `requirements.md` | Feature requirements map (the spec we test against) |
| `test-cases.md` | Executable test cases with steps, data, expected results |
| `bug-report-template.md` | Reusable defect report format |
| `traceability-matrix.md` | Maps each requirement to its test case(s) |

## How to use

1. Read `requirements.md` to understand scope.
2. Execute case-by-case from `test-cases.md` against the live app.
3. Log any failure with `bug-report-template.md`.
4. Keep `traceability-matrix.md` current so coverage is visible.

## Note on the demo app

SauceDemo ships with deliberately planted bugs (sorting by name does not actually sort,
for one). These are features of the *demo*, not regressions. Flag them but don't expect
them to be fixed. It is worth naming this in interviews because it shows you understand
test-data hygiene.
