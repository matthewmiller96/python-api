#!/bin/bash

echo "🚀 Quick Setup for Shipping API on Server 10.0.0.108"
echo "===================================================="

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 10

# Test the setup
echo "🧪 Testing the setup..."
echo ""

# Test API
echo "Testing API on localhost:3000..."
curl -f http://localhost:3000/ >/dev/null 2>&1 && echo "✅ API working locally" || echo "❌ API not working locally"

# Test API externally
echo "Testing API on 10.0.0.108:3000..."
curl -f http://10.0.0.108:3000/ >/dev/null 2>&1 && echo "✅ API working externally" || echo "❌ API not working externally"

# Check containers
echo ""
echo "📦 Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Show logs if there are issues
echo ""
echo "📋 Recent container logs:"
docker logs $(docker ps -q) --tail 5 2>/dev/null

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🌐 Access URLs:"
echo "   Backend API: http://10.0.0.108:3000"
echo "   API Docs: http://10.0.0.108:3000/docs"
echo ""
echo "💡 Next steps for frontend:"
echo "   1. Use production docker-compose: docker-compose -f docker-compose.production.yml up -d"
echo "   2. Or deploy frontend separately using: ./frontend/deploy.sh"
echo ""
echo "🔧 If something's not working, run: ./troubleshoot.sh"
