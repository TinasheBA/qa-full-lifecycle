"""Base configuration for the API test suite."""

BASE_URL = "https://automationexercise.com/api"


def product_url():
    return f"{BASE_URL}/productsList"


def brands_url():
    return f"{BASE_URL}/brandsList"


def login_url():
    return f"{BASE_URL}/verifyLogin"
