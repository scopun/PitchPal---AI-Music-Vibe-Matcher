import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1 import auth, tracks, pitches
from app.core.config import settings
from app.core.database import load_database, artist_db_cache
from app.core.db import init_models

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_database()
    try:
        await init_models()
    except Exception as exc:  # noqa: BLE001
        logger.exception("Database init failed: %s", exc)
    yield
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
]

# Also trust whichever FRONTEND_URL the deployment is configured with — saves
# editing this list every time the Render preview URL changes.
if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Also allow any *.onrender.com subdomain (Render preview deploys, etc.)
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tracks.router, prefix="/api/v1", tags=["Tracks"])
app.include_router(pitches.router, prefix="/api/v1", tags=["Pitches"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])

@app.get("/")
def root():
    return {"message": "PitchPal API is running"}