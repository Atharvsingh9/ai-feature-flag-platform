from __future__ import annotations

from sqlalchemy.orm import Session

from core.quality.evaluator import QualityEvaluator
from core.quality.judge import MockJudge

from notification.base import BaseNotifier
from notification.noop import NoOpNotifier
from notification.slack import SlackNotifier

from infrastructure.database.repositories.flag_repository import FlagRepository
from infrastructure.database.repositories.quality_repository import QualityRepository

from apps.flags_service.services.flag_service import FlagService
from apps.flags_service.services.quality_service import QualityService

from infrastructure.database.repositories.rollout_event_repository import (
    RolloutEventRepository,
)

from apps.flags_service.services.rollout_service import (
    RolloutService,
)
from fastapi import Depends

from infrastructure.database.session import get_db

from apps.quality_worker.settings import get_settings


def get_quality_judge() -> MockJudge:
    """
    Return the configured quality judge.

    Later this function can return OpenRouterJudge,
    ClaudeJudge, GeminiJudge, etc.
    """

    settings = get_settings()

    if settings.judge_provider == "mock":
        return MockJudge()

    raise ValueError(
        f"Unsupported judge provider: {settings.judge_provider}"
    )


def get_quality_evaluator() -> QualityEvaluator:
    """
    Construct the quality evaluator.
    """

    return QualityEvaluator(
        judge=get_quality_judge(),
    )


def get_quality_repository(
    db: Session = Depends(get_db),
) -> QualityRepository:

    return QualityRepository(db)


def get_flag_repository(
    db: Session = Depends(get_db),
) -> FlagRepository:

    return FlagRepository(db)


def get_flag_service(
    db: Session = Depends(get_db),
) -> FlagService:

    return FlagService(
        repository=FlagRepository(db),
    )


def get_quality_service(
    db: Session = Depends(get_db),
) -> QualityService:

    return QualityService(
        evaluator=get_quality_evaluator(),
        repository=QualityRepository(db),
    )


def get_notifier() -> BaseNotifier:
    """
    Return the configured notification provider.
    """

    settings = get_settings()

    if settings.notifier_provider == "slack":
        return SlackNotifier(
            webhook_url=settings.slack_webhook_url,
        )

    return NoOpNotifier()


def get_rollout_event_repository(
    db: Session = Depends(get_db),
) -> RolloutEventRepository:
    return RolloutEventRepository(db)


def get_rollout_service(
    db: Session = Depends(get_db),
) -> RolloutService:
    return RolloutService(
        repository=FlagRepository(db),
        event_repository=RolloutEventRepository(db),
    )
