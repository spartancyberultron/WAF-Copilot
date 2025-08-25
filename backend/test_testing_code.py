#!/usr/bin/env python3
"""
Test script for the CVE testing code generation endpoint.
This script tests the new Django view that generates Python testing code for CVEs.
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
TESTING_CODE_URL = f"{BASE_URL}/api/generate-testing-code/"

# Test credentials (you'll need to create a user first)
TEST_USERNAME = "testuser"
TEST_PASSWORD = "testpass123"

def test_login():
    """Test user login to get authentication token"""
    login_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(LOGIN_URL, json=login_data)
        if response.status_code == 200:
            data = response.json()
            return data.get('access_token')
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_generate_testing_code(token):
    """Test the testing code generation endpoint"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test CVE data
    cve_data = {
        "cve_id": "CVE-2024-12345",
        "description": "A buffer overflow vulnerability in the example library allows attackers to execute arbitrary code via crafted input.",
        "severity": "High"
    }
    
    try:
        response = requests.post(TESTING_CODE_URL, json=cve_data, headers=headers)
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get('success') and data.get('python_code'):
                print("\n📝 Generated Python Code:")
                print("=" * 50)
                print(data['python_code'])
                print("=" * 50)
            else:
                print("❌ No Python code generated")
        else:
            print(f"❌ Request failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Main test function"""
    print("🧪 Testing CVE Testing Code Generation Endpoint")
    print("=" * 60)
    
    # Step 1: Login to get token
    print("1. Logging in...")
    token = test_login()
    
    if not token:
        print("❌ Cannot proceed without authentication token")
        return
    
    print(f"✅ Login successful, token: {token[:20]}...")
    
    # Step 2: Test the testing code generation
    print("\n2. Testing code generation...")
    test_generate_testing_code(token)
    
    print("\n🏁 Test completed!")

if __name__ == "__main__":
    main()
