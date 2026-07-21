from __future__ import annotations

from enum import Enum

from sqlalchemy import (
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from infrastructure.database.base import Base
from infrastructure.database.mixins import TimestampMixin


class RolloutEventType(str, Enum):
    CREATED = "CREATED"
    ROLLOUT_STARTED = "ROLLOUT_STARTED"
    PAUSED = "PAUSED"
    RESUMED = "RESUMED"
    ROLLED_BACK = "ROLLED_BACK"
    COMPLETED = "COMPLETED"


class RolloutEvent(Base, TimestampMixin):
    __tablename__ = "rollout_events"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    flag_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("flags.id"),
        nullable=False,
    )

    event_type: Mapped[RolloutEventType] = mapped_column(
        SQLEnum(RolloutEventType),
        nullable=False,
    )

    actor: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    reason: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    previous_percentage: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    new_percentage: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    flag: Mapped["Flag"] = relationship(
        "Flag",
        back_populates="events",
    )
