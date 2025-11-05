from .auth import router as auth_router
from .campaigns import router as campaigns_router
from .videos import router as videos_router

__all__ = ["auth_router", "campaigns_router", "videos_router"]