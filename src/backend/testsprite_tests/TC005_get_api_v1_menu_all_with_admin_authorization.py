import requests

BASE_URL = "http://localhost:5181"
TIMEOUT = 30

# Place your valid admin token here
ADMIN_BEARER_TOKEN = "your_valid_admin_bearer_token_here"

def test_get_api_v1_menu_all_with_admin_authorization():
    url = f"{BASE_URL}/api/v1/Menu/all"
    headers = {
        "Authorization": f"Bearer {ADMIN_BEARER_TOKEN}",
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Assert HTTP 200 OK
    assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Assert 'items' key in response JSON as per standardization
    assert "items" in data, "'items' key not found in response"

    # Assert that 'items' is a list
    assert isinstance(data["items"], list), "'items' is not a list"

    # Optionally check if the list is not empty
    # assert len(data["items"]) > 0, "'items' list is empty"

test_get_api_v1_menu_all_with_admin_authorization()