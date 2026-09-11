"""Add all-label segmentation batches and compact model metadata."""

import sqlalchemy as sa
from alembic import op


revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "segmentation_batches",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("image_id", sa.String(length=64), sa.ForeignKey("medical_images.id"), nullable=False),
        sa.Column("requested_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("model_fingerprint", sa.String(length=200), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False, server_default="queued"),
        sa.Column("progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_labels", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("recognized_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("failed_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("label_map_path", sa.Text()),
        sa.Column("native_label_map_path", sa.Text()),
        sa.Column("error_message", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "status IN ('queued', 'running', 'completed', 'partial', 'failed', 'unavailable')",
            name="ck_batch_status",
        ),
        sa.CheckConstraint("progress >= 0 AND progress <= 100", name="ck_batch_progress"),
    )
    op.create_index("ix_batches_image_created", "segmentation_batches", ["image_id", "created_at"])
    op.create_index("ix_segmentation_batches_image_id", "segmentation_batches", ["image_id"])
    op.create_index(
        "uq_active_segmentation_batch",
        "segmentation_batches",
        ["image_id", "model_fingerprint"],
        unique=True,
        postgresql_where=sa.text("status IN ('queued', 'running')"),
        sqlite_where=sa.text("status IN ('queued', 'running')"),
    )
    with op.batch_alter_table("organ_models") as batch:
        batch.add_column(sa.Column("label_id", sa.Integer()))
        batch.add_column(sa.Column("label_name", sa.String(length=200)))
        batch.add_column(sa.Column("group_id", sa.String(length=64)))
        batch.add_column(sa.Column("face_count", sa.Integer()))
        batch.add_column(sa.Column("size_bytes", sa.Integer()))
        batch.add_column(sa.Column("volume_cm3", sa.Float()))
        batch.add_column(sa.Column("is_watertight", sa.Boolean()))
        batch.add_column(sa.Column("bounds", sa.JSON()))
    op.create_index("ix_models_image_label", "organ_models", ["image_id", "label_id"])
    op.create_index("ix_organ_models_group_id", "organ_models", ["group_id"])
    with op.batch_alter_table("segmentation_tasks") as batch:
        batch.add_column(sa.Column("batch_id", sa.String(length=64), sa.ForeignKey("segmentation_batches.id")))
        batch.add_column(sa.Column("label_id", sa.Integer()))
        batch.add_column(sa.Column("label_name", sa.String(length=200)))
        batch.add_column(sa.Column("group_id", sa.String(length=64)))
    op.create_index("ix_segmentation_tasks_batch_id", "segmentation_tasks", ["batch_id"])


def downgrade():
    op.drop_index("ix_segmentation_tasks_batch_id", table_name="segmentation_tasks")
    with op.batch_alter_table("segmentation_tasks") as batch:
        batch.drop_column("group_id")
        batch.drop_column("label_name")
        batch.drop_column("label_id")
        batch.drop_column("batch_id")
    op.drop_index("ix_organ_models_group_id", table_name="organ_models")
    op.drop_index("ix_models_image_label", table_name="organ_models")
    with op.batch_alter_table("organ_models") as batch:
        batch.drop_column("bounds")
        batch.drop_column("is_watertight")
        batch.drop_column("volume_cm3")
        batch.drop_column("size_bytes")
        batch.drop_column("face_count")
        batch.drop_column("group_id")
        batch.drop_column("label_name")
        batch.drop_column("label_id")
    op.drop_index("uq_active_segmentation_batch", table_name="segmentation_batches")
    op.drop_index("ix_segmentation_batches_image_id", table_name="segmentation_batches")
    op.drop_index("ix_batches_image_created", table_name="segmentation_batches")
    op.drop_table("segmentation_batches")
