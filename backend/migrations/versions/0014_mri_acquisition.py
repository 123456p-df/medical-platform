"""Store MRI sequence, contrast and segmentation-mode fields on images."""

from alembic import op
import sqlalchemy as sa

revision = "0014"
down_revision = "0013"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "medical_images",
        sa.Column("source_format", sa.String(length=16), server_default="nifti", nullable=False),
    )
    op.add_column("medical_images", sa.Column("series_uid", sa.String(length=64), nullable=True))
    op.add_column(
        "medical_images",
        sa.Column("sequence", sa.String(length=16), server_default="unknown", nullable=False),
    )
    op.add_column("medical_images", sa.Column("contrast", sa.Boolean(), nullable=True))
    op.add_column("medical_images", sa.Column("segmentation_mode", sa.String(length=16), nullable=True))
    op.add_column(
        "medical_images",
        sa.Column("sequence_confidence", sa.String(length=16), server_default="auto", nullable=False),
    )
    op.create_check_constraint(
        "ck_image_source_format",
        "medical_images",
        "source_format IN ('nifti', 'dicom')",
    )
    op.create_check_constraint(
        "ck_image_sequence",
        "medical_images",
        "sequence IN ('T1', 'T2', 'FLAIR', 'DWI', 'other', 'unknown')",
    )
    op.create_check_constraint(
        "ck_image_segmentation_mode",
        "medical_images",
        "segmentation_mode IS NULL OR segmentation_mode IN ('CT_BODY', 'MRI_BODY', 'MRI_BRAIN')",
    )
    op.create_check_constraint(
        "ck_image_sequence_confidence",
        "medical_images",
        "sequence_confidence IN ('auto', 'manual')",
    )


def downgrade():
    op.drop_constraint("ck_image_sequence_confidence", "medical_images", type_="check")
    op.drop_constraint("ck_image_segmentation_mode", "medical_images", type_="check")
    op.drop_constraint("ck_image_sequence", "medical_images", type_="check")
    op.drop_constraint("ck_image_source_format", "medical_images", type_="check")
    op.drop_column("medical_images", "sequence_confidence")
    op.drop_column("medical_images", "segmentation_mode")
    op.drop_column("medical_images", "contrast")
    op.drop_column("medical_images", "sequence")
    op.drop_column("medical_images", "series_uid")
    op.drop_column("medical_images", "source_format")
