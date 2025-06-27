from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from app.models import User, OriginLocation, CarrierCredentials, UserShipment
from app.core.auth_models import (
    OriginLocation as OriginLocationSchema,
    OriginLocationUpdate,
    UserCarrierCredentials,
    UserCarrierCredentialsUpdate
)
from app.core.enums import CarrierCode
import json
from datetime import datetime

def get_user_origin_locations(db: Session, user_id: int) -> List[OriginLocation]:
    """Get all origin locations for a user."""
    return db.query(OriginLocation).filter(OriginLocation.user_id == user_id).all()

def get_user_origin_location(db: Session, user_id: int, location_id: int) -> Optional[OriginLocation]:
    """Get a specific origin location for a user."""
    return db.query(OriginLocation).filter(
        and_(OriginLocation.user_id == user_id, OriginLocation.id == location_id)
    ).first()

def create_origin_location(db: Session, user_id: int, location: OriginLocationSchema) -> OriginLocation:
    """Create a new origin location for a user."""
    # If this is set as default, unset all other defaults for this user
    if location.is_default:
        db.query(OriginLocation).filter(OriginLocation.user_id == user_id).update(
            {"is_default": False}
        )
    
    # If this is the first location, make it default
    existing_count = db.query(OriginLocation).filter(OriginLocation.user_id == user_id).count()
    if existing_count == 0:
        location.is_default = True
    
    db_location = OriginLocation(
        user_id=user_id,
        name=location.name,
        company_name=location.company_name,
        address_line1=location.address_line1,
        address_line2=location.address_line2,
        city=location.city,
        state=location.state,
        zip_code=location.zip_code,
        country=location.country,
        phone=location.phone,
        is_default=location.is_default
    )
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

def update_origin_location(
    db: Session, 
    user_id: int, 
    location_id: int, 
    location_update: OriginLocationUpdate
) -> Optional[OriginLocation]:
    """Update an origin location for a user."""
    db_location = get_user_origin_location(db, user_id, location_id)
    if not db_location:
        return None
    
    update_data = location_update.dict(exclude_unset=True)
    
    # If setting as default, unset all other defaults
    if update_data.get("is_default", False):
        db.query(OriginLocation).filter(
            and_(OriginLocation.user_id == user_id, OriginLocation.id != location_id)
        ).update({"is_default": False})
    
    for field, value in update_data.items():
        setattr(db_location, field, value)
    
    db_location.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_location)
    return db_location

def delete_origin_location(db: Session, user_id: int, location_id: int) -> bool:
    """Delete an origin location for a user."""
    db_location = get_user_origin_location(db, user_id, location_id)
    if not db_location:
        return False
    
    was_default = db_location.is_default
    db.delete(db_location)
    db.commit()
    
    # If we deleted the default location, set another one as default
    if was_default:
        remaining_location = db.query(OriginLocation).filter(
            OriginLocation.user_id == user_id
        ).first()
        if remaining_location:
            remaining_location.is_default = True
            db.commit()
    
    return True

def get_user_carrier_credentials(db: Session, user_id: int) -> List[CarrierCredentials]:
    """Get all carrier credentials for a user."""
    return db.query(CarrierCredentials).filter(CarrierCredentials.user_id == user_id).all()

def get_user_carrier_credential(
    db: Session, 
    user_id: int, 
    carrier_code: str
) -> Optional[CarrierCredentials]:
    """Get carrier credentials for a specific carrier."""
    return db.query(CarrierCredentials).filter(
        and_(
            CarrierCredentials.user_id == user_id,
            CarrierCredentials.carrier_code == carrier_code
        )
    ).first()

def create_carrier_credentials(
    db: Session, 
    user_id: int, 
    credentials: UserCarrierCredentials
) -> CarrierCredentials:
    """Create or update carrier credentials for a user."""
    # Check if credentials already exist for this carrier
    existing = get_user_carrier_credential(db, user_id, credentials.carrier_code.value)
    
    if existing:
        # Update existing credentials
        existing.client_id = credentials.client_id
        existing.client_secret = credentials.client_secret  # Should be encrypted in production
        existing.account_number = credentials.account_number
        existing.is_active = credentials.is_active
        existing.description = credentials.description
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new credentials
        db_credentials = CarrierCredentials(
            user_id=user_id,
            carrier_code=credentials.carrier_code.value,
            client_id=credentials.client_id,
            client_secret=credentials.client_secret,  # Should be encrypted in production
            account_number=credentials.account_number,
            is_active=credentials.is_active,
            description=credentials.description
        )
        db.add(db_credentials)
        db.commit()
        db.refresh(db_credentials)
        return db_credentials

def update_carrier_credentials(
    db: Session,
    user_id: int,
    carrier_code: str,
    credentials_update: UserCarrierCredentialsUpdate
) -> Optional[CarrierCredentials]:
    """Update carrier credentials for a user."""
    db_credentials = get_user_carrier_credential(db, user_id, carrier_code)
    if not db_credentials:
        return None
    
    update_data = credentials_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_credentials, field, value)
    
    db_credentials.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_credentials)
    return db_credentials

def delete_carrier_credentials(db: Session, user_id: int, carrier_code: str) -> bool:
    """Delete carrier credentials for a user."""
    db_credentials = get_user_carrier_credential(db, user_id, carrier_code)
    if not db_credentials:
        return False
    
    db.delete(db_credentials)
    db.commit()
    return True

def get_user_active_carriers(db: Session, user_id: int) -> List[CarrierCode]:
    """Get list of carriers with active credentials for a user."""
    credentials = db.query(CarrierCredentials).filter(
        and_(
            CarrierCredentials.user_id == user_id,
            CarrierCredentials.is_active == True
        )
    ).all()
    
    carrier_codes = []
    for cred in credentials:
        try:
            carrier_codes.append(CarrierCode(cred.carrier_code))
        except ValueError:
            # Skip invalid carrier codes
            continue
    
    return carrier_codes

def mask_secret(secret: str) -> str:
    """Mask a secret string, showing only the last 4 characters."""
    if len(secret) <= 4:
        return "*" * len(secret)
    return "*" * (len(secret) - 4) + secret[-4:]
