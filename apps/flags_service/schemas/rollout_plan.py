from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from infrastructure.database.models.enums import RolloutPlanStatus


class RolloutStageCreate(BaseModel):
    """
    Schema for creating a rollout stage.
    """

    order: int = Field(..., ge=1)
    traffic_percentage: int = Field(..., ge=0, le=100)
    duration_minutes: int = Field(..., gt=0)
    minimum_quality_score: float = Field(..., ge=0.0, le=5.0)
    minimum_sample_size: int = Field(default=100, gt=0)
    auto_promote: bool = True


class RolloutPlanCreate(BaseModel):
    """
    Schema for creating a rollout plan.
    """

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    auto_advance: bool = True
    stages: list[RolloutStageCreate]


class RolloutStageResponse(BaseModel):
    id: int
    rollout_plan_id: UUID
    order: int
    traffic_percentage: int
    duration_minutes: int
    minimum_quality_score: float
    minimum_sample_size: int
    auto_promote: bool
    status: RolloutPlanStatus

    class Config:
        from_attributes = True


class RolloutPlanResponse(BaseModel):
    id: UUID
    flag_id: UUID
    name: str
    description: str | None
    status: RolloutPlanStatus
    current_stage_index: int
    auto_advance: bool
    started_at: datetime | None
    paused_at: datetime | None
    completed_at: datetime | None
    stages: list[RolloutStageResponse]

    class Config:
        from_attributes = True


class RolloutPlanUpdate(BaseModel):
    """
    Update an existing rollout plan.
    """

    name: str | None = None
    description: str | None = None
    auto_advance: bool | None = None
