from pydantic import BaseModel, validator, Field, EmailStr
from typing import Optional, List
from enum import Enum
from app.basemodels import CarrierCode, shipment

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: str

class OriginLocation(BaseModel):
    name: str = Field(..., description="Location name (e.g., 'Main Warehouse')")
    company_name: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    zip_code: str
    country: str = "US"
    phone: Optional[str] = None
    is_default: bool = False

class OriginLocationResponse(OriginLocation):
    id: int
    user_id: int
    created_at: str

class OriginLocationUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    is_default: Optional[bool] = None

class UserCarrierCredentials(BaseModel):
    carrier_code: CarrierCode
    client_id: str = Field(..., description="Carrier API client ID")
    client_secret: str = Field(..., description="Carrier API client secret")
    account_number: str = Field(..., description="Carrier account number")
    is_active: bool = True
    description: Optional[str] = None

class UserCarrierCredentialsResponse(BaseModel):
    id: int
    user_id: int
    carrier_code: str
    client_id: str
    client_secret_masked: str  # Only show last 4 characters
    account_number: str
    is_active: bool
    description: Optional[str] = None
    created_at: str
    updated_at: str

class UserCarrierCredentialsUpdate(BaseModel):
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    account_number: Optional[str] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None

class UserShipmentRequest(BaseModel):
    origin_location_id: Optional[int] = None  # If None, use default location
    destination: shipment
    carrier_preference: Optional[List[CarrierCode]] = None  # If None, use all configured carriers
    service_type: Optional[str] = "GROUND"
    
class UserShipmentResponse(BaseModel):
    id: int
    user_id: int
    origin_location: OriginLocationResponse
    destination: dict
    quotes: List[dict]
    selected_carrier: Optional[str] = None
    tracking_number: Optional[str] = None
    status: str
    created_at: str

class UpdatePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
