#!/bin/bash

# Shipping API Frontend Deployment Script
# Usage: ./deploy.sh [server-ip] [user]

SERVER_IP=${1:-"your-server-ip"}
USER=${2:-"root"}

echo "🚀 Deploying Shipping API Frontend..."
echo "Server: $USER@$SERVER_IP"

# Build the frontend
echo "📦 Building production version..."
npm run build

# Create deployment package
echo "📁 Creating deployment package..."
tar -czf frontend-build.tar.gz -C build .

# Copy to server
echo "📤 Uploading to server..."
scp frontend-build.tar.gz $USER@$SERVER_IP:/tmp/

# Deploy on server
echo "🔧 Deploying on server..."
ssh $USER@$SERVER_IP << 'ENDSSH'
    # Create directory
    sudo mkdir -p /var/www/shipping-frontend
    
    # Extract files
    cd /tmp
    sudo tar -xzf frontend-build.tar.gz -C /var/www/shipping-frontend/
    
    # Set permissions
    sudo chown -R www-data:www-data /var/www/shipping-frontend
    
    # Clean up
    rm frontend-build.tar.gz
    
    echo "✅ Frontend deployed to /var/www/shipping-frontend"
ENDSSH

# Clean up local files
rm frontend-build.tar.gz

echo "🎉 Deployment complete!"
echo "📋 Next steps:"
echo "   1. Configure Nginx on your server"
echo "   2. Update your backend CORS settings"
echo "   3. Access your frontend at http://$SERVER_IP"
