from __future__ import annotations

import logging
import time

from infrastructure.database.session import SessionLocal

from apps.quality_worker.dependency import (
    get_quality_service,
)
from core.queue.base import BaseQueue, QueueJob
from apps.flags_service.services.quality_service import QualityService

logger = logging.getLogger(__name__)


class QualityWorker:
    """
    Consumes quality evaluation jobs from the queue.
    """

    def __init__(
        self,
        queue: BaseQueue,
        quality_service: QualityService,
        poll_interval: float = 0.5,
    ) -> None:
        self._queue = queue
        self._quality_service = quality_service
        self._poll_interval = poll_interval

    def process_once(self) -> bool:
        """
        Process one queued job.

        Returns:
            True if a job was processed.
            False if queue was empty.
        """

        job: QueueJob | None = self._queue.dequeue()

        if job is None:
            return False

        self._quality_service.evaluate(**job.payload)

        logger.info("Processed quality evaluation job.")

        return True

    def run(self) -> None:
        """
        Start the worker loop.
        """

        logger.info("Quality worker started.")

        while True:
            processed = self.process_once()

            if not processed:
                time.sleep(self._poll_interval)
