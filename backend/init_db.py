"""
Database initialization script.
Run this script to create all database tables.

Usage:
    python init_db.py
"""

from app.database import Base, engine
from app.models import User, Campaign, Video, VideoMetadata

def init_database():
    """Initialize the database by creating all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")
    print("\nTables created:")
    print("  - users")
    print("  - campaigns")
    print("  - videos")
    print("  - video_metadata")

if __name__ == "__main__":
    init_database()
