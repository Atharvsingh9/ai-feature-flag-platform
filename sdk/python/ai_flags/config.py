"""Configuration for the Python feature flag SDK."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class SDKConfig:
    """Configuration used by the Python SDK."""

    base_url: str

    cache_ttl_seconds: float = 30.0

    request_timeout_seconds: float = 5.0

    verify_ssl: bool = True

    def __post_init__(self) -> None:
        if not self.base_url.strip():
            raise ValueError(
                "base_url cannot be empty"
            )

        if self.cache_ttl_seconds <= 0:
            raise ValueError(
                "cache_ttl_seconds must be greater than 0"
            )

        if self.request_timeout_seconds <= 0:
            raise ValueError(
                "request_timeout_seconds must be greater than 0"
            )