"""
Public listening-page endpoints — anyone with a valid token can stream a
track, but tokens are unguessable, expire after 30 days, and the audio
itself is delivered via a short-lived presigned R2 URL so it cannot be
casually shared or downloaded.

Routes are mounted at the app root (not /api/v1) because the user-facing
URL embedded in pitch emails is intentionally short — pitchpal.co.uk/listen/<token>.
"""
from __future__ import annotations

import html
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db import get_session
from app.models.track import Track
from app.services.r2_service import delete_audio, presigned_get_url, r2_configured

router = APIRouter()


async def _lookup_active_track(token: str, session: AsyncSession) -> Track:
    """Resolve a token to a Track row, enforcing existence + expiry."""
    if not token or not isinstance(token, str) or len(token) > 32:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listening link not found.")

    track = (
        await session.execute(select(Track).where(Track.listening_token == token))
    ).scalar_one_or_none()
    if track is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listening link not found.")

    now = datetime.now(timezone.utc)
    if track.audio_expires_at is not None and track.audio_expires_at < now:
        # Lazy cleanup — if expired and audio still in R2, schedule deletion.
        if track.r2_object_key:
            delete_audio(track.r2_object_key)
            track.r2_object_key = None
            await session.commit()
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This listening link has expired.",
        )
    if not track.r2_object_key:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Audio for this listening link is no longer available.",
        )
    return track


_PITCHPAL_LOGO_SVG = (
    '<svg width="125" height="36" viewBox="0 0 125 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="PitchPal">'
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M18.1929 0.000955049C25.6609 0.0778808 32.3066 4.75485 34.897 11.7568C37.4872 18.7589 35.4842 26.6327 29.8628 31.5478C28.8201 32.4595 27.6753 33.249 26.4517 33.8984C21.6844 36.4282 16.0329 36.6869 11.0542 34.6035C9.15166 33.8073 7.39958 32.6899 5.87548 31.3008C0.356778 26.2709 -1.48329 18.3572 1.25048 11.4101C3.98455 4.46327 10.7252 -0.0756585 18.1929 0.000955049ZM17.2036 10.8301C16.785 11.0036 16.4191 11.1959 16.2309 11.6367C16.0008 12.1834 15.9977 24.3038 16.2085 24.8213C16.3507 25.1691 16.599 25.4567 16.9546 25.5918C17.2117 25.6894 17.4883 25.6807 17.7573 25.6455C18.146 25.4914 18.5641 25.2931 18.7368 24.8818C18.8783 24.5393 18.8796 13.9018 18.8413 12.6709C18.8311 12.3419 18.8346 11.8527 18.6977 11.5517C18.5503 11.2279 18.2137 11.0157 17.8882 10.9053C17.6607 10.8282 17.4414 10.8241 17.2036 10.8301ZM13.5249 12.7021C13.0169 12.8631 12.7759 13.0107 12.4839 13.4785C12.2874 14.6772 12.4026 16.808 12.3999 18.0693C12.3978 19.0454 12.2501 22.6931 12.6167 23.2226C12.8329 23.5367 13.1727 23.744 13.5513 23.791C13.6879 23.8091 13.8875 23.8108 14.0278 23.8076C14.4111 23.6314 14.931 23.3334 15.0073 22.9394C15.2395 21.7369 15.2568 14.012 14.9643 13.4316C14.8022 13.1065 14.5117 12.864 14.1626 12.7627C13.9714 12.7053 13.7248 12.687 13.5249 12.7021ZM20.9985 12.6953C19.7755 13.0073 19.8298 13.8476 19.8296 14.9179C19.8292 17.3299 19.829 19.7425 19.8413 22.1543C19.8471 23.2774 20.3054 23.8434 21.4839 23.8037C21.8935 23.6346 22.2924 23.3969 22.4634 22.9638C22.7311 22.2851 22.6651 15.4777 22.6001 14.3945C22.5819 14.0911 22.5686 13.7647 22.4399 13.4853C22.2795 13.1371 21.9892 12.8981 21.6304 12.7724C21.4294 12.7021 21.2103 12.689 20.9985 12.6953ZM9.81884 15.4922C9.45296 15.6244 8.95429 15.8227 8.81982 16.2246C8.52266 17.1129 8.58249 18.2297 8.604 19.1719C8.63091 20.3476 9.08526 21.0318 10.272 21.0049C11.4458 20.6561 11.4326 19.644 11.4458 18.6123C11.4616 17.383 11.6407 15.3628 9.81884 15.4922ZM24.645 15.4941C23.2717 16.0705 23.4959 17.2179 23.4643 18.4726C23.4321 19.7506 23.5758 21.0673 25.1684 20.998C26.7525 20.5307 26.2419 18.6794 26.3296 17.375C26.4056 16.2446 25.8472 15.4586 24.645 15.4941Z" fill="#00B8D7"/>'
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M94.535 10.0358C97.443 10.0571 100.879 9.83645 103.703 10.2839C107.224 10.842 108.092 16.3509 105.817 18.6647C104.464 20.0417 102.782 20.1913 100.948 20.2419L98.1376 20.2487C98.0695 22.1725 98.1132 24.3456 98.1132 26.2888H94.5399C94.4546 20.9667 94.5135 15.369 94.535 10.0358ZM98.1317 13.0642C98.111 14.4519 98.1096 15.8404 98.1268 17.2282C99.6546 17.2381 101.491 17.4719 102.7 16.5241C103.484 15.6747 103.744 14.5777 102.787 13.7341C101.638 12.7211 99.5516 13.1988 98.1317 13.0642Z" fill="#00B8D7"/>'
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M45.4941 10.0189C47.6674 10.0709 50.0259 9.84966 52.1552 10.3383C55.5562 11.1189 56.2672 16.3115 54.1347 18.6351C52.8544 20.0297 50.9772 20.1665 49.2119 20.2416C48.2844 20.2584 47.3284 20.2502 46.3984 20.2533C46.3031 22.1584 46.352 24.3531 46.3564 26.2865C45.1797 26.2964 44.0028 26.2974 42.8261 26.2894C42.743 24.2161 42.8011 21.8307 42.7998 19.726C42.786 16.4973 42.7887 13.2681 42.8085 10.0394C43.6769 10.0101 44.6105 9.99937 45.4941 10.0189ZM51.0556 13.7514C50.0341 12.8472 47.6834 13.0554 46.3857 13.0599C46.3362 14.2971 46.3201 15.9824 46.3681 17.2338C47.8723 17.241 49.6636 17.426 50.9277 16.5717C51.7586 15.7143 52.0194 14.6048 51.0556 13.7514Z" fill="#FEFEFE"/>'
    '<path d="M81.5718 10.0407C82.6064 10.0097 83.6409 10.0185 84.6747 10.067C84.7005 11.3055 84.7626 14.3878 84.6134 15.4561C85.6635 14.6369 86.7852 14.2292 88.1086 14.232C92.5608 14.2412 92.1685 17.94 92.1616 21.1772C92.1676 22.8821 92.1512 24.5871 92.1133 26.2915C91.0166 26.3009 89.9002 26.2853 88.8018 26.2807C88.7768 24.6439 88.7699 23.007 88.7811 21.3702C88.7828 20.3816 88.9466 18.038 88.2457 17.4027C86.868 16.176 85.0075 17.3613 84.8255 19.0323C84.5729 21.3628 84.6833 23.9262 84.6695 26.2833C83.5573 26.2932 82.4451 26.2934 81.3321 26.2837C81.2717 22.6571 81.3355 18.9573 81.3097 15.3238C81.3036 14.4589 81.2528 10.7934 81.3571 10.1121L81.5718 10.0407Z" fill="#FEFEFE"/>'
    '<path d="M113.53 14.1718C119.979 14.2735 118.081 18.279 118.423 23.0126C118.507 24.1853 118.735 25.1663 119.076 26.2743C117.963 26.3047 116.848 26.3071 115.735 26.2811L115.298 25.1776C113.285 26.9755 109.843 27.1829 108.302 24.66C108.165 24.3035 108.078 23.9411 108.015 23.5653C107.168 18.5382 114.089 19.6277 114.979 18.2792C115.059 18.1585 115.085 17.9826 115.053 17.8397C114.994 17.5811 114.778 17.2907 114.559 17.1464C114.083 16.8341 113.4 16.7642 112.856 16.8973C112.067 17.0908 111.611 17.5755 111.201 18.2362C110.202 18.1203 109.208 17.9577 108.225 17.7499C108.8 14.7486 110.934 14.2942 113.53 14.1718ZM114.715 20.9608C113.447 21.2052 109.63 21.9285 112.058 23.8241C113.852 24.7301 115.331 22.7099 115.084 21.1132L114.973 20.9608H114.715Z" fill="#00B8D7"/>'
    '<path d="M74.7737 14.2557C77.8136 14.1106 79.1456 15.4098 80.1078 18.1124C79.1137 18.3806 77.8093 18.5286 76.7747 18.6709C76.5066 18.0272 76.2393 17.3201 75.5324 17.0598C74.3331 16.6183 73.0968 17.3544 72.7252 18.5291C72.3493 19.7181 72.3838 21.218 72.8726 22.3649C73.352 23.4881 74.5762 23.9899 75.6876 23.4993C76.4135 23.1638 76.7221 22.2473 76.9446 21.508L79.0577 21.8866L80.2414 22.1014C79.5233 24.9887 78.2904 26.1944 75.1703 26.4993C69.2223 27.0802 67.4014 19.9295 70.4914 15.9304C71.4785 14.652 73.1658 14.3337 74.7737 14.2557Z" fill="#FEFEFE"/>'
    '<path d="M65.984 10.3534C66.172 10.5929 66.0961 13.8498 66.0952 14.3929C66.8401 14.3993 67.4462 14.4104 68.1937 14.4765L68.2032 17.1492L66.1392 17.1785C66.1177 18.1423 65.9056 23.0397 66.4203 23.5175C67.0367 23.6787 67.5807 23.5318 68.198 23.4102C68.317 24.3364 68.3817 25.2687 68.3911 26.2025C67.529 26.4196 66.8712 26.4844 65.9909 26.5371C65.1262 26.5176 64.1442 26.3912 63.5019 25.7557C62.3328 24.5987 62.6897 19.0209 62.6897 17.1768L61.2818 17.1466C61.2758 16.2454 61.2775 15.3441 61.287 14.4429L62.6716 14.4087L62.7259 12.1814C63.7157 11.446 64.871 10.8749 65.984 10.3534Z" fill="#FEFEFE"/>'
    '<path d="M120.902 10.0228C122.017 10.0225 123.132 10.0352 124.247 10.0609C124.29 15.4702 124.291 20.8797 124.25 26.2889L120.908 26.2927C120.842 20.9252 120.88 15.3931 120.902 10.0228Z" fill="#00B8D7"/>'
    '<path d="M58.4295 14.4339C59.0951 14.4228 59.7003 14.4406 60.3651 14.4658C60.4297 18.3304 60.3763 22.4172 60.3349 26.2851L58.9675 26.2934L57.0139 26.2869C56.9035 22.5121 56.9958 18.2742 57.0018 14.4715C57.4398 14.4409 57.9838 14.443 58.4295 14.4339Z" fill="#FEFEFE"/>'
    '<path d="M57.3071 10.038C58.3615 10.0211 59.2943 10.0192 60.3479 10.0609C60.3556 10.6256 60.466 12.7869 60.2324 13.1056L60.0022 13.1409C59.0038 13.1529 58.0054 13.1479 57.0071 13.126C56.9924 12.5482 56.9036 10.5384 57.0795 10.1081L57.3071 10.038Z" fill="#FEFEFE"/>'
    '</svg>'
)


def _listen_page_html(track: Track, audio_url: str) -> str:
    """Self-contained dark-themed player page — matches PitchPal brand colours."""
    track_filename = html.escape(track.filename or "Untitled track")
    track_id_label = html.escape(f"PP-{track.id:03d}")
    genre = html.escape(track.detected_genre or "")
    bpm_html = (
        f"<span class='meta-chip'>{track.bpm} BPM</span>" if track.bpm else ""
    )
    genre_html = (
        f"<span class='meta-chip'>{genre}</span>" if genre else ""
    )
    expires_label = ""
    if track.audio_expires_at:
        days_left = max(0, (track.audio_expires_at - datetime.now(timezone.utc)).days)
        expires_label = f"Available for {days_left} more day{'s' if days_left != 1 else ''}"

    # JSON-encode the audio URL so quotes / ampersands inside the presigned
    # URL can't break out of the attribute.
    audio_src = json.dumps(audio_url)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{track_filename} · PitchPal</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {{
    --bg: #0C0623;
    --panel: #160B33;
    --border: rgba(255,255,255,0.08);
    --text: #ffffff;
    --muted: rgba(255,255,255,0.6);
    --pp-purple: #8137F6;
    --pp-blue: #00B8D7;
  }}
  * {{ box-sizing: border-box; }}
  html, body {{ margin: 0; padding: 0; min-height: 100vh; background: var(--bg); color: var(--text); font-family: 'Poppins', system-ui, sans-serif; overflow-x: hidden; }}
  body {{
    background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    position: relative;
    min-height: 100vh;
  }}

  /* ── Animated background — multiple radial-gradient orbs that drift  ── */
  /* and pulse when audio is playing. CSS-only via .playing toggle.       ── */
  .bg-orb {{
    position: fixed;
    pointer-events: none;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.55;
    transition: opacity 700ms ease-out, transform 700ms ease-out;
    will-change: transform, opacity;
    z-index: 0;
  }}
  .bg-orb.purple {{
    width: 720px; height: 720px;
    left: -180px; top: -180px;
    background: radial-gradient(circle, rgba(144,0,255,0.45) 0%, rgba(144,0,255,0) 65%);
    animation: orb-drift-1 14s ease-in-out infinite;
  }}
  .bg-orb.cyan {{
    width: 600px; height: 600px;
    right: -120px; top: 10%;
    background: radial-gradient(circle, rgba(0,184,215,0.35) 0%, rgba(0,184,215,0) 65%);
    animation: orb-drift-2 18s ease-in-out infinite;
  }}
  .bg-orb.violet {{
    width: 540px; height: 540px;
    left: 30%; bottom: -180px;
    background: radial-gradient(circle, rgba(129,55,246,0.40) 0%, rgba(129,55,246,0) 65%);
    animation: orb-drift-3 16s ease-in-out infinite;
  }}
  @keyframes orb-drift-1 {{
    0%, 100% {{ transform: translate(0, 0) scale(1); }}
    33%      {{ transform: translate(60px, 40px) scale(1.06); }}
    66%      {{ transform: translate(-30px, 80px) scale(0.96); }}
  }}
  @keyframes orb-drift-2 {{
    0%, 100% {{ transform: translate(0, 0) scale(1); }}
    50%      {{ transform: translate(-80px, 60px) scale(1.08); }}
  }}
  @keyframes orb-drift-3 {{
    0%, 100% {{ transform: translate(0, 0) scale(1); }}
    50%      {{ transform: translate(40px, -60px) scale(1.05); }}
  }}

  body.playing .bg-orb {{
    opacity: 0.95;
    animation-duration: 6s, 8s, 7s;
  }}
  body.playing .bg-orb.purple {{ animation-duration: 6s; }}
  body.playing .bg-orb.cyan   {{ animation-duration: 7s; }}
  body.playing .bg-orb.violet {{ animation-duration: 8s; }}

  /* Card */
  .card {{
    position: relative;
    z-index: 2;
    width: 100%; max-width: 560px;
    background: rgba(22, 11, 51, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 36px 32px 30px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.55);
    transition: box-shadow 500ms ease-out, border-color 500ms ease-out;
  }}
  body.playing .card {{
    box-shadow:
      0 30px 80px rgba(0,0,0,0.6),
      0 0 60px rgba(129,55,246,0.25),
      0 0 120px rgba(0,184,215,0.15);
    border-color: rgba(129,55,246,0.35);
  }}

  /* Brand */
  .brand {{ display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }}
  .brand svg {{ height: 32px; width: auto; display: block; }}

  /* Heading + meta */
  .eyebrow {{ color: var(--pp-purple); font-size: 11px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 10px; }}
  h1 {{ font-family: 'Manrope', sans-serif; font-size: 24px; font-weight: 600; line-height: 1.3; margin: 0 0 6px; word-break: break-word; }}
  .track-id {{ display: inline-block; margin-left: 8px; padding: 2px 9px; border-radius: 999px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; font-weight: 600; color: #C4A4FF; background: rgba(129,55,246,0.18); border: 1px solid rgba(129,55,246,0.45); vertical-align: middle; }}
  .meta {{ display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }}
  .meta-chip {{ padding: 5px 12px; border-radius: 999px; background: rgba(0,184,215,0.10); border: 1px solid rgba(0,184,215,0.4); color: var(--pp-blue); font-size: 12px; font-weight: 500; }}

  /* Equaliser visualiser — spans full width of the player, full height when
     paused (idle, disabled colour), and animates with the brand gradient
     when audio is playing. */
  .equaliser {{
    display: flex;
    align-items: flex-end;          /* bars anchored to bottom while animating */
    justify-content: space-between; /* spread bars edge-to-edge */
    width: 100%;
    height: 60px;
    margin: 30px 0 18px;
  }}
  .equaliser span {{
    display: block;
    width: 4px;
    height: 100%;                   /* idle = full height */
    border-radius: 4px;
    background: rgba(255,255,255,0.16); /* idle = disabled grey */
    transform-origin: bottom center;
    transform: scaleY(1);            /* idle = full */
    transition: background 400ms ease-out, transform 500ms ease-out;
    will-change: transform;
  }}
  body.playing .equaliser span {{
    background: linear-gradient(180deg, var(--pp-blue) 0%, var(--pp-purple) 100%);
    animation: eq-bounce var(--eq-dur, 900ms) ease-in-out infinite;
    animation-delay: var(--eq-delay, 0s);
  }}
  /* When the live Web Audio visualiser is driving the bars, kill the CSS
     fallback animation so the JS-set transform: scaleY() isn't fighting
     it on every frame. */
  body.web-audio .equaliser span {{
    animation: none !important;
    transition: transform 90ms linear, background 400ms ease-out;
  }}
  @keyframes eq-bounce {{
    0%, 100% {{ transform: scaleY(0.25); }}
    50%      {{ transform: scaleY(1.0); }}
  }}

  /* Native audio element is hidden — we render our own controls below. */
  audio {{ display: none; }}

  /* ── Custom audio player — modern glass-card style ─────────────────── */
  .player {{
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 18px 20px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.10);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 30px rgba(0,0,0,0.30);
    transition: border-color 500ms ease-out, box-shadow 500ms ease-out;
  }}
  body.playing .player {{
    border-color: rgba(0,184,215,0.40);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.08),
      0 12px 40px rgba(0,0,0,0.40),
      0 0 50px rgba(0,184,215,0.18);
  }}

  /* Play button — large, gradient, with pulse-ring when paused */
  .play-btn {{
    position: relative;
    flex-shrink: 0;
    width: 56px; height: 56px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, var(--pp-blue) 0%, var(--pp-purple) 100%);
    color: white;
    display: flex; align-items: center; justify-content: center;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.30),
      0 8px 24px rgba(129,55,246,0.45);
    transition: transform 200ms ease-out, box-shadow 200ms ease-out;
  }}
  /* Inviting pulse ring while paused — fades away once playing. */
  .play-btn::before {{
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 2px solid rgba(0,184,215,0.55);
    opacity: 0;
    animation: pulse-ring 2.2s ease-out infinite;
  }}
  body.playing .play-btn::before {{ animation: none; opacity: 0; }}
  @keyframes pulse-ring {{
    0%   {{ transform: scale(0.85); opacity: 0.6; }}
    70%  {{ transform: scale(1.15); opacity: 0; }}
    100% {{ transform: scale(1.20); opacity: 0; }}
  }}
  .play-btn:hover {{ transform: translateY(-2px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 12px 32px rgba(129,55,246,0.60); }}
  .play-btn:active {{ transform: translateY(0); }}
  .play-btn svg {{ width: 22px; height: 22px; }}
  body.playing .play-btn svg {{ filter: drop-shadow(0 0 4px rgba(255,255,255,0.5)); }}
  .play-btn .icon-pause {{ display: none; }}
  body.playing .play-btn .icon-play {{ display: none; }}
  body.playing .play-btn .icon-pause {{ display: block; }}

  /* Main column — time row + progress stacked */
  .player-main {{
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }}
  .time-row {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    letter-spacing: 0.02em;
    line-height: 1;
  }}
  .time-current {{
    color: var(--text);
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }}
  .time-total {{
    color: var(--muted);
    font-size: 12px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }}

  .progress {{
    height: 26px;
    display: flex; align-items: center;
    cursor: pointer;
    position: relative;
  }}
  .progress-track {{
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    overflow: hidden;
    position: relative;
    transition: height 200ms ease-out, box-shadow 200ms ease-out;
  }}
  .progress:hover .progress-track {{
    height: 8px;
    box-shadow: 0 0 12px rgba(0,184,215,0.25);
  }}
  .progress-buffered {{
    position: absolute;
    inset: 0;
    width: 0%;
    background: rgba(255,255,255,0.12);
    border-radius: 999px;
    transition: width 300ms linear;
  }}
  .progress-fill {{
    position: absolute;
    inset: 0;
    width: 0%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--pp-blue) 0%, #6e6df0 50%, var(--pp-purple) 100%);
    transition: width 100ms linear;
    box-shadow: 0 0 8px rgba(129,55,246,0.45);
  }}
  .progress-thumb {{
    position: absolute;
    top: 50%;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: white;
    box-shadow:
      0 0 0 4px rgba(0,184,215,0.20),
      0 0 12px rgba(0,184,215,0.50),
      0 2px 6px rgba(0,0,0,0.50);
    transform: translate(-50%, -50%) scale(0.85);
    pointer-events: none;
    opacity: 0;
    transition: opacity 200ms ease-out, transform 200ms ease-out;
  }}
  .progress:hover .progress-thumb,
  body.playing .progress-thumb {{ opacity: 1; transform: translate(-50%, -50%) scale(1); }}
  body.playing .progress:hover .progress-thumb {{ transform: translate(-50%, -50%) scale(1.15); }}

  /* Volume — icon button + floating popup on hover */
  .vol-wrap {{
    position: relative;
    flex-shrink: 0;
  }}
  .vol-btn {{
    width: 40px; height: 40px;
    border: none;
    background: rgba(255,255,255,0.04);
    color: var(--text);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 200ms ease-out, border-color 200ms ease-out, transform 200ms ease-out;
  }}
  .vol-btn:hover {{ background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); transform: translateY(-1px); }}
  .vol-btn svg {{ width: 18px; height: 18px; }}
  .vol-btn .icon-mute {{ display: none; }}
  .vol-btn.muted {{ color: var(--muted); }}
  .vol-btn.muted .icon-vol {{ display: none; }}
  .vol-btn.muted .icon-mute {{ display: block; }}

  /* Floating volume popup */
  .vol-popup {{
    position: absolute;
    bottom: calc(100% + 10px);
    right: 0;
    width: 140px;
    padding: 14px 16px;
    border-radius: 14px;
    background: rgba(22,11,51,0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.10);
    box-shadow: 0 16px 40px rgba(0,0,0,0.55);
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(6px);
    transition: opacity 200ms ease-out, transform 200ms ease-out, visibility 200ms;
    z-index: 10;
  }}
  .vol-popup::after {{
    content: '';
    position: absolute;
    bottom: -5px;
    right: 16px;
    width: 10px; height: 10px;
    background: rgba(22,11,51,0.95);
    border-right: 1px solid rgba(255,255,255,0.10);
    border-bottom: 1px solid rgba(255,255,255,0.10);
    transform: rotate(45deg);
  }}
  .vol-wrap:hover .vol-popup,
  .vol-wrap:focus-within .vol-popup,
  .vol-popup:hover {{ opacity: 1; visibility: visible; transform: translateY(0); }}
  .vol-percent {{
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 600;
    color: var(--text);
    font-variant-numeric: tabular-nums;
    min-width: 28px;
    text-align: right;
  }}
  .vol-track {{
    flex: 1;
    height: 4px;
    border-radius: 999px;
    background: rgba(255,255,255,0.10);
    overflow: hidden;
    cursor: pointer;
    position: relative;
  }}
  .vol-fill {{
    height: 100%;
    width: 80%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--pp-blue) 0%, var(--pp-purple) 100%);
    transition: width 150ms ease-out;
  }}

  /* Mobile compact tweaks */
  @media (max-width: 480px) {{
    .player {{ gap: 14px; padding: 14px; border-radius: 16px; }}
    .play-btn {{ width: 48px; height: 48px; }}
    .play-btn svg {{ width: 18px; height: 18px; }}
    .time-current {{ font-size: 13px; }}
    .time-total {{ font-size: 11px; }}
    .vol-btn {{ width: 36px; height: 36px; }}
  }}

  .footer {{ margin-top: 22px; padding-top: 20px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }}
  .footer .expires {{ color: var(--muted); font-size: 12px; }}
  .footer a {{ color: var(--pp-blue); text-decoration: none; font-size: 12px; font-weight: 500; }}
  .footer a:hover {{ text-decoration: underline; }}

  @media (prefers-reduced-motion: reduce) {{
    .bg-orb, body.playing .bg-orb,
    body.playing .equaliser span {{ animation: none !important; }}
  }}
</style>
</head>
<body>
  <span class="bg-orb purple"></span>
  <span class="bg-orb cyan"></span>
  <span class="bg-orb violet"></span>

  <main class="card">
    <div class="brand">
      {_PITCHPAL_LOGO_SVG}
    </div>
    <p class="eyebrow">Track shared via PitchPal</p>
    <h1>{track_filename}<span class="track-id">{track_id_label}</span></h1>
    <div class="meta">
      {genre_html}
      {bpm_html}
    </div>

    <div class="equaliser" id="pp-eq" aria-hidden="true"></div>

    <audio id="pp-audio" preload="metadata" crossorigin="anonymous" src={audio_src}></audio>

    <div class="player">
      <button class="play-btn" id="pp-play" type="button" aria-label="Play">
        <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7L8 5z"/>
        </svg>
        <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="7" y="5" width="4" height="14" rx="1"/>
          <rect x="13" y="5" width="4" height="14" rx="1"/>
        </svg>
      </button>

      <div class="player-main">
        <div class="time-row">
          <span class="time-current" id="pp-time-current">0:00</span>
          <span class="time-total" id="pp-time-total">—</span>
        </div>
        <div class="progress" id="pp-progress" role="slider" tabindex="0" aria-label="Seek">
          <div class="progress-track">
            <div class="progress-buffered" id="pp-progress-buffered"></div>
            <div class="progress-fill" id="pp-progress-fill"></div>
          </div>
          <div class="progress-thumb" id="pp-progress-thumb"></div>
        </div>
      </div>

      <div class="vol-wrap">
        <button class="vol-btn" id="pp-vol-btn" type="button" aria-label="Volume">
          <svg class="icon-vol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
          <svg class="icon-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        </button>
        <div class="vol-popup">
          <div class="vol-track" id="pp-vol-track">
            <div class="vol-fill" id="pp-vol-fill"></div>
          </div>
          <span class="vol-percent" id="pp-vol-percent">80%</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <span class="expires">{html.escape(expires_label)}</span>
      <a href="https://pitchpal.co.uk" target="_blank" rel="noopener">What is PitchPal? →</a>
    </div>
  </main>

  <script>
    (function () {{
      // ── Populate the equaliser. Bar count scales with player width so it
      //    looks the same on a phone as on a desktop. Each bar gets a
      //    wave-pattern delay so the bounce flows left → right while audio
      //    is playing, plus a slight per-bar duration variation so it
      //    doesn't feel mechanically uniform.
      var eq = document.getElementById('pp-eq');
      if (eq) {{
        var width = eq.clientWidth || 480;
        var barCount = Math.max(24, Math.min(48, Math.floor(width / 14)));
        var html = '';
        for (var i = 0; i < barCount; i++) {{
          // sine-wave delay so bars move in a flowing pattern, not random chaos
          var delay = ((i / barCount) * 1.2).toFixed(2);
          var dur = (0.75 + ((i % 5) * 0.06)).toFixed(2);
          html += '<span style="--eq-delay:' + delay + 's;--eq-dur:' + dur + 's"></span>';
        }}
        eq.innerHTML = html;
      }}

      var audio = document.getElementById('pp-audio');
      if (!audio) return;
      audio.addEventListener('play',  function () {{ document.body.classList.add('playing'); }});
      audio.addEventListener('pause', function () {{ document.body.classList.remove('playing'); }});
      audio.addEventListener('ended', function () {{ document.body.classList.remove('playing'); }});

      // ── Live Web Audio visualiser ───────────────────────────────────
      // Connects the audio element to an AnalyserNode and drives each
      // bar's height from real-time frequency data. Falls back to the
      // CSS bounce animation if Web Audio isn't supported or CORS blocks
      // analysis (in which case the spectrum would come back zeroed).
      var audioCtx = null;
      var analyser = null;
      var freqData = null;
      var rafId = null;
      var bars = null;

      function ensureBars() {{
        if (!bars) bars = Array.prototype.slice.call(eq ? eq.children : []);
        return bars;
      }}

      function clearBarStyles() {{
        ensureBars().forEach(function (b) {{ b.style.transform = ''; }});
      }}

      function initAudioGraph() {{
        if (audioCtx) return true;
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return false;
        try {{
          audioCtx = new Ctx();
          var source = audioCtx.createMediaElementSource(audio);
          analyser = audioCtx.createAnalyser();
          // fftSize 128 → 64 frequency bins. Enough resolution for music
          // visualisation without overwhelming small bar counts.
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.78;
          source.connect(analyser);
          analyser.connect(audioCtx.destination);
          freqData = new Uint8Array(analyser.frequencyBinCount);
          document.body.classList.add('web-audio');
          return true;
        }} catch (e) {{
          // CORS / autoplay / unsupported — fall back to CSS animation.
          audioCtx = null;
          return false;
        }}
      }}

      function tick() {{
        if (!audio || audio.paused || !analyser) {{
          rafId = null;
          return;
        }}
        analyser.getByteFrequencyData(freqData);
        var list = ensureBars();
        var binCount = freqData.length;
        // Logarithmic-ish spread so low + mid frequencies (where music
        // energy lives) get more bars, not just the high-frequency tail.
        for (var i = 0; i < list.length; i++) {{
          var t = i / list.length;
          var idx = Math.floor(Math.pow(t, 1.4) * (binCount - 1));
          if (idx < 0) idx = 0;
          if (idx >= binCount) idx = binCount - 1;
          var v = freqData[idx] / 255;
          // Floor to 0.08 so bars don't collapse fully in quiet passages.
          var scale = 0.08 + v * 0.92;
          list[i].style.transform = 'scaleY(' + scale.toFixed(3) + ')';
        }}
        rafId = requestAnimationFrame(tick);
      }}

      audio.addEventListener('play', function () {{
        var ok = initAudioGraph();
        if (!ok) return; // CSS fallback handles the bounce
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (!rafId) rafId = requestAnimationFrame(tick);
      }});

      audio.addEventListener('pause', function () {{
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        // Reset inline transforms so bars return to the idle (full-height
        // grey) CSS state — body no longer has the .playing class so
        // colours and animation are off anyway.
        clearBarStyles();
      }});
      audio.addEventListener('ended', function () {{
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        clearBarStyles();
      }});

      // ── Custom player wiring ────────────────────────────────────────
      var playBtn = document.getElementById('pp-play');
      var progress = document.getElementById('pp-progress');
      var progressFill = document.getElementById('pp-progress-fill');
      var progressBuffered = document.getElementById('pp-progress-buffered');
      var progressThumb = document.getElementById('pp-progress-thumb');
      var timeCurrent = document.getElementById('pp-time-current');
      var timeTotal = document.getElementById('pp-time-total');
      var volBtn = document.getElementById('pp-vol-btn');
      var volTrack = document.getElementById('pp-vol-track');
      var volFill = document.getElementById('pp-vol-fill');
      var volPercent = document.getElementById('pp-vol-percent');

      function fmt(s) {{
        if (!isFinite(s)) return '—';
        var m = Math.floor(s / 60);
        var ss = Math.floor(s % 60).toString().padStart(2, '0');
        return m + ':' + ss;
      }}

      function updateProgress() {{
        var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        progressFill.style.width = pct + '%';
        progressThumb.style.left = pct + '%';
        timeCurrent.textContent = fmt(audio.currentTime);
        timeTotal.textContent = fmt(audio.duration);
        // Buffered progress — the lighter bar that grows as the audio
        // pre-loads ahead of the playhead.
        try {{
          if (audio.buffered && audio.buffered.length > 0 && audio.duration) {{
            var end = audio.buffered.end(audio.buffered.length - 1);
            progressBuffered.style.width = ((end / audio.duration) * 100) + '%';
          }}
        }} catch (_) {{}}
      }}

      function seek(clientX) {{
        var rect = progress.getBoundingClientRect();
        var ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        if (audio.duration) audio.currentTime = ratio * audio.duration;
      }}

      // Play / pause
      playBtn.addEventListener('click', function () {{
        if (audio.paused) {{
          var p = audio.play();
          if (p && p.catch) p.catch(function () {{}});
        }} else {{
          audio.pause();
        }}
      }});

      // Time updates + buffered progress
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', updateProgress);
      audio.addEventListener('durationchange', updateProgress);
      audio.addEventListener('progress', updateProgress);

      // Progress seek (click + drag)
      var draggingProgress = false;
      progress.addEventListener('pointerdown', function (e) {{
        draggingProgress = true;
        progress.setPointerCapture && progress.setPointerCapture(e.pointerId);
        seek(e.clientX);
      }});
      progress.addEventListener('pointermove', function (e) {{
        if (draggingProgress) seek(e.clientX);
      }});
      progress.addEventListener('pointerup', function (e) {{
        draggingProgress = false;
        try {{ progress.releasePointerCapture(e.pointerId); }} catch (_) {{}}
      }});
      // Keyboard accessibility — arrow keys seek 5s
      progress.addEventListener('keydown', function (e) {{
        if (e.key === 'ArrowLeft')  audio.currentTime = Math.max(0, audio.currentTime - 5);
        if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
      }});

      // Volume — track click sets level, button toggles mute
      function setVolFill() {{
        var v = audio.muted ? 0 : audio.volume;
        volFill.style.width = (v * 100) + '%';
        if (volPercent) volPercent.textContent = Math.round(v * 100) + '%';
        volBtn.classList.toggle('muted', audio.muted || audio.volume === 0);
      }}
      volBtn.addEventListener('click', function () {{
        audio.muted = !audio.muted;
        setVolFill();
      }});
      function adjustVolume(clientX) {{
        var rect = volTrack.getBoundingClientRect();
        var ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        audio.volume = ratio;
        if (ratio > 0) audio.muted = false;
        setVolFill();
      }}
      var draggingVol = false;
      volTrack.addEventListener('pointerdown', function (e) {{
        draggingVol = true;
        volTrack.setPointerCapture && volTrack.setPointerCapture(e.pointerId);
        adjustVolume(e.clientX);
      }});
      volTrack.addEventListener('pointermove', function (e) {{
        if (draggingVol) adjustVolume(e.clientX);
      }});
      volTrack.addEventListener('pointerup', function (e) {{
        draggingVol = false;
        try {{ volTrack.releasePointerCapture(e.pointerId); }} catch (_) {{}}
      }});

      // Initial state
      audio.volume = 0.8;
      setVolFill();
      updateProgress();
    }})();
  </script>
</body>
</html>
"""


@router.get("/listen/{token}", response_class=HTMLResponse)
async def listen_page(
    token: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> HTMLResponse:
    """User-facing listening page — embedded audio player, no download."""
    track = await _lookup_active_track(token, session)

    if not r2_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Audio storage not configured.",
        )

    audio_url = presigned_get_url(track.r2_object_key)
    if not audio_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not generate audio URL.",
        )

    # Listen analytics — one increment per page load. Good-enough proxy for
    # "track was opened by an A&R / artist" without needing JS pings.
    track.listen_count = (track.listen_count or 0) + 1
    await session.commit()

    return HTMLResponse(content=_listen_page_html(track, audio_url))


@router.get("/api/v1/listen/{token}/info")
async def listen_info(
    token: str,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Minimal JSON metadata about a listening link — used by embeds / previews."""
    track = await _lookup_active_track(token, session)
    return {
        "track_id": track.id,
        "track_id_label": f"PP-{track.id:03d}",
        "filename": track.filename,
        "detected_genre": track.detected_genre,
        "bpm": track.bpm,
        "expires_at": track.audio_expires_at.isoformat() if track.audio_expires_at else None,
        "listen_count": track.listen_count or 0,
    }


@router.get("/api/v1/audio/{token}")
async def audio_redirect(
    token: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Alternative entry point — 302 redirects to a short-lived presigned R2 URL.

    Useful when something embeds the raw audio (e.g. an HTML <audio src>
    pointing here) without using the HTML player page. Does NOT increment
    the listen counter; that's tied to the player page load.
    """
    track = await _lookup_active_track(token, session)
    if not r2_configured():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Audio storage not configured.")
    audio_url = presigned_get_url(track.r2_object_key)
    if not audio_url:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Could not generate audio URL.")
    return RedirectResponse(url=audio_url, status_code=status.HTTP_302_FOUND)
