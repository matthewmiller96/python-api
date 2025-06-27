"""
User-related SQLAlchemy models.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relationships
    origin_locations = relationship("OriginLocation", back_populates="user", cascade="all, delete-orphan")
    carrier_credentials = relationship("CarrierCredentials", back_populates="user", cascade="all, delete-orphan")
    shipments = relationship("UserShipment", back_populates="user", cascade="all, delete-orphan")

class OriginLocation(Base):
    __tablename__ = "origin_locations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    company_name = Column(String(100), nullable=True)
    address_line1 = Column(String(200), nullable=False)
    address_line2 = Column(String(200), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    zip_code = Column(String(20), nullable=False)
    country = Column(String(10), default="US")
    phone = Column(String(20), nullable=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relationships
    user = relationship("User", back_populates="origin_locations")
    shipments = relationship("UserShipment", back_populates="origin_location")

class CarrierCredentials(Base):
    __tablename__ = "carrier_credentials"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    carrier_code = Column(String(10), nullable=False)  # FEDEX, UPS, USPS
    client_id = Column(String(255), nullable=False)
    client_secret = Column(Text, nullable=False)  # This should be encrypted in production
    account_number = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    description = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Relationships
    user = relationship("User", back_populates="carrier_credentials")
