import os
import json
import re
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

_WHO_LOOKING = None

def get_who_looking():
    global _WHO_LOOKING
    if _WHO_LOOKING is None:
        try:
            db_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'who_is_looking.json')
            with open(db_path, 'r') as f:
                _WHO_LOOKING = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load who_is_looking.json: {e}")
            _WHO_LOOKING = {"actively_looking": [], "not_available": [], "deceased": []}
    return _WHO_LOOKING


def is_lyrics_meaningful(lyrics: str) -> bool:
    """Check if extracted audio lyrics are meaningful (not garbled)."""
    if not lyrics or len(lyrics.strip()) < 20:
        return False
    words = lyrics.split()
    if len(words) < 15:
        return False
    # Too many question marks = garbled AssemblyAI output
    question_marks = lyrics.count('?')
    if question_marks > len(words) * 0.3:
        return False
    artifacts = ['artlist', 'music licensing', 'royalty free']
    if sum(1 for a in artifacts if a in lyrics.lower()) >= 2:
        return False
    return True


def clean_lyrics(lyrics: str) -> str:
    result = lyrics
    for w in ["artlist io", "artlist.io", "artless io", "artless i o",
              "music licensing reimagined", "music licensing reimagine",
              "music licensing", "royalty free"]:
        result = result.lower().replace(w, " ")
    return re.sub(r'\s+', ' ', result).strip()


async def get_claude_vibe_match(audio_features: dict, lyrics: str = "") -> dict:

    db = get_who_looking()
    actively_looking = db.get("actively_looking", [])
    not_available = db.get("not_available", [])
    deceased = db.get("deceased", [])

    # Format artist list for Claude
    artist_list = "\n".join([
        f"- {a['artist']} ({a['label']}, {a['territory']}): {a['brief']}"
        for a in actively_looking
    ])
    not_available_str = ", ".join(not_available)
    deceased_str = ", ".join(deceased)

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
        vocal_hint = "Unclear/instrumental"

    cleaned_lyrics = clean_lyrics(lyrics) if lyrics else ""

    # IMPORTANT: Determine mode
    has_audio = tempo > 0 or energy > 0
    has_meaningful_lyrics = is_lyrics_meaningful(cleaned_lyrics)
    has_any_text = len(cleaned_lyrics.strip()) > 5  # Even short descriptions count

    if has_any_text and has_audio:
        analysis_mode = "LYRICS + AUDIO"
        song_data = f"""
LYRICS / DESCRIPTION:
{cleaned_lyrics}

Audio features: BPM {tempo:.0f}, Energy {energy:.2f}, Acousticness {acousticness:.2f}, Danceability {danceability:.2f}, Vocals: {vocal_hint}
"""
    elif has_any_text and not has_audio:
        # Lyrics-only mode — no audio file, just description
        analysis_mode = "DESCRIPTION ONLY"
        song_data = f"""
SONG DESCRIPTION / LYRICS:
{cleaned_lyrics}

Note: No audio file — match based purely on the description above.
"""
    elif has_audio and not has_any_text:
        analysis_mode = "AUDIO ONLY"
        song_data = f"""
Instrumental or no lyrics detected.
BPM: {tempo:.0f}, Energy: {energy:.2f}, Acousticness: {acousticness:.2f} (0=electronic, 1=acoustic), Danceability: {danceability:.2f}, Vocals: {vocal_hint}
"""
    else:
        return {
            "matches": [],
            "detected_genre": "No data",
            "genre_tags": [],
            "pitch_angle": "Please upload an audio file or provide a song description.",
            "market_fit": "",
            "success": True
        }

    system_prompt = f"""
You are a world-class A&R consultant at a major UK music publisher.

You have access to the LIVE "Who's Looking" list — the actual current database of UK artists actively seeking songs (April 2026).

YOUR TASK: Match this song to the BEST artists from the Who's Looking list below.

═══════════════════════════════════════════
WHO'S LOOKING (April 2026):
═══════════════════════════════════════════
{artist_list}

═══════════════════════════════════════════
NOT AVAILABLE — NEVER SUGGEST:
═══════════════════════════════════════════
{not_available_str}

═══════════════════════════════════════════
DECEASED — NEVER SUGGEST EVER:
═══════════════════════════════════════════
{deceased_str}

═══════════════════════════════════════════
MATCHING RULES:
═══════════════════════════════════════════

1. ONLY suggest artists from the Who's Looking list. Do NOT suggest anyone not on it.

2. NEVER suggest artists on the Not Available list.

3. NEVER suggest deceased artists — absolute rule.

4. Match based on each artist's SPECIFIC BRIEF:
   - Joel Corry → Only match if track is COUNTRY
   - Take That → Only if CLASSIC ANTHEMIC POP (Shine, Patience style)
   - Dua Lipa → Only if late 70s/80s Talking Heads/Bowie influenced
   - Loreen → Only if DARK POP/DANCE — NO BALLADS
   - Sub Focus → Only if big electronic anthem like 'I Found You'
   - Bunt. → Only if emotional piano/vocal that can flip to dance

5. UK artists first. Flag each as UK or International.

6. Scores: 0.90+ perfect, 0.80-0.89 strong, 0.70-0.79 good. Below 0.70 = exclude.

7. Return 5-7 matches. Quality over quantity.
"""

    user_message = f"""
Analysis mode: {analysis_mode}

{song_data}

Return ONLY valid JSON:
{{
    "matches": [
        {{
            "artist": "Artist Name",
            "label": "Their Label",
            "territory": "UK or International",
            "final_score": 0.88,
            "reason": "Why this artist specifically matches — reference their brief.",
            "genre_fit": "Genre alignment",
            "brief_match": "How this song fits their current brief"
        }}
    ],
    "detected_genre": "Specific genre",
    "genre_tags": ["tag1", "tag2"],
    "pitch_angle": "How to pitch this commercially",
    "market_fit": "Target audience and territory"
}}
"""

    try:
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=3000,
            temperature=0.1,
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