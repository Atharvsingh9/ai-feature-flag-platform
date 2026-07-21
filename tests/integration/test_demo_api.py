from __future__ import annotations

import os
from unittest.mock import Mock, patch, MagicMock
from uuid import uuid4

import pytest

from apps.demo_app.router import router as demo_router


pytestmark = pytest.mark.skipif(
    os.getenv("SKIP_DB_TESTS", "true").lower() == "true",
    reason="Requires running PostgreSQL (docker compose up -d). Set SKIP_DB_TESTS=false to run.",
)


def test_demo_router_prefix():
    assert demo_router.prefix == "/demo"


def test_demo_router_tags():
    assert "Demo" in demo_router.tags


def test_demo_generate_request_schema():
    from apps.demo_app.router import GenerateRequest

    req = GenerateRequest(goal="professional")
    assert req.goal == "professional"
    assert req.userId is None


def test_demo_generate_request_with_user_id():
    from apps.demo_app.router import GenerateRequest

    req = GenerateRequest(goal="friendly", userId="user-123")
    assert req.goal == "friendly"
    assert req.userId == "user-123"


def test_demo_generate_request_default_goal():
    from apps.demo_app.router import GenerateRequest

    req = GenerateRequest()
    assert req.goal == "professional"


def test_demo_generate_response_schema():
    from apps.demo_app.router import GenerateResponse

    resp = GenerateResponse(
        subject="Test Subject",
        body="Test body content",
        metadata={"key": "value"},
    )
    assert resp.subject == "Test Subject"
    assert resp.body == "Test body content"
    assert resp.metadata == {"key": "value"}


def test_demo_status_response_schema():
    from apps.demo_app.router import StatusResponse

    resp = StatusResponse(
        initialized=True,
        flagName="test-flag",
        status="rolling_out",
        rolloutPercentage=50,
        currentVariant="experimental",
        totalEvaluations=100,
        averageQuality=4.5,
    )
    assert resp.initialized is True
    assert resp.flagName == "test-flag"
    assert resp.rolloutPercentage == 50
    assert resp.totalEvaluations == 100
    assert resp.averageQuality == 4.5


def test_demo_status_response_with_flag_id():
    from apps.demo_app.router import StatusResponse

    resp = StatusResponse(
        initialized=True,
        flagName="test",
        status="draft",
        rolloutPercentage=0,
        currentVariant="baseline",
        totalEvaluations=0,
        averageQuality=0.0,
        flagId="uuid-here",
    )
    assert resp.flagId == "uuid-here"


def test_demo_reset_response_schema():
    from apps.demo_app.router import ResetResponse

    resp = ResetResponse(status="reset", message="Demo reset successfully")
    assert resp.status == "reset"
    assert resp.message == "Demo reset successfully"


def test_demo_settings_defaults():
    from apps.demo_app.settings import get_demo_settings

    settings = get_demo_settings()
    assert settings.llm_provider is not None
    assert settings.judge_provider is not None


def test_demo_prompt_constants():
    from apps.demo_app.service import (
        BASELINE_SYSTEM_PROMPT,
        EXPERIMENTAL_SYSTEM_PROMPT,
        BAD_SYSTEM_PROMPT,
        GOALS,
    )

    assert "email" in BASELINE_SYSTEM_PROMPT.lower()
    assert "email" in EXPERIMENTAL_SYSTEM_PROMPT.lower()
    assert "emoji" in BAD_SYSTEM_PROMPT.lower()
    assert "professional" in GOALS
    assert "friendly" in GOALS
    assert "marketing" in GOALS
    assert "apology" in GOALS
    assert "followup" in GOALS


def test_demo_flag_name():
    from apps.demo_app.service import DEMO_FLAG_NAME

    assert DEMO_FLAG_NAME == "ai-email-assistant"


@pytest.mark.parametrize("goal", ["professional", "friendly", "marketing", "apology", "followup"])
def test_goals_contain_all_keys(goal):
    from apps.demo_app.service import GOALS

    assert goal in GOALS
    assert isinstance(GOALS[goal], str)
    assert len(GOALS[goal]) > 0


def test_parse_response_valid_json():
    from apps.demo_app.service import DemoService

    import json

    result = DemoService._parse_response(
        None,
        json.dumps({"subject": "Hello", "body": "World"}),
        "professional",
    )
    assert result["subject"] == "Hello"
    assert result["body"] == "World"


def test_parse_response_codeblock_json():
    from apps.demo_app.service import DemoService

    result = DemoService._parse_response(
        None,
        '```json\n{"subject": "Test", "body": "Content"}\n```',
        "professional",
    )
    assert result["subject"] == "Test"
    assert result["body"] == "Content"


def test_parse_response_fallback():
    from apps.demo_app.service import DemoService

    result = DemoService._parse_response(
        None,
        "Some raw text without proper JSON formatting",
        "followup",
    )
    assert "subject" in result
    assert "body" in result


def test_demo_service_llm_provider_factory():
    from apps.demo_app.providers.llm import (
        BaseLLMProvider,
        FallbackProvider,
        create_llm_provider,
        OpenAIProvider,
        OpenRouterProvider,
    )
    from apps.demo_app.settings import DemoSettings

    settings = DemoSettings(
        llm_provider="openai",
        openai_api_key="",
        openai_model="gpt-4",
        openrouter_api_key="",
        openrouter_model="gpt-4",
        openrouter_base_url="https://openrouter.ai/api/v1",
        judge_provider="mock",
        judge_api_key="",
        judge_model="gpt-4",
        judge_base_url="https://openrouter.ai/api/v1",
    )

    provider = create_llm_provider(settings)
    assert isinstance(provider, FallbackProvider)

    settings_with_key = DemoSettings(
        llm_provider="openai",
        openai_api_key="sk-test",
        openai_model="gpt-4",
        openrouter_api_key="",
        openrouter_model="gpt-4",
        openrouter_base_url="https://openrouter.ai/api/v1",
        judge_provider="mock",
        judge_api_key="",
        judge_model="gpt-4",
        judge_base_url="https://openrouter.ai/api/v1",
    )
    provider = create_llm_provider(settings_with_key)
    assert isinstance(provider, OpenAIProvider)


def test_fallback_provider_returns_llm_response():
    from apps.demo_app.providers.llm import FallbackProvider, LLMResponse

    provider = FallbackProvider()
    result = provider.generate("Write a professional email", "professional topic")
    assert isinstance(result, LLMResponse)
    assert result.model == "fallback"
    assert result.latency_ms >= 0
    assert "subject" in result.text.lower() or "Subject" in result.text


def test_llm_response_dataclass():
    from apps.demo_app.providers.llm import LLMResponse

    resp = LLMResponse(text="Hello", model="test-model", latency_ms=100)
    assert resp.text == "Hello"
    assert resp.model == "test-model"
    assert resp.latency_ms == 100


def test_demo_settings_judge_fields():
    from apps.demo_app.settings import DemoSettings

    settings = DemoSettings(
        llm_provider="openrouter",
        openai_api_key="",
        openai_model="gpt-4",
        openrouter_api_key="sk-key",
        openrouter_model="gpt-4",
        openrouter_base_url="https://openrouter.ai/api/v1",
        judge_provider="openrouter",
        judge_api_key="sk-judge",
        judge_model="anthropic/claude-sonnet-4",
        judge_base_url="https://openrouter.ai/api/v1",
    )
    assert settings.judge_provider == "openrouter"
    assert settings.judge_api_key == "sk-judge"
    assert settings.judge_model == "anthropic/claude-sonnet-4"
