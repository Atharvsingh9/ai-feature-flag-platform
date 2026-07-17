class FlagAlreadyExistsError(Exception):
    """Raised when attempting to create a duplicate flag."""


class FlagNotFoundError(Exception):
    """Raised when a flag cannot be found."""


class InvalidQualityThresholdError(Exception):
    """Raised when quality threshold is outside the valid range."""