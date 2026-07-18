from __future__ import annotations

from dataclasses import dataclass

from core.quality.judge import BaseJudge
from core.quality.metrics import calculate_overall_score


@dataclass(frozen=True)
class EvaluationResult:
    """
    Represents the complete quality evaluation of a single AI response.
    """

    judge_score: float
    overall_score: float
    latency_ms: int
    feedback: str
    has_error: bool
    reasoning: str


class QualityEvaluator:
    """
    Coordinates the complete quality evaluation pipeline.

    Responsibilities
    ----------------
    1. Ask the configured judge to evaluate the response.
    2. Convert latency, feedback and reliability into scores.
    3. Calculate the final weighted quality score.
    4. Return a structured evaluation result.

    This class contains no database logic.
    """

    def __init__(
        self,
        judge: BaseJudge,
    ) -> None:
        self._judge = judge

    def evaluate(
        self,
        *,
        prompt: str,
        response: str,
        latency_ms: int,
        feedback: str = "none",
        has_error: bool = False,
    ) -> EvaluationResult:
        """
        Evaluate an AI response.
        """

        judge_result = self._judge.evaluate(
            prompt=prompt,
            response=response,
        )

        overall_score = calculate_overall_score(
            judge_score=judge_result.score,
            latency_ms=latency_ms,
            feedback=feedback,
            has_error=has_error,
        )

        return EvaluationResult(
            judge_score=judge_result.score,
            overall_score=overall_score,
            latency_ms=latency_ms,
            feedback=feedback,
            has_error=has_error,
            reasoning=judge_result.reasoning,
        )