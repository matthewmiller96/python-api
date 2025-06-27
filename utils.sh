#!/bin/bash

# Utility functions for Shipping API
# Usage: ./utils.sh [command] [options]

show_help() {
    echo "Shipping API Utilities"
    echo "======================"
    echo ""
    echo "Usage: ./utils.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  urls                    Show all access URLs"
    echo "  test-connectivity       Test network connectivity"
    echo "  test-api               Run comprehensive API tests"
    echo "  troubleshoot           Run troubleshooting diagnostics"
    echo "  status                 Show container and service status"
    echo "  logs [service]         Show logs for a service (api|frontend|all)"
    echo ""
    echo "Examples:"
    echo "  ./utils.sh urls"
    echo "  ./utils.sh test-connectivity"
    echo "  ./utils.sh troubleshoot"
    echo "  ./utils.sh logs api"
}

show_urls() {
    echo "Shipping API Access URLs"
    echo "========================"

    # Get IP addresses
    INTERNAL_IP=$(ifconfig | grep -E 'inet.*broadcast' | awk '{print $2}' | head -1 2>/dev/null || echo "Unable to determine")
    PUBLIC_IP=$(curl -s https://ipinfo.io/ip 2>/dev/null || echo "Unable to fetch")

    echo ""
    echo "Network Information:"
    echo "   Internal IP: $INTERNAL_IP"
    echo "   Public IP:   $PUBLIC_IP"

    echo ""
    echo "Local Access (from this server):"
    echo "   API:         http://localhost:3000/"
    echo "   API Docs:    http://localhost:3000/docs"
    echo "   Health:      http://localhost:3000/health"
    echo "   Frontend:    http://localhost/"

    echo ""
    echo "Internal Network Access (from any device on your network):"
    echo "   API:         http://$INTERNAL_IP:3000/"
    echo "   API Docs:    http://$INTERNAL_IP:3000/docs"
    echo "   Health:      http://$INTERNAL_IP:3000/health"
    echo "   Shipments:   http://$INTERNAL_IP:3000/shipments"
    echo "   Frontend:    http://$INTERNAL_IP/"

    echo ""
    echo "External Access (requires port forwarding):"
    if [[ "$PUBLIC_IP" != "Unable to fetch" ]]; then
        echo "   API:         http://$PUBLIC_IP:3000/"
        echo "   API Docs:    http://$PUBLIC_IP:3000/docs"
        echo "   Frontend:    http://$PUBLIC_IP/"
    else
        echo "   Check your internet connection to get public IP"
    fi

    echo ""
    echo "Quick Tests:"
    echo "   Test local:    curl http://localhost:3000/"
    echo "   Test internal: curl http://$INTERNAL_IP:3000/"
    if [[ "$PUBLIC_IP" != "Unable to fetch" ]]; then
        echo "   Test external: curl http://$PUBLIC_IP:3000/"
    fi
}

test_connectivity() {
    echo "Network Connectivity Test"
    echo "========================="

    # Get public IP
    PUBLIC_IP=$(curl -s https://ipinfo.io/ip)
    echo "Public IP: $PUBLIC_IP"

    # Test local access
    echo ""
    echo "Testing local access..."
    curl -s http://localhost:3000/ && echo "Local API access: OK" || echo "Local API access: FAILED"
    curl -s http://localhost/ && echo "Local frontend access: OK" || echo "Local frontend access: FAILED"

    # Test internal network access
    INTERNAL_IP=$(ifconfig | grep -E 'inet.*broadcast' | awk '{print $2}' | head -1 2>/dev/null || echo "Unable to determine")
    echo ""
    echo "Testing internal network access..."
    echo "Internal IP: $INTERNAL_IP"
    curl -s http://$INTERNAL_IP:3000/ && echo "Internal API access: OK" || echo "Internal API access: FAILED"
    curl -s http://$INTERNAL_IP/ && echo "Internal frontend access: OK" || echo "Internal frontend access: FAILED"

    # Test external access
    echo ""
    echo "Testing external access..."
    echo "Trying to access http://$PUBLIC_IP:3000/"
    curl -s --connect-timeout 10 http://$PUBLIC_IP:3000/ && echo "External API access: OK" || echo "External access: FAILED (port forwarding may be needed)"

    echo ""
    echo "Container Status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    echo ""
    echo "Troubleshooting Guide:"
    echo "======================"
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
    echo "   - Check logs: ./utils.sh logs"
}

test_api() {
    echo "FastAPI Container Test Suite"
    echo "============================"

    # Colors for output
    GREEN='\033[0;32m'
    RED='\033[0;31m'
    YELLOW='\033[1;33m'
    NC='\033[0m' # No Color

    # Test counter
    TESTS_PASSED=0
    TESTS_FAILED=0

    # Helper function to test endpoint
    test_endpoint() {
        local endpoint=$1
        local expected_status=$2
        local description=$3
        
        echo -n "Testing $description... "
        
        response=$(curl -s -w "%{http_code}" -o /tmp/test_response.json "http://localhost:3000$endpoint")
        status_code=${response: -3}
        
        if [ "$status_code" = "$expected_status" ]; then
            echo -e "${GREEN}PASS${NC} (HTTP $status_code)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}FAIL${NC} (HTTP $status_code, expected $expected_status)"
            echo "Response: $(cat /tmp/test_response.json)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    }

    # Test POST endpoint
    test_post_endpoint() {
        local endpoint=$1
        local data=$2
        local expected_status=$3
        local description=$4
        
        echo -n "Testing $description... "
        
        response=$(curl -s -w "%{http_code}" -o /tmp/test_response.json \
            -X POST "http://localhost:3000$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
        status_code=${response: -3}
        
        if [ "$status_code" = "$expected_status" ]; then
            echo -e "${GREEN}PASS${NC} (HTTP $status_code)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}FAIL${NC} (HTTP $status_code, expected $expected_status)"
            echo "Response: $(cat /tmp/test_response.json)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    }

    echo ""
    echo "Step 1: Container Status Check"
    echo "=============================="
    
    # Check if container is running
    if docker ps | grep -q -E "(shipping-api|api)"; then
        echo -e "${GREEN}Container is running${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}Container is not running${NC}"
        echo "Available containers:"
        docker ps
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    echo ""
    echo "Step 2: Basic API Endpoints"
    echo "=========================="
    
    # Basic tests
    test_endpoint "/" "200" "Root endpoint"
    test_endpoint "/health" "200" "Health check"
    test_endpoint "/docs" "200" "API documentation"
    test_endpoint "/carriers" "200" "Supported carriers"

    echo ""
    echo "Step 3: Shipments Endpoints"
    echo "=========================="
    
    test_endpoint "/shipments" "200" "Get shipments"
    test_endpoint "/locations" "200" "Get locations"

    # Test creating a shipment
    test_shipment_data='{
        "tracking_number": "TEST123",
        "carrier": "FedEx",
        "origin": "New York, NY",
        "destination": "Los Angeles, CA",
        "status": "in_transit"
    }'
    
    test_post_endpoint "/shipments" "$test_shipment_data" "201" "Create shipment"

    echo ""
    echo "Step 4: Carrier Configuration"
    echo "============================"

    # Test carrier configuration with valid data
    carrier_data='{
      "carriers": [
        {
          "code": "FEDEX",
          "client_id": "test_client_id",
          "client_secret": "test_client_secret",
          "account_num": "123456789"
        }
      ]
    }'

    test_post_endpoint "/carriers" "$carrier_data" "200" "Configure single carrier"

    # Test multiple carriers
    multi_carrier_data='{
      "carriers": [
        {
          "code": "FEDEX",
          "client_id": "test_fedex_id",
          "client_secret": "test_fedex_secret",
          "account_num": "123456789"
        },
        {
          "code": "UPS",
          "client_id": "test_ups_id",
          "client_secret": "test_ups_secret",
          "account_num": "987654321"
        }
      ]
    }'

    test_post_endpoint "/carriers" "$multi_carrier_data" "200" "Configure multiple carriers"

    echo ""
    echo "Step 5: Token Generation (Mock Tests)"
    echo "===================================="

    # Test single carrier token (will likely fail with real API but should return proper error structure)
    token_test_data='{
      "carrier_code": "FEDEX",
      "client_id": "test_client_id",
      "client_secret": "test_client_secret"
    }'

    echo -n "Testing single carrier token generation... "
    response=$(curl -s -w "%{http_code}" -o /tmp/test_response.json \
        -X POST "http://localhost:3000/carriers/test-token" \
        -H "Content-Type: application/json" \
        -d "$token_test_data")
    status_code=${response: -3}

    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $status_code) - Token generation endpoint working"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}PARTIAL${NC} (HTTP $status_code) - Endpoint accessible but may have auth issues (expected)"
        # Check if it's a proper error response
        if grep -q "carrier" /tmp/test_response.json 2>/dev/null; then
            echo "Response structure looks correct"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    fi

    echo ""
    echo "Step 6: Shipping Quote Endpoint"
    echo "=============================="

    # Test shipping quote
    quote_data='{
      "name": "John Doe",
      "add1": "123 Main St",
      "add2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "US",
      "phone": "555-123-4567"
    }'

    test_post_endpoint "/shipments/quote" "$quote_data" "200" "Get shipping quotes"

    echo ""
    echo "Step 7: Network Connectivity"
    echo "============================"

    # Get network info
    INTERNAL_IP=$(ifconfig | grep -E 'inet.*broadcast' | awk '{print $2}' | head -1 2>/dev/null || echo "Unable to determine")

    echo "Internal IP: $INTERNAL_IP"

    # Test internal network access if we have internal IP
    if [ "$INTERNAL_IP" != "Unable to determine" ]; then
        echo -n "Testing internal network access... "
        if curl -s --connect-timeout 5 "http://$INTERNAL_IP:3000/" > /dev/null; then
            echo -e "${GREEN}PASS${NC} - Accessible on internal network"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}FAIL${NC} - Not accessible on internal network"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    fi

    # Clean up
    rm -f /tmp/test_response.json

    echo ""
    echo "Test Summary:"
    echo "============="
    echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
    echo "Total tests: $((TESTS_PASSED + TESTS_FAILED))"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}All tests passed! Your FastAPI container is working correctly.${NC}"
        echo ""
        echo "Available URLs:"
        echo "- Local: http://localhost:3000/"
        if [ "$INTERNAL_IP" != "Unable to determine" ]; then
            echo "- Internal: http://$INTERNAL_IP:3000/ (from other devices on your network)"
        fi
        echo ""
        echo "API Documentation: http://localhost:3000/docs"
        return 0
    else
        echo -e "\n${YELLOW}Some tests failed. Check the output above for details.${NC}"
        return 1
    fi
}

troubleshoot() {
    echo "Shipping API Server Troubleshooting"
    echo "===================================="

    # Check if containers are running
    echo "Checking Docker containers..."
    docker ps | grep -E "(shipping-api|myapp)" || echo "No shipping-api containers found"

    # Check for orphaned containers
    echo ""
    echo "Checking for orphaned containers..."
    docker ps -a | grep -E "(api|frontend)" && echo "Found old containers - cleanup may be needed"

    # Check if ports are listening
    echo ""
    echo "Checking listening ports..."
    echo "Port 80 (Frontend):"
    netstat -tulpn | grep :80 || echo "Port 80 not listening"
    echo "Port 3000 (API):"
    netstat -tulpn | grep :3000 || echo "Port 3000 not listening"

    # Test endpoints
    echo ""
    echo "Testing endpoints..."
    curl -f http://localhost/ >/dev/null 2>&1 && echo "Frontend responding on localhost:80" || echo "Frontend not responding on localhost:80"
    curl -f http://localhost:3000/ >/dev/null 2>&1 && echo "API responding on localhost:3000" || echo "API not responding on localhost:3000"

    # Test external access
    INTERNAL_IP=$(ifconfig | grep -E 'inet.*broadcast' | awk '{print $2}' | head -1 2>/dev/null || echo "Unable to determine")
    echo ""
    echo "Testing external access..."
    curl -f http://$INTERNAL_IP/ >/dev/null 2>&1 && echo "Frontend accessible externally" || echo "Frontend not accessible externally"
    curl -f http://$INTERNAL_IP:3000/ >/dev/null 2>&1 && echo "API accessible externally" || echo "API not accessible externally"

    # Check firewall
    echo ""
    echo "Checking firewall status..."
    ufw status 2>/dev/null || iptables -L | head -20

    # Check docker logs
    echo ""
    echo "Container logs (last 20 lines)..."
    CONTAINER_ID=$(docker ps | grep -E "(shipping-api|api)" | awk '{print $1}' | head -1)
    if [ ! -z "$CONTAINER_ID" ]; then
        echo "Logs for container $CONTAINER_ID:"
        docker logs $CONTAINER_ID --tail 20
    else
        echo "No API container found"
    fi

    echo ""
    echo "Common Solutions:"
    echo "================="
    echo "1. Restart services: ./deploy.sh [environment]"
    echo "2. Check environment files: ls -la .env.*"
    echo "3. View full logs: docker-compose logs"
    echo "4. Clean rebuild: docker-compose down && docker-compose up -d --build"
}

show_status() {
    echo "Service Status"
    echo "=============="
    
    echo ""
    echo "Docker Containers:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "Docker Compose Services:"
    docker-compose ps
    
    echo ""
    echo "Quick Health Check:"
    curl -s http://localhost:3000/health 2>/dev/null | head -1 || echo "API health check failed"
    curl -s http://localhost/ >/dev/null 2>&1 && echo "Frontend: OK" || echo "Frontend: Not responding"
}

show_logs() {
    local service=${1:-"all"}
    
    case $service in
        "api")
            echo "API Logs:"
            docker-compose logs api
            ;;
        "frontend")
            echo "Frontend Logs:"
            docker-compose logs frontend
            ;;
        "all")
            echo "All Service Logs:"
            docker-compose logs
            ;;
        *)
            echo "Unknown service: $service"
            echo "Available services: api, frontend, all"
            return 1
            ;;
    esac
}

# Main script logic
case "${1:-help}" in
    "urls")
        show_urls
        ;;
    "test-connectivity")
        test_connectivity
        ;;
    "test-api")
        test_api
        ;;
    "troubleshoot")
        troubleshoot
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs $2
        ;;
    "help"|*)
        show_help
        ;;
esac
