import pytest

from core.quality.window import (
    RollingQualityWindow,
)


def test_new_window_is_empty():
    window = RollingQualityWindow()

    assert window.is_empty
    assert window.size == 0


def test_add_single_score():
    window = RollingQualityWindow()

    window.add_score(4.5)

    assert window.size == 1
    assert not window.is_empty
    assert window.scores() == [4.5]


def test_window_respects_maximum_size():
    window = RollingQualityWindow(window_size=3)

    window.add_score(1.0)
    window.add_score(2.0)
    window.add_score(3.0)
    window.add_score(4.0)

    assert window.size == 3
    assert window.scores() == [2.0, 3.0, 4.0]


def test_clear_window():
    window = RollingQualityWindow()

    window.add_score(4.0)
    window.add_score(5.0)

    window.clear()

    assert window.is_empty
    assert window.size == 0


def test_statistics_single_value():
    window = RollingQualityWindow()

    window.add_score(5.0)

    stats = window.statistics()

    assert stats.count == 1
    assert stats.mean_score == 5.0
    assert stats.minimum_score == 5.0
    assert stats.maximum_score == 5.0
    assert stats.standard_deviation == 0.0


def test_statistics_multiple_values():
    window = RollingQualityWindow()

    scores = [2.0, 3.0, 4.0, 5.0]

    for score in scores:
        window.add_score(score)

    stats = window.statistics()

    assert stats.count == 4
    assert stats.mean_score == 3.5
    assert stats.minimum_score == 2.0
    assert stats.maximum_score == 5.0
    assert stats.standard_deviation > 0.0


def test_statistics_on_empty_window_raises():
    window = RollingQualityWindow()

    with pytest.raises(ValueError):
        window.statistics()


def test_invalid_window_size():
    with pytest.raises(ValueError):
        RollingQualityWindow(window_size=0)


def test_scores_are_returned_in_chronological_order():
    window = RollingQualityWindow()

    window.add_score(3.5)
    window.add_score(4.5)
    window.add_score(2.5)

    assert window.scores() == [3.5, 4.5, 2.5]