from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interaction import Interaction
from app.schemas.interaction import InteractionCreate, InteractionUpdate


class InteractionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, contact_id: str | None = None) -> list[Interaction]:
        query = select(Interaction).order_by(Interaction.interacted_at.desc())
        if contact_id:
            query = query.where(Interaction.contact_id == contact_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, interaction_id: str) -> Interaction | None:
        result = await self.db.execute(
            select(Interaction).where(Interaction.id == interaction_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: InteractionCreate) -> Interaction:
        interaction_data = data.model_dump()
        if interaction_data.get("interacted_at") is None:
            interaction_data["interacted_at"] = datetime.now(timezone.utc)
        interaction = Interaction(**interaction_data)
        self.db.add(interaction)
        await self.db.flush()
        await self.db.refresh(interaction)
        return interaction

    async def update(self, interaction: Interaction, data: InteractionUpdate) -> Interaction:
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(interaction, field, value)
        await self.db.flush()
        await self.db.refresh(interaction)
        return interaction

    async def delete(self, interaction: Interaction) -> None:
        await self.db.delete(interaction)
        await self.db.flush()
