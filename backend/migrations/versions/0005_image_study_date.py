"""Add the clinical study date used for longitudinal image comparison."""

import sqlalchemy as sa
from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("medical_images", sa.Column("study_date", sa.Date(), nullable=True))
    op.execute("UPDATE medical_images SET study_date = DATE(created_at)")


def downgrade():
    op.drop_column("medical_images", "study_date")
