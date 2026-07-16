"""Tests for SDK transport."""

import pytest
import requests

from sdk.python.ai_flags.config import SDKConfig
from sdk.python.ai_flags.exceptions import (
    FlagNotFoundError,
    TransportError,
)
from sdk.python.ai_flags.transport import FlagTransport


class DummyResponse:
    def __init__(
        self,
        *,
        status_code: int,
        payload=None,
    ):
        self.status_code = status_code
        self._payload = payload or {}

    @property
    def ok(self):
        return self.status_code < 400

    def json(self):
        return self._payload


def test_successful_fetch(monkeypatch):

    payload = {
        "name": "support_model_v2_rollout",
        "rollout_percentage": 20.0,
        "status": "active",
    }

    def fake_get(*args, **kwargs):
        return DummyResponse(
            status_code=200,
            payload=payload,
        )

    monkeypatch.setattr(
        requests,
        "get",
        fake_get,
    )

    transport = FlagTransport(
        SDKConfig(
            base_url="https://flags.example.com",
        )
    )

    result = transport.fetch_flag(
        "support_model_v2_rollout"
    )

    assert result["name"] == "support_model_v2_rollout"


def test_flag_not_found(monkeypatch):

    def fake_get(*args, **kwargs):
        return DummyResponse(
            status_code=404,
        )

    monkeypatch.setattr(
        requests,
        "get",
        fake_get,
    )

    transport = FlagTransport(
        SDKConfig(
            base_url="https://flags.example.com",
        )
    )

    with pytest.raises(
        FlagNotFoundError,
    ):
        transport.fetch_flag("missing")


def test_transport_error(monkeypatch):

    def fake_get(*args, **kwargs):
        raise requests.RequestException

    monkeypatch.setattr(
        requests,
        "get",
        fake_get,
    )

    transport = FlagTransport(
        SDKConfig(
            base_url="https://flags.example.com",
        )
    )

    with pytest.raises(
        TransportError,
    ):
        transport.fetch_flag("flag")