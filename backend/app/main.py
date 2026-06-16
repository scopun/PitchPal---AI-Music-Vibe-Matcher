import asyncio
import logging
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import select

from app.api.v1 import analytics, auth, contact, listen, tracks, pitches
from app.core.config import settings
from app.core.database import load_database, artist_db_cache
from app.core.db import SessionLocal, init_models

logger = logging.getLogger(__name__)


async def _expire_audio_sweep_loop() -> None:
    """
    Background loop — once an hour, find tracks whose audio_expires_at has
    passed but still have an R2 object key, delete the R2 object, and null
    the key. Keeps the bucket lean and enforces the 30-day stream policy
    even when no one hits the /listen/<token> page to trigger lazy cleanup.
    """
    from app.models.track import Track
    from app.services.r2_service import delete_audio, r2_configured

    while True:
        try:
            if SessionLocal is not None and r2_configured():
                async with SessionLocal() as session:
                    now = datetime.now(timezone.utc)
                    expired = (
                        await session.execute(
                            select(Track)
                            .where(Track.audio_expires_at < now)
                            .where(Track.r2_object_key.is_not(None))
                            .limit(50)
                        )
                    ).scalars().all()
                    if expired:
                        for t in expired:
                            if t.r2_object_key:
                                delete_audio(t.r2_object_key)
                                t.r2_object_key = None
                        await session.commit()
                        logger.info("Expired %d audio object(s) past 30-day TTL.", len(expired))
        except Exception as exc:  # noqa: BLE001
            logger.exception("Audio expiry sweep failed: %s", exc)
        # Sleep an hour between sweeps. The loop is fire-and-forget; FastAPI
        # cancels it when the app shuts down.
        await asyncio.sleep(60 * 60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_database()
    try:
        await init_models()
    except Exception as exc:  # noqa: BLE001
        logger.exception("Database init failed: %s", exc)
    # Make sure the R2 bucket has a permissive CORS policy so the listening
    # page can analyse the live audio (Web Audio API needs `crossorigin`
    # responses). Skipped when R2 isn't configured (local dev).
    try:
        from app.services.r2_service import ensure_bucket_cors, r2_configured
        if r2_configured():
            ensure_bucket_cors()
    except Exception as exc:  # noqa: BLE001
        logger.exception("R2 CORS setup failed: %s", exc)
    sweep_task = asyncio.create_task(_expire_audio_sweep_loop())
    try:
        yield
    finally:
        sweep_task.cancel()
        try:
            await sweep_task
        except (asyncio.CancelledError, Exception):
            pass
        artist_db_cache.clear()

app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION, lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://pitchpal.co.uk",
    "https://www.pitchpal.co.uk",
    "https://pitch-pal-ai-music-vibe-matcher.vercel.app",
    "https://pitch-pal-ai-music-vibe-matcher-6yz.vercel.app",
    "https://pitchpal-ai-music-vibe-matcher-e84u.onrender.com",
    "https://pitchpal-ai-music-vibe-matcher.onrender.com",
    "https://pitchpal-frontend.onrender.com",
    "https://pitchpal-frontend.vercel.app",
]

# Also trust whichever FRONTEND_URL the deployment is configured with — saves
# editing this list every time the Render/Vercel preview URL changes.
if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Also allow any *.onrender.com or *.vercel.app subdomain (preview deploys).
    allow_origin_regex=r"https://.*\.(onrender\.com|vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tracks.router, prefix="/api/v1", tags=["Tracks"])
app.include_router(pitches.router, prefix="/api/v1", tags=["Pitches"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])
app.include_router(contact.router, prefix="/api/v1", tags=["Contact"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
# listen router is mounted at root because user-facing listening URLs are
# intentionally short (pitchpal-backend.../listen/<token>) — no /api/v1 prefix.
app.include_router(listen.router, tags=["Listen"])

@app.get("/")
def root():
    return {"message": "PitchPal API is running"}