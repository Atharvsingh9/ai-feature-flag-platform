"""Public client for the Python feature flag SDK."""

from __future__ import annotations

from typing import Any

from sdk.python.ai_flags.cache import FlagCache
from sdk.python.ai_flags.config import SDKConfig
from sdk.python.ai_flags.evaluator import evaluate
from sdk.python.ai_flags.models.evaluation import Variant
from sdk.python.ai_flags.models.flag import (
    Flag,
    FlagStatus,
    TargetingRules,
)
from sdk.python.ai_flags.transport import FlagTransport


class FlagClient:
    """Main entry point for the SDK."""

    def __init__(
        self,
        config: SDKConfig,
    ) -> None:

        self._config = config

        self._cache: FlagCache[Flag] = FlagCache(
            ttl_seconds=config.cache_ttl_seconds,
        )

        self._transport = FlagTransport(config)

    def evaluate(
        self,
        flag_name: str,
        user_context: dict[str, Any],
    ) -> Variant:
        """Evaluate a feature flag."""

        flag = self._cache.get(flag_name)

        if flag is None:

            payload = self._transport.fetch_flag(
                flag_name,
            )

            flag = self._build_flag(payload)

            self._cache.set(
                flag_name,
                flag,
            )

        return evaluate(
            flag,
            user_context,
        )

    @staticmethod
    def _build_flag(
        payload: dict[str, Any],
    ) -> Flag:
        """Convert JSON payload into SDK Flag."""

        targeting = payload.get(
            "targeting",
            {},
        )

        return Flag(
            name=payload["name"],
            rollout_percentage=payload[
                "rollout_percentage"
            ],
            status=FlagStatus(
                payload["status"]
            ),
            targeting=TargetingRules(
                allowed_segments=frozenset(
                    targeting.get(
                        "allowed_segments",
                        [],
                    )
                ),
                allowed_countries=frozenset(
                    targeting.get(
                        "allowed_countries",
                        [],
                    )
                ),
                required_metadata=targeting.get(
                    "required_metadata",
                    {},
                ),
                allowlist=frozenset(
                    targeting.get(
                        "allowlist",
                        [],
                    )
                ),
                blocklist=frozenset(
                    targeting.get(
                        "blocklist",
                        [],
                    )
                ),
            ),
        )