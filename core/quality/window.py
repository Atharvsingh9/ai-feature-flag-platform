from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from statistics import mean, stdev


@dataclass(frozen=True)
class WindowStatistics:
    """
    Summary statistics for a rolling quality window.
    """

    count: int
    mean_score: float
    minimum_score: float
    maximum_score: float
    standard_deviation: float


class RollingQualityWindow:
    """
    Maintains a fixed-size rolling window of quality scores.

    As new scores arrive, the oldest scores are automatically
    removed once the window reaches its maximum size.
    """

    def __init__(
        self,
        window_size: int = 100,
    ) -> None:

        if window_size <= 0:
            raise ValueError("window_size must be greater than zero.")

        self._scores: deque[float] = deque(maxlen=window_size)

    def add_score(
        self,
        score: float,
    ) -> None:
        """
        Add a new quality score to the rolling window.
        """

        self._scores.append(score)

    def clear(self) -> None:
        """
        Remove all scores from the window.
        """

        self._scores.clear()

    @property
    def size(self) -> int:
        """
        Current number of scores in the window.
        """

        return len(self._scores)

    @property
    def is_empty(self) -> bool:
        """
        Whether the window contains any scores.
        """

        return len(self._scores) == 0

    def scores(self) -> list[float]:
        """
        Return all scores in chronological order.
        """

        return list(self._scores)

    def statistics(self) -> WindowStatistics:
        """
        Compute summary statistics for the current window.
        """

        if self.is_empty:
            raise ValueError("Cannot calculate statistics for an empty window.")

        scores = self.scores()

        std = 0.0

        if len(scores) > 1:
            std = stdev(scores)

        return WindowStatistics(
            count=len(scores),
            mean_score=round(mean(scores), 2),
            minimum_score=min(scores),
            maximum_score=max(scores),
            standard_deviation=round(std, 2),
        )