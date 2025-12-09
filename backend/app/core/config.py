import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "PitchPal Pro API"
    PROJECT_VERSION: str = "1.0.0"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    DATABASE_PATH: str = os.path.join("data", "artist_database.json")

settings = Settings()