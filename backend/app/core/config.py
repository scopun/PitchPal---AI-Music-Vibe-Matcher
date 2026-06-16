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

    # Cloudflare R2 — audio storage for the auto-generated streaming-link
    # feature. When all four R2_* values are set, uploaded audio is stored
    # in the R2 bucket after analysis and a tokenised listening URL is
    # auto-included in the pitch modal. When any R2_* value is missing
    # (e.g. local dev without credentials), the streaming-link feature
    # silently disables itself and the rest of the app keeps working.
    R2_ACCESS_KEY_ID: str = os.getenv("R2_ACCESS_KEY_ID", "")
    R2_SECRET_ACCESS_KEY: str = os.getenv("R2_SECRET_ACCESS_KEY", "")
    R2_ACCOUNT_ID: str = os.getenv("R2_ACCOUNT_ID", "")
    R2_BUCKET_NAME: str = os.getenv("R2_BUCKET_NAME", "pitchpal-tracks")
    R2_ENDPOINT_URL: str = os.getenv("R2_ENDPOINT_URL", "")

    # Public base URL where the backend itself is reachable. Used to build
    # the user-facing listening URLs (e.g. https://<backend>/listen/abc123).
    BACKEND_PUBLIC_URL: str = os.getenv(
        "BACKEND_PUBLIC_URL",
        "https://pitchpal-backend-0uyc.onrender.com",
    )

    # Streaming link policy (Ciara's email decisions):
    # 30 days expiry, stream-only, listen analytics on.
    LISTENING_LINK_TTL_DAYS: int = 30
    # How long the presigned R2 URL embedded in the player page stays valid.
    # 1 hour is long enough to listen to the track end-to-end even with seeks
    # and short enough to prevent casual sharing of the raw audio URL.
    LISTENING_PRESIGNED_URL_TTL_SECONDS: int = 60 * 60

    class Config:
        case_sensitive = True
        env_file = ".env"
        # 👇 THIS LINE FIXES YOUR ERROR
        extra = "ignore"

settings = Settings()