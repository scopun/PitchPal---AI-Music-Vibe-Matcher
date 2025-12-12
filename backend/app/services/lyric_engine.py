import json
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def get_semantic_shortlist(user_lyrics, artist_database, user_audio_features=None):
    """
    Sends ALL artists to OpenAI, but now with AUDIO CONTEXT to prevent genre mismatches.
    """
    # 1. Determine Audio Context (The Vibe Check)
    audio_context = "General Vibe"
    if user_audio_features:
        bpm = user_audio_features.get('tempo', 0)
        energy = user_audio_features.get('energy', 0)
        
        if bpm > 115 and energy > 0.6:
            audio_context = "High Energy / Dance / House / Up-Tempo Pop"
        elif bpm < 100 and energy < 0.5:
            audio_context = "Low Energy / Ballad / Acoustic / Slow Jam"
        else:
            audio_context = "Mid-Tempo / Pop / R&B"

    # 2. Format the Roster
    roster_text = ""
    for artist, data in artist_database.items():
        genres = data.get("genres", [])
        genre_str = ", ".join(genres) if genres else "General"
        roster_text += f"- {artist} ({genre_str})\n"

    # 3. The New "Genre-Aware" Prompt
    prompt = f"""
    You are an expert Music A&R.
    
    CONTEXT:
    I have a new demo track.
    Audio Vibe: {audio_context} (BPM: {int(user_audio_features.get('tempo', 0))})
    Lyrics: "{user_lyrics[:600]}..."

    YOUR ROSTER:
    {roster_text}

    TASK:
    Identify the Top 20 artists from the roster who match BOTH the "{audio_context}" vibe AND the lyrical themes.
    
    CRITICAL RULES:
    1. If the Audio Vibe is 'Dance/House', DO NOT suggest acoustic ballad singers (like Birdy or Lewis Capaldi) unless they are famous for dance hits.
    2. Prioritize artists whose PRIMARY genre matches the Audio Vibe.
    3. Look for "Soulful Lyrics" inside "Dance Production" (e.g., Becky Hill, Calvin Harris, Rudimental).
    
    RETURN JSON:
    {{ "candidates": ["Artist 1", "Artist 2", ...] }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a JSON-only music analysis assistant."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return data.get("candidates", [])
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return []