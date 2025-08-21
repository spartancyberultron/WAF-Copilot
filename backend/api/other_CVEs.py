import requests
import json

def fetch_infra_cves(limit=200, api_key=None, save_file="cloud_cves.json"):
    """
    Fetch confirmed & analyzed CVEs for Kubernetes, Docker, and Cloud (AWS, Azure, GCP).
    
    :param limit: Number of CVEs to return
    :param api_key: Optional NVD API key
    :param save_file: File path to save the CVEs as JSON (None to skip saving)
    :return: List of CVE details
    """
    base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    headers = {}
    if api_key:
        headers["apiKey"] = api_key

    keywords = [
        "kubernetes", "docker",
        "containerd", "runc",
        "aws", "amazon web services",
        "azure", "microsoft azure",
        "gcp", "google cloud platform"
    ]
    
    cves = []
    for kw in keywords:
        params = {
            "keywordSearch": kw,  # Changed from "keyword" to "keywordSearch"
            "resultsPerPage": min(limit, 2000),
        }
        resp = requests.get(base_url, headers=headers, params=params)
        if resp.status_code != 200:
            print(f"❌ Error fetching {kw}: {resp.status_code}")
            continue
        
        data = resp.json()
        for item in data.get("vulnerabilities", []):
            cve = item["cve"]

            # Skip if CVE has no metrics (not yet analyzed/confirmed)
            metrics = cve.get("metrics", {})
            cvss = metrics.get("cvssMetricV31") or metrics.get("cvssMetricV30", [])
            if not cvss:
                continue

            score = cvss[0]["cvssData"].get("baseScore")
            severity = cvss[0]["cvssData"].get("baseSeverity")

            cves.append({
                "id": cve["id"],
                "description": cve["descriptions"][0]["value"],
                "published": cve.get("published"),
                "lastModified": cve.get("lastModified"),
                "cvss_score": score,
                "severity": severity,
                "references": [r["url"] for r in cve.get("references", [])],
                "keyword": kw
            })

        if len(cves) >= limit:
            break
    
    if save_file:
        with open(save_file, "w", encoding="utf-8") as f:
            json.dump(cves[:limit], f, indent=2)
        print(f"✅ Saved {len(cves[:limit])} Infra-related CVEs to {save_file}")
    
    return cves[:limit]


if __name__ == "__main__":
    results = fetch_infra_cves(limit=200)
    for r in results[:5]:
        print(f"- {r['id']} ({r['severity']}): {r['description'][:80]}...")
