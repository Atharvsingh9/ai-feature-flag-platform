"""Tests for the Python SDK feature flag models."""

import pytest

from sdk.python.ai_flags.models.flag import (
    Flag,
    FlagStatus,
    TargetingRules,
)


def test_flag_accepts_valid_configuration() -> None:
    flag = Flag(
        name="support_model_v2_rollout",
        rollout_percentage=20.0,
        status=FlagStatus.ACTIVE,
    )

    assert flag.name == "support_model_v2_rollout"
    assert flag.rollout_percentage == 20.0
    assert flag.status is FlagStatus.ACTIVE


def test_flag_has_empty_targeting_by_default() -> None:
    flag = Flag(
        name="support_model_v2_rollout",
        rollout_percentage=20.0,
        status=FlagStatus.ACTIVE,
    )

    assert flag.targeting.allowed_segments == frozenset()
    assert flag.targeting.allowed_countries == frozenset()
    assert flag.targeting.required_metadata == {}
    assert flag.targeting.allowlist == frozenset()
    assert flag.targeting.blocklist == frozenset()


def test_targeting_rules_accept_valid_configuration() -> None:
    rules = TargetingRules(
        allowed_segments=frozenset({
            "beta",
            "internal",
        }),
        allowed_countries=frozenset({
            "IN",
        }),
        required_metadata={
            "input_type": "text",
        },
        allowlist=frozenset({
            "user_001",
        }),
        blocklist=frozenset({
            "user_999",
        }),
    )

    assert "beta" in rules.allowed_segments
    assert "IN" in rules.allowed_countries
    assert rules.required_metadata["input_type"] == "text"
    assert "user_001" in rules.allowlist
    assert "user_999" in rules.blocklist


def test_empty_flag_name_raises_value_error() -> None:
    with pytest.raises(ValueError):
        Flag(
            name="   ",
            rollout_percentage=20.0,
            status=FlagStatus.ACTIVE,
        )


def test_rollout_percentage_below_zero_raises_value_error() -> None:
    with pytest.raises(ValueError):
        Flag(
            name="support_model_v2_rollout",
            rollout_percentage=-1.0,
            status=FlagStatus.ACTIVE,
        )


def test_rollout_percentage_above_hundred_raises_value_error() -> None:
    with pytest.raises(ValueError):
        Flag(
            name="support_model_v2_rollout",
            rollout_percentage=101.0,
            status=FlagStatus.ACTIVE,
        )


def test_zero_percent_rollout_is_valid() -> None:
    flag = Flag(
        name="support_model_v2_rollout",
        rollout_percentage=0.0,
        status=FlagStatus.ACTIVE,
    )

    assert flag.rollout_percentage == 0.0


def test_hundred_percent_rollout_is_valid() -> None:
    flag = Flag(
        name="support_model_v2_rollout",
        rollout_percentage=100.0,
        status=FlagStatus.ACTIVE,
    )

    assert flag.rollout_percentage == 100.0