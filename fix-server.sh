#!/bin/bash

echo "🔧 Fixing Shipping API Server Issues"
echo "====================================="

echo "🛑 Step 1: Stop all containers and clean up..."
docker stop $(docker ps -q) 2>/dev/null
docker rm $(docker ps -aq) 2>/dev/null
docker-compose down --remove-orphans 2>/dev/null
docker-compose -f docker-compose.all-in-one.yml down --remove-orphans 2>/dev/null

echo "🧹 Step 2: Clean up git conflicts..."
# Backup any local changes
if [ -d "app" ]; then
    echo "Backing up local changes..."
    cp -r app app_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null
fi

# Reset git to clean state
echo "Resetting git repository..."
git reset --hard HEAD
git clean -fd

echo "📥 Step 3: Pull latest changes..."
git pull

echo "🔧 Step 4: Kill any processes using ports 80 and 3000..."
sudo lsof -ti:80 | xargs sudo kill -9 2>/dev/null
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null

echo "🚀 Step 5: Deploy with clean environment..."
./deploy-complete.sh

echo ""
echo "✅ Fix attempt complete!"
echo ""
echo "🧪 Testing the deployment..."
sleep 5

# Test endpoints
curl -f http://localhost/ >/dev/null 2>&1 && echo "✅ Frontend working" || echo "❌ Frontend still not working"
curl -f http://localhost:3000/ >/dev/null 2>&1 && echo "✅ API working" || echo "❌ API still not working"

echo ""
echo "📋 If issues persist, check:"
echo "   1. Run: ./troubleshoot.sh"
echo "   2. Check logs: docker-compose -f docker-compose.all-in-one.yml logs"
echo "   3. Check container status: docker ps"
