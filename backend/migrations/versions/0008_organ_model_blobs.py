"""Store GLB binaries in the database and capture CT acquisition fingerprints."""

import hashlib

import sqlalchemy as sa
from alembic import op


revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("medical_images") as batch:
        batch.add_column(sa.Column("acquisition", sa.JSON(), server_default=sa.text("'{}'")))
    with op.batch_alter_table("organ_models") as batch:
        batch.add_column(sa.Column("kind", sa.String(length=16), server_default="organ", nullable=False))
        batch.alter_column("file_path", existing_type=sa.Text(), nullable=True)
    op.create_index(
        "uq_image_atlas",
        "organ_models",
        ["image_id"],
        unique=True,
        postgresql_where=sa.text("kind = 'atlas'"),
        sqlite_where=sa.text("kind = 'atlas'"),
    )
    op.create_table(
        "organ_model_blobs",
        sa.Column("model_id", sa.String(length=64), sa.ForeignKey("organ_models.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("data", sa.LargeBinary(), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("content_type", sa.String(length=64), nullable=False, server_default="model/gltf-binary"),
    )
    bind = op.get_bind()
    rows = bind.execute(sa.text("SELECT id, file_path FROM organ_models WHERE file_path IS NOT NULL"))
    # File bytes are copied by the application after migrate when storage_root is known.
    _ = hashlib.sha256, rows


def downgrade():
    op.drop_table("organ_model_blobs")
    op.drop_index("uq_image_atlas", table_name="organ_models")
    with op.batch_alter_table("organ_models") as batch:
        batch.drop_column("kind")
    with op.batch_alter_table("medical_images") as batch:
        batch.drop_column("acquisition")
