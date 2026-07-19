from __future__ import annotations

import pytest

from core.quality.analyzer import (
    QualityAnalysis,
    QualityTrend,
)
from core.rollout.canary import (
    CanaryAnalyzer,
)
from core.rollout.statistics import RolloutStatistics


@pytest.fixture
def analyzer() -> CanaryAnalyzer:
    return CanaryAnalyzer(
        statistics=RolloutStatistics(),
    )


def analysis(
    score: float,
    trend: QualityTrend = QualityTrend.STABLE,
    samples: int = 100,
) -> QualityAnalysis:

    return QualityAnalysis(
        sample_size=samples,
        mean_score=score,
        minimum_score=score,
        maximum_score=score,
        p10_score=score,
        standard_deviation=0.0,
        trend=trend,
    )


def test_canary_passes(analyzer: CanaryAnalyzer):

    result = analyzer.evaluate(
        baseline_scores=[4.0] * 20,
        experiment_scores=[4.1] * 20,
        analysis=analysis(4.1),
        minimum_quality=4.0,
    )

    assert result.passed is True


def test_quality_threshold_failure(
    analyzer: CanaryAnalyzer,
):

    result = analyzer.evaluate(
        baseline_scores=[4.2] * 20,
        experiment_scores=[3.5] * 20,
        analysis=analysis(3.5),
        minimum_quality=4.0,
    )

    assert result.passed is False
    assert "threshold" in result.reason.lower()


def test_degrading_trend_fails(
    analyzer: CanaryAnalyzer,
):

    result = analyzer.evaluate(
        baseline_scores=[4.5] * 20,
        experiment_scores=[4.1] * 20,
        analysis=analysis(
            4.1,
            QualityTrend.DEGRADING,
        ),
        minimum_quality=4.0,
    )

    assert result.passed is False


def test_no_samples_fail(
    analyzer: CanaryAnalyzer,
):

    result = analyzer.evaluate(
        baseline_scores=[4.0],
        experiment_scores=[4.0],
        analysis=analysis(
            4.0,
            samples=0,
        ),
        minimum_quality=4.0,
    )

    assert result.passed is False


def test_large_effect_size_failure(
    analyzer: CanaryAnalyzer,
):

    result = analyzer.evaluate(
        baseline_scores=[5.0] * 30,
        experiment_scores=[2.5] * 30,
        analysis=analysis(2.5),
        minimum_quality=2.0,
    )

    assert result.passed is False


def test_result_contains_analysis(
    analyzer: CanaryAnalyzer,
):

    qa = analysis(4.3)

    result = analyzer.evaluate(
        baseline_scores=[4.3] * 20,
        experiment_scores=[4.3] * 20,
        analysis=qa,
        minimum_quality=4.0,
    )

    assert result.analysis == qa


def test_result_contains_statistics(
    analyzer: CanaryAnalyzer,
):

    result = analyzer.evaluate(
        baseline_scores=[4.2] * 20,
        experiment_scores=[4.2] * 20,
        analysis=analysis(4.2),
        minimum_quality=4.0,
    )

    assert result.comparison.baseline_mean == 4.2


def test_canary_reason_present(
    analyzer: CanaryAnalyzer,
):

    result = analyzer.evaluate(
        baseline_scores=[4.5] * 20,
        experiment_scores=[4.5] * 20,
        analysis=analysis(4.5),
        minimum_quality=4.0,
    )

    assert isinstance(result.reason, str)
    assert len(result.reason) > 0