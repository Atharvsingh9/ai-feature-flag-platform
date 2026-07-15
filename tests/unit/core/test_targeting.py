"""Tests for feature flag targeting models."""

import pytest

from core.models.targeting import TargetingRules


def test_targeting_rules_are_empty_by_default() -> None:
    rules = TargetingRules()

    assert rules.allowed_segments == frozenset()
    assert rules.allowed_countries == frozenset()
    assert rules.required_metadata == {}
    assert rules.allowlist == frozenset()
    assert rules.blocklist == frozenset()


def test_targeting_rules_accept_valid_configuration() -> None:
    rules = TargetingRules(
        allowed_segments=frozenset({
            "internal",
            "beta",
        }),
        allowed_countries=frozenset({
            "IN",
            "US",
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


def test_user_cannot_be_allowlisted_and_blocklisted() -> None:
    with pytest.raises(ValueError):
        TargetingRules(
            allowlist=frozenset({
                "user_001",
            }),
            blocklist=frozenset({
                "user_001",
            }),
        )