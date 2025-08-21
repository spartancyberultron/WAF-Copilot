from re import A
import requests
import json
import zipfile
import io
from typing import List, Dict, Any

# Import the existing functions
from ai_CVEs import fetch_ai_cves
from other_CVEs import fetch_infra_cves
from language_CVEs import fetch_osv_bulk

def normalize_cve_structure(cve_data: Dict[str, Any], threat_feed: str) -> Dict[str, Any]:
    """
    Normalize CVE data to a uniform structure.
    
    :param cve_data: Raw CVE data from any source
    :param threat_feed: Category/threat feed name
    :return: Normalized CVE structure
    """
    # Handle OSV format (from language_CVEs.py)
    if "summary" in cve_data and "details" in cve_data:
        # OSV format
        return {
            "id": cve_data.get("id", ""),
            "description": cve_data.get("summary", ""),
            "dependency_name": extract_dependency_from_osv(cve_data),
            "cvss_v3_score": cve_data.get("cvss_score"),  # Use the extracted CVSS score
            "cvss_v3_vector": None,  # OSV doesn't provide vector strings
            "cvss_v2_score": None,
            "cvss_v2_vector": None,
            "published_date": cve_data.get("published", ""),
            "last_modified_date": cve_data.get("modified", ""),
            "references": extract_references_from_osv(cve_data),
            "threat_feed": threat_feed
        }
    
    # Handle NVD format (from ai_CVEs.py and other_CVEs.py)
    elif "cvss_score" in cve_data:
        # NVD format
        return {
            "id": cve_data.get("id", ""),
            "description": cve_data.get("description", ""),
            "dependency_name": extract_dependency_from_nvd(cve_data),
            "cvss_v3_score": cve_data.get("cvss_score"),
            "cvss_v3_vector": None,  # Not provided in current NVD format
            "cvss_v2_score": None,
            "cvss_v2_vector": None,
            "published_date": cve_data.get("published", ""),
            "last_modified_date": cve_data.get("lastModified", ""),
            "references": cve_data.get("references", []),
            "threat_feed": threat_feed
        }
    
    # Fallback for unknown format
    else:
        return {
            "id": cve_data.get("id", ""),
            "description": cve_data.get("description", cve_data.get("summary", "")),
            "dependency_name": "Unknown",
            "cvss_v3_score": None,
            "cvss_v3_vector": None,
            "cvss_v2_score": None,
            "cvss_v2_vector": None,
            "published_date": cve_data.get("published_date", cve_data.get("published", "")),
            "last_modified_date": cve_data.get("last_modified_date", cve_data.get("lastModified", "")),
            "references": cve_data.get("references", []),
            "threat_feed": threat_feed
        }

def extract_dependency_from_osv(cve_data: Dict[str, Any]) -> str:
    """Extract dependency name from OSV data."""
    affected = cve_data.get("affected", [])
    if affected and len(affected) > 0:
        package = affected[0].get("package", {})
        if package:
            return package.get("name", "Unknown")
    return "Unknown"

def extract_cvss_score_from_osv(cve_data: Dict[str, Any]) -> float:
    """Extract CVSS score from OSV data."""
    severity = cve_data.get("severity", [])
    if severity and len(severity) > 0:
        for sev in severity:
            if sev.get("type") == "CVSS_V3":
                score = sev.get("score")
                if score:
                    # Handle different score formats
                    if isinstance(score, (int, float)):
                        return float(score)
                    elif isinstance(score, str):
                        # If it's a CVSS vector string, we can't extract score directly
                        # OSV often provides vector strings instead of numeric scores
                        if score.startswith("CVSS:"):
                            # For now, return None since we can't calculate CVSS score from vector
                            # In a production system, you'd want to use a CVSS calculator library
                            return None
                        else:
                            # Try to convert string to float
                            try:
                                return float(score)
                            except ValueError:
                                return None
            # Also check for CVSS_V2
            elif sev.get("type") == "CVSS_V2":
                score = sev.get("score")
                if score and isinstance(score, (int, float)):
                    return float(score)
    return None

def extract_references_from_osv(cve_data: Dict[str, Any]) -> List[str]:
    """Extract references from OSV data."""
    references = cve_data.get("references", [])
    return [ref.get("url", "") for ref in references if ref.get("url")]

def extract_dependency_from_nvd(cve_data: Dict[str, Any]) -> str:
    """Extract dependency name from NVD data."""
    # Try to extract from description or keyword
    keyword = cve_data.get("keyword", "")
    if keyword:
        return keyword.title()
    
    # Try to extract from description
    description = cve_data.get("description", "").lower()
    common_deps = ["kubernetes", "docker", "aws", "azure", "gcp", "tensorflow", "pytorch"]
    for dep in common_deps:
        if dep in description:
            return dep.title()
    
    return "Unknown"

def fetch_all_cves(limit_per_category: int = 100, api_key: str = None) -> List[Dict[str, Any]]:
    """
    Fetch CVEs from all sources and return a unified list with language CVEs first.
    
    :param limit_per_category: Number of CVEs to fetch per category
    :param api_key: Optional NVD API key for higher rate limits
    :return: List of normalized CVE objects with language CVEs prioritized
    """
    language_cves = []
    other_cves = []
    
    print("🔄 Fetching CVEs from all sources...")
    
    # 1. Fetch Language/Framework CVEs FIRST (prioritized)
    print("💻 Fetching Language/Framework CVEs (prioritized)...")
    ecosystems = {
        "PyPI": "Python",
        "Maven": "Java",
        "npm": "Node.js",
        "RubyGems": "Ruby",
        "crates.io": "Rust",
        "Go": "Go",
        "Packagist": "PHP"
    }
    
    for ecosystem, language in ecosystems.items():
        try:
            print(f"  📦 Fetching {language} ({ecosystem}) CVEs...")
            lang_cves = fetch_osv_bulk(ecosystem, limit=limit_per_category // len(ecosystems))
            for cve in lang_cves:
                try:
                    normalized_cve = normalize_cve_structure(cve, language)
                    language_cves.append(normalized_cve)
                except Exception as normalize_error:
                    print(f"    ⚠️ Error normalizing CVE {cve.get('id', 'unknown')}: {normalize_error}")
                    continue
            print(f"  ✅ Fetched {len(lang_cves)} {language} CVEs")
        except Exception as e:
            print(f"  ❌ Error fetching {language} CVEs: {e}")
            continue
    
    # 2. Fetch AI/ML CVEs
    print("📊 Fetching AI/ML CVEs...")
    try:
        ai_cves = fetch_ai_cves(limit=limit_per_category, api_key=api_key, save_file=None)
        for cve in ai_cves:
            try:
                normalized_cve = normalize_cve_structure(cve, "AI/ML")
                other_cves.append(normalized_cve)
            except Exception as normalize_error:
                print(f"  ⚠️ Error normalizing AI CVE {cve.get('id', 'unknown')}: {normalize_error}")
                continue
        print(f"✅ Fetched {len(ai_cves)} AI/ML CVEs")
    except Exception as e:
        print(f"❌ Error fetching AI CVEs: {e}")
    
    # 3. Fetch Infrastructure CVEs
    print("🏗️ Fetching Infrastructure CVEs...")
    try:
        infra_cves = fetch_infra_cves(limit=limit_per_category, api_key=api_key, save_file=None)
        for cve in infra_cves:
            try:
                # Determine specific threat feed based on keyword
                keyword = cve.get("keyword", "").lower()
                if "kubernetes" in keyword:
                    threat_feed = "Kubernetes"
                elif "docker" in keyword:
                    threat_feed = "Docker"
                elif "aws" in keyword:
                    threat_feed = "AWS"
                elif "azure" in keyword:
                    threat_feed = "Azure"
                elif "gcp" in keyword:
                    threat_feed = "GCP"
                else:
                    threat_feed = "Infrastructure"
                
                normalized_cve = normalize_cve_structure(cve, threat_feed)
                other_cves.append(normalized_cve)
            except Exception as normalize_error:
                print(f"  ⚠️ Error normalizing Infra CVE {cve.get('id', 'unknown')}: {normalize_error}")
                continue
        print(f"✅ Fetched {len(infra_cves)} Infrastructure CVEs")
    except Exception as e:
        print(f"❌ Error fetching Infrastructure CVEs: {e}")
    
    # Sort each category by CVSS score (highest first)
    language_cves.sort(key=lambda x: (x.get('cvss_v3_score') or 0))
    other_cves.sort(key=lambda x: (x.get('cvss_v3_score') or 0), reverse=True)
    
    # Combine with language CVEs first
    all_cves = other_cves + language_cves
    
    print(f"\n🎉 Total CVEs fetched: {len(all_cves)}")
    print(f"📊 Language CVEs: {len(language_cves)} (prioritized, sorted by CVSS)")
    print(f"📊 Other CVEs: {len(other_cves)} (sorted by CVSS)")
    
    return all_cves

def save_aggregated_cves(cves: List[Dict[str, Any]], filename: str = "aggregated_cves.json"):
    """
    Save aggregated CVEs to a JSON file.
    
    :param cves: List of CVE objects
    :param filename: Output filename
    """
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(cves, f, indent=2, ensure_ascii=False)
    print(f"💾 Saved {len(cves)} CVEs to {filename}")

def get_cve_statistics(cves: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Get statistics about the aggregated CVEs.
    
    :param cves: List of CVE objects
    :return: Statistics dictionary
    """
    stats = {
        "total_cves": len(cves),
        "by_threat_feed": {},
        "by_severity": {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
            "unknown": 0
        }
    }
    
    for cve in cves:
        # Count by threat feed
        threat_feed = cve.get("threat_feed", "Unknown")
        stats["by_threat_feed"][threat_feed] = stats["by_threat_feed"].get(threat_feed, 0) + 1
        
        # Count by severity
        score = cve.get("cvss_v3_score")
        if score is None:
            stats["by_severity"]["unknown"] += 1
        elif score >= 9.0:
            stats["by_severity"]["critical"] += 1
        elif score >= 7.0:
            stats["by_severity"]["high"] += 1
        elif score >= 4.0:
            stats["by_severity"]["medium"] += 1
        else:
            stats["by_severity"]["low"] += 1
    
    return stats

if __name__ == "__main__":
    # Fetch all CVEs
    all_cves = fetch_all_cves(limit_per_category=50)
    
    # Save to file
    save_aggregated_cves(all_cves, "aggregated_cves.json")
    
    # Print statistics
    stats = get_cve_statistics(all_cves)
    print("\n📊 CVE Statistics:")
    print(f"Total CVEs: {stats['total_cves']}")
    print("\nBy Threat Feed:")
    for feed, count in stats["by_threat_feed"].items():
        print(f"  {feed}: {count}")
    print("\nBy Severity:")
    for severity, count in stats["by_severity"].items():
        print(f"  {severity.title()}: {count}")
    
    # Show sample CVEs
    print(f"\n📋 Sample CVEs (first 3):")
    for i, cve in enumerate(all_cves[:3]):
        print(f"{i+1}. {cve['id']} ({cve['threat_feed']}) - {cve['description'][:80]}...")
    print(all_cves[0])