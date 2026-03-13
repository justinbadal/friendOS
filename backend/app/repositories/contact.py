from datetime import datetime, timedelta, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.contact import Contact, ContactFrequency
from app.models.interaction import Interaction
from app.models.tag import Tag
from app.schemas.contact import ContactCreate, ContactUpdate


FREQUENCY_DAYS: dict[ContactFrequency, int | None] = {
    ContactFrequency.daily: 1,
    ContactFrequency.weekly: 7,
    ContactFrequency.monthly: 30,
    ContactFrequency.quarterly: 90,
    ContactFrequency.annually: 365,
    ContactFrequency.never: None,
}


class ContactRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(
        self,
        search: str | None = None,
        tag_id: str | None = None,
    ) -> list[Contact]:
        query = (
            select(Contact)
            .options(selectinload(Contact.tags), selectinload(Contact.interactions))
            .order_by(Contact.first_name)
        )
        if search:
            term = f"%{search}%"
            query = query.where(
                or_(
                    Contact.first_name.ilike(term),
                    Contact.last_name.ilike(term),
                    Contact.nickname.ilike(term),
                    Contact.email.ilike(term),
                    Contact.company.ilike(term),
                )
            )
        if tag_id:
            query = query.join(Contact.tags).where(Tag.id == tag_id)
        result = await self.db.execute(query)
        return list(result.scalars().unique().all())

    async def get_by_id(self, contact_id: str) -> Contact | None:
        result = await self.db.execute(
            select(Contact)
            .options(selectinload(Contact.tags), selectinload(Contact.interactions))
            .where(Contact.id == contact_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: ContactCreate) -> Contact:
        tag_ids = data.tag_ids
        contact_data = data.model_dump(exclude={"tag_ids"})
        contact = Contact(**contact_data)

        if tag_ids:
            tags_result = await self.db.execute(
                select(Tag).where(Tag.id.in_(tag_ids))
            )
            contact.tags = list(tags_result.scalars().all())

        self.db.add(contact)
        await self.db.flush()
        await self.db.refresh(contact, attribute_names=["tags", "interactions"])
        return contact

    async def update(self, contact: Contact, data: ContactUpdate) -> Contact:
        update_data = data.model_dump(exclude_none=True, exclude={"tag_ids"})

        # Handle explicit None values for optional fields
        for field, value in data.model_dump(exclude={"tag_ids"}).items():
            if value is None and field in {
                "last_name", "nickname", "email", "phone", "birthday",
                "how_we_met", "location", "company", "job_title", "notes",
                "photo_url", "last_contacted_at",
            }:
                setattr(contact, field, None)

        for field, value in update_data.items():
            setattr(contact, field, value)

        contact.updated_at = datetime.now(timezone.utc)

        if data.tag_ids is not None:
            tags_result = await self.db.execute(
                select(Tag).where(Tag.id.in_(data.tag_ids))
            )
            contact.tags = list(tags_result.scalars().all())

        await self.db.flush()
        await self.db.refresh(contact, attribute_names=["tags", "interactions"])
        return contact

    async def delete(self, contact: Contact) -> None:
        await self.db.delete(contact)
        await self.db.flush()

    async def add_tag(self, contact: Contact, tag: Tag) -> Contact:
        if tag not in contact.tags:
            contact.tags.append(tag)
        await self.db.flush()
        return contact

    async def remove_tag(self, contact: Contact, tag: Tag) -> Contact:
        if tag in contact.tags:
            contact.tags.remove(tag)
        await self.db.flush()
        return contact

    async def get_overdue_contacts(self) -> list[Contact]:
        now = datetime.now(timezone.utc)
        all_contacts_result = await self.db.execute(
            select(Contact)
            .options(selectinload(Contact.tags))
            .where(Contact.contact_frequency != ContactFrequency.never)
        )
        all_contacts = list(all_contacts_result.scalars().all())

        overdue = []
        for contact in all_contacts:
            days = FREQUENCY_DAYS.get(contact.contact_frequency)
            if days is None:
                continue
            if contact.last_contacted_at is None:
                overdue.append(contact)
                continue
            cutoff = now - timedelta(days=days)
            lca = contact.last_contacted_at
            if lca.tzinfo is None:
                lca = lca.replace(tzinfo=timezone.utc)
            if lca < cutoff:
                overdue.append(contact)

        return overdue

    async def count_all(self) -> int:
        result = await self.db.execute(select(func.count(Contact.id)))
        return result.scalar_one()

    async def count_new_this_month(self) -> int:
        now = datetime.now(timezone.utc)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        result = await self.db.execute(
            select(func.count(Contact.id)).where(Contact.created_at >= start_of_month)
        )
        return result.scalar_one()

    async def count_interactions_this_week(self) -> int:
        now = datetime.now(timezone.utc)
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        result = await self.db.execute(
            select(func.count(Interaction.id)).where(
                Interaction.interacted_at >= start_of_week
            )
        )
        return result.scalar_one()

    async def count_interactions_this_month(self) -> int:
        now = datetime.now(timezone.utc)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        result = await self.db.execute(
            select(func.count(Interaction.id)).where(
                Interaction.interacted_at >= start_of_month
            )
        )
        return result.scalar_one()

    async def get_recent_contacts(self, limit: int = 8) -> list[Contact]:
        result = await self.db.execute(
            select(Contact)
            .options(selectinload(Contact.tags))
            .order_by(Contact.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_recent_interactions(self, limit: int = 10) -> list[Interaction]:
        result = await self.db.execute(
            select(Interaction)
            .options(selectinload(Interaction.contact))
            .order_by(Interaction.interacted_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
