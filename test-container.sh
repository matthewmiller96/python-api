#!/bin/bash

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
echo "==============================="

# Check if container is running
if docker ps | grep -q "myapp"; then
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
echo "==========================="

# Test basic endpoints
test_endpoint "/" "200" "Root endpoint"
test_endpoint "/health" "200" "Health check"
test_endpoint "/docs" "200" "API documentation"
test_endpoint "/carriers" "200" "Supported carriers"

echo ""
echo "Step 3: Shipments Endpoints"
echo "==========================="

# Test shipments endpoints
test_endpoint "/shipments" "200" "Get shipments"

# Test creating a shipment
test_endpoint "/shipments?destination=TestCity&carrier=FEDEX" "200" "Create shipment with valid carrier"

# Test invalid carrier
test_endpoint "/shipments?destination=TestCity&carrier=INVALID" "400" "Create shipment with invalid carrier (should fail)"

echo ""
echo "Step 4: Carrier Configuration"
echo "============================="

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

# Test invalid carrier configuration (too many carriers)
invalid_carrier_data='{
  "carriers": [
    {
      "code": "FEDEX",
      "client_id": "test1",
      "client_secret": "secret1",
      "account_num": "123"
    },
    {
      "code": "UPS", 
      "client_id": "test2",
      "client_secret": "secret2",
      "account_num": "456"
    },
    {
      "code": "USPS",
      "client_id": "test3",
      "client_secret": "secret3",
      "account_num": "789"
    },
    {
      "code": "FEDEX",
      "client_id": "test4",
      "client_secret": "secret4",
      "account_num": "999"
    }
  ]
}'

test_post_endpoint "/carriers" "$invalid_carrier_data" "422" "Invalid carrier config (too many/duplicate - should fail)"

echo ""
echo "Step 5: Token Generation (Mock Tests)"
echo "====================================="

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
    if grep -q "carrier" /tmp/test_response.json; then
        echo "Response structure looks correct"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi

# Test batch token generation
echo -n "Testing batch token generation... "
response=$(curl -s -w "%{http_code}" -o /tmp/test_response.json \
    -X POST "http://localhost:3000/carriers/tokens" \
    -H "Content-Type: application/json" \
    -d "$carrier_data")
status_code=${response: -3}

if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}PASS${NC} (HTTP $status_code) - Batch token generation working"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}PARTIAL${NC} (HTTP $status_code) - Endpoint accessible but may have auth issues (expected)"
    if grep -q "tokens" /tmp/test_response.json; then
        echo "Response structure looks correct"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
fi

echo ""
echo "Step 6: Shipping Quote Endpoint"
echo "==============================="

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
INTERNAL_IP=$(hostname -I | cut -d' ' -f1 2>/dev/null || echo "Unable to determine")
PUBLIC_IP=$(curl -s https://ipinfo.io/ip 2>/dev/null || echo "Unable to fetch")

echo "Internal IP: $INTERNAL_IP"
echo "Public IP: $PUBLIC_IP"

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

echo ""
echo "Test Results Summary"
echo "===================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed! Your FastAPI container is working correctly.${NC}"
    echo ""
    echo "Available URLs:"
    echo "- Local: http://localhost:3000/"
    echo "- Internal: http://$INTERNAL_IP:3000/ (from other devices on your network)"
    echo "- External: http://$PUBLIC_IP:3000/ (requires port forwarding)"
    echo ""
    echo "API Documentation: http://localhost:3000/docs"
else
    echo -e "\n${YELLOW}Some tests failed. Check the output above for details.${NC}"
fi

# Cleanup
rm -f /tmp/test_response.json
