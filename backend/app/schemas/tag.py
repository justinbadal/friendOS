from datetime import datetime

from pydantic import BaseModel, Field


class TagBase(BaseModel):
    name: str = Field(..., max_length=100)
    color: str = Field(default="#00E5FF", pattern=r"^#[0-9A-Fa-f]{6}$")


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    color: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class TagRead(TagBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}
