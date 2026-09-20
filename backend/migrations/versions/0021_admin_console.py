"""Add admin user/session fields and report template version history.

Revision ID: 0021_admin_console
Revises: 0020_structured_reporting
"""

import sqlalchemy as sa
from alembic import op

revision = "0021_admin_console"
down_revision = "0020_structured_reporting"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("token_version", sa.Integer(), nullable=False, server_default="1"))
    op.add_column("users", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "report_templates",
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_table(
        "report_template_versions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "template_id",
            sa.String(length=64),
            sa.ForeignKey("report_templates.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("modality", sa.String(length=16), nullable=True),
        sa.Column("organ_id", sa.String(length=64), nullable=True),
        sa.Column("fields", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(
        "ix_report_template_versions_template",
        "report_template_versions",
        ["template_id", "version"],
    )


def downgrade():
    op.drop_index("ix_report_template_versions_template", table_name="report_template_versions")
    op.drop_table("report_template_versions")
    op.drop_column("report_templates", "is_default")
    op.drop_column("users", "deleted_at")
    op.drop_column("users", "token_version")
    op.drop_column("users", "last_login_at")
