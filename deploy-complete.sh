#!/bin/bash

echo "🚀 Deploying Complete Shipping API Platform to 10.0.0.108"
echo "========================================================="

# Check if we're on the server
if [[ $(hostname -I | grep -c "10.0.0.108") -eq 0 ]]; then
    echo "📤 This script should be run on your server (10.0.0.108)"
    echo "   Copy this project to your server and run this script there."
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.all-in-one.yml down

# Build and start the complete container
echo "🔧 Building and starting complete shipping platform..."
docker-compose -f docker-compose.all-in-one.yml up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Test the deployment
echo "🧪 Testing deployment..."
echo ""
echo "Testing API..."
curl -f http://localhost:3000/ >/dev/null 2>&1 && echo "✅ API is responding" || echo "❌ API is not responding"

echo "Testing Frontend..."
curl -f http://localhost/ >/dev/null 2>&1 && echo "✅ Frontend is responding" || echo "❌ Frontend is not responding"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Access your application:"
echo "   🌐 Frontend: http://10.0.0.108/"
echo "   📡 API:      http://10.0.0.108:3000/"
echo ""
echo "📊 Container status:"
docker ps | grep shipping-api

echo ""
echo "💡 Useful commands:"
echo "   📋 Check logs:    docker-compose -f docker-compose.all-in-one.yml logs -f"
echo "   🔄 Restart:       docker-compose -f docker-compose.all-in-one.yml restart"
echo "   🛑 Stop:          docker-compose -f docker-compose.all-in-one.yml down"
