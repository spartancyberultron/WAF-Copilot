# WAF-Copilot

![WAF Copilot Banner](https://raw.githubusercontent.com/CyberUltron-Nikhil/WAF-Copilot/main/assets/banner.png)

## Overview

WAF-Copilot is a comprehensive Web Application Firewall (WAF) management and CVE vulnerability assessment platform that helps security professionals and developers manage, analyze, and remediate security vulnerabilities in their applications. The platform provides automated CVE analysis, WAF rule generation, and testing code generation capabilities.

## 🎥 Demo

[![WAF-Copilot Demo](https://img.shields.io/badge/▶️%20Play%20Demo-WAF-Copilot%20Interactive%20Demo-red?style=for-the-badge&logo=youtube)](https://app.supademo.com/embed/cmeqqouup3ca2v9kqyfthvc4z?embed_v=2&utm_source=embed)

**Click the play button above to watch an interactive demo of WAF-Copilot in action!**

<div align="center">
  <a href="https://app.supademo.com/embed/cmeqqouup3ca2v9kqyfthvc4z?embed_v=2&utm_source=embed" target="_blank">
    <img src="https://img.shields.io/badge/🎬%20Watch%20Full%20Demo-Click%20to%20Play-orange?style=for-the-badge&logo=play" alt="WAF-Copilot Demo" />
  </a>
</div>

## Features

### 🔒 **CVE Management & Analysis**
- **Automated CVE Detection**: Scans dependencies and identifies Common Vulnerabilities and Exposures
- **CVE Status Tracking**: Manage vulnerability lifecycle with status tracking (Not Started, Started, In Progress, Closed)
- **Detailed CVE Information**: Comprehensive vulnerability details including CVSS scores, descriptions, and references
- **AI-Powered Explanations**: Generate detailed explanations and flow diagrams for each CVE

### 🛡️ **WAF Rule Generation**
- **Multi-Platform Support**: Generate WAF rules for Azure WAF, AWS WAF, GCP Cloud Armor, and Cloudflare
- **Multiple Formats**: Support for JSON and cURL rule formats
- **Automated Rule Creation**: AI-generated rules based on CVE analysis and severity

### 🧪 **Testing & Validation**
- **Python Testing Code**: Generate educational testing code to simulate and understand vulnerabilities
- **Code Generation**: AI-powered Python scripts for vulnerability testing and validation
- **Copy & Download**: Easy code copying and downloading functionality

### 📊 **Dashboard & Analytics**
- **Real-time Statistics**: Live counts of vulnerabilities by status
- **Interactive Tables**: Sortable, filterable CVE data tables
- **Status Management**: Bulk status updates and quick actions
- **Responsive Design**: Mobile-friendly interface with drawer navigation

## Architecture

### Backend (Django)
- **Framework**: Django 4.x with Django REST Framework
- **Database**: SQLite (configurable for production)
- **Authentication**: JWT-based authentication system
- **AI Integration**: OpenAI API integration for intelligent analysis
- **API Endpoints**: RESTful API for all frontend operations

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **UI Components**: Shadcn UI component library
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Diagrams**: Mermaid.js for flow diagrams

## Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 18.0 or higher
- **npm** or **yarn**
- **OpenAI API Key** (for AI-powered features)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/CyberUltron-Nikhil/WAF-Copilot.git
cd WAF-Copilot
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
# Create .env file with your OpenAI API key
echo "OPENAI_API_KEY=your_api_key_here" > .env

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Django Settings
DEBUG=True
SECRET_KEY=your_secret_key_here

# Database (optional - defaults to SQLite)
DATABASE_URL=postgresql://user:password@localhost:5432/waf_copilot

# CORS Settings
ALLOWED_HOSTS=localhost,127.0.0.1
```

### OpenAI API Setup
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and generate an API key
3. Add the key to your `.env` file
4. Ensure you have sufficient credits for API calls

## Usage Guide

### 1. Getting Started

#### Access the Application
- Backend API: `http://localhost:8000`
- Frontend Dashboard: `http://localhost:3000`
- Admin Interface: `http://localhost:8000/admin`

#### Initial Setup
1. **Register Account**: Create a new user account through the registration page
2. **Login**: Authenticate with your credentials
3. **Dashboard**: Access the main dashboard to view CVE vulnerabilities

### 2. CVE Management

#### Viewing CVEs
- **Dashboard**: Main table shows all CVE vulnerabilities
- **Status Filtering**: Filter CVEs by status (Not Started, Started, In Progress, Closed)
- **Search**: Use the search bar to find specific CVEs by ID
- **Pagination**: Navigate through large datasets with pagination controls

#### CVE Details
1. **Click CVE ID**: Click on any CVE ID to open detailed information
2. **Three Tabs**:
   - **General**: Basic CVE information, status management, and AI-generated explanations
   - **Remediation**: WAF rule generation and remediation steps
   - **Testing**: Python testing code generation

#### Status Management
- **Quick Actions**: Use quick action buttons to change status
- **Dropdown Selection**: Select new status from the dropdown menu
- **Real-time Updates**: Status changes update immediately across the interface

### 3. WAF Rule Generation

#### Generate Rules
1. **Select WAF Type**: Choose from Azure, AWS, GCP, or Cloudflare
2. **Choose Format**: Select JSON or cURL format
3. **Generate**: Click "Generate WAF Rule" button
4. **Copy/Download**: Use the copy button or download the generated rule

#### Rule Customization
- Rules are automatically generated based on CVE severity and description
- AI analyzes the vulnerability to create appropriate mitigation rules
- Rules can be manually edited after generation

### 4. Testing Code Generation

#### Generate Testing Code
1. **Navigate to Testing Tab**: Open the testing tab in CVE details
2. **Generate Code**: Click "Generate Testing Code" button
3. **Review Code**: Examine the generated Python code
4. **Copy Code**: Use the copy button to copy code to clipboard

#### Code Features
- **Educational Purpose**: Code is designed for learning and understanding vulnerabilities
- **Simulation**: Helps simulate vulnerability conditions safely
- **Documentation**: Includes comments explaining the vulnerability

### 5. Advanced Features

#### Bulk Operations
- **Select Multiple CVEs**: Use checkboxes to select multiple vulnerabilities
- **Bulk Status Updates**: Change status for multiple CVEs simultaneously
- **Export Data**: Download CVE data in various formats

#### Analytics & Reporting
- **Status Statistics**: Real-time counts of vulnerabilities by status
- **Trend Analysis**: Track vulnerability trends over time
- **Custom Reports**: Generate custom vulnerability reports

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User authentication
- `POST /api/auth/refresh/` - Refresh JWT token

### CVE Management
- `GET /api/user/cves/` - Get user's CVE list
- `POST /api/user/cves/update-status/` - Update CVE status
- `POST /api/cve-explanation/` - Generate CVE explanation

### WAF Rules
- `POST /api/waf-rule/` - Generate WAF rules
- `POST /api/generate-testing-code/` - Generate testing code

### User Profile
- `GET /api/user/profile/` - Get user profile and statistics

## Development

### Project Structure
```
WAF-Copilot/
├── backend/                 # Django backend
│   ├── api/                # API application
│   ├── backend/            # Django settings
│   ├── scripts/            # Utility scripts
│   └── manage.py           # Django management
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   └── public/            # Static assets
└── README.md              # This file
```

### Adding New Features

#### Backend
1. **Models**: Add new models in `backend/api/models.py`
2. **Views**: Create new views in `backend/api/views.py`
3. **URLs**: Add URL patterns in `backend/backend/urls.py`
4. **Serializers**: Create serializers in `backend/api/serializers.py`

#### Frontend
1. **Components**: Add new components in `frontend/components/`
2. **Pages**: Create new pages in `frontend/app/`
3. **Hooks**: Add custom hooks in `frontend/hooks/`
4. **API Integration**: Update API calls in components

### Testing
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm run test
```

## Deployment

### Production Considerations
1. **Database**: Use PostgreSQL or MySQL instead of SQLite
2. **Environment Variables**: Set production environment variables
3. **Static Files**: Configure static file serving
4. **Security**: Enable HTTPS and secure headers
5. **Monitoring**: Add logging and monitoring

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t waf-copilot-backend ./backend
docker build -t waf-copilot-frontend ./frontend
```

## Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for frontend components
- Write tests for new features
- Update documentation for API changes

## Troubleshooting

### Common Issues

#### Backend Issues
- **Migration Errors**: Run `python manage.py migrate --run-syncdb`
- **API Key Issues**: Verify OpenAI API key in `.env` file
- **Database Errors**: Check database connection and run migrations

#### Frontend Issues
- **Build Errors**: Clear `node_modules` and reinstall dependencies
- **API Connection**: Verify backend server is running on port 8000
- **Authentication**: Check JWT token expiration and refresh

#### Performance Issues
- **Slow API Calls**: Check OpenAI API rate limits
- **Large Datasets**: Implement pagination and filtering
- **Memory Usage**: Optimize database queries and frontend rendering

### Getting Help
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check inline code comments and API documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **OpenAI**: For AI-powered vulnerability analysis
- **Django**: For the robust backend framework
- **Next.js**: For the modern frontend framework
- **Shadcn UI**: For the beautiful component library
- **Community**: For contributions and feedback

## Support

For support and questions:
- 📧 Email: [nikhil@cyberultron.com]
- 🐛 Issues: [GitHub Issues](https://github.com/CyberUltron-Nikhil/WAF-Copilot/issues)

---

**WAF-Copilot** - Making web application security management simple and intelligent.
