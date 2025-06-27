# Shipping API

A comprehensive FastAPI-based shipping management system with React frontend.

## Quick Start

### Development
```bash
./deploy.sh development
```

### Production
```bash
./deploy.sh production
```

### All-in-One Deployment
```bash
./deploy.sh all-in-one
```

## Utilities

Use the utilities script for testing and management:

```bash
./utils.sh urls                # Show all access URLs
./utils.sh test-connectivity   # Test network connectivity
./utils.sh test-api            # Run comprehensive API tests
./utils.sh troubleshoot        # Run troubleshooting diagnostics
./utils.sh status              # Show container and service status
./utils.sh logs [service]      # Show logs for specific service
```

## Features

- **FastAPI Backend**: Modern, fast web framework for building APIs
- **React Frontend**: Modern user interface with Material-UI
- **Docker Support**: Containerized deployment with multiple environments
- **Authentication**: JWT-based authentication system
- **Carrier Integration**: Support for multiple shipping carriers
- **Real-time Tracking**: Track shipments across different carriers

## Project Structure

```
├── app/                    # FastAPI backend application
├── frontend/              # React frontend application
├── docs/                  # Documentation
│   ├── deployment/        # Deployment guides
│   ├── authentication/    # Authentication guides
│   ├── api/              # API documentation
│   └── development/      # Development notes
├── deploy.sh             # Main deployment script
├── deploy-local.sh       # Remote deployment script
├── utils.sh              # Utility functions
└── docker-compose.yml    # Docker services configuration
```

## Documentation

### 📚 Deployment
- [Deployment Guide](docs/deployment/DEPLOYMENT.md) - Main deployment instructions
- [Frontend Deployment](docs/deployment/FRONTEND_DEPLOYMENT.md) - Frontend-specific deployment
- [Container Deployment](docs/deployment/CONTAINER_DEPLOYMENT.md) - Docker container details

### 🔐 Authentication
- [Authentication Quick Start](docs/authentication/AUTHENTICATION_QUICK_START.md) - Get started with auth
- [Bearer Token Guide](docs/authentication/BEARER_TOKEN_GUIDE.md) - Working with bearer tokens
- [User Auth Guide](docs/authentication/USER_AUTH_GUIDE.md) - User authentication system

### 🚀 API
- [Carrier API Examples](docs/api/CARRIER_API_EXAMPLES.md) - Carrier integration examples
- [Router Setup](docs/api/ROUTER_SETUP.md) - API routing configuration

### 🛠️ Development
- [Script Consolidation Summary](docs/development/SCRIPT_CONSOLIDATION_SUMMARY.md) - Recent improvements

## API Endpoints

- **Health Check**: `GET /health`
- **API Documentation**: `GET /docs` (Swagger UI)
- **Shipments**: `GET|POST /shipments`
- **Carriers**: `GET|POST /carriers`
- **Locations**: `GET /locations`
- **Authentication**: `POST /auth/login`

## Environment Configuration

The project supports three deployment environments:

1. **Development** (`.env.development`)
   - API only on port 3000
   - Hot reload enabled
   - Development logging

2. **Production** (`.env.production`)
   - Separate frontend (port 80) and API (port 3000) containers
   - Production optimizations
   - Auto-restart policies

3. **All-in-One** (`.env.all-in-one`)
   - Single container with both services
   - Minimal resource usage
   - Simplified deployment

## Access URLs

After deployment, your services will be available at:

- **Frontend**: `http://localhost/` (production/all-in-one)
- **API**: `http://localhost:3000/`
- **API Docs**: `http://localhost:3000/docs`
- **Health Check**: `http://localhost:3000/health`

Run `./utils.sh urls` to see all available URLs including network access.

## Troubleshooting

If you encounter issues:

1. Check container status: `./utils.sh status`
2. Run connectivity tests: `./utils.sh test-connectivity`
3. View logs: `./utils.sh logs`
4. Run full diagnostics: `./utils.sh troubleshoot`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `./utils.sh test-api`
5. Submit a pull request

## License

This project is licensed under the MIT License.
