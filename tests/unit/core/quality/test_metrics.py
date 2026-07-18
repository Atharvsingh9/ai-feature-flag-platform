import pytest

from core.quality.metrics import (
    MAX_SCORE,
    MIN_SCORE,
    MetricWeights,
    calculate_overall_score,
    normalize_feedback,
    normalize_latency,
    reliability_score,
)


def test_latency_score_is_maximum_for_fast_response():
    assert normalize_latency(300) == MAX_SCORE


def test_latency_score_is_minimum_for_slow_response():
    assert normalize_latency(3000) == 1.0


def test_latency_score_between_limits():
    score = normalize_latency(1000)

    assert 1.0 < score < MAX_SCORE


def test_positive_feedback_score():
    assert normalize_feedback("positive") == 5.0


def test_negative_feedback_score():
    assert normalize_feedback("negative") == 1.0


def test_none_feedback_score():
    assert normalize_feedback("none") == 3.0


def test_unknown_feedback_defaults_to_neutral():
    assert normalize_feedback("something-random") == 3.0


def test_reliability_without_errors():
    assert reliability_score(False) == 5.0


def test_reliability_with_errors():
    assert reliability_score(True) == 1.0


def test_overall_score_is_within_bounds():
    score = calculate_overall_score(
        judge_score=4.5,
        latency_ms=700,
        feedback="positive",
        has_error=False,
    )

    assert MIN_SCORE <= score <= MAX_SCORE


def test_overall_score_decreases_with_errors():
    healthy = calculate_overall_score(
        judge_score=4.5,
        latency_ms=500,
        feedback="positive",
        has_error=False,
    )

    unhealthy = calculate_overall_score(
        judge_score=4.5,
        latency_ms=500,
        feedback="positive",
        has_error=True,
    )

    assert healthy > unhealthy


def test_custom_weights():
    weights = MetricWeights(
        judge=1.0,
        latency=0.0,
        feedback=0.0,
        reliability=0.0,
    )

    score = calculate_overall_score(
        judge_score=4.2,
        latency_ms=5000,
        feedback="negative",
        has_error=True,
        weights=weights,
    )

    assert score == 4.2