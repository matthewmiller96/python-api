"""
Base SQLAlchemy model and exports for backward compatibility.
"""
# Re-export from new locations for backward compatibility
from app.core.database import Base, SessionLocal, engine, get_db, create_tables
from app.core.enums import CarrierCode, ShipmentStatus
from app.schemas import CarrierAuth, CarriersSubmission, ShipmentRequest

# Backward compatibility aliases
carrierAuth = CarrierAuth
carriersSubmission = CarriersSubmission  
shipment = ShipmentRequest
