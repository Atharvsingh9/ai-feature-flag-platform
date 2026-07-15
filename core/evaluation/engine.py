from __future__ import annotations
from typing import Any
from core.evaluation.bucketing import generate_bucket
from core.evaluation.rules import (
    is_allowlisted,
    is_blocklisted,
    matches_targeting,
)

from core.models.flag import AIFlag, FlagStatus
from core.models.evaluation import Variant


def evaluate_flag(
        flag: AIFlag,
        user_context: dict[str,Any],

) -> Variant:
    
    user_id = user_context.get("user_id")

    if not isinstance(user_id,str) or not user_id.strip():
        return Variant.BASELINE
    
    
    if flag.status is not FlagStatus.ACTIVE:
        return Variant.BASELINE

    if is_blocklisted(user_id, flag.targeting):
        return Variant.BASELINE

    if is_allowlisted(user_id, flag.targeting):
        return Variant.EXPERIMENTAL

    if not matches_targeting(
        user_context,
        flag.targeting,
    ):
        return Variant.BASELINE

    bucket = generate_bucket(
        flag.name,
        user_id,
    )

    if bucket < flag.rollout_percentage:
        return Variant.EXPERIMENTAL

    return Variant.BASELINE