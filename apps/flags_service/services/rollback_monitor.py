from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from uuid import UUID

from core.quality.analyzer import (
    QualityAnalysis,
    QualityTrend,
)
from notification.base import BaseNotifier, RollbackNotification
from apps.flags_service.services.rollout_service import RolloutService

from uuid import uuid4


@dataclass(frozen=True)
class RollbackDecision:
    """
    Represents the outcome of evaluating rollout health.
    """

    should_rollback: bool
    reason: str


class RollbackMonitor:
    """
    Evaluates rollout quality and automatically
    triggers a rollback when quality degrades.
    """

    def __init__(
        self,
        rollout_service: RolloutService,
        notifier: BaseNotifier,
        *,
        cooldown_minutes: int = 30,
    ) -> None:

        self._rollout_service = rollout_service
        self._notifier = notifier

        self._cooldown = timedelta(
            minutes=cooldown_minutes,
        )

        self._last_rollback: dict[
            UUID,
            datetime,
        ] = {}

    def evaluate(
        self,
        *,
        flag_id: UUID,
        analysis: QualityAnalysis,
        quality_threshold: float,
        minimum_sample_size: int = 50,
    ) -> RollbackDecision:
        """
        Evaluate whether an automatic rollback
        should be triggered.
        """

        if analysis.sample_size < minimum_sample_size:

            return RollbackDecision(
                should_rollback=False,
                reason="Insufficient quality samples.",
            )

        if self._in_cooldown(flag_id):

            return RollbackDecision(
                should_rollback=False,
                reason="Rollback cooldown active.",
            )

        if analysis.p10_score < quality_threshold:

            reason = (
                f"P10 score ({analysis.p10_score}) "
                f"is below threshold ({quality_threshold})."
            )

            self._trigger_rollback(
                flag_id=flag_id,
                reason=reason,
            )

            return RollbackDecision(
                should_rollback=True,
                reason=reason,
            )

        if analysis.trend == QualityTrend.DEGRADING:

            reason = "Quality trend is degrading."

            self._trigger_rollback(
                flag_id=flag_id,
                reason=reason,
            )

            return RollbackDecision(
                should_rollback=True,
                reason=reason,
            )

        return RollbackDecision(
            should_rollback=False,
            reason="Quality is healthy.",
        )

    def _trigger_rollback(
        self,
        *,
        flag_id: UUID,
        reason: str,
    ) -> None:
        """
        Execute the rollback.

        Notification delivery will be added
        after the rollback completes.
        """

        self._rollout_service.rollback(
            flag_id=flag_id,
            actor="quality-monitor",
            reason=reason,
        )
        try:
            notification = RollbackNotification(
                flag_id=flag_id,
                flag_name="",
                rollout_percentage=0,
                average_score=0.0,
                p10_score=0.0,
                reason=reason,
                triggered_by="quality-monitor",
                timestamp=datetime.utcnow().isoformat(),
            )
            self._notifier.notify_rollback(notification)
        except Exception:
            pass

        self._last_rollback[
            flag_id
        ] = datetime.utcnow()

    def _in_cooldown(
        self,
        flag_id: UUID,
    ) -> bool:

        last = self._last_rollback.get(flag_id)

        if last is None:
            return False

        return (
            datetime.utcnow() - last
        ) < self._cooldown
