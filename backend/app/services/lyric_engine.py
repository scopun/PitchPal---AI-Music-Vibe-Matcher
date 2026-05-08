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
    if lyrics.count('?') > len(words) * 0.3:
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


def build_audio_hints(tempo, acousticness, danceability, energy, vocal_hint):
    if acousticness > 0.65:
        production = "ACOUSTIC/ORGANIC — live instruments, NOT electronic dance"
    elif acousticness > 0.35:
        production = "MIXED — acoustic + electronic blend"
    else:
        production = "ELECTRONIC/DIGITAL — synths, programmed beats"

    if tempo < 75:
        tempo_h = "SLOW — ballad/emotional/intimate"
    elif tempo < 95:
        tempo_h = "MID-TEMPO — country/folk/R&B/roots-pop"
    elif tempo < 115:
        tempo_h = "UPBEAT — pop/indie/country-pop"
    elif tempo < 130:
        tempo_h = "FAST — dance-pop/house/electronic"
    else:
        tempo_h = "VERY FAST — EDM/drum&bass"

    if danceability > 0.8 and acousticness < 0.3:
        genre_sig = "DANCE/ELECTRONIC territory"
    elif danceability > 0.7 and acousticness >= 0.35:
        genre_sig = "ROOTS-POP/COUNTRY-POP — high danceability but acoustic warmth = NOT pure dance"
    elif acousticness > 0.55 and danceability < 0.6:
        genre_sig = "ACOUSTIC/FOLK/SINGER-SONGWRITER territory"
    elif acousticness > 0.4 and tempo < 95:
        genre_sig = "SINGER-SONGWRITER/BALLAD/SOUL territory"
    elif energy < 0.4:
        genre_sig = "INTIMATE/QUIET — ballad or atmospheric"
    else:
        genre_sig = "MAINSTREAM POP territory"

    return production, tempo_h, genre_sig


async def get_claude_vibe_match(audio_features: dict, lyrics: str = "", detected_language: str = "en") -> dict:

    db = get_who_looking()
    actively_looking = db.get("actively_looking", [])
    not_available = db.get("not_available", [])
    deceased = db.get("deceased", [])

    # Build who's looking list string
    artist_lines = []
    for a in actively_looking:
        line = f"- {a['artist']} ({a.get('label','')}, {a.get('territory','')}): {a.get('brief','')}"
        if a.get('sonic_profile'):
            line += f" | SOUND: {a['sonic_profile']}"
        if a.get('not_this'):
            line += f" | NOT: {a['not_this']}"
        artist_lines.append(line)

    who_looking_str = "\n".join(artist_lines)
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
    has_text = len(cleaned_lyrics.strip()) > 5

    # Language
    is_english = detected_language.lower() in ['en', 'english', '']
    lang_note = f"\n⚠️ LANGUAGE: Song is in {detected_language.upper()} — match artists who work in this language/market." if not is_english else ""

    if has_text and has_audio:
        mode = "LYRICS + AUDIO"
        song_data = f"LYRICS:{lang_note}\n{cleaned_lyrics}\n\nAudio: BPM {tempo:.0f}, Energy {energy:.2f}, Acousticness {acousticness:.2f}, Danceability {danceability:.2f}, Vocals: {vocal_hint}"
    elif has_text:
        mode = "DESCRIPTION ONLY"
        song_data = f"DESCRIPTION:{lang_note}\n{cleaned_lyrics}"
    elif has_audio:
        mode = "AUDIO ONLY"
        prod, tempo_h, genre_sig = build_audio_hints(tempo, acousticness, danceability, energy, vocal_hint)
        song_data = f"Audio: BPM {tempo:.0f} ({tempo_h}), Energy {energy:.2f}, Acousticness {acousticness:.2f} ({prod}), Danceability {danceability:.2f} ({genre_sig}), Vocals: {vocal_hint}"
    else:
        return {"matches": [], "detected_genre": "No data", "genre_tags": [], "pitch_angle": "Please upload an audio file.", "market_fit": "", "success": True}

    system_prompt = f"""You are a world-class A&R consultant at a major UK music publisher with 20 years experience.

TASK: Find the best artist matches for this song using TWO sources:

SOURCE 1 — WHO'S LOOKING LIST (these artists are actively seeking songs RIGHT NOW):
{who_looking_str}

SOURCE 2 — YOUR COMPLETE MUSIC INDUSTRY KNOWLEDGE (use this for additional matches)

MATCHING APPROACH:
1. First identify the song's genre, sonic world, mood, language and production style
2. Find matches from the Who's Looking list (label these as "Who's Looking")  
3. Find additional strong matches from your global industry knowledge (label these as "Industry Match")
4. Combine both — always return the best 5-8 matches regardless of source

LANGUAGE RULE — ABSOLUTE:
- Non-English songs MUST be matched to artists who work in that language
- Spanish song → Spanish/Latin artists (Rosalía, Bad Bunny, C. Tangana, Bizarrak, Aitana, Nathy Peluso etc.)
- NEVER match a UK/US English artist to a non-English language song

SONIC WORLD RULES — CRITICAL:
- A BALLAD/SPARSE SONG must NEVER match dance artists (Becky Hill, Sigala, Meduza)
- DARK UNDERGROUND TECHNO (Anyma) ≠ MELODIC HOUSE (Meduza) ≠ TROPICAL POP (Sigala)
- Singer-songwriter sparse production → Lewis Capaldi, Cian Ducrot, Sam Fischer, JP Saxe
- Underground dark electronic → Anyma, not Meduza or Sigala
- If a song is clearly a ballad/singer-songwriter → return those artists even if not on Who's Looking list

NEVER SUGGEST:
- Not available: {not_available_str}
- Deceased: {deceased_str}

SCORES: 0.90+ perfect, 0.80-0.89 strong, 0.70-0.79 reasonable. Below 0.70 = exclude.
Return 5-8 matches. Never force weak matches — fewer accurate matches is better than many wrong ones."""

    user_message = f"""Mode: {mode}

{song_data}

Return ONLY valid JSON:
{{
    "matches": [
        {{
            "artist": "Name",
            "label": "Label",
            "territory": "UK or International",
            "source": "Who's Looking" or "Industry Match",
            "final_score": 0.88,
            "reason": "Why this artist fits this specific song.",
            "genre_fit": "Sonic alignment",
            "brief_match": "How song fits their world"
        }}
    ],
    "detected_genre": "Specific genre",
    "detected_language": "{detected_language}",
    "genre_tags": ["tag1", "tag2"],
    "pitch_angle": "Commercial pitch",
    "market_fit": "Target audience"
}}"""

    try:
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4000,
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
        return {"error": "No JSON found", "matches": [], "raw": raw_text}

    except Exception as e:
        return {"error": str(e), "matches": []}