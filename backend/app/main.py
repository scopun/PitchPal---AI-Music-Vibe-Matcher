from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1 import analyze
from app.core.config import settings
from app.core.database import load_database, artist_db_cache 

# --- LIFESPAN MANAGER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🔄 Startup: Loading Artist Database...")
    load_database()
    yield
    print("🛑 Shutdown: Clearing Database Cache...")
    artist_db_cache.clear()

# Initialize App
app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION, lifespan=lifespan)

# --- CORS SETUP (Aligned for Local & Cloud) ---
origins = [
    # 1. Local Development
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # React default
    "http://127.0.0.1:5173",
    
    # 2. Production Frontend (Vercel)
    # These are the URLs you shared earlier
    "https://pitch-pal-ai-music-vibe-matcher.vercel.app",
    "https://pitch-pal-ai-music-vibe-matcher-6yz.vercel.app",
    
    # 3. Wildcard for Vercel Previews (Optional, helpful for new deploys)
    # Note: Explicit domains are safer, but if you create new branches, add them here.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Only allow these specific domains
    allow_credentials=True,
    allow_methods=["*"],    # Allow all methods (POST, GET, etc.)
    allow_headers=["*"],    # Allow all headers
)

# --- ROUTERS ---
app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])

@app.get("/")
def root():
    return {"message": "PitchPal Pro API is running 🚀"}