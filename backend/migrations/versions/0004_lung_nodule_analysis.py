"""Add durable lung nodule analysis tasks and reviewable findings."""

import sqlalchemy as sa
from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "analysis_tasks",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("image_id", sa.String(64), sa.ForeignKey("medical_images.id"), nullable=False),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("analysis_type", sa.String(64), nullable=False),
        sa.Column("requested_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("model_name", sa.String(200), nullable=False),
        sa.Column("score_threshold", sa.Float(), nullable=False),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("progress", sa.Integer(), nullable=False),
        sa.Column("result_count", sa.Integer(), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'failed')",
            name="ck_analysis_task_status",
        ),
        sa.CheckConstraint(
            "progress >= 0 AND progress <= 100", name="ck_analysis_task_progress"
        ),
        sa.CheckConstraint(
            "score_threshold >= 0 AND score_threshold <= 1",
            name="ck_analysis_score_threshold",
        ),
    )
    op.create_index(
        "uq_active_analysis",
        "analysis_tasks",
        ["image_id", "analysis_type"],
        unique=True,
        postgresql_where=sa.text("status IN ('queued', 'running')"),
        sqlite_where=sa.text("status IN ('queued', 'running')"),
    )
    op.create_index(
        "ix_analysis_patient_created",
        "analysis_tasks",
        ["patient_id", "created_at"],
    )
    op.create_table(
        "findings",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("task_id", sa.String(64), sa.ForeignKey("analysis_tasks.id"), nullable=False),
        sa.Column("image_id", sa.String(64), sa.ForeignKey("medical_images.id"), nullable=False),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("finding_type", sa.String(64), nullable=False),
        sa.Column("model_label", sa.String(100), nullable=False),
        sa.Column("label", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("diameter_mm", sa.Float(), nullable=False),
        sa.Column("coordinate_system", sa.String(8), nullable=False),
        sa.Column("box_mode", sa.String(16), nullable=False),
        sa.Column("center_world_mm", sa.JSON(), nullable=False),
        sa.Column("box_world_mm", sa.JSON(), nullable=False),
        sa.Column("center_voxel", sa.JSON(), nullable=False),
        sa.Column("box_voxel", sa.JSON(), nullable=False),
        sa.Column("side", sa.String(16), nullable=True),
        sa.Column("lobe", sa.String(64), nullable=True),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("reviewed_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "status IN ('pending', 'confirmed', 'modified', 'dismissed')",
            name="ck_finding_status",
        ),
        sa.CheckConstraint(
            "confidence >= 0 AND confidence <= 1", name="ck_finding_confidence"
        ),
        sa.CheckConstraint("diameter_mm > 0", name="ck_finding_diameter"),
        sa.CheckConstraint("coordinate_system = 'RAS'", name="ck_finding_coordinate_system"),
        sa.CheckConstraint("box_mode = 'cccwhd'", name="ck_finding_box_mode"),
    )
    op.create_index("ix_findings_task_id", "findings", ["task_id"])
    op.create_index("ix_findings_image_status", "findings", ["image_id", "status"])
    op.create_index("ix_findings_patient_created", "findings", ["patient_id", "created_at"])


def downgrade():
    op.drop_index("ix_findings_patient_created", table_name="findings")
    op.drop_index("ix_findings_image_status", table_name="findings")
    op.drop_index("ix_findings_task_id", table_name="findings")
    op.drop_table("findings")
    op.drop_index("ix_analysis_patient_created", table_name="analysis_tasks")
    op.drop_index(
        "uq_active_analysis",
        table_name="analysis_tasks",
        postgresql_where=sa.text("status IN ('queued', 'running')"),
        sqlite_where=sa.text("status IN ('queued', 'running')"),
    )
    op.drop_table("analysis_tasks")
