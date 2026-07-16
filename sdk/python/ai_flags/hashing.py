"""Deterministic hashing utilities for the Python SDK."""

from __future__ import annotations

import hashlib


def generate_bucket(
    flag_name: str,
    user_id: str,
) -> float:
    """Generate a deterministic rollout bucket between 0 and 100."""

    if not flag_name.strip():
        raise ValueError(
            "flag_name cannot be empty"
        )

    if not user_id.strip():
        raise ValueError(
            "user_id cannot be empty"
        )

    key = f"{flag_name}:{user_id}"

    digest = hashlib.sha256(
        key.encode("utf-8")
    ).hexdigest()

    bucket = int(
        digest[:8],
        16,
    )

    return (bucket / 0xFFFFFFFF) * 100