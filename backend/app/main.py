from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import analyze
from app.core.config import settings

# Initialize the FastAPI app with project details from settings
app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION)

# --- CORS CONFIGURATION (CRITICAL FIX) ---
# We allow ALL origins ("*") to ensure the Vercel frontend can connect to this Render backend.
# In a strict production environment, you might restrict this to specific domains,
# but for this MVP, allowing "*" prevents the "Analysis Failed" connection error.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all domains (fixes the Vercel connection issue)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Include the API router
# This connects your /analyze endpoint to the main app
app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])

# Root endpoint to verify the server is running
@app.get("/")
def root():
    return {"message": "PitchPal Pro API is running 🚀"}