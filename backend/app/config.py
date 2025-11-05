from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "sqlite:///./tiktok_analytics.db"
    
    # JWT Authentication
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Apify API
    APIFY_API_TOKEN: str = ""
    APIFY_ACTOR_ID: str = "clockworks~free-tiktok-scraper"
    APIFY_BASE_URL: str = "https://api.apify.com/v2/acts"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:8000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
