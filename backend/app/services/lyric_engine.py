import os
import json
import re
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def get_claude_vibe_match(lyrics: str, audio_features: dict, artist_roster: list) -> dict:
    formatted_roster = "\n".join([f"- {a['name']} (Genre: {a.get('genre', 'Unknown')}, Vibe: {a.get('vibe', 'Unknown')})" for a in artist_roster])
    
    audio_data_str = json.dumps(audio_features, indent=2)

    system_prompt = f"""
    You are an expert music A&R consultant and musicologist specialising in artist matchmaking for songwriters and composers. Your job is to analyse submitted song lyrics and identify the closest matching professional recording artists based on multiple weighted dimensions.

    Analyse the following lyrics across these dimensions:
    1. LYRICAL STYLE — metaphor density, imagery type, narrative voice, vocabulary register.
    2. EMOTIONAL TONE — primary emotion and emotional arc, emotional intensity, vulnerability level.
    3. THEMATIC CONTENT — recurring themes and subject matter.
    4. SONIC PROFILE — based on lyrical rhythm, infer likely tempo feel, likely instrumentation, vocal delivery style.
    5. GENRE & SCENE — identify the most likely genre(s) and sub-genre(s) with geographic/cultural context.
    6. CULTURAL & MARKET FIT — identify which music markets and audiences this song would resonate with globally.

    IMPORTANT RULES:
    - Prioritise lyrical tone, emotional world and thematic resonance OVER assumed tempo or production style.
    - Do not default to the most commercially famous artist — match on genuine stylistic alignment.
    - Actively consider UK, European, and global artists, not just US-centric matches.
    - Be honest about confidence levels.

    Audio analysis data (extracted via librosa):
    {audio_data_str}

    ARTIST ROSTER:
    {formatted_roster}
    
    You MUST return the output strictly as a raw JSON object with no markdown formatting or conversational text. Use this exact schema:
    {{
        "matches": [
            {{
                "artist": "Artist Name",
                "final_score": 0.85,
                "lyrical_score": 0.92,
                "reason": "2-3 sentence explanation referencing specific artist works, lyrical style, and sound.",
                "tech_comparison": {{
                    "user_bpm": 120,
                    "artist_bpm": 124,
                    "user_energy": 0.8,
                    "artist_energy": 0.85
                }}
            }}
        ],
        "extracted_features": {audio_features},
        "genre_tags": ["Tag1", "Tag2", "Tag3"],
        "pitch_angle": "1-2 sentences capturing what makes it distinctive for a pitch.",
        "market_fit": "Target market (e.g., UK Indie, Global Pop)"
    }}
    Ensure 'matches' contains the top 8 ranked artists from the provided roster.
    """

    user_message = f"Lyrics to analyse:\n{lyrics}"

    try:
        response = anthropic_client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2500,
            temperature=0.3,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )

        raw_text = response.content[0].text.strip()
        
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        
        if json_match:
            clean_json_str = json_match.group(0)
            return json.loads(clean_json_str)
        else:
            return {"error": "Failed to extract JSON from Claude response", "matches": [], "raw": raw_text}

    except Exception as e:
        return {"error": str(e), "matches": []}