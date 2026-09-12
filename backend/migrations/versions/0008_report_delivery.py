"""Persist report drafts and deliver only signed reports to patients."""

import sqlalchemy as sa
from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("medical_records", sa.Column("examination_id", sa.String(64), nullable=True))
    op.add_column(
        "medical_records",
        sa.Column("recommendation", sa.Text(), nullable=False, server_default=""),
    )
    op.add_column(
        "medical_records",
        sa.Column("reviewed", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.add_column("medical_records", sa.Column("signed_at", sa.DateTime(timezone=True)))
    op.create_foreign_key(
        "fk_medical_records_examination",
        "medical_records",
        "medical_images",
        ["examination_id"],
        ["id"],
    )
    op.create_index("ix_medical_records_examination", "medical_records", ["examination_id"])
    op.execute("UPDATE medical_records SET signed_at = updated_at WHERE reviewed = true")


def downgrade():
    op.drop_index("ix_medical_records_examination", table_name="medical_records")
    op.drop_constraint("fk_medical_records_examination", "medical_records", type_="foreignkey")
    op.drop_column("medical_records", "signed_at")
    op.drop_column("medical_records", "reviewed")
    op.drop_column("medical_records", "recommendation")
    op.drop_column("medical_records", "examination_id")
