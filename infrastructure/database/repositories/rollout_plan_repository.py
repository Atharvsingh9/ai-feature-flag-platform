from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from infrastructure.database.models.rollout_plan import RolloutPlan
from infrastructure.database.models.rollout_stage import RolloutStage


class RolloutPlanRepository:
    """
    Repository for managing rollout plans.
    """

    def __init__(self, session: Session):
        self.session = session

    def create_plan(
        self,
        plan: RolloutPlan,
    ) -> RolloutPlan:
        self.session.add(plan)
        self.session.commit()
        self.session.refresh(plan)
        return plan

    def get_by_id(
        self,
        plan_id: int,
    ) -> RolloutPlan | None:
        return self.session.get(
            RolloutPlan,
            plan_id,
        )

    def active_rollouts(
        self,
    ) -> list[RolloutPlan]:
        stmt = (
            select(RolloutPlan)
            .where(
                RolloutPlan.status == "running"
            )
        )

        return list(
            self.session.scalars(stmt)
        )

    def start_plan(
        self,
        plan: RolloutPlan,
    ) -> RolloutPlan:
        plan.status = "running"
        self.session.commit()
        self.session.refresh(plan)
        return plan

    def pause(
        self,
        plan: RolloutPlan,
    ) -> RolloutPlan:
        plan.status = "paused"
        self.session.commit()
        self.session.refresh(plan)
        return plan

    def rollback(
        self,
        plan: RolloutPlan,
    ) -> RolloutPlan:
        plan.status = "rolled_back"
        self.session.commit()
        self.session.refresh(plan)
        return plan

    def complete(
        self,
        plan: RolloutPlan,
    ) -> RolloutPlan:
        plan.status = "completed"
        self.session.commit()
        self.session.refresh(plan)
        return plan

    def advance_stage(
        self,
        plan: RolloutPlan,
    ) -> RolloutPlan:
        plan.current_stage_index += 1

        self.session.commit()
        self.session.refresh(plan)

        return plan

    def create_stage(
        self,
        stage: RolloutStage,
    ) -> RolloutStage:
        self.session.add(stage)
        self.session.commit()
        self.session.refresh(stage)
        return stage

    def delete_plan(
        self,
        plan: RolloutPlan,
    ) -> None:
        self.session.delete(plan)
        self.session.commit()