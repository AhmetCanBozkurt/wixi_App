import requests

BASE_URL = "http://localhost:5181"
LOGIN_PATH = "/api/v1/Auth/login"
ME_PATH = "/api/v1/Auth/me"
TIMEOUT = 30

def test_get_api_v1_auth_me_with_valid_token():
    # Use valid user credentials for login
    valid_credentials = {
        "username": "testuser",
        "password": "TestPassword123!"
    }

    try:
        # Step 1: Login to get JWT access token
        login_response = requests.post(
            BASE_URL + LOGIN_PATH,
            json=valid_credentials,
            timeout=TIMEOUT
        )
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        login_json = login_response.json()
        assert "accessToken" in login_json, "No accessToken found in login response"

        access_token = login_json["accessToken"]
        assert isinstance(access_token, str) and access_token, "Access token is empty or not a string"

        # Step 2: Get current authenticated user details with valid Authorization header
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        me_response = requests.get(
            BASE_URL + ME_PATH,
            headers=headers,
            timeout=TIMEOUT
        )
        assert me_response.status_code == 200, f"GET /api/v1/Auth/me failed with status {me_response.status_code}"
        me_json = me_response.json()
        # Validate expected fields in user details (id, username or similar keys)
        assert isinstance(me_json, dict), "Response body is not a JSON object"
        assert "id" in me_json and me_json["id"], "User ID not found in response"
        assert "username" in me_json and me_json["username"], "Username not found in response"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_v1_auth_me_with_valid_token()