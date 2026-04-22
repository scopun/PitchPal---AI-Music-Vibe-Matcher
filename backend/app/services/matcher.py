from app.services.lyric_engine import get_claude_vibe_match


async def find_best_match(user_audio_features: dict, user_lyrics: str = ""):
    """
    Pass both audio features AND lyrics to Claude.
    Audio features can be empty (for lyrics-only mode).
    """
    results = await get_claude_vibe_match(
        audio_features=user_audio_features,
        lyrics=user_lyrics
    )
    return results