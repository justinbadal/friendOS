from app.schemas.contact import ContactCreate, ContactRead, ContactReadDetail, ContactUpdate
from app.schemas.interaction import InteractionCreate, InteractionRead, InteractionUpdate
from app.schemas.tag import TagCreate, TagRead, TagUpdate
from app.schemas.dashboard import DashboardStats

__all__ = [
    "ContactCreate",
    "ContactRead",
    "ContactReadDetail",
    "ContactUpdate",
    "InteractionCreate",
    "InteractionRead",
    "InteractionUpdate",
    "TagCreate",
    "TagRead",
    "TagUpdate",
    "DashboardStats",
]
