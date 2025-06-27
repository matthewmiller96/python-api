#!/bin/bash

# Deployment script for Shipping API
# Usage: ./deploy.sh [development|production|all-in-one]

ENVIRONMENT=${1:-development}

echo "Deploying Shipping API in $ENVIRONMENT mode..."

# Check if environment file exists
ENV_FILE=".env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file $ENV_FILE not found"
    echo "Available environments: development, production, all-in-one"
    exit 1
fi

# Stop existing containers
echo "Stopping existing containers..."
docker-compose --env-file "$ENV_FILE" down --remove-orphans 2>/dev/null || true

# Pull latest changes (if in git repo)
if [ -d ".git" ]; then
    echo "Pulling latest changes..."
    git pull
fi

# Build and start services
echo "Building and starting services for $ENVIRONMENT..."
docker-compose --env-file "$ENV_FILE" up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Test deployment
echo "Testing deployment..."
if [ "$ENVIRONMENT" = "all-in-one" ]; then
    curl -f http://localhost/ >/dev/null 2>&1 && echo "Frontend: OK" || echo "Frontend: FAILED"
    curl -f http://localhost:3000/ >/dev/null 2>&1 && echo "API: OK" || echo "API: FAILED"
elif [ "$ENVIRONMENT" = "production" ]; then
    curl -f http://localhost/ >/dev/null 2>&1 && echo "Frontend: OK" || echo "Frontend: FAILED"
    curl -f http://localhost:3000/ >/dev/null 2>&1 && echo "API: OK" || echo "API: FAILED"
else
    curl -f http://localhost:3000/ >/dev/null 2>&1 && echo "API: OK" || echo "API: FAILED"
fi

echo ""
echo "Deployment complete!"
echo "Environment: $ENVIRONMENT"
echo ""
echo "Container status:"
docker-compose --env-file "$ENV_FILE" ps

echo ""
echo "Useful commands:"
echo "  View logs:  docker-compose --env-file $ENV_FILE logs -f"
echo "  Stop:       docker-compose --env-file $ENV_FILE down"
echo "  Restart:    docker-compose --env-file $ENV_FILE restart"
