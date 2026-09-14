"""Add optimistic revision tracking to findings.

Revision ID: 0015_finding_revision
Revises: 0014_record_draft_default
"""

import sqlalchemy as sa
from alembic import op

revision = "0015_finding_revision"
down_revision = "0014_record_draft_default"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "findings",
        sa.Column("revision", sa.Integer(), server_default=sa.text("1"), nullable=False),
    )


def downgrade():
    op.drop_column("findings", "revision")
