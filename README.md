# ZAPISEC WAF CoPilot

<div align="center">
  <img src="logo.jpg" alt="ZAPISEC Logo" width="200" height="auto" />
  
  <br />
  
  <div align="center">
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
    </a>
    <a href="https://www.python.org/downloads/">
      <img src="https://img.shields.io/badge/python-3.8+-blue.svg" alt="Python" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/node.js-18+-green.svg" alt="Node.js" />
    </a>
    <a href="https://www.djangoproject.com/">
      <img src="https://img.shields.io/badge/Django-4.x-green.svg" alt="Django" />
    </a>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-14-black.svg" alt="Next.js" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript" />
    </a>
    <a href="https://openai.com/">
      <img src="https://img.shields.io/badge/OpenAI-GPT--4-purple.svg" alt="OpenAI" />
    </a>
  </div>
</div>

## Table of Contents

- [About](#about)
- [Core Mission](#core-mission)
- [Key Capabilities](#key-capabilities)
- [Target Users](#target-users)
- [Demo Video](#-walkthrough-of-the-waf-copilot-in-action)
- [Features](#features)
- [WAF Compatibility](#waf-compatibility)
- [Example Workflows](#example-workflows)
- [Use Cases](#use-cases)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Docker Deployment](#docker-deployment-recommended)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [Support](#support)
- [Get Involved](#get-involved)

## About

[ZAPISEC](https://zapisec.ai) WAF CoPilot is an automated AI-powered security framework for web applications with a focus on highly configurable streamlined vulnerability assessment process via AI engines, CVE data correlation and organization, continuous monitoring, backed by a database, and simple yet intuitive User Interface. [ZAPISEC](https://zapisec.ai) WAF CoPilot makes it easy for security professionals to generate WAF rules and testing code with intelligent automation.

### Core Mission
Our mission is to bridge the gap between vulnerability discovery and actionable security implementation. [ZAPISEC](https://zapisec.ai) WAF CoPilot leverages cutting-edge AI technology to analyze Common Vulnerabilities and Exposures (CVEs), generate platform-specific WAF rules, and provide educational testing code for comprehensive security understanding.

### Key Capabilities
- **Intelligent CVE Analysis**: AI-powered vulnerability assessment with detailed explanations and severity analysis
- **Multi-Platform WAF Integration**: Generate deployable rules for major cloud providers and WAF solutions ([AWS WAF](https://aws.amazon.com/waf/), [Azure Front Door](https://azure.microsoft.com/en-us/services/frontdoor/), [Google Cloud Armor](https://cloud.google.com/armor), [Cloudflare](https://www.cloudflare.com/waf/))
- **Educational Testing Framework**: Create safe, educational testing environments for vulnerability simulation
- **Real-time Security Workflow**: Streamline security operations from detection to deployment
- **Compliance-Ready Documentation**: Generate comprehensive security reports and audit trails

### Target Users
- **Security Engineers**: Rapid vulnerability assessment and rule deployment
- **DevOps Teams**: Integration of security into CI/CD pipelines
- **Security Researchers**: Educational testing and vulnerability analysis
- **Compliance Officers**: Automated reporting and audit documentation



**Services offered**: [zapisec.ai](https://zapisec.ai)


## 🎥 Walkthrough of the WAF Copilot in action.

https://github.com/user-attachments/assets/36b681ba-f5aa-47af-af4f-c3ac08e4eba7

*Watch the demo video above to see [ZAPISEC](https://zapisec.ai) WAF CoPilot in action!*

## Features

| Feature | Description | Benefits |
|---------|-------------|----------|
| **🔒 CVE Management** | Automated CVE detection, status tracking, and AI-powered explanations | Reduce analysis time from hours to minutes |
| **🛡️ WAF Rule Generation** | Multi-platform support with JSON/cURL formats | Deploy rules across any cloud provider |
| **🧪 Testing Code** | Generate educational Python testing code for vulnerability simulation | Safe environment for security training |
| **📊 Dashboard** | Real-time statistics, interactive tables, and bulk operations | Comprehensive security overview |
| **🤖 AI Analysis** | GPT-4 powered vulnerability analysis and rule generation | Expert-level security insights |
| **📈 Visual Flowcharts** | Mermaid.js diagrams showing vulnerability lifecycle | Clear understanding of security workflows |
| **🔄 Status Tracking** | Track progress from Not Started → Started → In Progress → Closed | Organized vulnerability management |
| **📋 Bulk Operations** | Mass status updates and rule generation | Efficient handling of multiple CVEs |

## WAF Compatibility

| WAF Platform | Provider | Rule Format | Status | Features |
|--------------|----------|-------------|--------|----------|
| **AWS WAF** | Amazon Web Services | JSON/cURL | ✅ Supported | Rate limiting, IP blocking, SQL injection protection |
| **Azure Front Door** | Microsoft Azure | JSON/cURL | ✅ Supported | DDoS protection, geo-filtering, custom rules |
| **Google Cloud Armor** | Google Cloud Platform | JSON/cURL | ✅ Supported | Adaptive protection, preconfigured rules |
| **Cloudflare** | Cloudflare | JSON/cURL | ✅ Supported | Web Application Firewall, DDoS mitigation |

## Example Workflows

### Workflow 1: WAF Rule Generation for CVE-2021-44228 (Log4Shell)

**Scenario**: Generate AWS WAF rules to protect against Log4Shell vulnerability

#### Step 1: CVE Analysis
```
CVE ID: CVE-2021-44228
Severity: Critical (9.8/10)
Description: Apache Log4j2 JNDI features do not protect against attacker controlled LDAP and other JNDI related endpoints
```

#### Step 2: AI-Powered Rule Generation
```json
{
  "Name": "Log4Shell-Protection",
  "Description": "Protection against CVE-2021-44228 (Log4Shell)",
  "Rules": [
    {
      "Name": "BlockLog4ShellPayloads",
      "Priority": 1,
      "Action": {
        "Block": {}
      },
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "Log4ShellBlockedRequests"
      },
      "Statement": {
        "ByteMatchStatement": {
          "SearchString": "${jndi:",
          "FieldToMatch": {
            "UriPath": {}
          },
          "TextTransformations": [
            {
              "Priority": 1,
              "Type": "LOWERCASE"
            }
          ],
          "PositionalConstraint": "CONTAINS"
        }
      }
    }
  ]
}
```

#### Step 3: Deployment
```bash
# AWS CLI deployment
aws wafv2 create-web-acl \
  --name Log4Shell-Protection \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://log4shell-rules.json
```

### Workflow 2: Testing Code Generation for CVE-2021-34527 (PrintNightmare)

**Scenario**: Generate educational Python testing code for PrintNightmare vulnerability

#### Step 1: CVE Details Input
```
CVE ID: CVE-2021-34527
Description: Windows Print Spooler Remote Code Execution Vulnerability
Severity: Critical (9.8/10)
```

#### Step 2: Generated Testing Code
```python
#!/usr/bin/env python3
"""
Educational Testing Code for CVE-2021-34527 (PrintNightmare)
WARNING: This code is for educational purposes only.
Do not use against systems you don't own or have permission to test.
"""

import socket
import struct
import sys
from typing import Optional

class PrintNightmareTest:
    def __init__(self, target_host: str, target_port: int = 445):
        self.target_host = target_host
        self.target_port = target_port
        self.socket = None
    
    def connect_to_target(self) -> bool:
        """Establish connection to target SMB service"""
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.settimeout(10)
            self.socket.connect((self.target_host, self.target_port))
            print(f"[+] Successfully connected to {self.target_host}:{self.target_port}")
            return True
        except Exception as e:
            print(f"[-] Failed to connect: {e}")
            return False
    
    def test_spooler_service(self) -> bool:
        """Test if Print Spooler service is running"""
        try:
            # SMB Negotiate Protocol Request
            negotiate_request = (
                b"\xff\x53\x4d\x42"  # SMB Header
                b"\x72"              # Negotiate Protocol
                b"\x00\x00\x00\x00"  # Reserved
                b"\x18\x53\xc8"      # Dialects
            )
            
            self.socket.send(negotiate_request)
            response = self.socket.recv(1024)
            
            if response.startswith(b"\xff\x53\x4d\x42"):
                print("[+] SMB service is accessible")
                return True
            else:
                print("[-] SMB service not accessible")
                return False
                
        except Exception as e:
            print(f"[-] Error testing spooler service: {e}")
            return False
    
    def check_vulnerability_indicators(self) -> dict:
        """Check for indicators of PrintNightmare vulnerability"""
        indicators = {
            "spooler_running": False,
            "anonymous_access": False,
            "guest_access": False,
            "risk_level": "UNKNOWN"
        }
        
        try:
            # Test for anonymous access to spooler
            # This is a simplified test - real exploitation is more complex
            indicators["spooler_running"] = self.test_spooler_service()
            
            if indicators["spooler_running"]:
                indicators["risk_level"] = "HIGH"
                print("[!] Print Spooler service is running - potential vulnerability")
            else:
                indicators["risk_level"] = "LOW"
                print("[+] Print Spooler service appears to be disabled")
                
        except Exception as e:
            print(f"[-] Error checking vulnerability indicators: {e}")
        
        return indicators
    
    def generate_remediation_advice(self, indicators: dict) -> str:
        """Generate remediation advice based on findings"""
        advice = []
        
        if indicators["spooler_running"]:
            advice.append("1. Disable Print Spooler service if not required")
            advice.append("2. Apply Microsoft security patches (KB5004945)")
            advice.append("3. Restrict network access to Print Spooler")
            advice.append("4. Enable Windows Defender Exploit Protection")
        
        if not advice:
            advice.append("System appears to be properly configured")
        
        return "\n".join(advice)
    
    def run_test(self) -> dict:
        """Run complete vulnerability test"""
        print(f"[*] Starting PrintNightmare vulnerability test against {self.target_host}")
        print("[*] This is an educational test - do not use maliciously\n")
        
        if not self.connect_to_target():
            return {"error": "Failed to connect to target"}
        
        indicators = self.check_vulnerability_indicators()
        remediation = self.generate_remediation_advice(indicators)
        
        print(f"\n[+] Test Results:")
        print(f"   Risk Level: {indicators['risk_level']}")
        print(f"   Spooler Running: {indicators['spooler_running']}")
        
        print(f"\n[+] Remediation Advice:")
        print(remediation)
        
        return {
            "target": self.target_host,
            "indicators": indicators,
            "remediation": remediation
        }
    
    def cleanup(self):
        """Clean up resources"""
        if self.socket:
            self.socket.close()

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 printnightmare_test.py <target_host>")
        print("Example: python3 printnightmare_test.py 192.168.1.100")
        sys.exit(1)
    
    target = sys.argv[1]
    tester = PrintNightmareTest(target)
    
    try:
        results = tester.run_test()
        print(f"\n[+] Test completed successfully")
    except KeyboardInterrupt:
        print("\n[!] Test interrupted by user")
    except Exception as e:
        print(f"\n[-] Test failed: {e}")
    finally:
        tester.cleanup()

if __name__ == "__main__":
    main()
```

#### Step 3: Usage Instructions
```bash
# Educational testing (replace with your test target)
python3 printnightmare_test.py 192.168.1.100

# Expected output:
# [*] Starting PrintNightmare vulnerability test against 192.168.1.100
# [+] Successfully connected to 192.168.1.100:445
# [+] SMB service is accessible
# [!] Print Spooler service is running - potential vulnerability
# [+] Test Results:
#    Risk Level: HIGH
#    Spooler Running: True
```

## Use Cases

- **🔍 Security Audits**: Quickly identify and assess vulnerabilities in your applications
- **🛡️ WAF Implementation**: Generate platform-specific rules for immediate deployment
- **📚 Security Training**: Use generated testing code to educate teams about vulnerabilities
- **🚀 DevOps Integration**: Streamline security workflows in CI/CD pipelines
- **📊 Compliance Reporting**: Track vulnerability status and generate compliance reports
- **🔧 Incident Response**: Rapidly analyze and remediate security incidents

## Tech Stack

- **Backend**: Django 4.x with Django REST Framework, JWT authentication
- **Frontend**: Next.js 14 with TypeScript, Shadcn UI, Tailwind CSS
- **AI**: OpenAI API integration for intelligent analysis
- **Database**: SQLite (configurable for production)

## Quick Start

### Docker Deployment (Recommended)

For quick deployment and consistent environments, you can use Docker to run the ZAPISEC WAF CoPilot backend.

#### Prerequisites for Docker
- **Docker**: Install Docker Desktop or Docker Engine
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Verify installation: `docker --version`
- **System Requirements**:
  - **Windows**: Docker Desktop installed, Windows virtualization enabled, WSL updated
  - **macOS**: Docker Desktop installed
  - **Linux**: Docker Engine installed
- **OpenAI API Key**: Required for AI-powered analysis
  - Sign up at [OpenAI Platform](https://platform.openai.com/)
  - Generate API key in your account settings

#### Docker Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Build the Docker image**:
   ```bash
   docker build --tag waf-copilot-image .
   ```

3. **Run the container**:
   ```bash
   docker run --publish 8000:8000 waf-copilot-image
   ```

#### Container Management

**Stop the container**:
```bash
docker container stop <CONTAINER_ID>
```

**Find container ID**:
```bash
docker ps
```

**Remove stopped containers**:
```bash
docker container prune
```

#### Docker Configuration

The Dockerfile uses:
- **Base Image**: Python 3.10-slim (lightweight)
- **Port**: 8000 (Django development server)
- **Working Directory**: `/app`
- **Dependencies**: Installed from `requirements.txt`

#### Environment Variables

To configure the application, you can pass environment variables when running the container:

```bash
docker run --publish 8000:8000 \
  -e OPENAI_API_KEY=your_api_key_here \
  -e DEBUG=True \
  waf-copilot-image
```

#### Docker Compose (Optional)

For more complex deployments, you can create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  waf-copilot-backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DEBUG=True
    volumes:
      - ./backend:/app
    restart: unless-stopped
```

Then run with:
```bash
docker-compose up --build
```

### Prerequisites

#### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+, CentOS 7+)
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 2GB free disk space
- **Network**: Internet connection for API calls and package downloads

#### Software Dependencies
- **Python**: Version 3.8 or higher
  - [Download Python](https://www.python.org/downloads/)
  - Verify installation: `python --version` or `python3 --version`
- **Node.js**: Version 18.0 or higher
  - [Download Node.js](https://nodejs.org/)
  - Verify installation: `node --version` and `npm --version`
- **Git**: Latest version for cloning the repository
  - [Download Git](https://git-scm.com/)
  - Verify installation: `git --version`

#### API Keys & Services
- **OpenAI API Key**: Required for AI-powered analysis
  - Sign up at [OpenAI Platform](https://platform.openai.com/)
  - Generate API key in your account settings
  - Ensure sufficient credits for API usage
- **GitHub Account**: For cloning and contributing (optional)

#### Development Tools (Optional but Recommended)
- **Code Editor**: VS Code, PyCharm, or any modern code editor
- **Terminal**: PowerShell (Windows), Terminal (macOS), or Bash (Linux)
- **Virtual Environment Manager**: `virtualenv` or `conda` for Python
- **Package Managers**: `pip` (Python) and `npm` (Node.js)

#### Browser Requirements
- **Modern Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
- **JavaScript Enabled**: Required for the frontend application
- **Local Storage**: For session management and user preferences

### Installation

#### 📹 Installation Guide Video

<div align="center">
  <video width="100%" controls>
    <source src="https://cyberultron-nikhil.github.io/Assets/Installation%20Guide%20Video.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>

*Watch the installation guide video above for step-by-step instructions!*


```bash
# Clone and setup backend
git clone https://github.com/CyberUltron-Nikhil/WAF-Copilot.git
cd WAF-Copilot/backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
echo "OPENAI_API_KEY=your_api_key_here" > .env
python manage.py migrate
python manage.py runserver

# Setup frontend (in new terminal)
cd ../frontend
npm install
npm run dev
```


### Access
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Admin: `http://localhost:8000/admin`

## Usage

1. **Register/Login**: Create account and authenticate
2. **View CVEs**: Dashboard shows all vulnerabilities with status tracking
3. **Generate Rules**: Select WAF type and format, generate AI-powered rules
4. **Testing**: Generate educational Python code for vulnerability simulation
5. **Manage Status**: Track progress with Not Started → Started → In Progress → Closed

## API Endpoints

Below are the primary routes used by the app, with descriptions and basic usage. All endpoints return JSON.

- **POST `/api/auth/register/`**: Create a new user and initialize CVE data for that user
  - Auth: Not required
  - Request body: `{ "username": string, "password": string, "email"?: string }`
  - Success response: 201 with `{ message, user_id, access_token, refresh_token, user }`
  - Notes: Seeds the user's CVEs and returns JWT tokens

- **POST `/api/auth/login/`**: Authenticate a user and issue JWT tokens
  - Auth: Not required
  - Request body: `{ "username": string, "password": string }`
  - Success response: 200 with `{ access_token, refresh_token, user }`

- **GET `/api/user/cves/`**: List CVEs associated with the authenticated user
  - Auth: Bearer token required (JWT)
  - Request: No body
  - Success response: 200 with `{ success: true, cves: CVE[], total }`

- **POST `/api/user/cves/update-status/`**: Update workflow status for a specific CVE
  - Auth: Bearer token required (JWT)
  - Request body: `{ "cve_id": string, "status": "not_started" | "started" | "in_progress" | "closed" }`
  - Success response: 200 with `{ success: true, cve_id, status, message }`
  - Errors: 400 for missing/invalid fields or CVE not found for user

- **POST `/api/waf-rule/`**: Generate a WAF rule for a CVE via AI
  - Auth: Bearer token required (JWT)
  - Request body: `{ "cve_id": string, "description": string, "severity": string, "mode": string, "waf": "aws" | "azure" | "gcp" | "cloudflare" }`
  - Success response: 200 with `{ success: true, waf_rule }`

- **POST `/api/generate-testing-code/`**: Generate educational Python testing code for a CVE
  - Auth: Bearer token required (JWT)
  - Request body: `{ "cve_id": string, "description": string, "severity": string }`
  - Success response: 200 with `{ success: true, python_code }`

- **GET `/api/cves/aggregated/`**: Fetch aggregated CVEs from all sources with optional save
  - Auth: Not required
  - Query params: `limit?=number` (default 500), `api_key?=string`, `save?=true|false`
  - Success response: 200 with `{ success: true, total_cves, statistics, cves }`

- **GET `/api/cves/statistics/`**: Fetch only statistics for aggregated CVEs
  - Auth: Not required
  - Query params: `limit?=number` (default 500), `api_key?=string`
  - Success response: 200 with `{ success: true, total_cves, statistics }`

- **GET `/api/cves/threat-feed/`**: Fetch CVEs filtered by a specific threat feed
  - Auth: Not required
  - Query params: `threat_feed=string` (required), `limit?=number` (default 500), `api_key?=string`
  - Success response: 200 with `{ success: true, threat_feed, total_cves, statistics, cves }`
  - Errors: 400 if `threat_feed` is missing

- **POST `/api/cve-explanation/`**: Generate a CVE explanation and Mermaid diagram via AI
  - Auth: Bearer token required (JWT)
  - Request body: `{ "cve_id": string, "description": string, "severity": string }`
  - Success response: 200 with `{ success: true, explanation, mermaid }`

- **GET `/api/user/profile/`**: Get authenticated user profile and CVE statistics
  - Auth: Bearer token required (JWT)
  - Success response: 200 with `{ success: true, user, statistics }`

- **POST `/api/user/cves/refresh/`**: Refresh and reseed the user's CVE dataset
  - Auth: Bearer token required (JWT)
  - Success response: 200 with `{ success: true, message }`

- **POST `/api/token/`**: Obtain JWT access and refresh tokens (SimpleJWT)
  - Auth: Not required
  - Request body: `{ "username": string, "password": string }`
  - Success response: 200 with `{ access, refresh }`

- **POST `/api/token/refresh/`**: Refresh the JWT access token
  - Auth: Not required
  - Request body: `{ "refresh": string }`
  - Success response: 200 with `{ access }`

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Support

- 📧 Email: [nikhil@cyberultron.com]
- 🐛 Issues: [GitHub Issues](https://github.com/CyberUltron-Nikhil/WAF-Copilot/issues)



*[ZAPISEC](https://zapisec.ai) - Application Security Platform*

## Get Involved

We welcome contributions from developers, researchers, and security professionals alike. Here's how to participate:

- 💬 **[Start or Join a Discussion](https://github.com/CyberUltron-Nikhil/WAF-Copilot/discussions)**: Share ideas and get help from the community
- 🐛 **[Report Bugs](https://github.com/CyberUltron-Nikhil/WAF-Copilot/issues/new?template=bug_report.md)**: Help us improve by reporting issues you encounter
- ⭐ **[Request Features](https://github.com/CyberUltron-Nikhil/WAF-Copilot/issues/new?template=feature_request.md)**: Suggest new capabilities and improvements
- 💻 **[Contribute Code or Docs](https://github.com/CyberUltron-Nikhil/WAF-Copilot/blob/main/CONTRIBUTING.md)**: Help build and document WAF-Copilot
- 📧 **[Stay Updated](https://github.com/CyberUltron-Nikhil/WAF-Copilot/releases)**: Follow our releases for latest updates

---

**[ZAPISEC](https://zapisec.ai) WAF CoPilot** - Making web application security management simple and intelligent.

---

**License and Intellectual Property Rights**: All rights reserved. This software and its documentation are the intellectual property of CyberUltron Consulting Private Limited.
