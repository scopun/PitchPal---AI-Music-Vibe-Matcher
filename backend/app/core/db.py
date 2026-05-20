from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


def _normalize_db_url(url: str) -> str:
    # Render gives us postgresql://... or postgres://... — coerce to asyncpg driver
    if not url:
        return url
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://") and "+asyncpg" not in url:
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]
    return url


DATABASE_URL = _normalize_db_url(settings.DATABASE_URL)

engine = create_async_engine(DATABASE_URL, pool_pre_ping=True, future=True) if DATABASE_URL else None
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
