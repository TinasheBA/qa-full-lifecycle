from jsonschema import validate

from schemas import BRANDS_LIST_SCHEMA


def test_brands_list_matches_schema(brands_response):
    validate(instance=brands_response.json(), schema=BRANDS_LIST_SCHEMA)


def test_brands_list_not_empty(brands_response):
    assert len(brands_response.json()["brands"]) > 0