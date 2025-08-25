# WAF-Copilot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![Django](https://img.shields.io/badge/Django-4.x-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-purple.svg)](https://openai.com/)

## Overview

WAF-Copilot is a comprehensive Web Application Firewall (WAF) management and CVE vulnerability assessment platform that helps security professionals and developers manage, analyze, and remediate security vulnerabilities in their applications.

## 🎥 Demo Video

![Demo Video](demo.mp4)

*Watch the demo video above to see WAF-Copilot in action!*



## Features

- **🔒 CVE Management**: Automated CVE detection, status tracking, and AI-powered explanations
- **🛡️ WAF Rule Generation**: Multi-platform support (Azure, AWS, GCP, Cloudflare) with JSON/cURL formats
- **🧪 Testing Code**: Generate educational Python testing code for vulnerability simulation
- **📊 Dashboard**: Real-time statistics, interactive tables, and bulk operations

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

### Prerequisites
- Python 3.8+, Node.js 18+, OpenAI API Key

### Installation

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

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User authentication
- `GET /api/user/cves/` - Get user's CVE list
- `POST /api/user/cves/update-status/` - Update CVE status
- `POST /api/waf-rule/` - Generate WAF rules
- `POST /api/generate-testing-code/` - Generate testing code

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Support

- 📧 Email: [nikhil@cyberultron.com]
- 🐛 Issues: [GitHub Issues](https://github.com/CyberUltron-Nikhil/WAF-Copilot/issues)

---

**WAF-Copilot** - Making web application security management simple and intelligent.
