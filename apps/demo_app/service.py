from __future__ import annotations

import json
import uuid
from typing import Any

from sqlalchemy.orm import Session

from core.quality.evaluator import QualityEvaluator
from core.quality.judge import BaseJudge
from core.quality.llm_judge import LLMJudge

from infrastructure.database.models.enums import FlagStatus as DBFlagStatus
from infrastructure.database.models.flag import Flag
from infrastructure.database.repositories.flag_repository import FlagRepository
from infrastructure.database.repositories.quality_repository import QualityRepository

from apps.flags_service.services.flag_service import FlagService
from apps.flags_service.services.rollout_service import RolloutService
from apps.flags_service.services.quality_service import QualityService
from apps.flags_service.schemas.quality import VariantType, FeedbackType

from infrastructure.database.repositories.rollout_event_repository import (
    RolloutEventRepository,
)

from sdk.python.ai_flags.evaluator import evaluate as sdk_evaluate
from sdk.python.ai_flags.models.flag import Flag as SDKFlag, FlagStatus as SDKFlagStatus
from sdk.python.ai_flags.models.flag import TargetingRules as SDKTargetingRules

from apps.demo_app.providers.llm import BaseLLMProvider, FallbackProvider, LLMResponse, create_llm_provider
from apps.demo_app.settings import DemoSettings, get_demo_settings

DEMO_FLAG_NAME = "ai-email-assistant"

BASELINE_SYSTEM_PROMPT = """You are an AI email assistant. Write a professional email.

Return your response as a JSON object with exactly two keys:
- "subject": the email subject line
- "body": the full email body

The email must be formal, well-structured, and appropriate for a business context."""

EXPERIMENTAL_SYSTEM_PROMPT = """You are an AI email assistant. Write a concise, engaging email with a strong call-to-action.

Return your response as a JSON object with exactly two keys:
- "subject": the email subject line
- "body": the full email body

The email must be direct, persuasive, and modern in tone. Keep it impactful but brief."""

BAD_SYSTEM_PROMPT = """Return random emojis only. Do not write any words or sentences.

Return your response as a JSON object with exactly two keys:
- "subject": a few random emojis
- "body": a few random emojis

Only use emoji characters, nothing else."""

GOALS: dict[str, str] = {
    "professional": "Write a professional email about the following topic",
    "friendly": "Write a friendly casual email about the following topic",
    "marketing": "Write a marketing promotional email about the following topic",
    "apology": "Write an apology email about the following topic",
    "followup": "Write a follow-up email about the following topic",
}


def _make_quality_service(settings: DemoSettings, db: Session) -> QualityService:
    if settings.judge_provider == "mock":
        from core.quality.judge import MockJudge
        judge: BaseJudge = MockJudge()
    else:
        judge = LLMJudge(
            provider=settings.judge_provider,
            api_key=settings.judge_api_key or settings.openrouter_api_key or settings.openai_api_key,
            model=settings.judge_model,
            base_url=settings.judge_base_url,
        )
    evaluator = QualityEvaluator(judge=judge)
    return QualityService(
        evaluator=evaluator,
        repository=QualityRepository(db),
    )


class DemoService:
    def __init__(self, db: Session) -> None:
        self._db = db
        self._settings = get_demo_settings()
        self._flag_repo = FlagRepository(db)
        self._flag_service = FlagService(repository=self._flag_repo)
        self._rollout_service = RolloutService(
            repository=self._flag_repo,
            event_repository=RolloutEventRepository(db),
        )
        self._quality_service = _make_quality_service(self._settings, db)
        self._llm: BaseLLMProvider | None = None

    def _get_llm(self) -> BaseLLMProvider:
        if self._llm is None:
            self._llm = create_llm_provider(self._settings)
            self._llm_fallback: BaseLLMProvider | None = None
        return self._llm

    def _llm_generate(self, system_prompt: str, user_prompt: str) -> LLMResponse:
        llm = self._get_llm()
        try:
            return llm.generate(system_prompt, user_prompt)
        except Exception:
            if self._llm_fallback is None:
                self._llm_fallback = FallbackProvider()
            return self._llm_fallback.generate(system_prompt, user_prompt)

    def _get_or_create_demo_flag(self) -> Flag:
        flag = self._flag_repo.get_by_name(DEMO_FLAG_NAME)
        if flag is not None:
            return flag
        flag = self._flag_service.create_flag(
            name=DEMO_FLAG_NAME,
            description="AI Email Assistant Demo - Demonstrates feature flags, prompt versioning, quality monitoring, canary analysis, shadow mode, and automatic rollback.",
            baseline_variant="professional-prompt-v1",
            experimental_variant="concise-prompt-v1",
            quality_threshold=60.0,
        )
        return flag

    @staticmethod
    def _map_status(db_status: str) -> str:
        mapping = {
            "draft": "draft",
            "active": "active",
            "rolling_out": "active",
            "paused": "paused",
            "rolled_back": "rolled_back",
            "archived": "paused",
        }
        return mapping.get(db_status, "draft")

    def _evaluate_sdk(self, flag: Flag, user_id: str) -> str:
        sdk_flag = SDKFlag(
            name=flag.name,
            rollout_percentage=float(flag.rollout_percentage),
            status=SDKFlagStatus(self._map_status(
                flag.status.value if hasattr(flag.status, "value") else str(flag.status)
            )),
            targeting=SDKTargetingRules(),
        )
        user_context: dict[str, Any] = {"user_id": user_id}
        variant = sdk_evaluate(sdk_flag, user_context)
        return variant.value

    def _parse_response(self, text: str, goal: str) -> dict[str, str]:
        text = text.strip()
        if text.startswith("```"):
            text = text.strip("`").strip()
            if text.startswith("json"):
                text = text[4:].strip()
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            if "subject" in text.lower() and ":" in text:
                lines = text.split("\n")
                subject = ""
                body_lines: list[str] = []
                found_subject = False
                for line in lines:
                    lower = line.lower().strip()
                    if lower.startswith("subject"):
                        subject = line.split(":", 1)[-1].strip().strip('"').strip("'")
                        found_subject = True
                    elif lower.startswith("body"):
                        rest = line.split(":", 1)[-1].strip().strip('"').strip("'")
                        if rest:
                            body_lines.append(rest)
                    elif found_subject:
                        body_lines.append(line)
                body = "\n".join(body_lines).strip()
                data = {"subject": subject or f"Re: {goal}", "body": body or text}
            else:
                data = {"subject": f"Re: {goal}", "body": text}
        return {
            "subject": data.get("subject", "").strip(),
            "body": data.get("body", "").strip(),
        }

    def generate(self, goal: str, user_id: str | None = None) -> dict[str, Any]:
        if user_id is None:
            user_id = f"demo-user-{uuid.uuid4().hex[:8]}"
        flag = self._get_or_create_demo_flag()
        variant = self._evaluate_sdk(flag, user_id)
        is_experiment = variant == "experiment"

        if is_experiment:
            system_prompt = EXPERIMENTAL_SYSTEM_PROMPT
            prompt_version = "concise-prompt-v1"
        else:
            system_prompt = BASELINE_SYSTEM_PROMPT
            prompt_version = "professional-prompt-v1"

        user_prompt = GOALS.get(goal, GOALS["professional"])
        llm_response = self._llm_generate(system_prompt, user_prompt)

        parsed = self._parse_response(llm_response.text, goal)
        subject = parsed["subject"]
        body = parsed["body"]

        request_id = uuid.uuid4().hex[:16]
        prompt_used = f"{system_prompt}\n\n{user_prompt}"

        if subject or body:
            self._quality_service.evaluate_response(
                flag_id=flag.id,
                request_id=request_id,
                user_id=user_id,
                variant=VariantType.EXPERIMENT if is_experiment else VariantType.BASELINE,
                prompt_version=prompt_version,
                prompt=prompt_used,
                response=json.dumps({"subject": subject, "body": body}),
                latency_ms=llm_response.latency_ms,
                feedback=FeedbackType.NONE,
                has_error=False,
            )

        return {
            "subject": subject,
            "body": body,
            "metadata": {
                "flagName": flag.name,
                "flagStatus": flag.status.value if hasattr(flag.status, "value") else str(flag.status),
                "variant": "experimental" if is_experiment else "baseline",
                "rolloutPercentage": flag.rollout_percentage,
                "promptVersion": prompt_version,
                "qualityScore": 0.0,
                "judgeScore": 0.0,
                "latencyMs": llm_response.latency_ms,
                "model": llm_response.model,
            },
        }

    def bad_generate(self, goal: str, user_id: str | None = None) -> dict[str, Any]:
        if user_id is None:
            user_id = f"demo-user-{uuid.uuid4().hex[:8]}"
        flag = self._get_or_create_demo_flag()

        user_prompt = GOALS.get(goal, GOALS["professional"])
        llm_response = self._llm_generate(BAD_SYSTEM_PROMPT, user_prompt)

        parsed = self._parse_response(llm_response.text, goal)
        subject = parsed["subject"]
        body = parsed["body"]

        request_id = uuid.uuid4().hex[:16]
        prompt_used = f"{BAD_SYSTEM_PROMPT}\n\n{user_prompt}"

        if subject or body:
            self._quality_service.evaluate_response(
                flag_id=flag.id,
                request_id=request_id,
                user_id=user_id,
                variant=VariantType.BASELINE,
                prompt_version="bad-prompt-v1",
                prompt=prompt_used,
                response=json.dumps({"subject": subject, "body": body}),
                latency_ms=llm_response.latency_ms,
                feedback=FeedbackType.NEGATIVE,
                has_error=True,
                error_message="Bad demo: intentionally poor quality prompt",
            )

        return {
            "subject": subject,
            "body": body,
            "metadata": {
                "flagName": flag.name,
                "flagStatus": flag.status.value if hasattr(flag.status, "value") else str(flag.status),
                "variant": "baseline",
                "rolloutPercentage": flag.rollout_percentage,
                "promptVersion": "bad-prompt-v1",
                "qualityScore": 0.0,
                "judgeScore": 0.0,
                "latencyMs": llm_response.latency_ms,
                "model": llm_response.model,
            },
        }

    def get_status(self) -> dict[str, Any]:
        flag = self._flag_repo.get_by_name(DEMO_FLAG_NAME)
        if flag is None:
            return {
                "initialized": False,
                "flagName": DEMO_FLAG_NAME,
                "status": "not_created",
                "rolloutPercentage": 0,
                "currentVariant": "baseline",
                "totalEvaluations": 0,
                "averageQuality": 0.0,
            }
        variant = self._evaluate_sdk(flag, "demo-status-check")
        quality_scores = self._quality_service._repository.get_scores_for_flag(flag.id)
        avg_quality = (
            round(sum(s.overall_score for s in quality_scores) / len(quality_scores), 2)
            if quality_scores
            else 0.0
        )
        return {
            "initialized": True,
            "flagId": str(flag.id),
            "flagName": flag.name,
            "status": flag.status.value if hasattr(flag.status, "value") else str(flag.status),
            "rolloutPercentage": flag.rollout_percentage,
            "currentVariant": "experimental" if variant == "experiment" else "baseline",
            "totalEvaluations": len(quality_scores),
            "averageQuality": avg_quality,
        }

    def reset(self) -> dict[str, str]:
        flag = self._flag_repo.get_by_name(DEMO_FLAG_NAME)
        if flag is None:
            return {"status": "not_found", "message": "Demo flag not found. Nothing to reset."}

        scores = self._quality_service._repository.get_scores_for_flag(flag.id)
        for s in scores:
            self._quality_service._repository.delete(s.id)

        if flag.status != DBFlagStatus.DRAFT:
            flag.rollout_percentage = 0
            flag.status = DBFlagStatus.DRAFT
            self._flag_repo.update(flag)

        return {
            "status": "reset",
            "message": "Demo has been reset. All evaluations deleted, flag returned to draft state.",
        }
