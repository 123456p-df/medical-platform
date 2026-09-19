"""Add multi-provider AI configuration and invocation audit trail.

Revision ID: 0021_ai_providers_and_invocations
Revises: 0020_finding_measurement_provenance
"""

import sqlalchemy as sa
from alembic import op

revision = "0021_ai_providers_and_invocations"
down_revision = "0020_finding_measurement_provenance"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "ai_provider_configs",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("provider_id", sa.String(64), nullable=False, unique=True),
        sa.Column("display_name", sa.String(120), nullable=False),
        sa.Column("protocol", sa.String(32), nullable=False, server_default="chat_completions"),
        sa.Column("base_url", sa.String(500), nullable=False),
        sa.Column("api_key_env", sa.String(120), nullable=True),
        sa.Column("model_id", sa.String(160), nullable=False),
        sa.Column("capabilities", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("modalities", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("organs", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("status", sa.String(24), nullable=False, server_default="configured"),
        sa.Column("data_scope", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("timeout_seconds", sa.Integer(), nullable=False, server_default="60"),
        sa.Column("max_input_chars", sa.Integer(), nullable=False, server_default="30000"),
        sa.Column("max_output_chars", sa.Integer(), nullable=False, server_default="16000"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "status IN ('configured', 'connected', 'accepted', 'disabled')",
            name="ck_ai_provider_status",
        ),
    )

    op.create_table(
        "ai_invocations",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("examination_id", sa.String(64), sa.ForeignKey("medical_images.id")),
        sa.Column("organ_id", sa.String(64), nullable=False),
        sa.Column("purpose", sa.String(64), nullable=False),
        sa.Column("status", sa.String(24), nullable=False, server_default="queued"),
        sa.Column("provider_id", sa.String(64)),
        sa.Column("model_id", sa.String(160)),
        sa.Column("base_revision", sa.Integer()),
        sa.Column("input_snapshot", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("result", sa.JSON()),
        sa.Column("error_code", sa.Integer()),
        sa.Column("error_message", sa.Text()),
        sa.Column("idempotency_key", sa.String(128), unique=True),
        sa.Column("lease_owner", sa.String(128)),
        sa.Column("lease_expires_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'failed', 'cancelled')",
            name="ck_ai_invocation_status",
        ),
        sa.Index("ix_ai_invocations_patient_status", "patient_id", "status"),
    )

    op.create_table(
        "ai_invocation_attempts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("invocation_id", sa.String(64), sa.ForeignKey("ai_invocations.id"), nullable=False),
        sa.Column("attempt_number", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(24), nullable=False),
        sa.Column("provider_id", sa.String(64)),
        sa.Column("model_id", sa.String(160)),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("finished_at", sa.DateTime(timezone=True)),
        sa.Column("error_code", sa.Integer()),
        sa.Column("error_message", sa.Text()),
        sa.Column("usage", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'failed', 'cancelled')",
            name="ck_ai_attempt_status",
        ),
        sa.Index("ix_ai_attempts_invocation", "invocation_id", "attempt_number"),
    )


def downgrade():
    op.drop_table("ai_invocation_attempts")
    op.drop_table("ai_invocations")
    op.drop_table("ai_provider_configs")
