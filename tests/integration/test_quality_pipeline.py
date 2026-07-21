from __future__ import annotations

from unittest.mock import Mock, patch, MagicMock, call
from uuid import uuid4
import json

import pytest

from core.quality.judge import BaseJudge, JudgeResult, MockJudge
from core.quality.evaluator import QualityEvaluator, EvaluationResult
from core.quality.metrics import (
    calculate_overall_score,
    normalize_latency,
    normalize_feedback,
    reliability_score,
    MetricWeights,
)
from core.quality.analyzer import QualityAnalyzer, QualityAnalysis, QualityTrend
from core.quality.llm_judge import LLMJudge
from apps.flags_service.services.quality_service import QualityService
from apps.flags_service.schemas.quality import FeedbackType, VariantType


class TestQualityPipelineIntegration:

    def test_full_evaluation_pipeline(self):
        judge = MockJudge()
        evaluator = QualityEvaluator(judge=judge)
        repository = Mock()

        result = evaluator.evaluate(
            prompt="Write a professional email",
            response="This is a well-written professional email with proper structure.",
            latency_ms=500,
            feedback="positive",
            has_error=False,
        )

        assert isinstance(result, EvaluationResult)
        assert 0.0 <= result.judge_score <= 5.0
        assert 0.0 <= result.overall_score <= 5.0
        assert result.latency_ms == 500
        assert result.has_error is False

    def test_judge_to_evaluator_to_quality_service(self):
        judge = MockJudge()
        evaluator = QualityEvaluator(judge=judge)
        repository = Mock()
        service = QualityService(evaluator=evaluator, repository=repository)

        result = service.evaluate_response(
            flag_id=uuid4(),
            request_id="req-1",
            user_id="user-1",
            variant=VariantType.BASELINE,
            prompt_version="v1",
            prompt="Test prompt",
            response="Test response with enough length to be good.",
            latency_ms=300,
            feedback=FeedbackType.POSITIVE,
        )

        assert isinstance(result, EvaluationResult)
        assert result.judge_score > 0
        repository.create.assert_called_once()

    def test_quality_analysis_after_evaluation(self):
        scores = [4.5, 4.3, 4.8, 4.1, 4.6, 4.4, 4.7, 4.2, 4.9, 4.0]
        analyzer = QualityAnalyzer()
        analysis = analyzer.analyze(scores)

        assert isinstance(analysis, QualityAnalysis)
        assert analysis.sample_size == 10
        assert 0.0 <= analysis.mean_score <= 5.0

    def test_degrading_trend_detection(self):
        scores = [4.8, 4.7, 4.6, 4.5, 4.4, 4.3, 4.2, 4.1, 4.0, 3.9]
        analyzer = QualityAnalyzer()
        analysis = analyzer.analyze(scores)

        assert analysis.trend == QualityTrend.DEGRADING

    def test_improving_trend_detection(self):
        scores = [3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8]
        analyzer = QualityAnalyzer()
        analysis = analyzer.analyze(scores)

        assert analysis.trend == QualityTrend.IMPROVING

    def test_stable_trend_detection(self):
        scores = [4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5]
        analyzer = QualityAnalyzer()
        analysis = analyzer.analyze(scores)

        assert analysis.trend == QualityTrend.STABLE

    def test_latency_normalization(self):
        assert normalize_latency(100) == 5.0
        assert normalize_latency(500) == 5.0
        assert normalize_latency(2000) == 1.0
        assert normalize_latency(3000) == 1.0
        assert 1.0 < normalize_latency(1000) < 5.0

    def test_feedback_normalization(self):
        assert normalize_feedback("positive") == 5.0
        assert normalize_feedback("negative") == 1.0
        assert normalize_feedback("none") == 3.0

    def test_reliability_score(self):
        assert reliability_score(has_error=False) == 5.0
        assert reliability_score(has_error=True) == 1.0

    def test_overall_score_calculation(self):
        score = calculate_overall_score(
            judge_score=4.0,
            latency_ms=500,
            feedback="positive",
            has_error=False,
        )
        assert 0.0 <= score <= 5.0

    def test_overall_score_with_errors(self):
        score = calculate_overall_score(
            judge_score=4.0,
            latency_ms=200,
            feedback="positive",
            has_error=True,
        )
        assert score < calculate_overall_score(
            judge_score=4.0,
            latency_ms=200,
            feedback="positive",
            has_error=False,
        )

    def test_judge_result_creation(self):
        result = JudgeResult(score=4.5, reasoning="Good response")
        assert result.score == 4.5
        assert result.reasoning == "Good response"

    def test_evaluation_result_creation(self):
        result = EvaluationResult(
            judge_score=4.2,
            overall_score=4.1,
            latency_ms=400,
            feedback="none",
            has_error=False,
            reasoning="Decent quality.",
        )
        assert result.judge_score == 4.2
        assert result.overall_score == 4.1

    def test_mock_judge_empty_response(self):
        judge = MockJudge()
        result = judge.evaluate(prompt="Hello", response="")
        assert result.score == 1.0

    def test_mock_judge_detailed_response(self):
        judge = MockJudge()
        result = judge.evaluate(prompt="Explain", response="A" * 300)
        assert result.score == 4.8

    def test_llm_judge_parse_structured_json(self):
        judge = LLMJudge(provider="mock", api_key="")
        raw = json.dumps({
            "overall_score": 4.2,
            "correctness": 4.5,
            "clarity": 4.0,
            "helpfulness": 4.3,
            "grammar": 5.0,
            "tone": 4.0,
            "instruction_following": 4.5,
            "reason": "Good response overall.",
        })
        result = judge._parse_judge_response(raw)
        assert result.score == 4.2
        details = json.loads(result.reasoning)
        assert details["correctness"] == 4.5
        assert details["clarity"] == 4.0

    def test_llm_judge_parse_codeblock_json(self):
        judge = LLMJudge(provider="mock", api_key="")
        raw = "```json\n{\"overall_score\": 3.5, \"reason\": \"Okay\"}\n```"
        result = judge._parse_judge_response(raw)
        assert result.score == 3.5

    def test_llm_judge_parse_invalid_json(self):
        judge = LLMJudge(provider="mock", api_key="")
        result = judge._parse_judge_response("not json at all")
        assert result.score == 3.0

    def test_quality_service_with_error_state(self):
        judge = MockJudge()
        evaluator = QualityEvaluator(judge=judge)
        repository = Mock()
        service = QualityService(evaluator=evaluator, repository=repository)

        result = service.evaluate_response(
            flag_id=uuid4(),
            request_id="req-error",
            user_id="user-error",
            variant=VariantType.EXPERIMENT,
            prompt_version="bad-v1",
            prompt="Bad prompt",
            response="",
            latency_ms=0,
            feedback=FeedbackType.NEGATIVE,
            has_error=True,
            error_message="Intentional error for testing",
        )
        assert result.has_error is True
        repository.create.assert_called_once()
        created: MagicMock = repository.create.call_args[0][0]
        assert created.error is True
        assert created.error_message == "Intentional error for testing"

    def test_consecutive_evaluations_maintain_quality_trend(self):
        judge = MockJudge()
        evaluator = QualityEvaluator(judge=judge)
        repository = Mock()
        service = QualityService(evaluator=evaluator, repository=repository)

        for i in range(10):
            service.evaluate_response(
                flag_id=uuid4(),
                request_id=f"req-{i}",
                user_id="user-trend",
                variant=VariantType.BASELINE,
                prompt_version="v1",
                prompt="Test prompt",
                response=f"Response number {i} with enough text to evaluate properly.",
                latency_ms=200 + i * 50,
                feedback=FeedbackType.NONE,
            )

        assert repository.create.call_count == 10

    def test_variant_type_enum_values(self):
        assert VariantType.BASELINE.value == "baseline"
        assert VariantType.EXPERIMENT.value == "experiment"

    def test_feedback_type_enum_values(self):
        assert FeedbackType.POSITIVE.value == "positive"
        assert FeedbackType.NEGATIVE.value == "negative"
        assert FeedbackType.NONE.value == "none"
