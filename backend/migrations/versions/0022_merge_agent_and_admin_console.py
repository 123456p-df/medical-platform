"""Merge the agent conversation and admin console migration branches.

Revision ID: 0022_merge_agent_and_admin_console
Revises: 0020_agent_conversations, 0021_admin_console
"""

import sqlalchemy as sa
from alembic import op

revision = "0022_merge_agent_and_admin_console"
down_revision = ("0020_agent_conversations", "0021_admin_console")
branch_labels = None
depends_on = None


def upgrade():
    # Keep the revision column wide enough for the named branch revisions.
    op.alter_column(
        "alembic_version",
        "version_num",
        existing_type=sa.String(length=32),
        type_=sa.String(length=64),
        existing_nullable=False,
    )


def downgrade():
    pass
