# Carrier Configuration API Examples

This document shows how to use the new carrier configuration endpoints in your FastAPI application.

## Overview

Users can now configure authentication credentials for 1-3 shipping carriers:
- **FedEx** (`FEDEX`)
- **UPS** (`UPS`) 
- **USPS** (`USPS`)

## API Endpoints

### 1. Get Supported Carriers
```bash
GET /carriers
```

**Response:**
```json
{
  "supported_carriers": ["FEDEX", "UPS", "USPS"],
  "max_configurations": 3,
  "min_configurations": 1,
  "description": "You can configure 1-3 carrier authentication credentials"
}
```

### 2. Configure Carrier Credentials
```bash
POST /carriers
```

**Request Body Examples:**

**Single Carrier (FedEx):**
```json
{
  "carriers": [
    {
      "code": "FEDEX",
      "client_id": "your_fedex_client_id",
      "client_secret": "your_fedex_client_secret", 
      "account_num": "123456789"
    }
  ]
}
```

**Multiple Carriers (FedEx + UPS):**
```json
{
  "carriers": [
    {
      "code": "FEDEX",
      "client_id": "your_fedex_client_id",
      "client_secret": "your_fedex_client_secret",
      "account_num": "123456789"
    },
    {
      "code": "UPS", 
      "client_id": "your_ups_client_id",
      "client_secret": "your_ups_client_secret",
      "account_num": "987654321"
    }
  ]
}
```

**All Three Carriers:**
```json
{
  "carriers": [
    {
      "code": "FEDEX",
      "client_id": "your_fedex_client_id",
      "client_secret": "your_fedex_client_secret",
      "account_num": "123456789"
    },
    {
      "code": "UPS",
      "client_id": "your_ups_client_id", 
      "client_secret": "your_ups_client_secret",
      "account_num": "987654321"
    },
    {
      "code": "USPS",
      "client_id": "your_usps_client_id",
      "client_secret": "your_usps_client_secret", 
      "account_num": "555666777"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Carrier configurations saved successfully",
  "configured_carriers": [
    {
      "carrier": "FEDEX",
      "account_num": "123456789",
      "status": "configured"
    }
  ],
  "total_carriers": 1
}
```

### 3. Create Shipment (Updated)
```bash
POST /shipments
```

**Parameters:**
- `destination`: String - Destination address
- `carrier`: String - Must be "FEDEX", "UPS", or "USPS"

**Example:**
```bash
POST /shipments?destination=New%20York&carrier=FEDEX
```

### 4. Get Shipping Quotes (New)
```bash
POST /shipments/quote
```

**Request Body:**
```json
{
  "name": "John Doe",
  "add1": "123 Main St",
  "add2": "Apt 4B",
  "city": "New York",
  "state": "NY", 
  "zip": "10001",
  "country": "US",
  "phone": "555-123-4567"
}
```

**Response:**
```json
{
  "shipment_destination": "New York, NY 10001",
  "quotes": [
    {
      "carrier": "FEDEX",
      "service": "Ground",
      "estimated_cost": "$22.50",
      "estimated_days": "3-5 business days",
      "destination": "New York, NY"
    },
    {
      "carrier": "UPS", 
      "service": "Ground",
      "estimated_cost": "$22.50",
      "estimated_days": "3-5 business days",
      "destination": "New York, NY"
    },
    {
      "carrier": "USPS",
      "service": "Ground", 
      "estimated_cost": "$22.50",
      "estimated_days": "3-5 business days",
      "destination": "New York, NY"
    }
  ],
  "total_quotes": 3
}
```

## Validation Rules

### Carrier Configuration Validation:
- **Minimum carriers:** 1
- **Maximum carriers:** 3  
- **Allowed carrier codes:** FEDEX, UPS, USPS
- **No duplicates:** Each carrier can only be configured once
- **Required fields:** code, client_id, client_secret, account_num

### Error Examples:

**Too many carriers (4+):**
```json
{
  "detail": "You must submit between 1 and 3 carriers."
}
```

**Duplicate carriers:**
```json
{
  "detail": "Duplicate carrier codes are not allowed."
}
```

**Invalid carrier code:**
```json
{
  "detail": "Invalid carrier. Must be one of: FEDEX, UPS, USPS"
}
```

## Testing with curl

### Configure single carrier:
```bash
curl -X POST "http://localhost:3000/carriers" \
  -H "Content-Type: application/json" \
  -d '{
    "carriers": [
      {
        "code": "FEDEX",
        "client_id": "test_client_id", 
        "client_secret": "test_client_secret",
        "account_num": "123456789"
      }
    ]
  }'
```

### Get shipping quote:
```bash
curl -X POST "http://localhost:3000/shipments/quote" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "add1": "123 Main St", 
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US",
    "phone": "555-123-4567"
  }'
```

### Create shipment:
```bash
curl -X POST "http://localhost:3000/shipments?destination=New%20York&carrier=FEDEX"
```

## Next Steps

In a production environment, you would:

1. **Secure credential storage:** Store carrier credentials in encrypted database or secret management system
2. **Real API integration:** Connect to actual FedEx, UPS, and USPS APIs for live quotes
3. **Authentication:** Add user authentication to protect carrier configurations  
4. **Rate limiting:** Implement rate limiting for API calls
5. **Logging:** Add comprehensive logging for carrier API interactions
