"""Tests for SDK evaluation models."""

from sdk.python.ai_flags.models.evaluation import (
    EvaluationReason,
    EvaluationResult,
    Variant,
)


def test_evaluation_result_accepts_valid_configuration() -> None:
    result = EvaluationResult(
        flag_name="support_model_v2_rollout",
        variant=Variant.EXPERIMENTAL,
        bucket=17.42,
        reason=EvaluationReason.ROLLOUT,
    )

    assert result.flag_name == "support_model_v2_rollout"
    assert result.variant is Variant.EXPERIMENTAL
    assert result.bucket == 17.42
    assert result.reason is EvaluationReason.ROLLOUT


def test_bucket_can_be_none() -> None:
    result = EvaluationResult(
        flag_name="support_model_v2_rollout",
        variant=Variant.BASELINE,
        bucket=None,
        reason=EvaluationReason.BLOCKLIST,
    )

    assert result.bucket is None
    assert result.reason is EvaluationReason.BLOCKLIST


def test_variant_values() -> None:
    assert Variant.BASELINE.value == "baseline"
    assert Variant.EXPERIMENTAL.value == "experimental"


def test_evaluation_reason_values() -> None:
    assert EvaluationReason.INVALID_USER.value == "invalid_user"
    assert EvaluationReason.FLAG_INACTIVE.value == "flag_inactive"
    assert EvaluationReason.BLOCKLIST.value == "blocklist"
    assert EvaluationReason.ALLOWLIST.value == "allowlist"
    assert EvaluationReason.TARGETING.value == "targeting"
    assert EvaluationReason.ROLLOUT.value == "rollout"
    assert EvaluationReason.DEFAULT.value == "default"