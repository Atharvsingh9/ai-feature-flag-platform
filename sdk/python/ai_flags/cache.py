"""Local TTL cache for AI feature flag configurations."""

from __future__ import annotations

from dataclasses import dataclass
from time import monotonic
from typing import Generic, TypeVar


T = TypeVar("T")


@dataclass(frozen=True, slots=True)
class CacheEntry(Generic[T]):
    """A cached value and the time at which it was stored."""

    value: T
    created_at: float


class FlagCache(Generic[T]):
    """In-memory TTL cache for feature flag configurations."""

    def __init__(
        self,
        ttl_seconds: float = 30.0,
    ) -> None:
        if ttl_seconds <= 0:
            raise ValueError(
                "ttl_seconds must be greater than 0"
            )

        self._ttl_seconds = ttl_seconds
        self._entries: dict[str, CacheEntry[T]] = {}

    def get(
        self,
        flag_name: str,
    ) -> T | None:
        """Return a cached flag if it exists and has not expired."""

        entry = self._entries.get(flag_name)

        if entry is None:
            return None

        age = monotonic() - entry.created_at

        if age >= self._ttl_seconds:
            self._entries.pop(flag_name, None)
            return None

        return entry.value

    def set(
        self,
        flag_name: str,
        value: T,
    ) -> None:
        """Store a flag configuration in the cache."""

        self._entries[flag_name] = CacheEntry(
            value=value,
            created_at=monotonic(),
        )

    def delete(
        self,
        flag_name: str,
    ) -> None:
        """Remove a flag configuration from the cache."""

        self._entries.pop(flag_name, None)

    def clear(self) -> None:
        """Remove all cached flag configurations."""

        self._entries.clear()