from unittest.mock import Mock
from uuid import uuid4

from core.quality.analyzer import (
    QualityAnalysis,
    QualityTrend,
)
from apps.flags_service.services.rollback_monitor import RollbackMonitor


def build_analysis(
    *,
    sample_size=100,
    mean_score=4.5,
    p10_score=4.3,
    trend=QualityTrend.STABLE,
):
    return QualityAnalysis(
        sample_size=sample_size,
        mean_score=mean_score,
        minimum_score=3.5,
        maximum_score=5.0,
        p10_score=p10_score,
        standard_deviation=0.2,
        trend=trend,
    )


def test_healthy_rollout():
    rollout_service = Mock()
    notifier = Mock()

    monitor = RollbackMonitor(
        rollout_service=rollout_service,
        notifier=notifier,
    )

    decision = monitor.evaluate(
        flag_id=uuid4(),
        analysis=build_analysis(),
        quality_threshold=4.0,
    )

    assert decision.should_rollback is False

    rollout_service.rollback.assert_not_called()


def test_low_p10_triggers_rollback():
    rollout_service = Mock()
    notifier = Mock()

    monitor = RollbackMonitor(
        rollout_service=rollout_service,
        notifier=notifier,
    )

    decision = monitor.evaluate(
        flag_id=uuid4(),
        analysis=build_analysis(
            p10_score=2.5,
        ),
        quality_threshold=4.0,
    )

    assert decision.should_rollback

    rollout_service.rollback.assert_called_once()


def test_degrading_trend_triggers_rollback():
    rollout_service = Mock()
    notifier = Mock()

    monitor = RollbackMonitor(
        rollout_service=rollout_service,
        notifier=notifier,
    )

    decision = monitor.evaluate(
        flag_id=uuid4(),
        analysis=build_analysis(
            trend=QualityTrend.DEGRADING,
        ),
        quality_threshold=2.0,
    )

    assert decision.should_rollback

    rollout_service.rollback.assert_called_once()


def test_small_sample_does_not_rollback():
    rollout_service = Mock()
    notifier = Mock()

    monitor = RollbackMonitor(
        rollout_service=rollout_service,
        notifier=notifier,
    )

    decision = monitor.evaluate(
        flag_id=uuid4(),
        analysis=build_analysis(
            sample_size=5,
        ),
        quality_threshold=4.0,
    )

    assert not decision.should_rollback

    rollout_service.rollback.assert_not_called()