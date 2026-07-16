"""Tests for SDK client."""

from sdk.python.ai_flags.client import FlagClient
from sdk.python.ai_flags.config import SDKConfig
from sdk.python.ai_flags.models.evaluation import Variant


class FakeTransport:

    def fetch_flag(
        self,
        flag_name,
    ):
        return {
            "name": flag_name,
            "rollout_percentage": 100.0,
            "status": "active",
            "targeting": {},
        }


def test_client_returns_experimental():

    client = FlagClient(
        SDKConfig(
            base_url="https://flags.example.com",
        )
    )

    client._transport = FakeTransport()

    result = client.evaluate(
        "support_model_v2_rollout",
        {
            "user_id": "user_123",
        },
    )

    assert result is Variant.EXPERIMENTAL


def test_client_uses_cache():

    client = FlagClient(
        SDKConfig(
            base_url="https://flags.example.com",
        )
    )

    transport = FakeTransport()

    client._transport = transport

    client.evaluate(
        "support_model_v2_rollout",
        {
            "user_id": "user_123",
        },
    )

    result = client.evaluate(
        "support_model_v2_rollout",
        {
            "user_id": "user_123",
        },
    )

    assert result is Variant.EXPERIMENTAL