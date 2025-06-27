"""
Health check utilities for monitoring and diagnostics.
"""
from datetime import datetime
from sqlalchemy import text
from app.core.database import SessionLocal

def check_database_health() -> bool:
    """Check if database is accessible."""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception:
        return False

def get_health_status() -> dict:
    """Get comprehensive health status."""
    return {
        "status": "healthy" if check_database_health() else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if check_database_health() else "disconnected",
        "version": "2.0.0"
    }
