"""Tests for FlagService."""

from unittest.mock import MagicMock

import pytest

from apps.flags_service.exceptions.flag_exceptions import (
    FlagAlreadyExistsError,
    FlagNotFoundError,
    InvalidQualityThresholdError,
)
from apps.flags_service.schemas.flag import FlagUpdate
from apps.flags_service.services.flag_service import FlagService
from infrastructure.database.models.enums import FlagStatus
from infrastructure.database.models.flag import Flag
from pydantic import ValidationError

def create_flag() -> Flag:
    return Flag(
        id=1,
        name="support_model_v2_rollout",
        description="Support model rollout",
        baseline_variant="gpt-4",
        experimental_variant="gpt-5",
        quality_threshold=95.0,
        rollout_percentage=0,
        status=FlagStatus.DRAFT,
    )


def test_create_flag_success():
    repository = MagicMock()

    flag = create_flag()

    repository.get_by_name.return_value = None
    repository.create.return_value = flag

    service = FlagService(repository)

    result = service.create_flag(
        name=flag.name,
        description=flag.description,
        baseline_variant=flag.baseline_variant,
        experimental_variant=flag.experimental_variant,
        quality_threshold=flag.quality_threshold,
    )

    assert result is flag

    repository.create.assert_called_once()


def test_create_duplicate_flag():
    repository = MagicMock()

    repository.get_by_name.return_value = create_flag()

    service = FlagService(repository)

    with pytest.raises(
        FlagAlreadyExistsError,
    ):
        service.create_flag(
            name="support_model_v2_rollout",
            description="Support",
            baseline_variant="gpt-4",
            experimental_variant="gpt-5",
            quality_threshold=95,
        )


def test_create_invalid_quality_threshold():
    repository = MagicMock()

    repository.get_by_name.return_value = None

    service = FlagService(repository)

    with pytest.raises(
        InvalidQualityThresholdError,
    ):
        service.create_flag(
            name="support_model_v2_rollout",
            description="Support",
            baseline_variant="gpt-4",
            experimental_variant="gpt-5",
            quality_threshold=120,
        )


def test_get_flag_success():
    repository = MagicMock()

    flag = create_flag()

    repository.get_by_id.return_value = flag

    service = FlagService(repository)

    result = service.get_flag(1)

    assert result is flag


def test_get_flag_not_found():
    repository = MagicMock()

    repository.get_by_id.return_value = None

    service = FlagService(repository)

    with pytest.raises(
        FlagNotFoundError,
    ):
        service.get_flag(1)


def test_list_flags():
    repository = MagicMock()

    flags = [
        create_flag(),
    ]

    repository.list.return_value = flags

    service = FlagService(repository)

    result = service.list_flags()

    assert result == flags


def test_update_flag_success():
    repository = MagicMock()

    flag = create_flag()

    repository.get_by_id.return_value = flag
    repository.get_by_name.return_value = None
    repository.update.return_value = flag

    service = FlagService(repository)

    request = FlagUpdate(
        description="Updated description",
    )

    result = service.update_flag(
        1,
        request,
    )

    assert result.description == "Updated description"

    repository.update.assert_called_once_with(flag)


def test_update_missing_flag():
    repository = MagicMock()

    repository.get_by_id.return_value = None

    service = FlagService(repository)

    with pytest.raises(
        FlagNotFoundError,
    ):
        service.update_flag(
            1,
            FlagUpdate(),
        )


def test_update_duplicate_name():
    repository = MagicMock()

    flag = create_flag()

    duplicate = create_flag()
    duplicate.id = 2

    repository.get_by_id.return_value = flag
    repository.get_by_name.return_value = duplicate

    service = FlagService(repository)

    with pytest.raises(
        FlagAlreadyExistsError,
    ):
        service.update_flag(
            1,
            FlagUpdate(
                name="duplicate_flag",
            ),
        )


def test_update_invalid_quality_threshold():
    with pytest.raises(ValidationError):
        FlagUpdate(
            quality_threshold=101,
        )


def test_delete_flag():
    repository = MagicMock()

    flag = create_flag()

    repository.get_by_id.return_value = flag

    service = FlagService(repository)

    service.delete_flag(1)

    repository.delete.assert_called_once_with(flag)


def test_delete_missing_flag():
    repository = MagicMock()

    repository.get_by_id.return_value = None

    service = FlagService(repository)

    with pytest.raises(
        FlagNotFoundError,
    ):
        service.delete_flag(1)