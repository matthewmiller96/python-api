#!/bin/bash

# Local deployment script for private network
echo "🚀 Deploying to local server..."

# Server details
SERVER_USER="ubuntu"
SERVER_HOST="10.0.0.108"
APP_DIR="~/myapp"

# Copy files to server
echo "📁 Copying files to server..."
rsync -av --exclude='.git' --exclude='.github' --exclude='.venv' --exclude='__pycache__' --exclude='*.pyc' --exclude='.DS_Store' ./ ${SERVER_USER}@${SERVER_HOST}:${APP_DIR}/

# Deploy on server
echo "🐳 Deploying with Docker..."
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${APP_DIR} && docker compose down || true && docker compose up -d --build"

echo "✅ Deployment complete!"
echo "🌐 API should be available at: http://${SERVER_HOST}:8000"
echo "📚 Docs available at: http://${SERVER_HOST}:8000/docs"
