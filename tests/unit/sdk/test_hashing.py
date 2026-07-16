"""Tests for deterministic hashing."""

import pytest

from sdk.python.ai_flags.hashing import generate_bucket


def test_same_user_same_bucket() -> None:
    bucket1 = generate_bucket(
        "support_model_v2_rollout",
        "user_123",
    )

    bucket2 = generate_bucket(
        "support_model_v2_rollout",
        "user_123",
    )

    assert bucket1 == bucket2


def test_bucket_is_between_zero_and_hundred() -> None:
    bucket = generate_bucket(
        "support_model_v2_rollout",
        "user_123",
    )

    assert 0.0 <= bucket <= 100.0


def test_different_flags_produce_independent_buckets() -> None:
    bucket1 = generate_bucket(
        "support_model_v2_rollout",
        "user_123",
    )

    bucket2 = generate_bucket(
        "rag_pipeline_v2",
        "user_123",
    )

    assert bucket1 != bucket2


def test_empty_flag_name_raises_value_error() -> None:
    with pytest.raises(ValueError):
        generate_bucket(
            "",
            "user_123",
        )


def test_empty_user_id_raises_value_error() -> None:
    with pytest.raises(ValueError):
        generate_bucket(
            "support_model_v2_rollout",
            "",
        )