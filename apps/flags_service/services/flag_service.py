from __future__ import annotations

from infrastructure.database.models.flag import Flag
from infrastructure.database.repositories.flag_repository import FlagRepository
from apps.flags_service.services.exceptions import (
    FlagAlreadyExistsError,
    FlagNotFoundError,
    InvalidQualityThresholdError,
)

class FlagService:
    """
    Business logic for feature flags.
    """

    def __init__(self, repository: FlagRepository):
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
            raise ValueError(
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

    def get_flag(self, flag_id: int) -> Flag | None:
        return self.repository.get_by_id(flag_id)

    def list_flags(self):
        return self.repository.list()

    def delete_flag(self, flag_id: int) -> None:

        flag = self.repository.get_by_id(flag_id)

        if flag is None:
            raise FlagNotFoundError(
    "Flag not found."
)

        self.repository.delete(flag)