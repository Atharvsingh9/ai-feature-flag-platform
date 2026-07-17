from __future__ import annotations

from infrastructure.database.models.flag import Flag
from infrastructure.database.repositories.flag_repository import FlagRepository
from infrastructure.database.repositories.rollout_event_repository import (
    RolloutEventRepository,
)

from apps.flags_service.exceptions.flag_exceptions import (
    FlagAlreadyExistsError,
    FlagNotFoundError,
    InvalidQualityThresholdError,
)

from apps.flags_service.schemas.flag import FlagUpdate


class FlagService:

    def __init__(
        self,
        repository: FlagRepository,
    ):
        self.repository = repository

    def create_flag(
        self,
        *,
        name: str,
        description: str,
        baseline_variant: str,
        experimental_variant: str,
        quality_threshold: float,
    ) -> Flag:

        existing = self.repository.get_by_name(name)

        if existing:
            raise FlagAlreadyExistsError(
                f"Flag '{name}' already exists."
            )

        if not (0 <= quality_threshold <= 100):
            raise InvalidQualityThresholdError(
                "quality_threshold must be between 0 and 100."
            )

        flag = Flag(
            name=name,
            description=description,
            baseline_variant=baseline_variant,
            experimental_variant=experimental_variant,
            quality_threshold=quality_threshold,
        )

        return self.repository.create(flag)

    def get_flag(
        self,
        flag_id: int,
    ) -> Flag:

        flag = self.repository.get_by_id(flag_id)

        if flag is None:
            raise FlagNotFoundError(
                "Flag not found."
            )

        return flag

    def list_flags(self) -> list[Flag]:
        return self.repository.list()

    def update_flag(
        self,
        flag_id: int,
        request: FlagUpdate,
    ) -> Flag:

        flag = self.repository.get_by_id(flag_id)

        if flag is None:
            raise FlagNotFoundError(
                "Flag not found."
            )

        if request.name is not None:
            existing = self.repository.get_by_name(
                request.name
            )

            if existing and existing.id != flag.id:
                raise FlagAlreadyExistsError(
                    f"Flag '{request.name}' already exists."
                )

            flag.name = request.name

        if request.description is not None:
            flag.description = request.description

        if request.baseline_variant is not None:
            flag.baseline_variant = request.baseline_variant

        if request.experimental_variant is not None:
            flag.experimental_variant = (
                request.experimental_variant
            )

        if request.quality_threshold is not None:

            if not (
                0 <= request.quality_threshold <= 100
            ):
                raise InvalidQualityThresholdError(
                    "quality_threshold must be between 0 and 100."
                )

            flag.quality_threshold = (
                request.quality_threshold
            )

        return self.repository.update(flag)

    def delete_flag(
        self,
        flag_id: int,
    ) -> None:

        flag = self.repository.get_by_id(flag_id)

        if flag is None:
            raise FlagNotFoundError(
                "Flag not found."
            )

        self.repository.delete(flag)