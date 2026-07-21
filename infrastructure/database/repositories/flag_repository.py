from __future__ import annotations

from typing import Sequence
from uuid import UUID

from sqlalchemy.orm import Session

from infrastructure.database.models.flag import Flag


class FlagRepository:
    """
    Handles all database operations for Flag objects.
    """

    def __init__(self, session: Session):
        self.session = session

    def create(self, flag: Flag) -> Flag:
        self.session.add(flag)
        self.session.commit()
        self.session.refresh(flag)
        return flag

    def get_by_id(self, flag_id: UUID) -> Flag | None:
        return self.session.get(Flag, flag_id)

    def get_by_name(self, name: str) -> Flag | None:
        return (
            self.session.query(Flag)
            .filter(Flag.name == name)
            .first()
        )

    def list(self) -> Sequence[Flag]:
        return (
            self.session.query(Flag)
            .order_by(Flag.id)
            .all()
        )

    def update(self, flag: Flag) -> Flag:
        self.session.commit()
        self.session.refresh(flag)
        return flag

    def delete(self, flag: Flag) -> None:
        self.session.delete(flag)
        self.session.commit()
