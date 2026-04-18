import requests

BASE_URL = "http://localhost:5181"
TIMEOUT = 30

# Replace these with valid credentials of an existing user who has roles/permissions for menu sidebar
VALID_USER_CREDENTIALS = {
    "username": "testuser",
    "password": "TestPassword123!"
}

def test_get_api_v1_menu_sidebar_with_valid_authorization():
    token = None
    try:
        # Step 1: Login to get JWT token
        login_url = f"{BASE_URL}/api/v1/Auth/login"
        login_resp = requests.post(login_url, json=VALID_USER_CREDENTIALS, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert "accessToken" in login_data or "token" in login_data, "JWT access token not found in login response"
        # Support possible token field name variations
        token = login_data.get("accessToken") or login_data.get("token")
        assert isinstance(token, str) and len(token) > 0, "Invalid JWT token format"

        # Step 2: Access /api/v1/Menu/sidebar with valid Authorization header
        sidebar_url = f"{BASE_URL}/api/v1/Menu/sidebar"
        headers = {
            "Authorization": f"Bearer {token}"
        }
        sidebar_resp = requests.get(sidebar_url, headers=headers, timeout=TIMEOUT)
        assert sidebar_resp.status_code == 200, f"GET /api/v1/Menu/sidebar failed with status {sidebar_resp.status_code}"

        sidebar_data = sidebar_resp.json()
        assert isinstance(sidebar_data, dict), "Sidebar response is not a JSON object"

        # The sidebar menu JSON is filtered by the user's roles and permissions,
        # Verify it contains expected keys or structure (minimal validation)
        # Since no exact schema provided, ensure some menu data present
        assert "items" in sidebar_data, "Sidebar response missing 'items' wrapper"
        assert isinstance(sidebar_data["items"], list), "'items' is not a list in sidebar response"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_v1_menu_sidebar_with_valid_authorization()