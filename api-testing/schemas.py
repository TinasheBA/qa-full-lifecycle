"""JSON schemas for the contract tests.

These define the shape the AutomationExercise API is expected to return. Validating
responses against them is what makes these contract tests rather than plain
smoke checks.
"""

PRODUCT_SCHEMA = {
    "type": "object",
    "required": ["id", "name", "price", "brand", "category"],
    "properties": {
        "id": {"type": "integer"},
        "name": {"type": "string"},
        "price": {"type": "string"},
        "brand": {"type": "string"},
        "category": {
            "type": "object",
            "required": ["category"],
            "properties": {
                "category": {"type": "string"},
                "usertype": {"type": "object"},
            },
        },
    },
}

PRODUCTS_LIST_SCHEMA = {
    "type": "object",
    "required": ["products"],
    "properties": {
        "products": {
            "type": "array",
            "items": PRODUCT_SCHEMA,
        }
    },
}

BRAND_SCHEMA = {
    "type": "object",
    "required": ["id", "brand"],
    "properties": {
        "id": {"type": "integer"},
        "brand": {"type": "string"},
    },
}

BRANDS_LIST_SCHEMA = {
    "type": "object",
    "required": ["brands"],
    "properties": {
        "brands": {
            "type": "array",
            "items": BRAND_SCHEMA,
        }
    },
}
