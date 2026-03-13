from datetime import datetime

from pydantic import BaseModel, Field

from app.models.interaction import InteractionType, Sentiment


class InteractionBase(BaseModel):
    contact_id: str
    interacted_at: datetime | None = None
    interaction_type: InteractionType
    notes: str | None = None
    sentiment: Sentiment = Sentiment.good


class InteractionCreate(InteractionBase):
    pass


class InteractionUpdate(BaseModel):
    interacted_at: datetime | None = None
    interaction_type: InteractionType | None = None
    notes: str | None = None
    sentiment: Sentiment | None = None


class InteractionRead(InteractionBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class InteractionReadWithContact(InteractionRead):
    contact_first_name: str | None = None
    contact_last_name: str | None = None

    model_config = {"from_attributes": True}
