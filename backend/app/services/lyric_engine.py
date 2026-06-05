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

    # Genre signal — be explicit about NOT-dance signals so the matcher
    # stops defaulting to Jonas Blue / Sigala / Clean Bandit / Meduza for
    # vocal-led tracks. Order matters: cheaper rules first, fallback last.
    if danceability > 0.8 and acousticness < 0.3 and tempo > 115:
        genre_sig = "DANCE/ELECTRONIC territory — dance artists OK here"
    elif acousticness >= 0.55:
        genre_sig = (
            "ACOUSTIC/FOLK/SINGER-SONGWRITER territory — "
            "DO NOT match dance artists (Sigala, Meduza, Jonas Blue, Clean Bandit, "
            "Gorgon City, SG Lewis, Duke Dumont, Guetta). Match singer-songwriter, "
            "pop, indie, country-pop artists."
        )
    elif acousticness >= 0.35 and danceability >= 0.65:
        genre_sig = (
            "ROOTS-POP / COUNTRY-POP / POP — high danceability with acoustic warmth = "
            "NOT pure dance. Match pop, country-pop, indie-pop artists, NOT EDM/dance."
        )
    elif acousticness >= 0.35 and tempo < 110:
        genre_sig = (
            "SINGER-SONGWRITER / BALLAD / SOUL territory — "
            "DO NOT match dance/EDM artists. Match vocal-led pop, soul, R&B, indie."
        )
    elif energy < 0.4:
        genre_sig = "INTIMATE/QUIET — ballad or atmospheric — match vocal-led artists, NOT dance"
    elif danceability >= 0.75 and tempo >= 110:
        genre_sig = "POP/DANCE-POP territory — could be Dua Lipa / RAYE / Mae Muller style, not pure EDM"
    else:
        genre_sig = "MAINSTREAM POP territory — vocal-led pop artists, NOT dance"

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
    vocal_confidence = audio_features.get('vocal_confidence', 0.0)

    # Vocal gender classification — only trust the call when PYIN found a
    # meaningful number of voiced frames. Below 15% voiced frames we treat
    # the signal as unreliable (instrumental, heavily produced, or vocal
    # buried under instrumentation) and return Unclear so the matcher
    # doesn't over-index on a misleading hint. Cutoff at 175 Hz keeps
    # baritone males (lower 100-170 Hz) in the Male bucket and pushes
    # mezzo/soprano female (200+ Hz) firmly into Female.
    if vocal_confidence < 0.15 or median_f0 <= 0:
        vocal_hint = "Unclear/instrumental"
    elif median_f0 > 175:
        vocal_hint = "Female vocals"
    elif median_f0 > 80:
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
        # Include interpretation hints in LYRICS+AUDIO mode too — previously
        # these were only sent in AUDIO ONLY mode, so the matcher saw raw
        # numbers without context (e.g. "Acousticness 0.55" without knowing
        # that means "acoustic warmth = NOT pure dance"). This was the main
        # driver behind the dance-heavy bias on singer-songwriter tracks.
        prod, tempo_h, genre_sig = build_audio_hints(tempo, acousticness, danceability, energy, vocal_hint)
        song_data = (
            f"LYRICS:{lang_note}\n{cleaned_lyrics}\n\n"
            f"Audio: BPM {tempo:.0f} ({tempo_h}), Energy {energy:.2f}, "
            f"Acousticness {acousticness:.2f} ({prod}), "
            f"Danceability {danceability:.2f} ({genre_sig}), "
            f"Vocals: {vocal_hint}"
        )
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

VOCAL GENDER — HARD RULE:
The Vocals field tells you the lead vocal gender. This is a HARD filter:
- "Male vocals" → matches MUST be predominantly male artists. A male singer-
  songwriter pitching to female pop artists makes no creative sense (the song
  would need to be re-recorded by the artist, so the artist must be able to
  sing this melody in their own range). Acceptable matches: Dermot Kennedy,
  James Arthur, Lewis Capaldi, Sam Fischer, James Morrison, Myles Smith,
  Cian Ducrot, Niall Horan, Tom Grennan, JP Saxe, Foy Vance, Calum Scott,
  Dean Lewis. ALWAYS prefer male artists when vocal is male.
- "Female vocals" → matches MUST be predominantly female artists. Acceptable
  matches: Sigrid, Ellie Goulding, Becky Hill, Jess Glynne, Cat Burns,
  Paloma Faith, RAYE, Mae Muller, Sasha Sloan, Maisie Peters, Holly Humberstone.
- "Unclear/instrumental" → no gender constraint, judge on sonic world only.
- Mixed-vocal exceptions allowed only when the artist clearly performs in
  both registers (e.g. Calvin Harris with a male feature → could match a
  male vocal song even though Calvin's brand skews mixed). Document the
  reasoning in the reason field.
- A "male vocal" song returning >50% female artists is a FAILURE STATE —
  reject the match list and prioritise male artists.

DANCE BIAS — HARD RULE:
The matcher has historically defaulted to dance-heavy artists (Sigala,
Meduza, Jonas Blue, Clean Bandit, Gorgon City, Duke Dumont, SG Lewis,
LF System, Disciples, David Guetta) when uncertain. STOP.
- Only return dance artists when audio shows ALL of: Acousticness < 0.30,
  Danceability > 0.75, BPM > 115, Energy > 0.55, electronic production.
- If audio shows Acousticness ≥ 0.40 OR Danceability < 0.70 → the song is
  NOT pure dance. Return singer-songwriter, pop, indie, R&B, or country-pop
  artists instead, EVEN if their genre tags overlap slightly with the song.
- Cat Burns / CMAT / Foy Vance / Dermot Kennedy / James Morrison / James
  Arthur style vocal-led tracks → pop, indie, RnB, alt-pop, country-pop
  artists. NOT Jonas Blue / Sigala / Clean Bandit / Gorgon City / Guetta.
- When in doubt, default to singer-songwriter and pop — not dance.

CRITICAL NOT_THIS ENFORCEMENT:
Before assigning a score to ANY artist, check their NOT_THIS field carefully.
If the song's detected_genre, genre_tags, or sonic descriptors contain ANY keyword/phrase from NOT_THIS — that artist MUST score below 0.78 (which means they will be excluded).

Examples:
- If song is "ethereal atmospheric ballad" → Ellie Goulding score MUST be below 0.78 (she has "ethereal atmospheric ballad" in not_this)
- If song is "intimate piano singer-songwriter" → Becky Hill score MUST be below 0.78
- If song is "dark underground techno" → Meduza score MUST be below 0.78

This is NOT a guideline — it is a hard scoring rule. Apply it before final scoring.

NEVER SUGGEST:
- Not available: {not_available_str}
- Deceased: {deceased_str}

SCORING — ABSOLUTE RULES:
- 0.92+ = Strong Match (sonic world, mood, production all align perfectly)
- 0.85-0.91 = Good Match (clear sonic alignment, strong fit)
- 0.78-0.84 = Worth Considering (adjacent world, may suit with adjustment)
- Below 0.78 = EXCLUDE — do not return

Return 5-8 matches MAXIMUM, sorted by score (highest first).
Never force weak matches. If fewer than 3 artists genuinely fit at 0.85+, return only those.

Be CONSERVATIVE with scores. Default to lower scores when uncertain.
A 0.95 score should be reserved for absolutely perfect matches only."""

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
            "confidence_level": "Good Match",
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
            temperature=0,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}]
        )

        raw_text = response.content[0].text.strip()
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)

        if json_match:
            try:
                result = json.loads(json_match.group(0))
                matches = result.get("matches", [])

                matches = [m for m in matches if m.get("final_score", 0) >= 0.78]

                for m in matches:
                    score = m.get("final_score", 0)
                    if score >= 0.92:
                        m["confidence_level"] = "Strong Match"
                    elif score >= 0.85:
                        m["confidence_level"] = "Good Match"
                    else:
                        m["confidence_level"] = "Worth Considering"

                matches.sort(key=lambda m: m.get("final_score", 0), reverse=True)
                result["matches"] = matches

                result["match_summary"] = {
                    "strong_matches": sum(1 for m in matches if m.get("final_score", 0) >= 0.92),
                    "good_matches": sum(1 for m in matches if 0.85 <= m.get("final_score", 0) < 0.92),
                    "worth_considering": sum(1 for m in matches if 0.78 <= m.get("final_score", 0) < 0.85),
                    "total": len(matches)
                }

                return result
            except:
                return {"error": "JSON parsing failed", "matches": [], "raw": raw_text}
        return {"error": "No JSON found", "matches": [], "raw": raw_text}

    except Exception as e:
        return {"error": str(e), "matches": []}