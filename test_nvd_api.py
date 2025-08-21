import requests
import json

def test_nvd_api():
    """Test NVD API connectivity and parameters"""
    base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    
    print("Testing NVD API connectivity...")
    
    # Test 1: Basic connectivity
    try:
        resp = requests.get(base_url, params={"resultsPerPage": 1})
        print(f"Status Code: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"✅ API is accessible. Found {data.get('totalResults', 0)} total CVEs")
        else:
            print(f"❌ API returned status code: {resp.status_code}")
            print(f"Response: {resp.text[:200]}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return
    
    # Test 2: Keyword search with correct parameter
    print("\nTesting keyword search with 'keywordSearch' parameter...")
    try:
        params = {
            "keywordSearch": "tensorflow",  # Using the correct parameter name
            "resultsPerPage": 5
        }
        resp = requests.get(base_url, params=params)
        print(f"Status Code: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            vulnerabilities = data.get("vulnerabilities", [])
            print(f"✅ Keyword search works. Found {len(vulnerabilities)} CVEs for 'tensorflow'")
            if vulnerabilities:
                cve = vulnerabilities[0]["cve"]
                print(f"Sample CVE: {cve['id']} - {cve['descriptions'][0]['value'][:100]}...")
        else:
            print(f"❌ Keyword search failed: {resp.status_code}")
            print(f"Response: {resp.text[:200]}")
    except Exception as e:
        print(f"❌ Keyword search error: {e}")
    
    # Test 3: Check rate limiting
    print("\nTesting rate limiting...")
    try:
        headers = {"User-Agent": "WAF-Copilot/1.0"}
        resp = requests.get(base_url, params={"resultsPerPage": 1}, headers=headers)
        print(f"Status Code: {resp.status_code}")
        if resp.status_code == 200:
            print("✅ No rate limiting issues detected")
        else:
            print(f"❌ Possible rate limiting: {resp.status_code}")
    except Exception as e:
        print(f"❌ Rate limiting test error: {e}")

if __name__ == "__main__":
    test_nvd_api()
