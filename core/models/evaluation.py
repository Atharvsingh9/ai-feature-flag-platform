from __future__ import annotations
from dataclasses import dataclass
from enum import Enum
from typing import Any

class Variant(str, Enum):

    BASELINE = "baseline"
    EXPERIMENTAL = "experimental"

class EvaluationReason(str, Enum):

    FLAG_DISABLED = "flag_disabled"
    FLAG_NOT_ACTIVE = "flag_not_active"
    ROLLBACK_ACTIVE = "rollback_active"
    INVALID_CONTEXT = "invalid_context"
    ROLLOUT_MATCH = "rollout_match"
    ROLLOUT_MISS = "rollout_miss"

@dataclass(frozen=True, slots=True)
class EvaluationResult:
    flag_name: str
    variant: Variant
    configuration: dict[str, Any]
    reason: EvaluationReason
    details: dict[str, Any] | None = None