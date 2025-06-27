"""
Pydantic schemas for API request/response models.
"""
from pydantic import BaseModel, validator, Field
from typing import Optional, List
from app.core.enums import CarrierCode

class CarrierAuth(BaseModel):
    """Carrier authentication credentials."""
    code: CarrierCode
    client_id: str
    client_secret: str
    account_num: Optional[str] = None

class CarriersSubmission(BaseModel):
    """Multiple carrier credentials submission."""
    carriers: List[CarrierAuth] = Field(
        ..., 
        min_items=1, 
        max_items=3, 
        description="Submit 1-3 carrier configurations"
    )

    @validator('carriers')
    def validate_carriers(cls, v):
        if not (1 <= len(v) <= 3):
            raise ValueError("You must submit between 1 and 3 carriers.")
        
        # Check for duplicate carrier codes
        carrier_codes = [carrier.code for carrier in v]
        if len(carrier_codes) != len(set(carrier_codes)):
            raise ValueError("Duplicate carrier codes are not allowed.")
        
        # Validate that all codes are supported
        supported_codes = {CarrierCode.FEDEX, CarrierCode.UPS, CarrierCode.USPS}
        for carrier in v:
            if carrier.code not in supported_codes:
                raise ValueError(
                    f"Unsupported carrier code: {carrier.code}. "
                    f"Supported carriers: {', '.join([c.value for c in supported_codes])}"
                )
        
        return v

class ShipmentRequest(BaseModel):
    """Shipment request schema."""
    name: str
    address_line1: str = Field(..., alias="add1")
    address_line2: Optional[str] = Field(None, alias="add2")
    city: str
    state: str
    zip_code: str = Field(..., alias="zip")
    country: str = "US"
    phone: str

    class Config:
        populate_by_name = True  # Updated for Pydantic v2
