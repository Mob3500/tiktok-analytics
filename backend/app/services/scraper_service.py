import requests
from typing import Optional, Dict, Any
from ..config import settings
from ..models import VideoMetadata, Video, ScrapeStatus
from sqlalchemy.orm import Session


class ScraperService:
    """Service for scraping TikTok videos using Apify API"""
    
    @staticmethod
    def scrape_tiktok_video(video_url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape a single TikTok video using Apify API.
        
        Args:
            video_url: The TikTok video URL to scrape
            
        Returns:
            Dict containing video metadata, or None if scraping failed
        """
        # Construct Apify API URL
        api_url = f"{settings.APIFY_BASE_URL}/{settings.APIFY_ACTOR_ID}/run-sync-get-dataset-items"
        
        # Add token to URL
        api_url_with_token = f"{api_url}?token={settings.APIFY_API_TOKEN}&format=json"
        
        # Request payload
        payload = {
            "postURLs": [video_url]
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            # Make POST request to Apify
            response = requests.post(
                api_url_with_token,
                json=payload,
                headers=headers,
                timeout=60  # 60 second timeout
            )
            
            # Check if request was successful (200 or 201)
            if response.status_code in [200, 201]:
                data = response.json()
                
                # Apify returns an array, get first item
                if data and len(data) > 0:
                    return data[0]
                else:
                    print(f"No data returned for {video_url}")
                    return None
            else:
                print(f"Scraper API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            print(f"Timeout scraping {video_url}")
            return None
        except requests.exceptions.RequestException as e:
            print(f"Error scraping {video_url}: {str(e)}")
            return None
    
    @staticmethod
    def save_video_metadata(db: Session, video: Video, scraped_data: Dict[str, Any]) -> VideoMetadata:
        """
        Save scraped video metadata to database.
        
        Args:
            db: Database session
            video: Video object to attach metadata to
            scraped_data: Raw JSON data from scraper
            
        Returns:
            VideoMetadata: Created metadata object
        """
        # Extract data from scraped JSON
        metadata = VideoMetadata(
            video_id=video.id,
            
            # Video metrics
            play_count=scraped_data.get("playCount", 0),
            digg_count=scraped_data.get("diggCount", 0),
            comment_count=scraped_data.get("commentCount", 0),
            share_count=scraped_data.get("shareCount", 0),
            collect_count=scraped_data.get("collectCount", 0),
            
            # Video information
            text=scraped_data.get("text"),
            text_language=scraped_data.get("textLanguage"),
            create_time=scraped_data.get("createTime"),
            create_time_iso=scraped_data.get("createTimeISO"),
            location_created=scraped_data.get("locationCreated"),
            is_ad=scraped_data.get("isAd", False),
            
            # Author information
            author_name=scraped_data.get("authorMeta", {}).get("name"),
            author_nickname=scraped_data.get("authorMeta", {}).get("nickName"),
            author_verified=scraped_data.get("authorMeta", {}).get("verified", False),
            author_fans=scraped_data.get("authorMeta", {}).get("fans", 0),
            author_avatar=scraped_data.get("authorMeta", {}).get("avatar"),
            
            # Music information
            music_name=scraped_data.get("musicMeta", {}).get("musicName"),
            music_author=scraped_data.get("musicMeta", {}).get("musicAuthor"),
            music_id=scraped_data.get("musicMeta", {}).get("musicId"),
            
            # Video properties
            video_duration=scraped_data.get("videoMeta", {}).get("duration"),
            video_height=scraped_data.get("videoMeta", {}).get("height"),
            video_width=scraped_data.get("videoMeta", {}).get("width"),
            video_cover_url=scraped_data.get("videoMeta", {}).get("coverUrl"),
            
            # Hashtags
            hashtags=scraped_data.get("hashtags"),
            
            # Store raw JSON for future reference
            raw_json=scraped_data
        )
        
        db.add(metadata)
        db.commit()
        db.refresh(metadata)
        
        return metadata
    
    @staticmethod
    def scrape_and_save(db: Session, video: Video) -> bool:
        """
        Scrape a video and save its metadata to database.
        
        Args:
            db: Database session
            video: Video object to scrape
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Update video status to pending
            video.scrape_status = ScrapeStatus.PENDING
            db.commit()
            
            # Scrape the video
            scraped_data = ScraperService.scrape_tiktok_video(video.tiktok_url)
            
            if scraped_data:
                # Save metadata
                ScraperService.save_video_metadata(db, video, scraped_data)
                
                # Update video with TikTok ID and status
                video.tiktok_id = scraped_data.get("id")
                video.scrape_status = ScrapeStatus.COMPLETED
                db.commit()
                
                return True
            else:
                # Mark as failed
                video.scrape_status = ScrapeStatus.FAILED
                db.commit()
                return False
                
        except Exception as e:
            print(f"Error in scrape_and_save: {str(e)}")
            video.scrape_status = ScrapeStatus.FAILED
            db.commit()
            return False
