"""Tests for the SDK feature flag evaluator."""

from sdk.python.ai_flags.evaluator import evaluate
from sdk.python.ai_flags.models.evaluation import Variant
from sdk.python.ai_flags.models.flag import (
    Flag,
    FlagStatus,
    TargetingRules,
)


def create_flag(
    *,
    rollout_percentage: float = 20.0,
    status: FlagStatus = FlagStatus.ACTIVE,
    targeting: TargetingRules | None = None,
) -> Flag:
    return Flag(
        name="support_model_v2_rollout",
        rollout_percentage=rollout_percentage,
        status=status,
        targeting=targeting or TargetingRules(),
    )


def test_invalid_user_returns_baseline() -> None:
    flag = create_flag()

    result = evaluate(
        flag,
        {
            "user_id": "",
        },
    )

    assert result is Variant.BASELINE


def test_inactive_flag_returns_baseline() -> None:
    flag = create_flag(
        status=FlagStatus.DRAFT,
    )

    result = evaluate(
        flag,
        {
            "user_id": "user_123",
        },
    )

    assert result is Variant.BASELINE


def test_blocklisted_user_returns_baseline() -> None:
    flag = create_flag(
        rollout_percentage=100.0,
        targeting=TargetingRules(
            blocklist=frozenset({
                "user_999",
            }),
        ),
    )

    result = evaluate(
        flag,
        {
            "user_id": "user_999",
        },
    )

    assert result is Variant.BASELINE


def test_allowlisted_user_returns_experimental() -> None:
    flag = create_flag(
        rollout_percentage=0.0,
        targeting=TargetingRules(
            allowlist=frozenset({
                "user_001",
            }),
        ),
    )

    result = evaluate(
        flag,
        {
            "user_id": "user_001",
        },
    )

    assert result is Variant.EXPERIMENTAL


def test_country_targeting_returns_baseline() -> None:
    flag = create_flag(
        rollout_percentage=100.0,
        targeting=TargetingRules(
            allowed_countries=frozenset({
                "IN",
            }),
        ),
    )

    result = evaluate(
        flag,
        {
            "user_id": "user_123",
            "country": "US",
        },
    )

    assert result is Variant.BASELINE


def test_segment_targeting_returns_baseline() -> None:
    flag = create_flag(
        rollout_percentage=100.0,
        targeting=TargetingRules(
            allowed_segments=frozenset({
                "beta",
            }),
        ),
    )

    result = evaluate(
        flag,
        {
            "user_id": "user_123",
            "segment": "general",
        },
    )

    assert result is Variant.BASELINE


def test_zero_percent_rollout_returns_baseline() -> None:
    flag = create_flag(
        rollout_percentage=0.0,
    )

    result = evaluate(
        flag,
        {
            "user_id": "user_123",
        },
    )

    assert result is Variant.BASELINE


def test_full_rollout_returns_experimental() -> None:
    flag = create_flag(
        rollout_percentage=100.0,
    )

    result = evaluate(
        flag,
        {
            "user_id": "user_123",
        },
    )

    assert result is Variant.EXPERIMENTAL


def test_same_user_gets_same_variant() -> None:
    flag = create_flag(
        rollout_percentage=50.0,
    )

    first = evaluate(
        flag,
        {
            "user_id": "user_123",
        },
    )

    second = evaluate(
        flag,
        {
            "user_id": "user_123",
        },
    )

    assert first is second