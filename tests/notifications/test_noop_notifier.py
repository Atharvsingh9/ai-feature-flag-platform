from notification.base import RollbackNotification
from notification.noop import NoOpNotifier


def test_noop_notifier_does_not_raise():
    notifier = NoOpNotifier()

    notification = RollbackNotification(
        flag_id="flag-1",
        flag_name="recommendation-model",
        rollout_percentage=50,
        average_score=4.4,
        p10_score=4.1,
        reason="Testing",
        triggered_by="pytest",
        timestamp="2026-01-01T00:00:00",
    )

    notifier.notify_rollback(notification)