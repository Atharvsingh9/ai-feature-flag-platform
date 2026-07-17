from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from infrastructure.database.session import SessionLocal
from infrastructure.database.repositories.flag_repository import FlagRepository
from apps.flags_service.services.flag_service import FlagService


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


def get_flag_service(
    repository: FlagRepository = Depends(get_flag_repository),
) -> FlagService:
    return FlagService(repository)