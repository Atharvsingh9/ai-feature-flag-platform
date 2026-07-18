from __future__ import annotations

from sqlalchemy.orm import Session

from core.quality.evaluator import QualityEvaluator
from core.quality.judge import MockJudge
from infrastructure.database.repositories.quality_repository import QualityRepository
from apps.flags_service.services.quality_service import QualityService


def get_quality_judge() -> MockJudge:
    """
    Return the configured quality judge.

    Later this function can switch between
    MockJudge and OpenRouterJudge based on
    application configuration.
    """
    return MockJudge()


def get_quality_evaluator() -> QualityEvaluator:
    """
    Build the quality evaluator.
    """
    return QualityEvaluator(
        judge=get_quality_judge(),
    )


def get_quality_repository(
    db: Session,
) -> QualityRepository:
    """
    Build the quality repository.
    """
    return QualityRepository(db)


def get_quality_service(
    db: Session,
) -> QualityService:
    """
    Assemble the complete quality service.
    """

    return QualityService(
        evaluator=get_quality_evaluator(),
        repository=get_quality_repository(db),
    )