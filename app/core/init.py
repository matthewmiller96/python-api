"""
Application initialization and startup.
"""
from app.core.database import create_tables

def init_app():
    """Initialize the application - create database tables etc."""
    create_tables()
    print("Database tables created successfully!")
