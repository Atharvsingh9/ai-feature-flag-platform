from __future__ import annotations

from infrastructure.database.models.shadow_evaluation import ShadowEvaluation
from infrastructure.database.repositories.shadow_repository import ShadowRepository
from apps.flags_service.schemas.shadow import ShadowEvaluationCreate
from core.rollout.shadow import (
    ShadowExecutor,
    ShadowResult,
)
from apps.flags_service.services.quality_service import QualityService
from uuid import UUID, uuid4

class ShadowService:
    """
    Coordinates shadow evaluations.

    The baseline response is served to the user while the
    experimental response is evaluated in the background.
    """

    def __init__(
        self,
        repository: ShadowRepository,
        quality_service: QualityService,
        executor: ShadowExecutor,
    ):
        self._repository = repository
        self._quality_service = quality_service
        self._executor = executor
    
    

    def evaluate(
        self,
        request: ShadowEvaluationCreate,
    ) -> ShadowResult:
        """
        Execute and persist a shadow evaluation.
        """

        result = self._executor.execute(
            baseline_response=request.baseline_response,
            experimental_response=request.experimental_response,
            judge_score=request.judge_score,
            latency_ms=request.latency_ms,
            has_error=request.has_error,
            error_message=request.error_message,
        )

        evaluation = ShadowEvaluation(
            flag_id=request.flag_id,
            user_id=request.user_id,
            baseline_response=result.baseline_response,
            experimental_response=result.experimental_response,
            judge_score=result.judge_score,
            latency_ms=result.latency_ms,
            has_error=result.has_error,
            error_message=result.error_message,
        )

        saved = self._repository.save(evaluation)

        self._quality_service.evaluate_shadow(saved)

        return result
    
    def execute(
        self,
        flag,
        user_id,
        baseline_response,
        experimental_response,
        latency_ms,
        has_error,
        error_message,
    ):  
        flag_id = getattr(flag, "id", None)

        if not isinstance(flag_id, UUID):
            flag_id = uuid4()
        request = ShadowEvaluationCreate(
            flag_id=flag_id,
            user_id=user_id,
            baseline_response=baseline_response,
            experimental_response=experimental_response,
            judge_score=0.0,
            latency_ms=latency_ms,
            has_error=has_error,
            error_message=error_message,
        )

        return self.evaluate(request)       