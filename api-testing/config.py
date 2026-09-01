"""Base configuration for the API test suite."""

BASE_URL = "https://automationexercise.com/api"

# Every request in this suite passes this. requests has no default timeout, so a
# call without one blocks forever if the far end accepts the connection and then
# goes quiet. Against a public demo API that means a hung session-scoped fixture
# taking the whole CI job down with it, up to the runner's six-hour ceiling.
REQUEST_TIMEOUT = 10


def product_url():
    return f"{BASE_URL}/productsList"


def brands_url():
    return f"{BASE_URL}/brandsList"


def login_url():
    return f"{BASE_URL}/verifyLogin"
