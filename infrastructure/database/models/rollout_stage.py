from __future__ import annotations

from datetime import timedelta

from sqlalchemy import (
    Boolean,
    Enum,
    Float,
    ForeignKey,
    Integer,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.database.base import Base
from infrastructure.database.mixins import TimestampMixin
from infrastructure.database.models.enums import RolloutStageStatus


class RolloutStage(Base, TimestampMixin):
    """
    Represents a single stage within a rollout plan.

    Example:

    Stage 1 -> 1%
    Stage 2 -> 5%
    Stage 3 -> 25%
    Stage 4 -> 50%
    Stage 5 -> 100%
    """

    __tablename__ = "rollout_stages"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    rollout_plan_id: Mapped[int] = mapped_column(
        ForeignKey(
            "rollout_plans.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    traffic_percentage: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    duration_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    minimum_quality_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    minimum_sample_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=100,
    )

    auto_promote: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    status: Mapped[RolloutStageStatus] = mapped_column(
        Enum(
            RolloutStageStatus,
            name="rollout_stage_status",
        ),
        nullable=False,
        default=RolloutStageStatus.PENDING,
    )

    plan: Mapped["RolloutPlan"] = relationship(
        "RolloutPlan",
        back_populates="stages",
    )

    @property
    def duration(self) -> timedelta:
        """
        Returns the stage duration as a timedelta.
        """
        return timedelta(minutes=self.duration_minutes)

    def __repr__(self) -> str:
        return (
            f"RolloutStage("
            f"order={self.order}, "
            f"traffic={self.traffic_percentage}%, "
            f"quality={self.minimum_quality_score}, "
            f"status={self.status.value})"
        )