"""Feature flag models used by the Python SDK."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class FlagStatus(str, Enum):
    """Lifecycle status of a feature flag."""

    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ROLLED_BACK = "rolled_back"


@dataclass(frozen=True, slots=True)
class TargetingRules:
    """Targeting configuration received from the flag service."""

    allowed_segments: frozenset[str] = field(
        default_factory=frozenset
    )
    allowed_countries: frozenset[str] = field(
        default_factory=frozenset
    )
    required_metadata: dict[str, Any] = field(
        default_factory=dict
    )
    allowlist: frozenset[str] = field(
        default_factory=frozenset
    )
    blocklist: frozenset[str] = field(
        default_factory=frozenset
    )


@dataclass(frozen=True, slots=True)
class Flag:
    """Feature flag configuration evaluated by the Python SDK."""

    name: str
    rollout_percentage: float
    status: FlagStatus
    targeting: TargetingRules = field(
        default_factory=TargetingRules
    )

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError(
                "Flag name cannot be empty"
            )

        if not 0.0 <= self.rollout_percentage <= 100.0:
            raise ValueError(
                "rollout_percentage must be between 0 and 100"
            )