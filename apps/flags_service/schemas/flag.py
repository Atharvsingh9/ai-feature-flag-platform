from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from infrastructure.database.models.enums import FlagStatus


class FlagCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )

    description: str = Field(
        min_length=1,
        max_length=500,
    )

    baseline_variant: str = Field(
        min_length=1,
        max_length=100,
    )

    experimental_variant: str = Field(
        min_length=1,
        max_length=100,
    )

    quality_threshold: float = Field(
        ge=0,
        le=100,
    )
    shadow_enabled: bool = False

    shadow_sample_percentage: int = Field(
        default=100,
        ge=1,
        le=100,
    )


class FlagUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
   

    description: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
    )

    baseline_variant: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    experimental_variant: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    quality_threshold: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )
    shadow_enabled: bool | None = None

    shadow_sample_percentage: int | None = Field(
        default=None,
        ge=1,
        le=100,
    )
    
    


class FlagResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    name: str
    description: str
    baseline_variant: str
    experimental_variant: str
    quality_threshold: float
    status: FlagStatus
    rollout_percentage: int
    created_at: datetime
    updated_at: datetime
    shadow_enabled: bool
    shadow_sample_percentage: int




class RolloutRequest(BaseModel):
    percentage: int = Field(..., ge=0, le=100)
    actor: str
    reason: str


class PauseRequest(BaseModel):
    actor: str
    reason: str


class RollbackRequest(BaseModel):
    actor: str
    reason: str