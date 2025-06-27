from fastapi import FastAPI, Depends, Request
from sqlalchemy.orm import Session
from app.models import SessionLocal, Shipment

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
            "shipments": f"{base_url}/shipments"
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
    shipment = Shipment(destination=destination, carrier=carrier)
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return {"message": "Shipment created successfully", "shipment_id": shipment.id}