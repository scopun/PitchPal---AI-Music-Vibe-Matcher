import json
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def get_semantic_shortlist(user_lyrics, artist_database, user_audio_features=None):
    """
    ASYNC Semantic Search with Genre & Audio-Aware Prompting.
    """
    
    # 1. Format Audio Context with Heuristics
    audio_instruction = ""
    audio_info = "Unknown"
    
    if user_audio_features:
        bpm = int(user_audio_features.get('tempo', 0))
        energy = round(user_audio_features.get('energy', 0), 2)
        audio_info = f"BPM: {bpm}, Energy: {energy}/1.0"
        
        # Rule-based logic to guide the AI
        if bpm > 150:
             audio_instruction = "CRITICAL: Input is VERY FAST (>150 BPM). Prioritize 'Drum & Bass', 'Jungle', or fast 'Punk'. Avoid slow ballads."
        elif bpm > 120 and energy > 0.8:
             audio_instruction = "CRITICAL: Input is High-Energy Dance/House (>120 BPM). Prioritize 'House', 'EDM', 'Dance-Pop'. Avoid Acoustic/Folk."
        elif energy < 0.5:
             audio_instruction = "CRITICAL: Input is Low Energy. Prioritize 'Acoustic', 'Ballad', 'Soul', 'Lo-Fi'. Avoid Club bangers."

    # 2. Format Roster (Optimized for Genres)
    roster_text = ""
    count = 0
    for artist, data in artist_database.items():
        if count > 250: break # Limit context size
        
        # Read the new GENRES list from the DB
        genres_list = data.get("genres", ["General"]) 
        genres_str = ", ".join(genres_list)
        
        desc = data.get("description", "Artist")
        artist_bpm = int(data.get("tempo", 0))
        
        # Explicitly show Genre & BPM to AI
        roster_text += f"- {artist} [Genre: {genres_str}] (Avg BPM: {artist_bpm}): {desc}\n"
        count += 1

    # 3. Prompt
    prompt = f"""
    You are an expert Music A&R Executive.
    
    INPUT TRACK DATA:
    - Audio Stats: {audio_info}
    - Lyrics excerpt: "{user_lyrics[:600]}..."

    YOUR ROSTER:
    {roster_text}

    TASK: Identify the Top 15 Artists that match BOTH the Audio Energy AND the Lyrical Theme.
    
    {audio_instruction}
    
    GUIDELINES:
    1. Match Genres: If input is DnB, pick DnB artists. If Acoustic, pick Folk/Soul.
    2. Match Lyrical Tone: Sad/Heartbreak vs. Happy/Party.
    3. Use the BPM/Energy provided in the roster to ensure a vibe match.

    RETURN JSON:
    {{ "candidates": ["Artist Name 1", "Artist Name 2", ...] }}
    """

    try:
        response = await client.chat.completions.create(
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