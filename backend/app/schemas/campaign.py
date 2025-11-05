from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class CampaignBase(BaseModel):
    """Base campaign schema"""
    name: str
    description: Optional[str] = None
    total_budget: Optional[Decimal] = Decimal("0.00")


class CampaignCreate(CampaignBase):
    """Schema for creating a campaign"""
    pass


class CampaignUpdate(BaseModel):
    """Schema for updating a campaign"""
    name: Optional[str] = None
    description: Optional[str] = None
    total_budget: Optional[Decimal] = None


class CampaignResponse(CampaignBase):
    """Schema for campaign response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
