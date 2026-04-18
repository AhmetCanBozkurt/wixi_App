import requests

BASE_URL = "http://localhost:5181"
TIMEOUT = 30

# Use a valid admin Bearer token for authorization
ADMIN_BEARER_TOKEN = "your_valid_admin_jwt_token_here"

def test_get_api_v1_audit_with_valid_filters_and_admin_authorization():
    headers = {
        "Authorization": f"Bearer {ADMIN_BEARER_TOKEN}",
        "Accept": "application/json"
    }
    params = {
        "startDate": "2026-04-01",
        "endDate": "2026-04-04"
    }

    try:
        response = requests.get(f"{BASE_URL}/api/v1/Audit", headers=headers, params=params, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"

    try:
        body = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Ensure 'items' wrapper present and it is a list
    assert "items" in body, "'items' key not found in response body"
    assert isinstance(body["items"], list), "'items' should be a list"

    # Validate each audit entry contains required fields
    for entry in body["items"]:
        assert isinstance(entry, dict), "Each audit entry should be a dict"
        assert "ipAddress" in entry or "ip" in entry, "Audit entry missing 'ipAddress' or equivalent field"
        assert "userAgent" in entry or "user-agent" in entry, "Audit entry missing 'userAgent' or equivalent field"
        assert "action" in entry, "Audit entry missing 'action' field"
        # At least one timestamp field present (createdAt, timestamp, or similar)
        timestamps_present = any(
            key in entry for key in ["timestamp", "createdAt", "date", "time"]
        )
        assert timestamps_present, "Audit entry missing timestamp field"

test_get_api_v1_audit_with_valid_filters_and_admin_authorization()