from fastapi import FastAPI, Depends
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
def read_root():
    return {"message": "Welcome to the Shipments API", 
            "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "shipments-api"}

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