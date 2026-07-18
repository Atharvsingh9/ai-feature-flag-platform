from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from statistics import mean


class QualityTrend(str, Enum):
    """
    Represents the direction of quality over time.
    """

    IMPROVING = "improving"
    STABLE = "stable"
    DEGRADING = "degrading"


@dataclass(frozen=True)
class QualityAnalysis:
    """
    Summary of a rolling quality window.
    """

    sample_size: int

    mean_score: float

    minimum_score: float

    maximum_score: float

    p10_score: float

    standard_deviation: float

    trend: QualityTrend


class QualityAnalyzer:
    """
    Performs statistical analysis on rolling quality scores.
    """

    def analyze(
        self,
        scores: list[float],
    ) -> QualityAnalysis:

        if not scores:
            raise ValueError("No quality scores provided.")

        ordered = list(scores)
        sorted_scores = sorted(scores)
        sample_size = len(ordered)

        p10_index = max(0, int(sample_size * 0.10) - 1)

        p10 = ordered[p10_index]

        if sample_size >= 10:

            first_half = ordered[: sample_size // 2]

            second_half = ordered[sample_size // 2 :]

            first_avg = mean(first_half)

            second_avg = mean(second_half)

            delta = second_avg - first_avg

            if delta > 0.20:
                trend = QualityTrend.IMPROVING

            elif delta < -0.20:
                trend = QualityTrend.DEGRADING

            else:
                trend = QualityTrend.STABLE

        else:

            trend = QualityTrend.STABLE

        std = 0.0

        if sample_size > 1:

            avg = mean(ordered)

            variance = sum(
                (score - avg) ** 2
                for score in ordered
            ) / (sample_size - 1)

            std = variance ** 0.5

        return QualityAnalysis(
            sample_size=sample_size,
            mean_score=round(mean(ordered), 2),
            minimum_score=min(ordered),
            maximum_score=max(ordered),
            p10_score=round(p10, 2),
            standard_deviation=round(std, 2),
            trend=trend,
        )