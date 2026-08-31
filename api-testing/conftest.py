"""Shared fixtures for the API test suite.

Each fixture fetches its endpoint once per test session (session scope) so the
suite makes a handful of HTTP requests instead of one per test. Parametrized
tests reuse the cached response.
"""

import pytest
import requests

from config import product_url, brands_url


@pytest.fixture(scope="session")
def products_response():
    resp = requests.get(product_url())
    assert resp.status_code == 200
    return resp


@pytest.fixture(scope="session")
def brands_response():
    resp = requests.get(brands_url())
    assert resp.status_code == 200
    return resp


@pytest.fixture(scope="session")
def products(products_response):
    return products_response.json()["products"]


@pytest.fixture(scope="session")
def brands(brands_response):
    return brands_response.json()["brands"]
