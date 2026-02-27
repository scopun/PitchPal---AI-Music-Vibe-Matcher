from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1 import analyze
from app.core.config import settings
from app.core.database import load_database, artist_db_cache

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_database()
    yield
    artist_db_cache.clear()

app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION, lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://pitch-pal-ai-music-vibe-matcher.vercel.app",
    "https://pitch-pal-ai-music-vibe-matcher-6yz.vercel.app",
    "https://pitchpal-ai-music-vibe-matcher.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])

@app.get("/")
def root():
    return {"message": "PitchPal API is running"}