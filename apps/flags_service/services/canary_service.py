from __future__ import annotations

from uuid import UUID

from core.quality.analyzer import QualityAnalyzer
from core.rollout.canary import (
    CanaryAnalyzer,
    CanaryResult,
)
from infrastructure.database.repositories.quality_repository import QualityRepository


class CanaryService:
    """
    Coordinates quality analysis and canary evaluation.
    """

    def __init__(
        self,
        repository: QualityRepository,
        quality_analyzer: QualityAnalyzer,
        canary_analyzer: CanaryAnalyzer,
    ):
        self.repository = repository
        self.quality_analyzer = quality_analyzer
        self.canary_analyzer = canary_analyzer

    def evaluate(
        self,
        flag_id: UUID,
        minimum_quality: float,
        sample_size: int = 100,
    ) -> CanaryResult:

        scores = self.repository.get_recent_scores(
            flag_id=flag_id,
            limit=sample_size,
        )

        baseline = [
            score.overall_score
            for score in scores
            if score.variant.value == "baseline"
        ]

        experiment = [
            score.overall_score
            for score in scores
            if score.variant.value == "experiment"
        ]

        analysis = self.quality_analyzer.analyze(
            experiment
        )

        return self.canary_analyzer.evaluate(
            baseline_scores=baseline,
            experiment_scores=experiment,
            analysis=analysis,
            minimum_quality=minimum_quality,
        )