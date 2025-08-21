import requests, zipfile, io, json

OSV_BULK_BASE = "https://osv-vulnerabilities.storage.googleapis.com"

def fetch_osv_bulk(ecosystem, limit=200):
    """
    Fetch vulnerabilities for a given ecosystem using OSV bulk API.
    """
    url = f"{OSV_BULK_BASE}/{ecosystem}/all.zip"
    print(f"Downloading {ecosystem} vulnerabilities...")
    resp = requests.get(url)
    resp.raise_for_status()
    
    # Unzip in memory
    with zipfile.ZipFile(io.BytesIO(resp.content)) as z:
        vulns = []
        for name in z.namelist()[:limit]:
            with z.open(name) as f:
                data = json.load(f)
                
                # Extract CVSS score from severity data
                cvss_score = None
                severity_data = data.get("severity", [])
                if severity_data:
                    for sev in severity_data:
                        if sev.get("type") == "CVSS_V3":
                            score = sev.get("score")
                            if score:
                                if isinstance(score, (int, float)):
                                    cvss_score = float(score)
                                elif isinstance(score, str):
                                    if not score.startswith("CVSS:"):  # Skip vector strings
                                        try:
                                            cvss_score = float(score)
                                        except ValueError:
                                            pass
                        elif sev.get("type") == "CVSS_V2":
                            score = sev.get("score")
                            if score and isinstance(score, (int, float)):
                                cvss_score = float(score)
                
                vulns.append({
                    "id": data.get("id"),
                    "summary": data.get("summary"),
                    "details": data.get("details"),
                    "aliases": data.get("aliases", []),
                    "severity": data.get("severity", []),
                    "affected": data.get("affected", []),
                    "published": data.get("published"),
                    "modified": data.get("modified"),
                    "references": data.get("references", []),
                    "cvss_score": cvss_score  # Add extracted CVSS score
                })
        
        
        return vulns

if __name__ == "__main__":
    ecosystems = {
        "Python": "PyPI",
        "Java": "Maven",
        "Node.js": "npm",
        "Ruby": "RubyGems",
        "Rust": "crates.io",
        "Go": "Go",
        "PHP": "Packagist"
    }
    
    all = []
    for lang, eco in ecosystems.items():
        try:
            vulns = fetch_osv_bulk(eco, limit=200)
            all.extend(vulns)
            print(f"{lang}: Fetched {len(vulns)} vulns")
            print(f"Example: {vulns[0]['id']} - {vulns[0]['summary']}")
        except Exception as e:
            print(f"Error fetching {lang}: {e}")
    
    with open("language_cves.json", "w", encoding="utf-8") as f:
        print(f"Saved {len(all)} CVEs to language_cves.json")
        json.dump(all, f, indent=2)
