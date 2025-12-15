import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PitchPal AI Vibe Matcher"
    PROJECT_VERSION: str = "1.0.0"
    
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # --- FIXED DATABASE PATH LOGIC (For Data in app/data) ---
    # 1. Get the folder where THIS config.py file lives (.../app/core)
    CORE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    # 2. Go UP one level to get the main 'app' folder
    APP_DIR = os.path.dirname(CORE_DIR)
    
    # 3. Point to the data folder inside 'app'
    DATABASE_PATH: str = os.path.join(APP_DIR, "data", "artist_database.json")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()