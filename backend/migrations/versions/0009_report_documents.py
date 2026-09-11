"""Add the Markdown document pointer for agent-readable reports."""

import sqlalchemy as sa
from alembic import op


revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("medical_records") as batch:
        batch.add_column(sa.Column("content_path", sa.Text(), nullable=True))
        batch.add_column(sa.Column("content_sha256", sa.String(length=64), nullable=True))
        batch.add_column(sa.Column("content_size", sa.Integer(), nullable=True))
        batch.add_column(sa.Column("content_revision", sa.Integer(), nullable=True))


def downgrade():
    with op.batch_alter_table("medical_records") as batch:
        batch.drop_column("content_revision")
        batch.drop_column("content_size")
        batch.drop_column("content_sha256")
        batch.drop_column("content_path")
