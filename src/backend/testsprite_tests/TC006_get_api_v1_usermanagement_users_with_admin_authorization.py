import requests

BASE_URL = "http://localhost:5181"
USERS_ENDPOINT = "/api/v1/UserManagement/users"
TIMEOUT = 30

def test_get_usermanagement_users_with_admin_authorization():
    # Replace this with a valid admin token for testing
    admin_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.adminvalidtokenplaceholder"

    headers = {
        "Authorization": f"Bearer {admin_token}"
    }

    try:
        response = requests.get(f"{BASE_URL}{USERS_ENDPOINT}", headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {USERS_ENDPOINT} failed: {e}"

    assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"

    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Verify 'items' wrapper for list endpoints standardized
    assert "items" in json_data, "'items' key not found in response JSON"

    items = json_data['items']
    assert isinstance(items, list), "'items' should be a list"

    # Each user should have role and menu assignment metadata
    for user in items:
        assert "role" in user or "roles" in user, "User missing 'role' or 'roles' metadata"
        assert "menuAssignments" in user or "menuAssignment" in user or "menus" in user, "User missing menu assignment metadata"

test_get_usermanagement_users_with_admin_authorization()