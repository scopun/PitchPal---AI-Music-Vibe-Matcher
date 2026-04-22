import os
import json
import re
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


async def get_claude_vibe_match(audio_features: dict, lyrics: str = "") -> dict:

    tempo = audio_features.get('tempo', 0)
    energy = audio_features.get('energy', 0)
    acousticness = audio_features.get('acousticness', 0.5)
    danceability = audio_features.get('danceability', 0.5)
    median_f0 = audio_features.get('median_f0', 0)

    if median_f0 > 180:
        vocal_hint = "Female vocals"
    elif median_f0 > 100:
        vocal_hint = "Male vocals"
    else:
        vocal_hint = "Instrumental or unclear"

    # Clean watermarks
    cleaned_lyrics = lyrics
    for w in [
        "artlist io", "artlist.io", "artless io", "artless i o",
        "music licensing reimagined", "music licensing reimagine",
        "music licensing", "royalty free"
    ]:
        cleaned_lyrics = cleaned_lyrics.lower().replace(w, " ")
    cleaned_lyrics = re.sub(r'\s+', ' ', cleaned_lyrics).strip()

    has_lyrics = len(cleaned_lyrics.split()) > 10

    system_prompt = """
You are a world-class A&R consultant at a major music publisher.

Your task: Analyse a song and identify the BEST real-world artists who would REALISTICALLY record this track as an external pitch.

ANALYSIS APPROACH:

Step 1 — Read the lyrics carefully and identify:
- Primary genre (be very specific: not just "pop" but "country-pop", "indie folk", "future rave", "R&B soul", etc.)
- Emotional tone and themes
- Vocal style implied
- Production style implied

Step 2 — Cross-reference with audio features for confirmation

Step 3 — Select artists who:
a) Work in EXACTLY this genre
b) Are KNOWN to accept external songs
c) Would genuinely record this specific track

CRITICAL RULES:

1. Genre accuracy is everything
   - Country lyrics = country/country-pop artists ONLY
   - Electronic/dance = dance producers and vocalists ONLY
   - Singer-songwriter = singer-songwriter artists ONLY
   - R&B/soul = R&B artists ONLY

2. Never suggest artists outside the detected genre, regardless of their popularity

3. Use your complete knowledge of the music industry — suggest the most accurate matches even if they are less famous

4. Only suggest artists known to accept external songs

5. Scores must be strict:
   - 0.90+ = near-perfect stylistic and genre match
   - 0.80-0.89 = strong match, same genre
   - 0.70-0.79 = reasonable match
   - Below 0.70 = do not include

6. Return 5-8 matches minimum. Never return empty.
"""

    user_message = f"""
SONG TO ANALYSE:

Audio Features:
- BPM: {tempo:.0f}
- Energy: {energy:.2f}
- Acousticness: {acousticness:.2f} (0=electronic, 1=acoustic)
- Danceability: {danceability:.2f}
- Vocals: {vocal_hint}

{"Lyrics:" if has_lyrics else "Note: Instrumental track — analyse audio features only."}
{cleaned_lyrics if has_lyrics else ""}

Based on your analysis, return the best matching artists.

Return ONLY valid JSON, no other text:
{{
    "matches": [
        {{
            "artist": "Artist Name",
            "final_score": 0.88,
            "reason": "Clear explanation referencing the song's specific style and why this artist is a genuine match.",
            "genre_fit": "Specific genre alignment"
        }}
    ],
    "detected_genre": "Specific genre (e.g. Country-Pop, Indie Folk, Future Rave, R&B Soul)",
    "genre_tags": ["tag1", "tag2", "tag3"],
    "pitch_angle": "How to pitch this commercially",
    "market_fit": "Target audience and market"
}}
"""

    try:
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=3000,
            temperature=0.2,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}]
        )

        raw_text = response.content[0].text.strip()
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)

        if json_match:
            try:
                return json.loads(json_match.group(0))
            except:
                return {"error": "JSON parsing failed", "matches": [], "raw": raw_text}
        else:
            return {"error": "No JSON found", "matches": [], "raw": raw_text}

    except Exception as e:
        return {"error": str(e), "matches": []}