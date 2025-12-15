import json
from app.core.config import settings

# Global Variable to store the database in RAM
artist_db_cache = {}

def load_database():
    """Loads the JSON database into the global cache."""
    global artist_db_cache
    try:
        with open(settings.DATABASE_PATH, "r", encoding="utf-8") as f:
            artist_db_cache = json.load(f)
        print(f"✅ Database loaded: {len(artist_db_cache)} artists ready.")
    except Exception as e:
        print(f"❌ Database Load Error: {e}")
        artist_db_cache = {}

def get_database():
    """Returns the cached database."""
    return artist_db_cache