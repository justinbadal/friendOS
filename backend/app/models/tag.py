import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Table, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

contact_tags = Table(
    "contact_tags",
    Base.metadata,
    Column("contact_id", String(36), ForeignKey("contacts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String(36), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        server_default=text("gen_random_uuid()::text"),
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    color: Mapped[str] = mapped_column(String(7), nullable=False, default="#00E5FF")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )

    contacts: Mapped[list["Contact"]] = relationship(  # type: ignore[name-defined]
        "Contact",
        secondary=contact_tags,
        back_populates="tags",
    )
