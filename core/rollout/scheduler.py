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
    def _shadow_completed(
        self,
        *,
        shadow_enabled: bool,
        shadow_samples: int,
        minimum_samples: int,
        average_quality: float,
        quality_threshold: float,
    ) -> bool:
        """
        Determine whether shadow testing has collected
        enough healthy samples to begin a real rollout.
        """

        if not shadow_enabled:
            return True

        if shadow_samples < minimum_samples:
            return False

        return average_quality >= quality_threshold
    def evaluate(
        self,
        plan: RolloutPlan,
        stage: RolloutStage,
        canary: CanaryResult,
        shadow_samples: int = 0,
        average_shadow_quality: float = 0.0,
    ) -> SchedulerDecision:
        
        if not self._shadow_completed(
            shadow_enabled=plan.flag.shadow_enabled,
            shadow_samples=shadow_samples,
            minimum_samples=stage.minimum_sample_size,
            average_quality=average_shadow_quality,
            quality_threshold=plan.flag.quality_threshold,
        ):
            return SchedulerDecision(
                promote=False,
                rollback=False,
                pause=False,
                completed=False,
                reason="Waiting for shadow evaluation.",
            )
    
  

       

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