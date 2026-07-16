"""HTTP transport used by the Python SDK."""

from __future__ import annotations

from typing import Any

import requests

from sdk.python.ai_flags.config import SDKConfig
from sdk.python.ai_flags.exceptions import (
    FlagNotFoundError,
    TransportError,
)


class FlagTransport:
    """Communicates with the remote feature flag service."""

    def __init__(
        self,
        config: SDKConfig,
    ) -> None:
        self._config = config

    def fetch_flag(
        self,
        flag_name: str,
    ) -> dict[str, Any]:
        """Fetch a feature flag configuration."""

        url = (
            f"{self._config.base_url}"
            f"/flags/{flag_name}"
        )

        try:
            response = requests.get(
                url,
                timeout=self._config.request_timeout_seconds,
                verify=self._config.verify_ssl,
            )

        except requests.RequestException as exc:
            raise TransportError(
                "Failed to communicate with flag service."
            ) from exc

        if response.status_code == 404:
            raise FlagNotFoundError(
                f"Flag '{flag_name}' was not found."
            )

        if not response.ok:
            raise TransportError(
                f"Unexpected status code: {response.status_code}"
            )

        return response.json()