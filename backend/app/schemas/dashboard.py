from pydantic import BaseModel

from app.schemas.contact import ContactRead
from app.schemas.interaction import InteractionRead


class RecentInteraction(BaseModel):
    id: str
    contact_id: str
    contact_first_name: str
    contact_last_name: str | None
    contact_photo_url: str | None
    interacted_at: str
    interaction_type: str
    notes: str | None
    sentiment: str

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_contacts: int
    interactions_this_week: int
    interactions_this_month: int
    new_contacts_this_month: int
    overdue_contacts: list[ContactRead]
    recent_interactions: list[RecentInteraction]
    recent_contacts: list[ContactRead]
