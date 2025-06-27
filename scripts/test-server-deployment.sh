#!/bin/bash

# Server Deployment Test Script
# This script will help you test the deployment on your server

SERVER_IP="your-server-ip"  # Replace with your actual server IP
SERVER_USER="your-username"  # Replace with your server username
REPO_PATH="/path/to/your/project"  # Replace with your server project path

echo "=== Server Deployment Test Script ==="
echo ""

if [ "$1" = "local" ]; then
    echo "Running local server simulation test..."
    echo ""
    
    # Stop current containers
    echo "1. Stopping existing containers..."
    ./deploy.sh development
    sleep 5
    
    # Test connectivity
    echo "2. Testing connectivity..."
    ./utils.sh test-connectivity
    
    # Test API functionality
    echo "3. Testing API functionality..."
    ./utils.sh test-api
    
    echo ""
    echo "Local test complete. Ready for server deployment."
    echo ""
    echo "To deploy on server, run:"
    echo "  $0 server"
    echo ""
    
elif [ "$1" = "server" ]; then
    echo "This will connect to your server and run the deployment."
    echo ""
    echo "Make sure to update the server details at the top of this script:"
    echo "  SERVER_IP: $SERVER_IP"
    echo "  SERVER_USER: $SERVER_USER" 
    echo "  REPO_PATH: $REPO_PATH"
    echo ""
    echo "Server deployment commands:"
    echo ""
    echo "ssh $SERVER_USER@$SERVER_IP << 'EOF'"
    echo "cd $REPO_PATH"
    echo "git pull origin main"
    echo "./deploy.sh production"
    echo "./utils.sh status"
    echo "./utils.sh test-connectivity"
    echo "EOF"
    echo ""
    echo "Copy and run the above commands on your server."
    
elif [ "$1" = "help" ]; then
    echo "Usage: $0 [local|server|help]"
    echo ""
    echo "  local   - Test deployment locally before server deployment"
    echo "  server  - Show server deployment commands"
    echo "  help    - Show this help message"
    echo ""
    
else
    echo "Usage: $0 [local|server|help]"
    echo ""
    echo "Options:"
    echo "  local   - Test deployment locally first"
    echo "  server  - Show server deployment commands"
    echo "  help    - Show help message"
    echo ""
    echo "Recommended workflow:"
    echo "  1. Run '$0 local' to test locally"
    echo "  2. Run '$0 server' to get server commands"
    echo "  3. Update server details in this script"
    echo "  4. Deploy on your server"
fi
