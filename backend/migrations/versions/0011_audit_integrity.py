"""Capture request provenance and make audit events append-only."""

import sqlalchemy as sa
from alembic import op

revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("audit_events", sa.Column("request_id", sa.String(length=64), nullable=True))
    op.add_column("audit_events", sa.Column("ip_address", sa.String(length=64), nullable=True))
    op.add_column("audit_events", sa.Column("user_agent", sa.String(length=512), nullable=True))
    op.create_index("ix_audit_events_request_id", "audit_events", ["request_id"])
    op.execute(
        """
        CREATE OR REPLACE FUNCTION prevent_audit_mutation() RETURNS trigger AS $$
        BEGIN
            RAISE EXCEPTION 'audit events are append-only';
        END;
        $$ LANGUAGE plpgsql;
        CREATE TRIGGER trg_audit_events_immutable
        BEFORE UPDATE OR DELETE ON audit_events
        FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
        """
    )


def downgrade():
    op.execute("DROP TRIGGER IF EXISTS trg_audit_events_immutable ON audit_events")
    op.execute("DROP FUNCTION IF EXISTS prevent_audit_mutation()")
    op.drop_index("ix_audit_events_request_id", table_name="audit_events")
    op.drop_column("audit_events", "user_agent")
