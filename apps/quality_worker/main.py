from __future__ import annotations

import logging

from database.session import SessionLocal

from apps.quality_worker.dependencies import (
    get_quality_service,
)


logger = logging.getLogger(__name__)


class QualityWorker:
    """
    Background worker responsible for processing
    AI quality evaluation jobs.

    In production this worker will consume jobs
    from Redis, RabbitMQ, Kafka or Celery.

    The worker should never construct business
    services directly. All dependencies are
    provided through the dependency module.
    """

    def process(
        self,
        *,
        flag_id,
        request_id,
        user_id,
        variant,
        prompt_version,
        prompt,
        response,
        latency_ms,
        feedback,
        has_error=False,
        error_message=None,
        feedback_comment=None,
    ) -> None:
        """
        Process a single quality evaluation job.
        """

        db = SessionLocal()

        try:

            quality_service = get_quality_service(db)

            evaluation = quality_service.evaluate_response(
                flag_id=flag_id,
                request_id=request_id,
                user_id=user_id,
                variant=variant,
                prompt_version=prompt_version,
                prompt=prompt,
                response=response,
                latency_ms=latency_ms,
                feedback=feedback,
                has_error=has_error,
                error_message=error_message,
                feedback_comment=feedback_comment,
            )

            logger.info(
                "Quality evaluation completed "
                "(overall_score=%.2f)",
                evaluation.overall_score,
            )

        finally:

            db.close()


worker = QualityWorker()