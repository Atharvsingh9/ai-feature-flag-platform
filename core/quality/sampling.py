"""
Sampling policies for AI response quality evaluation.

This module determines whether an AI response should be sent
through the quality evaluation pipeline. Keeping this logic
separate from the evaluator allows sampling strategies to evolve
without modifying evaluation code.
"""

from __future__ import annotations

import hashlib
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(slots=True)
class SamplingContext:
    """
    Information required to make a sampling decision.
    """

    user_id: str
    rollout_percentage: int
    sampling_percentage: int


class BaseSamplingPolicy(ABC):
    """
    Abstract sampling policy.
    """

    @abstractmethod
    def should_evaluate(self, context: SamplingContext) -> bool:
        """
        Return True if the response should be evaluated.
        """


class RolloutAwareSamplingPolicy(BaseSamplingPolicy):
    """
    Sampling strategy.

    Rules:

    - Rollout <= 5%  -> evaluate every response.
    - Otherwise use deterministic hashing.
    """

    SMALL_ROLLOUT_THRESHOLD = 5

    def should_evaluate(self, context: SamplingContext) -> bool:
        if context.rollout_percentage <= self.SMALL_ROLLOUT_THRESHOLD:
            return True

        if context.sampling_percentage <= 0:
            return False

        if context.sampling_percentage >= 100:
            return True

        bucket = self._bucket(context.user_id)

        return bucket < context.sampling_percentage

    @staticmethod
    def _bucket(user_id: str) -> int:
        digest = hashlib.sha256(user_id.encode()).hexdigest()
        value = int(digest[:8], 16)
        return value % 100