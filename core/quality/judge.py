from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class JudgeResult:
    """
    Represents the result of evaluating a single AI response.
    """

    score: float
    reasoning: str


class BaseJudge(ABC):
    """
    Abstract base class for all quality judges.

    Every judge implementation (Mock, OpenRouter, OpenAI,
    Claude, Gemini, etc.) must implement the evaluate()
    method.

    The rest of the system depends only on this interface,
    making judge providers completely interchangeable.
    """

    @abstractmethod
    def evaluate(
        self,
        prompt: str,
        response: str,
    ) -> JudgeResult:
        """
        Evaluate an AI-generated response.

        Parameters
        ----------
        prompt:
            The original prompt sent to the AI.

        response:
            The generated AI response.

        Returns
        -------
        JudgeResult
            Contains the quality score and explanation.
        """
        raise NotImplementedError


class MockJudge(BaseJudge):
    """
    Mock implementation used during development and testing.

    Produces deterministic scores based on simple heuristics
    instead of calling a real LLM.
    """

    def evaluate(
        self,
        prompt: str,
        response: str,
    ) -> JudgeResult:

        text = response.strip()

        if not text:
            return JudgeResult(
                score=1.0,
                reasoning="Empty response.",
            )

        if len(text) < 20:
            return JudgeResult(
                score=2.0,
                reasoning="Response is too short.",
            )

        if "i don't know" in text.lower():
            return JudgeResult(
                score=2.5,
                reasoning="Response lacks confidence.",
            )

        if len(text) > 250:
            return JudgeResult(
                score=4.8,
                reasoning="Detailed response.",
            )

        return JudgeResult(
            score=4.3,
            reasoning="Good overall response.",
        )