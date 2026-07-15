from  __future__  import annotations

from dataclasses import dataclass, field
from typing import Any

@dataclass(frozen=True,slots=True)
class TargetingRules:

    allowed_segments: frozenset[str] = field(
        default_factory=frozenset
    )

    allowed_countries: frozenset[str] = field(
        default_factory=frozenset

    )

    required_metadata: dict[str,Any] = field(
        default_factory=dict
    )

    allowlist: frozenset[str] = field(
        default_factory=frozenset
    )

    blocklist: frozenset[str] = field(
        default_factory=frozenset
    )

    def __post_init__(self) -> None:
        overlap = self.allowlist & self.blocklist

        if overlap:
            raise ValueError("User IDs Cannot exist in both "
                              f"allowlist and blocklist:{sorted(overlap)}")
                
                