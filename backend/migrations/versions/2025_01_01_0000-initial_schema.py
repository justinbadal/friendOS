"""initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "tags",
        sa.Column(
            "id",
            sa.String(36),
            server_default=sa.text("gen_random_uuid()::text"),
            nullable=False,
        ),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("color", sa.String(7), nullable=False, server_default="#00E5FF"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "contacts",
        sa.Column(
            "id",
            sa.String(36),
            server_default=sa.text("gen_random_uuid()::text"),
            nullable=False,
        ),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=True),
        sa.Column("nickname", sa.String(100), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("birthday", sa.Date(), nullable=True),
        sa.Column("how_we_met", sa.Text(), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("company", sa.String(255), nullable=True),
        sa.Column("job_title", sa.String(255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("photo_url", sa.String(500), nullable=True),
        sa.Column(
            "contact_frequency",
            sa.Enum(
                "daily",
                "weekly",
                "monthly",
                "quarterly",
                "annually",
                "never",
                name="contactfrequency",
            ),
            nullable=False,
            server_default="monthly",
        ),
        sa.Column("last_contacted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "contact_tags",
        sa.Column("contact_id", sa.String(36), nullable=False),
        sa.Column("tag_id", sa.String(36), nullable=False),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("contact_id", "tag_id"),
    )

    op.create_table(
        "interactions",
        sa.Column(
            "id",
            sa.String(36),
            server_default=sa.text("gen_random_uuid()::text"),
            nullable=False,
        ),
        sa.Column("contact_id", sa.String(36), nullable=False),
        sa.Column(
            "interacted_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "interaction_type",
            sa.Enum(
                "call",
                "text",
                "in_person",
                "email",
                "social",
                "other",
                name="interactiontype",
            ),
            nullable=False,
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "sentiment",
            sa.Enum(
                "great", "good", "neutral", "difficult", name="sentiment"
            ),
            nullable=False,
            server_default="good",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("ix_contacts_first_name", "contacts", ["first_name"])
    op.create_index("ix_contacts_last_name", "contacts", ["last_name"])
    op.create_index("ix_interactions_contact_id", "interactions", ["contact_id"])
    op.create_index("ix_interactions_interacted_at", "interactions", ["interacted_at"])


def downgrade() -> None:
    op.drop_index("ix_interactions_interacted_at", "interactions")
    op.drop_index("ix_interactions_contact_id", "interactions")
    op.drop_index("ix_contacts_last_name", "contacts")
    op.drop_index("ix_contacts_first_name", "contacts")
    op.drop_table("interactions")
    op.drop_table("contact_tags")
    op.drop_table("contacts")
    op.drop_table("tags")
    op.execute("DROP TYPE IF EXISTS contactfrequency")
    op.execute("DROP TYPE IF EXISTS interactiontype")
    op.execute("DROP TYPE IF EXISTS sentiment")
