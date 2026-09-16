"""Add patient onboarding invitations and audited global archives.

Revision ID: 0017_patient_onboarding_and_archives
Revises: 0016_dicom_business_links
"""

import sqlalchemy as sa
from alembic import op

revision = "0017_patient_onboarding_and_archives"
down_revision = "0016_dicom_business_links"
branch_labels = None
depends_on = None


def upgrade():
    # Alembic creates version_num as VARCHAR(32), but this revision identifier is longer.
    # Widen it inside the preceding revision's transaction before Alembic records this ID.
    op.alter_column(
        "alembic_version",
        "version_num",
        existing_type=sa.String(length=32),
        type_=sa.String(length=64),
        existing_nullable=False,
    )
    op.add_column(
        "patients",
        sa.Column("profile_completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_table(
        "patient_link_invitations",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("created_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_by_user_id", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("used_at", sa.DateTime(timezone=True)),
        sa.Column("revoked_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(
        "ix_patient_link_invitations_patient",
        "patient_link_invitations",
        ["patient_id", "created_at"],
    )
    op.create_index(
        "uq_active_patient_link_invitation",
        "patient_link_invitations",
        ["patient_id"],
        unique=True,
        postgresql_where=sa.text("used_at IS NULL AND revoked_at IS NULL"),
        sqlite_where=sa.text("used_at IS NULL AND revoked_at IS NULL"),
    )
    op.create_table(
        "patient_archives",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("reason", sa.String(500), nullable=False),
        sa.Column(
            "archived_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False
        ),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("restored_by_user_id", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("restored_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(
        "uq_active_patient_archive",
        "patient_archives",
        ["patient_id"],
        unique=True,
        postgresql_where=sa.text("restored_at IS NULL"),
        sqlite_where=sa.text("restored_at IS NULL"),
    )
    op.create_index("ix_patient_archives_archived_at", "patient_archives", ["archived_at"])


def downgrade():
    op.drop_index("ix_patient_archives_archived_at", table_name="patient_archives")
    op.drop_index("uq_active_patient_archive", table_name="patient_archives")
    op.drop_table("patient_archives")
    op.drop_index(
        "uq_active_patient_link_invitation", table_name="patient_link_invitations"
    )
    op.drop_index("ix_patient_link_invitations_patient", table_name="patient_link_invitations")
    op.drop_table("patient_link_invitations")
    op.drop_column("patients", "profile_completed_at")
