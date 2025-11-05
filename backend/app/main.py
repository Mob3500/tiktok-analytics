from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routers import auth_router, campaigns_router, videos_router
import os

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="TikTok Analytics API",
    description="Backend API for TikTok campaign analytics dashboard",
    version="1.0.0"
)

# Configure CORS for production
# Get frontend URL from environment or use default
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://m2m-dashboard-phde6x0wk-mob3500s-projects.vercel.app",
        FRONTEND_URL,
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(campaigns_router)
app.include_router(videos_router)


@app.get("/")
def root():
    """Root endpoint - API health check"""
    return {
        "message": "TikTok Analytics API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "auth": "/auth",
            "campaigns": "/campaigns",
            "videos": "/videos"
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)