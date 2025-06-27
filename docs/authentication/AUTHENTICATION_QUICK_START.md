# Authentication Quick Start Guide

Your FastAPI application is already equipped with a complete user authentication system! Here's how to use it:

## Quick Start for Users

### 1. Register a New Account
```bash
curl -X POST "http://localhost:3000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "email": "your_email@company.com",
    "password": "your_secure_password",
    "full_name": "Your Full Name"
  }'
```

### 2. Login to Get Access Token
```bash
curl -X POST "http://localhost:3000/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=your_username&password=your_secure_password"
```

**Response:** You'll get a JWT token like:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### 3. Add Your Shipping Locations
```bash
curl -X POST "http://localhost:3000/user/locations" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Warehouse",
    "company_name": "Your Company",
    "address_line1": "123 Business St",
    "city": "Atlanta",
    "state": "GA",
    "zip_code": "30309",
    "country": "US",
    "phone": "404-555-0100",
    "is_default": true
  }'
```

### 4. Add Carrier Credentials

#### For FedEx:
```bash
curl -X POST "http://localhost:3000/user/carriers" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "carrier_code": "FEDEX",
    "client_id": "your_fedex_client_id",
    "client_secret": "your_fedex_client_secret",
    "account_number": "123456789",
    "description": "Production FedEx Account"
  }'
```

#### For UPS:
```bash
curl -X POST "http://localhost:3000/user/carriers" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "carrier_code": "UPS",
    "client_id": "your_ups_client_id",
    "client_secret": "your_ups_client_secret",
    "account_number": "987654321",
    "description": "Production UPS Account"
  }'
```

#### For USPS:
```bash
curl -X POST "http://localhost:3000/user/carriers" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "carrier_code": "USPS",
    "client_id": "your_usps_client_id",
    "client_secret": "your_usps_client_secret",
    "account_number": "555666777",
    "description": "Production USPS Account"
  }'
```

### 5. Test Your Carrier Tokens
```bash
curl -X POST "http://localhost:3000/user/carriers/test-tokens" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📱 For Frontend Applications

### JavaScript/React Example:
```javascript
// Login and store token
const login = async (username, password) => {
  const response = await fetch('/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${username}&password=${password}`
  });
  const { access_token } = await response.json();
  localStorage.setItem('authToken', access_token);
  return access_token;
};

// Use token for authenticated requests
const getLocations = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('/user/locations', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## Security Features

- **JWT Token Authentication** - Secure, stateless authentication  
- **Password Hashing** - Bcrypt encryption for passwords  
- **Token Expiration** - Tokens expire after 30 minutes (configurable)  
- **Credential Masking** - Client secrets are masked in responses  
- **User Data Isolation** - Users can only access their own data  
- **Input Validation** - All endpoints validate input data  

## What Users Can Manage

### Origin Locations
- Multiple shipping addresses per user
- Company information
- Default location settings
- Full CRUD operations (Create, Read, Update, Delete)

### Carrier Credentials  
- FedEx, UPS, and USPS credentials
- Multiple accounts per carrier
- Account descriptions and metadata
- OAuth2 token generation

### Bearer Tokens
- Automatic token generation for all carriers
- Comprehensive error handling
- Sandbox/testing environment support

## API Documentation

Visit `http://localhost:3000/docs` for interactive API documentation with:
- All available endpoints
- Request/response examples
- Authentication requirements
- Try-it-now functionality

## Common Workflows

### New User Setup:
1. Register account
2. Login to get token
3. Add shipping locations
4. Add carrier credentials
5. Test token generation

### Daily Usage:
1. Login to refresh token
2. Generate carrier tokens as needed
3. Use tokens for shipping APIs
4. Add new locations/carriers as needed

Your authentication system is production-ready and supports all the features needed for a multi-user, multi-carrier shipping application!
