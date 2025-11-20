import requests
import time 

BASE_URL = "http://localhost:5000"
headers = {"Content-Type": "application/json"}

def register(username="testuser", password="testpass", email="test@example.com"):
    url = f"{BASE_URL}/auth/register"
    data = {"username": username, "password": password, "email": email}
    response = requests.post(url, json=data, headers=headers)
    print(f"[Register] Status: {response.status_code}")
    print(f"[Register] Response: {response.json()}")
    return response.status_code == 201

def login(username="root", password="123456"):
    url = f"{BASE_URL}/auth/login"
    data = {"username": username, "password": password}
    response = requests.post(url, json=data, headers=headers)
    print(f"[Login] Status: {response.status_code}")
    print(f"[Login] Response: {response.json()}")
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def test_with_token(token, test_name, url, data=None, method="POST"):
    auth_headers = headers.copy()
    auth_headers["Authorization"] = f"Bearer {token}"
    if method == "POST":
        response = requests.post(url, json=data or {}, headers=auth_headers)
    else:
        response = requests.get(url, headers=auth_headers)
    print(f"[{test_name}] Status: {response.status_code}")
    print(f"[{test_name}] Response: {response.json() if response.content else 'No content'}")
    return response.status_code == 200

# Main process
if __name__ == "__main__":
    print("=== Start testing process ===")
    token = login()
    if not token:
        print("Login failed, exit testing")
        exit(1)
    time.sleep(1)
    
    print("\n=== Test API with Token ===")
    
    # query_data = {"fields": ["authors"], "limit": 1000}
    # test_with_token(token, "Query", f"{BASE_URL}/api/query", query_data)
    
    collect_data = {"year": 2025, "month": 1, "day": 1}
    test_with_token(token, "Monthly Collect", f"{BASE_URL}/api/collect/daily", collect_data)
    
    # assist_data = {"arxiv_id": "2305.03048"} 
    # test_with_token(token, "Assist Read", f"{BASE_URL}/api/assist/read", assist_data)
    
    # recommend_data = {"keywords": "AI image generation"}
    # test_with_token(token, "Recommend", f"{BASE_URL}/api/recommend", recommend_data)
    
    # test_with_token(token, "Logout", f"{BASE_URL}/auth/logout", method="POST")
    
    # print("\n=== Testing complete ===")