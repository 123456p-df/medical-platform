"""Make signed records append-only and store auditable addenda."""

import sqlalchemy as sa
from alembic import op

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "record_addenda",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("record_id", sa.Integer(), sa.ForeignKey("medical_records.id"), nullable=False),
        sa.Column("author_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("reason", sa.String(length=200), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_record_addenda_record_id", "record_addenda", ["record_id"])
    op.create_index("ix_record_addenda_author_user_id", "record_addenda", ["author_user_id"])
    op.execute(
        """
        CREATE OR REPLACE FUNCTION prevent_signed_record_mutation() RETURNS trigger AS $$
        BEGIN
            IF OLD.signed_at IS NOT NULL THEN
                RAISE EXCEPTION 'signed medical records are immutable';
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        CREATE TRIGGER trg_medical_records_immutable
        BEFORE UPDATE OR DELETE ON medical_records
        FOR EACH ROW EXECUTE FUNCTION prevent_signed_record_mutation();
        """
    )

