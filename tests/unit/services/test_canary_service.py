from __future__ import annotations

from unittest.mock import Mock , ANY

from core.quality.analyzer import (
    QualityAnalysis,
    QualityTrend,
)
from core.rollout.canary import (
    CanaryResult,
)
from apps.flags_service.services.canary_service import CanaryService
from infrastructure.database.models.quality_score import (
    VariantType,
)
from unittest.mock import ANY

def make_score(
    score: float,
    variant: VariantType,
):
    obj = Mock()
    obj.overall_score = score
    obj.variant = variant
    return obj


def test_canary_service_calls_repository():

    repository = Mock()

    quality = Mock()

    canary = Mock()

    repository.get_recent_scores.return_value = []

    quality.analyze.return_value = Mock()

    canary.evaluate.return_value = Mock()

    service = CanaryService(
        repository=repository,
        quality_analyzer=quality,
        canary_analyzer=canary,
    )

    service.evaluate(
        flag_id=Mock(),
        minimum_quality=4.0,
    )

    repository.get_recent_scores.assert_called_once()


def test_quality_analyzer_receives_experiment_scores():

    repository = Mock()

    quality = Mock()

    canary = Mock()

    repository.get_recent_scores.return_value = [
        make_score(4.8, VariantType.BASELINE),
        make_score(4.2, VariantType.EXPERIMENT),
        make_score(4.0, VariantType.EXPERIMENT),
    ]

    quality.analyze.return_value = Mock()

    canary.evaluate.return_value = Mock()

    service = CanaryService(
        repository,
        quality,
        canary,
    )

    service.evaluate(
        flag_id=ANY,
        minimum_quality=4.0,
    )

    quality.analyze.assert_called_once_with(
        [4.2, 4.0]
    )


def test_canary_analyzer_called():

    repository = Mock()

    quality = Mock()

    canary = Mock()

    repository.get_recent_scores.return_value = [
        make_score(4.5, VariantType.BASELINE),
        make_score(4.3, VariantType.EXPERIMENT),
    ]

    analysis = Mock()

    quality.analyze.return_value = analysis

    canary.evaluate.return_value = Mock()

    service = CanaryService(
        repository,
        quality,
        canary,
    )

    service.evaluate(
        flag_id=Mock(),
        minimum_quality=4.0,
    )

    canary.evaluate.assert_called_once()


def test_returns_canary_result():

    repository = Mock()

    quality = Mock()

    canary = Mock()

    repository.get_recent_scores.return_value = [
        make_score(4.5, VariantType.BASELINE),
        make_score(4.4, VariantType.EXPERIMENT),
    ]

    analysis = Mock()

    quality.analyze.return_value = analysis

    expected = Mock(spec=CanaryResult)

    canary.evaluate.return_value = expected

    service = CanaryService(
        repository,
        quality,
        canary,
    )

    result = service.evaluate(
        flag_id=Mock(),
        minimum_quality=4.0,
    )

    assert result == expected


def test_repository_limit_passed():

    repository = Mock()

    quality = Mock()

    canary = Mock()

    repository.get_recent_scores.return_value = []

    quality.analyze.return_value = Mock()

    canary.evaluate.return_value = Mock()

    service = CanaryService(
        repository,
        quality,
        canary,
    )

    service.evaluate(
        flag_id=Mock(),
        minimum_quality=4.0,
        sample_size=250,
    )

    repository.get_recent_scores.assert_called_once_with(
        flag_id=Mock.ANY,
        limit=250,
    )