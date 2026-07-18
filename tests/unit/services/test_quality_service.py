from unittest.mock import Mock

from core.quality.evaluator import EvaluationResult
from apps.flags_service.services.quality_service import QualityService


def test_quality_service_calls_evaluator():
    evaluator = Mock()

    repository = Mock()

    evaluator.evaluate.return_value = EvaluationResult(
        judge_score=4.5,
        overall_score=4.6,
        latency_ms=500,
        feedback="positive",
        has_error=False,
        reasoning="Looks good.",
    )

    service = QualityService(
        evaluator=evaluator,
        repository=repository,
    )

    service.evaluate_response(
        flag_id="flag-1",
        request_id="request-1",
        user_id="user-1",
        variant="control",
        prompt_version=1,
        prompt="Hello",
        response="This is a good response.",
        latency_ms=500,
        feedback="positive",
        has_error=False,
        error_message=None,
        feedback_comment=None,
    )

    evaluator.evaluate.assert_called_once()


def test_quality_service_saves_result():
    evaluator = Mock()

    repository = Mock()

    evaluator.evaluate.return_value = EvaluationResult(
        judge_score=4.2,
        overall_score=4.1,
        latency_ms=600,
        feedback="none",
        has_error=False,
        reasoning="Good.",
    )

    service = QualityService(
        evaluator=evaluator,
        repository=repository,
    )

    service.evaluate_response(
        flag_id="flag-1",
        request_id="request-1",
        user_id="user-1",
        variant="treatment",
        prompt_version=2,
        prompt="Explain AI",
        response="Artificial Intelligence simulates human reasoning.",
        latency_ms=600,
        feedback="none",
        has_error=False,
        error_message=None,
        feedback_comment=None,
    )

    repository.create.assert_called_once()