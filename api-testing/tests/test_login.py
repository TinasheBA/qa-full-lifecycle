import requests

from config import login_url, REQUEST_TIMEOUT


def _unique_email():
    import uuid

    return f"qa_{uuid.uuid4().hex[:8]}@example.com"


def test_login_endpoint_responds():
    # The verifyLogin endpoint is reachable and returns 200 HTTP regardless of the
    # credential outcome (success/failure is encoded in the JSON body).
    resp = requests.post(login_url(), data={"email": _unique_email(), "password": "secret"}, timeout=REQUEST_TIMEOUT)
    assert resp.status_code == 200


def test_login_unknown_user_not_found():
    # A non-existent user yields responseCode 404 "User not found" in the body.
    resp = requests.post(login_url(), data={"email": _unique_email(), "password": "secret"}, timeout=REQUEST_TIMEOUT)
    data = resp.json()
    assert data["responseCode"] == 404
    assert "user not found" in data.get("message", "").lower()


def test_login_requires_email_and_password():
    # Omitting fields is a bad request: the body reports a non-200 responseCode.
    resp = requests.post(login_url(), data={"email": _unique_email()}, timeout=REQUEST_TIMEOUT)
    data = resp.json()
    assert data["responseCode"] != 200
