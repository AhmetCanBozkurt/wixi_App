import requests
import uuid

BASE_URL = "http://localhost:5181"
REGISTER_ENDPOINT = "/api/v1/Auth/register"
LOGIN_ENDPOINT = "/api/v1/Auth/login"

def test_post_api_v1_auth_register_with_valid_new_user():
    # Generate unique user data
    unique_suffix = str(uuid.uuid4())[:8]
    new_user = {
        "username": f"testuser_{unique_suffix}",
        "email": f"testuser_{unique_suffix}@example.com",
        "password": "StrongP@ssw0rd!",
        "firstName": "Test",
        "lastName": "User"
    }

    headers = {"Content-Type": "application/json"}
    timeout = 30

    try:
        # Register new user
        register_resp = requests.post(
            BASE_URL + REGISTER_ENDPOINT, json=new_user, headers=headers, timeout=timeout
        )
        assert register_resp.status_code == 201, f"Expected 201 Created, got {register_resp.status_code}"
        register_data = register_resp.json()
        assert "id" in register_data, "Response JSON does not contain 'id'"
        created_user_id = register_data["id"]
        assert isinstance(created_user_id, (str, int)), "'id' should be a string or integer"

        # Login with new user credentials
        login_payload = {
            "username": new_user["username"],
            "password": new_user["password"]
        }
        login_resp = requests.post(
            BASE_URL + LOGIN_ENDPOINT, json=login_payload, headers=headers, timeout=timeout
        )
        assert login_resp.status_code == 200, f"Expected 200 OK on login, got {login_resp.status_code}"
        login_data = login_resp.json()
        assert "accessToken" in login_data or "token" in login_data, "JWT token not found in login response"

        # Optionally check presence of refresh token cookie (if needed)
        # Refresh token cookie should be HTTP-Only and Secure, but requests can't directly check these flags.
        # So just check cookie presence if available.
        cookies = login_resp.cookies
        assert len(cookies) > 0, "No cookies set on login response (expected refresh token cookie)"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_v1_auth_register_with_valid_new_user()