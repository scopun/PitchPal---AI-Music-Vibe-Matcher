"""
Cloudflare R2 service — handles audio storage for the streaming-link feature.

R2 is S3-compatible so we use boto3. All operations are wrapped to no-op
gracefully when R2 isn't configured (local dev without credentials), so the
rest of the app keeps working.
"""
from __future__ import annotations

import logging
import os
from typing import Optional

import boto3
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)

_client = None  # lazy-initialised S3 client


def r2_configured() -> bool:
    """All four R2_* env vars must be set for the feature to be active."""
    return bool(
        settings.R2_ACCESS_KEY_ID
        and settings.R2_SECRET_ACCESS_KEY
        and settings.R2_ENDPOINT_URL
        and settings.R2_BUCKET_NAME
    )


def _get_client():
    """Lazy-init the boto3 client so import time doesn't pay TCP cost."""
    global _client
    if _client is None:
        if not r2_configured():
            return None
        _client = boto3.client(
            "s3",
            endpoint_url=settings.R2_ENDPOINT_URL,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            # R2 ignores the region but boto3 requires one. "auto" matches
            # Cloudflare's recommended value.
            region_name="auto",
            config=Config(signature_version="s3v4"),
        )
    return _client


def upload_audio(
    local_path: str,
    object_key: str,
    content_type: str = "audio/mpeg",
) -> bool:
    """
    Upload a local audio file to R2.

    Returns True on success, False on any failure (caller decides whether
    to surface or swallow — the streaming-link feature degrades gracefully
    when R2 is unreachable).
    """
    client = _get_client()
    if client is None:
        return False
    if not os.path.exists(local_path):
        logger.warning("R2 upload skipped: local file missing %s", local_path)
        return False

    try:
        with open(local_path, "rb") as fh:
            client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=object_key,
                Body=fh,
                ContentType=content_type,
                # Inline so browsers stream rather than offer download.
                ContentDisposition="inline",
            )
        return True
    except (ClientError, BotoCoreError) as exc:
        logger.exception("R2 upload failed for key=%s: %s", object_key, exc)
        return False


def delete_audio(object_key: str) -> bool:
    """Remove an object from R2. Idempotent — already-deleted is treated as ok."""
    client = _get_client()
    if client is None:
        return False
    try:
        client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=object_key)
        return True
    except (ClientError, BotoCoreError) as exc:
        logger.exception("R2 delete failed for key=%s: %s", object_key, exc)
        return False


def presigned_get_url(object_key: str, expires_seconds: Optional[int] = None) -> Optional[str]:
    """
    Generate a short-lived URL the browser can fetch directly from R2.

    Used by the /listen/:token player page so audio streams from Cloudflare's
    edge (zero backend bandwidth, zero R2 egress fees) instead of being
    proxied through the FastAPI process.
    """
    client = _get_client()
    if client is None:
        return None
    ttl = expires_seconds or settings.LISTENING_PRESIGNED_URL_TTL_SECONDS
    try:
        return client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.R2_BUCKET_NAME,
                "Key": object_key,
                # Force inline rendering even if R2 metadata is missing.
                "ResponseContentDisposition": "inline",
            },
            ExpiresIn=ttl,
        )
    except (ClientError, BotoCoreError) as exc:
        logger.exception("R2 presign failed for key=%s: %s", object_key, exc)
        return None


def ensure_bucket_cors() -> bool:
    """
    Apply a permissive CORS policy to the bucket so the browser can fetch
    audio with `crossorigin="anonymous"` and the listening-page Web Audio
    visualiser can analyse the live frequency data.

    Without this, the AnalyserNode receives a tainted stream and returns
    zeroed-out frequency data — the bars on the listening page would never
    react to the music. Idempotent: safe to run on every backend boot.
    """
    client = _get_client()
    if client is None:
        return False
    try:
        client.put_bucket_cors(
            Bucket=settings.R2_BUCKET_NAME,
            CORSConfiguration={
                "CORSRules": [
                    {
                        "AllowedOrigins": ["*"],
                        "AllowedMethods": ["GET", "HEAD"],
                        "AllowedHeaders": ["*"],
                        "ExposeHeaders": ["Content-Length", "Content-Range"],
                        "MaxAgeSeconds": 3000,
                    }
                ]
            },
        )
        return True
    except (ClientError, BotoCoreError) as exc:
        logger.exception("R2 CORS configuration failed: %s", exc)
        return False


def build_object_key(token: str, filename: str) -> str:
    """
    Compose the R2 object key for a track.

    We store under tracks/<token>/<safe-filename> so:
      • the token namespacing makes objects unguessable
      • the original filename (sanitised) is preserved for download metadata
      • per-track listing inside the bucket is easy to debug
    """
    # Strip path separators and keep extension; replace whitespace with `-`.
    safe = os.path.basename(filename or "track.mp3").replace(" ", "-")
    safe = "".join(c for c in safe if c.isalnum() or c in ("-", "_", "."))
    if not safe:
        safe = "track.mp3"
    return f"tracks/{token}/{safe}"
