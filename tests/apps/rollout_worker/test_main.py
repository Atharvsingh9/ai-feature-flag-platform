from __future__ import annotations

from unittest.mock import Mock, patch

from apps.rollout_worker.main import (
    create_scheduler,
)


@patch("apps.rollout_worker.main.RolloutSchedulerService")
def test_create_scheduler(service_cls):

    scheduler = create_scheduler()

    service_cls.assert_called_once()

    assert scheduler == service_cls.return_value


@patch("apps.rollout_worker.main.time.sleep")
@patch("apps.rollout_worker.main.create_scheduler")
def test_worker_runs_once(
    create_scheduler,
    sleep,
):

    scheduler = Mock()

    create_scheduler.return_value = scheduler

    sleep.side_effect = KeyboardInterrupt()

    from apps.rollout_worker.main import main

    try:
        main()
    except KeyboardInterrupt:
        pass

    scheduler.run.assert_called_once()


@patch("apps.rollout_worker.main.create_scheduler")
def test_worker_creates_scheduler(
    create_scheduler,
):

    scheduler = Mock()

    create_scheduler.return_value = scheduler

    try:
        from apps.rollout_worker.main import main

        with patch(
            "apps.rollout_worker.main.time.sleep",
            side_effect=KeyboardInterrupt,
        ):
            main()

    except KeyboardInterrupt:
        pass

    create_scheduler.assert_called_once()