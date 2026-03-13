import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class InteractionType(str, enum.Enum):
    call = "call"
    text = "text"
    in_person = "in_person"
    email = "email"
    social = "social"
    other = "other"


class Sentiment(str, enum.Enum):
    great = "great"
    good = "good"
    neutral = "neutral"
    difficult = "difficult"


class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        server_default=text("gen_random_uuid()::text"),
    )
    contact_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("contacts.id", ondelete="CASCADE"),
        nullable=False,
    )
    interacted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )
    interaction_type: Mapped[InteractionType] = mapped_column(
        Enum(InteractionType, name="interactiontype"),
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(Text(), nullable=True)
    sentiment: Mapped[Sentiment] = mapped_column(
        Enum(Sentiment, name="sentiment"),
        nullable=False,
        default=Sentiment.good,
        server_default="good",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )

    contact: Mapped["Contact"] = relationship(  # type: ignore[name-defined]
        "Contact",
        back_populates="interactions",
    )
