from __future__ import annotations
from typing import Any
from core.models.targeting import TargetingRules

def is_blocklisted(
        user_id:str,
        rules: TargetingRules,
) ->bool:
    
    return user_id in rules.blocklist

def is_allowlisted(
        user_id:str,
        rules: TargetingRules,
) ->bool:
    
    return user_id in rules.allowlist

def matches_segment(
        user_context: dict[str,Any],
        rules: TargetingRules,
)-> bool:
    
    if not rules.allowed_segments:
        return True
    
    segment = user_context.get("segment")

    return segment in rules.allowed_segments

def matches_geography(
        user_context: dict[str, Any],
        rules: TargetingRules,
)-> bool:
    
    if not rules.allowed_countries:
        return True
    
    country = user_context.get("country")

    return country in rules.allowed_countries


def matches_metadata(
        user_context: dict[str,Any],
        rules: TargetingRules,
) -> bool:
    
    if not rules.required_metadata:
        return True
    
    metadata = user_context.get("metadata")

    if not isinstance(metadata,dict):
        return False
    return all(
        metadata.get(key) == expected_value
        for key, expected_value in rules.required_metadata.items()
    )
def matches_targeting(
    user_context: dict[str, Any],
    rules: TargetingRules,
) -> bool:
    """Return whether all targeting requirements match."""

    return (
        matches_segment(user_context, rules)
        and matches_geography(user_context, rules)
        and matches_metadata(user_context, rules)
    )

