from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Campaign, Video, VideoMetadata
from typing import Dict, Any


class AnalyticsService:
    """Service for aggregating campaign analytics"""
    
    @staticmethod
    def get_campaign_analytics(db: Session, campaign_id: int) -> Dict[str, Any]:
        """
        Get aggregated analytics for a campaign.
        
        Args:
            db: Database session
            campaign_id: Campaign ID
            
        Returns:
            Dict containing aggregated metrics
        """
        # Get campaign
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        
        if not campaign:
            return None
        
        # Get all videos in campaign with their metadata
        videos = db.query(Video).filter(Video.campaign_id == campaign_id).all()
        
        # Count videos by status
        total_videos = len(videos)
        completed_videos = len([v for v in videos if v.scrape_status == "completed"])
        pending_videos = len([v for v in videos if v.scrape_status == "pending"])
        failed_videos = len([v for v in videos if v.scrape_status == "failed"])
        
        # Aggregate metrics from completed videos
        total_views = 0
        total_likes = 0
        total_comments = 0
        total_shares = 0
        total_saves = 0
        
        for video in videos:
            if video.video_metadata:
                total_views += video.video_metadata.play_count or 0
                total_likes += video.video_metadata.digg_count or 0
                total_comments += video.video_metadata.comment_count or 0
                total_shares += video.video_metadata.share_count or 0
                total_saves += video.video_metadata.collect_count or 0
        
        # Calculate engagement rate
        if total_views > 0:
            total_engagements = total_likes + total_comments + total_shares + total_saves
            engagement_rate = (total_engagements / total_views) * 100
        else:
            engagement_rate = 0.0
        
        # Calculate average cost per view (if budget is set)
        if campaign.total_budget and total_views > 0:
            avg_cost_per_view = float(campaign.total_budget) / total_views
        else:
            avg_cost_per_view = 0.0
        
        return {
            "campaign_id": campaign.id,
            "campaign_name": campaign.name,
            "campaign_budget": float(campaign.total_budget) if campaign.total_budget else 0.0,
            
            # Video counts
            "total_videos": total_videos,
            "completed_videos": completed_videos,
            "pending_videos": pending_videos,
            "failed_videos": failed_videos,
            
            # Aggregated metrics
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_shares": total_shares,
            "total_saves": total_saves,
            
            # Calculated metrics
            "engagement_rate": round(engagement_rate, 2),
            "avg_cost_per_view": round(avg_cost_per_view, 6),
            
            # Campaign info
            "created_at": campaign.created_at.isoformat() if campaign.created_at else None
        }
    
    @staticmethod
    def get_all_campaigns_summary(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get summary analytics for all campaigns of a user.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Dict containing summary for all campaigns
        """
        campaigns = db.query(Campaign).filter(Campaign.user_id == user_id).all()
        
        total_campaigns = len(campaigns)
        total_videos = 0
        total_views = 0
        total_likes = 0
        total_budget = 0.0
        
        for campaign in campaigns:
            campaign_analytics = AnalyticsService.get_campaign_analytics(db, campaign.id)
            if campaign_analytics:
                total_videos += campaign_analytics["total_videos"]
                total_views += campaign_analytics["total_views"]
                total_likes += campaign_analytics["total_likes"]
                total_budget += campaign_analytics["campaign_budget"]
        
        return {
            "total_campaigns": total_campaigns,
            "total_videos": total_videos,
            "total_views": total_views,
            "total_likes": total_likes,
            "total_budget": total_budget,
            "avg_cost_per_view": round(total_budget / total_views, 6) if total_views > 0 else 0.0
        }
