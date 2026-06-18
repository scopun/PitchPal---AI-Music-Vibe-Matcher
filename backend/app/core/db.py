from __future__ import annotations

from typing import AsyncGenerator
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import ssl

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


# libpq-style query params that managed Postgres providers (Neon, Supabase,
# Render, ...) tack onto their connection strings but the asyncpg driver does
# NOT understand. Leaving them in the DSN makes asyncpg raise
# "connect() got an unexpected keyword argument 'sslmode'". We strip them and
# translate the SSL intent into an asyncpg connect arg instead.
_LIBPQ_ONLY_PARAMS = {"sslmode", "channel_binding", "options"}


def _normalize_db_url(url: str) -> tuple[str, dict]:
    """Coerce the DSN to the asyncpg driver and pull out SSL settings.

    Render gives us postgres://... or postgresql://...; Neon/Supabase append
    ?sslmode=require (and sometimes &channel_binding=require). asyncpg can't
    read those off the URL, so we return (clean_url, connect_args) and hand the
    SSL context to create_async_engine separately.
    """
    if not url:
        return url, {}

    # postgres:// -> postgresql:// -> postgresql+asyncpg://
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://") and "+asyncpg" not in url:
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]

    parts = urlsplit(url)
    sslmode = None
    kept = []
    for key, value in parse_qsl(parts.query, keep_blank_values=True):
        if key.lower() == "sslmode":
            sslmode = value.lower()
        elif key.lower() in _LIBPQ_ONLY_PARAMS:
            continue
        else:
            kept.append((key, value))

    clean_url = urlunsplit(
        (parts.scheme, parts.netloc, parts.path, urlencode(kept), parts.fragment)
    )

    connect_args: dict = {}
    # require / verify-ca / verify-full all mean "use TLS". Neon and Supabase
    # present valid public certs, so a default verifying context connects fine.
    # (If a provider ever uses a self-signed cert, relax with check_hostname =
    # False + verify_mode = ssl.CERT_NONE.)
    if sslmode in ("require", "verify-ca", "verify-full"):
        connect_args["ssl"] = ssl.create_default_context()
    elif sslmode == "disable":
        connect_args["ssl"] = False
    return clean_url, connect_args


DATABASE_URL, _CONNECT_ARGS = _normalize_db_url(settings.DATABASE_URL)

engine = (
    create_async_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        future=True,
        connect_args=_CONNECT_ARGS,
    )
    if DATABASE_URL
    else None
)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False) if engine else None


class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    if SessionLocal is None:
        raise RuntimeError("DATABASE_URL is not configured")
    async with SessionLocal() as session:
        yield session


async def init_models() -> None:
    if engine is None:
        return
    # Import models so they're registered on Base.metadata before create_all
    from app.models import user, track  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Lightweight inline "migrations" — add new nullable columns to existing
        # tables. Idempotent (IF NOT EXISTS) so safe to run every boot.
        await conn.execute(text(
            "ALTER TABLE pitches ADD COLUMN IF NOT EXISTS artist_image VARCHAR(512)"
        ))
        await conn.execute(text(
            "ALTER TABLE tracks ADD COLUMN IF NOT EXISTS audio_hash VARCHAR(64)"
        ))
        await conn.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_tracks_audio_hash ON tracks (audio_hash)"
        ))
        # Profile fields on users.
        for stmt in (
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(120)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(120)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(80)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS soundcloud_url VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS spotify_url VARCHAR(255)",
        ):
            await conn.execute(text(stmt))

        # Streaming-link / R2 storage columns on tracks.
        for stmt in (
            "ALTER TABLE tracks ADD COLUMN IF NOT EXISTS listening_token VARCHAR(32)",
            "ALTER TABLE tracks ADD COLUMN IF NOT EXISTS r2_object_key VARCHAR(512)",
            "ALTER TABLE tracks ADD COLUMN IF NOT EXISTS audio_expires_at TIMESTAMPTZ",
            "ALTER TABLE tracks ADD COLUMN IF NOT EXISTS listen_count INTEGER NOT NULL DEFAULT 0",
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_tracks_listening_token ON tracks (listening_token)",
            "CREATE INDEX IF NOT EXISTS ix_tracks_audio_expires_at ON tracks (audio_expires_at)",
        ):
            await conn.execute(text(stmt))
