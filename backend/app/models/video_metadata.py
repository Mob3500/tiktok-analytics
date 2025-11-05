from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class VideoMetadata(Base):
    """Video metadata model to store scraped TikTok data"""
    __tablename__ = "video_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False, unique=True)
    
    # Video Metrics
    play_count = Column(Integer, default=0)
    digg_count = Column(Integer, default=0)  # Likes
    comment_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)
    collect_count = Column(Integer, default=0)  # Saves/Bookmarks
    
    # Video Information
    text = Column(Text, nullable=True)  # Caption
    text_language = Column(String, nullable=True)
    create_time = Column(Integer, nullable=True)  # Unix timestamp
    create_time_iso = Column(String, nullable=True)
    location_created = Column(String, nullable=True)  # Country code
    is_ad = Column(Boolean, default=False)
    
    # Author Information
    author_name = Column(String, nullable=True)  # @username
    author_nickname = Column(String, nullable=True)  # Display name
    author_verified = Column(Boolean, default=False)
    author_fans = Column(Integer, default=0)  # Followers
    author_avatar = Column(String, nullable=True)
    
    # Music Information
    music_name = Column(String, nullable=True)
    music_author = Column(String, nullable=True)
    music_id = Column(String, nullable=True)
    
    # Video Properties
    video_duration = Column(Integer, nullable=True)  # Seconds
    video_height = Column(Integer, nullable=True)
    video_width = Column(Integer, nullable=True)
    video_cover_url = Column(String, nullable=True)
    
    # Hashtags
    hashtags = Column(JSON, nullable=True)  # Store as JSON array
    
    # Raw JSON response (for future reference)
    raw_json = Column(JSON, nullable=True)
    
    # Timestamps
    scraped_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    video = relationship("Video", back_populates="video_metadata")
