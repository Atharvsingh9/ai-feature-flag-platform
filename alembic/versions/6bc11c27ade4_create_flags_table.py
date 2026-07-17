"""create flags table

Revision ID: 6bc11c27ade4
Revises:
Create Date: 2026-07-17 15:18:47.241016
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6bc11c27ade4"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "flags",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),

        sa.Column(
            "name",
            sa.String(length=100),
            nullable=False,
        ),

        sa.Column(
            "description",
            sa.String(length=500),
            nullable=False,
        ),

        sa.Column(
            "baseline_variant",
            sa.String(length=100),
            nullable=False,
        ),

        sa.Column(
            "experimental_variant",
            sa.String(length=100),
            nullable=False,
        ),

        sa.Column(
            "quality_threshold",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "status",
            sa.Enum(
                "DRAFT",
                "ROLLING_OUT",
                "PAUSED",
                "COMPLETED",
                "ROLLED_BACK",
                name="flag_status",
            ),
            nullable=False,
        ),

        sa.Column(
            "rollout_percentage",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_index(
        "ix_flags_name",
        "flags",
        ["name"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index("ix_flags_name", table_name="flags")
    op.drop_table("flags")