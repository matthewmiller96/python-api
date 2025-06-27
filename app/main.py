from fastapi import FastAPI, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from app.models import SessionLocal, Shipment
from app.basemodels import carriersSubmission, CarrierCode, shipment
from app.helperfuntions import generate_tokens_for_carriers, generate_bearer_token

app = FastAPI(title="Shipments API", description="API for managing shipments")

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
        "version": "1.0.1",
        "endpoints": {
            "docs": f"{base_url}/docs",
            "health": f"{base_url}/health",
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
    return {"status": "healthy", "service": "shipments-api", "version": "1.0.1"}

@app.get("/shipments")
def get_shipments(db: Session = Depends(get_db)):
    shipments = db.query(Shipment).all()
    return {"shipments": shipments}

@app.post("/shipments")
def create_shipment(destination: str, carrier: str, db: Session = Depends(get_db)):
    # Validate carrier code
    valid_carriers = [code.value for code in CarrierCode]
    if carrier.upper() not in valid_carriers:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid carrier. Must be one of: {', '.join(valid_carriers)}"
        )
    
    shipment = Shipment(destination=destination, carrier=carrier.upper())
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return {"message": "Shipment created successfully", "shipment_id": shipment.id}

@app.post("/carriers")
def configure_carriers(carriers_data: carriersSubmission, test_tokens: bool = False):
    """
    Configure carrier authentication credentials.
    Submit 1-3 carrier configurations (FedEx, UPS, USPS).
    
    Args:
        carriers_data: Carrier configuration data
        test_tokens: If True, will test token generation for all carriers
    """
    try:
        # In a real application, you would save these to a secure database
        # For now, we'll just validate and return confirmation
        configured_carriers = []
        token_test_results = None
        
        for carrier in carriers_data.carriers:
            configured_carriers.append({
                "carrier": carrier.code.value,
                "account_num": carrier.account_num,
                "status": "configured"
            })
        
        # Optionally test token generation
        if test_tokens:
            token_test_results = generate_tokens_for_carriers(carriers_data)
        
        response = {
            "message": "Carrier configurations saved successfully",
            "configured_carriers": configured_carriers,
            "total_carriers": len(configured_carriers)
        }
        
        if token_test_results:
            response["token_test"] = {
                "successful": token_test_results["successful"],
                "failed": token_test_results["failed"],
                "summary": token_test_results["summary"]
            }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/carriers")
def get_supported_carriers():
    """Get list of supported carriers"""
    return {
        "supported_carriers": [code.value for code in CarrierCode],
        "max_configurations": 3,
        "min_configurations": 1,
        "description": "You can configure 1-3 carrier authentication credentials"
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

@app.get("/carriers")
def get_supported_carriers():
    """Get list of supported carriers"""
    return {
        "supported_carriers": [code.value for code in CarrierCode],
        "max_configurations": 3,
        "min_configurations": 1,
        "description": "You can configure 1-3 carrier authentication credentials"
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