import requests

def test_post_api_v1_auth_login_with_valid_credentials():
    base_url = "http://localhost:5181"
    login_url = f"{base_url}/api/v1/Auth/login"
    timeout = 30

    # Replace these with valid test user credentials known to the system
    valid_credentials = {
        "username": "testuser",
        "password": "TestPassword123!"
    }

    try:
        response = requests.post(login_url, json=valid_credentials, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request to {login_url} failed: {e}"

    # Assert status code 200
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    # Response body should contain a JWT access token (assuming JSON response with 'accessToken' or similar)
    try:
        json_body = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Look for access token key, common keys are 'accessToken' or 'token'
    token_keys = ['accessToken', 'token', 'jwt']
    access_token = None
    for key in token_keys:
        if key in json_body and isinstance(json_body[key], str) and json_body[key]:
            access_token = json_body[key]
            break
    assert access_token is not None, "JWT access token not found in response body"

    # Verify refresh token cookie is set, secure and HttpOnly
    cookies = response.cookies
    # Usually refresh token cookie name is "refreshToken" or similar
    refresh_token_cookie = None
    for cookie in cookies:
        if 'refresh' in cookie.name.lower():
            refresh_token_cookie = cookie
            break
    assert refresh_token_cookie is not None, "Refresh token cookie not set by server"

    # Check Secure and HttpOnly flags
    # requests.Response.cookies are cookiejar.Cookie objects
    assert refresh_token_cookie.secure, "Refresh token cookie is not marked as Secure"
    assert refresh_token_cookie.has_nonstandard_attr('HttpOnly'), "Refresh token cookie is not marked as HttpOnly"

test_post_api_v1_auth_login_with_valid_credentials()