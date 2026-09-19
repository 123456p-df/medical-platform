"""Add structured report templates and per-record structured data.

Revision ID: 0020_structured_reporting
Revises: 0019_reconcile_access_control
"""

import sqlalchemy as sa
from alembic import op

revision = "0020_structured_reporting"
down_revision = "0019_reconcile_access_control"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "report_templates",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("modality", sa.String(length=16), nullable=True),
        sa.Column("organ_id", sa.String(length=64), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("fields", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "modality IN ('CT', 'MRI', 'X-Ray') OR modality IS NULL",
            name="ck_report_template_modality",
        ),
    )
    op.create_index(
        "ix_report_templates_active_modality",
        "report_templates",
        ["is_active", "modality", "organ_id"],
    )

    op.add_column(
        "medical_records",
        sa.Column("report_template_id", sa.String(length=64), sa.ForeignKey("report_templates.id"), nullable=True),
    )
    op.add_column("medical_records", sa.Column("structured_data", sa.JSON(), nullable=True))


def downgrade():
    op.drop_column("medical_records", "structured_data")
    op.drop_column("medical_records", "report_template_id")
    op.drop_index("ix_report_templates_active_modality", table_name="report_templates")
    op.drop_table("report_templates")
