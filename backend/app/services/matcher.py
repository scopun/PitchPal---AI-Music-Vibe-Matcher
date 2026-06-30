from app.services.lyric_engine import get_claude_vibe_match


async def find_best_match(user_audio_features: dict, user_lyrics: str = "", detected_language: str = "en", vibe_hint: str = ""):
    results = await get_claude_vibe_match(
        audio_features=user_audio_features,
        lyrics=user_lyrics,
        detected_language=detected_language,
        vibe_hint=vibe_hint,
    )
    return results