from __future__ import annotations

import os

from dataclasses import dataclass


@dataclass(frozen=True)
class QualityWorkerSettings:
    """
    Configuration for the quality worker.
    """

    judge_provider: str

    notifier_provider: str

    slack_webhook_url: str

    cooldown_minutes: int

    minimum_sample_size: int

    quality_threshold: float


def get_settings() -> QualityWorkerSettings:
    """
    Load quality worker configuration from
    environment variables.
    """

    return QualityWorkerSettings(
        judge_provider=os.getenv(
            "JUDGE_PROVIDER",
            "mock",
        ),
        notifier_provider=os.getenv(
            "NOTIFIER_PROVIDER",
            "noop",
        ),
        slack_webhook_url=os.getenv(
            "SLACK_WEBHOOK_URL",
            "",
        ),
        cooldown_minutes=int(
            os.getenv(
                "ROLLBACK_COOLDOWN_MINUTES",
                "30",
            )
        ),
        minimum_sample_size=int(
            os.getenv(
                "MINIMUM_SAMPLE_SIZE",
                "50",
            )
        ),
        quality_threshold=float(
            os.getenv(
                "QUALITY_THRESHOLD",
                "4.0",
            )
        ),
    )