from core.quality.evaluator import QualityEvaluator
from core.quality.judge import MockJudge


def test_evaluate_returns_result():
    evaluator = QualityEvaluator(
        judge=MockJudge(),
    )

    result = evaluator.evaluate(
        prompt="Explain Python.",
        response=(
            "Python is a high-level programming language "
            "used for web development, AI, automation, "
            "and many other applications."
        ),
        latency_ms=500,
        feedback="positive",
        has_error=False,
    )

    assert result.judge_score > 0
    assert result.overall_score > 0
    assert result.latency_ms == 500
    assert result.feedback == "positive"
    assert result.has_error is False
    assert isinstance(result.reasoning, str)


def test_error_lowers_overall_score():
    evaluator = QualityEvaluator(
        judge=MockJudge(),
    )

    healthy = evaluator.evaluate(
        prompt="Hello",
        response="This is a sufficiently long response for testing.",
        latency_ms=500,
        feedback="positive",
        has_error=False,
    )

    failed = evaluator.evaluate(
        prompt="Hello",
        response="This is a sufficiently long response for testing.",
        latency_ms=500,
        feedback="positive",
        has_error=True,
    )

    assert healthy.overall_score > failed.overall_score


def test_negative_feedback_reduces_score():
    evaluator = QualityEvaluator(
        judge=MockJudge(),
    )

    positive = evaluator.evaluate(
        prompt="Explain",
        response="This response is long enough to receive a good score.",
        latency_ms=500,
        feedback="positive",
    )

    negative = evaluator.evaluate(
        prompt="Explain",
        response="This response is long enough to receive a good score.",
        latency_ms=500,
        feedback="negative",
    )

    assert positive.overall_score > negative.overall_score


def test_high_latency_reduces_score():
    evaluator = QualityEvaluator(
        judge=MockJudge(),
    )

    fast = evaluator.evaluate(
        prompt="Explain",
        response="This response is long enough to receive a good score.",
        latency_ms=300,
    )

    slow = evaluator.evaluate(
        prompt="Explain",
        response="This response is long enough to receive a good score.",
        latency_ms=4000,
    )

    assert fast.overall_score > slow.overall_score