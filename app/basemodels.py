from pydantic import BaseModel, validator, Field
from typing import Optional, List
from enum import Enum

class CarrierCode(str, Enum):
    FEDEX = "FEDEX"
    UPS = "UPS"
    USPS = "USPS"

class carrierAuth(BaseModel):
    code: CarrierCode
    client_id: str
    client_secret: str
    account_num: str

class carriersSubmission(BaseModel):
    carriers: List[carrierAuth] = Field(..., min_items=1, max_items=3, description="Submit 1-3 carrier configurations")

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
                raise ValueError(f"Unsupported carrier code: {carrier.code}. Supported carriers: FEDEX, UPS, USPS")
        
        return v

class shipment(BaseModel):
    name: str
    add1: str
    add2: Optional[str] = None
    city: str
    state: str
    zip: str
    country: str
    phone: str