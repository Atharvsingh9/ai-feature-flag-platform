"""Tests for SDK configuration."""

import pytest

from sdk.python.ai_flags.config import SDKConfig


def test_valid_configuration() -> None:
    config = SDKConfig(
        base_url="https://flags.example.com",
    )

    assert config.base_url == "https://flags.example.com"
    assert config.cache_ttl_seconds == 30.0
    assert config.request_timeout_seconds == 5.0
    assert config.verify_ssl is True


def test_empty_base_url_raises_value_error() -> None:
    with pytest.raises(ValueError):
        SDKConfig(base_url="")


def test_invalid_cache_ttl_raises_value_error() -> None:
    with pytest.raises(ValueError):
        SDKConfig(
            base_url="https://flags.example.com",
            cache_ttl_seconds=0,
        )


def test_invalid_timeout_raises_value_error() -> None:
    with pytest.raises(ValueError):
        SDKConfig(
            base_url="https://flags.example.com",
            request_timeout_seconds=0,
        )