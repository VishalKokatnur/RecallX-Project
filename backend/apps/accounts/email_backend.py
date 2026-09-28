"""
Django email backend that sends through Brevo's transactional email HTTPS API.

Why: Render's free web services block outbound SMTP ports (25/465/587), so
Django's default SMTP backend hangs until gunicorn kills the worker. HTTPS
(port 443) is not blocked, so we call Brevo's REST API instead.

Uses only the standard library (urllib) so no extra dependency is needed.
"""
import json
import logging
import urllib.error
import urllib.request

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

logger = logging.getLogger(__name__)

BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email"


class BrevoEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        api_key = getattr(settings, "BREVO_API_KEY", "")
        if not api_key:
            if not self.fail_silently:
                raise ValueError("BREVO_API_KEY is not set.")
            return 0

        sent = 0
        for message in email_messages:
            payload = {
                "sender": {"email": settings.BREVO_SENDER_EMAIL, "name": "RecallX"},
                "to": [{"email": addr} for addr in message.to],
                "subject": message.subject,
                "textContent": message.body,
            }
            request = urllib.request.Request(
                BREVO_SEND_URL,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "api-key": api_key,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                method="POST",
            )
            try:
                # Short timeout so a network problem can never hang the worker.
                with urllib.request.urlopen(request, timeout=10) as response:
                    if 200 <= response.status < 300:
                        sent += 1
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")
                logger.error("Brevo API error %s: %s", exc.code, detail)
                if not self.fail_silently:
                    raise
            except Exception:
                logger.exception("Brevo API request failed")
                if not self.fail_silently:
                    raise
        return sent