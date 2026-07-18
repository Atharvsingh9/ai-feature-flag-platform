from __future__ import annotations

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class VariantType(str, Enum):
    BASELINE = "baseline"
    EXPERIMENT = "experiment"


class FeedbackType(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NONE = "none"


class QualityScoreCreate(BaseModel):
    """
    Schema used when recording a newly evaluated AI response.
    """

    flag_id: UUID
    request_id: str = Field(..., min_length=1, max_length=100)
    user_id: str = Field(..., min_length=1, max_length=100)

    variant: VariantType
    prompt_version: str

    judge_score: float = Field(..., ge=0.0, le=5.0)
    overall_score: float = Field(..., ge=0.0, le=5.0)

    latency_ms: int = Field(..., ge=0)

    error: bool = False
    error_message: str | None = None

    feedback: FeedbackType = FeedbackType.NONE
    feedback_comment: str | None = None


class QualityScoreRead(BaseModel):
    """
    Schema returned to services and API consumers.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    flag_id: UUID

    request_id: str
    user_id: str

    variant: VariantType
    prompt_version: str

    judge_score: float
    overall_score: float

    latency_ms: int

    error: bool
    error_message: str | None

    feedback: FeedbackType
    feedback_comment: str | None

    created_at: datetime