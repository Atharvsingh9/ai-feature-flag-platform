from __future__ import annotations

from uuid import UUID

from apps.flags_service.exceptions.flag_exceptions import (
    FlagNotFoundError,
    InvalidFlagStateError,
    InvalidRolloutPercentageError,
)
from infrastructure.database.models.enums import FlagStatus
from infrastructure.database.models.flag import (
    Flag,
)
from infrastructure.database.models.rollout_event import (
    RolloutEvent,
    RolloutEventType,
)
from infrastructure.database.repositories.flag_repository import (
    FlagRepository,
)
from infrastructure.database.repositories.rollout_event_repository import (
    RolloutEventRepository,
)


class RolloutService:
    """
    Handles the rollout lifecycle of AI feature flags.

    Responsibilities:
    - Start rollout
    - Pause rollout
    - Resume rollout
    - Rollback
    - Log rollout events
    """

    def __init__(
        self,
        repository: FlagRepository,
        event_repository: RolloutEventRepository,
    ):
        self.repository = repository
        self.event_repository = event_repository

    def _get_flag(self, flag_id: UUID) -> Flag:
        flag = self.repository.get_by_id(flag_id)

        if flag is None:
            raise FlagNotFoundError("Flag not found.")

        return flag

    def _create_event(
        self,
        *,
        flag_id: UUID,
        event_type: RolloutEventType,
        actor: str,
        reason: str,
        previous_percentage: int,
        new_percentage: int,
    ) -> None:
        event = RolloutEvent(
            flag_id=flag_id,
            event_type=event_type,
            actor=actor,
            reason=reason,
            previous_percentage=previous_percentage,
            new_percentage=new_percentage,
        )

        self.event_repository.create(event)

    def start_rollout(
        self,
        *,
        flag_id: UUID,
        percentage: int,
        actor: str,
        reason: str,
    ) -> Flag:
        if not 0 <= percentage <= 100:
            raise InvalidRolloutPercentageError(
                "Rollout percentage must be between 0 and 100."
            )

        flag = self._get_flag(flag_id)

        if flag.status != FlagStatus.DRAFT:
            raise InvalidFlagStateError(
                "Only draft flags can start rollout."
            )

        previous_percentage = flag.rollout_percentage

        flag.rollout_percentage = percentage
        flag.status = FlagStatus.ROLLING_OUT

        self.repository.update(flag)

        self._create_event(
            flag_id=flag.id,
            event_type=RolloutEventType.ROLLOUT_STARTED,
            actor=actor,
            reason=reason,
            previous_percentage=previous_percentage,
            new_percentage=percentage,
        )

        return flag

    def pause_rollout(
        self,
        *,
        flag_id: UUID,
        actor: str,
        reason: str,
    ) -> Flag:
        flag = self._get_flag(flag_id)

        if flag.status != FlagStatus.ROLLING_OUT:
            raise InvalidFlagStateError(
                "Only rolling out flags can be paused."
            )

        flag.status = FlagStatus.PAUSED

        self.repository.update(flag)

        self._create_event(
            flag_id=flag.id,
            event_type=RolloutEventType.PAUSED,
            actor=actor,
            reason=reason,
            previous_percentage=flag.rollout_percentage,
            new_percentage=flag.rollout_percentage,
        )

        return flag

    def resume_rollout(
        self,
        *,
        flag_id: UUID,
        actor: str,
        reason: str,
    ) -> Flag:
        flag = self._get_flag(flag_id)

        if flag.status != FlagStatus.PAUSED:
            raise InvalidFlagStateError(
                "Only paused flags can be resumed."
            )

        flag.status = FlagStatus.ROLLING_OUT

        self.repository.update(flag)

        self._create_event(
            flag_id=flag.id,
            event_type=RolloutEventType.RESUMED,
            actor=actor,
            reason=reason,
            previous_percentage=flag.rollout_percentage,
            new_percentage=flag.rollout_percentage,
        )

        return flag

    def rollback(
        self,
        *,
        flag_id: UUID,
        actor: str,
        reason: str,
    ) -> Flag:
        flag = self._get_flag(flag_id)

        if flag.status not in (
            FlagStatus.ROLLING_OUT,
            FlagStatus.PAUSED,
        ):
            raise InvalidFlagStateError(
                "Only rolling out or paused flags can be rolled back."
            )

        previous_percentage = flag.rollout_percentage

        flag.rollout_percentage = 0
        flag.status = FlagStatus.ROLLED_BACK

        self.repository.update(flag)

        self._create_event(
            flag_id=flag.id,
            event_type=RolloutEventType.ROLLED_BACK,
            actor=actor,
            reason=reason,
            previous_percentage=previous_percentage,
            new_percentage=0,
        )

        return flag
