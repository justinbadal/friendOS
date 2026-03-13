from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.auth import require_auth
from app.api.routes import contacts, interactions, tags, dashboard, shortcuts

api = FastAPI(
    title="Friendos API",
    description="Personal CRM for tracking friends",
    version="0.1.0",
    redirect_slashes=False,
)

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_auth = [Depends(require_auth)]
api.include_router(contacts.router, prefix="/api/v1", dependencies=_auth)
api.include_router(interactions.router, prefix="/api/v1", dependencies=_auth)
api.include_router(tags.router, prefix="/api/v1", dependencies=_auth)
api.include_router(dashboard.router, prefix="/api/v1", dependencies=_auth)
api.include_router(shortcuts.router, prefix="/api/v1")


@api.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "friendos"}
