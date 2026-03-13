from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.contact import ContactRepository
from app.repositories.tag import TagRepository
from app.schemas.contact import ContactCreate, ContactRead, ContactReadDetail, ContactUpdate

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=list[ContactRead])
async def list_contacts(
    search: str | None = Query(None),
    tag_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
) -> list[ContactRead]:
    repo = ContactRepository(db)
    contacts = await repo.get_all(search=search, tag_id=tag_id)
    return [ContactRead.model_validate(c) for c in contacts]


@router.post("", response_model=ContactReadDetail, status_code=status.HTTP_201_CREATED)
async def create_contact(
    data: ContactCreate, db: AsyncSession = Depends(get_db)
) -> ContactReadDetail:
    repo = ContactRepository(db)
    contact = await repo.create(data)
    return ContactReadDetail.model_validate(contact)


@router.get("/{contact_id}", response_model=ContactReadDetail)
async def get_contact(
    contact_id: str, db: AsyncSession = Depends(get_db)
) -> ContactReadDetail:
    repo = ContactRepository(db)
    contact = await repo.get_by_id(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return ContactReadDetail.model_validate(contact)


@router.put("/{contact_id}", response_model=ContactReadDetail)
async def update_contact(
    contact_id: str,
    data: ContactUpdate,
    db: AsyncSession = Depends(get_db),
) -> ContactReadDetail:
    repo = ContactRepository(db)
    contact = await repo.get_by_id(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    contact = await repo.update(contact, data)
    return ContactReadDetail.model_validate(contact)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: str, db: AsyncSession = Depends(get_db)
) -> None:
    repo = ContactRepository(db)
    contact = await repo.get_by_id(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    await repo.delete(contact)


@router.post("/{contact_id}/tags/{tag_id}", response_model=ContactRead)
async def add_tag_to_contact(
    contact_id: str,
    tag_id: str,
    db: AsyncSession = Depends(get_db),
) -> ContactRead:
    contact_repo = ContactRepository(db)
    tag_repo = TagRepository(db)

    contact = await contact_repo.get_by_id(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    tag = await tag_repo.get_by_id(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    contact = await contact_repo.add_tag(contact, tag)
    return ContactRead.model_validate(contact)


@router.delete("/{contact_id}/tags/{tag_id}", response_model=ContactRead)
async def remove_tag_from_contact(
    contact_id: str,
    tag_id: str,
    db: AsyncSession = Depends(get_db),
) -> ContactRead:
    contact_repo = ContactRepository(db)
    tag_repo = TagRepository(db)

    contact = await contact_repo.get_by_id(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    tag = await tag_repo.get_by_id(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    contact = await contact_repo.remove_tag(contact, tag)
    return ContactRead.model_validate(contact)
