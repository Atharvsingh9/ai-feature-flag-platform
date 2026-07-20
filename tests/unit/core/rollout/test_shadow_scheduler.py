from __future__ import annotations

from unittest.mock import Mock

from core.rollout.scheduler import RolloutScheduler


def make_canary():
    canary = Mock()

    canary.passed = True
    canary.reason = "ok"
    canary.analysis.sample_size = 100

    return canary


def make_stage():
    stage = Mock()

    stage.minimum_sample_size = 100
    stage.minimum_quality_score = 4.0
    stage.auto_promote = True

    return stage


def make_plan():
    plan = Mock()

    plan.current_stage_index = 0
    plan.stages = [Mock()] * 5

    plan.flag.shadow_enabled = True
    plan.flag.quality_threshold = 4.0

    return plan


def test_shadow_waits_for_samples():

    scheduler = RolloutScheduler()

    decision = scheduler.evaluate(
        plan=make_plan(),
        stage=make_stage(),
        canary=make_canary(),
        shadow_samples=20,
        average_shadow_quality=4.5,
    )

    assert not decision.promote
    assert "shadow" in decision.reason.lower()


def test_shadow_waits_for_quality():

    scheduler = RolloutScheduler()

    decision = scheduler.evaluate(
        plan=make_plan(),
        stage=make_stage(),
        canary=make_canary(),
        shadow_samples=100,
        average_shadow_quality=3.0,
    )

    assert not decision.promote


def test_shadow_promotes():

    scheduler = RolloutScheduler()

    decision = scheduler.evaluate(
        plan=make_plan(),
        stage=make_stage(),
        canary=make_canary(),
        shadow_samples=100,
        average_shadow_quality=4.8,
    )

    assert decision.promote