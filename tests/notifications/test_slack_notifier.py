from unittest.mock import MagicMock, patch
from uuid import uuid4

from notification.base import RollbackNotification
from notification.slack import SlackNotifier


def build_notification() -> RollbackNotification:
    return RollbackNotification(
        flag_id=uuid4(),
        flag_name="recommendation-model",
        rollout_percentage=50,
        average_score=4.7,
        p10_score=4.3,
        reason="P10 score below threshold",
        triggered_by="Quality Monitor",
        timestamp="2026-07-18T12:00:00Z",
    )


@patch("notification.slack.urlopen")
def test_notify_rollback_success(mock_urlopen):
    response = MagicMock()

    mock_urlopen.return_value.__enter__.return_value = response

    notifier = SlackNotifier(
        webhook_url="https://hooks.slack.com/services/test"
    )

    notifier.notify_rollback(
        build_notification(),
    )

    mock_urlopen.assert_called_once()


@patch("notification.slack.logger")
@patch("notification.slack.urlopen")
def test_notify_rollback_handles_url_error(
    mock_urlopen,
    mock_logger,
):
    from urllib.error import URLError

    mock_urlopen.side_effect = URLError("Connection failed")

    notifier = SlackNotifier(
        webhook_url="https://hooks.slack.com/services/test"
    )

    notifier.notify_rollback(
        build_notification(),
    )

    mock_logger.exception.assert_called_once()


@patch("notification.slack.logger")
@patch("notification.slack.urlopen")
def test_notify_rollback_handles_http_error(
    mock_urlopen,
    mock_logger,
):
    from urllib.error import HTTPError

    mock_urlopen.side_effect = HTTPError(
        url="https://hooks.slack.com/services/test",
        code=500,
        msg="Internal Server Error",
        hdrs=None,
        fp=None,
    )

    notifier = SlackNotifier(
        webhook_url="https://hooks.slack.com/services/test"
    )

    notifier.notify_rollback(
        build_notification(),
    )

    mock_logger.exception.assert_called_once()