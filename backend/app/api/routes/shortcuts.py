from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes.interactions import create_interaction
from app.auth import require_auth
from app.database import get_db
from app.repositories.contact import ContactRepository
from app.repositories.interaction import InteractionRepository
from app.schemas.interaction import InteractionCreate

router = APIRouter(prefix="/shortcuts", tags=["shortcuts"])

_auth = [Depends(require_auth)]


# ─── Schemas ──────────────────────────────────────────────────────────────────

class ContactMatch(BaseModel):
    id: str
    first_name: str
    last_name: str | None
    full_name: str
    company: str | None
    last_contacted_at: str | None


class LogRequest(BaseModel):
    contact_id: str
    sentiment: str = "good"
    notes: str | None = None


class LogResponse(BaseModel):
    message: str
    contact_name: str
    interaction_id: str


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/search", response_model=list[ContactMatch], dependencies=_auth)
async def search_contacts(name: str, db: AsyncSession = Depends(get_db)) -> list[ContactMatch]:
    """Fuzzy name search for Siri Shortcuts — returns contacts matching the query."""
    repo = ContactRepository(db)
    contacts = await repo.get_all(search=name)
    return [
        ContactMatch(
            id=c.id,
            first_name=c.first_name,
            last_name=c.last_name,
            full_name=" ".join(filter(None, [c.first_name, c.last_name])),
            company=c.company,
            last_contacted_at=c.last_contacted_at.isoformat() if c.last_contacted_at else None,
        )
        for c in contacts
    ]


@router.post("/log", response_model=LogResponse, dependencies=_auth)
async def log_interaction(data: LogRequest, db: AsyncSession = Depends(get_db)) -> LogResponse:
    """Log a call interaction from Siri Shortcuts."""
    contact_repo = ContactRepository(db)
    contact = await contact_repo.get_by_id(data.contact_id)
    if not contact:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Contact not found")

    interaction_repo = InteractionRepository(db)
    interaction = await interaction_repo.create(
        InteractionCreate(
            contact_id=data.contact_id,
            interaction_type="call",
            sentiment=data.sentiment,
            notes=data.notes,
        )
    )

    full_name = " ".join(filter(None, [contact.first_name, contact.last_name]))
    return LogResponse(
        message=f"Logged call with {full_name}",
        contact_name=full_name,
        interaction_id=interaction.id,
    )
