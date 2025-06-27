#!/bin/bash

echo "🔍 Shipping API Server Troubleshooting"
echo "====================================="

# Check if containers are running
echo "📦 Checking Docker containers..."
docker ps | grep -E "(shipping|api|frontend)" || echo "❌ No containers found with 'shipping', 'api', or 'frontend' in name"

# Check if ports are listening
echo ""
echo "🌐 Checking listening ports..."
echo "Port 3000 (API):"
netstat -tulpn | grep :3000 || echo "❌ Port 3000 not listening"

echo "Port 80 (Frontend):"
netstat -tulpn | grep :80 || echo "❌ Port 80 not listening"

# Test API endpoint
echo ""
echo "🧪 Testing API endpoint..."
curl -f http://localhost:3000/ >/dev/null 2>&1 && echo "✅ API responding on localhost:3000" || echo "❌ API not responding on localhost:3000"

# Test external API access
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo ""
echo "🌍 Testing external API access on $LOCAL_IP..."
curl -f http://$LOCAL_IP:3000/ >/dev/null 2>&1 && echo "✅ API responding externally on $LOCAL_IP:3000" || echo "❌ API not responding externally"

# Check firewall
echo ""
echo "🔥 Checking firewall status..."
ufw status || iptables -L | head -20

# Check docker logs
echo ""
echo "📋 Recent Docker logs (last 10 lines)..."
docker logs $(docker ps -q) --tail 10 2>/dev/null || echo "❌ No containers to show logs for"

echo ""
echo "💡 Quick fixes:"
echo "   1. Restart containers: docker-compose down && docker-compose up -d"
echo "   2. Check firewall: sudo ufw allow 3000 && sudo ufw allow 80"
echo "   3. Rebuild containers: docker-compose build --no-cache"
echo "   4. Check API: curl http://localhost:3000/"
