from fastapi import APIRouter, Depends, HTTPException, status

from apps.flags_service.dependencies import get_flag_service
from apps.flags_service.schemas.flag import (
    FlagCreate,
    FlagResponse,
)
from apps.flags_service.exceptions.flag_exceptions import (
    FlagAlreadyExistsError,
)
from apps.flags_service.services.flag_service import FlagService

router = APIRouter(
    prefix="/flags",
    tags=["Flags"],
)


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
        flag = service.create_flag(request)

        return FlagResponse.model_validate(flag)

    except FlagAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc