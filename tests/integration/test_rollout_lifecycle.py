from __future__ import annotations

from unittest.mock import Mock, MagicMock, patch, PropertyMock
from uuid import uuid4, UUID

import pytest

from apps.flags_service.services.flag_service import FlagService
from apps.flags_service.services.rollout_service import RolloutService
from apps.flags_service.services.rollback_monitor import (
    RollbackMonitor,
    RollbackDecision,
)
from apps.flags_service.services.canary_service import CanaryService
from apps.flags_service.services.shadow_service import ShadowService
from apps.flags_service.services.quality_service import QualityService
from apps.flags_service.schemas.flag import FlagCreate, FlagUpdate
from apps.flags_service.schemas.quality import VariantType, FeedbackType
from apps.flags_service.exceptions.flag_exceptions import (
    FlagAlreadyExistsError,
    FlagNotFoundError,
    InvalidFlagStateError,
    InvalidRolloutPercentageError,
)
from infrastructure.database.models.enums import FlagStatus
from infrastructure.database.models.flag import Flag
from infrastructure.database.models.rollout_plan import RolloutPlan  # noqa: F401
from infrastructure.database.models.rollout_stage import RolloutStage  # noqa: F401
from core.quality.evaluator import QualityEvaluator, EvaluationResult
from core.quality.judge import MockJudge
from core.quality.analyzer import QualityAnalyzer, QualityAnalysis, QualityTrend
from core.rollout.canary import CanaryAnalyzer, CanaryResult
from core.rollout.statistics import RolloutStatistics
from core.rollout.shadow import ShadowExecutor, ShadowResult


def make_flag(
    flag_id: UUID | None = None,
    name: str = "test-flag",
    status: FlagStatus = FlagStatus.DRAFT,
    rollout_percentage: int = 0,
    quality_threshold: float = 60.0,
) -> Flag:
    flag = Flag(
        name=name,
        description="Test flag",
        baseline_variant="baseline-v1",
        experimental_variant="experiment-v1",
        quality_threshold=quality_threshold,
    )
    if flag_id:
        flag.id = flag_id
    flag.status = status
    flag.rollout_percentage = rollout_percentage
    return flag


class TestFlagServiceIntegration:

    def test_create_flag_success(self):
        repo = Mock()
        service = FlagService(repository=repo)
        repo.get_by_name.return_value = None
        repo.create.return_value = make_flag(name="new-flag")

        flag = service.create_flag(
            name="new-flag",
            description="A test flag",
            baseline_variant="v1",
            experimental_variant="v2",
            quality_threshold=75.0,
        )
        assert flag.name == "new-flag"
        repo.create.assert_called_once()

    def test_create_flag_duplicate_name(self):
        repo = Mock()
        service = FlagService(repository=repo)
        repo.get_by_name.return_value = make_flag(name="existing")

        with pytest.raises(FlagAlreadyExistsError):
            service.create_flag(
                name="existing",
                description="Duplicate",
                baseline_variant="v1",
                experimental_variant="v2",
                quality_threshold=50.0,
            )

    def test_create_flag_invalid_threshold(self):
        repo = Mock()
        service = FlagService(repository=repo)
        repo.get_by_name.return_value = None

        with pytest.raises(Exception):
            service.create_flag(
                name="bad-threshold",
                description="Bad",
                baseline_variant="v1",
                experimental_variant="v2",
                quality_threshold=150.0,
            )

    def test_get_flag_found(self):
        repo = Mock()
        service = FlagService(repository=repo)
        expected = make_flag(flag_id=uuid4(), name="find-me")
        repo.get_by_id.return_value = expected

        result = service.get_flag(expected.id)
        assert result.name == "find-me"

    def test_get_flag_not_found(self):
        repo = Mock()
        service = FlagService(repository=repo)
        repo.get_by_id.return_value = None

        with pytest.raises(FlagNotFoundError):
            service.get_flag(uuid4())

    def test_list_flags(self):
        repo = Mock()
        service = FlagService(repository=repo)
        repo.list.return_value = [
            make_flag(name="flag-1"),
            make_flag(name="flag-2"),
        ]

        flags = service.list_flags()
        assert len(flags) == 2

    def test_update_flag_success(self):
        repo = Mock()
        service = FlagService(repository=repo)
        flag = make_flag(flag_id=uuid4(), name="original")
        repo.get_by_id.return_value = flag
        repo.get_by_name.return_value = None

        service.update_flag(
            flag_id=flag.id,
            request=FlagUpdate(name="updated-name"),
        )
        repo.update.assert_called_once()
        assert flag.name == "updated-name"

    def test_delete_flag_success(self):
        repo = Mock()
        service = FlagService(repository=repo)
        flag = make_flag(flag_id=uuid4())
        repo.get_by_id.return_value = flag

        service.delete_flag(flag.id)
        repo.delete.assert_called_once_with(flag)


class TestRolloutServiceIntegration:

    def test_start_rollout_from_draft(self):
        repo = Mock()
        event_repo = Mock()
        service = RolloutService(repository=repo, event_repository=event_repo)

        flag = make_flag(status=FlagStatus.DRAFT, rollout_percentage=0)
        repo.get_by_id.return_value = flag

        result = service.start_rollout(
            flag_id=uuid4(),
            percentage=25,
            actor="tester",
            reason="Starting rollout",
        )
        assert result.status == FlagStatus.ROLLING_OUT
        assert result.rollout_percentage == 25
        event_repo.create.assert_called_once()

    def test_start_rollout_invalid_state(self):
        repo = Mock()
        event_repo = Mock()
        service = RolloutService(repository=repo, event_repository=event_repo)

        flag = make_flag(status=FlagStatus.ROLLING_OUT)
        repo.get_by_id.return_value = flag

        with pytest.raises(InvalidFlagStateError):
            service.start_rollout(
                flag_id=uuid4(), percentage=10, actor="tester", reason="Test"
            )

    def test_pause_and_resume_rollout(self):
        repo = Mock()
        event_repo = Mock()
        service = RolloutService(repository=repo, event_repository=event_repo)

        flag = make_flag(status=FlagStatus.ROLLING_OUT, rollout_percentage=50)
        repo.get_by_id.return_value = flag

        paused = service.pause_rollout(
            flag_id=uuid4(), actor="tester", reason="Pausing"
        )
        assert paused.status == FlagStatus.PAUSED

        flag.status = FlagStatus.PAUSED
        resumed = service.resume_rollout(
            flag_id=uuid4(), actor="tester", reason="Resuming"
        )
        assert resumed.status == FlagStatus.ROLLING_OUT

    def test_rollback_rolling_out_flag(self):
        repo = Mock()
        event_repo = Mock()
        service = RolloutService(repository=repo, event_repository=event_repo)

        flag = make_flag(status=FlagStatus.ROLLING_OUT, rollout_percentage=75)
        repo.get_by_id.return_value = flag

        result = service.rollback(
            flag_id=uuid4(), actor="monitor", reason="Quality degraded"
        )
        assert result.status == FlagStatus.ROLLED_BACK
        assert result.rollout_percentage == 0

    def test_rollback_draft_flag_fails(self):
        repo = Mock()
        event_repo = Mock()
        service = RolloutService(repository=repo, event_repository=event_repo)

        flag = make_flag(status=FlagStatus.DRAFT)
        repo.get_by_id.return_value = flag

        with pytest.raises(InvalidFlagStateError):
            service.rollback(
                flag_id=uuid4(), actor="monitor", reason="Test"
            )

    def test_invalid_rollout_percentage(self):
        repo = Mock()
        event_repo = Mock()
        service = RolloutService(repository=repo, event_repository=event_repo)

        repo.get_by_id.return_value = make_flag(status=FlagStatus.DRAFT)

        with pytest.raises(InvalidRolloutPercentageError):
            service.start_rollout(
                flag_id=uuid4(), percentage=150, actor="tester", reason="Bad"
            )


class TestRollbackMonitorIntegration:

    def test_healthy_quality_no_rollback(self):
        rollout_service = Mock()
        notifier = Mock()
        monitor = RollbackMonitor(
            rollout_service=rollout_service, notifier=notifier
        )

        analysis = QualityAnalysis(
            sample_size=100,
            mean_score=4.5,
            minimum_score=4.0,
            maximum_score=5.0,
            p10_score=4.3,
            standard_deviation=0.2,
            trend=QualityTrend.STABLE,
        )

        decision = monitor.evaluate(
            flag_id=uuid4(),
            analysis=analysis,
            quality_threshold=4.0,
        )
        assert decision.should_rollback is False

    def test_low_p10_triggers_rollback(self):
        rollout_service = Mock()
        notifier = Mock()
        monitor = RollbackMonitor(
            rollout_service=rollout_service, notifier=notifier
        )

        analysis = QualityAnalysis(
            sample_size=100,
            mean_score=3.0,
            minimum_score=1.0,
            maximum_score=4.0,
            p10_score=2.0,
            standard_deviation=0.8,
            trend=QualityTrend.STABLE,
        )

        decision = monitor.evaluate(
            flag_id=uuid4(),
            analysis=analysis,
            quality_threshold=4.0,
        )
        assert decision.should_rollback is True
        rollout_service.rollback.assert_called_once()

    def test_degrading_trend_triggers_rollback(self):
        rollout_service = Mock()
        notifier = Mock()
        monitor = RollbackMonitor(
            rollout_service=rollout_service, notifier=notifier
        )

        analysis = QualityAnalysis(
            sample_size=100,
            mean_score=4.0,
            minimum_score=3.5,
            maximum_score=4.5,
            p10_score=3.8,
            standard_deviation=0.3,
            trend=QualityTrend.DEGRADING,
        )

        decision = monitor.evaluate(
            flag_id=uuid4(),
            analysis=analysis,
            quality_threshold=2.0,
        )
        assert decision.should_rollback is True

    def test_insufficient_samples_no_rollback(self):
        rollout_service = Mock()
        notifier = Mock()
        monitor = RollbackMonitor(
            rollout_service=rollout_service, notifier=notifier
        )

        analysis = QualityAnalysis(
            sample_size=5,
            mean_score=2.5,
            minimum_score=1.0,
            maximum_score=4.0,
            p10_score=1.5,
            standard_deviation=0.5,
            trend=QualityTrend.DEGRADING,
        )

        decision = monitor.evaluate(
            flag_id=uuid4(),
            analysis=analysis,
            quality_threshold=4.0,
            minimum_sample_size=50,
        )
        assert decision.should_rollback is False

    def test_rollback_notifier_called(self):
        rollout_service = Mock()
        notifier = Mock()
        monitor = RollbackMonitor(
            rollout_service=rollout_service, notifier=notifier
        )

        analysis = QualityAnalysis(
            sample_size=100,
            mean_score=2.0,
            minimum_score=1.0,
            maximum_score=3.0,
            p10_score=1.5,
            standard_deviation=0.5,
            trend=QualityTrend.DEGRADING,
        )

        monitor.evaluate(
            flag_id=uuid4(),
            analysis=analysis,
            quality_threshold=4.0,
        )
        notifier.notify_rollback.assert_called_once()


class TestCanaryAnalysisIntegration:

    def test_canary_service_evaluates_correctly(self):
        repository = Mock()
        quality_analyzer = QualityAnalyzer()
        canary_analyzer = CanaryAnalyzer(statistics=RolloutStatistics())
        service = CanaryService(
            repository=repository,
            quality_analyzer=quality_analyzer,
            canary_analyzer=canary_analyzer,
        )

        mock_scores = []
        for i in range(100):
            s = MagicMock()
            s.overall_score = 4.0 + (i % 5) * 0.2
            s.variant = MagicMock()
            s.variant.value = "experiment" if i < 50 else "baseline"
            mock_scores.append(s)

        repository.get_recent_scores.return_value = mock_scores

        result = service.evaluate(
            flag_id=uuid4(),
            minimum_quality=3.5,
        )
        assert isinstance(result, CanaryResult)


class TestShadowModeIntegration:

    def test_shadow_service_evaluate(self):
        repository = Mock()
        quality_service = Mock()
        executor = ShadowExecutor()
        service = ShadowService(
            repository=repository,
            quality_service=quality_service,
            executor=executor,
        )

        from apps.flags_service.schemas.shadow import ShadowEvaluationCreate

        request = ShadowEvaluationCreate(
            flag_id=uuid4(),
            user_id="user-shadow",
            baseline_response="Baseline response",
            experimental_response="Experimental response",
            judge_score=4.5,
            latency_ms=500,
            has_error=False,
            error_message=None,
        )

        result = service.evaluate(request)
        assert isinstance(result, ShadowResult)


class TestSDKEvaluationIntegration:

    def test_sdk_evaluate_consistent_assignment(self):
        from sdk.python.ai_flags.evaluator import evaluate as sdk_evaluate
        from sdk.python.ai_flags.models.flag import Flag as SDKFlag, FlagStatus as SDKFlagStatus
        from sdk.python.ai_flags.models.flag import TargetingRules as SDKTargetingRules

        flag = SDKFlag(
            name="test-flag",
            rollout_percentage=50.0,
            status=SDKFlagStatus.ACTIVE,
            targeting=SDKTargetingRules(),
        )

        results = {}
        for i in range(100):
            user_id = f"user-{i}"
            result = sdk_evaluate(flag, {"user_id": user_id})
            results[user_id] = result.value

        assert all(v in ("baseline", "experimental") for v in results.values())

    def test_sdk_deterministic_bucketing(self):
        from sdk.python.ai_flags.evaluator import evaluate as sdk_evaluate
        from sdk.python.ai_flags.models.flag import Flag as SDKFlag, FlagStatus as SDKFlagStatus
        from sdk.python.ai_flags.models.flag import TargetingRules as SDKTargetingRules

        flag = SDKFlag(
            name="consistent-flag",
            rollout_percentage=50.0,
            status=SDKFlagStatus.ACTIVE,
            targeting=SDKTargetingRules(),
        )

        result1 = sdk_evaluate(flag, {"user_id": "same-user"})
        result2 = sdk_evaluate(flag, {"user_id": "same-user"})
        assert result1.value == result2.value

    def test_sdk_all_baseline_at_zero_percent(self):
        from sdk.python.ai_flags.evaluator import evaluate as sdk_evaluate
        from sdk.python.ai_flags.models.flag import Flag as SDKFlag, FlagStatus as SDKFlagStatus
        from sdk.python.ai_flags.models.flag import TargetingRules as SDKTargetingRules

        flag = SDKFlag(
            name="zero-rollout",
            rollout_percentage=0.0,
            status=SDKFlagStatus.DRAFT,
            targeting=SDKTargetingRules(),
        )

        for i in range(50):
            result = sdk_evaluate(flag, {"user_id": f"user-{i}"})
            assert result.value == "baseline"

    def test_sdk_all_experiment_at_hundred_percent(self):
        from sdk.python.ai_flags.evaluator import evaluate as sdk_evaluate
        from sdk.python.ai_flags.models.flag import Flag as SDKFlag, FlagStatus as SDKFlagStatus
        from sdk.python.ai_flags.models.flag import TargetingRules as SDKTargetingRules

        flag = SDKFlag(
            name="full-rollout",
            rollout_percentage=100.0,
            status=SDKFlagStatus.ACTIVE,
            targeting=SDKTargetingRules(),
        )

        for i in range(50):
            result = sdk_evaluate(flag, {"user_id": f"user-{i}"})
            assert result.value == "experimental"
