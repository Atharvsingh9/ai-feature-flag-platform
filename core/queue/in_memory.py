"""
Simple in-memory queue implementation.

This implementation is intended for local development and unit tests.
It can later be replaced by Redis, RabbitMQ, Kafka, or AWS SQS without
changing the worker because both implement BaseQueue.
"""

from __future__ import annotations

from collections import deque

from core.queue.base import BaseQueue, QueueJob


class InMemoryQueue(BaseQueue):
    """
    FIFO in-memory queue.
    """

    def __init__(self) -> None:
        self._queue: deque[QueueJob] = deque()

    def enqueue(self, job: QueueJob) -> None:
        self._queue.append(job)

    def dequeue(self) -> QueueJob | None:
        if not self._queue:
            return None

        return self._queue.popleft()

    def size(self) -> int:
        return len(self._queue)

    def is_empty(self) -> bool:
        return len(self._queue) == 0