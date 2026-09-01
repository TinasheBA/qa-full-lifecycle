from jsonschema import validate

from schemas import PRODUCT_SCHEMA, PRODUCTS_LIST_SCHEMA


def test_products_list_returns_200(products_response):
    assert products_response.status_code == 200


def test_products_list_matches_schema(products_response):
    validate(instance=products_response.json(), schema=PRODUCTS_LIST_SCHEMA)


def test_products_list_not_empty(products_response):
    assert len(products_response.json()["products"]) > 0


def test_product_required_fields(products_response):
    validate(instance=products_response.json()["products"][0], schema=PRODUCT_SCHEMA)
