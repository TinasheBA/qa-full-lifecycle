from jsonschema import validate

from schemas import BRAND_SCHEMA, BRANDS_LIST_SCHEMA


def test_brands_list_returns_200(brands_response):
    assert brands_response.status_code == 200


def test_brands_list_matches_schema(brands_response):
    validate(instance=brands_response.json(), schema=BRANDS_LIST_SCHEMA)


def test_brands_list_not_empty(brands_response):
    assert len(brands_response.json()["brands"]) > 0


def test_brand_required_fields(brands_response):
    validate(instance=brands_response.json()["brands"][0], schema=BRAND_SCHEMA)
