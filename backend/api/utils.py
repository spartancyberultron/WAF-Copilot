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

def is_important_cve(cve_item):
    """
    Determine if a CVE is important based on various criteria:
    - High CVSS scores (7.0+ for CVSS v3, 7.0+ for CVSS v2)
    - Not rejected/withdrawn
    - Has actual vulnerability description (not just rejection reason)
    - Related to code dependencies (programming languages, package managers, frameworks)
    """
    # Check if CVE is rejected or withdrawn
    description = cve_item["cve"]["description"]["description_data"][0]["value"]
    if "rejected" in description.lower() or "withdrawn" in description.lower():
        return False
    
    # Check if CVE is related to code dependencies
    dependency_keywords = [
        # Programming Languages
        "python", "nodejs", "node.js", "javascript", "typescript", "java", "ruby", "php", "go", "rust", "c#", ".net",
        # Package Managers
        "npm", "yarn", "pip", "composer", "maven", "gradle", "gem", "cargo", "nuget", "go mod",
        # Frameworks and Libraries
        "react", "angular", "vue", "django", "flask", "spring", "laravel", "express", "fastapi",
        # File types
        "package.json", "requirements.txt", "composer.json", "pom.xml", "build.gradle", "gemfile", "cargo.toml", "go.mod",
        # Common dependency-related terms
        "dependency", "package", "library", "framework", "module", "plugin", "extension"
    ]
    
    description_lower = description.lower()
    is_dependency_related = any(keyword in description_lower for keyword in dependency_keywords)
    
    # Get CVSS scores
    cvss_v3 = cve_item.get("impact", {}).get("baseMetricV3", {})
    cvss_v2 = cve_item.get("impact", {}).get("baseMetricV2", {})
    
    cvss_v3_score = cvss_v3.get("cvssV3", {}).get("baseScore")
    cvss_v2_score = cvss_v2.get("cvssV2", {}).get("baseScore")
    
    # Consider important if:
    # 1. It's related to code dependencies AND has high CVSS scores (7.0+)
    # 2. CVSS v3 score >= 7.0 (High/Critical)
    # 3. CVSS v2 score >= 7.0 (High)
    
    if is_dependency_related:
        if cvss_v3_score is not None and cvss_v3_score >= 7.0:
            return True
        
        if cvss_v2_score is not None and cvss_v2_score >= 7.0:
            return True
    
    return False

def extract_dependency_name(description):
    """
    Extract the name of the dependency from the CVE description.
    Looks for common patterns in dependency-related CVEs.
    """
    description_lower = description.lower()
    
    # Common patterns for dependency names in CVE descriptions
    patterns = [
        # "package-name versions X.Y.Z and earlier"
        r'([a-zA-Z0-9\-_\.]+)\s+versions?\s+',
        # "in package-name before version"
        r'in\s+([a-zA-Z0-9\-_\.]+)\s+before\s+',
        # "package-name before version"
        r'([a-zA-Z0-9\-_\.]+)\s+before\s+',
        # "package-name version X.Y.Z"
        r'([a-zA-Z0-9\-_\.]+)\s+version\s+',
        # "the package-name package"
        r'the\s+([a-zA-Z0-9\-_\.]+)\s+package',
        # "package-name is"
        r'([a-zA-Z0-9\-_\.]+)\s+is\s+',
        # "package-name contains"
        r'([a-zA-Z0-9\-_\.]+)\s+contains\s+',
        # "package-name allows"
        r'([a-zA-Z0-9\-_\.]+)\s+allows\s+',
        # "package-name may"
        r'([a-zA-Z0-9\-_\.]+)\s+may\s+',
        # "package-name could"
        r'([a-zA-Z0-9\-_\.]+)\s+could\s+',
    ]
    
    import re
    
    for pattern in patterns:
        match = re.search(pattern, description_lower)
        if match:
            dependency_name = match.group(1).strip()
            # Filter out common words that aren't dependency names
            if dependency_name and len(dependency_name) > 2 and dependency_name not in [
                'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'during', 'including', 'until', 'against', 'among', 'throughout', 'despite', 'towards', 'upon'
            ]:
                return dependency_name.title()
    
    # If no pattern matches, try to extract from common dependency keywords
    dependency_keywords = [
        "python", "nodejs", "node.js", "javascript", "typescript", "java", "ruby", "php", "go", "rust", "c#", ".net",
        "npm", "yarn", "pip", "composer", "maven", "gradle", "gem", "cargo", "nuget", "react", "angular", "vue", 
        "django", "flask", "spring", "laravel", "express", "fastapi"
    ]
    
    for keyword in dependency_keywords:
        if keyword in description_lower:
            return keyword.title()
    
    return "Unknown"

def extract_cve_details(cve_item):
    cve_id = cve_item["cve"]["CVE_data_meta"]["ID"]
    desc = cve_item["cve"]["description"]["description_data"][0]["value"]
    cvss_v3 = cve_item.get("impact", {}).get("baseMetricV3", {})
    cvss_v2 = cve_item.get("impact", {}).get("baseMetricV2", {})
    
    # Extract dependency name from description
    dependency_name = extract_dependency_name(desc)

    return {
        "id": cve_id,
        "description": desc,
        "dependency_name": dependency_name,
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
    important_cves = []
    total_cves_processed = 0
    target_count = 500
    
    print(f"Starting to fetch important dependency-related CVEs (target: {target_count})...")
    print("Filtering for CVEs related to: Python, Node.js, Java, PHP, Go, Rust, .NET, and other code dependencies")
    
    for feed_url in NVD_FEED_URLS:
        try:
            cves = fetch_and_parse(feed_url)
            print(f"Processing {len(cves)} CVEs from {feed_url}...")
            
            for cve in cves:
                total_cves_processed += 1
                
                # Only process important dependency-related CVEs
                if is_important_cve(cve):
                    important_cves.append(extract_cve_details(cve))
                    print(f"Found dependency CVE: {cve['cve']['CVE_data_meta']['ID']} (Total: {len(important_cves)}/{target_count})")
                    
                    # Check if we've reached our target
                    if len(important_cves) >= target_count:
                        print(f"Reached target of {target_count} important CVEs!")
                        break
            
            # Check if we've reached our target after processing this feed
            if len(important_cves) >= target_count:
                break
                
        except Exception as e:
            print(f"Error fetching {feed_url}: {e}")

    print(f"\n=== SUMMARY ===")
    print(f"Total CVEs processed: {total_cves_processed}")
    print(f"Dependency-related CVEs found: {len(important_cves)}")
    print(f"Target was: {target_count}")
    
    if len(important_cves) < target_count:
        print(f"⚠️  Warning: Only found {len(important_cves)} dependency-related CVEs out of {target_count} target")
        print("This could be due to:")
        print("- Limited dependency-related CVEs in the current feeds")
        print("- High filtering criteria (CVSS ≥ 7.0 + dependency keywords)")
        print("- Most CVEs being rejected/withdrawn or not dependency-related")
    else:
        print(f"✅ Successfully found {len(important_cves)} dependency-related CVEs")
    
    # Save dependency-related CVEs to JSON file
    with open("dependency_cves.json", "w", encoding="utf-8") as f:
        json.dump(important_cves, f, indent=2)
    
    print(f"Dependency-related CVEs saved to dependency_cves.json")
