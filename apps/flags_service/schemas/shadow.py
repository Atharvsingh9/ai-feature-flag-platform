from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ShadowEvaluationCreate(BaseModel):
    """
    Request model used when storing a shadow evaluation.
    """

    flag_id: UUID

    user_id: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    baseline_response: str

    experimental_response: str

    judge_score: float = Field(
        ...,
        ge=0.0,
        le=5.0,
    )

    latency_ms: int = Field(
        ...,
        ge=0,
    )

    has_error: bool = False

    error_message: str | None = None


class ShadowEvaluationRead(BaseModel):
    """
    Response model returned from the API.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID

    flag_id: UUID

    user_id: str

    baseline_response: str

    experimental_response: str

    judge_score: float

    latency_ms: int

    has_error: bool

    error_message: str | None

    created_at: datetime