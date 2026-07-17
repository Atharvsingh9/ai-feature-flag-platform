from __future__ import annotations

from sqlalchemy import Enum, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship

from infrastructure.database.base import Base
from infrastructure.database.mixins import TimestampMixin
from infrastructure.database.models.enums import FlagStatus
from infrastructure.database.models.rollout_event import RolloutEvent


class Flag(Base, TimestampMixin):
    __tablename__ = "flags"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
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

    events: Mapped[list["RolloutEvent"]] = relationship(
    "RolloutEvent",
    back_populates="flag",
    cascade="all, delete-orphan",
)

    def __repr__(self) -> str:
        return (
            f"Flag(id={self.id}, "
            f"name='{self.name}', "
            f"status='{self.status.value}', "
            f"rollout={self.rollout_percentage}%)"
        )