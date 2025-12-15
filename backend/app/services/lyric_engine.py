import json
from openai import AsyncOpenAI # <--- CHANGED TO ASYNC
from app.core.config import settings

# Initialize Async Client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def get_semantic_shortlist(user_lyrics, artist_database, user_audio_features=None):
    """
    ASYNC Semantic Search: Non-blocking AI call.
    """
    
    # 1. Format Audio Context
    audio_info = "Unknown"
    if user_audio_features:
        bpm = int(user_audio_features.get('tempo', 0))
        energy = round(user_audio_features.get('energy', 0), 2)
        audio_info = f"BPM: {bpm}, Energy: {energy}/1.0"

    # 2. Format Roster
    roster_text = ""
    # Limit roster size to prevent token overflow/slowdown if DB is huge
    count = 0
    for artist, data in artist_database.items():
        if count > 80: break # Safety limit for speed
        desc = data.get("description", ", ".join(data.get("genres", ["General Artist"])))
        roster_text += f"- {artist}: {desc}\n"
        count += 1

    # 3. Prompt
    prompt = f"""
    You are an expert Music A&R.
    INPUT: Audio ({audio_info}), Lyrics: "{user_lyrics[:600]}..."
    ROSTER:
    {roster_text}
    
    TASK: Pick Top 10 matches based on Vibe & Lyrics.
    INSTRUCTIONS:
    - High BPM (>120) + Emotional Lyrics -> Dance Pop (e.g. Becky Hill).
    - Low BPM + Acoustic -> Singer/Songwriter.
    - Match 'Girl Group' only if lyrics fit Indie/Punk vibe.
    
    RETURN JSON: {{ "candidates": ["Artist A", "Artist B"] }}
    """

    try:
        # AWAIT the response so the server stays alive
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a JSON-only music assistant."},
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