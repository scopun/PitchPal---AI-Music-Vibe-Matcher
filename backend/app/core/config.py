import os
from pydantic_settings import BaseSettings

# Calculate paths OUTSIDE the class
CORE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(CORE_DIR)
DB_PATH = os.path.join(APP_DIR, "data", "artist_database.json")

class Settings(BaseSettings):
    PROJECT_NAME: str = "PitchPal AI Vibe Matcher"
    PROJECT_VERSION: str = "1.0.0"

    # Required Fields
    # OPENAI_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    DATABASE_PATH: str = DB_PATH

    # Auth / DB / Email (Phase 1)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINS: int = 60 * 24 * 7  # 7 days
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    RESEND_FROM_EMAIL: str = os.getenv("RESEND_FROM_EMAIL", "PitchPal <onboarding@resend.dev>")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    EMAIL_LOGO_URL: str = os.getenv("EMAIL_LOGO_URL", "")
    # Destination for the pre-login "Contact us" form submissions. If left
    # blank, submissions are logged but not emailed — useful for local dev.
    CONTACT_FORM_EMAIL: str = os.getenv("CONTACT_FORM_EMAIL", "")

    # Spotify Web API (artist enrichment — images, followers, album counts)
    SPOTIFY_CLIENT_ID: str = os.getenv("SPOTIFY_CLIENT_ID", "")
    SPOTIFY_CLIENT_SECRET: str = os.getenv("SPOTIFY_CLIENT_SECRET", "")

    class Config:
        case_sensitive = True
        env_file = ".env"
        # 👇 THIS LINE FIXES YOUR ERROR
        extra = "ignore"

settings = Settings()