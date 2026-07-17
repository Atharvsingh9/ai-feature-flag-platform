class FlagError(Exception):
    """Base exception for all flag-related errors."""


class FlagAlreadyExistsError(FlagError):
    """Raised when a flag with the same name already exists."""


class FlagNotFoundError(FlagError):
    """Raised when a requested flag does not exist."""


class InvalidQualityThresholdError(FlagError):
    """Raised when the quality threshold is outside the valid range."""