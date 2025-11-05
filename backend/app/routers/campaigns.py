from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Campaign, User
from ..schemas import CampaignCreate, CampaignUpdate, CampaignResponse
from ..utils.dependencies import get_current_user
from ..services.analytics_service import AnalyticsService

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(
    campaign_data: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new campaign.
    
    Args:
        campaign_data: Campaign creation data
        db: Database session
        current_user: Authenticated user
        
    Returns:
        CampaignResponse: Created campaign
    """
    campaign = Campaign(
        user_id=current_user.id,
        name=campaign_data.name,
        description=campaign_data.description,
        total_budget=campaign_data.total_budget
    )
    
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    
    return campaign


@router.get("/", response_model=List[CampaignResponse])
def get_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all campaigns for the current user.
    
    Args:
        db: Database session
        current_user: Authenticated user
        
    Returns:
        List[CampaignResponse]: List of user's campaigns
    """
    campaigns = db.query(Campaign).filter(Campaign.user_id == current_user.id).all()
    return campaigns


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific campaign by ID.
    
    Args:
        campaign_id: Campaign ID
        db: Database session
        current_user: Authenticated user
        
    Returns:
        CampaignResponse: Campaign details
        
    Raises:
        HTTPException: If campaign not found or not owned by user
    """
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return campaign


@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: int,
    campaign_data: CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a campaign.
    
    Args:
        campaign_id: Campaign ID
        campaign_data: Updated campaign data
        db: Database session
        current_user: Authenticated user
        
    Returns:
        CampaignResponse: Updated campaign
        
    Raises:
        HTTPException: If campaign not found or not owned by user
    """
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Update fields if provided
    if campaign_data.name is not None:
        campaign.name = campaign_data.name
    if campaign_data.description is not None:
        campaign.description = campaign_data.description
    if campaign_data.total_budget is not None:
        campaign.total_budget = campaign_data.total_budget
    
    db.commit()
    db.refresh(campaign)
    
    return campaign


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a campaign.
    
    Args:
        campaign_id: Campaign ID
        db: Database session
        current_user: Authenticated user
        
    Raises:
        HTTPException: If campaign not found or not owned by user
    """
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    db.delete(campaign)
    db.commit()
    
    return None


@router.get("/{campaign_id}/analytics")
def get_campaign_analytics(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get aggregated analytics for a campaign.
    
    Args:
        campaign_id: Campaign ID
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Dict: Aggregated campaign analytics
        
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
    
    analytics = AnalyticsService.get_campaign_analytics(db, campaign_id)
    
    if not analytics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign analytics not available"
        )
    
    return analytics
