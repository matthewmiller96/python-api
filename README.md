# Shipping API

A comprehensive FastAPI-based shipping management system with React frontend.

## Quick Start

### Unified Docker Deployment (Recommended)
```bash
# Build and run the unified container (Frontend + Backend + Nginx)
docker build -f Dockerfile.unified -t shipments-unified .
docker run -d --name shipments-app -p 8080:80 shipments-unified

# Check status
docker logs shipments-app

# Access the application
open http://localhost:8080
```

### Legacy Deployment Options
```bash
./deploy.sh development    # API only
./deploy.sh production     # Separate frontend/backend containers
./deploy.sh all-in-one     # Legacy all-in-one container
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

### � Docker Deployment
- **[Docker Deployment Guide](DOCKER_DEPLOYMENT_GUIDE.md)** - Complete Docker deployment guide with unified container

### � Additional Documentation
- [API Documentation](docs/api/) - API examples and routing
- [Authentication Guides](docs/authentication/) - Authentication system
- [Development Notes](docs/development/) - Development workflows

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

### Unified Container (Recommended)
After running the unified container:
- **Application**: `http://localhost:8080/` (Frontend + API)
- **API Docs**: `http://localhost:8080/api/docs`
- **Health Check**: `http://localhost:8080/health`

### Legacy Deployment URLs
- **Frontend**: `http://localhost/` (production)
- **API**: `http://localhost:3000/`
- **API Docs**: `http://localhost:3000/docs`

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
