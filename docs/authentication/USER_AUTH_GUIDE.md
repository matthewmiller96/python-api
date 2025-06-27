# User Authentication System Guide

This guide explains the comprehensive user authentication system implemented in your FastAPI Shipments API, including user registration, login, profile management, origin locations, and carrier credentials storage.

## Overview

The authentication system provides:
- JWT-based user authentication
- User registration and login
- Multiple origin location management per user
- Secure carrier credentials storage per user
- User-specific shipment history
- Role-based access control

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `full_name` - Optional full name
- `hashed_password` - Bcrypt hashed password
- `is_active` - Account status
- `created_at`, `updated_at` - Timestamps

### Origin Locations Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `name` - Location name (e.g., "Main Warehouse")
- `company_name` - Optional company name
- `address_line1`, `address_line2` - Address
- `city`, `state`, `zip_code`, `country` - Location details
- `phone` - Optional phone number
- `is_default` - Whether this is the default location
- `created_at`, `updated_at` - Timestamps

### Carrier Credentials Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `carrier_code` - FEDEX, UPS, or USPS
- `client_id` - Carrier API client ID
- `client_secret` - Carrier API client secret (encrypted in production)
- `account_number` - Carrier account number
- `is_active` - Whether credentials are active
- `description` - Optional description
- `created_at`, `updated_at` - Timestamps

## API Endpoints

### Authentication Endpoints

#### Register User
```bash
POST /auth/register
```
**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2025-06-27T12:00:00"
}
```

#### Login User
```bash
POST /auth/token
```
**Request (Form Data):**
```
username=john_doe
password=securepassword123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Get User Profile
```bash
GET /auth/profile
Authorization: Bearer {token}
```

#### Update Password
```bash
PUT /auth/password
Authorization: Bearer {token}
```
**Request:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

### Origin Locations Management

#### Get User Locations
```bash
GET /user/locations
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "Main Warehouse",
    "company_name": "ACME Corp",
    "address_line1": "123 Industrial Blvd",
    "address_line2": "Suite 100",
    "city": "Atlanta",
    "state": "GA",
    "zip_code": "30309",
    "country": "US",
    "phone": "404-555-0100",
    "is_default": true,
    "created_at": "2025-06-27T12:00:00"
  }
]
```

#### Create Origin Location
```bash
POST /user/locations
Authorization: Bearer {token}
```
**Request:**
```json
{
  "name": "West Coast Warehouse",
  "company_name": "ACME Corp",
  "address_line1": "456 Pacific Ave",
  "city": "Los Angeles",
  "state": "CA",
  "zip_code": "90210",
  "country": "US",
  "phone": "310-555-0200",
  "is_default": false
}
```

#### Update Origin Location
```bash
PUT /user/locations/{location_id}
Authorization: Bearer {token}
```

#### Delete Origin Location
```bash
DELETE /user/locations/{location_id}
Authorization: Bearer {token}
```

### Carrier Credentials Management

#### Get User Carrier Credentials
```bash
GET /user/carriers
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "carrier_code": "FEDEX",
    "client_id": "your_fedex_client_id",
    "client_secret_masked": "****cret",
    "account_number": "123456789",
    "is_active": true,
    "description": "Production FedEx Account",
    "created_at": "2025-06-27T12:00:00",
    "updated_at": "2025-06-27T12:00:00"
  }
]
```

#### Create/Update Carrier Credentials
```bash
POST /user/carriers
Authorization: Bearer {token}
```
**Request:**
```json
{
  "carrier_code": "FEDEX",
  "client_id": "your_fedex_client_id",
  "client_secret": "your_fedex_client_secret",
  "account_number": "123456789",
  "is_active": true,
  "description": "Production FedEx Account"
}
```

#### Update Carrier Credentials
```bash
PUT /user/carriers/{carrier_code}
Authorization: Bearer {token}
```

#### Delete Carrier Credentials
```bash
DELETE /user/carriers/{carrier_code}
Authorization: Bearer {token}
```

#### Test User's Carrier Tokens
```bash
POST /user/carriers/test-tokens
Authorization: Bearer {token}
```

This endpoint tests token generation for all of the user's active carrier credentials.

## Usage Examples

### 1. Complete User Setup Flow

```bash
# 1. Register a new user
curl -X POST "http://localhost:3000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "shipper1",
    "email": "shipper1@company.com",
    "password": "securepass123",
    "full_name": "John Shipper"
  }'

# 2. Login to get token
curl -X POST "http://localhost:3000/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=shipper1&password=securepass123"

# 3. Create origin location (using token from step 2)
curl -X POST "http://localhost:3000/user/locations" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Warehouse",
    "company_name": "My Company",
    "address_line1": "123 Business St",
    "city": "Atlanta",
    "state": "GA",
    "zip_code": "30309",
    "country": "US",
    "is_default": true
  }'

# 4. Add carrier credentials
curl -X POST "http://localhost:3000/user/carriers" \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "carrier_code": "FEDEX",
    "client_id": "your_fedex_test_id",
    "client_secret": "your_fedex_test_secret",
    "account_number": "123456789",
    "description": "Test FedEx Account"
  }'

# 5. Test carrier tokens
curl -X POST "http://localhost:3000/user/carriers/test-tokens" \
  -H "Authorization: Bearer {your_token}"
```

### 2. Frontend Integration

For web applications, store the JWT token and include it in all authenticated requests:

```javascript
// Login
const loginResponse = await fetch('/auth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: 'username=user&password=pass'
});

const { access_token } = await loginResponse.json();
localStorage.setItem('token', access_token);

// Make authenticated requests
const response = await fetch('/user/locations', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt
- Minimum 8 character requirement
- Password update requires current password verification

### JWT Token Security
- Tokens expire after 30 minutes (configurable)
- Tokens include user identification
- Secure token validation on all protected endpoints

### Data Protection
- Client secrets are masked in API responses (only last 4 characters shown)
- User data is isolated (users can only access their own data)
- Input validation on all endpoints

## Production Considerations

### 1. Environment Variables
```bash
# Set secure values in production
SECRET_KEY=your-very-secure-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://user:pass@localhost/shipments
```

### 2. Credential Encryption
The current implementation stores carrier client secrets in plain text. For production:

```python
# Add encryption for sensitive data
from cryptography.fernet import Fernet

class EncryptedCarrierCredentials:
    def __init__(self, encryption_key: str):
        self.fernet = Fernet(encryption_key.encode())
    
    def encrypt_secret(self, secret: str) -> str:
        return self.fernet.encrypt(secret.encode()).decode()
    
    def decrypt_secret(self, encrypted_secret: str) -> str:
        return self.fernet.decrypt(encrypted_secret.encode()).decode()
```

### 3. Database Security
- Use PostgreSQL or MySQL instead of SQLite for production
- Enable database connection encryption
- Implement database backups and point-in-time recovery

### 4. Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/auth/token")
@limiter.limit("5/minute")
def login_user(request: Request, ...):
    # Login logic
```

## Migration from Non-Authenticated System

To migrate existing shipments to the new user system:

1. Create a migration script
2. Add a default user for existing data
3. Associate existing shipments with the default user
4. Gradually migrate users to individual accounts

## Testing the Authentication System

Use the updated test script to verify all authentication features work correctly:

```bash
# The test script will now include:
# - User registration
# - Login and token verification
# - Origin location management
# - Carrier credentials management
# - Token-based API access
```

Your FastAPI application now has a complete multi-user authentication system with secure credential storage and user-specific data management!
