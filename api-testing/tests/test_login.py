import requests

from config import login_url, REQUEST_TIMEOUT


def _unique_email():
    import uuid

    return f"qa_{uuid.uuid4().hex[:8]}@example.com"


def test_login_unknown_user_not_found():
    # A non-existent user yields responseCode 404 "User not found" in the body.
    resp = requests.post(login_url(), data={"email": _unique_email(), "password": "secret"}, timeout=REQUEST_TIMEOUT)
    data = resp.json()
    assert data["responseCode"] == 404
    assert "user not found" in data.get("message", "").lower()


def test_login_requires_email_and_password():
    # Omitting the password is a bad request: responseCode 400, and a message
    # naming the missing parameter.
    #
    # Asserted on the specific code rather than `!= 200`. The two rejections this
    # endpoint issues are 400 for a missing parameter and 404 for a user that does
    # not exist, so `!= 200` is satisfied by either one: the test above proves an
    # unknown email returns 404, and this request also carries an unknown email.
    # Were the endpoint to stop validating and simply look the address up, it would
    # answer 404 and a `!= 200` assertion would still pass, reporting that
    # validation works when nothing had validated anything.
    resp = requests.post(login_url(), data={"email": _unique_email()}, timeout=REQUEST_TIMEOUT)
    data = resp.json()
    assert data["responseCode"] == 400
    assert "missing" in data.get("message", "").lower()
