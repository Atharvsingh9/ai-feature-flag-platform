"""
Queue abstraction used by the background quality worker.

The worker depends only on this interface and does not know
whether jobs are coming from Redis, RabbitMQ, Kafka, SQS,
or an in-memory queue.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class QueueJob:
    """
    Represents one queued quality evaluation job.
    """

    payload: Any


class BaseQueue(ABC):
    """
    Abstract queue interface.
    """

    @abstractmethod
    def enqueue(self, job: QueueJob) -> None:
        """
        Push a job onto the queue.
        """

    @abstractmethod
    def dequeue(self) -> QueueJob | None:
        """
        Pop one job from the queue.

        Returns None if queue is empty.
        """

    @abstractmethod
    def size(self) -> int:
        """
        Current queue size.
        """

    @abstractmethod
    def is_empty(self) -> bool:
        """
        Returns True if queue is empty.
        """