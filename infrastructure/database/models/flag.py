from __future__ import annotations

from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Enum,
    Float,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship

from infrastructure.database.base import Base
from infrastructure.database.mixins import TimestampMixin
from infrastructure.database.models.enums import FlagStatus


class Flag(Base, TimestampMixin):
    __tablename__ = "flags"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    description: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    baseline_variant: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    experimental_variant: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    quality_threshold: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    status: Mapped[FlagStatus] = mapped_column(
        Enum(
            FlagStatus,
            name="flag_status",
        ),
        nullable=False,
        default=FlagStatus.DRAFT,
    )

    rollout_percentage: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    shadow_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    shadow_sample_percentage: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=100,
    )

    events: Mapped[list["RolloutEvent"]] = relationship(
        "RolloutEvent",
        back_populates="flag",
        cascade="all, delete-orphan",
    )
    quality_scores = relationship(
        "QualityScore",
        back_populates="flag",
        cascade="all, delete-orphan",
    )
    rollout_plan: Mapped["RolloutPlan | None"] = relationship(
        "RolloutPlan",
        back_populates="flag",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"Flag(id={self.id}, "
            f"name='{self.name}', "
            f"status='{self.status.value}', "
            f"rollout={self.rollout_percentage}%)"
        )
