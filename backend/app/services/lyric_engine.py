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
    if not lyrics or len(lyrics.strip()) < 20:
        return False
    words = lyrics.split()
    if len(words) < 15:
        return False
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


def build_audio_genre_hints(tempo, acousticness, danceability, energy, vocal_hint):
    """Build clear genre hints from audio features for when lyrics are unavailable."""

    # Production type
    if acousticness > 0.65:
        production_hint = "ACOUSTIC/ORGANIC — live instruments, guitar/piano-led, NOT electronic dance"
    elif acousticness > 0.35:
        production_hint = "MIXED — blend of acoustic warmth and electronic elements"
    else:
        production_hint = "ELECTRONIC/DIGITAL — synths, programmed beats, dance production"

    # Tempo hint
    if tempo < 75:
        tempo_hint = "SLOW — ballad, emotional, intimate"
    elif tempo < 95:
        tempo_hint = "MID-TEMPO — country, folk, R&B, roots-pop"
    elif tempo < 115:
        tempo_hint = "UPBEAT — pop, indie-pop, country-pop, soft dance"
    elif tempo < 130:
        tempo_hint = "FAST — dance-pop, house, electronic pop"
    else:
        tempo_hint = "VERY FAST — EDM, drum & bass, hard dance"

    # Combined genre signal — most important
    if danceability > 0.8 and acousticness < 0.3:
        genre_signal = "DANCE/ELECTRONIC territory — high danceability + pure electronic production"
    elif danceability > 0.7 and acousticness >= 0.35:
        genre_signal = "ROOTS-POP / COUNTRY-POP / UPLIFTING POP territory — high danceability but acoustic warmth means this is NOT dance/electronic"
    elif acousticness > 0.55 and danceability < 0.6:
        genre_signal = "ACOUSTIC/FOLK/COUNTRY territory — organic production, lower danceability"
    elif acousticness > 0.4 and tempo < 95 and danceability < 0.7:
        genre_signal = "SINGER-SONGWRITER / BALLAD / SOUL territory — organic, mid-tempo, emotional"
    elif energy < 0.4:
        genre_signal = "INTIMATE/QUIET territory — low energy suggests ballad, atmospheric, or ambient"
    else:
        genre_signal = "MAINSTREAM POP territory — balanced features suggest commercial pop"

    return production_hint, tempo_hint, genre_signal


async def get_claude_vibe_match(audio_features: dict, lyrics: str = "") -> dict:

    db = get_who_looking()
    actively_looking = db.get("actively_looking", [])
    not_available = db.get("not_available", [])
    deceased = db.get("deceased", [])

    # Format artist list with full sonic profiles
    artist_lines = []
    for a in actively_looking:
        line = f"- {a['artist']} ({a['label']}, {a['territory']})"
        line += f"\n  BRIEF: {a['brief']}"
        if a.get('sonic_profile'):
            line += f"\n  SONIC PROFILE: {a['sonic_profile']}"
        if a.get('references'):
            line += f"\n  REFERENCES: {a['references']}"
        if a.get('not_this'):
            line += f"\n  NOT THIS: {a['not_this']}"
        artist_lines.append(line)

    artist_list = "\n".join(artist_lines)
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

    has_audio = tempo > 0 or energy > 0
    has_any_text = len(cleaned_lyrics.strip()) > 5

    if has_any_text and has_audio:
        analysis_mode = "LYRICS + AUDIO"
        song_data = f"""
LYRICS / DESCRIPTION:
{cleaned_lyrics}

Audio: BPM {tempo:.0f}, Energy {energy:.2f}, Acousticness {acousticness:.2f}, Danceability {danceability:.2f}, Vocals: {vocal_hint}
"""
    elif has_any_text and not has_audio:
        analysis_mode = "DESCRIPTION ONLY"
        song_data = f"""
SONG DESCRIPTION / LYRICS:
{cleaned_lyrics}

Note: No audio file — match based purely on the description above.
"""
    elif has_audio and not has_any_text:
        # Audio only — use detailed genre hints
        analysis_mode = "AUDIO ONLY"
        production_hint, tempo_hint, genre_signal = build_audio_genre_hints(
            tempo, acousticness, danceability, energy, vocal_hint
        )
        song_data = f"""
Audio analysis only — no lyrics extracted (instrumental or unclear vocals):

RAW DATA:
- BPM: {tempo:.0f}
- Energy: {energy:.2f}
- Acousticness: {acousticness:.2f}
- Danceability: {danceability:.2f}
- Vocals: {vocal_hint}

INTERPRETED SIGNALS:
- Tempo: {tempo_hint}
- Production: {production_hint}
- Genre Signal: {genre_signal}

CRITICAL REMINDER: Do NOT default to dance/electronic just because danceability is high.
High danceability + acoustic warmth (0.35+) = roots-pop, country-pop, or uplifting pop — NOT dance/electronic.
Example: BPM 92, danceability 1.0, acousticness 0.44, female vocals = country-pop or roots-pop territory.
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
You are a world-class A&R consultant at a major UK music publisher with 20 years experience.

You have access to the LIVE "Who's Looking" list with detailed sonic profiles for each artist.

YOUR TASK: Match this song to the BEST artists from the list. You must match at the level of SONIC WORLD and MOOD — not just genre label.

CRITICAL: Two artists can both be "dance" but be completely different sonic worlds.
BUNT is emotional cinematic piano-led. Sigala is upbeat tropical house. These are NOT interchangeable.
Read and apply each artist's sonic profile and NOT_THIS fields carefully.

═══════════════════════════════════════════
WHO'S LOOKING — WITH SONIC PROFILES (April 2026):
═══════════════════════════════════════════
{artist_list}

═══════════════════════════════════════════
NOT AVAILABLE — NEVER SUGGEST:
═══════════════════════════════════════════
{not_available_str}

═══════════════════════════════════════════
DECEASED — NEVER SUGGEST:
═══════════════════════════════════════════
{deceased_str}

═══════════════════════════════════════════
MATCHING RULES:
═══════════════════════════════════════════

1. ONLY suggest artists from the Who's Looking list above.

2. NEVER suggest artists on the Not Available list.

3. NEVER suggest deceased artists — absolute rule.

4. SONIC WORLD MATCHING — most important rule:
   Read each artist's SONIC PROFILE and NOT_THIS fields carefully.
   A soulful jazz ballad CANNOT match Sigala (upbeat tropical house).
   A dark emotional piano song CANNOT match Jonas Blue (feel-good only).
   A Duffy/Joss Stone style soul song: Paloma Faith, Celeste, Brooke Combe, Joy Crookes.
   An X Ambassadors indie-rock style: Rachel Chinouriri, Tom Grennan, goddard.
   A Myles Smith intimate singer-songwriter: Myles Smith, Cian Ducrot, Lewis Capaldi — NOT Take That, NOT Sigala.
   A country/roots-pop song: Joel Corry (country brief), Kylie Minogue (Golden era), Nell Mescal (Nashville).

5. UK artists first. Flag each as UK or International.

6. Scores:
   - 0.90+ = sonic world, mood, production AND genre all align perfectly
   - 0.80-0.89 = strong sonic match, same world
   - 0.70-0.79 = adjacent world, credible pitch
   - Below 0.70 = DO NOT include

7. Return 5-7 matches MAXIMUM. Quality over quantity.
   If fewer than 5 genuinely fit, return fewer. Never force weak matches.
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
            "reason": "Specific explanation referencing their sonic profile and why this song fits their world.",
            "genre_fit": "Specific sonic alignment",
            "brief_match": "How this song fits their current brief and sonic world"
        }}
    ],
    "detected_genre": "Specific genre and sonic world",
    "genre_tags": ["tag1", "tag2", "tag3"],
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