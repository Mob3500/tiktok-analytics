from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any


class VideoBase(BaseModel):
    """Base video schema"""
    tiktok_url: str


class VideoCreate(VideoBase):
    """Schema for adding a video to a campaign"""
    pass


class VideoMetadataResponse(BaseModel):
    """Schema for video metadata response"""
    play_count: Optional[int] = 0
    digg_count: Optional[int] = 0
    comment_count: Optional[int] = 0
    share_count: Optional[int] = 0
    collect_count: Optional[int] = 0
    text: Optional[str] = None
    author_name: Optional[str] = None
    author_nickname: Optional[str] = None
    author_verified: Optional[bool] = False
    author_fans: Optional[int] = 0
    music_name: Optional[str] = None
    music_author: Optional[str] = None
    video_duration: Optional[int] = None
    video_cover_url: Optional[str] = None
    hashtags: Optional[List[Dict[str, Any]]] = None
    create_time_iso: Optional[str] = None
    location_created: Optional[str] = None
    scraped_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class VideoResponse(VideoBase):
    """Schema for video response"""
    id: int
    campaign_id: int
    tiktok_id: Optional[str] = None
    scrape_status: str
    created_at: datetime
    video_metadata: Optional[VideoMetadataResponse] = None
    
    class Config:
        from_attributes = True