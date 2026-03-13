from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.contact import ContactRepository
from app.schemas.contact import ContactRead
from app.schemas.dashboard import DashboardStats, RecentInteraction

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
async def get_dashboard(db: AsyncSession = Depends(get_db)) -> DashboardStats:
    repo = ContactRepository(db)

    total_contacts = await repo.count_all()
    interactions_this_week = await repo.count_interactions_this_week()
    interactions_this_month = await repo.count_interactions_this_month()
    new_contacts_this_month = await repo.count_new_this_month()
    overdue_contacts = await repo.get_overdue_contacts()
    recent_contacts = await repo.get_recent_contacts(limit=8)
    recent_raw = await repo.get_recent_interactions(limit=10)

    recent_interactions = []
    for i in recent_raw:
        contact = i.contact
        recent_interactions.append(
            RecentInteraction(
                id=i.id,
                contact_id=i.contact_id,
                contact_first_name=contact.first_name if contact else "Unknown",
                contact_last_name=contact.last_name if contact else None,
                contact_photo_url=contact.photo_url if contact else None,
                interacted_at=i.interacted_at.isoformat(),
                interaction_type=i.interaction_type.value,
                notes=i.notes,
                sentiment=i.sentiment.value,
            )
        )

    return DashboardStats(
        total_contacts=total_contacts,
        interactions_this_week=interactions_this_week,
        interactions_this_month=interactions_this_month,
        new_contacts_this_month=new_contacts_this_month,
        overdue_contacts=[ContactRead.model_validate(c) for c in overdue_contacts],
        recent_interactions=recent_interactions,
        recent_contacts=[ContactRead.model_validate(c) for c in recent_contacts],
    )
