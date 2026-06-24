import logging
from urllib.parse import urlencode

import resend

from app.core.config import settings

logger = logging.getLogger(__name__)

_resend_ready = False


# Brand tokens mirroring frontend/tailwind.config.js
BRAND = {
    "bg":            "#0C0623",   # pp-dark
    "card":          "#150A2E",   # subtle lift over pp-dark
    "card_border":   "rgba(209,182,252,0.18)",
    "divider":       "rgba(209,182,252,0.12)",
    "text":          "#FFFFFF",
    "text_muted":    "rgba(255,255,255,0.72)",
    "text_subtle":   "rgba(255,255,255,0.45)",
    "text_faint":    "rgba(255,255,255,0.32)",
    "accent":        "#00B8D7",   # pp-blue
    "purple_start":  "#8137F6",   # pp-purple
    "purple_end":    "#641ABE",   # pp-purple-deep
    "font":          "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}


def _ensure_resend_configured() -> bool:
    global _resend_ready
    if _resend_ready:
        return True
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — email will be skipped.")
        return False
    resend.api_key = settings.RESEND_API_KEY
    _resend_ready = True
    return True


def _build_link(path: str, token: str) -> str:
    base = settings.FRONTEND_URL.rstrip("/")
    return f"{base}{path}?{urlencode({'token': token})}"


def _logo_url() -> str:
    if settings.EMAIL_LOGO_URL:
        return settings.EMAIL_LOGO_URL
    base = settings.FRONTEND_URL.rstrip("/")
    return f"{base}/email-logo.png"


def _render_branded_email(
    *,
    preheader: str,
    eyebrow: str,
    headline: str,
    intro: str,
    button_label: str,
    button_url: str,
    footer_note: str,
) -> str:
    b = BRAND
    logo = _logo_url()
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>PitchPal</title>
  </head>
  <body style="margin:0;padding:0;background:{b['bg']};font-family:{b['font']};">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">{preheader}</span>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{b['bg']};padding:48px 16px;">
      <tr>
        <td align="center">
          <!-- Brand logo -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;">
            <tr>
              <td align="center" style="padding:0 0 24px 0;">
                <img src="{logo}" alt="PitchPal" width="160" height="46" style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:160px;font-family:{b['font']};font-size:22px;font-weight:600;color:{b['text']};line-height:46px;" />
                <div style="font-family:{b['font']};font-size:10px;font-weight:600;letter-spacing:2.4px;color:{b['accent']};text-transform:uppercase;margin-top:10px;">AI-powered song matching</div>
              </td>
            </tr>
          </table>

          <!-- Card -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:{b['card']};border:1px solid {b['card_border']};border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:40px 40px 0 40px;">
                <div style="font-family:{b['font']};font-size:11px;font-weight:600;letter-spacing:2.2px;color:{b['accent']};text-transform:uppercase;">{eyebrow}</div>
                <h1 style="margin:14px 0 0 0;color:{b['text']};font-family:{b['font']};font-size:28px;font-weight:600;line-height:1.25;letter-spacing:-0.4px;">{headline}</h1>
                <p style="margin:14px 0 0 0;color:{b['text_muted']};font-family:{b['font']};font-size:15px;line-height:1.65;font-weight:400;">{intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 0 40px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td bgcolor="{b['purple_end']}" style="border-radius:12px;background:{b['purple_end']};background-image:linear-gradient(90deg,{b['purple_start']} 0%,{b['purple_end']} 100%);">
                      <a href="{button_url}" target="_blank" style="display:inline-block;padding:14px 32px;background:{b['purple_end']};background-image:linear-gradient(90deg,{b['purple_start']} 0%,{b['purple_end']} 100%);color:{b['text']};text-decoration:none;font-family:{b['font']};font-size:15px;font-weight:600;letter-spacing:0.2px;border-radius:12px;">{button_label}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0 40px;">
                <p style="margin:0;color:{b['text_subtle']};font-family:{b['font']};font-size:13px;line-height:1.6;">Or paste this link into your browser:</p>
                <p style="margin:6px 0 0 0;word-break:break-all;">
                  <a href="{button_url}" target="_blank" style="color:{b['accent']};font-family:{b['font']};font-size:13px;text-decoration:none;">{button_url}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 0 40px;">
                <div style="height:1px;background:{b['divider']};line-height:1px;font-size:0;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 36px 40px;">
                <p style="margin:0;color:{b['text_subtle']};font-family:{b['font']};font-size:12px;line-height:1.6;">{footer_note}</p>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;">
            <tr>
              <td align="center" style="padding:24px 0 0 0;">
                <p style="margin:0;color:{b['text_faint']};font-family:{b['font']};font-size:11px;letter-spacing:0.3px;">&copy; PitchPal &middot; Pitch the right songs to the right artists</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""


def _send(to: str, subject: str, html: str) -> None:
    if not _ensure_resend_configured():
        return
    try:
        resend.Emails.send(
            {
                "from": settings.RESEND_FROM_EMAIL,
                "to": [to],
                "subject": subject,
                "html": html,
            }
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to send email to %s: %s", to, exc)


def send_verification_email(email: str, token: str) -> None:
    link = _build_link("/verify-email", token)
    html = _render_branded_email(
        preheader="Confirm your email to start using PitchPal.",
        eyebrow="Welcome to PitchPal",
        headline="Verify your email to get started",
        intro=(
            "Thanks for signing up. Tap the button below to confirm your email "
            "address — then you can start matching your tracks to the artists "
            "looking for them."
        ),
        button_label="Verify email",
        button_url=link,
        footer_note="If you didn't create a PitchPal account, you can safely ignore this email.",
    )
    _send(email, "Verify your PitchPal email", html)


def send_password_reset_email(email: str, token: str) -> None:
    link = _build_link("/reset-password", token)
    html = _render_branded_email(
        preheader="Reset your PitchPal password. This link expires in 1 hour.",
        eyebrow="Password reset",
        headline="Reset your password",
        intro=(
            "We received a request to reset your PitchPal password. Tap the "
            "button below to choose a new one. This link expires in 1 hour."
        ),
        button_label="Reset password",
        button_url=link,
        footer_note="If you didn't request a password reset, you can safely ignore this email and your password will stay the same.",
    )
    _send(email, "Reset your PitchPal password", html)


def send_contact_form_email(
    *,
    to: str,
    name: str,
    sender_email: str,
    message: str,
) -> None:
    """Branded email for the public Contact Us form.

    Different layout from the CTA-style _render_branded_email — this one
    emphasises the sender info and the full message body so the team can
    read & reply in one glance. Reply-to is the sender so hitting "Reply"
    in Gmail goes straight back to them.
    """
    if not _ensure_resend_configured():
        return

    b = BRAND
    logo = _logo_url()
    safe_name = (name or "").replace("<", "&lt;").replace(">", "&gt;")
    safe_email = (sender_email or "").replace("<", "&lt;").replace(">", "&gt;")
    safe_msg = (message or "").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")
    preheader = f"New contact-form message from {safe_name}"

    html = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>PitchPal — Contact form</title>
  </head>
  <body style="margin:0;padding:0;background:{b['bg']};font-family:{b['font']};">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">{preheader}</span>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{b['bg']};padding:48px 16px;">
      <tr>
        <td align="center">
          <!-- Brand logo -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;">
            <tr>
              <td align="center" style="padding:0 0 24px 0;">
                <img src="{logo}" alt="PitchPal" width="160" height="46" style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:160px;" />
                <div style="font-family:{b['font']};font-size:10px;font-weight:600;letter-spacing:2.4px;color:{b['accent']};text-transform:uppercase;margin-top:10px;">AI-powered song matching</div>
              </td>
            </tr>
          </table>

          <!-- Card -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:{b['card']};border:1px solid {b['card_border']};border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:40px 40px 0 40px;">
                <div style="font-family:{b['font']};font-size:11px;font-weight:600;letter-spacing:2.2px;color:{b['accent']};text-transform:uppercase;">Contact form</div>
                <h1 style="margin:14px 0 0 0;color:{b['text']};font-family:{b['font']};font-size:26px;font-weight:600;line-height:1.3;letter-spacing:-0.3px;">New message from {safe_name}</h1>
                <p style="margin:14px 0 0 0;color:{b['text_muted']};font-family:{b['font']};font-size:14px;line-height:1.65;">Someone just reached out through the PitchPal Contact page.</p>
              </td>
            </tr>

            <!-- Sender pill -->
            <tr>
              <td style="padding:28px 40px 0 40px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(129,55,246,0.10);border:1px solid rgba(129,55,246,0.30);border-radius:14px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <div style="font-family:{b['font']};font-size:11px;font-weight:600;letter-spacing:1.4px;color:{b['accent']};text-transform:uppercase;">From</div>
                      <div style="margin-top:6px;color:{b['text']};font-family:{b['font']};font-size:15px;font-weight:600;">{safe_name}</div>
                      <div style="margin-top:2px;">
                        <a href="mailto:{safe_email}" style="color:{b['accent']};font-family:{b['font']};font-size:13px;text-decoration:none;">{safe_email}</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:28px 40px 0 40px;">
                <div style="font-family:{b['font']};font-size:11px;font-weight:600;letter-spacing:1.4px;color:{b['accent']};text-transform:uppercase;">Message</div>
              </td>
            </tr>

            <!-- Message body -->
            <tr>
              <td style="padding:10px 40px 0 40px;">
                <div style="color:{b['text']};font-family:{b['font']};font-size:15px;line-height:1.7;white-space:normal;">{safe_msg}</div>
              </td>
            </tr>

            <!-- Reply CTA -->
            <tr>
              <td style="padding:32px 40px 0 40px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-radius:12px;background:{b['purple_end']};background-image:linear-gradient(90deg,{b['purple_start']} 0%,{b['purple_end']} 100%);">
                      <a href="mailto:{safe_email}?subject=Re%3A%20PitchPal%20contact%20form" target="_blank" style="display:inline-block;padding:14px 28px;color:{b['text']};text-decoration:none;font-family:{b['font']};font-size:14px;font-weight:600;letter-spacing:0.2px;border-radius:12px;">Reply to {safe_name}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 40px 0 40px;">
                <div style="height:1px;background:{b['divider']};line-height:1px;font-size:0;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 36px 40px;">
                <p style="margin:0;color:{b['text_subtle']};font-family:{b['font']};font-size:12px;line-height:1.6;">Sent automatically by the PitchPal Contact form. Reply directly to reach the sender — your reply will go to {safe_email}.</p>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;">
            <tr>
              <td align="center" style="padding:24px 0 0 0;">
                <p style="margin:0;color:{b['text_faint']};font-family:{b['font']};font-size:11px;letter-spacing:0.3px;">&copy; PitchPal &middot; Pitch the right songs to the right artists</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""

    # Use resend directly so we can set reply_to → sender, making the "Reply"
    # button in Gmail / Outlook go straight back to the form submitter.
    try:
        resend.Emails.send(
            {
                "from": settings.RESEND_FROM_EMAIL,
                "to": [to],
                "reply_to": [sender_email],
                "subject": f"PitchPal contact form — {name}",
                "html": html,
            }
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Failed to send contact form email: %s", exc)


def send_oauth_welcome_email(email: str, provider: str = "Google") -> None:
    """Send a no-verification welcome email after social sign-up.

    The OAuth provider has already verified the email, so this email has no
    "verify" link — it just welcomes the user and points them at the
    dashboard.
    """
    dashboard_link = settings.FRONTEND_URL.rstrip("/") + "/upload"
    html = _render_branded_email(
        preheader=f"Welcome to PitchPal! Your account is ready via {provider}.",
        eyebrow="Welcome to PitchPal",
        headline="You're all set",
        intro=(
            f"Thanks for joining PitchPal via {provider}. Your account is ready "
            "and your email is already verified — no extra step needed. Jump "
            "into your dashboard to upload your first track and find the "
            "artists looking for songs like yours."
        ),
        button_label="Go to dashboard",
        button_url=dashboard_link,
        footer_note=(
            f"If you didn't sign in with {provider}, please secure your "
            f"{provider} account immediately and ignore this email."
        ),
    )
    _send(email, "Welcome to PitchPal", html)
