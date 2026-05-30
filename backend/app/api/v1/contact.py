"""Pre-login Contact Us form endpoint.

Forwards form submissions to CONTACT_FORM_EMAIL via Resend. Quietly logs and
returns success when the env var isn't set, so local dev / preview builds
don't break.
"""

import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.core.config import settings
from app.services.email_service import _send  # type: ignore[attr-defined]

router = APIRouter()
logger = logging.getLogger(__name__)


class ContactFormRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=5000)


class ContactFormResponse(BaseModel):
    success: bool
    message: str


@router.post("/contact", response_model=ContactFormResponse)
async def submit_contact_form(payload: ContactFormRequest) -> ContactFormResponse:
    destination = settings.CONTACT_FORM_EMAIL.strip()

    # Always log — gives us a paper trail even when Resend isn't wired up.
    logger.info(
        "Contact form submission name=%r email=%r message=%r destination=%r",
        payload.name, payload.email, payload.message[:120], destination or "(unset)",
    )

    if not destination:
        # No destination configured — accept the submission so the UI gives
        # the user a confirmation, but flag this clearly in the response so
        # the team can spot when emails aren't actually being delivered.
        return ContactFormResponse(
            success=True,
            message="Thanks — your message has been received. (Email forwarding not yet configured.)",
        )

    safe_name = payload.name.replace("<", "&lt;").replace(">", "&gt;")
    safe_msg = payload.message.replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")
    html = (
        f"<p><strong>From:</strong> {safe_name} &lt;{payload.email}&gt;</p>"
        f"<hr><div>{safe_msg}</div>"
    )

    try:
        _send(destination, subject=f"PitchPal contact form — {payload.name}", html=html)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to forward contact form: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send your message right now. Please try again.",
        ) from exc

    return ContactFormResponse(
        success=True,
        message="Thanks — your message has been sent. We'll get back to you shortly.",
    )
