from __future__ import annotations

import json
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any

import requests

from apps.demo_app.settings import DemoSettings


@dataclass
class LLMResponse:
    text: str
    model: str
    latency_ms: int


class BaseLLMProvider(ABC):
    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str) -> LLMResponse:
        ...


class OpenAIProvider(BaseLLMProvider):
    def __init__(self, settings: DemoSettings) -> None:
        self._api_key = settings.openai_api_key
        self._model = settings.openai_model

    def generate(self, system_prompt: str, user_prompt: str) -> LLMResponse:
        start = time.monotonic()
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": self._model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.7,
                "max_tokens": 500,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()
        elapsed = int((time.monotonic() - start) * 1000)
        choices = data.get("choices", [])
        text = (choices[0]["message"]["content"] if choices else "").strip()
        return LLMResponse(text=text, model=self._model, latency_ms=elapsed)


class OpenRouterProvider(BaseLLMProvider):
    def __init__(self, settings: DemoSettings) -> None:
        self._api_key = settings.openrouter_api_key
        self._model = settings.openrouter_model
        self._base_url = settings.openrouter_base_url

    def generate(self, system_prompt: str, user_prompt: str) -> LLMResponse:
        start = time.monotonic()
        resp = requests.post(
            f"{self._base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/anomalyco/aifeatureflagplatform",
            },
            json={
                "model": self._model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.7,
                "max_tokens": 500,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()
        elapsed = int((time.monotonic() - start) * 1000)
        choices = data.get("choices", [])
        text = (choices[0]["message"]["content"] if choices else "").strip()
        return LLMResponse(text=text, model=self._model, latency_ms=elapsed)


class FallbackProvider(BaseLLMProvider):
    def __init__(self) -> None:
        self._goals: dict[str, tuple[str, str, str]] = {
            "professional": (
                "Professional Email",
                "Subject: Professional Follow-Up Regarding Next Steps\n\nDear [Recipient],\n\nI hope this message finds you well. I wanted to follow up on our recent discussion regarding the proposed partnership. After careful consideration, I believe our organizations share complementary strengths that could create significant mutual value.\n\nI would appreciate the opportunity to discuss this further at your earliest convenience. Please let me know what time works best for you.\n\nBest regards,\n[Your Name]"
            ),
            "friendly": (
                "Friendly Check-In",
                "Subject: Hey! Let's catch up soon\n\nHey [Name],\n\nIt's been a while! I was thinking about our last conversation and realized we should definitely catch up soon. How have you been?\n\nLet me know if you're free for coffee next week!\n\nCheers,\n[Your Name]"
            ),
            "marketing": (
                "Exciting New Offer Just For You",
                "Subject: Unlock Exclusive Benefits Today\n\nHi [Name],\n\nWe're thrilled to introduce our latest offering designed specifically for you. Our new platform delivers unparalleled value with features that will transform your workflow.\n\nFor a limited time, enjoy 20% off your first month. Don't miss out!\n\nClick here to get started: [Link]\n\nThe Team"
            ),
            "apology": (
                "Our Sincere Apologies",
                "Subject: Please accept our sincere apologies\n\nDear [Name],\n\nI want to personally apologize for the inconvenience you experienced recently. We fell short of our commitment to you, and for that, I am truly sorry.\n\nWe have already identified the root cause and implemented measures to prevent this from happening again.\n\nAs a gesture of goodwill, we have credited your account with one month of service at no charge.\n\nSincerely,\n[Your Name]"
            ),
            "followup": (
                "Following Up On Your Request",
                "Subject: Quick Follow-Up\n\nHi [Name],\n\nI'm writing to follow up on your recent inquiry. I wanted to make sure we addressed all your questions and provided the information you needed.\n\nPlease don't hesitate to reach out if there's anything else we can help with.\n\nBest,\n[Your Name]"
            ),
        }

    def generate(self, system_prompt: str, user_prompt: str) -> LLMResponse:
        start = time.monotonic()
        goal = "professional"
        for key in self._goals:
            if key in user_prompt.lower():
                goal = key
                break
        subj, body = self._goals[goal]
        elapsed = int((time.monotonic() - start) * 1000)
        text = json.dumps({"subject": subj, "body": body})
        return LLMResponse(text=text, model="fallback", latency_ms=elapsed)


def create_llm_provider(settings: DemoSettings) -> BaseLLMProvider:
    provider = settings.llm_provider.lower()
    if provider == "openai" and settings.openai_api_key:
        return OpenAIProvider(settings)
    if provider == "openrouter" and settings.openrouter_api_key:
        return OpenRouterProvider(settings)
    return FallbackProvider()
