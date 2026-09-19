"""Separate detection box extent from clinical measurements.

Revision ID: 0022_finding_provenance
Revises: 0021_report_workflow
"""

import sqlalchemy as sa
from alembic import op

revision = "0022_finding_provenance"
down_revision = "0021_report_workflow"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "findings",
        sa.Column("box_extent_mm", sa.Float(), nullable=True),
    )
    op.add_column(
        "findings",
        sa.Column("measurement_mm", sa.Float(), nullable=True),
    )
    op.add_column(
        "findings",
        sa.Column("measurement_method", sa.String(64), nullable=True),
    )
    op.add_column(
        "findings",
        sa.Column("measurement_status", sa.String(24), nullable=False, server_default="candidate"),
    )
    op.add_column(
        "findings",
        sa.Column("side_evidence", sa.String(64), nullable=True),
    )
    op.create_check_constraint(
        "ck_finding_measurement",
        "findings",
        "measurement_mm IS NULL OR measurement_mm > 0",
    )
    op.execute(
        """
        UPDATE findings
        SET box_extent_mm = diameter_mm,
            measurement_method = 'box_extent_max',
            measurement_status = 'candidate',
            side_evidence = 'legacy'
        """
    )


def downgrade():
    op.drop_column("findings", "side_evidence")
    op.drop_column("findings", "measurement_status")
    op.drop_column("findings", "measurement_method")
    op.drop_column("findings", "measurement_mm")
    op.drop_column("findings", "box_extent_mm")
