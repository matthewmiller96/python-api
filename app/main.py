from fastapi import FastAPI, Depends, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from app.models import SessionLocal, Shipment, User
from app.basemodels import carriersSubmission, CarrierCode, shipment
from app.helperfuntions import generate_tokens_for_carriers, generate_bearer_token
from app.auth_models import (
    UserCreate, UserLogin, Token, UserProfile, OriginLocation, OriginLocationResponse,
    OriginLocationUpdate, UserCarrierCredentials, UserCarrierCredentialsResponse,
    UserCarrierCredentialsUpdate, UpdatePassword
)
from app.auth import (
    get_current_active_user, authenticate_user, create_access_token,
    create_user, get_password_hash, verify_password, ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.user_service import (
    get_user_origin_locations, get_user_origin_location, create_origin_location,
    update_origin_location, delete_origin_location, get_user_carrier_credentials,
    get_user_carrier_credential, create_carrier_credentials, update_carrier_credentials,
    delete_carrier_credentials, get_user_active_carriers, mask_secret
)

app = FastAPI(
    title="Shipments API", 
    description="API for managing shipments with user authentication",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root(request: Request):
    base_url = str(request.url).rstrip('/')
    return {
        "message": "Welcome to the Shipments API", 
        "version": "2.0.0",
        "features": [
            "User Authentication",
            "Multiple Origin Locations",
            "Carrier Credentials Management",
            "Multi-Carrier Rate Shopping"
        ],
        "endpoints": {
            "docs": f"{base_url}/docs",
            "health": f"{base_url}/health",
            "auth": {
                "register": f"{base_url}/auth/register",
                "login": f"{base_url}/auth/token",
                "profile": f"{base_url}/auth/profile"
            },
            "user": {
                "locations": f"{base_url}/user/locations",
                "carriers": f"{base_url}/user/carriers"
            },
            "shipments": f"{base_url}/shipments",
            "carriers": f"{base_url}/carriers"
        },
        "access_info": {
            "local": "http://localhost:3000/",
            "network_note": "Access from other devices using your server's IP address on port 3000"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "shipments-api", "version": "2.0.0"}

# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/auth/register", response_model=UserProfile)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    try:
        user = create_user(
            db=db,
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name
        )
        return UserProfile(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at.isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/auth/token", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/profile", response_model=UserProfile)
def get_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user profile."""
    return UserProfile(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat()
    )

@app.put("/auth/password")
def update_password(
    password_data: UpdatePassword,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user password."""
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

# ==========================================
# USER ORIGIN LOCATIONS
# ==========================================

@app.get("/user/locations", response_model=List[OriginLocationResponse])
def get_user_locations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all origin locations for the current user."""
    locations = get_user_origin_locations(db, current_user.id)
    return [
        OriginLocationResponse(
            id=loc.id,
            user_id=loc.user_id,
            name=loc.name,
            company_name=loc.company_name,
            address_line1=loc.address_line1,
            address_line2=loc.address_line2,
            city=loc.city,
            state=loc.state,
            zip_code=loc.zip_code,
            country=loc.country,
            phone=loc.phone,
            is_default=loc.is_default,
            created_at=loc.created_at.isoformat()
        )
        for loc in locations
    ]

@app.post("/user/locations", response_model=OriginLocationResponse)
def create_user_location(
    location: OriginLocation,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new origin location for the current user."""
    db_location = create_origin_location(db, current_user.id, location)
    return OriginLocationResponse(
        id=db_location.id,
        user_id=db_location.user_id,
        name=db_location.name,
        company_name=db_location.company_name,
        address_line1=db_location.address_line1,
        address_line2=db_location.address_line2,
        city=db_location.city,
        state=db_location.state,
        zip_code=db_location.zip_code,
        country=db_location.country,
        phone=db_location.phone,
        is_default=db_location.is_default,
        created_at=db_location.created_at.isoformat()
    )

@app.put("/user/locations/{location_id}", response_model=OriginLocationResponse)
def update_user_location(
    location_id: int,
    location_update: OriginLocationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an origin location for the current user."""
    db_location = update_origin_location(db, current_user.id, location_id, location_update)
    if not db_location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    return OriginLocationResponse(
        id=db_location.id,
        user_id=db_location.user_id,
        name=db_location.name,
        company_name=db_location.company_name,
        address_line1=db_location.address_line1,
        address_line2=db_location.address_line2,
        city=db_location.city,
        state=db_location.state,
        zip_code=db_location.zip_code,
        country=db_location.country,
        phone=db_location.phone,
        is_default=db_location.is_default,
        created_at=db_location.created_at.isoformat()
    )

@app.delete("/user/locations/{location_id}")
def delete_user_location(
    location_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an origin location for the current user."""
    success = delete_origin_location(db, current_user.id, location_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    return {"message": "Location deleted successfully"}

# ==========================================
# USER CARRIER CREDENTIALS
# ==========================================

@app.get("/user/carriers", response_model=List[UserCarrierCredentialsResponse])
def get_user_carriers(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all carrier credentials for the current user."""
    credentials = get_user_carrier_credentials(db, current_user.id)
    return [
        UserCarrierCredentialsResponse(
            id=cred.id,
            user_id=cred.user_id,
            carrier_code=cred.carrier_code,
            client_id=cred.client_id,
            client_secret_masked=mask_secret(cred.client_secret),
            account_number=cred.account_number,
            is_active=cred.is_active,
            description=cred.description,
            created_at=cred.created_at.isoformat(),
            updated_at=cred.updated_at.isoformat()
        )
        for cred in credentials
    ]

@app.post("/user/carriers", response_model=UserCarrierCredentialsResponse)
def create_user_carrier(
    credentials: UserCarrierCredentials,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create or update carrier credentials for the current user."""
    db_credentials = create_carrier_credentials(db, current_user.id, credentials)
    return UserCarrierCredentialsResponse(
        id=db_credentials.id,
        user_id=db_credentials.user_id,
        carrier_code=db_credentials.carrier_code,
        client_id=db_credentials.client_id,
        client_secret_masked=mask_secret(db_credentials.client_secret),
        account_number=db_credentials.account_number,
        is_active=db_credentials.is_active,
        description=db_credentials.description,
        created_at=db_credentials.created_at.isoformat(),
        updated_at=db_credentials.updated_at.isoformat()
    )

@app.put("/user/carriers/{carrier_code}", response_model=UserCarrierCredentialsResponse)
def update_user_carrier(
    carrier_code: str,
    credentials_update: UserCarrierCredentialsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update carrier credentials for the current user."""
    db_credentials = update_carrier_credentials(db, current_user.id, carrier_code, credentials_update)
    if not db_credentials:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carrier credentials not found"
        )
    
    return UserCarrierCredentialsResponse(
        id=db_credentials.id,
        user_id=db_credentials.user_id,
        carrier_code=db_credentials.carrier_code,
        client_id=db_credentials.client_id,
        client_secret_masked=mask_secret(db_credentials.client_secret),
        account_number=db_credentials.account_number,
        is_active=db_credentials.is_active,
        description=db_credentials.description,
        created_at=db_credentials.created_at.isoformat(),
        updated_at=db_credentials.updated_at.isoformat()
    )

@app.delete("/user/carriers/{carrier_code}")
def delete_user_carrier(
    carrier_code: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete carrier credentials for the current user."""
    success = delete_carrier_credentials(db, current_user.id, carrier_code)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carrier credentials not found"
        )
    
    return {"message": "Carrier credentials deleted successfully"}

@app.post("/user/carriers/test-tokens")
def test_user_carrier_tokens(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Test bearer token generation for all user's carriers."""
    credentials = get_user_carrier_credentials(db, current_user.id)
    active_credentials = [c for c in credentials if c.is_active]
    
    if not active_credentials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active carrier credentials found"
        )
    
    results = {
        "tokens": [],
        "successful": 0,
        "failed": 0,
        "summary": {}
    }
    
    for cred in active_credentials:
        try:
            carrier_code = CarrierCode(cred.carrier_code)
            token_result = generate_bearer_token(
                carrier_code,
                cred.client_id,
                cred.client_secret,
                cred.account_number
            )
            
            results["tokens"].append(token_result)
            
            if token_result["success"]:
                results["successful"] += 1
            else:
                results["failed"] += 1
            
            results["summary"][cred.carrier_code] = {
                "success": token_result["success"],
                "has_token": bool(token_result.get("access_token"))
            }
        except ValueError:
            # Invalid carrier code
            results["failed"] += 1
            results["summary"][cred.carrier_code] = {
                "success": False,
                "error": "Invalid carrier code"
            }
    
    return {
        "message": f"Token generation completed: {results['successful']} successful, {results['failed']} failed",
        "results": results
    }


@app.post("/carriers/tokens")
def generate_carrier_tokens(carriers_data: carriersSubmission):
    """
    Generate bearer tokens for configured carriers.
    This will test the authentication credentials by requesting tokens from each carrier's API.
    """
    try:
        token_results = generate_tokens_for_carriers(carriers_data)
        
        return {
            "message": f"Token generation completed: {token_results['successful']} successful, {token_results['failed']} failed",
            "results": token_results,
            "timestamp": "2025-06-27T12:00:00Z"  # In production, use datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token generation failed: {str(e)}")

@app.post("/carriers/test-token")
def test_single_carrier_token(carrier_code: CarrierCode, client_id: str, client_secret: str, account_num: str = None):
    """
    Test bearer token generation for a single carrier.
    Useful for testing individual carrier credentials.
    """
    try:
        token_result = generate_bearer_token(carrier_code, client_id, client_secret, account_num)
        
        if token_result["success"]:
            # Don't expose the full token in response for security
            safe_result = {
                "carrier": token_result["carrier"],
                "success": True,
                "token_type": token_result.get("token_type"),
                "expires_in": token_result.get("expires_in"),
                "scope": token_result.get("scope"),
                "token_preview": token_result.get("access_token", "")[:20] + "..." if token_result.get("access_token") else None
            }
        else:
            safe_result = {
                "carrier": token_result["carrier"],
                "success": False,
                "error": token_result.get("error"),
                "error_type": token_result.get("error_type")
            }
            
        return {
            "message": f"Token test for {carrier_code.value} completed",
            "result": safe_result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token test failed: {str(e)}")