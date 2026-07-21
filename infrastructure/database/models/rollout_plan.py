from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SqlEnum,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.database.base import Base
from infrastructure.database.models.enums import RolloutPlanStatus
from infrastructure.database.models.rollout_stage import RolloutStage


class RolloutPlan(Base):
    """
    Defines a rollout strategy for a feature flag.

    A rollout plan consists of multiple ordered rollout stages
    (e.g. 1% → 5% → 25% → 50% → 100%).
    """

    __tablename__ = "rollout_plans"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    flag_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("flags.id", ondelete="CASCADE"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    status: Mapped[RolloutPlanStatus] = mapped_column(
        SqlEnum(RolloutPlanStatus),
        default=RolloutPlanStatus.PENDING,
        nullable=False,
    )

    current_stage_index: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    auto_advance: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    paused_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    flag = relationship(
        "Flag",
        back_populates="rollout_plan",
    )

    stages = relationship(
        "RolloutStage",
        back_populates="plan",
        cascade="all, delete-orphan",
        order_by="RolloutStage.order",
    )

    @property
    def is_active(self) -> bool:
        return self.status == RolloutPlanStatus.RUNNING

    @property
    def is_finished(self) -> bool:
        return self.status in {
            RolloutPlanStatus.COMPLETED,
            RolloutPlanStatus.ROLLED_BACK,
            RolloutPlanStatus.CANCELLED,
        }
