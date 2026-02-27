import json
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def get_semantic_shortlist(user_lyrics, artist_database, user_audio_features=None):
    audio_instruction = ""
    audio_info = "Unknown"
    
    if user_audio_features:
        bpm = int(user_audio_features.get('tempo', 0))
        energy = round(user_audio_features.get('energy', 0), 2)
        audio_info = f"BPM: {bpm}, Energy: {energy}/1.0"
        
        if bpm > 150:
             audio_instruction = "CRITICAL: Track is VERY FAST (>150 BPM). Exclude slow acoustic artists."
        elif bpm >= 120 and energy >= 0.75:
             audio_instruction = "CRITICAL: Track is HIGH ENERGY DANCE. Strictly exclude Acoustic, Folk, and Ballad artists."
        elif energy <= 0.55:
             audio_instruction = "CRITICAL: Track is LOW ENERGY. Strictly exclude EDM, House, and Dance artists."

    roster_text = ""
    count = 0
    for artist, data in artist_database.items():
        if count > 250: break 
        
        genres_list = data.get("genres", ["General"]) 
        genres_str = ", ".join(genres_list)
        desc = data.get("description", "Artist")
        artist_bpm = int(data.get("tempo", 0))
        
        roster_text += f"- {artist} [Genre: {genres_str}] (Avg BPM: {artist_bpm}): {desc}\n"
        count += 1

    prompt = f"""
    You are an expert Music A&R Executive.
    
    INPUT TRACK DATA:
    - Audio Stats: {audio_info}
    - Lyrics excerpt: "{user_lyrics[:600]}..."

    YOUR ROSTER:
    {roster_text}

    TASK: Identify the Top 20 Artists that perfectly match the Audio Stats and Lyrical Theme.
    
    {audio_instruction}
    
    RETURN JSON:
    {{ "candidates": ["Artist 1", "Artist 2"] }}
    """

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a JSON-only music analysis assistant."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return data.get("candidates", [])
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return []