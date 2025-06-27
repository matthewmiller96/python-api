# Bearer Token Generation Guide

This guide explains how to use the bearer token generation features in your FastAPI application for FedEx, UPS, and USPS carrier authentication.

## Overview

The application now includes robust bearer token generation functionality that:
- Generates OAuth2 tokens for FedEx, UPS, and USPS
- Handles different authentication methods per carrier
- Provides comprehensive error handling
- Supports batch token generation for multiple carriers
- Includes security features (token preview, no full token exposure)

## Available Functions

### Core Functions (in `helperfuntions.py`)

1. **`generate_bearer_token()`** - Generate token for single carrier
2. **`generate_fedex_token()`** - FedEx-specific token generation  
3. **`generate_ups_token()`** - UPS-specific token generation
4. **`generate_usps_token()`** - USPS-specific token generation
5. **`generate_tokens_for_carriers()`** - Batch token generation

## API Endpoints

### 1. Test Single Carrier Token
```bash
POST /carriers/test-token
```

**Parameters:**
- `carrier_code`: "FEDEX", "UPS", or "USPS"
- `client_id`: Your carrier client ID
- `client_secret`: Your carrier client secret  
- `account_num`: Account number (optional)

**Example:**
```bash
curl -X POST "http://localhost:3000/carriers/test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "carrier_code": "FEDEX",
    "client_id": "your_fedex_client_id",
    "client_secret": "your_fedex_client_secret",
    "account_num": "123456789"
  }'
```

**Response:**
```json
{
  "message": "Token test for FEDEX completed",
  "result": {
    "carrier": "FEDEX",
    "success": true,
    "token_type": "Bearer",
    "expires_in": 3600,
    "scope": "CXS",
    "token_preview": "eyJhbGciOiJSUzI1NiIs..."
  }
}
```

### 2. Generate Tokens for Multiple Carriers
```bash
POST /carriers/tokens
```

**Request Body:**
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

**Response:**
```json
{
  "message": "Token generation completed: 2 successful, 0 failed",
  "results": {
    "tokens": [
      {
        "carrier": "FEDEX",
        "success": true,
        "access_token": "eyJhbGciOiJSUzI1NiIs...",
        "token_type": "Bearer",
        "expires_in": 3600
      },
      {
        "carrier": "UPS", 
        "success": true,
        "access_token": "eyJhbGciOiJSUzI1NiIs...",
        "token_type": "Bearer",
        "expires_in": 3600
      }
    ],
    "successful": 2,
    "failed": 0,
    "summary": {
      "FEDEX": {"success": true, "has_token": true},
      "UPS": {"success": true, "has_token": true}
    }
  }
}
```

### 3. Configure Carriers with Token Test
```bash
POST /carriers?test_tokens=true
```

This endpoint now supports an optional `test_tokens` parameter that will test token generation when configuring carriers.

## Carrier-Specific Implementation Details

### FedEx Authentication
- **URL:** `https://apis-sandbox.fedex.com/oauth/token`
- **Method:** OAuth2 Client Credentials
- **Headers:** `Content-Type: application/x-www-form-urlencoded`
- **Environment:** Sandbox/Testing

**Request Format:**
```
grant_type=client_credentials&client_id=XXX&client_secret=XXX
```

### UPS Authentication  
- **URL:** `https://wwwcie.ups.com/security/v1/oauth/token`
- **Method:** OAuth2 with Basic Auth Header
- **Headers:** `Authorization: Basic [base64(client_id:client_secret)]`
- **Environment:** Testing

**Request Format:**
```
Authorization: Basic [encoded_credentials]
Content-Type: application/x-www-form-urlencoded
grant_type=client_credentials
```

### USPS Authentication
- **URL:** `https://apis-tem.usps.com/oauth2/v3/token`
- **Method:** OAuth2 Client Credentials (JSON)
- **Headers:** `Content-Type: application/json`
- **Environment:** Testing

**Request Format:**
```json
{
  "grant_type": "client_credentials",
  "client_id": "XXX",
  "client_secret": "XXX"
}
```

## Error Handling

The functions provide comprehensive error handling:

### Success Response Format:
```json
{
  "carrier": "FEDEX",
  "success": true,
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "CXS",
  "raw_response": {...}
}
```

### Error Response Format:
```json
{
  "carrier": "FEDEX",
  "success": false,
  "error": "401 Unauthorized: Invalid client credentials",
  "error_type": "request_error"
}
```

### Common Error Types:
- **`request_error`** - HTTP request failed (network, authentication, etc.)
- **`json_error`** - Invalid JSON response from carrier
- **`validation_error`** - Invalid input parameters

## Testing Examples

### Test FedEx Token:
```bash
curl -X POST "http://localhost:3000/carriers/test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "carrier_code": "FEDEX",
    "client_id": "test_client_id",
    "client_secret": "test_client_secret"
  }'
```

### Test All Carriers:
```bash
curl -X POST "http://localhost:3000/carriers/tokens" \
  -H "Content-Type: application/json" \
  -d '{
    "carriers": [
      {"code": "FEDEX", "client_id": "test1", "client_secret": "secret1", "account_num": "123"},
      {"code": "UPS", "client_id": "test2", "client_secret": "secret2", "account_num": "456"},
      {"code": "USPS", "client_id": "test3", "client_secret": "secret3", "account_num": "789"}
    ]
  }'
```

## Security Considerations

1. **Token Storage**: Store tokens securely, never log full tokens
2. **Token Expiry**: Implement token refresh logic (typically 1-3 hours)
3. **Rate Limiting**: Respect carrier API rate limits
4. **Credentials**: Store client secrets encrypted in production
5. **HTTPS**: Always use HTTPS in production

## Production Configuration

### Testing URLs:
Update the helper functions to use testing URLs:

```python
# Testing URLs (currently configured)
FEDEX_TOKEN_URL = "https://apis-sandbox.fedex.com/oauth/token"
UPS_TOKEN_URL = "https://wwwcie.ups.com/security/v1/oauth/token"  
USPS_TOKEN_URL = "https://apis-tem.usps.com/oauth2/v3/token"
```

### Environment Variables:
```bash
# Set environment for testing
CARRIER_ENVIRONMENT=testing

# Testing URLs (currently configured)
FEDEX_TOKEN_URL=https://apis-sandbox.fedex.com/oauth/token
UPS_TOKEN_URL=https://wwwcie.ups.com/security/v1/oauth/token
USPS_TOKEN_URL=https://apis-tem.usps.com/oauth2/v3/token
```

## Next Steps

1. **Token Caching**: Implement Redis/database caching for tokens
2. **Auto-Refresh**: Add automatic token refresh logic
3. **Rate Limiting**: Add rate limiting for token requests
4. **Monitoring**: Add logging and monitoring for token generation
5. **Integration**: Use tokens for actual shipping API calls
