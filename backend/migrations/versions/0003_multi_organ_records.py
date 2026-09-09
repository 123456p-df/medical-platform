"""A medical record can be associated with multiple organs."""

import sqlalchemy as sa
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "record_organs",
        sa.Column(
            "record_id",
            sa.Integer(),
            sa.ForeignKey("medical_records.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("organ_id", sa.String(64), primary_key=True),
    )
    op.execute(
        "INSERT INTO record_organs (record_id, organ_id) SELECT id, organ_id FROM medical_records"
    )


def downgrade():
    op.drop_table("record_organs")
