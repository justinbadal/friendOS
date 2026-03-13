"""sync last_contacted_at via db trigger

Revision ID: 002
Revises: 001
Create Date: 2025-01-02 00:00:00.000000

Adds a Postgres trigger on the interactions table that automatically keeps
contacts.last_contacted_at equal to MAX(interacted_at) for that contact.
Fires on INSERT, UPDATE, and DELETE so the value is always correct regardless
of what code path writes to interactions.

Also backfills existing rows on first run.
"""
from typing import Sequence, Union

from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Trigger function ──────────────────────────────────────────────────────
    # Called after any INSERT, UPDATE, or DELETE on interactions.
    # Recomputes MAX(interacted_at) for the affected contact and writes it back.
    op.execute("""
        CREATE OR REPLACE FUNCTION sync_last_contacted_at()
        RETURNS TRIGGER AS $$
        DECLARE
            affected_contact_id TEXT;
        BEGIN
            -- On DELETE, NEW is null — use OLD instead
            IF TG_OP = 'DELETE' THEN
                affected_contact_id := OLD.contact_id;
            ELSE
                affected_contact_id := NEW.contact_id;
            END IF;

            UPDATE contacts
            SET last_contacted_at = (
                SELECT MAX(interacted_at)
                FROM interactions
                WHERE contact_id = affected_contact_id
            )
            WHERE id = affected_contact_id;

            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # ── Trigger ───────────────────────────────────────────────────────────────
    op.execute("""
        CREATE TRIGGER trg_sync_last_contacted_at
        AFTER INSERT OR UPDATE OR DELETE ON interactions
        FOR EACH ROW EXECUTE FUNCTION sync_last_contacted_at();
    """)

    # ── Backfill existing data ────────────────────────────────────────────────
    # Run once so historical contacts are correct from day one.
    op.execute("""
        UPDATE contacts
        SET last_contacted_at = sub.latest
        FROM (
            SELECT contact_id, MAX(interacted_at) AS latest
            FROM interactions
            GROUP BY contact_id
        ) sub
        WHERE contacts.id = sub.contact_id;
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_sync_last_contacted_at ON interactions;")
    op.execute("DROP FUNCTION IF EXISTS sync_last_contacted_at;")
