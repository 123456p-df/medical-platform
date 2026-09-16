"""Reconcile access-control columns for databases stamped by older builds.

Revision ID: 0019_reconcile_access_control
Revises: 0018_merge_mri_and_v5
"""

import sqlalchemy as sa
from alembic import op

revision = "0019_reconcile_access_control"
down_revision = "0018_merge_mri_and_v5"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "is_active" not in user_columns:
        op.add_column(
            "users",
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        )

    tables = set(inspector.get_table_names())
    if "jwt_revocations" not in tables:
        op.create_table(
            "jwt_revocations",
            sa.Column("jti", sa.String(length=64), primary_key=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_jwt_revocations_user_id", "jwt_revocations", ["user_id"])

    checks = {item["name"]: item for item in inspector.get_check_constraints("users")}
    role_check = checks.get("ck_users_role")
    if role_check is None or "admin" not in str(role_check.get("sqltext", "")).lower():
        if role_check is not None:
            op.drop_constraint("ck_users_role", "users", type_="check")
        op.create_check_constraint(
            "ck_users_role",
            "users",
            "role IN ('admin', 'doctor', 'patient')",
        )


def downgrade():
    # This is an idempotent repair of the schema introduced by 0009. Reverting it
    # must not remove canonical access-control fields from otherwise healthy databases.
    pass
