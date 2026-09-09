"""Patient archiving, personal profiles, files, and review workflow."""

import sqlalchemy as sa
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users", sa.Column("profile", sa.JSON(), nullable=False, server_default=sa.text("'{}'"))
    )
    op.add_column("patients", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.create_table(
        "profile_files",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("media_type", sa.String(64), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("file_path", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_profile_files_user_id", "profile_files", ["user_id"])
    op.create_table(
        "image_reviews",
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("image_id", sa.String(64), sa.ForeignKey("medical_images.id"), primary_key=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade():
    op.drop_table("image_reviews")
    op.drop_table("profile_files")
    op.drop_column("patients", "deleted_at")
    op.drop_column("users", "profile")
