from __future__ import annotations

from dataclasses import dataclass

from core.quality.analyzer import (
    QualityAnalysis,
    QualityTrend,
)
from core.rollout.statistics import (
    RolloutStatistics,
    StatisticalComparison,
)


@dataclass(frozen=True)
class CanaryResult:
    """
    Result of evaluating a canary rollout.
    """

    passed: bool

    reason: str

    analysis: QualityAnalysis

    comparison: StatisticalComparison


class CanaryAnalyzer:
    """
    Determines whether a rollout should
    continue based on quality.
    """

    def __init__(
        self,
        statistics: RolloutStatistics,
    ):
        self.statistics = statistics

    def evaluate(
        self,
        baseline_scores: list[float],
        experiment_scores: list[float],
        analysis: QualityAnalysis,
        minimum_quality: float,
    ) -> CanaryResult:

        comparison = self.statistics.compare(
            baseline_scores,
            experiment_scores,
        )

        if analysis.sample_size == 0:

            return CanaryResult(
                passed=False,
                reason="No samples collected.",
                analysis=analysis,
                comparison=comparison,
            )

        if (
            analysis.mean_score
            < minimum_quality
        ):

            return CanaryResult(
                passed=False,
                reason="Quality threshold violated.",
                analysis=analysis,
                comparison=comparison,
            )

        if (
            analysis.trend
            == QualityTrend.DEGRADING
        ):

            return CanaryResult(
                passed=False,
                reason="Quality trend is degrading.",
                analysis=analysis,
                comparison=comparison,
            )

        if comparison.effect_size < -0.50:

            return CanaryResult(
                passed=False,
                reason="Large degradation compared to baseline.",
                analysis=analysis,
                comparison=comparison,
            )

        return CanaryResult(
            passed=True,
            reason="Canary checks passed.",
            analysis=analysis,
            comparison=comparison,
        )