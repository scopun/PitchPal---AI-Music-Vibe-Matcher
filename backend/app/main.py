from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import analyze
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION)

# Allow React (localhost:5173) to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, allow all. In prod, lock this down.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router
app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])

@app.get("/")
def root():
    return {"message": "PitchPal Pro API is running 🚀"}