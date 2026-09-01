# Performance Testing - k6

Performance and load testing with [k6](https://k6.io/). A fast *smoke* test runs in CI
and a heavier *load* test runs locally.

Targets:
- **AutomationExercise API**: `GET /api/productsList` (public)
- **SauceDemo**: `GET /` (login page)

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

`load.js` ramps to 20 virtual users against `automationexercise.com`, which is not ours.
That is why it is deliberately kept out of CI: a pipeline that fires a staged ramp at a
free public demo service on every push is abusing it, however small the numbers look.
Run it by hand, sparingly, and point it at your own environment before you turn the
numbers up. The smoke test in CI is 2 VUs for 20 seconds, which is ordinary traffic.

## Thresholds note

The targets here are third-party demo APIs we don't control. Their latency varies by
region and time of day, so we gate primarily on error rate (health) and use generous
latency ceilings rather than tight SLA thresholds. A tight p(95) number would fail CI on
a slow external API without telling you anything useful about *your* system. That is the
kind of flaky gate that erodes confidence in the pipeline. For your own services, tighten
these to real SLAs.
