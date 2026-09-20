"""Create agent conversations and messages tables.

Revision ID: 0020_agent_conversations
Revises: 0019_reconcile_access_control
"""

import sqlalchemy as sa
from alembic import op

revision = "0020_agent_conversations"
down_revision = "0019_reconcile_access_control"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "agent_conversations" not in tables:
        op.create_table(
            "agent_conversations",
            sa.Column("id", sa.String(length=64), primary_key=True),
            sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id", ondelete="CASCADE"), nullable=False),
            sa.Column("doctor_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("title", sa.String(length=255), nullable=False, server_default="AI 放射与病历会诊"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index("ix_agent_conversations_patient_id", "agent_conversations", ["patient_id"])
        op.create_index("ix_agent_conversations_doctor_id", "agent_conversations", ["doctor_id"])

    if "agent_messages" not in tables:
        op.create_table(
            "agent_messages",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column(
                "conversation_id",
                sa.String(length=64),
                sa.ForeignKey("agent_conversations.id", ondelete="CASCADE"),
                nullable=False,
            ),
            sa.Column("role", sa.String(length=16), nullable=False),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column("tool_calls", sa.JSON(), nullable=True),
            sa.Column("selected_ct_series", sa.String(length=128), nullable=True),
            sa.Column("thought", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index("ix_agent_messages_conversation_id", "agent_messages", ["conversation_id"])


def downgrade():
    op.drop_table("agent_messages")
    op.drop_table("agent_conversations")
