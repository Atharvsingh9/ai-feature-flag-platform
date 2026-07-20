from __future__ import annotations

from unittest.mock import Mock

from apps.flags_service.services.shadow_service import (
    ShadowService,
)


def test_shadow_service_executes():

    executor = Mock()

    repository = Mock()

    quality = Mock()

    result = Mock()

    executor.execute.return_value = result

    service = ShadowService(
        executor=executor,
        repository=repository,
        quality_service=quality,
    )

    service.execute(
        flag=Mock(),
        user_id="user-1",
        baseline_response="baseline",
        experimental_response="experiment",
        latency_ms=120,
        has_error=False,
        error_message=None,
    )

    executor.execute.assert_called_once()

    repository.save.assert_called_once()

    quality.evaluate_shadow.assert_called_once()