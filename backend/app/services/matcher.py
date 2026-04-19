from app.services.lyric_engine import get_claude_vibe_match
from app.core.database import get_database


def build_filtered_roster(artist_database: dict) -> list:
    """
    Build artist roster for AI — excludes artists who write their own material
    and would not accept external song pitches.
    """
    roster = []

    for artist_name, data in artist_database.items():
        # Skip artists who don't accept external songs
        if data.get("accepts_external_songs", True) == False:
            continue

        genres = data.get("genres", [])
        primary_genre = genres[0] if genres else "Unknown"

        roster.append({
            "name": artist_name,
            "genre": primary_genre,
            "vibe": data.get("description", "No description available")
        })

    return roster


def post_filter_matches(matches: list, artist_database: dict) -> list:
    """
    Second safety layer — removes any self-writing artists that AI
    may have suggested despite not being in the filtered roster.
    Also removes any artist not found in the database.
    """
    filtered = []

    for match in matches:
        artist_name = match.get("artist", "")

        # Remove if not in our database
        if artist_name not in artist_database:
            continue

        artist_data = artist_database[artist_name]

        # Remove if self-writer
        if artist_data.get("accepts_external_songs", True) == False:
            continue

        filtered.append(match)

    return filtered


async def find_best_match(user_audio_features, user_lyrics):
    artist_database = get_database()

    if not artist_database:
        return {"error": "Database not available", "matches": []}

    # Step 1: Build roster — self-writers already excluded
    artist_roster = build_filtered_roster(artist_database)

    # Step 2: Run AI matching
    claude_results = await get_claude_vibe_match(
        lyrics=user_lyrics,
        audio_features=user_audio_features,
        artist_roster=artist_roster
    )

    # Step 3: Post-filter AI results (double safety check)
    raw_matches = claude_results.get("matches", [])
    filtered_matches = post_filter_matches(raw_matches, artist_database)

    # Step 4: Return clean result
    claude_results["matches"] = filtered_matches
    return claude_results