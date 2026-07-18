from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from infrastructure.database.base import Base


class VariantType(str, Enum):
    BASELINE = "baseline"
    EXPERIMENT = "experiment"


class FeedbackType(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NONE = "none"


class QualityScore(Base):
    """
    Stores the quality evaluation of a single AI response.

    Every response produced by a feature flag creates one QualityScore record.
    These records are later used to calculate rolling averages, quality trends,
    latency statistics, user satisfaction, and automatic rollback decisions.
    """

    __tablename__ = "quality_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    flag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("flags.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    request_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    user_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    variant: Mapped[VariantType] = mapped_column(
        SQLEnum(VariantType),
        nullable=False,
    )

    prompt_version: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    judge_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    overall_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    latency_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    error: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    feedback: Mapped[FeedbackType] = mapped_column(
        SQLEnum(FeedbackType),
        default=FeedbackType.NONE,
        nullable=False,
    )

    feedback_comment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    flag = relationship(
        "Flag",
        back_populates="quality_scores",
    )

    def __repr__(self) -> str:
        return (
            f"<QualityScore("
            f"id={self.id}, "
            f"flag_id={self.flag_id}, "
            f"variant={self.variant}, "
            f"overall_score={self.overall_score})>"
        )