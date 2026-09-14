"""Link archived DICOM objects to patients and future medical images.

Revision ID: 0016_dicom_business_links
Revises: 0015_finding_revision
"""

import sqlalchemy as sa
from alembic import op

revision = "0016_dicom_business_links"
down_revision = "0015_finding_revision"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "dicom_studies",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("orthanc_study_id", sa.String(128), nullable=False, unique=True),
        sa.Column("study_instance_uid", sa.String(128), unique=True),
        sa.Column("dicom_patient_id", sa.String(128)),
        sa.Column("modality", sa.String(16)),
        sa.Column("study_date", sa.Date()),
        sa.Column("description", sa.String(300)),
        sa.Column("status", sa.String(16), nullable=False, server_default="receiving"),
        sa.Column("instance_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "status IN ('receiving', 'archived', 'converting', 'ready', 'failed')",
            name="ck_dicom_study_status",
        ),
    )
    op.create_index("ix_dicom_study_patient_date", "dicom_studies", ["patient_id", "study_date"])
    op.create_table(
        "dicom_series",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("study_id", sa.String(64), sa.ForeignKey("dicom_studies.id"), nullable=False),
        sa.Column("orthanc_series_id", sa.String(128), nullable=False, unique=True),
        sa.Column("series_instance_uid", sa.String(128), unique=True),
        sa.Column("modality", sa.String(16)),
        sa.Column("description", sa.String(300)),
        sa.Column("rows", sa.Integer()),
        sa.Column("columns", sa.Integer()),
        sa.Column("frame_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("instance_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("medical_image_id", sa.String(64), sa.ForeignKey("medical_images.id")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_dicom_series_study", "dicom_series", ["study_id"])
    op.create_table(
        "dicom_instances",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("series_id", sa.String(64), sa.ForeignKey("dicom_series.id"), nullable=False),
        sa.Column("orthanc_instance_id", sa.String(128), nullable=False, unique=True),
        sa.Column("sop_instance_uid", sa.String(128), unique=True),
        sa.Column("instance_number", sa.Integer()),
        sa.Column("number_of_frames", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("transfer_syntax_uid", sa.String(128)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_dicom_instance_series", "dicom_instances", ["series_id"])


def downgrade():
    op.drop_index("ix_dicom_instance_series", table_name="dicom_instances")
    op.drop_table("dicom_instances")
    op.drop_index("ix_dicom_series_study", table_name="dicom_series")
    op.drop_table("dicom_series")
    op.drop_index("ix_dicom_study_patient_date", table_name="dicom_studies")
    op.drop_table("dicom_studies")
