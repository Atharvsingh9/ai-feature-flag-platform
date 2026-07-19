from __future__ import annotations

from infrastructure.database.repositories.rollout_plan_repository import RolloutPlanRepository
from apps.flags_service.services.canary_service import CanaryService
from core.rollout.scheduler import RolloutScheduler
from infrastructure.database.models.enums import RolloutPlanStatus
from infrastructure.database.models.rollout_stage import (
    RolloutStageStatus,
)


class RolloutSchedulerService:
    """
    Executes automatic rollout decisions.
    """

    def __init__(
        self,
        repository: RolloutPlanRepository,
        canary_service: CanaryService,
        scheduler: RolloutScheduler,
    ):
        self.repository = repository
        self.canary_service = canary_service
        self.scheduler = scheduler

    def run(self) -> None:

        plans = self.repository.active_rollouts()

        for plan in plans:

            stage = plan.stages[
                plan.current_stage_index
            ]

            result = self.canary_service.evaluate(
                flag_id=plan.flag_id,
                minimum_quality=stage.minimum_quality_score,
                sample_size=stage.minimum_sample_size,
            )

            decision = self.scheduler.evaluate(
                plan=plan,
                stage=stage,
                canary=result,
            )

            if decision.rollback:

                stage.status = RolloutStageStatus.ROLLED_BACK
                plan.status = RolloutPlanStatus.ROLLED_BACK

                self.repository.rollback(plan)

                continue

            if decision.pause:

                stage.status = RolloutStageStatus.PAUSED
                plan.status = RolloutPlanStatus.PAUSED

                self.repository.pause(plan)

                continue

            if decision.completed:

                stage.status = RolloutStageStatus.COMPLETED
                plan.status = RolloutPlanStatus.COMPLETED

                self.repository.complete(plan)

                continue

            if decision.promote:

                stage.status = RolloutStageStatus.COMPLETED

                self.repository.advance_stage(
                    plan,
                )

                next_stage = plan.stages[
                    plan.current_stage_index
                ]

                next_stage.status = (
                    RolloutStageStatus.RUNNING
                )