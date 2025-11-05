from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class ScrapeStatus(str, enum.Enum):
    """Enum for video scrape status"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Video(Base):
    """Video model to store TikTok video URLs"""
    __tablename__ = "videos"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    tiktok_url = Column(String, nullable=False)
    tiktok_id = Column(String, nullable=True, index=True)  # Extracted from JSON
    scrape_status = Column(Enum(ScrapeStatus), default=ScrapeStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    campaign = relationship("Campaign", back_populates="videos")
    video_metadata = relationship("VideoMetadata", back_populates="video", uselist=False, cascade="all, delete-orphan")