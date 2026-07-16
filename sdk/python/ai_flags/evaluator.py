from __future__ import annotations
from typing import Any


from sdk.python.ai_flags.hashing import generate_bucket
from sdk.python.ai_flags.models.evaluation import Variant

from sdk.python.ai_flags.models.flag import (
    Flag,
    FlagStatus,
)

def evaluate(
        flag: Flag,
        user_context: dict[str,Any],
) -> Variant:
    
    user_id = user_context.get("user_id")

    if not isinstance(user_id, str):
        return Variant.BASELINE
    
    if not user_id.strip():
        return Variant.BASELINE
    
    if flag.status is not FlagStatus.ACTIVE:
        return Variant.BASELINE

    if (
        flag.targeting.allowlist
        and user_id in flag.targeting.allowlist
    ):
        return Variant.EXPERIMENTAL

    if user_id in flag.targeting.blocklist:
        return Variant.BASELINE

    country = user_context.get("country")

    if (
        flag.targeting.allowed_countries
        and country not in flag.targeting.allowed_countries
    ):
        return Variant.BASELINE

    segment = user_context.get("segment")

    if (
        flag.targeting.allowed_segments
        and segment not in flag.targeting.allowed_segments
    ):
        return Variant.BASELINE

    metadata = user_context.get(
        "metadata",
        {},
    )

    for key, value in flag.targeting.required_metadata.items():
        if metadata.get(key) != value:
            return Variant.BASELINE

    bucket = generate_bucket(
        flag.name,
        user_id,
    )

    if bucket < flag.rollout_percentage:
        return Variant.EXPERIMENTAL

    return Variant.BASELINE

