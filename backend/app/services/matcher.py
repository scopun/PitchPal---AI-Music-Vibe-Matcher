from app.services.lyric_engine import get_claude_vibe_match
from app.core.database import get_database

async def find_best_match(user_audio_features, user_lyrics):
    artist_database = get_database()
    
    if not artist_database:
        return {"error": "Database not available", "matches": []}

    artist_roster = []
    
    # This loop goes through your exact JSON file
    for artist_name, data in artist_database.items():
        genres = data.get("genres", [])
        primary_genre = genres[0] if genres else "Unknown"
        
        # We grab the "description" from your JSON and feed it to Claude!
        artist_roster.append({
            "name": artist_name,
            "genre": primary_genre,
            "vibe": data.get("description", "No description available")
        })

    # We hand the formatted roster directly to Claude Opus 4.6
    claude_results = await get_claude_vibe_match(
        lyrics=user_lyrics, 
        audio_features=user_audio_features, 
        artist_roster=artist_roster
    )

    return claude_results