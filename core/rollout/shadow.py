from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ShadowResult:
    """
    Represents the outcome of executing a
    shadow evaluation.
    """

    baseline_response: str

    experimental_response: str

    judge_score: float

    latency_ms: int

    has_error: bool

    error_message: str | None = None


class ShadowExecutor:
    """
    Executes a shadow evaluation.

    The baseline response is returned to the user,
    while the experimental response is executed
    silently for quality evaluation.
    """

    def execute(
        self,
        *,
        baseline_response: str,
        experimental_response: str,
        judge_score: float,
        latency_ms: int,
        has_error: bool = False,
        error_message: str | None = None,
    ) -> ShadowResult:
        """
        Create a shadow evaluation result.
        """

        return ShadowResult(
            baseline_response=baseline_response,
            experimental_response=experimental_response,
            judge_score=judge_score,
            latency_ms=latency_ms,
            has_error=has_error,
            error_message=error_message,
        )