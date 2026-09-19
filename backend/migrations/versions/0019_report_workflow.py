"""Add report tasks, revisions, and workflow events.

Revision ID: 0019_report_workflow
Revises: 0018_ai_conversation_examination
"""

import sqlalchemy as sa
from alembic import op

revision = "0019_report_workflow"
down_revision = "0018_ai_conversation_examination"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "medical_records",
        sa.Column("status", sa.String(24), nullable=False, server_default="draft"),
    )
    op.add_column(
        "medical_records",
        sa.Column("revision", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "medical_records",
        sa.Column("signed_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
    )
    op.create_check_constraint(
        "ck_medical_record_status",
        "medical_records",
        "status IN ('draft', 'pending_review', 'signed', 'cancelled')",
    )
    op.create_index("ix_medical_records_examination", "medical_records", ["examination_id"])

    op.create_table(
        "report_tasks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column(
            "examination_id",
            sa.String(64),
            sa.ForeignKey("medical_images.id"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(24),
            nullable=False,
            server_default="pending_draft",
        ),
        sa.Column("assigned_doctor_id", sa.Integer(), sa.ForeignKey("doctors.id")),
        sa.Column("primary_record_id", sa.Integer(), sa.ForeignKey("medical_records.id")),
        sa.Column("idempotency_key", sa.String(128), unique=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("patient_id", "examination_id", name="uq_report_task_examination"),
    )
    op.create_check_constraint(
        "ck_report_task_status",
        "report_tasks",
        "status IN ('pending_draft', 'drafting', 'in_review', 'signed', 'cancelled')",
    )
    op.create_index("ix_report_tasks_patient_status", "report_tasks", ["patient_id", "status"])

    op.create_table(
        "report_revision_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("record_id", sa.Integer(), sa.ForeignKey("medical_records.id"), nullable=False),
        sa.Column("revision", sa.Integer(), nullable=False),
        sa.Column(
            "action",
            sa.String(32),
            nullable=False,
        ),
        sa.Column("from_status", sa.String(24)),
        sa.Column("to_status", sa.String(24)),
        sa.Column("actor_user_id", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("reason", sa.String(500)),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Index("ix_report_events_record_revision", "record_id", "revision"),
    )
    op.create_check_constraint(
        "ck_report_event_action",
        "report_revision_events",
        "action IN ('created', 'draft_saved', 'submitted', 'signed', 'reopened', 'cancelled')",
    )

    op.execute(
        "UPDATE medical_records SET status = 'signed' "
        "WHERE reviewed IS TRUE OR signed_at IS NOT NULL"
    )
    op.execute(
        """
        INSERT INTO report_tasks (
            patient_id,
            examination_id,
            status,
            created_at,
            updated_at
        )
        SELECT
            image.patient_id,
            image.id,
            'pending_draft',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        FROM medical_images AS image
        WHERE NOT EXISTS (
            SELECT 1
            FROM report_tasks AS task
            WHERE task.examination_id = image.id
              AND task.patient_id = image.patient_id
        )
        """
    )
    op.execute(
        """
        UPDATE report_tasks
        SET primary_record_id = (
            SELECT record.id
            FROM medical_records AS record
            WHERE record.examination_id = report_tasks.examination_id
              AND record.deleted_at IS NULL
            ORDER BY
                CASE WHEN record.signed_at IS NULL THEN 1 ELSE 0 END,
                record.signed_at DESC,
                record.updated_at DESC
            LIMIT 1
        )
        """
    )
    op.execute(
        """
        UPDATE report_tasks
        SET status = COALESCE(
            (
                SELECT CASE
                    WHEN record.status = 'signed' THEN 'signed'
                    WHEN record.status = 'pending_review' THEN 'in_review'
                    WHEN record.status = 'draft' THEN 'drafting'
                    ELSE 'cancelled'
                END
                FROM medical_records AS record
                WHERE record.id = report_tasks.primary_record_id
            ),
            'pending_draft'
        )
        """
    )


def downgrade():
    op.drop_table("report_revision_events")
    op.drop_index("ix_report_tasks_patient_status", table_name="report_tasks")
    op.drop_table("report_tasks")
    op.drop_index("ix_medical_records_examination", table_name="medical_records")
    op.drop_column("medical_records", "signed_by_user_id")
    op.drop_column("medical_records", "revision")
    op.drop_column("medical_records", "status")
