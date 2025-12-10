from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import analyze
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION)

# --- CORS FIX ---
# This tells the backend: "Allow these websites to talk to me"
origins = [
    "http://localhost:5173",  # For local testing
    "https://pitch-pal-ai-music-vibe-matcher.vercel.app", # Your Vercel App
    "https://pitch-pal-ai-music-vibe-matcher-6yz.vercel.app", # Your other Vercel URL
    "*" # ALLOW ALL (The "Nuclear Option" to guarantee it works)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # We are using "*" to force it to work.
    allow_credentials=True,
    allow_methods=["*"], # Allow POST, GET, OPTIONS, etc.
    allow_headers=["*"], # Allow all headers
)

app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])

@app.get("/")
def root():
    return {"message": "PitchPal Pro API is running 🚀"}