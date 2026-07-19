from __future__ import annotations

from dataclasses import dataclass

from core.rollout.canary import CanaryResult
from infrastructure.database.models.rollout_plan import (
    RolloutPlan,
)
from infrastructure.database.models.rollout_stage import (
    RolloutStage,
)


@dataclass(frozen=True)
class SchedulerDecision:
    """
    Represents the scheduler's decision.
    """

    promote: bool

    rollback: bool

    pause: bool

    completed: bool

    reason: str


class RolloutScheduler:
    """
    Decides how a rollout should progress.
    """

    def evaluate(
        self,
        plan: RolloutPlan,
        stage: RolloutStage,
        canary: CanaryResult,
    ) -> SchedulerDecision:

        if not canary.passed:

            return SchedulerDecision(
                promote=False,
                rollback=True,
                pause=False,
                completed=False,
                reason=canary.reason,
            )

        if (
            canary.analysis.sample_size
            < stage.minimum_sample_size
        ):

            return SchedulerDecision(
                promote=False,
                rollback=False,
                pause=False,
                completed=False,
                reason="Waiting for more samples.",
            )

        if not stage.auto_promote:

            return SchedulerDecision(
                promote=False,
                rollback=False,
                pause=True,
                completed=False,
                reason="Manual approval required.",
            )

        if (
            plan.current_stage_index
            >= len(plan.stages) - 1
        ):

            return SchedulerDecision(
                promote=False,
                rollback=False,
                pause=False,
                completed=True,
                reason="Rollout completed.",
            )

        return SchedulerDecision(
            promote=True,
            rollback=False,
            pause=False,
            completed=False,
            reason="Stage passed.",
        )