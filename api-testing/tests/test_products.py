from jsonschema import validate

from schemas import PRODUCTS_LIST_SCHEMA


def test_products_list_matches_schema(products_response):
    validate(instance=products_response.json(), schema=PRODUCTS_LIST_SCHEMA)


def test_products_list_not_empty(products_response):
    assert len(products_response.json()["products"]) > 0