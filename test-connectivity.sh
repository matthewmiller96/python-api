#!/bin/bash

echo "🔍 Network Connectivity Test Script"
echo "=================================="

# Get public IP
PUBLIC_IP=$(curl -s https://ipinfo.io/ip)
echo "📍 Public IP: $PUBLIC_IP"

# Test local access
echo ""
echo "🏠 Testing local access..."
curl -s http://localhost:3000/ && echo "✅ Local access works" || echo "❌ Local access failed"

# Test internal network access
INTERNAL_IP=$(hostname -I | cut -d' ' -f1)
echo ""
echo "🏢 Testing internal network access..."
echo "📍 Internal IP: $INTERNAL_IP"
curl -s http://$INTERNAL_IP:3000/ && echo "✅ Internal network access works" || echo "❌ Internal network access failed"

echo ""
echo "📱 Internal Network Access URLs:"
echo "- From any device on your network: http://$INTERNAL_IP:3000/"
echo "- API documentation: http://$INTERNAL_IP:3000/docs"
echo "- Health check: http://$INTERNAL_IP:3000/health"

# Test external access
echo ""
echo "🌐 Testing external access..."
echo "📍 Trying to access http://$PUBLIC_IP:3000/"
curl -s --connect-timeout 10 http://$PUBLIC_IP:3000/ && echo "✅ External access works" || echo "❌ External access failed (port forwarding may be needed)"

echo ""
echo "📋 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Troubleshooting Guide:"
echo "========================"
echo "1. If local access works but external doesn't:"
echo "   - Configure port forwarding on your router"
echo "   - Forward external port 3000 to internal IP $INTERNAL_IP:3000"
echo ""
echo "2. If internal network access fails:"
echo "   - Check firewall settings on the server"
echo "   - Ensure Docker is binding to all interfaces (0.0.0.0)"
echo ""
echo "3. If local access fails:"
echo "   - Check if containers are running: docker ps"
echo "   - Check container logs: docker compose logs"
echo ""
echo "🔗 Router Configuration:"
echo "- External Port: 3000"
echo "- Internal IP: $INTERNAL_IP"
echo "- Internal Port: 3000"
echo "- Protocol: TCP"
