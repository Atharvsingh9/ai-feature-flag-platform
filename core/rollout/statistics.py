from __future__ import annotations

from dataclasses import dataclass
from math import sqrt
from statistics import mean


@dataclass(frozen=True)
class StatisticalComparison:
    """
    Statistical comparison between baseline
    and experimental quality.
    """

    baseline_mean: float

    experiment_mean: float

    mean_difference: float

    relative_change: float

    pooled_standard_deviation: float

    effect_size: float


class RolloutStatistics:
    """
    Computes rollout-specific statistical metrics.
    """

    def compare(
        self,
        baseline_scores: list[float],
        experiment_scores: list[float],
    ) -> StatisticalComparison:

        if not baseline_scores:
            raise ValueError("Baseline scores cannot be empty.")

        if not experiment_scores:
            raise ValueError("Experiment scores cannot be empty.")

        baseline_mean = mean(baseline_scores)
        experiment_mean = mean(experiment_scores)

        difference = experiment_mean - baseline_mean

        relative_change = (
            difference / baseline_mean
            if baseline_mean != 0
            else 0.0
        )

        pooled_std = self._pooled_std(
            baseline_scores,
            experiment_scores,
        )

        effect = (
            difference / pooled_std
            if pooled_std > 0
            else 0.0
        )

        return StatisticalComparison(
            baseline_mean=round(baseline_mean, 3),
            experiment_mean=round(experiment_mean, 3),
            mean_difference=round(difference, 3),
            relative_change=round(relative_change, 4),
            pooled_standard_deviation=round(
                pooled_std,
                3,
            ),
            effect_size=round(effect, 3),
        )

    def _variance(
        self,
        values: list[float],
    ) -> float:

        avg = mean(values)

        return (
            sum(
                (value - avg) ** 2
                for value in values
            )
            / (len(values) - 1)
        )

    def _pooled_std(
        self,
        baseline: list[float],
        experiment: list[float],
    ) -> float:

        if len(baseline) < 2 or len(experiment) < 2:
            return 0.0

        var1 = self._variance(baseline)
        var2 = self._variance(experiment)

        pooled = (
            ((len(baseline) - 1) * var1)
            + ((len(experiment) - 1) * var2)
        ) / (
            len(baseline)
            + len(experiment)
            - 2
        )

        return sqrt(pooled)