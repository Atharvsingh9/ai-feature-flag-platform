from enum import Enum


class FlagStatus(str, Enum):
    DRAFT = "DRAFT"
    ROLLING_OUT = "ROLLING_OUT"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    ROLLED_BACK = "ROLLED_BACK"