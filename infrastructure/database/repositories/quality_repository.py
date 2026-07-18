from __future__ import annotations

from uuid import UUID

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from infrastructure.database.models.quality_score import QualityScore
from apps.flags_service.schemas.quality import QualityScoreCreate


class QualityRepository:
    """
    Repository responsible for all database operations related to
    AI quality evaluations.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        quality_score: QualityScoreCreate,
    ) -> QualityScore:
        """
        Persist a new quality evaluation.
        """

        db_quality_score = QualityScore(
            flag_id=quality_score.flag_id,
            request_id=quality_score.request_id,
            user_id=quality_score.user_id,
            variant=quality_score.variant,
            prompt_version=quality_score.prompt_version,
            judge_score=quality_score.judge_score,
            overall_score=quality_score.overall_score,
            latency_ms=quality_score.latency_ms,
            error=quality_score.error,
            error_message=quality_score.error_message,
            feedback=quality_score.feedback,
            feedback_comment=quality_score.feedback_comment,
        )

        self.db.add(db_quality_score)
        self.db.commit()
        self.db.refresh(db_quality_score)

        return db_quality_score

    def get_by_id(
        self,
        quality_score_id: UUID,
    ) -> QualityScore | None:
        """
        Retrieve a quality evaluation by its ID.
        """

        statement = (
            select(QualityScore)
            .where(QualityScore.id == quality_score_id)
        )

        return self.db.scalar(statement)

    def get_scores_for_flag(
        self,
        flag_id: UUID,
    ) -> list[QualityScore]:
        """
        Return all quality evaluations for a flag.
        """

        statement = (
            select(QualityScore)
            .where(QualityScore.flag_id == flag_id)
            .order_by(desc(QualityScore.created_at))
        )

        return list(self.db.scalars(statement).all())

    def get_recent_scores(
        self,
        flag_id: UUID,
        limit: int = 100,
    ) -> list[QualityScore]:
        """
        Return the most recent quality evaluations for a flag.
        """

        statement = (
            select(QualityScore)
            .where(QualityScore.flag_id == flag_id)
            .order_by(desc(QualityScore.created_at))
            .limit(limit)
        )

        return list(self.db.scalars(statement).all())

    def delete(
        self,
        quality_score_id: UUID,
    ) -> bool:
        """
        Delete a quality evaluation.
        """

        quality_score = self.get_by_id(quality_score_id)

        if quality_score is None:
            return False

        self.db.delete(quality_score)
        self.db.commit()

        return True

    def count_for_flag(
        self,
        flag_id: UUID,
    ) -> int:
        """
        Return the total number of evaluations for a flag.
        """

        statement = (
            select(QualityScore)
            .where(QualityScore.flag_id == flag_id)
        )

        return len(self.db.scalars(statement).all())