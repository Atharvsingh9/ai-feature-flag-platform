from enum import Enum


class FlagStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ROLLING_OUT = "rolling_out"
    PAUSED = "paused"
    ROLLED_BACK = "rolled_back"
    ARCHIVED = "archived"


class RolloutPlanStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ROLLED_BACK = "rolled_back"
    CANCELLED = "cancelled"


class RolloutStageStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"