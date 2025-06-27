"""
Shipment-related SQLAlchemy models.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.enums import ShipmentStatus

class UserShipment(Base):
    """
    Represents a shipment associated with a user, including origin, destination, quotes, and status.
    """
    __tablename__ = "user_shipments"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False)
    origin_location_id: int = Column(Integer, ForeignKey("origin_locations.id"), nullable=False)
    destination_data: str = Column(Text, nullable=False)  # JSON string of destination info
    quotes_data: str | None = Column(Text, nullable=True)  # JSON string of quotes
    selected_carrier: str | None = Column(String(10), nullable=True)
    tracking_number: str | None = Column(String(100), nullable=True)
    status: str = Column(String(50), default=ShipmentStatus.QUOTED.value)  # Use enum for status
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="shipments")
    origin_location = relationship("OriginLocation", back_populates="shipments")

class Shipment(Base):
    """
    Represents a generic shipment record.
    """
    __tablename__ = "shipments"

    id: int = Column(Integer, primary_key=True, index=True)
    destination: str = Column(String, index=True)
    carrier: str = Column(String)
