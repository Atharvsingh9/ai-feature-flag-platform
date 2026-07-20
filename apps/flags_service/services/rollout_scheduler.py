from __future__ import annotations

from apps.flags_service.services.canary_service import CanaryService
from core.rollout.scheduler import RolloutScheduler
from infrastructure.database.models.enums import RolloutPlanStatus
from infrastructure.database.models.rollout_stage import (
    RolloutStageStatus,
)
from infrastructure.database.repositories.rollout_plan_repository import (
    RolloutPlanRepository,
)
from infrastructure.database.repositories.shadow_repository import (
    ShadowRepository,
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
        shadow_repository = None,
    ):
        self.repository = repository
        self.canary_service = canary_service
        self.scheduler = scheduler
        self._shadow_repository = shadow_repository

    def run(self) -> None:
        """
        Evaluate every active rollout plan and decide whether
        to promote, pause, rollback, or complete it.
        """

        plans = self.repository.active_rollouts()

        for plan in plans:

            stage = plan.stages[
                plan.current_stage_index
            ]

            canary_result = self.canary_service.evaluate(
                flag_id=plan.flag_id,
                minimum_quality=stage.minimum_quality_score,
                sample_size=stage.minimum_sample_size,
            )

            (
                shadow_samples,
                average_shadow_quality,
            ) = self._shadow_statistics(
                plan.flag.id,
            )

            decision = self.scheduler.evaluate(
                plan=plan,
                stage=stage,
                canary=canary_result,
                shadow_samples=shadow_samples,
                average_shadow_quality=average_shadow_quality,
            )

            if decision.rollback:

                stage.status = (
                    RolloutStageStatus.ROLLED_BACK
                )

                plan.status = (
                    RolloutPlanStatus.ROLLED_BACK
                )

                self.repository.rollback(
                    plan,
                )

                continue

            if decision.pause:

                stage.status = (
                    RolloutStageStatus.PAUSED
                )

                plan.status = (
                    RolloutPlanStatus.PAUSED
                )

                self.repository.pause(
                    plan,
                )

                continue

            if decision.completed:

                stage.status = (
                    RolloutStageStatus.COMPLETED
                )

                plan.status = (
                    RolloutPlanStatus.COMPLETED
                )

                self.repository.complete(
                    plan,
                )

                continue

            if decision.promote:

                #
                # Shadow mode has collected enough healthy
                # samples. Start the real rollout at 1%.
                #
                if (
                    plan.flag.shadow_enabled
                    and plan.rollout_percentage == 0
                ):
                    plan.rollout_percentage = 1

                stage.status = (
                    RolloutStageStatus.COMPLETED
                )

                self.repository.advance_stage(
                    plan,
                )

                next_stage = plan.stages[
                    plan.current_stage_index
                ]

                next_stage.status = (
                    RolloutStageStatus.RUNNING
                )

    def _shadow_statistics(
        self,
        flag_id: int,
    ) -> tuple[int, float]:
        """
        Return the number of recent shadow evaluations
        and their average judge score.
        """
        if self._shadow_repository is None:
            return 0 , 0.0 
        evaluations = self._shadow_repository.latest(
            flag_id=flag_id,
            limit=100,
        )

        if not evaluations:
            return (
                0,
                0.0,
            )

        average = (
            sum(
                evaluation.judge_score
                for evaluation in evaluations
            )
            / len(evaluations)
        )

        return (
            len(evaluations),
            average,
        )