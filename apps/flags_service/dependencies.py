from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from infrastructure.database.session import SessionLocal

from infrastructure.database.repositories.flag_repository import FlagRepository
from infrastructure.database.repositories.rollout_event_repository import (
    RolloutEventRepository,
)

from apps.flags_service.services.flag_service import FlagService
from apps.flags_service.services.rollout_service import RolloutService


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_flag_repository(
    db: Session = Depends(get_db),
) -> FlagRepository:
    return FlagRepository(db)


def get_rollout_event_repository(
    db: Session = Depends(get_db),
) -> RolloutEventRepository:
    return RolloutEventRepository(db)


def get_flag_service(
    repository: FlagRepository = Depends(get_flag_repository),
) -> FlagService:
    return FlagService(
        repository=repository,
    )


def get_rollout_service(
    repository: FlagRepository = Depends(get_flag_repository),
    event_repository: RolloutEventRepository = Depends(
        get_rollout_event_repository,
    ),
) -> RolloutService:
    return RolloutService(
        repository=repository,
        event_repository=event_repository,
    )