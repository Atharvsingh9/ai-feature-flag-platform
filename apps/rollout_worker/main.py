from __future__ import annotations

import logging
import time

from infrastructure.database.session import SessionLocal

from core.quality.analyzer import (
    QualityAnalyzer,
)
from core.rollout.canary import (
    CanaryAnalyzer,
)
from core.rollout.scheduler import (
    RolloutScheduler,
)
from core.rollout.statistics import (
    RolloutStatistics,
)
from infrastructure.database.repositories.quality_repository import (
    QualityRepository,
)
from infrastructure.database.repositories.rollout_plan_repository import (
    RolloutPlanRepository,
)
from apps.flags_service.services.canary_service import (
    CanaryService,
)
from apps.flags_service.services.rollout_scheduler import (
    RolloutSchedulerService,
)

logger = logging.getLogger(__name__)


def create_scheduler() -> RolloutSchedulerService:

    db = SessionLocal()

    quality_repository = QualityRepository(db)

    rollout_repository = RolloutPlanRepository(db)

    quality = QualityAnalyzer()

    statistics = RolloutStatistics()

    canary = CanaryAnalyzer(
        statistics=statistics,
    )

    canary_service = CanaryService(
        repository=quality_repository,
        quality_analyzer=quality,
        canary_analyzer=canary,
    )

    scheduler = RolloutScheduler()

    return RolloutSchedulerService(
        repository=rollout_repository,
        canary_service=canary_service,
        scheduler=scheduler,
    )


def create_scheduler() -> RolloutSchedulerService:
    db = SessionLocal()

    quality_repository = QualityRepository(db)
    rollout_repository = RolloutPlanRepository(db)

    quality = QualityAnalyzer()
    statistics = RolloutStatistics()
    canary = CanaryAnalyzer(
        statistics=statistics,
    )

    canary_service = CanaryService(
        repository=quality_repository,
        quality_analyzer=quality,
        canary_analyzer=canary,
    )

    scheduler = RolloutScheduler()

    return RolloutSchedulerService(
        repository=rollout_repository,
        canary_service=canary_service,
        scheduler=scheduler,
    )


def main() -> None:
    scheduler = create_scheduler()

    logger.info(
        "Rollout worker started."
    )

    while True:
        scheduler.run()
        time.sleep(60)


if __name__ == "__main__":
    main()