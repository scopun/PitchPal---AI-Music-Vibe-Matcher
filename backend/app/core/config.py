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
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DATABASE_PATH: str = DB_PATH

    class Config:
        case_sensitive = True
        env_file = ".env"
        # 👇 THIS LINE FIXES YOUR ERROR
        extra = "ignore" 

settings = Settings()