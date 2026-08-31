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

## Run

```bash
pip install -r requirements.txt
pytest -v
```

## Coverage highlights

- **Products list**: 200, matches a JSON schema, non-empty.
- **Brands list**: 200, matches a JSON schema, non-empty.
- **Single fetch per endpoint**: the session-scoped `conftest.py` fixtures cache each
  response, so the suite makes one call per endpoint instead of per test. The
  schema files (`schemas.py`) are what make these contract tests rather than plain
  smoke checks: a changed field type or a missing required key fails the run.
- **Login flow**: we test the stable contract the demo API guarantees. The `verifyLogin`
  endpoint is reachable, unknown users return `responseCode 404` ("User not found"), and
  missing fields are a bad request. The demo's success path needs a real registered
  account, which the write endpoints make flaky, so we assert the deterministic failure
  contract instead.
