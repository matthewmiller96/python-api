#!/bin/bash

# Remote deployment script for Shipping API
# Usage: ./deploy-local.sh [server-host] [user] [environment]

SERVER_HOST=${1:-"10.0.0.108"}
SERVER_USER=${2:-"ubuntu"}
ENVIRONMENT=${3:-"production"}
APP_DIR="~/shipping-api"

echo "Remote Deployment to $SERVER_HOST"
echo "=================================="
echo "User: $SERVER_USER"
echo "Environment: $ENVIRONMENT"
echo "Directory: $APP_DIR"

# Copy files to server
echo ""
echo "Copying files to server..."
rsync -av \
    --exclude='.git' \
    --exclude='.github' \
    --exclude='.venv' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.DS_Store' \
    --exclude='node_modules' \
    --exclude='build' \
    ./ ${SERVER_USER}@${SERVER_HOST}:${APP_DIR}/

# Deploy on server using the unified script
echo ""
echo "Deploying on remote server..."
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${APP_DIR} && chmod +x deploy.sh utils.sh && ./deploy.sh $ENVIRONMENT"

echo ""
echo "Deployment complete!"
echo "================="
if [ "$ENVIRONMENT" = "all-in-one" ] || [ "$ENVIRONMENT" = "production" ]; then
    echo "Frontend: http://${SERVER_HOST}"
fi
echo "API: http://${SERVER_HOST}:3000"
echo "API Docs: http://${SERVER_HOST}:3000/docs"

echo ""
echo "Useful commands:"
echo "  Test connectivity: ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${APP_DIR} && ./utils.sh test-connectivity'"
echo "  View status: ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${APP_DIR} && ./utils.sh status'"
echo "  View logs: ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${APP_DIR} && ./utils.sh logs'"
