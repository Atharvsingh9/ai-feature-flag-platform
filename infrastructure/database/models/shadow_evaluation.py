from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.database.base import Base


class ShadowEvaluation(Base):
    """
    Stores the result of a shadow execution.

    The baseline response is returned to the user, while the experimental
    response is evaluated in the background without affecting production
    traffic.
    """

    __tablename__ = "shadow_evaluations"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    flag_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("flags.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    baseline_response: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    experimental_response: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    judge_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    latency_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    has_error: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    flag = relationship(
        "Flag",
        backref="shadow_evaluations",
    )
