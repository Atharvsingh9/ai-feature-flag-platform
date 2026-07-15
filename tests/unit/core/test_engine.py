"""Tests for the core AI feature flag evaluation engine."""

from core.evaluation.engine import evaluate_flag
from core.models.evaluation import Variant
from core.models.flag import (
    AIFlag,
    ConfigurationType,
    FlagStatus,
    VariantConfiguration,
)
from core.models.targeting import TargetingRules


def create_test_flag(
    *,
    rollout_percentage: float = 20.0,
    status: FlagStatus = FlagStatus.ACTIVE,
    targeting: TargetingRules | None = None,
) -> AIFlag:
    """Create a reusable AI flag for evaluation tests."""

    return AIFlag(
        name="support_model_v2_rollout",
        rollout_percentage=rollout_percentage,
        quality_threshold=0.80,
        baseline=VariantConfiguration(
            type=ConfigurationType.MODEL,
            version="v1",
            config={
                "model": "model_b",
            },
        ),
        experimental=VariantConfiguration(
            type=ConfigurationType.MODEL,
            version="v2",
            config={
                "model": "model_a",
            },
        ),
        targeting=targeting or TargetingRules(),
        status=status,
    )


def test_invalid_user_id_returns_baseline() -> None:
    flag = create_test_flag()

    result = evaluate_flag(
        flag,
        {
            "user_id": "",
        },
    )

    assert result is Variant.BASELINE


def test_inactive_flag_returns_baseline() -> None:
    flag = create_test_flag(
        status=FlagStatus.DRAFT,
    )

    result = evaluate_flag(
        flag,
        {
            "user_id": "user_123",
        },
    )

    assert result is Variant.BASELINE


def test_blocklisted_user_returns_baseline() -> None:
    flag = create_test_flag(
        rollout_percentage=100.0,
        targeting=TargetingRules(
            blocklist=frozenset({
                "user_999",
            }),
        ),
    )

    result = evaluate_flag(
        flag,
        {
            "user_id": "user_999",
        },
    )

    assert result is Variant.BASELINE


def test_allowlisted_user_returns_experimental() -> None:
    flag = create_test_flag(
        rollout_percentage=0.0,
        targeting=TargetingRules(
            allowlist=frozenset({
                "user_001",
            }),
        ),
    )

    result = evaluate_flag(
        flag,
        {
            "user_id": "user_001",
        },
    )

    assert result is Variant.EXPERIMENTAL


def test_targeting_mismatch_returns_baseline() -> None:
    flag = create_test_flag(
        rollout_percentage=100.0,
        targeting=TargetingRules(
            allowed_countries=frozenset({
                "IN",
            }),
        ),
    )

    result = evaluate_flag(
        flag,
        {
            "user_id": "user_123",
            "country": "US",
        },
    )

    assert result is Variant.BASELINE


def test_zero_percent_rollout_returns_baseline() -> None:
    flag = create_test_flag(
        rollout_percentage=0.0,
    )

    result = evaluate_flag(
        flag,
        {
            "user_id": "user_123",
        },
    )

    assert result is Variant.BASELINE


def test_full_rollout_returns_experimental() -> None:
    flag = create_test_flag(
        rollout_percentage=100.0,
    )

    result = evaluate_flag(
        flag,
        {
            "user_id": "user_123",
        },
    )

    assert result is Variant.EXPERIMENTAL


def test_same_user_gets_consistent_variant() -> None:
    flag = create_test_flag(
        rollout_percentage=50.0,
    )

    first_result = evaluate_flag(
        flag,
        {
            "user_id": "user_123",
        },
    )

    second_result = evaluate_flag(
        flag,
        {
            "user_id": "user_123",
        },
    )

    assert first_result is second_result