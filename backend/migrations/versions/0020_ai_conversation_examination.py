"""Add optional examination scope to AI conversations.

Revision ID: 0018_ai_conversation_examination
Revises: 0017_patient_onboarding_and_archives
"""

import sqlalchemy as sa
from alembic import op

revision = "0020_ai_conversation_examination"
down_revision = "0019_reconcile_access_control"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "ai_conversations",
        sa.Column(
            "examination_id",
            sa.String(64),
            sa.ForeignKey("medical_images.id"),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_ai_conversations_examination_id",
        "ai_conversations",
        ["examination_id"],
    )


def downgrade():
    op.drop_index("ix_ai_conversations_examination_id", table_name="ai_conversations")
    op.drop_column("ai_conversations", "examination_id")
