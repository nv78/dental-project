from __future__ import annotations

import logging
import os

logger = logging.getLogger(__name__)


def send_sms(to: str, body: str) -> bool:
    """Send SMS via Twilio. Returns True on success, False when creds missing."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")
    if not all([account_sid, auth_token, from_number]):
        logger.info("Twilio creds not configured; SMS skipped: %s", body[:60])
        return False
    try:
        from twilio.rest import Client  # type: ignore[import]

        client = Client(account_sid, auth_token)
        client.messages.create(body=body, from_=from_number, to=to)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.warning("SMS send failed: %s", exc)
        return False
