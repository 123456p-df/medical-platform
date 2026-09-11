"""Add indexes used by audit and doctor-scoped record queries."""

from alembic import op

revision = "0013"
down_revision = "0012"
branch_labels = None
depends_on = None


def upgrade():
    op.create_index("ix_records_doctor_id", "medical_records", ["doctor_id"])
    op.create_index("ix_audit_events_actor_user_id", "audit_events", ["actor_user_id"])


def downgrade():
    op.drop_index("ix_audit_events_actor_user_id", table_name="audit_events")
    op.drop_index("ix_records_doctor_id", table_name="medical_records")
