from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from apps.flags_service.dependencies import (
    get_flag_service,
    get_rollout_service,
    get_rollout_event_repository,
)

from apps.flags_service.services.flag_service import FlagService
from apps.flags_service.services.rollout_service import RolloutService

from apps.flags_service.schemas.flag import (
    FlagCreate,
    FlagUpdate,
    FlagResponse,
    RolloutRequest,
    PauseRequest,
    RollbackRequest,
)

from apps.flags_service.exceptions.flag_exceptions import (
    FlagAlreadyExistsError,
)

from infrastructure.database.repositories.rollout_event_repository import (
    RolloutEventRepository,
)


router = APIRouter(
    prefix="/flags",
    tags=["Flags"],
)


# --------------------------------------------------------------------
# CRUD Endpoints
# --------------------------------------------------------------------


@router.post(
    "",
    response_model=FlagResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_flag(
    request: FlagCreate,
    service: FlagService = Depends(get_flag_service),
) -> FlagResponse:
    try:
        flag = service.create_flag(
            name=request.name,
            description=request.description,
            baseline_variant=request.baseline_variant,
            experimental_variant=request.experimental_variant,
            quality_threshold=request.quality_threshold,
        )

        return FlagResponse.model_validate(flag)

    except FlagAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.get(
    "",
    response_model=list[FlagResponse],
)
def list_flags(
    service: FlagService = Depends(get_flag_service),
) -> list[FlagResponse]:
    flags = service.list_flags()

    return [
        FlagResponse.model_validate(flag)
        for flag in flags
    ]


@router.get(
    "/{flag_id}",
    response_model=FlagResponse,
)
def get_flag(
    flag_id: UUID,
    service: FlagService = Depends(get_flag_service),
) -> FlagResponse:
    flag = service.get_flag(flag_id)

    return FlagResponse.model_validate(flag)


@router.patch(
    "/{flag_id}",
    response_model=FlagResponse,
)
def update_flag(
    flag_id: UUID,
    request: FlagUpdate,
    service: FlagService = Depends(get_flag_service),
) -> FlagResponse:
    flag = service.update_flag(
        flag_id=flag_id,
        request=request,
    )

    return FlagResponse.model_validate(flag)


@router.delete(
    "/{flag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_flag(
    flag_id: UUID,
    service: FlagService = Depends(get_flag_service),
) -> None:
    service.delete_flag(flag_id)


# --------------------------------------------------------------------
# Rollout Endpoints
# --------------------------------------------------------------------


@router.post(
    "/{flag_id}/rollout",
    response_model=FlagResponse,
)
def start_rollout(
    flag_id: UUID,
    request: RolloutRequest,
    service: RolloutService = Depends(get_rollout_service),
) -> FlagResponse:
    flag = service.start_rollout(
        flag_id=flag_id,
        percentage=request.percentage,
        actor=request.actor,
        reason=request.reason,
    )

    return FlagResponse.model_validate(flag)


@router.post(
    "/{flag_id}/pause",
    response_model=FlagResponse,
)
def pause_rollout(
    flag_id: UUID,
    request: PauseRequest,
    service: RolloutService = Depends(get_rollout_service),
) -> FlagResponse:
    flag = service.pause_rollout(
        flag_id=flag_id,
        actor=request.actor,
        reason=request.reason,
    )

    return FlagResponse.model_validate(flag)


@router.post(
    "/{flag_id}/resume",
    response_model=FlagResponse,
)
def resume_rollout(
    flag_id: UUID,
    request: PauseRequest,
    service: RolloutService = Depends(get_rollout_service),
) -> FlagResponse:
    flag = service.resume_rollout(
        flag_id=flag_id,
        actor=request.actor,
        reason=request.reason,
    )

    return FlagResponse.model_validate(flag)


@router.post(
    "/{flag_id}/rollback",
    response_model=FlagResponse,
)
def rollback(
    flag_id: UUID,
    request: RollbackRequest,
    service: RolloutService = Depends(get_rollout_service),
) -> FlagResponse:
    flag = service.rollback(
        flag_id=flag_id,
        actor=request.actor,
        reason=request.reason,
    )

    return FlagResponse.model_validate(flag)


# --------------------------------------------------------------------
# Rollout Event History
# --------------------------------------------------------------------


@router.get("/{flag_id}/events")
def get_events(
    flag_id: UUID,
    repository: RolloutEventRepository = Depends(
        get_rollout_event_repository,
    ),
):
    return repository.get_by_flag_id(flag_id)
