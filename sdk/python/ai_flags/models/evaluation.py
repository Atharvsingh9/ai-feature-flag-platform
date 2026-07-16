"""Evaluation result models for the Python SDK."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Variant(str, Enum):
    """Variant returned after evaluating a feature flag."""

    BASELINE = "baseline"
    EXPERIMENTAL = "experimental"


class EvaluationReason(str, Enum):
    """Reason why a particular variant was selected."""

    INVALID_USER = "invalid_user"
    FLAG_INACTIVE = "flag_inactive"
    BLOCKLIST = "blocklist"
    ALLOWLIST = "allowlist"
    TARGETING = "targeting"
    ROLLOUT = "rollout"
    DEFAULT = "default"


@dataclass(frozen=True, slots=True)
class EvaluationResult:
    """Result returned by the SDK evaluator."""

    flag_name: str
    variant: Variant
    bucket: float | None
    reason: EvaluationReason