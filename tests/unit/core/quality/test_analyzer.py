import pytest

from core.quality.analyzer import (
    QualityAnalyzer,
    QualityTrend,
)


def test_empty_scores_raise_error():
    analyzer = QualityAnalyzer()

    with pytest.raises(ValueError):
        analyzer.analyze([])


def test_single_score():
    analyzer = QualityAnalyzer()

    result = analyzer.analyze([4.5])

    assert result.sample_size == 1
    assert result.mean_score == 4.5
    assert result.minimum_score == 4.5
    assert result.maximum_score == 4.5
    assert result.p10_score == 4.5
    assert result.standard_deviation == 0.0
    assert result.trend == QualityTrend.STABLE


def test_statistics_are_computed_correctly():
    analyzer = QualityAnalyzer()

    scores = [2.0, 3.0, 4.0, 5.0]

    result = analyzer.analyze(scores)

    assert result.sample_size == 4
    assert result.mean_score == 3.5
    assert result.minimum_score == 2.0
    assert result.maximum_score == 5.0
    assert result.p10_score == 2.0
    assert result.standard_deviation > 0.0


def test_trend_is_improving():
    analyzer = QualityAnalyzer()

    scores = [
        1.0, 1.5, 2.0, 2.5, 3.0,
        4.0, 4.2, 4.5, 4.8, 5.0,
    ]

    result = analyzer.analyze(scores)

    assert result.trend == QualityTrend.IMPROVING


def test_trend_is_degrading():
    analyzer = QualityAnalyzer()

    scores = [
        5.0, 4.8, 4.5, 4.2, 4.0,
        3.0, 2.5, 2.0, 1.5, 1.0,
    ]

    result = analyzer.analyze(scores)

    assert result.trend == QualityTrend.DEGRADING


def test_small_sample_defaults_to_stable():
    analyzer = QualityAnalyzer()

    scores = [5.0, 4.5, 4.0]

    result = analyzer.analyze(scores)

    assert result.trend == QualityTrend.STABLE