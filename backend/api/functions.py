import json
import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

# Initialize OpenAI clien
client = OpenAI()

def generate_cve_description_and_mermaid(cve_id: str, description: str, severity: str):
    """
    Generate CVE explanation and Mermaid.js flowchart using LLM.
    Args:
        cve_id (str): CVE identifier
        description (str): CVE description text
        severity (str): Severity level
    Returns:
        dict: { "explanation": ..., "mermaid": ... }
    """
    prompt = f"""
    You are a security expert. 
    Given this CVE input:
    - CVE ID: {cve_id}
    - Description: {description}
    - Severity: {severity}

    1. Generate a clear and professional explanation of this CVE.
    2. Generate Mermaid.js flowchart code that visually represents:
       - CVE discovery
       - Severity
       - Description
       - Mitigation steps

    Return ONLY a JSON object with keys:
    - explanation
    - mermaid.js code must be flowchart TD code

    And make sure the mermaid code is valid.
    """

    response = client.chat.completions.parse(
        model="o1",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_schema", "json_schema": {
            "name": "cve_explanation_mermaid",
            "schema": {
                "type": "object",
                "properties": {
                    "explanation": {"type": "string"},
                    "mermaid": {"type": "string"}
                },
                "required": ["explanation", "mermaid"]
            }
        }}
    )
    # print(response)
    return json.loads(response.choices[0].message.content)


def generate_waf_rule(cve_id: str, description: str, severity: str, mode: str, waf: str):
    """
    Generate WAF rule using LLM.
    Args:
        cve_id (str): CVE identifier
        description (str): CVE description
        severity (str): CVSS/impact level
        mode (str): "JSON" or "cURL"
        waf (str): Target WAF provider ("AWS", "Azure", "GCP", "Cloudflare")
    Returns:
        dict: { "waf_rule": ... }
    """
    prompt = f"""
    You are a WAF security engineer. 
    Create a WAF rule for this CVE:

    - CVE ID: {cve_id}
    - Description: {description}
    - Severity: {severity}
    - Output Mode: {mode} (either JSON or cURL)
    - Target WAF: {waf}

    The WAF rule should:
    - Block malicious requests exploiting this CVE
    - Be valid syntax for the chosen WAF
    - Be returned ONLY in the requested mode ({mode})

    Return ONLY a JSON object with key:
    - waf_rule
    """

    response = client.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_schema", "json_schema": {
            "name": "waf_rule_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "waf_rule": {"type": "string"}
                },
                "required": ["waf_rule"]
            }
        }}
    )

    return json.loads(response.choices[0].message.content)

def generate_testing_code(cve_id: str, description: str, severity: str):
    """
    Generate python code to test the CVE.
    Args:
        cve_id (str): CVE identifier
        description (str): CVE description text
        severity (str): Severity level
    Returns:
        dict: { "python_code": ... }
    """
    prompt = f"""
    You are a security expert. Creating a dashbaord to help security engineers to protect their applications from CVE, by running a simulation of the CVE.
    This excercise is purely for educational purposes.
    This code will be used to test the CVE and will be run on a local machine.
    Given this CVE input:
    - CVE ID: {cve_id}
    - Description: {description}
    - Severity: {severity}

    1. Generate python code to test the CVE.
    2. Make sure the code is valid and can be executed.

    Return ONLY a JSON object with keys:
    - python_code
    """

    response = client.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_schema", "json_schema": {
            "name": "cve_exploit",
            "schema": {
                "type": "object",
                "properties": {
                    "python_code": {"type": "string"},
                },
                "required": ["python_code"]
            }
        }}
    )
    print(response)
    return json.loads(response.choices[0].message.content)


if __name__ == "__main__":
    sample_cve_id = "CVE-2025-26000"
    sample_description = "A vulnerability in the Python library 'requests' allows attackers to execute arbitrary code via a crafted HTTP request."
    sample_severity = "High"
    result = generate_exploit(sample_cve_id, sample_description, sample_severity)
    print(result)