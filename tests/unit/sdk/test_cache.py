"""Tests for the Python SDK local flag cache."""

from time import sleep

import pytest

from sdk.python.ai_flags.cache import FlagCache


def test_cache_returns_none_for_missing_flag() -> None:
    cache = FlagCache[str]()

    result = cache.get("support_model_v2_rollout")

    assert result is None


def test_cache_stores_and_returns_value() -> None:
    cache = FlagCache[str]()

    cache.set(
        "support_model_v2_rollout",
        "flag_configuration",
    )

    result = cache.get("support_model_v2_rollout")

    assert result == "flag_configuration"


def test_cache_stores_flags_separately() -> None:
    cache = FlagCache[str]()

    cache.set(
        "support_model_v2_rollout",
        "support_config",
    )
    cache.set(
        "rag_pipeline_v2",
        "rag_config",
    )

    assert (
        cache.get("support_model_v2_rollout")
        == "support_config"
    )
    assert (
        cache.get("rag_pipeline_v2")
        == "rag_config"
    )


def test_setting_existing_flag_replaces_value() -> None:
    cache = FlagCache[str]()

    cache.set(
        "support_model_v2_rollout",
        "old_configuration",
    )

    cache.set(
        "support_model_v2_rollout",
        "new_configuration",
    )

    result = cache.get("support_model_v2_rollout")

    assert result == "new_configuration"


def test_expired_flag_returns_none() -> None:
    cache = FlagCache[str](
        ttl_seconds=0.01,
    )

    cache.set(
        "support_model_v2_rollout",
        "flag_configuration",
    )

    sleep(0.02)

    result = cache.get("support_model_v2_rollout")

    assert result is None


def test_delete_removes_specific_flag() -> None:
    cache = FlagCache[str]()

    cache.set(
        "support_model_v2_rollout",
        "support_config",
    )
    cache.set(
        "rag_pipeline_v2",
        "rag_config",
    )

    cache.delete("support_model_v2_rollout")

    assert cache.get("support_model_v2_rollout") is None
    assert cache.get("rag_pipeline_v2") == "rag_config"


def test_clear_removes_all_flags() -> None:
    cache = FlagCache[str]()

    cache.set(
        "support_model_v2_rollout",
        "support_config",
    )
    cache.set(
        "rag_pipeline_v2",
        "rag_config",
    )

    cache.clear()

    assert cache.get("support_model_v2_rollout") is None
    assert cache.get("rag_pipeline_v2") is None


def test_invalid_ttl_raises_value_error() -> None:
    with pytest.raises(ValueError):
        FlagCache[str](
            ttl_seconds=0,
        )