# API Testing - Pytest + requests

API and contract testing against [AutomationExercise's live API](https://www.automationexercise.com/api_list),
a free, widely used demo API covering products, brands, and login.

## Files

| File | Purpose |
|------|---------|
| `config.py` | Base URL + endpoint helpers |
| `conftest.py` | Session-scoped fixtures (each endpoint fetched once per run) |
| `schemas.py` | JSON schemas the contract tests validate against |
| `tests/test_products.py` | Contract + schema checks on `GET /api/productsList` |
| `tests/test_brands.py` | Contract + schema checks on `GET /api/brandsList` |
| `tests/test_login.py` | Request/response contract for login |
| `requirements.txt` | Python deps |

6 tests across the three endpoints.

## Run

```bash
pip install -r requirements.txt
pytest -v
```

## Coverage highlights

- **Products list**: matches a JSON schema, non-empty.
- **Brands list**: matches a JSON schema, non-empty.
- **No test that cannot fail on its own**: the status-code assertion lives in the
  session fixture, so a separate `returns_200` test could never fail without the
  fixture failing first and erroring every test in the file. Likewise the list schema
  already validates every item, so a second test validating one item proved nothing new.
  Both were removed rather than counted.
- **Single fetch per endpoint**: the session-scoped `conftest.py` fixtures cache each
  response, so the suite makes one call per endpoint instead of per test. The
  schema files (`schemas.py`) are what make these contract tests rather than plain
  smoke checks: a changed field type or a missing required key fails the run.
- **Every request has a timeout**: `config.REQUEST_TIMEOUT`. `requests` has no default
  timeout, so a call without one waits forever if the far end accepts the connection and
  then goes quiet. Against a public demo API that means a hung session-scoped fixture
  taking the whole CI job with it, up to the runner's six-hour ceiling.
- **Login flow**: we test the stable contract the demo API guarantees. The `verifyLogin`
  endpoint is reachable, unknown users return `responseCode 404` ("User not found"), and
  missing fields are a bad request. The demo's success path needs a real registered
  account, which the write endpoints make flaky, so we assert the deterministic failure
  contract instead.
