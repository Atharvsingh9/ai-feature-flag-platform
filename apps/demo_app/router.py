from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from infrastructure.database.session import get_db
from apps.demo_app.service import DemoService

router = APIRouter(prefix="/demo", tags=["Demo"])


class GenerateRequest(BaseModel):
    goal: str = Field(default="professional", description="Email goal (professional, friendly, marketing, apology, followup)")
    userId: str | None = Field(default=None, description="Optional user ID for SDK evaluation")


class GenerateResponse(BaseModel):
    subject: str
    body: str
    metadata: dict


class StatusResponse(BaseModel):
    initialized: bool
    flagName: str
    status: str
    rolloutPercentage: int
    currentVariant: str
    totalEvaluations: int
    averageQuality: float
    flagId: str | None = None


class ResetResponse(BaseModel):
    status: str
    message: str


@router.post("/generate", response_model=GenerateResponse)
def generate_email(request: GenerateRequest, db: Session = Depends(get_db)) -> GenerateResponse:
    service = DemoService(db)
    result = service.generate(goal=request.goal, user_id=request.userId)
    return GenerateResponse(
        subject=result["subject"],
        body=result["body"],
        metadata=result["metadata"],
    )


@router.post("/bad-generate", response_model=GenerateResponse)
def bad_generate_email(request: GenerateRequest, db: Session = Depends(get_db)) -> GenerateResponse:
    service = DemoService(db)
    result = service.bad_generate(goal=request.goal, user_id=request.userId)
    return GenerateResponse(
        subject=result["subject"],
        body=result["body"],
        metadata=result["metadata"],
    )


@router.get("/status", response_model=StatusResponse)
def demo_status(db: Session = Depends(get_db)) -> StatusResponse:
    service = DemoService(db)
    result = service.get_status()
    return StatusResponse(
        initialized=result["initialized"],
        flagName=result["flagName"],
        status=result["status"],
        rolloutPercentage=result["rolloutPercentage"],
        currentVariant=result["currentVariant"],
        totalEvaluations=result["totalEvaluations"],
        averageQuality=result["averageQuality"],
        flagId=result.get("flagId"),
    )


@router.post("/reset", response_model=ResetResponse)
def reset_demo(db: Session = Depends(get_db)) -> ResetResponse:
    service = DemoService(db)
    result = service.reset()
    return ResetResponse(status=result["status"], message=result["message"])
