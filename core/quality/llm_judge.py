from __future__ import annotations

import json
import os
from typing import Any

import requests

from core.quality.judge import BaseJudge, JudgeResult


class LLMJudge(BaseJudge):
    """
    Uses an external LLM to evaluate AI-generated responses.

    Supports OpenAI and OpenRouter as backends.
    The judge sends the prompt and response to the LLM and asks it to
    produce a structured quality evaluation.

    Configuration is read from environment variables:
      JUDGE_PROVIDER  - "openai" or "openrouter" (default: openrouter)
      JUDGE_API_KEY   - API key for the judge provider
      JUDGE_MODEL     - Model name (default: openai/gpt-4.1-mini)
      JUDGE_BASE_URL  - Base URL (default: https://openrouter.ai/api/v1)
    """

    def __init__(
        self,
        provider: str = "openrouter",
        api_key: str = "",
        model: str = "openai/gpt-4.1-mini",
        base_url: str = "https://openrouter.ai/api/v1",
    ) -> None:
        self._provider = provider.lower()
        self._api_key = api_key
        self._model = model
        self._base_url = base_url.rstrip("/")

    def evaluate(self, prompt: str, response: str) -> JudgeResult:
        judge_prompt = self._build_judge_prompt(prompt, response)

        if self._provider == "openai":
            raw = self._call_openai(judge_prompt)
        else:
            raw = self._call_openrouter(judge_prompt)

        return self._parse_judge_response(raw)

    def _build_judge_prompt(self, prompt: str, response: str) -> str:
        return (
            "You are an expert AI quality evaluator. "
            "Evaluate the following AI response based on the original prompt.\n\n"
            f"## Original Prompt\n{prompt}\n\n"
            f"## AI Response\n{response}\n\n"
            "Return a JSON object with exactly these keys:\n"
            "- overall_score (float 0-5, overall quality)\n"
            "- correctness (float 0-5, factual accuracy)\n"
            "- clarity (float 0-5, how clear and well-structured)\n"
            "- helpfulness (float 0-5, how helpful for the user)\n"
            "- grammar (float 0-5, grammar and spelling)\n"
            "- tone (float 0-5, appropriateness of tone)\n"
            "- instruction_following (float 0-5, how well it followed instructions)\n"
            "- reason (string, concise explanation of the score)\n\n"
            "Return ONLY the JSON object, no other text."
        )

    def _call_openai(self, judge_prompt: str) -> str:
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": self._model,
                "messages": [{"role": "user", "content": judge_prompt}],
                "temperature": 0.1,
                "max_tokens": 500,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()
        choices = data.get("choices", [])
        return (choices[0]["message"]["content"] if choices else "").strip()

    def _call_openrouter(self, judge_prompt: str) -> str:
        resp = requests.post(
            f"{self._base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": self._model,
                "messages": [{"role": "user", "content": judge_prompt}],
                "temperature": 0.1,
                "max_tokens": 500,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()
        choices = data.get("choices", [])
        return (choices[0]["message"]["content"] if choices else "").strip()

    def _parse_judge_response(self, raw: str) -> JudgeResult:
        text = raw.strip()
        if text.startswith("```"):
            text = text.strip("`").strip()
            if text.startswith("json"):
                text = text[4:].strip()

        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            return JudgeResult(
                score=3.0,
                reasoning=f"Failed to parse judge response: {raw[:200]}",
            )

        overall = data.get("overall_score", data.get("score", 3.0))
        try:
            overall = float(overall)
        except (TypeError, ValueError):
            overall = 3.0
        overall = max(0.0, min(5.0, overall))

        details = {
            "correctness": data.get("correctness", 0.0),
            "clarity": data.get("clarity", 0.0),
            "helpfulness": data.get("helpfulness", 0.0),
            "grammar": data.get("grammar", 0.0),
            "tone": data.get("tone", 0.0),
            "instruction_following": data.get("instruction_following", 0.0),
            "reason": data.get("reason", ""),
        }

        reasoning = json.dumps(details)
        return JudgeResult(score=overall, reasoning=reasoning)


def create_judge_from_env() -> BaseJudge:
    provider = os.getenv("JUDGE_PROVIDER", "mock").lower()
    if provider == "mock":
        from core.quality.judge import MockJudge
        return MockJudge()

    api_key = os.getenv("JUDGE_API_KEY", "")
    if not api_key:
        api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key and provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY", "")

    return LLMJudge(
        provider=provider,
        api_key=api_key,
        model=os.getenv("JUDGE_MODEL", "openai/gpt-4.1-mini"),
        base_url=os.getenv("JUDGE_BASE_URL", "https://openrouter.ai/api/v1"),
    )
