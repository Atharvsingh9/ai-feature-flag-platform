from __future__ import annotations

from unittest.mock import Mock

from core.rollout.scheduler import (
    RolloutScheduler,
)


def make_canary(
    passed=True,
    samples=100,
    reason="ok",
):

    canary = Mock()

    canary.passed = passed

    canary.reason = reason

    canary.analysis.sample_size = samples

    return canary


def make_stage(
    minimum_sample_size=100,
    auto_promote=True,
):

    stage = Mock()

    stage.minimum_sample_size = minimum_sample_size

    stage.auto_promote = auto_promote

    return stage


def make_plan(
    current_stage=0,
    total_stages=5,
):

    plan = Mock()

    plan.current_stage_index = current_stage

    plan.stages = [Mock()] * total_stages

    return plan


def test_scheduler_promotes():

    scheduler = RolloutScheduler()

    decision = scheduler.evaluate(
        make_plan(),
        make_stage(),
        make_canary(),
    )

    assert decision.promote
    assert not decision.rollback


def test_scheduler_rolls_back():

    scheduler = RolloutScheduler()

    decision = scheduler.evaluate(
        make_plan(),
        make_stage(),
        make_canary(
            passed=False,
            reason="bad quality",
        ),
    )

    assert decision.rollback
    assert not decision.promote


def test_scheduler_waits_for_samples():

    scheduler = RolloutScheduler()

    decision = scheduler.evaluate(
        make_plan(),
        make_stage(
            minimum_sample_size=200,
        ),
        make_canary(
            samples=100,
        ),
    )

    assert not decision.promote
    assert not decision.rollback
    assert not decision.completed


def test_scheduler_requires_manual_promotion():

    scheduler = RolloutScheduler()

    decision = scheduler.evaluate(
        make_plan(),
        make_stage(
            auto_promote=False,
        ),
        make_canary(),
    )

    assert decision.pause


def test_scheduler_completes_last_stage():

    scheduler = RolloutScheduler()

    decision = scheduler.evaluate(
        make_plan(
            current_stage=4,
            total_stages=5,
        ),
        make_stage(),
        make_canary(),
    )

    assert decision.completed


def test_scheduler_reason_present():

    scheduler = RolloutScheduler()

    decision = scheduler.evaluate(
        make_plan(),
        make_stage(),
        make_canary(),
    )

    assert isinstance(
        decision.reason,
        str,
    )


def test_scheduler_preserves_failure_reason():

    scheduler = RolloutScheduler()

    decision = scheduler.evaluate(
        make_plan(),
        make_stage(),
        make_canary(
            passed=False,
            reason="threshold exceeded",
        ),
    )

    assert "threshold" in decision.reason