"""
Enums used throughout the application.
"""
from enum import Enum

class CarrierCode(str, Enum):
    """Supported shipping carrier codes."""
    FEDEX = "FEDEX"
    UPS = "UPS" 
    USPS = "USPS"

class ShipmentStatus(str, Enum):
    """Shipment status options."""
    QUOTED = "QUOTED"
    BOOKED = "BOOKED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
