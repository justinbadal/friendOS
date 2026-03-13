from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.contact import ContactFrequency
from app.schemas.tag import TagRead
from app.schemas.interaction import InteractionRead


class ContactBase(BaseModel):
    first_name: str = Field(..., max_length=100)
    last_name: str | None = Field(None, max_length=100)
    nickname: str | None = Field(None, max_length=100)
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=50)
    birthday: date | None = None
    how_we_met: str | None = None
    location: str | None = Field(None, max_length=255)
    company: str | None = Field(None, max_length=255)
    job_title: str | None = Field(None, max_length=255)
    notes: str | None = None
    photo_url: str | None = Field(None, max_length=500)
    contact_frequency: ContactFrequency = ContactFrequency.monthly
    last_contacted_at: datetime | None = None


class ContactCreate(ContactBase):
    tag_ids: list[str] = Field(default_factory=list)


class ContactUpdate(BaseModel):
    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    nickname: str | None = Field(None, max_length=100)
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=50)
    birthday: date | None = None
    how_we_met: str | None = None
    location: str | None = Field(None, max_length=255)
    company: str | None = Field(None, max_length=255)
    job_title: str | None = Field(None, max_length=255)
    notes: str | None = None
    photo_url: str | None = Field(None, max_length=500)
    contact_frequency: ContactFrequency | None = None
    last_contacted_at: datetime | None = None
    tag_ids: list[str] | None = None


class ContactRead(ContactBase):
    id: str
    created_at: datetime
    updated_at: datetime
    tags: list[TagRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ContactReadDetail(ContactRead):
    interactions: list[InteractionRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}
