from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class RollbackNotification:
    """
    Payload describing an automatic rollback.
    """

    flag_id: UUID

    flag_name: str

    rollout_percentage: int

    average_score: float

    p10_score: float

    reason: str

    triggered_by: str

    timestamp: str


class BaseNotifier(ABC):
    """
    Base interface for all notification providers.
    """

    @abstractmethod
    def notify_rollback(
        self,
        notification: RollbackNotification,
    ) -> None:
        """
        Send a rollback notification.
        """
        raise NotImplementedError