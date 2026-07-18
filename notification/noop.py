from __future__ import annotations

from notification.base import (
    BaseNotifier,
    RollbackNotification,
)


class NoOpNotifier(BaseNotifier):
    """
    Notification provider that intentionally
    performs no action.

    Useful for:

    - Local development
    - Unit testing
    - CI pipelines
    """

    def notify_rollback(
        self,
        notification: RollbackNotification,
    ) -> None:
        """
        Ignore the notification.
        """

        return