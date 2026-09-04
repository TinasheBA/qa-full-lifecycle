# Performance Testing - k6

Performance and load testing with [k6](https://k6.io/). A fast *smoke* test runs in CI
and a heavier *load* test runs locally.

Targets:
- `smoke.js` -> **AutomationExercise API**: `GET /api/productsList` (public)
- `load.js` -> **test.k6.io**, Grafana's own public target for k6 practice

## Files

| File | Purpose |
|------|---------|
| `smoke.js` | Tiny load, fast; used by CI |
| `load.js` | Larger staged load; run locally |
| `README.md` | This file |

## Install & run

```bash
# Install k6 (Windows: choco install k6, or download from k6.io)
k6 run smoke.js
k6 run load.js
```

## Why smoke in CI

A full load test in CI is slow and flaky. The convention is to run a smoke test (a few
virtual users) in CI to prove the script and endpoints stay healthy, and keep the heavier
`load.js` for intentional runs.

## A note on load testing someone else's server

`load.js` ramps to 20 virtual users, which is real traffic. It used to aim that at
`automationexercise.com`, which is not ours, and keeping it out of CI was not enough of
an answer: a staged ramp at a free public demo service is rude whenever it runs, not only
when a pipeline runs it. It now points at `test.k6.io`, which Grafana publishes for
exactly this purpose. Point it at your own environment before you turn the numbers up.

The smoke test still reads the AutomationExercise API, at 2 VUs for 20 seconds. That is
ordinary traffic for a read-only health check, and it is the suite that has to exercise
the same endpoint the API tests cover.

## A note on what makes a check fail

k6 only sets a non-zero exit code from `thresholds`, never from `check()`. Both scripts
therefore put a threshold on the `checks` metric. Without it the checks are a report, not
a gate: a 200 response carrying an empty or garbage body would pass the run.

## Thresholds note

The targets here are third-party demo APIs we don't control. Their latency varies by
region and time of day, so we gate primarily on error rate (health) and use generous
latency ceilings rather than tight SLA thresholds. A tight p(95) number would fail CI on
a slow external API without telling you anything useful about *your* system. That is the
kind of flaky gate that erodes confidence in the pipeline. For your own services, tighten
these to real SLAs.
