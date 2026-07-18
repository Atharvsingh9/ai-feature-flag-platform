from __future__ import annotations

import json
import logging
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from notification.base import (
    BaseNotifier,
    RollbackNotification,
)


logger = logging.getLogger(__name__)


class SlackNotifier(BaseNotifier):
    """
    Sends rollback alerts to a Slack Incoming Webhook.
    """

    def __init__(
        self,
        webhook_url: str,
    ) -> None:

        self._webhook_url = webhook_url

    def notify_rollback(
        self,
        notification: RollbackNotification,
    ) -> None:

        payload = {
            "text": "🚨 AI Feature Automatically Rolled Back",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "🚨 AI Feature Automatically Rolled Back",
                    },
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*Flag*\n{notification.flag_name}",
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Rollout*\n{notification.rollout_percentage}%",
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Average Score*\n{notification.average_score:.2f}",
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*P10 Score*\n{notification.p10_score:.2f}",
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Triggered By*\n{notification.triggered_by}",
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Time*\n{notification.timestamp}",
                        },
                    ],
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": (
                            f"*Reason*\n"
                            f"{notification.reason}"
                        ),
                    },
                },
            ],
        }

        request = Request(
            self._webhook_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:

            with urlopen(request):
                logger.info(
                    "Rollback notification sent to Slack."
                )

        except HTTPError as exc:

            logger.exception(
                "Slack webhook returned HTTP %s",
                exc.code,
            )

        except URLError:

            logger.exception(
                "Unable to reach Slack webhook."
            )