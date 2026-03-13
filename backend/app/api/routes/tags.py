from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories.tag import TagRepository
from app.schemas.tag import TagCreate, TagRead, TagUpdate

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[TagRead])
async def list_tags(db: AsyncSession = Depends(get_db)) -> list[TagRead]:
    repo = TagRepository(db)
    tags = await repo.get_all()
    return [TagRead.model_validate(t) for t in tags]


@router.post("", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def create_tag(data: TagCreate, db: AsyncSession = Depends(get_db)) -> TagRead:
    repo = TagRepository(db)
    tag = await repo.create(data)
    return TagRead.model_validate(tag)


@router.put("/{tag_id}", response_model=TagRead)
async def update_tag(
    tag_id: str, data: TagUpdate, db: AsyncSession = Depends(get_db)
) -> TagRead:
    repo = TagRepository(db)
    tag = await repo.get_by_id(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    tag = await repo.update(tag, data)
    return TagRead.model_validate(tag)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(tag_id: str, db: AsyncSession = Depends(get_db)) -> None:
    repo = TagRepository(db)
    tag = await repo.get_by_id(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    await repo.delete(tag)
