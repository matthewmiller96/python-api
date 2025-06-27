# Docker Deployment Guide

## 🐳 Unified Container Deployment

This guide covers deploying the complete shipping API application using the unified Docker container that includes frontend, backend, and nginx proxy.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Git repository cloned
- Port 8080 available (or configure different port)

## 🚀 Quick Start

### 1. Build and Run the Unified Container

```bash
# Build the unified image
docker build -f Dockerfile.unified -t shipments-unified .

# Run the container
docker run -d --name shipments-app -p 8080:80 shipments-unified

# Check status
docker logs shipments-app
```

### 2. Verify Deployment

```bash
# Health check
curl http://localhost:8080/health

# Frontend access
open http://localhost:8080

# API documentation
open http://localhost:8080/api/docs
```

## 🏗️ Architecture Overview

The unified container includes:

- **Frontend**: React application served by nginx
- **Backend**: FastAPI application running on port 8000
- **Nginx**: Reverse proxy routing requests
- **Supervisor**: Process manager for nginx and FastAPI

### Request Routing

- `/` → Frontend (React SPA)
- `/api/*` → Backend API (FastAPI)
- `/health` → Backend health check
- `/docs` → API documentation

## 🔧 Configuration Options

### Environment Variables

```bash
# Run with custom configuration
docker run -d \
  --name shipments-app \
  -p 8080:80 \
  -e DATABASE_URL="sqlite:///./data/shipments.db" \
  -e SECRET_KEY="your-secret-key" \
  -e DEBUG="false" \
  shipments-unified
```

### Volume Mounting

```bash
# Persist database data
docker run -d \
  --name shipments-app \
  -p 8080:80 \
  -v $(pwd)/data:/app/data \
  shipments-unified
```

## 📊 Performance Characteristics

### Build Performance
- **Build Time**: ~60-80 seconds (includes frontend build)
- **Image Size**: Optimized with Alpine Linux and multi-stage build
- **Layer Caching**: Efficient Docker layer utilization
- **Dependencies**: Fast installation with uv package manager

### Runtime Performance
- **Startup Time**: ~3-5 seconds
- **Memory Usage**: ~150-200MB (Alpine Linux base)
- **Response Time**: Fast API responses through nginx
- **Database**: SQLite with automatic initialization

## 🛠️ Development Workflow

### Local Development

```bash
# Development with auto-rebuild
docker build -f Dockerfile.unified -t shipments-dev .
docker run -d --name shipments-dev -p 8080:80 shipments-dev

# View logs
docker logs -f shipments-dev

# Enter container for debugging
docker exec -it shipments-dev sh
```

### Hot Reload (Development)

For development with hot reload, use Docker Compose:

```bash
# Use docker-compose for development
docker-compose -f docker-compose.yml up --build
```

## 🔍 Monitoring and Logging

### Health Monitoring

```bash
# Check container health
docker exec shipments-app curl -f http://localhost/health

# Supervisor status
docker exec shipments-app supervisorctl status
```

### Log Access

```bash
# Application logs
docker logs shipments-app

# Nginx logs
docker exec shipments-app tail -f /var/log/nginx_out.log
docker exec shipments-app tail -f /var/log/nginx_err.log

# FastAPI logs  
docker exec shipments-app tail -f /var/log/fastapi_out.log
docker exec shipments-app tail -f /var/log/fastapi_err.log
```

## 🌐 Production Deployment

### Using Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.unified
    ports:
      - "80:80"
    environment:
      - DATABASE_URL=sqlite:///./data/shipments.db
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=false
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Deploy:

```bash
# Set environment variables
export SECRET_KEY="your-production-secret-key"

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale if needed
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

### Server Deployment

1. **Connect to Server**
   ```bash
   ssh your-username@your-server-ip
   ```

2. **Deploy Application**
   ```bash
   git clone your-repo-url
   cd python-api
   docker build -f Dockerfile.unified -t shipments-prod .
   docker run -d --name shipments-prod -p 80:80 shipments-prod
   ```

3. **Configure Firewall**
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443  # For future HTTPS
   ```

## 🔐 Security Considerations

### Production Security

```bash
# Run with specific user (not root)
docker run -d \
  --name shipments-app \
  --user 1000:1000 \
  -p 8080:80 \
  shipments-unified
```

### SSL/HTTPS Setup

For production, place nginx with SSL in front:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   docker stop shipments-app
   docker rm shipments-app
   # Or use different port: -p 8081:80
   ```

2. **Container Won't Start**
   ```bash
   # Check logs
   docker logs shipments-app
   
   # Test nginx config
   docker exec shipments-app nginx -t
   ```

3. **API Not Accessible**
   ```bash
   # Check supervisor status
   docker exec shipments-app supervisorctl status
   
   # Restart services
   docker exec shipments-app supervisorctl restart all
   ```

4. **Build Issues**
   ```bash
   # Clean build
   docker build --no-cache -f Dockerfile.unified -t shipments-unified .
   
   # Check disk space
   docker system df
   docker system prune  # Clean up
   ```

### Debug Mode

```bash
# Run with debug output
docker run -it --rm \
  -p 8080:80 \
  -e DEBUG=true \
  shipments-unified
```

## 📈 Scaling and Performance

### Horizontal Scaling

```bash
# Load balancer configuration
docker run -d --name shipments-lb -p 80:80 nginx

# Multiple app instances
docker run -d --name shipments-app1 -p 8081:80 shipments-unified
docker run -d --name shipments-app2 -p 8082:80 shipments-unified
docker run -d --name shipments-app3 -p 8083:80 shipments-unified
```

### Resource Limits

```bash
# Set memory and CPU limits
docker run -d \
  --name shipments-app \
  --memory=512m \
  --cpus=1.0 \
  -p 8080:80 \
  shipments-unified
```

## ✅ Success Indicators

Deployment is successful when:

1. ✅ Container starts without errors: `docker logs shipments-app`
2. ✅ Health check passes: `curl http://localhost:8080/health`
3. ✅ Frontend loads: `curl http://localhost:8080`
4. ✅ API responds: `curl http://localhost:8080/api/`
5. ✅ Both services running: `docker exec shipments-app supervisorctl status`

## 🎯 Next Steps

After successful deployment:

1. **Configure Authentication**: Set up user registration and JWT tokens
2. **Add SSL**: Configure HTTPS for production
3. **Set Up Monitoring**: Add log aggregation and metrics
4. **Configure Backups**: Regular database backups
5. **CI/CD Integration**: Automate deployments
6. **Load Testing**: Verify performance under load

The unified Docker container provides a complete, production-ready deployment solution for the shipping API application with frontend, backend, and reverse proxy all optimized and working together.
