from __future__ import annotations

from unittest.mock import Mock

from apps.flags_service.services.rollout_scheduler import (
    RolloutSchedulerService,
)


def make_plan():
    plan = Mock()

    plan.flag_id = Mock()

    plan.current_stage_index = 0

    stage = Mock()

    stage.minimum_quality_score = 4.0

    stage.minimum_sample_size = 100

    stage.auto_promote = True

    plan.stages = [stage, Mock()]

    return plan


def test_scheduler_rolls_back():

    repository = Mock()

    canary_service = Mock()

    scheduler = Mock()

    plan = make_plan()

    repository.active_rollouts.return_value = [plan]

    canary_service.evaluate.return_value = Mock()

    scheduler.evaluate.return_value.rollback = True
    scheduler.evaluate.return_value.pause = False
    scheduler.evaluate.return_value.completed = False
    scheduler.evaluate.return_value.promote = False

    service = RolloutSchedulerService(
        repository,
        canary_service,
        scheduler,
    )

    service.run()

    repository.rollback.assert_called_once()


def test_scheduler_pauses():

    repository = Mock()

    canary_service = Mock()

    scheduler = Mock()

    plan = make_plan()

    repository.active_rollouts.return_value = [plan]

    canary_service.evaluate.return_value = Mock()

    scheduler.evaluate.return_value.rollback = False
    scheduler.evaluate.return_value.pause = True
    scheduler.evaluate.return_value.completed = False
    scheduler.evaluate.return_value.promote = False

    service = RolloutSchedulerService(
        repository,
        canary_service,
        scheduler,
    )

    service.run()

    repository.pause.assert_called_once()


def test_scheduler_completes():

    repository = Mock()

    canary_service = Mock()

    scheduler = Mock()

    plan = make_plan()

    repository.active_rollouts.return_value = [plan]

    canary_service.evaluate.return_value = Mock()

    scheduler.evaluate.return_value.rollback = False
    scheduler.evaluate.return_value.pause = False
    scheduler.evaluate.return_value.completed = True
    scheduler.evaluate.return_value.promote = False

    service = RolloutSchedulerService(
        repository,
        canary_service,
        scheduler,
    )

    service.run()

    repository.complete.assert_called_once()


def test_scheduler_promotes():

    repository = Mock()

    canary_service = Mock()

    scheduler = Mock()

    plan = make_plan()

    repository.active_rollouts.return_value = [plan]

    canary_service.evaluate.return_value = Mock()

    scheduler.evaluate.return_value.rollback = False
    scheduler.evaluate.return_value.pause = False
    scheduler.evaluate.return_value.completed = False
    scheduler.evaluate.return_value.promote = True

    service = RolloutSchedulerService(
        repository,
        canary_service,
        scheduler,
    )

    service.run()

    repository.advance_stage.assert_called_once()


def test_canary_service_called():

    repository = Mock()

    canary_service = Mock()

    scheduler = Mock()

    plan = make_plan()

    repository.active_rollouts.return_value = [plan]

    scheduler.evaluate.return_value.rollback = False
    scheduler.evaluate.return_value.pause = False
    scheduler.evaluate.return_value.completed = False
    scheduler.evaluate.return_value.promote = False

    service = RolloutSchedulerService(
        repository,
        canary_service,
        scheduler,
    )

    service.run()

    canary_service.evaluate.assert_called_once()


def test_scheduler_called():

    repository = Mock()

    canary_service = Mock()

    scheduler = Mock()

    plan = make_plan()

    repository.active_rollouts.return_value = [plan]

    canary_service.evaluate.return_value = Mock()

    scheduler.evaluate.return_value.rollback = False
    scheduler.evaluate.return_value.pause = False
    scheduler.evaluate.return_value.completed = False
    scheduler.evaluate.return_value.promote = False

    service = RolloutSchedulerService(
        repository,
        canary_service,
        scheduler,
    )

    service.run()

    scheduler.evaluate.assert_called_once()