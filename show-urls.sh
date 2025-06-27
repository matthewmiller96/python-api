#!/bin/bash

echo "🔗 FastAPI Access URLs"
echo "====================="

# Get IP addresses
INTERNAL_IP=$(hostname -I | cut -d' ' -f1)
PUBLIC_IP=$(curl -s https://ipinfo.io/ip 2>/dev/null || echo "Unable to fetch")

echo ""
echo "📍 Network Information:"
echo "   Internal IP: $INTERNAL_IP"
echo "   Public IP:   $PUBLIC_IP"

echo ""
echo "🏠 Local Access (from this server):"
echo "   http://localhost:3000/"
echo "   http://localhost:3000/docs"
echo "   http://localhost:3000/health"

echo ""
echo "🏢 Internal Network Access (from any device on your network):"
echo "   http://$INTERNAL_IP:3000/"
echo "   http://$INTERNAL_IP:3000/docs"
echo "   http://$INTERNAL_IP:3000/health"
echo "   http://$INTERNAL_IP:3000/shipments"

echo ""
echo "🌐 External Access (requires port forwarding):"
if [[ "$PUBLIC_IP" != "Unable to fetch" ]]; then
    echo "   http://$PUBLIC_IP:3000/"
    echo "   http://$PUBLIC_IP:3000/docs"
    echo "   http://$PUBLIC_IP:3000/health"
else
    echo "   Check your internet connection to get public IP"
fi

echo ""
echo "📱 QR Code for Mobile Access:"
echo "   Generate QR code for: http://$INTERNAL_IP:3000/"

echo ""
echo "🔧 Quick Tests:"
echo "   Test local:    curl http://localhost:3000/"
echo "   Test internal: curl http://$INTERNAL_IP:3000/"
if [[ "$PUBLIC_IP" != "Unable to fetch" ]]; then
    echo "   Test external: curl http://$PUBLIC_IP:3000/"
fi
