import requests
import gzip
import json
from io import BytesIO

NVD_FEED_URLS = [
    "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-Modified.json.gz"
] + [
    f"https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-{year}.json.gz"
    for year in range(2024, 2025)  # Adjust range for years you want
]

def fetch_and_parse(url):
    print(f"Downloading {url} ...")
    resp = requests.get(url)
    resp.raise_for_status()
    with gzip.GzipFile(fileobj=BytesIO(resp.content)) as gz:
        data = json.loads(gz.read().decode("utf-8"))
    return data.get("CVE_Items", [])

def extract_cve_details(cve_item):
    cve_id = cve_item["cve"]["CVE_data_meta"]["ID"]
    desc = cve_item["cve"]["description"]["description_data"][0]["value"]
    cvss_v3 = cve_item.get("impact", {}).get("baseMetricV3", {})
    cvss_v2 = cve_item.get("impact", {}).get("baseMetricV2", {})

    return {
        "id": cve_id,
        "description": desc,
        "cvss_v3_score": cvss_v3.get("cvssV3", {}).get("baseScore"),
        "cvss_v3_vector": cvss_v3.get("cvssV3", {}).get("vectorString"),
        "cvss_v2_score": cvss_v2.get("cvssV2", {}).get("baseScore"),
        "cvss_v2_vector": cvss_v2.get("cvssV2", {}).get("vectorString"),
        "published_date": cve_item.get("publishedDate"),
        "last_modified_date": cve_item.get("lastModifiedDate"),
        "references": [
            ref["url"]
            for ref in cve_item["cve"]["references"]["reference_data"]
        ]
    }

if __name__ == "__main__":
    all_cves = []
    for feed_url in NVD_FEED_URLS:
        try:
            cves = fetch_and_parse(feed_url)
            for cve in cves:
                all_cves.append(extract_cve_details(cve))
        except Exception as e:
            print(f"Error fetching {feed_url}: {e}")

    print(f"Total CVEs fetched: {len(all_cves)}")
    # Example: Save to JSON file
    with open("all_cves.json", "w", encoding="utf-8") as f:
        json.dump(all_cves, f, indent=2)
