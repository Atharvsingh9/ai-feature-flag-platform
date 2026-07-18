from __future__ import annotations

from uuid import UUID

from core.quality.evaluator import (
    EvaluationResult,
    QualityEvaluator,
)
from infrastructure.database.repositories.quality_repository import QualityRepository
from apps.flags_service.schemas.quality import (
    FeedbackType,
    QualityScoreCreate,
    VariantType,
)


class QualityService:
    """
    Service responsible for recording AI quality evaluations.

    It coordinates the evaluator and repository without exposing
    persistence details to the rest of the application.
    """

    def __init__(
        self,
        evaluator: QualityEvaluator,
        repository: QualityRepository,
    ) -> None:
        self._evaluator = evaluator
        self._repository = repository

    def evaluate_response(
        self,
        *,
        flag_id: UUID,
        request_id: str,
        user_id: str,
        variant: VariantType,
        prompt_version: str,
        prompt: str,
        response: str,
        latency_ms: int,
        feedback: FeedbackType = FeedbackType.NONE,
        has_error: bool = False,
        error_message: str | None = None,
        feedback_comment: str | None = None,
    ) -> EvaluationResult:
        """
        Evaluate an AI response and persist the result.
        """

        evaluation = self._evaluator.evaluate(
            prompt=prompt,
            response=response,
            latency_ms=latency_ms,
            feedback=feedback.value,
            has_error=has_error,
        )

        quality_score = QualityScoreCreate(
            flag_id=flag_id,
            request_id=request_id,
            user_id=user_id,
            variant=variant,
            prompt_version=prompt_version,
            judge_score=evaluation.judge_score,
            overall_score=evaluation.overall_score,
            latency_ms=evaluation.latency_ms,
            error=has_error,
            error_message=error_message,
            feedback=feedback,
            feedback_comment=feedback_comment,
        )

        self._repository.create(quality_score)

        return evaluation