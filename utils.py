Hi Nikhil,  

Here’s the code for the two functions you requested (`generate_cve_description_and_mermaid` and `generate_waf_rule`).  


```python
# utils.py
import json
import os

def generate_cve_description_and_mermaid(cve_id):
    """Generate CVE description & Mermaid.js flowchart."""
    file_path = os.path.join(os.path.dirname(__file__), "all_cves.json")
    with open(file_path, "r", encoding="utf-8") as f:
        cve_data = json.load(f)

    cve_info = next((c for c in cve_data if c.get("cve_id") == cve_id), None)
    if not cve_info:
        return {"error": f"CVE {cve_id} not found"}

    description = f"CVE ID: {cve_info.get('cve_id')}\nDescription: {cve_info.get('description', 'No description available')}\nSeverity: {cve_info.get('severity', 'Unknown')}"

    mermaid_code = f"""
    graph TD
        A[CVE Discovered] --> B[Severity: {cve_info.get('severity', 'Unknown')}]
        B --> C[Description: {cve_info.get('description', 'No description available')}]
        C --> D[Mitigation Steps]
    """

    return {
        "description": description,
        "mermaid": mermaid_code
    }

def generate_waf_rule(cve_id):
    """Generate generic WAF rule for CVE."""
    file_path = os.path.join(os.path.dirname(__file__), "all_cves.json")
    with open(file_path, "r", encoding="utf-8") as f:
        cve_data = json.load(f)

    cve_info = next((c for c in cve_data if c.get("cve_id") == cve_id), None)
    if not cve_info:
        return {"error": f"CVE {cve_id} not found"}

    waf_rule = f"""
    # Generic WAF rule for {cve_id}
    SecRule REQUEST_URI "@contains {cve_info.get('exploit_keyword', 'vulnerable_path')}" \
        "id:1001,phase:2,deny,status:403,msg:'Blocked {cve_id} exploit attempt'"
    """

    return {"waf_rule": waf_rule}
