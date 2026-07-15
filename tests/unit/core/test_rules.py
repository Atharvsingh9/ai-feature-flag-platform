"""Tests for feature flag targeting evaluation rules."""

from core.evaluation.rules import (
    is_allowlisted,
    is_blocklisted,
    matches_geography,
    matches_metadata,
    matches_segment,
    matches_targeting,
)
from core.models.targeting import TargetingRules


def test_blocklisted_user_is_detected() -> None:
    rules = TargetingRules(
        blocklist=frozenset({"user_999"})
    )

    assert is_blocklisted("user_999", rules) is True


def test_allowlisted_user_is_detected() -> None:
    rules = TargetingRules(
        allowlist=frozenset({"user_001"})
    )

    assert is_allowlisted("user_001", rules) is True


def test_empty_segment_rules_match_everyone() -> None:
    rules = TargetingRules()

    context = {
        "segment": "general",
    }

    assert matches_segment(context, rules) is True


def test_user_matches_allowed_segment() -> None:
    rules = TargetingRules(
        allowed_segments=frozenset({
            "internal",
            "beta",
        })
    )

    context = {
        "segment": "beta",
    }

    assert matches_segment(context, rules) is True


def test_user_outside_allowed_segment_does_not_match() -> None:
    rules = TargetingRules(
        allowed_segments=frozenset({
            "internal",
            "beta",
        })
    )

    context = {
        "segment": "general",
    }

    assert matches_segment(context, rules) is False


def test_user_matches_allowed_country() -> None:
    rules = TargetingRules(
        allowed_countries=frozenset({
            "IN",
            "US",
        })
    )

    context = {
        "country": "IN",
    }

    assert matches_geography(context, rules) is True


def test_metadata_matches_required_values() -> None:
    rules = TargetingRules(
        required_metadata={
            "input_type": "text",
            "channel": "mobile",
        }
    )

    context = {
        "metadata": {
            "input_type": "text",
            "channel": "mobile",
        }
    }

    assert matches_metadata(context, rules) is True


def test_metadata_mismatch_returns_false() -> None:
    rules = TargetingRules(
        required_metadata={
            "input_type": "text",
        }
    )

    context = {
        "metadata": {
            "input_type": "image",
        }
    }

    assert matches_metadata(context, rules) is False


def test_all_targeting_rules_must_match() -> None:
    rules = TargetingRules(
        allowed_segments=frozenset({"beta"}),
        allowed_countries=frozenset({"IN"}),
        required_metadata={
            "input_type": "text",
        },
    )

    context = {
        "segment": "beta",
        "country": "IN",
        "metadata": {
            "input_type": "text",
        },
    }

    assert matches_targeting(context, rules) is True


def test_targeting_fails_when_one_rule_does_not_match() -> None:
    rules = TargetingRules(
        allowed_segments=frozenset({"beta"}),
        allowed_countries=frozenset({"IN"}),
        required_metadata={
            "input_type": "text",
        },
    )

    context = {
        "segment": "beta",
        "country": "US",
        "metadata": {
            "input_type": "text",
        },
    }

    assert matches_targeting(context, rules) is False