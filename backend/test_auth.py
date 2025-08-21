import requests
import json

# Test authentication flow
BASE_URL = "http://localhost:8000"

def test_auth():
    # Test login
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    print("Testing login...")
    login_response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
    print(f"Login status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        login_result = login_response.json()
        print(f"Login successful: {login_result}")
        
        # Test authenticated endpoint
        headers = {
            "Authorization": f"Bearer {login_result['access_token']}",
            "Content-Type": "application/json"
        }
        
        print("\nTesting authenticated endpoint...")
        auth_response = requests.get(f"{BASE_URL}/api/user/cves/", headers=headers)
        print(f"Auth endpoint status: {auth_response.status_code}")
        print(f"Auth response: {auth_response.text[:200]}...")
        
        # Test CVE explanation endpoint
        print("\nTesting CVE explanation endpoint...")
        cve_data = {
            "cve_id": "CVE-2023-1234",
            "description": "Test vulnerability",
            "severity": "High"
        }
        
        cve_response = requests.post(f"{BASE_URL}/api/cve-explanation/", 
                                   json=cve_data, 
                                   headers=headers)
        print(f"CVE explanation status: {cve_response.status_code}")
        print(f"CVE response: {cve_response.text[:200]}...")
        
    else:
        print(f"Login failed: {login_response.text}")

if __name__ == "__main__":
    test_auth()
