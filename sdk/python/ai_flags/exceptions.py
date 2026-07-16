"""Custom exceptions raised by the Python feature flag SDK."""

from __future__ import annotations


class SDKError(Exception):
    """Base exception for all SDK errors."""


class ConfigurationError(SDKError):
    """Raised when SDK configuration is invalid."""


class TransportError(SDKError):
    """Raised when communication with the flag service fails."""


class FlagNotFoundError(SDKError):
    """Raised when a requested feature flag does not exist."""


class EvaluationError(SDKError):
    """Raised when flag evaluation cannot be completed."""