from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Campaign, Video, User
from ..schemas import VideoCreate, VideoResponse
from ..utils.dependencies import get_current_user
from ..services.scraper_service import ScraperService

router = APIRouter(prefix="/videos", tags=["Videos"])


@router.post("/campaigns/{campaign_id}/videos", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
def add_video_to_campaign(
    campaign_id: int,
    video_data: VideoCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a TikTok video URL to a campaign and trigger scraping.
    
    Args:
        campaign_id: Campaign ID
        video_data: Video URL data
        background_tasks: FastAPI background tasks
        db: Database session
        current_user: Authenticated user
        
    Returns:
        VideoResponse: Created video with pending scrape status
        
    Raises:
        HTTPException: If campaign not found or not owned by user
    """
    # Verify campaign ownership
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Check if URL already exists in this campaign
    existing_video = db.query(Video).filter(
        Video.campaign_id == campaign_id,
        Video.tiktok_url == video_data.tiktok_url
    ).first()
    
    if existing_video:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This video URL already exists in this campaign"
        )
    
    # Create video record
    video = Video(
        campaign_id=campaign_id,
        tiktok_url=video_data.tiktok_url
    )
    
    db.add(video)
    db.commit()
    db.refresh(video)
    
    # Trigger scraping in background
    background_tasks.add_task(ScraperService.scrape_and_save, db, video)
    
    return video


@router.get("/campaigns/{campaign_id}/videos", response_model=List[VideoResponse])
def get_campaign_videos(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all videos in a campaign.
    
    Args:
        campaign_id: Campaign ID
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List[VideoResponse]: List of videos with metadata
        
    Raises:
        HTTPException: If campaign not found or not owned by user
    """
    # Verify campaign ownership
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    videos = db.query(Video).filter(Video.campaign_id == campaign_id).all()
    return videos


@router.get("/videos/{video_id}", response_model=VideoResponse)
def get_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific video by ID.
    
    Args:
        video_id: Video ID
        db: Database session
        current_user: Authenticated user
        
    Returns:
        VideoResponse: Video details with metadata
        
    Raises:
        HTTPException: If video not found or not owned by user
    """
    video = db.query(Video).join(Campaign).filter(
        Video.id == video_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    return video


@router.post("/videos/{video_id}/rescrape", response_model=VideoResponse)
def rescrape_video(
    video_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Trigger re-scraping of a video to update its metadata.
    
    Args:
        video_id: Video ID
        background_tasks: FastAPI background tasks
        db: Database session
        current_user: Authenticated user
        
    Returns:
        VideoResponse: Video with updated scrape status
        
    Raises:
        HTTPException: If video not found or not owned by user
    """
    video = db.query(Video).join(Campaign).filter(
        Video.id == video_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    # Delete existing metadata if any
    if video.video_metadata:
        db.delete(video.video_metadata)
        db.commit()
    
    # Trigger scraping in background
    background_tasks.add_task(ScraperService.scrape_and_save, db, video)
    
    return video


@router.delete("/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a video from a campaign.
    
    Args:
        video_id: Video ID
        db: Database session
        current_user: Authenticated user
        
    Raises:
        HTTPException: If video not found or not owned by user
    """
    video = db.query(Video).join(Campaign).filter(
        Video.id == video_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    db.delete(video)
    db.commit()
    
    return None
