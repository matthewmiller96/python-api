# Documentation Index

Welcome to the Shipping API documentation. This directory contains comprehensive guides organized by topic.

## 📁 Directory Structure

### 🚀 [Deployment](deployment/)
Complete guides for deploying the Shipping API in various environments.

- **[Deployment Guide](deployment/DEPLOYMENT.md)** - Main deployment instructions with unified Docker approach
- **[Frontend Deployment](deployment/FRONTEND_DEPLOYMENT.md)** - Frontend-specific deployment options
- **[Container Deployment](deployment/CONTAINER_DEPLOYMENT.md)** - Docker container configuration details

### 🔐 [Authentication](authentication/)
Authentication and security documentation.

- **[Authentication Quick Start](authentication/AUTHENTICATION_QUICK_START.md)** - Get started with authentication
- **[Bearer Token Guide](authentication/BEARER_TOKEN_GUIDE.md)** - Working with bearer tokens
- **[User Auth Guide](authentication/USER_AUTH_GUIDE.md)** - User authentication system

### 🌐 [API](api/)
API documentation and integration guides.

- **[Carrier API Examples](api/CARRIER_API_EXAMPLES.md)** - Carrier integration examples and patterns
- **[Router Setup](api/ROUTER_SETUP.md)** - API routing configuration

### 🛠️ [Development](development/)
Development notes and project history.

- **[Script Consolidation Summary](development/SCRIPT_CONSOLIDATION_SUMMARY.md)** - Recent script improvements and consolidation
- **[Documentation Organization](development/DOCUMENTATION_ORGANIZATION.md)** - Documentation structure improvements

## 🎯 Quick Navigation

### Getting Started
1. [Main README](../README.md) - Project overview and quick start
2. [Deployment Guide](deployment/DEPLOYMENT.md) - Deploy the application
3. [Authentication Quick Start](authentication/AUTHENTICATION_QUICK_START.md) - Set up authentication

### Common Tasks
- **Deploy to production**: See [Deployment Guide](deployment/DEPLOYMENT.md)
- **Set up authentication**: See [Authentication Quick Start](authentication/AUTHENTICATION_QUICK_START.md)
- **Integrate carriers**: See [Carrier API Examples](api/CARRIER_API_EXAMPLES.md)
- **Troubleshoot deployment**: Run `../utils.sh troubleshoot`

### Reference
- **API Documentation**: `http://localhost:3000/docs` (when running)
- **Utility Commands**: Run `../utils.sh` for available commands
- **Project Structure**: See [Main README](../README.md#project-structure)

## 📝 Documentation Standards

All documentation in this project follows these standards:

- **Clear headings** with emoji for easy scanning
- **Code examples** with syntax highlighting
- **Step-by-step instructions** for complex procedures
- **Cross-references** between related documents
- **Up-to-date information** reflecting the current codebase

## 🔄 Recent Changes

The documentation has been reorganized for better navigation:

- ✅ All `.md` files moved from root to organized folders
- ✅ Created main `README.md` with project overview
- ✅ Added this index for easy navigation
- ✅ Consolidated shell scripts documentation
- ✅ Updated all cross-references

## 💡 Tips

- Use `../utils.sh` commands for quick testing and diagnostics
- Bookmark the API docs at `http://localhost:3000/docs` when developing
- Check the [Development](development/) folder for recent project changes
- All deployment scenarios are covered in the [Deployment](deployment/) section
