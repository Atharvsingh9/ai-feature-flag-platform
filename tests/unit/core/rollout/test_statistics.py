from __future__ import annotations

import pytest

from core.rollout.statistics import RolloutStatistics


@pytest.fixture
def statistics() -> RolloutStatistics:
    return RolloutStatistics()


def test_compare_identical_scores(statistics: RolloutStatistics):
    result = statistics.compare(
        [4.0, 4.0, 4.0],
        [4.0, 4.0, 4.0],
    )

    assert result.baseline_mean == 4.0
    assert result.experiment_mean == 4.0
    assert result.mean_difference == 0.0
    assert result.effect_size == 0.0


def test_compare_experiment_better(statistics: RolloutStatistics):
    result = statistics.compare(
        [4.0, 4.0, 4.0],
        [4.5, 4.5, 4.5],
    )

    assert result.mean_difference > 0
    assert result.relative_change > 0


def test_compare_experiment_worse(statistics: RolloutStatistics):
    result = statistics.compare(
        [4.5, 4.5, 4.5],
        [4.0, 4.0, 4.0],
    )

    assert result.mean_difference < 0
    assert result.relative_change < 0


def test_effect_size_zero_when_variance_zero(
    statistics: RolloutStatistics,
):
    result = statistics.compare(
        [5.0, 5.0],
        [5.0, 5.0],
    )

    assert result.effect_size == 0.0


def test_compare_requires_baseline_scores(
    statistics: RolloutStatistics,
):
    with pytest.raises(ValueError):
        statistics.compare([], [4.0])


def test_compare_requires_experiment_scores(
    statistics: RolloutStatistics,
):
    with pytest.raises(ValueError):
        statistics.compare([4.0], [])


def test_pooled_std_positive(
    statistics: RolloutStatistics,
):
    pooled = statistics._pooled_std(
        [4.0, 4.5, 4.2],
        [3.8, 4.0, 4.1],
    )

    assert pooled > 0


def test_variance_positive(
    statistics: RolloutStatistics,
):
    variance = statistics._variance(
        [1, 2, 3, 4, 5]
    )

    assert variance > 0