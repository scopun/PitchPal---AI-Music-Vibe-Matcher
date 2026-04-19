import os
import json
import re
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def get_claude_vibe_match(lyrics: str, audio_features: dict, artist_roster: list) -> dict:

    formatted_roster = "\n".join([
        f"- {a['name']} (Genre: {a.get('genre', 'Unknown')}, Vibe: {a.get('vibe', 'Unknown')})"
        for a in artist_roster
    ])

    audio_data_str = json.dumps(audio_features, indent=2)

    system_prompt = f"""
You are a senior A&R music industry expert responsible for matching songs to artists with high commercial and stylistic accuracy.

Your task is NOT just to suggest similar artists, but to identify realistic artist placements based on industry behaviour, songwriting compatibility, and genre alignment.

STRICT MATCHING RULES:

1. GENRE ACCURACY (CRITICAL)
- First, determine the PRIMARY genre of the song.
- DO NOT mismatch genres (e.g. electronic songs must NOT be matched with acoustic singer-songwriters).
- If genre mismatch occurs, exclude the artist completely.

2. ARTIST BEHAVIOUR FILTERING
- Consider whether the artist typically accepts external songs.
- If an artist is known for writing their own material (e.g. strong singer-songwriters), reduce their score significantly or exclude them.

3. STYLE & ERA MATCHING
- Match based on the artist's RECENT releases (last 3–5 years).
- Avoid outdated stylistic matches.

4. EMOTIONAL & LYRICAL ALIGNMENT
- Prioritise emotional tone, lyrical depth, and storytelling compatibility.
- Match vulnerability level, lyrical themes, and writing style.

5. COMMERCIAL REALISM
- Only return artists where this song could realistically be pitched.
- Avoid obvious but unrealistic matches.

6. SCORING RULES
- final_score must reflect REALISTIC FIT (not just similarity).
- Keep scores strict:
    0.85+ = very strong fit
    0.70–0.84 = good fit
    below 0.70 = weak (avoid including)

INPUT DATA:

Audio Features:
{audio_data_str}

Artist Roster:
{formatted_roster}

TASK:

Return ONLY the top 5–8 MOST ACCURATE artist matches.

STRICT OUTPUT RULES:

- Return ONLY valid JSON (no text, no explanation outside JSON)
- Follow this exact structure:

{{
    "matches": [
        {{
            "artist": "Artist Name",
            "final_score": 0.85,
            "lyrical_score": 0.90,
            "reason": "Clear, industry-style explanation referencing actual artist style and why the match works.",
            "tech_comparison": {{
                "user_bpm": 120,
                "artist_bpm": 124,
                "user_energy": 0.8,
                "artist_energy": 0.85
            }}
        }}
    ],
    "genre_tags": ["accurate genre"],
    "pitch_angle": "Why this song works commercially",
    "market_fit": "Target market"
}}
"""

    user_message = f"Lyrics to analyse:\n{lyrics}"

    try:
        response = anthropic_client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2500,
            temperature=0.25,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )

        raw_text = response.content[0].text.strip()

        # SAFE JSON EXTRACTION
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)

        if json_match:
            try:
                return json.loads(json_match.group(0))
            except:
                return {
                    "error": "JSON parsing failed",
                    "matches": [],
                    "raw": raw_text
                }
        else:
            return {
                "error": "No JSON found in response",
                "matches": [],
                "raw": raw_text
            }

    except Exception as e:
        return {
            "error": str(e),
            "matches": []
        }