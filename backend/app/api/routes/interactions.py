from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.interaction import InteractionRepository
from app.repositories.contact import ContactRepository
from app.schemas.interaction import InteractionCreate, InteractionRead, InteractionUpdate

router = APIRouter(prefix="/interactions", tags=["interactions"])


@router.get("", response_model=list[InteractionRead])
async def list_interactions(
    contact_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
) -> list[InteractionRead]:
    repo = InteractionRepository(db)
    interactions = await repo.get_all(contact_id=contact_id)
    return [InteractionRead.model_validate(i) for i in interactions]


@router.post("", response_model=InteractionRead, status_code=status.HTTP_201_CREATED)
async def create_interaction(
    data: InteractionCreate, db: AsyncSession = Depends(get_db)
) -> InteractionRead:
    # Verify contact exists
    contact_repo = ContactRepository(db)
    contact = await contact_repo.get_by_id(data.contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    repo = InteractionRepository(db)
    interaction = await repo.create(data)

    # Update contact's last_contacted_at
    from app.schemas.contact import ContactUpdate
    from datetime import timezone, datetime
    lca = interaction.interacted_at
    if lca.tzinfo is None:
        lca = lca.replace(tzinfo=timezone.utc)
    if contact.last_contacted_at is None or lca > contact.last_contacted_at:
        contact_update = ContactUpdate(last_contacted_at=lca)
        await contact_repo.update(contact, contact_update)

    return InteractionRead.model_validate(interaction)


@router.get("/{interaction_id}", response_model=InteractionRead)
async def get_interaction(
    interaction_id: str, db: AsyncSession = Depends(get_db)
) -> InteractionRead:
    repo = InteractionRepository(db)
    interaction = await repo.get_by_id(interaction_id)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return InteractionRead.model_validate(interaction)


@router.put("/{interaction_id}", response_model=InteractionRead)
async def update_interaction(
    interaction_id: str,
    data: InteractionUpdate,
    db: AsyncSession = Depends(get_db),
) -> InteractionRead:
    repo = InteractionRepository(db)
    interaction = await repo.get_by_id(interaction_id)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    interaction = await repo.update(interaction, data)
    return InteractionRead.model_validate(interaction)


@router.delete("/{interaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interaction(
    interaction_id: str, db: AsyncSession = Depends(get_db)
) -> None:
    repo = InteractionRepository(db)
    interaction = await repo.get_by_id(interaction_id)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    await repo.delete(interaction)
