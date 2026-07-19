from __future__ import annotations

from enum import Enum


class RolloutStageStatus(str, Enum):
    """
    Lifecycle of an individual rollout stage.
    """

    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"


class InvalidStageTransition(Exception):
    """Raised when an invalid stage transition is attempted."""


_ALLOWED_TRANSITIONS: dict[RolloutStageStatus, set[RolloutStageStatus]] = {
    RolloutStageStatus.PENDING: {
        RolloutStageStatus.RUNNING,
    },
    RolloutStageStatus.RUNNING: {
        RolloutStageStatus.PAUSED,
        RolloutStageStatus.COMPLETED,
        RolloutStageStatus.FAILED,
        RolloutStageStatus.ROLLED_BACK,
    },
    RolloutStageStatus.PAUSED: {
        RolloutStageStatus.RUNNING,
        RolloutStageStatus.ROLLED_BACK,
    },
    RolloutStageStatus.COMPLETED: set(),
    RolloutStageStatus.FAILED: set(),
    RolloutStageStatus.ROLLED_BACK: set(),
}


def can_transition(
    current: RolloutStageStatus,
    target: RolloutStageStatus,
) -> bool:
    """
    Returns True if the transition is allowed.
    """
    return target in _ALLOWED_TRANSITIONS[current]


def transition(
    current: RolloutStageStatus,
    target: RolloutStageStatus,
) -> RolloutStageStatus:
    """
    Validates and performs a stage transition.
    """
    if not can_transition(current, target):
        raise InvalidStageTransition(
            f"Cannot transition from {current.value} "
            f"to {target.value}"
        )

    return target


def is_terminal(status: RolloutStageStatus) -> bool:
    """
    Returns True if the stage has reached
    a terminal state.
    """
    return status in {
        RolloutStageStatus.COMPLETED,
        RolloutStageStatus.FAILED,
        RolloutStageStatus.ROLLED_BACK,
    }