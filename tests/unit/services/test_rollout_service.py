"""Tests for RolloutService."""

from unittest.mock import MagicMock

import pytest

from apps.flags_service.exceptions.flag_exceptions import (
    FlagNotFoundError,
    InvalidFlagStateError,
    InvalidRolloutPercentageError,
)
from apps.flags_service.services.rollout_service import (
    RolloutService,
)
from infrastructure.database.models.enums import FlagStatus
from infrastructure.database.models.flag import Flag


def create_flag(
    status: FlagStatus = FlagStatus.DRAFT,
    rollout: int = 0,
) -> Flag:
    return Flag(
        id=1,
        name="support_model_v2_rollout",
        description="Support model rollout",
        baseline_variant="gpt-4",
        experimental_variant="gpt-5",
        quality_threshold=95.0,
        rollout_percentage=rollout,
        status=status,
    )


def create_service():
    repository = MagicMock()
    event_repository = MagicMock()

    service = RolloutService(
        repository=repository,
        event_repository=event_repository,
    )

    return (
        service,
        repository,
        event_repository,
    )


def test_start_rollout_success():
    service, repository, event_repository = create_service()

    flag = create_flag()

    repository.get_by_id.return_value = flag
    repository.update.return_value = flag

    result = service.start_rollout(
        flag_id=1,
        percentage=25,
        actor="atharv",
        reason="Initial rollout",
    )

    assert result.status is FlagStatus.ROLLING_OUT
    assert result.rollout_percentage == 25

    repository.update.assert_called_once_with(flag)
    event_repository.create.assert_called_once()


def test_start_rollout_missing_flag():
    service, repository, _ = create_service()

    repository.get_by_id.return_value = None

    with pytest.raises(
        FlagNotFoundError,
    ):
        service.start_rollout(
            flag_id=1,
            percentage=20,
            actor="atharv",
            reason="Test",
        )


def test_start_rollout_invalid_percentage():
    service, repository, _ = create_service()

    repository.get_by_id.return_value = create_flag()

    with pytest.raises(
        InvalidRolloutPercentageError,
    ):
        service.start_rollout(
            flag_id=1,
            percentage=120,
            actor="atharv",
            reason="Invalid",
        )


def test_start_rollout_invalid_state():
    service, repository, _ = create_service()

    repository.get_by_id.return_value = create_flag(
        status=FlagStatus.ROLLING_OUT,
    )

    with pytest.raises(
        InvalidFlagStateError,
    ):
        service.start_rollout(
            flag_id=1,
            percentage=20,
            actor="atharv",
            reason="Invalid",
        )


def test_pause_rollout_success():
    service, repository, event_repository = create_service()

    flag = create_flag(
        status=FlagStatus.ROLLING_OUT,
        rollout=25,
    )

    repository.get_by_id.return_value = flag

    service.pause_rollout(
        flag_id=1,
        actor="atharv",
        reason="Pause rollout",
    )

    assert flag.status is FlagStatus.PAUSED

    repository.update.assert_called_once_with(flag)
    event_repository.create.assert_called_once()


def test_pause_rollout_invalid_state():
    service, repository, _ = create_service()

    repository.get_by_id.return_value = create_flag()

    with pytest.raises(
        InvalidFlagStateError,
    ):
        service.pause_rollout(
            flag_id=1,
            actor="atharv",
            reason="Pause",
        )


def test_resume_rollout_success():
    service, repository, event_repository = create_service()

    flag = create_flag(
        status=FlagStatus.PAUSED,
        rollout=25,
    )

    repository.get_by_id.return_value = flag

    service.resume_rollout(
        flag_id=1,
        actor="atharv",
        reason="Resume",
    )

    assert flag.status is FlagStatus.ROLLING_OUT

    repository.update.assert_called_once_with(flag)
    event_repository.create.assert_called_once()


def test_resume_rollout_invalid_state():
    service, repository, _ = create_service()

    repository.get_by_id.return_value = create_flag()

    with pytest.raises(
        InvalidFlagStateError,
    ):
        service.resume_rollout(
            flag_id=1,
            actor="atharv",
            reason="Resume",
        )


def test_rollback_success():
    service, repository, event_repository = create_service()

    flag = create_flag(
        status=FlagStatus.ROLLING_OUT,
        rollout=50,
    )

    repository.get_by_id.return_value = flag

    service.rollback(
        flag_id=1,
        actor="atharv",
        reason="Quality dropped",
    )

    assert flag.status is FlagStatus.ROLLED_BACK
    assert flag.rollout_percentage == 0

    repository.update.assert_called_once_with(flag)
    event_repository.create.assert_called_once()


def test_rollback_invalid_state():
    service, repository, _ = create_service()

    repository.get_by_id.return_value = create_flag()

    with pytest.raises(
        InvalidFlagStateError,
    ):
        service.rollback(
            flag_id=1,
            actor="atharv",
            reason="Rollback",
        )