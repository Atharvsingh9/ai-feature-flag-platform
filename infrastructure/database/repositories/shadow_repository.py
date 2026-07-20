from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from infrastructure.database.models.shadow_evaluation import ShadowEvaluation


class ShadowRepository:
    """
    Repository responsible for persisting and retrieving
    shadow evaluation records.
    """

    def __init__(self, session: Session):
        self._session = session

    def save(
        self,
        evaluation: ShadowEvaluation,
    ) -> ShadowEvaluation:
        """
        Save a shadow evaluation.
        """

        self._session.add(evaluation)
        self._session.commit()
        self._session.refresh(evaluation)

        return evaluation

    def get(
        self,
        evaluation_id: UUID,
    ) -> ShadowEvaluation | None:
        """
        Retrieve a shadow evaluation by ID.
        """

        return self._session.get(
            ShadowEvaluation,
            evaluation_id,
        )

    def latest(
        self,
        flag_id: UUID,
        limit: int = 100,
    ) -> list[ShadowEvaluation]:
        """
        Return the latest shadow evaluations for a flag.
        """

        statement = (
            select(ShadowEvaluation)
            .where(
                ShadowEvaluation.flag_id == flag_id,
            )
            .order_by(
                ShadowEvaluation.created_at.desc(),
            )
            .limit(limit)
        )

        return list(
            self._session.scalars(statement)
        )

    def by_user(
        self,
        flag_id: UUID,
        user_id: str,
    ) -> list[ShadowEvaluation]:
        """
        Retrieve all shadow evaluations
        for a specific user.
        """

        statement = (
            select(ShadowEvaluation)
            .where(
                ShadowEvaluation.flag_id == flag_id,
                ShadowEvaluation.user_id == user_id,
            )
            .order_by(
                ShadowEvaluation.created_at.desc(),
            )
        )

        return list(
            self._session.scalars(statement)
        )

    def delete(
        self,
        evaluation: ShadowEvaluation,
    ) -> None:
        """
        Delete a shadow evaluation.
        """

        self._session.delete(evaluation)
        self._session.commit()