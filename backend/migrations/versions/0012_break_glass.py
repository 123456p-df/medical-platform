"""Add audited, time-limited read-only emergency access grants."""

import sqlalchemy as sa
from alembic import op

revision = "0012"
down_revision = "0011"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "break_glass_grants",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("doctor_id", sa.Integer(), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("reason", sa.String(length=500), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_break_glass_grants_doctor_id", "break_glass_grants", ["doctor_id"])
    op.create_index("ix_break_glass_grants_patient_id", "break_glass_grants", ["patient_id"])
    op.create_index(
        "ix_break_glass_doctor_patient",
        "break_glass_grants",
        ["doctor_id", "patient_id", "expires_at"],
    )


def downgrade():
    op.drop_index("ix_break_glass_doctor_patient", table_name="break_glass_grants")
    op.drop_index("ix_break_glass_grants_patient_id", table_name="break_glass_grants")
    op.drop_index("ix_break_glass_grants_doctor_id", table_name="break_glass_grants")
    op.drop_table("break_glass_grants")
