import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.tag import contact_tags


class ContactFrequency(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    quarterly = "quarterly"
    annually = "annually"
    never = "never"


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        server_default=text("gen_random_uuid()::text"),
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    nickname: Mapped[str | None] = mapped_column(String(100), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    birthday: Mapped[date | None] = mapped_column(Date(), nullable=True)
    how_we_met: Mapped[str | None] = mapped_column(Text(), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    job_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text(), nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    contact_frequency: Mapped[ContactFrequency] = mapped_column(
        Enum(ContactFrequency, name="contactfrequency"),
        nullable=False,
        default=ContactFrequency.monthly,
        server_default="monthly",
    )
    last_contacted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )

    tags: Mapped[list["Tag"]] = relationship(  # type: ignore[name-defined]
        "Tag",
        secondary=contact_tags,
        back_populates="contacts",
        lazy="selectin",
    )
    interactions: Mapped[list["Interaction"]] = relationship(  # type: ignore[name-defined]
        "Interaction",
        back_populates="contact",
        cascade="all, delete-orphan",
        order_by="Interaction.interacted_at.desc()",
        lazy="selectin",
    )
