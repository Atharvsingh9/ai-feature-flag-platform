from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class DemoSettings:
    llm_provider: str
    openai_api_key: str
    openai_model: str
    openrouter_api_key: str
    openrouter_model: str
    openrouter_base_url: str
    judge_provider: str
    judge_api_key: str
    judge_model: str
    judge_base_url: str


def get_demo_settings() -> DemoSettings:
    return DemoSettings(
        llm_provider=os.getenv("LLM_PROVIDER", "openai"),
        openai_api_key=os.getenv("OPENAI_API_KEY", ""),
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        openrouter_api_key=os.getenv("OPENROUTER_API_KEY", ""),
        openrouter_model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4.1-mini"),
        openrouter_base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
        judge_provider=os.getenv("JUDGE_PROVIDER", "mock"),
        judge_api_key=os.getenv("JUDGE_API_KEY", ""),
        judge_model=os.getenv("JUDGE_MODEL", "openai/gpt-4.1-mini"),
        judge_base_url=os.getenv("JUDGE_BASE_URL", "https://openrouter.ai/api/v1"),
    )
