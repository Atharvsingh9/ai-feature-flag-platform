"""Tests for deterministic user bucketing."""

import pytest

from core.evaluation.bucketing import generate_bucket


def test_same_user_gets_same_bucket() -> None:
    first_bucket = generate_bucket(
        "support_prompt_v2",
        "user_123",
    )

    second_bucket = generate_bucket(
        "support_prompt_v2",
        "user_123",
    )

    assert first_bucket == second_bucket


def test_bucket_is_within_valid_range() -> None:
    bucket = generate_bucket(
        "support_prompt_v2",
        "user_123",
    )

    assert 0.0 <= bucket < 100.0


def test_different_flags_use_different_bucketing() -> None:
    first_bucket = generate_bucket(
        "support_prompt_v2",
        "user_123",
    )

    second_bucket = generate_bucket(
        "rag_pipeline_v2",
        "user_123",
    )

    assert first_bucket != second_bucket


def test_empty_flag_name_raises_error() -> None:
    with pytest.raises(ValueError):
        generate_bucket("", "user_123")


def test_empty_user_id_raises_error() -> None:
    with pytest.raises(ValueError):
        generate_bucket(
            "support_prompt_v2",
            "",
        )