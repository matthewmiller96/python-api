from fastapi import FastAPI, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from app.models import SessionLocal, Shipment
from app.basemodels import carriersSubmission, CarrierCode, shipment

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
def configure_carriers(carriers_data: carriersSubmission):
    """
    Configure carrier authentication credentials.
    Submit 1-3 carrier configurations (FedEx, UPS, USPS).
    """
    try:
        # In a real application, you would save these to a secure database
        # For now, we'll just validate and return confirmation
        configured_carriers = []
        for carrier in carriers_data.carriers:
            configured_carriers.append({
                "carrier": carrier.code.value,
                "account_num": carrier.account_num,
                "status": "configured"
            })
        
        return {
            "message": "Carrier configurations saved successfully",
            "configured_carriers": configured_carriers,
            "total_carriers": len(configured_carriers)
        }
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

@app.post("/shipments/quote")
def get_shipping_quotes(shipment_data: shipment, carrier_codes: list[CarrierCode] = None):
    """
    Get shipping quotes from configured carriers.
    If no carrier_codes specified, will check all configured carriers.
    """
    # In a real application, you would use the configured carrier credentials
    # to get actual quotes from the carrier APIs
    
    if carrier_codes is None:
        carrier_codes = [CarrierCode.FEDEX, CarrierCode.UPS, CarrierCode.USPS]
    
    quotes = []
    for carrier in carrier_codes:
        # Mock quote - in real implementation, call carrier API
        quotes.append({
            "carrier": carrier.value,
            "service": "Ground",
            "estimated_cost": f"${(len(shipment_data.name) * 2.5):.2f}",  # Mock calculation
            "estimated_days": "3-5 business days",
            "destination": f"{shipment_data.city}, {shipment_data.state}"
        })
    
    return {
        "shipment_destination": f"{shipment_data.city}, {shipment_data.state} {shipment_data.zip}",
        "quotes": quotes,
        "total_quotes": len(quotes)
    }