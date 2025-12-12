import json
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def get_semantic_shortlist(user_lyrics, artist_database, user_audio_features=None):
    """
    Semantic Search using Rich Artist Descriptions (The "Nuance" Engine).
    """
    
    # 1. Format Audio Context (as a hint, not a rule)
    audio_info = "Unknown"
    if user_audio_features:
        bpm = int(user_audio_features.get('tempo', 0))
        energy = round(user_audio_features.get('energy', 0), 2)
        audio_info = f"BPM: {bpm}, Energy: {energy}/1.0"

    # 2. Format Roster with RICH DESCRIPTIONS
    # This is the secret sauce. We feed the AI the "Vibe" generated from the DB.
    roster_text = ""
    for artist, data in artist_database.items():
        # Fallback to genres if description is missing
        desc = data.get("description", ", ".join(data.get("genres", ["General Artist"])))
        roster_text += f"- {artist}: {desc}\n"

    # 3. The "Nuance-First" Prompt
    prompt = f"""
    You are an expert Music A&R Executive with a deep understanding of UK Music Culture.
    
    INPUT SONG DATA:
    - Audio Stats: {audio_info}
    - Lyrics: "{user_lyrics[:800]}..."

    YOUR ROSTER (With Vibe Profiles):
    {roster_text}

    TASK:
    Identify the Top 15 Artists from the roster that are the best match.
    
    CRITICAL INSTRUCTIONS:
    1. READ THE DESCRIPTIONS: Do not guess based on the artist name. Use the provided "Vibe Profile".
    2. THE "GIRL GROUP" TRAP: Note that the band named "Girl Group" is Indie/Punk. Do NOT match them to "Pop Anthem" lyrics just because of their name.
    3. THE "DANCE" TRAP: If the lyrics are emotional/heartbreak but the BPM is high (120+), look for artists described as "Dance-Pop" or "Vocal House" (like Becky Hill). Do NOT pick acoustic ballad singers unless they have a matching remix vibe.
    4. THE "BALLAD" TRAP: If lyrics are raw/acoustic, ignore high BPM (it might be double-time). Pick artists described as "Soulful," "Acoustic," or "Raw" (like Lewis Capaldi, Birdy).

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