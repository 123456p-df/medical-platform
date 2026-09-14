"""Make new medical records drafts unless explicitly signed.

Revision ID: 0014_record_draft_default
Revises: 0013_audit_query_indexes
"""

from alembic import op
from sqlalchemy import text

revision = "0014_record_draft_default"
down_revision = "0013"
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column("medical_records", "reviewed", server_default=text("false"))


def downgrade():
    op.alter_column("medical_records", "reviewed", server_default=text("true"))
