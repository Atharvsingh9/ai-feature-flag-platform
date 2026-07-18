from __future__ import annotations

from dataclasses import dataclass


MAX_SCORE = 5.0
MIN_SCORE = 0.0


@dataclass(frozen=True)
class MetricWeights:
    """
    Defines how much each quality metric contributes
    to the final overall quality score.

    All weights should sum to 1.0.
    """

    judge: float = 0.70
    latency: float = 0.15
    feedback: float = 0.10
    reliability: float = 0.05


DEFAULT_WEIGHTS = MetricWeights()


def normalize_latency(
    latency_ms: int,
    excellent_ms: int = 500,
    acceptable_ms: int = 2000,
) -> float:
    """
    Convert latency into a score between 0 and 5.

    <= excellent_ms  -> 5.0

    >= acceptable_ms -> 1.0

    Between them -> Linear interpolation.
    """

    if latency_ms <= excellent_ms:
        return MAX_SCORE

    if latency_ms >= acceptable_ms:
        return 1.0

    ratio = (
        (acceptable_ms - latency_ms)
        / (acceptable_ms - excellent_ms)
    )

    return 1.0 + ratio * 4.0


def normalize_feedback(
    feedback: str,
) -> float:
    """
    Convert user feedback into a numeric score.
    """

    mapping = {
        "positive": 5.0,
        "negative": 1.0,
        "none": 3.0,
    }

    return mapping.get(feedback.lower(), 3.0)


def reliability_score(
    has_error: bool,
) -> float:
    """
    Convert execution success into a score.
    """

    return 1.0 if has_error else 5.0


def calculate_overall_score(
    judge_score: float,
    latency_ms: int,
    feedback: str,
    has_error: bool,
    weights: MetricWeights = DEFAULT_WEIGHTS,
) -> float:
    """
    Calculate the final quality score.

    The result is always between 0 and 5.
    """

    latency_score = normalize_latency(latency_ms)

    feedback_score = normalize_feedback(feedback)

    reliability = reliability_score(has_error)

    overall = (
        judge_score * weights.judge
        + latency_score * weights.latency
        + feedback_score * weights.feedback
        + reliability * weights.reliability
    )

    overall = max(MIN_SCORE, min(MAX_SCORE, overall))

    return round(overall, 2)