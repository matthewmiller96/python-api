#!/bin/bash

echo "🔍 Shipping API Server Troubleshooting"
echo "====================================="

# Check if containers are running
echo "📦 Checking Docker containers..."
docker ps | grep -E "(shipping-api|myapp)" || echo "❌ No shipping-api containers found"

# Check for orphaned containers
echo ""
echo "🔍 Checking for orphaned containers..."
docker ps -a | grep -E "(api|frontend)" && echo "⚠️  Found old containers - need cleanup"

# Check if ports are listening
echo ""
echo "🌐 Checking listening ports..."
echo "Port 80 (Frontend):"
netstat -tulpn | grep :80 || echo "❌ Port 80 not listening"
echo "Port 3000 (API):"
netstat -tulpn | grep :3000 || echo "❌ Port 3000 not listening"

# Test endpoints
echo ""
echo "🧪 Testing endpoints..."
curl -f http://localhost/ >/dev/null 2>&1 && echo "✅ Frontend responding on localhost:80" || echo "❌ Frontend not responding on localhost:80"
curl -f http://localhost:3000/ >/dev/null 2>&1 && echo "✅ API responding on localhost:3000" || echo "❌ API not responding on localhost:3000"

# Test external access
echo ""
echo "🌍 Testing external access on 10.0.0.108..."
curl -f http://10.0.0.108/ >/dev/null 2>&1 && echo "✅ Frontend accessible externally" || echo "❌ Frontend not accessible externally"
curl -f http://10.0.0.108:3000/ >/dev/null 2>&1 && echo "✅ API accessible externally" || echo "❌ API not accessible externally"
curl -f http://$LOCAL_IP:3000/ >/dev/null 2>&1 && echo "✅ API responding externally on $LOCAL_IP:3000" || echo "❌ API not responding externally"

# Check firewall
echo ""
echo "🔥 Checking firewall status..."
ufw status || iptables -L | head -20

# Check docker logs for shipping-api container
echo ""
echo "📋 Container logs (last 20 lines)..."
CONTAINER_ID=$(docker ps | grep shipping-api | awk '{print $1}')
if [ ! -z "$CONTAINER_ID" ]; then
    echo "Logs for container $CONTAINER_ID:"
    docker logs $CONTAINER_ID --tail 20
else
    echo "❌ No shipping-api container found"
fi

echo ""
echo "💡 Quick fixes for common issues:"
echo ""
echo "🔧 Port conflicts (if port 3000 is already allocated):"
echo "   1. Find process using port: sudo lsof -i :3000"
echo "   2. Kill old containers: docker stop \$(docker ps -q) && docker rm \$(docker ps -aq)"
echo "   3. Clean up orphans: docker-compose -f docker-compose.all-in-one.yml down --remove-orphans"
echo ""
echo "🔄 Container management:"
echo "   1. Stop all: docker-compose -f docker-compose.all-in-one.yml down"
echo "   2. Clean rebuild: docker-compose -f docker-compose.all-in-one.yml up -d --build --remove-orphans"
echo "   3. View logs: docker-compose -f docker-compose.all-in-one.yml logs -f"
echo ""
echo "🌐 Git conflicts:"
echo "   1. Backup changes: cp -r . ../backup"
echo "   2. Reset repo: git reset --hard HEAD"
echo "   3. Pull updates: git pull"
echo "   4. Redeploy: ./deploy-complete.sh"
